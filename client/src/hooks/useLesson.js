// e:\placement\Spacey\project\v1\client\src\hooks\useLesson.js
import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Adjust path to your firebaseConfig.js

// Define your collection name here, matching AdminLessonUpload.jsx
const LESSON_COLLECTION_NAME = 'lessonContentData';

export const useLesson = (lessonSlug) => {
  const [lessonContent, setLessonContent] = useState(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [loadingLesson, setLoadingLesson] = useState(true);
  const [lessonError, setLessonError] = useState(null);

  useEffect(() => {
    if (!lessonSlug) {
      setLoadingLesson(false);
      setLessonError("No lesson slug provided.");
      setLessonContent(null);
      return;
    }

    const fetchLesson = async () => {
      setLoadingLesson(true);
      setLessonError(null);
      setCurrentSectionIndex(0); // Reset index when a new lesson is fetched
      setLessonContent(null); // Clear previous lesson content

      try {
        // Use the LESSON_COLLECTION_NAME constant here
        const lessonRef = doc(db, LESSON_COLLECTION_NAME, lessonSlug);
        const docSnap = await getDoc(lessonRef);

        if (docSnap.exists()) {
          // Combine document ID (slug) with its data
          setLessonContent({ id: docSnap.id, ...docSnap.data() });
        } else {
          setLessonError(`Lesson "${lessonSlug}" not found in the database (collection: ${LESSON_COLLECTION_NAME}).`);
        }
      } catch (err) {
        console.error("Error fetching lesson from Firestore:", err);
        setLessonError(`Error fetching lesson: ${err.message}`);
      } finally {
        setLoadingLesson(false);
      }
    };

    fetchLesson();
  }, [lessonSlug]); // Re-run effect if lessonSlug changes

  const currentSectionData = lessonContent?.sections?.[currentSectionIndex];
  const lessonTitle = lessonContent?.title;
  const isLessonFinished = lessonContent?.sections && lessonContent.sections.length > 0 && currentSectionIndex >= lessonContent.sections.length;

  const goToNextSection = useCallback(() => {
    if (lessonContent?.sections && currentSectionIndex < lessonContent.sections.length) {
      // Allow going one past the end to correctly flag 'isLessonFinished'
      setCurrentSectionIndex(prev => prev + 1);
    }
  }, [lessonContent, currentSectionIndex]);

  const goToPreviousSection = useCallback(() => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
    }
  }, [currentSectionIndex]);

  return {
    lessonContent,
    currentSectionIndex,
    setCurrentSectionIndex, // Keep for direct control if ever needed
    loadingLesson,
    lessonError,
    currentSectionData,
    lessonTitle,
    isLessonFinished,
    goToNextSection,
    goToPreviousSection,
  };
};
