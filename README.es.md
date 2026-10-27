# RagPilot — Frontend

> **English:** [README.md](README.md)

Construí este cliente React como la cara visible del workspace de RAG
(Retrieval-Augmented Generation) de RagPilot. Es mi proyecto de portafolio para
mostrar, con datos reales, por qué conviene usar RAG en operaciones diarias y en
chatbots en vez de meter el documento entero en el prompt.

El frontend se conecta con **Supabase Auth** (login) y habla con el **backend
FastAPI** (el repo hermano [`ragpilot-backend`](https://github.com/sebas14022/ragpilot-backend))
para subir documentos y correr el pipeline: el flujo principal compara respuestas
**RAG** (con recuperación por chunks) contra un **baseline "full-doc"** (todo el
documento en un solo prompt) para mostrar el contraste real en coste de tokens,
latencia y groundedness.

Solo el backend habla con la IA: el frontend nunca toca el LLM ni la base de
datos directamente.

## Stack

- Vite + React 19 + TypeScript
- Tailwind CSS 4
- Supabase (`@supabase/supabase-js`) para auth
- React Dropzone para uploads multipart
- React Router 7

## Páginas

- **RAG Lab** (`/`): la página principal. Sube/borra documentos con el límite de
  24.000 caracteres por archivo, selecciona cuáles consultar, corre comparaciones RAG
  vs full-doc en el chat, y muestra el dashboard en vivo (documentos, chunks,
  queries, tokens usados, historial de comparaciones y queries recientes). El
  dashboard se refresca automáticamente tras cada comparación o cambio en la base
  de conocimiento.
- **Sign in** (`/signin`): login con Supabase Auth. Las rutas del workspace están
  protegidas: sin sesión, el usuario vuelve a `/signin`.

## Setup

1. Instalar dependencias (el proyecto usa **pnpm**):

   ```bash
   pnpm install
   ```

2. Crear `.env` a partir del ejemplo y completar los valores reales:

   ```bash
   Copy-Item .env.example .env
   ```

   | Variable | Propósito |
   |---|---|
   | `VITE_SUPABASE_URL` | URL del proyecto Supabase |
   | `VITE_SUPABASE_ANON_KEY` | anon key (público; solo para auth) |
   | `VITE_API_URL` | URL del backend FastAPI (ej. `http://localhost:8000`) |

3. Levantar en desarrollo:

   ```bash
   pnpm run dev    # servidor de desarrollo (localhost:5173)
   ```

## Comandos

```bash
pnpm run dev    # servidor de desarrollo
pnpm run build  # build de producción (tsc -b && vite build)
pnpm run lint   # ESLint
```

## Backend

El backend vive en el repo hermano [ragpilot-backend](https://github.com/sebas14022/ragpilot-backend)
(FastAPI + Supabase pgvector + Groq / Gemini). Toda la lógica de documentos,
embeddings, pipeline RAG, comparaciones y métricas se sirve desde ahí; el frontend
solo consume su API `/v1` con JWTs de Supabase. La API expone docs interactivos en
`http://localhost:8000/docs`.
