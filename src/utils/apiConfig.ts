/**
 * API Configuration for SuaraStudio (Web & Android APK)
 *
 * Handles backend URL resolution, protocol auto-detection, URL normalization,
 * and health checking for Google Gemini 3.8 Flash TTS backend.
 *
 * Security: Gemini API keys are NEVER embedded into the frontend or APK.
 * All synthesis requests route through the authorized HTTPS backend.
 */

declare global {
  interface Window {
    AndroidBridge?: {
      getBackendUrl?: () => string;
      setBackendUrl?: (url: string) => void;
      showToast?: (message: string) => void;
      isAndroidApp?: () => boolean;
    };
  }
}

export const STORAGE_KEY = "SUARA_STUDIO_BACKEND_URL";

/**
 * Official published backend URL for SuaraStudio on Google AI Studio
 */
export const DEFAULT_AI_STUDIO_BACKEND_URL = "https://echosoul-ai.ai.studio";

/**
 * Normalizes any user-entered backend URL:
 * - Trims whitespace
 * - Adds https:// if protocol is missing
 * - Strips trailing endpoints like /api/tts/single, /api/tts, /api/health, /api
 * - Strips trailing slashes
 *
 * Examples:
 * "echosoul-ai.ai.studio" -> "https://echosoul-ai.ai.studio"
 * "https://echosoul-ai.ai.studio/" -> "https://echosoul-ai.ai.studio"
 * "https://echosoul-ai.ai.studio/api/tts/single" -> "https://echosoul-ai.ai.studio"
 * "https://echosoul-ai.ai.studio/api" -> "https://echosoul-ai.ai.studio"
 */
export function normalizeBackendBaseUrl(input: string): string {
  if (!input) return "";
  let url = input.trim();

  // If protocol is missing, add https:// (or http:// for localhost)
  if (!/^https?:\/\//i.test(url)) {
    if (/^(localhost|127\.0\.0\.1|10\.0\.2\.2)(:\d+)?/i.test(url)) {
      url = `http://${url}`;
    } else {
      url = `https://${url}`;
    }
  }

  // Remove trailing slashes
  url = url.replace(/\/+$/, "");

  // Strip common endpoint paths if user pasted full API route instead of base domain
  const endpointPatterns = [
    /\/api\/tts\/single$/i,
    /\/api\/tts\/dialogue$/i,
    /\/api\/tts$/i,
    /\/api\/health$/i,
    /\/api$/i,
  ];

  for (const pattern of endpointPatterns) {
    url = url.replace(pattern, "");
  }

  // Remove trailing slashes again after stripping path
  return url.replace(/\/+$/, "");
}

export function isRunningInAndroid(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(
    window.AndroidBridge?.isAndroidApp?.() ||
      window.location.hostname === "appassets.androidplatform.net" ||
      window.location.protocol === "file:"
  );
}

export function getStoredBackendUrl(): string {
  if (typeof window === "undefined") return "";

  // 1. Check if native Android bridge provides a configured URL
  try {
    const bridgeUrl = window.AndroidBridge?.getBackendUrl?.();
    if (bridgeUrl && bridgeUrl.trim()) {
      return normalizeBackendBaseUrl(bridgeUrl);
    }
  } catch {
    // Ignore bridge access errors
  }

  // 2. Check localStorage
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && saved.trim()) {
    return normalizeBackendBaseUrl(saved);
  }

  // 3. If running in Android APK, default to published AI Studio backend URL
  if (isRunningInAndroid()) {
    return DEFAULT_AI_STUDIO_BACKEND_URL;
  }

  // 4. In web browser environment, if running on standard http/https (same-origin), default to relative path
  if (
    window.location.protocol === "http:" ||
    window.location.protocol === "https:"
  ) {
    // If running on GitHub Pages (e.g. mifdha99.github.io), we also need the external backend
    if (window.location.hostname.endsWith("github.io")) {
      return DEFAULT_AI_STUDIO_BACKEND_URL;
    }
    return "";
  }

  return DEFAULT_AI_STUDIO_BACKEND_URL;
}

export function setStoredBackendUrl(url: string): void {
  const cleanUrl = normalizeBackendBaseUrl(url);
  if (!cleanUrl) {
    localStorage.removeItem(STORAGE_KEY);
    try {
      window.AndroidBridge?.setBackendUrl?.("");
    } catch {
      // Ignore
    }
  } else {
    localStorage.setItem(STORAGE_KEY, cleanUrl);
    try {
      window.AndroidBridge?.setBackendUrl?.(cleanUrl);
    } catch {
      // Ignore
    }
  }
}

export function getApiUrl(endpoint: string): string {
  const baseUrl = getStoredBackendUrl();
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  if (!baseUrl) {
    // Relative path for local server / same-origin in web
    return cleanEndpoint;
  }

  return `${baseUrl}${cleanEndpoint}`;
}

export async function checkBackendHealth(targetUrl?: string): Promise<{
  ok: boolean;
  message: string;
  statusCode?: number;
  resolvedUrl: string;
}> {
  const rawInput =
    targetUrl !== undefined ? targetUrl : getStoredBackendUrl();
  const baseUrl = normalizeBackendBaseUrl(rawInput);

  if (!baseUrl) {
    return {
      ok: false,
      message: "Silakan masukkan URL backend HTTPS yang valid.",
      resolvedUrl: "",
    };
  }

  const healthEndpoint = `${baseUrl}/api/health`;
  const ttsEndpoint = `${baseUrl}/api/tts/single`;

  // 1. Try dedicated GET /api/health with 8-second timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(healthEndpoint, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json().catch(() => null);
      const serviceName = data?.service || "SuaraStudio Backend";
      const modelName = data?.model || "Gemini 3.8 Flash TTS";
      return {
        ok: true,
        message: `Terhubung dengan sukses! ${serviceName} aktif (${modelName}).`,
        statusCode: res.status,
        resolvedUrl: baseUrl,
      };
    }
  } catch (err: unknown) {
    // If /api/health failed, try POST /api/tts/single as fallback
    if (err instanceof DOMException && err.name === "AbortError") {
      return {
        ok: false,
        message: `Koneksi ke ${baseUrl} memakan waktu terlalu lama (timeout > 8 detik). Pastikan server aktif dan dapat diakses publik.`,
        resolvedUrl: baseUrl,
      };
    }
  }

  // 2. Fallback check: POST /api/tts/single with empty text (expecting 400 Bad Request when alive)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(ttsEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "" }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.status === 400 || res.ok) {
      return {
        ok: true,
        message: "Terhubung! Endpoint Gemini TTS merespons dengan benar.",
        statusCode: res.status,
        resolvedUrl: baseUrl,
      };
    }

    return {
      ok: false,
      message: `Server merespons dengan status HTTP ${res.status}. Pastikan URL mengarah ke aplikasi SuaraStudio yang benar.`,
      statusCode: res.status,
      resolvedUrl: baseUrl,
    };
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Gagal terhubung ke host";
    return {
      ok: false,
      message: `Gagal terhubung ke ${baseUrl} (${msg}). Pastikan sertifikat HTTPS valid dan server mengizinkan akses (CORS).`,
      resolvedUrl: baseUrl,
    };
  }
}

export function formatBackendErrorMessage(err: unknown): string {
  if (
    err instanceof TypeError &&
    err.message.toLowerCase().includes("failed to fetch")
  ) {
    const currentUrl = getStoredBackendUrl();
    return `Tidak dapat terhubung ke server backend AI (${
      currentUrl || "URL belum diatur"
    }). Pastikan backend HTTPS aktif dan periksa konfigurasi pada menu Pengaturan Server (ikon server di pojok kanan atas).`;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return "Terjadi kesalahan saat menghubungi server backend.";
}
