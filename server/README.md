# Spacey - Backend API Server

This server provides the backend logic and API endpoints for the Spacey learning platform. It primarily handles AI-powered interactions by communicating with the Google Gemini API.

## ✨ Core Functionality

*   Acts as a secure intermediary between the client application and the Google Gemini API.
*   Processes user queries and lesson context to generate relevant AI responses.
*   Handles quiz submissions and leverages AI for evaluation and feedback.
*   Manages sensitive API keys, ensuring they are not exposed to the client-side.

## 🛠️ Tech Stack

*   **Node.js**
*   **Express.js**
*   **Google Gemini API** (via `@google/generative-ai` SDK)


## 🤖 Google Gemini API Integration

The server integrates with the Google Gemini API to provide intelligent features:

1.  **Secure API Key Management:** The `GEMINI_API_KEY` is stored as an environment variable on the server and is never exposed to the client.
2.  **Prompt Engineering:** For each API call (e.g., `/api/learn/query`, `/api/quiz`), the server constructs a carefully designed prompt. This prompt includes the user's input, relevant context (like lesson material or quiz question details), and instructions for the Gemini model to generate the desired output format (e.g., a direct answer, or structured JSON for quiz evaluations).
3.  **Request Handling:** The server sends the composed prompt to the appropriate Gemini model endpoint.
4.  **Response Parsing:** Upon receiving a response from Gemini, the server parses it. For Q&A, it might extract the textual answer. For quizzes, it parses the structured JSON containing scores and feedback, potentially handling variations like markdown code blocks around the JSON.
5.  **Client Response:** The processed information is then sent back to the client application in a usable format.


## ⚙️ Environment Variables

The following environment variables are required to run the server:

*   `PORT`: The port on which the server will listen (e.g., `5000`).
*   `GEMINI_API_KEY`: Your API key for accessing the Google Gemini API.
*   `CLIENT_URL`: The URL of the client application (e.g., `http://localhost:5173`). This is used for CORS configuration to allow requests from your frontend.