from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import SessionLocal
from crud import student as crud_student
from schemas.student import StudentCreate, StudentOut

router = APIRouter(
    prefix="/students",
    tags=["students"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=StudentOut)
def create_student(student: StudentCreate, db: Session = Depends(get_db)):
    return crud_student.create_student(db, student)

@router.get("/", response_model=List[StudentOut])
def read_students(db: Session = Depends(get_db)):
    return crud_student.get_students(db) 

@router.get("/{student_id}", response_model=StudentOut)
def get_student_by_id(student_id: int, db: Session = Depends(get_db)):
    return crud_student.get_student_by_id(db, student_id)

@router.put("/{student_id}", response_model=StudentOut)
def update_student(student_id: int, student: StudentCreate, db: Session = Depends(get_db)):
    return crud_student.update_student(db, student_id, student)

@router.delete("/{student_id}", response_model=StudentOut)      
def delete_student(student_id: int, db: Session = Depends(get_db)):
    return crud_student.delete_student(db, student_id)