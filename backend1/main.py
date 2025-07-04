from fastapi import FastAPI
from database import engine, Base
from routers import room, roomtype, contract, student, invoice, service, serviceusage

Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello World"}

# Include all routers
app.include_router(room.router)
app.include_router(roomtype.router)
app.include_router(contract.router)
app.include_router(student.router)
app.include_router(invoice.router)
app.include_router(service.router)
app.include_router(serviceusage.router)
