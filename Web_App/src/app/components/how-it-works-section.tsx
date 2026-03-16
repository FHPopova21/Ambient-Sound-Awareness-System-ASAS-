import { motion } from "motion/react";
import { Mic, Brain, Smartphone } from "lucide-react";

const steps = [
  {
    icon: Mic,
    title: "Слуша",
    description: "Непрекъснат анализ на аудио средата в реално време, без запис на глас.",
    color: "#ff6b35",
  },
  {
    icon: Brain,
    title: "Анализира",
    description: "Обучена невронна мрежа (MobileNetV2), която класифицира опасностите за милисекунди.",
    color: "#ec4899",
  },
  {
    icon: Smartphone,
    title: "Известява",
    description: "Мигновена тактилна (вибрираща) и визуална обратна връзка на китката ви.",
    color: "#a855f7",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-16 md:py-24 px-6 md:px-12 lg:px-24 overflow-hidden">
      {/* Animated Background Blobs */}
      <motion.div
        className="absolute top-0 right-0 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-[#ec4899] opacity-20 blur-[100px] sm:blur-[200px] rounded-full"
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-20 space-y-4"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl tracking-tight" style={{ fontWeight: 800 }}>
            Как работи?
          </h2>
          <p className="text-base md:text-xl opacity-70 max-w-2xl mx-auto">
            Локален изкуствен интелект. Нулево забавяне.
          </p>
        </motion.div>

        {/* Steps Container */}
        <div className="relative">
          {/* Connection Lines */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-[#ff6b35] via-[#ec4899] to-[#a855f7] opacity-20" />

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative h-full"
              >
                {/* Connecting Dot */}
                <div className="hidden lg:block absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-4 border-[#0f0620] z-10"
                  style={{ background: step.color, boxShadow: `0 0 20px ${step.color}` }}
                />

                {/* Step Card */}
                <div className="relative h-full backdrop-blur-xl bg-white/[0.05] border border-white/10 rounded-3xl p-8 text-center shadow-2xl group hover:bg-white/[0.08] transition-all duration-300">
                  {/* Hover Glow */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl blur-3xl -z-10"
                    style={{
                      background: `radial-gradient(circle at center, ${step.color}40, transparent 70%)`,
                    }}
                  />

                  {/* Step Number */}
                  <motion.div
                    className="absolute -top-4 -right-4 w-12 h-12 rounded-xl backdrop-blur-xl bg-white/10 border border-white/20 flex items-center justify-center shadow-lg"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <span className="text-xl" style={{ fontWeight: 700, color: step.color }}>
                      {index + 1}
                    </span>
                  </motion.div>

                  {/* Icon */}
                  <motion.div
                    className="w-24 h-24 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${step.color}30, ${step.color}10)`,
                      boxShadow: `0 0 40px ${step.color}20`,
                    }}
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <step.icon className="w-12 h-12" style={{ color: step.color }} />
                  </motion.div>

                  {/* Content */}
                  <h3 className="text-2xl mb-4" style={{ fontWeight: 700 }}>
                    {step.title}
                  </h3>
                  <p className="opacity-70 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Pulse Animation */}
                  <motion.div
                    className="absolute inset-0 rounded-3xl border-2 opacity-0"
                    style={{ borderColor: step.color }}
                    animate={{
                      scale: [1, 1.05, 1],
                      opacity: [0, 0.3, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: index * 0.5,
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Additional Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 backdrop-blur-md bg-gradient-to-r from-white/2 to-white/4 border border-white/5 rounded-3xl p-8 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-2 h-2 rounded-full bg-[#ff6b35] animate-pulse" />
            <span className="text-sm uppercase tracking-wider opacity-60" style={{ fontWeight: 600 }}>
              Приоритет: Сигурност
            </span>
          </div>
          <p className="text-lg opacity-80 max-w-3xl mx-auto">
            Всички данни се обработват локално на вашето устройство. Не изпращаме информация към облачни сървъри. Вашата поверителност е гарантирана.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
