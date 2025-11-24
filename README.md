# 💎 Diamond LLM

Diamond LLM is a modern, high-performance chat interface for Large Language Models (LLMs), built with **Nuxt 4** and **Nuxt UI**. It features a robust Retrieval-Augmented Generation (RAG) system, group-based access control, and a seamless user experience.

---

## ✨ Key Features

### 🤖 AI & Chat
- **Multi-Model Support**: Integrated with **Google Gemini** and **Ollama** for local model inference.
- **Streaming Responses**: Real-time token streaming for a responsive chat experience.
- **Syntax Highlighting**: Automatic code block highlighting using **Shiki**.
- **Chat History**: Persistent chat history stored in PostgreSQL.

### 📚 RAG (Retrieval-Augmented Generation)
- **Vector Database**: Utilizes **Upstash Vector** for storing and retrieving embeddings.
- **Contextual Awareness**: Enhances LLM responses by retrieving relevant information from your knowledge base (Guides).
- **Text Splitting**: Intelligent text chunking using **LangChain** for optimal embedding generation.

### 👥 Groups & Permissions
- **Organization Support**: Create and manage groups (e.g., teams, departments).
- **Access Control (ACL)**: Granular permissions for group members (e.g., `guide:read`, `guide:create`).
- **Public & Private Guides**: Support for both public guides and private group-specific knowledge bases.

### 📝 Content Management
- **Code Editor**: **Monaco Editor** integration for creating and editing guides.
- **Markdown Support**: Full markdown support for guide content.
- **Guide Management**: Create, edit, and delete guides.
- **Background Processing**: **BullMQ** handles heavy tasks like embedding generation asynchronously.

### 🛠️ Technical Stack
- **Framework**: [Nuxt 4](https://nuxt.com/) (Vue.js)
- **UI Library**: [Nuxt UI](https://ui.nuxt.com/) (TailwindCSS)
- **Database**: PostgreSQL with [Drizzle ORM](https://orm.drizzle.team/)
- **Vector DB**: [Upstash Vector](https://upstash.com/vector)
- **Queues**: [BullMQ](https://bullmq.io/) with Redis
- **Auth**: [Nuxt Auth Utils](https://github.com/atinux/nuxt-auth-utils)
- **Runtime**: [Bun](https://bun.sh/)

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v20+)
- **Bun** (latest)
- **PostgreSQL** database
- **Redis** instance (for BullMQ)
- **Upstash Vector** database

### 2. Installation

```bash
# Clone the repository
git clone https://github.com/TutorFx/diamondlm.git

# Navigate to the directory
cd diamond-llm

# Install dependencies
bun install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
POSTGRES_USER="testuser"
POSTGRES_PASSWORD="testpass"
POSTGRES_DB="dbname"
POSTGRES_PORT=9293
POSTGRES_HOSTNAME="127.0.0.1"


OLLAMA_BASE_URL="http://127.0.0.1:11434/api"

REDIS_PASSWORD=sua_senha_secreta_redis
REDIS_PORT=6379
```

### 4. Database Setup

Run migrations to set up the database schema:

```bash
bun run db:generate
bun run db:migrate
```

### 5. Running Development Server

```bash
bun run dev
```
The application will be available at `http://localhost:3000`.

---

## 📁 Project Structure

```
diamond-llm/
├── app/                  # Frontend logic (Nuxt)
│   ├── components/       # Vue components
│   ├── composables/      # Shared logic (hooks)
│   ├── layouts/          # Page layouts
│   ├── pages/            # File-based routing
│   └── plugins/          # Nuxt plugins
├── server/               # Backend logic (Nitro)
│   ├── api/              # API endpoints
│   ├── database/         # Drizzle schema & config
│   └── utils/            # Server-side utilities
├── shared/               # Shared types and utils
└── public/               # Static assets
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.