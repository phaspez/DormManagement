import datetime
from sqlalchemy.orm import Session
from models.contract import Contract
from models.invoice import Invoice
from models.student import Student
from models.room import Room
from models.roomtype import RoomType
from models.service import Service
from models.serviceusage import ServiceUsage
from database import SessionLocal

def seed_database():
    # Create a new database session
    db: Session = SessionLocal()

    try:
        # Seed RoomTypes
        room_types = [
            RoomType(RoomTypeName="Single", RentPrice=450.00),
            RoomType(RoomTypeName="Double", RentPrice=350.00),
            RoomType(RoomTypeName="Deluxe", RentPrice=550.00),
            RoomType(RoomTypeName="Suite", RentPrice=650.00),
        ]
        db.add_all(room_types)
        db.flush()  # Flush to get the IDs
        print("Room Types seeded successfully")

        # Seed Rooms
        rooms = [
            Room(RoomTypeID=1, RoomNumber="101", MaxOccupancy=1, Status="Available"),
            Room(RoomTypeID=2, RoomNumber="102", MaxOccupancy=2, Status="Available"),
            Room(RoomTypeID=3, RoomNumber="103", MaxOccupancy=1, Status="Available"),
            Room(RoomTypeID=4, RoomNumber="104", MaxOccupancy=2, Status="Full"),
            Room(RoomTypeID=1, RoomNumber="201", MaxOccupancy=1, Status="Available"),
        ]
        db.add_all(rooms)
        db.flush()
        print("Rooms seeded successfully")

        # Seed Students
        students = [
            Student(FullName="John Doe", Gender="Male", PhoneNumber="1234567890"),
            Student(FullName="Jane Smith", Gender="Female", PhoneNumber="2345678901"),
            Student(FullName="Michael Johnson", Gender="Male", PhoneNumber="3456789012"),
            Student(FullName="Emily Brown", Gender="Female", PhoneNumber="4567890123"),
            Student(FullName="David Wilson", Gender="Male", PhoneNumber="5678901234"),
        ]
        db.add_all(students)
        db.flush()
        print("Students seeded successfully")

        # Seed Contracts
        contracts = [
            Contract(StudentID=1, RoomID=1, StartDate=datetime.date(2023, 1, 1), EndDate=datetime.date(2023, 12, 31)),
            Contract(StudentID=2, RoomID=2, StartDate=datetime.date(2023, 2, 1), EndDate=datetime.date(2023, 11, 30)),
            Contract(StudentID=3, RoomID=3, StartDate=datetime.date(2023, 3, 1), EndDate=datetime.date(2023, 10, 31)),
            Contract(StudentID=4, RoomID=4, StartDate=datetime.date(2023, 4, 1), EndDate=datetime.date(2023, 9, 30)),
            Contract(StudentID=5, RoomID=5, StartDate=datetime.date(2023, 5, 1), EndDate=datetime.date(2023, 8, 31)),
        ]
        db.add_all(contracts)
        db.flush()
        print("Contracts seeded successfully")

        # Seed Services
        services = [
            Service(ServiceName="Internet", UnitPrice=30.00),
            Service(ServiceName="Laundry", UnitPrice=15.00),
            Service(ServiceName="Cleaning", UnitPrice=50.00),
            Service(ServiceName="Parking", UnitPrice=75.00),
            Service(ServiceName="Utilities", UnitPrice=100.00),
        ]
        db.add_all(services)
        db.flush()
        print("Services seeded successfully")

        # Seed Service Usages
        service_usages = [
            ServiceUsage(ContractID=1, ServiceID=1, Quantity=1, UsageMonth=1, UsageYear=2023),
            ServiceUsage(ContractID=2, ServiceID=2, Quantity=2, UsageMonth=2, UsageYear=2023),
            ServiceUsage(ContractID=3, ServiceID=3, Quantity=1, UsageMonth=3, UsageYear=2023),
            ServiceUsage(ContractID=4, ServiceID=4, Quantity=1, UsageMonth=4, UsageYear=2023),
            ServiceUsage(ContractID=5, ServiceID=5, Quantity=1, UsageMonth=5, UsageYear=2023),
        ]
        db.add_all(service_usages)
        db.flush()
        print("Service Usages seeded successfully")

        # Seed Invoices
        invoices = [
            Invoice(ServiceUsageID=1, CreatedDate=datetime.date(2023, 1, 15), DueDate=datetime.date(2023, 2, 15),
                    TotalAmount=500.00),
            Invoice(ServiceUsageID=2, CreatedDate=datetime.date(2023, 2, 15), DueDate=datetime.date(2023, 3, 15),
                    TotalAmount=600.00),
            Invoice(ServiceUsageID=3, CreatedDate=datetime.date(2023, 3, 15), DueDate=datetime.date(2023, 4, 15),
                    TotalAmount=700.00),
            Invoice(ServiceUsageID=4, CreatedDate=datetime.date(2023, 4, 15), DueDate=datetime.date(2023, 5, 15),
                    TotalAmount=800.00),
            Invoice(ServiceUsageID=5, CreatedDate=datetime.date(2023, 5, 15), DueDate=datetime.date(2023, 6, 15),
                    TotalAmount=900.00),
        ]
        db.add_all(invoices)
        db.flush()
        print("Invoices seeded successfully")

        # Commit all changes
        db.commit()
        print("All tables seeded successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")

    finally:
        db.close()

if __name__ == "__main__":
    seed_database()