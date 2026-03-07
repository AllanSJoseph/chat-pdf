from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm

from db.models import User
from schemas.users import UserCreate, UserOut
from schemas.auth import TokenResponse
from services.user_service import check_email_taken, get_current_user
from utils.hashing import hash_password, verify_password
from utils.jwt_handler import create_access_token


router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/signup", response_model=UserOut)
async def sign_up(user: UserCreate):
    try:
        if await check_email_taken(user.email):
            raise HTTPException(status_code=400, detail="Email already registered")
            
        hashed_password = hash_password(user.password)
        new_user = User(
                email=user.email,
                first_name=user.first_name,
                last_name=user.last_name,
                phone_no=user.phone_no,
                hashed_password=hashed_password
        )
        await new_user.insert()

        return UserOut(
            id=str(new_user.id),
            email=new_user.email,
            first_name=new_user.first_name,
            last_name=new_user.last_name,
            phone_no=new_user.phone_no,
            created_at=new_user.created_at
        )
    
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")


@router.post("/login", response_model=TokenResponse)
async def log_in(form_data: OAuth2PasswordRequestForm = Depends()):
    try:
        user = await User.find_one({"email": form_data.username})
        if not user or not verify_password(form_data.password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        token = create_access_token(data={"sub": str(user.id)})
        return TokenResponse(access_token=token)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")
    

@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserOut(
        id=str(current_user.id),
        email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        phone_no=current_user.phone_no,
        created_at=current_user.created_at
    )