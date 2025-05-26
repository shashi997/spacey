// src/components/learnPage/LessonInteractionPanel.jsx
import React, { useState, useEffect } from 'react';
import WebcamFeed from '../WebcamFeed';
import Avatar from '../Avatar';
import { Play, Pause, SkipForward, SkipBack, Mic, Send } from 'lucide-react';

const LessonInteractionPanel = ({
  avatarSpeaking,
  startListening,
  listening,
  isPlayerOrAiLoading, // Renamed prop (was loadingAI)
  isAudioPlaying,
  isSectionContentLoading, // Specific loading state for section content (was isAudioLoading)
  togglePlayPause,
  playNextSection,
  playPreviousSection,
  canGoNext,
  canGoPrevious,
  displayError, // Renamed (was speechError, now more general)
  userQuery,
  aiResponseFromHook, // Renamed (was aiResponse)
  recognitionSupported,
  // currentAudioUrl, // Not strictly needed if canAttemptPlayPause is used
  // sectionType, // Not strictly needed if canAttemptPlayPause is used
  // isTTSAvailableForSection, // Not strictly needed if canAttemptPlayPause is used
  canAttemptPlayPause, // New prop from useSectionPlayer
  onSendTextQuery,
}) => {
  const [textInputValue, setTextInputValue] = useState('');

  // Play/Pause button should be disabled if content is loading OR if there's nothing to play/pause
  const playPauseButtonDisabled = isSectionContentLoading || !canAttemptPlayPause;

  // Disable navigation if section content is actively loading
  const navigationDisabled = isSectionContentLoading;

  // Disable query inputs if any player or AI is loading
  const queryInputDisabled = isPlayerOrAiLoading;


  const handleTextQuerySubmit = (e) => {
    e.preventDefault();
    if (textInputValue.trim() && onSendTextQuery && !queryInputDisabled) {
      onSendTextQuery(textInputValue.trim());
      setTextInputValue('');
    }
  };

  // Clear text input if AI response comes back or user starts voice query
  useEffect(() => {
    if (aiResponseFromHook || listening) {
      // setTextInputValue(''); // Optional: clear text input when AI responds or listening starts
    }
  }, [aiResponseFromHook, listening]);


  return (
    <div className="lg:col-span-1 flex flex-col items-center space-y-6">
      <div className="w-full bg-gray-800 rounded-lg shadow-xl overflow-hidden">
        <WebcamFeed />
      </div>
      <div className="w-full bg-white rounded-lg shadow-xl p-4 md:p-6 text-center">
        <Avatar isSpeaking={avatarSpeaking || listening} /> {/* Avatar speaks also when listening for query */}

        {/* Media Controls */}
        <div className="flex items-center justify-center space-x-2 sm:space-x-3 my-4 p-3 bg-gray-100 rounded-lg shadow">
          <button
            onClick={playPreviousSection}
            disabled={!canGoPrevious || navigationDisabled}
            className="p-2 sm:p-3 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 disabled:bg-gray-300 transition-colors"
            aria-label="Previous Section"
          >
            <SkipBack className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={togglePlayPause}
            disabled={playPauseButtonDisabled}
            className={`p-3 sm:p-4 text-white rounded-full hover:bg-opacity-80 disabled:bg-gray-300 transition-colors ${
              isAudioPlaying ? 'bg-red-500' : 'bg-green-500'
            }`}
            aria-label={isAudioPlaying ? 'Pause' : 'Play'}
          >
            {isAudioPlaying ? <Pause className="w-5 h-5 sm:w-6 sm:h-6" /> : <Play className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
          <button
            onClick={playNextSection}
            disabled={!canGoNext || navigationDisabled}
            className="p-2 sm:p-3 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 disabled:bg-gray-300 transition-colors"
            aria-label="Next Section"
          >
            <SkipForward className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
        
        {displayError && <p className="text-red-600 text-sm my-2 px-2">{displayError}</p>}

        {/* Voice Query Section */}
        <div className="mt-4">
          <button
            onClick={startListening}
            disabled={listening || queryInputDisabled || !recognitionSupported}
            className={`py-2.5 px-4 rounded-md text-white font-semibold transition-colors w-full flex items-center justify-center space-x-2 ${
              listening
                ? 'bg-red-500 cursor-not-allowed'
                : !recognitionSupported
                ? 'bg-gray-400 cursor-not-allowed'
                : queryInputDisabled
                ? 'bg-indigo-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            <Mic className="w-5 h-5" />
            <span>
              {listening
                ? 'Listening...'
                : !recognitionSupported
                ? 'Speech Not Supported'
                : queryInputDisabled 
                ? (isSectionContentLoading ? 'Content Loading...' : 'AI Thinking...') 
                : 'Ask with Voice'}
            </span>
          </button>
          {/* speechError is now part of displayError, handled above */}
        </div>

        {/* Text Query Section */}
        <form onSubmit={handleTextQuerySubmit} className="mt-4 space-y-2">
          <label htmlFor="text-query-input" className="sr-only">Type your question</label>
          <input
            id="text-query-input"
            type="text"
            value={textInputValue}
            onChange={(e) => setTextInputValue(e.target.value)}
            placeholder="Or type your question here..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            disabled={queryInputDisabled}
          />
          <button
            type="submit"
            disabled={queryInputDisabled || !textInputValue.trim()}
            className="w-full py-2.5 px-4 rounded-md text-white font-semibold transition-colors flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
            <span>Send Question</span>
          </button>
        </form>
        
        {userQuery && !isPlayerOrAiLoading && ( // Show user query when not loading
            <div className="mt-3 p-2 bg-gray-100 rounded-md text-left">
                <p className="text-gray-700 text-sm italic">
                    You asked: "{userQuery}"
                </p>
            </div>
        )}
        
        {aiResponseFromHook && ( // Use the renamed prop
            <div className="mt-6 p-4 bg-gray-100 rounded-md shadow-inner text-left">
            <h3 className="font-nunito text-md font-semibold text-indigo-700 mb-1">Avatar's Response:</h3>
            <p className="font-nunito text-gray-700 whitespace-pre-wrap text-sm">{aiResponseFromHook}</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default LessonInteractionPanel;
