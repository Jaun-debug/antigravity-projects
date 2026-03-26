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
  mouseOffsetX: number;
  mouseOffsetY: number;
  pulsePhase: number;
  pulseSpeed: number;

  constructor(width: number, height: number, color: string) {
    // Cluster them tightly in the center logically on load
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) * 0.45; 
    const r = Math.pow(Math.random(), 0.5) * maxRadius;
    const theta = Math.random() * 2 * Math.PI;
    
    this.x = centerX + r * Math.cos(theta);
    this.y = centerY + r * Math.sin(theta);
    this.originX = this.x;
    this.originY = this.y;
    this.vx = 0;
    this.vy = 0;
    
    // Generate individual offset matrix around the cursor so they lie loosely, rather than collapsing
    const clusterR = Math.pow(Math.random(), 0.5) * 96; // 96px loose blob radius (20% larger)
    const clusterTheta = Math.random() * 2 * Math.PI;
    this.mouseOffsetX = clusterR * Math.cos(clusterTheta);
    this.mouseOffsetY = clusterR * Math.sin(clusterTheta);
    
    // Pulse math to make them breathe
    this.pulsePhase = Math.random() * Math.PI * 2;
    this.pulseSpeed = Math.random() * 0.05 + 0.01;
    
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
    if (mouseX !== -2000) {
      const distToCursor = Math.sqrt(Math.pow(mouseX - this.x, 2) + Math.pow(mouseY - this.y, 2));
      
      // If close (resting), expand the offset multiplier to exactly 2.0x (100% inflation) smoothly!
      let spreadMultiplier = 0.2;
      if (distToCursor < 350) {
        spreadMultiplier = 1 + ((350 - distToCursor) / 350); // Ramps up to exactly 2.0x spread when resting
      }

      // Natively transform the swarm from a circle into an organic expanding/contracting oval over time
      const timeSlow = Date.now() * 0.0008; 
      const ovalScaleX = Math.sin(timeSlow) * 0.4 + 1.0; // Oscillates slowly from 0.6x to 1.4x
      const ovalScaleY = Math.cos(timeSlow) * 0.4 + 1.0; // Oscillates slowly from 1.4x to 0.6x

      const targetX = mouseX + (this.mouseOffsetX * spreadMultiplier * ovalScaleX);
      const targetY = mouseY + (this.mouseOffsetY * spreadMultiplier * ovalScaleY);
      
      const dx = targetX - this.x;
      const dy = targetY - this.y;
      
      // Unified spring physics - deleted Z-depth reactivity so they ALL move as ONE group, not two!
      this.vx += dx * 0.006;
      this.vy += dy * 0.006;
    } else {
      // Return to original initial cluster softly
      this.vx += (this.originX - this.x) * 0.004;
      this.vy += (this.originY - this.y) * 0.004;
    }

    // High living drift so they vibrate organically while resting
    this.vx += (Math.random() - 0.5) * 0.25;
    this.vy += (Math.random() - 0.5) * 0.25;

    // High friction creates graceful settling and outward drifting
    this.vx *= 0.86;
    this.vy *= 0.86;

    this.x += this.vx;
    this.y += this.vy;
    
    this.pulsePhase += this.pulseSpeed;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    
    // Alive breathing opacity pulse natively oscillates between 40% and 100% opacity continuously 
    const breatheAlpha = Math.sin(this.pulsePhase) * 0.3 + 0.7;
    
    const baseAlpha = this.z === 1.0 ? 0.9 : (this.z === 0.5 ? 0.4 : 0.15);
    ctx.globalAlpha = breatheAlpha * baseAlpha; 
    
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
      // Dense 400 particle swarm
      const particleCount = window.innerWidth < 768 ? 200 : 400; 
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
