# Spacey - AI Enhanced Learning Platform

Spacey is an innovative, interactive learning platform designed to provide an engaging and personalized educational experience. It leverages cutting-edge AI technologies, including Google's Gemini API and high-quality Text-to-Speech, to deliver dynamic lessons, interactive Q&A, and comprehensive quiz evaluations.

## ✨ Features

*   **User Authentication:** Secure sign-up and login using Firebase Authentication (Email/Password, Google Sign-In).
*   **Interactive Lessons:**
    *   Engaging lesson content with rich text and clear, high-quality audio.
    *   AI-powered Q&A: Users can ask questions related to the lesson content and receive instant, context-aware answers.
*   **Dynamic Quizzes:**
    *   Quizzes with various question types (e.g., Multiple Choice, Open-ended).
    *   Automated quiz evaluation providing scores and constructive feedback.
*   **High-Quality Audio:** Lesson audio generated using the **Kokoro TTS model**, known for its high clarity and natural-sounding voice, enhancing the learning experience.
*   **Responsive Design:** User interface built with Tailwind CSS for a seamless experience across devices.

## 🛠️ Tech Stack

*   **Frontend:**
    *   React (with Vite for build tooling)
    *   Tailwind CSS
*   **Backend:**
    *   Node.js
    *   Express.js
*   **Firebase Suite:**
    *   **Authentication:** For user management.
    *   **Firestore:** As the primary database for lessons, user data, quiz results, etc.
    *   **Storage:** For hosting audio files, images, and other lesson-related assets.
*   **AI & Machine Learning:**
    *   **Google Gemini API:** Powers the interactive Q&A within lessons and provides intelligent evaluation for quiz submissions.
    *   **Kokoro TTS Model:** Used for generating high-quality, clear, and engaging audio for lessons.
*   **Development Environment:**
    *   Vite's dev server with proxy for backend API calls during development.

## 🚀 Implementation Highlights

*   **Client-Side (React & Vite):**
    *   The frontend, built with React, manages the user interface, application state, and all user interactions.
    *   Vite ensures a fast development experience and optimized builds.
    *   Securely consumes Firebase services for authentication, database operations (Firestore), and file storage using environment variables (`VITE_` prefixed) managed via `.env` files.
    *   Communicates with the backend server for AI-driven features like Q&A and quiz evaluations. `axios` is used for making API requests, configured with a base URL from environment variables for flexibility between development and production.
*   **Server-Side (Node.js & Express.js):**
    *   The backend server acts as a secure gateway to the Google Gemini API, protecting sensitive API keys.
    *   It handles business logic, including:
        *   Constructing detailed prompts for the Gemini API to ensure accurate and relevant responses for lesson Q&A.
        *   Processing quiz submissions: It takes user answers and question data, formats a comprehensive prompt for the Gemini API, and then parses the AI's JSON response to extract scores and feedback (including robust parsing that handles potential markdown wrappers around the JSON).
    *   Exposes RESTful APIs for the client application.
*   **Firebase Integration (`firebaseConfig.js`):**
    *   Centralized Firebase initialization for Auth, Firestore, and Storage.
    *   Client-side configuration is securely managed using Vite's environment variables, ensuring API keys are not hardcoded directly in the source visible in public repositories (when `.env` is gitignored).
*   **Google Gemini API Usage (e.g., `quizController.js`):**
    *   The backend crafts specific prompts for the Gemini model (e.g., `gemini-2.0-flash`) to evaluate quiz answers, requesting structured JSON output for scores and feedback. This involves detailing the question, user's answer, correct answer/explanation, and desired output format.
*   **Kokoro TTS for Audio:**
    *   The high-clarity Kokoro TTS model is utilized to generate the audio content for lessons. This provides a professional and pleasant listening experience, making the content more accessible and engaging.

## 🌱 Future Refinements & Roadmap

We aim to continuously enhance Spacey with the following improvements:

*   **Synchronized Text Highlighting:**
    *   Implement a feature similar to YouTube's auto-captions or Spotify's lyrics view, where the lesson text highlights in real-time as the Kokoro TTS audio plays. This will significantly improve user engagement and comprehension.
*   **Advanced Admin Dashboard:**
    *   Develop a comprehensive admin panel for content creators (teachers/admins) to:
        *   Easily create, update, and manage lessons, topics, and quizzes.
        *   View user progress and analytics.
        *   Manage user accounts and roles.
*   **Seamless TTS Deployment & Management:**
    *   Deploy the Kokoro TTS model as a scalable microservice or integrate a robust cloud-based TTS solution.
    *   This will enable dynamic, on-demand audio generation for new or updated content, streamlining the content creation process for admins/teachers and ensuring consistent audio quality for students.
*   **Personalized Learning Paths:**
    *   Leverage AI to analyze student performance on quizzes and interactions to suggest personalized learning paths, review materials, or adaptive content.
*   **Enhanced Interactive Elements:**
    *   Introduce more varied interactive components within lessons beyond Q&A.
*   **Community & Collaboration:**
    *   Features for students to discuss lessons or ask questions to a wider community or instructors.


