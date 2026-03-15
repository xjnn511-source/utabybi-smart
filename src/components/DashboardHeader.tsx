import { motion } from "framer-motion";
import { Bot } from "lucide-react";

const DashboardHeader = () => {
  return (
    <header className="flex justify-between items-center px-6 py-8">
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ rotate: [0, 12, -12, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Bot className="w-8 h-8 text-primary" strokeWidth={1.5} />
        </motion.div>
        <div>
          <h1 className="text-2xl font-extralight tracking-tight glow-text">
            عُتيبي ذكي 🤖 Ai
          </h1>
          <p className="text-xs font-thin text-text-dim mt-0.5">
            النظام يعمل بالذكاء الكامل
          </p>
        </div>
      </div>
      <motion.div
        className="w-2.5 h-2.5 rounded-full bg-primary pulse-ring"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </header>
  );
};

export default DashboardHeader;
