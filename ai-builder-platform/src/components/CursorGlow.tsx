'use client';

import { motion, useSpring } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function CursorGlow() {
  const [isVisible, setIsVisible] = useState(false);
  
  // Ultra smooth premium lagging physics for the cursor trail
  const springX = useSpring(0, { stiffness: 45, damping: 25, mass: 1.2 });
  const springY = useSpring(0, { stiffness: 45, damping: 25, mass: 1.2 });

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setIsVisible(true);
      // Center the 500px glow orb precisely onto the cursor tip
      springX.set(e.clientX - 350); 
      springY.set(e.clientY - 350);
    };
    
    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouse);
    window.addEventListener('mouseout', handleMouseLeave);
    
    return () => {
      window.removeEventListener('mousemove', handleMouse);
      window.removeEventListener('mouseout', handleMouseLeave);
    };
  }, [springX, springY]);

  return (
    <motion.div
      className="fixed top-0 left-0 w-[700px] h-[700px] rounded-full pointer-events-none z-0 mix-blend-multiply"
      style={{
        x: springX,
        y: springY,
        opacity: isVisible ? 1 : 0,
        // Premium SaaS soft gradient glow blending blue/purple
        background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, rgba(59,130,246,0.06) 30%, rgba(255,255,255,0) 65%)',
        filter: 'blur(50px)',
        transition: 'opacity 0.6s ease-in-out'
      }}
    />
  );
}
