import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Supabaseクライアント
const supabase = createClient(
  "https://htnmjsqgoapvuanrsuma.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0bm1qc3Fnb2FwdnVhbnJzdW1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMzI3MDEsImV4cCI6MjA3MDkwODcwMX0.1AACTWZmChfmIIfBad0sf-hLV2bnaUt7bVURXnd0uKA"
);

// DOMにCSSを注入
function injectStyle(id, css) {
  if (!css) return;
  let styleTag = document.getElementById(id);
  if (!styleTag) {
    styleTag = document.createElement("style");
    styleTag.id = id;
    document.head.appendChild(styleTag);
  }
  styleTag.textContent = css;
}

// DOMにHTMLを設定
function setInner(id, html) {
  const el = document.getElementById(id);
  if (el && html) {
    el.innerHTML = html;
  }
}

// 固定ヘッダー／フッター時の余白調整
function applyFixedAndAdjustOffsets(hdr, ftr) {
  if (!hdr || !ftr) return;
  const headerRect = hdr.getBoundingClientRect();
  const footerRect = ftr.getBoundingClientRect();
  document.body.style.paddingTop = hdr.classList.contains("fixed") ? `${headerRect.height}px` : "0";
  document.body.style.paddingBottom = ftr.classList.contains("fixed") ? `${footerRect.height}px` : "0";
}

// メイン処理
export async function loadHF() {
  try {
    const { data, error } = await supabase.from("hf_settings").select("*");
    if (error) throw error;

    if (data && data.length > 0) {
      const headerData = data.find((d) => d.area === "header");
      const footerData = data.find((d) => d.area === "footer");

      if (headerData && headerData.data) {
        setInner("site-header", headerData.data.headerHtml);
        injectStyle("header-style", headerData.data.headerCss);
      }
      if (footerData && footerData.data) {
        setInner("site-footer", footerData.data.footerHtml);
        injectStyle("footer-style", footerData.data.footerCss);
      }
    }

    const hdr = document.getElementById("site-header");
    const ftr = document.getElementById("site-footer");
    applyFixedAndAdjustOffsets(hdr, ftr);

    // ▼ レスポンシブ対応を呼び出し
    setupResponsiveNav();

  } catch (e) {
    console.warn("HF load failed:", e);
  } finally {
    const body = document.getElementById("page-body");
    if (body) body.style.visibility = "visible";
  }
}

// 実行
window.addEventListener("DOMContentLoaded", loadHF);

// FOUC対策
setTimeout(() => {
  const body = document.getElementById("page-body");
  if (body && body.style.visibility !== "visible") {
    body.style.visibility = "visible";
  }
}, 2000);


//
// ▼ レスポンシブ対応追加部分 ▼
//
function setupResponsiveNav() {
  const headerEl = document.getElementById("site-header");
  const footerNav = document.querySelector("#site-footer .hf-nav");
  if (!headerEl) return;

  // ハンバーガーアイコン
  if (!document.querySelector(".hamburger")) {
    const hamburger = document.createElement("div");
    hamburger.className = "hamburger";
    hamburger.innerHTML = "&#9776;";
    hamburger.onclick = openDrawer;
    headerEl.appendChild(hamburger);
  }

  // オーバーレイ
  if (!document.querySelector(".drawer-overlay")) {
    const overlay = document.createElement("div");
    overlay.className = "drawer-overlay";
    overlay.onclick = closeDrawer;
    document.body.appendChild(overlay);
  }

  // ドロワー
  if (!document.querySelector(".drawer")) {
    const drawer = document.createElement("div");
    drawer.className = "drawer";
    drawer.innerHTML = `<button onclick="closeDrawer()">✕</button><ul id="drawer-menu"></ul>`;
    document.body.appendChild(drawer);
  }

  // フッターナビをドロワーにコピー
  if (footerNav) {
    const drawerMenu = document.getElementById("drawer-menu");
    if (drawerMenu) drawerMenu.innerHTML = footerNav.innerHTML;
  }
}

function openDrawer() {
  document.querySelector(".drawer")?.classList.add("open");
  document.querySelector(".drawer-overlay")?.classList.add("open");
}
function closeDrawer() {
  document.querySelector(".drawer")?.classList.remove("open");
  document.querySelector(".drawer-overlay")?.classList.remove("open");
}

// レスポンシブ用CSSを append
const responsiveCSS = `
/* --- レスポンシブナビ --- */
.hamburger, .drawer, .drawer-overlay { display:none; }

@media (max-width:768px){
  #site-header .hf-nav,
  #site-footer .hf-nav { display:none !important; }

  .hamburger {
    display:block;
    margin-left:auto;
    cursor:pointer;
    font-size:1.8rem;
    padding:8px;
  }

  .drawer-overlay {
    display:none;
    position:fixed;
    inset:0;
    background:rgba(0,0,0,0.4);
    z-index:999;
  }
  .drawer {
    display:block;
    position:fixed;
    top:0; right:-260px;
    width:250px; height:100%;
    background:#fff;
    box-shadow:-2px 0 5px rgba(0,0,0,0.3);
    transition:right 0.3s ease;
    padding:20px;
    z-index:1000;
  }
  .drawer.open { right:0; }
  .drawer-overlay.open { display:block; }
}
`;
if (!document.getElementById("hf-responsive-style")) {
  const style = document.createElement("style");
  style.id = "hf-responsive-style";
  style.textContent = responsiveCSS;
  document.head.appendChild(style);
}
