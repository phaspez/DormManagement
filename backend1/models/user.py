from sqlalchemy import Column, Integer, String
from database import Base

class User(Base):
    __tablename__ = 'User'

    UserID = Column(Integer, primary_key=True, autoincrement=True)
    Username = Column(String(50), unique=True, nullable=False)
    Password = Column(String(100), nullable=False) 