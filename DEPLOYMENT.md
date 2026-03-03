# Deployment Instructions (Render)

Step-by-step guide to deploy the FastAPI backend and React frontend to [Render](https://render.com).

---

## Prerequisites

- GitHub account with this repo pushed
- [Supabase](https://supabase.com) project
- [Render](https://render.com) account

---

## 1. Supabase Setup

Before deploying, configure Supabase:

1. **Create project** at [supabase.com](https://supabase.com).

2. **Enable Google OAuth**
   - Supabase Dashboard → Authentication → Providers → Google
   - Add Client ID and Client Secret from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - In Google Console: add authorized redirect URI  
     `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`

3. **Redirect URLs**
   - Supabase Dashboard → Authentication → URL Configuration → Redirect URLs
   - Add:
     - `http://localhost:5173/**` (local dev)
     - `https://random-react-frontend.onrender.com/**` (or your frontend URL)

4. **Run migration**
   - Supabase Dashboard → SQL Editor
   - Paste and run contents of `supabase/migrations/001_initial_schema.sql`

5. **Enable auth hook**
   - Authentication → Hooks → Customize Access Token Hook
   - Select `custom_access_token_hook`

6. **Bootstrap first admin** (after first deploy, or via SQL):
   ```sql
   INSERT INTO public.user_roles (user_id, role)
   SELECT id, 'admin' FROM auth.users WHERE email = 'your@email.com';
   ```

---

## 2. Deploy via Render Blueprint

1. Go to [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**.

2. Connect your GitHub account and select this repository.

3. Render will detect `render.yaml` and create:
   - **random-fastapi-backend** (web service)
   - **random-react-frontend** (static site)

4. Click **Apply** to start the deployment.

---

## 3. Environment Variables

Set these in Render Dashboard → Service → **Environment**.

### Backend (random-fastapi-backend)

| Key | Value | Required |
|-----|-------|----------|
| `SUPABASE_URL` | `https://YOUR_PROJECT_REF.supabase.co` | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret key from Supabase → Project Settings → API | Yes |
| `INITIAL_ADMIN_EMAIL` | Your Google email (gets admin on first sign-in via invite) | No |
| `FRONTEND_URL` | `https://random-react-frontend.onrender.com` | Yes |
| `SUPABASE_JWT_SECRET` | Optional; not used by current auth flow | No |

**Optional:** `FRONTEND_ORIGINS` — comma-separated allowed CORS origins (e.g. `https://app1.com,https://app2.com`). If unset, `FRONTEND_URL` is used.

### Frontend (random-react-frontend)

| Key | Value | Required |
|-----|-------|----------|
| `VITE_API_URL` | `https://random-fastapi-backend.onrender.com` | Yes |
| `VITE_SUPABASE_URL` | `https://YOUR_PROJECT_REF.supabase.co` | Yes |
| `VITE_SUPABASE_ANON_KEY` | Anon/public key from Supabase → Project Settings → API | Yes |

> **Note:** Frontend env vars are baked in at build time. Trigger a **manual redeploy** after changing them.

---

## 4. Post-Deploy Steps

1. Copy the deployed **backend** URL (e.g. `https://random-fastapi-backend.onrender.com`).

2. In the **frontend** service:
   - Set `VITE_API_URL` to that backend URL.
   - Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from your Supabase project.

3. In the **backend** service:
   - Set `FRONTEND_URL` to your frontend URL (e.g. `https://random-react-frontend.onrender.com`).

4. **Redeploy frontend** after setting env vars.

5. Add your frontend URL to Supabase **Redirect URLs** if not already added.

---

## 5. Verify

- Backend health: `https://random-fastapi-backend.onrender.com/health`
- Frontend: open the frontend URL
- Sign in as admin (via invite flow or SQL bootstrap), create an invite, and test the flow.

---

## 6. SPA Routing (Already Configured)

`render.yaml` includes a rewrite rule so paths like `/invite`, `/login`, `/users` load correctly:

```yaml
routes:
  - type: rewrite
    source: /*
    destination: /index.html
```

No extra Render config is needed for client-side routing.

---

## 7. Troubleshooting

| Issue | Fix |
|-------|-----|
| 401 on `/random` or other API calls | Ensure backend has correct `SUPABASE_SERVICE_ROLE_KEY` (secret key, not anon). Redeploy backend. Sign out and sign in again in the app. |
| 404 on `/invite?token=...` | Confirm the SPA rewrite is present in `render.yaml` and redeploy frontend. |
| CORS errors | Set `FRONTEND_URL` (and optionally `FRONTEND_ORIGINS`) on the backend to match your frontend URL(s). |
| "You need an invitation" after Google sign-in | Use the app’s User Management invite flow, not Supabase’s built-in "Send invitation". Or bootstrap the user via SQL (see step 1.6). |
