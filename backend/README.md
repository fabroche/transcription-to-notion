# Audio Transcription Backend (TypeScript)

Backend API para transcripción de audio usando NotebookLLM MCP, implementado con TypeScript y Clean Architecture.

## Stack Tecnológico

- **TypeScript** - Tipado estático y mejor DX
- **Node.js** - Runtime
- **Express** - Framework web
- **NotebookLLM MCP** - Servidor Python para transcripción

## Arquitectura

Este proyecto sigue **Clean Architecture** con separación de responsabilidades en capas:

```
src/
├── config/              # Configuración centralizada
├── api/
│   ├── libs/           # Wrappers de librerías externas (MCP client)
│   ├── services/       # Lógica de negocio
│   ├── schemas/        # Validación con Joi
│   ├── middlewares/    # Upload, validation, error handling
│   └── routes/         # Definición de endpoints
└── index.js            # Entry point
```

## Prerequisitos

### 1. Instalar NotebookLLM MCP Server (Python)

```bash
# Opción 1: Con uv (recomendado)
uv tool install notebooklm-mcp-server

# Opción 2: Con pip
pip install notebooklm-mcp-server
```

### 2. Autenticar con NotebookLLM

```bash
# Ejecutar el comando de autenticación
notebooklm-mcp-auth

# Esto abrirá Chrome para que inicies sesión con Google
# Los tokens se guardarán en ~/.notebooklm-mcp/auth.json
```

### 3. Verificar Instalación

```bash
# Verificar que el comando está disponible
notebooklm-mcp-server --help
```

## Instalación

```bash
# Instalar dependencias
npm install

# Verificar tipos (opcional)
npm run type-check
```

## Configuración

El archivo `.env` ya está configurado con valores por defecto:

```env
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173
MAX_FILE_SIZE=52428800
MCP_AUTH_PATH=~/.notebooklm-mcp/auth.json
```

## Ejecución

```bash
# Modo desarrollo (con tsx watch - hot reload)
npm run dev

# Compilar TypeScript a JavaScript
npm run build

# Modo producción (requiere build primero)
npm start

# Verificar tipos sin compilar
npm run type-check
```

## API Endpoints

### GET /

Información general de la API

### GET /api/v1/transcription/health

Health check del servicio

**Response:**

```json
{
  "success": true,
  "message": "Transcription service is running",
  "timestamp": "2026-01-17T14:30:00.000Z"
}
```

### POST /api/v1/transcription/transcribe

Transcribir audio y generar resumen

**Request:**

- Content-Type: `multipart/form-data`
- Body:
  - `audio` (file): Archivo de audio (mp3, wav, m4a, ogg, webm)
  - `prompt` (string): Prompt personalizado (10-1000 caracteres)

**Response:**

```json
{
  "success": true,
  "data": {
    "transcription": "...",
    "summary": "...",
    "notebookId": "..."
  }
}
```

**Errores:**

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Validation error"
}
```

## Testing con cURL

```bash
# Health check
curl http://localhost:3000/api/v1/transcription/health

# Transcribir audio
curl -X POST http://localhost:3000/api/v1/transcription/transcribe \
  -F "audio=@path/to/audio.mp3" \
  -F "prompt=Genera un resumen ejecutivo de esta conversación"
```

## Estructura de Capas

### Config Layer

- **Propósito**: Configuración centralizada
- **Archivo**: `src/config/index.js`

### Libs Layer

- **Propósito**: Wrappers de librerías externas
- **Archivo**: `src/api/libs/mcp-client.js`
- **Responsabilidad**: Conexión con NotebookLLM MCP Server

### Services Layer

- **Propósito**: Lógica de negocio
- **Archivos**:
  - `notebookLLM.service.js`: Operaciones de NotebookLLM
  - `transcription.service.js`: Orquestación del proceso de transcripción

### Schemas Layer

- **Propósito**: Validación de DTOs
- **Archivo**: `src/api/schemas/transcription.schema.js`
- **Librería**: Joi

### Middlewares Layer

- **Propósito**: Validación, upload, error handling
- **Archivos**:
  - `upload.middleware.js`: Multer configuration
  - `validator.middleware.js`: Joi validation
  - `error.middleware.js`: Error handling

### Routes Layer

- **Propósito**: Definición de endpoints
- **Archivos**:
  - `transcription.router.js`: Rutas de transcripción
  - `index.js`: Registry de routers

## Limitaciones Actuales

- Tamaño máximo de archivo: 50MB
- Formatos soportados: mp3, wav, m4a, ogg, webm
- La integración con NotebookLLM MCP puede requerir ajustes según la API real

## Troubleshooting

### Error: "Failed to connect to MCP"

**Solución:**

1. Verificar que NotebookLLM MCP está instalado: `notebooklm-mcp-server --help`
2. Verificar autenticación: `ls ~/.notebooklm-mcp/auth.json`
3. Re-autenticar si es necesario: `notebooklm-mcp-auth`

### Error: "CORS policy"

**Solución:**
Verificar que `CORS_ORIGIN` en `.env` coincide con la URL del frontend.

### Error: "File size exceeds the limit"

**Solución:**
Ajustar `MAX_FILE_SIZE` en `.env` (valor en bytes).

## Próximos Pasos

- [ ] Agregar tests unitarios
- [ ] Agregar tests de integración
- [ ] Implementar rate limiting
- [ ] Agregar logging estructurado
- [ ] Implementar caché de resultados
