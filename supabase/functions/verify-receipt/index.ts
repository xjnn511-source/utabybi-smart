import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const EXPECTED_IBAN = "SA3780000322608016224462";
const EXPECTED_NAME_KEYWORDS = ["otaibi", "عتيبي", "عُتيبي"];

const normalize = (s: string) =>
  (s || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9\u0600-\u06ff]/g, "");

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageBase64, mimeType, expectedAmount, planName, plan } = await req.json();
    if (!imageBase64 || !mimeType) {
      return new Response(JSON.stringify({ error: "imageBase64 and mimeType are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "أنت نظام تحقق من إيصالات التحويل البنكي السعودية. استخرج بدقة: اسم المستفيد (recipientName) كما يظهر، ورقم الآيبان (iban) كاملاً بدون مسافات، ومبلغ التحويل (amount) إن وُجد. لا تخترع بيانات.",
          },
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
              { type: "text", text: "استخرج بيانات الإيصال." },
            ],
          },
        ],
        tools: [{
          type: "function",
          function: {
            name: "extract_receipt",
            description: "Extract bank transfer receipt fields",
            parameters: {
              type: "object",
              properties: {
                recipientName: { type: "string" },
                iban: { type: "string" },
                amount: { type: "string" },
              },
              required: ["recipientName", "iban"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "extract_receipt" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "تم تجاوز حد الطلبات، حاول لاحقاً" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "يرجى شحن الرصيد للاستمرار" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "فشل تحليل الإيصال" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ai = await response.json();
    const tc = ai.choices?.[0]?.message?.tool_calls?.[0];
    let extracted: any = {};
    if (tc?.function?.arguments) {
      try { extracted = JSON.parse(tc.function.arguments); } catch {}
    }

    const nName = normalize(extracted.recipientName || "");
    const nIban = normalize(extracted.iban || "");
    const expectedIban = normalize(EXPECTED_IBAN);

    const nameMatch = EXPECTED_NAME_KEYWORDS.some((k) => nName.includes(normalize(k)));
    const ibanMatch = nIban === expectedIban;

    // Amount / package matching
    const parseAmount = (v: unknown): number | null => {
      if (v === null || v === undefined) return null;
      const digits = String(v).replace(/[^\d.]/g, "");
      const n = parseFloat(digits);
      return isNaN(n) ? null : n;
    };
    const paidAmount = parseAmount(extracted.amount);
    const wanted = parseAmount(expectedAmount);
    // amountMatch is only enforced when an expected amount was provided
    const amountMatch = wanted === null
      ? true
      : paidAmount !== null && Math.abs(paidAmount - wanted) < 0.5;

    const verified = nameMatch && ibanMatch && amountMatch;

    // عند نجاح التحقق نُفعّل الاشتراك في قاعدة البيانات (مصدر الحقيقة)
    let activated = false;
    if (verified) {
      try {
        const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
        const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;

        // استخراج المستخدم من رأس المصادقة
        const authHeader = req.headers.get("Authorization") ?? "";
        const userClient = createClient(SUPABASE_URL, ANON, {
          global: { headers: { Authorization: authHeader } },
        });
        const { data: userData } = await userClient.auth.getUser();
        const userId = userData?.user?.id ?? null;

        if (!userId) {
          return new Response(
            JSON.stringify({ error: "يلزم تسجيل الدخول لتفعيل الاشتراك" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const validPlans = ["leadership", "office", "elite"];
        const planValue = validPlans.includes(plan) ? plan : "office";
        const now = new Date();
        const expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
        // إلغاء أي اشتراك سابق ثم إدراج اشتراك مفعّل جديد
        await admin.from("subscribers").delete().eq("user_id", userId);
        const { error: insErr } = await admin.from("subscribers").insert({
          user_id: userId,
          plan: planValue,
          price_sar: wanted ?? 0,
          is_active: true,
          starts_at: now.toISOString(),
          expires_at: expires.toISOString(),
        });
        if (insErr) {
          console.error("subscribers insert error:", insErr);
          throw new Error("تعذّر تفعيل الاشتراك في قاعدة البيانات");
        }
        activated = true;
      } catch (dbErr) {
        console.error("activation error:", dbErr);
        return new Response(
          JSON.stringify({ error: dbErr instanceof Error ? dbErr.message : "فشل التفعيل" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        verified,
        activated,
        nameMatch,
        ibanMatch,
        amountMatch,
        paidAmount,
        expectedAmount: wanted,
        planName: planName ?? null,
        extracted,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("verify-receipt error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
