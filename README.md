# RagPilot

Dashboard para monitorear y probar un pipeline de RAG (Retrieval-Augmented Generation). Proyecto de portafolio.

## Stack

- Vite + React 19
- TypeScript
- Tailwind CSS 4
- ApexCharts

## Páginas

- **Dashboard** (`/`): métricas del pipeline — documentos indexados, chunks, consultas, tokens usados, volumen de consultas y tabla de queries recientes.
- **Test RAG** (`/rag-test`): sube documentos a un índice (simulado) y prueba el pipeline con un chat al lado. Solo frontend por ahora; el índice y la inferencia se conectan después.
- **Autenticación** (`/signin`, `/signup`): login demo, sin backend.

## Comandos

```bash
npm install    # instala dependencias
npm run dev    # servidor de desarrollo (localhost:5173)
npm run build  # build de producción
npm run lint   # ESLint
```

## Nota: origen del template

Este proyecto se inició a partir de un template MIT. Ver `TEMPLATE_SOURCE.md` para la URL y la licencia original.