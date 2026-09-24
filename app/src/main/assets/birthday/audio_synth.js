// Web Audio API Romantic Piano & Sound Effects Synthesizer
class RoyalAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.isMuted = false;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.currentStep = 0;
    this.timerId = null;
    this.analyser = null;

    // Romantic Piano Arpeggio Notes (MIDI note frequencies)
    // Frequencies in Hz: C4=261.63, D4=293.66, E4=329.63, G4=392.00, A4=440.00, B4=493.88, C5=523.25, D5=587.33, E5=659.25, G5=783.99
    this.melodyPattern = [
      // Bar 1: C major / Add9 (Soft, emotional opening)
      { chord: [130.81, 196.00, 261.63, 329.63], melody: 523.25, time: 0 },
      { melody: 587.33, time: 600 },
      { melody: 659.25, time: 1200 },
      { melody: 783.99, time: 1800 },

      // Bar 2: G/B (Longing, romantic)
      { chord: [123.47, 196.00, 293.66, 392.00], melody: 659.25, time: 2400 },
      { melody: 587.33, time: 3000 },
      { melody: 523.25, time: 3600 },
      { melody: 493.88, time: 4200 },

      // Bar 3: A minor 9 (Deep emotional warmth)
      { chord: [110.00, 164.81, 261.63, 329.63], melody: 440.00, time: 4800 },
      { melody: 523.25, time: 5400 },
      { melody: 659.25, time: 6000 },
      { melody: 783.99, time: 6600 },

      // Bar 4: F maj7 (Tender, blooming happiness)
      { chord: [87.31, 174.61, 261.63, 329.63], melody: 659.25, time: 7200 },
      { melody: 523.25, time: 7800 },
      { melody: 440.00, time: 8400 },
      { melody: 392.00, time: 9000 },

      // Bar 5: G sus4 -> G (Triumphant birthday melody)
      { chord: [98.00, 196.00, 261.63, 392.00], melody: 523.25, time: 9600 },
      { melody: 587.33, time: 10200 },
      { chord: [98.00, 196.00, 293.66, 392.00], melody: 659.25, time: 10800 },
      { melody: 783.99, time: 11400 },

      // Bar 6: C major resolve with high chime
      { chord: [130.81, 261.63, 329.63, 523.25], melody: 1046.50, time: 12000 },
      { melody: 783.99, time: 12800 },
      { melody: 659.25, time: 13600 },
      { melody: 523.25, time: 14400 },
    ];
    this.totalLoopDuration = 15200; // ms
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 64;
    this.masterGain.connect(this.analyser);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.setValueAtTime(0.65, this.ctx.currentTime);
    this.musicGain.connect(this.masterGain);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
    this.sfxGain.connect(this.masterGain);
  }

  // Synthesize realistic acoustic piano tone with harmonic overtones and warm lowpass filter
  playPianoNote(freq, duration = 2.5, velocity = 0.6) {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;

    // Filter to give rich wooden soundboard warmth
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(Math.min(freq * 4.5, 4200), t);
    filter.frequency.exponentialRampToValueAtTime(Math.min(freq * 1.8, 1200), t + duration);
    filter.Q.setValueAtTime(1.5, t);
    filter.connect(this.musicGain);

    // Fundamental & Harmonics
    const harmonics = [
      { ratio: 1.0, gain: 0.75 },
      { ratio: 2.0, gain: 0.35 },
      { ratio: 3.0, gain: 0.15 },
      { ratio: 4.0, gain: 0.06 },
    ];

    harmonics.forEach(h => {
      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      osc.type = h.ratio === 1.0 ? "sine" : (h.ratio === 2.0 ? "triangle" : "sine");
      osc.frequency.setValueAtTime(freq * h.ratio, t);

      // Piano envelope: sudden hammer strike, then expressive decay
      const peak = velocity * h.gain;
      noteGain.gain.setValueAtTime(0.0001, t);
      noteGain.gain.linearRampToValueAtTime(peak, t + 0.015);
      noteGain.gain.exponentialRampToValueAtTime(peak * 0.45, t + 0.3);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

      osc.connect(noteGain);
      noteGain.connect(filter);

      osc.start(t);
      osc.stop(t + duration);
    });
  }

  startMusic() {
    this.init();
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    if (this.isPlaying) return;
    this.isPlaying = true;

    const playSequence = () => {
      if (!this.isPlaying) return;
      this.melodyPattern.forEach(item => {
        setTimeout(() => {
          if (!this.isPlaying) return;
          if (item.chord) {
            item.chord.forEach((note, i) => {
              setTimeout(() => this.playPianoNote(note, 3.2, 0.45), i * 35);
            });
          }
          if (item.melody) {
            this.playPianoNote(item.melody, 2.0, 0.7);
          }
        }, item.time);
      });

      this.timerId = setTimeout(() => {
        if (this.isPlaying) playSequence();
      }, this.totalLoopDuration);
    };

    playSequence();
  }

  pauseMusic() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  toggleMusic() {
    if (this.isPlaying) {
      this.pauseMusic();
      return false;
    } else {
      this.startMusic();
      return true;
    }
  }

  // SFX: Realistic Candle Blow Whoosh
  playCandleBlow() {
    this.init();
    const t = this.ctx.currentTime;
    const dur = 1.0;

    // Noise buffer for gentle wind whoosh
    const bufferSize = this.ctx.sampleRate * dur;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(450, t);
    filter.frequency.exponentialRampToValueAtTime(120, t + dur);
    filter.Q.setValueAtTime(3.0, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.7, t + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(t);
  }

  // SFX: Grand Fanfare Chime & Harp Arpeggio
  playCelebrationCheer() {
    this.init();
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98, 2093.00];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playPianoNote(freq, 2.8, 0.75);
      }, idx * 90);
    });
  }

  // SFX: Balloon Pop
  playBalloonPop() {
    this.init();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.12);

    gain.gain.setValueAtTime(0.9, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.13);
  }

  // SFX: Wax Seal Crack & Parchment Unfold
  playWaxSeal() {
    this.init();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(500, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.18);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.2);

    // Warm chord response
    setTimeout(() => {
      this.playPianoNote(659.25, 2.0, 0.5);
      this.playPianoNote(783.99, 2.2, 0.4);
    }, 150);
  }

  // SFX: Sparkle Twinkle
  playSparkle() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const freq = 1200 + Math.random() * 800;
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.36);
  }
}

window.royalAudio = new RoyalAudioEngine();
