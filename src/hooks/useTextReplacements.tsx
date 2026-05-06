import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type Pair = { find: string; replace: string };

let currentPairs: Pair[] = [];

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "INPUT", "CODE", "PRE"]);

const applyToNode = (root: Node) => {
  if (currentPairs.length === 0) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      const p = node.parentElement;
      if (!p) return NodeFilter.FILTER_REJECT;
      if (SKIP_TAGS.has(p.tagName)) return NodeFilter.FILTER_REJECT;
      if (p.closest("[data-no-replace]")) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const nodes: Text[] = [];
  let n: Node | null;
  while ((n = walker.nextNode())) nodes.push(n as Text);
  for (const tn of nodes) {
    let txt = tn.nodeValue || "";
    let changed = false;
    for (const { find, replace } of currentPairs) {
      if (txt.includes(find)) {
        txt = txt.split(find).join(replace);
        changed = true;
      }
    }
    if (changed) tn.nodeValue = txt;
  }
};

const applyAll = () => applyToNode(document.body);

export const useTextReplacements = () => {
  useEffect(() => {
    let observer: MutationObserver | null = null;

    const load = async () => {
      const { data } = await supabase.from("text_replacements" as any).select("find_text,replace_text");
      if (data) {
        currentPairs = (data as any[])
          .map((r) => ({ find: r.find_text as string, replace: r.replace_text as string }))
          .sort((a, b) => b.find.length - a.find.length);
        applyAll();
      }
    };

    load();

    observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            const p = (node as Text).parentElement;
            if (p && !SKIP_TAGS.has(p.tagName)) {
              let txt = (node as Text).nodeValue || "";
              let changed = false;
              for (const { find, replace } of currentPairs) {
                if (txt.includes(find)) { txt = txt.split(find).join(replace); changed = true; }
              }
              if (changed) (node as Text).nodeValue = txt;
            }
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            applyToNode(node);
          }
        });
        if (m.type === "characterData" && m.target.nodeType === Node.TEXT_NODE) {
          const tn = m.target as Text;
          const p = tn.parentElement;
          if (!p || SKIP_TAGS.has(p.tagName)) continue;
          let txt = tn.nodeValue || "";
          let changed = false;
          for (const { find, replace } of currentPairs) {
            if (txt.includes(find)) { txt = txt.split(find).join(replace); changed = true; }
          }
          if (changed && tn.nodeValue !== txt) tn.nodeValue = txt;
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

    const channel = supabase
      .channel("text_replacements_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "text_replacements" }, () => load())
      .subscribe();

    return () => {
      observer?.disconnect();
      supabase.removeChannel(channel);
    };
  }, []);
};
