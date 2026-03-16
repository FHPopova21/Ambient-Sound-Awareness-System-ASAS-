import { motion } from "motion/react";

const technologies = [
  { name: "Python", logo: "🐍" },
  { name: "PyTorch", logo: "🔥" },
  { name: "React", logo: "⚛️" },
  { name: "Swift", logo: "🍎" },
  { name: "CoreML", logo: "🧠" },
  { name: "Vite", logo: "⚡" },
];

export function TechStackSection() {
  return (
    <section id="tech" className="relative py-16 md:py-24 px-6 md:px-12 lg:px-24 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] sm:w-[800px] h-[300px] sm:h-[400px] bg-[#ff6b35] opacity-10 blur-[100px] sm:blur-[180px]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16 space-y-4"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl tracking-tight" style={{ fontWeight: 800 }}>
            Технологичен стек
          </h2>
          <p className="text-base md:text-xl opacity-70 max-w-3xl mx-auto">
            Изградено с хибриден подход – мощта на машинното обучение и гъвкавостта на съвременните UI фреймуърци.
          </p>
        </motion.div>

        {/* Tech Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {technologies.map((tech, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group relative"
            >
              {/* Hover Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#ff6b35] to-[#a855f7] opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-2xl blur-2xl" />

              {/* Card */}
              <div className="relative backdrop-blur-md bg-white/2 border border-white/5 rounded-2xl p-6 text-center hover:bg-white/5 transition-all duration-300 aspect-square flex flex-col items-center justify-center gap-3">
                <div className="text-5xl">{tech.logo}</div>
                <span className="text-sm opacity-80" style={{ fontWeight: 600 }}>
                  {tech.name}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Architecture Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 backdrop-blur-md bg-white/2 border border-white/5 rounded-3xl p-8"
        >
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl mb-3" style={{ fontWeight: 700, color: "#ff6b35" }}>
                3
              </div>
              <div className="text-sm opacity-70">Платформи</div>
              <div className="text-xs opacity-50 mt-1">Windows, iOS, watchOS</div>
            </div>
            <div>
              <div className="text-4xl mb-3" style={{ fontWeight: 700, color: "#ec4899" }}>
                &lt;20ms
              </div>
              <div className="text-sm opacity-70">Латентност</div>
              <div className="text-xs opacity-50 mt-1">Edge computing</div>
            </div>
            <div>
              <div className="text-4xl mb-3" style={{ fontWeight: 700, color: "#a855f7" }}>
                100%
              </div>
              <div className="text-sm opacity-70">Локално</div>
              <div className="text-xs opacity-50 mt-1">Без облак</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
