import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.agent import router as agent_router
from services.prompt_builder import load_knowledge_base

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_knowledge_base()
    yield


app = FastAPI(title="FreshKira Agent API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(agent_router, prefix="/api")


@app.get("/health")
async def health():
    return {"status": "ok"}
