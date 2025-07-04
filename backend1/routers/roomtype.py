from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import SessionLocal
from crud import roomtype as crud_roomtype
from schemas.roomtype import RoomTypeCreate, RoomTypeOut

router = APIRouter(
    prefix="/roomtypes",
    tags=["roomtypes"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=RoomTypeOut)
def create_roomtype(roomtype: RoomTypeCreate, db: Session = Depends(get_db)):
    return crud_roomtype.create_roomtype(db, roomtype)

@router.get("/", response_model=List[RoomTypeOut])
def read_roomtypes(db: Session = Depends(get_db)):
    return crud_roomtype.get_roomtypes(db) 

@router.get("/{roomtype_id}", response_model=RoomTypeOut)
def get_roomtype_by_id(roomtype_id: int, db: Session = Depends(get_db)):
    return crud_roomtype.get_roomtype_by_id(db, roomtype_id)

@router.put("/{roomtype_id}", response_model=RoomTypeOut)
def update_roomtype(roomtype_id: int, roomtype: RoomTypeCreate, db: Session = Depends(get_db)):
    return crud_roomtype.update_roomtype(db, roomtype_id, roomtype)

@router.delete("/{roomtype_id}", response_model=RoomTypeOut)
def delete_roomtype(roomtype_id: int, db: Session = Depends(get_db)):
    return crud_roomtype.delete_roomtype(db, roomtype_id)