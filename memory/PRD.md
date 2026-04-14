# Corporate Actions Processing System - PRD

## Problem Statement
Build a Corporate Actions Processing System MVP with dashboard table, action processor panel, and impact summary cards. Dark fintech theme with Alpha Vantage API integration.

## Architecture
- **Backend**: FastAPI (Python) with in-memory storage
- **Frontend**: React + Tailwind CSS + Shadcn UI
- **Database**: In-memory (no persistence)
- **API**: Alpha Vantage (demo key) for company name enrichment

## User Personas
- Financial operations analysts processing corporate actions
- Portfolio managers tracking dividends, splits, mergers, rights issues

## Core Requirements
- Dashboard table with 8-10 seeded corporate actions
- Color-coded status badges (Pending/Processing/Completed)
- Side panel form for adding new actions
- Alpha Vantage API enrichment for ticker symbols
- Summary metric cards (Total Actions, Pending, Securities Affected, Avg Processing Time)
- Process button with 3-second animated workflow

## What's Been Implemented (Feb 2026)
- [x] FastAPI backend with 5 endpoints (GET/POST actions, process/complete, summary)
- [x] 10 seeded corporate actions (AAPL, MSFT, GOOGL, AMZN, TSLA, META, NVDA, JPM, BAC, DIS)
- [x] Alpha Vantage API integration with demo key
- [x] React frontend with dark fintech theme (#0f172a, #1e293b, #6366f1)
- [x] Shadcn UI components (Table, Sheet, Select, Calendar, Badge, Button)
- [x] Summary cards with reactive updates
- [x] Process workflow animation (Pending → Processing → Completed in 3s)
- [x] Custom fonts (Work Sans, IBM Plex Sans, JetBrains Mono)
- [x] All tests passing (100% backend, 100% frontend)

## Prioritized Backlog
- P0: None (MVP complete)
- P1: Data persistence with MongoDB, filtering/sorting on table
- P2: Export to CSV, bulk processing, audit trail/history
- P3: Real-time WebSocket updates, role-based access control

## Next Tasks
1. Add MongoDB persistence for corporate actions
2. Add table sorting and filtering capabilities
3. Add search by ticker/company name
4. Implement proper Alpha Vantage API key (non-demo)
5. Add authentication for production use
