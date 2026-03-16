import { motion } from "motion/react";
import { Play, Volume2, AlertTriangle, RotateCcw } from "lucide-react";
import { useState, useRef } from "react";

export function DemoSection() {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const handleRestart = () => {
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  return (
    <section id="demo" className="relative py-16 md:py-24 px-6 md:px-12 lg:px-24 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[800px] h-[300px] sm:h-[400px] bg-gradient-to-r from-[#a855f7] via-[#ec4899] to-[#ff6b35] opacity-5 blur-[80px] sm:blur-[120px]" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16 space-y-4"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl tracking-tight" style={{ fontWeight: 800 }}>
            Виж го в действие
          </h2>
          <p className="text-base md:text-xl opacity-70 max-w-2xl mx-auto">
            Демонстрация на разпознаването на звуци в реално време
          </p>
        </motion.div>

        {/* Video Player Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative group"
        >
          {/* Outer Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#ff6b35] via-[#ec4899] to-[#a855f7] opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-[2rem] blur-2xl" />

          {/* Glass Frame */}
          <div className="relative backdrop-blur-lg bg-white/[0.03] border-2 border-white/5 rounded-[2rem] p-4 shadow-2xl">
            {/* Video Display Area */}
            <div className="relative aspect-video bg-gradient-to-br from-purple-950/30 to-black rounded-2xl overflow-hidden">
              <video
                ref={videoRef}
                className={`w-full h-full object-cover transition-opacity duration-700 ${isPlaying ? 'opacity-100' : 'opacity-0'}`}
                src="/demo_sonar.mov"
                playsInline
                preload="metadata"
                poster="/Sonar_logo.png"
                onEnded={() => setIsPlaying(false)}
              />

              {/* Play Button Overlay */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handlePlay}
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-[#ff6b35] to-[#ec4899] flex items-center justify-center shadow-[0_0_60px_rgba(255,107,53,0.6)] hover:shadow-[0_0_80px_rgba(255,107,53,0.8)] transition-all duration-300 z-20"
                  >
                    <Play className="w-10 h-10 text-white fill-white ml-1" />
                  </motion.button>

                  {/* Decorative Grid Overlay (Visible when not playing) */}
                  <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="w-full h-full" style={{
                      backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
                      backgroundSize: "60px 60px"
                    }} />
                  </div>
                </div>
              )}
            </div>

            {/* Control Bar */}
            <div className="mt-4 flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse' : 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]'}`} />
                <span className="text-sm opacity-60 font-medium">
                  {isPlaying ? 'Сега се изпълнява' : 'Готов за демонстрация'}
                </span>
              </div>
              <div className="flex gap-2">
                <motion.button
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={handleRestart}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 text-sm hover:bg-white/20 transition-all font-semibold"
                >
                  <RotateCcw className="w-4 h-4" />
                  Рестарт
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 grid md:grid-cols-2 gap-6"
        >
          {[
            {
              title: "Реално време",
              description: "Анализ и известяване под 20 милисекунди",
              icon: "⚡",
            },
            {
              title: "Висока точност",
              description: "95%+ успеваемост при класифициране на звуци",
              icon: "🎯",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="backdrop-blur-xl bg-white/[0.05] border border-white/10 rounded-2xl p-6 flex items-center gap-4"
            >
              <div className="text-4xl">{feature.icon}</div>
              <div>
                <h4 className="mb-1" style={{ fontWeight: 700 }}>
                  {feature.title}
                </h4>
                <p className="text-sm opacity-70">{feature.description}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
