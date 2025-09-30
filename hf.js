// main.js

// Supabase の設定を分離
const supabaseUrl = "https://htnmjsqgoapvuanrsuma.supabase.co";
// 環境変数やセキュアな方法で管理することを推奨します
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0bm1qc3Fnb2FwdnVhbnJzdW1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMzI3MDEsImV4cCI6MjA3MDkwODcwMX0.1AACTWZmChfmIIfBad0sf-hLV2bnaUt7bVURXnd0uKA";

// 外部ライブラリがロードされているか確認
try{
    if (!window.supabase || !window.supabase.createClient) throw new Error("Supabase client not loaded.");
} catch(e) { 
    console.error("Supabase load error:", e);
    // 💡 エラーが発生しても body の非表示は解除する
    document.getElementById("page-body").style.visibility = "visible";
    return; 
}
const sb = window.supabase.createClient(supabaseUrl, supabaseKey);

// HTMLを挿入する共通関数
function setInner(id, html){
  var el = document.getElementById(id);
  if (el) el.innerHTML = html || "";
}

// ヘッダーとフッターの高さに応じてメインコンテンツの余白を調整する関数
function adjustOffsets(){
  var headerEl = document.getElementById("site-header");
  var footerEl = document.getElementById("site-footer");
  var mainEl = document.getElementById("app-main");
  
  if (!mainEl) return;
  
  // ヘッダーの高さで上部の余白を調整
  if (headerEl) mainEl.style.paddingTop = headerEl.offsetHeight + "px";
  // フッターの高さで下部の余白を調整
  if (footerEl) mainEl.style.paddingBottom = footerEl.offsetHeight + "px";
}

// ヘッダーとフッターを読み込む関数
async function loadHF(){
  try{
    // ヘッダーとフッターのJSONを並行して取得
    const [r1, r2] = await Promise.all([
      sb.from("hf_settings").select("data").eq("area", "header").single(),
      sb.from("hf_settings").select("data").eq("area", "footer").single()
    ]);

    var hdr = r1 && r1.data ? r1.data : null;
    var ftr = r2 && r2.data ? r2.data : null;
    
    // JSONからHTMLを生成する処理 (元のコードから変更なし)
    var headerHtml = hdr ? hdr.html : "<header>デフォルトヘッダー</header>"; 
    var footerHtml = ftr ? ftr.html : "<footer>デフォルトフッター</footer>";
    
    // ヘッダーとフッターをDOMに挿入
    setInner("site-header", headerHtml);
    setInner("site-footer", footerHtml);
    
    // 挿入後の実際の高さに基づいてメインコンテンツの位置を調整
    adjustOffsets();
    
    // 💡 重要な FOUC 対策：コンテンツの読み込み完了後に画面を表示
    // これにより、スタイルが適用された後の状態だけをユーザーに見せることができます。
    document.getElementById("page-body").style.visibility = "visible";
    
  } catch(e) {
    console.error("Failed to load header/footer:", e);
    // エラー時もユーザーに空白画面を見せないよう、画面を表示
    document.getElementById("page-body").style.visibility = "visible"; 
  }
}

// ページロード時に実行
loadHF();
