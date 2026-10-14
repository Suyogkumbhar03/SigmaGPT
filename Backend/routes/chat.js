import express from 'express';
import Thread from '../models/Thread.js';
import getOpenAIAPIResponse from "../utils/openai.js";

const router = express.Router();

// Fetch threads for a specific user (isolated per login)
router.get("/thread", async (req, res) => {
    const userId = req.query.userId || req.headers['x-user-id'];
    try {
        // Isolate history: Only return threads belonging to this specific user or guest session
        const filter = userId ? { userId } : { userId: "guest" };
        const thread = await Thread.find(filter).sort({ updatedAt: -1 });
        res.send(thread);
    } catch (err) {
        console.error("Failed to fetch threads:", err);
        res.status(500).json({ error: "failed to fetch threads" });
    }
});

// Fetch messages for a specific thread
router.get("/thread/:threadId", async (req, res) => {
    const { threadId } = req.params;
    try {
        const thread = await Thread.findOne({ threadId });
        if (!thread) {
            return res.status(404).json({ error: "thread is not found" });
        }
        res.json(thread.messages);
    } catch (err) {
        console.error("Failed to fetch chat:", err);
        res.status(500).json({ error: "failed to fetch chat" });
    }
});

// Delete a thread
router.delete("/thread/:threadId", async (req, res) => {
    const { threadId } = req.params;
    try {
        const deleteThread = await Thread.findOneAndDelete({ threadId });
        if (!deleteThread) {
            return res.status(404).json({ error: "thread not found" });
        }
        res.status(200).json({ message: "thread deleted successfully" });
    } catch (err) {
        console.error("Failed to delete chat:", err);
        res.status(500).json({ error: "failed to delete chat" });
    }
});

// Update the last assistant message in a thread (used when user halts generation mid-stream)
router.put("/thread/:threadId/last-message", async (req, res) => {
    const { threadId } = req.params;
    const { content } = req.body;
    try {
        const thread = await Thread.findOne({ threadId });
        if (!thread) {
            return res.status(404).json({ error: "thread not found" });
        }
        if (thread.messages && thread.messages.length > 0) {
            const lastMsg = thread.messages[thread.messages.length - 1];
            if (lastMsg.role === "assistant") {
                lastMsg.content = content;
                thread.updatedAt = new Date();
                await thread.save();
            }
        }
        res.status(200).json({ message: "last message updated successfully" });
    } catch (err) {
        console.error("Failed to update last message:", err);
        res.status(500).json({ error: "failed to update last message" });
    }
});

// Send message & generate AI response (stores userId on the thread)
router.post("/chat", async (req, res) => {
    const { threadId, message, userId } = req.body;

    if (!threadId || !message) {
        return res.status(400).json({ error: "missing required fields" });
    }

    try {
        let thread = await Thread.findOne({ threadId });
        if (!thread) {
            // Create new thread in DB with the owner's userId
            thread = new Thread({
                userId: userId || "guest",
                threadId,
                title: message,
                messages: [{ role: "user", content: message }]
            });
        } else {
            // Update thread owner if previously guest and user is now authenticated
            if (userId && (!thread.userId || thread.userId === "guest")) {
                thread.userId = userId;
            }
            thread.messages.push({ role: "user", content: message });
        }

        // Send recent conversation history (excluding the new user prompt) to provide full context
        const priorHistory = thread.messages.slice(0, -1).slice(-8);
        const assistantReply = await getOpenAIAPIResponse(message, priorHistory);

        thread.messages.push({ role: "assistant", content: assistantReply });
        thread.updatedAt = new Date();

        await thread.save();
        res.json({ reply: assistantReply });

    } catch (err) {
        console.error("Chat error in /api/chat:", err);
        res.status(500).json({ error: "something went wrong" });
    }
});

export default router;