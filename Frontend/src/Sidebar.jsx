import "./Sidebar.css";
import { useContext, useEffect } from "react";
import { MyContext } from "../MyContext";
import { v1 as uuidV1 } from "uuid";
import { supabase } from "./supabaseClient";

function Sidebar() {
    const { allThreads, setAllThreads, currThreadId, setNewChat, setPrompt, setReply, setCurrThreadId, setPrevChats, sidebarOpen, setSidebarOpen, user } = useContext(MyContext);

    const getAllThreads = async () => {

        const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
        try {
            const response = await fetch(`${BACKEND_URL}/api/thread`);
            const res = await response.json();
            const filteredData = res.map(thread => ({ threadId: thread.threadId, title: thread.title }));
            setAllThreads(filteredData)
            //threadId,titile
        } catch (err) {
            console.log(err)
        }
    };

    useEffect(() => {
        getAllThreads();
    }, [currThreadId])

    const createNewChat = () => {
        setNewChat(true);
        setPrompt("");
        setReply(null);
        setCurrThreadId(uuidV1());
        setPrevChats([]);
    }

    const changeThread = async (newThreadId) => {
        setCurrThreadId(newThreadId);

        const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
        try {

            const response = await fetch(`${BACKEND_URL}/api/thread/${newThreadId}`);
            const res = await response.json()
            console.log(res);
            setPrevChats(res);
            setNewChat(false);
            setReply(null);
        } catch (err) {
            console.log(err)
        }
    }

    const deleteThread = async (threadId) => {
        const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
        try {
            const response = await fetch(`${BACKEND_URL}/api/thread/${threadId}`, { method: "DELETE" });
            const res = await response.json();
            console.log(res);

            setAllThreads(prev => prev.filter(thread => thread.threadId !== threadId));

            if (threadId === currThreadId) {
                createNewChat();
            }

        } catch (err) {
            console.log(err)
        }
    }

    return (
        <>
            <section className={`sidebar ${sidebarOpen ? 'sidebarOpen' : ''}`}>
                {/* new chat button */}
                <div className="sidebarHeader">
                    <button onClick={createNewChat} title="New Chat">
                        <span><i className="fa-solid fa-pen-to-square"></i></span>
                    </button>
                    <button className="sidebarClose" onClick={() => setSidebarOpen(false)} title="Close Sidebar">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                {/* history */}

                <ul className="history">
                    {
                        allThreads?.map((thread, idx) => (
                            <li key={idx}

                                onClick={() => changeThread(thread.threadId)}
                                className={thread.threadId === currThreadId ? "highlighted" : " "}
                            >{thread.title}

                                <i className="fa-solid fa-trash" onClick={(e) => {
                                    e.stopPropagation();//stop evevnt bubbling
                                    deleteThread(thread.threadId);
                                }}></i>
                            </li>
                        ))
                    }
                </ul>

                {/* sign */}
                <div className="sign" style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '20px' }}>
                    {user && (
                        <button onClick={async () => {
                            await supabase.auth.signOut();
                            window.location.href = '/';
                        }} style={{ background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border-sign)', padding: '10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}>
                            <i className="fa-solid fa-arrow-right-from-bracket"></i> Logout
                        </button>
                    )}
                </div>

            </section>

        </>
    )
}

export default Sidebar;