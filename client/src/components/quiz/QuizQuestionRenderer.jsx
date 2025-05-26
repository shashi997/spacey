import React from 'react';
import QuestionMCQ from '../QuestionMCQ';
import QuestionNormal from '../QuestionNormal';

const QuizQuestionRenderer = ({ questions, userAnswers, onAnswerChange }) => {
  if (!questions || questions.length === 0) {
    return <p className="font-nunito text-center text-gray-500">No questions to display.</p>;
  }

  return (
    <>
      {questions.map((question, index) => (
        <div key={question.id} className="mb-6 bg-white p-4 sm:p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-gray-800 mb-3 font-nunito">Question {index + 1}</h2>
          {question.type === 'mcq' ? (
            <QuestionMCQ
              question={question}
              onAnswerSelect={onAnswerChange}
              selectedAnswer={userAnswers[question.id]}
            />
          ) : question.type === 'normal' ? (
            <QuestionNormal
              question={question}
              onAnswerChange={onAnswerChange}
              currentAnswer={userAnswers[question.id]}
            />
          ) : (
            <p className="font-nunito">Unsupported question type.</p>
          )}
        </div>
      ))}
    </>
  );
};

export default QuizQuestionRenderer;
