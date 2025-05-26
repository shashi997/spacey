// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from "./pages/HomePage";
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import LessonPage from './pages/LessonPage';
import LearnPage from './pages/LearnPage';
import QuizPage from './pages/QuizPage';
import ResultsPage from './pages/ResultsPage';
import FeedbackPage from './pages/FeedbackPage';
import UserDashboardPage from './pages/UserDashboardPage';
import QuizUploader from './components/admin/QuizUploader';
import AdminLessonUpload from './components/admin/AdminLessonUpload';
import TermsOfServicePage from './pages/TermsOfServicePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';

function App() {

  return (
      <div className="app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/lessons" element={<LessonPage />} />
          <Route path="/learn/:lessonSlug" element={<LearnPage />} />
          <Route path="/lessons/:lessonSlug/quiz" element={<QuizPage />} /> 
          <Route path="/lessons/:lessonSlug/quiz/results" element={<ResultsPage />} />
          <Route path="/lessons/:lessonSlug/feedback" element={<FeedbackPage />} />
          <Route path="/dashboard" element={<UserDashboardPage />} />

           {/* Legal Pages */}
          <Route path="/terms-of-service" element={<TermsOfServicePage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />

          {/* Add a catch-all route for 404 Not Found pages */}
          <Route path="*" element={<NotFoundPage />} />

          {/* Admin Routes */}
          <Route path="/admin/upload-quiz" element={<QuizUploader />} /> {/* Temporary route */}
          <Route path="/admin/upload-lesson" element={<AdminLessonUpload />} />
        </Routes>
      </div>
  );
}

export default App;
