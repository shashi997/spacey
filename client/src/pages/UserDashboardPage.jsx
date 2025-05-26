import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NavigationBar from '../components/NavigationBar';
import Footer from '../components/Footer';
import Badge from '../components/Badge';
import { auth, db } from '../firebaseConfig'; // Import db
import { signOut } from 'firebase/auth';   // Import signOut
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'; // Firestore functions
import {
  UserCircle, // For Account Details
  BarChart3, // For Progress & Contributions
  BookOpen, // For Lessons in Progress
  Award, // For Earned Badges
  MessageSquareText, // For Submitted Feedback
  LogOut, // For Logout button
  ArrowRight, // For links like "Explore lessons"
  Sparkles, // For "Ace quizzes"
  Star, // For star rating (already used, but good to note)
  AlertCircle, // For error messages
  Loader2, // For loading states
} from 'lucide-react';


// Simple Star Display Component for the dashboard
const DisplayStars = ({ rating }) => {
  const totalStars = 5;
  return (
    <div className="flex">
      {[...Array(totalStars)].map((_, index) => (
        <span key={index} className={index < rating ? 'text-yellow-400' : 'text-gray-300'}>
          <Star className="w-5 h-5 fill-current" />
        </span>
      ))}
    </div>
  );
};

const UserDashboardPage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [lessonsInProgress, setLessonsInProgress] = useState([]);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [userFeedbacks, setUserFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        setUserData({
          username: currentUser.displayName || currentUser.email.split('@')[0],
          email: currentUser.email,
          joinDate: currentUser.metadata?.creationTime ? new Date(currentUser.metadata.creationTime).toISOString().split('T')[0] : 'N/A',
          photoURL: currentUser.photoURL,
        });
        
        const progressCol = collection(db, "userLessonProgress");
        const progressQuery = query(progressCol, where("userId", "==", currentUser.uid), orderBy("lastAccessedTimestamp", "desc"));
        const progressSnapshot = await getDocs(progressQuery);
        const fetchedProgress = progressSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          lastAccessedTimestamp: doc.data().lastAccessedTimestamp?.toDate ? doc.data().lastAccessedTimestamp.toDate().toLocaleDateString() : 'N/A'
        }));
        setLessonsInProgress(fetchedProgress);

        const badgesCol = collection(db, "userEarnedBadges");
        const badgesQuery = query(badgesCol, where("userId", "==", currentUser.uid), orderBy("earnedDate", "desc"));
        const badgesSnapshot = await getDocs(badgesQuery);
        const fetchedBadges = badgesSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().badgeName,
          imageUrl: doc.data().badgeImageUrl,
          description: doc.data().badgeDescription,
          earned: true,
          lessonSlug: doc.data().lessonSlug,
          quizTitle: doc.data().quizTitle,
          earnedDate: doc.data().earnedDate?.toDate ? doc.data().earnedDate.toDate().toLocaleDateString() : 'N/A'
        }));
        setEarnedBadges(fetchedBadges);
        
        const feedbacksCol = collection(db, "feedbacks");
        const feedbackQuery = query(feedbacksCol, where("userId", "==", currentUser.uid), orderBy("createdAt", "desc"));
        const feedbackSnapshot = await getDocs(feedbackQuery);
        const fetchedFeedbacks = feedbackSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toLocaleDateString() : 'N/A'
          };
        });
        setUserFeedbacks(fetchedFeedbacks);

      } catch (e) {
        console.error("Failed to fetch dashboard data:", e);
        setError("Could not load your dashboard. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
        fetchData();
    } else {
        setLoading(false);
    }
  }, [currentUser]);

  const handleDashboardLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Dashboard logout failed:', err);
      setError('Failed to logout. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100 antialiased">
        <NavigationBar />
        <main className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center text-gray-700">
            <Loader2 className="w-12 h-12 animate-spin mb-4 text-indigo-600" />
            <p className="text-xl">Loading your dashboard...</p>
          </div>
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
            <div className="flex items-center justify-center mb-2">
              <AlertCircle className="w-6 h-6 mr-2 text-red-500" />
              <strong className="font-bold">Error:</strong>
            </div>
            <span className="block sm:inline"> {error}</span>
            <div className="mt-4">
              <Link to="/" className="text-indigo-600 hover:text-indigo-800 underline">
                Go to Homepage
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!currentUser && !loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100 antialiased">
        <NavigationBar />
        <main className="flex-grow flex items-center justify-center">
          <p className="text-xl text-gray-700">Please log in to view your dashboard.</p>
           <Link to="/login" className="ml-2 text-indigo-600 hover:underline">Login</Link>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!userData && currentUser) { 
    return (
      <div className="flex flex-col min-h-screen bg-gray-100 antialiased">
        <NavigationBar />
        <main className="flex-grow flex items-center justify-center">
           <div className="flex flex-col items-center text-gray-700">
            <Loader2 className="w-12 h-12 animate-spin mb-4 text-indigo-600" />
            <p className="text-xl">Preparing your dashboard...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  const displayName = userData?.username || 'Explorer';
  const joinDateDisplay = userData?.joinDate !== 'N/A' ? new Date(userData.joinDate).toLocaleDateString() : 'N/A';

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 antialiased">
      <NavigationBar />

      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <header className="mb-10 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900">
            Welcome, {displayName}!
          </h1>
          <p className="text-lg text-gray-600 mt-2">Your cosmic journey dashboard.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg">
            <h2 className="flex items-center text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
              <UserCircle className="w-7 h-7 mr-3 text-indigo-600" />
              Account Details
            </h2>
            {userData?.photoURL ? (
                <img 
                    src={userData.photoURL} 
                    alt={displayName} 
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover shadow-md border-2 border-indigo-300"
                />
            ) : (
              <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-gray-200 flex items-center justify-center border-2 border-indigo-300">
                <UserCircle className="w-16 h-16 text-gray-400" />
              </div>
            )}
            <div className="space-y-3 text-gray-700">
              <p><strong>Username:</strong> {displayName}</p>
              <p><strong>Email:</strong> {userData?.email}</p>
              <p><strong>Joined:</strong> {joinDateDisplay}</p>
            </div>
            <button
              onClick={handleDashboardLogout}
              className="mt-8 w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-4 rounded-md transition-colors duration-150 flex items-center justify-center"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </button>
          </section>

          <section className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
            <h2 className="flex items-center text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
              <BarChart3 className="w-7 h-7 mr-3 text-indigo-600" />
              Your Progress & Contributions
            </h2>
            
            <div className="mb-8">
              <h3 className="flex items-center text-xl font-semibold text-gray-700 mb-4">
                <BookOpen className="w-6 h-6 mr-2 text-indigo-500" />
                Lessons in Progress
              </h3>
              {lessonsInProgress.length > 0 ? (
                <ul className="space-y-3">
                  {lessonsInProgress.map(lesson => (
                    <li key={lesson.id} className="p-4 border rounded-md bg-gray-50 shadow-sm hover:shadow-md transition-shadow">
                      <Link to={`/learn/${lesson.lessonSlug}`} className="group">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">{lesson.lessonTitle}</span>
                          <span className="text-sm text-indigo-600 font-medium">{lesson.progressPercentage}% Complete</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-indigo-500 h-2.5 rounded-full transition-all duration-500 ease-out" 
                            style={{ width: `${lesson.progressPercentage}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1.5">Last accessed: {lesson.lastAccessedTimestamp}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic flex items-center">
                  No lessons started yet. 
                  <Link to="/lessons" className="text-indigo-600 hover:underline ml-1 flex items-center">
                    Explore lessons <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </p>
              )}
            </div>

            <div className="mb-10">
              <h3 className="flex items-center text-xl font-semibold text-gray-700 mb-4">
                <Award className="w-6 h-6 mr-2 text-yellow-500" />
                Earned Badges
              </h3>
              {earnedBadges.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {earnedBadges.map(badge => (
                    <Badge
                      key={badge.id}
                      name={badge.name}
                      imageUrl={badge.imageUrl}
                      description={badge.description}
                      earned={true}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic flex items-center">
                  No badges earned yet. 
                  <span className="ml-1">Ace quizzes to unlock them! <Sparkles className="w-4 h-4 inline text-yellow-400" /></span>
                </p>
              )}
            </div>

            <div>
              <h3 className="flex items-center text-xl font-semibold text-gray-700 mb-4 border-t pt-6">
                <MessageSquareText className="w-6 h-6 mr-2 text-green-500" />
                My Submitted Feedback
              </h3>
              {userFeedbacks.length > 0 ? (
                <div className="space-y-4">
                  {userFeedbacks.map(fb => (
                    <div key={fb.id} className="p-4 border rounded-md bg-gray-50 shadow-sm">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-semibold text-indigo-700 capitalize">
                          Feedback for: {fb.lessonSlug.replace(/-/g, ' ')}
                        </h4>
                        <span className="text-xs text-gray-500">{fb.createdAt}</span>
                      </div>
                      <DisplayStars rating={fb.rating} />
                      <p className="text-sm text-gray-600 mt-1">{fb.comments}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">You haven't submitted any feedback yet.</p>
              )}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};



export default UserDashboardPage