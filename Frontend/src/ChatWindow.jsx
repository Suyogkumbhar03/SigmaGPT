import React, { useContext, useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowUp, 
  Menu, 
  Sun, 
  Moon, 
  Settings as SettingsIcon, 
  User as UserIcon, 
  LogOut, 
  X, 
  Check, 
  Sparkles, 
  Shield, 
  Layers, 
  ChevronDown,
  Lock,
  ArrowRight,
  Square
} from "lucide-react";
import { RingLoader } from "react-spinners";
import Chat from "./Chat";
import { MyContext } from "../MyContext.jsx";
import { supabase } from "./supabaseClient";
import "./ChatWindow.css";

function ChatWindow({ isSettingsOpen, setIsSettingsOpen }) {
  const navigate = useNavigate();
  const {
    prompt,
    setPrompt,
    reply,
    setReply,
    currThreadId,
    prevChats,
    setPrevChats,
    setNewChat,
    theme,
    setTheme,
    setSidebarOpen,
    user,
    setAllThreads,
    guestCredits,
    setGuestCredits
  } = useContext(MyContext);

  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState("Sigma-4 Turbo");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const textareaRef = useRef(null);
  const abortControllerRef = useRef(null);
  const stopTypingRef = useRef(null);

  const handleStopGeneration = useCallback(async () => {
    // 1. If network request is still pending, abort it
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // 2. If typing effect is active, stop it immediately and capture the partial text generated so far
    let partialText = null;
    if (stopTypingRef.current) {
      partialText = stopTypingRef.current();
    }

    setLoading(false);
    setIsGenerating(false);

    // 3. Persist whatever partial text was generated to the thread in DB
    if (partialText && currThreadId) {
      try {
        const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
        await fetch(`${BACKEND_URL}/api/thread/${currThreadId}/last-message`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: partialText }),
        });
      } catch (err) {
        console.warn("Could not sync partial message to backend:", err);
      }
    }
  }, [currThreadId]);

  const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
  const LAST_ACTIVE_KEY = "sigma_last_active";

  const handleLogout = useCallback(async () => {
    setAllThreads([]);
    setPrevChats([]);
    await supabase.auth.signOut();
    localStorage.removeItem(LAST_ACTIVE_KEY);
    window.location.href = "/";
  }, [setAllThreads, setPrevChats]);

  const updateActivity = useCallback(() => {
    localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
  }, []);

  // Inactivity tracking (for authenticated users)
  useEffect(() => {
    if (!user) return;
    updateActivity();

    const checkSession = () => {
      const raw = localStorage.getItem(LAST_ACTIVE_KEY);
      if (!raw) {
        updateActivity();
        return;
      }
      const lastActive = parseInt(raw, 10);
      if (isNaN(lastActive) || Date.now() - lastActive > SESSION_TIMEOUT_MS) {
        handleLogout();
      } else {
        updateActivity();
      }
    };

    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach((e) => window.addEventListener(e, updateActivity));
    window.addEventListener("focus", checkSession);

    const interval = setInterval(() => {
      const raw = localStorage.getItem(LAST_ACTIVE_KEY);
      if (!raw) {
        updateActivity();
        return;
      }
      const lastActive = parseInt(raw, 10);
      if (isNaN(lastActive) || Date.now() - lastActive > SESSION_TIMEOUT_MS) {
        handleLogout();
      }
    }, 60 * 1000);

    return () => {
      events.forEach((e) => window.removeEventListener(e, updateActivity));
      window.removeEventListener("focus", checkSession);
      clearInterval(interval);
    };
  }, [user, handleLogout, updateActivity]);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  // Google OAuth sign in from the Trial Modal
  const handleGoogleSignIn = async () => {
    if (oauthLoading) return;
    setOauthLoading(true);
    sessionStorage.setItem("oauth_in_progress", "true");
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/chat`,
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Google login error:", err);
      alert("Failed to connect with Google: " + err.message);
      setOauthLoading(false);
    }
  };

  // Auto-resize textarea
  const handleInputChange = (e) => {
    setPrompt(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  };

  useEffect(() => {
    if (textareaRef.current && prompt === "") {
      textareaRef.current.style.height = "auto";
    }
  }, [prompt]);

  // Execute Send Message
  const getReply = async (customPrompt) => {
    const messageToSend = typeof customPrompt === "string" ? customPrompt : prompt;
    if (!messageToSend || !messageToSend.trim() || loading || isGenerating) return;

    // Check Guest Credits limit
    if (!user) {
      if (guestCredits <= 0) {
        setShowLoginModal(true);
        return;
      }
    }

    setLoading(true);
    setIsGenerating(true);
    setNewChat(false);
    if (currThreadId) {
      localStorage.setItem("sigma_active_thread_id", currThreadId);
      sessionStorage.removeItem("sigma_explicit_new_chat");
    }

    // Optimistically add the user message
    const currentPromptText = messageToSend.trim();
    setPrompt("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Decrement guest credit
    if (!user) {
      const nextCredits = Math.max(0, guestCredits - 1);
      setGuestCredits(nextCredits);
      localStorage.setItem("sigma_guest_credits", nextCredits.toString());
    }

    setPrevChats((prev) => [
      ...prev,
      { role: "user", content: currentPromptText }
    ]);

    const currentUserId = user ? (user.id || user.email) : (localStorage.getItem("sigma_guest_id") || "guest");
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          message: currentPromptText,
          threadId: currThreadId,
          userId: currentUserId,
        }),
      };

      const response = await fetch(`${BACKEND_URL}/api/chat`, options);
      const res = await response.json();
      
      const assistantText = res.reply || "No response received. Please check backend connection.";
      setLoading(false);

      // Append assistant placeholder into prevChats, then trigger typing effect via reply
      setPrevChats((prev) => [
        ...prev,
        { role: "assistant", content: "" }
      ]);
      setReply(assistantText);

      // If guest used their last prompt, open sign-in prompt after they get their answer
      if (!user && guestCredits - 1 <= 0) {
        setTimeout(() => {
          setShowLoginModal(true);
        }, 1600);
      }

      // Re-fetch threads for this specific user so newly created thread appears immediately
      try {
        const threadListRes = await fetch(`${BACKEND_URL}/api/thread?userId=${encodeURIComponent(currentUserId)}`);
        const threadsData = await threadListRes.json();
        if (Array.isArray(threadsData)) {
          setAllThreads(
            threadsData.map((t) => ({
              threadId: t.threadId,
              title: t.title || "Untitled Conversation",
              createdAt: t.createdAt,
              updatedAt: t.updatedAt,
            }))
          );
        }
      } catch (err) {
        console.error("Failed to refresh thread list:", err);
      }
    } catch (err) {
      if (err.name === "AbortError") {
        setPrevChats((prev) => [
          ...prev,
          { role: "assistant", content: "_Generation stopped by user._" }
        ]);
      } else {
        console.error("Chat error:", err);
        setPrevChats((prev) => [
          ...prev,
          { role: "assistant", content: "Error: Failed to connect to server. Please try again." }
        ]);
      }
      setIsGenerating(false);
    } finally {
      abortControllerRef.current = null;
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading && !isGenerating) {
        getReply();
      }
    }
  };

  const handleSelectPrompt = (promptText) => {
    getReply(promptText);
  };

  const isTrialExhausted = !user && guestCredits <= 0;

  return (
    <div className="chat-window-root">
      {/* ── Top Navigation Bar ── */}
      <header className="chat-topbar">
        <div className="chat-topbar-left">
          <button 
            className="chat-sidebar-toggle-btn" 
            onClick={() => setSidebarOpen((o) => !o)}
            title="Toggle sidebar"
            aria-label="Toggle sidebar"
          >
            <Menu size={18} />
          </button>

          {/* Model Selector Badge */}
          <div className="chat-model-badge-wrapper">
            <button 
              className="chat-model-badge"
              onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
              title="Select AI Model"
            >
              <Sparkles size={14} className="model-sparkle" />
              <span className="model-name">{selectedModel}</span>
              <ChevronDown size={12} className="model-chevron" />
            </button>

            {modelDropdownOpen && (
              <div className="chat-model-dropdown">
                <div 
                  className={`model-option ${selectedModel === "Sigma-4 Turbo" ? "active" : ""}`}
                  onClick={() => { setSelectedModel("Sigma-4 Turbo"); setModelDropdownOpen(false); }}
                >
                  <div className="model-option-text">
                    <span className="model-option-title">Sigma-4 Turbo</span>
                    <span className="model-option-desc">Fast, concise, ideal for coding and Q&A</span>
                  </div>
                  {selectedModel === "Sigma-4 Turbo" && <Check size={14} />}
                </div>

                <div 
                  className={`model-option ${selectedModel === "Sigma Reasoning" ? "active" : ""}`}
                  onClick={() => { setSelectedModel("Sigma Reasoning"); setModelDropdownOpen(false); }}
                >
                  <div className="model-option-text">
                    <span className="model-option-title">Sigma Reasoning</span>
                    <span className="model-option-desc">Step-by-step logic for complex architecture</span>
                  </div>
                  {selectedModel === "Sigma Reasoning" && <Check size={14} />}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: Guest Trial Status Pill */}
        {!user && (
          <div className="chat-guest-trial-pill">
            <Sparkles size={13} className="trial-pill-icon" />
            <span className="trial-pill-text">
              {guestCredits > 0 ? `${guestCredits}/3 Free Prompts Left` : "Free Trial Completed"}
            </span>
            <button 
              className="trial-pill-cta"
              onClick={() => setShowLoginModal(true)}
            >
              Sign In
            </button>
          </div>
        )}

        <div className="chat-topbar-right">
          <button 
            className="chat-theme-btn" 
            onClick={toggleTheme}
            title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {user ? (
            <>
              <button 
                className="chat-settings-nav-btn"
                onClick={() => setIsSettingsOpen(true)}
                title="Settings"
                aria-label="Open settings"
              >
                <SettingsIcon size={18} />
              </button>

              <div className="chat-user-menu-wrapper">
                <button 
                  className="chat-user-avatar-btn" 
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  title="User menu"
                  aria-label="User menu"
                >
                  {user?.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Profile" />
                  ) : (
                    <span className="avatar-initial">
                      {(user?.user_metadata?.full_name || user?.email || "U")[0].toUpperCase()}
                    </span>
                  )}
                </button>

                {profileDropdownOpen && (
                  <div className="chat-profile-dropdown">
                    <div className="profile-dropdown-user">
                      <span className="dropdown-user-name">
                        {user?.user_metadata?.full_name || "Sigma User"}
                      </span>
                      <span className="dropdown-user-email">
                        {user?.email || "user@sigmagpt.ai"}
                      </span>
                    </div>

                    <div className="dropdown-divider"></div>

                    <button 
                      className="dropdown-action-btn"
                      onClick={() => {
                        setIsSettingsOpen(true);
                        setProfileDropdownOpen(false);
                      }}
                    >
                      <SettingsIcon size={15} />
                      <span>Settings</span>
                    </button>

                    <button 
                      className="dropdown-action-btn logout" 
                      onClick={handleLogout}
                    >
                      <LogOut size={15} />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button 
              className="btn-primary" 
              style={{ padding: "6px 14px", fontSize: "0.825rem" }}
              onClick={() => setShowLoginModal(true)}
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* ── Main Chat Scroll Content ── */}
      <Chat 
        onSelectPrompt={handleSelectPrompt} 
        isGenerating={isGenerating}
        setIsGenerating={setIsGenerating}
        onRegisterStop={(stopFn) => {
          stopTypingRef.current = stopFn;
        }}
      />

      {/* Loading Indicator with Stop Action */}
      {(loading || isGenerating) && (
        <div className="chat-generating-indicator">
          <RingLoader color="var(--accent-primary)" size={20} />
          <span>{loading ? "Thinking..." : "SigmaGPT is typing..."}</span>
          <button 
            className="chat-stop-pill-btn"
            onClick={handleStopGeneration}
            title="Stop generating response"
            aria-label="Stop generating"
          >
            <Square size={11} fill="currentColor" />
            <span>Stop</span>
          </button>
        </div>
      )}

      {/* ── Accessible Message Composer ── */}
      <div className="chat-composer-container">
        {/* Trial banner if exhausted */}
        {isTrialExhausted && (
          <div className="chat-trial-exhausted-bar">
            <Lock size={14} />
            <span>Free trial limit reached (3/3). Sign in with Google to continue exploring with unlimited chats.</span>
            <button onClick={() => setShowLoginModal(true)}>Sign In</button>
          </div>
        )}

        <div className={`chat-composer-box ${isTrialExhausted ? "disabled" : ""}`}>
          <textarea
            ref={textareaRef}
            className="chat-composer-textarea"
            placeholder={
              isTrialExhausted 
                ? "Free trial limit reached. Sign in to continue..." 
                : (loading || isGenerating)
                  ? "SigmaGPT is typing... click Stop to freeze response"
                  : "Ask SigmaGPT anything... (Shift+Enter for new line)"
            }
            value={prompt}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={loading || isGenerating || isTrialExhausted}
            onClick={() => {
              if (isTrialExhausted) setShowLoginModal(true);
            }}
          />

          {(loading || isGenerating) ? (
            <button
              className="chat-composer-send-btn stop-active"
              onClick={handleStopGeneration}
              aria-label="Stop generating response"
              title="Stop generating"
            >
              <Square size={12} fill="currentColor" />
            </button>
          ) : (
            <button
              className={`chat-composer-send-btn ${prompt.trim() && !isTrialExhausted ? "active" : ""}`}
              onClick={() => getReply()}
              disabled={!prompt.trim() || isTrialExhausted}
              aria-label="Send message"
              title="Send message"
            >
              <ArrowUp size={16} />
            </button>
          )}
        </div>

        <p className="chat-disclaimer">
          SigmaGPT can make mistakes. Verify important facts and code logic.
        </p>
      </div>

      {/* ── Mobile Sidebar Backdrop Overlay ── */}
      <div 
        className="sidebar-mobile-backdrop" 
        onClick={() => setSidebarOpen(false)} 
      />

      {/* ── Free Trial Completed / Sign-In Required Modal ── */}
      {showLoginModal && (
        <div className="settings-modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="trial-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="trial-modal-header">
              <div className="trial-modal-badge">
                <Sparkles size={14} />
                <span>Free Trial Limit Reached</span>
              </div>
              <button 
                className="settings-modal-close" 
                onClick={() => setShowLoginModal(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="trial-modal-body">
              <div className="trial-brand-icon">
                <span>Σ</span>
              </div>
              <h2 className="trial-modal-title">Enjoying SigmaGPT?</h2>
              <p className="trial-modal-desc">
                You've used all 3 free trial prompts. Sign in with Google to get unlimited 
                conversations, persistent chat history, and priority AI inference.
              </p>

              <div className="trial-benefits-list">
                <div className="trial-benefit-item">
                  <Check size={14} className="text-success" />
                  <span>Unlimited prompts and messages</span>
                </div>
                <div className="trial-benefit-item">
                  <Check size={14} className="text-success" />
                  <span>Save, search, and continue past conversation history</span>
                </div>
                <div className="trial-benefit-item">
                  <Check size={14} className="text-success" />
                  <span>Syntax highlighting, code debugging, and writing assistance</span>
                </div>
              </div>

              <button
                className="auth-google-button"
                onClick={handleGoogleSignIn}
                disabled={oauthLoading}
                style={{ width: "100%", height: "46px", marginTop: "8px" }}
              >
                {oauthLoading ? (
                  <div className="auth-spinner"></div>
                ) : (
                  <svg className="auth-google-svg" viewBox="0 0 24 24" width="18" height="18">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                )}
                <span>{oauthLoading ? "Connecting..." : "Continue with Google to Unlock"}</span>
              </button>

              <button 
                className="trial-modal-dismiss"
                onClick={() => setShowLoginModal(false)}
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Settings Modal ── */}
      {isSettingsOpen && (
        <div className="settings-modal-overlay" onClick={() => setIsSettingsOpen(false)}>
          <div className="settings-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="settings-modal-header">
              <div className="settings-modal-title">
                <SettingsIcon size={18} />
                <h2>Settings</h2>
              </div>
              <button 
                className="settings-modal-close" 
                onClick={() => setIsSettingsOpen(false)}
                aria-label="Close settings"
              >
                <X size={18} />
              </button>
            </div>

            <div className="settings-modal-body">
              {/* Account Section */}
              <div className="settings-section">
                <span className="settings-section-label">Account Details</span>
                <div className="settings-user-info-card">
                  <div className="settings-avatar">
                    {(user?.user_metadata?.full_name || user?.email || "U")[0].toUpperCase()}
                  </div>
                  <div className="settings-user-meta">
                    <span className="settings-name">{user?.user_metadata?.full_name || "Guest User"}</span>
                    <span className="settings-email">{user?.email || "Free Trial Session"}</span>
                  </div>
                  <div className="settings-plan-badge">{user ? "Full Account" : "Trial"}</div>
                </div>
              </div>

              {/* Theme Preference */}
              <div className="settings-section">
                <span className="settings-section-label">Appearance</span>
                <div className="settings-row">
                  <div className="settings-row-text">
                    <span className="row-title">Color Theme</span>
                    <span className="row-desc">Switch between clean dark and soft light modes</span>
                  </div>
                  <button className="settings-theme-toggle" onClick={toggleTheme}>
                    {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
                    <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                  </button>
                </div>
              </div>

              {/* AI Model Preference */}
              <div className="settings-section">
                <span className="settings-section-label">Intelligence</span>
                <div className="settings-row">
                  <div className="settings-row-text">
                    <span className="row-title">Default Model</span>
                    <span className="row-desc">Select primary reasoning model for chats</span>
                  </div>
                  <span className="settings-model-tag">{selectedModel}</span>
                </div>
              </div>

              {/* Security & Inactivity */}
              <div className="settings-section">
                <span className="settings-section-label">Security & Session</span>
                <div className="settings-row">
                  <div className="settings-row-text">
                    <span className="row-title">Inactivity Timeout</span>
                    <span className="row-desc">Automatically logs out after 30 minutes of inactivity</span>
                  </div>
                  <span className="settings-status-badge">
                    <Shield size={13} /> Active
                  </span>
                </div>
              </div>
            </div>

            <div className="settings-modal-footer">
              <button 
                className="btn-primary" 
                onClick={() => setIsSettingsOpen(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatWindow;