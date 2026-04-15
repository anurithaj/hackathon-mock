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

    # ─── 25 Corporate Action Events ───
    event_seeds = [
        # Settled (8) - shows throughput
        {"id": "EVT-001", "security": "Apple Inc.", "ticker": "AAPL", "isin": "US0378331005", "event_type": "Dividend", "distribution": "$0.25 / share", "record_date": "2026-01-15", "pay_date": "2026-02-01", "status": "Settled", "mandatory": True, "notes": "Q1 2026 quarterly cash dividend - 162nd consecutive payment", "impact_pct": 0.82},
        {"id": "EVT-002", "security": "JPMorgan Chase & Co.", "ticker": "JPM", "isin": "US46625H1005", "event_type": "Dividend", "distribution": "$1.25 / share", "record_date": "2026-01-20", "pay_date": "2026-02-10", "status": "Settled", "mandatory": True, "notes": "Increased quarterly dividend, 14th consecutive raise", "impact_pct": 1.1},
        {"id": "EVT-003", "security": "Visa Inc.", "ticker": "V", "isin": "US92826C8394", "event_type": "Dividend", "distribution": "$0.59 / share", "record_date": "2026-01-25", "pay_date": "2026-02-05", "status": "Settled", "mandatory": True, "notes": "Regular quarterly dividend, 16% increase YoY", "impact_pct": 0.45},
        {"id": "EVT-004", "security": "Johnson & Johnson", "ticker": "JNJ", "isin": "US4781601046", "event_type": "Dividend", "distribution": "$1.30 / share", "record_date": "2026-01-28", "pay_date": "2026-02-12", "status": "Settled", "mandatory": True, "notes": "Dividend King - 63rd consecutive annual increase", "impact_pct": 0.95},
        {"id": "EVT-005", "security": "Procter & Gamble", "ticker": "PG", "isin": "US7427181091", "event_type": "Dividend", "distribution": "$1.01 / share", "record_date": "2026-02-01", "pay_date": "2026-02-15", "status": "Settled", "mandatory": True, "notes": "Q1 dividend - 68th year of consecutive increases", "impact_pct": 0.72},
        {"id": "EVT-006", "security": "Exxon Mobil Corp.", "ticker": "XOM", "isin": "US30231G1022", "event_type": "Dividend", "distribution": "$0.99 / share", "record_date": "2026-02-05", "pay_date": "2026-02-20", "status": "Settled", "mandatory": True, "notes": "Regular quarterly dividend post-Pioneer merger", "impact_pct": 0.88},
        {"id": "EVT-007", "security": "Cisco Systems", "ticker": "CSCO", "isin": "US17275R1023", "event_type": "Stock Split", "distribution": "4:1 forward split", "record_date": "2026-01-10", "pay_date": "2026-01-20", "status": "Settled", "mandatory": True, "notes": "First stock split since 2000, approved unanimously by board", "impact_pct": 3.2},
        {"id": "EVT-008", "security": "Morgan Stanley", "ticker": "MS", "isin": "US6174464486", "event_type": "Tender Offer", "distribution": "$102.50 / share", "record_date": "2026-01-30", "pay_date": "2026-02-14", "status": "Settled", "mandatory": False, "notes": "Completed partial tender - 85% acceptance rate", "impact_pct": 5.1},
        # Instructed (4) - in the pipeline
        {"id": "EVT-009", "security": "Tesla Inc.", "ticker": "TSLA", "isin": "US88160R1014", "event_type": "Rights Issue", "distribution": "1:10 @ $195", "record_date": "2026-02-20", "pay_date": "2026-03-10", "status": "Instructed", "mandatory": False, "notes": "Capital raise for Gigafactory Mexico expansion, $4.2B target", "impact_pct": 3.85},
        {"id": "EVT-010", "security": "Goldman Sachs Group", "ticker": "GS", "isin": "US38141G1040", "event_type": "Tender Offer", "distribution": "$415 / share", "record_date": "2026-02-25", "pay_date": "2026-03-15", "status": "Instructed", "mandatory": False, "notes": "Strategic buyback via Dutch auction tender, 8% premium to market", "impact_pct": 4.9},
        {"id": "EVT-011", "security": "Broadcom Inc.", "ticker": "AVGO", "isin": "US11135F1012", "event_type": "Dividend", "distribution": "$5.25 / share", "record_date": "2026-02-28", "pay_date": "2026-03-15", "status": "Instructed", "mandatory": True, "notes": "Special dividend following VMware integration synergies", "impact_pct": 2.1},
        {"id": "EVT-012", "security": "UnitedHealth Group", "ticker": "UNH", "isin": "US91324P1021", "event_type": "Merger", "distribution": "0.65 shares + $42 cash", "record_date": "2026-03-01", "pay_date": "2026-04-15", "status": "Instructed", "mandatory": True, "notes": "Acquisition of Amedisys - DOJ clearance received", "impact_pct": 7.2},
        # Validated (3) - under review
        {"id": "EVT-013", "security": "Walt Disney Company", "ticker": "DIS", "isin": "US2546871060", "event_type": "Rights Issue", "distribution": "1:12 @ $105", "record_date": "2026-03-10", "pay_date": "2026-03-28", "status": "Validated", "mandatory": False, "notes": "Funding for ESPN standalone streaming platform launch", "impact_pct": 2.6},
        {"id": "EVT-014", "security": "Pfizer Inc.", "ticker": "PFE", "isin": "US7170811035", "event_type": "Merger", "distribution": "Cash + 0.35 PFE shares", "record_date": "2026-03-15", "pay_date": "2026-05-01", "status": "Validated", "mandatory": True, "notes": "Bolt-on acquisition of oncology biotech - Phase 3 pipeline", "impact_pct": 8.4},
        {"id": "EVT-015", "security": "Costco Wholesale", "ticker": "COST", "isin": "US22160K1051", "event_type": "Dividend", "distribution": "$15.00 / share (special)", "record_date": "2026-03-20", "pay_date": "2026-04-05", "status": "Validated", "mandatory": True, "notes": "Special one-time dividend from excess cash reserves, $6.6B total", "impact_pct": 1.8},
        # Announced (4) - newly filed
        {"id": "EVT-016", "security": "NVIDIA Corporation", "ticker": "NVDA", "isin": "US67066G1040", "event_type": "Stock Split", "distribution": "10:1 forward split", "record_date": "2026-04-01", "pay_date": "2026-04-15", "status": "Announced", "mandatory": True, "notes": "Second split in 3 years, making shares accessible at ~$15", "impact_pct": 12.5},
        {"id": "EVT-017", "security": "Berkshire Hathaway", "ticker": "BRK.B", "isin": "US0846707026", "event_type": "Stock Split", "distribution": "50:1 forward split", "record_date": "2026-05-01", "pay_date": "2026-05-15", "status": "Announced", "mandatory": True, "notes": "Historic first split of Class B shares since 2010", "impact_pct": 18.0},
        {"id": "EVT-018", "security": "Amazon.com Inc.", "ticker": "AMZN", "isin": "US0231351067", "event_type": "Merger", "distribution": "0.75 shares of AMZN", "record_date": "2026-05-15", "pay_date": "2026-07-01", "status": "Announced", "mandatory": True, "notes": "Proposed acquisition of iRobot - EU antitrust review pending", "impact_pct": 14.2},
        {"id": "EVT-019", "security": "Eli Lilly & Co.", "ticker": "LLY", "isin": "US5324571083", "event_type": "Dividend", "distribution": "$1.50 / share", "record_date": "2026-04-15", "pay_date": "2026-05-01", "status": "Announced", "mandatory": True, "notes": "20% dividend hike following Mounjaro/Zepbound blockbuster sales", "impact_pct": 0.6},
        # Pending (6) - awaiting action
        {"id": "EVT-020", "security": "Microsoft Corporation", "ticker": "MSFT", "isin": "US5949181045", "event_type": "Dividend", "distribution": "$0.83 / share", "record_date": "2026-03-25", "pay_date": "2026-04-10", "status": "Pending", "mandatory": True, "notes": "Regular quarterly dividend, 11% increase from prior quarter", "impact_pct": 0.7},
        {"id": "EVT-021", "security": "Alphabet Inc.", "ticker": "GOOGL", "isin": "US02079K3059", "event_type": "Stock Split", "distribution": "20:1 forward split", "record_date": "2026-04-20", "pay_date": "2026-05-05", "status": "Pending", "mandatory": True, "notes": "Board approved to improve retail investor accessibility", "impact_pct": 6.8},
        {"id": "EVT-022", "security": "Meta Platforms Inc.", "ticker": "META", "isin": "US30303M1027", "event_type": "Dividend", "distribution": "$0.65 / share", "record_date": "2026-04-01", "pay_date": "2026-04-18", "status": "Pending", "mandatory": True, "notes": "Q2 2026 dividend - third ever quarterly payment", "impact_pct": 0.55},
        {"id": "EVT-023", "security": "Bank of America Corp.", "ticker": "BAC", "isin": "US0605051046", "event_type": "Merger", "distribution": "1.15 shares + $8.50 cash", "record_date": "2026-06-01", "pay_date": "2026-08-15", "status": "Pending", "mandatory": True, "notes": "Transformative regional bank merger, $18B deal value", "impact_pct": 11.3},
        {"id": "EVT-024", "security": "Netflix Inc.", "ticker": "NFLX", "isin": "US64110L1061", "event_type": "Tender Offer", "distribution": "$850 / share", "record_date": "2026-03-30", "pay_date": "2026-04-20", "status": "Pending", "mandatory": False, "notes": "Modified Dutch auction tender offer, $5B buyback program", "impact_pct": 3.8},
        {"id": "EVT-025", "security": "Palantir Technologies", "ticker": "PLTR", "isin": "US69608A1088", "event_type": "Rights Issue", "distribution": "1:8 @ $72", "record_date": "2026-04-10", "pay_date": "2026-04-28", "status": "Pending", "mandatory": False, "notes": "Capital raise for AIP platform expansion into defense sector", "impact_pct": 4.2},
    ]
    for e in event_seeds:
        events_store.append({**e, "created_at": now_iso()})

    # ─── 12 Entitlements ───
    entitlement_seeds = [
        # Voluntary - Pending Election (4)
        {"id": "ENT-001", "event_id": "EVT-009", "security": "Tesla Inc.", "ticker": "TSLA", "event_type": "Rights Issue", "mandatory": False, "accounts": ["Fidelity Custody - 7042", "Vanguard Trust - 8091"], "election_options": ["Exercise rights", "Sell rights", "Lapse"], "elected_option": None, "deadline": "2026-02-18", "status": "Pending election"},
        {"id": "ENT-002", "event_id": "EVT-010", "security": "Goldman Sachs Group", "ticker": "GS", "event_type": "Tender Offer", "mandatory": False, "accounts": ["BlackRock Inst. - 3015", "State Street - 4067"], "election_options": ["Tender all", "Tender partial (50%)", "Do not tender"], "elected_option": None, "deadline": "2026-02-22", "status": "Pending election"},
        {"id": "ENT-003", "event_id": "EVT-024", "security": "Netflix Inc.", "ticker": "NFLX", "event_type": "Tender Offer", "mandatory": False, "accounts": ["Citadel Securities - 6012", "Renaissance Tech - 7088"], "election_options": ["Tender all", "Tender partial (25%)", "Do not tender"], "elected_option": None, "deadline": "2026-03-25", "status": "Pending election"},
        {"id": "ENT-004", "event_id": "EVT-025", "security": "Palantir Technologies", "ticker": "PLTR", "event_type": "Rights Issue", "mandatory": False, "accounts": ["ARK Invest - 5034", "Fidelity Custody - 7042"], "election_options": ["Exercise rights", "Sell rights", "Lapse"], "elected_option": None, "deadline": "2026-04-05", "status": "Pending election"},
        # Voluntary - Elected (2)
        {"id": "ENT-005", "event_id": "EVT-013", "security": "Walt Disney Company", "ticker": "DIS", "event_type": "Rights Issue", "mandatory": False, "accounts": ["Vanguard Trust - 8091"], "election_options": ["Exercise rights", "Sell rights", "Lapse"], "elected_option": "Exercise rights", "deadline": "2026-03-05", "status": "Elected"},
        {"id": "ENT-006", "event_id": "EVT-008", "security": "Morgan Stanley", "ticker": "MS", "event_type": "Tender Offer", "mandatory": False, "accounts": ["BlackRock Inst. - 3015", "Citadel Securities - 6012"], "election_options": ["Tender all", "Tender partial (50%)", "Do not tender"], "elected_option": "Tender partial (50%)", "deadline": "2026-01-28", "status": "Elected"},
        # Mandatory - Auto-processed (6)
        {"id": "ENT-007", "event_id": "EVT-001", "security": "Apple Inc.", "ticker": "AAPL", "event_type": "Dividend", "mandatory": True, "accounts": ["Fidelity Custody - 7042", "BlackRock Inst. - 3015", "Vanguard Trust - 8091"], "election_options": [], "elected_option": None, "deadline": "2026-01-15", "status": "Auto-processed"},
        {"id": "ENT-008", "event_id": "EVT-016", "security": "NVIDIA Corporation", "ticker": "NVDA", "event_type": "Stock Split", "mandatory": True, "accounts": ["ARK Invest - 5034", "Renaissance Tech - 7088", "State Street - 4067", "Citadel Securities - 6012"], "election_options": [], "elected_option": None, "deadline": "2026-04-01", "status": "Auto-processed"},
        {"id": "ENT-009", "event_id": "EVT-020", "security": "Microsoft Corporation", "ticker": "MSFT", "event_type": "Dividend", "mandatory": True, "accounts": ["Fidelity Custody - 7042", "Vanguard Trust - 8091"], "election_options": [], "elected_option": None, "deadline": "2026-03-25", "status": "Auto-processed"},
        {"id": "ENT-010", "event_id": "EVT-012", "security": "UnitedHealth Group", "ticker": "UNH", "event_type": "Merger", "mandatory": True, "accounts": ["BlackRock Inst. - 3015", "State Street - 4067"], "election_options": [], "elected_option": None, "deadline": "2026-03-01", "status": "Auto-processed"},
        {"id": "ENT-011", "event_id": "EVT-018", "security": "Amazon.com Inc.", "ticker": "AMZN", "event_type": "Merger", "mandatory": True, "accounts": ["ARK Invest - 5034", "Renaissance Tech - 7088", "Fidelity Custody - 7042"], "election_options": [], "elected_option": None, "deadline": "2026-05-15", "status": "Auto-processed"},
        {"id": "ENT-012", "event_id": "EVT-015", "security": "Costco Wholesale", "ticker": "COST", "event_type": "Dividend", "mandatory": True, "accounts": ["Vanguard Trust - 8091", "BlackRock Inst. - 3015", "Fidelity Custody - 7042", "State Street - 4067"], "election_options": [], "elected_option": None, "deadline": "2026-03-20", "status": "Auto-processed"},
    ]
    for e in entitlement_seeds:
        entitlements_store.append(e)

    # ─── 18 Positions ───
    position_seeds = [
        {"id": "POS-001", "account": "Fidelity Custody - 7042", "security": "Apple Inc.", "ticker": "AAPL", "shares_held": 245000, "event_type": "Dividend", "entitlement": "$61,250.00", "payment_type": "Cash", "risk": "Low", "status": "Settled"},
        {"id": "POS-002", "account": "BlackRock Inst. - 3015", "security": "Apple Inc.", "ticker": "AAPL", "shares_held": 890000, "event_type": "Dividend", "entitlement": "$222,500.00", "payment_type": "Cash", "risk": "Low", "status": "Settled"},
        {"id": "POS-003", "account": "BlackRock Inst. - 3015", "security": "Goldman Sachs Group", "ticker": "GS", "shares_held": 42000, "event_type": "Tender Offer", "entitlement": "$17,430,000.00", "payment_type": "Cash", "risk": "High", "status": "Instructed"},
        {"id": "POS-004", "account": "Fidelity Custody - 7042", "security": "Tesla Inc.", "ticker": "TSLA", "shares_held": 180000, "event_type": "Rights Issue", "entitlement": "18,000 rights", "payment_type": "Stock", "risk": "Medium", "status": "Instructed"},
        {"id": "POS-005", "account": "Vanguard Trust - 8091", "security": "Tesla Inc.", "ticker": "TSLA", "shares_held": 310000, "event_type": "Rights Issue", "entitlement": "31,000 rights", "payment_type": "Stock", "risk": "Medium", "status": "Instructed"},
        {"id": "POS-006", "account": "ARK Invest - 5034", "security": "NVIDIA Corporation", "ticker": "NVDA", "shares_held": 520000, "event_type": "Stock Split", "entitlement": "5,200,000 shares", "payment_type": "Stock", "risk": "Low", "status": "Announced"},
        {"id": "POS-007", "account": "State Street - 4067", "security": "Goldman Sachs Group", "ticker": "GS", "shares_held": 18500, "event_type": "Tender Offer", "entitlement": "$7,677,500.00", "payment_type": "Cash", "risk": "High", "status": "Instructed"},
        {"id": "POS-008", "account": "ARK Invest - 5034", "security": "Amazon.com Inc.", "ticker": "AMZN", "shares_held": 95000, "event_type": "Merger", "entitlement": "71,250 AMZN shares", "payment_type": "Stock", "risk": "Medium", "status": "Announced"},
        {"id": "POS-009", "account": "Fidelity Custody - 7042", "security": "Microsoft Corporation", "ticker": "MSFT", "shares_held": 175000, "event_type": "Dividend", "entitlement": "$145,250.00", "payment_type": "Cash", "risk": "Low", "status": "Pending"},
        {"id": "POS-010", "account": "BlackRock Inst. - 3015", "security": "Pfizer Inc.", "ticker": "PFE", "shares_held": 620000, "event_type": "Merger", "entitlement": "Mixed consideration", "payment_type": "Mixed", "risk": "Medium", "status": "Validated"},
        {"id": "POS-011", "account": "Vanguard Trust - 8091", "security": "JPMorgan Chase & Co.", "ticker": "JPM", "shares_held": 88000, "event_type": "Dividend", "entitlement": "$110,000.00", "payment_type": "Cash", "risk": "Low", "status": "Settled"},
        {"id": "POS-012", "account": "Citadel Securities - 6012", "security": "Netflix Inc.", "ticker": "NFLX", "shares_held": 35000, "event_type": "Tender Offer", "entitlement": "$29,750,000.00", "payment_type": "Cash", "risk": "High", "status": "Pending"},
        {"id": "POS-013", "account": "Renaissance Tech - 7088", "security": "Netflix Inc.", "ticker": "NFLX", "shares_held": 22000, "event_type": "Tender Offer", "entitlement": "$18,700,000.00", "payment_type": "Cash", "risk": "High", "status": "Pending"},
        {"id": "POS-014", "account": "State Street - 4067", "security": "UnitedHealth Group", "ticker": "UNH", "shares_held": 41000, "event_type": "Merger", "entitlement": "26,650 shares + $1.72M", "payment_type": "Mixed", "risk": "Medium", "status": "Instructed"},
        {"id": "POS-015", "account": "Vanguard Trust - 8091", "security": "Walt Disney Company", "ticker": "DIS", "shares_held": 150000, "event_type": "Rights Issue", "entitlement": "12,500 rights", "payment_type": "Stock", "risk": "Medium", "status": "Validated"},
        {"id": "POS-016", "account": "BlackRock Inst. - 3015", "security": "Bank of America Corp.", "ticker": "BAC", "shares_held": 1200000, "event_type": "Merger", "entitlement": "1,380,000 shares + $10.2M", "payment_type": "Mixed", "risk": "High", "status": "Pending"},
        {"id": "POS-017", "account": "ARK Invest - 5034", "security": "Palantir Technologies", "ticker": "PLTR", "shares_held": 850000, "event_type": "Rights Issue", "entitlement": "106,250 rights", "payment_type": "Stock", "risk": "Medium", "status": "Pending"},
        {"id": "POS-018", "account": "Fidelity Custody - 7042", "security": "Costco Wholesale", "ticker": "COST", "shares_held": 28000, "event_type": "Dividend", "entitlement": "$420,000.00", "payment_type": "Cash", "risk": "Low", "status": "Validated"},
    ]
    for p in position_seeds:
        positions_store.append(p)

    # ─── 24 Audit Log Entries ───
    audit_seeds = [
        {"id": uid(), "action": "System startup - Corporate Actions Processing Engine v3.2.1 initialized", "timestamp": "2026-02-14T06:00:00Z", "log_type": "system", "color": "gray"},
        {"id": uid(), "action": "SWIFT MT564 feed connected - monitoring 847 global securities", "timestamp": "2026-02-14T06:01:00Z", "log_type": "system", "color": "gray"},
        {"id": uid(), "action": "Auto-reconciliation: 25 corporate actions loaded from DTCC, Euroclear, Clearstream", "timestamp": "2026-02-14T06:05:00Z", "log_type": "system", "color": "gray"},
        {"id": uid(), "action": "EVT-001 AAPL Q1 Dividend settled - $283,750 distributed across Fidelity, BlackRock, Vanguard", "timestamp": "2026-02-14T07:30:00Z", "log_type": "event", "color": "green"},
        {"id": uid(), "action": "EVT-002 JPM Dividend settled - $110,000 to Vanguard Trust account, DTC auto-match confirmed", "timestamp": "2026-02-14T07:45:00Z", "log_type": "event", "color": "green"},
        {"id": uid(), "action": "EVT-003 Visa Dividend settled - all 3 custodian accounts reconciled within SLA", "timestamp": "2026-02-14T08:00:00Z", "log_type": "event", "color": "green"},
        {"id": uid(), "action": "EVT-007 CSCO 4:1 Stock Split settled - 2.1M new shares allocated across 6 accounts", "timestamp": "2026-02-14T08:15:00Z", "log_type": "event", "color": "green"},
        {"id": uid(), "action": "Compliance check passed: All settled events within T+2 settlement window", "timestamp": "2026-02-14T08:30:00Z", "log_type": "system", "color": "green"},
        {"id": uid(), "action": "User sarah.chen@northerntrust.com logged in - Senior Operations Analyst", "timestamp": "2026-02-14T09:00:00Z", "log_type": "user", "color": "blue"},
        {"id": uid(), "action": "EVT-016 NVDA 10:1 Stock Split announced - impact analysis: 5.2M shares affected across 4 funds", "timestamp": "2026-02-14T09:15:00Z", "log_type": "event", "color": "blue"},
        {"id": uid(), "action": "EVT-017 BRK.B 50:1 Split announced - flagged for priority review (largest position: $890M notional)", "timestamp": "2026-02-14T09:30:00Z", "log_type": "event", "color": "blue"},
        {"id": uid(), "action": "User sarah.chen@northerntrust.com initiated validation for EVT-013 DIS Rights Issue", "timestamp": "2026-02-14T09:45:00Z", "log_type": "user", "color": "blue"},
        {"id": uid(), "action": "EVT-013 DIS Rights Issue validated - ex-rights price calculated at $98.12, dilution factor 7.7%", "timestamp": "2026-02-14T10:00:00Z", "log_type": "event", "color": "amber"},
        {"id": uid(), "action": "EVT-014 PFE Merger validated - SEC Form S-4 filing confirmed, fairness opinion attached", "timestamp": "2026-02-14T10:15:00Z", "log_type": "event", "color": "amber"},
        {"id": uid(), "action": "ENT-005 DIS Rights Issue - Vanguard Trust elected: Exercise rights (150K shares, $15.75M commitment)", "timestamp": "2026-02-14T10:30:00Z", "log_type": "user", "color": "blue"},
        {"id": uid(), "action": "ENT-006 MS Tender Offer - BlackRock & Citadel elected: Tender partial 50% ($12.3M aggregate)", "timestamp": "2026-02-14T10:45:00Z", "log_type": "user", "color": "blue"},
        {"id": uid(), "action": "EVT-009 TSLA Rights Issue instructed - SWIFT MT565 sent to custodian, awaiting confirmation", "timestamp": "2026-02-14T11:00:00Z", "log_type": "event", "color": "amber"},
        {"id": uid(), "action": "EVT-010 GS Tender Offer instructed - Dutch auction price range $395-$415 communicated", "timestamp": "2026-02-14T11:15:00Z", "log_type": "event", "color": "amber"},
        {"id": uid(), "action": "Risk alert: EVT-023 BAC Merger - position exceeds $10M threshold, requires senior approval", "timestamp": "2026-02-14T11:30:00Z", "log_type": "system", "color": "red"},
        {"id": uid(), "action": "User james.wright@northerntrust.com approved EVT-023 BAC Merger - VP Risk sign-off recorded", "timestamp": "2026-02-14T11:45:00Z", "log_type": "user", "color": "blue"},
        {"id": uid(), "action": "Rate limit warning: Alpha Vantage API at 22/25 daily requests - switching to Bloomberg fallback", "timestamp": "2026-02-14T12:00:00Z", "log_type": "system", "color": "red"},
        {"id": uid(), "action": "User ops-team@northerntrust.com bulk-approved 6 mandatory entitlements via batch processor", "timestamp": "2026-02-14T13:00:00Z", "log_type": "user", "color": "blue"},
        {"id": uid(), "action": "End-of-day reconciliation: 8 settled, 4 instructed, 3 validated, 4 announced, 6 pending", "timestamp": "2026-02-14T16:00:00Z", "log_type": "system", "color": "gray"},
        {"id": uid(), "action": "Daily P&L impact report generated - net portfolio impact: +$2.4B AUM, 18 positions affected", "timestamp": "2026-02-14T16:30:00Z", "log_type": "system", "color": "green"},
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
    failed = 1
    total_aum = "$18.7B"
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
