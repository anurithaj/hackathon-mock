import { LayoutList, Clock, Shield, Timer } from "lucide-react";

const cards = [
  {
    key: "total_actions",
    label: "Total Actions",
    icon: LayoutList,
    color: "text-indigo-400",
    bgAccent: "bg-indigo-500/10",
    testId: "summary-total-actions",
  },
  {
    key: "pending_count",
    label: "Pending",
    icon: Clock,
    color: "text-amber-400",
    bgAccent: "bg-amber-500/10",
    testId: "summary-pending-count",
  },
  {
    key: "securities_affected",
    label: "Securities Affected",
    icon: Shield,
    color: "text-cyan-400",
    bgAccent: "bg-cyan-500/10",
    testId: "summary-securities-affected",
  },
  {
    key: "avg_processing_time",
    label: "Avg Processing Time",
    icon: Timer,
    color: "text-emerald-400",
    bgAccent: "bg-emerald-500/10",
    suffix: " hrs",
    testId: "summary-avg-processing-time",
  },
];

export default function SummaryCards({ summary, loading }) {
  return (
    <div
      data-testid="summary-cards-grid"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {cards.map((card, idx) => {
        const Icon = card.icon;
        const value = summary[card.key];
        return (
          <div
            key={card.key}
            data-testid={card.testId}
            className={`metric-card animate-fade-in-up stagger-${idx + 1} bg-[#1e293b] border border-slate-700/50 rounded-lg p-5 flex flex-col gap-3`}
            style={{ opacity: 0, animationFillMode: "forwards" }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400"
                style={{ fontFamily: "'Work Sans', sans-serif" }}
              >
                {card.label}
              </span>
              <div
                className={`w-8 h-8 rounded-md ${card.bgAccent} flex items-center justify-center`}
              >
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              {loading ? (
                <div className="h-8 w-16 bg-slate-700/50 rounded animate-pulse" />
              ) : (
                <span
                  data-testid={`${card.testId}-value`}
                  className="text-3xl font-semibold text-slate-100 font-mono-data"
                >
                  {value}
                  {card.suffix && (
                    <span className="text-sm text-slate-500 ml-1">
                      {card.suffix}
                    </span>
                  )}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
