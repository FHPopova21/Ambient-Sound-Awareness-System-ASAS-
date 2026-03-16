import { motion } from "motion/react";
import { Github, FileText, Mail, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative py-12 md:py-16 px-6 md:px-12 lg:px-24 border-t border-white/10">
      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[300px] sm:w-[600px] h-[150px] sm:h-[300px] bg-gradient-to-t from-[#a855f7] to-transparent opacity-5 blur-[80px] sm:blur-[150px]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-10 md:gap-12">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#ff6b35] to-[#ec4899] flex items-center justify-center">
                <span className="text-xl" style={{ fontWeight: 700 }}>S</span>
              </div>
              <span className="text-2xl tracking-wider uppercase" style={{ fontWeight: 700 }}>
                SONAR
              </span>
            </div>
            <p className="opacity-70 text-sm leading-relaxed">
              Аудио разпознаване с изкуствен интелект за по-безопасно бъдеще. Локално обработване, глобално въздействие.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-4"
          >
            <h3 className="text-lg mb-4" style={{ fontWeight: 700 }}>
              Ресурси
            </h3>
            <ul className="space-y-3">
              {[
                { icon: FileText, label: "Документация (.rtf)", href: "#" },
                { icon: Github, label: "GitHub Repository", href: "#" },
                { icon: ExternalLink, label: "API Reference", href: "#" },
              ].map((link, i) => (
                <li key={i}>
                  <a
                    href={link.href}
                    className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity group"
                  >
                    <link.icon className="w-4 h-4 group-hover:text-[#ff6b35] transition-colors" />
                    <span className="text-sm">{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            <h3 className="text-lg mb-4" style={{ fontWeight: 700 }}>
              Контакт
            </h3>
            <div className="space-y-3">
              <a
                href="mailto:contact@sonar-ai.dev"
                className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity group"
              >
                <Mail className="w-4 h-4 group-hover:text-[#ff6b35] transition-colors" />
                <span className="text-sm">contact@sonar-ai.dev</span>
              </a>
            </div>

            {/* Social Icons */}
            <div className="flex gap-3 pt-4">
              {[
                { icon: Github, href: "#" },
                { icon: Mail, href: "#" },
              ].map((social, i) => (
                <motion.a
                  key={i}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="w-10 h-10 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <p className="text-sm opacity-60">
            © 2026 SONAR. Създадено с ❤️ за безопасността на хората.
          </p>
          <div className="flex items-center gap-2 text-xs opacity-60">
            <span>Powered by</span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b35]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#ec4899]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7]" />
            </div>
            <span style={{ fontWeight: 600 }}>AI Innovation</span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
