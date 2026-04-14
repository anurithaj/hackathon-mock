import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Loader2, Send } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const ACTION_TYPES = ["Dividend", "Stock Split", "Merger", "Rights Issue"];

export default function ActionForm({ open, onOpenChange, onSubmit }) {
  const [ticker, setTicker] = useState("");
  const [actionType, setActionType] = useState("");
  const [exDate, setExDate] = useState(null);
  const [announcement, setAnnouncement] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const resetForm = () => {
    setTicker("");
    setActionType("");
    setExDate(null);
    setAnnouncement("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ticker || !actionType || !exDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ticker: ticker.toUpperCase(),
        action_type: actionType,
        ex_date: format(exDate, "yyyy-MM-dd"),
        announcement,
      };
      await onSubmit(payload);
      toast.success(`${ticker.toUpperCase()} action created`, {
        description: `${actionType} added with Pending status.`,
      });
      resetForm();
      onOpenChange(false);
    } catch (err) {
      toast.error("Failed to create action", {
        description: err?.response?.data?.detail || "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        data-testid="action-processor-panel"
        className="w-full sm:max-w-[450px] bg-[#0f172a] border-l border-slate-800 overflow-y-auto"
        side="right"
      >
        <SheetHeader className="mb-6">
          <SheetTitle
            data-testid="action-form-title"
            className="text-xl font-semibold text-slate-100"
            style={{ fontFamily: "'Work Sans', sans-serif" }}
          >
            New Corporate Action
          </SheetTitle>
          <SheetDescription className="text-sm text-slate-400">
            Submit a new action. Company name will be auto-filled via Alpha
            Vantage.
          </SheetDescription>
        </SheetHeader>

        <form
          data-testid="action-processor-form"
          onSubmit={handleSubmit}
          className="flex flex-col gap-5"
        >
          {/* Ticker */}
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="ticker"
              className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400"
            >
              Ticker Symbol *
            </Label>
            <Input
              id="ticker"
              data-testid="ticker-input"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              placeholder="e.g. AAPL"
              className="bg-slate-900 border-slate-700 text-slate-200 placeholder-slate-500 focus:ring-indigo-500 focus:border-indigo-500 font-mono-data"
              maxLength={10}
            />
          </div>

          {/* Action Type */}
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="action-type"
              className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400"
            >
              Action Type *
            </Label>
            <Select
              value={actionType}
              onValueChange={setActionType}
            >
              <SelectTrigger
                data-testid="action-type-select"
                className="bg-slate-900 border-slate-700 text-slate-200 focus:ring-indigo-500"
              >
                <SelectValue placeholder="Select action type" />
              </SelectTrigger>
              <SelectContent className="bg-[#1e293b] border-slate-700">
                {ACTION_TYPES.map((type) => (
                  <SelectItem
                    key={type}
                    value={type}
                    data-testid={`action-type-option-${type.toLowerCase().replace(" ", "-")}`}
                    className="text-slate-200 focus:bg-slate-800 focus:text-white"
                  >
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ex-Date with Calendar */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">
              Ex-Date *
            </Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  data-testid="ex-date-picker"
                  variant="outline"
                  className={`justify-start text-left font-normal bg-slate-900 border-slate-700 hover:bg-slate-800 ${
                    exDate ? "text-slate-200" : "text-slate-500"
                  }`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                  {exDate ? format(exDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 bg-[#1e293b] border-slate-700"
                align="start"
              >
                <Calendar
                  data-testid="ex-date-calendar"
                  mode="single"
                  selected={exDate}
                  onSelect={(date) => {
                    setExDate(date);
                    setCalendarOpen(false);
                  }}
                  className="text-slate-200"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Announcement */}
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="announcement"
              className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400"
            >
              Announcement Text
            </Label>
            <Textarea
              id="announcement"
              data-testid="announcement-textarea"
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              placeholder="Brief description of the corporate action..."
              rows={3}
              className="bg-slate-900 border-slate-700 text-slate-200 placeholder-slate-500 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Submit */}
          <Button
            data-testid="submit-action-btn"
            type="submit"
            disabled={submitting}
            className="mt-2 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-md px-4 py-2.5 transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enriching & Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Action
              </>
            )}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
