import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { supabase } from './supabaseClient'
import './App.css'
import ChatWindow from './ChatWindow'
import Sidebar from './Sidebar'
import { MyContext } from '../MyContext'
import {v1 as uuidV1} from "uuid"
import LandingPage from "./landing/LandingPage";
import SignIn from "./auth/SignIn";

/* ── Chat shell — all existing context state lives here ── */
function ChatApp() {
  return (
    <>
      <Sidebar />
      <ChatWindow />
    </>
  )
}

/* ── Root router ── */
function App() {
  const [prompt,setPrompt]           = useState("")
  const [reply,setReply]             = useState(null)
  const [currThreadId,setCurrThreadId] = useState(uuidV1())
  const [prevChats,setPrevChats]     = useState([])
  const [newChat,setNewChat]         = useState(true)
  const [allThreads,setAllThreads]   = useState([])
  const [theme,setTheme]             = useState(() => localStorage.getItem("theme") || "dark")
  const [sidebarOpen,setSidebarOpen] = useState(false)
  const [user, setUser]              = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

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
