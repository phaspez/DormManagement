from sqlalchemy.orm import Session
from models.room import Room
from schemas.room import RoomCreate

def create_room(db: Session, room: RoomCreate):
    db_room = Room(RoomTypeID=room.RoomTypeID, RoomNumber=room.RoomNumber, MaxOccupancy=room.MaxOccupancy, Status=room.Status)
    db.add(db_room)
    db.commit()
    db.refresh(db_room)
    return db_room

def update_room(db: Session, room_id: int, room: RoomCreate):
    db_room = get_room_by_id(db, room_id)
    db_room.RoomTypeID = room.RoomTypeID
    db_room.RoomNumber = room.RoomNumber
    db_room.MaxOccupancy = room.MaxOccupancy
    db_room.Status = room.Status
    db.commit()
    db.refresh(db_room)
    return db_room

def delete_room(db: Session, room_id: int):
    db_room = get_room_by_id(db, room_id)
    db.delete(db_room)
    db.commit()
    return db_room

def get_room_by_id(db: Session, room_id: int):
    return db.query(Room).filter(Room.RoomID == room_id).first()

def get_rooms(db: Session):
    return db.query(Room).all()
