// hf.js (final version)
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://htnmjsqgoapvuanrsuma.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0bm1qc3Fnb2FwdnVhbnJzdW1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMzI3MDEsImV4cCI6MjA3MDkwODcwMX0.1AACTWZmChfmIIfBad0sf-hLV2bnaUt7bVURXnd0uKA";

const sb = createClient(supabaseUrl, supabaseKey);


function injectStyle(cssText, id) {
  if (!cssText) return;
  let styleTag = document.getElementById(id);
  if (!styleTag) {
    styleTag = document.createElement("style");
    styleTag.id = id;
    document.head.appendChild(styleTag);
  }
  styleTag.innerHTML = cssText;
}


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

    const hdr = r1?.data?.data || {};
    const ftr = r2?.data?.data || {};

    const headerHtml = hdr.headerHtml || "";
const footerHtml = ftr.footerHtml || "";
const headerCss  = hdr.headerCss || "";
const footerCss  = ftr.footerCss || "";

    setInner("site-header", headerHtml);
    setInner("site-footer", footerHtml);

// CSSを挿入
injectStyle(headerCss, "site-header-style");
injectStyle(footerCss, "site-footer-style");
    adjustOffsets();
  } catch (e) {
    console.warn("HF load failed", e);
  } finally {
    const body = document.getElementById("page-body");
    if (body) body.style.visibility = "visible";
  }
}

loadHF();

setTimeout(() => {
  const body = document.getElementById("page-body");
  if (body) body.style.visibility = "visible";
}, 3000);

console.log("hf.js final loaded");
