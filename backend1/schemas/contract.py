from pydantic import BaseModel
from datetime import date

class ContractCreate(BaseModel):
    StudentID: int
    RoomID: int
    StartDate: date
    EndDate: date

class ContractOut(ContractCreate):
    ContractID: int

    class Config:
        orm_mode = True
