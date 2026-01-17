# Frontend Implementation Plan

## Objetivo

Crear una interfaz React con Vite y shadcn/ui que permita a los usuarios subir archivos de audio, ingresar prompts personalizados, y visualizar la transcripción y resumen generados.

---

## Estructura del Frontend

```
frontend/
├── src/
│   ├── main.jsx              # Entry point
│   ├── App.jsx               # Componente principal
│   ├── components/
│   │   ├── ui/               # Componentes shadcn/ui
│   │   ├── AudioUploader.jsx # Componente de upload
│   │   ├── PromptInput.jsx   # Input para prompt
│   │   └── ResultsDisplay.jsx # Mostrar resultados
│   ├── lib/
│   │   └── api.js            # Cliente API
│   └── styles/
│       └── globals.css       # Estilos globales
├── public/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── components.json           # Configuración shadcn
└── package.json
```

---

## Dependencias Principales

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.0",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-slot": "^1.0.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "lucide-react": "^0.292.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32"
  }
}
```

---

## Implementación por Componentes

### 1. Setup Inicial

**Pasos:**

1. Crear proyecto Vite con React
2. Instalar y configurar Tailwind CSS
3. Inicializar shadcn/ui
4. Configurar path aliases

**Comandos:**

```bash
cd frontend
npm create vite@latest . -- --template react
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npx shadcn-ui@latest init
```

---

### 2. API Client (`src/lib/api.js`)

**Responsabilidades:**

- Centralizar llamadas al backend
- Manejar errores de red

**Implementación:**

```javascript
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const transcribeAudio = async (audioFile, prompt) => {
  const formData = new FormData();
  formData.append("audio", audioFile);
  formData.append("prompt", prompt);

  try {
    const response = await axios.post(`${API_BASE_URL}/transcribe`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to transcribe audio",
    );
  }
};
```

---

### 3. Audio Uploader Component (`src/components/AudioUploader.jsx`)

**Responsabilidades:**

- Permitir selección de archivo de audio
- Validar tipo de archivo
- Mostrar preview del archivo seleccionado

**Implementación:**

```jsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AudioUploader({ onFileSelect, disabled }) {
  const [fileName, setFileName] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      onFileSelect(file);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="audio-upload">Audio File</Label>
      <div className="flex items-center gap-2">
        <Input
          id="audio-upload"
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          disabled={disabled}
          className="cursor-pointer"
        />
      </div>
      {fileName && (
        <p className="text-sm text-muted-foreground">Selected: {fileName}</p>
      )}
    </div>
  );
}
```

---

### 4. Prompt Input Component (`src/components/PromptInput.jsx`)

**Responsabilidades:**

- Input para el prompt personalizado
- Validación de texto no vacío

**Implementación:**

```jsx
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function PromptInput({ value, onChange, disabled }) {
  return (
    <div className="space-y-2">
      <Label htmlFor="prompt">Custom Prompt</Label>
      <Textarea
        id="prompt"
        placeholder="e.g., Generate an executive summary of this meeting..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={4}
        className="resize-none"
      />
    </div>
  );
}
```

---

### 5. Results Display Component (`src/components/ResultsDisplay.jsx`)

**Responsabilidades:**

- Mostrar transcripción completa
- Mostrar resumen generado
- Diseño claro y legible

**Implementación:**

```jsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ResultsDisplay({ transcription, summary }) {
  if (!transcription && !summary) return null;

  return (
    <div className="space-y-4">
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{summary}</p>
          </CardContent>
        </Card>
      )}

      {transcription && (
        <Card>
          <CardHeader>
            <CardTitle>Full Transcription</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {transcription}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

---

### 6. Main App Component (`src/App.jsx`)

**Responsabilidades:**

- Orquestar todos los componentes
- Manejar estado de la aplicación
- Gestionar loading y errores

**Implementación:**

```jsx
import { useState } from "react";
import { AudioUploader } from "./components/AudioUploader";
import { PromptInput } from "./components/PromptInput";
import { ResultsDisplay } from "./components/ResultsDisplay";
import { Button } from "./components/ui/button";
import { Alert, AlertDescription } from "./components/ui/alert";
import { transcribeAudio } from "./lib/api";

function App() {
  const [audioFile, setAudioFile] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!audioFile || !prompt) {
      setError("Please provide both an audio file and a prompt");
      return;
    }

    setLoading(true);
    setError("");
    setResults(null);

    try {
      const data = await transcribeAudio(audioFile, prompt);
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-slate-900">
            Audio Transcription & Summary
          </h1>
          <p className="text-slate-600">
            Upload your audio and get AI-powered transcription and summaries
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <AudioUploader onFileSelect={setAudioFile} disabled={loading} />

            <PromptInput
              value={prompt}
              onChange={setPrompt}
              disabled={loading}
            />

            <Button
              type="submit"
              disabled={loading || !audioFile || !prompt}
              className="w-full"
            >
              {loading ? "Processing..." : "Transcribe & Summarize"}
            </Button>
          </div>
        </form>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {results && (
          <ResultsDisplay
            transcription={results.transcription}
            summary={results.summary}
          />
        )}
      </div>
    </div>
  );
}

export default App;
```

---

## Configuración de shadcn/ui

**Componentes a instalar:**

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add label
npx shadcn-ui@latest add card
npx shadcn-ui@latest add alert
```

---

## Variables de Entorno (`.env`)

```env
VITE_API_URL=http://localhost:3000/api
```

---

## Scripts de Package.json

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

---

## Plan de Verificación

### Pruebas Manuales

1. **Test de UI:**
   - Iniciar dev server: `npm run dev`
   - Abrir `http://localhost:5173`
   - Verificar que todos los componentes se renderizan correctamente

2. **Test de Funcionalidad:**
   - Seleccionar un archivo de audio
   - Ingresar un prompt
   - Click en "Transcribe & Summarize"
   - Verificar que aparece estado de loading
   - Verificar que se muestran los resultados

3. **Test de Validaciones:**
   - Intentar submit sin archivo → botón debe estar deshabilitado
   - Intentar submit sin prompt → botón debe estar deshabilitado
   - Verificar que errores se muestran apropiadamente

4. **Test de Integración:**
   - Con backend corriendo, realizar transcripción completa
   - Verificar que la comunicación frontend-backend funciona
   - Verificar que los resultados se muestran correctamente

### Criterios de Éxito

- ✅ Aplicación inicia sin errores
- ✅ UI es responsive y visualmente atractiva
- ✅ Componentes shadcn/ui funcionan correctamente
- ✅ Upload de archivos funciona
- ✅ Comunicación con backend exitosa
- ✅ Estados de loading y error se manejan apropiadamente
- ✅ Resultados se muestran de forma clara y legible

---

## Mejoras Futuras (Post-MVP)

- Drag & drop para archivos
- Progress bar durante transcripción
- Historial de transcripciones
- Exportar resultados (PDF, TXT)
- Soporte para múltiples idiomas
- Temas claro/oscuro
