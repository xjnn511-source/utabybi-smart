import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { imageBase64, mimeType, expectedAmount, planName } = await req.json();
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

    return new Response(
      JSON.stringify({
        success: true,
        verified,
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
