from sqlalchemy.orm import Session
from models.serviceusage import ServiceUsage
from schemas.serviceusage import ServiceUsageCreate

def create_serviceusage(db: Session, serviceusage: ServiceUsageCreate):
    db_serviceusage = ServiceUsage(ContractID=serviceusage.ContractID, ServiceID=serviceusage.ServiceID, Quantity=serviceusage.Quantity, UsageMonth=serviceusage.UsageMonth, UsageYear=serviceusage.UsageYear)
    db.add(db_serviceusage)
    db.commit()
    db.refresh(db_serviceusage)
    return db_serviceusage

def get_serviceusage_by_id(db: Session, serviceusage_id: int):
    return db.query(ServiceUsage).filter(ServiceUsage.ServiceUsageID == serviceusage_id).first()

def get_serviceusages(db: Session):
    return db.query(ServiceUsage).all()

def get_serviceusages_with_count(db: Session, skip: int = 0, limit: int = 20):
    """Get paginated service usages with total count"""
    total = db.query(ServiceUsage).count()
    serviceusages = db.query(ServiceUsage).offset(skip).limit(limit).all()
    return serviceusages, total

def update_serviceusage(db: Session, serviceusage_id: int, serviceusage: ServiceUsageCreate):
    db_serviceusage = get_serviceusage_by_id(db, serviceusage_id)
    db_serviceusage.ContractID = serviceusage.ContractID
    db_serviceusage.ServiceID = serviceusage.ServiceID
    db_serviceusage.Quantity = serviceusage.Quantity
    db_serviceusage.UsageMonth = serviceusage.UsageMonth
    db_serviceusage.UsageYear = serviceusage.UsageYear
    db.commit()
    db.refresh(db_serviceusage)
    return db_serviceusage

def delete_serviceusage(db: Session, serviceusage_id: int):
    db_serviceusage = get_serviceusage_by_id(db, serviceusage_id)
    db.delete(db_serviceusage)
    db.commit()
    return db_serviceusage
