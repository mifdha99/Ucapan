package com.mifdha99.suarastudio

import android.content.Context
import android.webkit.JavascriptInterface
import android.widget.Toast

class WebAppInterface(private val context: Context) {

    private val prefs = context.getSharedPreferences("SuaraStudioPrefs", Context.MODE_PRIVATE)

    companion object {
        const val DEFAULT_BACKEND_URL = "https://echosoul-ai.ai.studio"
    }

    @JavascriptInterface
    fun isAndroidApp(): Boolean {
        return true
    }

    @JavascriptInterface
    fun getBackendUrl(): String {
        return prefs.getString("backend_url", DEFAULT_BACKEND_URL) ?: DEFAULT_BACKEND_URL
    }

    @JavascriptInterface
    fun setBackendUrl(url: String) {
        val target = if (url.trim().isEmpty()) DEFAULT_BACKEND_URL else url.trim()
        prefs.edit().putString("backend_url", target).apply()
    }

    @JavascriptInterface
    fun showToast(message: String) {
        Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
    }

    @JavascriptInterface
    fun getAppVersion(): String {
        return "1.0.0"
    }
}
