from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr, field_validator
from typing import List, Optional, Union
import uuid
from datetime import datetime, timezone
import httpx
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from contextlib import asynccontextmanager


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Configure logging early
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# SerpAPI Key
SERPAPI_KEY = os.environ.get("SERPAPI_KEY", "")

# News fetching function
async def fetch_news_from_serpapi(query: str) -> List[dict]:
    """Fetch news from SerpAPI for a given query"""
    if not SERPAPI_KEY:
        logger.error("SERPAPI_KEY not configured")
        return []
    
    url = f"https://serpapi.com/search?api_key={SERPAPI_KEY}&engine=google_news&gl=us&q={query.replace(' ', '+')}"
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as http_client:
            response = await http_client.get(url)
            response.raise_for_status()
            data = response.json()
            
            news_results = data.get("news_results", [])
            logger.info(f"Fetched {len(news_results)} articles for query: {query}")
            return news_results
    except Exception as e:
        logger.error(f"Error fetching news for query '{query}': {str(e)}")
        return []

async def fetch_and_store_all_news():
    """Fetch news for all active queries and store in database"""
    logger.info("Starting scheduled news fetch...")
    
    try:
        # Get all active queries
        queries = await db.news_queries.find({"isActive": True}, {"_id": 0}).to_list(100)
        
        # If no queries, create the default one
        if not queries:
            default_query = {
                "id": str(uuid.uuid4()),
                "query": "electronics parts",
                "isActive": True,
                "createdAt": datetime.now(timezone.utc).isoformat()
            }
            await db.news_queries.insert_one(default_query)
            queries = [default_query]
            logger.info("Created default search query: electronics parts")
        
        total_articles = 0
        for q in queries:
            query_text = q["query"]
            articles = await fetch_news_from_serpapi(query_text)
            
            # Store articles
            for article in articles:
                news_doc = {
                    "id": str(uuid.uuid4()),
                    "position": article.get("position", 0),
                    "title": article.get("title", ""),
                    "source": article.get("source", {}),
                    "link": article.get("link", ""),
                    "thumbnail": article.get("thumbnail"),
                    "thumbnail_small": article.get("thumbnail_small"),
                    "date": article.get("date"),
                    "iso_date": article.get("iso_date"),
                    "query": query_text,
                    "fetchedAt": datetime.now(timezone.utc).isoformat(),
                    "isHidden": False
                }
                
                # Upsert by link to avoid duplicates
                await db.news_articles.update_one(
                    {"link": news_doc["link"]},
                    {"$set": news_doc},
                    upsert=True
                )
                total_articles += 1
            
            # Log the fetch
            log_doc = {
                "id": str(uuid.uuid4()),
                "query": query_text,
                "articlesCount": len(articles),
                "status": "success" if articles else "no_results",
                "fetchedAt": datetime.now(timezone.utc).isoformat()
            }
            await db.news_fetch_logs.insert_one(log_doc)
        
        logger.info(f"Scheduled news fetch complete. Stored/updated {total_articles} articles.")
    except Exception as e:
        logger.error(f"Error in scheduled news fetch: {str(e)}")

# Scheduler setup
scheduler = AsyncIOScheduler()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup - Schedule jobs at 8 AM and 4 PM daily
    scheduler.add_job(fetch_and_store_all_news, 'cron', hour=8, minute=0, id='news_fetch_8am')
    scheduler.add_job(fetch_and_store_all_news, 'cron', hour=16, minute=0, id='news_fetch_4pm')
    scheduler.start()
    logger.info("News scheduler started - will fetch daily at 8:00 AM and 4:00 PM")
    
    # Run initial fetch on startup
    await fetch_and_store_all_news()
    
    yield
    
    # Shutdown
    scheduler.shutdown()
    client.close()

# Create the main app with lifespan
app = FastAPI(lifespan=lifespan)

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
    interest: Optional[List[str]] = None
    factoryLocations: Optional[List[str]] = None
    headOfficeLocation: Optional[List[str]] = None
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
    interest: Optional[Union[List[str], str]] = None
    factoryLocations: Optional[List[str]] = None
    headOfficeLocation: Optional[List[str]] = None
    message: Optional[str] = None
    status: str = "new"  # new, contacted, converted, closed
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    @field_validator('interest', mode='before')
    @classmethod
    def normalize_interest(cls, v):
        if v is None or v == '':
            return []
        if isinstance(v, str):
            return [v] if v else []
        return v

# Supplier Request Models
class SupplierRequestCreate(BaseModel):
    companyName: str
    contactName: str
    email: EmailStr
    phone: Optional[str] = None
    website: Optional[str] = None
    productCategories: Optional[List[str]] = None
    regionsServed: Optional[List[str]] = None
    inventoryDescription: Optional[str] = None

class SupplierRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    companyName: str
    contactName: str
    email: str
    phone: Optional[str] = None
    website: Optional[str] = None
    productCategories: Optional[Union[List[str], str]] = None
    regionsServed: Optional[Union[List[str], str]] = None
    inventoryDescription: Optional[str] = None
    status: str = "new"  # new, contacted, approved, rejected
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    @field_validator('productCategories', 'regionsServed', mode='before')
    @classmethod
    def normalize_list_fields(cls, v):
        if v is None or v == '':
            return []
        if isinstance(v, str):
            return [v] if v else []
        return v

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

# =============================================
# SITE CONTENT MANAGEMENT MODELS & ENDPOINTS
# =============================================

# Site Stats Model
class SiteStatCreate(BaseModel):
    key: str  # e.g., "cost_savings", "mpn_coverage", "data_sources", "enterprise_customers"
    value: str  # e.g., "15-20%", "25M+", "400+", "30+"
    label: str  # e.g., "Cost Savings Identified"
    description: str  # e.g., "Average savings identified across customer BOMs"
    order: int = 0

class SiteStatUpdate(BaseModel):
    value: Optional[str] = None
    label: Optional[str] = None
    description: Optional[str] = None
    order: Optional[int] = None

class SiteStat(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    key: str
    value: str
    label: str
    description: str
    order: int = 0

# Hero Section Model
class HeroSectionUpdate(BaseModel):
    headline: Optional[str] = None
    subHeadline: Optional[str] = None
    ctaPrimary: Optional[str] = None
    ctaSecondary: Optional[str] = None
    screenshotUrl: Optional[str] = None

class HeroSection(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = "hero_section"
    headline: str
    subHeadline: str
    ctaPrimary: str
    ctaSecondary: str
    screenshotUrl: str

# Customer Logo Model
class CustomerLogoCreate(BaseModel):
    name: str
    logoUrl: Optional[str] = None
    order: int = 0

class CustomerLogoUpdate(BaseModel):
    name: Optional[str] = None
    logoUrl: Optional[str] = None
    order: Optional[int] = None

class CustomerLogo(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    logoUrl: Optional[str] = None
    order: int = 0

# Product Model
class ProductFeature(BaseModel):
    text: str

class ProductCreate(BaseModel):
    productId: str  # e.g., "1data", "1source", "1xcess"
    name: str
    tagline: str
    description: str
    features: List[str] = []
    benefits: List[str] = []
    icon: str = "Database"
    order: int = 0

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    tagline: Optional[str] = None
    description: Optional[str] = None
    features: Optional[List[str]] = None
    benefits: Optional[List[str]] = None
    icon: Optional[str] = None
    order: Optional[int] = None

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    productId: str
    name: str
    tagline: str
    description: str
    features: List[str] = []
    benefits: List[str] = []
    icon: str = "Database"
    order: int = 0

# =============================================
# SITE STATS ENDPOINTS
# =============================================

@api_router.get("/site-stats", response_model=List[SiteStat])
async def get_site_stats():
    """Get all site statistics"""
    stats = await db.site_stats.find({}, {"_id": 0}).to_list(100)
    if not stats:
        # Return default stats if none exist
        return []
    stats.sort(key=lambda x: x.get('order', 0))
    return stats

@api_router.post("/site-stats", response_model=SiteStat)
async def create_site_stat(input: SiteStatCreate):
    """Create a new site statistic"""
    stat = SiteStat(**input.model_dump())
    doc = stat.model_dump()
    await db.site_stats.insert_one(doc)
    return stat

@api_router.put("/site-stats/{stat_id}", response_model=SiteStat)
async def update_site_stat(stat_id: str, input: SiteStatUpdate):
    """Update a site statistic"""
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await db.site_stats.update_one(
        {"id": stat_id},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Stat not found")
    
    updated = await db.site_stats.find_one({"id": stat_id}, {"_id": 0})
    return updated

@api_router.delete("/site-stats/{stat_id}")
async def delete_site_stat(stat_id: str):
    """Delete a site statistic"""
    result = await db.site_stats.delete_one({"id": stat_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Stat not found")
    return {"message": "Stat deleted successfully"}

@api_router.post("/site-stats/seed")
async def seed_site_stats():
    """Seed default site statistics"""
    count = await db.site_stats.count_documents({})
    if count > 0:
        return {"message": f"Stats already exist ({count} found)", "seeded": False}
    
    default_stats = [
        {"key": "cost_savings", "value": "15-20%", "label": "Cost Savings Identified", "description": "Average savings identified across customer BOMs", "order": 0},
        {"key": "mpn_coverage", "value": "25M+", "label": "MPN Coverage", "description": "Comprehensive part number database", "order": 1},
        {"key": "data_sources", "value": "400+", "label": "Data Sources", "description": "Proprietary data pipes for intelligence", "order": 2},
        {"key": "enterprise_customers", "value": "30+", "label": "Enterprise Customers", "description": "Active OEM & EMS engagements", "order": 3},
    ]
    
    for stat_data in default_stats:
        stat = SiteStat(**stat_data)
        await db.site_stats.insert_one(stat.model_dump())
    
    return {"message": f"Seeded {len(default_stats)} stats", "seeded": True}

# =============================================
# HERO SECTION ENDPOINTS
# =============================================

@api_router.get("/hero-section", response_model=HeroSection)
async def get_hero_section():
    """Get hero section content"""
    hero = await db.hero_section.find_one({"id": "hero_section"}, {"_id": 0})
    if not hero:
        # Return default hero section
        return HeroSection(
            headline="Decision-grade intelligence for electronics procurement",
            subHeadline="From pricing and risk to execution and liquidation — the operating system for electronics procurement.",
            ctaPrimary="Request a Demo",
            ctaSecondary="Talk to Our Team",
            screenshotUrl="https://customer-assets.emergentagent.com/job_baea0157-9ef6-48e3-8c0a-30cdc2e59356/artifacts/zedmi29e_Output.png"
        )
    return hero

@api_router.put("/hero-section", response_model=HeroSection)
async def update_hero_section(input: HeroSectionUpdate):
    """Update hero section content"""
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    # Check if hero section exists
    existing = await db.hero_section.find_one({"id": "hero_section"})
    if not existing:
        # Create default and then update
        default_hero = HeroSection(
            headline="Decision-grade intelligence for electronics procurement",
            subHeadline="From pricing and risk to execution and liquidation — the operating system for electronics procurement.",
            ctaPrimary="Request a Demo",
            ctaSecondary="Talk to Our Team",
            screenshotUrl="https://customer-assets.emergentagent.com/job_baea0157-9ef6-48e3-8c0a-30cdc2e59356/artifacts/zedmi29e_Output.png"
        )
        doc = default_hero.model_dump()
        doc.update(update_data)
        await db.hero_section.insert_one(doc)
    else:
        await db.hero_section.update_one(
            {"id": "hero_section"},
            {"$set": update_data}
        )
    
    updated = await db.hero_section.find_one({"id": "hero_section"}, {"_id": 0})
    return updated

# =============================================
# CUSTOMER LOGOS ENDPOINTS
# =============================================

@api_router.get("/customer-logos", response_model=List[CustomerLogo])
async def get_customer_logos():
    """Get all customer logos"""
    logos = await db.customer_logos.find({}, {"_id": 0}).to_list(100)
    if not logos:
        return []
    logos.sort(key=lambda x: x.get('order', 0))
    return logos

@api_router.post("/customer-logos", response_model=CustomerLogo)
async def create_customer_logo(input: CustomerLogoCreate):
    """Create a new customer logo"""
    logo = CustomerLogo(**input.model_dump())
    await db.customer_logos.insert_one(logo.model_dump())
    return logo

@api_router.put("/customer-logos/{logo_id}", response_model=CustomerLogo)
async def update_customer_logo(logo_id: str, input: CustomerLogoUpdate):
    """Update a customer logo"""
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await db.customer_logos.update_one(
        {"id": logo_id},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Logo not found")
    
    updated = await db.customer_logos.find_one({"id": logo_id}, {"_id": 0})
    return updated

@api_router.delete("/customer-logos/{logo_id}")
async def delete_customer_logo(logo_id: str):
    """Delete a customer logo"""
    result = await db.customer_logos.delete_one({"id": logo_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Logo not found")
    return {"message": "Logo deleted successfully"}

@api_router.post("/customer-logos/seed")
async def seed_customer_logos():
    """Seed default customer logos"""
    count = await db.customer_logos.count_documents({})
    if count > 0:
        return {"message": f"Logos already exist ({count} found)", "seeded": False}
    
    default_logos = [
        "Google", "Uno Minda", "Dixon", "Napino", "SGS Syrma",
        "NCR Atleos", "Lucas TVS", "Lumax", "Bajaj"
    ]
    
    for idx, name in enumerate(default_logos):
        logo = CustomerLogo(name=name, order=idx)
        await db.customer_logos.insert_one(logo.model_dump())
    
    return {"message": f"Seeded {len(default_logos)} logos", "seeded": True}

# =============================================
# PRODUCTS ENDPOINTS
# =============================================

@api_router.get("/products", response_model=List[Product])
async def get_products():
    """Get all products"""
    products = await db.products.find({}, {"_id": 0}).to_list(100)
    if not products:
        return []
    products.sort(key=lambda x: x.get('order', 0))
    return products

@api_router.post("/products", response_model=Product)
async def create_product(input: ProductCreate):
    """Create a new product"""
    product = Product(**input.model_dump())
    await db.products.insert_one(product.model_dump())
    return product

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, input: ProductUpdate):
    """Update a product"""
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await db.products.update_one(
        {"id": product_id},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    updated = await db.products.find_one({"id": product_id}, {"_id": 0})
    return updated

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str):
    """Delete a product"""
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}

@api_router.post("/products/seed")
async def seed_products():
    """Seed default products"""
    count = await db.products.count_documents({})
    if count > 0:
        return {"message": f"Products already exist ({count} found)", "seeded": False}
    
    default_products = [
        {
            "productId": "1data",
            "name": "1Data",
            "tagline": "Pricing & Risk Intelligence",
            "description": "Bloomberg for Components. Independent global price benchmarks, alternate discovery, and risk intelligence for defensible procurement decisions.",
            "features": [
                "Independent global price benchmarks",
                "Alternate part discovery (form/fit/function)",
                "Lifecycle, EOL, and supplier risk alerts",
                "BOM-level cost and sourcing simulations",
                "AI-driven price predictions",
                "Actionable savings opportunities"
            ],
            "benefits": [
                "Benchmark every quote against market data",
                "Identify 10-20% savings opportunities",
                "De-risk your supply chain proactively",
                "Make defensible, auditable decisions"
            ],
            "icon": "Database",
            "order": 0
        },
        {
            "productId": "1source",
            "name": "1Source",
            "tagline": "High-Impact Sourcing Execution",
            "description": "Amazon for Procurement. Execute sourcing where it matters most with vetted global suppliers and transparent landed-cost comparison.",
            "features": [
                "Vetted global suppliers (CN/IN/TW/KR/EU/US)",
                "Transparent landed-cost comparison",
                "Faster RFQ workflows",
                "Aggregated demand intelligence",
                "Seamless ERP integration",
                "You stay in control"
            ],
            "benefits": [
                "Execute only on high-impact components",
                "Reduce sourcing cycle time by 40%",
                "Access global supplier network",
                "Cleaner decisions, better outcomes"
            ],
            "icon": "ShoppingCart",
            "order": 1
        },
        {
            "productId": "1xcess",
            "name": "1Xcess",
            "tagline": "Excess Inventory Monetization",
            "description": "eBay for Components. Structured liquidation of excess and EOL inventory through competitive bidding with approved buyers.",
            "features": [
                "Approved buyers with global reach",
                "Competitive bidding & transparency",
                "Reverse auctions for best pricing",
                "Multi-attribute bidding",
                "Escrow + QA for trust",
                "Faster recovery, fewer write-offs"
            ],
            "benefits": [
                "Turn excess into cash",
                "Reduce working capital lock-up",
                "Transparent liquidation process",
                "Recover value from EOL stock"
            ],
            "icon": "RefreshCw",
            "order": 2
        }
    ]
    
    for product_data in default_products:
        product = Product(**product_data)
        await db.products.insert_one(product.model_dump())
    
    return {"message": f"Seeded {len(default_products)} products", "seeded": True}

# =============================================
# SEED ALL SITE CONTENT
# =============================================

@api_router.post("/site-content/seed-all")
async def seed_all_site_content():
    """Seed all site content if not exists"""
    results = {}
    
    # Seed stats
    stats_result = await seed_site_stats()
    results["stats"] = stats_result
    
    # Seed logos
    logos_result = await seed_customer_logos()
    results["logos"] = logos_result
    
    # Seed products
    products_result = await seed_products()
    results["products"] = products_result
    
    return results

# =============================================
# MAP LOCATIONS MODELS & ENDPOINTS
# =============================================

class MapLocationCreate(BaseModel):
    name: str
    x: float  # X coordinate (percentage, 0-100)
    y: float  # Y coordinate (percentage, 0-100)
    type: str = "Data Source"  # "Sourcing Hub" or "Data Source"
    order: int = 0

class MapLocationUpdate(BaseModel):
    name: Optional[str] = None
    x: Optional[float] = None
    y: Optional[float] = None
    type: Optional[str] = None
    order: Optional[int] = None

class MapLocation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    x: float
    y: float
    type: str = "Data Source"
    order: int = 0

@api_router.get("/map-locations", response_model=List[MapLocation])
async def get_map_locations():
    """Get all map locations"""
    locations = await db.map_locations.find({}, {"_id": 0}).to_list(100)
    if not locations:
        return []
    locations.sort(key=lambda x: x.get('order', 0))
    return locations

@api_router.post("/map-locations", response_model=MapLocation)
async def create_map_location(input: MapLocationCreate):
    """Create a new map location"""
    location = MapLocation(**input.model_dump())
    await db.map_locations.insert_one(location.model_dump())
    return location

@api_router.put("/map-locations/{location_id}", response_model=MapLocation)
async def update_map_location(location_id: str, input: MapLocationUpdate):
    """Update a map location"""
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await db.map_locations.update_one(
        {"id": location_id},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Location not found")
    
    updated = await db.map_locations.find_one({"id": location_id}, {"_id": 0})
    return updated

@api_router.delete("/map-locations/{location_id}")
async def delete_map_location(location_id: str):
    """Delete a map location"""
    result = await db.map_locations.delete_one({"id": location_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Location not found")
    return {"message": "Location deleted successfully"}

@api_router.post("/map-locations/seed")
async def seed_map_locations():
    """Seed default map locations with proper classification"""
    count = await db.map_locations.count_documents({})
    if count > 0:
        return {"message": f"Locations already exist ({count} found)", "seeded": False}
    
    # Sourcing Hubs: China, Taiwan, Korea, Japan (green)
    # Data Sources: USA, Europe, India, Vietnam, Thailand (blue)
    default_locations = [
        {"name": "USA", "x": 18, "y": 42, "type": "Data Source", "order": 0},
        {"name": "Europe", "x": 48, "y": 32, "type": "Data Source", "order": 1},
        {"name": "India", "x": 66, "y": 48, "type": "Data Source", "order": 2},
        {"name": "China", "x": 76, "y": 36, "type": "Sourcing Hub", "order": 3},
        {"name": "Korea", "x": 82, "y": 34, "type": "Sourcing Hub", "order": 4},
        {"name": "Japan", "x": 87, "y": 36, "type": "Sourcing Hub", "order": 5},
        {"name": "Taiwan", "x": 82, "y": 44, "type": "Sourcing Hub", "order": 6},
        {"name": "Vietnam", "x": 77, "y": 50, "type": "Data Source", "order": 7},
        {"name": "Thailand", "x": 73, "y": 50, "type": "Data Source", "order": 8},
    ]
    
    for loc_data in default_locations:
        location = MapLocation(**loc_data)
        await db.map_locations.insert_one(location.model_dump())
    
    return {"message": f"Seeded {len(default_locations)} locations", "seeded": True}

# =============================================
# REGION CARDS MODELS & ENDPOINTS
# =============================================

class RegionCardCreate(BaseModel):
    name: str
    countries: str
    icon: str = "🌍"
    type: str
    order: int = 0

class RegionCardUpdate(BaseModel):
    name: Optional[str] = None
    countries: Optional[str] = None
    icon: Optional[str] = None
    type: Optional[str] = None
    order: Optional[int] = None

class RegionCard(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    countries: str
    icon: str = "🌍"
    type: str
    order: int = 0

@api_router.get("/region-cards", response_model=List[RegionCard])
async def get_region_cards():
    """Get all region cards"""
    cards = await db.region_cards.find({}, {"_id": 0}).to_list(100)
    if not cards:
        return []
    cards.sort(key=lambda x: x.get('order', 0))
    return cards

@api_router.post("/region-cards", response_model=RegionCard)
async def create_region_card(input: RegionCardCreate):
    """Create a new region card"""
    card = RegionCard(**input.model_dump())
    await db.region_cards.insert_one(card.model_dump())
    return card

@api_router.put("/region-cards/{card_id}", response_model=RegionCard)
async def update_region_card(card_id: str, input: RegionCardUpdate):
    """Update a region card"""
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await db.region_cards.update_one(
        {"id": card_id},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Region card not found")
    
    updated = await db.region_cards.find_one({"id": card_id}, {"_id": 0})
    return updated

@api_router.delete("/region-cards/{card_id}")
async def delete_region_card(card_id: str):
    """Delete a region card"""
    result = await db.region_cards.delete_one({"id": card_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Region card not found")
    return {"message": "Region card deleted successfully"}

@api_router.post("/region-cards/seed")
async def seed_region_cards():
    """Seed default region cards"""
    count = await db.region_cards.count_documents({})
    if count > 0:
        return {"message": f"Region cards already exist ({count} found)", "seeded": False}
    
    default_cards = [
        {"name": "Far East", "countries": "China, Taiwan, Japan, Korea", "icon": "🏭", "type": "Manufacturing", "order": 0},
        {"name": "South East Asia", "countries": "Vietnam, Thailand", "icon": "🔧", "type": "Assembly", "order": 1},
        {"name": "India", "countries": "Growing Hub", "icon": "🚀", "type": "Design & Mfg", "order": 2},
        {"name": "Europe", "countries": "Germany, UK, France", "icon": "🎯", "type": "High-End", "order": 3},
        {"name": "Americas", "countries": "USA, Mexico", "icon": "🌎", "type": "Consumption", "order": 4},
    ]
    
    for card_data in default_cards:
        card = RegionCard(**card_data)
        await db.region_cards.insert_one(card.model_dump())
    
    return {"message": f"Seeded {len(default_cards)} region cards", "seeded": True}

# =============================================
# FLOW LINES MODELS & ENDPOINTS
# =============================================

class FlowLineCreate(BaseModel):
    fromLocation: str  # Location name (e.g., "China")
    toLocation: str    # Location name (e.g., "USA")
    color: str = "#3b82f6"  # Hex color
    curveBelow: bool = False  # Whether line curves below (for westward routes)
    isActive: bool = True

class FlowLineUpdate(BaseModel):
    fromLocation: Optional[str] = None
    toLocation: Optional[str] = None
    color: Optional[str] = None
    curveBelow: Optional[bool] = None
    isActive: Optional[bool] = None

class FlowLine(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    fromLocation: str
    toLocation: str
    color: str = "#3b82f6"
    curveBelow: bool = False
    isActive: bool = True

@api_router.get("/flow-lines", response_model=List[FlowLine])
async def get_flow_lines():
    """Get all flow lines"""
    lines = await db.flow_lines.find({}, {"_id": 0}).to_list(500)
    return lines if lines else []

@api_router.post("/flow-lines", response_model=FlowLine)
async def create_flow_line(input: FlowLineCreate):
    """Create a new flow line"""
    line = FlowLine(**input.model_dump())
    await db.flow_lines.insert_one(line.model_dump())
    return line

@api_router.put("/flow-lines/{line_id}", response_model=FlowLine)
async def update_flow_line(line_id: str, input: FlowLineUpdate):
    """Update a flow line"""
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await db.flow_lines.update_one(
        {"id": line_id},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Flow line not found")
    
    updated = await db.flow_lines.find_one({"id": line_id}, {"_id": 0})
    return updated

@api_router.delete("/flow-lines/{line_id}")
async def delete_flow_line(line_id: str):
    """Delete a flow line"""
    result = await db.flow_lines.delete_one({"id": line_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Flow line not found")
    return {"message": "Flow line deleted successfully"}

@api_router.post("/flow-lines/seed")
async def seed_flow_lines():
    """Seed default flow lines based on current locations"""
    count = await db.flow_lines.count_documents({})
    if count > 0:
        return {"message": f"Flow lines already exist ({count} found)", "seeded": False}
    
    # Default flow lines
    default_lines = [
        # From China
        {"fromLocation": "China", "toLocation": "USA", "color": "#8b5cf6", "curveBelow": False},
        {"fromLocation": "China", "toLocation": "Europe", "color": "#8b5cf6", "curveBelow": False},
        {"fromLocation": "China", "toLocation": "Brazil", "color": "#8b5cf6", "curveBelow": True},
        # From Taiwan
        {"fromLocation": "Taiwan", "toLocation": "USA", "color": "#10b981", "curveBelow": False},
        {"fromLocation": "Taiwan", "toLocation": "Europe", "color": "#10b981", "curveBelow": False},
        {"fromLocation": "Taiwan", "toLocation": "Brazil", "color": "#10b981", "curveBelow": True},
        # From Korea
        {"fromLocation": "Korea", "toLocation": "USA", "color": "#3b82f6", "curveBelow": False},
        {"fromLocation": "Korea", "toLocation": "Europe", "color": "#3b82f6", "curveBelow": False},
        {"fromLocation": "Korea", "toLocation": "Brazil", "color": "#3b82f6", "curveBelow": True},
        # From Japan
        {"fromLocation": "Japan", "toLocation": "USA", "color": "#3b82f6", "curveBelow": False},
        {"fromLocation": "Japan", "toLocation": "Europe", "color": "#3b82f6", "curveBelow": False},
        {"fromLocation": "Japan", "toLocation": "Brazil", "color": "#3b82f6", "curveBelow": True},
        # From Vietnam
        {"fromLocation": "Vietnam", "toLocation": "USA", "color": "#f59e0b", "curveBelow": True},
        {"fromLocation": "Vietnam", "toLocation": "Europe", "color": "#f59e0b", "curveBelow": False},
        {"fromLocation": "Vietnam", "toLocation": "Brazil", "color": "#f59e0b", "curveBelow": True},
        # From Thailand
        {"fromLocation": "Thailand", "toLocation": "USA", "color": "#f59e0b", "curveBelow": True},
        {"fromLocation": "Thailand", "toLocation": "Europe", "color": "#f59e0b", "curveBelow": False},
        {"fromLocation": "Thailand", "toLocation": "Brazil", "color": "#f59e0b", "curveBelow": True},
        # From India
        {"fromLocation": "India", "toLocation": "USA", "color": "#10b981", "curveBelow": True},
        {"fromLocation": "India", "toLocation": "Europe", "color": "#10b981", "curveBelow": False},
        {"fromLocation": "India", "toLocation": "Brazil", "color": "#10b981", "curveBelow": True},
    ]
    
    for line_data in default_lines:
        line = FlowLine(**line_data)
        await db.flow_lines.insert_one(line.model_dump())
    
    return {"message": f"Seeded {len(default_lines)} flow lines", "seeded": True}

# Admin Authentication
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD")
if not ADMIN_PASSWORD:
    logger.warning("ADMIN_PASSWORD not set in environment variables. Using default for development only.")
    ADMIN_PASSWORD = "admin@123"  # Only used if env var not set

# News Models (used by API endpoints)
class NewsSource(BaseModel):
    name: str
    icon: Optional[str] = None
    authors: Optional[List[str]] = None

class NewsArticle(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    position: int
    title: str
    source: NewsSource
    link: str
    thumbnail: Optional[str] = None
    thumbnail_small: Optional[str] = None
    date: Optional[str] = None
    iso_date: Optional[str] = None
    query: str
    fetchedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    isHidden: bool = False

class NewsQuery(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    query: str
    isActive: bool = True
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class NewsQueryCreate(BaseModel):
    query: str
    isActive: bool = True

class NewsFetchLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    query: str
    articlesCount: int
    status: str
    errorMessage: Optional[str] = None
    fetchedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# News API Endpoints
@api_router.get("/news", response_model=List[dict])
async def get_news(limit: int = 50, query: Optional[str] = None):
    """Get stored news articles"""
    # Filter out articles without valid links or content
    filter_query = {
        "isHidden": False,
        "link": {"$exists": True, "$ne": "", "$ne": None},
        "title": {"$exists": True, "$ne": "", "$ne": None},
        "source.name": {"$exists": True, "$ne": None}
    }
    if query:
        filter_query["query"] = query
    
    articles = await db.news_articles.find(
        filter_query, 
        {"_id": 0}
    ).sort("fetchedAt", -1).limit(limit).to_list(limit)
    
    return articles

@api_router.get("/news/queries", response_model=List[dict])
async def get_news_queries():
    """Get all news search queries"""
    queries = await db.news_queries.find({}, {"_id": 0}).to_list(100)
    return queries

@api_router.post("/news/queries", response_model=dict)
async def create_news_query(query_data: NewsQueryCreate):
    """Create a new news search query"""
    # Check for duplicate (case-insensitive)
    existing = await db.news_queries.find_one(
        {"query": {"$regex": f"^{query_data.query}$", "$options": "i"}}
    )
    if existing:
        raise HTTPException(status_code=400, detail="Query already exists")
    
    query_doc = {
        "id": str(uuid.uuid4()),
        "query": query_data.query.strip(),
        "isActive": query_data.isActive,
        "createdAt": datetime.now(timezone.utc).isoformat()
    }
    await db.news_queries.insert_one(query_doc)
    return {k: v for k, v in query_doc.items() if k != "_id"}

@api_router.patch("/news/queries/{query_id}")
async def update_news_query(query_id: str, isActive: bool):
    """Toggle news query active status"""
    result = await db.news_queries.update_one(
        {"id": query_id},
        {"$set": {"isActive": isActive}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Query not found")
    return {"success": True}

@api_router.delete("/news/queries/{query_id}")
async def delete_news_query(query_id: str):
    """Delete a news search query"""
    result = await db.news_queries.delete_one({"id": query_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Query not found")
    return {"success": True}

@api_router.post("/news/refresh")
async def refresh_news():
    """Manually trigger news fetch"""
    await fetch_and_store_all_news()
    return {"success": True, "message": "News refresh triggered"}

@api_router.patch("/news/{article_id}/hide")
async def toggle_article_visibility(article_id: str, isHidden: bool):
    """Hide or unhide a news article"""
    result = await db.news_articles.update_one(
        {"id": article_id},
        {"$set": {"isHidden": isHidden}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Article not found")
    return {"success": True}

@api_router.get("/news/logs", response_model=List[dict])
async def get_news_fetch_logs(limit: int = 20, skip: int = 0):
    """Get news fetch logs with pagination"""
    logs = await db.news_fetch_logs.find({}, {"_id": 0}).sort("fetchedAt", -1).skip(skip).limit(limit).to_list(limit)
    return logs

@api_router.get("/news/logs/count", response_model=dict)
async def get_news_fetch_logs_count():
    """Get total count of news fetch logs"""
    count = await db.news_fetch_logs.count_documents({})
    return {"count": count}

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