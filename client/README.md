# Frontend Chat UI (QA + RAG)

Frontend-only chat interface built with React, Vite, JavaScript (JSX), and Tailwind.
This project no longer contains backend/edge function logic.

## Run

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Backend integration

- Frontend sends messages to `VITE_API_PATH`.
- Default value is `/api/chat` (configured in `config.browser.js`).
- Set a different endpoint by creating a `.env` file:

```bash
VITE_API_PATH=http://localhost:8000/api/chat
```
