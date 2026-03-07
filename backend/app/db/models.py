from beanie import Document, Indexed
from typing import List, Optional
from datetime import datetime, timezone


class User(Document):
    email: str = Indexed(str, unique=True)
    first_name: Optional[str]
    last_name: Optional[str]
    phone_no: Optional[str]
    hashed_password: str
    created_at: datetime = datetime.now(timezone.utc)

    class Settings:
        name = "users"


class PDFDoc(Document):
    pdf_id: str
    filename: str
    file_url: str
    user_id: str
    pdf_context: str
    status: str = "Uploaded"
    uploaded_at: datetime = datetime.now(timezone.utc)

    class Settings:
        name = "pdf_docs"


class Chat(Document):
    user_id: str
    pdf_id: str
    messages: List[dict] = []
    created_at: datetime = datetime.now(timezone.utc)

    class Settings:
        name = "chats"

