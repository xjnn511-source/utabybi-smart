import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X, Send } from "lucide-react";
import { useState } from "react";

const quickReplies = [
  { text: "كيف أرفع صك؟", answer: "فقط أسقط ملف الصك في منطقة تحليل الصكوك — النظام يحلله تلقائياً خلال ثوانٍ." },
  { text: "ما هي باقة النخبة؟", answer: "باقة النخبة بـ ٩٩ ريال/شهر تتيح تحليل ٥ صكوك وبوستر واحد شهرياً." },
  { text: "كيف يعمل الدعم العقاري؟", answer: "الذكاء يحول أي نص عقاري للهجة النجدية تلقائياً بضبط النبرة والإيقاع." },
];

const AiChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([
    { text: "أهلاً! أنا المستشار الذكي، كيف أقدر أساعدك؟ 🏠", isUser: false },
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
        { text: match?.answer || "جاري المعالجة... النظام يعمل على استفسارك.", isUser: false },
      ]);
    }, 800);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 left-5 w-12 h-12 rounded-full btn-neon flex items-center justify-center z-50"
      >
        <MessageCircle className="w-5 h-5" strokeWidth={2} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            className="fixed inset-x-3 bottom-3 top-16 z-50 bg-card border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between p-3 border-b border-border bg-secondary">
              <h3 className="text-xs font-bold text-foreground">المستشار الذكي 🤖</h3>
              <button onClick={() => setIsOpen(false)} className="text-text-dim hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] p-2.5 rounded-lg text-xs ${
                    msg.isUser
                      ? "bg-primary text-primary-foreground mr-auto"
                      : "bg-secondary text-foreground ml-auto"
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            <div className="p-2.5 border-t border-border">
              <div className="flex gap-1.5 overflow-x-auto pb-1.5 mb-1.5">
                {quickReplies.map((q) => (
                  <button
                    key={q.text}
                    onClick={() => handleSend(q.text)}
                    className="whitespace-nowrap text-[10px] px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {q.text}
                  </button>
                ))}
              </div>
              <div className="flex gap-1.5">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend("")}
                  placeholder="اكتب سؤالك..."
                  className="flex-1 h-9 px-3 rounded-lg border border-border bg-secondary text-xs text-foreground placeholder:text-text-dim focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  onClick={() => handleSend("")}
                  className="w-9 h-9 rounded-lg btn-neon flex items-center justify-center"
                >
                  <Send className="w-3.5 h-3.5" strokeWidth={2} />
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
