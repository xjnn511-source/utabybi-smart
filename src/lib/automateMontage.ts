import { supabase } from "@/integrations/supabase/client";

/**
 * أتمتة المونتاج: ترفع الوسائط + نص التعليق الصوتي إلى محرك المعالجة الداخلي،
 * ويعود برابط الفيديو الجاهز. لا توجد أي مفاتيح API في الواجهة.
 */
export async function executeAutomatedMontage(
  mediaFile: File,
  voiceoverText: string,
  durationSeconds = 30,
): Promise<string> {
  const formData = new FormData();
  formData.append("media", mediaFile);
  formData.append("voiceover", voiceoverText);
  formData.append("duration", String(durationSeconds));

  const { data, error } = await supabase.functions.invoke("automate-montage", {
    body: formData,
  });

  if (error) {
    let details = error.message;
    try {
      const ctx = (error as unknown as { context?: Response }).context;
      if (ctx) {
        const parsed = JSON.parse(await ctx.clone().text());
        if (parsed?.error) details = parsed.error;
      }
    } catch {
      /* keep the original message */
    }
    console.error("خطأ في الأتمتة:", details);
    throw new Error(details || "فشلت عملية المعالجة الآلية، تأكد من صحة الملفات المرفقة.");
  }

  if (!data?.ok || !data?.videoUrl) {
    const message = data?.error || "فشلت عملية المعالجة الآلية، تأكد من صحة الملفات المرفقة.";
    console.error("خطأ في الأتمتة:", message);
    throw new Error(message);
  }

  return data.videoUrl as string;
}
