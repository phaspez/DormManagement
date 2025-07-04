from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import SessionLocal
from crud import room as crud_room
from schemas.room import RoomCreate, RoomOut

router = APIRouter(
    prefix="/rooms",
    tags=["rooms"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=RoomOut)
def create_room(room: RoomCreate, db: Session = Depends(get_db)):
    return crud_room.create_room(db, room)

@router.get("/", response_model=List[RoomOut])
def read_rooms(db: Session = Depends(get_db)):
    return crud_room.get_rooms(db) 

# update room
@router.put("/{room_id}", response_model=RoomOut)
def update_room(room_id: int, room: RoomCreate, db: Session = Depends(get_db)):
    return crud_room.update_room(db, room_id, room)

# delete room
@router.delete("/{room_id}", response_model=RoomOut)
def delete_room(room_id: int, db: Session = Depends(get_db)):
    return crud_room.delete_room(db, room_id)

# get room by id
@router.get("/{room_id}", response_model=RoomOut)
def get_room_by_id(room_id: int, db: Session = Depends(get_db)):
    return crud_room.get_room_by_id(db, room_id)