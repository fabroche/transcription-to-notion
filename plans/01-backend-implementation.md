# Backend Implementation Plan - Clean Architecture

## Objetivo

Crear un servidor Express con Clean Architecture que exponga un endpoint para recibir archivos de audio y prompts, procesarlos usando el MCP de NotebookLLM (servidor Python), y retornar la transcripción con un resumen personalizado.

---

## Arquitectura Actualizada

### Patrón: Layered Architecture (Clean Architecture)

```
backend/
├── src/
│   ├── index.js                    # Entry point
│   ├── api/
│   │   ├── routes/
│   │   │   ├── index.js           # Router registry
│   │   │   └── transcription.router.js
│   │   ├── services/
│   │   │   ├── transcription.service.js
│   │   │   └── notebookLLM.service.js
│   │   ├── schemas/
│   │   │   └── transcription.schema.js  # Joi validation
│   │   ├── middlewares/
│   │   │   ├── upload.middleware.js
│   │   │   ├── validator.middleware.js
│   │   │   └── error.middleware.js
│   │   └── libs/
│   │       └── mcp-client.js      # MCP SDK wrapper
│   └── config/
│       └── index.js               # Environment config
├── uploads/                        # Temp files
├── .env
└── package.json
```

### Separación de Responsabilidades

1. **Routes**: Define endpoints y aplica middlewares
2. **Services**: Lógica de negocio (orquestación)
3. **Libs**: Wrappers de librerías externas (MCP client)
4. **Middlewares**: Validación, upload, error handling
5. **Schemas**: Contratos de validación (DTOs)
6. **Config**: Configuración centralizada

---

## Integración con NotebookLLM MCP

### Información Importante del MCP

**NotebookLLM MCP es un servidor Python**, no Node.js. Características:

- **Instalación**: `uv tool install notebooklm-mcp-server` o `pip install notebooklm-mcp-server`
- **Autenticación**: Requiere cookies de Google extraídas del navegador
- **Comando de auth**: `notebooklm-mcp-auth` (modo auto con Chrome)
- **Tokens guardados en**: `~/.notebooklm-mcp/auth.json`
- **31 tools disponibles**, incluyendo:
  - `notebook_create`
  - `notebook_add_text`
  - `notebook_add_url`
  - `notebook_query`
  - `audio_overview_create`
  - `studio_status`

### Estrategia de Integración

Dado que NotebookLLM MCP es un servidor Python, usaremos el **MCP SDK de Node.js** para conectarnos:

```javascript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
```

El servidor Python se ejecutará como un proceso hijo desde Node.js.

---

## Dependencias Principales

```json
{
  "type": "module",
  "dependencies": {
    "express": "^4.18.2",
    "multer": "^1.4.5-lts.1",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "joi": "^17.11.0",
    "@hapi/boom": "^10.0.1",
    "@modelcontextprotocol/sdk": "^1.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

---

## Implementación por Capas

### 1. Configuration Layer (`src/config/index.js`)

```javascript
import dotenv from "dotenv";

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 3000,
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024, // 50MB
    allowedMimeTypes: [
      "audio/mpeg",
      "audio/wav",
      "audio/mp4",
      "audio/ogg",
      "audio/webm",
    ],
    uploadDir: "./uploads",
  },
  mcp: {
    authTokenPath: process.env.MCP_AUTH_PATH || "~/.notebooklm-mcp/auth.json",
  },
};
```

---

### 2. MCP Client Library (`src/api/libs/mcp-client.js`)

```javascript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { config } from "../../config/index.js";

class MCPClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    if (this.isConnected) return;

    try {
      const transport = new StdioClientTransport({
        command: "notebooklm-mcp-server",
        args: [],
      });

      this.client = new Client(
        {
          name: "transcription-backend",
          version: "1.0.0",
        },
        {
          capabilities: {},
        },
      );

      await this.client.connect(transport);
      this.isConnected = true;
      console.log("✅ Connected to NotebookLLM MCP");
    } catch (error) {
      console.error("❌ Failed to connect to MCP:", error);
      throw error;
    }
  }

  async callTool(toolName, args) {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      const result = await this.client.callTool({
        name: toolName,
        arguments: args,
      });
      return result;
    } catch (error) {
      console.error(`Error calling tool ${toolName}:`, error);
      throw error;
    }
  }

  async disconnect() {
    if (this.client && this.isConnected) {
      await this.client.close();
      this.isConnected = false;
      console.log("Disconnected from MCP");
    }
  }
}

export const mcpClient = new MCPClient();
```

---

### 3. NotebookLLM Service (`src/api/services/notebookLLM.service.js`)

```javascript
import { mcpClient } from "../libs/mcp-client.js";
import fs from "fs/promises";

class NotebookLLMService {
  async createNotebook(name) {
    const result = await mcpClient.callTool("notebook_create", {
      name,
    });
    return result;
  }

  async addAudioToNotebook(notebookId, audioPath) {
    // Leer el archivo de audio como base64 o texto
    const audioContent = await fs.readFile(audioPath, "base64");

    const result = await mcpClient.callTool("notebook_add_text", {
      notebook_id: notebookId,
      title: "Audio Transcription",
      content: audioContent,
    });

    return result;
  }

  async queryNotebook(notebookId, prompt) {
    const result = await mcpClient.callTool("notebook_query", {
      notebook_id: notebookId,
      query: prompt,
    });

    return result;
  }

  async deleteNotebook(notebookId) {
    await mcpClient.callTool("notebook_delete", {
      notebook_id: notebookId,
    });
  }
}

export const notebookLLMService = new NotebookLLMService();
```

---

### 4. Transcription Service (`src/api/services/transcription.service.js`)

**Lógica de Negocio Principal**

```javascript
import { notebookLLMService } from "./notebookLLM.service.js";
import fs from "fs/promises";
import Boom from "@hapi/boom";

class TranscriptionService {
  async processAudio(audioPath, prompt) {
    let notebookId = null;

    try {
      // 1. Crear notebook temporal
      const notebook = await notebookLLMService.createNotebook(
        `Transcription-${Date.now()}`,
      );
      notebookId = notebook.id;

      // 2. Agregar audio al notebook
      await notebookLLMService.addAudioToNotebook(notebookId, audioPath);

      // 3. Hacer query con el prompt personalizado
      const queryResult = await notebookLLMService.queryNotebook(
        notebookId,
        prompt,
      );

      // 4. Extraer transcripción y resumen
      const transcription = queryResult.transcription || "";
      const summary = queryResult.response || "";

      return {
        transcription,
        summary,
      };
    } catch (error) {
      console.error("Error processing audio:", error);
      throw Boom.internal("Failed to process audio with NotebookLLM");
    } finally {
      // 5. Limpiar: eliminar archivo temporal
      try {
        await fs.unlink(audioPath);
      } catch (err) {
        console.error("Error deleting temp file:", err);
      }

      // 6. Limpiar: eliminar notebook temporal
      if (notebookId) {
        try {
          await notebookLLMService.deleteNotebook(notebookId);
        } catch (err) {
          console.error("Error deleting notebook:", err);
        }
      }
    }
  }
}

export const transcriptionService = new TranscriptionService();
```

---

### 5. Validation Schema (`src/api/schemas/transcription.schema.js`)

```javascript
import Joi from "joi";

export const transcriptionSchema = Joi.object({
  prompt: Joi.string().min(10).max(1000).required().messages({
    "string.empty": "Prompt is required",
    "string.min": "Prompt must be at least 10 characters",
    "string.max": "Prompt cannot exceed 1000 characters",
  }),
});
```

---

### 6. Validator Middleware (`src/api/middlewares/validator.middleware.js`)

```javascript
import Boom from "@hapi/boom";

export function validatorHandler(schema, property = "body") {
  return (req, res, next) => {
    const data = req[property];
    const { error } = schema.validate(data, { abortEarly: false });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      next(Boom.badRequest("Validation error", { errors }));
    } else {
      next();
    }
  };
}
```

---

### 7. Upload Middleware (`src/api/middlewares/upload.middleware.js`)

```javascript
import multer from "multer";
import path from "path";
import { config } from "../../config/index.js";
import Boom from "@hapi/boom";

const storage = multer.diskStorage({
  destination: config.upload.uploadDir,
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `audio-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (config.upload.allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(Boom.badRequest("Only audio files are allowed"), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize,
  },
});
```

---

### 8. Error Middleware (`src/api/middlewares/error.middleware.js`)

```javascript
import Boom from "@hapi/boom";

export function errorHandler(err, req, res, next) {
  console.error("Error:", err);

  // Multer errors
  if (err.code === "LIMIT_FILE_SIZE") {
    const boomError = Boom.badRequest("File size exceeds the limit");
    return res
      .status(boomError.output.statusCode)
      .json(boomError.output.payload);
  }

  // Boom errors
  if (Boom.isBoom(err)) {
    return res.status(err.output.statusCode).json(err.output.payload);
  }

  // Generic errors
  const error = Boom.internal("Internal server error");
  res.status(error.output.statusCode).json(error.output.payload);
}
```

---

### 9. Router (`src/api/routes/transcription.router.js`)

```javascript
import express from "express";
import { upload } from "../middlewares/upload.middleware.js";
import { validatorHandler } from "../middlewares/validator.middleware.js";
import { transcriptionSchema } from "../schemas/transcription.schema.js";
import { transcriptionService } from "../services/transcription.service.js";
import Boom from "@hapi/boom";

export const router = express.Router();

router.post(
  "/transcribe",
  upload.single("audio"),
  validatorHandler(transcriptionSchema, "body"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        throw Boom.badRequest("Audio file is required");
      }

      const { prompt } = req.body;
      const audioPath = req.file.path;

      const result = await transcriptionService.processAudio(audioPath, prompt);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
);
```

---

### 10. Routes Registry (`src/api/routes/index.js`)

```javascript
import express from "express";
import { router as transcriptionRouter } from "./transcription.router.js";

export function routerApi(app) {
  const router = express.Router();
  app.use("/api/v1", router);

  router.use("/transcription", transcriptionRouter);
}
```

---

### 11. Main Entry Point (`src/index.js`)

```javascript
import express from "express";
import cors from "cors";
import { config } from "./config/index.js";
import { routerApi } from "./api/routes/index.js";
import { errorHandler } from "./api/middlewares/error.middleware.js";
import { mcpClient } from "./api/libs/mcp-client.js";

const app = express();

// Middlewares
app.use(
  cors({
    origin: config.corsOrigin,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
routerApi(app);

// Error handler (debe ir al final)
app.use(errorHandler);

// Server
const server = app.listen(config.port, async () => {
  console.log(`🚀 Server running on port ${config.port}`);

  // Conectar al MCP al iniciar
  try {
    await mcpClient.connect();
  } catch (error) {
    console.error("Failed to connect to MCP on startup");
  }
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, closing server...");
  await mcpClient.disconnect();
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
```

---

## Variables de Entorno (`.env`)

```env
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173
MAX_FILE_SIZE=52428800
MCP_AUTH_PATH=~/.notebooklm-mcp/auth.json
```

---

## Scripts de Package.json

```json
{
  "name": "transcription-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js"
  }
}
```

---

## Prerequisitos de Instalación

### 1. Instalar NotebookLLM MCP Server (Python)

```bash
# Opción 1: Con uv (recomendado)
uv tool install notebooklm-mcp-server

# Opción 2: Con pip
pip install notebooklm-mcp-server
```

### 2. Autenticar con NotebookLLM

```bash
# Modo automático (abre Chrome)
notebooklm-mcp-auth

# Sigue las instrucciones para iniciar sesión con Google
# Los tokens se guardarán en ~/.notebooklm-mcp/auth.json
```

### 3. Verificar Instalación

```bash
# Verificar que el comando está disponible
notebooklm-mcp-server --help
```

---

## Plan de Verificación

### Test 1: Verificar MCP Connection

```bash
cd backend
npm install
npm run dev
```

**Resultado esperado**:

- `✅ Connected to NotebookLLM MCP` en la consola

### Test 2: Test con cURL

```bash
curl -X POST http://localhost:3000/api/v1/transcription/transcribe \
  -F "audio=@test-audio.mp3" \
  -F "prompt=Genera un resumen ejecutivo de esta conversación"
```

**Resultado esperado**:

```json
{
  "success": true,
  "data": {
    "transcription": "...",
    "summary": "..."
  }
}
```

### Test 3: Validaciones

```bash
# Sin archivo
curl -X POST http://localhost:3000/api/v1/transcription/transcribe \
  -F "prompt=Test"
# Esperado: 400 Bad Request

# Sin prompt
curl -X POST http://localhost:3000/api/v1/transcription/transcribe \
  -F "audio=@test.mp3"
# Esperado: 400 Bad Request

# Prompt muy corto
curl -X POST http://localhost:3000/api/v1/transcription/transcribe \
  -F "audio=@test.mp3" \
  -F "prompt=Hi"
# Esperado: 400 Bad Request (min 10 caracteres)
```

---

## Beneficios de Clean Architecture

1. **Separación de Responsabilidades**: Cada capa tiene un propósito claro
2. **Testeable**: Services y libs pueden testearse independientemente
3. **Escalable**: Fácil agregar nuevos endpoints o servicios
4. **Mantenible**: Código organizado y fácil de navegar
5. **Reutilizable**: Services pueden usarse desde múltiples routers

---

## Próximos Pasos

1. Implementar la estructura de carpetas
2. Instalar dependencias
3. Configurar NotebookLLM MCP
4. Implementar cada capa en orden: Config → Libs → Services → Middlewares → Routes → Index
5. Probar con cURL/Postman
6. Proceder con el frontend
