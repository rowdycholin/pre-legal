from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .auth import router as auth_router
from .chat import router as chat_router
from .database import init_db
from .download import router as download_router
from .static_files import serve_spa


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth")
app.include_router(download_router, prefix="/api")
app.include_router(chat_router, prefix="/api")

# Catch-all: serve Next.js static output (must be last)
app.add_api_route("/{full_path:path}", serve_spa, methods=["GET"], response_model=None)
