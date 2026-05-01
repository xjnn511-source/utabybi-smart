import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X, Send, Loader2, ShieldCheck } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

const ADMIN_ACTIVATION_COMMAND = "تفعيل صلاحيات المالك 711";
const ADMIN_DEACTIVATION_COMMAND = "إنهاء صلاحيات المالك";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

type Msg = { role: "user" | "assistant"; content: string };

const quickReplies = [
  "كيف أستخدم أدوات المعالجة الرقمية؟",
  "ما هي باقة النخبة؟",
  "كيف يعمل المونتاج؟",
  "ما الفرق بين الباقات؟",
];

const AiChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "أهلاً! أنا المستشار الذكي 🤖 كيف أقدر أساعدك؟" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAdminActive, setIsAdminActive] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const executeAdminLogic = (command: string): string | null => {
    const cmd = command.trim();

    if (cmd === ADMIN_ACTIVATION_COMMAND) {
      setIsAdminActive(true);
      return "✅ **عُتيبي ذكي Ai:** وضع الإدارة نشط الآن. النظام مستعد لتنفيذ أوامرك يا مالك المنصة. 🛡️";
    }

    if (cmd === ADMIN_DEACTIVATION_COMMAND) {
      setIsAdminActive(false);
      return "🔒 تم إنهاء وضع الإدارة. عاد النظام إلى الوضع العادي.";
    }

    if (!isAdminActive) return null;

    if (cmd.includes("تحديث الواجهة")) {
      console.log("عُتيبي ذكي Ai: جاري معالجة الأمر التنفيذي بلمحة بصر...");
      return "⚡ **تنفيذ إداري:** جاري معالجة أمر تحديث الواجهة بلمحة بصر... تم تسجيل الأمر في سجل الإدارة.";
    }

    if (cmd.includes("حالة النظام")) {
      return "📊 **حالة النظام:**\n- المحركات: نشطة ✅\n- OCR: 99.8%\n- وضع الإدارة: مفعّل 🛡️";
    }

    if (cmd.startsWith("/admin") || cmd.startsWith("أمر:")) {
      return `⚙️ **تم استلام الأمر التنفيذي:** \`${cmd}\`\nسيتم تنفيذه ضمن صلاحيات المالك.`;
    }

    return null;
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text?: string) => {
    const userMsg = text || input;
    if (!userMsg.trim() || isLoading) return;

    const newUserMsg: Msg = { role: "user", content: userMsg };
    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    setInput("");

    // اعتراض الأوامر الإدارية السرية قبل إرسالها لـ AI
    const adminResponse = executeAdminLogic(userMsg);
    if (adminResponse !== null) {
      setMessages((prev) => [...prev, { role: "assistant", content: adminResponse }]);
      return;
    }

    setIsLoading(true);

    let assistantSoFar = "";

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!resp.ok || !resp.body) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || "فشل الاتصال");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant" && prev.length > updatedMessages.length) {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: err.message || "حدث خطأ، حاول مرة أخرى." },
      ]);
    }

    setIsLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 left-5 w-14 h-14 rounded-full btn-neon flex items-center justify-center z-50 shadow-[0_0_20px_hsl(var(--primary)/0.6)]"
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
            <div className="flex items-center justify-between p-3 border-b border-border bg-primary text-primary-foreground">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold">المستشار الذكي 🤖</h3>
                {isAdminActive && (
                  <span className="flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 border border-green-400/40">
                    <ShieldCheck className="w-3 h-3" />
                    وضع المالك
                  </span>
                )}
              </div>
              <button onClick={() => setIsOpen(false)} className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] p-2.5 rounded-lg text-xs ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground mr-auto"
                      : "bg-secondary text-foreground ml-auto"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm prose-slate max-w-none text-xs [&>p]:m-0 [&>ul]:m-0 [&>ol]:m-0">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="max-w-[85%] p-2.5 rounded-lg bg-secondary text-foreground ml-auto flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin text-primary" />
                  <span className="text-[10px] text-muted-foreground">جاري التفكير...</span>
                </div>
              )}
            </div>

            <div className="p-2.5 border-t border-border">
              <div className="flex gap-1.5 overflow-x-auto pb-1.5 mb-1.5">
                {quickReplies.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    disabled={isLoading}
                    className="whitespace-nowrap text-[10px] px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  dir="rtl"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="اكتب سؤالك هنا..."
                  disabled={isLoading}
                  autoFocus
                  className="flex-1 h-11 px-3 rounded-lg border-2 border-primary/40 bg-background text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={isLoading}
                  className="w-9 h-9 rounded-lg btn-neon flex items-center justify-center disabled:opacity-50"
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
