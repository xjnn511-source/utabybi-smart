import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X, Send, Loader2, Wand2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

type Msg = { role: "user" | "assistant"; content: string; command?: string };

const quickReplies = [
  "أنتج إعلان تيك توك لفيلا في الرياض",
  "صمّم فيديو سينمائي لشقة تمليك",
  "اعمل عرض مشروع سكني للمستثمرين",
  "ما هي باقات عُتيبي ذكي؟",
];

const COMMAND_REGEX = /(أنتج|انتج|اعمل|صمّ?م|سوّ?ق|أنشئ|انشئ|اصنع|ولّ?د|ابني|اطلق).*(فيديو|إعلان|اعلان|ريلز|تيك ?توك|قصة|مونتاج|عرض)/i;

const AiChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "أهلاً! أنا المستشار الذكي 🤖 كيف أقدر أساعدك؟" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text?: string) => {
    const userMsg = text || input;
    if (!userMsg.trim() || isLoading) return;

    const isCommand = COMMAND_REGEX.test(userMsg);

    const newUserMsg: Msg = { role: "user", content: userMsg };
    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    setInput("");

    // If this is an executable command, hand off to the marketing assistant
    if (isCommand) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "تمام، فهمت الأمر ✅\nسأفتح لك مساعد التسويق الذكي وأبدأ بكتابة الخطة فوراً.",
          command: userMsg,
        },
      ]);
      window.dispatchEvent(new CustomEvent("utaybi:command", { detail: { prompt: userMsg } }));
      setTimeout(() => setIsOpen(false), 600);
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
            <div className="flex items-center justify-between p-3 border-b border-border bg-primary text-primary-foreground">
              <h3 className="text-xs font-bold">المستشار الذكي 🤖</h3>
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
              <div className="flex gap-1.5">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="اكتب سؤالك..."
                  disabled={isLoading}
                  className="flex-1 h-9 px-3 rounded-lg border border-border bg-input text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
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
