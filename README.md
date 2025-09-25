# 💎 Diamond LLM

A chat interface for Large Language Models, built with the power and simplicity of [Nuxt 4](https://nuxt.com/) and [Nuxt UI](https://ui.nuxt.com/).

---

## Overview

Diamond LLM provides an elegant and high-performance platform for interacting with LLMs. The project uses the [Vercel AI SDK](https://sdk.vercel.ai/docs) for seamless integration with AI services, such as the Google Gemini API.

To enrich conversation context, the project leverages [Upstash Vector](https://upstash.com/vector) as a vector database, enabling Retrieval-Augmented Generation (RAG).

[DEMO](diamond-llm.vercel.app)

## ✨ Features

- **Reactive Interface**: Built with Vue.js and Nuxt UI for a modern user experience.
- **Streaming Responses**: Receive real-time answers from the language model.
- **RAG with Upstash**: Utilizes a vector database to provide additional context to the AI's responses.
- **Syntax Highlighting**: Code blocks in responses are automatically highlighted.
- **Integrated Backend**: The Nuxt API manages secure communication with AI services.
- **Text Splitting**: Uses [LangChain](https://js.langchain.com/) for text processing and splitting.

## 🚀 Getting Started

Follow the steps below to set up and run the project in your local environment.

### 1. Prerequisites

- [Node.js](https://nodejs.org/en/) (version 20.x or higher)
- [Bun](https://bun.sh/)

### 2. Installation

Clone the repository and install the dependencies using `bun`:

```bash
# Clone the project
git clone https://github.com/TutorFx/diamondlm.git

# Navigate to the directory
cd diamond-llm

# Install dependencies
bun install
```

### 3. Environment Variables

Create a `.env` file in the project root. It is required to store API keys and other sensitive settings.

```env
# Google Gemini API Key
GOOGLE_API_KEY="YOUR_KEY_HERE"

# Upstash Vector Credentials
UPSTASH_VECTOR_REST_URL="YOUR_URL_HERE"
UPSTASH_VECTOR_REST_TOKEN="YOUR_TOKEN_HERE"
```

### 4. Running in Development

Start the development server. The application will be available at `http://localhost:3000`.

```bash
bun run dev
```

## ▶️ Available Commands

- `bun run dev`: Starts the development server with hot-reloading.
- `bun run build`: Compiles the application for production.
- `bun run preview`: Previews the production build locally.
- `bun run lint`: Runs ESLint to find and fix issues in the code.
- `bun run typecheck`: Performs a type check on the entire project with TypeScript.

## 📁 Directory Structure

The project follows the standard Nuxt 4 directory structure:

```
/diamond-llm
├── app/              # Contains all frontend logic
│   ├── components/     # Reusable Vue components
│   ├── layouts/        # Application layouts
│   └── pages/          # Pages and routing system
├── server/           # Backend logic
│   └── api/            # API endpoints
├── public/           # Static assets
├── nuxt.config.ts    # Main Nuxt configuration file
└── package.json      # Dependencies and scripts
```