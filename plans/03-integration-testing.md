# Integration & Testing Plan

## Objetivo

Conectar el frontend con el backend, realizar pruebas end-to-end, y asegurar que toda la aplicación funciona correctamente como un sistema integrado.

---

## Configuración del Entorno de Desarrollo

### 1. Ejecutar Backend y Frontend Simultáneamente

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
# Servidor corriendo en http://localhost:3000
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
# Aplicación corriendo en http://localhost:5173
```

---

## Checklist de Integración

### Backend

- [ ] Servidor Express corriendo sin errores
- [ ] CORS configurado para aceptar requests de `http://localhost:5173`
- [ ] Endpoint `/api/transcribe` responde correctamente
- [ ] Conexión con NotebookLLM MCP establecida
- [ ] Archivos temporales se limpian después de procesar

### Frontend

- [ ] Variable de entorno `VITE_API_URL` configurada
- [ ] Componentes shadcn/ui instalados y funcionando
- [ ] API client configurado correctamente
- [ ] Estados de loading, error y success implementados

---

## Pruebas End-to-End

### Test 1: Flujo Completo Exitoso

**Pasos:**

1. Abrir `http://localhost:5173` en el navegador
2. Seleccionar un archivo de audio de prueba (ej: `test-audio.mp3`)
3. Ingresar prompt: "Genera un resumen ejecutivo de esta conversación"
4. Click en "Transcribe & Summarize"
5. Esperar respuesta

**Resultado Esperado:**

- ✅ Botón muestra "Processing..." durante la carga
- ✅ No hay errores en la consola del navegador
- ✅ No hay errores en la consola del backend
- ✅ Se muestra la transcripción completa
- ✅ Se muestra el resumen basado en el prompt
- ✅ El archivo temporal se eliminó del servidor

---

### Test 2: Manejo de Errores - Sin Archivo

**Pasos:**

1. No seleccionar ningún archivo
2. Ingresar un prompt
3. Intentar hacer submit

**Resultado Esperado:**

- ✅ Botón permanece deshabilitado
- ✅ No se envía request al backend

---

### Test 3: Manejo de Errores - Sin Prompt

**Pasos:**

1. Seleccionar un archivo de audio
2. Dejar el prompt vacío
3. Intentar hacer submit

**Resultado Esperado:**

- ✅ Botón permanece deshabilitado
- ✅ No se envía request al backend

---

### Test 4: Manejo de Errores - Archivo Inválido

**Pasos:**

1. Seleccionar un archivo que NO sea audio (ej: imagen.jpg)
2. Ingresar un prompt
3. Click en submit

**Resultado Esperado:**

- ✅ Backend rechaza el archivo
- ✅ Frontend muestra mensaje de error apropiado
- ✅ Usuario puede intentar de nuevo

---

### Test 5: Manejo de Errores - Backend Offline

**Pasos:**

1. Detener el servidor backend
2. Intentar hacer una transcripción desde el frontend

**Resultado Esperado:**

- ✅ Frontend muestra error de conexión
- ✅ No hay crash de la aplicación
- ✅ Usuario puede intentar de nuevo cuando backend esté disponible

---

### Test 6: Archivos de Audio Grandes

**Pasos:**

1. Seleccionar un archivo de audio grande (cercano al límite de 50MB)
2. Ingresar un prompt
3. Hacer submit

**Resultado Esperado:**

- ✅ Upload se completa exitosamente
- ✅ Transcripción se procesa (puede tomar más tiempo)
- ✅ Resultados se muestran correctamente

---

### Test 7: Múltiples Prompts Diferentes

**Pasos:**

1. Usar el mismo archivo de audio
2. Probar con diferentes prompts:
   - "Resume los puntos clave"
   - "Extrae las acciones a tomar"
   - "Identifica los participantes y sus opiniones"

**Resultado Esperado:**

- ✅ Cada prompt genera un resumen diferente
- ✅ La transcripción es la misma
- ✅ Los resúmenes reflejan el prompt dado

---

## Verificación de Rendimiento

### Métricas a Observar

1. **Tiempo de Respuesta:**
   - Audio corto (< 1 min): < 10 segundos
   - Audio mediano (1-5 min): < 30 segundos
   - Audio largo (5-10 min): < 60 segundos

2. **Uso de Memoria:**
   - Backend no debe exceder 500MB durante procesamiento
   - Frontend debe mantenerse bajo 100MB

3. **Limpieza de Recursos:**
   - Archivos temporales eliminados después de cada request
   - Conexiones MCP cerradas apropiadamente

---

## Debugging Común

### Problema: CORS Error

**Síntoma:**

```
Access to XMLHttpRequest at 'http://localhost:3000/api/transcribe'
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solución:**
Verificar que en `backend/src/index.js`:

```javascript
app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);
```

---

### Problema: MCP Connection Failed

**Síntoma:**

```
Error: Failed to connect to NotebookLLM MCP
```

**Solución:**

1. Verificar que `@notebooklm/mcp-server` está instalado
2. Verificar configuración del transporte MCP
3. Revisar logs del MCP server

---

### Problema: File Upload Fails

**Síntoma:**

```
Error: File upload error
```

**Solución:**

1. Verificar que la carpeta `uploads/` existe
2. Verificar permisos de escritura
3. Verificar límite de tamaño de archivo

---

## Documentación Final

Una vez completadas todas las pruebas, crear:

### README.md Principal

```markdown
# Audio Transcription & Summary App

## Descripción

Aplicación para transcribir audio y generar resúmenes personalizados usando NotebookLLM.

## Requisitos

- Node.js 18+
- npm o yarn

## Instalación

### Backend

\`\`\`bash
cd backend
npm install
\`\`\`

### Frontend

\`\`\`bash
cd frontend
npm install
\`\`\`

## Configuración

### Backend (.env)

\`\`\`
PORT=3000
\`\`\`

### Frontend (.env)

\`\`\`
VITE_API_URL=http://localhost:3000/api
\`\`\`

## Ejecución

### Desarrollo

Terminal 1:
\`\`\`bash
cd backend && npm run dev
\`\`\`

Terminal 2:
\`\`\`bash
cd frontend && npm run dev
\`\`\`

Abrir http://localhost:5173

## Uso

1. Selecciona un archivo de audio
2. Ingresa un prompt personalizado
3. Click en "Transcribe & Summarize"
4. Espera los resultados

## Limitaciones

- Tamaño máximo de archivo: 50MB
- Formatos soportados: mp3, wav, m4a, ogg, webm
```

---

## Criterios de Éxito para Integración

- ✅ Todos los tests end-to-end pasan
- ✅ No hay errores en consola (frontend o backend)
- ✅ Manejo de errores funciona correctamente
- ✅ Rendimiento es aceptable
- ✅ Documentación está completa
- ✅ Código está limpio y comentado

---

## Próximos Pasos (Post-Integración)

1. **Deployment:**
   - Configurar para producción
   - Deploy backend (Railway, Render, etc.)
   - Deploy frontend (Vercel, Netlify, etc.)

2. **Mejoras:**
   - Agregar autenticación
   - Implementar base de datos para historial
   - Agregar analytics
   - Mejorar UI/UX

3. **Testing Avanzado:**
   - Unit tests
   - Integration tests automatizados
   - E2E tests con Playwright/Cypress
