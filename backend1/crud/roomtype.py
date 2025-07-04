from sqlalchemy.orm import Session
from models.roomtype import RoomType
from schemas.roomtype import RoomTypeCreate

def create_roomtype(db: Session, roomtype: RoomTypeCreate):
    db_roomtype = RoomType(RoomTypeName=roomtype.RoomTypeName, RentPrice=roomtype.RentPrice)
    db.add(db_roomtype)
    db.commit()
    db.refresh(db_roomtype)
    return db_roomtype

def get_roomtype_by_id(db: Session, roomtype_id: int):
    return db.query(RoomType).filter(RoomType.RoomTypeID == roomtype_id).first()

def get_roomtypes(db: Session):
    return db.query(RoomType).all()

def update_roomtype(db: Session, roomtype_id: int, roomtype: RoomTypeCreate):
    db_roomtype = get_roomtype_by_id(db, roomtype_id)
    db_roomtype.RoomTypeName = roomtype.RoomTypeName
    db_roomtype.RentPrice = roomtype.RentPrice
    db.commit()
    db.refresh(db_roomtype)
    return db_roomtype

def delete_roomtype(db: Session, roomtype_id: int):
    db_roomtype = get_roomtype_by_id(db, roomtype_id)
    db.delete(db_roomtype)
    
