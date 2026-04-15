import { useState, useCallback } from "react";
import "@/App.css";
import { Toaster, toast } from "sonner";
import Header from "@/components/Header";
import DashboardTab from "@/components/DashboardTab";
import EventQueueTab from "@/components/EventQueueTab";
import EntitlementsTab from "@/components/EntitlementsTab";
import PositionsTab from "@/components/PositionsTab";
import AuditTab from "@/components/AuditTab";
import {
  SEED_EVENTS,
  SEED_ENTITLEMENTS,
  SEED_POSITIONS,
  SEED_AUDIT,
  computeDashboard,
  computePositionMetrics,
} from "@/data/seedData";

const TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "events", label: "Event Queue" },
  { id: "entitlements", label: "Entitlements" },
  { id: "positions", label: "Positions" },
  { id: "audit", label: "Audit Log" },
];

let nextEvtNum = SEED_EVENTS.length + 1;

function uid() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [events, setEvents] = useState([...SEED_EVENTS]);
  const [entitlements, setEntitlements] = useState([...SEED_ENTITLEMENTS]);
  const [positions] = useState([...SEED_POSITIONS]);
  const [auditLog, setAuditLog] = useState([...SEED_AUDIT]);

  // ─── Derived state ───
  const dashboard = computeDashboard(events, entitlements);
  const posMetrics = computePositionMetrics(positions);

  const addAudit = useCallback((action, logType = "system", color = "gray") => {
    setAuditLog(prev => [
      { id: `AUD-${uid()}`, action, timestamp: new Date().toISOString(), log_type: logType, color },
      ...prev,
    ]);
  }, []);

  // ─── Event Queue helpers ───
  const getFilteredEvents = useCallback((params = {}) => {
    let filtered = [...events];
    const { search = "", event_type = "", status = "", page = 1, per_page = 10 } = params;
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(e =>
        e.security.toLowerCase().includes(s) ||
        e.isin.toLowerCase().includes(s) ||
        e.id.toLowerCase().includes(s) ||
        e.ticker.toLowerCase().includes(s)
      );
    }
    if (event_type) filtered = filtered.filter(e => e.event_type === event_type);
    if (status) filtered = filtered.filter(e => e.status === status);
    const total = filtered.length;
    const start = (page - 1) * per_page;
    return {
      events: filtered.slice(start, start + per_page),
      total,
      page,
      per_page,
      total_pages: Math.ceil(total / per_page) || 1,
    };
  }, [events]);

  const createEvent = useCallback((payload) => {
    const evtId = `EVT-${String(nextEvtNum++).padStart(3, "0")}`;
    const impact = +(Math.random() * 12 + 0.3).toFixed(2);
    const newEvt = {
      id: evtId,
      security: payload.security,
      ticker: "",
      isin: payload.isin || "",
      event_type: payload.event_type,
      distribution: payload.distribution || "",
      record_date: payload.record_date,
      pay_date: payload.pay_date,
      status: "Announced",
      mandatory: payload.mandatory ?? true,
      notes: payload.notes || "",
      impact_pct: impact,
      created_at: new Date().toISOString(),
    };
    setEvents(prev => [...prev, newEvt]);
    addAudit(`${evtId} ${payload.security} ${payload.event_type} created`, "event", "blue");
    toast.success(`Event ${evtId} created`);
    return newEvt;
  }, [addAudit]);

  const processEvent = useCallback((eventId) => {
    const flow = ["Announced", "Pending", "Validated", "Instructed", "Settled"];
    setEvents(prev => prev.map(e => {
      if (e.id !== eventId) return e;
      if (e.status === "Settled") return e;
      const idx = flow.indexOf(e.status);
      const next = idx >= 0 ? flow[Math.min(idx + 1, flow.length - 1)] : "Validated";
      addAudit(`${eventId} ${e.security} moved to ${next}`, "event", next === "Settled" ? "green" : "amber");
      toast.success(`${eventId} moved to ${next}`);
      return { ...e, status: next };
    }));
  }, [addAudit]);

  // ─── Entitlements helpers ───
  const getFilteredEntitlements = useCallback((filterType = "") => {
    let filtered = [...entitlements];
    if (filterType === "pending") filtered = filtered.filter(e => e.status === "Pending election");
    else if (filterType === "elected") filtered = filtered.filter(e => e.status === "Elected");
    else if (filterType === "mandatory") filtered = filtered.filter(e => e.mandatory);
    return { entitlements: filtered, total: filtered.length };
  }, [entitlements]);

  const electEntitlement = useCallback((entId, option) => {
    setEntitlements(prev => prev.map(ent => {
      if (ent.id !== entId) return ent;
      addAudit(`${entId} ${ent.security} election: ${option}`, "user", "blue");
      toast.success(`Election submitted: ${option}`);
      return { ...ent, elected_option: option, status: "Elected" };
    }));
  }, [addAudit]);

  const submitAllElections = useCallback(() => {
    const count = entitlements.filter(e => e.status === "Elected").length;
    addAudit(`Bulk submission: ${count} elections submitted for processing`, "user", "green");
    toast.success(`${count} elections submitted`);
  }, [entitlements, addAudit]);

  return (
    <div className="min-h-screen bg-[#F7F7F9]">
      <Toaster position="top-right" richColors />
      <Header onNewEvent={() => setActiveTab("events")} />

      {/* Tab Navigation */}
      <nav data-testid="tab-navigation" className="border-b border-[#E5E5E5] bg-white sticky top-[64px] z-40">
        <div className="max-w-[1440px] mx-auto px-6 md:px-8 flex gap-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              data-testid={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-btn px-5 py-3.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "active text-[#002FA7]"
                  : "text-[#666666] hover:text-[#0A0A0A]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Tab Content */}
      <main className="max-w-[1440px] mx-auto px-6 md:px-8 py-6">
        {activeTab === "dashboard" && (
          <DashboardTab data={dashboard} loading={false} />
        )}
        {activeTab === "events" && (
          <EventQueueTab
            data={getFilteredEvents()}
            loading={false}
            onSearch={(params) => getFilteredEvents(params)}
            onCreate={createEvent}
            onProcess={processEvent}
            getFiltered={getFilteredEvents}
          />
        )}
        {activeTab === "entitlements" && (
          <EntitlementsTab
            data={getFilteredEntitlements()}
            loading={false}
            onFilter={(f) => getFilteredEntitlements(f)}
            onElect={electEntitlement}
            onSubmitAll={submitAllElections}
            getFiltered={getFilteredEntitlements}
          />
        )}
        {activeTab === "positions" && (
          <PositionsTab
            data={{ positions, metrics: posMetrics }}
            loading={false}
          />
        )}
        {activeTab === "audit" && (
          <AuditTab data={{ entries: auditLog }} loading={false} />
        )}
      </main>
    </div>
  );
}

export default App;
