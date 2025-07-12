from pydantic import BaseModel

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    UserID: int
    Username: str
    message: str

    class Config:
        orm_mode = True 