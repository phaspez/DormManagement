from pydantic import BaseModel

from schemas.helper import PaginatedResponse


class StudentCreate(BaseModel):
    FullName: str
    Gender: str
    PhoneNumber: str

class StudentOut(StudentCreate):
    StudentID: int

    class Config:
        orm_mode = True

class PaginatedStudentResponse(PaginatedResponse[StudentOut]):
    pass