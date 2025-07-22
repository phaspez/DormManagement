from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, Enum
from sqlalchemy.orm import relationship
from database import Base

class Room(Base):
    __tablename__ = 'Room'

    RoomID = Column(Integer, primary_key=True, autoincrement=True)
    RoomTypeID = Column(Integer, ForeignKey('RoomType.RoomTypeID'), nullable=False)
    RoomNumber = Column(String(10), nullable=False)
    MaxOccupancy = Column(Integer, nullable=False)
    Status = Column(Enum('Available', 'Full', name='room_status'), default='Available')

    # Relationships
    room_types = relationship("RoomType", back_populates="rooms")
    contracts = relationship("Contract", back_populates="rooms") 
