# Elixir Real Local Website

This is a Vite + React + Tailwind version of your Elixir interface.

## Run locally

```bash
npm install
npm run dev -- --host 127.0.0.1 --port 5177
```

Open:

```text
http://127.0.0.1:5177/
```

## Included

- Real local React website
- Full interactive UI
- Landing → Workspace → Modules → Vital Organs navigation
- Biomarker cards with reference ranges and mini trend charts
- Upload panel prepared for backend / OCR / biomarker ingestion

## Next backend connection idea

Add an `/api/analyze-blood-test` endpoint that receives PDF/image files, extracts OCR text, maps biomarkers to JSON, then updates the React state.
