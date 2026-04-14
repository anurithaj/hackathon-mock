import { useState, useEffect, useCallback } from "react";
import "@/App.css";
import axios from "axios";
import Dashboard from "@/components/Dashboard";
import { Toaster } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [actions, setActions] = useState([]);
  const [summary, setSummary] = useState({
    total_actions: 0,
    pending_count: 0,
    securities_affected: 0,
    avg_processing_time: 2.4,
  });
  const [loading, setLoading] = useState(true);

  const fetchActions = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/actions`);
      setActions(res.data);
    } catch (e) {
      console.error("Failed to fetch actions:", e);
    }
  }, []);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/actions/summary`);
      setSummary(res.data);
    } catch (e) {
      console.error("Failed to fetch summary:", e);
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchActions(), fetchSummary()]);
    setLoading(false);
  }, [fetchActions, fetchSummary]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addAction = async (payload) => {
    const res = await axios.post(`${API}/actions`, payload);
    setActions((prev) => [...prev, res.data]);
    await fetchSummary();
    return res.data;
  };

  const processAction = async (actionId) => {
    await axios.put(`${API}/actions/${actionId}/process`);
    setActions((prev) =>
      prev.map((a) => (a.id === actionId ? { ...a, status: "Processing" } : a))
    );

    setTimeout(async () => {
      await axios.put(`${API}/actions/${actionId}/complete`);
      setActions((prev) =>
        prev.map((a) =>
          a.id === actionId ? { ...a, status: "Completed" } : a
        )
      );
      await fetchSummary();
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1e293b",
            border: "1px solid #334155",
            color: "#f8fafc",
          },
        }}
      />
      <Dashboard
        actions={actions}
        summary={summary}
        loading={loading}
        onAddAction={addAction}
        onProcessAction={processAction}
      />
    </div>
  );
}

export default App;
