from sqlalchemy.orm import Session
from models.contract import Contract
from models.student import Student
from models.room import Room
from models.roomtype import RoomType
from models.serviceusage import ServiceUsage
from models.service import Service
from schemas.contract import ContractCreate

def create_contract(db: Session, contract: ContractCreate):
    db_contract = Contract(StudentID=contract.StudentID, RoomID=contract.RoomID, StartDate=contract.StartDate, EndDate=contract.EndDate)
    db.add(db_contract)
    db.commit()
    db.refresh(db_contract)
    return db_contract

def get_contract_by_id(db: Session, contract_id: int):
    return db.query(Contract).filter(Contract.ContractID == contract_id).first()

def get_contracts(db: Session, skip: int = 0, limit: int = 20):
    return db.query(Contract).offset(skip).limit(limit).all()

# def get_contracts_with_count(db: Session, skip: int = 0, limit: int = 20):
#     total = db.query(Contract).count()
#     contracts = db.query(Contract).offset(skip).limit(limit).all()
#     return contracts, total

def get_contracts_with_count(db: Session, skip: int = 0, limit: int = 20):
    total = db.query(Contract).count()

    # Query with join to get room number
    contracts = db.query(Contract, Room.RoomNumber).join(
        Room, Contract.RoomID == Room.RoomID
    ).offset(skip).limit(limit).all()

    # Transform the results to include room number
    result_contracts = []
    for contract, room_number in contracts:
        contract_dict = {
            "ContractID": contract.ContractID,
            "StudentID": contract.StudentID,
            "RoomID": contract.RoomID,
            "StartDate": contract.StartDate,
            "EndDate": contract.EndDate,
            "RoomNumber": room_number
        }
        result_contracts.append(contract_dict)

    return result_contracts, total

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

def get_contracts_by_room(db: Session, room_id: int):
    return db.query(Contract).filter(Contract.RoomID == room_id).all()

def get_contract_by_id_with_details(db: Session, contract_id: int):
    result = db.query(
        Contract,
        Student.FullName.label("StudentName"),
        Room.RoomNumber.label("RoomNumber"),
        RoomType.RoomTypeName.label("RoomTypeName")
    ).join(
        Student, Contract.StudentID == Student.StudentID
    ).join(
        Room, Contract.RoomID == Room.RoomID
    ).join(
        RoomType, Room.RoomTypeID == RoomType.RoomTypeID
    ).filter(
        Contract.ContractID == contract_id
    ).first()

    if not result:
        return None

    contract, student_name, room_number, room_type = result

    # Query service usages
    service_usages = db.query(
        ServiceUsage.ServiceUsageID,
        ServiceUsage.ServiceID,
        Service.ServiceName,
        ServiceUsage.Quantity,
        Service.UnitPrice,
        ServiceUsage.UsageMonth,
        ServiceUsage.UsageYear
    ).join(
        Service, ServiceUsage.ServiceID == Service.ServiceID
    ).filter(
        ServiceUsage.ContractID == contract_id
    ).all()

    # Create response object
    response = {
        "ContractID": contract.ContractID,
        "StudentID": contract.StudentID,
        "StudentName": student_name,
        "RoomID": contract.RoomID,
        "RoomNumber": room_number,
        "RoomTypeName": room_type,
        "StartDate": contract.StartDate,
        "EndDate": contract.EndDate,
        "ServiceUsages": [
            {
                "ServiceUsageID": su.ServiceUsageID,
                "ServiceID": su.ServiceID,
                "ServiceName": su.ServiceName,
                "Quantity": su.Quantity,
                "UnitPrice": su.UnitPrice,
                "UsageMonth": su.UsageMonth,
                "UsageYear": su.UsageYear
            } for su in service_usages
        ]
    }

    return response

