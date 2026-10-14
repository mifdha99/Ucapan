import React, { useState } from "react";
import {
  History,
  Play,
  Download,
  Trash2,
  FolderOpen,
  Filter,
} from "lucide-react";
import { GeneratedTake } from "../data/presets";

interface TakesHistoryProps {
  takes: GeneratedTake[];
  activeTake: GeneratedTake | null;
  onSelectTake: (take: GeneratedTake) => void;
  onDeleteTake: (id: string) => void;
  onClearAll: () => void;
  onGoToStudio: () => void;
}

export const TakesHistory: React.FC<TakesHistoryProps> = ({
  takes,
  activeTake,
  onSelectTake,
  onDeleteTake,
  onClearAll,
  onGoToStudio,
}) => {
  const [filterMode, setFilterMode] = useState<
    "all" | "utuh" | "segmen" | "dialog"
  >("all");

  const filteredTakes =
    filterMode === "all"
      ? takes
      : takes.filter((t) => t.mode === filterMode);

  return (
    <div className="space-y-6">
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold font-display text-slate-100 flex items-center gap-2">
              <History className="w-5 h-5 text-amber-400" />
              <span>Riwayat Take & Pustaka Audio</span>
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <span className="font-mono tabular-nums">
                {takes.length} rekaman tersimpan di sesi ini
              </span>
              <span aria-hidden="true">·</span>
              <span>Format Master 24kHz WAV</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {takes.length > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-300 bg-red-950/40 hover:bg-red-900/40 border border-red-800/60 rounded-lg transition-colors whitespace-nowrap"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Bersihkan Riwayat</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 pt-4">
          <span className="text-xs text-slate-500 flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" />
            <span>Filter:</span>
          </span>
          <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800/80">
            <button
              type="button"
              onClick={() => setFilterMode("all")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                filterMode === "all"
                  ? "bg-slate-800 text-amber-300 shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Semua ({takes.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("utuh")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                filterMode === "utuh"
                  ? "bg-slate-800 text-amber-300 shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Naskah Utuh
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("segmen")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                filterMode === "segmen"
                  ? "bg-slate-800 text-amber-300 shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Segmen Babak
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("dialog")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                filterMode === "dialog"
                  ? "bg-slate-800 text-amber-300 shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Dialog 2 Suara
            </button>
          </div>
        </div>
      </div>

      {/* List or Empty State */}
      {filteredTakes.length === 0 ? (
        <div className="bg-[#111827] border border-slate-800/80 rounded-xl p-10 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-900 flex items-center justify-center text-slate-500">
            <FolderOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-200">
            Belum ada rekaman suara
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Mulai dengan melakukan sintesis pada naskah utuh atau segmen
            sutradara di atas untuk menguji model Gemini 3.8 Flash TTS.
          </p>
          <button
            type="button"
            onClick={onGoToStudio}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
          >
            Mulai Sintesis Sekarang
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTakes.map((take) => {
            const isActive = activeTake?.id === take.id;

            return (
              <div
                key={take.id}
                className={`bg-[#111827] border rounded-xl p-4 sm:p-5 transition-all ${
                  isActive
                    ? "border-amber-500/80 bg-amber-950/10 shadow-sm"
                    : "border-slate-800/80 hover:border-slate-700"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-amber-400">
                        {take.mode === "utuh"
                          ? "Naskah Utuh"
                          : take.mode === "dialog"
                          ? "Dialog 2 Suara"
                          : "Segmen Babak"}
                      </span>
                      <span className="text-xs text-slate-500">·</span>
                      <span className="text-xs font-mono text-slate-400">
                        {take.voiceSummary}
                      </span>
                      <span className="text-xs text-slate-500">·</span>
                      <span className="text-xs font-mono tabular-nums text-slate-400">
                        {take.durationSeconds} detik
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-slate-100 mt-1">
                      {take.title}
                    </h4>

                    <p className="text-xs text-slate-400 mt-1 line-clamp-1 italic font-sans">
                      “{take.textPreview}”
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => onSelectTake(take)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        isActive
                          ? "bg-amber-400 text-slate-950 font-semibold"
                          : "bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700/80"
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isActive ? "Sedang Diputar" : "Putar Take"}</span>
                    </button>

                    <a
                      href={take.audioUrl}
                      download={`take-${take.id}.wav`}
                      className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
                      title="Unduh berkas WAV"
                    >
                      <Download className="w-4 h-4" />
                    </a>

                    <button
                      type="button"
                      onClick={() => onDeleteTake(take.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
                      title="Hapus rekaman"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
