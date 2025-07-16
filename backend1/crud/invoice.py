from sqlalchemy.orm import Session
from models.invoice import Invoice
from schemas.invoice import InvoiceCreate
from utils.invoice_triggers import recalculate_invoice_amount

def create_invoice(db: Session, invoice: InvoiceCreate):
    # Create invoice with initial values
    db_invoice = Invoice(ServiceUsageID=invoice.ServiceUsageID, CreatedDate=invoice.CreatedDate, DueDate=invoice.DueDate, TotalAmount=0)
    db.add(db_invoice)
    db.flush()  # Flush to get the invoice ID
    
    # Recalculate the total amount based on service usage
    recalculate_invoice_amount(db, db_invoice.InvoiceID)
    
    db.commit()
    db.refresh(db_invoice)
    return db_invoice

def get_invoice_by_id(db: Session, invoice_id: int):
    return db.query(Invoice).filter(Invoice.InvoiceID == invoice_id).first()

def get_invoices(db: Session):
    return db.query(Invoice).all()

def get_invoices_with_count(db: Session, skip: int = 0, limit: int = 20):
    total = db.query(Invoice).count()
    invoices = db.query(Invoice).offset(skip).limit(limit).all()
    return invoices, total

def update_invoice(db: Session, invoice_id: int, invoice: InvoiceCreate):
    db_invoice = get_invoice_by_id(db, invoice_id)
    
    # Update invoice fields
    db_invoice.ServiceUsageID = invoice.ServiceUsageID
    db_invoice.CreatedDate = invoice.CreatedDate
    db_invoice.DueDate = invoice.DueDate
    
    # Recalculate the total amount if ServiceUsageID changed
    recalculate_invoice_amount(db, invoice_id)
    
    db.commit()
    db.refresh(db_invoice)
    return db_invoice

def delete_invoice(db: Session, invoice_id: int):
    db_invoice = get_invoice_by_id(db, invoice_id)
    db.delete(db_invoice)
    db.commit()
    return db_invoice
