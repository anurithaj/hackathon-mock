import { useState, useEffect, useCallback } from "react";
import "@/App.css";
import axios from "axios";
import { Toaster, toast } from "sonner";
import Header from "@/components/Header";
import DashboardTab from "@/components/DashboardTab";
import EventQueueTab from "@/components/EventQueueTab";
import EntitlementsTab from "@/components/EntitlementsTab";
import PositionsTab from "@/components/PositionsTab";
import AuditTab from "@/components/AuditTab";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "events", label: "Event Queue" },
  { id: "entitlements", label: "Entitlements" },
  { id: "positions", label: "Positions" },
  { id: "audit", label: "Audit Log" },
];

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [dashboard, setDashboard] = useState(null);
  const [events, setEvents] = useState({ events: [], total: 0, page: 1, total_pages: 1 });
  const [entitlements, setEntitlements] = useState({ entitlements: [], total: 0 });
  const [positions, setPositions] = useState({ positions: [], metrics: {} });
  const [audit, setAudit] = useState({ entries: [] });
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/dashboard`);
      setDashboard(res.data);
    } catch (e) { console.error(e); }
  }, []);

  const fetchEvents = useCallback(async (params = {}) => {
    try {
      const res = await axios.get(`${API}/events`, { params });
      setEvents(res.data);
    } catch (e) { console.error(e); }
  }, []);

  const fetchEntitlements = useCallback(async (filter = "") => {
    try {
      const res = await axios.get(`${API}/entitlements`, { params: { filter_type: filter } });
      setEntitlements(res.data);
    } catch (e) { console.error(e); }
  }, []);

  const fetchPositions = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/positions`);
      setPositions(res.data);
    } catch (e) { console.error(e); }
  }, []);

  const fetchAudit = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/audit`);
      setAudit(res.data);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchDashboard(), fetchEvents(), fetchEntitlements(), fetchPositions(), fetchAudit()]);
      setLoading(false);
    };
    init();
  }, [fetchDashboard, fetchEvents, fetchEntitlements, fetchPositions, fetchAudit]);

  const createEvent = async (payload) => {
    const res = await axios.post(`${API}/events`, payload);
    toast.success(`Event ${res.data.id} created`);
    await Promise.all([fetchEvents(), fetchDashboard(), fetchAudit()]);
    return res.data;
  };

  const processEvent = async (eventId) => {
    const res = await axios.put(`${API}/events/${eventId}/process`);
    toast.success(`${eventId} moved to ${res.data.status}`);
    await Promise.all([fetchEvents(), fetchDashboard(), fetchAudit()]);
    return res.data;
  };

  const electEntitlement = async (entId, option) => {
    await axios.put(`${API}/entitlements/${entId}/elect`, { elected_option: option });
    toast.success(`Election submitted: ${option}`);
    await Promise.all([fetchEntitlements(), fetchAudit()]);
  };

  const submitAllElections = async () => {
    const res = await axios.post(`${API}/entitlements/submit-all`);
    toast.success(`${res.data.submitted} elections submitted`);
    await fetchAudit();
  };

  const refreshTab = async () => {
    if (activeTab === "dashboard") await fetchDashboard();
    if (activeTab === "events") await fetchEvents();
    if (activeTab === "entitlements") await fetchEntitlements();
    if (activeTab === "positions") await fetchPositions();
    if (activeTab === "audit") await fetchAudit();
  };

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
              onClick={() => { setActiveTab(tab.id); }}
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
          <DashboardTab data={dashboard} loading={loading} />
        )}
        {activeTab === "events" && (
          <EventQueueTab
            data={events}
            loading={loading}
            onSearch={fetchEvents}
            onCreate={createEvent}
            onProcess={processEvent}
          />
        )}
        {activeTab === "entitlements" && (
          <EntitlementsTab
            data={entitlements}
            loading={loading}
            onFilter={fetchEntitlements}
            onElect={electEntitlement}
            onSubmitAll={submitAllElections}
          />
        )}
        {activeTab === "positions" && (
          <PositionsTab data={positions} loading={loading} />
        )}
        {activeTab === "audit" && (
          <AuditTab data={audit} loading={loading} />
        )}
      </main>
    </div>
  );
}

export default App;
