# Changelog


## v0.0.1-1

[compare changes](https://github.com/TutorFx/diamondlm/compare/v0.0.1-0...v0.0.1-1)

### 🚀 Enhancements

- Add prerelease script for changelogen in package.json ([eb78df0](https://github.com/TutorFx/diamondlm/commit/eb78df0))
- Enhance seed process with logging and dynamic guide processing ([6d32457](https://github.com/TutorFx/diamondlm/commit/6d32457))
- Enable editing mode in Guide component and update tab items ([416cd7d](https://github.com/TutorFx/diamondlm/commit/416cd7d))
- Implement last group retrieval and update user session handling ([61ddc90](https://github.com/TutorFx/diamondlm/commit/61ddc90))
- Allow editing of global guides regardless of group access ([c66c01d](https://github.com/TutorFx/diamondlm/commit/c66c01d))
- Replace console logs with logger in worker, queue, and seed processes ([8a74851](https://github.com/TutorFx/diamondlm/commit/8a74851))

### ❤️ Contributors

- Gabriel Serejo <gabriel_serejo@live.com>

## v0.0.1-0


### 🚀 Enhancements

- Starts the project ([76d54b8](https://github.com/TutorFx/diamondlm/commit/76d54b8))
- Added rag ([236d419](https://github.com/TutorFx/diamondlm/commit/236d419))
- Adjusts meta tags ([21f26ff](https://github.com/TutorFx/diamondlm/commit/21f26ff))
- Added new supported models ([d488644](https://github.com/TutorFx/diamondlm/commit/d488644))
- Improved prompt ([1e24c02](https://github.com/TutorFx/diamondlm/commit/1e24c02))
- Added postgres-vector to embedding ([96a0193](https://github.com/TutorFx/diamondlm/commit/96a0193))
- Migrated the chat to ollama ([eb028f1](https://github.com/TutorFx/diamondlm/commit/eb028f1))
- Finished the integration with local models ([264ba4b](https://github.com/TutorFx/diamondlm/commit/264ba4b))
- Added env example ([4f2952c](https://github.com/TutorFx/diamondlm/commit/4f2952c))
- Updated required llm models ([b2968bb](https://github.com/TutorFx/diamondlm/commit/b2968bb))
- Added server side support ([f43578c](https://github.com/TutorFx/diamondlm/commit/f43578c))
- Added auth ([2228531](https://github.com/TutorFx/diamondlm/commit/2228531))
- Added guides editor ([6f48ae3](https://github.com/TutorFx/diamondlm/commit/6f48ae3))
- Started adding bullmq for embedding models queue ([0ff7c77](https://github.com/TutorFx/diamondlm/commit/0ff7c77))
- Implemented BullMQ producer ([40ca2b5](https://github.com/TutorFx/diamondlm/commit/40ca2b5))
- Asynchronously retrieve chunks without embeddings and add them to the embedding queue ([ba9441a](https://github.com/TutorFx/diamondlm/commit/ba9441a))
- Added the delete operation ([6dc4bbf](https://github.com/TutorFx/diamondlm/commit/6dc4bbf))
- **permissions:** Added basic reading permissions feature ([6c1c592](https://github.com/TutorFx/diamondlm/commit/6c1c592))
- Implement group-specific guides with access control and updated search functionality ([5c2d16f](https://github.com/TutorFx/diamondlm/commit/5c2d16f))
- Implement public guides and group-specific guide management with permission checks, enhanced embedding, and UI adjustments. ([b5c6d24](https://github.com/TutorFx/diamondlm/commit/b5c6d24))
- Moved for a local strategy, implemented ACL permissions for guides, the search tool now respects ACL permissions ([2bbf19b](https://github.com/TutorFx/diamondlm/commit/2bbf19b))
- Lower embedding similarity threshold from 0.3 to 0.0. ([7d46321](https://github.com/TutorFx/diamondlm/commit/7d46321))
- Add truncate guide creation prompt content ([b92cabf](https://github.com/TutorFx/diamondlm/commit/b92cabf))
- Add logger utility using consola for improved logging ([53c3fab](https://github.com/TutorFx/diamondlm/commit/53c3fab))
- Enhance AI assistant configuration and improve search tool output format ([052c68c](https://github.com/TutorFx/diamondlm/commit/052c68c))
- Refactor authentication components to support slot-based descriptions and enhance UI elements ([8b4730f](https://github.com/TutorFx/diamondlm/commit/8b4730f))
- Update navigation to redirect to new chat page and create new chat component ([ea1a5e0](https://github.com/TutorFx/diamondlm/commit/ea1a5e0))
- Revamp landing page with new hero section, feature badges, topic cards, and update primary theme color. ([8c0f70a](https://github.com/TutorFx/diamondlm/commit/8c0f70a))
- Add negative constraint to prevent agent from suggesting tool usage to the user. ([9c8d115](https://github.com/TutorFx/diamondlm/commit/9c8d115))
- Inject embedding-based context into chat prompts and refactor embedding utility functions. ([ef3ddc5](https://github.com/TutorFx/diamondlm/commit/ef3ddc5))
- Render no context placeholder when the last message is not text. ([29a981f](https://github.com/TutorFx/diamondlm/commit/29a981f))
- Implement group creation functionality with a new group-scope layout and access validation middleware. ([33153f8](https://github.com/TutorFx/diamondlm/commit/33153f8))
- Add group creation API endpoint and introduce user permissions to the user schema. ([38ffe4e](https://github.com/TutorFx/diamondlm/commit/38ffe4e))
- Implement group creation with unique slug generation, frontend form, and updated permissions. ([aebd3ab](https://github.com/TutorFx/diamondlm/commit/aebd3ab))
- Improved login page ([#2](https://github.com/TutorFx/diamondlm/pull/2))
- Add API endpoint to fetch user permissions. ([eab62b8](https://github.com/TutorFx/diamondlm/commit/eab62b8))
- Added sidebar menus ([#3](https://github.com/TutorFx/diamondlm/pull/3))
- Improved login page ([#2](https://github.com/TutorFx/diamondlm/pull/2))
- Added sidebar menus ([#3](https://github.com/TutorFx/diamondlm/pull/3))
- Remove unused model import and clean up template syntax ([bb459cf](https://github.com/TutorFx/diamondlm/commit/bb459cf))
- Implemented group `create` ([88c59ef](https://github.com/TutorFx/diamondlm/commit/88c59ef))
- Remove duplicate icon images in topic cards section ([302d041](https://github.com/TutorFx/diamondlm/commit/302d041))
- Remove 'bun' preset from nitro configuration ([b948faa](https://github.com/TutorFx/diamondlm/commit/b948faa))
- Enhance chat interface with keyboard shortcuts and UI improvements ([c376ac2](https://github.com/TutorFx/diamondlm/commit/c376ac2))
- Update UI colors and enhance footer links with navigation menu ([156f70b](https://github.com/TutorFx/diamondlm/commit/156f70b))
- Add motion-v dependency to project ([4b5374a](https://github.com/TutorFx/diamondlm/commit/4b5374a))
- Add motion-v integration for enhanced animations in UI components at `index` ([70e5321](https://github.com/TutorFx/diamondlm/commit/70e5321))
- Implement authentication middleware and enhance form submission events in Login and Register components ([670114c](https://github.com/TutorFx/diamondlm/commit/670114c))
- Add last updated status API and display in UI ([70731d9](https://github.com/TutorFx/diamondlm/commit/70731d9))
- Add changelogen dependency for improved changelog generation ([90a0e5d](https://github.com/TutorFx/diamondlm/commit/90a0e5d))

### 🩹 Fixes

- Moved to bunjs ([cc7f3f8](https://github.com/TutorFx/diamondlm/commit/cc7f3f8))
- Resolve typecheck errors across server and client ([2a2a3c8](https://github.com/TutorFx/diamondlm/commit/2a2a3c8))
- Correct deleteChat function call in template ([5341f96](https://github.com/TutorFx/diamondlm/commit/5341f96))
- Remove unnecessary blank lines in app configuration ([3548e81](https://github.com/TutorFx/diamondlm/commit/3548e81))
- Remove outdated formatting instructions from system configuration ([31e9f78](https://github.com/TutorFx/diamondlm/commit/31e9f78))

### 💅 Refactors

- Removed test task ([fe76324](https://github.com/TutorFx/diamondlm/commit/fe76324))
- Refactored memory usage ([6caec5e](https://github.com/TutorFx/diamondlm/commit/6caec5e))
- Remove Upstash Vector dependency and update documentation to reflect Postgres Vector usage. ([0c28e7b](https://github.com/TutorFx/diamondlm/commit/0c28e7b))
- Remove unused imports and variables, simplify public guide API access, and apply consistent formatting. ([64bf6f3](https://github.com/TutorFx/diamondlm/commit/64bf6f3))
- Add prerender checks to plugins and refactor Redis connection into a singleton utility. ([4519cea](https://github.com/TutorFx/diamondlm/commit/4519cea))
- Switch CI workflow from pnpm to bun, narrow triggers to master branch, and remove typecheck. ([e1b4578](https://github.com/TutorFx/diamondlm/commit/e1b4578))
- Make UI message stream execution asynchronous for context retrieval ([66e62f0](https://github.com/TutorFx/diamondlm/commit/66e62f0))
- Replace UHeader with UDashboardNavbar and update the leading navigation control. ([e64b440](https://github.com/TutorFx/diamondlm/commit/e64b440))

### 📖 Documentation

- Improved docs ([d4ff978](https://github.com/TutorFx/diamondlm/commit/d4ff978))
- Updated documentation ([c537839](https://github.com/TutorFx/diamondlm/commit/c537839))
- Replace Tiptap rich text editor with Monaco code editor in README. ([5a426c9](https://github.com/TutorFx/diamondlm/commit/5a426c9))
- Update example environment variables in README to reflect new PostgreSQL, Ollama, and Redis configurations. ([0830f64](https://github.com/TutorFx/diamondlm/commit/0830f64))

### 📦 Build

- Added docker instance ([7c5be7b](https://github.com/TutorFx/diamondlm/commit/7c5be7b))
- Improved the deployment reducing steps ([7c358c7](https://github.com/TutorFx/diamondlm/commit/7c358c7))

### 🏡 Chore

- Remove Tiptap editor component and its associated dependencies ([fdc6074](https://github.com/TutorFx/diamondlm/commit/fdc6074))
- Remove unused PERMISSIONS import ([aa125ce](https://github.com/TutorFx/diamondlm/commit/aa125ce))
- Lint fixes ([37781c8](https://github.com/TutorFx/diamondlm/commit/37781c8))

### 🎨 Styles

- Improve indentation for `embed.findSimilarChunksAsContext` arguments ([9b6f603](https://github.com/TutorFx/diamondlm/commit/9b6f603))

### ❤️ Contributors

- Gabriel Serejo <gabriel_serejo@live.com>
- Raphael M. Santana ([@RaphaZ99](https://github.com/RaphaZ99))
- Livisghton ([@livisghton](https://github.com/livisghton))

