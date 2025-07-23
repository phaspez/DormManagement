from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, Enum
from sqlalchemy.orm import relationship
from database import Base

class Service(Base):
    __tablename__ = 'Service'

    ServiceID = Column(Integer, primary_key=True, autoincrement=True)
    ServiceName = Column(String(100), nullable=False)
    UnitPrice = Column(Numeric(10, 2), nullable=False)

    # Relationships
    service_usages = relationship("ServiceUsage", back_populates="services") 
