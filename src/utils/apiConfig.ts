/**
 * API Configuration for SuaraStudio
 *
 * Allows seamless switching between:
 * 1. Same-origin backend (when running in web / local full-stack server)
 * 2. Remote HTTPS backend (when installed as Android APK or distributed app)
 *
 * Security: Gemini API keys are NEVER embedded into the frontend or APK.
 * All calls route through an authorized HTTPS backend.
 */

declare global {
  interface Window {
    AndroidBridge?: {
      getBackendUrl?: () => string;
      showToast?: (message: string) => void;
      isAndroidApp?: () => boolean;
    };
  }
}

const STORAGE_KEY = "SUARA_STUDIO_BACKEND_URL";

export function getStoredBackendUrl(): string {
  if (typeof window === "undefined") return "";

  // 1. Check if native Android bridge provides a configured URL
  try {
    const bridgeUrl = window.AndroidBridge?.getBackendUrl?.();
    if (bridgeUrl && bridgeUrl.trim()) {
      return bridgeUrl.trim().replace(/\/+$/, "");
    }
  } catch {
    // Ignore bridge access errors
  }

  // 2. Check localStorage
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && saved.trim()) {
    return saved.trim().replace(/\/+$/, "");
  }

  // 3. In web browser environment, if running on http/https (not file://), default to same-origin
  if (window.location.protocol === "http:" || window.location.protocol === "https:") {
    return "";
  }

  return "";
}

export function setStoredBackendUrl(url: string): void {
  const cleanUrl = url.trim().replace(/\/+$/, "");
  if (!cleanUrl) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, cleanUrl);
  }
}

export function getApiUrl(endpoint: string): string {
  const baseUrl = getStoredBackendUrl();
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  if (!baseUrl) {
    // Relative path for local server / same-origin
    return cleanEndpoint;
  }

  return `${baseUrl}${cleanEndpoint}`;
}

export async function checkBackendHealth(targetUrl?: string): Promise<{
  ok: boolean;
  message: string;
  statusCode?: number;
}> {
  const url = targetUrl !== undefined ? targetUrl.trim().replace(/\/+$/, "") : getStoredBackendUrl();
  const testEndpoint = url ? `${url}/api/tts/single` : "/api/tts/single";

  try {
    const res = await fetch(testEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "" }), // empty text triggers 400 validation if backend is alive
    });

    // A 400 Bad Request indicates server is alive and validating input correctly
    if (res.status === 400 || res.ok) {
      return {
        ok: true,
        message: "Server backend aktif dan merespons dengan baik.",
        statusCode: res.status,
      };
    }

    return {
      ok: false,
      message: `Server merespons dengan status HTTP ${res.status}.`,
      statusCode: res.status,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Gagal menghubungi server";
    return {
      ok: false,
      message: `Tidak dapat terhubung ke server (${msg}). Pastikan server backend sedang berjalan dan mendukung HTTPS/CORS.`,
    };
  }
}

export function formatBackendErrorMessage(err: unknown): string {
  if (err instanceof TypeError && err.message.toLowerCase().includes("failed to fetch")) {
    return "Tidak dapat terhubung ke server backend AI. Jika Anda menjalankan aplikasi di HP Android (APK), pastikan URL backend telah dikonfigurasi melalui tombol Pengaturan Server di pojok kanan atas.";
  }
  if (err instanceof Error) {
    return err.message;
  }
  return "Terjadi kesalahan saat menghubungi server backend.";
}

export function isRunningInAndroid(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.AndroidBridge?.isAndroidApp?.());
}
