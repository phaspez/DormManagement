import math

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from database import SessionLocal
from crud import room as crud_room
from schemas.room import RoomCreate, RoomOut, RoomDetailsOut, PaginatedRoomResponse, RoomSearchResult
from utils.room_triggers import get_room_occupancy_info, update_all_room_statuses, create_room_triggers
from utils.export_file import export_rooms_to_excel

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

@router.get("/", response_model=PaginatedRoomResponse)
def read_rooms_paginated(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db)
):
    skip = (page - 1) * size
    rooms, total = crud_room.get_rooms_with_count(db, skip, size)
    return {
        "items": rooms,
        "total": total,
        "page": skip // size + 1,
        "size": size,
        "pages": math.ceil(total / size) if total > 0 else 0
    }

@router.put("/{room_id}", response_model=RoomOut)
def update_room(room_id: int, room: RoomCreate, db: Session = Depends(get_db)):
    return crud_room.update_room(db, room_id, room)

@router.get("/{room_id}", response_model=RoomOut)
def get_room_by_id(room_id: int, db: Session = Depends(get_db)):
    try:
        return crud_room.get_room_by_id(db, room_id)
    except Exception as e:
        print(f"Error getting room by ID {room_id}: {e}")
        raise


@router.get("/{room_id}/details", response_model=RoomDetailsOut)
def get_room_details(room_id: int, db: Session = Depends(get_db)):
    try:
        return crud_room.get_room_details_by_id(db, room_id)
    except Exception as e:
        print(f"Error getting room details for ID {room_id}: {e}")
        raise

@router.delete("/{room_id}", response_model=RoomOut)
def delete_room(room_id: int, db: Session = Depends(get_db)):
    return crud_room.delete_room(db, room_id)


@router.get("/search/by-number", response_model=List[RoomSearchResult])
def search_rooms_by_number(
    room_number: str = Query("", description="Room number to search for (partial match)"),
    db: Session = Depends(get_db)
):
    """Search for rooms by room number and return just ID and room number"""
    return crud_room.search_rooms_by_number(db, room_number)

@router.get("/search/by-number", response_model=List[RoomSearchResult])
def search_rooms_by_number(
    room_number: str = Query("", description="Room number to search for (partial match)"),
    db: Session = Depends(get_db)
):
    """Search for rooms by room number and return just ID and room number"""
    return crud_room.search_rooms_by_number(db, room_number)

@router.get("/search/by-number", response_model=List[RoomSearchResult])
def search_rooms_by_number(
    room_number: str = Query("", description="Room number to search for (partial match)"),
    db: Session = Depends(get_db)
):
    """Search for rooms by room number and return just ID and room number"""
    return crud_room.search_rooms_by_number(db, room_number)

@router.get("/{room_id}/occupancy")
def get_room_occupancy(room_id: int, db: Session = Depends(get_db)):
    """Get detailed occupancy information for a specific room"""
    return get_room_occupancy_info(db, room_id)

@router.post("/update-all-statuses")
def update_room_statuses(db: Session = Depends(get_db)):
    """Manually update all room statuses based on current occupancy"""
    update_all_room_statuses(db)
    return {"message": "All room statuses updated successfully"}

@router.post("/setup-triggers")
def setup_room_triggers(db: Session = Depends(get_db)):
    """Create database triggers for automatic room status management"""
    create_room_triggers(db)
    return {"message": "Room triggers created successfully"}

@router.get("/export/excel")
def export_rooms_excel(db: Session = Depends(get_db)):
    return export_rooms_to_excel(db)
