import { motion, AnimatePresence } from "motion/react";
import { Volume2, Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: "#problem", label: "Проблемът" },
    { href: "#how-it-works", label: "Как работи" },
    { href: "#demo", label: "Демонстрация" },
    { href: "#tech", label: "Технологии" },
  ];

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-[100] px-6 py-4 lg:px-12 backdrop-blur-xl bg-[#0f0620]/60 border-b border-white/[0.05]"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <a href="#" className="flex items-center gap-2 z-[110]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#ff6b35] to-[#ec4899] flex items-center justify-center shadow-[0_0_15px_rgba(255,107,53,0.4)]">
            <Volume2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold tracking-widest text-lg text-white">SONAR</span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex gap-8 text-sm font-medium text-white/60">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-white transition-colors">{link.label}</a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button className="hidden sm:block relative group px-6 py-2 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 backdrop-blur-xl rounded-[1.5rem] transition-all duration-300 shadow-[inset_0_0_15px_rgba(255,255,255,0.02)]">
            <div className="absolute inset-0 bg-gradient-to-r from-[#ff6b35]/20 to-[#ec4899]/20 rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative text-white font-medium text-sm">
              Изтегли
            </span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden z-[110] p-2 text-white/80 hover:text-white"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "100vh" }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed inset-0 bg-[#0f0620] z-[100] md:hidden flex flex-col items-center justify-center gap-8 text-2xl"
          >
            {navLinks.map((link) => (
              <motion.a
                key={link.href}
                href={link.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setIsMenuOpen(false)}
                className="text-white/80 hover:text-white transition-colors font-semibold"
              >
                {link.label}
              </motion.a>
            ))}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 px-12 py-4 rounded-xl bg-gradient-to-r from-[#ff6b35] to-[#ec4899] text-white font-bold"
            >
              Изтегли
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
