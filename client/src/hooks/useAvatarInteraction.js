import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

// Get the API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useAvatarInteraction = (lessonContext) => {
  const [userQuery, setUserQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAIResponseLoading, setIsAIResponseLoading] = useState(false);
  const [aiQueryError, setAiQueryError] = useState('');

  const [isListening, setIsListening] = useState(false);
  const [speechRecognitionError, setSpeechRecognitionError] = useState('');
  const [recognitionInstance, setRecognitionInstance] = useState(null);
  const isRecognitionSupported = !!SpeechRecognition;

  useEffect(() => {
    if (isRecognitionSupported) {
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = false;
      recog.lang = 'en-US';
      setRecognitionInstance(recog);
    }
  }, [isRecognitionSupported]);

  const sendQuery = useCallback(async (queryText) => {
    if (!queryText.trim()) return;
    setUserQuery(queryText);
    setIsAIResponseLoading(true);
    setAiResponse('');
    setAiQueryError('');
    try {
      const response = await axios.post(`${API_BASE_URL}/api/learn/query`, {
        query: queryText,
        lessonContext: lessonContext || "General knowledge",
      });
      setAiResponse(response.data.answer);
    } catch (error) {
      console.error("Error querying AI:", error);
      const message = error.response?.data?.message || "Sorry, I couldn't process your question.";
      setAiResponse(message);
      setAiQueryError(message);
    } finally {
      setIsAIResponseLoading(false);
    }
  }, [lessonContext]);

  useEffect(() => {
    if (!recognitionInstance) return;

    const handleResult = (event) => sendQuery(event.results[0][0].transcript);
    const handleError = (event) => {
      console.error('Speech recognition error:', event.error);
      setSpeechRecognitionError(`Speech error: ${event.error}`);
    };
    const handleEnd = () => setIsListening(false);

    recognitionInstance.addEventListener('result', handleResult);
    recognitionInstance.addEventListener('error', handleError);
    recognitionInstance.addEventListener('end', handleEnd);
    return () => {
      recognitionInstance.removeEventListener('result', handleResult);
      recognitionInstance.removeEventListener('error', handleError);
      recognitionInstance.removeEventListener('end', handleEnd);
      recognitionInstance.abort();
    };
  }, [recognitionInstance, sendQuery]);

  const startVoiceListening = useCallback(() => {
    if (recognitionInstance && !isListening && !isAIResponseLoading) {
      setUserQuery(''); setAiResponse(''); setSpeechRecognitionError('');
      setIsListening(true);
      try {
        recognitionInstance.start();
      } catch (e) {
        console.error("Error starting recognition:", e);
        setSpeechRecognitionError('Could not start voice recognition.');
        setIsListening(false);
      }
    }
  }, [recognitionInstance, isListening, isAIResponseLoading]);

  return {
    userQuery, aiResponse, isAIResponseLoading, aiQueryError,
    startVoiceListening, isListening, speechRecognitionError, isRecognitionSupported,
    handleSendTextQuery: sendQuery, // Re-use sendQuery for text
  };
};
