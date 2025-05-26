import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NavigationBar from '../components/NavigationBar';
import {
  signInWithEmailAndPassword,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore'; // For Firestore operations
import { auth, googleProvider, db } from '../firebaseConfig'; // Your Firebase instances


const LoginPage = () => {
  const [emailOrUsername, setEmailOrUsername] = useState(''); // Assuming this will be used as email for Firebase
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const navigate = useNavigate(); // Hook for programmatic navigation

  // Helper function to update lastLoginAt or create user doc if somehow missing
  const updateUserLoginTimestamp = async (user) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      await updateDoc(userDocRef, {
        lastLoginAt: serverTimestamp(),
        // Optionally update other fields like photoURL if it changed from Google
        ...(user.providerData[0]?.providerId === 'google.com' && {
            username: user.displayName || user.email.split('@')[0],
            photoURL: user.photoURL || null,
        })
      });
    } else {
      // This case is unlikely if signup flow is robust, but as a fallback:
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        username: user.displayName || user.email.split('@')[0],
        photoURL: user.photoURL || null,
        authProvider: user.providerData[0]?.providerId || 'unknown',
        createdAt: serverTimestamp(), // User doc didn't exist, so set createdAt
        lastLoginAt: serverTimestamp(),
      }, { merge: true });
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // For Firebase signInWithEmailAndPassword, the first argument must be an email.
    // If you intend to allow login with username, you'd need a preliminary step
    // to query Firestore for the user's email based on their username.
    // For this implementation, we'll assume emailOrUsername is the email.
    const email = emailOrUsername;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateUserLoginTimestamp(user);

      console.log('Login successful with Email/Password:', user);
      navigate('/'); // Redirect to homepage or dashboard
      // alert('Login Successful! Redirecting...');

    } catch (err) {
      console.error('Login error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      }
       else {
        setError('Login failed. Please try again. ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      await updateUserLoginTimestamp(user);

      console.log('Login successful with Google:', user);
      navigate('/'); // Redirect to homepage or dashboard
      // alert('Google Login Successful! Redirecting...');

    } catch (err) {
      console.error('Google Login error:', err);
       if (err.code === 'auth/popup-closed-by-user') {
        setError('Google sign-in was cancelled.');
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        // This error can happen if user signed up with email/password using the same email
        // and then tries to sign in with Google. Firebase offers ways to link accounts.
        // For simplicity here, we'll just show an error.
        setError('An account already exists with this email. Try logging in with your original method or link your Google account in settings (if feature exists).');
      }
      else {
        setError('Google login failed. Please try again. ' + err.message);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 antialiased">
      <NavigationBar />
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-xl">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Welcome Back!
          </h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="emailOrUsername" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="emailOrUsername"
                name="emailOrUsername"
                type="email" // Changed to email for clarity with Firebase
                autoComplete="email"
                required
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="text-sm text-right">
              <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                Forgot your password?
              </Link>
            </div>
            <div>
              <button
                type="submit"
                disabled={loading || googleLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                }`}
              >
                {loading ? 'Logging In...' : 'Login'}
              </button>
            </div>
          </form>

          <div className="mt-4 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading || googleLoading}
              className={`w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                googleLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {/* Basic Google SVG Icon (same as signup) */}
              <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M48 24C48 22.044 47.822 20.134 47.486 18.284H24.5V28.54H37.834C37.226 31.79 35.606 34.544 32.938 36.384V42.39H40.918C45.362 38.388 48 31.772 48 24Z" fill="#4285F4"/><path fillRule="evenodd" clipRule="evenodd" d="M24.5 48C30.954 48 36.446 45.926 40.918 42.39L32.938 36.384C30.782 37.882 27.872 38.716 24.5 38.716C18.146 38.716 12.71 34.388 10.814 28.768H2.606V34.94C6.962 43.034 15.074 48 24.5 48Z" fill="#34A853"/><path fillRule="evenodd" clipRule="evenodd" d="M10.814 28.768C10.346 27.356 10.054 25.702 10.054 24C10.054 22.298 10.346 20.644 10.814 19.232V13.06H2.606C0.942 16.242 0 19.992 0 24C0 28.008 0.942 31.758 2.606 34.94L10.814 28.768Z" fill="#FBBC05"/><path fillRule="evenodd" clipRule="evenodd" d="M24.5 9.284C28.202 9.284 31.366 10.596 33.902 12.968L41.146 5.724C36.43 1.734 30.954 0 24.5 0C15.074 0 6.962 4.966 2.606 13.06L10.814 19.232C12.71 13.612 18.146 9.284 24.5 9.284Z" fill="#EA4335"/></svg>
              {googleLoading ? 'Processing...' : 'Login with Google'}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default LoginPage