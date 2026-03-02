from random import randint

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import auth as auth_router
from routers import invitations as invitations_router
from routers import users as users_router

app = FastAPI(title="Random Number API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(invitations_router.router)
app.include_router(users_router.router)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/random")
def random_number() -> dict[str, int]:
    return {"number": randint(1, 1000)}
