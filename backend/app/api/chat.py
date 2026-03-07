from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List

from db.models import Chat, PDFDoc
from schemas.users import UserOut
from services.user_service import get_current_user
from services.qa_service import get_answer

router = APIRouter(prefix="/chat", tags=["chat"])

class ChatMessageBase(BaseModel):
    message: str

@router.post("/{pdf_id}")
async def send_message(pdf_id: str, payload: ChatMessageBase, current_user: UserOut = Depends(get_current_user)):
    pdf_doc = await PDFDoc.find_one({"pdf_id": pdf_id})
    if not pdf_doc:
        raise HTTPException(status_code=404, detail="PDF not found")
    if pdf_doc.user_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")
        
    chat = await Chat.find_one({"user_id": str(current_user.id), "pdf_id": pdf_id})
    if not chat:
        chat = Chat(user_id=str(current_user.id), pdf_id=pdf_id, messages=[])
        
    user_msg = {"role": "user", "content": payload.message}
    
    # Prepare history for QA
    chat_history = chat.messages.copy()
    
    try:
        answer = await get_answer(str(current_user.id), pdf_id, payload.message, chat_history)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    bot_msg = {"role": "bot", "content": answer}
    
    chat.messages.append(user_msg)
    chat.messages.append(bot_msg)
    
    await chat.save()
    
    return {"answer": answer}

@router.get("/{pdf_id}/history")
async def get_chat_history(pdf_id: str, current_user: UserOut = Depends(get_current_user)):
    chat = await Chat.find_one({"user_id": str(current_user.id), "pdf_id": pdf_id})
    if not chat:
        return {"messages": []}
    return {"messages": chat.messages}