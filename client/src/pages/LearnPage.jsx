// src/pages/LearnPage.jsx
import React, { useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NavigationBar from '../components/NavigationBar';
import Footer from '../components/Footer';
import LessonInteractionPanel from '../components/learnPage/LessonInteractionPanel';
import LessonMainDisplay from '../components/learnPage/LessonMainDisplay';

import { useLesson } from '../hooks/useLesson';
import { useSectionPlayer } from '../hooks/useSectionPlayer';
import { useAvatarInteraction } from '../hooks/useAvatarInteraction';

import { auth, db } from '../firebaseConfig'; // Import auth and db
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'; // Firestore functions
import { useDebouncedCallback } from 'use-debounce'; // For debouncing Firestore writes

const LearnPage = () => {
  const { lessonSlug } = useParams();
  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  const {
    lessonContent,
    currentSectionIndex,
    loadingLesson,
    lessonError: lessonLoadingError,
    currentSectionData,
    lessonTitle,
    isLessonFinished,
    goToNextSection,
    goToPreviousSection,
  } = useLesson(lessonSlug);

  // Debounced function to save progress
  const debouncedSaveProgress = useDebouncedCallback(
    async (userId, slug, title, currentIndex, totalSections) => {
      if (!userId || !slug || typeof currentIndex !== 'number' || typeof totalSections !== 'number' || totalSections === 0) {
        // console.log("Skipping progress save due to invalid data:", { userId, slug, currentIndex, totalSections });
        return;
      }
      
      const progressPercentage = Math.min(100, Math.round((currentIndex / totalSections) * 100));
      // If currentSectionIndex is equal to totalSections, it means the lesson is fully viewed.
      // The isLessonFinished flag handles the "completion" state.
      // For progress, if currentIndex is 0 and totalSections > 0, progress is 0%.
      // If currentIndex is, e.g., 2 and totalSections is 10, progress is 20%.
      // If currentIndex becomes equal to totalSections (e.g., 10/10), progress is 100%.

      const progressData = {
        userId: userId,
        lessonSlug: slug,
        lessonTitle: title || "Untitled Lesson",
        lastKnownSectionIndex: currentIndex,
        totalSectionsInLesson: totalSections,
        progressPercentage: progressPercentage,
        lastAccessedTimestamp: serverTimestamp(),
      };

      try {
        const progressDocId = `${userId}_${slug}`;
        const progressRef = doc(db, 'userLessonProgress', progressDocId);
        await setDoc(progressRef, progressData, { merge: true }); // Use merge to update or create
        // console.log(`Progress saved for lesson ${slug}: ${progressPercentage}%`);
      } catch (error) {
        console.error("Error saving lesson progress:", error);
      }
    },
    2000 // Debounce time in ms (e.g., 2 seconds)
  );

  useEffect(() => {
    if (currentUser && lessonContent && lessonContent.sections && lessonContent.sections.length > 0 && !loadingLesson) {
      debouncedSaveProgress(
        currentUser.uid,
        lessonSlug,
        lessonContent.title,
        currentSectionIndex, // This is the index of the *current* section being viewed
        lessonContent.sections.length
      );
    }
  }, [currentUser, lessonSlug, lessonContent, currentSectionIndex, loadingLesson, debouncedSaveProgress]);


  const handleSectionComplete = useCallback(() => {
    if (currentSectionData && !isLessonFinished) {
      goToNextSection();
    } else if (isLessonFinished) {
      console.log("Lesson finished, not advancing further via handleSectionComplete.");
      // Progress will be 100% when currentSectionIndex reaches lessonContent.sections.length
    }
  }, [goToNextSection, isLessonFinished, currentSectionData]);

  const {
    audioRef,
    isPlaying: isSectionPlaying,
    isLoading: isSectionContentLoading,
    avatarSpeaking,
    sectionPlayerError,
    spokenTextForDisplay,
    togglePlayPausePlayer,
    canAttemptPlayPause,
  } = useSectionPlayer(currentSectionData, handleSectionComplete);

  const lessonContextForAI = lessonContent?.description || lessonContent?.title || "General space knowledge";
  const {
    userQuery,
    aiResponse,
    isAIResponseLoading,
    aiQueryError,
    startVoiceListening,
    isListening,
    speechRecognitionError,
    isRecognitionSupported,
    handleSendTextQuery,
  } = useAvatarInteraction(lessonContextForAI);

  const handleTakeQuiz = () => navigate(`/lessons/${lessonSlug}/quiz`);

  const isPlayerOrAiLoading = isSectionContentLoading || isAIResponseLoading;
  const currentPrimaryError = lessonLoadingError || sectionPlayerError || speechRecognitionError || aiQueryError;

  if (loadingLesson) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100">
        <NavigationBar />
        <main className="flex-grow flex justify-center items-center"><p className="text-xl">Loading Lesson...</p></main>
        <Footer />
      </div>
    );
  }

  if (lessonLoadingError) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100">
        <NavigationBar />
        <main className="flex-grow flex justify-center items-center text-red-500"><p className="text-xl">{lessonLoadingError}</p></main>
        <Footer />
      </div>
    );
  }
  
  if (!lessonContent && !loadingLesson) {
    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
          <NavigationBar />
          <main className="flex-grow flex justify-center items-center"><p className="text-xl">Lesson data not available for "{lessonSlug}".</p></main>
          <Footer />
        </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 antialiased">
      <NavigationBar />
      <audio ref={audioRef} style={{ display: 'none' }} />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <LessonInteractionPanel
          avatarSpeaking={avatarSpeaking}
          startListening={startVoiceListening}
          listening={isListening}
          isPlayerOrAiLoading={isPlayerOrAiLoading}
          isAudioPlaying={isSectionPlaying}
          isSectionContentLoading={isSectionContentLoading}
          togglePlayPause={togglePlayPausePlayer}
          playNextSection={goToNextSection}
          playPreviousSection={goToPreviousSection}
          canGoNext={lessonContent && currentSectionData && currentSectionIndex < lessonContent.sections.length - 1 && !isLessonFinished}
          canGoPrevious={currentSectionIndex > 0}
          displayError={currentPrimaryError}
          userQuery={userQuery}
          aiResponseFromHook={aiResponse}
          recognitionSupported={isRecognitionSupported}
          canAttemptPlayPause={canAttemptPlayPause}
          onSendTextQuery={handleSendTextQuery}
        />
        <LessonMainDisplay
          lessonTitle={lessonTitle}
          section={currentSectionData}
          spokenText={spokenTextForDisplay}
          userQuery={userQuery} 
          aiResponse={aiResponse} 
          lessonSlug={lessonSlug}
          isLessonFinished={isLessonFinished}
          onTakeQuiz={handleTakeQuiz}
          displayError={sectionPlayerError || lessonLoadingError} 
        />
      </main>
      <Footer />
    </div>
  );
};

export default LearnPage;
