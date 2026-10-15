import React, { useState, useRef } from "react";
import {
  Sparkles,
  RotateCcw,
  Sliders,
  Check,
  Info,
  Layers,
  Wand2,
} from "lucide-react";
import {
  FULL_USER_SCRIPT,
  FULL_SCRIPT_DEFAULT_STYLE,
  VOICE_OPTIONS,
  VOCAL_EXPRESSIONS,
  VoiceOption,
  GeneratedTake,
} from "../data/presets";
import { getApiUrl, formatBackendErrorMessage } from "../utils/apiConfig";
import { WaveformPlayer } from "./WaveformPlayer";

interface FullScriptStudioProps {
  onTakeGenerated: (take: GeneratedTake) => void;
  activeTake: GeneratedTake | null;
}

export const FullScriptStudio: React.FC<FullScriptStudioProps> = ({
  onTakeGenerated,
  activeTake,
}) => {
  const [text, setText] = useState(FULL_USER_SCRIPT);
  const [selectedVoice, setSelectedVoice] =
    useState<VoiceOption["id"]>("Kore");
  const [stylePrompt, setStylePrompt] = useState(FULL_SCRIPT_DEFAULT_STYLE);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const styleSuggestions = [
    {
      label: "Bawaan Lengkap (Multistyle)",
      value: FULL_SCRIPT_DEFAULT_STYLE,
    },
    {
      label: "Hangat & Intim",
      value:
        "Warm, calm, empathetic Indonesian narrator with gentle pacing and intimate cadence",
    },
    {
      label: "Sinematik Berkarakter",
      value:
        "Cinematic documentary tone, deep resonance, dramatic pauses, and measured pacing",
    },
    {
      label: "Artikulasi Diksi Presisi",
      value:
        "Crisp, clear broadcast diction, precise Indonesian currency and alphanumeric spelling",
    },
    {
      label: "Inspiratif & Energik",
      value:
        "Passionate, inspiring, visionary Indonesian keynote speaker, lively inflection and grounded power",
    },
  ];

  const insertTagAtCursor = (tag: string) => {
    const el = textareaRef.current;
    if (!el) {
      setText((prev) => prev + " " + tag);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const newText = text.substring(0, start) + " " + tag + " " + text.substring(end);
    setText(newText);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + tag.length + 2, start + tag.length + 2);
    }, 10);
  };

  const handleSynthesize = async () => {
    if (!text.trim()) {
      setErrorMessage("Teks naskah tidak boleh kosong.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch(getApiUrl("/api/tts/single"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim(),
          style: stylePrompt.trim(),
          voiceName: selectedVoice,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menghasilkan audio suara.");
      }

      const audioUrl = `data:audio/wav;base64,${data.audioBase64}`;
      const take: GeneratedTake = {
        id: `take-full-${Date.now()}`,
        title: "Naskah Utuh — Monolog Lengkap",
        mode: "utuh",
        voiceSummary: selectedVoice,
        styleSummary: stylePrompt.slice(0, 60) + "...",
        textPreview: text.slice(0, 120) + "...",
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
      const msg = formatBackendErrorMessage(err);
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const estimatedSeconds = Math.round((wordCount / 130) * 60);

  return (
    <div className="space-y-6">
      {/* Studio Header Card */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold font-display text-slate-100">
              Sintesis Naskah Utuh
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <span>Model: gemini-3.8-flash-tts</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{wordCount} kata</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                Est. ~{estimatedSeconds} detik bicara
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setText(FULL_USER_SCRIPT);
                setStylePrompt(FULL_SCRIPT_DEFAULT_STYLE);
                setSelectedVoice("Kore");
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Pulihkan Naskah Asli</span>
            </button>

            <button
              type="button"
              onClick={handleSynthesize}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isLoading ? "Mensintesis Suara..." : "Sintesis Seluruh Naskah"}</span>
            </button>
          </div>
        </div>

        {/* Script Editor & Voice Persona */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-5">
          {/* Main Text Editor (2 Columns) */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <label htmlFor="script-textarea" className="font-medium text-slate-300">
                Teks Naskah Uji Suara (Bahasa Indonesia)
              </label>
              <span>Sisipkan tag ekspresi vokal:</span>
            </div>

            {/* Vocal Expression Tags */}
            <div className="flex flex-wrap items-center gap-1.5 pb-1">
              {VOCAL_EXPRESSIONS.map((exp) => (
                <button
                  key={exp.tag}
                  type="button"
                  onClick={() => insertTagAtCursor(exp.tag)}
                  className="px-2 py-1 text-xs font-mono text-amber-300 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-800/60 rounded-md transition-colors"
                  title={exp.desc}
                >
                  + {exp.tag}
                </button>
              ))}
            </div>

            <textarea
              id="script-textarea"
              ref={textareaRef}
              rows={11}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full px-4 py-3 bg-[#0B0F17] border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-amber-500/80 transition-colors leading-relaxed font-sans"
              placeholder="Tuliskan naskah yang ingin disuarakan..."
            />

            {/* Script Breakdown Quick Visual */}
            <div className="p-3 bg-slate-900/70 border border-slate-800/80 rounded-lg text-xs text-slate-400 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-300 font-medium">
                  Naskah ini mencakup 4 tantangan vokal utama:
                </p>
                <p className="mt-0.5">
                  1. Sapaan pembuka ramah · 2. Atmosfer tenang malam hari · 3.
                  Pelafalan nominal <span className="font-mono text-amber-300">Rp 125.500</span>, kode{" "}
                  <span className="font-mono text-amber-300">A-I-2026-B</span> & waktu{" "}
                  <span className="font-mono text-amber-300">19:35</span> · 4. Penutup penuh visi teknologi.
                </p>
              </div>
            </div>
          </div>

          {/* Voice & Style Direction Controls (1 Column) */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Pilih Karakter Suara AI (Prebuilt Persona)
              </label>
              <div className="space-y-2">
                {VOICE_OPTIONS.map((voice) => (
                  <button
                    key={voice.id}
                    type="button"
                    onClick={() => setSelectedVoice(voice.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedVoice === voice.id
                        ? "bg-amber-950/30 border-amber-500/80 text-amber-100"
                        : "bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{voice.name}</span>
                      {selectedVoice === voice.id && (
                        <Check className="w-4 h-4 text-amber-400" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{voice.timbre}</p>
                    <p className="text-xs text-slate-500 mt-1">{voice.bestFor}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Style Prompt / Voice Design Direction */}
            <div className="space-y-2 pt-2">
              <label
                htmlFor="style-prompt-input"
                className="flex items-center justify-between text-xs font-medium text-slate-300"
              >
                <span>Arahan Gaya Vokal (Speech Style)</span>
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
              </label>

              <textarea
                id="style-prompt-input"
                rows={3}
                value={stylePrompt}
                onChange={(e) => setStylePrompt(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B0F17] border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-amber-500/80 transition-colors"
                placeholder="Misal: Warm, calm, articulate, slow pacing..."
              />

              <div className="space-y-1">
                <span className="text-xs text-slate-500">Preset Arahan Cepat:</span>
                <div className="flex flex-wrap gap-1.5">
                  {styleSuggestions.map((sug) => (
                    <button
                      key={sug.label}
                      type="button"
                      onClick={() => setStylePrompt(sug.value)}
                      className="px-2 py-0.5 text-xs text-slate-400 bg-slate-900 hover:text-slate-200 hover:bg-slate-800 border border-slate-800 rounded transition-colors whitespace-nowrap"
                    >
                      {sug.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mt-4 p-3 bg-red-950/40 border border-red-800/80 rounded-lg text-xs text-red-300">
            {errorMessage}
          </div>
        )}
      </div>

      {/* Latest Audio Result Player */}
      {activeTake && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-amber-400" />
              <span>Hasil Sintesis Terkini</span>
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
