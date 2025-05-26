// e:\placement\Spacey\project\v1\client\src\hooks\useSectionPlayer.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { storage } from '../firebaseConfig'; // Adjust path
import { ref, getDownloadURL } from 'firebase/storage';

const SpeechSynthesis = window.SpeechSynthesis;
const SpeechSynthesisUtterance = window.SpeechSynthesisUtterance;
const synth = SpeechSynthesis ? window.speechSynthesis : null;

export const useSectionPlayer = (sectionData, onSectionComplete) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Internal loading state
  const [avatarSpeaking, setAvatarSpeaking] = useState(false);
  const [error, setError] = useState('');
  const [spokenTextForDisplay, setSpokenTextForDisplay] = useState('');
  const [currentAudioUrl, setCurrentAudioUrl] = useState(null);
  const [canPlayAudioFile, setCanPlayAudioFile] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  const audioRef = useRef(null);
  const ttsUtteranceRef = useRef(null);
  const sectionCompleteCallbackRef = useRef(onSectionComplete);
  const sectionDataRef = useRef(sectionData); // Ref to hold current sectionData

  useEffect(() => {
    sectionCompleteCallbackRef.current = onSectionComplete;
  }, [onSectionComplete]);

  useEffect(() => {
    sectionDataRef.current = sectionData;
  }, [sectionData]);

  useEffect(() => {
    const markInteracted = () => {
      setHasUserInteracted(true);
      window.removeEventListener('click', markInteracted);
      window.removeEventListener('keydown', markInteracted);
    };
    window.addEventListener('click', markInteracted);
    window.addEventListener('keydown', markInteracted);
    return () => {
      window.removeEventListener('click', markInteracted);
      window.removeEventListener('keydown', markInteracted);
    };
  }, []);

  const cleanupPlayer = useCallback((cancelTTS = true) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      if (audioRef.current.src) {
        // Revoke object URL if it was one, though not used here currently
        // if (audioRef.current.src.startsWith('blob:')) {
        //   URL.revokeObjectURL(audioRef.current.src);
        // }
        audioRef.current.removeAttribute('src');
        audioRef.current.load(); // Important to abort current loading/playback
      }
    }
    if (cancelTTS && synth && synth.speaking) {
      synth.cancel();
    }
    setIsPlaying(false);
    setAvatarSpeaking(false);
    setCurrentAudioUrl(null); // Ensure URL is cleared
    setCanPlayAudioFile(false); // Reset flag
    ttsUtteranceRef.current = null;
    // setError(''); // Optionally reset error here or let it persist until next section
  }, []);

  useEffect(() => {
    cleanupPlayer(); // Call cleanup at the beginning of section change
    setError(''); // Clear previous errors for the new section
    setSpokenTextForDisplay(sectionData?.text || sectionData?.content || sectionData?.caption || '');

    if (!sectionData || !sectionData.id) { // Ensure sectionData and its ID exist
      setIsLoading(false);
      if (sectionData && !sectionData.id) {
        console.warn("Section data is missing an ID.", sectionData);
        setError("Section data is invalid (missing ID).");
      }
      return;
    }

    setIsLoading(true); // Set loading true at the start of processing a new section
    let sectionTimer;
    const currentSectionId = sectionData.id; // Use the ID from sectionData

    if (sectionData.type === 'audioText') {
      if (sectionData.audioPath) {
        const audioFileRef = ref(storage, sectionData.audioPath);
        getDownloadURL(audioFileRef)
          .then(url => {
            // Check if the current section is still the one we initiated this fetch for
            if (sectionDataRef.current?.id === currentSectionId) {
              if (url) {
                setCurrentAudioUrl(url);
                // setIsLoading(false) will be handled by 'canplaythrough' or error in the audio element effect
              } else {
                // This case is unlikely if getDownloadURL promise resolves, but defensive
                console.error('Firebase Storage returned a null or undefined URL for:', sectionData.audioPath);
                setError(`Failed to load audio: Invalid URL received for ${sectionData.audioPath}.`);
                setCurrentAudioUrl(null); // Ensure URL is null
                setIsLoading(false); // No audio to load, so stop loading
                sectionCompleteCallbackRef.current(); // Or handle error differently
              }
            } else {
              console.log("Stale audio URL fetch ignored for section:", currentSectionId, "Current is:", sectionDataRef.current?.id);
            }
          })
          .catch(err => {
            if (sectionDataRef.current?.id === currentSectionId) {
              console.error('Error getting audio URL for path:', sectionData.audioPath, err);
              setError(`Failed to load audio: ${sectionData.audioPath}. Check path, permissions, or network.`);
              setCurrentAudioUrl(null); // CRITICAL: Reset URL on error
              setIsLoading(false);     // CRITICAL: Set loading to false as the fetch failed
              sectionCompleteCallbackRef.current(); // Proceed to next or show error
            } else {
              console.log("Stale audio URL error ignored for section:", currentSectionId, "Current is:", sectionDataRef.current?.id);
            }
          });
      } else {
        // audioText section but no audioPath provided
        console.warn(`Audio section "${sectionData.id}" is missing audioPath.`);
        setError(`Audio path missing for section: "${sectionData.text?.substring(0,20) || sectionData.id || 'current section'}".`);
        setSpokenTextForDisplay(sectionData.text || "Error: Audio path missing for this section.");
        setCurrentAudioUrl(null); // Ensure no old URL lingers
        setIsLoading(false);
        // Auto-complete or wait for user to skip
        sectionTimer = setTimeout(() => sectionCompleteCallbackRef.current(), 2000); // Auto-skip after a delay
      }
    } else if (sectionData.type === 'text' && sectionData.speak && synth && sectionData.content) {
      const utterance = new SpeechSynthesisUtterance(sectionData.content);
      utterance.lang = sectionData.lang || 'en-US';
      ttsUtteranceRef.current = utterance;
      // setIsLoading(true) was already set
      utterance.onstart = () => {
        if (sectionDataRef.current?.id === currentSectionId) {
          setIsLoading(false); setIsPlaying(true); setAvatarSpeaking(true);
        }
      };
      utterance.onend = () => {
        if (sectionDataRef.current?.id === currentSectionId || !ttsUtteranceRef.current) { // Check if it's still the active utterance
          setIsPlaying(false); setAvatarSpeaking(false); ttsUtteranceRef.current = null;
          sectionCompleteCallbackRef.current();
        }
      };
      utterance.onerror = (event) => {
        if (sectionDataRef.current?.id === currentSectionId) {
          console.error('TTS error:', event); setError('Error speaking content.');
          setIsLoading(false); setIsPlaying(false); setAvatarSpeaking(false); ttsUtteranceRef.current = null;
          sectionCompleteCallbackRef.current();
        }
      };

      if (hasUserInteracted) {
        synth.speak(utterance);
      } else {
        setIsLoading(false); // Not playing yet, so not "loading" in the active sense
        console.log("TTS ready, awaiting user interaction to play for section:", currentSectionId);
        // User will need to click play to start TTS if interaction hasn't happened.
      }
    } else if (sectionData.type === 'image') {
      setIsLoading(false);
      const imageDisplayDuration = sectionData.duration || 5000;
      sectionTimer = setTimeout(() => {
        if (sectionDataRef.current?.id === currentSectionId) sectionCompleteCallbackRef.current()
      }, imageDisplayDuration);
    } else if (sectionData.type === 'text' && !sectionData.speak) {
      setIsLoading(false);
      const textDisplayDuration = Math.max(2000, (sectionData.content?.length || 0) * 70); // Adjust multiplier as needed
      sectionTimer = setTimeout(() => {
         if (sectionDataRef.current?.id === currentSectionId) sectionCompleteCallbackRef.current()
      }, textDisplayDuration);
    } else {
      // Default case for unknown or simple sections
      setIsLoading(false);
      sectionTimer = setTimeout(() => {
        if (sectionDataRef.current?.id === currentSectionId) sectionCompleteCallbackRef.current()
      }, 100); // Minimal delay
    }

    return () => {
      clearTimeout(sectionTimer);
      // Cleanup TTS if it was initiated by this section and is still speaking when component unmounts or sectionData changes
      if (ttsUtteranceRef.current && synth && synth.speaking) {
         // Check if the utterance is the one we created for this section
         // This check might be complex if utterances are not uniquely identifiable beyond their content
         // For simplicity, we cancel if synth is speaking and ttsUtteranceRef is set.
         // A more robust way would be to ensure ttsUtteranceRef.current is only set for the *active* section's utterance.
         // synth.cancel(); // This is now in cleanupPlayer, which is called first.
      }
    };
  }, [sectionData, cleanupPlayer, hasUserInteracted]); // Keep `cleanupPlayer` if its identity can change, though it's stable here.

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const currentSectionId = sectionDataRef.current?.id;

    const handlePlay = () => { if(sectionDataRef.current?.id === currentSectionId) { setIsPlaying(true); setAvatarSpeaking(true); }};
    const handlePause = () => { if(sectionDataRef.current?.id === currentSectionId) { setIsPlaying(false); setAvatarSpeaking(false); }};
    const handleEnded = () => {
      if(sectionDataRef.current?.id === currentSectionId) {
        setIsPlaying(false); setAvatarSpeaking(false);
        sectionCompleteCallbackRef.current();
      }
    };
    const handleCanPlay = () => {
      if(sectionDataRef.current?.id === currentSectionId && audioElement.src === currentAudioUrl) { // Ensure it's for the correct URL
        console.log("EVENT: handleCanPlay (canplaythrough) fired. Audio Source:", audioElement.currentSrc);
        setCanPlayAudioFile(true);
        setIsLoading(false); // Audio is ready, no longer "loading" it.
      }
    };
    const handleError = (e) => {
      // Check if the error is for the currently active section and URL
      if (sectionDataRef.current?.id === currentSectionId && 
          (audioElement.currentSrc === currentAudioUrl || (!audioElement.currentSrc && currentAudioUrl))) { // Also check if src was set to currentAudioUrl
        const mediaError = audioElement.error;
        let errorMessage = "Unknown audio error.";
        // ... (error message generation as before)
        if (mediaError) {
            switch (mediaError.code) {
            case mediaError.MEDIA_ERR_ABORTED: errorMessage = 'Audio playback aborted.'; break;
            case mediaError.MEDIA_ERR_NETWORK: errorMessage = 'A network error caused audio download to fail.'; break;
            case mediaError.MEDIA_ERR_DECODE: errorMessage = 'Audio decoding error or unsupported features.'; break;
            case mediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                errorMessage = 'Audio source not supported or invalid URL.';
                if (!audioElement.currentSrc && !currentAudioUrl) {
                    errorMessage += ' (Source was empty or null).';
                } else if (currentAudioUrl) {
                    errorMessage += ` Attempted URL: ${currentAudioUrl.substring(0,100)}...`;
                }
                break;
            default: errorMessage = `An unknown error occurred. Code: ${mediaError.code}`;
            }
        }
        console.error("Audio Element Error Event:", e);
        console.error("Audio Element MediaError:", mediaError);
        console.error("Current Audio URL that failed:", audioElement.currentSrc || currentAudioUrl);
        setError(`Audio Error: ${errorMessage}`);
        setIsLoading(false); setIsPlaying(false); setAvatarSpeaking(false); setCanPlayAudioFile(false);
        sectionCompleteCallbackRef.current(); // Or allow user to retry/skip
      } else {
          console.log("Stale audio element error ignored for section:", currentSectionId, "or URL mismatch.");
      }
    };

    // Remove previous listeners before adding new ones or changing src
    audioElement.removeEventListener('play', handlePlay);
    audioElement.removeEventListener('pause', handlePause);
    audioElement.removeEventListener('ended', handleEnded);
    audioElement.removeEventListener('canplaythrough', handleCanPlay);
    audioElement.removeEventListener('error', handleError);

    if (currentAudioUrl && typeof currentAudioUrl === 'string') {
      console.log("Setting audio src for section", currentSectionId, ":", currentAudioUrl);
      audioElement.src = currentAudioUrl;
      audioElement.load(); // Explicitly call load after setting new src
      audioElement.addEventListener('play', handlePlay);
      audioElement.addEventListener('pause', handlePause);
      audioElement.addEventListener('ended', handleEnded);
      audioElement.addEventListener('canplaythrough', handleCanPlay);
      audioElement.addEventListener('error', handleError);
    } else {
      // If currentAudioUrl is null (e.g., section change, error, non-audio section)
      if (audioElement.src) {
        audioElement.removeAttribute('src');
        audioElement.load(); // Reset the audio element
      }
      setCanPlayAudioFile(false);
      // If it was an audioText section and now URL is null, it's not loading audio anymore.
      if (sectionDataRef.current?.type === 'audioText') {
        setIsLoading(false);
      }
    }

    return () => {
      // Cleanup listeners when component unmounts or currentAudioUrl changes
      audioElement.removeEventListener('play', handlePlay);
      audioElement.removeEventListener('pause', handlePause);
      audioElement.removeEventListener('ended', handleEnded);
      audioElement.removeEventListener('canplaythrough', handleCanPlay);
      audioElement.removeEventListener('error', handleError);
    };
  }, [currentAudioUrl]); // Only re-run when currentAudioUrl changes

  const togglePlayPause = useCallback(() => {
    if (!sectionDataRef.current || !sectionDataRef.current.id) return;
    setHasUserInteracted(true); // Mark user interaction
    const currentSection = sectionDataRef.current;

    if (currentSection.type === 'audioText' && audioRef.current) {
      if (currentAudioUrl && canPlayAudioFile) { // We have a URL and it's ready
        if (audioRef.current.paused) {
          audioRef.current.play().catch(e => {
            console.warn("Audio play toggle prevented:", e);
            setError("Could not play audio. Browser might have blocked it or an error occurred.");
            setIsPlaying(false); setAvatarSpeaking(false);
          });
        } else {
          audioRef.current.pause();
        }
      } else if (currentAudioUrl && !canPlayAudioFile) { // We have a URL, but not ready
        console.warn("Audio not ready (canPlayAudioFile is false), but play was attempted. Ensuring it's loading.");
        setIsLoading(true); // We are actively trying to make it play/load
        if (audioRef.current.currentSrc !== currentAudioUrl) {
            audioRef.current.src = currentAudioUrl; // Re-set if necessary
        }
        audioRef.current.load(); // Re-trigger load
        // Optionally, try to play, but it might fail if metadata isn't loaded.
        // audioRef.current.play().catch(e => { /* ... */ });
      } else {
        // No currentAudioUrl for an audioText section, or audioRef is missing.
        // This case should ideally be prevented by a disabled button.
        console.warn("Play/Pause toggled for audioText section without a ready audio URL or element.");
        setError("Cannot play: Audio is not available for this section.");
      }
    } else if (currentSection.type === 'text' && currentSection.speak && synth && currentSection.content) {
      if (ttsUtteranceRef.current && synth.speaking) { // If there's an active utterance for this section
        synth.paused ? synth.resume() : synth.pause();
        // Update state after a brief moment to allow synth state to reflect pause/resume
        setTimeout(() => {
            setIsPlaying(synth.speaking && !synth.paused);
            setAvatarSpeaking(synth.speaking && !synth.paused);
        }, 0);
      } else { // Not speaking or no current utterance for this section, so start fresh
        cleanupPlayer(false); // Clean up previous player state but don't cancel synth if it was just paused globally
        const utterance = new SpeechSynthesisUtterance(currentSection.content);
        utterance.lang = currentSection.lang || 'en-US';
        ttsUtteranceRef.current = utterance; // Associate new utterance
        const currentSectionId = sectionDataRef.current.id;

        utterance.onstart = () => { if(sectionDataRef.current?.id === currentSectionId) { setIsLoading(false); setIsPlaying(true); setAvatarSpeaking(true); }};
        utterance.onend = () => { if(sectionDataRef.current?.id === currentSectionId) { setIsPlaying(false); setAvatarSpeaking(false); ttsUtteranceRef.current = null; sectionCompleteCallbackRef.current(); }};
        utterance.onerror = (event) => { if(sectionDataRef.current?.id === currentSectionId) { console.error('TTS error on toggle/restart:', event); setError('Error speaking content.'); setIsLoading(false); setIsPlaying(false); setAvatarSpeaking(false); ttsUtteranceRef.current = null; sectionCompleteCallbackRef.current(); }};
        
        if (synth.paused) synth.resume(); // If synth was globally paused, resume it before speaking new.
        synth.speak(utterance);
      }
    }
  }, [currentAudioUrl, canPlayAudioFile, cleanupPlayer]); // sectionData removed, using sectionDataRef.current

  const combinedIsLoading = isLoading || (sectionDataRef.current?.type === 'audioText' && !!currentAudioUrl && !canPlayAudioFile);

  return {
    audioRef,
    isPlaying,
    isLoading: combinedIsLoading,
    avatarSpeaking,
    sectionPlayerError: error,
    spokenTextForDisplay,
    togglePlayPausePlayer: togglePlayPause,
    isAudioFileSection: sectionDataRef.current?.type === 'audioText' && !!currentAudioUrl,
    isTTSSpeakingSection: sectionDataRef.current?.type === 'text' && sectionDataRef.current?.speak && !!synth,
    canAttemptPlayPause: (sectionDataRef.current?.type === 'audioText' && !!currentAudioUrl) || (sectionDataRef.current?.type === 'text' && sectionDataRef.current?.speak && !!synth && !!sectionDataRef.current?.content),
  };
};
