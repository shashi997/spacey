import React, { useEffect } from 'react';
import { useLocation, useParams, Link, useNavigate } from 'react-router-dom';
import NavigationBar from '../components/NavigationBar';
import Footer from '../components/Footer';
import Badge from '../components/Badge';
import { auth, db } from '../firebaseConfig'; // Import auth and db
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'; // Firestore functions
import { RotateCcw, ArrowLeftToLine, MessageCircleQuestion } from 'lucide-react'; // Icons for buttons


const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { lessonSlug } = useParams();
  const currentUser = auth.currentUser;

  const quizAttemptResults = location.state?.results;

  useEffect(() => {
    if (!quizAttemptResults) {
      console.warn("No quiz results found in location state. Redirecting to lesson page...");
      navigate(`/learn/${lessonSlug}`);
    }
  }, [quizAttemptResults, lessonSlug, navigate]);

  useEffect(() => {
    if (quizAttemptResults && currentUser) {
      const { score } = quizAttemptResults;
      let badgeToAward = null;

      if (score === 100) {
        badgeToAward = {
          name: 'Galactic Genius',
          description: `Achieved a perfect score on the "${quizAttemptResults.quizTitle || lessonSlug}" quiz!`,
          imageUrl: 'https://img.icons8.com/color/96/medal2.png', // Consider using a Lucide icon or consistent style
        };
      } else if (score >= 80) {
        badgeToAward = {
          name: 'Star Voyager',
          description: `Scored 80% or higher on the "${quizAttemptResults.quizTitle || lessonSlug}" quiz!`,
          imageUrl: 'https://img.icons8.com/color/96/star--v1.png', // Consider using a Lucide icon or consistent style
        };
      }

      if (badgeToAward) {
        const saveBadge = async () => {
          try {
            const badgeDocId = `${currentUser.uid}_${lessonSlug}_${badgeToAward.name.replace(/\s+/g, '-')}`;
            const badgeRef = doc(db, 'userEarnedBadges', badgeDocId);
            
            await setDoc(badgeRef, {
              userId: currentUser.uid,
              lessonSlug: lessonSlug,
              quizTitle: quizAttemptResults.quizTitle || lessonSlug,
              badgeName: badgeToAward.name,
              badgeImageUrl: badgeToAward.imageUrl,
              badgeDescription: badgeToAward.description,
              scoreAchieved: score,
              earnedDate: serverTimestamp(),
            }, { merge: true }); // Added merge: true to update if exists
            console.log(`Badge "${badgeToAward.name}" saved for user ${currentUser.uid} for lesson ${lessonSlug}`);
          } catch (error) {
            console.error("Error saving earned badge:", error);
          }
        };
        saveBadge();
      }
    }
  }, [quizAttemptResults, currentUser, lessonSlug]);

  if (!quizAttemptResults) {
    // ... (no changes to this block)
    return (
      <div className="flex flex-col min-h-screen bg-gray-100 antialiased">
        <NavigationBar />
        <main className="flex-grow flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-700 mb-4">Quiz Results Not Available</h1>
            <p className="text-gray-600 mb-6">
              We couldn't find the results for this quiz. Please try taking the quiz again.
            </p>
            <Link
              to={`/learn/${lessonSlug}`}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md inline-flex items-center"
            >
              <ArrowLeftToLine className="w-4 h-4 mr-2" />
              Back to Lesson
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const {
    score,
    feedback,
    userAnswers,
    quizQuestions,
    quizTitle
  } = quizAttemptResults;

  let badgeEarnedDetailsForDisplay = null;
  if (score === 100) {
    badgeEarnedDetailsForDisplay = { name: 'Galactic Genius', earned: true, description: `Achieved a perfect score on the "${quizTitle || lessonSlug}" quiz!`, imageUrl: 'https://img.icons8.com/color/96/medal2.png' };
  } else if (score >= 80) {
    badgeEarnedDetailsForDisplay = { name: 'Star Voyager', earned: true, description: `Scored 80% or higher on the "${quizTitle || lessonSlug}" quiz!`, imageUrl: 'https://img.icons8.com/color/96/star--v1.png' };
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 antialiased">
      <NavigationBar
        customLinks={[
          { to: `/learn/${lessonSlug}`, text: 'Back to Lesson' },
          { to: '/lessons', text: 'All Lessons' },
        ]}
      />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        {/* ... (header and feedback section unchanged) ... */}
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-3">
            Quiz Results for {quizTitle || lessonSlug.replace(/-/g, ' ')}
          </h1>
          <p className="text-2xl font-semibold text-indigo-600">
            Your Score: {score}%
          </p>
        </header>

        <section className="mb-10 p-6 bg-indigo-50 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold text-indigo-800 mb-2">Feedback from AI Coach:</h2>
          <p className="text-lg text-indigo-700 mb-4">{feedback || "No feedback provided."}</p>
          {badgeEarnedDetailsForDisplay && <Badge {...badgeEarnedDetailsForDisplay} />}
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Your Answers & Explanations</h2>
          {/* ... (answers section unchanged) ... */}
           <div className="space-y-6">
            {quizQuestions.map((q, index) => {
              const userAnswerForThisQuestion = userAnswers[q.id];
              let displayUserAnswer = 'Not answered';
              if (q.type === 'mcq') {
                const selectedOption = q.options.find(opt => opt.id === userAnswerForThisQuestion);
                displayUserAnswer = selectedOption ? selectedOption.text : 'Not answered / Invalid option';
              } else {
                displayUserAnswer = userAnswerForThisQuestion || 'Not answered';
              }

              return (
                <div
                  key={q.id}
                  className="p-6 rounded-lg shadow-md bg-white border-l-4 border-gray-300"
                >
                  <p className="text-lg font-semibold text-gray-800 mb-2">
                    Question {index + 1}: {q.text}
                  </p>
                  <p className="text-sm text-gray-700 mb-1">
                    Your Answer: <span className="font-medium">{displayUserAnswer}</span>
                  </p>
                  {q.explanation && (
                    <div className="mt-2 p-3 bg-gray-50 rounded">
                      <p className="text-sm text-gray-600">
                        <strong className="text-gray-800">Explanation / Intended Answer:</strong> {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="text-center space-y-4 sm:space-y-0 sm:flex sm:justify-center sm:space-x-4">
          <Link
            to={`/lessons/${lessonSlug}/quiz`}
            className="inline-flex items-center justify-center bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors w-full sm:w-auto"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Retry Quiz
          </Link>
          <Link
            to={`/learn/${lessonSlug}`}
            className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors w-full sm:w-auto"
          >
            <ArrowLeftToLine className="w-5 h-5 mr-2" />
            Back to Lesson
          </Link>
          <Link
            to={`/lessons/${lessonSlug}/feedback`}
            className="inline-flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors w-full sm:w-auto"
          >
            <MessageCircleQuestion className="w-5 h-5 mr-2" />
            Provide Feedback
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
};



export default ResultsPage