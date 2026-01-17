# Test del Backend con Archivo de Audio

## ✅ Estado Actual

- ✅ Backend corriendo en `http://localhost:3000`
- ✅ MCP de NotebookLLM conectado exitosamente
- ✅ Autenticación completada
- ✅ Health check respondiendo correctamente

---

## 🎵 Preparar Archivo de Audio de Prueba

Para probar el backend, necesitas un archivo de audio. Aquí tienes varias opciones:

### Opción 1: Grabar un Audio Corto

1. Usa la grabadora de voz de Windows:
   - Presiona `Win + S` y busca "Grabadora de voz"
   - Graba un mensaje corto (30 segundos - 1 minuto)
   - Guarda el archivo (se guardará como `.m4a` o `.mp3`)

### Opción 2: Usar un Audio de Ejemplo

Descarga un audio de prueba de internet:

- https://www2.cs.uic.edu/~i101/SoundFiles/ (archivos WAV de ejemplo)
- O cualquier podcast/audio que tengas

### Opción 3: Convertir un Video a Audio

Si tienes un video, puedes extraer el audio usando herramientas online o ffmpeg.

---

## 🧪 Probar con cURL

Una vez que tengas tu archivo de audio, ejecuta:

### Windows PowerShell:

```powershell
curl.exe -X POST http://localhost:3000/api/v1/transcription/transcribe `
  -F "audio=@C:\ruta\a\tu\audio.mp3" `
  -F "prompt=Genera un resumen ejecutivo de este audio en español"
```

### Ejemplo con archivo en Downloads:

```powershell
curl.exe -X POST http://localhost:3000/api/v1/transcription/transcribe `
  -F "audio=@$env:USERPROFILE\Downloads\audio.mp3" `
  -F "prompt=Resume los puntos principales de este audio"
```

---

## 🧪 Probar con Postman

Si prefieres una interfaz gráfica:

1. **Abrir Postman** (o descargar de https://www.postman.com/downloads/)

2. **Crear nuevo request:**
   - Method: `POST`
   - URL: `http://localhost:3000/api/v1/transcription/transcribe`

3. **Configurar Body:**
   - Seleccionar `form-data`
   - Agregar key `audio`:
     - Type: `File`
     - Value: Seleccionar tu archivo de audio
   - Agregar key `prompt`:
     - Type: `Text`
     - Value: `Genera un resumen ejecutivo de este audio`

4. **Click en Send**

---

## 📊 Respuesta Esperada

Si todo funciona correctamente, deberías recibir:

```json
{
  "success": true,
  "data": {
    "transcription": "Texto transcrito del audio...",
    "summary": "Resumen basado en el prompt proporcionado...",
    "notebookId": "notebook-xxxxx"
  }
}
```

---

## ⚠️ Posibles Errores

### Error: "Only audio files are allowed"

**Causa:** El archivo no es un formato de audio válido.

**Solución:** Asegúrate de usar mp3, wav, m4a, ogg, o webm.

---

### Error: "File size exceeds the limit"

**Causa:** El archivo es mayor a 50MB.

**Solución:**

- Usa un archivo más pequeño
- O ajusta `MAX_FILE_SIZE` en `.env`

---

### Error: "Validation error: Prompt must be at least 10 characters"

**Causa:** El prompt es muy corto.

**Solución:** Usa un prompt de al menos 10 caracteres.

---

### Error: "Failed to process audio with NotebookLLM"

**Causa:** Problema con el MCP o el formato del audio.

**Solución:**

1. Verifica que el servidor backend muestre "✅ Connected to NotebookLLM MCP"
2. Intenta con un archivo de audio diferente
3. Revisa los logs del servidor para más detalles

---

## 📝 Ejemplos de Prompts

Prueba diferentes prompts para ver cómo responde:

1. **Resumen ejecutivo:**

   ```
   Genera un resumen ejecutivo de este audio en 3-5 puntos clave
   ```

2. **Extracción de información:**

   ```
   Extrae todas las fechas, nombres y lugares mencionados en este audio
   ```

3. **Análisis de sentimiento:**

   ```
   Analiza el tono y sentimiento de este audio. ¿Es positivo, negativo o neutral?
   ```

4. **Transcripción literal:**

   ```
   Transcribe este audio palabra por palabra, incluyendo pausas y muletillas
   ```

5. **Puntos de acción:**
   ```
   Identifica todas las tareas o acciones mencionadas en este audio
   ```

---

## 🎯 Siguiente Paso

Una vez que confirmes que el backend funciona correctamente con un archivo de audio real:

✅ **Backend TypeScript completado y probado**
🔄 **Implementar Frontend con React + Vite + TypeScript + shadcn**

---

## 💡 Tips

- **Archivos pequeños primero:** Empieza con audios de 30 segundos a 1 minuto para pruebas rápidas
- **Calidad del audio:** Mejor calidad de audio = mejor transcripción
- **Idioma:** NotebookLLM soporta múltiples idiomas, pero funciona mejor con inglés
- **Prompts claros:** Sé específico en lo que quieres que haga con el audio

---

## 📚 Logs del Servidor

Mientras pruebas, observa los logs del servidor. Deberías ver:

```
📥 Received transcription request
   File: audio.mp3
   Size: 1.23 MB
   Prompt: Genera un resumen...
🎵 Processing audio: uploads/audio-xxxxx.mp3
📓 Created notebook: Transcription-xxxxx
📝 Added text to notebook xxxxx
🔍 Queried notebook xxxxx
🗑️  Deleted temp file: uploads/audio-xxxxx.mp3
🗑️  Deleted notebook xxxxx
```

Esto indica que todo el flujo está funcionando correctamente.
