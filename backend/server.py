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

# Supplier Request Models
class SupplierRequestCreate(BaseModel):
    companyName: str
    contactName: str
    email: EmailStr
    phone: Optional[str] = None
    website: Optional[str] = None
    productCategories: Optional[str] = None
    regionsServed: Optional[str] = None
    inventoryDescription: Optional[str] = None

class SupplierRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    companyName: str
    contactName: str
    email: str
    phone: Optional[str] = None
    website: Optional[str] = None
    productCategories: Optional[str] = None
    regionsServed: Optional[str] = None
    inventoryDescription: Optional[str] = None
    status: str = "new"  # new, contacted, approved, rejected
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Testimonial Models
class TestimonialCreate(BaseModel):
    quote: str
    author: str
    company: str
    industry: Optional[str] = None
    isActive: bool = True

class TestimonialUpdate(BaseModel):
    quote: Optional[str] = None
    author: Optional[str] = None
    company: Optional[str] = None
    industry: Optional[str] = None
    isActive: Optional[bool] = None

class Testimonial(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    quote: str
    author: str
    company: str
    industry: Optional[str] = None
    isActive: bool = True
    order: int = 0
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

# Supplier Request Endpoints
@api_router.post("/supplier-requests", response_model=SupplierRequest)
async def create_supplier_request(input: SupplierRequestCreate):
    """Submit a new supplier enrollment request"""
    supplier_dict = input.model_dump()
    supplier_obj = SupplierRequest(**supplier_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = supplier_obj.model_dump()
    doc['createdAt'] = doc['createdAt'].isoformat()
    
    await db.supplier_requests.insert_one(doc)
    logger.info(f"New supplier request from {input.companyName} ({input.email})")
    return supplier_obj

@api_router.get("/supplier-requests", response_model=List[SupplierRequest])
async def get_supplier_requests():
    """Get all supplier requests (for admin purposes)"""
    requests = await db.supplier_requests.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for req in requests:
        if isinstance(req.get('createdAt'), str):
            req['createdAt'] = datetime.fromisoformat(req['createdAt'])
    
    # Sort by newest first
    requests.sort(key=lambda x: x.get('createdAt', datetime.min), reverse=True)
    return requests

@api_router.patch("/supplier-requests/{request_id}/status")
async def update_supplier_request_status(request_id: str, status: str):
    """Update the status of a supplier request"""
    valid_statuses = ["new", "contacted", "approved", "rejected"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    result = await db.supplier_requests.update_one(
        {"id": request_id},
        {"$set": {"status": status}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Supplier request not found")
    
    return {"message": "Status updated successfully", "status": status}

# Testimonial Endpoints
@api_router.get("/testimonials", response_model=List[Testimonial])
async def get_testimonials(active_only: bool = False):
    """Get all testimonials"""
    query = {"isActive": True} if active_only else {}
    testimonials = await db.testimonials.find(query, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for t in testimonials:
        if isinstance(t.get('createdAt'), str):
            t['createdAt'] = datetime.fromisoformat(t['createdAt'])
    
    # Sort by order, then by createdAt
    testimonials.sort(key=lambda x: (x.get('order', 0), x.get('createdAt', datetime.min)))
    return testimonials

@api_router.post("/testimonials", response_model=Testimonial)
async def create_testimonial(input: TestimonialCreate):
    """Create a new testimonial"""
    # Get the highest order number
    highest = await db.testimonials.find_one(sort=[("order", -1)])
    next_order = (highest.get("order", 0) + 1) if highest else 1
    
    testimonial_dict = input.model_dump()
    testimonial_obj = Testimonial(**testimonial_dict, order=next_order)
    
    doc = testimonial_obj.model_dump()
    doc['createdAt'] = doc['createdAt'].isoformat()
    
    await db.testimonials.insert_one(doc)
    logger.info(f"New testimonial created from {input.author} at {input.company}")
    return testimonial_obj

@api_router.put("/testimonials/{testimonial_id}", response_model=Testimonial)
async def update_testimonial(testimonial_id: str, input: TestimonialUpdate):
    """Update a testimonial"""
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await db.testimonials.update_one(
        {"id": testimonial_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    
    updated = await db.testimonials.find_one({"id": testimonial_id}, {"_id": 0})
    if isinstance(updated.get('createdAt'), str):
        updated['createdAt'] = datetime.fromisoformat(updated['createdAt'])
    
    return updated

@api_router.delete("/testimonials/{testimonial_id}")
async def delete_testimonial(testimonial_id: str):
    """Delete a testimonial"""
    result = await db.testimonials.delete_one({"id": testimonial_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    
    return {"message": "Testimonial deleted successfully"}

@api_router.post("/testimonials/reorder")
async def reorder_testimonials(testimonial_ids: List[str]):
    """Reorder testimonials by providing ordered list of IDs"""
    for index, tid in enumerate(testimonial_ids):
        await db.testimonials.update_one(
            {"id": tid},
            {"$set": {"order": index}}
        )
    return {"message": "Testimonials reordered successfully"}

@api_router.post("/testimonials/seed")
async def seed_testimonials():
    """Seed initial testimonials if none exist"""
    count = await db.testimonials.count_documents({})
    if count > 0:
        return {"message": f"Testimonials already exist ({count} found)", "seeded": False}
    
    default_testimonials = [
        {
            "quote": "We're flying blind — no data to audit procurement. We can't verify if we're sourcing at the right price or overpaying.",
            "author": "CEO",
            "company": "Napino Industries",
            "industry": "Auto Components"
        },
        {
            "quote": "Even billion-dollar teams don't have real-time visibility. Component pricing, new introductions, tariffs — it's all dynamic and stressful.",
            "author": "Sourcing Lead",
            "company": "Google Supply Chain",
            "industry": "Technology"
        },
        {
            "quote": "We're losing capital to dead stock. Quarterly piles of excess components with no transparent channel to liquidate.",
            "author": "COO",
            "company": "Leading Listed EMS",
            "industry": "Electronics Manufacturing"
        },
        {
            "quote": "Smaller EMS players can't access the same network. Large OEMs have better supplier visibility and pricing. We're structurally disadvantaged.",
            "author": "Promoter",
            "company": "Emerging EMS Player",
            "industry": "Electronics Manufacturing"
        },
        {
            "quote": "1Buy.AI identified 18% savings opportunity on our first BOM analysis. The data transparency is game-changing.",
            "author": "VP Procurement",
            "company": "Dixon Technologies",
            "industry": "Consumer Electronics"
        },
        {
            "quote": "Finally, a platform that gives us independent price benchmarks. No more relying solely on distributor quotes.",
            "author": "Head of Sourcing",
            "company": "Uno Minda",
            "industry": "Auto Components"
        }
    ]
    
    for index, t in enumerate(default_testimonials):
        testimonial = Testimonial(**t, order=index)
        doc = testimonial.model_dump()
        doc['createdAt'] = doc['createdAt'].isoformat()
        await db.testimonials.insert_one(doc)
    
    return {"message": f"Seeded {len(default_testimonials)} testimonials", "seeded": True}

# Admin Authentication
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "admin@123")

class AdminLoginRequest(BaseModel):
    password: str

@api_router.post("/admin/login")
async def admin_login(request: AdminLoginRequest):
    """Verify admin password"""
    if request.password == ADMIN_PASSWORD:
        return {"success": True, "message": "Login successful"}
    else:
        raise HTTPException(status_code=401, detail="Invalid password")

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