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
    { text: "مرحباً! كيف يمكنني مساعدتك؟", isUser: false },
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
        className="fixed bottom-6 left-6 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center z-50 shadow-lg hover:bg-primary/90 transition-colors"
      >
        <MessageCircle className="w-6 h-6" strokeWidth={2} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            className="fixed inset-x-4 bottom-4 top-20 z-50 bg-card border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-border bg-secondary">
              <h3 className="text-sm font-bold text-foreground">المساعد الذكي</h3>
              <button onClick={() => setIsOpen(false)} className="text-text-dim hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] p-3 rounded-lg text-sm ${
                    msg.isUser
                      ? "bg-primary text-primary-foreground mr-auto"
                      : "bg-secondary text-foreground ml-auto"
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-border">
              <div className="flex gap-2 overflow-x-auto pb-2 mb-2">
                {quickReplies.map((q) => (
                  <button
                    key={q.text}
                    onClick={() => handleSend(q.text)}
                    className="whitespace-nowrap text-xs px-3 py-1.5 rounded-full bg-accent border border-border text-accent-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
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
                  className="flex-1 h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  onClick={() => handleSend("")}
                  className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
                >
                  <Send className="w-4 h-4" strokeWidth={2} />
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
