/**
 * Procedural Web Audio API synthesizer for Midnight Rain & Distant Thunder
 * ("Hujan turun perlahan, suara petir terdengar dari kejauhan")
 */
export class MidnightRainAtmosphere {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private rainSource: AudioBufferSourceNode | null = null;
  private thunderTimer: number | null = null;
  private isPlaying = false;
  private currentVolume = 0.22;

  public start(volume = 0.22) {
    if (this.isPlaying) return;
    this.currentVolume = volume;

    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioCtx();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    this.masterGain.gain.exponentialRampToValueAtTime(
      Math.max(0.01, this.currentVolume),
      this.ctx.currentTime + 1.2
    );
    this.masterGain.connect(this.ctx.destination);

    // Generate 4 seconds of looping pink/brown-tinted rain noise
    const sampleRate = this.ctx.sampleRate;
    const bufferSize = sampleRate * 4;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let b0 = 0,
      b1 = 0,
      b2 = 0,
      b3 = 0,
      b4 = 0,
      b5 = 0,
      b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.035;
      b6 = white * 0.115926;
    }

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.value = 1150;
    bandpass.Q.value = 0.65;

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 2600;

    this.rainSource = this.ctx.createBufferSource();
    this.rainSource.buffer = noiseBuffer;
    this.rainSource.loop = true;

    this.rainSource.connect(bandpass);
    bandpass.connect(lowpass);
    lowpass.connect(this.masterGain);
    this.rainSource.start();

    this.isPlaying = true;

    // Trigger an initial distant thunder rumble after 1.5s, then periodically
    this.triggerDistantThunder();
    this.thunderTimer = window.setInterval(() => {
      if (this.isPlaying) {
        this.triggerDistantThunder();
      }
    }, 9500);
  }

  public triggerDistantThunder() {
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const duration = 3.6;
    const sampleRate = this.ctx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      const env = Math.sin((i / length) * Math.PI);
      data[i] = (Math.random() * 2 - 1) * env;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(145, now);
    filter.frequency.exponentialRampToValueAtTime(55, now + duration);

    const rumbleGain = this.ctx.createGain();
    rumbleGain.gain.setValueAtTime(0.001, now);
    rumbleGain.gain.linearRampToValueAtTime(0.65, now + 0.45);
    rumbleGain.gain.exponentialRampToValueAtTime(0.28, now + 1.4);
    rumbleGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    source.connect(filter);
    filter.connect(rumbleGain);
    rumbleGain.connect(this.masterGain);

    source.start(now);
    source.stop(now + duration);
  }

  public setVolume(volume: number) {
    this.currentVolume = volume;
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(
        Math.max(0.001, volume),
        this.ctx.currentTime,
        0.1
      );
    }
  }

  public stop() {
    if (!this.isPlaying) return;
    this.isPlaying = false;

    if (this.thunderTimer !== null) {
      clearInterval(this.thunderTimer);
      this.thunderTimer = null;
    }

    try {
      if (this.rainSource) {
        this.rainSource.stop();
        this.rainSource.disconnect();
        this.rainSource = null;
      }
      if (this.ctx) {
        this.ctx.close();
        this.ctx = null;
      }
    } catch {
      // Ignore audio teardown errors
    }
  }

  public get active(): boolean {
    return this.isPlaying;
  }
}
