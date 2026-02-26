const { OpenAI } = require('openai');
const { HfInference } = require('@huggingface/inference');
const { Pinecone } = require('@pinecone-database/pinecone');
const User = require('../models/User');
const Chat = require('../models/Chat');

// OpenRouter explicitly requires the OpenAI SDK but pointed at their endpoint
const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
        "HTTP-Referer": process.env.CLIENT_URL || "http://localhost:3000",
        "X-Title": "GrowthEdge AI Assistant",
    }
});

// Using Hugging Face for Free Embeddings (matching ingestion side)
const hf = new HfInference(process.env.HF_TOKEN);
const embeddingModel = process.env.EMBEDDING_MODEL || 'BAAI/bge-m3';

// Vector Library Database
const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
});

const generateChatResponse = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user._id;

        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }

        const indexName = process.env.PINECONE_INDEX_NAME;
        const index = pc.Index(indexName);

        // 1. Vector Search: Convert user query to vector using Hugging Face
        const queryVector = await hf.featureExtraction({
            model: embeddingModel,
            inputs: message,
        });

        // 2. Query Pinecone for Top 5 matches
        const searchResults = await index.query({
            topK: 5,
            vector: queryVector,
            includeMetadata: true,
        });

        let contextText = '';
        let isLowConfidence = false;

        // Parse the relevant text chunks
        if (searchResults.matches && searchResults.matches.length > 0) {
            console.log(`🔎 Vector Search: Top score is ${searchResults.matches[0].score} for query: "${message}"`);

            // Check top score for fallback logic - Lowered to 0.4 to be more inclusive
            if (searchResults.matches[0].score < 0.3) {
                isLowConfidence = true;
                console.log(`⚠️ Subtle match (below 0.3). Using natural fallback.`);
            }

            searchResults.matches.forEach((match) => {
                if (match.metadata && match.metadata.text) {
                    contextText += `\n\n${match.metadata.text}`;
                }
            });
        } else {
            isLowConfidence = true;
        }

        // 3. System Prompt & Context Injection (Invisible & Natural)
        // We always provide the context, but we adjust the instruction based on confidence.
        let systemPrompt = `You are the GrowthEdge Executive Assistant. You are highly intelligent, professional, and possess deep internal knowledge of GrowthEdge's business strategies.

YOUR VOICE:
- Speak as if you naturally know everything in the context below. 
- ALWAYS prioritize the information in the KNOWLEDGE BASE below.
- If the user asks for "Our Services", provide the exact list found in the context (Business Growth Strategy, Digital Marketing, etc.).
- NEVER mention "files", "documents", "context", "internal data", or "the provided text".
- Do not say "Based on what I have available..." — just answer directly.
- Be concise, confident, and executive-level.

KNOWLEDGE BASE:
${contextText || "No internal data found for this query."}`;

        if (isLowConfidence) {
            systemPrompt += `\n\nFallback: If specific facts are missing, answer using deep business logic while maintaining the GrowthEdge brand voice.`;
        }

        // Target whichever model user passed or default to a free one
        const chatModel = process.env.CHAT_MODEL || 'stepfun/step-3.5-flash:free';

        const completion = await openai.chat.completions.create({
            model: chatModel,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: message }
            ],
            temperature: 0.3, // keep it grounded to the context
        });

        const aiReply = completion.choices[0].message.content;

        // 4. Update the User's Usage Count
        await User.findByIdAndUpdate(userId, {
            $inc: { messageCount: 1 }
        });

        // 5. Save the Chat History in DB
        let chatRecord = await Chat.findOne({ userId });

        if (!chatRecord) {
            chatRecord = new Chat({ userId, messages: [] });
        }

        chatRecord.messages.push({ role: 'user', content: message });
        chatRecord.messages.push({ role: 'assistant', content: aiReply });
        await chatRecord.save();

        res.status(200).json({
            reply: aiReply,
            // Sources removed for Invisible Retrieval phase
        });

    } catch (error) {
        console.error('🚨 Error generating chat response via hybrid OpenRouter/HF:', error);
        res.status(500).json({ message: 'Failed to process AI chat via free models.', error: error.message });
    }
};

module.exports = {
    generateChatResponse,
};
