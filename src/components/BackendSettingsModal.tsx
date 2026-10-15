import React, { useState, useEffect } from "react";
import {
  Server,
  X,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  ExternalLink,
} from "lucide-react";
import {
  getStoredBackendUrl,
  setStoredBackendUrl,
  checkBackendHealth,
  isRunningInAndroid,
} from "../utils/apiConfig";

interface BackendSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const BackendSettingsModal: React.FC<BackendSettingsModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const [url, setUrl] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);
  const isAndroid = isRunningInAndroid();

  useEffect(() => {
    if (isOpen) {
      setUrl(getStoredBackendUrl());
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    const res = await checkBackendHealth(url);
    setTestResult(res);
    setIsTesting(false);
  };

  const handleSave = () => {
    setStoredBackendUrl(url);
    if (onSaved) onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-slate-100">
                Pengaturan Server Backend AI
              </h3>
              <p className="text-xs text-slate-400">
                Koneksi Aman Gemini 3.8 Flash TTS
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Security Banner */}
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 font-medium text-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Keamanan Kunci API (API Key Safety)</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Demi keamanan, kunci API Gemini tidak ditanam ke dalam file APK Android
              agar tidak dapat diekstrak atau disalahgunakan pihak ketiga. Aplikasi
              ini terhubung ke backend HTTPS yang menjalankan enkripsi server-side.
            </p>
          </div>

          {/* Android Detection Status */}
          {isAndroid && (
            <div className="flex items-center gap-2 p-2.5 bg-sky-950/40 border border-sky-800/60 rounded-lg text-sky-300">
              <Smartphone className="w-4 h-4 shrink-0" />
              <span>Aplikasi berjalan di lingkungan Native Android APK</span>
            </div>
          )}

          {/* URL Input */}
          <div className="space-y-1.5">
            <label htmlFor="backend-url-input" className="font-semibold text-slate-300 block">
              URL Backend HTTPS
            </label>
            <input
              id="backend-url-input"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://suarastudio-backend.your-domain.com"
              className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-slate-800 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-hidden focus:border-amber-500 font-mono text-xs transition-colors"
            />
            <p className="text-slate-500">
              Kosongkan jika menggunakan server lokal / same-origin (saat dibuka via browser di laptop).
            </p>
          </div>

          {/* Test Status feedback */}
          {testResult && (
            <div
              className={`p-3 rounded-lg border flex items-start gap-2.5 ${
                testResult.ok
                  ? "bg-emerald-950/40 border-emerald-800/80 text-emerald-300"
                  : "bg-red-950/40 border-red-800/80 text-red-300"
              }`}
            >
              {testResult.ok ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              )}
              <div className="leading-relaxed">{testResult.message}</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleTest}
            disabled={isTesting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? "animate-spin" : ""}`} />
            <span>{isTesting ? "Memeriksa..." : "Uji Koneksi"}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-xs"
            >
              Simpan Pengaturan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
