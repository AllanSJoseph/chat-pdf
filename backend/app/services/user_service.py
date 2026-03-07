from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from db.models import User
from jose import JWTError, jwt
from utils.jwt_handler import verify_access_token


async def check_email_taken(email: str) -> bool:
    check_email = await User.find_one({"email": email})
    if check_email:
        return True
        
    return False


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = verify_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = await User.get(payload["sub"])
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user