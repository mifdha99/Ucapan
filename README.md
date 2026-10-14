# SuaraStudio — Studio Sintesis Suara AI (Gemini 3.8 Flash TTS)

Aplikasi studio desain suara dan sintesis teks-ke-suara (*Text-to-Speech*) ekspresif berbahasa Indonesia yang ditenagai oleh model **Google Gemini 3.8 Flash TTS** (`gemini-3.8-flash-tts`).

Aplikasi ini mencakup:
- **Naskah Utuh**: Sintesis monolog panjang dengan transisi intonasi emosional.
- **Segmen Sutradara**: Pembagian 4 babak terarah (sapaan hangat, suasana hujan malam & petir kejauhan, pelafalan presisi angka/kode/waktu, dan penutup penuh semangat).
- **Dialog Multi-Suara**: Skenario dialog 2 karakter vokal (*Narator* & *Suara AI*) dengan kemampuan backchanneling (`|mhm|`, `|yeah|`).
- **Soundscape Ambien Web Audio API**: Efek suara hujan malam hari dan gemuruh petir kejauhan secara real-time.
- **Waveform Player**: Pemutar visual gelombang audio, pengatur kecepatan bicara, dan unduh berkas master WAV 24 kHz.

---

## Cara Menjalankan di Komputer Lokal

### 1. Kebutuhan Sistem
- **Node.js** versi 20 ke atas (direkomendasikan Node.js 22 LTS).
- **NPM** atau package manager favorit Anda (`pnpm` / `yarn` / `bun`).

### 2. Instalasi Dependensi
Clone repositori ini lalu jalankan:

```bash
npm install
```

### 3. Konfigurasi Kunci API (API Key)
Salin berkas `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Buka berkas `.env` dan masukkan kunci API Gemini Anda:
```env
GEMINI_API_KEY="AIzaSy..."
```
> Kunci API dapat diperoleh secara gratis di [Google AI Studio](https://aistudio.google.com/app/apikey).

### 4. Menjalankan Aplikasi
Jalankan server pengembangan:

```bash
npm run dev
```

Buka browser Anda di `http://localhost:3000`.

---

## Lisensi
Apache-2.0
