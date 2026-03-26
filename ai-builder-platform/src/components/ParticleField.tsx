'use client';

import React, { useEffect, useRef } from 'react';

// Advanced Physics Particle implementation
class Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  size: number;
  color: string;

  constructor(width: number, height: number, color: string) {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.originX = this.x;
    this.originY = this.y;
    this.vx = 0;
    this.vy = 0;
    this.size = Math.random() * 2 + 1; // 1-3px size, premium aesthetic
    this.color = color;
  }

  update(mouseX: number, mouseY: number) {
    // Vector distance from mouse
    const dx = mouseX - this.x;
    const dy = mouseY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Physics Boundaries
    const minDistance = 120; // Critical Repulsion Radius
    const maxDistance = 300; // Large Attraction Radius

    if (dist < minDistance) {
      // Repel very close to cursor (Strong magnetic pushing force)
      const force = (minDistance - dist) / minDistance;
      const angle = Math.atan2(dy, dx);
      // Negative force pushes away
      this.vx -= Math.cos(angle) * force * 2.5;
      this.vy -= Math.sin(angle) * force * 2.5;
    } else if (dist < maxDistance) {
      // Attract at medium distance (Pulling force forming the swirling cloud)
      const force = (dist - minDistance) / (maxDistance - minDistance);
      const angle = Math.atan2(dy, dx);
      // Gentle attraction towards cursor
      this.vx += Math.cos(angle) * force * 0.15;
      this.vy += Math.sin(angle) * force * 0.15;
      
      // Optional subtle orbit effect (perpendicular force vector)
      this.vx += Math.cos(angle + Math.PI / 2) * force * 0.4;
      this.vy += Math.sin(angle + Math.PI / 2) * force * 0.4;
    }

    // Idle organic floating movement (subtle noise)
    this.vx += (Math.random() - 0.5) * 0.1;
    this.vy += (Math.random() - 0.5) * 0.1;

    // Smooth easing/lerp back to origin point natively forming the grid/galaxy
    this.vx += (this.originX - this.x) * 0.003;
    this.vy += (this.originY - this.y) * 0.003;

    // Fluid damping (momentum friction preventing snapping)
    this.vx *= 0.91;
    this.vy *= 0.91;

    // Apply velocity
    this.x += this.vx;
    this.y += this.vy;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    
    // Slight opacity variation via globalAlpha randomly assigned conceptually 
    ctx.globalAlpha = Math.min(1, Math.max(0.2, 1 - (Math.abs(this.originX - this.x) / 500)));
    
    // Add subtle glow matching SaaS aesthetics
    ctx.shadowBlur = 6;
    ctx.shadowColor = this.color;
    ctx.fill();
    ctx.closePath();
    
    // Reset alpha for lines
    ctx.globalAlpha = 1.0;
  }
}

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationFrameId: number;

    // Premium SaaS soft gradient color spectrum
    const brightColors = ['#FF3366', '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B'];
    let mouse = { x: -2000, y: -2000 };

    const resize = () => {
      // Ensure canvas spans full viewport perfectly
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      particles = [];
      const particleCount = window.innerWidth < 768 ? 200 : 500;
      for (let i = 0; i < particleCount; i++) {
        const color = brightColors[Math.floor(Math.random() * brightColors.length)];
        particles.push(new Particle(canvas.width, canvas.height, color));
      }
    };

    window.addEventListener('resize', resize);
    resize(); // Trigger initial sizing

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    
    const handleMouseLeave = () => {
      // Push cursor strictly offscreen so particles smoothly settle back idle
      mouse.x = -2000;
      mouse.y = -2000;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseLeave);

    const animate = () => {
      // Clear frame efficiently natively on GPU
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update(mouse.x, mouse.y);
        particles[i].draw(ctx);
        
        // Faint connecting geometry lines between deeply close particles
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx*dx + dy*dy);
            
            if (distance < 60) {
                ctx.beginPath();
                // Extremely subtle connection thread
                ctx.strokeStyle = `rgba(100, 110, 140, ${0.08 - distance/750})`;
                ctx.lineWidth = 0.5;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
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
      className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none"
      style={{ mixBlendMode: 'multiply' }}
    />
  );
}
