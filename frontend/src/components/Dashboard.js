import { useState } from "react";
import SummaryCards from "@/components/SummaryCards";
import ActionsTable from "@/components/ActionsTable";
import ActionForm from "@/components/ActionForm";
import { Button } from "@/components/ui/button";
import { Plus, Activity } from "lucide-react";

export default function Dashboard({
  actions,
  summary,
  loading,
  onAddAction,
  onProcessAction,
}) {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div data-testid="corporate-actions-dashboard" className="flex flex-col min-h-screen">
      {/* Navigation Bar */}
      <nav
        data-testid="main-navbar"
        className="glass-nav sticky top-0 z-30 border-b border-slate-800/60 bg-[#0f172a]/80"
      >
        <div className="max-w-[1600px] mx-auto px-6 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <Activity className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h1
                data-testid="app-title"
                className="text-base font-semibold text-slate-100 tracking-tight"
                style={{ fontFamily: "'Work Sans', sans-serif" }}
              >
                Corporate Actions
              </h1>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Processing System
              </span>
            </div>
          </div>
          <Button
            data-testid="new-action-btn"
            onClick={() => setSheetOpen(true)}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-md px-4 py-2 transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Action
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-[1600px] mx-auto w-full px-6 md:px-8 py-6 flex flex-col gap-6">
        <SummaryCards summary={summary} loading={loading} />
        <ActionsTable
          actions={actions}
          loading={loading}
          onProcessAction={onProcessAction}
        />
      </main>

      {/* Action Form Sheet */}
      <ActionForm
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSubmit={onAddAction}
      />
    </div>
  );
}
