import math
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from database import SessionLocal
from crud import invoice as crud_invoice
from schemas.invoice import InvoiceCreate, InvoiceOut, PaginatedInvoiceResponse, InvoiceDetail
from utils.invoice_triggers import recalculate_invoice_amount, recalculate_all_invoice_amounts
from utils.export_file import export_invoices_to_excel

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

@router.get("/", response_model=PaginatedInvoiceResponse)
def read_invoices_paginated(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db)
):
    skip = (page - 1) * size
    invoices, total = crud_invoice.get_invoices_with_count(db, skip, size)
    return {
        "items": invoices,
        "total": total,
        "page": page,
        "size": size,
        "pages": math.ceil(total / size) if total > 0 else 0
    }

@router.get("/{invoice_id}", response_model=InvoiceOut)
def get_invoice_by_id(invoice_id: int, db: Session = Depends(get_db)):
    return crud_invoice.get_invoice_by_id(db, invoice_id)

@router.get("/{invoice_id}/details")
def get_invoice_details(invoice_id: int, db: Session = Depends(get_db)):
    return crud_invoice.get_invoice_by_id_with_details(db, invoice_id)

@router.put("/{invoice_id}", response_model=InvoiceOut)
def update_invoice(invoice_id: int, invoice: InvoiceCreate, db: Session = Depends(get_db)):
    return crud_invoice.update_invoice(db, invoice_id, invoice)

@router.delete("/{invoice_id}", response_model=InvoiceOut)
def delete_invoice(invoice_id: int, db: Session = Depends(get_db)):
    return crud_invoice.delete_invoice(db, invoice_id)

@router.post("/{invoice_id}/recalculate", response_model=InvoiceOut)
def recalculate_invoice(invoice_id: int, db: Session = Depends(get_db)):
    invoice = crud_invoice.get_invoice_by_id(db, invoice_id)
    recalculate_invoice_amount(db, invoice_id)
    db.commit()
    db.refresh(invoice)
    return invoice

@router.post("/recalculate-all", response_model=dict)
def recalculate_all_invoices(db: Session = Depends(get_db)):
    recalculate_all_invoice_amounts(db)
    return {"message": "All invoice amounts recalculated successfully"}

@router.get("/export/excel")
def export_invoices_excel(db: Session = Depends(get_db)):
    return export_invoices_to_excel(db)
