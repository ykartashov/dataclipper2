# FastAPI + React Random Number App

This repository has two apps:

- `backend`: Python FastAPI API with a random number endpoint.
- `frontend`: React (Vite + TypeScript) UI with a shadcn/ui-style button that calls the backend.

## Local Development

### 1) Run backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs at `http://localhost:8000`.

### 2) Run frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` and uses `VITE_API_URL` from `.env`.

## API Endpoints

- `GET /health` -> health check
- `GET /random` -> returns JSON like `{ "number": 123 }`

## Deploy to Render

This repo includes `render.yaml` for Blueprint deploy.

1. Push this repo to GitHub.
2. In Render, create a new Blueprint and select your repo.
3. Render will create:
   - `random-fastapi-backend` (web service)
   - `random-react-frontend` (static site)
4. In the frontend service, set `VITE_API_URL` to your backend URL:
   - e.g. `https://random-fastapi-backend.onrender.com`
5. Trigger a redeploy of the frontend after setting the env var.
