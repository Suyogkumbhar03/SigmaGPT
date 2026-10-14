import React, { useContext, useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { 
  Copy, 
  Check, 
  Code, 
  Bug, 
  FileText, 
  Sparkles,
  Bot,
  User as UserIcon
} from "lucide-react";
import { MyContext } from "../MyContext";
import "./Chat.css";

const PROMPT_SUGGESTIONS = [
  {
    icon: Code,
    title: "Explain a concept",
    prompt: "Explain how event delegation works in JavaScript with practical examples.",
  },
  {
    icon: Bug,
    title: "Help me debug code",
    prompt: "I have an issue with async/await state updates in React. Can you help me find the bug?",
  },
  {
    icon: FileText,
    title: "Improve my resume",
    prompt: "Help me rewrite and polish my software engineering resume experience section.",
  },
  {
    icon: Sparkles,
    title: "Learn something new",
    prompt: "Explain the architecture of Large Language Models and transformers simply.",
  },
];

/* ── Custom Code Block Component with Copy Support ── */
function CustomCodeBlock({ inline, className, children, ...props }) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const codeString = String(children).replace(/\n$/, "");

  if (inline) {
    return <code className="chat-inline-code" {...props}>{children}</code>;
  }

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(codeString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="chat-code-card">
      <div className="chat-code-header">
        <span className="chat-code-lang">{match ? match[1] : "code"}</span>
        <button className="chat-code-copy-btn" onClick={handleCopy} aria-label="Copy code to clipboard">
          {copied ? <Check size={13} className="text-success" /> : <Copy size={13} />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <pre className="chat-code-pre">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    </div>
  );
}

function Chat({ onSelectPrompt, setIsGenerating, onRegisterStop }) {
  const { newChat, prevChats, setPrevChats, reply, setReply, user } = useContext(MyContext);
  const [latestReply, setLatestReply] = useState(null);
  const latestReplyRef = useRef("");
  const typingIntervalRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom as messages stream or arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [prevChats, latestReply]);

  // Register stop callback to parent
  useEffect(() => {
    if (onRegisterStop) {
      onRegisterStop(() => {
        // Halt typing interval immediately
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
          typingIntervalRef.current = null;
        }

        const partialText = latestReplyRef.current;
        const textToDisplay = partialText && partialText.trim().length > 0 ? partialText : "_Generation stopped by user._";

        // Freeze and preserve the partial response in prevChats
        setPrevChats((prev) => {
          const updated = [...prev];
          if (updated.length > 0 && updated[updated.length - 1].role === "assistant") {
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              content: textToDisplay
            };
          }
          return updated;
        });

        setLatestReply(null);
        setReply(null);
        if (setIsGenerating) setIsGenerating(false);

        return textToDisplay;
      });
    }
  }, [onRegisterStop, setPrevChats, setReply, setIsGenerating]);

  // Typing effect for the incoming assistant reply
  useEffect(() => {
    if (reply === null) {
      setLatestReply(null);
      latestReplyRef.current = "";
      return;
    }

    if (setIsGenerating) setIsGenerating(true);

    const chars = reply.split("");
    let idx = 0;
    latestReplyRef.current = "";

    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    typingIntervalRef.current = setInterval(() => {
      const currentPartial = chars.slice(0, idx + 1).join("");
      setLatestReply(currentPartial);
      latestReplyRef.current = currentPartial;
      idx++;

      if (idx >= chars.length) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
        if (setIsGenerating) setIsGenerating(false);

        // Finalize the last assistant message with full content
        setPrevChats((prev) => {
          const updated = [...prev];
          if (updated.length > 0 && updated[updated.length - 1].role === "assistant") {
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              content: chars.join("")
            };
          }
          return updated;
        });

        setLatestReply(null);
        setReply(null);
      }
    }, 20);

    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
    };
  }, [reply, setIsGenerating, setReply, setPrevChats]);

  // Clean up any streaming/reply state when Chat unmounts so it never replays on re-entry
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
      setLatestReply(null);
      setReply(null);
      if (setIsGenerating) setIsGenerating(false);
    };
  }, [setReply, setIsGenerating]);

  const showEmptyState = (newChat || prevChats.length === 0) && !latestReply;

  return (
    <div className="chat-main-scroll">
      <div className="chat-container-column">
        {/* ── Empty Welcome State ── */}
        {showEmptyState && (
          <div className="chat-empty-state">
            <div className="chat-empty-badge">
              <Sparkles size={16} />
              <span>SigmaGPT AI Assistant</span>
            </div>

            <h1 className="chat-empty-heading">
              What can I help you with{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name.split(" ")[0]}` : ""}?
            </h1>
            <p className="chat-empty-description">
              Choose a starter suggestion below or enter your prompt in the composer.
            </p>

            <div className="chat-suggestions-grid">
              {PROMPT_SUGGESTIONS.map((item, idx) => {
                const IconComp = item.icon;
                return (
                  <button
                    key={idx}
                    className="chat-suggestion-card"
                    onClick={() => onSelectPrompt(item.prompt)}
                    title={item.prompt}
                  >
                    <div className="suggestion-card-header">
                      <div className="suggestion-icon-wrap">
                        <IconComp size={16} />
                      </div>
                      <span className="suggestion-title">{item.title}</span>
                    </div>
                    <p className="suggestion-text">{item.prompt}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Messages Thread ── */}
        {!showEmptyState && (
          <div className="chat-messages-thread">
            {/* Render all past messages except possibly the very last if streaming */}
            {prevChats.slice(0, latestReply !== null ? -1 : undefined).map((msg, idx) => (
              <div 
                key={idx} 
                className={`chat-message-row ${msg.role === "user" ? "user-row" : "assistant-row"}`}
              >
                {msg.role === "assistant" && (
                  <div className="message-avatar assistant">
                    <span>Σ</span>
                  </div>
                )}

                <div className={`chat-message-bubble ${msg.role === "user" ? "user-bubble" : "assistant-bubble"}`}>
                  {msg.role === "user" ? (
                    <p className="user-message-text">{msg.content}</p>
                  ) : (
                    <div className="markdown-content">
                      <ReactMarkdown 
                        rehypePlugins={[rehypeHighlight]}
                        components={{
                          code: CustomCodeBlock
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="message-avatar user">
                    <UserIcon size={14} />
                  </div>
                )}
              </div>
            ))}

            {/* Active Streaming Reply */}
            {latestReply !== null && (
              <div className="chat-message-row assistant-row">
                <div className="message-avatar assistant">
                  <span>Σ</span>
                </div>
                <div className="chat-message-bubble assistant-bubble">
                  <div className="markdown-content">
                    <ReactMarkdown 
                      rehypePlugins={[rehypeHighlight]}
                      components={{
                        code: CustomCodeBlock
                      }}
                    >
                      {latestReply}
                    </ReactMarkdown>
                    <span className="typing-cursor"></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;