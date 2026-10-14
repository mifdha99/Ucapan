import React, { useState, useEffect, useRef } from "react";
import { TopBar } from "./components/TopBar";
import { FullScriptStudio } from "./components/FullScriptStudio";
import { SegmentDirector } from "./components/SegmentDirector";
import { DialogueStudio } from "./components/DialogueStudio";
import { TakesHistory } from "./components/TakesHistory";
import { WaveformPlayer } from "./components/WaveformPlayer";
import { MidnightRainAtmosphere } from "./utils/ambientAudio";
import {
  GeneratedTake,
  FULL_USER_SCRIPT,
  FULL_SCRIPT_DEFAULT_STYLE,
} from "./data/presets";
import {
  CloudRain,
  Zap,
  Volume2,
  Sparkles,
  Radio,
  SlidersHorizontal,
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<
    "full" | "segments" | "dialogue" | "history"
  >("full");
  const [takes, setTakes] = useState<GeneratedTake[]>([]);
  const [activeTake, setActiveTake] = useState<GeneratedTake | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  // Procedural Web Audio Ambient Rain & Distant Thunder
  const atmosphereRef = useRef<MidnightRainAtmosphere | null>(null);
  const [ambientActive, setAmbientActive] = useState(false);
  const [ambientVolume, setAmbientVolume] = useState(0.24);

  useEffect(() => {
    atmosphereRef.current = new MidnightRainAtmosphere();
    return () => {
      atmosphereRef.current?.stop();
    };
  }, []);

  const toggleAmbientSoundscape = () => {
    if (!atmosphereRef.current) return;
    if (ambientActive) {
      atmosphereRef.current.stop();
      setAmbientActive(false);
    } else {
      atmosphereRef.current.start(ambientVolume);
      setAmbientActive(true);
    }
  };

  const handleAmbientVolumeChange = (newVol: number) => {
    setAmbientVolume(newVol);
    if (atmosphereRef.current) {
      atmosphereRef.current.setVolume(newVol);
    }
  };

  const handleTriggerThunder = () => {
    if (atmosphereRef.current) {
      if (!ambientActive) {
        atmosphereRef.current.start(ambientVolume);
        setAmbientActive(true);
      }
      atmosphereRef.current.triggerDistantThunder();
    }
  };

  const handleTakeGenerated = (take: GeneratedTake) => {
    setTakes((prev) => [take, ...prev]);
    setActiveTake(take);
  };

  const handleQuickSynthesize = async () => {
    if (isSynthesizing) return;
    setIsSynthesizing(true);

    try {
      const res = await fetch("/api/tts/single", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: FULL_USER_SCRIPT,
          style: FULL_SCRIPT_DEFAULT_STYLE,
          voiceName: "Kore",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        const audioUrl = `data:audio/wav;base64,${data.audioBase64}`;
        const take: GeneratedTake = {
          id: `take-quick-${Date.now()}`,
          title: "Sintesis Cepat — Naskah Utuh",
          mode: "utuh",
          voiceSummary: "Kore",
          styleSummary: FULL_SCRIPT_DEFAULT_STYLE.slice(0, 60) + "...",
          textPreview: FULL_USER_SCRIPT.slice(0, 100) + "...",
          audioUrl,
          audioBase64: data.audioBase64,
          durationSeconds: data.durationSeconds,
          sampleRate: data.sampleRate || 24000,
          createdAt: new Date().toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          ambientRain: false,
        };
        handleTakeGenerated(take);
        setActiveTab("full");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleDeleteTake = (id: string) => {
    setTakes((prev) => prev.filter((t) => t.id !== id));
    if (activeTake?.id === id) {
      setActiveTake(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col font-sans">
      {/* Strict One-Row Three-Zone Top Bar */}
      <TopBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        ambientActive={ambientActive}
        onToggleAmbient={toggleAmbientSoundscape}
        takesCount={takes.length}
        onQuickSynthesize={handleQuickSynthesize}
        isSynthesizing={isSynthesizing}
      />

      {/* Hero Studio Banner */}
      <section className="border-b border-slate-800/80 bg-linear-to-b from-slate-900/60 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-2xl space-y-2">
              <div className="flex items-center gap-2 text-xs text-amber-400 font-medium">
                <span>Google Gemini 3.8 Flash TTS</span>
                <span aria-hidden="true">·</span>
                <span>Studio Desain Suara & Sutradara Audio</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-100 tracking-tight text-balance">
                Sintesis Suara Alami, Karismatik & Ekspresif Berbahasa Indonesia
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Dioptimalkan untuk transisi emosional yang halus: sapaan hangat,
                monolog malam yang tenang, artikulasi nominal mata uang dan kode
                alfanumerik, hingga penutup penuh visi yang menggetarkan.
              </p>
            </div>

            {/* Atmosphere Dock (Rain & Thunder Soundscape) */}
            <div className="p-4 bg-[#111827] border border-slate-800 rounded-xl space-y-3 shrink-0 lg:w-80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CloudRain className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-semibold text-slate-200">
                    Ambien Hujan & Petir
                  </span>
                </div>
                <button
                  type="button"
                  onClick={toggleAmbientSoundscape}
                  className={`text-xs px-2.5 py-1 rounded-md font-medium border transition-colors ${
                    ambientActive
                      ? "bg-sky-950/70 border-sky-600/70 text-sky-300"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {ambientActive ? "Menyala" : "Mati"}
                </button>
              </div>

              <div className="flex items-center gap-3">
                <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                <input
                  type="range"
                  min={0.05}
                  max={0.5}
                  step={0.02}
                  value={ambientVolume}
                  onChange={(e) =>
                    handleAmbientVolumeChange(parseFloat(e.target.value))
                  }
                  className="w-full h-1 bg-slate-800 rounded appearance-none accent-sky-400 cursor-pointer"
                />
                <span className="text-xs font-mono tabular-nums text-slate-500 w-8">
                  {Math.round(ambientVolume * 100)}%
                </span>
              </div>

              <button
                type="button"
                onClick={handleTriggerThunder}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-amber-300 bg-amber-950/30 hover:bg-amber-900/40 border border-amber-800/50 rounded-lg transition-colors"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Picu Suara Petir Kejauhan</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === "full" && (
          <FullScriptStudio
            onTakeGenerated={handleTakeGenerated}
            activeTake={activeTake}
          />
        )}

        {activeTab === "segments" && (
          <SegmentDirector
            onTakeGenerated={handleTakeGenerated}
            onPlayAmbientForSegment={(active) => {
              if (active && !ambientActive) {
                toggleAmbientSoundscape();
              }
            }}
            ambientActive={ambientActive}
          />
        )}

        {activeTab === "dialogue" && (
          <DialogueStudio
            onTakeGenerated={handleTakeGenerated}
            activeTake={activeTake}
          />
        )}

        {activeTab === "history" && (
          <TakesHistory
            takes={takes}
            activeTake={activeTake}
            onSelectTake={setActiveTake}
            onDeleteTake={handleDeleteTake}
            onClearAll={() => {
              setTakes([]);
              setActiveTake(null);
            }}
            onGoToStudio={() => setActiveTab("full")}
          />
        )}
      </main>

      {/* Global Persistent Audio Player (if an active take exists and we are on history or segments) */}
      {activeTake && activeTab === "history" && (
        <aside className="sticky bottom-0 z-30 bg-[#0B0F17]/95 backdrop-blur-md border-t border-slate-800 p-3 sm:p-4">
          <div className="max-w-7xl mx-auto">
            <WaveformPlayer
              audioUrl={activeTake.audioUrl}
              audioBase64={activeTake.audioBase64}
              title={`Sedang Diputar: ${activeTake.title}`}
              durationSeconds={activeTake.durationSeconds}
              sampleRate={activeTake.sampleRate}
            />
          </div>
        </aside>
      )}

      {/* Studio Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-5 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">SuaraStudio</span>
            <span>·</span>
            <span>Gemini 3.8 Flash TTS</span>
            <span>·</span>
            <span className="font-mono tabular-nums">24 kHz 16-bit Mono WAV</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Dirancang untuk Penutur Bahasa Indonesia & Sutradara Vokal</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
