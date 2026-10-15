# SuaraStudio — Studio Sintesis Suara AI (Web & Android APK)

Aplikasi studio desain suara dan sintesis teks-ke-suara (*Text-to-Speech*) ekspresif berbahasa Indonesia yang ditenagai oleh model **Google Gemini 3.8 Flash TTS** (`gemini-3.8-flash-tts`). Proyek ini mendukung dua target runtime:
1. **Web / Full-stack**: Dapat dijalankan di browser melalui server Node.js / Express.
2. **Android Native APK**: Dibungkus menggunakan Kotlin dan Android WebView dengan aset lokal (`assets/dist`), ikon adaptif, penanganan navigasi tombol kembali, indikator pemuatan, dan layar error informatif.

---

## Fitur Utama

- **Naskah Utuh**: Sintesis monolog panjang dengan kurva intonasi emosional bertahap.
- **Segmen Sutradara**: Pembagian 4 babak terarah (sapaan pembuka hangat, suasana hujan malam & petir kejauhan, pelafalan presisi angka `Rp 125.500`, kode `A-I-2026-B`, waktu `19:35`, serta penutup penuh semangat).
- **Dialog Multi-Suara**: Skenario dialog 2 karakter vokal (*Narator* & *Suara AI*) dengan `multiSpeakerVoiceConfig` dan dukungan backchanneling (`|mhm|`, `|yeah|`).
- **Soundscape Ambien Web Audio API**: Efek suara hujan malam hari dan gemuruh petir kejauhan secara real-time.
- **Waveform Player**: Pemutar visual gelombang audio, pengatur kecepatan bicara, dan unduh berkas master WAV 24 kHz.
- **Pengaturan Server Backend AI**: Antarmuka konfigurasi URL backend HTTPS di Android APK untuk menjaga keamanan kunci API Gemini.

---

## Arsitektur Aplikasi Android

- **Bahasa & Framework**: Kotlin + AndroidX WebKit (`WebViewAssetLoader`)
- **Application ID**: `com.mifdha99.suarastudio`
- **Target SDK**: Android 34 (Android 14) / Minimum SDK 24 (Android 7.0+)
- **Penyajian Aset**: Aset frontend React hasil build produksi disimpan langsung di dalam APK (`android/app/src/main/assets/dist/`) sehingga aplikasi tetap dapat terbuka seketika tanpa layar putih (*no white screen*).
- **Keamanan Kunci API**: Kunci API Gemini tidak pernah disimpan di dalam file APK demi mencegah kebocoran (*decompilation*). Aplikasi berkomunikasi ke backend HTTPS terenkripsi.

---

## Cara Mendapatkan & Membangun APK Android

### Opsi A: Otomatis Menggunakan GitHub Actions (Paling Mudah)

Proyek ini telah dilengkapi alur kerja otomatis di `.github/workflows/build-apk.yml`.

1. **Unggah (*Push*) kode ke GitHub**:
   ```bash
   git add .
   git commit -m "Konfigurasi Android APK dan GitHub Actions"
   git push origin main
   ```
2. **Buka Tab Actions di GitHub**:
   - Buka repositori Anda di browser: `https://github.com/mifdha99/Ucapan/actions`
   - Pilih workflow **"Build SuaraStudio Android APK"**.
   - Alur kerja akan otomatis berjalan setiap ada `push` atau dapat dipicu secara manual melalui tombol **"Run workflow"**.
3. **Unduh Berkas APK**:
   - Setelah workflow selesai bertanda centang hijau, klik riwayat build tersebut.
   - Gulir ke bagian **Artifacts** di bagian bawah halaman.
   - Klik **`SuaraStudio-v1.0.0-debug`** untuk mengunduh file `app-debug.apk` langsung ke laptop atau HP Android Anda.

---

### Opsi B: Build Manual di Komputer Lokal

Jika Anda memiliki Android Studio atau Android SDK terpasang di komputer:

1. **Bangun Aset Frontend**:
   ```bash
   npm install
   npm run build:android
   ```
   *(Perintah ini membangun React dan menyalin folder `dist/` ke `android/app/src/main/assets/dist/`)*

2. **Jalankan Gradle Build**:
   - Di Linux / macOS:
     ```bash
     cd android
     chmod +x gradlew
     ./gradlew assembleDebug
     ```
   - Di Windows:
     ```cmd
     cd android
     gradlew.bat assembleDebug
     ```
3. Berkas APK hasil build akan berada di:
   `android/app/build/outputs/apk/debug/app-debug.apk`

---

## Cara Memasang (*Install*) APK di HP Android

1. Kirim atau unduh berkas `app-debug.apk` ke HP Android Anda (melalui WhatsApp, Telegram, Google Drive, atau browser).
2. Buka berkas `app-debug.apk` di pengelola file (*File Manager*) HP Anda.
3. Jika muncul peringatan *"Install unknown apps"* (Pasang aplikasi yang tidak dikenal):
   - Masuk ke Pengaturan HP dan aktifkan izin *"Allow from this source"* untuk browser atau pengelola file Anda.
4. Klik **Install** (Pasang) dan tunggu hingga selesai.
5. Buka aplikasi **SuaraStudio**.

---

## Status Backend Gemini & Menjalankan Sintesis Suara di HP

- **Tampilan & Suasana Ambien (Hujan & Petir)**: Berjalan 100% secara offline di dalam HP menggunakan Web Audio API.
- **Sintesis Suara Gemini 3.8 Flash TTS**: Memerlukan koneksi ke server backend yang memiliki `GEMINI_API_KEY`.
- **Langkah Menghubungkan Backend ke APK**:
  1. Jalankan `server.ts` di hosting publik yang mendukung Node.js (misalnya Google Cloud Run, Render, Railway, atau VPS) dengan variabel lingkungan `GEMINI_API_KEY`.
  2. Di aplikasi SuaraStudio pada HP Android Anda, klik ikon **Server (Pengaturan Server Backend)** di pojok kanan atas.
  3. Masukkan URL server Anda (contoh: `https://suarastudio-backend.onrender.com`), lalu klik **Uji Koneksi** dan **Simpan Pengaturan**.
  4. Aplikasi kini siap mensintesis seluruh naskah suara langsung dari HP Android Anda!

---

## Menjalankan Versi Web Lokal

```bash
npm install
cp .env.example .env # Isi GEMINI_API_KEY
npm run dev
```
Buka `http://localhost:3000` di browser.

---

## Lisensi
Apache-2.0
