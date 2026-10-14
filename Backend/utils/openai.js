import "dotenv/config";

const SYSTEM_PROMPT = `You are SigmaGPT, an intelligent, modern AI assistant designed for clarity, accuracy, and conciseness.
Strict Response Guidelines:
1. Be direct and concise. Avoid unnecessary introductory filler (e.g. "Certainly!", "Sure, I can help you with that!", "Here is a breakdown..."), conversational pleasantries, and redundant concluding summaries.
2. Answer the user's specific request directly. Do NOT provide unsolicited long background essays or excessive explanations unless the user explicitly asks for in-depth analysis.
3. For programming/technical queries: provide clean, working, modern code first, followed only by brief bullet points explaining essential logic. Do not write filler commentary.
4. Format all responses cleanly using standard Markdown with appropriate syntax highlighting.`;

const getOpenAIAPIResponse = async (message, history = []) => {
    // Format prior conversation turns (sanitize roles and content)
    const formattedHistory = Array.isArray(history) 
        ? history
            .filter(msg => msg && msg.content && (msg.role === "user" || msg.role === "assistant"))
            .map(msg => ({
                role: msg.role === "assistant" ? "assistant" : "user",
                content: msg.content
            }))
        : [];

    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`
        },
        body: JSON.stringify({
            model: 'openrouter/free',
            messages: [
                {
                    role: 'system',
                    content: SYSTEM_PROMPT
                },
                ...formattedHistory,
                {
                    role: 'user',
                    content: message
                }
            ],
            temperature: 0.6
        })
    };
    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", options);
        const data = await response.json();
        
        if (data?.choices?.[0]?.message?.content) {
            return data.choices[0].message.content;
        }
        
        if (data?.error?.message) {
            console.error("OpenRouter error message:", data.error.message);
            return `AI Service Note: ${data.error.message}`;
        }

        return "I could not generate a response at this moment. Please try again.";
    }
    catch (err) {
        console.error("OpenRouter API fetch error:", err);
        throw err;
    }
}

export default getOpenAIAPIResponse;