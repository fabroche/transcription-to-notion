# Guía: Cómo Obtener el ID de un Archivo de Google Drive

## 📋 Pasos para Subir Audio y Obtener el ID

### 1. Subir el Archivo de Audio a Google Drive

1. Ve a [Google Drive](https://drive.google.com)
2. Click en **"Nuevo"** → **"Subir archivo"**
3. Selecciona tu archivo de audio (mp3, wav, m4a, etc.)
4. Espera a que termine de subir

---

### 2. Obtener el ID del Archivo

Hay dos formas de obtener el ID:

#### Opción A: Desde la URL (Más Fácil)

1. **Click derecho** en el archivo de audio
2. Selecciona **"Obtener enlace"** o **"Compartir"**
3. Click en **"Cambiar a cualquier persona con el enlace"** (importante para que NotebookLLM pueda acceder)
4. Copia el enlace

La URL se verá así:

```
https://drive.google.com/file/d/1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7/view?usp=sharing
```

El ID del archivo es la parte entre `/d/` y `/view`:

```
1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7
```

#### Opción B: Desde las Propiedades

1. **Click derecho** en el archivo
2. Selecciona **"Detalles"** o **"Ver detalles"**
3. Busca el ID en las propiedades

---

### 3. Asegurarse de que el Archivo sea Accesible

**IMPORTANTE:** El archivo debe ser accesible para NotebookLLM.

1. Click derecho en el archivo → **"Compartir"**
2. En **"Acceso general"**, selecciona:
   - **"Cualquier persona con el enlace"**
   - Permisos: **"Lector"** (es suficiente)
3. Click en **"Listo"**

---

## 🧪 Probar con el Backend

### Usando cURL (PowerShell):

```powershell
curl.exe -X POST http://localhost:3000/api/v1/transcription/transcribe `
  -H "Content-Type: application/json" `
  -d '{\"driveFileId\": \"TU_DRIVE_FILE_ID_AQUI\", \"prompt\": \"Genera un resumen ejecutivo de este audio en español\"}'
```

### Ejemplo con un ID real:

```powershell
curl.exe -X POST http://localhost:3000/api/v1/transcription/transcribe `
  -H "Content-Type: application/json" `
  -d '{\"driveFileId\": \"1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7\", \"prompt\": \"Resume los puntos principales de este audio\"}'
```

---

### Usando Postman:

1. **Crear nuevo request:**
   - Method: `POST`
   - URL: `http://localhost:3000/api/v1/transcription/transcribe`

2. **Headers:**
   - Key: `Content-Type`
   - Value: `application/json`

3. **Body:**
   - Seleccionar **"raw"**
   - Seleccionar **"JSON"** en el dropdown
   - Pegar:

   ```json
   {
     "driveFileId": "TU_DRIVE_FILE_ID_AQUI",
     "prompt": "Genera un resumen ejecutivo de este audio en español"
   }
   ```

4. **Click en Send**

---

## 📊 Respuesta Esperada

```json
{
  "success": true,
  "data": {
    "transcription": "Transcripción completa palabra por palabra del audio...",
    "summary": "Resumen basado en el prompt proporcionado...",
    "notebookId": "notebook-xxxxx",
    "driveFileId": "1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7"
  }
}
```

---

## ⏱️ Tiempo de Procesamiento

- El backend espera **5 segundos** después de agregar el archivo para que NotebookLLM lo procese
- Para audios largos (>5 minutos), puede tomar más tiempo
- Si obtienes una respuesta vacía, intenta aumentar el tiempo de espera en el código

---

## ⚠️ Troubleshooting

### Error: "Failed to process audio with NotebookLLM"

**Posibles causas:**

1. **El archivo no es accesible:**
   - Verifica que el archivo esté compartido como "Cualquier persona con el enlace"
   - Asegúrate de que el ID sea correcto

2. **El archivo no es de audio:**
   - NotebookLLM solo procesa ciertos formatos
   - Formatos recomendados: mp3, wav, m4a

3. **El archivo es muy grande:**
   - NotebookLLM puede tener límites de tamaño
   - Intenta con un archivo más pequeño primero

---

### Error: "Google Drive file ID is required"

**Causa:** No enviaste el `driveFileId` en el body.

**Solución:** Asegúrate de que el JSON tenga el campo `driveFileId`.

---

### Error: "Prompt must be at least 10 characters"

**Causa:** El prompt es muy corto.

**Solución:** Usa un prompt de al menos 10 caracteres.

---

## 💡 Tips

1. **Prueba con un audio corto primero** (30 segundos - 1 minuto)
2. **Asegúrate de que el audio tenga buena calidad** para mejor transcripción
3. **Usa prompts específicos** para obtener mejores resúmenes:
   - ✅ "Extrae las 5 ideas principales de este audio"
   - ✅ "Identifica todas las fechas y nombres mencionados"
   - ❌ "Resume" (muy genérico)

---

## 🎯 Ejemplos de Prompts

### Para Reuniones:

```
Genera un resumen ejecutivo de esta reunión incluyendo:
1) Temas discutidos
2) Decisiones tomadas
3) Próximos pasos
```

### Para Entrevistas:

```
Extrae las respuestas principales del entrevistado y organízalas por tema
```

### Para Conferencias:

```
Resume los puntos clave de esta conferencia en formato de bullet points
```

### Para Podcasts:

```
Identifica los temas principales discutidos y las conclusiones del episodio
```

---

## 📝 Logs del Servidor

Cuando hagas la petición, deberías ver en los logs del servidor:

```
📥 Received transcription request
   Drive File ID: 1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7
   Prompt: Genera un resumen...
📁 Processing audio from Google Drive: 1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7
📓 Created notebook: Audio-Transcription-xxxxx (ID: xxxxx)
📁 Added Drive file to notebook xxxxx
⏳ Waiting for NotebookLLM to process the audio...
📝 Requesting transcription...
🔍 Queried notebook xxxxx
🔍 Generating summary with custom prompt...
🔍 Queried notebook xxxxx
✅ Successfully processed audio from Drive
🗑️  Deleted temporary notebook xxxxx
```

---

## 🚀 Siguiente Paso

Una vez que confirmes que funciona:

- ✅ Backend completamente funcional con Google Drive
- 🔄 Implementar Frontend con React + Vite + TypeScript
