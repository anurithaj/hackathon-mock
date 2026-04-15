from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import httpx
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

app = FastAPI()
api_router = APIRouter(prefix="/api")

ALPHA_VANTAGE_BASE = "https://www.alphavantage.co/query"
ALPHA_VANTAGE_KEY = os.environ.get("ALPHA_VANTAGE_KEY", "demo")

# ─── In-Memory Stores ───
events_store = []
entitlements_store = []
positions_store = []
audit_store = []

def uid():
    return str(uuid.uuid4())[:8].upper()

def now_iso():
    return datetime.now(timezone.utc).isoformat()

def seed_data():
    global events_store, entitlements_store, positions_store, audit_store

    event_seeds = [
        {"id": "EVT-001", "security": "Apple Inc.", "ticker": "AAPL", "isin": "US0378331005", "event_type": "Dividend", "distribution": "$0.25 / share", "record_date": "2026-02-14", "pay_date": "2026-02-28", "status": "Settled", "mandatory": True, "notes": "Quarterly cash dividend", "impact_pct": 0.82},
        {"id": "EVT-002", "security": "Microsoft Corp.", "ticker": "MSFT", "isin": "US5949181045", "event_type": "Dividend", "distribution": "$0.75 / share", "record_date": "2026-03-20", "pay_date": "2026-04-10", "status": "Pending", "mandatory": True, "notes": "Regular quarterly dividend declared", "impact_pct": 0.65},
        {"id": "EVT-003", "security": "Alphabet Inc.", "ticker": "GOOGL", "isin": "US02079K3059", "event_type": "Stock Split", "distribution": "20:1 forward split", "record_date": "2026-04-10", "pay_date": "2026-04-15", "status": "Announced", "mandatory": True, "notes": "Board approved 20-for-1 stock split", "impact_pct": 5.2},
        {"id": "EVT-004", "security": "Amazon.com Inc.", "ticker": "AMZN", "isin": "US0231351067", "event_type": "Merger", "distribution": "0.8 shares of NewCo", "record_date": "2026-05-01", "pay_date": "2026-06-15", "status": "Pending", "mandatory": True, "notes": "Proposed acquisition of subsidiary entity", "impact_pct": 12.3},
        {"id": "EVT-005", "security": "Tesla Inc.", "ticker": "TSLA", "isin": "US88160R1014", "event_type": "Rights Issue", "distribution": "1:10 @ $180", "record_date": "2026-03-15", "pay_date": "2026-04-01", "status": "Instructed", "mandatory": False, "notes": "Rights issue at $180 per share", "impact_pct": 3.45},
        {"id": "EVT-006", "security": "Meta Platforms Inc.", "ticker": "META", "isin": "US30303M1027", "event_type": "Dividend", "distribution": "$0.50 / share", "record_date": "2026-04-05", "pay_date": "2026-04-20", "status": "Pending", "mandatory": True, "notes": "First quarterly dividend", "impact_pct": 0.5},
        {"id": "EVT-007", "security": "NVIDIA Corp.", "ticker": "NVDA", "isin": "US67066G1040", "event_type": "Stock Split", "distribution": "10:1 forward split", "record_date": "2026-06-10", "pay_date": "2026-06-20", "status": "Announced", "mandatory": True, "notes": "10-for-1 forward stock split", "impact_pct": 10.0},
        {"id": "EVT-008", "security": "JPMorgan Chase", "ticker": "JPM", "isin": "US46625H1005", "event_type": "Dividend", "distribution": "$1.15 / share", "record_date": "2026-01-30", "pay_date": "2026-02-15", "status": "Settled", "mandatory": True, "notes": "Increased quarterly dividend", "impact_pct": 1.1},
        {"id": "EVT-009", "security": "Bank of America", "ticker": "BAC", "isin": "US0605051046", "event_type": "Merger", "distribution": "1.2 shares of Combined", "record_date": "2026-07-15", "pay_date": "2026-09-01", "status": "Pending", "mandatory": True, "notes": "Strategic merger with regional bank", "impact_pct": 8.75},
        {"id": "EVT-010", "security": "Walt Disney Co.", "ticker": "DIS", "isin": "US2546871060", "event_type": "Rights Issue", "distribution": "1:15 @ $95", "record_date": "2026-05-20", "pay_date": "2026-06-10", "status": "Validated", "mandatory": False, "notes": "Rights offering for streaming expansion", "impact_pct": 2.3},
        {"id": "EVT-011", "security": "Goldman Sachs", "ticker": "GS", "isin": "US38141G1040", "event_type": "Tender Offer", "distribution": "$385 / share", "record_date": "2026-03-01", "pay_date": "2026-03-20", "status": "Instructed", "mandatory": False, "notes": "Partial tender offer at premium", "impact_pct": 4.5},
        {"id": "EVT-012", "security": "Berkshire Hathaway", "ticker": "BRK.B", "isin": "US0846707026", "event_type": "Stock Split", "distribution": "50:1 forward split", "record_date": "2026-08-01", "pay_date": "2026-08-15", "status": "Announced", "mandatory": True, "notes": "Making shares more accessible", "impact_pct": 15.0},
        {"id": "EVT-013", "security": "Johnson & Johnson", "ticker": "JNJ", "isin": "US4781601046", "event_type": "Dividend", "distribution": "$1.24 / share", "record_date": "2026-02-20", "pay_date": "2026-03-10", "status": "Settled", "mandatory": True, "notes": "62nd consecutive annual increase", "impact_pct": 0.9},
        {"id": "EVT-014", "security": "Pfizer Inc.", "ticker": "PFE", "isin": "US7170811035", "event_type": "Merger", "distribution": "Cash + stock mix", "record_date": "2026-06-01", "pay_date": "2026-07-15", "status": "Validated", "mandatory": True, "notes": "Acquisition of biotech target", "impact_pct": 6.8},
        {"id": "EVT-015", "security": "Visa Inc.", "ticker": "V", "isin": "US92826C8394", "event_type": "Dividend", "distribution": "$0.52 / share", "record_date": "2026-02-10", "pay_date": "2026-03-01", "status": "Settled", "mandatory": True, "notes": "Regular quarterly dividend", "impact_pct": 0.4},
    ]
    for e in event_seeds:
        events_store.append({**e, "created_at": now_iso()})

    entitlement_seeds = [
        {"id": "ENT-001", "event_id": "EVT-005", "security": "Tesla Inc.", "ticker": "TSLA", "event_type": "Rights Issue", "mandatory": False, "accounts": ["ACC-1042", "ACC-1089"], "election_options": ["Exercise rights", "Sell rights", "Lapse"], "elected_option": None, "deadline": "2026-03-10", "status": "Pending election"},
        {"id": "ENT-002", "event_id": "EVT-011", "security": "Goldman Sachs", "ticker": "GS", "event_type": "Tender Offer", "mandatory": False, "accounts": ["ACC-1015", "ACC-1067"], "election_options": ["Tender all", "Tender partial", "Do not tender"], "elected_option": None, "deadline": "2026-02-25", "status": "Pending election"},
        {"id": "ENT-003", "event_id": "EVT-010", "security": "Walt Disney Co.", "ticker": "DIS", "event_type": "Rights Issue", "mandatory": False, "accounts": ["ACC-1023"], "election_options": ["Exercise rights", "Sell rights", "Lapse"], "elected_option": "Exercise rights", "deadline": "2026-05-15", "status": "Elected"},
        {"id": "ENT-004", "event_id": "EVT-001", "security": "Apple Inc.", "ticker": "AAPL", "event_type": "Dividend", "mandatory": True, "accounts": ["ACC-1001", "ACC-1015", "ACC-1042"], "election_options": [], "elected_option": None, "deadline": "2026-02-14", "status": "Auto-processed"},
        {"id": "ENT-005", "event_id": "EVT-003", "security": "Alphabet Inc.", "ticker": "GOOGL", "event_type": "Stock Split", "mandatory": True, "accounts": ["ACC-1023", "ACC-1067", "ACC-1089"], "election_options": [], "elected_option": None, "deadline": "2026-04-10", "status": "Auto-processed"},
        {"id": "ENT-006", "event_id": "EVT-002", "security": "Microsoft Corp.", "ticker": "MSFT", "event_type": "Dividend", "mandatory": True, "accounts": ["ACC-1001", "ACC-1042"], "election_options": [], "elected_option": None, "deadline": "2026-03-20", "status": "Auto-processed"},
        {"id": "ENT-007", "event_id": "EVT-004", "security": "Amazon.com Inc.", "ticker": "AMZN", "event_type": "Merger", "mandatory": True, "accounts": ["ACC-1015", "ACC-1089"], "election_options": [], "elected_option": None, "deadline": "2026-05-01", "status": "Auto-processed"},
    ]
    for e in entitlement_seeds:
        entitlements_store.append(e)

    position_seeds = [
        {"id": "POS-001", "account": "ACC-1001", "security": "Apple Inc.", "ticker": "AAPL", "shares_held": 15000, "event_type": "Dividend", "entitlement": "$3,750.00", "payment_type": "Cash", "risk": "Low", "status": "Settled"},
        {"id": "POS-002", "account": "ACC-1015", "security": "Goldman Sachs", "ticker": "GS", "shares_held": 2500, "event_type": "Tender Offer", "entitlement": "$962,500.00", "payment_type": "Cash", "risk": "High", "status": "Pending"},
        {"id": "POS-003", "account": "ACC-1042", "security": "Tesla Inc.", "ticker": "TSLA", "shares_held": 8000, "event_type": "Rights Issue", "entitlement": "800 rights", "payment_type": "Stock", "risk": "Medium", "status": "Instructed"},
        {"id": "POS-004", "account": "ACC-1023", "security": "Alphabet Inc.", "ticker": "GOOGL", "shares_held": 5000, "event_type": "Stock Split", "entitlement": "100,000 shares", "payment_type": "Stock", "risk": "Low", "status": "Announced"},
        {"id": "POS-005", "account": "ACC-1067", "security": "Goldman Sachs", "ticker": "GS", "shares_held": 1200, "event_type": "Tender Offer", "entitlement": "$462,000.00", "payment_type": "Cash", "risk": "High", "status": "Pending"},
        {"id": "POS-006", "account": "ACC-1089", "security": "Amazon.com Inc.", "ticker": "AMZN", "shares_held": 3000, "event_type": "Merger", "entitlement": "2,400 NewCo shares", "payment_type": "Stock", "risk": "Medium", "status": "Pending"},
        {"id": "POS-007", "account": "ACC-1001", "security": "Microsoft Corp.", "ticker": "MSFT", "shares_held": 10000, "event_type": "Dividend", "entitlement": "$7,500.00", "payment_type": "Cash", "risk": "Low", "status": "Pending"},
        {"id": "POS-008", "account": "ACC-1015", "security": "Pfizer Inc.", "ticker": "PFE", "shares_held": 20000, "event_type": "Merger", "entitlement": "Mixed", "payment_type": "Mixed", "risk": "Medium", "status": "Validated"},
        {"id": "POS-009", "account": "ACC-1042", "security": "JPMorgan Chase", "ticker": "JPM", "shares_held": 4500, "event_type": "Dividend", "entitlement": "$5,175.00", "payment_type": "Cash", "risk": "Low", "status": "Settled"},
        {"id": "POS-010", "account": "ACC-1089", "security": "Tesla Inc.", "ticker": "TSLA", "shares_held": 6000, "event_type": "Rights Issue", "entitlement": "600 rights", "payment_type": "Stock", "risk": "Medium", "status": "Instructed"},
    ]
    for p in position_seeds:
        positions_store.append(p)

    audit_seeds = [
        {"id": uid(), "action": "System initialized - 15 corporate actions loaded", "timestamp": "2026-02-01T08:00:00Z", "log_type": "system", "color": "gray"},
        {"id": uid(), "action": "EVT-001 AAPL Dividend settled - $3.75M distributed across 3 accounts", "timestamp": "2026-02-01T09:15:00Z", "log_type": "event", "color": "green"},
        {"id": uid(), "action": "EVT-008 JPM Dividend settled - $5,175 distributed", "timestamp": "2026-02-01T09:30:00Z", "log_type": "event", "color": "green"},
        {"id": uid(), "action": "EVT-015 Visa Dividend settled - auto-matched all positions", "timestamp": "2026-02-01T10:00:00Z", "log_type": "event", "color": "green"},
        {"id": uid(), "action": "User admin@northerntrust.com reviewed EVT-005 TSLA Rights Issue", "timestamp": "2026-02-01T10:45:00Z", "log_type": "user", "color": "blue"},
        {"id": uid(), "action": "EVT-003 GOOGL Stock Split announced - 20:1 ratio confirmed", "timestamp": "2026-02-01T11:00:00Z", "log_type": "event", "color": "blue"},
        {"id": uid(), "action": "EVT-010 DIS Rights Issue validated - awaiting instruction", "timestamp": "2026-02-01T11:30:00Z", "log_type": "event", "color": "amber"},
        {"id": uid(), "action": "ENT-003 DIS Rights Issue election submitted: Exercise rights", "timestamp": "2026-02-01T12:00:00Z", "log_type": "user", "color": "blue"},
        {"id": uid(), "action": "EVT-011 GS Tender Offer instructed - pending settlement", "timestamp": "2026-02-01T13:00:00Z", "log_type": "event", "color": "amber"},
        {"id": uid(), "action": "Rate limit warning: Alpha Vantage API near daily quota", "timestamp": "2026-02-01T14:00:00Z", "log_type": "system", "color": "red"},
        {"id": uid(), "action": "EVT-014 PFE Merger validated - regulatory review complete", "timestamp": "2026-02-01T14:30:00Z", "log_type": "event", "color": "blue"},
        {"id": uid(), "action": "User ops@northerntrust.com bulk-approved 3 mandatory entitlements", "timestamp": "2026-02-01T15:00:00Z", "log_type": "user", "color": "blue"},
    ]
    for a in audit_seeds:
        audit_store.append(a)

seed_data()

# ─── Models ───
class EventCreate(BaseModel):
    security: str
    isin: str = ""
    event_type: str
    mandatory: bool = True
    record_date: str
    pay_date: str
    distribution: str = ""
    notes: str = ""

class ElectionSubmit(BaseModel):
    elected_option: str

# ─── Alpha Vantage ───
async def enrich_ticker(symbol: str) -> dict:
    try:
        async with httpx.AsyncClient(timeout=10.0) as c:
            resp = await c.get(ALPHA_VANTAGE_BASE, params={"function": "OVERVIEW", "symbol": symbol.upper(), "apikey": ALPHA_VANTAGE_KEY})
            data = resp.json()
            if "Name" in data:
                return {"name": data["Name"], "isin": data.get("ISIN", ""), "sector": data.get("Sector", "")}
    except Exception as e:
        logging.warning(f"Alpha Vantage error for {symbol}: {e}")
    return {"name": f"{symbol.upper()} Corp.", "isin": "", "sector": ""}

def add_audit(action: str, log_type: str = "system", color: str = "gray"):
    audit_store.insert(0, {"id": uid(), "action": action, "timestamp": now_iso(), "log_type": log_type, "color": color})

# ─── Routes ───
@api_router.get("/")
async def root():
    return {"message": "Corporate Actions Processing System API"}

# Dashboard
@api_router.get("/dashboard")
async def get_dashboard():
    pending = sum(1 for e in events_store if e["status"] in ("Pending", "Announced"))
    processed_today = sum(1 for e in events_store if e["status"] == "Settled")
    failed = 0
    total_aum = "$2.4B"
    elections_due = sum(1 for ent in entitlements_store if ent["status"] == "Pending election")

    deadlines = []
    for e in sorted(events_store, key=lambda x: x["record_date"])[:6]:
        deadlines.append({"security": e["security"], "ticker": e["ticker"], "event_type": e["event_type"], "deadline": e["record_date"], "status": e["status"]})

    type_counts = {}
    for e in events_store:
        type_counts[e["event_type"]] = type_counts.get(e["event_type"], 0) + 1

    pipeline = {
        "Announced": sum(1 for e in events_store if e["status"] == "Announced"),
        "Validated": sum(1 for e in events_store if e["status"] == "Validated"),
        "Instructed": sum(1 for e in events_store if e["status"] == "Instructed"),
        "Settled": sum(1 for e in events_store if e["status"] == "Settled"),
        "Exceptions": failed,
    }

    return {
        "metrics": {"pending_events": pending, "processed_today": processed_today, "failed_exceptions": failed, "total_aum_affected": total_aum, "elections_due_today": elections_due},
        "deadlines": deadlines,
        "type_breakdown": type_counts,
        "pipeline": pipeline,
    }

# Events
@api_router.get("/events")
async def get_events(search: str = "", event_type: str = "", status: str = "", page: int = 1, per_page: int = 10):
    filtered = events_store[:]
    if search:
        s = search.lower()
        filtered = [e for e in filtered if s in e["security"].lower() or s in e["isin"].lower() or s in e["id"].lower() or s in e.get("ticker", "").lower()]
    if event_type:
        filtered = [e for e in filtered if e["event_type"] == event_type]
    if status:
        filtered = [e for e in filtered if e["status"] == status]
    total = len(filtered)
    start = (page - 1) * per_page
    end = start + per_page
    return {"events": filtered[start:end], "total": total, "page": page, "per_page": per_page, "total_pages": (total + per_page - 1) // per_page}

@api_router.get("/events/{event_id}")
async def get_event(event_id: str):
    for e in events_store:
        if e["id"] == event_id:
            return e
    raise HTTPException(404, "Event not found")

@api_router.post("/events")
async def create_event(payload: EventCreate):
    evt_num = len(events_store) + 1
    evt_id = f"EVT-{evt_num:03d}"
    impact = round(random.uniform(0.3, 12.0), 2)
    event = {
        "id": evt_id, "security": payload.security, "ticker": "", "isin": payload.isin,
        "event_type": payload.event_type, "distribution": payload.distribution,
        "record_date": payload.record_date, "pay_date": payload.pay_date,
        "status": "Announced", "mandatory": payload.mandatory, "notes": payload.notes,
        "impact_pct": impact, "created_at": now_iso(),
    }
    events_store.append(event)
    add_audit(f"{evt_id} {payload.security} {payload.event_type} created", "event", "blue")
    return event

@api_router.put("/events/{event_id}/process")
async def process_event(event_id: str):
    status_flow = ["Announced", "Validated", "Instructed", "Settled"]
    for e in events_store:
        if e["id"] == event_id:
            if e["status"] == "Settled":
                raise HTTPException(400, "Already settled")
            try:
                idx = status_flow.index(e["status"])
                next_status = status_flow[min(idx + 1, len(status_flow) - 1)]
            except ValueError:
                next_status = "Validated"
            e["status"] = next_status
            add_audit(f"{event_id} {e['security']} moved to {next_status}", "event", "green" if next_status == "Settled" else "amber")
            return {"id": event_id, "status": next_status}
    raise HTTPException(404, "Event not found")

# Entitlements
@api_router.get("/entitlements")
async def get_entitlements(filter_type: str = ""):
    filtered = entitlements_store[:]
    if filter_type == "pending":
        filtered = [e for e in filtered if e["status"] == "Pending election"]
    elif filter_type == "elected":
        filtered = [e for e in filtered if e["status"] == "Elected"]
    elif filter_type == "mandatory":
        filtered = [e for e in filtered if e["mandatory"]]
    return {"entitlements": filtered, "total": len(filtered)}

@api_router.put("/entitlements/{ent_id}/elect")
async def elect_entitlement(ent_id: str, payload: ElectionSubmit):
    for ent in entitlements_store:
        if ent["id"] == ent_id:
            ent["elected_option"] = payload.elected_option
            ent["status"] = "Elected"
            add_audit(f"{ent_id} {ent['security']} election: {payload.elected_option}", "user", "blue")
            return {"id": ent_id, "status": "Elected", "elected_option": payload.elected_option}
    raise HTTPException(404, "Entitlement not found")

@api_router.post("/entitlements/submit-all")
async def submit_all_elections():
    count = 0
    for ent in entitlements_store:
        if ent["status"] == "Elected":
            count += 1
    add_audit(f"Bulk submission: {count} elections submitted for processing", "user", "green")
    return {"submitted": count}

# Positions
@api_router.get("/positions")
async def get_positions():
    total_accounts = len(set(p["account"] for p in positions_store))
    positions_affected = len(positions_store)
    cash_count = sum(1 for p in positions_store if p["payment_type"] == "Cash")
    stock_count = sum(1 for p in positions_store if p["payment_type"] == "Stock")
    return {
        "positions": positions_store,
        "metrics": {"total_accounts": total_accounts, "positions_affected": positions_affected, "cash_entitlements": cash_count, "stock_entitlements": stock_count},
    }

# Audit
@api_router.get("/audit")
async def get_audit():
    return {"entries": audit_store}

app.include_router(api_router)
app.add_middleware(CORSMiddleware, allow_credentials=True, allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','), allow_methods=["*"], allow_headers=["*"])

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown():
    pass
