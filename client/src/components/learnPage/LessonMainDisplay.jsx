// src/components/learnPage/LessonMainDisplay.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const LessonMainDisplay = ({
  lessonTitle,
  section,
  spokenText,
  userQuery, // Added prop
  aiResponse,
  lessonSlug,
  isLessonFinished,
  onTakeQuiz,
}) => {
  return (
    <div className="lg:col-span-2 bg-white rounded-lg shadow-xl flex flex-col max-h-[calc(100vh-160px)]"> {/* Adjusted max-h for flex layout */}
      
      {/* Header Part - Title */}
      <div className="p-6 md:p-8 border-b border-gray-200">
        <h1 className="font-nunito text-2xl sm:text-3xl font-bold text-gray-800">
          {lessonTitle}
        </h1>
      </div>

      {/* Main Content Area - Scrollable */}
      <div className="flex-grow p-6 md:p-8 overflow-y-auto">
        {!isLessonFinished && section && (
          <>
            {section.type === 'image' && section.path ? (
              <div className="my-4 rounded-lg overflow-hidden shadow-md">
                <img
                  src={section.path}
                  alt={section.caption || lessonTitle || 'Lesson image'}
                  className="w-full h-auto object-contain max-h-96" // Constrain image height
                />
                {section.caption && (
                  <p className="text-center text-sm text-gray-600 p-2 bg-gray-50">
                    {section.caption}
                  </p>
                )}
              </div>
            ) : spokenText ? (
              <div className="my-4 prose prose-lg lg:prose-xl max-w-none text-gray-800">
                <p className="whitespace-pre-wrap">{spokenText}</p>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 text-lg">Loading content or no visual for this section...</p>
              </div>
            )}
          </>
        )}

        {/* Display User Query and AI Response after section content */}
        {!isLessonFinished && (userQuery || aiResponse) && (
          <div className="my-6 space-y-4"> {/* Added margin and spacing for the Q&A block */}
            {userQuery && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
                <h4 className="font-nunito text-md font-semibold text-blue-700 mb-1">
                  Your Question:
                </h4>
                <p className="font-nunito text-gray-700 whitespace-pre-wrap text-sm">
                  {userQuery}
                </p>
              </div>
            )}
            {aiResponse && (
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg shadow-sm">
                <h3 className="font-nunito text-md font-semibold text-indigo-700 mb-1">
                  Avatar's Response:
                </h3>
                <p className="font-nunito text-gray-700 whitespace-pre-wrap text-sm">
                  {aiResponse}
                </p>
              </div>
            )}
          </div>
        )}
        
        {!isLessonFinished && !section && (
           <div className="flex items-center justify-center h-full">
             <p className="text-gray-500 text-lg">Loading lesson content...</p>
           </div>
        )}

        {isLessonFinished && (
            <div className="text-center py-10">
                <h2 className="font-nunito text-2xl font-semibold text-gray-700 mb-3">
                    Great job!
                </h2>
                <p className="font-nunito text-gray-600 text-lg">
                    You've completed all sections of "{lessonTitle}". You can now take the quiz.
                </p>
            </div>
        )}
      </div>

      {/* Footer Part - Quiz Button */}
      <div className="p-6 md:p-8 border-t border-gray-200 mt-auto">
        {/* AI Response display removed from here */}
        <div className="flex justify-end items-center">
          <button
            onClick={onTakeQuiz}
            className="font-nunito bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg text-lg shadow-lg transition-colors"
          >
            Take Quiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonMainDisplay;
