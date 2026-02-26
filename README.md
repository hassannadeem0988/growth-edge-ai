# 🚀 GrowthEdge AI Assistant

**Client:** Sarah Malik — GrowthEdge Solutions  
**Brand Color:** `#2E86C1` (GrowthEdge Blue)

---

## 📂 Project Structure

```
/growthedge-ai-app
├── /client          → Next.js frontend (what users see)
├── /server          → Express.js backend (API + logic)
├── /ingestion       → One-time scripts to feed PDFs to the AI
├── package.json     → Root workspace config
└── README.md        → You are here!
```

## 🛠️ Tech Stack

| Layer      | Technology                    |
|------------|-------------------------------|
| Frontend   | Next.js + Tailwind CSS        |
| Backend    | Node.js + Express             |
| Database   | MongoDB (users, chats, usage) |
| Vector DB  | Pinecone (PDF knowledge)      |
| AI Engine  | OpenAI GPT-4o                 |
| Deployment | Vercel (client) + Render (server) |

## 🚀 Getting Started

```bash
# 1. Install all dependencies
npm run install:all

# 2. Start the frontend
npm run dev:client

# 3. Start the backend (in a new terminal)
npm run dev:server
```

> **Note:** Copy `.env.local` (client) and `.env` (server) templates and fill in your secret keys before running.
