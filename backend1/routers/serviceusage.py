import math
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from database import SessionLocal
from crud import serviceusage as crud_serviceusage
from schemas.serviceusage import ServiceUsageCreate, ServiceUsageOut, PaginatedServiceUsageResponse

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

@router.get("/", response_model=PaginatedServiceUsageResponse)
def read_serviceusages_paginated(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db)
):
    skip = (page - 1) * size
    serviceusages, total = crud_serviceusage.get_serviceusages_with_count(db, skip, size)
    return {
        "items": serviceusages,
        "total": total,
        "page": page,
        "size": size,
        "pages": math.ceil(total / size) if total > 0 else 0
    }

@router.get("/all", response_model=List[ServiceUsageOut])
def read_all_serviceusages(db: Session = Depends(get_db)):
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

@router.delete("/all", response_model=dict)
def delete_all_serviceusages(db: Session = Depends(get_db)):
    return crud_serviceusage.delete_all_serviceusages(db)
