---
trigger: always_on
---

# Zenance — 開發規範與設計系統標準 (Development Standards & Design System)

## 1. 代碼工程標準 (Code & Engineering Standards)

### TypeScript 與型別安全 (Strict Typing & Type Safety)
- 嚴格開啟靜態型別檢查，**絕對禁止**使用 `any` 或任意忽略型別報錯（如 `@ts-ignore`）。
- 實體模型、表單輸入與跨端資料交換契約，一律建立對應的 TypeScript Interface / Type，並優先配合 **Zod Schema** 定義運行時校驗規格。
- 函式參數與返回值應具備明確的型別定義或精確的型別推導，嚴禁隱式 `any`。

### 業務邏輯與 UI 渲染徹底解耦 (Hooks-Driven Decoupling)
- **UI 元件職責**：UI 元件必須維持純粹與輕量，僅負責視圖結構佈局、樣式渲染與使用者互動事件（點擊、輸入等）的派發，嚴禁直接在 UI 內部編寫複雜計算、過濾規則或原始資料庫 SQL/ORM 查詢。
- **自定義 Hooks 中樞**：所有領域邏輯、計算規則（如匯率換算、利息計算、分類預算累計）、IndexedDB 讀寫操作與資料表驗證，必須全面封裝於自定義 Hooks（`use*`）中。
- 元件僅透過調用自定義 Hooks 獲取響應式數據（State）與操作方法（Actions）。

### 狀態管理職責劃分 (State Management Separation)
- **業務數據唯一事實來源 (Single Source of Truth)**：所有財務業務資料（帳戶、交易明細、預算、標籤、分類等）由 IndexedDB（Dexie.js）統一託管，組件一律透過 `dexie-react-hooks`（如 `useLiveQuery`）以響應式管道獲取最新資料，嚴禁在多個狀態庫中複製業務數據。
- **全域 UI 狀態 (Lightweight UI State)**：僅有跨頁面的非持久化輕量 UI 控制狀態（如：PIN 鎖定狀態、側邊欄折疊、全域 Modal 開關、搜尋列展開）允許存入 **Zustand** Store。

### SOLID 原則與代碼品質規範 (Clean Code & Quality)
- **單一職責原則 (SRP)**：每個檔案、函式與元件只負責一件明確的事務。單個元件檔案長度原則上控制在合理行數內，過長時應拆分子元件或提取子 Hooks。
- **拒絕過度設計 (YAGNI / KISS)**：編寫簡潔、易於理解且直接解決問題的優雅代碼，避免建立不必要的抽象層與過度封裝，但保留清晰的型別擴展介面。
- **乾淨代碼 (Zero Technical Debt)**：
  - 嚴格禁止在提交代碼中殘留 `console.log`、除錯斷點（`debugger`）或已註解的廢棄代碼。
  - 代碼必須符合專案代碼檢查規範（Oxlint / ESLint）。

---

## 2. UI/UX 設計標準 (UI/UX Design Standards)

### 核心風格 (Core Style)
- **Vercel / Next.js 風格**：追求極簡、高對比、具備工程師質感的現代設計。
- **純粹的對比**：嚴格使用純黑 (`#000`) 與純白 (`#fff`) 作為主要背景與文本對比。捨棄傳統的柔和灰色背景。
- **扁平化設計 (Flat Design)**：**絕對禁止**在卡片 (Cards) 或容器上使用任何陰影 (`shadow-sm`, `shadow-md` 等)。層級的區分完全依賴細而精緻的邊框 (`border border-border`)。
- **字體運用 (Typography)**：
  - 數字、金額與統計數據嚴格使用等寬字體 (`font-mono`)，確保對齊與精確感。
  - 大標題使用緊湊的字距 (`tracking-tight`)，小標籤（如 Category, Date 等提示）使用大寫寬字距 (`uppercase tracking-widest text-xs`)。

### 佈局與元件 (Layout & Components)
- **無邊界大輸入框 (Borderless Inputs)**：金額輸入（如 Add Transaction）應採用置中、無邊框、無背景的超大字體 (`text-6xl font-bold`) 設計，捨棄傳統的 Input 框外觀。
- **網格卡片 (Grid Cards)**：帳戶 (Accounts) 等清單採用獨立的並列卡片設計（類似 Apple Wallet 概念），無陰影，僅靠邊框與內部留白界定範圍。
- **Usage Dashboard 佈局**：設定頁或表單區塊，採用 Vercel Usage 儀表板的表格式 List 佈局，使用 `divide-y divide-border` 進行行間分隔。
- **毛玻璃效果 (Glassmorphism)**：底部導覽列 (Bottom Nav) 或懸浮標頭使用半透明毛玻璃背景（使用系統變數或 `backdrop-blur-md`）。

---

## 3. 跨端通用設計契約 (Cross-Platform Architecture Contract)

### 拒絕平台特化補丁 (No Platform Hacks)
嚴禁為特定作業系統、特定瀏覽器或舊款晶片編寫特殊條件判斷或臨時修補；所有 UI 與交互必須以標準 Web 規範達到全平台通用。

### 高度管理規範 (Height Contract)
全面採用「樹狀 100% 高度（`height: 100%`）」，禁止在根容器或主佈局使用 `100vh` 避免移動端工具列遮擋溢出。內部滾動由 `<main className="flex-1 overflow-y-auto">` 自適應接管。

### 彈窗與居中規範 (Modal & Dialog Centering)
- 嚴禁在彈窗本體上使用 `inset-0 m-auto` 或 `transform: translate(-50%, -50%)` 做幾何定位。
- 所有浮層與 Modal 必須使用外層「全螢幕 Flex 容器居中（`fixed inset-0 flex items-center justify-center p-4 pointer-events-none`）」架構，彈窗本體為普通 block（`pointer-events-auto`），高度嚴格由內容自然撐開。

### 禁止彈窗巢狀聲明 (Flat Sibling Portals)
- 所有 Dialog / Modal 元件在 JSX 結構中必須以平級兄弟節點（Sibling Node，使用 `<> ... </>` Fragment 平鋪）聲明，**絕對禁止**將次級 `<Dialog>` 寫在另一個 `<DialogContent>` 的 DOM 樹或 JSX 內部。
- 巢狀聲明會觸發底層 Portal 上下文（如 Base UI / Floating UI）將子 Portal 自動吸附至父級 Portal 容器，導致次級彈窗的毛玻璃遮罩 (`Backdrop`) 被父層實色卡片壓制、吞噬或失效，造成子彈窗彈出時背景失去暗化遮罩。
- 底層 `DialogContent` 必須將 Portal container 預設指定為 `document.body`，實現全域獨立渲染防護。

### 多層彈窗遮罩棧規範 (Multi-layer Dialog Stacking)
當主彈窗層級為 `z-[60]` 時，於其上疊加呼出的次級彈窗（Secondary Dialog，如新增分類、選擇帳戶、代付分帳、二次確認等）其遮罩層與彈窗本體必須指定更高層級（如 `overlayClassName="z-[70]"` 與 `className="z-[70] ..."`），確保第二層彈窗能清晰、高對比地遮蓋在第一層彈窗之上，形成清晰聚焦的層次感。

### 焦點管理與禁止自動聚焦 (Dialog Focus & No Auto-Focus)
- 彈窗掛載時禁止第 0 幀同步強奪焦點（`initialFocus={false}`），避免觸發整頁同步強制重排（Forced Synchronous Reflow）。
- **嚴禁自動聚焦輸入框**：所有 Dialog 彈窗掛載出現時，**絕對禁止**在任何輸入框（如 `Input`、`AmountInput` 等）上設置 `autoFocus` 屬性，亦禁止透過 JS 強行調用 `.focus()`。自動聚焦會導致輸入鍵盤（桌面端懸浮數字鍵盤或行動端原生軟鍵盤）直接出現從而遮擋彈窗內容，破壞用戶看清彈窗完整資訊（如標題、說明、帳戶、金額上限等）的體驗。鍵盤必須交由用戶主動點擊目標欄位時呼出。
- **特許例外（全域搜尋頁面 `/search`）**：獨立的全域搜尋頁面為唯一特許例外。當用戶從首頁等全域入口主動點擊搜尋進入時，其核心意圖即為即時檢索，因此搜尋輸入框允許且應在進入時自動獲得焦點（`autoFocus` 搭配 `inputRef.focus()`），以保證操作流暢性與即敲即搜體驗。

### 原生級瞬時彈出 (Instant Pop)
- Dialog / Modal 彈窗本體全面採用**「原生級瞬時彈出 (Instant Pop)」**，嚴禁在卡片上附加慢速 `animate-in fade-in` 動畫，徹底避免在舊款設備（如 A9/A10 晶片、iOS 15）上因底層光柵化搶佔時間片導致動畫殘缺與嚴重掉幀卡頓。
- 彈窗呈現應如同 Vercel、Raycast 及 macOS 原生 Alert 般即點即出、清脆乾脆。

### 毛玻璃與遮罩規範 (Frosted Glassmorphism)
- 遮罩層全面使用專屬語意化變數：`bg-overlay backdrop-blur-[2px] data-closed:hidden`。在淺色模式下呈現純淨白霜牛奶玻璃（`rgba(255, 255, 255, 0.8)`），深色模式下呈現深邃黑曜石毛玻璃（`rgba(0, 0, 0, 0.8)`）。
- **嚴禁在動態 CSS 變數上直接使用 Tailwind 透明度修飾符（如 `bg-background/80`）**：Tailwind CSS v4 會將帶動態變數的透明度編譯為 CSS `color-mix()` 函式；而 iOS <= 15 的舊版 WebKit（如 iPhone 7P、SE 1）完全不支援 `color-mix()`，會觸發其 Fallback 回退機制變成 100% 完全不透明實色（純白或純黑），造成遮罩覆蓋整個螢幕。所有遮罩一律使用 `--color-overlay: var(--overlay)`（內嵌 RGBA Alpha 通道），確保全平台 WebKit 均能原生解析。
- 遮罩層嚴禁使用 `isolate`（避免觸發 WebKit 整頁圖層扁平化重繪）。
- 模糊半徑嚴格限制在 `2px`（`backdrop-blur-[2px]`），確保舊款 GPU 卷積計算耗時 `< 16ms`，維持滿幀 60fps。
- 遮罩層嚴禁使用動態 Alpha 漸變動畫，必須瞬間就位（`data-closed:hidden`），徹底杜絕 GPU 紋理重構頻閃。

### 彈窗動作按鈕佈局 (Dialog Footer Actions)
- 手機端與全平台 DialogFooter 按鈕嚴格採用**單行水平並排 (`flex flex-row items-center justify-between`)**。
- **嚴禁在移動端退化為垂直倒序堆疊 (`flex-col-reverse`)**，避免主要按鈕上下割裂與非必要的縱向空間浪費。
- 遵循「**取消在最左側 (Cancel on Left)、確認/新增在最右側 (Confirm/Add on Right)**」的人機工程學規範，符合雙手與單手拇指操作直覺。
- 當彈窗僅有單一按鈕（如關閉/確定）時，必須自動靠右對齊 (`[&>*:only-child]:ml-auto`)。

### 彈窗高度穩定性與防抖規範 (Dialog Height Stability & Anti-Jitter)
- **嚴禁動態插入新元素撐大彈窗容器**：彈窗本體高度必須保持絕對穩定。嚴禁在交互過程中（例如表單驗證錯誤、動態提示、警告訊息等）動態在彈窗內部插入或移除額外的文字行或區塊從而導致彈窗高度突增（Layout Shift / Jitter），這會造成視覺跳動並破壞原生級精緻質感。
- **狀態提示規範**：錯誤與警告應優先透過元件本身的視覺狀態切換（如輸入框文字變紅 `text-destructive`、邊框變色、確認按鈕動態禁用 `disabled`、既有佔位欄位狀態切換）或透過全域 Toast 提示呈現，確保彈窗幾何尺寸在任何互動狀態下均維持恆定。

### 破壞性動作按鈕規範與動態變數透明度禁令 (Destructive Buttons & Dynamic Alpha Prohibition)
- **實色紅底白字規範**：二次確認與破壞性高危操作的 `destructive` 按鈕統一採用「實色紅底 + 純白文字（`bg-destructive text-destructive-foreground hover:opacity-90 active:opacity-80`）」，符合 Apple HIG 人機工程學與 Shadcn 規範，嚴禁使用 `bg-destructive/10 text-destructive` 等淡底弱化樣式。
- **嚴禁動態 CSS 變數透明度修飾符**：嚴禁在任何引用自動態 CSS 變數的屬性上直接附加 Tailwind 透明度修飾符（如 `bg-destructive/10`、`bg-background/80` 等），徹底杜絕 Tailwind v4 編譯為 `color-mix()` 導致舊版 WebKit（如 iPhone SE 1、iOS 15）觸發 100% 實心色 Fallback。

---

## 4. 國際化與排版規範 (i18n & Typography Rules)

### 多語系完整覆蓋 (Full i18n Coverage)
- 專案已全面導入 `react-i18next`。
- 新增或修改任何 UI 文字時，**必須**使用 `t('key')` 函數，並同步更新 `src/i18n/locales/` 下的 `en.json`, `zh-TW.json`, `zh-CN.json`（及其他支援語系）語系檔。
- **絕對禁止**在 Component 程式碼中寫死 (hardcode) 任何中文或英文文案。
- Zod 等表單驗證錯誤訊息，也必須與 i18n 系統掛鉤。

### 中英數排版規則（盤古空格 Pangu Spacing）
- 所有中文文案（包含 i18n 翻譯檔與說明文檔）都必須嚴格遵循「**在中文與英文/數字之間插入一個半形空格**」的排版規範。
- 正確範例：`「使用 Vite 開發」`、`「共 3 筆交易」`、`「更新於 2026 年」`。
- 錯誤範例：`「使用Vite開發」`、`「共3筆交易」`、`「更新於2026年」`。
