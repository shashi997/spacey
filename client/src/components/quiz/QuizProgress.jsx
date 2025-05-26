import React from 'react';

const QuizProgress = ({ answeredQuestions, totalQuestions, progressPercentage }) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between mb-1">
        <span className="text-base font-medium text-indigo-700 font-nunito">Progress</span>
        <span className="text-sm font-medium text-indigo-700 font-nunito">
          {answeredQuestions} of {totalQuestions} answered
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default QuizProgress;
