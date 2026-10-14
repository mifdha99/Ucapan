import React, { useState } from "react";
import {
  Play,
  Pause,
  Sparkles,
  CloudRain,
  Volume2,
  Check,
  ChevronDown,
  ChevronUp,
  Settings,
  Flame,
  Clock,
  Compass,
  FileAudio,
} from "lucide-react";
import {
  INITIAL_SEGMENTS,
  ScriptSegment,
  VOICE_OPTIONS,
  GeneratedTake,
  VoiceOption,
} from "../data/presets";
import { WaveformPlayer } from "./WaveformPlayer";

interface SegmentDirectorProps {
  onTakeGenerated: (take: GeneratedTake) => void;
  onPlayAmbientForSegment: (active: boolean) => void;
  ambientActive: boolean;
}

export const SegmentDirector: React.FC<SegmentDirectorProps> = ({
  onTakeGenerated,
  onPlayAmbientForSegment,
  ambientActive,
}) => {
  const [segments, setSegments] = useState<ScriptSegment[]>(INITIAL_SEGMENTS);
  const [expandedId, setExpandedId] = useState<string>("seg-02");
  const [loadingSegmentId, setLoadingSegmentId] = useState<string | null>(null);
  const [segmentTakes, setSegmentTakes] = useState<
    Record<string, GeneratedTake>
  >({});
  const [activePlaybackTake, setActivePlaybackTake] =
    useState<GeneratedTake | null>(null);
  const [isBatchSynthesizing, setIsBatchSynthesizing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleUpdateSegment = (
    id: string,
    field: keyof ScriptSegment,
    value: unknown
  ) => {
    setSegments((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleSynthesizeSegment = async (segment: ScriptSegment) => {
    setLoadingSegmentId(segment.id);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/tts/single", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: segment.text,
          style: segment.style,
          voiceName: segment.voiceName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menghasilkan audio segmen.");
      }

      const audioUrl = `data:audio/wav;base64,${data.audioBase64}`;
      const take: GeneratedTake = {
        id: `take-seg-${segment.id}-${Date.now()}`,
        title: `${segment.indexLabel} · ${segment.title}`,
        mode: "segmen",
        voiceSummary: segment.voiceName,
        styleSummary: segment.style.slice(0, 60) + "...",
        textPreview: segment.text.slice(0, 100) + "...",
        audioUrl,
        audioBase64: data.audioBase64,
        durationSeconds: data.durationSeconds,
        sampleRate: data.sampleRate || 24000,
        createdAt: new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        ambientRain: segment.ambientRain,
      };

      setSegmentTakes((prev) => ({ ...prev, [segment.id]: take }));
      setActivePlaybackTake(take);
      onTakeGenerated(take);

      // If this segment has ambient rain flag and is the midnight scene, turn on rain!
      if (segment.ambientRain && !ambientActive) {
        onPlayAmbientForSegment(true);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Terjadi kesalahan saat memproses.";
      setErrorMessage(msg);
    } finally {
      setLoadingSegmentId(null);
    }
  };

  const handleSynthesizeAllSegments = async () => {
    setIsBatchSynthesizing(true);
    setErrorMessage(null);

    for (const segment of segments) {
      setLoadingSegmentId(segment.id);
      try {
        const res = await fetch("/api/tts/single", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: segment.text,
            style: segment.style,
            voiceName: segment.voiceName,
          }),
        });

        const data = await res.json();
        if (res.ok) {
          const audioUrl = `data:audio/wav;base64,${data.audioBase64}`;
          const take: GeneratedTake = {
            id: `take-seg-${segment.id}-${Date.now()}`,
            title: `${segment.indexLabel} · ${segment.title}`,
            mode: "segmen",
            voiceSummary: segment.voiceName,
            styleSummary: segment.style.slice(0, 60) + "...",
            textPreview: segment.text.slice(0, 100) + "...",
            audioUrl,
            audioBase64: data.audioBase64,
            durationSeconds: data.durationSeconds,
            sampleRate: data.sampleRate || 24000,
            createdAt: new Date().toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            ambientRain: segment.ambientRain,
          };
          setSegmentTakes((prev) => ({ ...prev, [segment.id]: take }));
          onTakeGenerated(take);
        }
      } catch (err) {
        console.error(err);
      }
    }

    setLoadingSegmentId(null);
    setIsBatchSynthesizing(false);
  };

  return (
    <div className="space-y-6">
      {/* Overview & Batch Actions */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold font-display text-slate-100">
              Segmen Sutradara (Multi-Scene Studio)
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <span>4 Babak Uji Vokal Terarah</span>
              <span aria-hidden="true">·</span>
              <span>Kustomisasi Persona per Babak</span>
              <span aria-hidden="true">·</span>
              <span>Integrasi Suasana Ambien Real-time</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSynthesizeAllSegments}
              disabled={isBatchSynthesizing || loadingSegmentId !== null}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {isBatchSynthesizing
                  ? "Mensintesis Semua Babak..."
                  : "Sintesis Seluruh 4 Babak"}
              </span>
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 bg-red-950/40 border border-red-800/80 rounded-lg text-xs text-red-300">
            {errorMessage}
          </div>
        )}
      </div>

      {/* Segments Accordion List */}
      <div className="space-y-4">
        {segments.map((seg) => {
          const isExpanded = expandedId === seg.id;
          const isCurrentLoading = loadingSegmentId === seg.id;
          const currentTake = segmentTakes[seg.id];

          return (
            <div
              key={seg.id}
              className={`bg-[#111827] border rounded-xl transition-all ${
                isExpanded ? "border-slate-700 shadow-md" : "border-slate-800/80"
              }`}
            >
              {/* Segment Card Header */}
              <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {seg.id === "seg-01" && (
                      <Compass className="w-4 h-4 text-amber-400" />
                    )}
                    {seg.id === "seg-02" && (
                      <CloudRain className="w-4 h-4 text-sky-400" />
                    )}
                    {seg.id === "seg-03" && (
                      <Clock className="w-4 h-4 text-emerald-400" />
                    )}
                    {seg.id === "seg-04" && (
                      <Flame className="w-4 h-4 text-orange-400" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-amber-400">
                        {seg.indexLabel}
                      </span>
                      <span className="text-xs text-slate-500">·</span>
                      <span className="text-xs text-slate-400">
                        {seg.category}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-slate-100 mt-0.5">
                      {seg.title}
                    </h3>
                  </div>
                </div>

                {/* Right Quick Controls */}
                <div className="flex items-center gap-2 self-start md:self-auto">
                  {/* Persona badge */}
                  <div className="text-xs text-slate-400 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-md">
                    <span>Suara: </span>
                    <span className="font-semibold text-slate-200">
                      {seg.voiceName}
                    </span>
                  </div>

                  {/* Play existing take if available */}
                  {currentTake && (
                    <button
                      type="button"
                      onClick={() => setActivePlaybackTake(currentTake)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/40 border border-emerald-800/80 rounded-lg hover:bg-emerald-900/40 transition-colors"
                      title="Putar hasil rekaman babak ini"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span className="font-mono tabular-nums">
                        {currentTake.durationSeconds}s
                      </span>
                    </button>
                  )}

                  {/* Synthesize Button */}
                  <button
                    type="button"
                    onClick={() => handleSynthesizeSegment(seg)}
                    disabled={isCurrentLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>
                      {isCurrentLoading ? "Mensintesis..." : "Sintesis Babak"}
                    </span>
                  </button>

                  {/* Expand Toggle */}
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? "" : seg.id)}
                    className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                    title={isExpanded ? "Tutup detail" : "Buka detail sutradara"}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Segment Expanded Editor */}
              {isExpanded && (
                <div className="px-4 sm:px-5 pb-5 pt-2 border-t border-slate-800/80 space-y-4">
                  {/* Notes & Highlights */}
                  <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg text-xs text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <p>{seg.notes}</p>
                    {seg.highlights && (
                      <div className="flex items-center gap-3 shrink-0">
                        {seg.highlights.map((h) => (
                          <div key={h.label} className="flex items-center gap-1">
                            <span className="text-slate-500">{h.label}:</span>
                            <span className="font-mono text-amber-300 font-semibold">
                              {h.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Text Script & Director Config */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Textarea */}
                    <div className="lg:col-span-2 space-y-1.5">
                      <label className="text-xs font-medium text-slate-300 block">
                        Teks Dialog / Monolog Babak
                      </label>
                      <textarea
                        rows={4}
                        value={seg.text}
                        onChange={(e) =>
                          handleUpdateSegment(seg.id, "text", e.target.value)
                        }
                        className="w-full px-3 py-2.5 bg-[#0B0F17] border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-amber-500/80 leading-relaxed font-sans"
                      />
                    </div>

                    {/* Voice & Style Direction */}
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-slate-300 block mb-1">
                          Pilih Persona Suara
                        </label>
                        <select
                          value={seg.voiceName}
                          onChange={(e) =>
                            handleUpdateSegment(
                              seg.id,
                              "voiceName",
                              e.target.value as VoiceOption["id"]
                            )
                          }
                          className="w-full px-3 py-2 bg-[#0B0F17] border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-hidden focus:border-amber-500"
                        >
                          {VOICE_OPTIONS.map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.name} — {v.timbre}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-slate-300 block mb-1">
                          Arahan Gaya Vokal (Speech Style)
                        </label>
                        <input
                          type="text"
                          value={seg.style}
                          onChange={(e) =>
                            handleUpdateSegment(seg.id, "style", e.target.value)
                          }
                          className="w-full px-3 py-2 bg-[#0B0F17] border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-hidden focus:border-amber-500"
                        />
                      </div>

                      {/* Ambient rain toggle for midnight scene */}
                      {seg.id === "seg-02" && (
                        <div className="pt-1 flex items-center justify-between text-xs">
                          <span className="text-slate-400">
                            Efek Hujan Malam Otomatis:
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateSegment(
                                seg.id,
                                "ambientRain",
                                !seg.ambientRain
                              )
                            }
                            className={`px-2.5 py-1 rounded border transition-colors ${
                              seg.ambientRain
                                ? "bg-sky-950/60 border-sky-600/60 text-sky-300"
                                : "bg-slate-900 border-slate-800 text-slate-500"
                            }`}
                          >
                            {seg.ambientRain ? "Aktif" : "Non-aktif"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating / Anchored Active Take Player */}
      {activePlaybackTake && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <FileAudio className="w-4 h-4 text-amber-400" />
              <span>Memutar: {activePlaybackTake.title}</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              Dibuat pukul {activePlaybackTake.createdAt}
            </span>
          </div>

          <WaveformPlayer
            audioUrl={activePlaybackTake.audioUrl}
            audioBase64={activePlaybackTake.audioBase64}
            title={activePlaybackTake.title}
            durationSeconds={activePlaybackTake.durationSeconds}
            sampleRate={activePlaybackTake.sampleRate}
            autoPlay={true}
          />
        </div>
      )}
    </div>
  );
};
