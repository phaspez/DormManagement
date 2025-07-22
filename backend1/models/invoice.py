from sqlalchemy import Column, Integer, Numeric, ForeignKey, Date    
from sqlalchemy.orm import relationship
from database import Base

class Invoice(Base):
    __tablename__ = 'Invoice'

    InvoiceID = Column(Integer, primary_key=True, autoincrement=True)
    CreatedDate = Column(Date, nullable=False)
    DueDate = Column(Date, nullable=False)
    TotalAmount = Column(Numeric(10, 2), nullable=False)

    # Relationships
    service_usages = relationship("ServiceUsage", back_populates="invoice")

