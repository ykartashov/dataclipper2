# FastAPI + React Random Number App

Two apps with user management (Google OAuth, invitation-only, roles: user/admin):

- `backend`: FastAPI API (random number, auth, invitations, users).
- `frontend`: React (Vite + shadcn/ui) with protected routes and admin User Management.

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com).
2. Enable Google OAuth: Authentication → Providers → Google (Client ID + Secret from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)).
3. Add redirect URL in Supabase: Auth → URL Configuration → Redirect URLs: `http://localhost:5173/**`, `https://yourapp.onrender.com/**`.
4. Run the SQL migration: Supabase Dashboard → SQL Editor → paste and run contents of `supabase/migrations/001_initial_schema.sql`.
5. Enable the auth hook: Authentication → Hooks → Customize Access Token Hook → select `custom_access_token_hook`.
6. Bootstrap first admin: set `INITIAL_ADMIN_EMAIL` (your Google email) in backend env, or run:
   ```sql
   INSERT INTO public.user_roles (user_id, role) SELECT id, 'admin' FROM auth.users WHERE email = 'your@email.com';
   ```

## Local Development

### 1) Backend

```bash
cd backend
cp .env.example .env
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### 2) Frontend

```bash
cd frontend
cp .env.example .env
# Edit .env with VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL
npm install
npm run dev
```

## API Endpoints

- `GET /health` — health check
- `GET /random` — returns `{ "number": 123 }`
- `GET /auth/me` — current user + role (auth required)
- `POST /auth/complete-invite` — consume invite token (auth required)
- `POST /invitations` — create invite link (admin only)
- `GET /users` — list users (admin only)

## Deploy to Render

1. Push to GitHub and deploy via Render Blueprint (`render.yaml`).
2. Set env vars:
   - **Backend:** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`, `INITIAL_ADMIN_EMAIL`, `FRONTEND_URL`.
   - **Frontend:** `VITE_API_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
3. Add frontend URL to Supabase redirect URLs.
4. Redeploy frontend after setting env vars.
