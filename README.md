# 🔍 NotebookLM Query API

> **Query your NotebookLM notebooks programmatically using the Model Context Protocol (MCP)**

A backend API that allows you to list and query existing NotebookLLM notebooks through a RESTful interface, powered by the NotebookLLM MCP Server.

---

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

---

## ✨ Features

- 📚 **List Notebooks**: Get all your NotebookLLM notebooks
- 🔍 **Query Notebooks**: Ask questions to specific notebooks by name
- 🤖 **AI-Powered**: Leverages NotebookLLM's AI capabilities via MCP
- 🚀 **Clean Architecture**: Modular, maintainable, and scalable codebase
- 🔒 **Type Safety**: Full TypeScript implementation
- 🎨 **Modern UI**: React + Vite + shadcn/ui (planned)

---

## 🏗️ Architecture

```
notebook-query-api/
├── backend/          # Node.js + Express + TypeScript API
├── frontend/         # React + Vite (planned)
└── plans/           # Implementation documentation
```

### Backend Architecture (Clean Architecture)

```
backend/src/
├── config/              # Centralized configuration
├── api/
│   ├── libs/           # External library wrappers (MCP client)
│   ├── services/       # Business logic
│   ├── schemas/        # Validation schemas (Joi)
│   ├── middlewares/    # Validation, error handling
│   └── routes/         # API endpoints
└── index.ts            # Application entry point
```

---

## 🛠️ Tech Stack

### Backend

| Technology         | Purpose                   |
| ------------------ | ------------------------- |
| **TypeScript**     | Type safety and better DX |
| **Node.js**        | JavaScript runtime        |
| **Express**        | Web framework             |
| **NotebookLM MCP** | AI query service          |
| **Joi**            | Request validation        |
| **@hapi/boom**     | Error handling            |

### Frontend (Planned)

| Technology       | Purpose       |
| ---------------- | ------------- |
| **React 18**     | UI framework  |
| **Vite**         | Build tool    |
| **shadcn/ui**    | UI components |
| **Tailwind CSS** | Styling       |
| **Axios**        | HTTP client   |

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.x
- **npm** or **yarn**
- **Python** >= 3.8 (for NotebookLM MCP)
- **Google Chrome** (for MCP authentication)
- **Google Account** (for NotebookLLM access)

### Install NotebookLM MCP Server

Choose one of the following methods:

#### Option A: Using `uv` (Recommended)

```bash
# Install uv (if not already installed)
# Windows (PowerShell)
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"

# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install NotebookLM MCP Server
uv tool install notebooklm-mcp-server
```

#### Option B: Using `pip`

```bash
pip install notebooklm-mcp-server
```

### Verify Installation

```bash
notebooklm-mcp-server --help
```

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/fabroche/transcription-to-notion.git
cd transcription-to-notion
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Authenticate with NotebookLM

```bash
notebooklm-mcp-auth
```

This will:

1. Open Chrome browser
2. Prompt you to log in to your Google account
3. Navigate to notebooklm.google.com
4. Extract and save authentication cookies to `~/.notebooklm-mcp/auth.json`

### 4. Verify Authentication

```bash
# Windows
dir $HOME\.notebooklm-mcp\auth.json

# macOS/Linux
ls ~/.notebooklm-mcp/auth.json
```

---

## ⚙️ Configuration

The backend uses environment variables for configuration. The `.env` file is already configured with default values:

```env
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173
MCP_AUTH_PATH=~/.notebooklm-mcp/auth.json
```

### Configuration Options

| Variable        | Description           | Default                       |
| --------------- | --------------------- | ----------------------------- |
| `NODE_ENV`      | Environment mode      | `development`                 |
| `PORT`          | Server port           | `3000`                        |
| `CORS_ORIGIN`   | Allowed CORS origin   | `http://localhost:5173`       |
| `MCP_AUTH_PATH` | Path to MCP auth file | `~/.notebooklm-mcp/auth.json` |

---

## 🎯 Usage

### Start the Backend Server

```bash
cd backend

# Development mode (with hot reload)
npm run dev

# Production mode (requires build first)
npm run build
npm start
```

Expected output:

```
🚀 ========================================
🚀 Server running on port 3000
🚀 Environment: development
🚀 CORS Origin: http://localhost:5173
🚀 ========================================

✅ Connected to NotebookLLM MCP
```

### Test the API

#### Health Check

```bash
curl http://localhost:3000/api/v1/notebook/health
```

#### List Notebooks

```bash
curl http://localhost:3000/api/v1/notebook/list
```

#### Query a Notebook

```bash
curl -X POST http://localhost:3000/api/v1/notebook/query \
  -H "Content-Type: application/json" \
  -d '{
    "notebookTitle": "My Notebook",
    "prompt": "What are the main topics discussed?"
  }'
```

---

## 📚 API Documentation

### Base URL

```
http://localhost:3000
```

### Endpoints

#### `GET /`

Get API information

**Response:**

```json
{
  "message": "NotebookLM Query API",
  "version": "1.0.0",
  "endpoints": {
    "notebookList": "GET /api/v1/notebook/list",
    "notebookQuery": "POST /api/v1/notebook/query",
    "notebookHealth": "GET /api/v1/notebook/health"
  }
}
```

---

#### `GET /api/v1/notebook/list`

List all NotebookLM notebooks

**Response:**

```json
{
  "success": true,
  "data": {
    "notebooks": [
      {
        "id": "abc123...",
        "title": "My Notebook",
        "url": "https://notebooklm.google.com/notebook/..."
      }
    ],
    "count": 1
  }
}
```

---

#### `POST /api/v1/notebook/query`

Query an existing notebook by name

**Request:**

- **Content-Type:** `application/json`
- **Body:**

```json
{
  "notebookTitle": "My Notebook",
  "prompt": "What are the main topics?"
}
```

**Validation:**

- `notebookTitle`: String, 1-200 characters, required
- `prompt`: String, 10-1000 characters, required

**Response:**

```json
{
  "success": true,
  "data": {
    "answer": "AI-generated answer based on notebook content...",
    "notebookId": "abc123...",
    "notebookTitle": "My Notebook"
  }
}
```

**Error Response:**

```json
{
  "statusCode": 404,
  "error": "Not Found",
  "message": "Notebook \"My Notebook\" not found. Available notebooks: Notebook1, Notebook2"
}
```

---

#### `GET /api/v1/notebook/health`

Notebook service health check

**Response:**

```json
{
  "success": true,
  "message": "Notebook query service is running",
  "timestamp": "2026-01-17T19:30:00.000Z"
}
```

---

## 📁 Project Structure

```
notebook-query-api/
├── backend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── libs/
│   │   │   │   └── mcp-client.ts          # MCP client wrapper
│   │   │   ├── middlewares/
│   │   │   │   ├── error.middleware.ts    # Error handling
│   │   │   │   └── validator.middleware.ts # Request validation
│   │   │   ├── routes/
│   │   │   │   ├── index.ts               # Routes registry
│   │   │   │   └── notebookQuery.router.ts
│   │   │   ├── schemas/
│   │   │   │   └── notebookQuery.schema.ts
│   │   │   └── services/
│   │   │       ├── notebookLLM.service.ts # NotebookLLM operations
│   │   │       └── notebookQuery.service.ts
│   │   ├── config/
│   │   │   └── index.ts                   # Configuration
│   │   └── index.ts                       # Entry point
│   ├── .env                               # Environment variables
│   ├── .gitignore
│   ├── package.json
│   ├── tsconfig.json
│   ├── README.md                          # Backend documentation
│   ├── MCP_SETUP_GUIDE.md                 # MCP setup guide
│   └── TESTING_GUIDE.md                   # Testing guide
├── frontend/                              # (Planned)
├── plans/                                 # Implementation plans
│   ├── 00-project-overview.md
│   ├── 01-backend-implementation.md
│   ├── 02-frontend-implementation.md
│   └── 03-integration-testing.md
├── .gitignore
└── README.md                              # This file
```

---

## 🔧 Development

### Available Scripts

```bash
# Backend
cd backend

# Development mode with hot reload
npm run dev

# Type checking without compilation
npm run type-check

# Build TypeScript to JavaScript
npm run build

# Production mode (requires build first)
npm start
```

### Code Quality

The project follows Clean Architecture principles:

- **Config Layer**: Centralized configuration
- **Libs Layer**: External library wrappers
- **Services Layer**: Business logic
- **Schemas Layer**: Data validation
- **Middlewares Layer**: Request processing
- **Routes Layer**: API endpoints

---

## 🐛 Troubleshooting

### Error: "Failed to connect to MCP"

**Cause:** NotebookLLM MCP Server is not installed or not in PATH

**Solution:**

```bash
# Verify installation
notebooklm-mcp-server --help

# Reinstall if needed
uv tool install notebooklm-mcp-server --force
```

---

### Error: "Authentication expired"

**Cause:** MCP authentication tokens are expired

**Solution:**

```bash
# Re-authenticate
notebooklm-mcp-auth

# Verify auth file exists
ls ~/.notebooklm-mcp/auth.json

# Restart the backend server
npm run dev
```

---

### Error: "Notebook not found"

**Cause:** Notebook with specified title doesn't exist

**Solution:**

- List all notebooks: `GET /api/v1/notebook/list`
- Use exact notebook title (case-insensitive)
- Create a new notebook in NotebookLM if needed

---

### Error: "CORS policy"

**Cause:** Frontend origin not allowed

**Solution:**

- Verify `CORS_ORIGIN` in `.env` matches your frontend URL
- Default is `http://localhost:5173` for Vite

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

## 🙏 Acknowledgments

- [NotebookLM MCP Server](https://github.com/jacob-bd/notebooklm-mcp) by jacob-bd
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Google NotebookLM](https://notebooklm.google.com)

---

## 📞 Support

For issues, questions, or suggestions:

- Open an issue on [GitHub](https://github.com/fabroche/transcription-to-notion/issues)
- Check the [MCP Setup Guide](backend/MCP_SETUP_GUIDE.md)
- Review the [Testing Guide](backend/TESTING_GUIDE.md)

---

**Made with ❤️ by [fabroche](https://github.com/fabroche)**
