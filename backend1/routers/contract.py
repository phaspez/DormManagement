from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List
from database import SessionLocal
from datetime import date
from crud import contract as crud_contract
from schemas.contract import ContractCreate, ContractOut, ContractDetail, PaginatedContractResponse
from models.student import Student
from models.room import Room
import math
from utils.export_file import export_contracts_to_excel

router = APIRouter(
    prefix="/contracts",
    tags=["contracts"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=ContractOut)
def create_contract(contract: ContractCreate, db: Session = Depends(get_db)):
    return crud_contract.create_contract(db, contract)

@router.get("/{contract_id}", response_model=ContractOut)
def get_contract_by_id(contract_id: int, db: Session = Depends(get_db)):
    return crud_contract.get_contract_by_id(db, contract_id)

@router.get("/{contract_id}/details")
def get_contract_details(contract_id: int, db: Session = Depends(get_db)):
    return crud_contract.get_contract_by_id_with_details(db, contract_id)

@router.put("/{contract_id}", response_model=ContractOut)
def update_contract(contract_id: int, contract: ContractCreate, db: Session = Depends(get_db)):
    return crud_contract.update_contract(db, contract_id, contract)

@router.delete("/{contract_id}", response_model=ContractOut)
def delete_contract(contract_id: int, db: Session = Depends(get_db)):
    return crud_contract.delete_contract(db, contract_id)

@router.get("/", response_model=PaginatedContractResponse)
def read_contracts(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db)
):
    skip = (page - 1) * size
    contracts, total = crud_contract.get_contracts_with_count(db, skip=skip, limit=size)
    
    return {
        "items": contracts,
        "total": total,
        "page": page,
        "size": size,
        "pages": math.ceil(total / size) if total > 0 else 0
    }

@router.get("/export/excel")
def export_contracts_excel(db: Session = Depends(get_db)):
    return export_contracts_to_excel(db)

@router.get("/student/{student_id}/status")
def get_student_contract_status(student_id: int, db: Session = Depends(get_db)):
    """Get the contract status for a specific student"""
    # Check if student exists
    student = db.query(Student).filter(Student.StudentID == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )
    
    # Get active contract
    active_contract = crud_contract.get_student_active_contract(db, student_id)
    
    # Get all contracts
    all_contracts = crud_contract.get_student_all_contracts(db, student_id)
    
    response = {
        "student_id": student_id,
        "student_name": student.FullName,
        "has_active_contract": active_contract is not None,
        "active_contract": None,
        "all_contracts": []
    }
    
    if active_contract:
        room = db.query(Room).filter(Room.RoomID == active_contract.RoomID).first()
        response["active_contract"] = {
            "contract_id": active_contract.ContractID,
            "room_id": active_contract.RoomID,
            "room_number": room.RoomNumber if room else "Unknown",
            "start_date": active_contract.StartDate,
            "end_date": active_contract.EndDate
        }
    
    for contract in all_contracts:
        room = db.query(Room).filter(Room.RoomID == contract.RoomID).first()
        response["all_contracts"].append({
            "contract_id": contract.ContractID,
            "room_id": contract.RoomID,
            "room_number": room.RoomNumber if room else "Unknown",
            "start_date": contract.StartDate,
            "end_date": contract.EndDate,
            "is_active": contract.StartDate <= date.today() <= contract.EndDate
        })
    
    return response

