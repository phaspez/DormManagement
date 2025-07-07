from pydantic import BaseModel
from datetime import date
from typing import List


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


class PaginatedContractResponse(BaseModel):
    items: List[ContractOut]
    total: int
    page: int
    size: int
    pages: int

    class Config:
        orm_mode = True
