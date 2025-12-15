import { NOTES } from '../constants';

class AudioService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Initialize lazily on first interaction to comply with browser policies
  }

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public playNote(seed: number) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Pick a note from the pentatonic scale based on the seed (key code)
    const noteIndex = seed % NOTES.length;
    const frequency = NOTES[noteIndex];

    // Add some random detune for "chorus" effect or variety
    const detune = (Math.random() - 0.5) * 10; 

    osc.type = Math.random() > 0.5 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
    osc.detune.setValueAtTime(detune, this.ctx.currentTime);

    // Envelope for a "cute bell" or "bubble" sound
    const now = this.ctx.currentTime;
    const duration = 0.5 + Math.random() * 0.5;

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.05); // Attack
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration); // Decay

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  public playSpaceSound() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    // A sweep sound for spacebar
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.4);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.1);
    gain.gain.linearRampToValueAtTime(0, now + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  }
}

export const audioService = new AudioService();
