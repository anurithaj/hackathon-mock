import { Briefcase, ArrowSquareOut } from "@phosphor-icons/react";

export default function Header({ onNewEvent }) {
  return (
    <header
      data-testid="main-header"
      className="bg-white border-b border-[#E5E5E5] sticky top-0 z-50"
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Briefcase size={20} weight="bold" className="text-[#002FA7]" />
          <div>
            <span className="text-xs font-medium text-[#666666] tracking-wide">
              Northern Trust &middot; CAP System
            </span>
            <h2
              data-testid="app-title"
              className="text-lg font-bold text-[#0A0A0A] tracking-tight font-heading leading-tight"
            >
              Corporate Actions Processing
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            data-testid="new-event-header-btn"
            onClick={onNewEvent}
            className="px-4 py-2 text-sm font-medium bg-white border border-[#E5E5E5] text-[#0A0A0A] hover:bg-[#F0F0F0] transition-colors"
          >
            + New Event
          </button>
          <button
            data-testid="how-it-works-btn"
            className="px-4 py-2 text-sm font-medium bg-[#002FA7] text-white hover:bg-[#001F7A] transition-colors flex items-center gap-1.5"
          >
            How it works
            <ArrowSquareOut size={14} weight="bold" />
          </button>
        </div>
      </div>
    </header>
  );
}
