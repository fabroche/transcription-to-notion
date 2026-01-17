# NotebookLM Query Backend (TypeScript)

Backend API for querying NotebookLLM notebooks using MCP, implemented with TypeScript and Clean Architecture.

## Stack Tecnológico

- **TypeScript** - Tipado estático y mejor DX
- **Node.js** - Runtime
- **Express** - Framework web
- **NotebookLLM MCP** - Servidor Python para consultas a notebooks

## Arquitectura

Este proyecto sigue **Clean Architecture** con separación de responsabilidades en capas:

```
src/
├── config/              # Configuración centralizada
├── api/
│   ├── libs/           # Wrappers de librerías externas (MCP client)
│   ├── services/       # Lógica de negocio
│   ├── schemas/        # Validación con Joi
│   ├── middlewares/    # Validation, error handling
│   └── routes/         # Definición de endpoints
└── index.ts            # Entry point
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

**Response:**

```json
{
  "message": "NotebookLM Query API",
  "version": "1.0.0",
  "endpoints": {
    "notebookList": "GET /api/v1/notebook/list",
    "notebookQuery": "POST /api/v1/notebook/query",
    "notebookHealth": "GET /api/v1/notebook/health",
    "authReconnect": "POST /api/v1/auth/reconnect",
    "authHealth": "GET /api/v1/auth/health"
  }
}
```

### GET /api/v1/notebook/health

Health check del servicio de notebooks

**Response:**

```json
{
  "success": true,
  "message": "Notebook query service is running",
  "timestamp": "2026-01-17T19:30:00.000Z"
}
```

### GET /api/v1/notebook/list

Listar todos los notebooks de NotebookLLM

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

### POST /api/v1/notebook/query

Consultar un notebook existente por nombre

**Request:**

- Content-Type: `application/json`
- Body:

```json
{
  "notebookTitle": "My Notebook",
  "prompt": "What are the main topics discussed?"
}
```

**Validation:**

- `notebookTitle`: String, 1-200 caracteres, requerido
- `prompt`: String, 10-1000 caracteres, requerido

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

**Errores:**

```json
{
  "statusCode": 404,
  "error": "Not Found",
  "message": "Notebook \"My Notebook\" not found. Available notebooks: Notebook1, Notebook2"
}
```

## Testing con cURL

```bash
# Health check
curl http://localhost:3000/api/v1/notebook/health

# Listar notebooks
curl http://localhost:3000/api/v1/notebook/list

# Consultar un notebook
curl -X POST http://localhost:3000/api/v1/notebook/query \
  -H "Content-Type: application/json" \
  -d '{
    "notebookTitle": "My Notebook",
    "prompt": "What are the main topics?"
  }'

# Auth health check
curl http://localhost:3000/api/v1/auth/health

# Reconectar MCP (después de ejecutar notebooklm-mcp-auth)
curl -X POST http://localhost:3000/api/v1/auth/reconnect
```

## Estructura de Capas

### Config Layer

- **Propósito**: Configuración centralizada
- **Archivo**: `src/config/index.ts`

### Libs Layer

- **Propósito**: Wrappers de librerías externas
- **Archivo**: `src/api/libs/mcp-client.ts`
- **Responsabilidad**: Conexión con NotebookLLM MCP Server

### Services Layer

- **Propósito**: Lógica de negocio
- **Archivos**:
  - `notebookLLM.service.ts`: Operaciones de NotebookLLM (list, create, query, delete)
  - `notebookQuery.service.ts`: Orquestación de consultas a notebooks

### Schemas Layer

- **Propósito**: Validación de DTOs
- **Archivo**: `src/api/schemas/notebookQuery.schema.ts`
- **Librería**: Joi

### Middlewares Layer

- **Propósito**: Validación, error handling
- **Archivos**:
  - `validator.middleware.ts`: Joi validation
  - `error.middleware.ts`: Error handling

### Routes Layer

- **Propósito**: Definición de endpoints
- **Archivos**:
  - `notebookQuery.router.ts`: Rutas de consulta a notebooks
  - `index.ts`: Registry de routers

## Herramientas MCP Disponibles

El servicio utiliza las siguientes herramientas del NotebookLLM MCP:

1. **notebook_list** - Listar notebooks
2. **notebook_create** - Crear notebook
3. **notebook_query** - Consultar notebook
4. **notebook_add_text** - Agregar texto a notebook
5. **notebook_add_drive** - Agregar archivo de Drive
6. **notebook_delete** - Eliminar notebook

## Troubleshooting

### Error: "Failed to connect to MCP"

**Solución:**

1. Verificar que NotebookLLM MCP está instalado: `notebooklm-mcp-server --help`
2. Verificar autenticación: `ls ~/.notebooklm-mcp/auth.json`
3. Re-autenticar si es necesario: `notebooklm-mcp-auth`

### Error: "Authentication expired"

**Solución:**

```bash
# Re-autenticar
notebooklm-mcp-auth

# Reiniciar el servidor
npm run dev
```

### Error: "Notebook not found"

**Solución:**

1. Listar notebooks disponibles: `GET /api/v1/notebook/list`
2. Verificar el título exacto del notebook (case-insensitive)
3. Crear el notebook en NotebookLM si no existe

### Error: "CORS policy"

**Solución:**
Verificar que `CORS_ORIGIN` en `.env` coincide con la URL del frontend.

## Próximos Pasos

- [ ] Agregar tests unitarios
- [ ] Agregar tests de integración
- [ ] Implementar rate limiting
- [ ] Agregar logging estructurado
- [ ] Implementar caché de resultados
- [ ] Implementar frontend React
