from sqlalchemy.orm import Session
from sqlalchemy import text
from models.invoice import Invoice
from models.serviceusage import ServiceUsage
from models.service import Service
from fastapi import HTTPException, status


# sửa viết tổng thành tiền lại
def create_invoice_triggers(db: Session):
    """Create triggers for automatic invoice amount calculation"""
    
    # Drop existing triggers if they exist
    drop_statements = [
        "DROP TRIGGER IF EXISTS calculate_invoice_total_on_insert",
        "DROP TRIGGER IF EXISTS calculate_invoice_total_on_update"
    ]
    
    for statement in drop_statements:
        db.execute(text(statement))
    
    # Create trigger for calculating invoice total on insert
    insert_trigger_sql = """
    CREATE TRIGGER calculate_invoice_total_on_insert
    BEFORE INSERT ON Invoice
    FOR EACH ROW
    BEGIN
        DECLARE calculated_total DECIMAL(10,2);
        
        -- Calculate total based on service usage and service prices
        SELECT IFNULL(SUM(s.PricePerUnit * su.Quantity), 0) INTO calculated_total
        FROM ServiceUsage su
        JOIN Service s ON su.ServiceID = s.ServiceID
        WHERE su.ServiceUsageID = NEW.ServiceUsageID;
        
        -- Set the total amount to the calculated value
        SET NEW.TotalAmount = calculated_total;
    END;
    """
    
    # Create trigger for recalculating invoice total on update
    update_trigger_sql = """
    CREATE TRIGGER calculate_invoice_total_on_update
    BEFORE UPDATE ON Invoice
    FOR EACH ROW
    BEGIN
        DECLARE calculated_total DECIMAL(10,2);
        
        -- Only recalculate if ServiceUsageID has changed
        IF NEW.ServiceUsageID != OLD.ServiceUsageID THEN
            -- Calculate total based on service usage and service prices
            SELECT IFNULL(SUM(s.PricePerUnit * su.Quantity), 0) INTO calculated_total
            FROM ServiceUsage su
            JOIN Service s ON su.ServiceID = s.ServiceID
            WHERE su.ServiceUsageID = NEW.ServiceUsageID;
            
            -- Set the total amount to the calculated value
            SET NEW.TotalAmount = calculated_total;
        END IF;
    END;
    """
    
    # Create trigger for updating invoice total when service usage is updated
    service_usage_update_trigger = """
    CREATE TRIGGER update_invoice_total_on_usage_change
    AFTER UPDATE ON ServiceUsage
    FOR EACH ROW
    BEGIN
        DECLARE calculated_total DECIMAL(10,2);
        DECLARE invoice_id INT;
        
        -- Find related invoice
        SELECT InvoiceID INTO invoice_id
        FROM Invoice
        WHERE ServiceUsageID = NEW.ServiceUsageID;
        
        -- Only proceed if an invoice exists for this service usage
        IF invoice_id IS NOT NULL THEN
            -- Calculate new total
            SELECT IFNULL(SUM(s.PricePerUnit * su.Quantity), 0) INTO calculated_total
            FROM ServiceUsage su
            JOIN Service s ON su.ServiceID = s.ServiceID
            WHERE su.ServiceUsageID = NEW.ServiceUsageID;
            
            -- Update invoice total
            UPDATE Invoice SET TotalAmount = calculated_total
            WHERE InvoiceID = invoice_id;
        END IF;
    END;
    """
    
    try:
        # Execute the SQL statements
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
    """
    Manually recalculate invoice amount based on related service usage
    Useful for ORM operations where triggers might not fire
    """
    # Get the invoice
    invoice = db.query(Invoice).filter(Invoice.InvoiceID == invoice_id).first()
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    # Get service usage details
    service_usage = db.query(ServiceUsage).filter(
        ServiceUsage.InvoiceID == invoice.InvoiceID
    ).first()
    
    if not service_usage:
        # If no service usage is found, set amount to 0
        invoice.TotalAmount = 0
        return invoice
    
    # Get the service price
    service = db.query(Service).filter(Service.ServiceID == service_usage.ServiceID).first()
    if not service:
        invoice.TotalAmount = 0
        return invoice
    
    # Calculate total amount
    invoice.TotalAmount = service.UnitPrice * service_usage.Quantity
    
    # No need to commit here as this would typically be called
    # within a transaction that will be committed by the caller
    return invoice

def recalculate_all_invoice_amounts(db: Session):
    """Update all invoice amounts based on their service usages"""
    invoices = db.query(Invoice).all()
    
    for invoice in invoices:
        recalculate_invoice_amount(db, invoice.InvoiceID)
    
    db.commit()
    print("All invoice amounts updated successfully")
