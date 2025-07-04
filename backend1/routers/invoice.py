from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import SessionLocal
from crud import invoice as crud_invoice
from schemas.invoice import InvoiceCreate, InvoiceOut

router = APIRouter(
    prefix="/invoices",
    tags=["invoices"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=InvoiceOut)
def create_invoice(invoice: InvoiceCreate, db: Session = Depends(get_db)):
    return crud_invoice.create_invoice(db, invoice)

@router.get("/", response_model=List[InvoiceOut])
def read_invoices(db: Session = Depends(get_db)):
    return crud_invoice.get_invoices(db) 

@router.get("/{invoice_id}", response_model=InvoiceOut)
def get_invoice_by_id(invoice_id: int, db: Session = Depends(get_db)):
    return crud_invoice.get_invoice_by_id(db, invoice_id)

@router.put("/{invoice_id}", response_model=InvoiceOut)
def update_invoice(invoice_id: int, invoice: InvoiceCreate, db: Session = Depends(get_db)):
    return crud_invoice.update_invoice(db, invoice_id, invoice)

@router.delete("/{invoice_id}", response_model=InvoiceOut)
def delete_invoice(invoice_id: int, db: Session = Depends(get_db)):
    return crud_invoice.delete_invoice(db, invoice_id)