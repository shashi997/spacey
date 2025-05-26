import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavigationBar from '../components/NavigationBar';
import Footer from '../components/Footer';
import QuizHeader from '../components/quiz/QuizHeader';
import QuizProgress from '../components/quiz/QuizProgress';
import QuizQuestionRenderer from '../components/quiz/QuizQuestionRenderer';
import QuizSubmission from '../components/quiz/QuizSubmission';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Helper function to shuffle an array (Fisher-Yates shuffle)
const shuffleArray = (array) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
};

const QuizPage = () => {
  const { lessonSlug } = useParams();
  const navigate = useNavigate();

  const [quizData, setQuizData] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchAndPrepareQuiz = useCallback(async () => {
    setLoading(true);
    setError(null);
    setQuizData(null);
    setUserAnswers({});

    try {
      const quizDocRef = doc(db, 'quizzes', lessonSlug);
      const quizSnap = await getDoc(quizDocRef);

      if (quizSnap.exists()) {
        const fetchedQuizData = quizSnap.data();
        const allQuestions = fetchedQuizData.questions || [];

        const mcqs = allQuestions.filter(q => q.type === 'mcq');
        const normals = allQuestions.filter(q => q.type === 'normal');

        const shuffledMcqs = shuffleArray([...mcqs]);
        const shuffledNormals = shuffleArray([...normals]);

        const selectedMcqs = shuffledMcqs.slice(0, 2);
        const selectedNormals = shuffledNormals.slice(0, 1);
        
        const finalQuestions = shuffleArray([...selectedMcqs, ...selectedNormals]);

        if (finalQuestions.length === 0) {
            setError(`No questions found for lesson "${lessonSlug}" after filtering. Please ensure the quiz has at least 1 question.`);
            setLoading(false);
            return;
        }
        
        setQuizData({
          title: fetchedQuizData.title || `Quiz for ${lessonSlug}`,
          questions: finalQuestions,
        });

        const initialAnswers = {};
        finalQuestions.forEach(q => {
          initialAnswers[q.id] = q.type === 'mcq' ? null : '';
        });
        setUserAnswers(initialAnswers);

      } else {
        setError(`Quiz for lesson "${lessonSlug}" not found in Firestore.`);
      }
    } catch (err) {
      console.error("Error fetching quiz from Firestore:", err);
      setError('Failed to load quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [lessonSlug]);

  useEffect(() => {
    fetchAndPrepareQuiz();
  }, [fetchAndPrepareQuiz]);

  const handleAnswerChange = (questionId, answer) => {
    setUserAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: answer,
    }));
  };

  const handleSubmitQuiz = async () => {
    setSubmitting(true);
    setError(null);
    
    const submissionData = {
      lessonSlug,
      questions: quizData.questions,
      userAnswers,
    };

    console.log('Submitting quiz data:', submissionData);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/quiz`, submissionData); 
      
      console.log('Server response:', response.data); // This should contain { score, feedback, userAnswers }

      // Construct the data to be passed to the ResultsPage
      // Ensure score and feedback from the server are included
      const resultsForNavigation = {
        score: response.data.score,             // Get score from server response
        feedback: response.data.feedback,       // Get feedback from server response
        userAnswers: userAnswers,               // Use the current client-side userAnswers
        quizQuestions: quizData.questions,      // Pass the original questions
      };
      
      navigate(`/lessons/${lessonSlug}/quiz/results`, { state: { results: resultsForNavigation } });

    } catch (err) {
      console.error('Quiz submission error:', err);
      let errorMessage = 'An error occurred while submitting the quiz.';
      if (err.response) {
        console.error("Error data:", err.response.data);
        console.error("Error status:", err.response.status);
        errorMessage = `Server error: ${err.response.data.message || err.response.statusText || 'Failed to submit'}`;
      } else if (err.request) {
        console.error("No response received:", err.request);
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        console.error('Error message:', err.message);
      }
      setError(errorMessage);
    } finally {
      setSubmitting(false); 
    }
  };

  const handleBackToLearnPage = (e) => {
    const hasAnswers = Object.values(userAnswers).some(answer =>
        (typeof answer === 'string' && answer.trim() !== '') || (answer !== null && typeof answer !== 'string')
    );
    if (hasAnswers) {
      if (!window.confirm('Are you sure you want to leave? Your quiz progress will be lost.')) {
        e.preventDefault();
      }
    }
  };

  // --- Loading and Error States ---
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100 antialiased">
        <NavigationBar />
        <main className="flex-grow flex items-center justify-center">
          <p className="text-xl text-gray-700 font-nunito">Loading quiz...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100 antialiased">
        <NavigationBar />
        <main className="flex-grow flex items-center justify-center px-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center" role="alert">
            <strong className="font-bold font-nunito">Error:</strong>
            <span className="block sm:inline font-nunito"> {error}</span>
            <div className="mt-4">
              <Link to="/lessons" className="text-indigo-600 hover:text-indigo-800 underline font-nunito">
                Back to Lessons
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!quizData || !quizData.questions || quizData.questions.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100 antialiased">
        <NavigationBar />
        <main className="flex-grow flex items-center justify-center">
          <p className="text-xl text-gray-700 font-nunito">No quiz questions available for this lesson.</p>
        </main>
        <Footer />
      </div>
    );
  }

  const totalQuestions = quizData.questions.length;
  const answeredQuestions = Object.values(userAnswers).filter(
    answer => (typeof answer === 'string' && answer.trim() !== '') || (answer !== null && typeof answer !== 'string')
  ).length;
  const progressPercentage = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
  const allQuestionsAnswered = answeredQuestions === totalQuestions;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 antialiased">
      <NavigationBar
        customLinks={[
          {
            to: `/learn/${lessonSlug}`,
            text: 'Back to Lesson',
            onClick: handleBackToLearnPage,
          },
        ]}
      />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <QuizHeader
          title={quizData.title}
          description="Test your knowledge on what you've learned."
          totalQuestions={totalQuestions}
        />
        <QuizProgress
          answeredQuestions={answeredQuestions}
          totalQuestions={totalQuestions}
          progressPercentage={progressPercentage}
        />

        <form onSubmit={(e) => e.preventDefault()}>
          <QuizQuestionRenderer
            questions={quizData.questions}
            userAnswers={userAnswers}
            onAnswerChange={handleAnswerChange}
          />
          <QuizSubmission
            onSubmit={handleSubmitQuiz}
            submitting={submitting}
            allQuestionsAnswered={allQuestionsAnswered}
          />
        </form>
      </main>
      <Footer />
    </div>
  );
};



export default QuizPage