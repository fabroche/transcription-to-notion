# NotebookLM Query API - Project Memory

> **Last Updated:** 2026-01-17
> **Status:** Production-ready backend with auth management
> **Version:** 1.0.0

---

## 📋 Project Overview

**Name:** NotebookLM Query API  
**Purpose:** Backend API for querying NotebookLM notebooks via Model Context Protocol (MCP)  
**Repository:** https://github.com/fabroche/transcription-to-notion

### Current Focus

The project provides a RESTful API to interact with NotebookLM notebooks programmatically. Users can list notebooks, query them with natural language prompts, and manage MCP authentication without server restarts.

---

## 🏗️ Architecture

### Tech Stack

**Backend:**

- TypeScript + Node.js + Express
- NotebookLM MCP Server (Python)
- Joi (validation) + @hapi/boom (errors)
- Clean Architecture pattern

**Development:**

- tsx (hot reload)
- Git + GitHub
- Conventional commits

### Project Structure

```
transcription-to-notion/
├── backend/                    # Node.js backend
│   ├── src/
│   │   ├── api/
│   │   │   ├── libs/          # MCP client wrapper
│   │   │   ├── services/      # Business logic
│   │   │   ├── routes/        # API endpoints
│   │   │   ├── schemas/       # Validation
│   │   │   └── middlewares/   # Error handling
│   │   ├── config/            # Configuration
│   │   └── index.ts           # Entry point
│   ├── .env                   # Environment variables
│   └── package.json
├── .agent/
│   └── workflows/
│       └── create-pull-request.md  # PR workflow
├── plans/                     # Implementation docs
└── README.md                  # Project documentation
```

---

## 🔌 API Endpoints

### Notebook Operations

| Endpoint                      | Method | Purpose                |
| ----------------------------- | ------ | ---------------------- |
| `GET /api/v1/notebook/list`   | GET    | List all notebooks     |
| `POST /api/v1/notebook/query` | POST   | Query notebook by name |
| `GET /api/v1/notebook/health` | GET    | Health check           |

### Authentication Management

| Endpoint                      | Method | Purpose              |
| ----------------------------- | ------ | -------------------- |
| `POST /api/v1/auth/reconnect` | POST   | Reconnect MCP client |
| `GET /api/v1/auth/health`     | GET    | Auth service health  |

---

## 🔑 Key Decisions

### 1. Removed Transcription Functionality (PR #2)

**Decision:** Focus exclusively on notebook queries  
**Rationale:** Simplify codebase and clarify project purpose  
**Impact:** Removed 5 files, updated 8 files, -252/+658 lines

**Removed:**

- Audio transcription service
- File upload middleware (Multer)
- Transcription endpoints
- Upload directory

### 2. Auth Reconnect Endpoint (PR #3)

**Decision:** Manual auth + reconnect endpoint instead of automation  
**Rationale:** `notebooklm-mcp-auth` is interactive (opens Chrome)  
**Impact:** Added 3 files, +459 lines

**Why not automate?**

- Command requires browser interaction
- Cannot run in non-interactive mode
- WebSocket errors when attempted

**Solution:**

1. User runs `notebooklm-mcp-auth` manually
2. User calls `/api/v1/auth/reconnect`
3. Server reloads credentials without restart

### 3. Clean Architecture

**Decision:** Layered architecture with clear separation  
**Rationale:** Maintainability and scalability

**Layers:**

- Config: Environment and settings
- Libs: External library wrappers (MCP)
- Services: Business logic
- Schemas: Data validation
- Middlewares: Request processing
- Routes: API endpoints

---

## 📝 Development Workflow

### Commit Standards

Format: `<type>: <description>`

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `docs`: Documentation
- `chore`: Maintenance

**Example:**

```
feat: add auth reconnect endpoint

Implemented authentication reconnect endpoint to reload MCP credentials
without server restart.

Changes:
- Created auth.service.ts with reconnect method
- Created auth.router.ts with POST /reconnect endpoint
- Added auth routes to main router

New endpoints:
- POST /api/v1/auth/reconnect
- GET /api/v1/auth/health

Files created: 2
Files modified: 1
```

### Pull Request Workflow

Use `/create-pull-request` workflow for standardized PRs:

1. Review changes (`git status`, `git diff`)
2. Stage changes (`git add -A`)
3. Create commit with detailed message
4. Push to branch
5. Create PR with comprehensive description
6. Include testing verification
7. Add impact statistics

**PR Template includes:**

- 🔄 Breaking Changes / New Feature
- 📝 Changes Summary
- ✅ New/Active Endpoints
- 🧪 Testing
- 📊 Impact

---

## 🔧 Configuration

### Environment Variables

```env
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173
MCP_AUTH_PATH=~/.notebooklm-mcp/auth.json
```

### MCP Setup

**Prerequisites:**

- Python >= 3.8
- Google Chrome
- Google Account with NotebookLM access

**Installation:**

```bash
# Install MCP server
uv tool install notebooklm-mcp-server

# Authenticate
notebooklm-mcp-auth

# Verify
ls ~/.notebooklm-mcp/auth.json
```

---

## 🐛 Common Issues

### Authentication Expired

**Symptoms:** MCP connection fails, "Authentication expired" error

**Solution:**

```bash
# Option 1: Reconnect without restart (recommended)
notebooklm-mcp-auth
curl -X POST http://localhost:3000/api/v1/auth/reconnect

# Option 2: Restart server
notebooklm-mcp-auth
npm run dev
```

### MCP Connection Failed

**Symptoms:** "Failed to connect to MCP" on startup

**Solution:**

```bash
# Verify MCP server installed
notebooklm-mcp-server --help

# Reinstall if needed
uv tool install notebooklm-mcp-server --force
```

### Notebook Not Found

**Symptoms:** 404 error when querying notebook

**Solution:**

- List notebooks: `GET /api/v1/notebook/list`
- Use exact title (case-insensitive)
- Create notebook in NotebookLM if needed

---

## 📚 Documentation

### Available Docs

| Document                                  | Purpose          | Status      |
| ----------------------------------------- | ---------------- | ----------- |
| `README.md`                               | Project overview | ✅ Complete |
| `backend/README.md`                       | Backend docs     | ✅ Complete |
| `backend/MCP_SETUP_GUIDE.md`              | MCP setup        | ✅ Complete |
| `backend/TESTING_GUIDE.md`                | Testing guide    | ✅ Complete |
| `.agent/workflows/create-pull-request.md` | PR workflow      | ✅ Complete |

### Documentation Standards

- Professional formatting with emojis
- Comprehensive API documentation
- Practical curl examples
- Troubleshooting sections
- Bilingual (English/Spanish)

---

## 🚀 Deployment

### Development

```bash
cd backend
npm install
npm run dev
```

### Production

```bash
cd backend
npm install
npm run build
npm start
```

### Health Check

```bash
curl http://localhost:3000/api/v1/notebook/health
curl http://localhost:3000/api/v1/auth/health
```

---

## 📊 Project History

### Major Milestones

**2026-01-17:**

- ✅ Removed transcription functionality (PR #2)
- ✅ Added auth reconnect endpoint (PR #3)
- ✅ Created PR workflow
- ✅ Updated all documentation

**Previous:**

- ✅ Implemented notebook query endpoints
- ✅ MCP integration
- ✅ Clean architecture setup

### Pull Requests

| PR #                                                             | Title                              | Status    | Impact              |
| ---------------------------------------------------------------- | ---------------------------------- | --------- | ------------------- |
| [#2](https://github.com/fabroche/transcription-to-notion/pull/2) | Remove transcription functionality | ✅ Merged | 11 files, +658/-252 |
| [#3](https://github.com/fabroche/transcription-to-notion/pull/3) | Add auth reconnect endpoint        | 🔄 Open   | 4 files, +459/0     |

---

## 🎯 Future Roadmap

### Short Term

- [ ] Merge PR #3
- [ ] Add unit tests
- [ ] Implement logging

### Medium Term

- [ ] Create notebook endpoint
- [ ] Delete notebook endpoint
- [ ] Add sources to notebook

### Long Term

- [ ] Frontend (React + Vite + shadcn/ui)
- [ ] Rate limiting
- [ ] API key authentication
- [ ] Monitoring/metrics

---

## 🔐 Security Considerations

### Current State

- MCP auth via Google OAuth (handled by notebooklm-mcp-auth)
- Credentials stored in `~/.notebooklm-mcp/auth.json`
- CORS enabled for localhost:5173
- No API key authentication

### Recommendations

- Add rate limiting
- Implement API keys for production
- Add request logging
- Monitor auth token expiration

---

## 💡 Best Practices

### Code Quality

- ✅ TypeScript strict mode
- ✅ No lint errors
- ✅ Clean architecture
- ✅ Error handling with Boom
- ✅ Request validation with Joi

### Git Workflow

- ✅ Conventional commits
- ✅ Feature branches
- ✅ Comprehensive PR descriptions
- ✅ Testing before merge

### Documentation

- ✅ Keep README updated
- ✅ Document all endpoints
- ✅ Include examples
- ✅ Maintain troubleshooting guides

---

## 📞 Support

**Repository:** https://github.com/fabroche/transcription-to-notion  
**Issues:** https://github.com/fabroche/transcription-to-notion/issues  
**Author:** [@fabroche](https://github.com/fabroche)

---

## 🔄 Quick Reference

### Start Server

```bash
cd backend && npm run dev
```

### Test Endpoints

```bash
# List notebooks
curl http://localhost:3000/api/v1/notebook/list

# Query notebook
curl -X POST http://localhost:3000/api/v1/notebook/query \
  -H "Content-Type: application/json" \
  -d '{"notebookTitle": "My Notebook", "prompt": "Summarize"}'

# Reconnect auth
curl -X POST http://localhost:3000/api/v1/auth/reconnect
```

### Refresh Auth

```bash
notebooklm-mcp-auth
curl -X POST http://localhost:3000/api/v1/auth/reconnect
```

---

**This document serves as the project's memory. Update it when making significant changes.**
