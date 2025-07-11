import datetime
import random
from sqlalchemy.orm import Session
from sqlalchemy import delete
from models.contract import Contract
from models.invoice import Invoice
from models.student import Student
from models.room import Room
from models.roomtype import RoomType
from models.service import Service
from models.serviceusage import ServiceUsage
from database import SessionLocal, Base, engine


def seed_database():
    # Wipe database first by dropping and recreating all tables
    print("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    print("Recreating all tables...")
    Base.metadata.create_all(bind=engine)

    # Create a new database session
    db: Session = SessionLocal()

    try:
        # Seed RoomTypes - keep this small
        room_types = [
            RoomType(RoomTypeName="Phòng đôi", RentPrice=850.00),
            RoomType(RoomTypeName="Phòng 4 người", RentPrice=650.00),
            RoomType(RoomTypeName="Phòng 8 người (không được nấu ăn)", RentPrice=400.00),
            RoomType(RoomTypeName="Phòng 8 người (được nấu ăn)", RentPrice=450.00),
        ]
        db.add_all(room_types)
        db.flush()  # Flush to get the IDs
        print("Room Types seeded successfully")

        # Seed Rooms - around 100 records
        rooms = []
        for i in range(1, 101):
            floor = (i // 20) + 1
            room_number = f"{floor}{str(i % 20).zfill(2)}"
            room_type_id = random.randint(1, len(room_types))
            max_occupancy = 1 if room_type_id == 1 or room_type_id == 3 else 2
            status = random.choice(["Available", "Full"])

            rooms.append(Room(
                RoomTypeID=room_type_id,
                RoomNumber=room_number,
                MaxOccupancy=max_occupancy,
                Status=status
            ))

        db.add_all(rooms)
        db.flush()
        print("Rooms seeded successfully")

        first_male_names = ["Anh", "Huy", "Tuấn", "Minh", "Long", "Sơn", "Bảo", "Khoa", "Khánh"]
        first_female_names = ["Linh", "Phương", "Thảo", "Mai", "Hằng", "Trang", "Lan", "Ngọc"]

        last_names = ["Nguyễn", "Lê", "Trần", "Hà", "Phạm", "Võ", "Vũ", "Phan", "Trương",
                      "Bùi", "Đặng", "Châu", "Đỗ", "Ngô", "Dương", "Đinh", "Huỳnh"]

        students = []
        for i in range(1, 101):
            gender = random.choice(["Male", "Female"])
            if gender == "Male":
                first_name = random.choice(first_male_names)
            else:
                first_name = random.choice(first_female_names)
            last_name = random.choice(last_names)
            full_name = f"{last_name} {first_name}"
            phone_number = f"{random.randint(100, 999)}{random.randint(100, 999)}{random.randint(1000, 9999)}"

            students.append(Student(
                FullName=full_name,
                Gender=gender,
                PhoneNumber=phone_number
            ))
        db.add_all(students)
        db.flush()
        print("Students seeded successfully")

        # Seed Contracts - around 100 records
        contracts = []
        for i in range(1, 101):
            student_id = i  # One contract per student
            room_id = random.randint(1, len(rooms))

            # Random dates within a 2-year period
            start_year = random.choice([2022, 2023])
            start_month = random.randint(1, 12)
            start_day = random.randint(1, 28)
            start_date = datetime.date(start_year, start_month, start_day)

            # Contract length between 3 months and 1 year
            contract_length = random.randint(90, 365)
            end_date = start_date + datetime.timedelta(days=contract_length)

            contracts.append(Contract(
                StudentID=student_id,
                RoomID=room_id,
                StartDate=start_date,
                EndDate=end_date
            ))
        db.add_all(contracts)
        db.flush()
        print("Contracts seeded successfully")

        # Seed Services - keep this small
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

        # Seed Service Usages - around 100 records
        service_usages = []
        for i in range(1, 101):
            contract_id = random.randint(1, len(contracts))
            service_id = random.randint(1, len(services))
            quantity = random.randint(1, 5)
            usage_month = random.randint(1, 12)
            usage_year = random.choice([2022, 2023])

            service_usages.append(ServiceUsage(
                ContractID=contract_id,
                ServiceID=service_id,
                Quantity=quantity,
                UsageMonth=usage_month,
                UsageYear=usage_year
            ))
        db.add_all(service_usages)
        db.flush()
        print("Service Usages seeded successfully")

        # Seed Invoices - around 100 records
        invoices = []
        for i in range(1, 101):
            service_usage_id = i  # One invoice per service usage

            # Create dates for invoices
            year = random.choice([2022, 2023])
            month = random.randint(1, 12)
            day = random.randint(1, 28)
            created_date = datetime.date(year, month, day)

            # Due date is 30 days after created date
            due_date = created_date + datetime.timedelta(days=30)

            # Random amount between 100 and 1000
            total_amount = round(random.uniform(100.00, 1000.00), 2)

            invoices.append(Invoice(
                ServiceUsageID=service_usage_id,
                CreatedDate=created_date,
                DueDate=due_date,
                TotalAmount=total_amount
            ))
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