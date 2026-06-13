/**
 * تنظيف اسم العميل من محارف التحكم في الاتجاه (RTL/LTR marks) وغيرها من
 * المحارف غير المرئية التي تأتي عادةً من حسابات Google.
 *
 * هذه المحارف (مثل U+202B و U+200E و U+200F) هي السبب المباشر لخطأ:
 * "Failed to construct 'Request': 'headers' ... is not a valid ByteString"
 * عند وضع الاسم — عن طريق الخطأ — داخل ترويسة طلب (header).
 *
 * النتيجة: اسم نظيف صالح للعرض وللاستخدام النصي بأمان.
 */
export const sanitizeName = (raw?: string | null): string => {
  if (!raw) return "";
  return raw
    // محارف التنسيق والاتجاه غير المرئية
    .replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, "")
    // محارف تحكم عامة
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

/** يُرجع الاسم الأول النظيف فقط (أول كلمة عربية/لاتينية حقيقية). */
export const firstName = (raw?: string | null): string => {
  const clean = sanitizeName(raw);
  if (!clean) return "";
  const parts = clean.split(" ").filter(Boolean);
  return parts[0] || "";
};
