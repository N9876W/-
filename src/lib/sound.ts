// Direct Web Audio API Synthesizer for high-quality, lightweight UI feedback sounds.
// This is completely offline, 100% reliable, and doesn't require any asset downloading.

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  // Lazy initialize to bypass browser autoplay restrictions
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  return audioCtx;
}

// 1. Standard Button Click - Short, crispy digital tick
export function playClickSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Resume context if suspended (browser behavior)
  if (ctx.state === "suspended") {
    ctx.resume();
  }

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = "sine";
  // Drop frequency from 1200Hz to 600Hz extremely fast to sound like classic clean bubble pop/click
  osc.frequency.setValueAtTime(1000, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.08);

  gain.gain.setValueAtTime(0.12, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.09);
}

// 2. Paper Slide/Card Flip sound - Custom noise filter/sweeping bandpass filter to sound organic
export function playPaperSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") ctx.resume();

  // We synthesize a quick rustle using a low pitch sine sweep with a fast ramp down and random noise if possible,
  // or a triangle wave frequency sweep mimicking paper movement.
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = "triangle";
  // Low pitch sliding down simulates paper/cloth sliding
  osc.frequency.setValueAtTime(150, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.2);

  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  // Multi-stage envelope for card flip "rustle"
  gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.06);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.26);
}

// 3. Confirm/Success Chime - Warm uplifting minor-then-major chord progression (fast two-tone)
export function playSuccessSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") ctx.resume();

  const playTone = (freq: number, delay: number, dur: number, vol: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
    // Smooth fade
    gain.gain.setValueAtTime(0.0, ctx.currentTime + delay);
    gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + delay + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur);

    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + dur + 0.02);
  };

  // Uplifting chord progression: C5 (523.25Hz) after a slight delay, then G5 (783.99Hz)
  playTone(523.25, 0, 0.15, 0.08);     // C5
  playTone(659.25, 0.06, 0.22, 0.08);   // E5
  playTone(783.99, 0.12, 0.35, 0.1);    // G5
}

// 4. Night/Day Transition Glockenspiel / Warning Gong
export function playBellSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") ctx.resume();

  const playBellFreq = (freq: number, dur: number, vol: number, type: OscillatorType = "sine") => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + dur + 0.05);
  };

  // Bell has rich harmonics. We play a root frequency E4 (329.63Hz) and a higher harmonic B5 (987.77Hz)
  playBellFreq(329.63, 1.2, 0.15, "triangle"); // Warm base
  playBellFreq(659.25, 0.8, 0.08, "sine");     // Second harmonic (E5)
  playBellFreq(987.77, 0.6, 0.05, "sine");     // Fifth harmonic (B5 - bright metallic resonance)
}

// 5. Deletion/Fail/Negative feedback gong
export function playFailSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") ctx.resume();

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = "sawtooth";
  // Detuning to sound harsh/low action feedback
  osc.frequency.setValueAtTime(140, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.25);

  gain.gain.setValueAtTime(0.12, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.3);
}
