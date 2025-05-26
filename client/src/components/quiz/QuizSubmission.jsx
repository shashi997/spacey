import React from 'react';

const QuizSubmission = ({ onSubmit, submitting, canSubmit, allQuestionsAnswered }) => {
  return (
    <div className="mt-10 text-center">
      <button
        type="button"
        onClick={onSubmit}
        disabled={submitting || !allQuestionsAnswered}
        className={`py-3 px-8 rounded-lg text-white font-semibold transition-colors shadow-lg hover:shadow-xl font-nunito
          ${submitting || !allQuestionsAnswered
            ? 'bg-indigo-300 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          }`}
      >
        {submitting ? 'Submitting...' : 'Submit Quiz'}
      </button>
      {!allQuestionsAnswered && (
          <p className="text-sm text-red-500 mt-2 font-nunito">Please answer all questions before submitting.</p>
      )}
    </div>
  );
};

export default QuizSubmission;
