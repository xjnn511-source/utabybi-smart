import { useEffect, useRef, useState } from "react";
import { Volume2, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { firstName } from "@/lib/sanitizeName";

/**
 * ترحيب ذكي يعمل تلقائياً عند تحميل اللوحة (onMount):
 * - يستخرج اسم العميل من جلسة الدخول وينظّفه من محارف التحكم.
 * - يولّد ترحيباً قصيراً بصوت المالك المستنسخ (Voice ID مقفل في السيرفر).
 * - يُشغَّل مرة واحدة لكل جلسة فقط (sessionStorage) حفاظاً على رصيد الحروف.
 * - أي فشل في الصوت لا يكسر الواجهة إطلاقاً (محاط بحماية كاملة).
 */
const SESSION_KEY = "utaybi_welcome_played";

const SmartWelcome = () => {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ready">("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;
    let mounted = true;

    (async () => {
      try {
        const { data } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
        const user = data?.user;
        if (!user || !mounted) return;

        const meta = (user.user_metadata || {}) as Record<string, unknown>;
        const display = firstName(
          (meta.full_name as string) || (meta.name as string) || user.email || "",
        );
        if (!mounted) return;
        setName(display);

        // تشغيل صوتي مرة واحدة لكل جلسة فقط — توفير الرصيد
        if (sessionStorage.getItem(SESSION_KEY)) return;

        const greeting = display
          ? `أهلاً ${display}، معك عُتيبي ذكي. منصتك جاهزة الآن.`
          : `أهلاً بك في عُتيبي ذكي. منصتك جاهزة الآن.`;

        setStatus("loading");
        const { data: tts, error } = await supabase.functions.invoke("tts-voice", {
          body: { text: greeting.slice(0, 160) },
        });
        if (error || !tts?.ok || !tts?.audio) {
          setStatus("idle");
          return;
        }
        sessionStorage.setItem(SESSION_KEY, "1");
        if (!mounted) return;
        setStatus("ready");
        const audio = new Audio(tts.audio);
        audioRef.current = audio;
        audio.play().catch(() => {
          /* المتصفح قد يمنع التشغيل التلقائي — نتجاهل بهدوء */
        });
      } catch {
        if (mounted) setStatus("idle");
      }
    })();

    return () => {
      mounted = false;
      audioRef.current?.pause();
    };
  }, []);

  const replay = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  if (!name && status === "idle") return null;

  return (
    <div className="card-neon p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center shadow-[0_0_18px_hsl(var(--primary)/0.5)]">
        <Sparkles className="w-5 h-5 text-white" strokeWidth={2.2} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-foreground">
          {name ? `أهلاً ${name} 👋` : "أهلاً بك 👋"}
        </p>
        <p className="text-[10px] text-muted-foreground">
          منصتك جاهزة — ترحيب بصوت عُتيبي ذكي الشخصي
        </p>
      </div>
      {status === "loading" ? (
        <Loader2 className="w-4 h-4 text-primary animate-spin" />
      ) : status === "ready" ? (
        <button
          onClick={replay}
          aria-label="إعادة تشغيل الترحيب الصوتي"
          className="w-9 h-9 rounded-lg bg-secondary border border-primary/30 flex items-center justify-center text-primary hover:bg-primary/10"
        >
          <Volume2 className="w-4 h-4" />
        </button>
      ) : null}
    </div>
  );
};

export default SmartWelcome;
