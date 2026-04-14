import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

const statusConfig = {
  Pending: {
    textColor: "text-amber-300",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    testId: "status-badge-pending",
  },
  Processing: {
    textColor: "text-blue-300",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    testId: "status-badge-processing",
  },
  Completed: {
    textColor: "text-emerald-300",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    testId: "status-badge-completed",
  },
};

const actionTypeColors = {
  Dividend: "text-indigo-300",
  "Stock Split": "text-cyan-300",
  Merger: "text-rose-300",
  "Rights Issue": "text-amber-300",
};

export default function ActionsTable({ actions, loading, onProcessAction }) {
  const handleProcess = async (action) => {
    try {
      await onProcessAction(action.id);
      toast.success(`Processing ${action.ticker} - ${action.action_type}`, {
        description: "Status will update to Completed in 3 seconds.",
      });
    } catch (e) {
      toast.error("Failed to process action");
    }
  };

  if (loading) {
    return (
      <div
        data-testid="actions-table-loading"
        className="bg-[#1e293b] border border-slate-700/50 rounded-lg p-8"
      >
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-12 bg-slate-800/50 rounded animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="actions-table-container"
      className="bg-[#1e293b] border border-slate-700/50 rounded-lg overflow-hidden"
    >
      {/* Table Header Bar */}
      <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
        <div>
          <h2
            data-testid="actions-table-title"
            className="text-lg font-medium text-slate-100"
            style={{ fontFamily: "'Work Sans', sans-serif" }}
          >
            Corporate Actions
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {actions.length} total entries
          </p>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-b border-slate-700/50 hover:bg-transparent">
            <TableHead className="bg-slate-900/50 text-[11px] uppercase tracking-[0.15em] text-slate-400 font-semibold py-3 px-4">
              Ticker
            </TableHead>
            <TableHead className="bg-slate-900/50 text-[11px] uppercase tracking-[0.15em] text-slate-400 font-semibold py-3 px-4">
              Company
            </TableHead>
            <TableHead className="bg-slate-900/50 text-[11px] uppercase tracking-[0.15em] text-slate-400 font-semibold py-3 px-4">
              Type
            </TableHead>
            <TableHead className="bg-slate-900/50 text-[11px] uppercase tracking-[0.15em] text-slate-400 font-semibold py-3 px-4">
              Ex-Date
            </TableHead>
            <TableHead className="bg-slate-900/50 text-[11px] uppercase tracking-[0.15em] text-slate-400 font-semibold py-3 px-4">
              Record Date
            </TableHead>
            <TableHead className="bg-slate-900/50 text-[11px] uppercase tracking-[0.15em] text-slate-400 font-semibold py-3 px-4">
              Impact
            </TableHead>
            <TableHead className="bg-slate-900/50 text-[11px] uppercase tracking-[0.15em] text-slate-400 font-semibold py-3 px-4">
              Status
            </TableHead>
            <TableHead className="bg-slate-900/50 text-[11px] uppercase tracking-[0.15em] text-slate-400 font-semibold py-3 px-4 text-right">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {actions.map((action) => {
            const sc = statusConfig[action.status] || statusConfig.Pending;
            const typeColor =
              actionTypeColors[action.action_type] || "text-slate-300";
            const isProcessing = action.status === "Processing";
            const isCompleted = action.status === "Completed";

            return (
              <TableRow
                key={action.id}
                data-testid={`action-row-${action.ticker}`}
                className="action-row-enter border-b border-slate-800 hover:bg-slate-800/50 transition-colors"
              >
                <TableCell className="py-4 px-4">
                  <span
                    data-testid={`ticker-${action.ticker}`}
                    className="ticker-cell text-slate-100 bg-slate-800/80 px-2 py-1 rounded text-sm"
                  >
                    {action.ticker}
                  </span>
                </TableCell>
                <TableCell className="py-4 px-4 text-sm text-slate-300 max-w-[200px] truncate">
                  {action.company_name}
                </TableCell>
                <TableCell className="py-4 px-4">
                  <span className={`text-sm font-medium ${typeColor}`}>
                    {action.action_type}
                  </span>
                </TableCell>
                <TableCell className="py-4 px-4 text-sm text-slate-400 font-mono-data">
                  {action.ex_date}
                </TableCell>
                <TableCell className="py-4 px-4 text-sm text-slate-400 font-mono-data">
                  {action.record_date}
                </TableCell>
                <TableCell className="py-4 px-4">
                  <span className="text-sm font-mono-data text-slate-200">
                    {action.impact_pct}%
                  </span>
                </TableCell>
                <TableCell className="py-4 px-4">
                  <Badge
                    data-testid={`status-badge-${action.id}`}
                    className={`${sc.bg} ${sc.textColor} ${sc.border} border rounded-full text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 ${
                      isProcessing
                        ? "animate-pulse-processing"
                        : "animate-status-enter"
                    }`}
                    variant="outline"
                  >
                    {isProcessing && (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    )}
                    {isCompleted && <Check className="w-3 h-3 mr-1" />}
                    {action.status}
                  </Badge>
                </TableCell>
                <TableCell className="py-4 px-4 text-right">
                  <Button
                    data-testid={`process-action-btn-${action.id}`}
                    variant="outline"
                    size="sm"
                    disabled={isProcessing || isCompleted}
                    onClick={() => handleProcess(action)}
                    className={`text-xs font-medium transition-all ${
                      isProcessing || isCompleted
                        ? "opacity-40 cursor-not-allowed border-slate-700 text-slate-600"
                        : "border-slate-600 text-slate-300 hover:text-white hover:border-indigo-500/50 hover:bg-indigo-500/10 btn-process"
                    }`}
                  >
                    {isCompleted ? (
                      <>
                        <Check className="w-3 h-3" />
                        Done
                      </>
                    ) : isProcessing ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Running
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3" />
                        Process
                      </>
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
          {actions.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={8}
                className="py-16 text-center text-slate-500 text-sm"
              >
                No corporate actions found. Add one using the button above.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
