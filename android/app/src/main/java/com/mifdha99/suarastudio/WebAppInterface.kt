package com.mifdha99.suarastudio

import android.content.Context
import android.webkit.JavascriptInterface
import android.widget.Toast

class WebAppInterface(private val context: Context) {

    private val prefs = context.getSharedPreferences("SuaraStudioPrefs", Context.MODE_PRIVATE)

    @JavascriptInterface
    fun isAndroidApp(): Boolean {
        return true
    }

    @JavascriptInterface
    fun getBackendUrl(): String {
        return prefs.getString("backend_url", "") ?: ""
    }

    @JavascriptInterface
    fun setBackendUrl(url: String) {
        prefs.edit().putString("backend_url", url.trim()).apply()
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
