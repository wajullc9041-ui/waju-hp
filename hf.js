// hf.js（完全版：ヘッダー固定・フッター幅修正対応）

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// ===== Supabase =====
const supabase = createClient(
  "https://htnmjsqgoapvuanrsuma.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0bm1qc3Fnb2FwdnVhbnJzdW1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMzI3MDEsImV4cCI6MjA3MDkwODcwMX0.1AACTWZmChfmIIfBad0sf-hLV2bnaUt7bVURXnd0uKA"
);

// ===== Utils =====
function injectStyle(id, css) {
  if (!css) return;
  let tag = document.getElementById(id);
  if (!tag) {
    tag = document.createElement("style");
    tag.id = id;
    document.head.appendChild(tag);
  }
  tag.textContent = css;
}

function setInner(id, html) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = html || "";
}

function safeParseMaybeJson(val) {
  if (!val) return {};
  if (typeof val === "object") return val;
  try { return JSON.parse(val); } catch { return {}; }
}

// ===== Core CSS =====
const CORE_CSS = `
.hfbar{display:flex;align-items:center;box-sizing:border-box;gap:16px;}
.hf-row{flex-direction:row;}
.hf-column{flex-direction:column;align-items:stretch;}
.hf-brand{display:flex;align-items:center;gap:8px;max-height:60px}
.hf-brand img{height:auto;max-height:inherit}
.hf-nav{display:flex;gap:16px;flex-wrap:wrap}
.hf-nav a{text-decoration:none;color:inherit}
.hf-copy{display:flex;width:100%}
`;

// ===== Responsive CSS =====
const RESPONSIVE_CSS = `
/* PC用フッターは最低60px確保 */
@media (min-width:769px){
  .hf-hamburger, .hf-overlay, .hf-drawer { display:none !important; }
  #site-footer .hfbar {
    min-height: 60px !important;
    line-height: 1.5 !important;
    width: 100% !important;
  }
}

/* モバイル専用 */
@media (max-width:768px){
  /* ヘッダー・フッターのナビは隠す */
  #site-header .hf-nav, #site-footer .hf-nav { display:none !important; }

  /* ハンバーガー */
  .hf-hamburger{
    display:block;margin-left:auto;cursor:pointer;
    font-size:1.8rem;line-height:1;padding:8px;border-radius:8px;
    border:1px solid rgba(0,0,0,.15);background:rgba(255,255,255,.6);
    backdrop-filter:saturate(180%) blur(8px);
  }

  /* オーバーレイ＆ドロワー */
  .hf-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:999;}
  .hf-overlay.open{display:block;}
  .hf-drawer{
    display:block;position:fixed;top:0;right:-280px;width:260px;height:100%;
    background:#fff;box-shadow:-2px 0 10px rgba(0,0,0,.25);
    transition:right .28s ease;z-index:1000;padding:16px 12px 24px 12px;
    overflow:auto;
  }
  .hf-drawer.open{ right:0; }
  .hf-drawer .drawer-head{
    display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;
  }
  .hf-drawer .drawer-close{
    border:none;background:#f2f2f2;border-radius:8px;padding:6px 10px;font-size:1.1rem;cursor:pointer;
  }
  .hf-drawer nav, .hf-drawer ul{margin:0;padding:0;list-style:none}
  .hf-drawer a{display:block;padding:12px 8px;border-radius:10px;text-decoration:none;color:inherit}
  .hf-drawer a:active{opacity:.7}

  /* フッターはコピーライトだけ・幅全体に広げる */
  #site-footer,
  #site-footer .hfbar {
    width: 100% !important;       /* ← 横幅を常に全幅にする */
    height: 30px !important;
    min-height: 30px !important;
    padding: 0 !important;
    line-height: 30px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
  #site-footer .hf-copy {
    font-size: 12px !important;
    margin: 0 !important;
    justify-content: center !important;
    width: auto !important;
  }
}
`;

// ===== 固定反映＆余白調整 =====
function applyFixedAndAdjustOffsets(hdrCfg, ftrCfg) {
  const headerEl = document.getElementById("site-header");
  const footerEl = document.getElementById("site-footer");
  const mainEl   = document.querySelector("main");

  function adjust() {
    if (!mainEl) return;

    // ヘッダー固定ONなら必ず反映
    if (hdrCfg?.header_fixed && headerEl) {
      const bar = headerEl.querySelector(".hfbar") || headerEl;
      bar.style.position = "fixed";
      bar.style.top = "0";
      bar.style.left = "0";
      bar.style.right = "0";
      bar.style.zIndex = "100";
      bar.style.width = "100%";
    }
    // mainのpaddingTopは作らない（本文側で調整）

    // フッター固定ONなら本文が隠れないように余白を確保
    if (ftrCfg?.footer_fixed && footerEl) {
      const bar = footerEl.querySelector(".hfbar") || footerEl;
      bar.style.position = "fixed";
      bar.style.left = "0";
      bar.style.right = "0";
      bar.style.bottom = "0";
      bar.style.zIndex = "100";
      bar.style.width = "100%";

      mainEl.style.paddingBottom = footerEl.offsetHeight + "px";
    } else {
      mainEl.style.paddingBottom = "";
    }
  }

  adjust();
  window.addEventListener("resize", adjust);
}

// ===== ドロワーUI =====
function ensureResponsiveUI() {
  const header = document.getElementById("site-header");
  const footer = document.getElementById("site-footer");
  if (!header) return;

  let burger = header.querySelector(".hfbar .hf-hamburger");
  if (!burger) {
    burger = document.createElement("button");
    burger.className = "hf-hamburger";
    burger.setAttribute("aria-label", "メニュー");
    burger.innerHTML = "&#9776;";
    (header.querySelector(".hfbar") || header).appendChild(burger);
  }

  let overlay = document.querySelector(".hf-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "hf-overlay";
    document.body.appendChild(overlay);
  }

  let drawer = document.querySelector(".hf-drawer");
  if (!drawer) {
    drawer = document.createElement("aside");
    drawer.className = "hf-drawer";
    drawer.innerHTML = `
      <div class="drawer-head">
        <strong>メニュー</strong>
        <button type="button" class="drawer-close" aria-label="閉じる">✕</button>
      </div>
      <nav class="drawer-nav"><ul class="drawer-menu"></ul></nav>
    `;
    document.body.appendChild(drawer);
  }

  const srcNav = footer?.querySelector(".hf-nav") || header.querySelector(".hf-nav");
  const dstList = drawer.querySelector(".drawer-menu");
  if (dstList && srcNav) dstList.innerHTML = srcNav.innerHTML;

  burger.onclick = openDrawer;
  overlay.onclick = closeDrawer;
  drawer.querySelector(".drawer-close").onclick = closeDrawer;

  drawer.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (a) closeDrawer();
  });

  document.addEventListener("keydown", (e)=>{ if (e.key === "Escape") closeDrawer(); });
  window.addEventListener("resize", ()=>{ if (window.innerWidth > 768) closeDrawer(); });
}

function openDrawer() {
  document.querySelector(".hf-drawer")?.classList.add("open");
  document.querySelector(".hf-overlay")?.classList.add("open");
}
function closeDrawer() {
  document.querySelector(".hf-drawer")?.classList.remove("open");
  document.querySelector(".hf-overlay")?.classList.remove("open");
}

// ===== メイン処理 =====
export async function loadHF() {
  try {
    const [hdrRes, ftrRes] = await Promise.all([
      supabase.from("hf_settings").select("data").eq("area","header").single(),
      supabase.from("hf_settings").select("data").eq("area","footer").single()
    ]);

    const hdrObj = safeParseMaybeJson(hdrRes?.data?.data);
    const ftrObj = safeParseMaybeJson(ftrRes?.data?.data);

    injectStyle("hf-core-style", CORE_CSS);
    injectStyle("site-header-style", hdrObj.headerCss || "");
    injectStyle("site-footer-style", ftrObj.footerCss || "");
    injectStyle("hf-responsive-style", RESPONSIVE_CSS);

    setInner("site-header", hdrObj.headerHtml || "");
    setInner("site-footer", ftrObj.footerHtml || "");

    applyFixedAndAdjustOffsets(hdrObj, ftrObj);
    ensureResponsiveUI();

  } catch (e) {
    console.warn("HF load failed:", e);
  } finally {
    const body = document.getElementById("page-body");
    if (body) body.style.visibility = "visible";
  }
}

window.addEventListener("DOMContentLoaded", loadHF);

// FOUC保険
setTimeout(() => {
  const body = document.getElementById("page-body");
  if (body && body.style.visibility !== "visible") {
    body.style.visibility = "visible";
    console.warn("HF timeout: forced visible.");
  }
}, 3000);
