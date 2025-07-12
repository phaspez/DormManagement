from database import SessionLocal
from utils.room_triggers import create_room_triggers, update_all_room_statuses

def initialize_triggers():
    """Initialize room triggers and update all room statuses"""
    db = SessionLocal()
    try:
        print("Setting up room triggers...")
        create_room_triggers(db)
        
        print("Updating all room statuses...")
        update_all_room_statuses(db)
        
        print("Room management system initialized successfully!")
    except Exception as e:
        print(f"Error initializing triggers: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    initialize_triggers()