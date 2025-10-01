\
// hf.js (with CSS injection + core CSS + fixed header/footer fallback)
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://htnmjsqgoapvuanrsuma.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0bm1qc3Fnb2FwdnVhbnJzdW1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMzI3MDEsImV4cCI6MjA3MDkwODcwMX0.1AACTWZmChfmIIfBad0sf-hLV2bnaUt7bVURXnd0uKA";

const sb = createClient(supabaseUrl, supabaseKey);

const CORE_CSS = `
.hfbar,.hfbar-footer{display:flex;align-items:center;box-sizing:border-box;gap:var(--gap,16px)}
.hf-row{flex-direction:row}
.hf-col{flex-direction:column}
.slot{display:flex;align-items:center}
.slot.brand{margin-right:auto}
.slot.nav{margin-left:auto}
.hf-brand{display:flex;align-items:center;gap:12px}
.hf-brand img{display:block;max-width:100%;height:auto}
.hf-nav{display:flex;align-items:center;gap:var(--gap,16px);flex-wrap:wrap}
.hf-nav a{color:inherit;text-decoration:none}
.hf-nav a:hover{opacity:.85}
.hf-footer-nav{display:flex;align-items:center;gap:var(--gap,16px);flex-wrap:wrap;justify-content:center}
.hf-footer-text{text-align:center}
`;

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

function adjustOffsets({ headerFixed, footerFixed } = {}) {
  const headerEl = document.getElementById("site-header");
  const footerEl = document.getElementById("site-footer");
  const mainEl = document.querySelector("main");
  if (!mainEl) return;

  const headerBox = headerEl ? headerEl.getBoundingClientRect() : null;
  const footerBox = footerEl ? footerEl.getBoundingClientRect() : null;

  // If fixed/sticky, give main padding to avoid overlap
  if (headerFixed && headerBox) mainEl.style.paddingTop = headerBox.height + "px";
  if (footerFixed && footerBox) mainEl.style.paddingBottom = footerBox.height + "px";
}

function ensureFixedFromFlags(hdr, ftr) {
  // Header fallback
  if (hdr?.header_fixed) {
    const headerBar = document.querySelector("#site-header .hfbar");
    if (headerBar && !headerBar.style.position) {
      headerBar.style.position = "sticky";
      headerBar.style.top = "0";
      headerBar.style.zIndex = "5";
    }
  }
  // Footer fallback
  if (ftr?.footer_fixed) {
    const footerBar = document.querySelector("#site-footer .hfbar-footer, #site-footer .hfbar");
    // querySelector above returns first match; if null, try hfbar as footer container too
    let el = document.querySelector("#site-footer .hfbar-footer") || document.querySelector("#site-footer .hfbar");
    if (el && !el.style.position) {
      el.style.position = "sticky";
      el.style.bottom = "0";
      el.style.zIndex = "5";
    }
  }
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
    const headerCss  = hdr.headerCss  || "";
    const footerCss  = ftr.footerCss  || "";

    // Inject HTML
    setInner("site-header", headerHtml);
    setInner("site-footer", footerHtml);

    // Inject CSS (core + per-part)
    injectStyle(CORE_CSS, "hf-core-style");
    injectStyle(headerCss, "site-header-style");
    injectStyle(footerCss, "site-footer-style");

    // Apply fixed/sticky fallbacks based on flags
    ensureFixedFromFlags(hdr, ftr);

    // Adjust paddings to avoid overlap if fixed
    adjustOffsets({ headerFixed: !!hdr.header_fixed, footerFixed: !!ftr.footer_fixed });

  } catch (e) {
    console.warn("HF load failed", e);
  } finally {
    const body = document.getElementById("page-body");
    if (body) body.style.visibility = "visible";
  }
}

loadHF();

// Safety: reveal in case something stalls
setTimeout(() => {
  const body = document.getElementById("page-body");
  if (body) body.style.visibility = "visible";
}, 3000);

console.log("hf.js loaded (core CSS + CSS injection)");
