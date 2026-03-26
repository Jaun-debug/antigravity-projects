'use client';

import React, { useEffect, useRef } from 'react';

class Particle3D {
  x: number;
  y: number;
  z: number; // 0.1 (far) to 1.0 (close)
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  layer: 'bg' | 'mid' | 'fg';

  constructor(width: number, height: number, color: string) {
    // Cluster them tightly in the center, rather than scattering across whole screen
    const centerX = width / 2;
    const centerY = height / 2;
    // max radius constrained to the center area
    const maxRadius = Math.min(width, height) * 0.45; 
    const r = Math.pow(Math.random(), 0.5) * maxRadius;
    const theta = Math.random() * 2 * Math.PI;
    
    this.x = centerX + r * Math.cos(theta);
    this.y = centerY + r * Math.sin(theta);
    this.originX = this.x;
    this.originY = this.y;
    this.vx = 0;
    this.vy = 0;
    
    // Assign to a layer for distinct depth behaviors
    const rand = Math.random();
    if (rand < 0.5) {
      this.z = 0.15; this.layer = 'bg'; 
    } else if (rand < 0.85) {
      this.z = 0.5; this.layer = 'mid'; 
    } else {
      this.z = 1.0; this.layer = 'fg';  
    }
    
    // Crisp, small, uniform size regardless of depth
    this.size = Math.random() * 1.2 + 1.2; 
    this.color = color;
  }

  update(mouseX: number, mouseY: number) {
    const dx = mouseX - this.x;
    const dy = mouseY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Background layers react MUCH slower/weaker to the cursor
    const reactivity = this.z;

    if (mouseX !== -2000) {
      // Absolute Swarm Attraction physics
      // They follow EXACTLY where the cursor goes!
      const force = 120 / (dist + 20); // Smooth inverse-distance scaling
      const angle = Math.atan2(dy, dx);
      
      // Intense direct pulling velocity
      this.vx += Math.cos(angle) * force * 3.5 * reactivity;
      this.vy += Math.sin(angle) * force * 3.5 * reactivity;
      
      // Elegant perpendicular orbiting so they don't visibly overlap into one dot
      this.vx += Math.cos(angle + Math.PI / 2.5) * force * 1.5 * reactivity;
      this.vy += Math.sin(angle + Math.PI / 2.5) * force * 1.5 * reactivity;
    } else {
      // Return to original initial cluster only when mouse leaves the window entirely
      this.vx += (this.originX - this.x) * 0.003 * reactivity;
      this.vy += (this.originY - this.y) * 0.003 * reactivity;
    }

    // Always float organically (Perlin-style drift)
    this.vx += (Math.random() - 0.5) * 0.1 * reactivity;
    this.vy += (Math.random() - 0.5) * 0.1 * reactivity;

    // High friction so they rigidly track the cursor without exploding across screen
    this.vx *= 0.88;
    this.vy *= 0.88;

    this.x += this.vx;
    this.y += this.vy;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    
    // Smooth, deep transparency falloff based on Z depth and origin drift
    const movementAlpha = Math.min(1, Math.max(0.1, 1 - (Math.abs(this.originX - this.x) / 400)));
    // Z controls base opacity: 0.15 for bg, 0.4 for mid, 0.9 for fg
    const baseAlpha = this.z === 1.0 ? 0.9 : (this.z === 0.5 ? 0.35 : 0.12);
    
    ctx.globalAlpha = movementAlpha * baseAlpha; 
    
    // Crisp aesthetic - no blurry shadows at all
    ctx.shadowBlur = 0;
    
    ctx.fill();
    ctx.closePath();
    ctx.globalAlpha = 1.0;
  }
}

export default function ParticleField3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle3D[] = [];
    let animationFrameId: number;

    const brightColors = ['#3B82F6', '#8B5CF6', '#F97316', '#EF4444'];
    let mouse = { x: -2000, y: -2000 };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      particles = [];
      // Dense 700 particle swarm
      const particleCount = window.innerWidth < 768 ? 300 : 700; 
      for (let i = 0; i < particleCount; i++) {
        const color = brightColors[Math.floor(Math.random() * brightColors.length)];
        particles.push(new Particle3D(canvas.width, canvas.height, color));
      }
    };

    window.addEventListener('resize', resize);
    resize();

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    
    const handleMouseLeave = () => {
      mouse.x = -2000;
      mouse.y = -2000;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseLeave);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        p1.update(mouse.x, mouse.y);
        p1.draw(ctx);
        
        // Render network lines strictly between particles sharing the SAME exact 3D Layer!
        for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            if (p1.layer !== p2.layer) continue; // Only connect nodes occupying the same z-plane!

            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const distance = Math.sqrt(dx*dx + dy*dy);
            
            // Foreground connects further, background connects shorter
            const connectRadius = p1.z * 50 + 20;

            if (distance < connectRadius) {
                ctx.beginPath();
                // Faint sophisticated strings
                ctx.strokeStyle = `rgba(150, 160, 200, ${(0.12 - distance/500) * p1.z})`;
                ctx.lineWidth = p1.z * 0.7; // Thicker lines for foreground
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none mix-blend-multiply"
    />
  );
}
