// src/components/admin/QuizUploader.jsx
import React, { useState, useEffect  } from 'react';
import { db } from '../../firebaseConfig'; // Your Firebase config
import { doc, setDoc } from 'firebase/firestore';

const QuizUploader = () => {
    const [lessonSlug, setLessonSlug] = useState('');
    const [quizTitle, setQuizTitle] = useState('');
    const [questions, setQuestions] = useState([]);

    // State for the current question being built
    const [currentQuestionText, setCurrentQuestionText] = useState('');
    const [currentQuestionType, setCurrentQuestionType] = useState('mcq'); // 'mcq' or 'normal'
    const [currentExplanation, setCurrentExplanation] = useState('');

    // MCQ specific state
    const [mcqOptions, setMcqOptions] = useState([{ id: 'opt1', text: '', isCorrect: false }]);

    const [status, setStatus] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      if (currentQuestionType !== 'mcq') {
        setMcqOptions([{ id: 'opt1', text: '', isCorrect: false }]);
      } else if (mcqOptions.length === 0 || mcqOptions.every(opt => !opt.text && !opt.isCorrect)) {
        setMcqOptions([{ id: 'opt1', text: '', isCorrect: false }]);
      }
    }, [currentQuestionType]);

    const handleAddMcqOption = () => {
      setMcqOptions([...mcqOptions, { id: `opt${mcqOptions.length + 1}`, text: '', isCorrect: false }]);
    };

    const handleMcqOptionChange = (index, value) => {
      const newOptions = mcqOptions.map((option, i) =>
        i === index ? { ...option, text: value } : option
      );
      setMcqOptions(newOptions);
    };

    const handleSetCorrectMcqOption = (selectedIndex) => {
      const newOptions = mcqOptions.map((option, i) => ({
        ...option,
        isCorrect: i === selectedIndex,
      }));
      setMcqOptions(newOptions);
    };

    const handleRemoveMcqOption = (indexToRemove) => {
      if (mcqOptions.length > 1) {
        const newOptions = mcqOptions.filter((_, i) => i !== indexToRemove);
        setMcqOptions(newOptions);
      }
    };

    const handleAddQuestion = () => {
      setError('');
      setStatus('');

      if (!currentQuestionText.trim()) {
        setError('Question text cannot be empty.');
        return;
      }
      if (!currentExplanation.trim()) {
          setError('Explanation cannot be empty.');
          return;
      }

      let newQuestion = {
        id: `q${questions.length + 1}_${Date.now()}`,
        type: currentQuestionType,
        text: currentQuestionText.trim(),
        explanation: currentExplanation.trim(),
      };

      if (currentQuestionType === 'mcq') {
        const validOptions = mcqOptions.filter(opt => opt.text.trim() !== '');
        if (validOptions.length < 2) {
          setError('MCQ questions must have at least 2 valid options.');
          return;
        }
        const correctOptionSelected = validOptions.some(opt => opt.isCorrect);
        if (!correctOptionSelected) {
          setError('MCQ questions must have one correct answer selected.');
          return;
        }
        // **FIXED PART**: Ensure option.id is included here
        newQuestion.options = validOptions.map(opt => ({
          id: opt.id, // Crucial: Carry over the id from mcqOptions
          text: opt.text.trim(),
          isCorrect: opt.isCorrect
        }));
      }

      setQuestions([...questions, newQuestion]);
      setCurrentQuestionText('');
      setCurrentQuestionType('mcq');
      setCurrentExplanation('');
      setMcqOptions([{ id: 'opt1', text: '', isCorrect: false }]);
      setStatus('Question added to list below.');
    };

    const handleUploadQuiz = async () => {
      if (!lessonSlug.trim() || !quizTitle.trim() || questions.length === 0) {
        setError('Lesson Slug, Quiz Title, and at least one question are required.');
        return;
      }
      setLoading(true);
      setError('');
      setStatus('');

      try {
        const quizDocRef = doc(db, 'quizzes', lessonSlug.trim());
        await setDoc(quizDocRef, {
          title: quizTitle.trim(),
          questions: questions,
        });
        setStatus(`Quiz "${quizTitle}" for slug "${lessonSlug}" uploaded successfully!`);
        setLessonSlug('');
        setQuizTitle('');
        setQuestions([]);
        setCurrentQuestionText('');
        setCurrentQuestionType('mcq');
        setCurrentExplanation('');
        setMcqOptions([{ id: 'opt1', text: '', isCorrect: false }]);
      } catch (e) {
        console.error("Error uploading quiz: ", e);
        setError('Failed to upload quiz. Check console for details.');
      } finally {
        setLoading(false);
      }
    };

    // ... rest of the JSX for QuizUploader remains the same
    return (
      <div className="container mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-center text-indigo-700">Quiz Uploader</h1>
        
        {status && <p className="mb-4 p-3 bg-green-100 text-green-700 rounded">{status}</p>}
        {error && <p className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</p>}
  
        {/* Quiz Details Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Quiz Details</h2>
          <div className="mb-4">
            <label htmlFor="lessonSlug" className="block text-sm font-medium text-gray-700 mb-1">Lesson Slug</label>
            <input
              type="text"
              id="lessonSlug"
              value={lessonSlug}
              onChange={(e) => setLessonSlug(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="unique-lesson-slug"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="quizTitle" className="block text-sm font-medium text-gray-700 mb-1">Quiz Title</label>
            <input
              type="text"
              id="quizTitle"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="e.g., Satellite Fundamentals Quiz"
            />
          </div>
        </div>
  
        {/* Add New Question Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Add New Question</h2>
          <div className="mb-4">
            <label htmlFor="questionType" className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
            <select
              id="questionType"
              value={currentQuestionType}
              onChange={(e) => setCurrentQuestionType(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="mcq">Multiple Choice (MCQ)</option>
              <option value="normal">Normal (Short Answer)</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="questionText" className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
            <textarea
              id="questionText"
              rows="3"
              value={currentQuestionText}
              onChange={(e) => setCurrentQuestionText(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter the question here..."
            />
          </div>
  
          {/* MCQ Options - Updated with radio buttons for correct answer */}
          {currentQuestionType === 'mcq' && (
            <div className="mb-4 p-3 border border-gray-200 rounded">
              <h3 className="text-lg font-medium text-gray-700 mb-2">MCQ Options</h3>
              <p className="text-xs text-gray-500 mb-3">Select one option as the correct answer.</p>
              {mcqOptions.map((option, index) => (
                <div key={option.id} className="flex items-center mb-2">
                  <input
                    type="radio"
                    id={`correct_opt_${option.id}`} 
                    name={`correctMcqOptionRadio_${questions.length}`} 
                    checked={option.isCorrect}
                    onChange={() => handleSetCorrectMcqOption(index)}
                    className="mr-3 h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    aria-label={`Mark option ${index + 1} as correct`}
                  />
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => handleMcqOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  {mcqOptions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMcqOption(index)}
                      className="ml-2 px-2 py-1 text-sm text-red-600 hover:text-red-800"
                      aria-label={`Remove option ${index + 1}`}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddMcqOption}
                className="mt-2 px-3 py-1.5 text-sm border border-indigo-500 text-indigo-600 rounded-md hover:bg-indigo-50"
              >
                Add Another Option
              </button>
            </div>
          )}
  
          {/* Explanation Input - New */}
          <div className="mb-4">
            <label htmlFor="questionExplanation" className="block text-sm font-medium text-gray-700 mb-1">
              Explanation for the Answer
            </label>
            <textarea
              id="questionExplanation"
              rows="3"
              value={currentExplanation}
              onChange={(e) => setCurrentExplanation(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Explain why the answer is correct (for MCQs) or provide the expected answer/guidance (for normal questions)."
            />
          </div>
  
          <button
            type="button"
            onClick={handleAddQuestion}
            className="w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add This Question to Quiz List
          </button>
        </div>
        
        {/* Current Quiz Questions - Updated Display */}
        {questions.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Current Quiz Questions ({questions.length})</h2>
            <ul className="list-none pl-0 space-y-4">
              {questions.map((q, index) => (
                <li key={q.id} className="text-sm text-gray-700 border-b border-gray-200 pb-3 mb-3 last:border-b-0 last:pb-0 last:mb-0">
                  <p className="font-semibold text-gray-800">Q{index + 1} ({q.type.toUpperCase()}): <span className="font-normal">{q.text}</span></p>
                  {q.type === 'mcq' && q.options && (
                    <ul className="list-disc pl-6 mt-1 space-y-0.5">
                      {q.options.map((opt, optIndex) => (
                        <li key={`${q.id}-opt-${opt.id || optIndex}`} className={`${opt.isCorrect ? 'font-semibold text-green-600' : 'text-gray-600'}`}> {/* Updated key here for safety during display */}
                          {opt.text} {opt.isCorrect && <span className="text-xs">(Correct Answer)</span>}
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                      <strong className="text-gray-700">Explanation:</strong> {q.explanation}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
  
        <button
          type="button"
          onClick={handleUploadQuiz}
          disabled={loading || questions.length === 0}
          className="w-full px-6 py-3 bg-green-600 text-white font-bold text-lg rounded-md shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Uploading...' : 'Upload Entire Quiz to Firestore'}
        </button>
      </div>
    );
};

export default QuizUploader;
