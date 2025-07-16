from datetime import date
from pydantic import BaseModel
from schemas.helper import PaginatedResponse

class RoomCreate(BaseModel):
    RoomTypeID: int
    RoomNumber: str
    MaxOccupancy: int
    #Status: str

class RoomOut(RoomCreate):
    RoomID: int
    Status: str

    class Config:
        orm_mode = True

class StudentsInRoom(BaseModel):
    StudentID: int
    FullName: str
    StartDate: date
    EndDate: date

class RoomDetailsOut(RoomCreate):
    RoomID: int
    Status: str
    Students: list[StudentsInRoom]

class PaginatedRoomResponse(PaginatedResponse[RoomOut]):
    pass

class RoomSearchResult(BaseModel):
    RoomID: int
    RoomNumber: str

    class Config:
        orm_mode = True
