# 🤖 SigmaGPT

**SigmaGPT** is a MERN-based AI chat application inspired by the core experience of ChatGPT.

It allows users to start new conversations, maintain multiple chat threads, view previous conversations, delete threads, and receive AI-generated responses. The application uses **React + Vite** for the frontend, **Node.js + Express.js** for the backend, **MongoDB** for storing conversations, and **OpenRouter** for AI responses.

---

## ✨ Features

* 💬 AI-powered chat interface
* 🧵 Multiple conversation threads
* 💾 Persistent chat history using MongoDB
* 🗑️ Delete conversation threads
* ➕ Create new conversations
* 📜 View previous conversations from the sidebar
* ✍️ AI typing effect
* 📝 Markdown response rendering
* 💻 Code syntax highlighting
* ⏳ Loading indicator while generating responses
* 🔐 Google Sign-In using Supabase Authentication
* 📱 Responsive and clean ChatGPT-inspired interface

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* CSS
* React Markdown
* Highlight.js
* React Spinners
* UUID

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* OpenRouter API
* dotenv
* CORS

### Authentication

* Supabase Authentication
* Google OAuth

---

## 🏗️ Project Structure

```text
SigmaGPT/
│
├── Backend/
│   ├── models/
│   │   └── Thread.js
│   │
│   ├── routes/
│   │   └── chat.js
│   │
│   ├── utils/
│   │   └── openai.js
│   │
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   ├── Chat.jsx
│   │   ├── ChatWindow.jsx
│   │   ├── Sidebar.jsx
│   │   ├── MyContext.jsx
│   │   └── ...
│   │
│   ├── .env
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

# ⚙️ How SigmaGPT Works

## 🖥️ Frontend

The React frontend provides the chat interface.

Users can:

1. Create a new chat.
2. Enter a message.
3. Send the message to the Express backend.
4. Receive an AI-generated response.
5. View the conversation in the chat window.
6. Access previous conversations from the sidebar.
7. Delete unwanted conversations.

The frontend communicates with the backend using REST APIs.

---

## 🔧 Backend

The Express.js backend handles:

* Chat requests
* AI API requests
* Creating conversation threads
* Saving messages
* Fetching previous conversations
* Deleting conversations

The backend stores conversation data in MongoDB using Mongoose.

---

## 🤖 AI Integration

SigmaGPT uses **OpenRouter** to generate AI responses.

User messages are sent from the frontend to the Express backend.

The backend then sends the message to OpenRouter and returns the generated response to the frontend.

The application is configured to use:

```text
openrouter/free
```

This allows the application to use an available free model through OpenRouter.

---

# 🚀 Getting Started

Follow the steps below to run SigmaGPT locally.

## 📋 Prerequisites

Make sure you have the following installed:

* [Node.js](https://nodejs.org/) v18 or higher
* MongoDB or a MongoDB Atlas account
* Git
* An OpenRouter API key
* A Supabase project
* Google OAuth credentials

---

# 📥 1. Clone the Repository

Open your terminal and run:

```bash
git clone https://github.com/YOUR_USERNAME/SigmaGPT.git
```

Then enter the project directory:

```bash
cd SigmaGPT
```

---

# 🔧 2. Backend Setup

Open a terminal and navigate to the backend:

```bash
cd Backend
```

Install the required dependencies:

```bash
npm install
```

Create a `.env` file inside the `Backend` folder.

Add:

```env
MONGODB_URI=your_mongodb_connection_string
OPENROUTER_API_KEY=your_openrouter_api_key
PORT=8080
```

Replace the values with your actual credentials.

### Start the Backend

For normal execution:

```bash
npm start
```

For development with Nodemon:

```bash
npm run dev
```

The backend will run locally on:

```text
http://localhost:8080
```

---

# 🎨 3. Frontend Setup

Open another terminal.

Navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the `frontend` folder.

Add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Then start the Vite development server:

```bash
npm run dev
```

The frontend will normally run on:

```text
http://localhost:5173
```

Open this address in your browser.

---

# 🔐 Google Sign-In Setup

SigmaGPT uses Supabase Authentication with Google OAuth.

### Step 1 — Create a Supabase Project

Create a project in Supabase and open:

```text
Authentication
    ↓
Sign In / Providers
    ↓
Google
```

Enable the Google provider.

---

### Step 2 — Google Cloud Configuration

Create Google OAuth credentials from Google Cloud.

Create an OAuth Client ID with the application type:

```text
Web application
```

Add your application's authorized origins.

For local development:

```text
http://localhost:5173
```

Use the Supabase OAuth callback URL as the authorized redirect URI.

The callback URL can be found in:

```text
Supabase
→ Authentication
→ Sign In / Providers
→ Google
→ Callback URL
```

Copy that URL into Google Cloud's:

```text
Authorized redirect URIs
```

Then copy the generated:

* Client ID
* Client Secret

into the Google provider configuration in Supabase.

---

# 🔑 Environment Variables

## Backend `.env`

```env
MONGODB_URI=your_mongodb_connection_string
OPENROUTER_API_KEY=your_openrouter_api_key
PORT=8080
```

## Frontend `.env`

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

> ⚠️ Never upload your `.env` files to GitHub.

Add them to `.gitignore`:

```gitignore
.env
.env.local
node_modules/
dist/
```

---

# 📡 API Endpoints

SigmaGPT provides the following backend endpoints:

| Method   | Endpoint                | Description                               |
| -------- | ----------------------- | ----------------------------------------- |
| `POST`   | `/api/chat`             | Send a message and receive an AI response |
| `GET`    | `/api/thread`           | Get all conversation threads              |
| `GET`    | `/api/thread/:threadId` | Get messages from a specific thread       |
| `DELETE` | `/api/thread/:threadId` | Delete a conversation thread              |
| `POST`   | `/api/test`             | Test MongoDB thread creation              |

---

# 💬 Chat Flow

The basic request flow is:

```text
User
  ↓
React Frontend
  ↓
Express.js Backend
  ↓
OpenRouter API
  ↓
AI Model
  ↓
Express.js Backend
  ↓
MongoDB
  ↓
React Frontend
  ↓
Display AI Response
```

---

# 🗄️ Database

MongoDB stores conversation threads.

A thread contains information such as:

```text
threadId
title
messages
updatedAt
```

Each message contains:

```text
role
content
```

Example:

```json
{
  "role": "user",
  "content": "What is JavaScript?"
}
```

AI responses are stored as:

```json
{
  "role": "assistant",
  "content": "JavaScript is a programming language..."
}
```

---

# ✨ Main Features Explained

## 🧵 Conversation Threads

Every conversation receives a unique thread ID.

This allows users to maintain multiple independent conversations.

---

## 🗑️ Delete Threads

Users can delete previous conversations using the trash icon displayed when hovering over a conversation.

---

## ✍️ Typing Effect

AI responses are displayed gradually to create a typing-style experience similar to modern AI chat applications.

---

## 📝 Markdown Support

AI responses are rendered using Markdown.

This allows responses to contain:

* Headings
* Lists
* Bold text
* Code blocks
* Links
* Other Markdown formatting

---

## 💻 Code Highlighting

Code blocks returned by the AI are highlighted using:

```text
highlight.js
```

This makes programming-related responses easier to read.

---

# 🚀 Deployment

SigmaGPT can be deployed using platforms such as:

* Vercel — Frontend
* Render / Railway / similar Node.js hosting — Backend
* MongoDB Atlas — Database
* Supabase — Authentication
* OpenRouter — AI API

When deploying, remember to update:

```text
localhost URLs
```

to the deployed backend URL.

For example:

```text
http://localhost:8080/api/chat
```

should become:

```text
https://your-backend-url.com/api/chat
```

Also add the required environment variables to your deployment platform.

---

# 🔒 Security

Never commit sensitive credentials to GitHub.

Do **not** upload:

```text
.env
.env.local
```

Your API keys and database credentials should always be stored as environment variables.

---

# 📸 Screenshots

You can add screenshots of your application here:

```markdown
## 📸 Screenshots

![SigmaGPT Home](screenshots/home.png)

![SigmaGPT Chat](screenshots/chat.png)
```

Create a `screenshots` folder in the repository and place your screenshots inside it.

---

# 📌 Future Improvements

Some possible improvements for future versions:

* 🔊 Voice input
* 🎤 Voice conversations
* 📎 File upload
* 🖼️ Image understanding
* 🔍 Web search
* 📱 Better mobile responsiveness
* 👤 User-specific conversation history
* 🌙 Theme customization
* 📊 Usage dashboard
* ⚡ Streaming AI responses

---

# 👨‍💻 Author

**Suyog Kumbhar**

SigmaGPT was developed as a full-stack AI chat application using modern web technologies.

---

# ⭐ Support

If you like this project, consider giving the repository a ⭐ on GitHub!
