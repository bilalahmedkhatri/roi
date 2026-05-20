"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useGame } from "./GameProvider";
import { multiplierAt } from "@/lib/game/multiplier";

const GROWTH_RATE = 0.06;

interface TrailPoint {
  t: number;
  m: number;
  x: number;
  y: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { state, activeBets, roundResult } = useGame();
  const [dimensions, setDimensions] = useState({ w: 800, h: 600 });
  const trailRef = useRef<TrailPoint[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number | undefined>(undefined);
  const elapsedRef = useRef(0);
  const crashFlashRef = useRef(0);

  useEffect(() => {
    function resize() {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ w: rect.width, h: rect.height });
      }
    }
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const toCanvasX = useCallback(
    (t: number, maxT: number) => {
      return dimensions.w * 0.1 + (t / maxT) * dimensions.w * 0.8;
    },
    [dimensions.w]
  );

  const toCanvasY = useCallback(
    (m: number, maxM: number) => {
      const logM = Math.log(m);
      const logMax = Math.log(Math.max(maxM, 1.01));
      return dimensions.h * 0.85 - (logM / logMax) * dimensions.h * 0.7;
    },
    [dimensions.h]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = dimensions.w;
    canvas.height = dimensions.h;

    const isPlaying = state?.phase === "playing";
    const isCrashed = state?.phase === "crashed";
    const crashM = state?.crashMultiplier ?? 1;
    const elapsedMs = state?.elapsedMs ?? 0;
    const currentM = state?.currentMultiplier ?? 1;

    elapsedRef.current = elapsedMs;

    const maxExpectedM = isCrashed ? crashM * 1.15 : Math.max(currentM * 1.5, 2);
    const maxM = Math.max(maxExpectedM, crashM * 1.1);

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, dimensions.w, dimensions.h);
      const tSec = elapsedRef.current / 1000;
      const m = multiplierAt(tSec);

      drawBackground(ctx, dimensions.w, dimensions.h);
      drawGrid(ctx, dimensions.w, dimensions.h, maxM);

      if (isPlaying || isCrashed) {
        const trail = trailRef.current;
        if (isPlaying) {
          const x = toCanvasX(tSec, (Math.log(maxM) / GROWTH_RATE));
          const y = toCanvasY(m, maxM);
          trail.push({ t: tSec, m, x, y });
          if (trail.length > 500) trail.shift();
        }

        drawTrail(ctx, trail, maxM, dimensions);
        drawMultiplier(ctx, dimensions, m, isCrashed);

        if (isPlaying) {
          const x = toCanvasX(tSec, (Math.log(maxM) / GROWTH_RATE));
          const y = toCanvasY(m, maxM);
          updateParticles(particlesRef, x, y);
          drawParticles(ctx, particlesRef);
          drawPlane(ctx, x, y, dimensions);
        }

        if (isCrashed) {
          crashFlashRef.current = Math.min(crashFlashRef.current + 0.05, 1);
          drawCrashEffect(ctx, dimensions, crashM, crashFlashRef.current);
        }
      }

      if (state?.phase === "cooldown" || state?.phase === "betting") {
        trailRef.current = [];
        particlesRef.current = [];
        crashFlashRef.current = 0;
        drawIdleState(ctx, dimensions);
      }

      animRef.current = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [dimensions, state?.phase, state?.crashMultiplier, toCanvasX, toCanvasY]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full rounded-xl overflow-hidden bg-[#0f1923]"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
      <div className="absolute inset-0 pointer-events-none z-20">
        {activeBets
          .filter((b) => b.status === "cashed")
          .map((bet) => (
            <div
              key={bet.id}
              className="absolute text-[10px] font-bold text-green-400 animate-fade-up"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${10 + Math.random() * 30}%`,
                textShadow: "0 0 10px rgba(34,197,94,0.5)",
              }}
            >
              ${bet.payoutAmount.toFixed(2)} @ {bet.cashoutMultiplier?.toFixed(2)}x
            </div>
          ))}
      </div>
    </div>
  );
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
) {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "#0a1628");
  grad.addColorStop(0.5, "#0f1923");
  grad.addColorStop(1, "#0d1117");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  maxM: number
) {
  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  ctx.lineWidth = 1;

  for (let i = 1; i <= Math.ceil(maxM); i++) {
    if (i % 2 !== 0) continue;
    const logM = Math.log(i);
    const logMax = Math.log(Math.max(maxM, 1.01));
    const y = h * 0.85 - (logM / logMax) * h * 0.7;

    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.font = "11px monospace";
    ctx.textAlign = "left";
    ctx.fillText(`${i}x`, 6, y - 4);
  }
}

function drawTrail(
  ctx: CanvasRenderingContext2D,
  trail: TrailPoint[],
  maxM: number,
  dims: { w: number; h: number }
) {
  if (trail.length < 2) return;

  const grad = ctx.createLinearGradient(
    trail[0].x,
    trail[0].y,
    trail[trail.length - 1].x,
    trail[trail.length - 1].y
  );
  grad.addColorStop(0, "rgba(0, 255, 136, 0.1)");
  grad.addColorStop(0.5, "rgba(0, 255, 136, 0.5)");
  grad.addColorStop(1, "rgba(0, 255, 136, 0.9)");

  ctx.beginPath();
  ctx.moveTo(trail[0].x, trail[0].y);
  for (let i = 1; i < trail.length; i++) {
    ctx.lineTo(trail[i].x, trail[i].y);
  }
  ctx.strokeStyle = grad;
  ctx.lineWidth = 3;
  ctx.shadowColor = "rgba(0, 255, 136, 0.3)";
  ctx.shadowBlur = 10;
  ctx.stroke();
  ctx.shadowBlur = 0;

  if (trail.length > 5) {
    ctx.beginPath();
    ctx.moveTo(trail[trail.length - 1].x, trail[trail.length - 1].y);
    for (let i = trail.length - 5; i < trail.length; i++) {
      ctx.lineTo(trail[i].x, trail[i].y);
    }
    ctx.strokeStyle = "rgba(0, 255, 136, 0.4)";
    ctx.lineWidth = 8;
    ctx.stroke();
  }
}

function drawMultiplier(
  ctx: CanvasRenderingContext2D,
  dims: { w: number; h: number },
  m: number,
  isCrashed: boolean
) {
  const text = `${m.toFixed(2)}x`;
  const size = Math.min(dims.w, dims.h) * 0.08;
  const fontSize = Math.max(32, Math.min(64, size));

  ctx.font = `bold ${fontSize}px monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const x = dims.w / 2;
  const y = dims.h / 2 - 20;

  ctx.shadowColor = isCrashed
    ? "rgba(255, 50, 50, 0.5)"
    : "rgba(0, 255, 136, 0.4)";
  ctx.shadowBlur = 30;
  ctx.fillStyle = isCrashed ? "#ff3344" : "#00ff88";
  ctx.fillText(text, x, y);
  ctx.shadowBlur = 0;
}

function drawPlane(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  dims: { w: number; h: number }
) {
  ctx.save();
  ctx.translate(x, y);

  const angle = -Math.PI / 4;
  ctx.rotate(angle);

  const s = Math.min(dims.w, dims.h) * 0.035;

  ctx.shadowColor = "rgba(0, 200, 255, 0.6)";
  ctx.shadowBlur = 20;

  ctx.fillStyle = "#00ccff";
  ctx.beginPath();
  ctx.moveTo(s * 2, 0);
  ctx.lineTo(-s * 1.5, -s * 0.8);
  ctx.lineTo(-s * 0.8, 0);
  ctx.lineTo(-s * 1.5, s * 0.8);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#0088ff";
  ctx.beginPath();
  ctx.moveTo(s * 1.2, 0);
  ctx.lineTo(-s * 0.5, -s * 0.4);
  ctx.lineTo(-s * 0.5, s * 0.4);
  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.restore();
}

function updateParticles(
  particlesRef: React.MutableRefObject<Particle[]>,
  x: number,
  y: number
) {
  const particles = particlesRef.current;

  for (let i = 0; i < 2; i++) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 2,
      vy: Math.random() * 2 + 1,
      life: 0,
      maxLife: 20 + Math.random() * 30,
      size: 1.5 + Math.random() * 2.5,
    });
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life++;
    if (p.life > p.maxLife) {
      particles.splice(i, 1);
    }
  }

  if (particles.length > 300) {
    particles.splice(0, particles.length - 300);
  }
}

function drawParticles(ctx: CanvasRenderingContext2D, particlesRef: React.MutableRefObject<Particle[]>) {
  for (const p of particlesRef.current) {
    const alpha = 1 - p.life / p.maxLife;
    ctx.fillStyle = `rgba(0, 200, 255, ${alpha * 0.6})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCrashEffect(
  ctx: CanvasRenderingContext2D,
  dims: { w: number; h: number },
  crashM: number,
  flash: number
) {
  const alpha = Math.max(0, 1 - flash * 2);
  if (alpha <= 0) return;

  const grad = ctx.createRadialGradient(
    dims.w / 2,
    dims.h / 2,
    0,
    dims.w / 2,
    dims.h / 2,
    Math.max(dims.w, dims.h) * 0.6
  );
  grad.addColorStop(0, `rgba(255, 50, 50, ${alpha * 0.15})`);
  grad.addColorStop(1, "rgba(255, 50, 50, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, dims.w, dims.h);

  ctx.fillStyle = `rgba(255, 50, 50, ${alpha * 0.08})`;
  ctx.fillRect(0, 0, dims.w, dims.h);

  const shakeX = (Math.random() - 0.5) * 6 * alpha;
  const shakeY = (Math.random() - 0.5) * 6 * alpha;

  ctx.font = `bold ${48 * (0.5 + alpha * 0.5)}px monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = `rgba(255, 0, 0, ${alpha * 0.8})`;
  ctx.shadowBlur = 40;
  ctx.fillStyle = `rgba(255, 50, 50, ${alpha})`;
  ctx.fillText("CRASHED!", dims.w / 2 + shakeX, dims.h / 2 + 40 + shakeY);
  ctx.shadowBlur = 0;

  ctx.font = "bold 24px monospace";
  ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
  ctx.fillText(
    `${crashM.toFixed(2)}x`,
    dims.w / 2 + shakeX,
    dims.h / 2 + 90 + shakeY
  );
}

function drawIdleState(
  ctx: CanvasRenderingContext2D,
  dims: { w: number; h: number }
) {
  ctx.fillStyle = "rgba(255,255,255,0.05)";
  ctx.font = "18px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Waiting for next round...", dims.w / 2, dims.h / 2);
}
