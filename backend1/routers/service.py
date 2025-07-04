from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import SessionLocal
from crud import service as crud_service
from schemas.service import ServiceCreate, ServiceOut

router = APIRouter(
    prefix="/services",
    tags=["services"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=ServiceOut)
def create_service(service: ServiceCreate, db: Session = Depends(get_db)):
    return crud_service.create_service(db, service)

@router.get("/", response_model=List[ServiceOut])
def read_services(db: Session = Depends(get_db)):
    return crud_service.get_services(db)

@router.get("/{service_id}", response_model=ServiceOut)
def get_service_by_id(service_id: int, db: Session = Depends(get_db)):
    return crud_service.get_service_by_id(db, service_id)

@router.put("/{service_id}", response_model=ServiceOut)
def update_service(service_id: int, service: ServiceCreate, db: Session = Depends(get_db)):
    return crud_service.update_service(db, service_id, service)

@router.delete("/{service_id}", response_model=ServiceOut)
def delete_service(service_id: int, db: Session = Depends(get_db)):
    return crud_service.delete_service(db, service_id)