// --- ここは既存の hf.js 基準版をそのまま残す ---
// （Supabaseから headerHtml / footerHtml / headerCss / footerCss を読み込む処理は一切削除・改変しない）

// ▼既存の loadHF() の末尾あたりに、この1行を追加するだけ
setupResponsiveNav();

// ▼追加関数群（追記部分だけ）
function setupResponsiveNav() {
  const headerEl = document.getElementById("site-header");
  const footerNav = document.querySelector("#site-footer .hf-nav");
  if (!headerEl) return;

  // ハンバーガーアイコンを追加（存在しなければ）
  if (!document.querySelector(".hamburger")) {
    const hamburger = document.createElement("div");
    hamburger.className = "hamburger";
    hamburger.innerHTML = "&#9776;";
    hamburger.onclick = openDrawer;
    headerEl.appendChild(hamburger);
  }

  // オーバーレイを追加
  if (!document.querySelector(".drawer-overlay")) {
    const overlay = document.createElement("div");
    overlay.className = "drawer-overlay";
    overlay.onclick = closeDrawer;
    document.body.appendChild(overlay);
  }

  // ドロワーを追加
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

// ▼CSSは追記用（既存CSSは壊さない）
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
