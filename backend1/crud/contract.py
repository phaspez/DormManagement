from sqlalchemy.orm import Session
from models.contract import Contract
from schemas.contract import ContractCreate

def create_contract(db: Session, contract: ContractCreate):
    db_contract = Contract(StudentID=contract.StudentID, RoomID=contract.RoomID, StartDate=contract.StartDate, EndDate=contract.EndDate)
    db.add(db_contract)
    db.commit()
    db.refresh(db_contract)
    return db_contract

def get_contract_by_id(db: Session, contract_id: int):
    return db.query(Contract).filter(Contract.ContractID == contract_id).first()

def get_contracts(db: Session):
    return db.query(Contract).all()

def update_contract(db: Session, contract_id: int, contract: ContractCreate):
    db_contract = get_contract_by_id(db, contract_id)
    db_contract.StudentID = contract.StudentID
    db_contract.RoomID = contract.RoomID
    db_contract.StartDate = contract.StartDate
    db_contract.EndDate = contract.EndDate
    db.commit()
    db.refresh(db_contract)
    return db_contract

def delete_contract(db: Session, contract_id: int):
    db_contract = get_contract_by_id(db, contract_id)
    db.delete(db_contract)
    db.commit()
    return db_contract
