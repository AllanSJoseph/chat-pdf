from pydantic import BaseModel
from datetime import datetime, timezone

class PDFBase(BaseModel):
    filename: str
    user_id: str
    pdf_context: str
    uploaded_at: datetime = datetime.now(timezone.utc)

class PDFOut(PDFBase):
    pdf_id: str
    file_url: str
    uploaded_at: datetime

    class Config:
        from_attributes = True
