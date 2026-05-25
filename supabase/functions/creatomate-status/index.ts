import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const KEY = Deno.env.get("CREATOMATE_API_KEY");
    if (!KEY) return new Response(JSON.stringify({ error: "missing key" }), { status: 500, headers: corsHeaders });
    const { id } = await req.json();
    if (!id) return new Response(JSON.stringify({ error: "id required" }), { status: 400, headers: corsHeaders });
    const r = await fetch(`https://api.creatomate.com/v1/renders/${id}`, {
      headers: { Authorization: `Bearer ${KEY}` },
    });
    const data = await r.json();
    return new Response(JSON.stringify(data), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "err" }), { status: 500, headers: corsHeaders });
  }
});
