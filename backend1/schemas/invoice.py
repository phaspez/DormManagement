from pydantic import BaseModel
from datetime import date
from schemas.helper import PaginatedResponse

class InvoiceCreate(BaseModel):
    ServiceUsageID: int
    CreatedDate: date
    DueDate: date
    TotalAmount: float

class InvoiceOut(InvoiceCreate):
    InvoiceID: int

    class Config:
        orm_mode = True

class PaginatedInvoiceResponse(PaginatedResponse[InvoiceOut]):
    pass
