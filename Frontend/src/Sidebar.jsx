import { useContext, useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  SquarePen, 
  Search, 
  Trash2, 
  MessageSquare, 
  PanelLeftClose, 
  LogOut, 
  Settings as SettingsIcon,
  X,
  Sparkles
} from "lucide-react";
import { MyContext } from "../MyContext";
import { v1 as uuidV1 } from "uuid";
import { supabase } from "./supabaseClient";
import "./Sidebar.css";

function categorizeThreads(threads) {
  const groups = {
    today: [],
    yesterday: [],
    previous7Days: [],
    older: [],
  };

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
  const startOf7DaysAgo = startOfToday - 7 * 24 * 60 * 60 * 1000;

  threads.forEach((thread) => {
    const threadTime = thread.updatedAt 
      ? new Date(thread.updatedAt).getTime() 
      : (thread.createdAt ? new Date(thread.createdAt).getTime() : 0);

    if (threadTime >= startOfToday) {
      groups.today.push(thread);
    } else if (threadTime >= startOfYesterday) {
      groups.yesterday.push(thread);
    } else if (threadTime >= startOf7DaysAgo) {
      groups.previous7Days.push(thread);
    } else {
      groups.older.push(thread);
    }
  });

  return groups;
}

function Sidebar({ onOpenSettings }) {
  const navigate = useNavigate();
  const { 
    allThreads, 
    setAllThreads, 
    currThreadId, 
    setNewChat, 
    setPrompt, 
    setReply, 
    setCurrThreadId, 
    prevChats,
    setPrevChats, 
    sidebarOpen, 
    setSidebarOpen, 
    user,
    guestCredits
  } = useContext(MyContext);

  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const getUserId = useCallback(() => {
    if (user) return user.id || user.email;
    let guestId = localStorage.getItem("sigma_guest_id");
    if (!guestId) {
      guestId = "guest_" + uuidV1().substring(0, 8);
      localStorage.setItem("sigma_guest_id", guestId);
    }
    return guestId;
  }, [user]);

  const getAllThreads = useCallback(async () => {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
    const userId = getUserId();
    try {
      const response = await fetch(`${BACKEND_URL}/api/thread?userId=${encodeURIComponent(userId)}`);
      const res = await response.json();
      if (Array.isArray(res)) {
        const mapped = res.map((thread) => ({
          threadId: thread.threadId,
          title: thread.title || "Untitled Conversation",
          createdAt: thread.createdAt,
          updatedAt: thread.updatedAt,
        }));
        setAllThreads(mapped);

        // Auto-restore active thread so response sticks when user visits website
        const savedThreadId = localStorage.getItem("sigma_active_thread_id");
        const explicitNewChat = sessionStorage.getItem("sigma_explicit_new_chat") === "true";

        if (!explicitNewChat && prevChats.length === 0) {
          const targetThreadId = savedThreadId && mapped.some((t) => t.threadId === savedThreadId)
            ? savedThreadId
            : (mapped.length > 0 ? mapped[0].threadId : null);

          if (targetThreadId) {
            setCurrThreadId(targetThreadId);
            localStorage.setItem("sigma_active_thread_id", targetThreadId);
            try {
              const msgRes = await fetch(`${BACKEND_URL}/api/thread/${targetThreadId}`);
              const msgs = await msgRes.json();
              if (Array.isArray(msgs) && msgs.length > 0) {
                setPrevChats(msgs);
                setNewChat(false);
                setReply(null);
              }
            } catch (err) {
              console.warn("Failed to auto-restore thread messages:", err);
            }
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch threads:", err);
    }
  }, [setAllThreads, getUserId, prevChats.length, setCurrThreadId, setPrevChats, setNewChat, setReply]);

  // Fetch immediately on mount, when active thread changes, or when logged-in user changes
  useEffect(() => {
    getAllThreads();
  }, [getAllThreads, currThreadId, user]);

  const createNewChat = () => {
    localStorage.removeItem("sigma_active_thread_id");
    sessionStorage.setItem("sigma_explicit_new_chat", "true");
    setNewChat(true);
    setPrompt("");
    setReply(null);
    setCurrThreadId(uuidV1());
    setPrevChats([]);
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  const changeThread = async (newThreadId) => {
    if (newThreadId === currThreadId && prevChats.length > 0) return;
    setCurrThreadId(newThreadId);
    localStorage.setItem("sigma_active_thread_id", newThreadId);
    sessionStorage.removeItem("sigma_explicit_new_chat");
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
    try {
      const response = await fetch(`${BACKEND_URL}/api/thread/${newThreadId}`);
      const res = await response.json();
      setPrevChats(Array.isArray(res) ? res : []);
      setNewChat(false);
      setReply(null);
      if (window.innerWidth <= 768) {
        setSidebarOpen(false);
      }
    } catch (err) {
      console.error("Failed to load thread:", err);
    }
  };

  const deleteThread = async (threadId) => {
    setDeletingId(threadId);
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
    try {
      const response = await fetch(`${BACKEND_URL}/api/thread/${threadId}`, { method: "DELETE" });
      await response.json();
      setAllThreads((prev) => prev.filter((t) => t.threadId !== threadId));
      if (threadId === currThreadId) {
        localStorage.removeItem("sigma_active_thread_id");
        createNewChat();
      }
    } catch (err) {
      console.error("Failed to delete thread:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem("sigma_last_active");
    setAllThreads([]);
    setPrevChats([]);
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  // Filter threads by search query
  const filteredThreads = useMemo(() => {
    if (!searchQuery.trim()) return allThreads;
    return allThreads.filter((t) => 
      t.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
  }, [allThreads, searchQuery]);

  const categorized = useMemo(() => {
    return categorizeThreads(filteredThreads);
  }, [filteredThreads]);

  const renderThreadItem = (thread) => {
    const isActive = thread.threadId === currThreadId;
    return (
      <li 
        key={thread.threadId}
        onClick={() => changeThread(thread.threadId)}
        className={`sidebar-thread-item ${isActive ? "active" : ""}`}
        title={thread.title}
      >
        <MessageSquare size={14} className="thread-item-icon" />
        <span className="thread-item-title">{thread.title}</span>
        <button
          className="thread-item-delete"
          onClick={(e) => {
            e.stopPropagation();
            deleteThread(thread.threadId);
          }}
          disabled={deletingId === thread.threadId}
          title="Delete conversation"
          aria-label="Delete conversation"
        >
          <Trash2 size={13} />
        </button>
      </li>
    );
  };

  return (
    <aside className={`sidebar-root ${sidebarOpen ? "open" : ""}`}>
      {/* ── Sidebar Top Header ── */}
      <div className="sidebar-top-section">
        <div className="sidebar-brand-row">
          <div className="sidebar-brand" onClick={createNewChat}>
            <div className="sidebar-brand-icon">
              <span>Σ</span>
            </div>
            <span className="sidebar-brand-title">SigmaGPT</span>
          </div>
          
          <button 
            className="sidebar-close-btn" 
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
            title="Close sidebar"
          >
            <PanelLeftClose size={18} />
          </button>
        </div>

        {/* New Chat Primary Action */}
        <button className="sidebar-new-chat-btn" onClick={createNewChat} title="Start a new chat">
          <SquarePen size={16} />
          <span>New Chat</span>
        </button>

        {/* Search Conversations Input */}
        <div className="sidebar-search-box">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear-btn" onClick={() => setSearchQuery("")}>
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* ── Grouped Conversation History ── */}
      <div className="sidebar-history-container">
        {allThreads.length === 0 ? (
          <div className="sidebar-empty-state">
            <p>No conversations yet</p>
            <span>Start a new chat to begin</span>
          </div>
        ) : searchQuery.trim() !== "" ? (
          <div className="sidebar-group">
            <span className="sidebar-group-label">Search Results ({filteredThreads.length})</span>
            {filteredThreads.length === 0 ? (
              <p className="sidebar-no-results">No matching chats found</p>
            ) : (
              <ul className="sidebar-thread-list">
                {filteredThreads.map(renderThreadItem)}
              </ul>
            )}
          </div>
        ) : (
          <>
            {categorized.today.length > 0 && (
              <div className="sidebar-group">
                <span className="sidebar-group-label">Today</span>
                <ul className="sidebar-thread-list">
                  {categorized.today.map(renderThreadItem)}
                </ul>
              </div>
            )}

            {categorized.yesterday.length > 0 && (
              <div className="sidebar-group">
                <span className="sidebar-group-label">Yesterday</span>
                <ul className="sidebar-thread-list">
                  {categorized.yesterday.map(renderThreadItem)}
                </ul>
              </div>
            )}

            {categorized.previous7Days.length > 0 && (
              <div className="sidebar-group">
                <span className="sidebar-group-label">Previous 7 Days</span>
                <ul className="sidebar-thread-list">
                  {categorized.previous7Days.map(renderThreadItem)}
                </ul>
              </div>
            )}

            {categorized.older.length > 0 && (
              <div className="sidebar-group">
                <span className="sidebar-group-label">Older</span>
                <ul className="sidebar-thread-list">
                  {categorized.older.map(renderThreadItem)}
                </ul>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── User Profile & Actions Footer ── */}
      <div className="sidebar-bottom-section">
        {user ? (
          <>
            <div className="sidebar-user-card">
              <div className="sidebar-user-avatar">
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="User Avatar" />
                ) : (
                  <span>{(user.user_metadata?.full_name || user.email || "U")[0].toUpperCase()}</span>
                )}
              </div>

              <div className="sidebar-user-meta">
                <span className="sidebar-user-name">
                  {user.user_metadata?.full_name || "Sigma User"}
                </span>
                <span className="sidebar-user-email">
                  {user.email || "Free Plan"}
                </span>
              </div>

              <button 
                className="sidebar-settings-btn"
                onClick={onOpenSettings}
                title="Settings"
                aria-label="Open settings"
              >
                <SettingsIcon size={16} />
              </button>
            </div>

            <button className="sidebar-logout-btn" onClick={handleLogout} title="Log out">
              <LogOut size={15} />
              <span>Log Out</span>
            </button>
          </>
        ) : (
          <div className="sidebar-guest-card">
            <div className="sidebar-guest-top">
              <div className="sidebar-guest-badge">
                <Sparkles size={12} />
                <span>Free Trial</span>
              </div>
              <span className="sidebar-guest-count">{guestCredits}/3 left</span>
            </div>
            <p className="sidebar-guest-desc">Sign in to save past conversations and unlock unlimited prompts.</p>
            <button className="sidebar-guest-signin-btn" onClick={() => navigate("/signin")}>
              Sign In to Save History
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;