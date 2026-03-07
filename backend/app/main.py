from fastapi import FastAPI
from dotenv import load_dotenv
load_dotenv()

from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from db.mongo_config import init_mongodb
from api import auth, pdf, chat

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_mongodb()
    yield

app = FastAPI(title="ChatPDF", lifespan=lifespan)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/isallok")
async def is_server_running():
    return {"message": "Server is running!! All is OK! :)"}

app.include_router(auth.router)
app.include_router(pdf.router)
app.include_router(chat.router)