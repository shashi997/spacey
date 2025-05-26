import React from 'react'

const QuestionNormal = ({ question, onAnswerChange, currentAnswer }) => {
  if (!question || question.type !== 'normal') {
    return <p className="text-red-500">Invalid Normal question data.</p>;
  }

  return (
    <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
      <p className="text-lg font-semibold text-gray-800 mb-4">{question.text}</p>
      <div>
        <textarea
          rows="4"
          value={currentAnswer || ''}
          onChange={(e) => onAnswerChange(question.id, e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-gray-400"
          placeholder="Type your answer here..."
        />
      </div>
    </div>
  );
};


export default QuestionNormal