// e:\placement\Spacey\project\v1\server\controllers\learnController.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Ensure you have your GEMINI_API_KEY in your environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Model configuration - you can adjust this as needed
const learnModel = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash", // Or "gemini-1.5-flash-latest" for potentially faster, shorter responses
    generationConfig: {
        // maxOutputTokens: 150, // Example: Limit response length if needed
        // temperature: 0.7,    // Adjust for creativity vs. factuality
    }
});

const handleLearnQuery = async (req, res) => {
    const { query, lessonContext } = req.body;

    if (!query) {
        return res.status(400).json({ message: "Missing query in the request." });
    }

    console.log("Received learn query:", query);
    if (lessonContext) {
        console.log("Lesson Context:", lessonContext);
    }

    try {
        // Construct a prompt for Gemini
        // We're guiding the AI to be a helpful, simple, and concise space educator
        const prompt = `You are an AI assistant for a space education platform. 
A student is currently learning about: "${lessonContext || 'general space topics'}".
The student has the following question: "${query}"
Please provide a simple, clear, and short answer suitable for a learner. 
Focus on explaining the core concept directly related to the question and context.`;

        const result = await learnModel.generateContent(prompt);
        const response = await result.response;
        const aiAnswer = response.text();

        res.status(200).json({
            answer: aiAnswer,
            userQuery: query, // It's good practice to send back the original query
        });

    } catch (error) {
        console.error("Error processing learn query with Gemini:", error);
        // Check for specific Gemini API errors if available, or provide a general message
        if (error.response && error.response.data) {
            console.error("Gemini API Error details:", error.response.data);
        }
        res.status(500).json({ message: "An error occurred while I was trying to understand your question. Please try again." });
    }
};

module.exports = {
    handleLearnQuery,
};
