# Audio Transcription & Summary App - Project Overview

## Descripción del Proyecto

Esta aplicación permite a los usuarios subir archivos de audio junto con un prompt personalizado. El backend se conecta con el MCP de NotebookLLM para transcribir el audio y generar un resumen basado en el prompt proporcionado.

## Arquitectura

```
transcription-to-notion/
├── backend/          # Node.js + Express API
├── frontend/         # React + Vite + shadcn/ui
└── plans/           # Documentación de implementación
```

## Stack Tecnológico

### Backend

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Architecture**: Clean Architecture (Layered)
- **MCP Integration**: NotebookLLM MCP Server (Python) vía `@modelcontextprotocol/sdk`
- **File Upload**: Multer
- **Validation**: Joi
- **Error Handling**: @hapi/boom
- **CORS**: Para permitir requests desde el frontend

### Frontend

- **Framework**: React 18
- **Build Tool**: Vite
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS (requerido por shadcn)
- **HTTP Client**: Axios

### External Services

- **NotebookLLM MCP Server**: Servidor Python para transcripción y análisis de audio
  - Instalación: `uv tool install notebooklm-mcp-server`
  - Autenticación: `notebooklm-mcp-auth` (extrae cookies de Google)
  - Tokens: `~/.notebooklm-mcp/auth.json`

## Funcionalidades Core (MVP)

### Backend

1. **Endpoint POST `/api/transcribe`**
   - Recibe: archivo de audio + prompt (texto)
   - Procesa: envía audio al MCP de NotebookLLM
   - Retorna: transcripción + resumen basado en el prompt

### Frontend

1. **Interfaz de Upload**
   - Selector de archivo de audio
   - Campo de texto para el prompt
   - Botón de submit
2. **Visualización de Resultados**
   - Mostrar transcripción completa
   - Mostrar resumen generado
   - Estados de carga y errores

## Fases de Implementación

### Fase 1: Backend Setup ✓ (Siguiente)

- Inicializar proyecto Node.js
- Configurar Express
- Implementar endpoint de transcripción
- Integrar NotebookLLM MCP

### Fase 2: Frontend Setup

- Inicializar proyecto React + Vite
- Configurar shadcn/ui
- Crear componentes básicos

### Fase 3: Integración

- Conectar frontend con backend
- Testing end-to-end
- Refinamiento de UI/UX
