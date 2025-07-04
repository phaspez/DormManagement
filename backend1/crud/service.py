from sqlalchemy.orm import Session
from models.service import Service
from schemas.service import ServiceCreate

def create_service(db: Session, service: ServiceCreate):
    db_service = Service(ServiceName=service.ServiceName, UnitPrice=service.UnitPrice)
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service

def get_service_by_id(db: Session, service_id: int):
    return db.query(Service).filter(Service.ServiceID == service_id).first()

def get_services(db: Session):
    return db.query(Service).all()

def update_service(db: Session, service_id: int, service: ServiceCreate):
    db_service = get_service_by_id(db, service_id)
    db_service.ServiceName = service.ServiceName
    db_service.UnitPrice = service.UnitPrice
    db.commit()
    db.refresh(db_service)
    return db_service

def delete_service(db: Session, service_id: int):
    db_service = get_service_by_id(db, service_id)
    db.delete(db_service)
    db.commit()
    return db_service