from pydantic import BaseModel

class StudentCreate(BaseModel):
    FullName: str
    Gender: str
    PhoneNumber: str

class StudentOut(StudentCreate):
    StudentID: int

    class Config:
        orm_mode = True
