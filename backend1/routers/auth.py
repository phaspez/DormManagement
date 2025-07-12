from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import SessionLocal
from crud import user as crud_user
from schemas.user import UserLogin, UserResponse

router = APIRouter(
    prefix="/auth",
    tags=["authentication"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/login", response_model=UserResponse)
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    user = crud_user.authenticate_user(db, user_credentials.username, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    return UserResponse(
        UserID=user.UserID,
        Username=user.Username,
        message="Login successful"
    )

@router.post("/register", response_model=UserResponse)
def register(user_credentials: UserLogin, db: Session = Depends(get_db)):
    # Check if username already exists
    existing_user = crud_user.get_user_by_username(db, user_credentials.username)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )
    
    user = crud_user.create_user(db, user_credentials.username, user_credentials.password)
    return UserResponse(
        UserID=user.UserID,
        Username=user.Username,
        message="User registered successfully"
    ) 