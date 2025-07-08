from sqlalchemy.orm import Session
from models.student import Student
from schemas.student import StudentCreate

def create_student(db: Session, student: StudentCreate):
    db_student = Student(FullName=student.FullName, Gender=student.Gender, PhoneNumber=student.PhoneNumber)
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

def get_student_by_id(db: Session, student_id: int):
    return db.query(Student).filter(Student.StudentID == student_id).first()

def get_students(db: Session):
    return db.query(Student).all()

def get_students_with_count(db: Session, skip: int = 0, limit: int = 20):
    total = db.query(Student).count()
    students = db.query(Student).offset(skip).limit(limit).all()
    return students, total

def update_student(db: Session, student_id: int, student: StudentCreate):
    db_student = get_student_by_id(db, student_id)
    db_student.FullName = student.FullName

def delete_student(db: Session, student_id: int):
    db_student = get_student_by_id(db, student_id)
    db.delete(db_student)
    db.commit()
    return db_student
