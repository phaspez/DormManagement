from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import SessionLocal
from crud import serviceusage as crud_serviceusage
from schemas.serviceusage import ServiceUsageCreate, ServiceUsageOut

router = APIRouter(
    prefix="/serviceusages",
    tags=["serviceusages"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=ServiceUsageOut)
def create_serviceusage(serviceusage: ServiceUsageCreate, db: Session = Depends(get_db)):
    return crud_serviceusage.create_serviceusage(db, serviceusage)

@router.get("/", response_model=List[ServiceUsageOut])
def read_serviceusages(db: Session = Depends(get_db)):
    return crud_serviceusage.get_serviceusages(db) 

@router.get("/{serviceusage_id}", response_model=ServiceUsageOut)
def get_serviceusage_by_id(serviceusage_id: int, db: Session = Depends(get_db)):
    return crud_serviceusage.get_serviceusage_by_id(db, serviceusage_id)

@router.put("/{serviceusage_id}", response_model=ServiceUsageOut)
def update_serviceusage(serviceusage_id: int, serviceusage: ServiceUsageCreate, db: Session = Depends(get_db)):
    return crud_serviceusage.update_serviceusage(db, serviceusage_id, serviceusage)

@router.delete("/{serviceusage_id}", response_model=ServiceUsageOut)    
def delete_serviceusage(serviceusage_id: int, db: Session = Depends(get_db)):
    return crud_serviceusage.delete_serviceusage(db, serviceusage_id)