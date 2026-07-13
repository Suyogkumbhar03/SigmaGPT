import "./ChatWindow.css"
import Chat from "./Chat"
import { MyContext } from "../MyContext.jsx"
import { useContext ,useState, useEffect, useCallback } from "react"
import {RingLoader} from "react-spinners"
import { supabase } from "./supabaseClient"
function ChatWindow() {

    const {prompt,setPrompt,reply,setReply,currThreadId,prevChats,setPrevChats,setNewChat,theme,setTheme,sidebarOpen,setSidebarOpen, user} = useContext(MyContext);
    const [loading,setLoading] = useState(false);
    const [isOpen,setIsOpen] = useState(false);

    const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
    const LAST_ACTIVE_KEY = "sigma_last_active";

    const handleLogout = useCallback(async () => {
        await supabase.auth.signOut();
        localStorage.removeItem(LAST_ACTIVE_KEY);
        window.location.href = '/';
    }, []);

    // Update last active timestamp on user interaction
    const updateActivity = useCallback(() => {
        localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
    }, []);

    useEffect(() => {
        if (!user) return;

        // Set initial activity timestamp
        updateActivity();

        // Check session on focus (when user returns to tab)
        const checkSession = () => {
            const lastActive = parseInt(localStorage.getItem(LAST_ACTIVE_KEY) || '0', 10);
            if (Date.now() - lastActive > SESSION_TIMEOUT_MS) {
                handleLogout();
            } else {
                updateActivity();
            }
        };

        // Track activity events
        const events = ['mousemove', 'keydown', 'click', 'scroll'];
        events.forEach(e => window.addEventListener(e, updateActivity));
        window.addEventListener('focus', checkSession);

        // Periodic check every minute
        const interval = setInterval(() => {
            const lastActive = parseInt(localStorage.getItem(LAST_ACTIVE_KEY) || '0', 10);
            if (Date.now() - lastActive > SESSION_TIMEOUT_MS) {
                handleLogout();
            }
        }, 60 * 1000);

        return () => {
            events.forEach(e => window.removeEventListener(e, updateActivity));
            window.removeEventListener('focus', checkSession);
            clearInterval(interval);
        };
    }, [user, handleLogout, updateActivity]);

    const toggleTheme = () => {
        const nextTheme = theme === "light" ? "dark" : "light";
        setTheme(nextTheme);
        localStorage.setItem("theme", nextTheme);
    };

    const getReply=async()=>{
        setLoading(true);
        setNewChat(false);
        console.log("message",prompt , "threadId" , currThreadId)
        const options = {
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body: JSON.stringify({
                message:prompt,
                threadId:currThreadId
            }),
        }
        const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
        try{
          const response =  await fetch(`${BACKEND_URL}/api/chat`,options);
          const res = await response.json()
          setReply(res.reply)
          console.log(res)
        }catch(e)
        {
            console.log(e)
        }
        setLoading(false)
    }


    //append new chat to prev chats
    useEffect(()=>{
        if(prompt && reply)
        {
            setPrevChats(prevChats =>(
                [...prevChats,{
                    role:"user",
                    content:prompt
                },{
                    role:"assistant",
                    content:reply
                }]
            ))
        }

        setPrompt("")
    },[reply]);

    const handleProfileClick = () =>{

        setIsOpen(!isOpen)
    }


    return (
        <>
            <div className="chatWindow">

                <div className="navbar">
                    <div className="navLeft">
                        <button className="hamburgerBtn" onClick={() => setSidebarOpen(o => !o)} title="Toggle Sidebar">
                            <i className="fa-solid fa-bars"></i>
                        </button>
                        <span>SigmaGPT &nbsp;<i className="fa-solid fa-chevron-down"></i></span>
                    </div>
                    <div className="navRight">
                        <button className="themeToggle" onClick={toggleTheme} title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}>
                            <i className={theme === "light" ? "fa-solid fa-moon" : "fa-solid fa-sun"}></i>
                        </button>
                        <div className="userIconDiv" onClick={handleProfileClick}>
                            <span className="userIcon"> 
                                 <i className="fa-solid fa-user"></i>
                            </span>
                        </div>
                    </div>
                </div>

                {
                    isOpen && 
                    <div className="dropDown">
                        {user && <div className="dropDownItem" style={{fontSize:'0.85rem', color:'var(--text-muted)', cursor:'default', paddingBottom:'6px', borderBottom:'1px solid var(--border-sign)'}}><i className="fa-solid fa-user" style={{marginRight:'6px'}}></i>{user.user_metadata?.full_name || user.email}</div>}
                        <div className="dropDownItem"><i className="fa-solid fa-cloud-arrow-up"></i>Upgrade Plan</div>
                        <div className="dropDownItem"><i className="fa-solid fa-gear"></i>Settings</div>
                        <div className="dropDownItem" onClick={handleLogout}><i className="fa-solid fa-arrow-right-from-bracket"></i>Log Out</div>
                    </div>
                }

                <Chat></Chat>
                <div className="loaderContainer">
                    <RingLoader color={theme === "light" ? "#1a1a1a" : "#ffffff"} loading={loading} size={40} />
                </div>

                <div className="chatInput">
                    <div className="inputBox">
                        <input placeholder="Ask anything" value={prompt} 
                        onChange={(e)=>setPrompt(e.target.value)}
                        onKeyDown={(e)=>e.key==="Enter"? getReply():""}>
                            
                        </input>
                        <div id="submit" onClick={getReply}>
                            <i className="fa-solid fa-paper-plane"></i>

                        </div>
                    </div>
                    <p className="info">AI can make mistakes. Check important info. See Cookie Preferences.</p>
                 </div>
            </div>
            {/* Mobile sidebar overlay */}
            {sidebarOpen && <div className="sidebarOverlay" onClick={() => setSidebarOpen(false)} />}

            

        </>
    )
}

export default ChatWindow