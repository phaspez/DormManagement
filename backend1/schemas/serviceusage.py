from pydantic import BaseModel
from datetime import date
from schemas.helper import PaginatedResponse

class ServiceUsageCreate(BaseModel):
    ContractID: int
    ServiceID: int
    Quantity: int
    UsageMonth: int
    UsageYear: int

class ServiceUsageOut(ServiceUsageCreate):
    ServiceUsageID: int

    class Config:
        orm_mode = True

class PaginatedServiceUsageResponse(PaginatedResponse[ServiceUsageOut]):
    pass
