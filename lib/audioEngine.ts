'use client';

class AetheriaAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;
  private droneGain2: GainNode | null = null;
  private reverbNode: ConvolverNode | null = null;
  private tremoloLFO: OscillatorNode | null = null;
  private tremoloGain: GainNode | null = null;
  private isInitialized = false;
  private muted = false;

  public init() {
    if (this.isInitialized || typeof window === 'undefined') return;

    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.8;
    this.masterGain.connect(this.ctx.destination);

    // Reverb
    this.reverbNode = this.buildReverb(2.5, 2.0);
    this.reverbNode.connect(this.masterGain);

    // Drone Signal Chain
    this.droneGain = this.ctx.createGain();
    this.droneGain2 = this.ctx.createGain();
    this.droneGain.gain.value = 0.03;
    this.droneGain2.gain.value = 0;

    this.tremoloGain = this.ctx.createGain();
    this.tremoloLFO = this.ctx.createOscillator();
    this.tremoloLFO.type = 'sine';
    this.tremoloLFO.frequency.value = 0.1;
    
    const tremoloDepth = this.ctx.createGain();
    tremoloDepth.gain.value = 0.3;
    
    this.tremoloLFO.connect(tremoloDepth);
    tremoloDepth.connect(this.tremoloGain.gain);
    this.tremoloGain.gain.value = 0.7; // Base gain around which tremolo fluctuates

    this.droneOsc1 = this.ctx.createOscillator();
    this.droneOsc2 = this.ctx.createOscillator();
    this.droneOsc1.type = 'sine';
    this.droneOsc2.type = 'sine';
    this.droneOsc1.frequency.value = 55;
    this.droneOsc2.frequency.value = 110;

    this.droneOsc1.connect(this.droneGain);
    this.droneOsc2.connect(this.droneGain2);
    this.droneGain.connect(this.tremoloGain);
    this.droneGain2.connect(this.tremoloGain);
    this.tremoloGain.connect(this.reverbNode);

    this.droneOsc1.start();
    this.droneOsc2.start();
    this.tremoloLFO.start();

    this.isInitialized = true;
  }

  private buildReverb(duration: number, decay: number): ConvolverNode {
    if (!this.ctx) throw new Error("AudioContext not initialized");
    const sampleRate = this.ctx.sampleRate;
    const length = sampleRate * duration;
    const impulse = this.ctx.createBuffer(2, length, sampleRate);
    
    for (let i = 0; i < 2; i++) {
      const channelData = impulse.getChannelData(i);
      for (let j = 0; j < length; j++) {
        channelData[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / length, decay);
      }
    }

    const node = this.ctx.createConvolver();
    node.buffer = impulse;
    return node;
  }

  public setOrbCount(count: number) {
    if (!this.ctx || !this.droneOsc1 || !this.droneOsc2 || !this.droneGain || !this.droneGain2 || !this.tremoloLFO || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const rampTime = 2;

    if (count === 0) {
      this.droneOsc1.frequency.linearRampToValueAtTime(55, now + rampTime);
      this.droneGain.gain.linearRampToValueAtTime(0.03, now + rampTime);
      this.droneGain2.gain.linearRampToValueAtTime(0, now + rampTime);
      this.tremoloLFO.frequency.linearRampToValueAtTime(0.1, now + rampTime);
    } else if (count <= 3) {
      this.droneOsc1.frequency.linearRampToValueAtTime(60, now + rampTime);
      this.droneGain.gain.linearRampToValueAtTime(0.03, now + rampTime);
      this.droneGain2.gain.linearRampToValueAtTime(0, now + rampTime);
      this.tremoloLFO.frequency.linearRampToValueAtTime(0.15, now + rampTime);
    } else if (count <= 7) {
      this.droneOsc1.frequency.linearRampToValueAtTime(80, now + rampTime);
      this.droneOsc2.frequency.linearRampToValueAtTime(120, now + rampTime);
      this.droneGain.gain.linearRampToValueAtTime(0.03, now + rampTime);
      this.droneGain2.gain.linearRampToValueAtTime(0.015, now + rampTime);
      this.tremoloLFO.frequency.linearRampToValueAtTime(0.3, now + rampTime);
    } else {
      this.droneOsc1.frequency.linearRampToValueAtTime(100, now + rampTime);
      this.droneOsc2.frequency.linearRampToValueAtTime(160, now + rampTime);
      this.droneGain.gain.linearRampToValueAtTime(0.03, now + rampTime);
      this.droneGain2.gain.linearRampToValueAtTime(0.015, now + rampTime);
      this.tremoloLFO.frequency.linearRampToValueAtTime(0.5, now + rampTime);
    }
  }

  public playChime() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1320, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    const overtoneGain = this.ctx.createGain();
    overtoneGain.gain.value = 0.08;
    osc2.connect(overtoneGain);
    overtoneGain.connect(gain);
    
    osc.connect(gain);
    gain.connect(this.reverbNode || this.masterGain);

    osc.start(now);
    osc2.start(now);
    osc.stop(now + 0.3);
    osc2.stop(now + 0.3);
  }

  public playBurn() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.9);
    
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.9);

    // Noise burst
    const bufferSize = this.ctx.sampleRate * 0.05;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.1, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    
    noise.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    
    osc.connect(gain);
    gain.connect(this.reverbNode || this.masterGain);

    osc.start(now);
    noise.start(now);
    osc.stop(now + 0.9);
  }

  public playMerge() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.frequency.setValueAtTime(523, now);
    osc2.frequency.setValueAtTime(659, now);
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.reverbNode || this.masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.6);
    osc2.stop(now + 0.6);
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    this.masterGain.gain.linearRampToValueAtTime(muted ? 0 : 0.8, now + 0.3);
  }

  public destroy() {
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
      this.isInitialized = false;
    }
  }
}

export const audioEngine = new AetheriaAudioEngine();
