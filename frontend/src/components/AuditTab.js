import { Button } from "@/components/ui/button";
import { ArrowSquareOut } from "@phosphor-icons/react";

export default function AuditTab({ data, loading }) {
  const { entries } = data;

  if (loading) {
    return (
      <div data-testid="audit-loading" className="space-y-3">
        {[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-white border border-[#E5E5E5] animate-pulse" />)}
      </div>
    );
  }

  return (
    <div data-testid="audit-tab" className="space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-[#0A0A0A] font-heading">Audit & activity log</h3>
          <p className="text-sm text-[#666666] mt-0.5">{entries.length} entries</p>
        </div>
        <Button variant="outline" className="border-[#E5E5E5] text-[#0A0A0A] hover:bg-[#F0F0F0] text-sm">
          Regulatory context <ArrowSquareOut size={14} className="ml-1" />
        </Button>
      </div>

      {/* Timeline */}
      <div data-testid="audit-timeline" className="bg-white border border-[#E5E5E5] p-6">
        <div className="space-y-0">
          {entries.map((entry, idx) => {
            const ts = new Date(entry.timestamp);
            const timeStr = ts.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
            const dateStr = ts.toLocaleDateString("en-US", { month: "short", day: "numeric" });

            return (
              <div
                key={entry.id}
                data-testid={`audit-entry-${entry.id}`}
                className="flex gap-4 py-3 border-b border-[#F0F0F0] last:border-0"
              >
                <div className={`tl-dot tl-dot-${entry.color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#0A0A0A] leading-relaxed">{entry.action}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <span className="text-xs font-mono-data text-[#666666]">{timeStr}</span>
                  <br />
                  <span className="text-[11px] text-[#9CA3AF]">{dateStr}</span>
                </div>
              </div>
            );
          })}
          {entries.length === 0 && (
            <div className="py-12 text-center text-[#666666] text-sm">No audit entries yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
