# MirrorPlay 鏡像書寫英文學習工具

## 專案概述

一個為 ADHD 使用者設計的英文鏡像書寫學習小工具。核心概念：將英文文字左右翻轉成鏡像，使用者透過「解密」鏡像文字並手寫出正確英文的過程來學習，兼具專注力訓練和符號認知體驗。

**設計哲學：這是一個解密遊戲，不是考試工具。不做自動批改、不做分數系統、不做任何讓使用者有壓力的功能。**

## 目標使用者

- ADHD 特質：喜歡從結果看回開頭，需要趣味性維持注意力
- 有電繪筆的使用者（iPad / 繪圖板）
- 不追求「學會英文」，而是透過可控的加密解碼過程提升符號認知
- 使用繁體中文介面

## 核心流程

```
上傳圖片 或 直接貼文字（含英文）
    ↓
系統 OCR 辨識 / 解析所有英文單字
    ↓
┌─────────────────┬──────────────────┐
│    左側區域       │    右側區域        │
│  顯示鏡像翻轉的   │  生成對應的填空     │
│  英文文字         │  手寫欄位          │
│  （右讀左）       │  （用電繪筆書寫）    │
└─────────────────┴──────────────────┘
    ↓
使用者看左邊鏡像 → 在右邊寫出正確英文
    ↓
寫完後點擊「查看」→ 顯示：
  1. 對應圖片（Unsplash）
  2. 中文翻譯（MyMemory API）
  3. 手寫中文意思的 Canvas
  4. 單字/例句朗讀（SpeechSynthesis）
    ↓
點擊「AI 解釋」→ Claude Haiku 提供語境註解
```

## 已完成功能

### Phase 1 — 核心迴圈 ✅
- 圖片上傳（jpg / png / webp，拖曳或點擊）
- 文字直接輸入模式（Ctrl+Enter 送出）
- Tesseract.js 瀏覽器端 OCR
- 左側鏡像顯示（CSS `scaleX(-1)`，帶序號和刪除鈕）
- 右側 Canvas 手寫填空（Pointer Events + 壓感 1-6px）
- 左右捲動同步（ratio-based + requestAnimationFrame）
- 「抽 5 個複習」隨機模式（`key={wordsVersion}` 強制 remount）

### Phase 2 — 單字學習延伸 ✅
- Unsplash API 圖片搜尋
- MyMemory API 中文翻譯（免費、免註冊）
- 手寫中文意思 Canvas（ChineseCanvas）

### Phase 3 — AI 語境註解 ✅
- Claude Haiku API（`claude-haiku-4-5-20251001`）
- `anthropic-dangerous-direct-browser-access` header（瀏覽器直接呼叫）
- BYOK 模式：API Key 存 localStorage，首次設定畫面 + 設定 Modal 管理
- AI 回應中英文例句自動偵測，附帶朗讀 + 複製按鈕
- 401/429 錯誤友善提示

### Phase 4 — UI 與體驗優化 ✅
- 深色模式（#0a0a0a 主色）
- 響應式佈局（`md:` breakpoint，手機堆疊、桌面左右分割）
- Canvas 寬度 ResizeObserver 自適應
- SpeechSynthesis 單字朗讀（小喇叭按鈕）
- 自訂 favicon（SVG + PNG + ICO + Apple Touch Icon）

### 防躁小畫板 ✅
- 可收合/展開的塗鴉板（🎨 按鈕）
- 畫筆（壓感）、橡皮擦、清除全部
- 獨立 Canvas，不儲存、不匯出、不連動學習流程
- **設計原則：安全閥，不是功能**

### 部署與 PWA ✅
- Vercel 部署（mirror-play.vercel.app）
- Service Worker 靜態資源快取（API 呼叫不快取）
- Apple PWA meta tags（standalone、black-translucent status bar）
- manifest.json（maskable + any purpose icons）
- BYOK 模式，無需環境變數，純前端部署

### iPad 觸控優化 ✅
- 書寫期間全域 `user-select: none`（pointerUp 恢復）
- Canvas 外層 12px 觸控緩衝區（`touch-action: none`）
- iOS `-webkit-touch-callout: none` 防長按選單
- 書寫期間隱藏清除/查看按鈕，結束後 300ms 延遲顯示

## 技術架構

### 前端（純前端 React Web App）
- **框架**：React（CRA 單頁應用）
- **樣式**：Tailwind CSS v3.4.19（⚠️ 不能用 v4，與 CRA 不相容）
- **OCR**：Tesseract.js（瀏覽器端）
- **手寫**：HTML Canvas API + Pointer Events（壓感公式：`1 + pressure * 5`）
- **語音**：SpeechSynthesis API（免費、瀏覽器原生）
- **圖片翻轉**：CSS `transform: scaleX(-1)`

### 外部 API
- **翻譯**：MyMemory API（免費、免 Key）
- **圖片**：Unsplash API（免費額度，Client ID 在前端）
- **AI 註解**：Claude API Haiku（BYOK，使用者自帶 Key）

### 關鍵技術模式
- `key={wordsVersion}` 強制 Canvas 組件 remount（解決「抽5個複習」狀態殘留）
- 左右捲動同步用 scroll ratio + rAF（非 scrollTop 像素對齊）
- API Key 驗證：必須以 `sk-ant-` 開頭
- `anthropic-dangerous-direct-browser-access` header：瀏覽器直接呼叫 Claude API 必要

### 部署
- **平台**：Vercel（自動從 GitHub 部署）
- 純靜態，不需後端
- `.env` 僅供本地開發參考，生產環境用 BYOK localStorage

## 檔案結構

```
src/
├── App.js                    # 主應用：BYOK gate、佈局、狀態管理
├── components/
│   ├── ApiKeySetup.jsx       # 首次 API Key 設定畫面
│   ├── SettingsModal.jsx     # Key 管理 Modal（遮罩/更換/清除）
│   ├── ImageUploader.jsx     # 圖片上傳（拖曳 + 點擊）
│   ├── TextInput.jsx         # 文字直接輸入
│   ├── MirrorDisplay.jsx     # 左側鏡像文字顯示
│   ├── WritingCanvas.jsx     # 右側手寫區（SingleCanvas + 列表）
│   ├── WordDetail.jsx        # 單字詳情（圖片/翻譯/AI/朗讀/手寫中文）
│   └── DoodlePad.jsx         # 防躁塗鴉板
public/
├── index.html                # PWA meta tags + SW 註冊
├── manifest.json             # PWA manifest
├── service-worker.js         # 靜態資源快取
├── favicon.svg / .ico / .png # 多格式 favicon
└── apple-touch-icon.png      # iOS 主畫面圖示
```

## 明確不做的功能

- ❌ 自動比對手寫答案（不是考試）
- ❌ 分數 / 等級 / 排行榜
- ❌ 學習進度追蹤
- ❌ 單字拆字母填空（整個單字為最小單位）
- ❌ 任何讓人有壓力的遊戲化機制

## 注意事項

- 繁體中文介面，所有翻譯和 UI 文字都用繁體中文
- 鏡像是視覺上的水平翻轉（CSS scaleX(-1)），不是字串反轉
- 核心價值是「解密過程」本身，不是學習成效，不加任何量化功能
- Tailwind CSS 鎖定 v3.4.19，package.json 不加 `^`
- iPad Safari 觸控需特別處理（user-select、touch-callout、按鈕延遲顯示）
