import { useState, useEffect, useContext } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import './App.css'
import ChatWindow from './ChatWindow'
import Sidebar from './Sidebar'
import { MyContext } from '../MyContext'
import { v1 as uuidV1 } from "uuid"
import LandingPage from "./landing/LandingPage";
import SignIn from "./auth/SignIn";
import { RingLoader } from 'react-spinners';

/* ── Chat shell — accessible to both authenticated users and guests (with trial credits) ── */
function ChatApp() {
  const { authLoading, theme } = useContext(MyContext);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  if (authLoading) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', background: theme === 'light' ? '#f8fafc' : '#0c0d12' }}>
        <RingLoader color="#6366f1" size={45} />
      </div>
    );
  }

  return (
    <>
      <Sidebar onOpenSettings={() => setIsSettingsOpen(true)} />
      <ChatWindow isSettingsOpen={isSettingsOpen} setIsSettingsOpen={setIsSettingsOpen} />
    </>
  );
}

// Detect if URL currently has OAuth tokens before Supabase strips them
const initialHasAuthParams = typeof window !== 'undefined' && (
  window.location.hash.includes('access_token') ||
  window.location.hash.includes('error') ||
  window.location.search.includes('code=')
);

/* ── Root router ── */
function App() {
  const [prompt, setPrompt]           = useState("")
  const [reply, setReply]             = useState(null)
  const [currThreadId, setCurrThreadId] = useState(uuidV1())
  const [prevChats, setPrevChats]     = useState([])
  const [newChat, setNewChat]         = useState(true)
  const [allThreads, setAllThreads]   = useState([])
  const [theme, setTheme]             = useState(() => localStorage.getItem("theme") || "dark")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser]              = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [guestCredits, setGuestCredits] = useState(() => {
    const saved = localStorage.getItem("sigma_guest_credits");
    return saved !== null ? parseInt(saved, 10) : 3;
  })

  const navigate = useNavigate()

  useEffect(() => {
    const handleRedirect = (session) => {
      if (!session) return;
      const isOAuth = sessionStorage.getItem('oauth_in_progress') === 'true' || initialHasAuthParams;
      const currentPath = window.location.pathname;

      if (isOAuth || currentPath === '/signin') {
        sessionStorage.removeItem('oauth_in_progress');
        localStorage.setItem("sigma_last_active", Date.now().toString());
        navigate('/chat', { replace: true });
      }
    };

    // 1. Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
      handleRedirect(session);
    });

    // 2. Auth state change listener (catches SIGNED_IN, INITIAL_SESSION, TOKEN_REFRESHED)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);

      if (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
        handleRedirect(session);
      }

      if (event === 'SIGNED_OUT') {
        sessionStorage.removeItem('oauth_in_progress');
        localStorage.removeItem("sigma_last_active");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const providerValues = {
    prompt, setPrompt,
    reply, setReply,
    currThreadId, setCurrThreadId,
    newChat, setNewChat,
    prevChats, setPrevChats,
    allThreads, setAllThreads,
    theme, setTheme,
    sidebarOpen, setSidebarOpen,
    user,
    authLoading,
    guestCredits, setGuestCredits
  }

  return (
    <MyContext.Provider value={providerValues}>
      <div className={`app ${theme}`}>
        <Routes>
          <Route path="/"     element={<LandingPage />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/chat" element={<ChatApp />} />
        </Routes>
      </div>
    </MyContext.Provider>
  )
}

export default App
