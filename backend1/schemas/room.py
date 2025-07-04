from pydantic import BaseModel

class RoomCreate(BaseModel):
    RoomTypeID: int
    RoomNumber: str
    MaxOccupancy: int
    Status: str

class RoomOut(RoomCreate):
    RoomID: int

    class Config:
        orm_mode = True
