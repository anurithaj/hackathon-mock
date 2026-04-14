import {
  Users,
  ChartBar,
  CurrencyDollar,
  ArrowsLeftRight,
} from "@phosphor-icons/react";

const POS_METRICS = [
  { key: "total_accounts", label: "Total accounts", icon: Users, color: "#002FA7" },
  { key: "positions_affected", label: "Positions affected", icon: ChartBar, color: "#0A0A0A" },
  { key: "cash_entitlements", label: "Cash entitlements", icon: CurrencyDollar, color: "#046A38" },
  { key: "stock_entitlements", label: "Stock entitlements", icon: ArrowsLeftRight, color: "#7C3AED" },
];

const RISK_BADGE = {
  High: "badge-risk-high",
  Medium: "badge-risk-medium",
  Low: "badge-risk-low",
};

const PAY_BADGE = {
  Cash: "badge-cash",
  Stock: "badge-stock",
  Mixed: "badge-mixed",
};

const STATUS_BADGE = {
  Pending: "badge-pending",
  Announced: "badge-announced",
  Validated: "badge-validated",
  Instructed: "badge-instructed",
  Settled: "badge-settled",
};

export default function PositionsTab({ data, loading }) {
  const { positions, metrics } = data;

  if (loading) {
    return (
      <div data-testid="positions-loading" className="space-y-3">
        {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-white border border-[#E5E5E5] animate-pulse" />)}
      </div>
    );
  }

  return (
    <div data-testid="positions-tab" className="space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-[#0A0A0A] font-heading">Affected positions</h3>
          <p className="text-sm text-[#666666] mt-0.5">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {POS_METRICS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.key}
              data-testid={`pos-metric-${card.key}`}
              className="bg-white border border-[#E5E5E5] p-5 flex items-center gap-4"
            >
              <div className="w-10 h-10 flex items-center justify-center bg-[#F0F0F0]">
                <Icon size={20} weight="bold" style={{ color: card.color }} />
              </div>
              <div>
                <div className="text-xs font-medium text-[#666666] uppercase tracking-wide">{card.label}</div>
                <div className="text-xl font-bold text-[#0A0A0A] font-heading">{metrics[card.key] ?? 0}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E5E5E5] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E5E5E5] bg-[#F9FAFB]">
              {["Account", "Security", "Shares held", "Event type", "Entitlement", "Payment type", "Risk", "Status"].map((h) => (
                <th key={h} className="text-left py-3 px-4 text-[11px] font-medium text-[#666666] uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(positions || []).map((pos) => (
              <tr key={pos.id} data-testid={`position-row-${pos.id}`} className="border-b border-[#F0F0F0] data-row">
                <td className="py-3 px-4 font-mono-data font-medium text-[#002FA7]">{pos.account}</td>
                <td className="py-3 px-4">
                  <span className="font-medium text-[#0A0A0A]">{pos.security}</span>
                  <span className="ml-1.5 text-xs font-mono-data text-[#666666]">{pos.ticker}</span>
                </td>
                <td className="py-3 px-4 font-mono-data text-right">{pos.shares_held?.toLocaleString()}</td>
                <td className="py-3 px-4 text-[#0A0A0A]">{pos.event_type}</td>
                <td className="py-3 px-4 font-medium text-[#0A0A0A]">{pos.entitlement}</td>
                <td className="py-3 px-4">
                  <span className={`inline-block px-2 py-0.5 text-[11px] font-medium rounded-sm ${PAY_BADGE[pos.payment_type] || ""}`}>
                    {pos.payment_type}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-block px-2 py-0.5 text-[11px] font-bold rounded-sm ${RISK_BADGE[pos.risk] || ""}`}>
                    {pos.risk}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-block px-2 py-0.5 text-[11px] font-medium rounded-sm ${STATUS_BADGE[pos.status] || "badge-pending"}`}>
                    {pos.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
