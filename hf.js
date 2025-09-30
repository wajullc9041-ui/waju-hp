// hf.js
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://htnmjsqgoapvuanrsuma.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0bm1qc3Fnb2FwdnVhbnJzdW1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMzI3MDEsImV4cCI6MjA3MDkwODcwMX0.1AACTWZmChfmIIfBad0sf-hLV2bnaUt7bVURXnd0uKA";

const sb = createClient(supabaseUrl, supabaseKey);

function setInner(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html || "";
}

function adjustOffsets() {
  const headerEl = document.getElementById("site-header");
  const footerEl = document.getElementById("site-footer");
  const mainEl = document.querySelector("main");
  if (!mainEl) return;
  if (headerEl) mainEl.style.paddingTop = headerEl.offsetHeight + "px";
  if (footerEl) mainEl.style.paddingBottom = footerEl.offsetHeight + "px";
}

async function loadHF() {
  try {
    const [r1, r2] = await Promise.all([
      sb.from("hf_settings").select("data").eq("area", "header").single(),
      sb.from("hf_settings").select("data").eq("area", "footer").single()
    ]);
    const hdr = r1?.data || null;
    const ftr = r2?.data || null;
    const headerHtml = hdr?.headerHtml || hdr?.data?.headerHtml || "";
    const footerHtml = ftr?.footerHtml || ftr?.data?.footerHtml || "";
    setInner("site-header", headerHtml);
    setInner("site-footer", footerHtml);
    adjustOffsets();
  } catch (e) {
    console.warn("HF load failed", e);
  } finally {
    // FOUC対策：処理完了後に表示
    const body = document.getElementById("page-body");
    if (body) body.style.visibility = "visible";
  }
}

// ページロード時に必ず実行
loadHF();

// 念のための保険：3秒経過後には強制的に表示を復帰
setTimeout(() => {
  const body = document.getElementById("page-body");
  if (body) body.style.visibility = "visible";
}, 3000);
