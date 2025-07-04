from sqlalchemy.orm import Session
from models.invoice import Invoice
from schemas.invoice import InvoiceCreate

def create_invoice(db: Session, invoice: InvoiceCreate):
    db_invoice = Invoice(ServiceUsageID=invoice.ServiceUsageID, CreatedDate=invoice.CreatedDate, DueDate=invoice.DueDate, TotalAmount=invoice.TotalAmount)
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    return db_invoice

def get_invoice_by_id(db: Session, invoice_id: int):
    return db.query(Invoice).filter(Invoice.InvoiceID == invoice_id).first()

def get_invoices(db: Session):
    return db.query(Invoice).all()

def update_invoice(db: Session, invoice_id: int, invoice: InvoiceCreate):
    db_invoice = get_invoice_by_id(db, invoice_id)
    db_invoice.ServiceUsageID = invoice.ServiceUsageID
    db_invoice.CreatedDate = invoice.CreatedDate
    db_invoice.DueDate = invoice.DueDate
    db_invoice.TotalAmount = invoice.TotalAmount
    db.commit()
    db.refresh(db_invoice)
    return db_invoice

def delete_invoice(db: Session, invoice_id: int):
    db_invoice = get_invoice_by_id(db, invoice_id)
    db.delete(db_invoice)
    db.commit()
    return db_invoice
