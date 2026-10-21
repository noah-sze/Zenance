---
trigger: always_on
---

# Zenance — 專案總覽與架構白皮書 (Project Overview & Architecture)

## 1. 產品定位與核心方向 (Product Direction & Positioning)
Zenance 是一款以「極簡主義、隱私至上、本地優先」為核心哲學的純客戶端個人財務記帳 PWA（Progressive Web App）。

### 核心方向
- **純客戶端與離線可用 (Client-Only & Offline-First)**：無自建後端依賴，應用程式完全在瀏覽器客戶端運行。身為可安裝的 PWA，在無網路環境下亦能順暢進行記帳、預算查閱與資料檢索。
- **本地數據主權 (Local Data Sovereignty)**：用戶的所有財務數據均直接儲存於裝置本地資料庫（IndexedDB），未經授權絕不外洩。
- **零知識端對端加密同步 (Zero-Knowledge E2EE Sync)**：支援跨裝置資料同步，但在數據離開本機前，必須經由本地 Web Crypto API（AES-GCM / PBKDF2）進行端對端加密，儲存服務商（如 Dropbox）僅持有不可逆之密文數據。
- **全方位個人資產管家 (Comprehensive Financial Ecosystem)**：
  - 多幣別帳戶管理、轉帳、債權債務追蹤、代付分帳與即時匯率換算。
  - 類別預算規劃、結餘滾動追蹤與週期性收支圖表分析。
  - 時間機器（Time Machine）快照備份、JSON 匯入匯出與 FSCK（File System Consistency Check）帳本數據完整性審計修復。
  - 應用程式 PIN 碼鎖定防護，零追蹤、零遙測（Zero Telemetry）。

---

## 2. 產品理念與設計哲學 (Core Philosophy & Design Values)

### 數據主權與極致隱私 (Data Sovereignty & Privacy)
- 財務數據是用戶最敏感的私有隱私。Zenance 拒絕收集任何分析日誌或用戶遙測資訊。
- 用戶擁有自身數據的絕對控制權，能隨時匯出明文備份、建立還原點或清除所有本地數據。

### 工匠級黑白極簡美學 (Craft Monochrome Aesthetics)
- 捨棄浮誇與雜亂的多彩色塊，回歸極致純粹的黑白高對比（High-Contrast Monochrome）。
- 以嚴謹的工程師質感與等寬字體排版，賦予財務數字最高的精準感與清晰度。
- 介面動態即點即出，捨棄沉重的多餘動畫，追求極致流暢與純粹。

### 防禦性架構與高容災 (Defensive Architecture & High Resilience)
- 本地資料庫設計包含資料完整性自檢（FSCK），預防孤兒交易、無效引用或跨幣別計算異常。
- 同步機制具備雙向衝突處理與無損快照災備機制，確保資料安全萬無一失。

---

## 3. 系統核心架構 (System Architecture)

### 技術棧 (Tech Stack)
- **應用框架**：React 19 + TypeScript + Vite
- **UI 與元件庫**：Tailwind CSS v4 + Base UI / Radix UI + Lucide Icons
- **本地持久化**：IndexedDB（採用 Dexie.js 作為 ORM 封裝）
- **加密核心**：Web Crypto API 原生標準（PBKDF2 衍生金鑰、AES-GCM 加解密）
- **跨端同級同步**：Dropbox API 結合 E2EE 同步適配器
- **狀態管理**：Zustand（輕量全域 UI 狀態）+ Dexie Live Query（響應式資料流）
- **離線與 PWA**：`vite-plugin-pwa`（Service Worker、Web App Manifest、靜態資源快取）
- **國際化 (i18n)**：`react-i18next`（支援繁體中文、簡體中文、英文等多國語言）

### 模組架構分層 (Modular Layers)
專案嚴格遵循分層解耦與職責分離原則，清晰劃分為以下層級：

- `src/components/`：純 UI 表現元件、原子級 Primitives、表單控件與彈窗浮層。
- `src/pages/`：頂層路由頁面（Dashboard、Accounts、Budgets、Reports、Contacts、Settings 等）。
- `src/hooks/`：業務邏輯與狀態訂閱鉤子（解耦 UI 與資料庫操作，作為業務中樞）。
- `src/services/`：核心底層服務，包含 Dexie 資料庫 Schema、Web Crypto 加密模組、Dropbox 同步適配器與 FSCK 修復常式。
- `src/store/`：全域輕量 UI 狀態（如鎖定狀態、全域 Modal 控制、側邊欄導航開關）。
- `src/i18n/`：多語系初始化配置與各語言字典定義。
- `src/types/`：TypeScript 領域模型型別定義與 Zod 驗證架構。
- `src/utils/`：純運算函式、格式化工具（貨幣、日期）與跨端輔助函式。

### 數據同步與加密抽象架構 (Sync & Cryptographic Architecture)
- **同步介面抽象層 (Sync Provider Interface)**：系統定義標準同步契約（如連線驗證、遠端中繼資料檢查、增量上傳/下載），使儲存後端保持可插拔性。目前預設具體實作為 Dropbox API。
- **零知識加解密管線**：
  1. 本地資料在觸發同步時，由本地記憶體序列化為 JSON Payload。
  2. 透過用戶主密碼經 PBKDF2 鹽值雜湊衍生加密金鑰。
  3. 使用 AES-GCM 算法於本機端加密生成二進制加密包。
  4. 加密包傳輸至雲端中繼站儲存；解密僅在用戶持有主密碼的受信任裝置本機進行。
