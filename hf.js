// hf.js（完全版）
// ヘッダー・フッター適用 + モバイルドロワー（ハンバーガー）対応

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
  // 管理画面由来のHTMLをそのまま反映（複数ルートに対応）
  el.innerHTML = html || "";
}

function safeParseMaybeJson(val) {
  if (!val) return {};
  if (typeof val === "object") return val;
  try { return JSON.parse(val); } catch { return {}; }
}

// ===== Core CSS（最小限の共通部品） =====
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

// ===== Responsive（ハンバーガー＋ドロワー） =====
const RESPONSIVE_CSS = `
/* 初期は非表示（モバイルでのみ出す） */
.hf-hamburger,.hf-drawer,.hf-overlay{display:none}

/* モバイル */
@media (max-width:768px){
  /* ヘッダー/フッターのナビはモバイルでは隠す */
  #site-header .hf-nav, #site-footer .hf-nav { display:none !important; }

  /* ハンバーガー */
  .hf-hamburger{
    display:block;margin-left:auto;cursor:pointer;
    font-size:1.8rem;line-height:1;padding:8px;border-radius:8px;
    border:1px solid rgba(0,0,0,.15);background:rgba(255,255,255,.6);
    backdrop-filter:saturate(180%) blur(8px);
  }

  /* オーバーレイ */
  .hf-overlay{
    display:none;position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:999;
  }
  .hf-overlay.open{display:block;}

  /* ドロワー（右から） */
  .hf-drawer{
    display:block;position:fixed;top:0;right:-280px;width:260px;height:100%;
    background:#fff;box-shadow:-2px 0 10px rgba(0,0,0,.25);
    transition:right .28s ease;z-index:1000;padding:16px 12px 24px 12px;
    overflow:auto;
  }
  .hf-drawer.open{right:0;}
  .hf-drawer .drawer-head{
    display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;
  }
  .hf-drawer .drawer-close{
    border:none;background:#f2f2f2;border-radius:8px;padding:6px 10px;font-size:1.1rem;cursor:pointer;
  }
  .hf-drawer nav, .hf-drawer ul{margin:0;padding:0;list-style:none}
  .hf-drawer a{display:block;padding:12px 8px;border-radius:10px;text-decoration:none;color:inherit}
  .hf-drawer a:active{opacity:.7}
}
`;

// ===== 固定の反映と余白調整 =====
function applyFixedAndAdjustOffsets(hdrCfg, ftrCfg) {
  const headerEl = document.getElementById("site-header");
  const footerEl = document.getElementById("site-footer");
  const mainEl   = document.querySelector("main");

  // ヘッダー固定（sticky）
  if (hdrCfg?.header_fixed && headerEl) {
    const bar = headerEl.querySelector(".hfbar");
    if (bar) {
      bar.style.position = "sticky";
      bar.style.top = "0";
      bar.style.zIndex = "10";
      bar.style.width = "100%";
    }
  }

  // フッター固定（fixed）
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
  }

  // 余白調整（main 基準）
  if (mainEl) {
    const headerH = hdrCfg?.header_fixed && headerEl ? headerEl.offsetHeight : 0;
    const footerH = ftrCfg?.footer_fixed && footerEl ? footerEl.offsetHeight : 0;
    mainEl.style.paddingTop = headerH ? `${headerH}px` : "";
    mainEl.style.paddingBottom = footerH ? `${footerH}px` : "";
  }
}

// ===== ドロワーUI =====
function ensureResponsiveUI() {
  const header = document.getElementById("site-header");
  const footer = document.getElementById("site-footer");
  if (!header) return;

  // ハンバーガー設置（重複防止）
  let burger = header.querySelector(".hf-hamburger");
  if (!burger) {
    burger = document.createElement("button");
    burger.className = "hf-hamburger";
    burger.setAttribute("aria-label", "メニュー");
    burger.innerHTML = "&#9776;"; // ≡
    // .hfbar の末尾に追加（ロゴ・社名の右側）
    const bar = header.querySelector(".hfbar") || header;
    bar.appendChild(burger);
  }

  // オーバーレイ
  let overlay = document.querySelector(".hf-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "hf-overlay";
    document.body.appendChild(overlay);
  }

  // ドロワー
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

  // メニュー中身：フッターの .hf-nav をコピー（なければヘッダーの .hf-nav をフォールバック）
  const srcNav =
    footer?.querySelector(".hf-nav") ||
    header.querySelector(".hf-nav");
  const dstList = drawer.querySelector(".drawer-menu");

  if (dstList && srcNav) {
    dstList.innerHTML = srcNav.innerHTML; // a 要素群をそのまま流用
  }

  // イベント（重複バインドを避けるため一度外す → 付け直す）
  burger.onclick = openDrawer;
  overlay.onclick = closeDrawer;
  drawer.querySelector(".drawer-close").onclick = closeDrawer;

  // ドロワー内のリンクを押したら閉じる
  drawer.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (a) closeDrawer();
  });

  // Escapeで閉じる
  document.addEventListener("keydown", onEscToClose);

  // リサイズ時：PC幅に戻ったら強制的に閉じて状態リセット
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

// ===== 入口 =====
export async function loadHF() {
  try {
    // 1) 取得（header/footer を同時並列）
    const [hdrRes, ftrRes] = await Promise.all([
      supabase.from("hf_settings").select("data").eq("area","header").single(),
      supabase.from("hf_settings").select("data").eq("area","footer").single()
    ]);

    const hdrObj = safeParseMaybeJson(hdrRes?.data?.data);
    const ftrObj = safeParseMaybeJson(ftrRes?.data?.data);

    // 2) CSS 反映（順序：コア → headerCss → footerCss → レスポンシブ）
    injectStyle("hf-core-style", CORE_CSS);
    injectStyle("site-header-style", hdrObj.headerCss || "");
    injectStyle("site-footer-style", ftrObj.footerCss || "");
    injectStyle("hf-responsive-style", RESPONSIVE_CSS);

    // 3) HTML 反映
    setInner("site-header", hdrObj.headerHtml || "");
    setInner("site-footer", ftrObj.footerHtml || "");

    // 4) 固定/余白
    applyFixedAndAdjustOffsets(hdrObj, ftrObj);

    // 5) モバイルUI（ハンバーガー/ドロワー）
    ensureResponsiveUI();

  } catch (e) {
    console.warn("HF load failed:", e);
  } finally {
    // 6) FOUC解除
    const body = document.getElementById("page-body");
    if (body) body.style.visibility = "visible";
  }
}

// DOMContentLoadedで実行
window.addEventListener("DOMContentLoaded", loadHF);

// タイムアウトで強制表示（最悪時の保険）
setTimeout(() => {
  const body = document.getElementById("page-body");
  if (body && body.style.visibility !== "visible") {
    body.style.visibility = "visible";
    console.warn("HF timeout: forced visible.");
  }
}, 3000);
