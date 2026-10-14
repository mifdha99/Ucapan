export interface VoiceOption {
  id: "Kore" | "Puck" | "Charon" | "Fenrir" | "Zephyr";
  name: string;
  timbre: string;
  bestFor: string;
}

export interface ScriptSegment {
  id: string;
  indexLabel: string;
  title: string;
  category: string;
  text: string;
  style: string;
  voiceName: VoiceOption["id"];
  ambientRain: boolean;
  notes: string;
  highlights?: Array<{ label: string; value: string }>;
}

export interface DialogueTurn {
  id: string;
  speaker: "Narator" | "SuaraAI";
  text: string;
  style: string;
}

export interface GeneratedTake {
  id: string;
  title: string;
  mode: "utuh" | "segmen" | "dialog";
  voiceSummary: string;
  styleSummary: string;
  textPreview: string;
  audioUrl: string;
  audioBase64: string;
  durationSeconds: number;
  sampleRate: number;
  createdAt: string;
  ambientRain: boolean;
}

export const VOICE_OPTIONS: VoiceOption[] = [
  {
    id: "Kore",
    name: "Kore",
    timbre: "Hangat · Jernih · Natural",
    bestFor: "Narasi pembuka, penceritaan empatik, dan dialog ramah",
  },
  {
    id: "Charon",
    name: "Charon",
    timbre: "Dalam · Tenang · Sinematik",
    bestFor: "Monolog tengah malam, suasana hujan tenang, dan narasi dokumenter",
  },
  {
    id: "Zephyr",
    name: "Zephyr",
    timbre: "Presisi · Artikulasi Tajam · Modern",
    bestFor: "Pengucapan angka, kode produk A-I-2026-B, nominal rupiah, dan waktu",
  },
  {
    id: "Puck",
    name: "Puck",
    timbre: "Bersemangat · Ekspresif · Dinamis",
    bestFor: "Kalimat penutup inspiratif, pidato visi teknologi, dan percakapan hidup",
  },
  {
    id: "Fenrir",
    name: "Fenrir",
    timbre: "Tegas · Berwibawa · Resonansi Kuat",
    bestFor: "Pernyataan dramatis, pengumuman penting, dan karakter berkarisma",
  },
];

export const VOCAL_EXPRESSIONS = [
  {
    tag: "<breath>",
    label: "Tarikan Napas Alami",
    desc: "Jeda napas halus sebelum kalimat penting",
  },
  {
    tag: "<gasp>",
    label: "Keterkejutan Halus",
    desc: "Ekspresi takjub atau terkesima",
  },
  {
    tag: "<laugh>",
    label: "Tawa Hangat",
    desc: "Tawa ringan di sela kalimat",
  },
  {
    tag: "|mhm|",
    label: "Respons |mhm|",
    desc: "Backchanneling pendengar aktif",
  },
  {
    tag: "|yeah|",
    label: "Afirmasi |yeah|",
    desc: "Persetujuan natural dalam dialog",
  },
];

export const FULL_USER_SCRIPT = `Halo, selamat datang.

Pernahkah kamu membayangkan sebuah kecerdasan buatan yang bukan hanya mampu menjawab pertanyaan, tetapi juga bisa berbicara seperti manusia sungguhan?

Bayangkan kamu sedang berada di tengah malam. Hujan turun perlahan, suara petir terdengar dari kejauhan, dan tiba-tiba sebuah suara berkata dengan tenang...

“Tenang. Aku di sini. Kita akan menyelesaikan semuanya bersama-sama.”

Sekarang, mari kita uji kemampuan pengucapan angka.

Harga barang ini adalah seratus dua puluh lima ribu lima ratus rupiah. Nomor kode produknya adalah A-I-2026-B, dan waktu sekarang menunjukkan pukul tujuh lewat tiga puluh lima menit malam.

Terakhir, ucapkan kalimat ini dengan penuh semangat, tetapi tetap terdengar alami:

“Teknologi bukan sekadar tentang mesin. Teknologi adalah tentang bagaimana kita menciptakan sesuatu yang sebelumnya dianggap mustahil.”`;

export const FULL_SCRIPT_DEFAULT_STYLE =
  "Natural, expressive Indonesian voice actor transitioning smoothly from a warm welcoming opening, to a calm intimate midnight reassurance, to crisp number and code articulation, and finishing with an inspiring, passionate yet natural conclusion";

export const INITIAL_SEGMENTS: ScriptSegment[] = [
  {
    id: "seg-01",
    indexLabel: "01. Pembukaan & Imajinasi",
    title: "Sapaan Hangat & Pertanyaan Reflektif",
    category: "Intonasi Narator Natural",
    text: `Halo, selamat datang. <breath> Pernahkah kamu membayangkan sebuah kecerdasan buatan yang bukan hanya mampu menjawab pertanyaan, tetapi juga bisa berbicara seperti manusia sungguhan?`,
    style:
      "Warm, welcoming, curious Indonesian narrator with natural human inflection and conversational pacing",
    voiceName: "Kore",
    ambientRain: false,
    notes: "Menguji kehangatan sapaan awal dan kurva intonasi tanya yang terdengar organik.",
  },
  {
    id: "seg-02",
    indexLabel: "02. Atmosfer Tengah Malam",
    title: "Hujan Perlahan, Petir Kejauhan & Suara Tenang",
    category: "Kontrol Emosi & Dinamika",
    text: `Bayangkan kamu sedang berada di tengah malam. Hujan turun perlahan, suara petir terdengar dari kejauhan, dan tiba-tiba sebuah suara berkata dengan tenang... <breath> “Tenang. Aku di sini. Kita akan menyelesaikan semuanya bersama-sama.”`,
    style:
      "Soft, intimate, calm and deeply reassuring midnight voice in Indonesian, unhurried tempo with gentle warmth",
    voiceName: "Charon",
    ambientRain: true,
    notes: "Menguji transisi dari deskripsi suasana menuju bisikan empatik yang menenangkan di tengah hujan malam.",
  },
  {
    id: "seg-03",
    indexLabel: "03. Uji Presisi Angka & Kode",
    title: "Nominal Rupiah, Kode Alfanumerik & Penunjuk Waktu",
    category: "Artikulasi Diksi & Numerik",
    text: `Sekarang, mari kita uji kemampuan pengucapan angka. Harga barang ini adalah seratus dua puluh lima ribu lima ratus rupiah. Nomor kode produknya adalah A-I-2026-B, dan waktu sekarang menunjukkan pukul tujuh lewat tiga puluh lima menit malam.`,
    style:
      "Crisp, articulate, clear diction in Indonesian, precise pronunciation of currency, spelled letters A-I-2026-B, and evening time",
    voiceName: "Zephyr",
    ambientRain: false,
    notes: "Menguji kejelasan pelafalan nilai mata uang, deret huruf-angka, serta keterangan waktu malam.",
    highlights: [
      { label: "Nominal", value: "Rp 125.500" },
      { label: "Kode Produk", value: "A-I-2026-B" },
      { label: "Waktu", value: "19:35 WIB" },
    ],
  },
  {
    id: "seg-04",
    indexLabel: "04. Penutup Penuh Semangat",
    title: "Manifesto Teknologi yang Tetap Alami",
    category: "Energi Inspiratif & Organik",
    text: `Terakhir, ucapkan kalimat ini dengan penuh semangat, tetapi tetap terdengar alami: <breath> “Teknologi bukan sekadar tentang mesin. Teknologi adalah tentang bagaimana kita menciptakan sesuatu yang sebelumnya dianggap mustahil.”`,
    style:
      "Inspiring, passionate, energetic yet completely natural and grounded Indonesian speaker delivering a powerful closing statement",
    voiceName: "Puck",
    ambientRain: false,
    notes: "Menguji antusiasme tinggi tanpa terdengar kaku atau berlebihan pada penekanan kata kunci.",
  },
];

export const INITIAL_DIALOGUE_TURNS: DialogueTurn[] = [
  {
    id: "turn-1",
    speaker: "Narator",
    text: "Halo, selamat datang. <breath> Pernahkah kamu membayangkan sebuah kecerdasan buatan yang bukan hanya mampu menjawab pertanyaan, tetapi juga bisa berbicara seperti manusia sungguhan?",
    style: "Warm, curious Indonesian host",
  },
  {
    id: "turn-2",
    speaker: "Narator",
    text: "Bayangkan kamu sedang berada di tengah malam. Hujan turun perlahan, suara petir terdengar dari kejauhan, dan tiba-tiba sebuah suara berkata dengan tenang...",
    style: "Soft, atmospheric storyteller",
  },
  {
    id: "turn-3",
    speaker: "SuaraAI",
    text: "Tenang. <breath> Aku di sini. Kita akan menyelesaikan semuanya bersama-sama.",
    style: "Deeply calm, reassuring, warm companion voice",
  },
  {
    id: "turn-4",
    speaker: "Narator",
    text: "Sekarang, mari kita uji kemampuan pengucapan angka. Harga barang ini adalah seratus dua puluh lima ribu lima ratus rupiah. Nomor kode produknya adalah A-I-2026-B, dan waktu sekarang menunjukkan pukul tujuh lewat tiga puluh lima menit malam.",
    style: "Crisp, clear, articulate presenter",
  },
  {
    id: "turn-5",
    speaker: "SuaraAI",
    text: "|mhm| Teknologi bukan sekadar tentang mesin. <breath> Teknologi adalah tentang bagaimana kita menciptakan sesuatu yang sebelumnya dianggap mustahil.",
    style: "Passionate, spirited, inspiring and completely natural",
  },
];
