import React from "react";
import { Sparkles, CloudRain, Volume2, VolumeX } from "lucide-react";

interface TopBarProps {
  activeTab: "full" | "segments" | "dialogue" | "history";
  onTabChange: (tab: "full" | "segments" | "dialogue" | "history") => void;
  ambientActive: boolean;
  onToggleAmbient: () => void;
  takesCount: number;
  onQuickSynthesize: () => void;
  isSynthesizing: boolean;
  onOpenServerSettings: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onTabChange,
  ambientActive,
  onToggleAmbient,
  takesCount,
  onQuickSynthesize,
  isSynthesizing,
  onOpenServerSettings,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0B0F17]/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5">
        {/* Zone 1: Brand Wordmark (Single text element in display face) */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="text-lg font-bold tracking-tight text-slate-100 font-display whitespace-nowrap shrink-0 flex items-center gap-2"
          >
            <span className="w-2.5 h-2.5 rounded-xs bg-amber-500" />
            SuaraStudio
          </a>
        </div>

        {/* Zone 2: Navigation Links (Single-line, concise) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-400">
          <button
            type="button"
            onClick={() => onTabChange("full")}
            className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
              activeTab === "full"
                ? "text-amber-400 border-amber-400 font-semibold"
                : "border-transparent hover:text-slate-200"
            }`}
          >
            Naskah Utuh
          </button>

          <button
            type="button"
            onClick={() => onTabChange("segments")}
            className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
              activeTab === "segments"
                ? "text-amber-400 border-amber-400 font-semibold"
                : "border-transparent hover:text-slate-200"
            }`}
          >
            Segmen Sutradara
          </button>

          <button
            type="button"
            onClick={() => onTabChange("dialogue")}
            className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
              activeTab === "dialogue"
                ? "text-amber-400 border-amber-400 font-semibold"
                : "border-transparent hover:text-slate-200"
            }`}
          >
            Dialog Multi-Suara
          </button>

          <button
            type="button"
            onClick={() => onTabChange("history")}
            className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 flex items-center gap-1.5 ${
              activeTab === "history"
                ? "text-amber-400 border-amber-400 font-semibold"
                : "border-transparent hover:text-slate-200"
            }`}
          >
            <span>Riwayat Take</span>
            <span className="text-xs font-mono tabular-nums text-slate-500">
              ({takesCount})
            </span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action & Ambience Toggle */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Server Settings button */}
          <button
            type="button"
            onClick={onOpenServerSettings}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
            title="Pengaturan Server Backend AI"
          >
            <span className="sr-only">Pengaturan Server</span>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="8" x="2" y="2" rx="2" ry="2"/>
              <rect width="20" height="8" x="2" y="14" rx="2" ry="2"/>
              <line x1="6" x2="6.01" y1="6" y2="6"/>
              <line x1="6" x2="6.01" y1="18" y2="18"/>
            </svg>
          </button>

          {/* Ambient Rain & Distant Thunder soundscape button */}
          <button
            type="button"
            onClick={onToggleAmbient}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all whitespace-nowrap shrink-0 ${
              ambientActive
                ? "bg-sky-950/70 border-sky-600/70 text-sky-200 shadow-sm"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
            }`}
            title="Nyalakan efek suara hujan malam & petir kejauhan (Babak 02)"
          >
            <CloudRain className={`w-3.5 h-3.5 ${ambientActive ? "text-sky-400" : ""}`} />
            <span className="hidden sm:inline">Suasana Hujan Malam</span>
            {ambientActive ? (
              <Volume2 className="w-3 h-3 text-sky-400" />
            ) : (
              <VolumeX className="w-3 h-3 text-slate-500" />
            )}
          </button>

          <button
            type="button"
            onClick={onQuickSynthesize}
            disabled={isSynthesizing}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isSynthesizing ? "Memproses..." : "Sintesis Naskah"}</span>
          </button>
        </div>
      </div>

      {/* Mobile Tab Row */}
      <div className="flex md:hidden items-center justify-between px-4 py-2 border-t border-slate-800/80 bg-slate-950/60 overflow-x-auto text-xs font-medium">
        <button
          type="button"
          onClick={() => onTabChange("full")}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${
            activeTab === "full" ? "bg-slate-800 text-amber-300" : "text-slate-400"
          }`}
        >
          Naskah Utuh
        </button>
        <button
          type="button"
          onClick={() => onTabChange("segments")}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${
            activeTab === "segments" ? "bg-slate-800 text-amber-300" : "text-slate-400"
          }`}
        >
          Segmen
        </button>
        <button
          type="button"
          onClick={() => onTabChange("dialogue")}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${
            activeTab === "dialogue" ? "bg-slate-800 text-amber-300" : "text-slate-400"
          }`}
        >
          Dialog 2 Suara
        </button>
        <button
          type="button"
          onClick={() => onTabChange("history")}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${
            activeTab === "history" ? "bg-slate-800 text-amber-300" : "text-slate-400"
          }`}
        >
          Take ({takesCount})
        </button>
      </div>
    </header>
  );
};
