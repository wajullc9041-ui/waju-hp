// hf.js
// ヘッダー・フッター適用スクリプト (ESモジュール)

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://htnmjsqgoapvuanrsuma.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0bm1qc3Fnb2FwdnVhbnJzdW1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMzI3MDEsImV4cCI6MjA3MDkwODcwMX0.1AACTWZmChfmIIfBad0sf-hLV2bnaUt7bVURXnd0uKA";

const sb = createClient(supabaseUrl, supabaseKey);

// 管理画面のCSS定義に合わせた最小限のコアCSS
const CORE_CSS = `
.hfbar {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  gap: var(--gap, 16px);
}
.hf-row {
  flex-direction: row;
}
.hf-column {
  flex-direction: column;
  align-items: stretch; /* 縦並びの場合は要素を伸ばす */
}
.slot {
  display: flex;
  align-items: center;
}
.slot.brand {
  flex: 0 0 auto;
}
.slot.nav {
  flex: 1 1 auto;
}
/* ヘッダーブランド */
.hf-brand {
  display: flex;
  align-items: center;
  gap: 8px; /* 管理画面のJSロジックに合わせる */
}
.hf-brand img {
  height: auto;
  max-height: inherit;
}
/* ナビゲーション */
.hf-nav {
  display: flex;
  gap: var(--gap, 16px);
  flex-wrap: wrap;
  width: 100%;
}
.hf-nav a {
  color: inherit;
  text-decoration: none;
}
.hf-nav a:hover {
  opacity: .85;
}
/* コピーライト */
.hf-copy {
  display: flex;
  width: 100%;
}
`;

function injectStyle(cssText, id) {
  if (!cssText) return;
  let styleTag = document.getElementById(id);
  if (!styleTag) {
    styleTag = document.createElement("style");
    styleTag.id = id;
    document.head.appendChild(styleTag);
  }
  // コアCSSは常に上書き、個別のCSSはコアCSSの下に追加
  styleTag.textContent = cssText;
}

function setInner(id, html) {
  const el = document.getElementById(id);
  // HTMLを挿入する際は、innerHTMLではなく、子要素を直接置き換えることでより安全に
  if (el) {
      el.innerHTML = ""; // 既存の内容をクリア
      if(html){
          // ヘッダー/フッターHTMLは単一のルート要素(.hfbar)を含むはず
          const temp = document.createElement('div');
          temp.innerHTML = html;
          if (temp.firstElementChild) {
              el.appendChild(temp.firstElementChild);
          }
      }
  }
}

/**
 * 固定表示の設定に基づいて、ヘッダー/フッターのCSSを調整する
 */
function applyFixedAndAdjustOffsets(hdr, ftr) {
  const headerEl = document.getElementById("site-header");
  const footerEl = document.getElementById("site-footer");
  const mainEl = document.querySelector("main");

  // 1. ヘッダーの固定設定適用
  if (hdr?.header_fixed && headerEl) {
    const headerBar = headerEl.querySelector(".hfbar");
    if (headerBar) {
      headerBar.style.position = "sticky";
      headerBar.style.top = "0";
      headerBar.style.zIndex = "5";
    }
  }

  // 2. フッターの固定設定適用 (画面最下部固定のため fixed を使用)
  if (ftr?.footer_fixed && footerEl) {
    const footerBar = footerEl.querySelector(".hfbar");
    if (footerBar) {
      // position: fixed で画面最下部に固定
      footerBar.style.position = "fixed";
      footerBar.style.bottom = "0";
      footerBar.style.left = "0";
      footerBar.style.right = "0";
      footerBar.style.zIndex = "5";
      // 幅を100%に設定 (fixedのデフォルトはコンテンツ幅)
      footerBar.style.width = "100%";
    }
  }

  // 3. メインコンテンツのパディング調整 (固定要素との重複回避)
  if (mainEl) {
    // ヘッダーが固定されている場合
    const headerBar = headerEl ? headerEl.querySelector(".hfbar") : null;
    if (hdr?.header_fixed && headerBar) {
      // 実際にはheaderEl（親）の高さを見るのが安全
      mainEl.style.paddingTop = headerEl.offsetHeight + "px";
    } else {
      mainEl.style.paddingTop = ""; // 固定でない場合はリセット
    }

    // フッターが固定されている場合
    const footerBar = footerEl ? footerEl.querySelector(".hfbar") : null;
    if (ftr?.footer_fixed && footerBar) {
      mainEl.style.paddingBottom = footerEl.offsetHeight + "px";
    } else {
      mainEl.style.paddingBottom = ""; // 固定でない場合はリセット
    }
  }
}

async function loadHF() {
  try {
    // 1. データベースからデータを一括取得
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
    
    // 2. CSSの挿入 (CORE -> Header固有 -> Footer固有 の順で優先度を確保)
    injectStyle(CORE_CSS, "hf-core-style");
    injectStyle(headerCss, "site-header-style");
    injectStyle(footerCss, "site-footer-style");

    // 3. HTMLの挿入
    setInner("site-header", headerHtml);
    setInner("site-footer", footerHtml);
    
    // 4. 固定表示の適用とパディング調整
    // DOM挿入後に、高さを取得してパディング調整するためここで実行
    applyFixedAndAdjustOffsets(hdr, ftr);

  } catch (e) {
    console.warn("HF load failed:", e);
  } finally {
    // 5. FOUC対策のvisibility: hiddenを解除
    const body = document.getElementById("page-body");
    if (body) body.style.visibility = "visible";
  }
}

// ページロード時に実行
document.addEventListener('DOMContentLoaded', loadHF);

// Safety: 読み込みが遅延した場合に3秒後に強制的に表示（FOUC対策の解除）
setTimeout(() => {
  const body = document.getElementById("page-body");
  if (body && body.style.visibility === "hidden") {
      body.style.visibility = "visible";
      console.warn("HF loading timed out. Forced page display after 3s.");
  }
}, 3000);

console.log("hf.js loaded and attempting to apply H&F.");
