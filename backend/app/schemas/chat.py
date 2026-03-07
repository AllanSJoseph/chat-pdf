from pydantic import BaseModel, EmailStr, Field
from typing import List

class ChatMessage(BaseModel):
    question: str = Field(..., example="What is the capital of India?")
    llmanswer: str = Field(..., example="The capital of India is New Delhi.")


class ChatCreate(ChatMessage):
    user_id: str
    pdf_id: str
    messages: List[ChatMessage]


class ChatOut(ChatCreate):
    id: str

    class Config:
        orm_mode = True