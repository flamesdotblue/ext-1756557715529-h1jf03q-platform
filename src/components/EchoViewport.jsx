import { useEffect, useRef, useState } from 'react';

// Simple pseudo ultrasound renderer for training UI interactions
// Not a medical device. Visuals are stylized to mimic echo noise, sweep and cardiac motion.

export default function EchoViewport({
  preset,
  mode,
  gain,
  depth,
  heartRate,
  frozen,
  measurementTool,
  onAddMeasurement,
}) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const [points, setPoints] = useState([]); // for 2-point distance
  const [mTrace, setMTrace] = useState([]); // array of values for M-mode trace

  // Compute scale: pixels per cm based on canvas height and selected depth
  const getScale = (h) => h / depth;

  const drawBackground = (ctx, w, h) => {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, w, h);
  };

  const drawGraticule = (ctx, w, h, scale) => {
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    // Horizontal cm marks
    const cm = Math.floor(depth);
    for (let i = 0; i <= cm; i++) {
      const y = Math.floor(i * scale) + 0.5;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    // Vertical sweep lines
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, h);
      ctx.stroke();
    }
    ctx.restore();
  };

  const prng = (seed) => {
    let s = seed >>> 0;
    return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  };

  const drawUltrasoundNoise = (ctx, w, h, gainVal, t) => {
    const rng = prng(Math.floor(t * 1000));
    const density = 0.08 + (gainVal / 100) * 0.25; // gain increases speckle density
    const count = Math.floor(w * h * density * 0.002);
    for (let i = 0; i < count; i++) {
      const x = Math.floor(rng() * w);
      const y = Math.floor(rng() * h);
      const alpha = 0.05 + rng() * (gainVal / 100) * 0.6;
      ctx.fillStyle = `rgba(200, 220, 255, ${alpha.toFixed(3)})`;
      ctx.fillRect(x, y, 1, 1);
    }
  };

  const heartMotion = (t, hr) => {
    // Simple sinusoid to represent cardiac cycle, scaled for pediatrics
    const freq = hr / 60; // Hz
    const phase = (t * freq * 2 * Math.PI) % (2 * Math.PI);
    const contraction = (Math.sin(phase) + 1) / 2; // 0..1
    return contraction;
  };

  const drawChambers = (ctx, w, h, t, hr, presetName) => {
    const c = heartMotion(t, hr);
    ctx.save();
    // Focus on left side of canvas for apical views
    const centerX = presetName === 'PLAX' ? w * 0.45 : presetName === 'PSAX' ? w * 0.5 : w * 0.4;
    const centerY = presetName === 'PSAX' ? h * 0.45 : h * 0.55;

    // LV ellipse
    const lvScale = 1 - c * 0.15; // smaller during systole
    ctx.strokeStyle = 'rgba(180,220,255,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, 80 * lvScale, 120 * lvScale, -0.2, 0, Math.PI * 2);
    ctx.stroke();

    // RV shape
    ctx.beginPath();
    ctx.ellipse(centerX + 90, centerY + 10, 60 * (1 - c * 0.1), 100 * (1 - c * 0.1), -0.1, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(160,200,255,0.35)';
    ctx.stroke();

    // Mitral valve motion hint
    ctx.beginPath();
    const mvOpen = 0.2 + 0.5 * (1 - c);
    ctx.moveTo(centerX - 40, centerY);
    ctx.quadraticCurveTo(centerX, centerY - 20 * mvOpen, centerX + 40, centerY);
    ctx.strokeStyle = 'rgba(200,240,255,0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  };

  const drawMMode = (ctx, w, h, t, hr) => {
    // Append new line to M-mode trace based on mock LV wall position
    const c = heartMotion(t, hr);
    const y = h * (0.3 + 0.25 * c);
    const maxWidth = Math.floor(w);
    const newTrace = [...mTrace, y];
    if (newTrace.length > maxWidth) newTrace.shift();
    setMTrace(newTrace);

    // Render trace
    ctx.save();
    ctx.strokeStyle = 'rgba(0,255,200,0.9)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < newTrace.length; x++) {
      const yy = newTrace[x];
      if (x === 0) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.stroke();
    ctx.restore();
  };

  const drawDoppler = (ctx, w, h, t, hr) => {
    // Simple pulsed-wave Doppler envelope mock
    const freq = hr / 60;
    const phase = (t * freq * 2 * Math.PI) % (2 * Math.PI);
    const v = Math.max(0, Math.sin(phase) * 0.9); // forward flow only
    const baseline = h * 0.6;
    const peak = baseline - v * (h * 0.45);

    // Envelope sweep
    const x = Math.floor((t * 120) % w);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = 'rgba(0,255,180,0.8)';
    ctx.beginPath();
    ctx.moveTo(x, baseline);
    ctx.lineTo(x, peak);
    ctx.stroke();
    ctx.restore();
  };

  const render = (time) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    const t = time / 1000;
    drawBackground(ctx, w, h);
    const scale = getScale(h);
    drawGraticule(ctx, w, h, scale);

    drawUltrasoundNoise(ctx, w, h, gain, t);
    drawChambers(ctx, w, h, t, heartRate, preset);

    if (mode === 'M-mode') {
      drawMMode(ctx, w, h, t, heartRate);
    }
    if (mode === 'Doppler') {
      drawDoppler(ctx, w, h, t, heartRate);
    }

    // Draw measurement points/lines
    if (points.length > 0) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255,200,0,0.9)';
      ctx.fillStyle = 'rgba(255,200,0,0.9)';
      ctx.lineWidth = 2;
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      if (points.length === 2) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        ctx.lineTo(points[1].x, points[1].y);
        ctx.stroke();
      }
      ctx.restore();
    }

    if (!frozen) {
      rafRef.current = requestAnimationFrame(render);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [depth]);

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    if (!frozen) {
      rafRef.current = requestAnimationFrame(render);
    }
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset, mode, gain, depth, heartRate, frozen]);

  const handleClick = (e) => {
    if (frozen) return; // typically measure on freeze; adjust for training purposes
    if (measurementTool !== 'Distance') return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const next = [...points, { x, y }].slice(-2);
    setPoints(next);
    if (next.length === 2) {
      const dx = next[1].x - next[0].x;
      const dy = next[1].y - next[0].y;
      const px = Math.hypot(dx, dy);
      const scale = getScale(e.currentTarget.height); // px per cm
      const cm = px / scale;
      onAddMeasurement({
        type: 'Distance',
        value: cm,
        unit: 'cm',
        meta: { preset, mode, gain, depth, heartRate },
        timestamp: Date.now(),
      });
      setPoints([]);
    }
  };

  return (
    <div className="relative rounded-xl border border-neutral-800 bg-neutral-900/50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-800">
        <div className="text-sm text-neutral-300">
          {preset} · {mode} · Depth {depth} cm · Gain {gain}% · HR {heartRate} bpm
        </div>
        <div className="text-xs text-neutral-500">
          {measurementTool === 'Distance' ? 'Click two points to measure (cm)' : 'Use controls to change mode and view'}
        </div>
      </div>
      <div className="relative h-[420px]">
        <canvas
          ref={canvasRef}
          onClick={handleClick}
          className="w-full h-full cursor-crosshair"
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-neutral-950/70 to-transparent" />
      </div>
    </div>
  );
}
