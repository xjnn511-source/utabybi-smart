import { Download, Image as ImageIcon, Loader2, Music, Play, Plus, Trash2, Video } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { speakOtaibi } from "@/lib/otaibiVoice";

type RenderStatus = "idle" | "ready" | "rendering" | "done" | "error";

interface MontageImage {
  id: string;
  file: File;
  url: string;
  image?: HTMLImageElement;
}

const WIDTH = 720;
const HEIGHT = 1280;
const FPS = 30;
const SLIDE_SECONDS = 3;

const selectMimeType = () => {
  if (typeof MediaRecorder === "undefined") return "";
  if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")) return "video/webm;codecs=vp9,opus";
  if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")) return "video/webm;codecs=vp8,opus";
  return "video/webm";
};

const VideoMontageCard = () => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const audioUrlRef = useRef<string | null>(null);

  const [images, setImages] = useState<MontageImage[]>([]);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<RenderStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    audioUrlRef.current = audioUrl;
  }, [audioUrl]);

  useEffect(() => {
    images.forEach((item) => {
      if (item.image) return;
      const image = new Image();
      image.onload = () => {
        setImages((current) => current.map((entry) => (entry.id === item.id ? { ...entry, image } : entry)));
      };
      image.src = item.url;
    });
  }, [images]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawFrame(ctx, 0);
    return () => cancelAnimationFrame(rafRef.current);
  }, [images]);

  useEffect(() => {
    return () => {
      images.forEach((image) => URL.revokeObjectURL(image.url));
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const drawFrame = (ctx: CanvasRenderingContext2D, seconds: number) => {
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    const loaded = images.filter((item) => item.image);
    if (!loaded.length) {
      ctx.direction = "rtl";
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(255,255,255,0.72)";
      ctx.font = "800 34px Cairo, system-ui, sans-serif";
      ctx.fillText("أضف الصور وملف الصوت لإنتاج فيديو WebM", WIDTH / 2, HEIGHT / 2);
      return;
    }

    const total = loaded.length * SLIDE_SECONDS;
    const t = total ? seconds % total : 0;
    const index = Math.min(loaded.length - 1, Math.floor(t / SLIDE_SECONDS));
    const local = (t - index * SLIDE_SECONDS) / SLIDE_SECONDS;
    const active = loaded[index].image!;

    const imageRatio = active.width / active.height;
    const canvasRatio = WIDTH / HEIGHT;
    const zoom = 1.04 + local * 0.08;
    let drawWidth = WIDTH * zoom;
    let drawHeight = drawWidth / imageRatio;
    if (drawHeight < HEIGHT * zoom) {
      drawHeight = HEIGHT * zoom;
      drawWidth = drawHeight * imageRatio;
    }
    const x = (WIDTH - drawWidth) / 2 + (local - 0.5) * 26;
    const y = (HEIGHT - drawHeight) / 2;
    ctx.drawImage(active, x, y, drawWidth, drawHeight);

    const top = ctx.createLinearGradient(0, 0, 0, 360);
    top.addColorStop(0, "rgba(2,6,23,0.86)");
    top.addColorStop(1, "rgba(2,6,23,0)");
    ctx.fillStyle = top;
    ctx.fillRect(0, 0, WIDTH, 360);

    const bottom = ctx.createLinearGradient(0, HEIGHT - 420, 0, HEIGHT);
    bottom.addColorStop(0, "rgba(2,6,23,0)");
    bottom.addColorStop(1, "rgba(2,6,23,0.9)");
    ctx.fillStyle = bottom;
    ctx.fillRect(0, HEIGHT - 420, WIDTH, 420);

    ctx.direction = "rtl";
    ctx.textAlign = "right";
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0,0,0,0.55)";
    ctx.shadowBlur = 12;
    ctx.font = "900 44px Cairo, system-ui, sans-serif";
    ctx.fillText("عُتيبي ذكي Hub", WIDTH - 42, 94);
    ctx.font = "700 26px Cairo, system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.82)";
    ctx.fillText("مونتاج عقاري WebM فعلي", WIDTH - 42, 138);
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#bf5af2";
    ctx.fillRect(WIDTH - 236, 158, 194, 5);

    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 48px Cairo, system-ui, sans-serif";
    ctx.fillText("مشهد عقاري جاهز للنشر", WIDTH / 2, HEIGHT - 170);
    ctx.font = "700 22px Cairo, system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.68)";
    ctx.fillText(`المشهد ${index + 1} من ${loaded.length}`, WIDTH / 2, HEIGHT - 126);

    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(255,255,255,0.52)";
    ctx.font = "700 18px Cairo, system-ui, sans-serif";
    ctx.fillText("FL-822675484", 30, HEIGHT - 34);
  };

  const handleImages = (files: FileList | null) => {
    if (!files?.length) return;
    const selected = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (!selected.length) {
      toast({ title: "اختر صوراً فقط", variant: "destructive" });
      return;
    }
    const next = selected.map((file) => ({ id: crypto.randomUUID(), file, url: URL.createObjectURL(file) }));
    setImages((current) => [...current, ...next]);
    setStatus("ready");
    speakOtaibi(`تم تحميل ${next.length} صورة. المونتاج جاهز لإنتاج فيديو ويب إم حقيقي.`, { profile: "majestic" });
  };

  const handleAudio = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("audio/")) {
      toast({ title: "اختر ملف صوت mp3 أو wav", variant: "destructive" });
      return;
    }
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    const url = URL.createObjectURL(file);
    setAudioFile(file);
    setAudioUrl(url);
    speakOtaibi("تم ربط الملف الصوتي بالمونتاج، ويمكن الآن دمجه داخل الفيديو النهائي.", { profile: "majestic" });
  };

  const removeImage = (id: string) => {
    setImages((current) => {
      const target = current.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.url);
      const next = current.filter((item) => item.id !== id);
      if (!next.length) setStatus("idle");
      return next;
    });
  };

  const playPreview = async () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !images.some((item) => item.image)) {
      toast({ title: "أضف صوراً أولاً", variant: "destructive" });
      return;
    }
    const total = images.length * SLIDE_SECONDS;
    const start = performance.now();
    const loop = () => {
      const t = (performance.now() - start) / 1000;
      drawFrame(ctx, Math.min(t, total));
      if (t < total) rafRef.current = requestAnimationFrame(loop);
    };
    speakOtaibi("هذه معاينة حقيقية للمونتاج قبل التصدير، الصور تتحرك على لوحة الرسم البرمجية.", { profile: "majestic" });
    loop();
  };

  const renderVideo = async () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    if (!images.some((item) => item.image)) {
      toast({ title: "أضف صوراً وانتظر تحميلها", variant: "destructive" });
      return;
    }
    if (typeof MediaRecorder === "undefined" || !canvas.captureStream) {
      toast({ title: "المتصفح لا يدعم MediaRecorder", variant: "destructive" });
      return;
    }

    setStatus("rendering");
    setProgress(0);
    setVideoUrl(null);

    let audioContext: AudioContext | null = null;
    let audioElement: HTMLAudioElement | null = null;
    const stream = canvas.captureStream(FPS);
    try {
      if (audioUrl) {
        audioContext = new AudioContext();
        audioElement = new Audio(audioUrl);
        const source = audioContext.createMediaElementSource(audioElement);
        const destination = audioContext.createMediaStreamDestination();
        source.connect(destination);
        destination.stream.getAudioTracks().forEach((track) => stream.addTrack(track));
      }

      const mimeType = selectMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType, videoBitsPerSecond: 4_500_000 } : undefined);
      const chunks: Blob[] = [];
      const totalSeconds = images.length * SLIDE_SECONDS;
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
      };

      const completed = new Promise<Blob>((resolve, reject) => {
        recorder.onerror = () => reject(new Error("فشل تسجيل الفيديو"));
        recorder.onstop = () => resolve(new Blob(chunks, { type: "video/webm" }));
      });

      recorder.start(250);
      if (audioElement && audioContext) {
        await audioContext.resume();
        audioElement.currentTime = 0;
        await audioElement.play().catch(() => undefined);
      }

      await new Promise<void>((resolve) => {
        const start = performance.now();
        const loop = () => {
          const elapsed = (performance.now() - start) / 1000;
          drawFrame(ctx, Math.min(elapsed, totalSeconds));
          setProgress(Math.min(100, Math.round((elapsed / totalSeconds) * 100)));
          if (elapsed >= totalSeconds) resolve();
          else rafRef.current = requestAnimationFrame(loop);
        };
        loop();
      });

      if (audioElement) audioElement.pause();
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      recorder.stop();
      const blob = await completed;
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      setStatus("done");
      setProgress(100);
      speakOtaibi("تم إنتاج فيديو ويب إم حقيقي وقابل للتنزيل والتشغيل بنجاح.", { profile: "majestic" });
      toast({ title: "تم إنشاء فيديو WebM فعلي" });
    } catch (error: unknown) {
      console.error("MediaRecorder montage failed", error);
      setStatus("error");
      const message = error instanceof Error ? error.message : "حاول مرة أخرى";
      toast({ title: "فشل إنشاء الفيديو", description: message, variant: "destructive" });
    } finally {
      if (audioContext) audioContext.close();
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const downloadVideo = () => {
    if (!videoUrl) return;
    const anchor = document.createElement("a");
    anchor.href = videoUrl;
    anchor.download = `otaibi-webm-montage-${Date.now()}.webm`;
    anchor.click();
  };

  return (
    <div className="card-neon p-5 relative">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
          <Video className="w-5 h-5 text-primary" strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground">معالج الوسائط الرقمية</h2>
          <p className="text-[10px] text-muted-foreground">رفع صور وصوت ثم إنتاج WebM عبر MediaRecorder</p>
        </div>
      </div>

      <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleImages(e.target.files)} />
      <input ref={audioInputRef} type="file" accept="audio/mp3,audio/mpeg,audio/wav,audio/*" className="hidden" onChange={(e) => handleAudio(e.target.files?.[0])} />

      <div className="aspect-video max-h-36 rounded-lg overflow-hidden mb-3 relative bg-secondary border border-border">
        <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="absolute inset-0 w-full h-full object-cover" />
        {status === "rendering" && (
          <div className="absolute inset-0 bg-background/70 flex flex-col gap-2 items-center justify-center">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <p className="text-[10px] text-foreground">يتم التسجيل فعلياً عبر MediaRecorder — {progress}%</p>
            <div className="w-36 h-1.5 bg-border rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <button onClick={() => imageInputRef.current?.click()} className="h-10 bg-secondary border border-border text-foreground text-xs font-bold rounded-[var(--radius)] flex items-center justify-center gap-2 hover:border-primary transition-all">
          <Plus className="w-3.5 h-3.5 text-primary" /> صور ({images.length})
        </button>
        <button onClick={() => audioInputRef.current?.click()} className="h-10 bg-secondary border border-border text-foreground text-xs font-bold rounded-[var(--radius)] flex items-center justify-center gap-2 hover:border-primary transition-all">
          <Music className="w-3.5 h-3.5 text-primary" /> {audioFile ? "صوت مرتبط" : "mp3 / wav"}
        </button>
      </div>

      {images.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
          {images.map((item) => (
            <div key={item.id} className="relative shrink-0 w-14 h-20 rounded border border-border overflow-hidden bg-secondary">
              <img src={item.url} alt={item.file.name} className="w-full h-full object-cover" />
              <button onClick={() => removeImage(item.id)} className="absolute top-1 left-1 w-5 h-5 rounded bg-background/80 flex items-center justify-center text-destructive">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <button onClick={playPreview} disabled={!images.length || status === "rendering"} className="h-10 bg-secondary border border-border text-foreground text-xs font-bold rounded-[var(--radius)] flex items-center justify-center gap-2 hover:border-primary transition-all disabled:opacity-50">
          <Play className="w-3.5 h-3.5 text-primary" /> معاينة حقيقية
        </button>
        {videoUrl ? (
          <button onClick={downloadVideo} className="h-10 btn-neon text-xs flex items-center justify-center gap-2">
            <Download className="w-3.5 h-3.5" /> تنزيل WebM
          </button>
        ) : (
          <button onClick={renderVideo} disabled={!images.length || status === "rendering"} className="h-10 btn-neon text-xs flex items-center justify-center gap-2 disabled:opacity-50">
            {status === "rendering" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />}
            إنتاج الفيديو
          </button>
        )}
      </div>

      <p className="text-[8px] text-muted-foreground/50 text-center mt-2 leading-relaxed">
        الناتج ملف WebM فعلي من الصور والصوت المحليين داخل المتصفح، بدون مفاتيح API خارجية.
        <br />عُتيبي ذكي 🤖
      </p>
    </div>
  );
};

export default VideoMontageCard;