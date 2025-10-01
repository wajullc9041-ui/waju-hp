// hf.js（完全版・ヘッダー／フッター余白調整修正版）

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

// ===== 固定と余白調整（修正版） =====
function applyFixedAndAdjustOffsets(hdrCfg, ftrCfg) {
  const headerEl = document.getElementById("site-header");
  const footerEl = document.getElementById("site-footer");
  const mainEl   = document.querySelector("main");

  function adjust() {
    if (!mainEl) return;

    // ヘッダー固定
    if (hdrCfg?.header_fixed && headerEl) {
      const bar = headerEl.querySelector(".hfbar");
      if (bar) {
        bar.style.position = "sticky";
        bar.style.top = "0";
        bar.style.zIndex = "10";
        bar.style.width = "100%";
      }
      mainEl.style.paddingTop = headerEl.offsetHeight + "px";
    } else {
      mainEl.style.paddingTop = "0";
    }

    // フッター固定
    if (ftrCfg?.footer_fixed && footerEl) {
      const bar = footerEl.querySelector(".hfbar");
      if (bar) {
        bar.style.position = "fixed";
        bar.style.left = "0";
        bar.style.right = "0";
        bar.style.bottom = "0";
        bar.style.zIndex = "10";
        bar.style.width = "100%";
      }
      mainEl.style.paddingBottom = footerEl.offsetHeight + "px";
    } else {
      mainEl.style.paddingBottom = "0";
    }
  }

  // 初期実行 & リサイズ時にも追従
  adjust();
  window.addEventListener("resize", adjust);
}

// ===== ドロワーUI =====
function ensureResponsiveUI() {
  const header = document.getElementById("site-header");
  const footer = document.getElementById("site-footer");
  if (!header) return;

  let burger = header.querySelector(".hf-hamburger");
  if (!burger) {
    burger = document.createElement("button");
    burger.className = "hf-hamburger";
    burger.setAttribute("aria-label", "メニュー");
    burger.innerHTML = "&#9776;";
    const bar = header.querySelector(".hfbar") || header;
    bar.appendChild(burger);
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

  document.addEventListener("keydown", onEscToClose);
  window.addEventListener("resize", onResizeCloseIfWide);
}

function openDrawer() {
  document.querySelector(".hf-drawer")?.classList.add("open");
  document.querySelector(".hf-overlay")?.classList.add("open");
}
function closeDrawer() {
  document.querySelector(".hf-drawer")?.classList.remove("open");
  document.querySelector(".hf-overlay")?.classList.remove("open");
}
function onEscToClose(e) {
  if (e.key === "Escape") closeDrawer();
}
function onResizeCloseIfWide() {
  if (window.innerWidth > 768) closeDrawer();
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

    injectStyle("site-header-style", hdrObj.headerCss || "");
    injectStyle("site-footer-style", ftrObj.footerCss || "");

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

setTimeout(() => {
  const body = document.getElementById("page-body");
  if (body && body.style.visibility !== "visible") {
    body.style.visibility = "visible";
    console.warn("HF timeout: forced visible.");
  }
}, 3000);
