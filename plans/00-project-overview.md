# NotebookLM Query API - Project Overview

> **Last Updated:** 2026-01-17
> **Status:** Backend Complete - Production Ready
> **Version:** 1.0.0

## Project Description

This application provides a RESTful API to interact with NotebookLM notebooks programmatically. Users can list their existing notebooks, query them with natural language prompts, and manage MCP authentication without server restarts.

**Key Change:** The project originally focused on audio transcription but has been refactored to focus exclusively on querying existing NotebookLM notebooks via the Model Context Protocol (MCP).

---

## Architecture

```
transcription-to-notion/
├── backend/          # Node.js + Express + TypeScript API (✅ COMPLETE)
├── frontend/         # React + Vite + shadcn/ui (⏳ PLANNED)
├── plans/           # Implementation documentation
└── CLAUDE.md        # Project memory and context
```

---

## Tech Stack

### Backend (✅ Implemented)

| Technology                      | Purpose                       | Status      |
| ------------------------------- | ----------------------------- | ----------- |
| **TypeScript**                  | Type safety and better DX     | ✅ Complete |
| **Node.js**                     | Runtime (ES Modules)          | ✅ Complete |
| **Express**                     | Web framework                 | ✅ Complete |
| **NotebookLM MCP**              | AI query service              | ✅ Complete |
| **@modelcontextprotocol/sdk**   | MCP client SDK                | ✅ Complete |
| **Joi**                         | Request validation            | ✅ Complete |
| **@hapi/boom**                  | HTTP error handling           | ✅ Complete |
| **CORS**                        | Frontend cross-origin support | ✅ Complete |
| **tsx**                         | TypeScript hot reload         | ✅ Complete |

### Frontend (⏳ Planned)

| Technology       | Purpose       | Status   |
| ---------------- | ------------- | -------- |
| **React 18**     | UI framework  | ⏳ Planned |
| **Vite**         | Build tool    | ⏳ Planned |
| **shadcn/ui**    | UI components | ⏳ Planned |
| **Tailwind CSS** | Styling       | ⏳ Planned |
| **Axios**        | HTTP client   | ⏳ Planned |

### External Services

**NotebookLM MCP Server** - Python-based MCP server for NotebookLM integration

- **Installation:** `uv tool install notebooklm-mcp-server`
- **Authentication:** `notebooklm-mcp-auth` (opens Chrome, extracts Google cookies)
- **Credentials Path:** `~/.notebooklm-mcp/auth.json`
- **Transport:** Stdio (spawns Python process from Node.js)

---

## Core Features (MVP)

### Backend (✅ Complete)

**Notebook Operations:**

1. **GET `/api/v1/notebook/list`**
   - Lists all NotebookLM notebooks for authenticated user
   - Returns: notebook ID, title, URL

2. **POST `/api/v1/notebook/query`**
   - Query specific notebook by title with natural language prompt
   - Receives: `notebookTitle` (string), `prompt` (string)
   - Returns: AI-generated answer, notebook metadata

3. **GET `/api/v1/notebook/health`**
   - Health check for notebook service

**Authentication Management:**

4. **POST `/api/v1/auth/reconnect`**
   - Reconnects MCP client to reload credentials without server restart
   - Use after running `notebooklm-mcp-auth` to refresh tokens

5. **GET `/api/v1/auth/health`**
   - Health check for auth service

### Frontend (⏳ Planned)

1. **Notebook Browser**
   - Display list of available notebooks
   - Search and filter notebooks

2. **Query Interface**
   - Select notebook from list
   - Enter natural language prompt
   - Submit query button

3. **Results Display**
   - Show AI-generated answer
   - Display notebook context
   - Loading and error states

4. **Authentication UI**
   - Visual indicator for auth status
   - Reconnect button for expired sessions

---

## Implementation Phases

### Phase 1: Backend Implementation ✅ COMPLETE

- [x] Initialize TypeScript + Express project
- [x] Configure Clean Architecture structure
- [x] Implement MCP client wrapper
- [x] Create notebook query service
- [x] Build notebook list endpoint
- [x] Build notebook query endpoint
- [x] Implement auth reconnect endpoint
- [x] Add request validation (Joi)
- [x] Add error handling (Boom)
- [x] Configure CORS
- [x] Add health check endpoints
- [x] Test with curl/Postman

**Removed from original plan:**
- ❌ Audio file upload (Multer)
- ❌ Transcription service
- ❌ Upload directory management

**Added beyond original plan:**
- ✅ Auth reconnect endpoint
- ✅ TypeScript migration
- ✅ Health check endpoints
- ✅ Clean Architecture pattern

### Phase 2: Frontend Implementation ⏳ NEXT

- [ ] Initialize React + Vite + TypeScript project
- [ ] Configure shadcn/ui + Tailwind
- [ ] Create notebook list component
- [ ] Create notebook selector component
- [ ] Create query input component
- [ ] Create results display component
- [ ] Implement API client
- [ ] Add loading and error states
- [ ] Create auth status indicator
- [ ] Test UI/UX flow

### Phase 3: Integration & Testing ⏳ PLANNED

- [ ] Connect frontend to backend
- [ ] End-to-end testing
- [ ] Error handling verification
- [ ] Performance optimization
- [ ] Documentation updates
- [ ] Deployment preparation

---

## Key Architectural Decisions

### 1. Focus on Notebook Queries (Not Transcription)

**Decision:** Removed all transcription and audio upload functionality
**Rationale:** Simplify scope, focus on notebook querying use case
**Impact:**
- Removed Multer dependency
- Removed file upload endpoints
- Removed transcription service layer
- Smaller, more focused codebase

### 2. Manual Auth with Reconnect Endpoint

**Decision:** Manual `notebooklm-mcp-auth` + API reconnect endpoint
**Rationale:** MCP auth command requires interactive browser session
**Impact:**
- User runs auth command manually in terminal
- User calls `/auth/reconnect` to reload credentials
- No server restart required
- Simpler than automation attempts

### 3. Clean Architecture Pattern

**Decision:** Layered architecture with clear separation of concerns
**Rationale:** Maintainability, testability, scalability
**Layers:**
- **Config:** Environment and settings
- **Libs:** MCP client wrapper
- **Services:** Business logic (notebookLLM, notebookQuery, auth)
- **Schemas:** Joi validation schemas
- **Middlewares:** Validation, error handling
- **Routes:** API endpoint definitions

### 4. TypeScript for Type Safety

**Decision:** Full TypeScript implementation
**Rationale:** Better DX, fewer runtime errors, clearer interfaces
**Impact:**
- Strict mode enabled
- All services and routes typed
- Better IDE support
- Easier refactoring

---

## Prerequisites

### Required Software

- **Node.js** >= 18.x
- **npm** or **yarn**
- **Python** >= 3.8 (for NotebookLM MCP Server)
- **Google Chrome** (for MCP authentication)
- **Google Account** with NotebookLM access

### MCP Server Setup

```bash
# Option 1: Install with uv (recommended)
uv tool install notebooklm-mcp-server

# Option 2: Install with pip
pip install notebooklm-mcp-server

# Authenticate
notebooklm-mcp-auth

# Verify credentials
ls ~/.notebooklm-mcp/auth.json  # Unix/Mac
dir $HOME\.notebooklm-mcp\auth.json  # Windows
```

---

## Quick Start

### Backend Development

```bash
cd backend
npm install
npm run dev
# Server running at http://localhost:3000
```

### Test Endpoints

```bash
# Health check
curl http://localhost:3000/api/v1/notebook/health

# List notebooks
curl http://localhost:3000/api/v1/notebook/list

# Query notebook
curl -X POST http://localhost:3000/api/v1/notebook/query \
  -H "Content-Type: application/json" \
  -d '{"notebookTitle": "My Notebook", "prompt": "Summarize the main topics"}'

# Reconnect auth (after running notebooklm-mcp-auth)
curl -X POST http://localhost:3000/api/v1/auth/reconnect
```

---

## Project Status Summary

| Component        | Status         | Progress |
| ---------------- | -------------- | -------- |
| Backend API      | ✅ Complete    | 100%     |
| MCP Integration  | ✅ Complete    | 100%     |
| Auth Management  | ✅ Complete    | 100%     |
| Frontend         | ⏳ Not Started | 0%       |
| Integration      | ⏳ Not Started | 0%       |
| Deployment       | ⏳ Not Started | 0%       |

---

## Future Enhancements

### Short Term
- [ ] Implement frontend UI
- [ ] Add unit tests
- [ ] Implement structured logging
- [ ] Add API documentation (OpenAPI/Swagger)

### Medium Term
- [ ] Create notebook endpoint
- [ ] Delete notebook endpoint
- [ ] Add sources to notebook
- [ ] Batch query operations

### Long Term
- [ ] Rate limiting
- [ ] API key authentication
- [ ] Caching layer (Redis)
- [ ] Monitoring and metrics
- [ ] Multi-user support
- [ ] Deployment to cloud (Railway/Render)

---

## Documentation

- **Main README:** Project overview and setup instructions
- **Backend README:** Backend-specific documentation
- **MCP Setup Guide:** Detailed MCP installation and auth
- **Testing Guide:** API testing examples
- **CLAUDE.md:** Project memory and decision log (this serves as the source of truth)

---

## References

- **Repository:** https://github.com/fabroche/transcription-to-notion
- **NotebookLM MCP:** https://github.com/jacob-bd/notebooklm-mcp
- **Model Context Protocol:** https://modelcontextprotocol.io/
- **Google NotebookLM:** https://notebooklm.google.com

---

**This plan reflects the current state of the project as of January 2026. The backend is production-ready; frontend development is the next phase.**
