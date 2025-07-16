from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from crud.contract import get_contracts_by_room
from models.contract import Contract
from models.room import Room
from models.student import Student
from schemas.room import RoomCreate
from utils.room_triggers import update_room_status_after_orm_change


def create_room(db: Session, room: RoomCreate):
    db_room = Room(RoomTypeID=room.RoomTypeID, RoomNumber=room.RoomNumber, MaxOccupancy=room.MaxOccupancy, Status="Available")
    db.add(db_room)
    db.commit()
    db.refresh(db_room)
    return db_room

def update_room(db: Session, room_id: int, room: RoomCreate):
    db_room = get_room_by_id(db, room_id)
    db_room.RoomTypeID = room.RoomTypeID
    db_room.RoomNumber = room.RoomNumber
    db_room.MaxOccupancy = room.MaxOccupancy
    #db_room.Status = room.Status
    db.commit()
    db.refresh(db_room)
    update_room_status_after_orm_change(db, room_id)
    return db_room

def delete_room(db: Session, room_id: int):
    db_room = get_room_by_id(db, room_id)
    db.delete(db_room)
    db.commit()
    return db_room

def get_room_by_id(db: Session, room_id: int):
    room = db.query(Room).filter(Room.RoomID == room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )
    return room


def get_room_details_by_id(db: Session, room_id: int):
    # Get room basic information
    room = db.query(Room).filter(Room.RoomID == room_id).first()

    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )

    # Get contracts associated with this room
    contracts = db.query(
        Student.StudentID,
        Student.FullName,
        Contract.StartDate,
        Contract.EndDate
    ).join(
        Contract, Contract.StudentID == Student.StudentID
    ).filter(
        Contract.RoomID == room_id
    ).all()

    # Create room details response
    room_details = {
        "RoomID": room.RoomID,
        "RoomNumber": room.RoomNumber,
        "RoomTypeID": room.RoomTypeID,
        "MaxOccupancy": room.MaxOccupancy,
        "Status": room.Status,
        "Students": [
            {
                "StudentID": student_id,
                "FullName": fullname,
                "StartDate": start_date,
                "EndDate": end_date
            } for student_id, fullname, start_date, end_date in contracts
        ]
    }

    return room_details

def get_rooms(db: Session):
    return db.query(Room).all()

def get_rooms_with_count(db: Session, skip: int = 0, limit: int = 20):
    total = db.query(Room).count()
    rooms = db.query(Room).offset(skip).limit(limit).all()
    return rooms, total

def search_rooms_by_number(db: Session, room_number: str):
    """Search for rooms by room number (partial match)"""
    query = db.query(Room.RoomID, Room.RoomNumber)
    
    if room_number:
        query = query.filter(Room.RoomNumber.ilike(f"%{room_number}%"))
        
    return query.all()
