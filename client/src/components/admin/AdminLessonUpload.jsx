// src/components/admin/AdminLessonUpload.jsx
import React, { useState, useCallback } from 'react';
import { db } from '../../firebaseConfig'; // Adjust path to your firebaseConfig.js
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const sectionTypes = ['audioText', 'text', 'image'];

// Define your new collection name here
const LESSON_COLLECTION_NAME = 'lessonContentData'; // Or any other name you prefer

const AdminLessonUpload = () => {
  const [lessonSlug, setLessonSlug] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDescription, setLessonDescription] = useState('');
  const [sections, setSections] = useState([]);

  // State for the current section being built
  const [currentSection, setCurrentSection] = useState({
    id: '',
    type: 'audioText', // Default type
    text: '', // For audioText
    audioPath: '', // For audioText
    content: '', // For text type
    speak: false, // For text type
    path: '', // For image type (URL/path in storage)
    caption: '', // For image type
    duration: 5000, // For image type (default 5s)
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const generateSectionId = useCallback(() => {
    return `${currentSection.type}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  }, [currentSection.type]);

  const handleLessonInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'lessonSlug') setLessonSlug(value);
    else if (name === 'lessonTitle') setLessonTitle(value);
    else if (name === 'lessonDescription') setLessonDescription(value);
  };

  const handleSectionInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentSection(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value, 10) : value),
    }));
  };

  const handleAddSection = () => {
    if (!currentSection.type) {
      setError('Please select a section type.');
      return;
    }
    const sectionId = currentSection.id || generateSectionId();
    const newSection = { ...currentSection, id: sectionId };

    // Clean up section object based on type
    const finalSection = { id: newSection.id, type: newSection.type };
    if (newSection.type === 'audioText') {
      if (!newSection.text || !newSection.audioPath) {
        setError('For AudioText sections, please provide Text and Audio Path.');
        return;
      }
      finalSection.text = newSection.text;
      finalSection.audioPath = newSection.audioPath;
    } else if (newSection.type === 'text') {
      if (!newSection.content) {
        setError('For Text sections, please provide Content.');
        return;
      }
      finalSection.content = newSection.content;
      finalSection.speak = newSection.speak;
    } else if (newSection.type === 'image') {
      if (!newSection.path) {
        setError('For Image sections, please provide Image Path.');
        return;
      }
      finalSection.path = newSection.path;
      if (newSection.caption) finalSection.caption = newSection.caption;
      finalSection.duration = newSection.duration || 5000;
    }

    setSections(prev => [...prev, finalSection]);
    // Reset currentSection form (keeping type for convenience if adding multiple of same type)
    setCurrentSection({
      id: '',
      type: currentSection.type,
      text: '',
      audioPath: '',
      content: '',
      speak: false,
      path: '',
      caption: '',
      duration: 5000,
    });
    setError('');
    setSuccessMessage('');
  };

  const removeSection = (indexToRemove) => {
    setSections(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSaveLesson = async () => {
    if (!lessonSlug.trim() || !lessonTitle.trim()) {
      setError('Lesson Slug and Lesson Title are required.');
      return;
    }
    if (sections.length === 0) {
      setError('Please add at least one section to the lesson.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    const lessonData = {
      title: lessonTitle,
      description: lessonDescription,
      sections: sections,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      // Using lessonSlug as the document ID in your new collection
      const lessonRef = doc(db, LESSON_COLLECTION_NAME, lessonSlug.trim()); // Updated this line
      await setDoc(lessonRef, lessonData);
      setSuccessMessage(`Lesson "${lessonTitle}" saved successfully with slug "${lessonSlug}" in collection "${LESSON_COLLECTION_NAME}"!`);
      // Optionally reset form
      // setLessonSlug(''); setLessonTitle(''); setLessonDescription(''); setSections([]);
    } catch (e) {
      console.error("Error saving lesson: ", e);
      setError(`Failed to save lesson: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const buttonClass = "px-4 py-2 rounded-md text-white font-semibold transition-colors";

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">Admin: Upload New Lesson</h1>

      {error && <p className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</p>}
      {successMessage && <p className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">{successMessage}</p>}

      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Lesson Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="lessonSlug" className={labelClass}>Lesson Slug (Unique ID, e.g., "intro-to-planets")</label>
            <input type="text" name="lessonSlug" id="lessonSlug" value={lessonSlug} onChange={handleLessonInputChange} className={inputClass} placeholder="unique-lesson-slug" />
          </div>
          <div>
            <label htmlFor="lessonTitle" className={labelClass}>Lesson Title</label>
            <input type="text" name="lessonTitle" id="lessonTitle" value={lessonTitle} onChange={handleLessonInputChange} className={inputClass} placeholder="e.g., Introduction to Planets" />
          </div>
        </div>
        <div>
          <label htmlFor="lessonDescription" className={labelClass}>Lesson Description</label>
          <textarea name="lessonDescription" id="lessonDescription" value={lessonDescription} onChange={handleLessonInputChange} className={inputClass} rows="3" placeholder="A brief overview of the lesson content."></textarea>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Add New Section</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Section ID (Optional, auto-generated if empty) */}
          {/* <div>
            <label htmlFor="sectionId" className={labelClass}>Section ID (Optional)</label>
            <input type="text" name="id" id="sectionId" value={currentSection.id} onChange={handleSectionInputChange} className={inputClass} placeholder="Auto-generated if blank" />
          </div> */}
          <div>
            <label htmlFor="sectionType" className={labelClass}>Section Type</label>
            <select name="type" id="sectionType" value={currentSection.type} onChange={handleSectionInputChange} className={inputClass}>
              {sectionTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
        </div>

        {/* Conditional fields based on section type */}
        {currentSection.type === 'audioText' && (
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="audioPath" className={labelClass}>Audio Path (in Firebase Storage)</label>
              <input type="text" name="audioPath" id="audioPath" value={currentSection.audioPath} onChange={handleSectionInputChange} className={inputClass} placeholder="e.g., audios/lesson-slug/audio1.mp3" />
            </div>
            <div>
              <label htmlFor="text" className={labelClass}>Text Content (to display with audio)</label>
              <textarea name="text" id="text" value={currentSection.text} onChange={handleSectionInputChange} className={inputClass} rows="4" placeholder="The transcript or related text."></textarea>
            </div>
          </div>
        )}

        {currentSection.type === 'text' && (
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="content" className={labelClass}>Text Content</label>
              <textarea name="content" id="content" value={currentSection.content} onChange={handleSectionInputChange} className={inputClass} rows="4" placeholder="The text to be displayed or spoken."></textarea>
            </div>
            <div className="flex items-center">
              <input type="checkbox" name="speak" id="speak" checked={currentSection.speak} onChange={handleSectionInputChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
              <label htmlFor="speak" className="ml-2 block text-sm text-gray-900">Speak this text (TTS)</label>
            </div>
          </div>
        )}

        {currentSection.type === 'image' && (
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="path" className={labelClass}>Image Path (in Firebase Storage)</label>
              <input type="text" name="path" id="path" value={currentSection.path} onChange={handleSectionInputChange} className={inputClass} placeholder="e.g., images/lesson-slug/image1.png" />
            </div>
            <div>
              <label htmlFor="caption" className={labelClass}>Caption (Optional)</label>
              <input type="text" name="caption" id="caption" value={currentSection.caption} onChange={handleSectionInputChange} className={inputClass} placeholder="A short description for the image." />
            </div>
            <div>
              <label htmlFor="duration" className={labelClass}>Display Duration (ms)</label>
              <input type="number" name="duration" id="duration" value={currentSection.duration} onChange={handleSectionInputChange} className={inputClass} placeholder="e.g., 5000 for 5 seconds" />
            </div>
          </div>
        )}
        <button onClick={handleAddSection} className={`${buttonClass} bg-green-500 hover:bg-green-600 mt-6 w-full md:w-auto`}>
          Add Section to Lesson
        </button>
      </div>

      {sections.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Current Sections ({sections.length})</h2>
          <ul className="space-y-3">
            {sections.map((sec, index) => (
              <li key={sec.id || index} className="p-3 border border-gray-200 rounded-md bg-gray-50 flex justify-between items-start">
                <div>
                  <p className="font-semibold text-indigo-600">ID: <span className="font-normal text-gray-700">{sec.id}</span></p>
                  <p className="font-semibold">Type: <span className="font-normal text-gray-700">{sec.type}</span></p>
                  {sec.type === 'audioText' && <p className="text-sm text-gray-600">Text: {sec.text.substring(0, 50)}...</p>}
                  {sec.type === 'text' && <p className="text-sm text-gray-600">Content: {sec.content.substring(0, 50)}...</p>}
                  {sec.type === 'image' && <p className="text-sm text-gray-600">Path: {sec.path}</p>}
                </div>
                <button onClick={() => removeSection(index)} className={`${buttonClass} bg-red-500 hover:bg-red-600 text-xs`}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 text-center">
        <button
          onClick={handleSaveLesson}
          disabled={isLoading}
          className={`${buttonClass} bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 w-full md:w-1/2 lg:w-1/3 py-3 text-lg`}
        >
          {isLoading ? 'Saving Lesson...' : 'Save Entire Lesson to Firestore'}
        </button>
      </div>
    </div>
  );
};

export default AdminLessonUpload;
