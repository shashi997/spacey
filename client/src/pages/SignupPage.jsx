import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import NavigationBar from '../components/NavigationBar';
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebaseConfig'; // Your Firebase instances


const SignupPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const navigate = useNavigate();

  // Helper function to create/update user document in Firestore
  const createUserDocument = async (user, additionalData = {}) => {
    if (!user) return;

    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);

    const userData = {
      uid: user.uid,
      email: user.email,
      username: additionalData.username || user.displayName || user.email.split('@')[0], // Use provided username, then displayName, then part of email
      photoURL: user.photoURL || null,
      authProvider: additionalData.authProvider || (user.providerData[0]?.providerId || 'unknown'),
      ...additionalData, // Spread additional data like a custom username
    };

    if (!userDocSnap.exists()) {
      // New user
      userData.createdAt = serverTimestamp();
      userData.lastLoginAt = serverTimestamp();
    } else {
      // Existing user (e.g. signed up with email, now using Google or vice-versa)
      userData.lastLoginAt = serverTimestamp();
    }
    
    await setDoc(userDocRef, userData, { merge: true }); // merge: true is important
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) { // Firebase default minimum is 6
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (!username.trim()) {
        setError('Username is required.');
        return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update Firebase Auth profile with username
      await updateProfile(user, {
        displayName: username
      });

      // Store user info in Firestore
      await createUserDocument(user, {
        username: username, // Explicitly pass username
        authProvider: 'email/password',
      });

      console.log('Signup successful with Email/Password:', user);
      navigate('/'); // Redirect to homepage or dashboard after successful signup
      // You might want to show a success message before redirecting
      // alert('Signup Successful! Redirecting...');

    } catch (err) {
      console.error('Signup error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email address is already in use.');
      } else if (err.code === 'auth/weak-password') {
        setError('The password is too weak.');
      } else {
        setError('Signup failed. Please try again. ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Store/update user info in Firestore
      // Google provides displayName, which we can use as username
      await createUserDocument(user, { authProvider: 'google.com' });

      console.log('Signup/Login successful with Google:', user);
      navigate('/'); // Redirect to homepage or dashboard
      // alert('Google Sign-in Successful! Redirecting...');

    } catch (err) {
      console.error('Google Signup error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Google sign-in was cancelled.');
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        setError('An account already exists with the same email address but different sign-in credentials. Try logging in with the original method.');
      }
      else {
        setError('Google signup failed. Please try again. ' + err.message);
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
            Create Your Account
          </h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={loading || googleLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                }`}
              >
                {loading ? 'Signing Up...' : 'Sign Up'}
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
              onClick={handleGoogleSignup}
              disabled={loading || googleLoading}
              className={`w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                googleLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {/* Basic Google SVG Icon */}
              <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M48 24C48 22.044 47.822 20.134 47.486 18.284H24.5V28.54H37.834C37.226 31.79 35.606 34.544 32.938 36.384V42.39H40.918C45.362 38.388 48 31.772 48 24Z" fill="#4285F4"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M24.5 48C30.954 48 36.446 45.926 40.918 42.39L32.938 36.384C30.782 37.882 27.872 38.716 24.5 38.716C18.146 38.716 12.71 34.388 10.814 28.768H2.606V34.94C6.962 43.034 15.074 48 24.5 48Z" fill="#34A853"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M10.814 28.768C10.346 27.356 10.054 25.702 10.054 24C10.054 22.298 10.346 20.644 10.814 19.232V13.06H2.606C0.942 16.242 0 19.992 0 24C0 28.008 0.942 31.758 2.606 34.94L10.814 28.768Z" fill="#FBBC05"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M24.5 9.284C28.202 9.284 31.366 10.596 33.902 12.968L41.146 5.724C36.43 1.734 30.954 0 24.5 0C15.074 0 6.962 4.966 2.606 13.06L10.814 19.232C12.71 13.612 18.146 9.284 24.5 9.284Z" fill="#EA4335"/>
              </svg>
              {googleLoading ? 'Processing...' : 'Sign up with Google'}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default SignupPage