// hf.js
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Supabase設定
const SUPABASE_URL = "https://htnmjsqgoapvuanrsuma.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0bm1qc3Fnb2FwdnVhbnJzdW1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMzI3MDEsImV4cCI6MjA3MDkwODcwMX0.1AACTWZmChfmIIfBad0sf-hLV2bnaUt7bVURXnd0uKA";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 共通CSS（レスポンシブ含む）
const CORE_CSS = `
body { margin:0; font-family:sans-serif; visibility:visible; }
header, footer { width:100%; }

/* ハンバーガーメニュー用 */
.hamburger, .drawer, .drawer-overlay { display:none; }

@media (max-width:768px){
  #site-header .hf-nav { display:none !important; }
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

// ヘッダー／フッターをSupabaseから取得
export async function loadHF() {
  try {
    const { data, error } = await supabase.from("hf_settings").select("*");
    if (error) throw error;

    if (data && data.length > 0) {
      const headerData = data.find((d) => d.area === "header");
      const footerData = data.find((d) => d.area === "footer");

      if (headerData) {
        document.getElementById("site-header").innerHTML = headerData.data;
      }
      if (footerData) {
        document.getElementById("site-footer").innerHTML = footerData.data;
      }
    }

    // 共通CSSをheadに追加
    if (!document.getElementById("hf-core-style")) {
      const style = document.createElement("style");
      style.id = "hf-core-style";
      style.textContent = CORE_CSS;
      document.head.appendChild(style);
    }

    // FOUC対策解除
    document.body.style.visibility = "visible";

    // 固定フッター調整
    adjustFooterPadding();

    // レスポンシブナビ設定
    setupResponsiveNav();

  } catch (err) {
    console.error("ヘッダー／フッター読み込みエラー:", err.message);
  }
}

// 固定フッター時にmain余白を確保
function adjustFooterPadding() {
  const footer = document.getElementById("site-footer");
  const main = document.querySelector("main");
  if (document.body.classList.contains("footer-fixed") && footer && main) {
    main.style.paddingBottom = footer.offsetHeight + "px";
  } else if (main) {
    main.style.paddingBottom = "0";
  }
}
window.addEventListener("resize", adjustFooterPadding);

// --- レスポンシブ対応：ハンバーガーメニュー ---
function setupResponsiveNav() {
  const headerEl = document.getElementById("site-header");
  const footerNav = document.querySelector("#site-footer .hf-nav");

  if (!headerEl) return;

  // ハンバーガーアイコンを追加（存在しなければ）
  if (!document.querySelector(".hamburger")) {
    const hamburger = document.createElement("div");
    hamburger.className = "hamburger md:hidden";
    hamburger.innerHTML = "&#9776;"; // ☰
    hamburger.onclick = openDrawer;
    headerEl.appendChild(hamburger);
  }

  // オーバーレイ（存在しなければ）
  if (!document.querySelector(".drawer-overlay")) {
    const overlay = document.createElement("div");
    overlay.className = "drawer-overlay";
    overlay.onclick = closeDrawer;
    document.body.appendChild(overlay);
  }

  // ドロワーを追加（存在しなければ）
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

// 実行
window.addEventListener("DOMContentLoaded", loadHF);
