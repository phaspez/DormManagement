from pydantic import BaseModel
from datetime import date
from schemas.helper import PaginatedResponse
from typing import List, Generic, TypeVar


class ServiceUsageBase(BaseModel):
    ServiceUsageID: int
    ServiceID: int
    ServiceName: str
    Quantity: int
    UnitPrice: float
    UsageMonth: int
    UsageYear: int

    class Config:
        orm_mode = True


class InvoiceCreate(BaseModel):
    # ServiceUsageID: int
    CreatedDate: date
    DueDate: date


class InvoiceOut(InvoiceCreate):
    InvoiceID: int
    TotalAmount: float

    class Config:
        orm_mode = True
        
class InvoiceDetail(BaseModel):
    InvoiceID: int
    CreatedDate: date
    DueDate: date
    TotalAmount: float
    ServiceUsages: List[ServiceUsageBase] = []

    class Config:
        orm_mode = True


class PaginatedInvoiceResponse(PaginatedResponse[InvoiceOut]):
    pass
