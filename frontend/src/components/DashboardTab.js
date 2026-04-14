import {
  ClockCountdown,
  CheckCircle,
  WarningCircle,
  CurrencyDollar,
  ListChecks,
} from "@phosphor-icons/react";

const METRIC_CARDS = [
  { key: "pending_events", label: "Pending events", icon: ClockCountdown, color: "#F5A623" },
  { key: "processed_today", label: "Processed today", icon: CheckCircle, color: "#046A38" },
  { key: "failed_exceptions", label: "Failed / exceptions", icon: WarningCircle, color: "#FF2400" },
  { key: "total_aum_affected", label: "Total AUM affected", icon: CurrencyDollar, color: "#002FA7" },
  { key: "elections_due_today", label: "Elections due today", icon: ListChecks, color: "#F5A623" },
];

const PIPELINE_STAGES = ["Announced", "Validated", "Instructed", "Settled", "Exceptions"];
const PIPELINE_COLORS = {
  Announced: "#DBEAFE",
  Validated: "#E0E7FF",
  Instructed: "#FEF3C7",
  Settled: "#D1FAE5",
  Exceptions: "#FEE2E2",
};
const PIPELINE_TEXT = {
  Announced: "#1E40AF",
  Validated: "#3730A3",
  Instructed: "#92400E",
  Settled: "#065F46",
  Exceptions: "#991B1B",
};

const TYPE_COLORS = {
  Dividend: "#7C3AED",
  "Stock Split": "#2563EB",
  Merger: "#DB2777",
  "Rights Issue": "#D97706",
  "Tender Offer": "#4F46E5",
};

const STATUS_BADGE = {
  Pending: "badge-pending",
  Announced: "badge-announced",
  Validated: "badge-validated",
  Instructed: "badge-instructed",
  Settled: "badge-settled",
};

export default function DashboardTab({ data, loading }) {
  if (loading || !data) {
    return (
      <div data-testid="dashboard-loading" className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-white border border-[#E5E5E5] animate-pulse" />
        ))}
      </div>
    );
  }

  const { metrics, deadlines, type_breakdown, pipeline } = data;
  const maxTypeCount = Math.max(...Object.values(type_breakdown), 1);

  return (
    <div data-testid="dashboard-tab" className="space-y-6 animate-fadeIn">
      {/* Metric Cards */}
      <div
        data-testid="dashboard-metrics"
        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4"
      >
        {METRIC_CARDS.map((card, idx) => {
          const Icon = card.icon;
          const val = metrics[card.key];
          return (
            <div
              key={card.key}
              data-testid={`metric-${card.key}`}
              className={`animate-fadeIn stagger-${idx + 1} bg-white border border-[#E5E5E5] p-5 flex flex-col gap-2`}
              style={{ opacity: 0, animationFillMode: "forwards" }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#666666] tracking-wide uppercase">
                  {card.label}
                </span>
                <Icon size={18} weight="bold" style={{ color: card.color }} />
              </div>
              <span
                data-testid={`metric-${card.key}-value`}
                className="text-2xl font-bold text-[#0A0A0A] font-heading"
                style={{ color: card.color }}
              >
                {val}
              </span>
            </div>
          );
        })}
      </div>

      {/* Middle Row: Deadlines + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upcoming Deadlines */}
        <div
          data-testid="upcoming-deadlines"
          className="bg-white border border-[#E5E5E5] p-5"
        >
          <h3 className="text-base font-bold text-[#0A0A0A] font-heading mb-4">
            Upcoming deadlines
          </h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E5E5]">
                <th className="text-left py-2 text-xs font-medium text-[#666666] uppercase tracking-wide">Security</th>
                <th className="text-left py-2 text-xs font-medium text-[#666666] uppercase tracking-wide">Type</th>
                <th className="text-left py-2 text-xs font-medium text-[#666666] uppercase tracking-wide">Deadline</th>
                <th className="text-left py-2 text-xs font-medium text-[#666666] uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {deadlines.map((d, i) => (
                <tr key={i} className="border-b border-[#F0F0F0] data-row">
                  <td className="py-2.5">
                    <span className="font-medium text-[#0A0A0A]">{d.security}</span>
                    <span className="ml-1.5 text-xs font-mono-data text-[#666666]">{d.ticker}</span>
                  </td>
                  <td className="py-2.5">
                    <span
                      className="inline-block px-2 py-0.5 text-[11px] font-medium rounded-sm"
                      style={{ background: `${TYPE_COLORS[d.event_type]}15`, color: TYPE_COLORS[d.event_type] }}
                    >
                      {d.event_type}
                    </span>
                  </td>
                  <td className="py-2.5 font-mono-data text-sm text-[#0A0A0A]">{d.deadline}</td>
                  <td className="py-2.5">
                    <span className={`inline-block px-2 py-0.5 text-[11px] font-medium rounded-sm ${STATUS_BADGE[d.status] || "badge-pending"}`}>
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Event Type Breakdown */}
        <div
          data-testid="event-type-breakdown"
          className="bg-white border border-[#E5E5E5] p-5"
        >
          <h3 className="text-base font-bold text-[#0A0A0A] font-heading mb-4">
            Event type breakdown
          </h3>
          <div className="flex items-end gap-6 h-[160px] mb-4">
            {Object.entries(type_breakdown).map(([type, count]) => (
              <div key={type} className="flex flex-col items-center flex-1 h-full justify-end">
                <span className="text-xs font-bold text-[#0A0A0A] mb-1">{count}</span>
                <div
                  className="chart-bar w-full min-w-[32px]"
                  style={{
                    height: `${(count / maxTypeCount) * 100}%`,
                    background: TYPE_COLORS[type] || "#002FA7",
                    minHeight: "8px",
                  }}
                />
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            {Object.entries(type_breakdown).map(([type]) => (
              <div key={type} className="flex items-center gap-1.5 text-xs text-[#666666]">
                <div
                  className="w-2.5 h-2.5 rounded-sm"
                  style={{ background: TYPE_COLORS[type] || "#002FA7" }}
                />
                {type}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Processing Pipeline */}
      <div
        data-testid="processing-pipeline"
        className="bg-white border border-[#E5E5E5] p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-[#0A0A0A] font-heading">
            Processing pipeline
          </h3>
          <span className="text-xs text-[#666666]">
            {pipeline.Exceptions > 0 && (
              <span className="inline-block px-2 py-0.5 text-[11px] font-medium rounded-sm badge-exception mr-2">
                {pipeline.Exceptions} need review
              </span>
            )}
          </span>
        </div>
        <div className="grid grid-cols-5 gap-0 border border-[#E5E5E5]">
          {PIPELINE_STAGES.map((stage) => (
            <div
              key={stage}
              data-testid={`pipeline-${stage.toLowerCase()}`}
              className="pipeline-step p-4 text-center border-r last:border-r-0 border-[#E5E5E5]"
              style={{ background: PIPELINE_COLORS[stage] }}
            >
              <div
                className="text-2xl font-bold font-heading"
                style={{ color: PIPELINE_TEXT[stage] }}
              >
                {pipeline[stage] ?? 0}
              </div>
              <div
                className="text-[11px] font-medium uppercase tracking-wider mt-1"
                style={{ color: PIPELINE_TEXT[stage] }}
              >
                {stage}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
