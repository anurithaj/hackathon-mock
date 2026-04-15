import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowSquareOut, CheckCircle } from "@phosphor-icons/react";

const FILTERS = [
  { key: "", label: "All" },
  { key: "pending", label: "Pending election" },
  { key: "elected", label: "Elected" },
  { key: "mandatory", label: "Mandatory" },
];

export default function EntitlementsTab({ data: initialData, loading, onFilter, onElect, onSubmitAll, getFiltered }) {
  const [activeFilter, setActiveFilter] = useState("");
  const [filteredData, setFilteredData] = useState(null);
  const data = filteredData || initialData;
  const { entitlements, total } = data;

  const handleFilter = (key) => {
    setActiveFilter(key);
    if (getFiltered) {
      setFilteredData(getFiltered(key));
    }
  };

  if (loading) {
    return (
      <div data-testid="entitlements-loading" className="space-y-3">
        {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-white border border-[#E5E5E5] animate-pulse" />)}
      </div>
    );
  }

  return (
    <div data-testid="entitlements-tab" className="space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-[#0A0A0A] font-heading">Client entitlement elections</h3>
          <p className="text-sm text-[#666666] mt-0.5">{total} entitlements</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-[#E5E5E5] text-[#0A0A0A] hover:bg-[#F0F0F0] text-sm">
            Learn more <ArrowSquareOut size={14} className="ml-1" />
          </Button>
          <Button
            data-testid="submit-all-elections-btn"
            onClick={onSubmitAll}
            className="bg-[#002FA7] text-white hover:bg-[#001F7A] text-sm"
          >
            Submit all elections
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div data-testid="entitlement-filters" className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            data-testid={`filter-${f.key || "all"}`}
            onClick={() => handleFilter(f.key)}
            className={`px-4 py-2 text-sm font-medium border transition-colors ${
              activeFilter === f.key
                ? "bg-[#002FA7] text-white border-[#002FA7]"
                : "bg-white text-[#0A0A0A] border-[#E5E5E5] hover:bg-[#F0F0F0]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Entitlement List */}
      <div data-testid="entitlement-list" className="space-y-3">
        {entitlements.map((ent) => (
          <div
            key={ent.id}
            data-testid={`entitlement-row-${ent.id}`}
            className="bg-white border border-[#E5E5E5] p-5"
          >
            {/* Header row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="font-medium text-[#0A0A0A] text-sm">{ent.security}</span>
                <span className="font-mono-data text-xs text-[#666666]">{ent.ticker}</span>
                <span className={`inline-block px-2 py-0.5 text-[11px] font-medium rounded-sm ${ent.mandatory ? "badge-mandatory" : "badge-voluntary"}`}>
                  {ent.mandatory ? "Mandatory" : "Voluntary"}
                </span>
                <span
                  className="inline-block px-2 py-0.5 text-[11px] font-medium rounded-sm"
                  style={{ background: "#F3F4F6", color: "#374151" }}
                >
                  {ent.event_type}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#666666]">
                {ent.status === "Elected" && (
                  <span className="inline-flex items-center gap-1 text-[#046A38] font-medium">
                    <CheckCircle size={14} weight="fill" /> Elected: {ent.elected_option}
                  </span>
                )}
                {ent.status === "Pending election" && (
                  <span className="text-[#F5A623] font-medium">
                    Deadline: {ent.deadline}
                  </span>
                )}
                {ent.status === "Auto-processed" && (
                  <span className="text-[#666666] font-medium">Auto-processed</span>
                )}
              </div>
            </div>

            {/* Accounts */}
            <div className="mb-3 text-xs text-[#666666]">
              Accounts: {ent.accounts.map((a) => (
                <span key={a} className="inline-block font-mono-data bg-[#F0F0F0] px-1.5 py-0.5 mr-1 rounded-sm">{a}</span>
              ))}
            </div>

            {/* Election Options (Voluntary only) */}
            {!ent.mandatory && ent.election_options.length > 0 && (
              <div className="flex gap-2">
                {ent.election_options.map((opt) => (
                  <button
                    key={opt}
                    data-testid={`elect-${ent.id}-${opt.toLowerCase().replace(/\s/g, "-")}`}
                    onClick={() => onElect(ent.id, opt)}
                    className={`election-btn px-4 py-2 text-xs font-medium border transition-all ${
                      ent.elected_option === opt
                        ? "selected"
                        : "bg-white text-[#0A0A0A] border-[#E5E5E5] hover:border-[#002FA7] hover:text-[#002FA7]"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {/* Mandatory - Progress */}
            {ent.mandatory && (
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="flex-1 h-1.5 bg-[#E5E5E5] rounded-full overflow-hidden">
                    <div className="h-full bg-[#046A38] rounded-full" style={{ width: "100%" }} />
                  </div>
                  <span className="text-[11px] font-medium text-[#046A38]">100%</span>
                </div>
                <p className="text-[11px] text-[#666666]">
                  Mandatory action - will be auto-processed by the system on record date.
                </p>
              </div>
            )}
          </div>
        ))}
        {entitlements.length === 0 && (
          <div className="bg-white border border-[#E5E5E5] p-12 text-center text-[#666666] text-sm">
            No entitlements match the current filter.
          </div>
        )}
      </div>
    </div>
  );
}
