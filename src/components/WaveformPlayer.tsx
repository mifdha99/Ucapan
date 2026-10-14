import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, Download, Volume2, RotateCcw } from "lucide-react";

interface WaveformPlayerProps {
  audioUrl: string | null;
  audioBase64: string | null;
  title: string;
  durationSeconds?: number;
  sampleRate?: number;
  onEnded?: () => void;
  autoPlay?: boolean;
}

export const WaveformPlayer: React.FC<WaveformPlayerProps> = ({
  audioUrl,
  audioBase64,
  title,
  durationSeconds = 0,
  sampleRate = 24000,
  onEnded,
  autoPlay = false,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(durationSeconds || 0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);

  // Sync duration if prop updates
  useEffect(() => {
    if (durationSeconds > 0) {
      setDuration(durationSeconds);
    }
  }, [durationSeconds]);

  // Handle new audio source & autoPlay
  useEffect(() => {
    if (audioRef.current && audioUrl) {
      audioRef.current.playbackRate = playbackRate;
      setCurrentTime(0);
      if (autoPlay) {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      } else {
        setIsPlaying(false);
      }
    }
  }, [audioUrl, autoPlay]);

  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    const safeTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    a.download = `suarastudio-${safeTitle}-${Date.now()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Canvas visualizer waveform drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const barsCount = 64;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const barWidth = width / barsCount;
      const progress = duration > 0 ? currentTime / duration : 0;

      for (let i = 0; i < barsCount; i++) {
        const barPos = i / barsCount;
        const isPast = barPos <= progress;

        // Dynamic synthetic speech curve with subtle animation when playing
        const baseAmp = Math.sin((i / barsCount) * Math.PI) * 0.7;
        const jitter = isPlaying
          ? Math.sin(Date.now() * 0.012 + i * 0.8) * 0.25
          : 0;
        const amp = Math.max(0.08, Math.min(0.95, baseAmp + jitter));
        const barHeight = amp * (height - 8);

        ctx.fillStyle = isPast ? "#F59E0B" : "#334155";
        ctx.fillRect(
          i * barWidth + 1,
          (height - barHeight) / 2,
          barWidth - 2,
          barHeight
        );
      }

      if (isPlaying) {
        animId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isPlaying, currentTime, duration]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    return `${m}:${s < 10 ? "0" : ""}${s}.${ms}`;
  };

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 sm:p-5">
      <audio
        ref={audioRef}
        src={audioUrl || undefined}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration || durationSeconds);
          }
        }}
        onEnded={() => {
          setIsPlaying(false);
          if (onEnded) onEnded();
        }}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <h4 className="text-sm font-semibold text-slate-100">{title}</h4>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
            <span>gemini-3.8-flash-tts</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{sampleRate} Hz WAV</span>
            <span aria-hidden="true">·</span>
            <span>16-bit Mono</span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Speed Presets */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-800/80 rounded-lg">
            {[0.85, 1.0, 1.15].map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => handleSpeedChange(rate)}
                className={`px-2 py-0.5 text-xs font-mono rounded transition-colors ${
                  playbackRate === rate
                    ? "bg-slate-700 text-amber-300 font-semibold shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>

          {/* Download Button */}
          {audioUrl && (
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 rounded-lg transition-colors whitespace-nowrap shrink-0"
              title="Unduh berkas WAV asli"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Unduh .WAV</span>
            </button>
          )}
        </div>
      </div>

      {/* Waveform Canvas */}
      <div className="py-3">
        <canvas
          ref={canvasRef}
          width={600}
          height={48}
          className="w-full h-12 bg-slate-900/90 rounded-lg border border-slate-800"
        />
      </div>

      {/* Transport & Timeline */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={duration || 1}
            step={0.05}
            value={currentTime}
            onChange={handleSeek}
            disabled={!audioUrl}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 disabled:opacity-40"
          />
        </div>

        <div className="flex items-center justify-between text-xs font-mono tabular-nums text-slate-400">
          <span className="text-amber-400 font-medium">
            {formatTime(currentTime)}
          </span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Controls Bar */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlay}
              disabled={!audioUrl}
              className="inline-flex items-center justify-center w-9 h-9 text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:bg-slate-800 disabled:text-slate-600 rounded-lg transition-colors shadow-xs"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current translate-x-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.currentTime = 0;
                  setCurrentTime(0);
                }
              }}
              disabled={!audioUrl}
              className="p-2 text-slate-400 hover:text-slate-200 disabled:opacity-40 transition-colors"
              title="Kembali ke awal"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2 text-slate-400">
            <Volume2 className="w-4 h-4" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setVolume(val);
                if (audioRef.current) {
                  audioRef.current.volume = val;
                }
              }}
              className="w-16 sm:w-20 h-1 bg-slate-800 rounded appearance-none accent-amber-500 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
