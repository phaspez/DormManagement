from pydantic import BaseModel

class ServiceCreate(BaseModel):
    ServiceName: str
    UnitPrice: float

class ServiceOut(ServiceCreate):
    ServiceID: int

    class Config:
        orm_mode = True
