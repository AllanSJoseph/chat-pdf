from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
import uuid
import traceback

from db.models import PDFDoc, User, Chat
from schemas.pdf import PDFBase, PDFOut
from services.user_service import get_current_user
from services.pdf_service import store_pdf, process_pdf

router = APIRouter(prefix="/pdf", tags=["pdf"])

@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    try:
        pdf_id = str(uuid.uuid4())
        saved_path = await store_pdf(file, str(current_user.id), pdf_id)
        
        pdf_doc = PDFDoc(
            pdf_id=pdf_id,
            filename=file.filename,
            file_url=saved_path,
            user_id=str(current_user.id),
            pdf_context="",
            status="Uploaded"
        )
        await pdf_doc.insert()

        return {
            "message": "PDF Uploaded Successfully!",
            "path": saved_path,
            "pdf_id": pdf_id,
            "uploaded_by": str(current_user.id)
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/process/{pdf_id}")
async def process_uploaded_pdf(pdf_id: str, current_user: User = Depends(get_current_user)):
    try:
        pdf_doc = await PDFDoc.find_one({"pdf_id": pdf_id})
        if not pdf_doc:
            raise HTTPException(status_code=404, detail="PDF not found")
        if pdf_doc.user_id != str(current_user.id):
            raise HTTPException(status_code=403, detail="Not authorized")
            
        # Update status to Processing
        pdf_doc.status = "Processing"
        await pdf_doc.save()

        try:
            await process_pdf(pdf_doc.file_url, str(current_user.id), pdf_id)
            
            # Update status to Ready
            pdf_doc.status = "Ready"
            await pdf_doc.save()
            
            return {"message": "PDF processed and embeddings created successfully.", "status": "Ready"}
        except Exception as process_error:
            # If processing fails, revert status so user can retry
            pdf_doc.status = "Uploaded"
            await pdf_doc.save()
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=str(process_error))
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/uploads")
async def get_user_uploads(current_user: User = Depends(get_current_user)):
    try:
        pdfs = await PDFDoc.find({"user_id": str(current_user.id)}).to_list()
        return {"uploads": pdfs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/delete/{pdf_id}")
async def delete_pdf(pdf_id: str, current_user: User = Depends(get_current_user)):
    try:
        pdf_doc = await PDFDoc.find_one({"pdf_id": pdf_id})
        if not pdf_doc:
            raise HTTPException(status_code=404, detail="PDF not found")
        if pdf_doc.user_id != str(current_user.id):
            raise HTTPException(status_code=403, detail="Not authorized")
            
        # Delete the document record from MongoDB
        await pdf_doc.delete()
        
        # Also clean up associated chats
        chat = await Chat.find_one({"pdf_id": pdf_id})
        if chat:
            await chat.delete()
            
        # Note: Physical file deletion and ChromaDB cleanup can be added here later
        
        return {"message": "PDF deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))