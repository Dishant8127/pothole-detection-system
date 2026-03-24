from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.routes.detect import router
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

os.makedirs("outputs", exist_ok=True)
os.makedirs("outputs/videos", exist_ok=True)

app.mount("/outputs", StaticFiles(directory="outputs"), name="outputs")