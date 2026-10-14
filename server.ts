import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

/**
 * Ensures the returned audio buffer has a valid 44-byte RIFF WAV header (24kHz, 16-bit, mono).
 * Gemini 3.8 TTS unary calls return a complete WAV file by default, while raw PCM chunks lack a header.
 */
function ensureWavBuffer(rawBuffer: Buffer, sampleRate = 24000): Buffer {
  if (
    rawBuffer.length >= 44 &&
    rawBuffer[0] === 0x52 && // 'R'
    rawBuffer[1] === 0x49 && // 'I'
    rawBuffer[2] === 0x46 && // 'F'
    rawBuffer[3] === 0x46 // 'F'
  ) {
    return rawBuffer;
  }

  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = rawBuffer.length;
  const header = Buffer.alloc(44);

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16); // Subchunk1Size (PCM)
  header.writeUInt16LE(1, 20); // AudioFormat (1 = PCM)
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, rawBuffer]);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Single-speaker TTS endpoint using gemini-3.8-flash-tts
  app.post("/api/tts/single", async (req, res) => {
    try {
      const { text, style, voiceName = "Kore" } = req.body as {
        text?: string;
        style?: string;
        voiceName?: string;
      };

      if (!text || !text.trim()) {
        res.status(400).json({ error: "Teks naskah tidak boleh kosong." });
        return;
      }

      const ai = getGenAIClient();

      const partPayload: Record<string, unknown> = {
        text: text.trim(),
      };
      if (style && style.trim()) {
        partPayload.speechMetadata = {
          style: style.trim(),
        };
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash-tts",
        contents: [
          {
            role: "user",
            parts: [partPayload as { text: string }],
          },
        ],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName,
              },
            },
          },
        },
      });

      const parts = response.candidates?.[0]?.content?.parts || [];
      let base64Audio: string | undefined;
      for (const part of parts) {
        if (part.inlineData?.data) {
          base64Audio = part.inlineData.data;
          break;
        }
      }

      if (!base64Audio) {
        res.status(502).json({
          error: "Model tidak mengembalikan data audio. Silakan coba lagi.",
        });
        return;
      }

      const rawBuffer = Buffer.from(base64Audio, "base64");
      const wavBuffer = ensureWavBuffer(rawBuffer, 24000);
      const pcmByteLength = Math.max(0, wavBuffer.length - 44);
      const durationSeconds = Number((pcmByteLength / (24000 * 2)).toFixed(2));

      res.json({
        audioBase64: wavBuffer.toString("base64"),
        mimeType: "audio/wav",
        sampleRate: 24000,
        durationSeconds,
        model: "gemini-3.8-flash-tts",
        voiceName,
      });
    } catch (error: unknown) {
      console.error("TTS Single Error:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mensintesis suara.";
      res.status(500).json({ error: message });
    }
  });

  // Dual-speaker dialogue TTS endpoint using gemini-3.8-flash-tts
  app.post("/api/tts/dialogue", async (req, res) => {
    try {
      const { turns, speakers } = req.body as {
        turns?: Array<{ speaker: string; text: string; style?: string }>;
        speakers?: Array<{ speaker: string; voiceName: string }>;
      };

      if (!turns || !Array.isArray(turns) || turns.length === 0) {
        res.status(400).json({ error: "Daftar dialog tidak boleh kosong." });
        return;
      }

      if (!speakers || !Array.isArray(speakers) || speakers.length !== 2) {
        res.status(400).json({
          error: "Mode dialog multi-pembicara membutuhkan tepat 2 konfigurasi suara.",
        });
        return;
      }

      const ai = getGenAIClient();

      const parts = turns
        .filter((t) => t.text && t.text.trim())
        .map((t) => {
          const formattedText = t.text.trim().startsWith(`${t.speaker}:`)
            ? t.text.trim()
            : `${t.speaker}: ${t.text.trim()}`;

          const partObj: Record<string, unknown> = {
            text: formattedText,
            speechMetadata: {
              speaker: t.speaker,
              ...(t.style && t.style.trim() ? { style: t.style.trim() } : {}),
            },
          };
          return partObj as { text: string };
        });

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash-tts",
        contents: [
          {
            role: "user",
            parts,
          },
        ],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            multiSpeakerVoiceConfig: {
              speakerVoiceConfigs: speakers.map((s) => ({
                speaker: s.speaker,
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: s.voiceName,
                  },
                },
              })),
            },
          },
        },
      });

      const responseParts = response.candidates?.[0]?.content?.parts || [];
      let base64Audio: string | undefined;
      for (const part of responseParts) {
        if (part.inlineData?.data) {
          base64Audio = part.inlineData.data;
          break;
        }
      }

      if (!base64Audio) {
        res.status(502).json({
          error: "Model tidak mengembalikan data audio dialog. Silakan coba lagi.",
        });
        return;
      }

      const rawBuffer = Buffer.from(base64Audio, "base64");
      const wavBuffer = ensureWavBuffer(rawBuffer, 24000);
      const pcmByteLength = Math.max(0, wavBuffer.length - 44);
      const durationSeconds = Number((pcmByteLength / (24000 * 2)).toFixed(2));

      res.json({
        audioBase64: wavBuffer.toString("base64"),
        mimeType: "audio/wav",
        sampleRate: 24000,
        durationSeconds,
        model: "gemini-3.8-flash-tts",
      });
    } catch (error: unknown) {
      console.error("TTS Dialogue Error:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mensintesis dialog suara.";
      res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SuaraStudio server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
