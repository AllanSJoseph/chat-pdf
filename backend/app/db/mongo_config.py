import motor.motor_asyncio
from beanie import init_beanie
from .models import User, Chat, PDFDoc
import os


MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "chat-pdf")


async def init_mongodb():
    client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
    db = client[MONGO_DB_NAME]
    await init_beanie(database=db, document_models=[User, Chat, PDFDoc])