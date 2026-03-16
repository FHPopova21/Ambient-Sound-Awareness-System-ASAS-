import { motion } from "motion/react";
import { Download, Github, Play } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6 md:px-12 lg:px-24">
      {/* Animated Glow Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-30"
          style={{
            background: "radial-gradient(circle, #ec4899 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
          animate={{
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-30"
          style={{
            background: "radial-gradient(circle, #a855f7 0%, transparent 70%)",
            filter: "blur(100px)",
          }}
          animate={{
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 lg:gap-12 items-center pt-20 lg:pt-0">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8 text-center lg:text-left flex flex-col items-center lg:items-start"
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#ff6b35] to-[#ec4899] flex items-center justify-center">
              <Play className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="text-2xl tracking-wider uppercase" style={{ fontWeight: 700 }}>
              SONAR
            </span>
          </div>

          {/* Main Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight" style={{ fontWeight: 800, lineHeight: 1.1 }}>
              Чува това, което <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b35] to-[#ec4899]">вие не можете.</span>
            </h1>
            <p className="text-lg md:text-xl opacity-80 max-w-xl mx-auto lg:mx-0">
              Мобилна екосистема за аудио разпознаване и смарт известяване. Локален изкуствен интелект, който спасява животи.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 justify-center lg:justify-start w-full">
            <motion.a
              href="https://github.com/FHPopova21/SONAR/actions"
              target="_blank"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#ff6b35] to-[#f97316] flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(255,107,53,0.5)] transition-all hover:shadow-[0_0_50px_rgba(255,107,53,0.7)] text-white no-underline"
              style={{ fontWeight: 600 }}
            >
              <Download className="w-5 h-5" />
              Свали за Windows (.exe)
            </motion.a>
            <motion.a
              href="https://github.com/FHPopova21/SONAR"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto px-8 py-4 rounded-xl backdrop-blur-md bg-white/2 border border-white/5 flex items-center justify-center gap-3 hover:bg-white/5 transition-all text-white no-underline"
              style={{ fontWeight: 600 }}
            >
              <Github className="w-5 h-5" />
              Виж кода в GitHub
            </motion.a>
          </div>

          {/* Geometric Accent */}
          <div className="flex gap-2 justify-center lg:justify-start">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 rotate-45 bg-gradient-to-br from-[#ff6b35] to-[#ec4899]"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Right Visual - 3D Devices Mockup */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative max-w-[320px] sm:max-w-xl mx-auto w-full"
        >
          <div className="relative w-full aspect-[4/5] sm:aspect-square">
            {/* Glowing Ring Background */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#a855f7]/20 to-[#ec4899]/20 blur-3xl scale-75 sm:scale-100" />

            {/* Device Container */}
            <div className="relative backdrop-blur-2xl bg-[#1c122a]/40 border border-white/5 rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl px-[12px] py-[32px] sm:px-[20px] sm:py-[48px] scale-[0.85] sm:scale-100 origin-center">
              {/* iPhone Mockup */}
              <div className="relative mx-auto w-[240px] h-[480px] sm:w-[280px] sm:h-[550px] rounded-[2.5rem] sm:rounded-[3rem] bg-[#160f22] border-4 border-[#251b36] shadow-2xl overflow-hidden">
                {/* Screen */}
                <div className="absolute inset-0 bg-[#0d0914] overflow-hidden flex flex-col items-center px-[20px] py-[0px]">

                  {/* Soft Background Glow */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[60%] bg-[#7e203c] rounded-full blur-[80px] opacity-30" />

                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 sm:w-32 h-6 sm:h-7 bg-[#160f22] rounded-b-3xl z-20" />

                  {/* Header Text */}
                  <div className="mt-12 sm:mt-16 text-center z-10">
                    <div className="text-white text-[11px] sm:text-[13px] tracking-[0.2em] font-medium mb-1">СЛУША...</div>
                    <div className="text-white/40 text-[9px] sm:text-[11px]">SONAR AI On-Device</div>
                  </div>

                  {/* Center Mic */}
                  <div className="flex-1 w-full flex flex-col items-center justify-center z-10 gap-12 sm:gap-16">
                    <div className="relative flex items-center justify-center mt-4">
                      <motion.div
                        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 bg-[#f97316]/30 rounded-full blur-2xl"
                      />
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-white/10 bg-white/5 flex items-center justify-center backdrop-blur-md">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fb923c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-8 sm:h-8 drop-shadow-[0_0_10px_rgba(251,146,60,0.8)]"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg>
                      </div>
                    </div>

                    {/* Audio Waveform */}
                    <div className="flex items-center justify-center gap-1.5 sm:gap-2 h-12 sm:h-16">
                      {[40, 70, 40, 100, 60, 40, 80, 50, 90].map((height, i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 sm:w-2.5 rounded-full bg-gradient-to-t from-[#f97316] to-[#f43f5e]"
                          style={{ height: `${height}%`, boxShadow: '0 0 10px rgba(249,115,22,0.3)' }}
                          animate={{
                            height: [`${height}%`, `${height * 0.4}%`, `${height}%`],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.1,
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Bottom Pill */}
                  <div className="absolute bottom-6 w-[85%] py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-md flex items-center justify-center z-10">
                    <span className="text-white/50 text-xs sm:text-sm">Разпознат звук: <strong className="text-white font-medium ml-1">Сирена</strong></span>
                  </div>
                </div>
              </div>

              {/* Apple Watch Mockup */}
              <div className="absolute -bottom-6 -right-4 sm:-bottom-8 sm:-right-8 w-36 h-44 sm:w-48 sm:h-56 rounded-[2rem] sm:rounded-[2.5rem] bg-[#160f22] border-4 border-[#251b36] shadow-2xl overflow-hidden z-20 hidden sm:block">
                <div className="absolute inset-0 bg-[#0d0914] overflow-hidden flex flex-col items-center justify-center">
                  {/* Soft Background Glow */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[#f97316]/10 rounded-full blur-[40px] opacity-50" />

                  <div className="relative z-10 flex flex-col items-center gap-6">
                    {/* Center Mic */}
                    <div className="relative flex items-center justify-center">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 bg-[#f97316]/20 rounded-full blur-xl"
                      />
                      <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full border border-white/10 bg-white/5 flex items-center justify-center backdrop-blur-md">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fbd38d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-6 sm:h-6 drop-shadow-[0_0_8px_rgba(251,146,60,0.6)]"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg>
                      </div>
                    </div>

                    {/* Audio Waveform */}
                    <div className="flex items-center justify-center gap-1.5 h-6">
                      {[60, 100, 40, 80, 50].map((height, i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 rounded-full bg-gradient-to-t from-[#f97316] to-[#f43f5e]"
                          style={{ height: `${height}%` }}
                          animate={{
                            height: [`${height}%`, `${height * 0.4}%`, `${height}%`],
                          }}
                          transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.15,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
