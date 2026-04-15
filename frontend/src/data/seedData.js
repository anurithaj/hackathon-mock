// ─── Hardcoded Demo Data for Judges ───

export const SEED_EVENTS = [
  { id: "EVT-001", security: "Apple Inc.", ticker: "AAPL", isin: "US0378331005", event_type: "Dividend", distribution: "$0.25 / share", record_date: "2026-01-15", pay_date: "2026-02-01", status: "Settled", mandatory: true, notes: "Q1 2026 quarterly cash dividend - 162nd consecutive payment", impact_pct: 0.82, created_at: "2026-02-14T06:00:00Z" },
  { id: "EVT-002", security: "JPMorgan Chase & Co.", ticker: "JPM", isin: "US46625H1005", event_type: "Dividend", distribution: "$1.25 / share", record_date: "2026-01-20", pay_date: "2026-02-10", status: "Settled", mandatory: true, notes: "Increased quarterly dividend, 14th consecutive raise", impact_pct: 1.1, created_at: "2026-02-14T06:00:00Z" },
  { id: "EVT-003", security: "Visa Inc.", ticker: "V", isin: "US92826C8394", event_type: "Dividend", distribution: "$0.59 / share", record_date: "2026-01-25", pay_date: "2026-02-05", status: "Settled", mandatory: true, notes: "Regular quarterly dividend, 16% increase YoY", impact_pct: 0.45, created_at: "2026-02-14T06:00:00Z" },
  { id: "EVT-004", security: "Johnson & Johnson", ticker: "JNJ", isin: "US4781601046", event_type: "Dividend", distribution: "$1.30 / share", record_date: "2026-01-28", pay_date: "2026-02-12", status: "Settled", mandatory: true, notes: "Dividend King - 63rd consecutive annual increase", impact_pct: 0.95, created_at: "2026-02-14T06:00:00Z" },
  { id: "EVT-005", security: "Procter & Gamble", ticker: "PG", isin: "US7427181091", event_type: "Dividend", distribution: "$1.01 / share", record_date: "2026-02-01", pay_date: "2026-02-15", status: "Settled", mandatory: true, notes: "Q1 dividend - 68th year of consecutive increases", impact_pct: 0.72, created_at: "2026-02-14T06:00:00Z" },
  { id: "EVT-006", security: "Exxon Mobil Corp.", ticker: "XOM", isin: "US30231G1022", event_type: "Dividend", distribution: "$0.99 / share", record_date: "2026-02-05", pay_date: "2026-02-20", status: "Settled", mandatory: true, notes: "Regular quarterly dividend post-Pioneer merger", impact_pct: 0.88, created_at: "2026-02-14T06:00:00Z" },
  { id: "EVT-007", security: "Cisco Systems", ticker: "CSCO", isin: "US17275R1023", event_type: "Stock Split", distribution: "4:1 forward split", record_date: "2026-01-10", pay_date: "2026-01-20", status: "Settled", mandatory: true, notes: "First stock split since 2000, approved unanimously by board", impact_pct: 3.2, created_at: "2026-02-14T06:00:00Z" },
  { id: "EVT-008", security: "Morgan Stanley", ticker: "MS", isin: "US6174464486", event_type: "Tender Offer", distribution: "$102.50 / share", record_date: "2026-01-30", pay_date: "2026-02-14", status: "Settled", mandatory: false, notes: "Completed partial tender - 85% acceptance rate", impact_pct: 5.1, created_at: "2026-02-14T06:00:00Z" },
  { id: "EVT-009", security: "Tesla Inc.", ticker: "TSLA", isin: "US88160R1014", event_type: "Rights Issue", distribution: "1:10 @ $195", record_date: "2026-02-20", pay_date: "2026-03-10", status: "Instructed", mandatory: false, notes: "Capital raise for Gigafactory Mexico expansion, $4.2B target", impact_pct: 3.85, created_at: "2026-02-14T06:00:00Z" },
  { id: "EVT-010", security: "Goldman Sachs Group", ticker: "GS", isin: "US38141G1040", event_type: "Tender Offer", distribution: "$415 / share", record_date: "2026-02-25", pay_date: "2026-03-15", status: "Instructed", mandatory: false, notes: "Strategic buyback via Dutch auction tender, 8% premium to market", impact_pct: 4.9, created_at: "2026-02-14T06:00:00Z" },
  { id: "EVT-011", security: "Broadcom Inc.", ticker: "AVGO", isin: "US11135F1012", event_type: "Dividend", distribution: "$5.25 / share", record_date: "2026-02-28", pay_date: "2026-03-15", status: "Instructed", mandatory: true, notes: "Special dividend following VMware integration synergies", impact_pct: 2.1, created_at: "2026-02-14T06:00:00Z" },
  { id: "EVT-012", security: "UnitedHealth Group", ticker: "UNH", isin: "US91324P1021", event_type: "Merger", distribution: "0.65 shares + $42 cash", record_date: "2026-03-01", pay_date: "2026-04-15", status: "Instructed", mandatory: true, notes: "Acquisition of Amedisys - DOJ clearance received", impact_pct: 7.2, created_at: "2026-02-14T06:00:00Z" },
  { id: "EVT-013", security: "Walt Disney Company", ticker: "DIS", isin: "US2546871060", event_type: "Rights Issue", distribution: "1:12 @ $105", record_date: "2026-03-10", pay_date: "2026-03-28", status: "Validated", mandatory: false, notes: "Funding for ESPN standalone streaming platform launch", impact_pct: 2.6, created_at: "2026-02-14T06:00:00Z" },
  { id: "EVT-014", security: "Pfizer Inc.", ticker: "PFE", isin: "US7170811035", event_type: "Merger", distribution: "Cash + 0.35 PFE shares", record_date: "2026-03-15", pay_date: "2026-05-01", status: "Validated", mandatory: true, notes: "Bolt-on acquisition of oncology biotech - Phase 3 pipeline", impact_pct: 8.4, created_at: "2026-02-14T06:00:00Z" },
  { id: "EVT-015", security: "Costco Wholesale", ticker: "COST", isin: "US22160K1051", event_type: "Dividend", distribution: "$15.00 / share (special)", record_date: "2026-03-20", pay_date: "2026-04-05", status: "Validated", mandatory: true, notes: "Special one-time dividend from excess cash reserves, $6.6B total", impact_pct: 1.8, created_at: "2026-02-14T06:00:00Z" },
  { id: "EVT-016", security: "NVIDIA Corporation", ticker: "NVDA", isin: "US67066G1040", event_type: "Stock Split", distribution: "10:1 forward split", record_date: "2026-04-01", pay_date: "2026-04-15", status: "Announced", mandatory: true, notes: "Second split in 3 years, making shares accessible at ~$15", impact_pct: 12.5, created_at: "2026-02-14T06:00:00Z" },
  { id: "EVT-017", security: "Berkshire Hathaway", ticker: "BRK.B", isin: "US0846707026", event_type: "Stock Split", distribution: "50:1 forward split", record_date: "2026-05-01", pay_date: "2026-05-15", status: "Announced", mandatory: true, notes: "Historic first split of Class B shares since 2010", impact_pct: 18.0, created_at: "2026-02-14T06:00:00Z" },
  { id: "EVT-018", security: "Amazon.com Inc.", ticker: "AMZN", isin: "US0231351067", event_type: "Merger", distribution: "0.75 shares of AMZN", record_date: "2026-05-15", pay_date: "2026-07-01", status: "Announced", mandatory: true, notes: "Proposed acquisition of iRobot - EU antitrust review pending", impact_pct: 14.2, created_at: "2026-02-14T06:00:00Z" },
  { id: "EVT-019", security: "Eli Lilly & Co.", ticker: "LLY", isin: "US5324571083", event_type: "Dividend", distribution: "$1.50 / share", record_date: "2026-04-15", pay_date: "2026-05-01", status: "Announced", mandatory: true, notes: "20% dividend hike following Mounjaro/Zepbound blockbuster sales", impact_pct: 0.6, created_at: "2026-02-14T06:00:00Z" },
  { id: "EVT-020", security: "Microsoft Corporation", ticker: "MSFT", isin: "US5949181045", event_type: "Dividend", distribution: "$0.83 / share", record_date: "2026-03-25", pay_date: "2026-04-10", status: "Pending", mandatory: true, notes: "Regular quarterly dividend, 11% increase from prior quarter", impact_pct: 0.7, created_at: "2026-02-14T06:00:00Z" },
  { id: "EVT-021", security: "Alphabet Inc.", ticker: "GOOGL", isin: "US02079K3059", event_type: "Stock Split", distribution: "20:1 forward split", record_date: "2026-04-20", pay_date: "2026-05-05", status: "Pending", mandatory: true, notes: "Board approved to improve retail investor accessibility", impact_pct: 6.8, created_at: "2026-02-14T06:00:00Z" },
  { id: "EVT-022", security: "Meta Platforms Inc.", ticker: "META", isin: "US30303M1027", event_type: "Dividend", distribution: "$0.65 / share", record_date: "2026-04-01", pay_date: "2026-04-18", status: "Pending", mandatory: true, notes: "Q2 2026 dividend - third ever quarterly payment", impact_pct: 0.55, created_at: "2026-02-14T06:00:00Z" },
  { id: "EVT-023", security: "Bank of America Corp.", ticker: "BAC", isin: "US0605051046", event_type: "Merger", distribution: "1.15 shares + $8.50 cash", record_date: "2026-06-01", pay_date: "2026-08-15", status: "Pending", mandatory: true, notes: "Transformative regional bank merger, $18B deal value", impact_pct: 11.3, created_at: "2026-02-14T06:00:00Z" },
  { id: "EVT-024", security: "Netflix Inc.", ticker: "NFLX", isin: "US64110L1061", event_type: "Tender Offer", distribution: "$850 / share", record_date: "2026-03-30", pay_date: "2026-04-20", status: "Pending", mandatory: false, notes: "Modified Dutch auction tender offer, $5B buyback program", impact_pct: 3.8, created_at: "2026-02-14T06:00:00Z" },
  { id: "EVT-025", security: "Palantir Technologies", ticker: "PLTR", isin: "US69608A1088", event_type: "Rights Issue", distribution: "1:8 @ $72", record_date: "2026-04-10", pay_date: "2026-04-28", status: "Pending", mandatory: false, notes: "Capital raise for AIP platform expansion into defense sector", impact_pct: 4.2, created_at: "2026-02-14T06:00:00Z" },
];

export const SEED_ENTITLEMENTS = [
  { id: "ENT-001", event_id: "EVT-009", security: "Tesla Inc.", ticker: "TSLA", event_type: "Rights Issue", mandatory: false, accounts: ["Fidelity Custody - 7042", "Vanguard Trust - 8091"], election_options: ["Exercise rights", "Sell rights", "Lapse"], elected_option: null, deadline: "2026-02-18", status: "Pending election" },
  { id: "ENT-002", event_id: "EVT-010", security: "Goldman Sachs Group", ticker: "GS", event_type: "Tender Offer", mandatory: false, accounts: ["BlackRock Inst. - 3015", "State Street - 4067"], election_options: ["Tender all", "Tender partial (50%)", "Do not tender"], elected_option: null, deadline: "2026-02-22", status: "Pending election" },
  { id: "ENT-003", event_id: "EVT-024", security: "Netflix Inc.", ticker: "NFLX", event_type: "Tender Offer", mandatory: false, accounts: ["Citadel Securities - 6012", "Renaissance Tech - 7088"], election_options: ["Tender all", "Tender partial (25%)", "Do not tender"], elected_option: null, deadline: "2026-03-25", status: "Pending election" },
  { id: "ENT-004", event_id: "EVT-025", security: "Palantir Technologies", ticker: "PLTR", event_type: "Rights Issue", mandatory: false, accounts: ["ARK Invest - 5034", "Fidelity Custody - 7042"], election_options: ["Exercise rights", "Sell rights", "Lapse"], elected_option: null, deadline: "2026-04-05", status: "Pending election" },
  { id: "ENT-005", event_id: "EVT-013", security: "Walt Disney Company", ticker: "DIS", event_type: "Rights Issue", mandatory: false, accounts: ["Vanguard Trust - 8091"], election_options: ["Exercise rights", "Sell rights", "Lapse"], elected_option: "Exercise rights", deadline: "2026-03-05", status: "Elected" },
  { id: "ENT-006", event_id: "EVT-008", security: "Morgan Stanley", ticker: "MS", event_type: "Tender Offer", mandatory: false, accounts: ["BlackRock Inst. - 3015", "Citadel Securities - 6012"], election_options: ["Tender all", "Tender partial (50%)", "Do not tender"], elected_option: "Tender partial (50%)", deadline: "2026-01-28", status: "Elected" },
  { id: "ENT-007", event_id: "EVT-001", security: "Apple Inc.", ticker: "AAPL", event_type: "Dividend", mandatory: true, accounts: ["Fidelity Custody - 7042", "BlackRock Inst. - 3015", "Vanguard Trust - 8091"], election_options: [], elected_option: null, deadline: "2026-01-15", status: "Auto-processed" },
  { id: "ENT-008", event_id: "EVT-016", security: "NVIDIA Corporation", ticker: "NVDA", event_type: "Stock Split", mandatory: true, accounts: ["ARK Invest - 5034", "Renaissance Tech - 7088", "State Street - 4067", "Citadel Securities - 6012"], election_options: [], elected_option: null, deadline: "2026-04-01", status: "Auto-processed" },
  { id: "ENT-009", event_id: "EVT-020", security: "Microsoft Corporation", ticker: "MSFT", event_type: "Dividend", mandatory: true, accounts: ["Fidelity Custody - 7042", "Vanguard Trust - 8091"], election_options: [], elected_option: null, deadline: "2026-03-25", status: "Auto-processed" },
  { id: "ENT-010", event_id: "EVT-012", security: "UnitedHealth Group", ticker: "UNH", event_type: "Merger", mandatory: true, accounts: ["BlackRock Inst. - 3015", "State Street - 4067"], election_options: [], elected_option: null, deadline: "2026-03-01", status: "Auto-processed" },
  { id: "ENT-011", event_id: "EVT-018", security: "Amazon.com Inc.", ticker: "AMZN", event_type: "Merger", mandatory: true, accounts: ["ARK Invest - 5034", "Renaissance Tech - 7088", "Fidelity Custody - 7042"], election_options: [], elected_option: null, deadline: "2026-05-15", status: "Auto-processed" },
  { id: "ENT-012", event_id: "EVT-015", security: "Costco Wholesale", ticker: "COST", event_type: "Dividend", mandatory: true, accounts: ["Vanguard Trust - 8091", "BlackRock Inst. - 3015", "Fidelity Custody - 7042", "State Street - 4067"], election_options: [], elected_option: null, deadline: "2026-03-20", status: "Auto-processed" },
];

export const SEED_POSITIONS = [
  { id: "POS-001", account: "Fidelity Custody - 7042", security: "Apple Inc.", ticker: "AAPL", shares_held: 245000, event_type: "Dividend", entitlement: "$61,250.00", payment_type: "Cash", risk: "Low", status: "Settled" },
  { id: "POS-002", account: "BlackRock Inst. - 3015", security: "Apple Inc.", ticker: "AAPL", shares_held: 890000, event_type: "Dividend", entitlement: "$222,500.00", payment_type: "Cash", risk: "Low", status: "Settled" },
  { id: "POS-003", account: "BlackRock Inst. - 3015", security: "Goldman Sachs Group", ticker: "GS", shares_held: 42000, event_type: "Tender Offer", entitlement: "$17,430,000.00", payment_type: "Cash", risk: "High", status: "Instructed" },
  { id: "POS-004", account: "Fidelity Custody - 7042", security: "Tesla Inc.", ticker: "TSLA", shares_held: 180000, event_type: "Rights Issue", entitlement: "18,000 rights", payment_type: "Stock", risk: "Medium", status: "Instructed" },
  { id: "POS-005", account: "Vanguard Trust - 8091", security: "Tesla Inc.", ticker: "TSLA", shares_held: 310000, event_type: "Rights Issue", entitlement: "31,000 rights", payment_type: "Stock", risk: "Medium", status: "Instructed" },
  { id: "POS-006", account: "ARK Invest - 5034", security: "NVIDIA Corporation", ticker: "NVDA", shares_held: 520000, event_type: "Stock Split", entitlement: "5,200,000 shares", payment_type: "Stock", risk: "Low", status: "Announced" },
  { id: "POS-007", account: "State Street - 4067", security: "Goldman Sachs Group", ticker: "GS", shares_held: 18500, event_type: "Tender Offer", entitlement: "$7,677,500.00", payment_type: "Cash", risk: "High", status: "Instructed" },
  { id: "POS-008", account: "ARK Invest - 5034", security: "Amazon.com Inc.", ticker: "AMZN", shares_held: 95000, event_type: "Merger", entitlement: "71,250 AMZN shares", payment_type: "Stock", risk: "Medium", status: "Announced" },
  { id: "POS-009", account: "Fidelity Custody - 7042", security: "Microsoft Corporation", ticker: "MSFT", shares_held: 175000, event_type: "Dividend", entitlement: "$145,250.00", payment_type: "Cash", risk: "Low", status: "Pending" },
  { id: "POS-010", account: "BlackRock Inst. - 3015", security: "Pfizer Inc.", ticker: "PFE", shares_held: 620000, event_type: "Merger", entitlement: "Mixed consideration", payment_type: "Mixed", risk: "Medium", status: "Validated" },
  { id: "POS-011", account: "Vanguard Trust - 8091", security: "JPMorgan Chase & Co.", ticker: "JPM", shares_held: 88000, event_type: "Dividend", entitlement: "$110,000.00", payment_type: "Cash", risk: "Low", status: "Settled" },
  { id: "POS-012", account: "Citadel Securities - 6012", security: "Netflix Inc.", ticker: "NFLX", shares_held: 35000, event_type: "Tender Offer", entitlement: "$29,750,000.00", payment_type: "Cash", risk: "High", status: "Pending" },
  { id: "POS-013", account: "Renaissance Tech - 7088", security: "Netflix Inc.", ticker: "NFLX", shares_held: 22000, event_type: "Tender Offer", entitlement: "$18,700,000.00", payment_type: "Cash", risk: "High", status: "Pending" },
  { id: "POS-014", account: "State Street - 4067", security: "UnitedHealth Group", ticker: "UNH", shares_held: 41000, event_type: "Merger", entitlement: "26,650 shares + $1.72M", payment_type: "Mixed", risk: "Medium", status: "Instructed" },
  { id: "POS-015", account: "Vanguard Trust - 8091", security: "Walt Disney Company", ticker: "DIS", shares_held: 150000, event_type: "Rights Issue", entitlement: "12,500 rights", payment_type: "Stock", risk: "Medium", status: "Validated" },
  { id: "POS-016", account: "BlackRock Inst. - 3015", security: "Bank of America Corp.", ticker: "BAC", shares_held: 1200000, event_type: "Merger", entitlement: "1,380,000 shares + $10.2M", payment_type: "Mixed", risk: "High", status: "Pending" },
  { id: "POS-017", account: "ARK Invest - 5034", security: "Palantir Technologies", ticker: "PLTR", shares_held: 850000, event_type: "Rights Issue", entitlement: "106,250 rights", payment_type: "Stock", risk: "Medium", status: "Pending" },
  { id: "POS-018", account: "Fidelity Custody - 7042", security: "Costco Wholesale", ticker: "COST", shares_held: 28000, event_type: "Dividend", entitlement: "$420,000.00", payment_type: "Cash", risk: "Low", status: "Validated" },
];

export const SEED_AUDIT = [
  { id: "AUD-001", action: "System startup - Corporate Actions Processing Engine v3.2.1 initialized", timestamp: "2026-02-14T06:00:00Z", log_type: "system", color: "gray" },
  { id: "AUD-002", action: "SWIFT MT564 feed connected - monitoring 847 global securities", timestamp: "2026-02-14T06:01:00Z", log_type: "system", color: "gray" },
  { id: "AUD-003", action: "Auto-reconciliation: 25 corporate actions loaded from DTCC, Euroclear, Clearstream", timestamp: "2026-02-14T06:05:00Z", log_type: "system", color: "gray" },
  { id: "AUD-004", action: "EVT-001 AAPL Q1 Dividend settled - $283,750 distributed across Fidelity, BlackRock, Vanguard", timestamp: "2026-02-14T07:30:00Z", log_type: "event", color: "green" },
  { id: "AUD-005", action: "EVT-002 JPM Dividend settled - $110,000 to Vanguard Trust account, DTC auto-match confirmed", timestamp: "2026-02-14T07:45:00Z", log_type: "event", color: "green" },
  { id: "AUD-006", action: "EVT-003 Visa Dividend settled - all 3 custodian accounts reconciled within SLA", timestamp: "2026-02-14T08:00:00Z", log_type: "event", color: "green" },
  { id: "AUD-007", action: "EVT-007 CSCO 4:1 Stock Split settled - 2.1M new shares allocated across 6 accounts", timestamp: "2026-02-14T08:15:00Z", log_type: "event", color: "green" },
  { id: "AUD-008", action: "Compliance check passed: All settled events within T+2 settlement window", timestamp: "2026-02-14T08:30:00Z", log_type: "system", color: "green" },
  { id: "AUD-009", action: "User sarah.chen@northerntrust.com logged in - Senior Operations Analyst", timestamp: "2026-02-14T09:00:00Z", log_type: "user", color: "blue" },
  { id: "AUD-010", action: "EVT-016 NVDA 10:1 Stock Split announced - impact analysis: 5.2M shares affected across 4 funds", timestamp: "2026-02-14T09:15:00Z", log_type: "event", color: "blue" },
  { id: "AUD-011", action: "EVT-017 BRK.B 50:1 Split announced - flagged for priority review (largest position: $890M notional)", timestamp: "2026-02-14T09:30:00Z", log_type: "event", color: "blue" },
  { id: "AUD-012", action: "User sarah.chen@northerntrust.com initiated validation for EVT-013 DIS Rights Issue", timestamp: "2026-02-14T09:45:00Z", log_type: "user", color: "blue" },
  { id: "AUD-013", action: "EVT-013 DIS Rights Issue validated - ex-rights price calculated at $98.12, dilution factor 7.7%", timestamp: "2026-02-14T10:00:00Z", log_type: "event", color: "amber" },
  { id: "AUD-014", action: "EVT-014 PFE Merger validated - SEC Form S-4 filing confirmed, fairness opinion attached", timestamp: "2026-02-14T10:15:00Z", log_type: "event", color: "amber" },
  { id: "AUD-015", action: "ENT-005 DIS Rights Issue - Vanguard Trust elected: Exercise rights (150K shares, $15.75M commitment)", timestamp: "2026-02-14T10:30:00Z", log_type: "user", color: "blue" },
  { id: "AUD-016", action: "ENT-006 MS Tender Offer - BlackRock & Citadel elected: Tender partial 50% ($12.3M aggregate)", timestamp: "2026-02-14T10:45:00Z", log_type: "user", color: "blue" },
  { id: "AUD-017", action: "EVT-009 TSLA Rights Issue instructed - SWIFT MT565 sent to custodian, awaiting confirmation", timestamp: "2026-02-14T11:00:00Z", log_type: "event", color: "amber" },
  { id: "AUD-018", action: "EVT-010 GS Tender Offer instructed - Dutch auction price range $395-$415 communicated", timestamp: "2026-02-14T11:15:00Z", log_type: "event", color: "amber" },
  { id: "AUD-019", action: "Risk alert: EVT-023 BAC Merger - position exceeds $10M threshold, requires senior approval", timestamp: "2026-02-14T11:30:00Z", log_type: "system", color: "red" },
  { id: "AUD-020", action: "User james.wright@northerntrust.com approved EVT-023 BAC Merger - VP Risk sign-off recorded", timestamp: "2026-02-14T11:45:00Z", log_type: "user", color: "blue" },
  { id: "AUD-021", action: "Rate limit warning: Alpha Vantage API at 22/25 daily requests - switching to Bloomberg fallback", timestamp: "2026-02-14T12:00:00Z", log_type: "system", color: "red" },
  { id: "AUD-022", action: "User ops-team@northerntrust.com bulk-approved 6 mandatory entitlements via batch processor", timestamp: "2026-02-14T13:00:00Z", log_type: "user", color: "blue" },
  { id: "AUD-023", action: "End-of-day reconciliation: 8 settled, 4 instructed, 3 validated, 4 announced, 6 pending", timestamp: "2026-02-14T16:00:00Z", log_type: "system", color: "gray" },
  { id: "AUD-024", action: "Daily P&L impact report generated - net portfolio impact: +$18.7B AUM, 18 positions affected", timestamp: "2026-02-14T16:30:00Z", log_type: "system", color: "green" },
];

// ─── Helper to compute dashboard from events ───
export function computeDashboard(events, entitlements) {
  const pending = events.filter(e => e.status === "Pending" || e.status === "Announced").length;
  const processed = events.filter(e => e.status === "Settled").length;
  const electionsDue = entitlements.filter(e => e.status === "Pending election").length;

  const typeCounts = {};
  events.forEach(e => { typeCounts[e.event_type] = (typeCounts[e.event_type] || 0) + 1; });

  const deadlines = [...events]
    .sort((a, b) => a.record_date.localeCompare(b.record_date))
    .slice(0, 6)
    .map(e => ({ security: e.security, ticker: e.ticker, event_type: e.event_type, deadline: e.record_date, status: e.status }));

  return {
    metrics: {
      pending_events: pending,
      processed_today: processed,
      failed_exceptions: 1,
      total_aum_affected: "$18.7B",
      elections_due_today: electionsDue,
    },
    deadlines,
    type_breakdown: typeCounts,
    pipeline: {
      Announced: events.filter(e => e.status === "Announced").length,
      Validated: events.filter(e => e.status === "Validated").length,
      Instructed: events.filter(e => e.status === "Instructed").length,
      Settled: events.filter(e => e.status === "Settled").length,
      Exceptions: 1,
    },
  };
}

export function computePositionMetrics(positions) {
  const accounts = new Set(positions.map(p => p.account));
  return {
    total_accounts: accounts.size,
    positions_affected: positions.length,
    cash_entitlements: positions.filter(p => p.payment_type === "Cash").length,
    stock_entitlements: positions.filter(p => p.payment_type === "Stock").length,
  };
}
