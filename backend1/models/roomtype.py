from sqlalchemy import Column, Integer, String, Numeric
from sqlalchemy.orm import relationship
from database import Base

class RoomType(Base):
    __tablename__ = 'RoomType'

    RoomTypeID = Column(Integer, primary_key=True, autoincrement=True)
    RoomTypeName = Column(String(100), nullable=False)
    RentPrice = Column(Numeric(10, 2), nullable=False)
    
    # Relationships
    rooms = relationship("Room", back_populates="room_type") 