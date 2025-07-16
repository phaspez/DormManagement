from sqlalchemy.orm import Session
from sqlalchemy import text
from models.room import Room
from models.contract import Contract
from fastapi import HTTPException, status

def create_room_triggers(db: Session):
    """Create triggers for automatic room status management"""
    
    # Drop existing triggers if they exist
    drop_statements = [
        "DROP TRIGGER IF EXISTS update_room_status_on_contract_insert",
        "DROP TRIGGER IF EXISTS update_room_status_on_contract_delete",
        "DROP TRIGGER IF EXISTS update_room_status_on_contract_update"
    ]
    
    for statement in drop_statements:
        db.execute(text(statement))
        
    
    # Create trigger for when a contract is inserted
    insert_trigger_sql = """
    CREATE TRIGGER update_room_status_on_contract_insert
    AFTER INSERT ON Contract
    FOR EACH ROW
    BEGIN
        DECLARE current_occupancy INT;
        DECLARE max_occupancy INT;
        
        -- Get current occupancy count for the room
        SELECT COUNT(*) INTO current_occupancy
        FROM Contract 
        WHERE RoomID = NEW.RoomID 
        AND StartDate <= CURDATE()
        AND EndDate >= CURDATE();
        
        -- Get max occupancy for the room
        SELECT MaxOccupancy INTO max_occupancy
        FROM Room 
        WHERE RoomID = NEW.RoomID;
        
        -- Update room status based on occupancy
        IF current_occupancy >= max_occupancy THEN
            UPDATE Room SET Status = 'Full' WHERE RoomID = NEW.RoomID;
        ELSE
            UPDATE Room SET Status = 'Available' WHERE RoomID = NEW.RoomID;
        END IF;
    END;
    """
    
    # Create trigger for when a contract is deleted
    delete_trigger_sql = """
    CREATE TRIGGER update_room_status_on_contract_delete
    AFTER DELETE ON Contract
    FOR EACH ROW
    BEGIN
        DECLARE current_occupancy INT;
        DECLARE max_occupancy INT;
        
        -- Get current occupancy count for the room
        SELECT COUNT(*) INTO current_occupancy
        FROM Contract 
        WHERE RoomID = OLD.RoomID 
        AND StartDate <= CURDATE()
        AND EndDate >= CURDATE();
        
        -- Get max occupancy for the room
        SELECT MaxOccupancy INTO max_occupancy
        FROM Room 
        WHERE RoomID = OLD.RoomID;
        
        -- Update room status based on occupancy
        IF current_occupancy >= max_occupancy THEN
            UPDATE Room SET Status = 'Full' WHERE RoomID = OLD.RoomID;
        ELSE
            UPDATE Room SET Status = 'Available' WHERE RoomID = OLD.RoomID;
        END IF;
    END;
    """
    
    # Create trigger for when a contract is updated
    update_trigger_sql = """
    CREATE TRIGGER update_room_status_on_contract_update
    AFTER UPDATE ON Contract
    FOR EACH ROW
    BEGIN
        DECLARE current_occupancy INT;
        DECLARE max_occupancy INT;
        
        -- Update status for old room if room changed
        IF OLD.RoomID != NEW.RoomID THEN
            -- Update old room status
            SELECT COUNT(*) INTO current_occupancy
            FROM Contract 
            WHERE RoomID = OLD.RoomID 
            AND StartDate <= CURDATE()
            AND EndDate >= CURDATE();
            
            SELECT MaxOccupancy INTO max_occupancy
            FROM Room 
            WHERE RoomID = OLD.RoomID;
            
            IF current_occupancy >= max_occupancy THEN
                UPDATE Room SET Status = 'Full' WHERE RoomID = OLD.RoomID;
            ELSE
                UPDATE Room SET Status = 'Available' WHERE RoomID = OLD.RoomID;
            END IF;
        END IF;
        
        -- Update status for new room
        SELECT COUNT(*) INTO current_occupancy
        FROM Contract 
        WHERE RoomID = NEW.RoomID 
        AND StartDate <= CURDATE()
        AND EndDate >= CURDATE();
        
        SELECT MaxOccupancy INTO max_occupancy
        FROM Room 
        WHERE RoomID = NEW.RoomID;
        
        IF current_occupancy >= max_occupancy THEN
            UPDATE Room SET Status = 'Full' WHERE RoomID = NEW.RoomID;
        ELSE
            UPDATE Room SET Status = 'Available' WHERE RoomID = NEW.RoomID;
        END IF;
    END;
    """
    
    try:
        # Execute the SQL statements
        
        db.execute(text(insert_trigger_sql))
        db.execute(text(delete_trigger_sql))
        db.execute(text(update_trigger_sql))
        db.commit()
        print("Room triggers created successfully")
    except Exception as e:
        db.rollback()
        print(f"Error creating triggers: {e}")
        raise

def check_room_availability(db: Session, room_id: int) -> bool:
    """Check if a room is available for new students"""
    room = db.query(Room).filter(Room.RoomID == room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )
    
    # Count active contracts for this room (contracts that are currently active)
    active_contracts = db.query(Contract).filter(
        Contract.RoomID == room_id,
        Contract.StartDate <= text('CURDATE()'),
        Contract.EndDate >= text('CURDATE()')
    ).count()
    
    return active_contracts < room.MaxOccupancy

def get_room_occupancy_info(db: Session, room_id: int):
    """Get current occupancy information for a room"""
    room = db.query(Room).filter(Room.RoomID == room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )
    
    # Count active contracts (contracts that are currently active)
    active_contracts = db.query(Contract).filter(
        Contract.RoomID == room_id,
        Contract.StartDate <= text('CURDATE()'),
        Contract.EndDate >= text('CURDATE()')
    ).count()
    
    return {
        "room_id": room.RoomID,
        "room_number": room.RoomNumber,
        "max_occupancy": room.MaxOccupancy,
        "current_occupancy": active_contracts,
        "available_spots": room.MaxOccupancy - active_contracts,
        "status": room.Status,
        "is_available": active_contracts < room.MaxOccupancy
    }

def update_all_room_statuses(db: Session):
    """Update status for all rooms based on current occupancy"""
    rooms = db.query(Room).all()
    
    for room in rooms:
        active_contracts = db.query(Contract).filter(
            Contract.RoomID == room.RoomID,
            Contract.StartDate <= text('CURDATE()'),
            Contract.EndDate >= text('CURDATE()')
        ).count()
        
        if active_contracts >= room.MaxOccupancy:
            room.Status = 'Full'
        else:
            room.Status = 'Available'
    
    db.commit()
    print("All room statuses updated successfully")


def update_room_status_after_orm_change(db: Session, room_id: int):
    """
    Manually update room status after ORM operations
    to compensate for triggers not firing during ORM updates.
    """
    # Get the room
    room = db.query(Room).filter(Room.RoomID == room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )

    # Count active contracts
    active_contracts = db.query(Contract).filter(
        Contract.RoomID == room_id,
        Contract.StartDate <= text('CURDATE()'),
        Contract.EndDate >= text('CURDATE()')
    ).count()

    # Update status based on occupancy
    if active_contracts >= room.MaxOccupancy:
        room.Status = 'Full'
    else:
        room.Status = 'Available'

    # No need to commit here as this would typically be called
    # within a transaction that will be committed by the caller