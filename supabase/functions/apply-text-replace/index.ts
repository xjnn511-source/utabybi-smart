import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM = `أنت محرك تعديل نصوص الواجهة. يصلك أمر طبيعي من المالك (مثلاً: "غيّر كلمة النخبة إلى الذهبية" أو "بدّل عُتيبي ذكي Hub بـ منصة عُتيبي" أو "خلّ زر ابدأ الآن يصير انطلق").
استخرج كل أزواج (النص الحالي → النص الجديد) المطلوبة. النص الحالي يجب أن يكون مطابقاً تماماً لما يظهر في الواجهة (بدون تعديل أو ترجمة).
أرجع JSON فقط:
{"pairs":[{"find":"<النص القديم>","replace":"<النص الجديد>"}]}
إذا لم تستطع التحديد بدقة أرجع: {"pairs":[]}`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "غير مصرح" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } } });

    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "غير مصرح" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: roleRows } = await admin.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin");
    if (!roleRows || roleRows.length === 0) return new Response(JSON.stringify({ error: "هذه الميزة للمالك فقط" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { command } = await req.json();
    if (!command || typeof command !== "string") return new Response(JSON.stringify({ error: "أمر غير صالح" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: SYSTEM }, { role: "user", content: command }],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResp.ok) {
      console.error("AI error", aiResp.status, await aiResp.text());
      return new Response(JSON.stringify({ error: "فشل تحليل الأمر" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const aiData = await aiResp.json();
    const content = aiData.choices?.[0]?.message?.content || "{}";
    let parsed: { pairs?: Array<{ find: string; replace: string }> } = {};
    try { parsed = JSON.parse(content); } catch { parsed = {}; }

    const pairs = (parsed.pairs || []).filter(p => p.find && p.replace && p.find !== p.replace);
    if (pairs.length === 0) {
      return new Response(JSON.stringify({ success: false, message: "لم أفهم النص المراد تغييره. اذكر النص الحالي بدقة كما يظهر في الواجهة." }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const rows = pairs.map(p => ({ find_text: p.find, replace_text: p.replace, updated_by: user.id, updated_at: new Date().toISOString() }));
    const { error: upsertErr } = await admin.from("text_replacements").upsert(rows, { onConflict: "find_text" });
    if (upsertErr) {
      console.error("upsert", upsertErr);
      return new Response(JSON.stringify({ error: "فشل الحفظ" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ success: true, pairs }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "خطأ" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
