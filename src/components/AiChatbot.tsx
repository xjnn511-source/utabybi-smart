import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send } from "lucide-react";
import { useState } from "react";

const quickReplies = [
  { text: "كيف أرفع صك؟", answer: "فقط أسقط ملف الصك في منطقة عقل الذكاء — النظام يحلله تلقائياً خلال ثوانٍ." },
  { text: "ما هي خطة القناص؟", answer: "خطة القناص بـ ٩٩ ريال/شهر تتيح تحليل ٥ صكوك وبوستر واحد شهرياً." },
  { text: "كيف يعمل الصوت النجدي؟", answer: "الذكاء يحول أي نص عقاري للهجة النجدية تلقائياً بضبط النبرة والإيقاع." },
];

const AiChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([
    { text: "الذكاء يستمع... كيف أقدر أساعدك؟", isUser: false },
  ]);
  const [input, setInput] = useState("");

  const handleSend = (text: string) => {
    const userMsg = text || input;
    if (!userMsg.trim()) return;
    setMessages((prev) => [...prev, { text: userMsg, isUser: true }]);
    setInput("");

    const match = quickReplies.find((q) => q.text === userMsg);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { text: match?.answer || "جاري المعالجة... النظام يعمل على استفسارك تلقائياً.", isUser: false },
      ]);
    }, 800);
  };

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 w-14 h-14 rounded-full bg-primary/10 backdrop-blur-md border border-primary/30 flex items-center justify-center z-50 glow-border"
        whileTap={{ scale: 0.9 }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <MessageCircle className="w-6 h-6 text-primary" strokeWidth={1.5} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            className="fixed inset-x-4 bottom-4 top-20 z-50 glass-card flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-primary/20">
              <h3 className="text-base font-light text-foreground">المساعد الذكي</h3>
              <button onClick={() => setIsOpen(false)}>
                <X className="w-5 h-5 text-text-dim" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`max-w-[85%] p-3 rounded-lg text-sm font-light ${
                    msg.isUser
                      ? "bg-primary/20 border border-primary/30 text-foreground mr-auto"
                      : "bg-secondary/50 border border-primary/10 text-foreground ml-auto"
                  }`}
                >
                  {msg.text}
                </motion.div>
              ))}
            </div>

            <div className="p-3 border-t border-primary/20">
              <div className="flex gap-2 overflow-x-auto pb-2 mb-2">
                {quickReplies.map((q) => (
                  <button
                    key={q.text}
                    onClick={() => handleSend(q.text)}
                    className="whitespace-nowrap text-xs px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-thin hover:bg-primary/20 transition-colors"
                  >
                    {q.text}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend("")}
                  placeholder="اكتب سؤالك..."
                  className="flex-1 p-2.5 rounded-lg bg-secondary/50 border border-primary/20 text-sm font-light text-foreground placeholder:text-text-dim/50 focus:outline-none focus:border-primary/40"
                />
                <button
                  onClick={() => handleSend("")}
                  className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center"
                >
                  <Send className="w-4 h-4 text-primary" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AiChatbot;
