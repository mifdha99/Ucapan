import React, { useState } from "react";
import {
  Users,
  Sparkles,
  Plus,
  Trash2,
  RotateCcw,
  MessageSquare,
  Wand2,
} from "lucide-react";
import {
  INITIAL_DIALOGUE_TURNS,
  DialogueTurn,
  VOICE_OPTIONS,
  GeneratedTake,
  VoiceOption,
} from "../data/presets";
import { WaveformPlayer } from "./WaveformPlayer";

interface DialogueStudioProps {
  onTakeGenerated: (take: GeneratedTake) => void;
  activeTake: GeneratedTake | null;
}

export const DialogueStudio: React.FC<DialogueStudioProps> = ({
  onTakeGenerated,
  activeTake,
}) => {
  const [turns, setTurns] = useState<DialogueTurn[]>(INITIAL_DIALOGUE_TURNS);
  const [speaker1Voice, setSpeaker1Voice] =
    useState<VoiceOption["id"]>("Puck");
  const [speaker2Voice, setSpeaker2Voice] =
    useState<VoiceOption["id"]>("Kore");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleUpdateTurn = (
    id: string,
    field: keyof DialogueTurn,
    value: string
  ) => {
    setTurns((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  const handleAddTurn = () => {
    const newTurn: DialogueTurn = {
      id: `turn-${Date.now()}`,
      speaker: turns.length % 2 === 0 ? "Narator" : "SuaraAI",
      text: "",
      style: "Natural conversational tone",
    };
    setTurns((prev) => [...prev, newTurn]);
  };

  const handleRemoveTurn = (id: string) => {
    if (turns.length <= 2) {
      setErrorMessage("Dialog membutuhkan minimal 2 giliran bicara.");
      return;
    }
    setTurns((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSynthesizeDialogue = async () => {
    const emptyTurns = turns.filter((t) => !t.text.trim());
    if (emptyTurns.length > 0) {
      setErrorMessage("Semua baris dialog harus memiliki teks.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/tts/dialogue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          turns: turns.map((t) => ({
            speaker: t.speaker,
            text: t.text,
            style: t.style,
          })),
          speakers: [
            { speaker: "Narator", voiceName: speaker1Voice },
            { speaker: "SuaraAI", voiceName: speaker2Voice },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menghasilkan dialog suara.");
      }

      const audioUrl = `data:audio/wav;base64,${data.audioBase64}`;
      const take: GeneratedTake = {
        id: `take-dialogue-${Date.now()}`,
        title: "Dialog Multi-Suara (Narator & Suara AI)",
        mode: "dialog",
        voiceSummary: `Narator (${speaker1Voice}) · Suara AI (${speaker2Voice})`,
        styleSummary: "Dual-speaker interactive performance with backchanneling",
        textPreview: `${turns[0]?.text.slice(0, 50)}...`,
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

      onTakeGenerated(take);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Terjadi kesalahan saat memproses.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Studio Screenplay Header */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold font-display text-slate-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              <span>Dialog Multi-Suara (Screenplay Engine)</span>
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <span>Model: gemini-3.8-flash-tts</span>
              <span aria-hidden="true">·</span>
              <span>2 Karakter Vokal Aktif</span>
              <span aria-hidden="true">·</span>
              <span>Dukungan Backchanneling |mhm| & |yeah|</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setTurns(INITIAL_DIALOGUE_TURNS);
                setSpeaker1Voice("Puck");
                setSpeaker2Voice("Kore");
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Dialog</span>
            </button>

            <button
              type="button"
              onClick={handleSynthesizeDialogue}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isLoading ? "Mensintesis Dialog..." : "Sintesis Dialog 2 Suara"}</span>
            </button>
          </div>
        </div>

        {/* Cast Configuration (2 Speakers) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5">
          {/* Speaker 1: Narator */}
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-300">
                Pemeran 1: Narator
              </span>
              <span className="text-xs text-slate-400">Pembuka & Artikulasi</span>
            </div>
            <select
              value={speaker1Voice}
              onChange={(e) =>
                setSpeaker1Voice(e.target.value as VoiceOption["id"])
              }
              className="w-full px-3 py-2 bg-[#0B0F17] border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-hidden focus:border-amber-500"
            >
              {VOICE_OPTIONS.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.timbre})
                </option>
              ))}
            </select>
          </div>

          {/* Speaker 2: Suara AI */}
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-sky-300">
                Pemeran 2: Suara AI
              </span>
              <span className="text-xs text-slate-400">
                Empati Tenang & Visi Masa Depan
              </span>
            </div>
            <select
              value={speaker2Voice}
              onChange={(e) =>
                setSpeaker2Voice(e.target.value as VoiceOption["id"])
              }
              className="w-full px-3 py-2 bg-[#0B0F17] border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-hidden focus:border-amber-500"
            >
              {VOICE_OPTIONS.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.timbre})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dialogue Turns Script Editor */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
              <span>Naskah Adegan Berbalas (Gantian Bicara)</span>
            </h3>
            <button
              type="button"
              onClick={handleAddTurn}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 rounded-md transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>Tambah Baris</span>
            </button>
          </div>

          <div className="space-y-3">
            {turns.map((turn, index) => {
              const isSpeaker1 = turn.speaker === "Narator";

              return (
                <div
                  key={turn.id}
                  className={`p-3.5 sm:p-4 rounded-lg border transition-all ${
                    isSpeaker1
                      ? "bg-slate-900/60 border-amber-900/30"
                      : "bg-slate-900/90 border-sky-900/30"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 pb-2 mb-2 border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-500">
                        #0{index + 1}
                      </span>
                      <select
                        value={turn.speaker}
                        onChange={(e) =>
                          handleUpdateTurn(
                            turn.id,
                            "speaker",
                            e.target.value as "Narator" | "SuaraAI"
                          )
                        }
                        className={`text-xs font-semibold px-2 py-1 rounded bg-slate-950 border border-slate-800 ${
                          isSpeaker1 ? "text-amber-300" : "text-sky-300"
                        }`}
                      >
                        <option value="Narator">Narator</option>
                        <option value="SuaraAI">Suara AI</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={turn.style}
                        onChange={(e) =>
                          handleUpdateTurn(turn.id, "style", e.target.value)
                        }
                        placeholder="Arahan gaya bicara..."
                        className="text-xs px-2.5 py-1 bg-[#0B0F17] border border-slate-800 rounded text-slate-300 w-44 sm:w-64 focus:outline-hidden focus:border-amber-500"
                      />

                      <button
                        type="button"
                        onClick={() => handleRemoveTurn(turn.id)}
                        className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                        title="Hapus baris"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={2}
                    value={turn.text}
                    onChange={(e) =>
                      handleUpdateTurn(turn.id, "text", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-[#0B0F17] border border-slate-800 rounded-md text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-amber-500/80 leading-relaxed font-sans"
                    placeholder="Kalimat yang diucapkan pemeran..."
                  />
                </div>
              );
            })}
          </div>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 bg-red-950/40 border border-red-800/80 rounded-lg text-xs text-red-300">
            {errorMessage}
          </div>
        )}
      </div>

      {/* Latest Dialogue Audio Result */}
      {activeTake && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-amber-400" />
              <span>Hasil Dialog Multi-Suara</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              Dibuat pukul {activeTake.createdAt}
            </span>
          </div>

          <WaveformPlayer
            audioUrl={activeTake.audioUrl}
            audioBase64={activeTake.audioBase64}
            title={activeTake.title}
            durationSeconds={activeTake.durationSeconds}
            sampleRate={activeTake.sampleRate}
            autoPlay={true}
          />
        </div>
      )}
    </div>
  );
};
