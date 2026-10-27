# RagPilot — Frontend

> **Español:** [README.es.md](README.es.md)

I built this React client as the interactive workspace for RagPilot's RAG
(Retrieval-Augmented Generation) engine. It is a portfolio project designed to
demonstrate, using real numbers, why RAG outperforms full-document stuffing for
everyday operations and chatbots.

The frontend integrates with **Supabase Auth** (login) and communicates with the
**FastAPI backend** (sibling repository [`ragpilot-backend`](https://github.com/sebas14022/ragpilot-backend))
to ingest documents and run the pipeline. The core flow compares **RAG** answers
(retrieval by chunks) against a **full-doc baseline** (stuffing the entire corpus
into a single prompt) to highlight the real contrast in token cost, latency, and
groundedness.

Only the backend talks to the LLM and vector database: the frontend never touches
AI APIs or Postgres directly.

## Stack

- Vite + React 19 + TypeScript
- Tailwind CSS 4
- Supabase Auth (`@supabase/supabase-js`)
- React Dropzone (multipart file upload)
- React Router 7

## Key Pages

- **RAG Lab** (`/`): The primary workspace. Upload/delete documents within the
  24,000-character budget per file, select which ones to query, run side-by-side
  RAG vs. full-doc comparisons in the chat, and inspect live analytics
  (document count, chunks, queries, token usage, comparison history, and recent queries).
  The dashboard refreshes automatically after every comparison or knowledge-base change.
- **Sign in** (`/signin`): Authentication via Supabase Auth. Workspace routes are
  protected: unauthorized users are redirected to `/signin`.

## Setup

1. Install dependencies (the project uses **pnpm**):

   ```bash
   pnpm install
   ```

2. Copy `.env.example` to `.env` and fill in the required values:

   ```bash
   cp .env.example .env
   ```

   | Variable | Description |
   |---|---|
   | `VITE_SUPABASE_URL` | Supabase project URL |
   | `VITE_SUPABASE_ANON_KEY` | Supabase anon key (public; used for auth only) |
   | `VITE_API_URL` | FastAPI backend URL (e.g. `http://localhost:8000`) |

3. Start the development server:

   ```bash
   pnpm run dev    # dev server at localhost:5173
   ```

## Scripts

```bash
pnpm run dev    # start dev server
pnpm run build  # production build (tsc -b && vite build)
pnpm run lint   # ESLint check
```

## Backend

The backend lives in [ragpilot-backend](https://github.com/sebas14022/ragpilot-backend)
(FastAPI + Supabase pgvector + Groq / Gemini). All document processing, embeddings,
RAG pipelines, comparisons, and metrics are served via its `/v1` endpoints. Interactive
API docs are available at `http://localhost:8000/docs`.
