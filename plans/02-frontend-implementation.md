# Frontend Implementation Plan - Notebook Query UI

> **Status:** ⏳ NOT STARTED - Planned
> **Version:** 1.0.0
> **Last Updated:** 2026-01-17

## Overview

Create a React + Vite + TypeScript + shadcn/ui frontend that allows users to browse their NotebookLM notebooks, select one, enter natural language queries, and view AI-generated answers.

**Focus:** Simple, clean UI for notebook querying (not audio transcription).

---

## Architecture

### Project Structure

```
frontend/
├── src/
│   ├── main.tsx                    # Entry point
│   ├── App.tsx                     # Main app component
│   ├── components/
│   │   ├── ui/                     # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── select.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── skeleton.tsx
│   │   │   └── badge.tsx
│   │   ├── NotebookSelector.tsx    # Notebook dropdown selector
│   │   ├── QueryInput.tsx          # Prompt input component
│   │   ├── QueryResults.tsx        # Display answer
│   │   ├── NotebookList.tsx        # Browse all notebooks
│   │   └── AuthStatus.tsx          # Auth indicator & reconnect
│   ├── lib/
│   │   ├── api.ts                  # API client (Axios)
│   │   └── utils.ts                # Utility functions
│   └── styles/
│       └── globals.css             # Global styles + Tailwind
├── public/
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── components.json                 # shadcn config
├── tsconfig.json
└── package.json
```

---

## Tech Stack

### Core Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.0",
    "lucide-react": "^0.292.0"
  }
}
```

### shadcn/ui Dependencies

```json
{
  "dependencies": {
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-slot": "^1.0.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  }
}
```

### Dev Dependencies

```json
{
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.2.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32"
  }
}
```

---

## Implementation Steps

### Phase 1: Project Setup

#### 1.1 Initialize Vite + React + TypeScript

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
```

#### 1.2 Install Tailwind CSS

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Configure `tailwind.config.js`:**

```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**Update `src/styles/globals.css`:**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

#### 1.3 Initialize shadcn/ui

```bash
npx shadcn-ui@latest init
```

**Configuration prompts:**
- Style: Default
- Base color: Slate
- CSS variables: Yes

**Install required components:**

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add select
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add label
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add badge
```

#### 1.4 Configure Path Aliases

**Update `tsconfig.json`:**

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Update `vite.config.ts`:**

```typescript
import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

---

### Phase 2: API Client

**File:** `src/lib/api.ts`

```typescript
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Types
export interface Notebook {
  id: string;
  title: string;
  url: string;
}

export interface QueryResult {
  answer: string;
  notebookId: string;
  notebookTitle: string;
}

// API Methods
export const api = {
  // List all notebooks
  async listNotebooks(): Promise<Notebook[]> {
    const response = await apiClient.get("/notebook/list");
    return response.data.data.notebooks;
  },

  // Query notebook by title
  async queryNotebook(notebookTitle: string, prompt: string): Promise<QueryResult> {
    const response = await apiClient.post("/notebook/query", {
      notebookTitle,
      prompt,
    });
    return response.data.data;
  },

  // Reconnect MCP auth
  async reconnectAuth(): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post("/auth/reconnect");
    return response.data.data;
  },

  // Health checks
  async notebookHealth(): Promise<boolean> {
    try {
      await apiClient.get("/notebook/health");
      return true;
    } catch {
      return false;
    }
  },

  async authHealth(): Promise<boolean> {
    try {
      await apiClient.get("/auth/health");
      return true;
    } catch {
      return false;
    }
  },
};
```

**Environment Variables (`.env`):**

```env
VITE_API_URL=http://localhost:3000/api/v1
```

---

### Phase 3: Components

#### 3.1 Notebook Selector Component

**File:** `src/components/NotebookSelector.tsx`

```tsx
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { api, Notebook } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface NotebookSelectorProps {
  onNotebookSelect: (notebookTitle: string) => void;
  disabled?: boolean;
}

export function NotebookSelector({ onNotebookSelect, disabled }: NotebookSelectorProps) {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNotebook, setSelectedNotebook] = useState<string>("");

  useEffect(() => {
    loadNotebooks();
  }, []);

  const loadNotebooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.listNotebooks();
      setNotebooks(data);
    } catch (err) {
      setError("Failed to load notebooks. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleValueChange = (value: string) => {
    setSelectedNotebook(value);
    onNotebookSelect(value);
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <Label>Select Notebook</Label>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="notebook-select">Select Notebook</Label>
      <Select
        value={selectedNotebook}
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <SelectTrigger id="notebook-select">
          <SelectValue placeholder="Choose a notebook..." />
        </SelectTrigger>
        <SelectContent>
          {notebooks.map((notebook) => (
            <SelectItem key={notebook.id} value={notebook.title}>
              {notebook.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {notebooks.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No notebooks found. Create one in NotebookLM.
        </p>
      )}
    </div>
  );
}
```

---

#### 3.2 Query Input Component

**File:** `src/components/QueryInput.tsx`

```tsx
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface QueryInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function QueryInput({ value, onChange, disabled }: QueryInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="query-input">Your Query</Label>
      <Textarea
        id="query-input"
        placeholder="e.g., What are the main topics discussed? Summarize the key points..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={4}
        className="resize-none"
      />
      <p className="text-sm text-muted-foreground">
        Min 10 characters, max 1000 characters
      </p>
    </div>
  );
}
```

---

#### 3.3 Query Results Component

**File:** `src/components/QueryResults.tsx`

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { QueryResult } from "@/lib/api";

interface QueryResultsProps {
  result: QueryResult | null;
}

export function QueryResults({ result }: QueryResultsProps) {
  if (!result) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Answer</CardTitle>
          <Badge variant="secondary">{result.notebookTitle}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {result.answer}
        </p>
      </CardContent>
    </Card>
  );
}
```

---

#### 3.4 Auth Status Component

**File:** `src/components/AuthStatus.tsx`

```tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { RefreshCw } from "lucide-react";

export function AuthStatus() {
  const [reconnecting, setReconnecting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReconnect = async () => {
    try {
      setReconnecting(true);
      setError(null);
      setMessage(null);

      const result = await api.reconnectAuth();
      setMessage(result.message);
    } catch (err) {
      setError("Failed to reconnect. Run 'notebooklm-mcp-auth' first.");
    } finally {
      setReconnecting(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Badge variant="outline">MCP Auth</Badge>
        <Button
          size="sm"
          variant="outline"
          onClick={handleReconnect}
          disabled={reconnecting}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${reconnecting ? "animate-spin" : ""}`} />
          Reconnect
        </Button>
      </div>

      {message && (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
```

---

### Phase 4: Main App

**File:** `src/App.tsx`

```tsx
import { useState } from "react";
import { NotebookSelector } from "./components/NotebookSelector";
import { QueryInput } from "./components/QueryInput";
import { QueryResults } from "./components/QueryResults";
import { AuthStatus } from "./components/AuthStatus";
import { Button } from "./components/ui/button";
import { Alert, AlertDescription } from "./components/ui/alert";
import { api, QueryResult } from "./lib/api";
import { Loader2 } from "lucide-react";

function App() {
  const [selectedNotebook, setSelectedNotebook] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QueryResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedNotebook || !query) {
      setError("Please select a notebook and enter a query");
      return;
    }

    if (query.length < 10) {
      setError("Query must be at least 10 characters");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await api.queryNotebook(selectedNotebook, query);
      setResult(data);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Failed to query notebook";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = selectedNotebook && query.length >= 10;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto p-8 space-y-8">
        {/* Header */}
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-slate-900">
            NotebookLM Query
          </h1>
          <p className="text-slate-600">
            Query your NotebookLM notebooks with natural language
          </p>
        </header>

        {/* Auth Status */}
        <AuthStatus />

        {/* Query Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <NotebookSelector
              onNotebookSelect={setSelectedNotebook}
              disabled={loading}
            />

            <QueryInput
              value={query}
              onChange={setQuery}
              disabled={loading}
            />

            <Button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Querying...
                </>
              ) : (
                "Submit Query"
              )}
            </Button>
          </div>
        </form>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results Display */}
        {result && <QueryResults result={result} />}
      </div>
    </div>
  );
}

export default App;
```

---

### Phase 5: Entry Point

**File:** `src/main.tsx`

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## Configuration Files

### `vite.config.ts`

```typescript
import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Path mapping */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### `package.json` Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit"
  }
}
```

---

## Testing & Verification

### Manual Testing Checklist

#### UI Tests

- [ ] App renders without errors
- [ ] Notebook selector loads notebooks
- [ ] Query input accepts text
- [ ] Submit button enables/disables correctly
- [ ] Loading states show during API calls
- [ ] Error messages display appropriately
- [ ] Success results display correctly

#### Functionality Tests

- [ ] Select notebook from dropdown
- [ ] Enter query (min 10 chars)
- [ ] Submit query and see results
- [ ] Verify answer is displayed
- [ ] Test with different notebooks
- [ ] Test with different queries

#### Validation Tests

- [ ] Cannot submit without notebook selection
- [ ] Cannot submit with query < 10 chars
- [ ] Error shown for invalid input
- [ ] Error shown when backend is offline

#### Auth Tests

- [ ] Reconnect button works
- [ ] Success message shows after reconnect
- [ ] Error message shows if reconnect fails

---

## User Flow

1. **Open App** → See notebook selector and query input
2. **Select Notebook** → Choose from dropdown list
3. **Enter Query** → Type natural language question (10-1000 chars)
4. **Submit** → Click "Submit Query" button
5. **Loading** → See spinner and "Querying..." text
6. **Results** → View AI-generated answer in card
7. **New Query** → Change notebook or query and submit again
8. **Auth Issues** → Click "Reconnect" if auth expires

---

## Error Handling

### Network Errors

- **Backend Offline:** "Failed to load notebooks. Is the backend running?"
- **Query Failed:** Display specific error from backend (e.g., "Notebook not found")
- **Auth Failed:** "Failed to reconnect. Run 'notebooklm-mcp-auth' first."

### Validation Errors

- **No Notebook Selected:** "Please select a notebook and enter a query"
- **Query Too Short:** "Query must be at least 10 characters"
- **Query Too Long:** Enforced by textarea (1000 char limit)

---

## Styling

### Design System

- **Colors:** Slate (primary), destructive red (errors), secondary blue
- **Spacing:** Consistent 4px grid (space-y-2, space-y-4, space-y-6, space-y-8)
- **Typography:** System fonts, clear hierarchy
- **Components:** shadcn/ui defaults with minimal customization

### Responsive Design

- **Mobile:** Single column layout
- **Tablet:** Same layout, wider max-width
- **Desktop:** Max-width 4xl (896px), centered

---

## Performance Considerations

- **Code Splitting:** Vite handles automatically
- **Lazy Loading:** Not needed for small app
- **Caching:** API responses not cached (fresh data on each request)
- **Optimizations:** React.memo for heavy components (if needed)

---

## Accessibility

- [ ] All form inputs have labels
- [ ] Buttons have descriptive text
- [ ] Loading states announced to screen readers
- [ ] Error messages associated with inputs
- [ ] Keyboard navigation works
- [ ] Color contrast meets WCAG AA

---

## Future Enhancements

### Short Term

- [ ] Notebook search/filter
- [ ] Query history (local storage)
- [ ] Copy answer to clipboard
- [ ] Dark mode toggle

### Medium Term

- [ ] Multiple queries on same page
- [ ] Save favorite queries
- [ ] Export answers (PDF, markdown)
- [ ] Notebook preview (sources list)

### Long Term

- [ ] Real-time query streaming
- [ ] Collaborative queries
- [ ] Query templates
- [ ] Analytics dashboard

---

## Development Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Type check
npm run type-check

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Deployment

### Build Process

```bash
npm run build
# Output: dist/ directory
```

### Hosting Options

- **Vercel:** Connect GitHub repo, auto-deploy
- **Netlify:** Drag & drop dist/ folder
- **GitHub Pages:** Configure vite.config.ts base path

### Environment Variables

```env
# Production
VITE_API_URL=https://your-backend.com/api/v1
```

---

## Troubleshooting

### Component Not Rendering

- Check console for errors
- Verify all imports are correct
- Ensure shadcn components are installed

### API Calls Failing

- Verify backend is running
- Check CORS configuration in backend
- Verify VITE_API_URL is correct

### Styles Not Applying

- Ensure Tailwind is configured correctly
- Check globals.css is imported in main.tsx
- Verify components.json path aliases

---

## Conclusion

This frontend provides a **clean, functional UI** for querying NotebookLM notebooks:

✅ TypeScript for type safety
✅ React 18 with hooks
✅ shadcn/ui for polished components
✅ Tailwind CSS for styling
✅ Axios for API calls
✅ Error handling and loading states
✅ Responsive design
✅ Accessible

**Next Step:** Implement this plan to create the frontend, then integrate with backend for end-to-end testing.
