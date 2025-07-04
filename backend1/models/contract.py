from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, Date
from sqlalchemy.orm import relationship
from database import Base

class Contract(Base):
    __tablename__ = 'Contract'

    ContractID = Column(Integer, primary_key=True, autoincrement=True)
    StudentID = Column(Integer, ForeignKey('Student.StudentID'), nullable=False)
    RoomID = Column(Integer, ForeignKey('Room.RoomID'), nullable=False)
    StartDate = Column(Date, nullable=False)
    EndDate = Column(Date, nullable=False)

    # Relationships
    student = relationship("Student", back_populates="contracts")
    room = relationship("Room", back_populates="contracts")
