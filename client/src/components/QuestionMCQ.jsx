import React from 'react';

const QuestionMCQ = ({ question, onAnswerSelect, selectedAnswer }) => {
    if (!question || question.type !== 'mcq' || !question.options) {
      return <p className="text-red-500">Invalid MCQ question data.</p>;
    }

    return (
      <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
        <p className="text-lg font-semibold text-gray-800 mb-4">{question.text}</p>
        <div className="space-y-3">
          {question.options.map((option) => ( // `option` will now have an `id` property
            <label
              key={option.id} // This will now use the unique id like 'opt1', 'opt2' from the data
              className={`flex items-center p-3 border rounded-md cursor-pointer transition-all duration-150 ease-in-out
                          ${selectedAnswer === option.id // Comparison will work as expected
                            ? 'bg-indigo-100 border-indigo-500 ring-2 ring-indigo-500'
                            : 'bg-gray-50 hover:bg-gray-100 border-gray-300'
                          }`}
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={option.id} // `value` will be correctly set (e.g., 'opt1')
                checked={selectedAnswer === option.id} // `checked` logic will function correctly
                onChange={() => onAnswerSelect(question.id, option.id)} // `onAnswerSelect` will pass the correct option id
                className="form-radio h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 mr-3"
              />
              <span className="text-gray-700">{option.text}</span>
            </label>
          ))}
        </div>
      </div>
    );
};

export default QuestionMCQ