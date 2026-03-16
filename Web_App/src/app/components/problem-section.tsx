import { motion } from "motion/react";
import { Headphones, Ear, Clock } from "lucide-react";

const problems = [
  {
    icon: Headphones,
    title: "Изолация",
    description: "Масовото използване на слушалки с активно шумоподтискане (ANC) крие рискове на пътя.",
    color: "#ff6b35",
  },
  {
    icon: Ear,
    title: "Достъпност",
    description: "Над 400 млн. души по света живеят с частична или пълна загуба на слуха.",
    color: "#ec4899",
  },
  {
    icon: Clock,
    title: "Реакция",
    description: "Частите от секундата са решаващи при приближаваща линейка или инцидент.",
    color: "#a855f7",
  },
];

export function ProblemSection() {
  return (
    <section id="problem" className="relative py-16 md:py-24 px-6 md:px-12 lg:px-24 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[800px] h-[300px] sm:h-[400px] bg-[#a855f7] opacity-10 blur-[100px] sm:blur-[150px] rounded-full" />

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
            Проблемът
          </h2>
          <p className="text-base md:text-xl opacity-70 max-w-2xl mx-auto">
            Съвременният свят поставя нови предизвикателства пред безопасността и достъпността.
          </p>
        </motion.div>

        {/* Problem Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="group relative"
            >
              {/* Glow Effect on Hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl blur-2xl"
                style={{
                  background: `radial-gradient(circle at center, ${problem.color}40, transparent 70%)`,
                }}
              />

              {/* Glass Card */}
              <div className="relative backdrop-blur-md bg-white/2 border border-white/5 rounded-3xl p-8 h-full shadow-xl hover:bg-white/5 transition-all duration-300">
                {/* Icon Container */}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${problem.color}40, ${problem.color}20)`,
                    boxShadow: `0 0 30px ${problem.color}30`,
                  }}
                >
                  <problem.icon className="w-8 h-8" style={{ color: problem.color }} />
                </div>

                {/* Content */}
                <h3 className="text-2xl mb-4" style={{ fontWeight: 700 }}>
                  {problem.title}
                </h3>
                <p className="opacity-70 leading-relaxed">
                  {problem.description}
                </p>

                {/* Decorative Corner Element */}
                <div
                  className="absolute top-4 right-4 w-12 h-12 rounded-lg opacity-10"
                  style={{
                    background: `linear-gradient(135deg, ${problem.color}, transparent)`,
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
