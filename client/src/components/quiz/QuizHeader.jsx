import React from 'react';

const QuizHeader = ({ title, description, totalQuestions }) => {
  return (
    <>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 text-center font-nunito">
        {title}
      </h1>
      <p className="text-center text-gray-600 mb-8 font-nunito">
        {description} (Displaying {totalQuestions} random questions)
      </p>
    </>
  );
};

export default QuizHeader;
