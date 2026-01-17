# Guía de Instalación y Prueba del MCP de NotebookLLM

Esta guía te ayudará a instalar y configurar el servidor MCP de NotebookLLM para poder probar el backend con archivos de audio reales.

---

## Prerequisitos

- Python 3.8 o superior
- `uv` (recomendado) o `pip`
- Cuenta de Google
- Google Chrome instalado

---

## Paso 1: Instalar `uv` (Recomendado)

`uv` es un gestor de paquetes Python ultrarrápido.

### Windows (PowerShell):

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

### macOS/Linux:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### Verificar instalación:

```bash
uv --version
```

---

## Paso 2: Instalar NotebookLLM MCP Server

### Opción A: Con uv (Recomendado)

```bash
uv tool install notebooklm-mcp-server
```

### Opción B: Con pip

```bash
pip install notebooklm-mcp-server
```

### Verificar instalación:

```bash
notebooklm-mcp-server --help
```

**Resultado esperado:**

```
Usage: notebooklm-mcp-server [OPTIONS]
...
```

---

## Paso 3: Autenticar con Google

El MCP de NotebookLLM requiere cookies de autenticación de Google.

### Ejecutar comando de autenticación:

```bash
notebooklm-mcp-auth
```

### ¿Qué sucede?

1. Se abrirá una ventana de Chrome
2. Inicia sesión con tu cuenta de Google
3. Navega a notebooklm.google.com
4. El script extraerá automáticamente las cookies
5. Las cookies se guardarán en `~/.notebooklm-mcp/auth.json`

### Verificar autenticación:

```bash
# Windows
dir $HOME\.notebooklm-mcp\auth.json

# macOS/Linux
ls ~/.notebooklm-mcp/auth.json
```

---

## Paso 4: Probar el Backend

### 1. Iniciar el servidor backend

En una terminal, navega al directorio `backend` y ejecuta:

```bash
cd backend
npm run dev
```

**Resultado esperado:**

```
🚀 ========================================
🚀 Server running on port 3000
🚀 Environment: development
🚀 CORS Origin: http://localhost:5173
🚀 ========================================

✅ Connected to NotebookLLM MCP
```

Si ves "✅ Connected to NotebookLLM MCP", ¡la conexión fue exitosa!

---

## Paso 5: Probar con un Archivo de Audio Real

### Preparar un archivo de audio de prueba

Puedes usar cualquier archivo de audio (mp3, wav, m4a, ogg, webm).

**Sugerencias:**

- Graba un mensaje de voz corto (30 segundos - 1 minuto)
- Descarga un podcast o audio de ejemplo
- Usa un archivo de audio que ya tengas

### Probar con cURL

```bash
curl -X POST http://localhost:3000/api/v1/transcription/transcribe \
  -F "audio=@path/to/your/audio.mp3" \
  -F "prompt=Genera un resumen ejecutivo de este audio"
```

**Reemplaza:**

- `path/to/your/audio.mp3` con la ruta real a tu archivo de audio
- El prompt con la instrucción que desees

### Ejemplo en Windows (PowerShell):

```powershell
curl.exe -X POST http://localhost:3000/api/v1/transcription/transcribe `
  -F "audio=@C:\Users\TuUsuario\Downloads\audio.mp3" `
  -F "prompt=Genera un resumen ejecutivo de este audio"
```

### Respuesta esperada:

```json
{
  "success": true,
  "data": {
    "transcription": "Texto transcrito del audio...",
    "summary": "Resumen basado en el prompt...",
    "notebookId": "notebook-123456"
  }
}
```

---

## Paso 6: Probar con Postman (Alternativa)

Si prefieres una interfaz gráfica:

1. **Abrir Postman**
2. **Crear nuevo request:**
   - Method: `POST`
   - URL: `http://localhost:3000/api/v1/transcription/transcribe`
3. **Body:**
   - Seleccionar `form-data`
   - Agregar key `audio` (tipo: File) → Seleccionar tu archivo
   - Agregar key `prompt` (tipo: Text) → Ingresar tu prompt
4. **Send**

---

## Troubleshooting

### Error: "Failed to connect to MCP"

**Causa:** El servidor MCP no está instalado o no está en el PATH.

**Solución:**

```bash
# Verificar instalación
notebooklm-mcp-server --help

# Si no funciona, reinstalar
uv tool install notebooklm-mcp-server --force
```

---

### Error: "MCP error -32000: Connection closed"

**Causa:** No hay tokens de autenticación o están expirados.

**Solución:**

```bash
# Re-autenticar
notebooklm-mcp-auth

# Verificar que se creó el archivo
ls ~/.notebooklm-mcp/auth.json
```

---

### Error: "Only audio files are allowed"

**Causa:** El archivo no es un formato de audio válido.

**Solución:**

- Verifica que el archivo sea mp3, wav, m4a, ogg, o webm
- Verifica que el archivo no esté corrupto
- Intenta con otro archivo de audio

---

### Error: "File size exceeds the limit"

**Causa:** El archivo es mayor a 50MB.

**Solución:**

- Reduce el tamaño del archivo de audio
- O ajusta `MAX_FILE_SIZE` en `.env` (valor en bytes)

---

### Error: "Validation error: Prompt must be at least 10 characters"

**Causa:** El prompt es muy corto.

**Solución:**

- Asegúrate de que el prompt tenga al menos 10 caracteres
- Ejemplo válido: "Resume este audio"

---

## Verificación Completa

### Checklist de Verificación:

- [ ] `uv` instalado y funcionando
- [ ] `notebooklm-mcp-server` instalado
- [ ] Autenticación completada (`~/.notebooklm-mcp/auth.json` existe)
- [ ] Backend inicia sin errores
- [ ] Mensaje "✅ Connected to NotebookLLM MCP" aparece
- [ ] Endpoint `/api/v1/transcription/health` responde OK
- [ ] Request con archivo de audio retorna transcripción y resumen

---

## Próximos Pasos

Una vez que el backend funcione correctamente con archivos reales:

1. ✅ **Backend TypeScript completado y probado**
2. 🔄 **Implementar Frontend con React + Vite + TypeScript**
3. 🔄 **Integración End-to-End**
4. 🔄 **Testing y Refinamiento**

---

## Recursos Adicionales

- [NotebookLLM MCP Repository](https://github.com/jacob-bd/notebooklm-mcp)
- [NotebookLLM Official](https://notebooklm.google.com)
- [uv Documentation](https://docs.astral.sh/uv/)

---

## Notas Importantes

> [!IMPORTANT]
> **Privacidad de Datos**
>
> Los archivos de audio se procesan a través de NotebookLLM (servicio de Google). Asegúrate de no enviar información sensible o confidencial durante las pruebas.

> [!NOTE]
> **Limitaciones del MCP**
>
> El MCP de NotebookLLM puede tener limitaciones en cuanto a:
>
> - Tamaño de archivos
> - Formatos de audio soportados
> - Tasa de requests (rate limiting)
>
> Estas limitaciones dependen del servicio de NotebookLLM y pueden cambiar.
