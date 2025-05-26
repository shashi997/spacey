const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize the Google Generative AI client
// Ensure your GEMINI_API_KEY is set in your .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Or your preferred model

const submitQuizAndGetFeedback = async (req, res) => {
    const { lessonSlug, questions, userAnswers } = req.body;

    if (!questions || !userAnswers) {
        return res.status(400).json({ message: "Missing questions or userAnswers in the request." });
    }

    try {
        // 1. Construct the prompt for the AI
        let prompt = `You are an AI quiz evaluator. Evaluate the following quiz submission for the lesson "${lessonSlug}".
For each question, I will provide the question text, its type, the user's answer, and the correct answer or explanation.
Please provide an overall score (as an integer out of 100) and constructive feedback for the user.

Here is the quiz data:
`;

        questions.forEach((question, index) => {
            prompt += `\n--- Question ${index + 1} ---\n`;
            prompt += `Text: ${question.text}\n`;
            prompt += `Type: ${question.type}\n`;

            const userAnswer = userAnswers[question.id];
            let userAnswerText = "Not answered";

            if (question.type === 'mcq') {
                const selectedOption = question.options.find(opt => opt.id === userAnswer);
                userAnswerText = selectedOption ? selectedOption.text : "Invalid option selected or not answered";

                const correctOption = question.options.find(opt => opt.isCorrect);
                prompt += `User's Answer: ${userAnswerText}\n`;
                prompt += `Correct Answer: ${correctOption ? correctOption.text : "N/A"}\n`;
                prompt += `Explanation: ${question.explanation}\n`;
            } else { // 'normal' question type
                userAnswerText = userAnswer || "Not answered";
                prompt += `User's Answer: ${userAnswerText}\n`;
                prompt += `Expected Answer/Guidance: ${question.explanation}\n`;
            }
        });

        prompt += `\nBased on this submission, please provide your evaluation strictly in the following JSON format:
{
  "score": <integer_score_out_of_100>,
  "feedback": "<string_feedback_for_the_user>"
}
Do not include any other text or markdown formatting outside of this JSON structure.`;

        console.log("Generated Prompt for AI:\n", prompt); // For debugging

        // 2. Send to Gemini AI
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const aiTextResponse = response.text();

        console.log("AI Raw Response:\n", aiTextResponse); // For debugging

        // 3. Parse the AI's response
        let aiEvaluation;
        let jsonStringToParse = aiTextResponse.trim(); // Trim leading/trailing whitespace

        // Check if the response is wrapped in markdown ```json ... ``` and extract content
        const jsonMatch = jsonStringToParse.match(/^```json\s*([\s\S]*?)\s*```$/m);
        if (jsonMatch && jsonMatch[1]) {
            jsonStringToParse = jsonMatch[1].trim(); // Use the extracted content and trim it
            console.log("Extracted JSON string from markdown:", jsonStringToParse);
        } else {
            // Optional: Log if no markdown was found, indicating direct JSON (or malformed)
            console.log("No JSON markdown detected, attempting to parse raw response as is (after trim).");
        }

        try {
            aiEvaluation = JSON.parse(jsonStringToParse);
        } catch (parseError) {
            console.error("Error parsing final AI JSON string:", parseError);
            console.error("String that failed to parse:", jsonStringToParse); // Log the problematic string
            return res.status(500).json({
                message: "Failed to parse AI response. The AI did not return valid JSON.",
                rawResponse: aiTextResponse, // Send the original raw response for debugging
                attemptedToParse: jsonStringToParse
            });
        }

        if (!aiEvaluation || typeof aiEvaluation.score === 'undefined' || typeof aiEvaluation.feedback === 'undefined') {
            return res.status(500).json({ message: "AI response did not contain score and feedback in the expected structure.", aiResponse: aiEvaluation, rawResponse: aiTextResponse });
        }

        // 4. Send response back to client
        res.status(200).json({
            score: aiEvaluation.score,
            feedback: aiEvaluation.feedback,
            userAnswers: userAnswers, // Include original user answers for the client
        });

    } catch (error) {
        console.error("Error processing quiz submission with AI:", error);
        if (error.message.includes("API key not valid")) {
             return res.status(500).json({ message: "AI API key is invalid or missing. Please check server configuration." });
        }
        res.status(500).json({ message: "An error occurred while evaluating the quiz with AI." });
    }
};

module.exports = {
    submitQuizAndGetFeedback,
};