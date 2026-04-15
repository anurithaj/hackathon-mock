import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  MagnifyingGlass,
  CaretLeft,
  CaretRight,
  Eye,
  Play,
  Plus,
} from "@phosphor-icons/react";
import { toast } from "sonner";

const EVENT_TYPES = ["Dividend", "Stock Split", "Merger", "Rights Issue", "Tender Offer"];
const STATUSES = ["Announced", "Pending", "Validated", "Instructed", "Settled"];

const STATUS_BADGE = {
  Pending: "badge-pending",
  Announced: "badge-announced",
  Validated: "badge-validated",
  Instructed: "badge-instructed",
  Settled: "badge-settled",
};

const TYPE_COLORS = {
  Dividend: "#7C3AED",
  "Stock Split": "#2563EB",
  Merger: "#DB2777",
  "Rights Issue": "#D97706",
  "Tender Offer": "#4F46E5",
};

export default function EventQueueTab({ data: initialData, loading, onSearch, onCreate, onProcess, getFiltered }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [filteredData, setFilteredData] = useState(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({
    security: "", isin: "", event_type: "", mandatory: true,
    record_date: "", pay_date: "", distribution: "", notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const data = filteredData || initialData;

  const doSearch = (params = {}) => {
    if (getFiltered) {
      const result = getFiltered({
        search: params.search ?? search,
        event_type: params.event_type ?? typeFilter,
        status: params.status ?? statusFilter,
        page: params.page ?? 1,
      });
      setFilteredData(result);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.security || !formData.event_type || !formData.record_date || !formData.pay_date) {
      toast.error("Please fill required fields");
      return;
    }
    setSubmitting(true);
    try {
      onCreate(formData);
      setFormData({ security: "", isin: "", event_type: "", mandatory: true, record_date: "", pay_date: "", distribution: "", notes: "" });
      setShowNewModal(false);
      setFilteredData(null);
    } catch (err) {
      toast.error("Failed to create event");
    } finally {
      setSubmitting(false);
    }
  };

  const handleProcess = async (eventId) => {
    try {
      await onProcess(eventId);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to process");
    }
  };

  const { events: rows, total, page, total_pages } = data;

  return (
    <div data-testid="event-queue-tab" className="space-y-4 animate-fadeIn">
      {/* Toolbar */}
      <div className="bg-white border border-[#E5E5E5] p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]" />
          <Input
            data-testid="event-search-input"
            value={search}
            onChange={(e) => { setSearch(e.target.value); }}
            onKeyDown={(e) => e.key === "Enter" && doSearch()}
            placeholder="Search by security, ISIN, or event ID..."
            className="pl-9 bg-white border-[#E5E5E5] text-sm"
          />
        </div>
        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v === "all" ? "" : v); doSearch({ event_type: v === "all" ? "" : v }); }}>
          <SelectTrigger data-testid="event-type-filter" className="w-[160px] bg-white border-[#E5E5E5] text-sm">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent className="bg-white border-[#E5E5E5]">
            <SelectItem value="all">All types</SelectItem>
            {EVENT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === "all" ? "" : v); doSearch({ status: v === "all" ? "" : v }); }}>
          <SelectTrigger data-testid="event-status-filter" className="w-[160px] bg-white border-[#E5E5E5] text-sm">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent className="bg-white border-[#E5E5E5]">
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button
          data-testid="search-btn"
          onClick={() => doSearch()}
          className="bg-[#002FA7] text-white hover:bg-[#001F7A] text-sm"
        >
          <MagnifyingGlass size={14} weight="bold" /> Search
        </Button>
        <Button
          data-testid="create-event-button"
          onClick={() => setShowNewModal(true)}
          className="bg-white border border-[#E5E5E5] text-[#0A0A0A] hover:bg-[#F0F0F0] text-sm"
          variant="outline"
        >
          <Plus size={14} weight="bold" /> New Event
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E5E5E5] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E5E5E5] bg-[#F9FAFB]">
              {["Event ID", "Security", "ISIN", "Type", "Distribution", "Record Date", "Pay Date", "Status", "Action"].map((h) => (
                <th key={h} className="text-left py-3 px-4 text-[11px] font-medium text-[#666666] uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((evt) => (
              <tr key={evt.id} data-testid={`event-row-${evt.id}`} className="border-b border-[#F0F0F0] data-row">
                <td className="py-3 px-4 font-mono-data font-medium text-[#002FA7]">{evt.id}</td>
                <td className="py-3 px-4">
                  <span className="font-medium text-[#0A0A0A]">{evt.security}</span>
                </td>
                <td className="py-3 px-4 font-mono-data text-[#666666]">{evt.isin}</td>
                <td className="py-3 px-4">
                  <span
                    className="inline-block px-2 py-0.5 text-[11px] font-medium rounded-sm"
                    style={{ background: `${TYPE_COLORS[evt.event_type]}15`, color: TYPE_COLORS[evt.event_type] }}
                  >
                    {evt.event_type}
                  </span>
                </td>
                <td className="py-3 px-4 text-[#0A0A0A]">{evt.distribution}</td>
                <td className="py-3 px-4 font-mono-data">{evt.record_date}</td>
                <td className="py-3 px-4 font-mono-data">{evt.pay_date}</td>
                <td className="py-3 px-4">
                  <span className={`inline-block px-2 py-0.5 text-[11px] font-medium rounded-sm ${STATUS_BADGE[evt.status] || "badge-pending"}`}>
                    {evt.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-1.5">
                    <button
                      data-testid={`view-event-${evt.id}`}
                      onClick={() => { setSelectedEvent(evt); setShowDetailModal(true); }}
                      className="px-2.5 py-1 text-xs font-medium border border-[#E5E5E5] text-[#0A0A0A] hover:bg-[#F0F0F0] transition-colors inline-flex items-center gap-1"
                    >
                      <Eye size={12} /> View
                    </button>
                    {evt.status !== "Settled" && (
                      <button
                        data-testid={`process-event-${evt.id}`}
                        onClick={() => handleProcess(evt.id)}
                        className="px-2.5 py-1 text-xs font-medium border border-[#002FA7] text-[#002FA7] hover:bg-[#002FA7] hover:text-white transition-colors inline-flex items-center gap-1"
                      >
                        <Play size={12} weight="fill" /> Process
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="py-12 text-center text-[#666666]">No events found</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div data-testid="event-pagination" className="flex items-center justify-between px-4 py-3 border-t border-[#E5E5E5] bg-[#F9FAFB]">
          <span className="text-xs text-[#666666]">
            Showing {rows.length} of {total} events &middot; Page {page} of {total_pages}
          </span>
          <div className="flex gap-2">
            <button
              data-testid="prev-page-btn"
              onClick={() => doSearch({ page: Math.max(1, page - 1) })}
              disabled={page <= 1}
              className="px-3 py-1.5 text-xs font-medium border border-[#E5E5E5] text-[#0A0A0A] hover:bg-[#F0F0F0] disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1"
            >
              <CaretLeft size={12} /> Prev
            </button>
            <button
              data-testid="next-page-btn"
              onClick={() => doSearch({ page: Math.min(total_pages, page + 1) })}
              disabled={page >= total_pages}
              className="px-3 py-1.5 text-xs font-medium border border-[#E5E5E5] text-[#0A0A0A] hover:bg-[#F0F0F0] disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1"
            >
              Next <CaretRight size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* New Event Modal */}
      <Dialog open={showNewModal} onOpenChange={setShowNewModal}>
        <DialogContent data-testid="new-event-modal" className="bg-white border-[#E5E5E5] max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading font-bold text-[#0A0A0A]">Create new event</DialogTitle>
            <DialogDescription className="text-sm text-[#666666]">Add a corporate action event to the queue.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium text-[#666666] uppercase tracking-wide">Security / ISIN *</Label>
                <Input data-testid="new-event-security" value={formData.security} onChange={(e) => setFormData({ ...formData, security: e.target.value })} placeholder="e.g. Apple Inc." className="mt-1 bg-white border-[#E5E5E5]" />
              </div>
              <div>
                <Label className="text-xs font-medium text-[#666666] uppercase tracking-wide">ISIN</Label>
                <Input data-testid="new-event-isin" value={formData.isin} onChange={(e) => setFormData({ ...formData, isin: e.target.value })} placeholder="e.g. US0378331005" className="mt-1 bg-white border-[#E5E5E5] font-mono-data" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium text-[#666666] uppercase tracking-wide">Event type *</Label>
                <Select value={formData.event_type} onValueChange={(v) => setFormData({ ...formData, event_type: v })}>
                  <SelectTrigger data-testid="new-event-type" className="mt-1 bg-white border-[#E5E5E5]">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#E5E5E5]">
                    {EVENT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-medium text-[#666666] uppercase tracking-wide">Mandatory / Voluntary</Label>
                <Select value={formData.mandatory ? "mandatory" : "voluntary"} onValueChange={(v) => setFormData({ ...formData, mandatory: v === "mandatory" })}>
                  <SelectTrigger data-testid="new-event-mandatory" className="mt-1 bg-white border-[#E5E5E5]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#E5E5E5]">
                    <SelectItem value="mandatory">Mandatory</SelectItem>
                    <SelectItem value="voluntary">Voluntary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium text-[#666666] uppercase tracking-wide">Record date *</Label>
                <Input data-testid="new-event-record-date" type="date" value={formData.record_date} onChange={(e) => setFormData({ ...formData, record_date: e.target.value })} className="mt-1 bg-white border-[#E5E5E5]" />
              </div>
              <div>
                <Label className="text-xs font-medium text-[#666666] uppercase tracking-wide">Pay date *</Label>
                <Input data-testid="new-event-pay-date" type="date" value={formData.pay_date} onChange={(e) => setFormData({ ...formData, pay_date: e.target.value })} className="mt-1 bg-white border-[#E5E5E5]" />
              </div>
            </div>
            <div>
              <Label className="text-xs font-medium text-[#666666] uppercase tracking-wide">Distribution</Label>
              <Input data-testid="new-event-distribution" value={formData.distribution} onChange={(e) => setFormData({ ...formData, distribution: e.target.value })} placeholder="e.g. $0.25 / share" className="mt-1 bg-white border-[#E5E5E5]" />
            </div>
            <div>
              <Label className="text-xs font-medium text-[#666666] uppercase tracking-wide">Notes</Label>
              <Textarea data-testid="new-event-notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} placeholder="Additional context..." className="mt-1 bg-white border-[#E5E5E5] resize-none" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowNewModal(false)} className="border-[#E5E5E5] text-[#0A0A0A] hover:bg-[#F0F0F0] text-sm">Cancel</Button>
              <Button data-testid="submit-new-event" type="submit" disabled={submitting} className="bg-[#002FA7] text-white hover:bg-[#001F7A] text-sm">
                {submitting ? "Creating..." : "Create event"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Event Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent data-testid="event-detail-modal" className="bg-white border-[#E5E5E5] max-w-lg">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading font-bold text-[#0A0A0A]">
                  {selectedEvent.id} &middot; {selectedEvent.security}
                </DialogTitle>
                <DialogDescription className="text-sm text-[#666666]">
                  Event details and processing options
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 mt-2 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div><span className="text-[#666666]">Type:</span> <span className="font-medium">{selectedEvent.event_type}</span></div>
                  <div><span className="text-[#666666]">Status:</span> <span className={`inline-block px-2 py-0.5 text-[11px] font-medium rounded-sm ${STATUS_BADGE[selectedEvent.status] || "badge-pending"}`}>{selectedEvent.status}</span></div>
                  <div><span className="text-[#666666]">ISIN:</span> <span className="font-mono-data">{selectedEvent.isin}</span></div>
                  <div><span className="text-[#666666]">Distribution:</span> <span className="font-medium">{selectedEvent.distribution}</span></div>
                  <div><span className="text-[#666666]">Record Date:</span> <span className="font-mono-data">{selectedEvent.record_date}</span></div>
                  <div><span className="text-[#666666]">Pay Date:</span> <span className="font-mono-data">{selectedEvent.pay_date}</span></div>
                </div>
                {selectedEvent.notes && (
                  <div className="border-t border-[#E5E5E5] pt-3">
                    <span className="text-[#666666]">Notes:</span>
                    <p className="mt-1 text-[#0A0A0A]">{selectedEvent.notes}</p>
                  </div>
                )}
                <div className="flex gap-2 pt-3">
                  <Button variant="outline" className="border-[#E5E5E5] text-[#0A0A0A] hover:bg-[#F0F0F0] text-sm flex-1">
                    Processing guide
                  </Button>
                  {selectedEvent.status !== "Settled" && (
                    <Button
                      data-testid={`detail-process-${selectedEvent.id}`}
                      onClick={() => { handleProcess(selectedEvent.id); setShowDetailModal(false); }}
                      className="bg-[#002FA7] text-white hover:bg-[#001F7A] text-sm flex-1"
                    >
                      Process event
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
