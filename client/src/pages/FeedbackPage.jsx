import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import NavigationBar from '../components/NavigationBar';
import Footer from '../components/Footer';
import { db, auth } from '../firebaseConfig'; // Import db and auth
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; // Firestore functions
import { onAuthStateChanged } from 'firebase/auth';
import { Star, Send, MessageSquareHeart, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react'; // Added icons

// Simple Star Rating Component
const StarRating = ({ rating, onRatingChange }) => {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex space-x-1 mb-4 justify-center">
      {stars.map((starValue) => (
        <button
          key={starValue}
          type="button"
          onClick={() => onRatingChange(starValue)}
          className={`text-3xl transition-colors duration-150 ease-in-out focus:outline-none
            ${starValue <= rating ? 'text-yellow-400 hover:text-yellow-500' : 'text-gray-300 hover:text-gray-400'}`}
          aria-label={`Rate ${starValue} out of 5 stars`}
        >
          <Star className="w-8 h-8 fill-current" /> {/* Use Lucide Star */}
        </button>
      ))}
    </div>
  );
};


const FeedbackPage = () => {
  const { lessonSlug } = useParams();
  const navigate = useNavigate();

  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []); // Removed navigate from dependencies as it's stable

  const handleRatingChange = (newRating) => {
    setRating(newRating);
    if (error && newRating > 0) setError('');
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!currentUser) {
      setError('You must be logged in to submit feedback.');
      return;
    }

    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }
    if (comments.trim() === '') {
      setError('Please provide some comments.');
      return;
    }

    setSubmitting(true);
    
    try {
      const feedbackData = {
        lessonSlug: lessonSlug,
        rating: rating,
        comments: comments.trim(),
        userId: currentUser.uid,
        userEmail: currentUser.email,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "feedbacks"), feedbackData);
      console.log('Feedback submitted with ID: ', docRef.id);

      setSuccessMessage('Thank you for your feedback! It has been submitted.');
      setRating(0);
      setComments('');

    } catch (err) {
      console.error('Feedback submission error:', err);
      setError(err.message || 'An error occurred while submitting your feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 antialiased">
      <NavigationBar
        customLinks={[
          { to: `/lessons/${lessonSlug}/quiz/results`, text: 'Back to Quiz Results' },
          { to: `/learn/${lessonSlug}`, text: 'Back to Lesson' },
          { to: '/lessons', text: 'All Lessons' },
        ]}
      />

      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg bg-white p-8 md:p-10 rounded-xl shadow-2xl">
          <header className="text-center mb-8">
            <div className="flex justify-center items-center mb-3">
                <MessageSquareHeart className="w-10 h-10 text-indigo-600 mr-3" />
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">
                Share Your Feedback
                </h1>
            </div>
            <p className="text-gray-600 mt-2">
              Help us improve the lesson on "{lessonSlug.replace(/-/g, ' ')}".
            </p>
          </header>

          {successMessage && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md flex items-center" role="alert">
              <CheckCircle2 className="w-6 h-6 mr-3 text-green-600" />
              <div>
                <p className="font-bold">Success!</p>
                <p>{successMessage}</p>
              </div>
            </div>
          )}

          {error && !successMessage && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md flex items-center" role="alert">
              <AlertTriangle className="w-6 h-6 mr-3 text-red-600" />
              <div>
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            </div>
          )}

          {!currentUser && !successMessage && (
            <div className="text-center text-red-600 mb-6 p-4 border border-red-300 rounded-md bg-red-50">
                <p>You need to be logged in to submit feedback.</p>
                <Link to="/login" className="text-indigo-600 hover:underline font-semibold">Login here</Link>
            </div>
          )}

          {!successMessage && currentUser && (
            <form onSubmit={handleSubmitFeedback} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                  Overall Rating
                </label>
                <StarRating rating={rating} onRatingChange={handleRatingChange} />
              </div>

              <div>
                <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Comments
                </label>
                <textarea
                  id="comments"
                  name="comments"
                  rows="5"
                  value={comments}
                  onChange={(e) => {
                    setComments(e.target.value);
                    if (error && e.target.value.trim() !== '') setError('');
                  }}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="What did you like or dislike? Any suggestions?"
                  required
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={submitting || !currentUser}
                  className={`w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white transition-colors
                    ${submitting || !currentUser
                      ? 'bg-indigo-300 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                    }`}
                >
                  {submitting ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Submitting...</>
                  ) : (
                    <><Send className="w-5 h-5 mr-2" /> Submit Feedback</>
                  )}
                </button>
              </div>
            </form>
          )}
          {successMessage && (
             <div className="mt-6 text-center">
                <Link to={`/learn/${lessonSlug}`} className="font-medium text-indigo-600 hover:text-indigo-500 mr-4">
                    Back to Lesson
                </Link>
                <Link to="/lessons" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Explore other lessons &rarr;
                </Link>
             </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};


export default FeedbackPage