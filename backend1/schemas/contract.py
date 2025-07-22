from pydantic import BaseModel
from datetime import date
from typing import List, Generic, TypeVar

from schemas.helper import PaginatedResponse


class ServiceUsageBase(BaseModel):
    ServiceUsageID: int
    ContractID: int
    InvoiceID: int
    ServiceID: int
    ServiceName: str
    Quantity: int
    UnitPrice: float
    UsageMonth: int
    UsageYear: int

    class Config:
        orm_mode = True


class ContractDetail(BaseModel):
    ContractID: int
    StudentID: int
    StudentName: str
    RoomID: int
    RoomNumber: str
    RoomTypeName: str
    StartDate: date
    EndDate: date
    ServiceUsages: List[ServiceUsageBase] = []

    class Config:
        orm_mode = True


class ContractCreate(BaseModel):
    StudentID: int
    RoomID: int
    StartDate: date
    EndDate: date


class ContractOut(ContractCreate):
    ContractID: int

    class Config:
        orm_mode = True

class ContractPaginatedOut(BaseModel):
    ContractID: int
    RoomNumber: str
    StudentID: int
    RoomID: int
    StartDate: date
    EndDate: date



class PaginatedContractResponse(PaginatedResponse[ContractPaginatedOut]):
    pass


