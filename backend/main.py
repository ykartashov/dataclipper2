import os
from random import randint

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from auth import require_auth
from routers import auth as auth_router
from routers import invitations as invitations_router
from routers import users as users_router

app = FastAPI(title="Random Number API")

frontend_origins = os.environ.get("FRONTEND_ORIGINS", "").strip()
if frontend_origins:
    allowed_origins = [origin.strip() for origin in frontend_origins.split(",") if origin.strip()]
else:
    frontend_url = os.environ.get("FRONTEND_URL", "").strip()
    allowed_origins = [frontend_url] if frontend_url else ["http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(auth_router.router)
app.include_router(invitations_router.router)
app.include_router(users_router.router)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/random")
def random_number(claims: dict = Depends(require_auth)) -> dict[str, int]:
    return {"number": randint(1, 1000)}
