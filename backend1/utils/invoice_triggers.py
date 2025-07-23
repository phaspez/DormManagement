from sqlalchemy.orm import Session
from sqlalchemy import text
from models.invoice import Invoice
from models.serviceusage import ServiceUsage
from models.service import Service
from fastapi import HTTPException, status


def create_invoice_triggers(db: Session):
    """Tạo trigger tự động tính tổng tiền hóa đơn dựa trên tất cả ServiceUsage liên kết với Invoice"""
    # Xóa trigger cũ nếu có
    drop_statements = [
        "DROP TRIGGER IF EXISTS calculate_invoice_total_on_insert",
        "DROP TRIGGER IF EXISTS calculate_invoice_total_on_update",
        "DROP TRIGGER IF EXISTS update_invoice_total_on_serviceusage_update"
    ]
    for statement in drop_statements:
        db.execute(text(statement))

    # Trigger khi INSERT vào Invoice
    insert_trigger_sql = """
    CREATE TRIGGER calculate_invoice_total_on_insert
    BEFORE INSERT ON Invoice
    FOR EACH ROW
    BEGIN
        DECLARE calculated_total DECIMAL(10,2);
        SELECT IFNULL(SUM(s.UnitPrice * su.Quantity), 0) INTO calculated_total
        FROM ServiceUsage su
        JOIN Service s ON su.ServiceID = s.ServiceID
        WHERE su.InvoiceID = NEW.InvoiceID;
        SET NEW.TotalAmount = calculated_total;
    END;
    """

    # Trigger khi UPDATE Invoice
    update_trigger_sql = """
    CREATE TRIGGER calculate_invoice_total_on_update
    BEFORE UPDATE ON Invoice
    FOR EACH ROW
    BEGIN
        DECLARE calculated_total DECIMAL(10,2);
        SELECT IFNULL(SUM(s.UnitPrice * su.Quantity), 0) INTO calculated_total
        FROM ServiceUsage su
        JOIN Service s ON su.ServiceID = s.ServiceID
        WHERE su.InvoiceID = NEW.InvoiceID;
        SET NEW.TotalAmount = calculated_total;
    END;
    """

    # Trigger khi UPDATE ServiceUsage (cập nhật tổng tiền hóa đơn liên quan)
    service_usage_update_trigger = """
    CREATE TRIGGER update_invoice_total_on_serviceusage_update
    AFTER UPDATE ON ServiceUsage
    FOR EACH ROW
    BEGIN
        DECLARE calculated_total DECIMAL(10,2);
        SELECT IFNULL(SUM(s.UnitPrice * su.Quantity), 0) INTO calculated_total
        FROM ServiceUsage su
        JOIN Service s ON su.ServiceID = s.ServiceID
        WHERE su.InvoiceID = NEW.InvoiceID;
        UPDATE Invoice SET TotalAmount = calculated_total
        WHERE InvoiceID = NEW.InvoiceID;
    END;
    """

    try:
        db.execute(text(insert_trigger_sql))
        db.execute(text(update_trigger_sql))
        db.execute(text(service_usage_update_trigger))
        db.commit()
        print("Invoice triggers created successfully")
    except Exception as e:
        db.rollback()
        print(f"Error creating invoice triggers: {e}")
        raise

def recalculate_invoice_amount(db: Session, invoice_id: int):
    invoice = db.query(Invoice).filter(Invoice.InvoiceID == invoice_id).first()
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )

    # Lấy tất cả service usages liên quan
    service_usages = db.query(ServiceUsage).filter(
        ServiceUsage.InvoiceID == invoice.InvoiceID
    ).all()

    total = 0
    for su in service_usages:
        service = db.query(Service).filter(Service.ServiceID == su.ServiceID).first()
        if service:
            total += service.UnitPrice * su.Quantity

    invoice.TotalAmount = total
    return invoice

def recalculate_all_invoice_amounts(db: Session):
    """Update all invoice amounts based on their service usages"""
    invoices = db.query(Invoice).all()
    
    for invoice in invoices:
        recalculate_invoice_amount(db, invoice.InvoiceID)
    
    db.commit()
    print("All invoice amounts updated successfully")
