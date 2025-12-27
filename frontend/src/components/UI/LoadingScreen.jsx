import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// CSS for the twinkling stars background
const starStyles = `
  .star-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: 0;
  }

  .star {
    position: absolute;
    background-color: white;
    border-radius: 50%;
    opacity: 0;
    animation: twinkle var(--duration) ease-in-out infinite alternate;
  }

  @keyframes twinkle {
    0% { opacity: 0.2; transform: scale(0.8); }
    100% { opacity: 1; transform: scale(1.2); }
  }

  .orbit-ring {
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-top: 1px solid rgba(100, 200, 255, 0.8);
    border-radius: 50%;
    position: absolute;
  }
`;

// Helper to generate random stars
const generateStars = (count) => {
  return [...Array(count)].map((_, i) => {
    const size = Math.random() * 2 + 1 + 'px';
    const top = Math.random() * 100 + '%';
    const left = Math.random() * 100 + '%';
    const duration = Math.random() * 3 + 2 + 's';
    const delay = Math.random() * 2 + 's';
    
    return (
      <div
        key={i}
        className="star"
        style={{
          width: size,
          height: size,
          top,
          left,
          '--duration': duration,
          animationDelay: delay,
          boxShadow: Math.random() > 0.8 ? '0 0 4px 1px rgba(150, 220, 255, 0.6)' : 'none', // Occasional blue glow
        }}
      />
    );
  });
};

const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);
  const [stars] = useState(() => generateStars(150)); // Generate stars once on mount

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Slow down progress as it gets higher for realism
        const increment = Math.random() * (prev > 80 ? 5 : 15);
        return Math.min(prev + increment, 100);
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 1.5 } }} // Slower exit for smooth transition to 3D
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
      >
        <style children={starStyles} />
        
        {/* Deep Space Background Layer with subtle nebula fog */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(20,30,50,0.3)_0%,_rgba(0,0,0,1)_100%)] z-0" />

        {/* Stars Layer */}
        <div className="star-container">
          {stars}
        </div>

        {/* Main Content Container */}
        <div className="relative z-10 flex flex-col items-center justify-center space-y-12">
          
          {/* Cosmic Orbital Loader */}
          <div className="relative w-32 h-32 flex items-center justify-center">
            {/* Core Pulsing Sphere */}
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-12 h-12 bg-blue-900/30 rounded-full absolute z-10 blur-md"
            />
            <div className="w-8 h-8 bg-white/90 rounded-full absolute z-20 shadow-[0_0_15px_2px_rgba(100,200,255,0.6)]" />

            {/* Inner Fast Orbit */}
            <motion.div
              className="orbit-ring w-20 h-20"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
             {/* Middle Orbit */}
             <motion.div
              className="orbit-ring w-28 h-28"
              style={{ borderTopColor: 'rgba(150, 150, 255, 0.5)' }}
              animate={{ rotate: -360 }}
              transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
            />
            {/* Outer Slow Orbit */}
            <motion.div
              className="orbit-ring w-40 h-40"
              style={{ borderTopColor: 'rgba(255, 255, 255, 0.3)' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            />
          </div>

          {/* Text and Progress Section */}
          <div className="text-center space-y-4">
            <motion.h1
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-2xl md:text-3xl font-light tracking-[0.3em] text-white uppercase"
            >
              Initializing Memories
            </motion.h1>

            {/* Progress Bar Concept - Thin subtle line */}
            <div className="w-64 h-[2px] bg-gray-800 relative overflow-hidden rounded-full">
              <motion.div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 via-white to-blue-400"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: "spring", stiffness: 50, damping: 15 }}
                style={{ boxShadow: '0 0 10px rgba(100, 200, 255, 0.7)' }}
              />
            </div>

            <motion.p
             className="text-blue-200/60 font-mono text-xs tracking-wider"
             animate={{ opacity: [0.5, 1, 0.5] }}
             transition={{ duration: 1.5, repeat: Infinity }}
            >
              Loading assets... {Math.floor(progress)}%
            </motion.p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LoadingScreen;