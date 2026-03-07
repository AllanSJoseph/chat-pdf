from pydantic import BaseModel, EmailStr
from datetime import datetime, timezone
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_no: Optional[str] = None
    created_at: datetime = datetime.now(timezone.utc)


class UserCreate(UserBase):
    password: str


class UserOut(UserBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True