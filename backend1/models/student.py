from sqlalchemy import Column, Integer, String, Enum
from sqlalchemy.orm import relationship
from database import Base

class Student(Base):
    __tablename__ = 'Student'

    StudentID = Column(Integer, primary_key=True, autoincrement=True)
    FullName = Column(String(100), nullable=False)
    Gender = Column(Enum('Male', 'Female', name='gender'), nullable=False)
    PhoneNumber = Column(String(10), nullable=False)
    
    # Relationships
    contracts = relationship("Contract", back_populates="students") 

