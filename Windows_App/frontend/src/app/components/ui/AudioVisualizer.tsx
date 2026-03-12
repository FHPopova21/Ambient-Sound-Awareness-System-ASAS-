import { motion } from "motion/react";
import { useEffect, useState } from "react";

interface AudioVisualizerProps {
  isListening: boolean;
}

export function AudioVisualizer({ isListening }: AudioVisualizerProps) {
  // Simulate audio data (amplitudes between 0 and 1)
  const [bars, setBars] = useState<number[]>(Array(12).fill(0.2));

  useEffect(() => {
    if (!isListening) {
      setBars(Array(12).fill(0.1)); // Flat line when not listening
      return;
    }

    const interval = setInterval(() => {
      // Generate random amplitudes for a "waveform" effect
      const newBars = Array(12)
        .fill(0)
        .map(() => Math.random() * 0.7 + 0.2); // Random height between 0.2 and 0.9
      setBars(newBars);
    }, 150);

    return () => clearInterval(interval);
  }, [isListening]);

  return (
    <div className="relative flex h-48 w-48 items-center justify-center">
      {/* Neumorphic/Glass Container */}
      <div 
        className="absolute inset-0 rounded-full bg-white/10 shadow-[8px_8px_16px_0_rgba(31,38,135,0.2),-4px_-4px_12px_0_rgba(255,255,255,0.3)] backdrop-blur-xl border border-white/20"
      />
      
      {/* Breathing Glow Effect when Idle/Listening */}
      <motion.div
        animate={{
          scale: isListening ? [1, 1.1, 1] : 1,
          opacity: isListening ? [0.3, 0.6, 0.3] : 0,
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0 rounded-full bg-blue-400/20 blur-xl"
      />

      {/* Visualizer Bars */}
      <div className="relative z-10 flex items-center justify-center gap-1.5 h-24">
        {bars.map((amplitude, index) => (
          <motion.div
            key={index}
            initial={{ height: 10 }}
            animate={{ 
                height: isListening ? amplitude * 80 : 8, // Scale height
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
            }}
            className="w-2 rounded-full bg-gradient-to-t from-purple-500 to-blue-400 shadow-sm"
          />
        ))}
      </div>
    </div>
  );
}
