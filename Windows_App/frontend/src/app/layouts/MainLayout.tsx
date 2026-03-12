import { Outlet } from "react-router";
import { BottomNav } from "../components/BottomNav";
import { motion } from "motion/react";


export function MainLayout() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#e0e5ec] font-sans text-slate-800">
      {/* Background Gradients/Blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 10, -10, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] h-[70vh] w-[70vh] rounded-full bg-purple-300/40 blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, -50, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] -right-[10%] h-[60vh] w-[60vh] rounded-full bg-blue-300/40 blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            y: [0, -50, 50, 0],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] left-[20%] h-[80vh] w-[80vh] rounded-full bg-pink-300/40 blur-[100px]"
        />
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 mx-auto min-h-screen max-w-md pb-24 pt-10 px-6">
        <header className="mb-10 flex items-center justify-between">
          <div className="flex flex-col">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-extrabold tracking-tight text-slate-900"
            >
              Sonar
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-2 mt-1"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Активно слушане</p>
            </motion.div>
          </div>
        </header>

        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}
