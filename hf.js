// hf.js

// 1. Supabaseクライアントの初期化 (管理画面と同じ認証情報を使用)
// 注意: このファイルは「type="module"」で埋め込む必要があります。
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// **公開ページの環境に合わせて、この認証情報を置き換えてください**
const SUPABASE_URL = "https://htnmjsqgoapvuanrsuma.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0bm1qc3Fnb2FwdnVhbnJzdW1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMzI3MDEsImV4cCI6MjA3MDkwODcwMX0.1AACTWZmChfmIIfBad0sf-hLV2bnaUt7bVURXnd0uKA";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * ページにヘッダーとフッターを適用する
 */
async function applyHeaderAndFooter() {
    try {
        // hf_settingsからヘッダーとフッターの両方を取得
        const { data: settings, error } = await supabase
            .from('hf_settings')
            .select('area, data')
            .in('area', ['header', 'footer']);

        if (error || !settings || settings.length !== 2) {
            console.error("Failed to load H&F settings:", error || "Data missing.");
            return;
        }

        const headerData = settings.find(s => s.area === 'header')?.data;
        const footerData = settings.find(s => s.area === 'footer')?.data;

        // 2. CSSの挿入
        // 共通のスタイルブロックを作成
        const style = document.createElement('style');
        style.textContent = '';
        
        if (headerData?.headerCss) {
            style.textContent += headerData.headerCss;
        }
        if (footerData?.footerCss) {
            style.textContent += footerData.footerCss;
        }
        document.head.appendChild(style);


        // 3. HTMLの挿入

        // ヘッダーの挿入 (bodyの先頭)
        if (headerData?.headerHtml) {
            const headerEl = document.createElement('div');
            headerEl.innerHTML = headerData.headerHtml;
            // headerHtmlは単一の.hfbar要素なので、直接bodyの先頭に追加
            if (headerEl.firstElementChild) {
                document.body.prepend(headerEl.firstElementChild);
            }
        }
        
        // フッターの挿入 (bodyの末尾)
        if (footerData?.footerHtml) {
            const footerEl = document.createElement('div');
            footerEl.innerHTML = footerData.footerHtml;
            // footerHtmlは単一の.hfbar要素なので、直接bodyの末尾に追加
            if (footerEl.firstElementChild) {
                document.body.appendChild(footerEl.firstElementChild);
            }
        }

    } catch (e) {
        console.error("An error occurred during H&F application:", e);
    }
}

// ページが完全にロードされた後に実行
document.addEventListener('DOMContentLoaded', applyHeaderAndFooter);
