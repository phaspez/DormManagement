from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
from routers import room, roomtype, contract, student, invoice, service, serviceusage

Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
