from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Demo Request Models
class DemoRequestCreate(BaseModel):
    firstName: str
    lastName: str
    email: EmailStr
    company: str
    title: Optional[str] = None
    companySize: Optional[str] = None
    interest: Optional[str] = None
    message: Optional[str] = None

class DemoRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    firstName: str
    lastName: str
    email: str
    company: str
    title: Optional[str] = None
    companySize: Optional[str] = None
    interest: Optional[str] = None
    message: Optional[str] = None
    status: str = "new"  # new, contacted, converted, closed
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# Demo Request Endpoints
@api_router.post("/demo-requests", response_model=DemoRequest)
async def create_demo_request(input: DemoRequestCreate):
    """Submit a new demo request"""
    demo_dict = input.model_dump()
    demo_obj = DemoRequest(**demo_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = demo_obj.model_dump()
    doc['createdAt'] = doc['createdAt'].isoformat()
    
    await db.demo_requests.insert_one(doc)
    logger.info(f"New demo request from {input.firstName} {input.lastName} ({input.email}) - {input.company}")
    return demo_obj

@api_router.get("/demo-requests", response_model=List[DemoRequest])
async def get_demo_requests():
    """Get all demo requests (for admin purposes)"""
    requests = await db.demo_requests.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for req in requests:
        if isinstance(req.get('createdAt'), str):
            req['createdAt'] = datetime.fromisoformat(req['createdAt'])
    
    # Sort by newest first
    requests.sort(key=lambda x: x.get('createdAt', datetime.min), reverse=True)
    return requests

@api_router.get("/demo-requests/{request_id}", response_model=DemoRequest)
async def get_demo_request(request_id: str):
    """Get a specific demo request by ID"""
    request = await db.demo_requests.find_one({"id": request_id}, {"_id": 0})
    if not request:
        raise HTTPException(status_code=404, detail="Demo request not found")
    
    if isinstance(request.get('createdAt'), str):
        request['createdAt'] = datetime.fromisoformat(request['createdAt'])
    
    return request

@api_router.patch("/demo-requests/{request_id}/status")
async def update_demo_request_status(request_id: str, status: str):
    """Update the status of a demo request"""
    valid_statuses = ["new", "contacted", "converted", "closed"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    result = await db.demo_requests.update_one(
        {"id": request_id},
        {"$set": {"status": status}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Demo request not found")
    
    return {"message": "Status updated successfully", "status": status}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()