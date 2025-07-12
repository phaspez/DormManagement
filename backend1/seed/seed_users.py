from database import SessionLocal
from crud import user as crud_user

def seed_users():
    db = SessionLocal()
    try:
        # Check if admin user already exists
        admin_user = crud_user.get_user_by_username(db, "admin")
        if not admin_user:
            crud_user.create_user(db, "admin", "admin123")
            print("Admin user created successfully")
        else:
            print("Admin user already exists")

        # Check if test user already exists
        test_user = crud_user.get_user_by_username(db, "testuser")
        if not test_user:
            crud_user.create_user(db, "testuser", "test123")
            print("Test user created successfully")
        else:
            print("Test user already exists")

    except Exception as e:
        print(f"Error seeding users: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_users() 