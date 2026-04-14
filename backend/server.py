from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import httpx
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Alpha Vantage config
ALPHA_VANTAGE_BASE = "https://www.alphavantage.co/query"
ALPHA_VANTAGE_KEY = os.environ.get("ALPHA_VANTAGE_KEY", "demo")

# --- In-Memory Store ---
actions_store: list = []

def seed_actions():
    seeds = [
        {"ticker": "AAPL", "company_name": "Apple Inc.", "action_type": "Dividend", "ex_date": "2026-02-14", "record_date": "2026-02-15", "status": "Completed", "impact_pct": 0.82, "announcement": "Quarterly cash dividend of $0.25 per share"},
        {"ticker": "MSFT", "company_name": "Microsoft Corporation", "action_type": "Dividend", "ex_date": "2026-03-20", "record_date": "2026-03-21", "status": "Pending", "impact_pct": 0.65, "announcement": "Regular quarterly dividend declared"},
        {"ticker": "GOOGL", "company_name": "Alphabet Inc.", "action_type": "Stock Split", "ex_date": "2026-04-10", "record_date": "2026-04-11", "status": "Processing", "impact_pct": 5.20, "announcement": "20-for-1 stock split approved by board"},
        {"ticker": "AMZN", "company_name": "Amazon.com Inc.", "action_type": "Merger", "ex_date": "2026-05-01", "record_date": "2026-05-02", "status": "Pending", "impact_pct": 12.30, "announcement": "Proposed acquisition of subsidiary entity"},
        {"ticker": "TSLA", "company_name": "Tesla Inc.", "action_type": "Rights Issue", "ex_date": "2026-03-15", "record_date": "2026-03-16", "status": "Completed", "impact_pct": 3.45, "announcement": "Rights issue at $180 per share, 1:10 ratio"},
        {"ticker": "META", "company_name": "Meta Platforms Inc.", "action_type": "Dividend", "ex_date": "2026-04-05", "record_date": "2026-04-06", "status": "Pending", "impact_pct": 0.50, "announcement": "First ever quarterly dividend of $0.50/share"},
        {"ticker": "NVDA", "company_name": "NVIDIA Corporation", "action_type": "Stock Split", "ex_date": "2026-06-10", "record_date": "2026-06-11", "status": "Pending", "impact_pct": 10.00, "announcement": "10-for-1 forward stock split"},
        {"ticker": "JPM", "company_name": "JPMorgan Chase & Co.", "action_type": "Dividend", "ex_date": "2026-01-30", "record_date": "2026-01-31", "status": "Completed", "impact_pct": 1.10, "announcement": "Increased quarterly dividend to $1.15 per share"},
        {"ticker": "BAC", "company_name": "Bank of America Corp.", "action_type": "Merger", "ex_date": "2026-07-15", "record_date": "2026-07-16", "status": "Pending", "impact_pct": 8.75, "announcement": "Strategic merger with regional banking entity"},
        {"ticker": "DIS", "company_name": "The Walt Disney Company", "action_type": "Rights Issue", "ex_date": "2026-05-20", "record_date": "2026-05-21", "status": "Processing", "impact_pct": 2.30, "announcement": "Rights offering to fund streaming expansion"},
    ]
    for s in seeds:
        actions_store.append({
            "id": str(uuid.uuid4()),
            "ticker": s["ticker"],
            "company_name": s["company_name"],
            "action_type": s["action_type"],
            "ex_date": s["ex_date"],
            "record_date": s["record_date"],
            "status": s["status"],
            "impact_pct": s["impact_pct"],
            "announcement": s["announcement"],
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

seed_actions()

# --- Pydantic Models ---
class ActionCreate(BaseModel):
    ticker: str
    action_type: str
    ex_date: str
    announcement: str = ""

class ActionOut(BaseModel):
    id: str
    ticker: str
    company_name: str
    action_type: str
    ex_date: str
    record_date: str
    status: str
    impact_pct: float
    announcement: str
    created_at: str

class SummaryOut(BaseModel):
    total_actions: int
    pending_count: int
    securities_affected: int
    avg_processing_time: float

# --- Alpha Vantage Enrichment ---
async def enrich_ticker(ticker: str) -> dict:
    """Fetch company overview from Alpha Vantage to get the company name."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as http_client:
            resp = await http_client.get(
                ALPHA_VANTAGE_BASE,
                params={
                    "function": "OVERVIEW",
                    "symbol": ticker.upper(),
                    "apikey": ALPHA_VANTAGE_KEY,
                }
            )
            data = resp.json()
            if "Name" in data:
                return {"company_name": data["Name"], "sector": data.get("Sector", "")}
    except Exception as e:
        logging.warning(f"Alpha Vantage enrichment failed for {ticker}: {e}")
    # Fallback
    return {"company_name": f"{ticker.upper()} Corp.", "sector": ""}

# --- Routes ---
@api_router.get("/")
async def root():
    return {"message": "Corporate Actions Processing System API"}

@api_router.get("/actions", response_model=List[ActionOut])
async def get_actions():
    return actions_store

@api_router.post("/actions", response_model=ActionOut)
async def create_action(payload: ActionCreate):
    enrichment = await enrich_ticker(payload.ticker)
    
    # Generate record date (1 day after ex_date for simplicity)
    ex_date = payload.ex_date
    try:
        ex_dt = datetime.strptime(ex_date, "%Y-%m-%d")
        from datetime import timedelta
        record_dt = ex_dt + timedelta(days=1)
        record_date = record_dt.strftime("%Y-%m-%d")
    except ValueError:
        record_date = ex_date

    impact = round(random.uniform(0.3, 15.0), 2)

    action = {
        "id": str(uuid.uuid4()),
        "ticker": payload.ticker.upper(),
        "company_name": enrichment["company_name"],
        "action_type": payload.action_type,
        "ex_date": ex_date,
        "record_date": record_date,
        "status": "Pending",
        "impact_pct": impact,
        "announcement": payload.announcement or f"{payload.action_type} announced for {payload.ticker.upper()}",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    actions_store.append(action)
    return action

@api_router.put("/actions/{action_id}/process")
async def process_action(action_id: str):
    for action in actions_store:
        if action["id"] == action_id:
            if action["status"] == "Completed":
                raise HTTPException(status_code=400, detail="Action already completed")
            action["status"] = "Processing"
            return {"id": action_id, "status": "Processing"}
    raise HTTPException(status_code=404, detail="Action not found")

@api_router.put("/actions/{action_id}/complete")
async def complete_action(action_id: str):
    for action in actions_store:
        if action["id"] == action_id:
            action["status"] = "Completed"
            return {"id": action_id, "status": "Completed"}
    raise HTTPException(status_code=404, detail="Action not found")

@api_router.get("/actions/summary", response_model=SummaryOut)
async def get_summary():
    total = len(actions_store)
    pending = sum(1 for a in actions_store if a["status"] == "Pending")
    tickers = set(a["ticker"] for a in actions_store)
    return SummaryOut(
        total_actions=total,
        pending_count=pending,
        securities_affected=len(tickers),
        avg_processing_time=2.4,
    )

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
