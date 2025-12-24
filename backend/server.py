from fastapi import FastAPI, APIRouter, HTTPException, BackgroundTasks
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr, field_validator
from typing import List, Optional, Union
import uuid
from datetime import datetime, timezone
import httpx
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from contextlib import asynccontextmanager
from bs4 import BeautifulSoup
import re
from risk_engine import analyze_article, analyze_articles_batch, RISK_CATEGORIES


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

# MediaStack API Key
MEDIASTACK_KEY = os.environ.get("MEDIASTACK_KEY", "")

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
            logger.info(f"[SerpAPI] Fetched {len(news_results)} articles for query: {query}")
            return news_results
    except Exception as e:
        logger.error(f"[SerpAPI] Error fetching news for query '{query}': {str(e)}")
        return []

async def fetch_news_from_gdelt(query: str) -> List[dict]:
    """Fetch news from GDELT Project API for a given query"""
    encoded_query = query.replace(' ', '%20')
    url = f"https://api.gdeltproject.org/api/v2/doc/doc?query={encoded_query}&mode=ArtList&format=json&maxrecords=50"
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as http_client:
            response = await http_client.get(url)
            response.raise_for_status()
            data = response.json()
            
            # GDELT returns articles in "articles" array
            articles = data.get("articles", [])
            logger.info(f"[GDELT] Fetched {len(articles)} articles for query: {query}")
            return articles
    except Exception as e:
        logger.error(f"[GDELT] Error fetching news for query '{query}': {str(e)}")
        return []

async def fetch_news_from_mediastack(query: str) -> List[dict]:
    """Fetch news from MediaStack API for a given query (rate limited - weekly only)"""
    if not MEDIASTACK_KEY:
        logger.error("MEDIASTACK_KEY not configured")
        return []
    
    encoded_query = query.replace(' ', '%20')
    # Note: Removed categories filter as it was returning 0 results with country filter
    url = f"https://api.mediastack.com/v1/news?access_key={MEDIASTACK_KEY}&keywords={encoded_query}&languages=en&countries=us,cn,tw,in,jp,kr,de&sort=published_desc&limit=25"
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as http_client:
            response = await http_client.get(url, headers={"Accept": "application/json"})
            response.raise_for_status()
            data = response.json()
            
            # MediaStack returns articles in "data" array
            articles = data.get("data", [])
            logger.info(f"[MediaStack] Fetched {len(articles)} articles for query: {query}")
            return articles
    except Exception as e:
        logger.error(f"[MediaStack] Error fetching news for query '{query}': {str(e)}")
        return []


# ============== WEB SCRAPER ==============

async def scrape_article_content(url: str) -> dict:
    """Scrape full article content from URL"""
    result = {
        "scraped": False,
        "scrapedAt": None,
        "fullContent": None,
        "summary": None,
        "wordCount": 0,
        "scrapeError": None,
        "metaDescription": None,
        "ogDescription": None
    }
    
    if not url:
        result["scrapeError"] = "No URL provided"
        return result
    
    # User agent to avoid blocks
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
    }
    
    # Known paywall/blocked domains - try to get metadata anyway
    PAYWALL_DOMAINS = [
        'reuters.com',
        'bloomberg.com', 
        'wsj.com',
        'ft.com',
        'nytimes.com',
        'washingtonpost.com',
        'economist.com'
    ]
    
    is_paywall_site = any(domain in url.lower() for domain in PAYWALL_DOMAINS)
    
    try:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            response = await client.get(url, headers=headers)
            
            # Even if we get a 403, try to parse the response for metadata
            html = response.text
            soup = BeautifulSoup(html, 'lxml')
            
            # Always try to extract metadata first
            metadata = extract_metadata(soup, url)
            result["metaDescription"] = metadata.get("description")
            result["ogDescription"] = metadata.get("og_description")
            
            # If paywall or 403, use metadata as content
            if response.status_code == 403 or is_paywall_site:
                meta_content = metadata.get("og_description") or metadata.get("description") or metadata.get("twitter_description")
                if meta_content and len(meta_content) > 50:
                    result["scraped"] = True
                    result["scrapedAt"] = datetime.now(timezone.utc).isoformat()
                    result["fullContent"] = meta_content
                    result["summary"] = meta_content[:500] if len(meta_content) > 500 else meta_content
                    result["wordCount"] = len(meta_content.split())
                    result["scrapeError"] = "Paywall - metadata only"
                    logger.info(f"[Scraper] Extracted metadata ({result['wordCount']} words) from paywall: {url[:50]}...")
                    return result
                else:
                    result["scrapeError"] = f"Paywall site - no metadata available"
                    result["permanentFailure"] = True
                    return result
            
            response.raise_for_status()
            
            # Remove unwanted elements
            for element in soup.find_all(['script', 'style', 'nav', 'header', 'footer', 'aside', 'advertisement', 'iframe', 'noscript', 'form', 'button']):
                element.decompose()
            
            # Try to find article content using common selectors
            article_content = None
            
            # Priority selectors for article content (expanded list)
            selectors = [
                'article',
                '[role="article"]',
                '.article-content',
                '.article-body',
                '.post-content',
                '.entry-content',
                '.story-body',
                '.content-body',
                '#article-body',
                '.article__body',
                'main article',
                '.news-article',
                '.story-content',
                '.blog-post-content',
                '.rich-text',
                '.post-body',
                '[itemprop="articleBody"]',
                '.wysiwyg-content',
                '.text-content',
                '.page-content',
                '#content',
                '.content'
            ]
            
            for selector in selectors:
                content = soup.select_one(selector)
                if content:
                    article_content = content
                    break
            
            # Fallback to main or body
            if not article_content:
                article_content = soup.find('main') or soup.find('body')
            
            if article_content:
                # Extract paragraphs
                paragraphs = article_content.find_all('p')
                text_parts = []
                
                for p in paragraphs:
                    text = p.get_text(strip=True)
                    # Filter out very short paragraphs (likely navigation/ads)
                    if len(text) > 50:
                        text_parts.append(text)
                
                full_content = '\n\n'.join(text_parts)
                
                # Clean up the text
                full_content = re.sub(r'\s+', ' ', full_content)  # Normalize whitespace
                full_content = full_content.strip()
                
                if full_content:
                    word_count = len(full_content.split())
                    
                    # If content too short, try to use metadata
                    if word_count < 30:
                        meta_content = metadata.get("og_description") or metadata.get("description")
                        if meta_content and len(meta_content.split()) >= 10:
                            full_content = meta_content
                            word_count = len(meta_content.split())
                            result["scrapeError"] = "Short content - using metadata"
                        else:
                            result["scrapeError"] = f"Content too short ({word_count} words)"
                            return result
                    
                    # Create a summary (first 500 chars)
                    summary = full_content[:500] + '...' if len(full_content) > 500 else full_content
                    
                    result["scraped"] = True
                    result["scrapedAt"] = datetime.now(timezone.utc).isoformat()
                    result["fullContent"] = full_content
                    result["summary"] = summary
                    result["wordCount"] = word_count
                    
                    logger.info(f"[Scraper] Successfully scraped {word_count} words from {url[:50]}...")
                else:
                    # Try metadata as fallback
                    meta_content = metadata.get("og_description") or metadata.get("description")
                    if meta_content and len(meta_content.split()) >= 10:
                        result["scraped"] = True
                        result["scrapedAt"] = datetime.now(timezone.utc).isoformat()
                        result["fullContent"] = meta_content
                        result["summary"] = meta_content
                        result["wordCount"] = len(meta_content.split())
                        result["scrapeError"] = "No article content - using metadata"
                        logger.info(f"[Scraper] Using metadata ({result['wordCount']} words) from {url[:50]}...")
                    else:
                        result["scrapeError"] = "No meaningful content found (empty)"
            else:
                result["scrapeError"] = "Could not locate article content"
                
    except httpx.TimeoutException:
        result["scrapeError"] = "Timeout - can retry later"
        result["retryable"] = True
        logger.warning(f"[Scraper] Timeout: {url[:50]}...")
    except httpx.HTTPStatusError as e:
        status = e.response.status_code
        
        # Try to extract metadata from the error response
        try:
            html = e.response.text
            soup = BeautifulSoup(html, 'lxml')
            metadata = extract_metadata(soup, url)
            meta_content = metadata.get("og_description") or metadata.get("description")
            
            if meta_content and len(meta_content.split()) >= 10:
                result["scraped"] = True
                result["scrapedAt"] = datetime.now(timezone.utc).isoformat()
                result["fullContent"] = meta_content
                result["summary"] = meta_content
                result["wordCount"] = len(meta_content.split())
                result["scrapeError"] = f"HTTP {status} - metadata only"
                result["metaDescription"] = metadata.get("description")
                result["ogDescription"] = metadata.get("og_description")
                logger.info(f"[Scraper] Extracted metadata from {status} response ({result['wordCount']} words): {url[:50]}...")
                return result
        except:
            pass
        
        if status == 429:
            result["scrapeError"] = "Rate limited (429) - can retry later"
            result["retryable"] = True
        elif status in [401, 403]:
            result["scrapeError"] = f"Access denied (HTTP {status}) - likely paywall"
            result["permanentFailure"] = True
        elif status == 404:
            result["scrapeError"] = "Article not found (404)"
            result["permanentFailure"] = True
        else:
            result["scrapeError"] = f"HTTP {status}"
        logger.warning(f"[Scraper] HTTP Error {status}: {url[:50]}...")
    except Exception as e:
        result["scrapeError"] = str(e)[:100]
        logger.warning(f"[Scraper] Error scraping {url[:50]}...: {str(e)[:50]}")
    
    return result


def extract_metadata(soup: BeautifulSoup, url: str) -> dict:
    """Extract metadata from HTML page"""
    metadata = {}
    
    # Meta description
    meta_desc = soup.find('meta', attrs={'name': 'description'})
    if meta_desc and meta_desc.get('content'):
        metadata['description'] = meta_desc.get('content').strip()
    
    # Open Graph description
    og_desc = soup.find('meta', attrs={'property': 'og:description'})
    if og_desc and og_desc.get('content'):
        metadata['og_description'] = og_desc.get('content').strip()
    
    # Twitter description
    twitter_desc = soup.find('meta', attrs={'name': 'twitter:description'})
    if twitter_desc and twitter_desc.get('content'):
        metadata['twitter_description'] = twitter_desc.get('content').strip()
    
    # Open Graph title (sometimes more descriptive)
    og_title = soup.find('meta', attrs={'property': 'og:title'})
    if og_title and og_title.get('content'):
        metadata['og_title'] = og_title.get('content').strip()
    
    # Article excerpt/summary
    article_excerpt = soup.find('meta', attrs={'name': 'article:excerpt'})
    if article_excerpt and article_excerpt.get('content'):
        metadata['excerpt'] = article_excerpt.get('content').strip()
    
    # Schema.org JSON-LD
    for script in soup.find_all('script', type='application/ld+json'):
        try:
            import json
            data = json.loads(script.string)
            if isinstance(data, dict):
                if data.get('@type') in ['NewsArticle', 'Article', 'WebPage']:
                    if data.get('description'):
                        metadata['schema_description'] = data.get('description')
                    if data.get('articleBody'):
                        metadata['article_body'] = data.get('articleBody')[:2000]
            elif isinstance(data, list):
                for item in data:
                    if isinstance(item, dict) and item.get('@type') in ['NewsArticle', 'Article']:
                        if item.get('description'):
                            metadata['schema_description'] = item.get('description')
                        if item.get('articleBody'):
                            metadata['article_body'] = item.get('articleBody')[:2000]
        except:
            pass
    
    # Combine best available description
    if metadata.get('article_body'):
        metadata['best_content'] = metadata['article_body']
    elif metadata.get('schema_description'):
        metadata['best_content'] = metadata['schema_description']
    elif metadata.get('og_description'):
        metadata['best_content'] = metadata['og_description']
    elif metadata.get('description'):
        metadata['best_content'] = metadata['description']
    
    return metadata


async def scrape_unscraped_articles(limit: int = 50, retry_failed: bool = False):
    """Background task to scrape articles that haven't been scraped yet.
    
    IMPORTANT: This function ONLY scrapes articles where scraped != True.
    Articles that already have fullContent will be skipped to avoid duplication.
    
    Args:
        limit: Maximum number of articles to scrape
        retry_failed: If True, also retry articles marked as retryable failures
    """
    logger.info("=" * 60)
    logger.info("[Scraper] Starting background article scraping...")
    logger.info("[Scraper] Note: Already scraped articles will be skipped")
    logger.info("[Scraper] Note: Paywall sites (Reuters, Bloomberg, etc.) will be skipped")
    logger.info("=" * 60)
    
    try:
        # Build query to find articles to scrape
        # Skip: already scraped, permanent failures (paywalls)
        query = {
            "scraped": {"$ne": True},
            "permanentFailure": {"$ne": True},  # Skip paywall/blocked sites
            "link": {"$exists": True, "$ne": ""}
        }
        
        # If not retrying, also skip any previously failed articles
        if not retry_failed:
            query["scrapeError"] = {"$exists": False}
        
        unscraped = await db.news_articles.find(
            query,
            {"_id": 0, "id": 1, "link": 1, "title": 1}
        ).limit(limit).to_list(limit)
        
        if len(unscraped) == 0:
            logger.info("[Scraper] No articles to scrape - all done or skipped (paywalls/permanent failures)")
            return
        
        logger.info(f"[Scraper] Found {len(unscraped)} articles to scrape")
        
        scraped_count = 0
        failed_count = 0
        skipped_paywall = 0
        
        for article in unscraped:
            url = article.get("link")
            article_id = article.get("id")
            
            if not url or not article_id:
                continue
            
            # Scrape the article
            scrape_result = await scrape_article_content(url)
            
            # Update the article in database
            await db.news_articles.update_one(
                {"id": article_id},
                {"$set": scrape_result}
            )
            
            if scrape_result.get("scraped"):
                scraped_count += 1
                # Compute risk for the scraped article
                full_article = await db.news_articles.find_one({"id": article_id}, {"_id": 0})
                if full_article:
                    risk_data = analyze_article(full_article)
                    await db.news_articles.update_one(
                        {"id": article_id},
                        {"$set": {
                            "risk_score": risk_data["risk_score"],
                            "risk_band": risk_data["risk_band"],
                            "risk_categories": risk_data["risk_categories"],
                            "confidence": risk_data["confidence"],
                            "time_horizon": risk_data["time_horizon"],
                            "category_strength": risk_data["category_strength"],
                            "riskAnalyzedAt": datetime.now(timezone.utc).isoformat()
                        }}
                    )
            elif scrape_result.get("permanentFailure"):
                skipped_paywall += 1
            else:
                failed_count += 1
            
            # Rate limiting - wait 1 second between requests
            await asyncio.sleep(1)
        
        logger.info(f"[Scraper] Completed: {scraped_count} scraped, {failed_count} failed, {skipped_paywall} paywall/blocked")
        logger.info(f"[Scraper] Risk analysis computed for {scraped_count} articles")
        logger.info("=" * 60)
        
    except Exception as e:
        logger.error(f"[Scraper] Error in background scraping: {str(e)}")


async def compute_risk_for_unanalyzed_articles(limit: int = 100):
    """Compute risk scores for articles that haven't been analyzed yet"""
    logger.info("=" * 60)
    logger.info("[RiskEngine] Starting risk analysis for unanalyzed articles...")
    logger.info("=" * 60)
    
    try:
        # Find articles without risk_score
        unanalyzed = await db.news_articles.find(
            {"risk_score": {"$exists": False}},
            {"_id": 0}
        ).limit(limit).to_list(limit)
        
        if not unanalyzed:
            logger.info("[RiskEngine] No unanalyzed articles found")
            return 0
        
        logger.info(f"[RiskEngine] Found {len(unanalyzed)} articles to analyze")
        
        analyzed_count = 0
        for article in unanalyzed:
            article_id = article.get("id")
            if not article_id:
                continue
            
            risk_data = analyze_article(article)
            
            await db.news_articles.update_one(
                {"id": article_id},
                {"$set": {
                    "risk_score": risk_data["risk_score"],
                    "risk_band": risk_data["risk_band"],
                    "risk_categories": risk_data["risk_categories"],
                    "confidence": risk_data["confidence"],
                    "time_horizon": risk_data["time_horizon"],
                    "category_strength": risk_data["category_strength"],
                    "riskAnalyzedAt": datetime.now(timezone.utc).isoformat()
                }}
            )
            analyzed_count += 1
        
        logger.info(f"[RiskEngine] Completed: {analyzed_count} articles analyzed")
        logger.info("=" * 60)
        return analyzed_count
        
    except Exception as e:
        logger.error(f"[RiskEngine] Error: {str(e)}")
        return 0


def normalize_url(url: str) -> str:
    """Normalize URL for duplicate detection - remove trailing slashes, www, etc."""
    if not url:
        return ""
    url = url.lower().strip()
    # Remove trailing slash
    url = url.rstrip('/')
    # Remove www. prefix
    if '://www.' in url:
        url = url.replace('://www.', '://')
    # Remove query parameters for comparison (optional - be careful with this)
    return url

async def fetch_and_store_all_news():
    """Fetch news for all active queries from all APIs and store in database"""
    logger.info("=" * 60)
    logger.info("Starting scheduled news fetch from all sources...")
    logger.info("=" * 60)
    
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
        
        # Track all seen URLs across all queries and APIs for global deduplication
        global_seen_urls = set()
        
        # Get existing URLs from database for duplicate detection
        existing_articles = await db.news_articles.find({}, {"link": 1, "_id": 0}).to_list(10000)
        for article in existing_articles:
            if article.get("link"):
                global_seen_urls.add(normalize_url(article["link"]))
        
        logger.info(f"Found {len(global_seen_urls)} existing articles in database")
        
        total_new_articles = 0
        
        for q in queries:
            query_text = q["query"]
            logger.info(f"\n--- Processing query: '{query_text}' ---")
            
            # Track URLs seen for this query (to avoid duplicates between APIs for same query)
            query_seen_urls = set()
            
            # ========== SERPAPI ==========
            serpapi_articles = await fetch_news_from_serpapi(query_text)
            serpapi_new = 0
            serpapi_existing_updated = 0
            
            for article in serpapi_articles:
                link = article.get("link", "")
                if not link:
                    continue
                    
                normalized_link = normalize_url(link)
                
                # Skip if we've already processed this URL in this query batch
                if normalized_link in query_seen_urls:
                    continue
                
                query_seen_urls.add(normalized_link)
                
                # Check if article already exists in database
                existing = await db.news_articles.find_one({"link": link})
                
                if existing:
                    # Article exists - just add this query to its queries array
                    await db.news_articles.update_one(
                        {"link": link},
                        {"$addToSet": {"queries": query_text}}
                    )
                    serpapi_existing_updated += 1
                else:
                    # New article - create with queries array
                    news_doc = {
                        "id": str(uuid.uuid4()),
                        "position": article.get("position", 0),
                        "title": article.get("title", ""),
                        "source": article.get("source", {}),
                        "link": link,
                        "thumbnail": article.get("thumbnail"),
                        "thumbnail_small": article.get("thumbnail_small"),
                        "date": article.get("date"),
                        "iso_date": article.get("iso_date"),
                        "queries": [query_text],  # Array of queries this article belongs to
                        "apiSource": "SerpAPI",
                        "fetchedAt": datetime.now(timezone.utc).isoformat(),
                        "isHidden": False
                    }
                    
                    await db.news_articles.insert_one(news_doc)
                    global_seen_urls.add(normalized_link)
                    serpapi_new += 1
            
            total_new_articles += serpapi_new
            
            # Log SerpAPI fetch
            serpapi_log = {
                "id": str(uuid.uuid4()),
                "api": "SerpAPI",
                "query": query_text,
                "articlesFound": len(serpapi_articles),
                "newArticles": serpapi_new,
                "existingUpdated": serpapi_existing_updated,
                "status": "success" if serpapi_articles else "no_results",
                "fetchedAt": datetime.now(timezone.utc).isoformat()
            }
            await db.news_fetch_logs.insert_one(serpapi_log)
            logger.info(f"[SerpAPI] Query '{query_text}': {len(serpapi_articles)} found, {serpapi_new} new, {serpapi_existing_updated} existing updated")
            
            # ========== GDELT ==========
            gdelt_articles = await fetch_news_from_gdelt(query_text)
            gdelt_new = 0
            gdelt_existing_updated = 0
            
            for article in gdelt_articles:
                link = article.get("url", "")
                if not link:
                    continue
                    
                normalized_link = normalize_url(link)
                
                # Skip if we've already processed this URL in this query batch
                if normalized_link in query_seen_urls:
                    continue
                
                query_seen_urls.add(normalized_link)
                
                # Check if article already exists in database
                existing = await db.news_articles.find_one({"link": link})
                
                if existing:
                    # Article exists - just add this query to its queries array
                    await db.news_articles.update_one(
                        {"link": link},
                        {"$addToSet": {"queries": query_text}}
                    )
                    gdelt_existing_updated += 1
                else:
                    # Parse GDELT date format (YYYYMMDDTHHMMSSZ)
                    gdelt_date = article.get("seendate", "")
                    iso_date = None
                    if gdelt_date:
                        try:
                            # Convert GDELT date format to ISO
                            iso_date = f"{gdelt_date[:4]}-{gdelt_date[4:6]}-{gdelt_date[6:8]}T{gdelt_date[9:11]}:{gdelt_date[11:13]}:{gdelt_date[13:15]}Z"
                        except (IndexError, ValueError):
                            iso_date = None
                    
                    # New article - create with queries array
                    news_doc = {
                        "id": str(uuid.uuid4()),
                        "position": 0,
                        "title": article.get("title", ""),
                        "source": {
                            "name": article.get("domain", article.get("sourcecountry", "Unknown")),
                            "icon": None
                        },
                        "link": link,
                        "thumbnail": article.get("socialimage"),
                        "thumbnail_small": article.get("socialimage"),
                        "date": gdelt_date,
                        "iso_date": iso_date,
                        "queries": [query_text],  # Array of queries this article belongs to
                        "apiSource": "GDELT",
                        "fetchedAt": datetime.now(timezone.utc).isoformat(),
                        "isHidden": False
                    }
                    
                    await db.news_articles.insert_one(news_doc)
                    global_seen_urls.add(normalized_link)
                    gdelt_new += 1
            
            total_new_articles += gdelt_new
            
            # Log GDELT fetch
            gdelt_log = {
                "id": str(uuid.uuid4()),
                "api": "GDELT",
                "query": query_text,
                "articlesFound": len(gdelt_articles),
                "newArticles": gdelt_new,
                "existingUpdated": gdelt_existing_updated,
                "status": "success" if gdelt_articles else "no_results",
                "fetchedAt": datetime.now(timezone.utc).isoformat()
            }
            await db.news_fetch_logs.insert_one(gdelt_log)
            logger.info(f"[GDELT] Query '{query_text}': {len(gdelt_articles)} found, {gdelt_new} new, {gdelt_existing_updated} existing updated")
        
        logger.info("=" * 60)
        logger.info("Scheduled news fetch complete!")
        logger.info(f"Total new articles stored: {total_new_articles}")
        logger.info("=" * 60)
        
        # Trigger background scraping for new articles
        if total_new_articles > 0:
            logger.info("[Scraper] Starting background scraping for new articles...")
            asyncio.create_task(scrape_unscraped_articles(limit=total_new_articles + 20))
        
    except Exception as e:
        logger.error(f"Error in scheduled news fetch: {str(e)}")


async def fetch_news_for_single_query(query_text: str):
    """Fetch news for a single query from SerpAPI and GDELT (used when new query is added)"""
    logger.info("=" * 60)
    logger.info(f"[SingleQuery] Fetching news for new query: '{query_text}'")
    logger.info("=" * 60)
    
    try:
        # Get existing URLs for duplicate detection
        global_seen_urls = set()
        existing_articles = await db.news_articles.find({}, {"link": 1, "_id": 0}).to_list(10000)
        for article in existing_articles:
            if article.get("link"):
                global_seen_urls.add(normalize_url(article["link"]))
        
        total_new_articles = 0
        query_seen_urls = set()
        
        # ========== SERPAPI ==========
        serpapi_articles = await fetch_news_from_serpapi(query_text)
        serpapi_new = 0
        serpapi_existing_updated = 0
        
        for article in serpapi_articles:
            link = article.get("link", "")
            if not link:
                continue
            
            normalized_link = normalize_url(link)
            
            if normalized_link in query_seen_urls:
                continue
            
            query_seen_urls.add(normalized_link)
            
            if normalized_link in global_seen_urls:
                # Article exists - add query to its queries array
                await db.news_articles.update_one(
                    {"link": {"$regex": f"^{re.escape(link[:50])}", "$options": "i"}},
                    {"$addToSet": {"queries": query_text}}
                )
                serpapi_existing_updated += 1
            else:
                # New article
                article_doc = {
                    "id": str(uuid.uuid4()),
                    "position": article.get("position", 0),
                    "title": article.get("title", ""),
                    "source": article.get("source", {}),
                    "link": link,
                    "thumbnail": article.get("thumbnail"),
                    "thumbnail_small": article.get("thumbnail_small"),
                    "date": article.get("date"),
                    "iso_date": article.get("iso_date"),
                    "queries": [query_text],
                    "apiSource": "SerpAPI",
                    "fetchedAt": datetime.now(timezone.utc).isoformat(),
                    "isHidden": False
                }
                await db.news_articles.insert_one(article_doc)
                global_seen_urls.add(normalized_link)
                serpapi_new += 1
                total_new_articles += 1
        
        logger.info(f"[SerpAPI] Query '{query_text}': {len(serpapi_articles)} found, {serpapi_new} new, {serpapi_existing_updated} existing updated")
        
        # ========== GDELT ==========
        gdelt_articles = await fetch_news_from_gdelt(query_text)
        gdelt_new = 0
        gdelt_existing_updated = 0
        
        for article in gdelt_articles:
            link = article.get("url", "")
            if not link:
                continue
            
            normalized_link = normalize_url(link)
            
            if normalized_link in query_seen_urls:
                continue
            
            query_seen_urls.add(normalized_link)
            
            if normalized_link in global_seen_urls:
                await db.news_articles.update_one(
                    {"link": {"$regex": f"^{re.escape(link[:50])}", "$options": "i"}},
                    {"$addToSet": {"queries": query_text}}
                )
                gdelt_existing_updated += 1
            else:
                # Parse GDELT date format
                iso_date = None
                gdelt_date = article.get("seendate", "")
                if gdelt_date:
                    try:
                        dt = datetime.strptime(gdelt_date, "%Y%m%dT%H%M%SZ")
                        iso_date = dt.replace(tzinfo=timezone.utc).isoformat()
                    except:
                        pass
                
                article_doc = {
                    "id": str(uuid.uuid4()),
                    "position": 0,
                    "title": article.get("title", ""),
                    "source": {"name": article.get("domain", ""), "icon": None},
                    "link": link,
                    "thumbnail": article.get("socialimage"),
                    "thumbnail_small": article.get("socialimage"),
                    "date": gdelt_date,
                    "iso_date": iso_date,
                    "queries": [query_text],
                    "apiSource": "GDELT",
                    "fetchedAt": datetime.now(timezone.utc).isoformat(),
                    "isHidden": False
                }
                await db.news_articles.insert_one(article_doc)
                global_seen_urls.add(normalized_link)
                gdelt_new += 1
                total_new_articles += 1
        
        logger.info(f"[GDELT] Query '{query_text}': {len(gdelt_articles)} found, {gdelt_new} new, {gdelt_existing_updated} existing updated")
        
        # Log fetch to news_fetch_logs
        log_entry = {
            "id": str(uuid.uuid4()),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "queriesProcessed": 1,
            "articlesFound": len(serpapi_articles) + len(gdelt_articles),
            "newArticlesStored": total_new_articles,
            "api": "SerpAPI+GDELT (New Query)",
            "status": "success"
        }
        await db.news_fetch_logs.insert_one(log_entry)
        
        logger.info("=" * 60)
        logger.info(f"[SingleQuery] Complete! New articles stored: {total_new_articles}")
        logger.info("=" * 60)
        
        # Trigger scraping for new articles
        if total_new_articles > 0:
            logger.info("[Scraper] Starting background scraping for new articles...")
            asyncio.create_task(scrape_unscraped_articles(limit=total_new_articles + 10))
        
    except Exception as e:
        logger.error(f"[SingleQuery] Error fetching news for query '{query_text}': {str(e)}")


async def fetch_mediastack_news():
    """Fetch news from MediaStack API for all active queries (runs weekly due to rate limits)"""
    logger.info("=" * 60)
    logger.info("[MediaStack] Starting WEEKLY news fetch...")
    logger.info("=" * 60)
    
    try:
        # Get all active queries
        queries = await db.news_queries.find({"isActive": True}, {"_id": 0}).to_list(100)
        
        if not queries:
            logger.info("[MediaStack] No active queries found")
            return
        
        # Get existing URLs for duplicate detection
        global_seen_urls = set()
        existing_articles = await db.news_articles.find({}, {"link": 1, "_id": 0}).to_list(10000)
        for article in existing_articles:
            if article.get("link"):
                global_seen_urls.add(normalize_url(article["link"]))
        
        total_new_articles = 0
        
        for q in queries:
            query_text = q["query"]
            logger.info(f"[MediaStack] Processing query: '{query_text}'")
            
            mediastack_articles = await fetch_news_from_mediastack(query_text)
            mediastack_new = 0
            mediastack_existing_updated = 0
            
            for article in mediastack_articles:
                link = article.get("url", "")
                if not link:
                    continue
                
                normalized_link = normalize_url(link)
                
                # Check if article already exists
                existing = await db.news_articles.find_one({"link": link})
                
                if existing:
                    # Add this query to existing article
                    await db.news_articles.update_one(
                        {"link": link},
                        {"$addToSet": {"queries": query_text}}
                    )
                    mediastack_existing_updated += 1
                else:
                    # Parse MediaStack date format
                    published_at = article.get("published_at", "")
                    iso_date = published_at if published_at else None
                    
                    news_doc = {
                        "id": str(uuid.uuid4()),
                        "position": 0,
                        "title": article.get("title", ""),
                        "source": {
                            "name": article.get("source", "Unknown"),
                            "icon": None
                        },
                        "link": link,
                        "thumbnail": article.get("image"),
                        "thumbnail_small": article.get("image"),
                        "date": published_at,
                        "iso_date": iso_date,
                        "queries": [query_text],
                        "apiSource": "MediaStack",
                        "fetchedAt": datetime.now(timezone.utc).isoformat(),
                        "isHidden": False
                    }
                    
                    await db.news_articles.insert_one(news_doc)
                    global_seen_urls.add(normalized_link)
                    mediastack_new += 1
            
            total_new_articles += mediastack_new
            
            # Log MediaStack fetch
            mediastack_log = {
                "id": str(uuid.uuid4()),
                "api": "MediaStack",
                "query": query_text,
                "articlesFound": len(mediastack_articles),
                "newArticles": mediastack_new,
                "existingUpdated": mediastack_existing_updated,
                "status": "success" if mediastack_articles else "no_results",
                "fetchedAt": datetime.now(timezone.utc).isoformat()
            }
            await db.news_fetch_logs.insert_one(mediastack_log)
            logger.info(f"[MediaStack] Query '{query_text}': {len(mediastack_articles)} found, {mediastack_new} new, {mediastack_existing_updated} existing updated")
        
        logger.info("=" * 60)
        logger.info("[MediaStack] Weekly news fetch complete!")
        logger.info(f"[MediaStack] Total new articles stored: {total_new_articles}")
        logger.info("=" * 60)
        
        # Trigger background scraping for new articles
        if total_new_articles > 0:
            logger.info("[Scraper] Starting background scraping for MediaStack articles...")
            asyncio.create_task(scrape_unscraped_articles(limit=total_new_articles + 10))
        
    except Exception as e:
        logger.error(f"[MediaStack] Error in weekly news fetch: {str(e)}")


# Scheduler setup
scheduler = AsyncIOScheduler()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup - Schedule jobs
    # SerpAPI + GDELT: Daily at 8 AM and 4 PM UTC
    scheduler.add_job(fetch_and_store_all_news, 'cron', hour=8, minute=0, id='news_fetch_8am')
    scheduler.add_job(fetch_and_store_all_news, 'cron', hour=16, minute=0, id='news_fetch_4pm')
    
    # MediaStack: Weekly on Monday at 2:30 AM UTC (8:00 AM IST)
    scheduler.add_job(fetch_mediastack_news, 'cron', day_of_week='mon', hour=2, minute=30, id='mediastack_weekly')
    
    scheduler.start()
    logger.info("News scheduler started:")
    logger.info("  - SerpAPI + GDELT: Daily at 8:00 AM and 4:00 PM UTC")
    logger.info("  - MediaStack: Weekly on Monday at 8:00 AM IST (2:30 AM UTC)")
    
    # Run initial fetch on startup (only SerpAPI + GDELT, not MediaStack due to rate limits)
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

# Site Settings Model
class SiteSettingsUpdate(BaseModel):
    showClientNames: Optional[bool] = None
    clientSectionTitle: Optional[str] = None

class SiteSettings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = "site_settings"
    showClientNames: bool = True
    clientSectionTitle: str = "Trusted by leading OEMs and EMSs of the world"

# Risk Category Configuration Model
class RiskCategoryConfigCreate(BaseModel):
    category: str
    label: str
    strongTriggers: List[str] = []
    mediumTriggers: List[str] = []
    order: int = 0

class RiskCategoryConfigUpdate(BaseModel):
    label: Optional[str] = None
    strongTriggers: Optional[List[str]] = None
    mediumTriggers: Optional[List[str]] = None
    order: Optional[int] = None

class RiskCategoryConfig(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    category: str  # e.g., "SUPPLY_SHORTAGE"
    label: str  # e.g., "Supply Shortage"
    strongTriggers: List[str] = []
    mediumTriggers: List[str] = []
    order: int = 0
    createdAt: Optional[str] = None

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
        {"key": "cost_savings", "value": "15-20%", "label": "Cost Savings Realised", "description": "Average savings realised across customer BOMs", "order": 0},
        {"key": "mpn_coverage", "value": "25M+", "label": "MPN Coverage", "description": "Comprehensive part number database", "order": 1},
        {"key": "data_sources", "value": "400+", "label": "Data Sources", "description": "Proprietary data pipes for intelligence", "order": 2},
        {"key": "enterprise_customers", "value": "30+", "label": "Enterprise Customers", "description": "Active OEM & EMS engagements", "order": 3},
        {"key": "data_points", "value": "500M+", "label": "Data Points", "description": "Real-time market intelligence signals processed daily", "order": 4},
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
# SITE SETTINGS ENDPOINTS
# =============================================

@api_router.get("/site-settings", response_model=SiteSettings)
async def get_site_settings():
    """Get site settings"""
    settings = await db.site_settings.find_one({"id": "site_settings"}, {"_id": 0})
    if not settings:
        # Return default settings
        return SiteSettings()
    return settings

@api_router.put("/site-settings", response_model=SiteSettings)
async def update_site_settings(input: SiteSettingsUpdate):
    """Update site settings"""
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    # Upsert the settings
    result = await db.site_settings.update_one(
        {"id": "site_settings"},
        {"$set": update_data},
        upsert=True
    )
    
    settings = await db.site_settings.find_one({"id": "site_settings"}, {"_id": 0})
    if not settings:
        return SiteSettings(**update_data)
    return settings

# =============================================
# RISK CATEGORY CONFIGURATION ENDPOINTS
# =============================================

# Default risk categories to seed
DEFAULT_RISK_CATEGORIES = [
    {
        "category": "SUPPLY_SHORTAGE",
        "label": "Supply Shortage",
        "strongTriggers": ["shortage", "allocation", "backorder", "out of stock", "constrained supply", "rationing", "supply crunch", "supply deficit"],
        "mediumTriggers": ["tight supply", "limited availability", "scarcity", "undersupply", "supply gap"],
        "order": 1
    },
    {
        "category": "TARIFF_TRADE_POLICY",
        "label": "Tariff/Trade",
        "strongTriggers": ["tariff", "duty", "anti-dumping", "countervailing", "import tax", "trade remedy", "trade war", "trade restrictions"],
        "mediumTriggers": ["customs levy", "trade policy", "import restrictions", "export restrictions", "trade barriers"],
        "order": 2
    },
    {
        "category": "PRICE_VOLATILITY",
        "label": "Price Risk",
        "strongTriggers": ["spot price", "price spike", "price surge", "price increase", "cost inflation", "ASP up", "prices soar"],
        "mediumTriggers": ["pricing pressure", "volatility", "price hike", "price jump", "prices surge", "cost increase"],
        "order": 3
    },
    {
        "category": "FACTORY_FAB_OUTAGE",
        "label": "Factory Outage",
        "strongTriggers": ["fab outage", "plant fire", "explosion", "earthquake", "power outage", "factory shutdown", "fab fire", "plant shutdown"],
        "mediumTriggers": ["production halted", "capacity loss", "line stoppage", "facility closure", "manufacturing disruption"],
        "order": 4
    },
    {
        "category": "GEOPOLITICAL_CONFLICT",
        "label": "Geopolitical",
        "strongTriggers": ["war", "conflict", "missile", "invasion", "Taiwan Strait", "escalation", "military action", "armed conflict"],
        "mediumTriggers": ["geopolitical tension", "standoff", "political instability", "territorial dispute", "diplomatic crisis"],
        "order": 5
    },
    {
        "category": "LEAD_TIME_VOLATILITY",
        "label": "Lead Time",
        "strongTriggers": ["lead time", "extended lead times", "ETA slipped", "shipments delayed", "delivery delay", "lead time extension"],
        "mediumTriggers": ["backlog", "pushed out", "delayed fulfillment", "shipping delays", "order delays"],
        "order": 6
    },
    {
        "category": "EOL_LIFECYCLE",
        "label": "EOL/Lifecycle",
        "strongTriggers": ["end of life", "EOL", "NRND", "PCN", "last time buy", "discontinued", "product discontinuation"],
        "mediumTriggers": ["obsolete", "lifecycle notice", "phase out", "end of production", "obsolescence"],
        "order": 7
    },
    {
        "category": "BOM_CHANGE_COMPATIBILITY",
        "label": "BOM Change",
        "strongTriggers": ["redesign", "requalification", "qualify alternate", "form fit function", "pin-to-pin", "BOM change"],
        "mediumTriggers": ["alternate parts", "second source", "drop-in replacement", "cross reference", "substitute"],
        "order": 8
    },
    {
        "category": "EXPORT_CONTROLS_SANCTIONS",
        "label": "Export Controls",
        "strongTriggers": ["export control", "entity list", "sanctions", "export ban", "license requirement", "blacklist", "trade ban"],
        "mediumTriggers": ["restricted exports", "controls tightened", "export restrictions", "technology controls"],
        "order": 9
    },
    {
        "category": "LOGISTICS_SHIPPING_DISRUPTION",
        "label": "Logistics",
        "strongTriggers": ["port congestion", "shipping disruption", "Red Sea", "Suez", "freight rates", "container shortage"],
        "mediumTriggers": ["logistics delays", "rerouting", "air freight", "sea freight", "shipping delays"],
        "order": 10
    },
    {
        "category": "QUALITY_COUNTERFEIT",
        "label": "Quality/Counterfeit",
        "strongTriggers": ["counterfeit", "fake chips", "recall", "defect", "authenticity", "non-genuine", "quality issue"],
        "mediumTriggers": ["field failure", "reliability issue", "quality concern", "inspection failure"],
        "order": 11
    },
    {
        "category": "SUPPLIER_FINANCIAL_RISK",
        "label": "Supplier Risk",
        "strongTriggers": ["bankruptcy", "insolvency", "default", "debt restructuring", "liquidity crisis", "financial distress"],
        "mediumTriggers": ["distress", "going concern", "credit downgrade", "financial trouble"],
        "order": 12
    },
    {
        "category": "REGULATORY_COMPLIANCE",
        "label": "Regulatory",
        "strongTriggers": ["RoHS", "REACH", "compliance violation", "regulatory ban", "restricted substance", "regulation change"],
        "mediumTriggers": ["compliance update", "audit", "regulation", "regulatory requirement", "certification"],
        "order": 13
    },
    {
        "category": "CYBER_SECURITY_OPERATIONAL",
        "label": "Cyber Security",
        "strongTriggers": ["ransomware", "cyberattack", "systems down", "ERP outage", "data breach", "cyber incident"],
        "mediumTriggers": ["security incident", "IT disruption", "system failure", "network attack"],
        "order": 14
    },
    {
        "category": "DEMAND_SHOCK",
        "label": "Demand Shock",
        "strongTriggers": ["demand surge", "orders spike", "demand collapse", "order cancellations", "demand shock"],
        "mediumTriggers": ["inventory correction", "soft demand", "AI server demand surge", "EV demand spike", "demand volatility"],
        "order": 15
    }
]

@api_router.get("/risk-categories/config", response_model=List[RiskCategoryConfig])
async def get_risk_category_configs():
    """Get all risk category configurations"""
    configs = await db.risk_category_configs.find({}, {"_id": 0}).to_list(100)
    if not configs:
        return []
    configs.sort(key=lambda x: x.get('order', 0))
    return configs

@api_router.post("/risk-categories/config", response_model=RiskCategoryConfig)
async def create_risk_category_config(input: RiskCategoryConfigCreate):
    """Create a new risk category configuration"""
    # Check if category already exists
    existing = await db.risk_category_configs.find_one({"category": input.category})
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")
    
    config = RiskCategoryConfig(
        **input.model_dump(),
        createdAt=datetime.now(timezone.utc).isoformat()
    )
    await db.risk_category_configs.insert_one(config.model_dump())
    return config

@api_router.put("/risk-categories/config/{category}", response_model=RiskCategoryConfig)
async def update_risk_category_config(category: str, input: RiskCategoryConfigUpdate):
    """Update a risk category configuration"""
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await db.risk_category_configs.update_one(
        {"category": category},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    
    config = await db.risk_category_configs.find_one({"category": category}, {"_id": 0})
    return config

@api_router.delete("/risk-categories/config/{category}")
async def delete_risk_category_config(category: str):
    """Delete a risk category configuration"""
    result = await db.risk_category_configs.delete_one({"category": category})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"success": True}

@api_router.post("/risk-categories/config/seed")
async def seed_risk_category_configs():
    """Seed default risk category configurations"""
    existing = await db.risk_category_configs.count_documents({})
    if existing > 0:
        return {"message": "Configurations already exist", "count": existing}
    
    for cat_data in DEFAULT_RISK_CATEGORIES:
        config = RiskCategoryConfig(
            **cat_data,
            createdAt=datetime.now(timezone.utc).isoformat()
        )
        await db.risk_category_configs.insert_one(config.model_dump())
    
    return {"message": f"Seeded {len(DEFAULT_RISK_CATEGORIES)} risk categories", "seeded": True}

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
        "link": {"$exists": True, "$nin": ["", None]},
        "title": {"$exists": True, "$nin": ["", None]},
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
    """Create a new news search query and immediately fetch news for it"""
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
    
    # Immediately trigger news fetch for this new query in background
    if query_data.isActive:
        logger.info(f"[NewQuery] Triggering immediate news fetch for new query: '{query_data.query}'")
        asyncio.create_task(fetch_news_for_single_query(query_data.query.strip()))
    
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
    """Delete a news search query and remove the tag from all articles"""
    # First, find the query to get its name
    query_doc = await db.news_queries.find_one({"id": query_id})
    if not query_doc:
        raise HTTPException(status_code=404, detail="Query not found")
    
    query_name = query_doc.get("query")
    
    # Delete the query
    result = await db.news_queries.delete_one({"id": query_id})
    
    # Also remove this tag from all articles to prevent orphan tags
    tag_removal = await db.news_articles.update_many(
        {"queries": query_name},
        {"$pull": {"queries": query_name}}
    )
    
    logger.info(f"[Queries] Deleted query '{query_name}' and removed tag from {tag_removal.modified_count} articles")
    
    return {
        "success": True,
        "message": f"Query deleted and tag removed from {tag_removal.modified_count} articles",
        "articlesUpdated": tag_removal.modified_count
    }

@api_router.delete("/news/tags/{tag_name}")
async def remove_tag_from_articles(tag_name: str):
    """Remove a specific tag from all articles (cleanup orphan tags)"""
    # URL decode the tag name
    from urllib.parse import unquote
    tag_name = unquote(tag_name)
    
    # Remove the tag from the queries array of all articles that have it
    result = await db.news_articles.update_many(
        {"queries": tag_name},
        {"$pull": {"queries": tag_name}}
    )
    
    logger.info(f"[Tags] Removed tag '{tag_name}' from {result.modified_count} articles")
    return {
        "success": True, 
        "message": f"Removed tag '{tag_name}' from {result.modified_count} articles",
        "modifiedCount": result.modified_count
    }

@api_router.get("/news/orphan-tags")
async def get_orphan_tags():
    """Get tags that exist on articles but not in managed queries"""
    # Get all managed query names
    managed_queries = await db.news_queries.find({}, {"query": 1, "_id": 0}).to_list(100)
    managed_set = set(q["query"] for q in managed_queries)
    
    # Get all unique tags from articles
    pipeline = [
        {"$unwind": "$queries"},
        {"$group": {"_id": "$queries", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    article_tags = await db.news_articles.aggregate(pipeline).to_list(100)
    
    # Find orphan tags (in articles but not managed)
    orphan_tags = []
    for tag in article_tags:
        if tag["_id"] and tag["_id"] not in managed_set:
            orphan_tags.append({"tag": tag["_id"], "articleCount": tag["count"]})
    
    return orphan_tags

@api_router.post("/news/cleanup-orphan-tags")
async def cleanup_all_orphan_tags():
    """Remove all orphan tags from articles"""
    # Get all managed query names
    managed_queries = await db.news_queries.find({}, {"query": 1, "_id": 0}).to_list(100)
    managed_set = set(q["query"] for q in managed_queries)
    
    # Get all unique tags from articles
    pipeline = [
        {"$unwind": "$queries"},
        {"$group": {"_id": "$queries"}},
    ]
    article_tags = await db.news_articles.aggregate(pipeline).to_list(500)
    
    # Find and remove orphan tags
    removed_count = 0
    orphan_tags_removed = []
    
    for tag in article_tags:
        tag_name = tag["_id"]
        if tag_name and tag_name not in managed_set:
            result = await db.news_articles.update_many(
                {"queries": tag_name},
                {"$pull": {"queries": tag_name}}
            )
            if result.modified_count > 0:
                orphan_tags_removed.append({"tag": tag_name, "articlesUpdated": result.modified_count})
                removed_count += result.modified_count
    
    logger.info(f"[Tags] Cleaned up {len(orphan_tags_removed)} orphan tags from {removed_count} article updates")
    
    return {
        "success": True,
        "message": f"Removed {len(orphan_tags_removed)} orphan tags",
        "tagsRemoved": orphan_tags_removed,
        "totalArticleUpdates": removed_count
    }

@api_router.post("/news/refresh")
async def refresh_news():
    """Manually trigger news fetch (SerpAPI + GDELT only)"""
    await fetch_and_store_all_news()
    return {"success": True, "message": "News refresh triggered (SerpAPI + GDELT)"}

@api_router.post("/news/refresh-mediastack")
async def refresh_mediastack_news():
    """Manually trigger MediaStack news fetch (use sparingly - rate limited)"""
    await fetch_mediastack_news()
    return {"success": True, "message": "MediaStack news refresh triggered (weekly API)"}

@api_router.post("/news/scrape")
async def trigger_article_scraping(limit: int = 50):
    """Manually trigger article content scraping for unscraped articles"""
    # Run scraping in background
    asyncio.create_task(scrape_unscraped_articles(limit=limit))
    return {"success": True, "message": f"Scraping started for up to {limit} articles"}

@api_router.post("/news/scrape-retry-failed")
async def retry_failed_scraping(limit: int = 200):
    """Retry scraping permanently failed articles to extract metadata"""
    # Reset permanent failures to allow retry with new metadata extraction
    result = await db.news_articles.update_many(
        {"permanentFailure": True, "scraped": {"$ne": True}},
        {"$unset": {"permanentFailure": "", "scrapeError": ""}}
    )
    
    logger.info(f"[Scraper] Reset {result.modified_count} permanently failed articles for retry")
    
    # Run scraping in background
    asyncio.create_task(scrape_unscraped_articles(limit=limit))
    return {
        "success": True, 
        "message": f"Reset {result.modified_count} failed articles, scraping started for up to {limit}",
        "resetCount": result.modified_count
    }

@api_router.get("/news/scrape-stats", response_model=dict)
async def get_scrape_stats():
    """Get detailed scraping statistics"""
    total = await db.news_articles.count_documents({})
    scraped = await db.news_articles.count_documents({"scraped": True})
    permanent_failures = await db.news_articles.count_documents({"permanentFailure": True})
    retryable_failures = await db.news_articles.count_documents({"retryable": True})
    other_failures = await db.news_articles.count_documents({
        "scraped": {"$ne": True},
        "scrapeError": {"$exists": True},
        "permanentFailure": {"$ne": True},
        "retryable": {"$ne": True}
    })
    pending = await db.news_articles.count_documents({
        "scraped": {"$ne": True},
        "scrapeError": {"$exists": False},
        "permanentFailure": {"$ne": True}
    })
    
    return {
        "total": total,
        "scraped": scraped,
        "pending": pending,
        "permanentFailures": permanent_failures,
        "retryableFailures": retryable_failures,
        "otherFailures": other_failures,
        "scrapeRate": round((scraped / total * 100), 1) if total > 0 else 0
    }


# ============== RISK ANALYSIS ENDPOINTS ==============

@api_router.post("/news/compute-risk")
async def trigger_risk_computation(limit: int = 500):
    """Manually trigger risk computation for unanalyzed articles"""
    asyncio.create_task(compute_risk_for_unanalyzed_articles(limit=limit))
    return {"success": True, "message": f"Risk computation started for up to {limit} articles"}

@api_router.get("/news/risk-stats", response_model=dict)
async def get_risk_stats():
    """Get risk analysis statistics"""
    total = await db.news_articles.count_documents({})
    analyzed = await db.news_articles.count_documents({"risk_score": {"$exists": True}})
    unanalyzed = total - analyzed
    
    # Count by risk band
    low = await db.news_articles.count_documents({"risk_band": "LOW"})
    watch = await db.news_articles.count_documents({"risk_band": "WATCH"})
    high = await db.news_articles.count_documents({"risk_band": "HIGH"})
    critical = await db.news_articles.count_documents({"risk_band": "CRITICAL"})
    
    return {
        "total": total,
        "analyzed": analyzed,
        "unanalyzed": unanalyzed,
        "analysisRate": round((analyzed / total * 100), 1) if total > 0 else 0,
        "byBand": {
            "LOW": low,
            "WATCH": watch,
            "HIGH": high,
            "CRITICAL": critical
        }
    }

@api_router.get("/news/risk-categories")
async def get_risk_category_counts():
    """Get counts of articles per risk category"""
    results = []
    
    for category in RISK_CATEGORIES:
        count = await db.news_articles.count_documents({
            "risk_categories": category
        })
        if count > 0:
            results.append({"category": category, "count": count})
    
    # Sort by count descending
    results.sort(key=lambda x: x["count"], reverse=True)
    
    return results

@api_router.get("/news/{article_id}/content", response_model=dict)
async def get_article_content(article_id: str):
    """Get full scraped content for an article"""
    article = await db.news_articles.find_one(
        {"id": article_id},
        {"_id": 0, "id": 1, "title": 1, "link": 1, "scraped": 1, "fullContent": 1, "summary": 1, "wordCount": 1, "scrapedAt": 1, "scrapeError": 1}
    )
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return article

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