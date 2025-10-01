// hf.js（安定版：既存の挙動は維持しつつ、被り/余白だけ確実に解消）

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

// ===== Core CSS（既存の見た目を壊さない最小限） =====
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

// ===== Responsive CSS（スマホはナビ非表示＋コピーライトだけを薄く） =====
const RESPONSIVE_CSS = `
/* これらはモバイル時だけ表示/動作 */
.hf-hamburger,.hf-drawer,.hf-overlay{display:none}

/* PC：フッターは最低60px（2行でもつぶれない） */
@media (min-width:769px){
  #site-footer .hfbar {
    min-height: 60px !important;
    line-height: 1.5 !important;
  }
}

/* モバイル：768px以下 */
@media (max-width:768px){
  /* ヘッダー/フッターのナビは隠す（ドロワーに集約） */
  #site-header .hf-nav, #site-footer .hf-nav { display:none !important; }

  /* ハンバーガーはヘッダー右端に */
  .hf-hamburger{
    display:block;margin-left:auto;cursor:pointer;
    font-size:1.8rem;line-height:1;padding:8px;border-radius:8px;
    border:1px solid rgba(0,0,0,.15);background:rgba(255,255,255,.6);
    backdrop-filter:saturate(180%) blur(8px);
  }

  /* ドロワーとオーバーレイ */
  .hf-overlay{
    display:none;position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:999;
  }
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

  /* フッターはコピーライトだけ・薄く（高さは後で数字だけ変えればOK） */
  #site-footer,
  #site-footer .hfbar {
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

// ===== 余白（被り）だけを安全に調整する =====
function applyFixedAndAdjustOffsets(hdrCfg, ftrCfg) {
  const headerEl = document.getElementById("site-header");
  const footerEl = document.getElementById("site-footer");
  const mainEl   = document.querySelector("main");

  // 管理ページのCSSが position を決める。JSは padding だけ。
  const adjust = () => {
    if (!mainEl) return;

    // ヘッダー固定なら高さ分を main の上に確保
    if (hdrCfg?.header_fixed && headerEl) {
      const h = headerEl.offsetHeight || 0;
      mainEl.style.paddingTop = h ? `${h}px` : "";
    } else {
      mainEl.style.paddingTop = "";
    }

    // フッター固定なら高さ分を main の下に確保
    if (ftrCfg?.footer_fixed && footerEl) {
      const f = footerEl.offsetHeight || 0;
      mainEl.style.paddingBottom = f ? `${f}px` : "";
    } else {
      mainEl.style.paddingBottom = "";
    }
  };

  // 初期実行＋リサイズ/向き変更で追従
  adjust();
  window.addEventListener("resize", adjust);
  window.addEventListener("orientationchange", adjust);

  // ヘッダー/フッターの中身やCSSで高さが変わった場合にも追随
  const mo = new MutationObserver(adjust);
  if (headerEl) mo.observe(headerEl, { childList:true, subtree:true, attributes:true });
  if (footerEl) mo.observe(footerEl, { childList:true, subtree:true, attributes:true });
}

// ===== ドロワーUI（ヘッダー内に確実に設置） =====
function ensureResponsiveUI() {
  const header = document.getElementById("site-header");
  const footer = document.getElementById("site-footer");
  if (!header) return;

  // ハンバーガー：ヘッダー .hfbar の末尾にだけ追加（重複ガード）
  let burger = header.querySelector(".hfbar .hf-hamburger");
  if (!burger) {
    burger = document.createElement("button");
    burger.className = "hf-hamburger";
    burger.setAttribute("aria-label", "メニュー");
    burger.innerHTML = "&#9776;";
    (header.querySelector(".hfbar") || header).appendChild(burger);
  }

  // オーバーレイ（重複ガード）
  let overlay = document.querySelector(".hf-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "hf-overlay";
    document.body.appendChild(overlay);
  }

  // ドロワー（重複ガード）
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

  // メニューはフッターの .hf-nav を優先して複製（無ければヘッダー）
  const srcNav = footer?.querySelector(".hf-nav") || header.querySelector(".hf-nav");
  const dstList = drawer.querySelector(".drawer-menu");
  if (dstList && srcNav) dstList.innerHTML = srcNav.innerHTML;

  // イベント（都度再代入なので多重バインドにならない）
  burger.onclick = openDrawer;
  overlay.onclick = closeDrawer;
  drawer.querySelector(".drawer-close").onclick = closeDrawer;

  // ドロワー内リンクで自動クローズ
  drawer.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (a) closeDrawer();
  });

  // Escapeで閉じる / PC幅に戻ったら閉じる
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
    // header/footer を単発で取得
    const [hdrRes, ftrRes] = await Promise.all([
      supabase.from("hf_settings").select("data").eq("area","header").single(),
      supabase.from("hf_settings").select("data").eq("area","footer").single()
    ]);

    const hdrObj = safeParseMaybeJson(hdrRes?.data?.data);
    const ftrObj = safeParseMaybeJson(ftrRes?.data?.data);

    // スタイル → HTML の順で注入（管理ページ側の見た目を尊重）
    injectStyle("hf-core-style", CORE_CSS);
    injectStyle("site-header-style", hdrObj.headerCss || "");
    injectStyle("site-footer-style", ftrObj.footerCss || "");
    injectStyle("hf-responsive-style", RESPONSIVE_CSS);

    setInner("site-header", hdrObj.headerHtml || "");
    setInner("site-footer", ftrObj.footerHtml || "");

    // 余白だけ調整（positionは触らない）
    applyFixedAndAdjustOffsets(hdrObj, ftrObj);

    // モバイルUI（ヘッダー内にハンバーガー、フッターはコピーライトのみ）
    ensureResponsiveUI();

  } catch (e) {
    console.warn("HF load failed:", e);
  } finally {
    const body = document.getElementById("page-body");
    if (body) body.style.visibility = "visible";
  }
}

// 実行
window.addEventListener("DOMContentLoaded", loadHF);

// FOUC保険
setTimeout(() => {
  const body = document.getElementById("page-body");
  if (body && body.style.visibility !== "visible") {
    body.style.visibility = "visible";
    console.warn("HF timeout: forced visible.");
  }
}, 3000);
