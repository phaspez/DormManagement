from sqlalchemy.orm import Session
from models.user import User
from schemas.user import UserLogin

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.Username == username).first()

def create_user(db: Session, username: str, password: str):
    db_user = User(Username=username, Password=password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, username: str, password: str):
    user = get_user_by_username(db, username)
    if not user:
        return None
    if user.Password != password:  # Simple password comparison
        return None
    return user 