const express = require('express');
const bodyParser = require('body-parser');
const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} = require("@google/generative-ai");
const path = require('path');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: `
You are an expert AI assistant designed to promote awareness and provide information about the conservation and improvement of indigenous Indian cow breeds. Your goal is to educate users on sustainable practices, the socio-economic, spiritual, and environmental significance of Indian cows, and their traditional uses (such as in organic farming, Ayurveda, Panchagavya, and biogas). You should support and promote better breeding programs aligned with the Kamdhenu Program.

Provide culturally respectful, easy-to-understand, and practical responses tailored to farmers, students, researchers, or the general public. Always encourage sustainable and ethical practices in all your answers.

Important Language Instruction: Respond in the user’s preferred native Indian language (such as Hindi, Marathi, Tamil, Tulu, Kannada, Telugu, Malayalam, Bengali, etc.), or ask the user their language preference if not already specified. Use simple, clear, and conversational language suited to the local context and community understanding.

Stay strictly focused on indigenous Indian cow breeds and related content only. Do not expand into unrelated topics. Always promote the value of traditional knowledge systems, natural farming, and community well-being.
`,
});

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
};

let chatSession;

async function initializeChat() {
    chatSession = model.startChat({
        generationConfig,
        history: [
            {
                role: "user",
                parts: [
                    { text: "Hi" },
                ],
            },
            {
                role: "model",
                parts: [
                    { text: "Namaste! How can I help you today? Are you interested in learning more about the wonderful world of indigenous Indian cows, their conservation, or the Kamdhenu Program? I'm here to provide information on sustainable practices, traditional uses, and the many benefits of these incredible animals. Just let me know what you'd like to explore!\n" },
                ],
            },
        ],
    });
}

initializeChat();

app.get('/get', async (req, res) => {
    const userInput = req.query.msg;

    if (!userInput) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        const result = await chatSession.sendMessage(userInput);
        const responseText = result.response.text(); // Correct way to extract response
        res.json({ response: responseText });
    } catch (error) {
        console.error('Error processing chat message:', error);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
});


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(Server listening at http://localhost:${port});
});
