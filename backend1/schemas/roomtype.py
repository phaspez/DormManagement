from pydantic import BaseModel

class RoomTypeCreate(BaseModel):
    RoomTypeName: str
    RentPrice: float

class RoomTypeOut(RoomTypeCreate):
    RoomTypeID: int

    class Config:
        orm_mode = True
