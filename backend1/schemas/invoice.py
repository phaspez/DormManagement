from pydantic import BaseModel
from datetime import date

class InvoiceCreate(BaseModel):
    ServiceUsageID: int
    CreatedDate: date
    DueDate: date
    TotalAmount: float

class InvoiceOut(InvoiceCreate):
    InvoiceID: int

    class Config:
        orm_mode = True
