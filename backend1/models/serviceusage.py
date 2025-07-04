from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class ServiceUsage(Base):
    __tablename__ = 'ServiceUsage'

    ServiceUsageID = Column(Integer, primary_key=True, autoincrement=True)
    ContractID = Column(Integer, ForeignKey('Contract.ContractID'), nullable=False)
    ServiceID = Column(Integer, ForeignKey('Service.ServiceID'), nullable=False)
    Quantity = Column(Integer, nullable=False)
    UsageMonth = Column(Integer, nullable=False)
    UsageYear = Column(Integer, nullable=False)

    # Relationships
    service = relationship("Service", back_populates="service_usages") 
    invoice = relationship("Invoice", back_populates="service_usages") 
