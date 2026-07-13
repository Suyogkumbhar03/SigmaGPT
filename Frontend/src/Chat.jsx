import { MyContext } from "../MyContext";
import "./Chat.css";
import { useContext, useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";  //arrage the reply in proper formatting
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css"


function Chat() {

    const { newChat, prevChats, reply, user } = useContext(MyContext);
    const [latestReply, setLatestReply] = useState(null);

    useEffect(() => {

        if (reply === null) {
            setLatestReply(null);//when load prevchats
            return;
        }
        //latestReply seperate => typing effect create
        if (!prevChats?.length) return;

        const content = reply.split("");//individual words

        let idx = 0;
        const interval = setInterval(() => {
            setLatestReply(content.slice(0, idx + 1).join(""));

            idx++;
            if (idx >= content.length) clearInterval(interval)
        }, 30);

        return () => clearInterval(interval)

    }, [prevChats, reply])

    return (
        <div className="chats">
            {newChat && (
                <h1 className="newChatTitle">
                    {user ? `Welcome, ${user.user_metadata?.full_name || 'User'}!` : "Start New Chat!"}
                </h1>
            )}
            {
                prevChats?.slice(0, -1).map((chat, idx) => (
                    <div className={chat.role === "user" ? "userDiv" : "gptDiv"} key={idx}>
                        {
                            chat.role === "user" ?
                                <p className="userMessage">{chat.content}</p> :
                                <ReactMarkdown rehypePlugins={rehypeHighlight}>{chat.content}</ReactMarkdown>
                        }
                    </div>
                ))
            }

            {
                prevChats.length > 0 && (
                    <>
                        {
                            latestReply === null ? (
                                <div className="gptDiv" key={"non-typing"}>
                                    <ReactMarkdown rehypePlugins={rehypeHighlight}>{prevChats[prevChats.length - 1].content}</ReactMarkdown>
                                </div>
                            ) : (
                                <div className="gptDiv" key={"typing"}>
                                    <ReactMarkdown rehypePlugins={rehypeHighlight}>{latestReply}</ReactMarkdown>
                                </div>
                            )
                        }
                    </>
                )
            }

        </div>
    )
}

export default Chat;