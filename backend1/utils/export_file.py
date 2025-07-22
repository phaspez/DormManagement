import pandas as pd
from fastapi.responses import FileResponse
import os
from tempfile import NamedTemporaryFile
from sqlalchemy.orm import Session
from crud import contract as crud_contract, invoice as crud_invoice, room as crud_room, service as crud_service, student as crud_student

def export_contracts_to_excel(db: Session) -> FileResponse:
    contracts, _ = crud_contract.get_contracts_with_count(db, skip=0, limit=10000)
    df = pd.DataFrame(contracts)
    with NamedTemporaryFile(delete=False, suffix='.xlsx') as tmp:
        df.to_excel(tmp.name, index=False)
        tmp_path = tmp.name
    return FileResponse(tmp_path, filename="contracts.xlsx", media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")

def export_invoices_to_excel(db: Session) -> FileResponse:
    invoices = [i.__dict__ for i in crud_invoice.get_invoices(db)]
    for inv in invoices:
        inv.pop('_sa_instance_state', None)
    df = pd.DataFrame(invoices)
    with NamedTemporaryFile(delete=False, suffix='.xlsx') as tmp:
        df.to_excel(tmp.name, index=False)
        tmp_path = tmp.name
    return FileResponse(tmp_path, filename="invoices.xlsx", media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")

def export_rooms_to_excel(db: Session) -> FileResponse:
    rooms = [r.__dict__ for r in crud_room.get_rooms(db)]
    for room in rooms:
        room.pop('_sa_instance_state', None)
    df = pd.DataFrame(rooms)
    with NamedTemporaryFile(delete=False, suffix='.xlsx') as tmp:
        df.to_excel(tmp.name, index=False)
        tmp_path = tmp.name
    return FileResponse(tmp_path, filename="rooms.xlsx", media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")

def export_services_to_excel(db: Session) -> FileResponse:
    services = [s.__dict__ for s in crud_service.get_services(db)]
    for service in services:
        service.pop('_sa_instance_state', None)
    df = pd.DataFrame(services)
    with NamedTemporaryFile(delete=False, suffix='.xlsx') as tmp:
        df.to_excel(tmp.name, index=False)
        tmp_path = tmp.name
    return FileResponse(tmp_path, filename="services.xlsx", media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")

def export_students_to_excel(db: Session) -> FileResponse:
    students = [s.__dict__ for s in crud_student.get_students(db)]
    for student in students:
        student.pop('_sa_instance_state', None)
    df = pd.DataFrame(students)
    with NamedTemporaryFile(delete=False, suffix='.xlsx') as tmp:
        df.to_excel(tmp.name, index=False)
        tmp_path = tmp.name
    return FileResponse(tmp_path, filename="students.xlsx", media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
