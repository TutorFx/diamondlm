# 💎 Diamond LLM

[![Nuxt](https://img.shields.io/badge/Nuxt-4.1-00DC82?style=flat&logo=nuxt.js)](https://nuxt.com)
[![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=flat&logo=bun&logoColor=white)](https://bun.sh)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**Diamond LLM** is a high-performance chat interface for Large Language Models, engineered with **Nuxt 4** and **Nuxt UI**. It leverages a robust Retrieval-Augmented Generation (RAG) system, granular access control, and a premium user experience.

## ✨ Features

- **🤖 AI & Chat**: Multi-model support (Gemini, Ollama), real-time streaming, and syntax highlighting.
- **📚 RAG System**: Hybrid search with [pgvector](https://github.com/pgvector/pgvector), number boosting, and markdown parsing.
- **👥 Team Management**: Hierarchical groups, granular ACL permissions, and private knowledge bases.
- **📝 Content Engine**: Monaco Editor integration for managing technical guides and documentation.
- **🔈 Audio System**: High-fidelity Text-to-Speech powered by Kokoro.

## 🚀 Quick Start

Get up and running in minutes.

1. **Install**: Clone and install dependencies.
2. **Configure**: Set up your `.env`.
3. **Run**: Start the development server.

👉 **[View Full Setup Guide](./DOCS/SETUP.md)**

## 📖 Documentation

Everything you need to know about Diamond LLM.

- **[Setup & Installation](./DOCS/SETUP.md)**
- **[RAG Architecture](./DOCS/RAG.md)**
- **[Groups & Permissions](./DOCS/GROUPS.md)**
- **[Database Seeding](./DOCS/SEEDING.md)**
- **[Audio & Voice](./DOCS/AUDIO.md)**
- **[Changelog](./CHANGELOG.md)**

## 💻 Tech Stack

- **Framework**: [Nuxt 4](https://nuxt.com)
- **UI**: [Nuxt UI](https://ui.nuxt.com)
- **Database**: PostgreSQL (Drizzle ORM)
- **Vector DB**: pgvector
- **Queue**: BullMQ with Redis
- **Runtime**: Bun

## 🤝 Contribution

Contributions are welcome! Please read our **[Contributing Guide](./CONTRIBUTING.md)** before submitting a Pull Request.

<!-- Badges and footer -->
[comparison]: https://github.com/TutorFx/diamondlm/compare