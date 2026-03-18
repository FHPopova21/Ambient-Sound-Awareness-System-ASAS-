import { motion } from "motion/react";

export function AboutSection() {
  return (
    <section id="about" className="relative py-20 px-6 bg-[#0f0620] text-white overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[600px] h-[300px] sm:h-[400px] bg-[#a855f7] opacity-5 blur-[120px]" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            Мисията зад{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b35] to-[#a855f7]">
              SONAR
            </span>
          </h2>

          <p className="text-lg text-gray-300 leading-relaxed mb-12">
            Вярваме, че технологиите трябва да правят света по-достъпен и сигурен.
            SONAR се роди от една проста идея: след като носим мощни компютри в
            джобовете си, защо да не ги научим да "чуват" критичните опасности в
            градската среда вместо нас? Проектът е създаден с фокус върху
            пълната поверителност (Edge AI) и нулевото забавяне.
          </p>
        </motion.div>

        {/* Профил на създателя */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#ec4899] to-[#a855f7] flex items-center justify-center text-2xl font-bold shadow-lg">
            ФП
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-xl font-semibold">Филипа Попова</h3>
            <p className="text-[#a855f7] font-medium mb-2">
              Създател & Lead Developer
            </p>
            <p className="text-sm text-gray-400">
              Архитектура на невронни мрежи, React & Python разработка.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
