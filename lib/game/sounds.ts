"use client";

let audioCtx: AudioContext | null = null;

function isAudioEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const muted = (window as any).__gameSoundsMuted;
    return muted !== true;
  } catch {
    return true;
  }
}

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
  volume = 0.15,
  ramp = true
) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    if (ramp) {
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    } else {
      gain.gain.setValueAtTime(volume, ctx.currentTime);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch { /* audio not available */ }
}

export function playBetPlaced() {
  if (!isAudioEnabled()) return;
  playTone(600, 0.1, "square", 0.08);
  setTimeout(() => playTone(800, 0.15, "square", 0.08), 60);
}

export function playCashout() {
  if (!isAudioEnabled()) return;
  const ctx = getCtx();
  const now = ctx.currentTime;

  playTone(523, 0.15, "sine", 0.1);
  setTimeout(() => playTone(659, 0.15, "sine", 0.1), 80);
  setTimeout(() => playTone(784, 0.3, "sine", 0.12), 160);

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(988, now + 0.24);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.12, now + 0.28);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now + 0.24);
  osc.stop(now + 0.8);
}

export function playCrash() {
  if (!isAudioEnabled()) return;
  const ctx = getCtx();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(200, now);
  osc.frequency.exponentialRampToValueAtTime(40, now + 0.6);
  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.8);

  const noise = ctx.createBufferSource();
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.4, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  }
  noise.buffer = buffer;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.15, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
  noise.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start(now);
}

export function playRoundStart() {
  if (!isAudioEnabled()) return;
  playTone(440, 0.1, "sine", 0.08);
  setTimeout(() => playTone(554, 0.1, "sine", 0.08), 100);
  setTimeout(() => playTone(659, 0.2, "sine", 0.1), 200);
}

export function playCooldown() {
  if (!isAudioEnabled()) return;
  playTone(330, 0.08, "sine", 0.05);
}
