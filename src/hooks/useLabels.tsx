import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

const DEFAULTS: Record<string, string> = {
  "service.data_processing": "معالجة البيانات الهيكلية",
  "service.smart_radar": "رادار التنقيب البرمجي",
  "service.deed_analyzer": "محلل الصكوك العقارية",
  "service.vulnerability_scanner": "مستكشف الثغرات",
  "service.code_generator": "مولّد الأكواد الذكي",
  "service.ai_advisor": "المستشار الذكي",
  "plan.free.title": "تجربة مجانية",
  "plan.elite.title": "الرخصة التقنية الأساسية",
  "plan.business.title": "نظام تحليل البيانات المتقدم",
  "plan.pro.title": "باقة المطور Pro",
  "header.title": "عُتيبي ذكي Hub",
  "header.subtitle": "منصة الذكاء الاصطناعي التقنية",
  "footer.tagline": "حلول البرمجيات والذكاء الاصطناعي للقطاع العقاري",
};

type Ctx = {
  t: (key: string, fallback?: string) => string;
  overrides: Record<string, string>;
};

const LabelsContext = createContext<Ctx>({
  t: (k, f) => f ?? DEFAULTS[k] ?? k,
  overrides: {},
});

export const LabelsProvider = ({ children }: { children: ReactNode }) => {
  const [overrides, setOverrides] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("label_overrides").select("label_key,label_value");
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((r: any) => { map[r.label_key] = r.label_value; });
        setOverrides(map);
      }
    };
    load();

    const channel = supabase
      .channel("label_overrides_changes")
      .on("postgres_changes",
        { event: "*", schema: "public", table: "label_overrides" },
        () => load()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const t = (key: string, fallback?: string) =>
    overrides[key] ?? fallback ?? DEFAULTS[key] ?? key;

  return <LabelsContext.Provider value={{ t, overrides }}>{children}</LabelsContext.Provider>;
};

export const useLabels = () => useContext(LabelsContext);
