# 골프공 인쇄 키오스크 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Electron + React 기반 골프공 인쇄/각인 키오스크 소프트웨어 신규 개발

**Architecture:** Electron Main Process에서 SQLite DB, 하드웨어(프린터/결제기/커팅기/USB) 제어를 담당하고, Renderer Process의 React UI와 IPC로 통신. 백엔드 서버 없이 단독 동작.

**Tech Stack:** Electron, React, Vite, TypeScript, Zustand, React Router, better-sqlite3, Konva.js, simple-keyboard, electron-builder

**Spec:** `docs/superpowers/specs/2026-03-30-golf-kiosk-design.md`

---

## File Map

```
golf-kiosk/
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── electron-builder.yml
├── src/
│   ├── main/
│   │   ├── index.ts                  # Task 1: Electron 진입점
│   │   ├── database/
│   │   │   ├── connection.ts         # Task 2: SQLite 연결
│   │   │   ├── migrations.ts         # Task 2: 스키마 생성
│   │   │   └── seed.ts               # Task 2: 초기 데이터
│   │   ├── ipc/
│   │   │   ├── db.ts                 # Task 3: DB IPC 핸들러
│   │   │   ├── settings.ts           # Task 3: 설정 IPC
│   │   │   ├── printer.ts            # Task 12: 프린터 IPC
│   │   │   ├── payment.ts            # Task 13: 결제 IPC
│   │   │   ├── cutter.ts             # Task 14: 커팅기 IPC
│   │   │   └── usb.ts               # Task 9: USB IPC
│   │   └── hardware/
│   │       ├── printer.ts            # Task 12: 프린터 제어
│   │       ├── payment.ts            # Task 13: KICC 결제
│   │       ├── cutter.ts             # Task 14: 커팅기 제어
│   │       └── usb-monitor.ts        # Task 9: USB 감지
│   ├── preload/
│   │   └── index.ts                  # Task 3: IPC 브릿지
│   └── renderer/
│       ├── index.html                # Task 1: HTML 엔트리
│       ├── main.tsx                  # Task 4: React 진입점
│       ├── App.tsx                   # Task 4: 라우터
│       ├── styles/
│       │   └── global.css            # Task 4: 글로벌 스타일
│       ├── stores/
│       │   ├── appStore.ts           # Task 4: 전역 상태
│       │   ├── designStore.ts        # Task 7: 디자인 상태
│       │   └── orderStore.ts         # Task 11: 주문 상태
│       ├── hooks/
│       │   ├── useIpc.ts             # Task 3: IPC 훅
│       │   └── useIdleTimer.ts       # Task 5: 무동작 타이머
│       ├── components/
│       │   ├── common/
│       │   │   ├── TopBar.tsx         # Task 4: 상단 바
│       │   │   ├── Modal.tsx          # Task 5: 모달
│       │   │   └── VirtualKeyboard.tsx # Task 8: 가상 키보드
│       │   └── editor/
│       │       ├── GolfBallCanvas.tsx  # Task 7: 캔버스
│       │       ├── ToolPanel.tsx       # Task 8: 도구 패널
│       │       ├── TextTool.tsx        # Task 8: 텍스트 도구
│       │       ├── ImageTool.tsx       # Task 9: 이미지 도구
│       │       ├── CharacterTool.tsx   # Task 10: 캐릭터 도구
│       │       └── LayerPanel.tsx      # Task 7: 레이어 패널
│       ├── pages/
│       │   ├── HomePage.tsx           # Task 5: 홈 화면
│       │   ├── ProductSelectPage.tsx  # Task 6: 상품 선택
│       │   ├── DesignEditorPage.tsx   # Task 7: 디자인 편집기
│       │   ├── PreviewPage.tsx        # Task 11: 미리보기
│       │   ├── PaymentPage.tsx        # Task 13: 결제
│       │   ├── PrintingPage.tsx       # Task 12: 인쇄 진행
│       │   ├── CompletePage.tsx       # Task 11: 완료
│       │   └── admin/
│       │       ├── AdminLayout.tsx    # Task 15: 관리자 레이아웃
│       │       ├── AdminDashboard.tsx # Task 15: 대시보드
│       │       ├── AdminOrders.tsx    # Task 16: 결제 내역
│       │       ├── AdminPricing.tsx   # Task 16: 가격 설정
│       │       ├── AdminHardware.tsx  # Task 17: 하드웨어
│       │       ├── AdminContent.tsx   # Task 17: 콘텐츠
│       │       └── AdminSettings.tsx  # Task 17: 시스템 설정
│       └── assets/
│           ├── characters/            # Task 10: 샘플 캐릭터
│           └── fonts/                 # Task 2: 기본 폰트
└── resources/                         # Task 18: 앱 아이콘
```

---

### Task 1: Electron + Vite + React 프로젝트 스캐폴딩

**Files:**
- Create: `package.json`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `electron-builder.yml`
- Create: `src/main/index.ts`, `src/renderer/index.html`

- [ ] **Step 1: 프로젝트 초기화 및 의존성 설치**

```bash
cd /c/Users/201-B1/golf-kiosk
npm init -y
npm install react react-dom react-router-dom zustand konva react-konva simple-keyboard
npm install -D typescript @types/react @types/react-dom vite @vitejs/plugin-react electron electron-builder concurrently wait-on
```

- [ ] **Step 2: tsconfig.json 작성**

Create `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "outDir": "dist",
    "baseUrl": ".",
    "paths": {
      "@renderer/*": ["src/renderer/*"],
      "@main/*": ["src/main/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

Create `tsconfig.node.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist/main",
    "rootDir": "src/main",
    "resolveJsonModule": true
  },
  "include": ["src/main/**/*", "src/preload/**/*"]
}
```

- [ ] **Step 3: vite.config.ts 작성**

Create `vite.config.ts`:
```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  root: 'src/renderer',
  build: {
    outDir: '../../dist/renderer',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@renderer': path.resolve(__dirname, 'src/renderer'),
    },
  },
  server: {
    port: 5173,
  },
});
```

- [ ] **Step 4: Electron Main Process 진입점 작성**

Create `src/main/index.ts`:
```ts
import { app, BrowserWindow } from 'electron';
import path from 'path';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    frame: false,
    fullscreen: false, // dev 모드에서는 false, 프로덕션에서 true
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});
```

- [ ] **Step 5: Renderer HTML 엔트리 작성**

Create `src/renderer/index.html`:
```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=1920, height=1080, initial-scale=1.0" />
  <title>골프공 인쇄 키오스크</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="./main.tsx"></script>
</body>
</html>
```

Create `src/renderer/main.tsx` (placeholder):
```tsx
import React from 'react';
import { createRoot } from 'react-dom/client';

function App() {
  return <div style={{ fontSize: 48, textAlign: 'center', marginTop: 200 }}>골프공 키오스크 - 초기 설정 완료</div>;
}

createRoot(document.getElementById('root')!).render(<App />);
```

Create `src/preload/index.ts` (placeholder):
```ts
import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
});
```

- [ ] **Step 6: package.json scripts 및 electron-builder 설정**

Update `package.json` main and scripts:
```json
{
  "main": "dist/main/index.js",
  "scripts": {
    "dev:renderer": "vite --config vite.config.ts",
    "dev:main": "tsc -p tsconfig.node.json && electron .",
    "dev": "concurrently \"npm run dev:renderer\" \"wait-on http://localhost:5173 && npm run dev:main\"",
    "build:renderer": "vite build --config vite.config.ts",
    "build:main": "tsc -p tsconfig.node.json",
    "build": "npm run build:renderer && npm run build:main",
    "dist": "npm run build && electron-builder"
  }
}
```

Create `electron-builder.yml`:
```yaml
appId: com.golfkiosk.app
productName: 골프공인쇄키오스크
directories:
  output: release
  buildResources: resources
files:
  - dist/**/*
  - node_modules/**/*
win:
  target: nsis
nsis:
  oneClick: false
  allowToChangeInstallationDirectory: true
```

- [ ] **Step 7: 빌드 테스트 및 커밋**

```bash
npm run build:main
# Expected: dist/main/index.js 생성 확인
```

```bash
git add -A && git commit -m "feat: Electron + Vite + React 프로젝트 스캐폴딩"
```

---

### Task 2: SQLite 데이터베이스 설정

**Files:**
- Create: `src/main/database/connection.ts`, `src/main/database/migrations.ts`, `src/main/database/seed.ts`

- [ ] **Step 1: better-sqlite3 설치**

```bash
cd /c/Users/201-B1/golf-kiosk
npm install better-sqlite3
npm install -D @types/better-sqlite3
```

- [ ] **Step 2: DB 연결 모듈 작성**

Create `src/main/database/connection.ts`:
```ts
import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    const dbPath = path.join(app.getPath('userData'), 'kiosk.db');
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
```

- [ ] **Step 3: 마이그레이션 작성**

Create `src/main/database/migrations.ts`:
```ts
import type Database from 'better-sqlite3';

export function runMigrations(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_type TEXT NOT NULL CHECK(product_type IN ('golf_ball', 'sticker')),
      design_data TEXT NOT NULL DEFAULT '{}',
      amount INTEGER NOT NULL DEFAULT 0,
      payment_status TEXT NOT NULL DEFAULT 'pending'
        CHECK(payment_status IN ('pending', 'completed', 'failed', 'refunded')),
      payment_method TEXT DEFAULT 'card',
      kicc_transaction_id TEXT,
      kicc_approval_no TEXT,
      print_status TEXT NOT NULL DEFAULT 'pending'
        CHECK(print_status IN ('pending', 'printing', 'completed', 'failed')),
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      completed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS print_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES orders(id),
      status TEXT NOT NULL CHECK(status IN ('started', 'completed', 'error')),
      message TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS characters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'general',
      image_path TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS fonts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0
    );
  `);
}
```

- [ ] **Step 4: 초기 데이터 시드 작성**

Create `src/main/database/seed.ts`:
```ts
import type Database from 'better-sqlite3';

export function seedDefaults(db: Database.Database): void {
  const insertSetting = db.prepare(
    `INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`
  );

  const defaults: [string, string][] = [
    ['price_golf_ball', '5000'],
    ['price_sticker', '3000'],
    ['admin_password', '1234'],
    ['idle_timeout', '120'],
    ['complete_timeout', '10'],
    ['printer_name', ''],
    ['cutter_port', ''],
  ];

  const seedMany = db.transaction(() => {
    for (const [key, value] of defaults) {
      insertSetting.run(key, value);
    }
  });

  seedMany();
}
```

- [ ] **Step 5: Main Process에서 DB 초기화 연결**

Modify `src/main/index.ts` — `createWindow` 함수 상단에 추가:
```ts
import { getDb, closeDb } from './database/connection';
import { runMigrations } from './database/migrations';
import { seedDefaults } from './database/seed';

// createWindow() 내부 최상단에:
const db = getDb();
runMigrations(db);
seedDefaults(db);

// app.on('window-all-closed') 내부에:
closeDb();
```

- [ ] **Step 6: 빌드 테스트 및 커밋**

```bash
npm run build:main
git add -A && git commit -m "feat: SQLite 데이터베이스 스키마 및 초기 데이터 설정"
```

---

### Task 3: Preload + IPC 브릿지

**Files:**
- Create: `src/preload/index.ts`, `src/main/ipc/db.ts`, `src/main/ipc/settings.ts`
- Create: `src/renderer/hooks/useIpc.ts`

- [ ] **Step 1: DB IPC 핸들러 작성**

Create `src/main/ipc/db.ts`:
```ts
import { ipcMain } from 'electron';
import { getDb } from '../database/connection';

export function registerDbIpc(): void {
  ipcMain.handle('db:query', (_event, sql: string, params: unknown[] = []) => {
    const db = getDb();
    const stmt = db.prepare(sql);
    return stmt.all(...params);
  });

  ipcMain.handle('db:execute', (_event, sql: string, params: unknown[] = []) => {
    const db = getDb();
    const stmt = db.prepare(sql);
    return stmt.run(...params);
  });
}
```

Create `src/main/ipc/settings.ts`:
```ts
import { ipcMain } from 'electron';
import { getDb } from '../database/connection';

export function registerSettingsIpc(): void {
  ipcMain.handle('settings:get', (_event, key: string) => {
    const db = getDb();
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined;
    return row?.value ?? null;
  });

  ipcMain.handle('settings:get-all', () => {
    const db = getDb();
    const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];
    const result: Record<string, string> = {};
    for (const row of rows) {
      result[row.key] = row.value;
    }
    return result;
  });

  ipcMain.handle('settings:set', (_event, key: string, value: string) => {
    const db = getDb();
    db.prepare(
      `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now','localtime'))
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
    ).run(key, value);
    return true;
  });
}
```

- [ ] **Step 2: Preload 스크립트 작성**

Overwrite `src/preload/index.ts`:
```ts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,

  // DB
  dbQuery: (sql: string, params?: unknown[]) =>
    ipcRenderer.invoke('db:query', sql, params),
  dbExecute: (sql: string, params?: unknown[]) =>
    ipcRenderer.invoke('db:execute', sql, params),

  // Settings
  getSetting: (key: string) => ipcRenderer.invoke('settings:get', key),
  getAllSettings: () => ipcRenderer.invoke('settings:get-all'),
  setSetting: (key: string, value: string) =>
    ipcRenderer.invoke('settings:set', key, value),

  // Printer
  printImage: (imageDataUrl: string) =>
    ipcRenderer.invoke('printer:print', imageDataUrl),
  getPrinterStatus: () => ipcRenderer.invoke('printer:status'),

  // Payment
  requestPayment: (amount: number) =>
    ipcRenderer.invoke('payment:request', amount),
  cancelPayment: (transactionId: string) =>
    ipcRenderer.invoke('payment:cancel', transactionId),

  // Cutter
  cutDesign: (designData: string) =>
    ipcRenderer.invoke('cutter:cut', designData),

  // USB
  listUsbImages: () => ipcRenderer.invoke('usb:list-images'),
  readUsbImage: (filePath: string) =>
    ipcRenderer.invoke('usb:read-image', filePath),

  // Hardware status
  getHardwareStatus: () => ipcRenderer.invoke('hardware:status'),

  // Event listeners (Main → Renderer)
  onUsbDetect: (callback: (event: unknown, data: unknown) => void) =>
    ipcRenderer.on('usb:detect', callback),
  onPaymentResult: (callback: (event: unknown, data: unknown) => void) =>
    ipcRenderer.on('payment:result', callback),
  onPrinterStatus: (callback: (event: unknown, data: unknown) => void) =>
    ipcRenderer.on('printer:status', callback),

  removeAllListeners: (channel: string) =>
    ipcRenderer.removeAllListeners(channel),
});
```

- [ ] **Step 3: TypeScript 타입 선언 작성**

Create `src/renderer/types/electron.d.ts`:
```ts
export interface ElectronAPI {
  platform: string;
  dbQuery: (sql: string, params?: unknown[]) => Promise<unknown[]>;
  dbExecute: (sql: string, params?: unknown[]) => Promise<{ changes: number; lastInsertRowid: number }>;
  getSetting: (key: string) => Promise<string | null>;
  getAllSettings: () => Promise<Record<string, string>>;
  setSetting: (key: string, value: string) => Promise<boolean>;
  printImage: (imageDataUrl: string) => Promise<{ success: boolean; error?: string }>;
  getPrinterStatus: () => Promise<{ connected: boolean; status: string }>;
  requestPayment: (amount: number) => Promise<{ success: boolean; transactionId?: string; approvalNo?: string; error?: string }>;
  cancelPayment: (transactionId: string) => Promise<{ success: boolean; error?: string }>;
  cutDesign: (designData: string) => Promise<{ success: boolean; error?: string }>;
  listUsbImages: () => Promise<{ path: string; name: string; size: number }[]>;
  readUsbImage: (filePath: string) => Promise<string>;
  getHardwareStatus: () => Promise<{ printer: boolean; payment: boolean; cutter: boolean }>;
  onUsbDetect: (callback: (event: unknown, data: unknown) => void) => void;
  onPaymentResult: (callback: (event: unknown, data: unknown) => void) => void;
  onPrinterStatus: (callback: (event: unknown, data: unknown) => void) => void;
  removeAllListeners: (channel: string) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
```

- [ ] **Step 4: useIpc 훅 작성**

Create `src/renderer/hooks/useIpc.ts`:
```ts
export function useIpc() {
  const api = window.electronAPI;
  return api;
}
```

- [ ] **Step 5: Main Process에 IPC 등록 연결**

Modify `src/main/index.ts` — import와 createWindow 내부에 추가:
```ts
import { registerDbIpc } from './ipc/db';
import { registerSettingsIpc } from './ipc/settings';

// createWindow() 내부, DB 초기화 이후에:
registerDbIpc();
registerSettingsIpc();
```

- [ ] **Step 6: 커밋**

```bash
git add -A && git commit -m "feat: Preload IPC 브릿지 및 DB/설정 핸들러 구현"
```

---

### Task 4: App Shell (라우터, 글로벌 스타일, 전역 상태)

**Files:**
- Create: `src/renderer/App.tsx`, `src/renderer/styles/global.css`
- Create: `src/renderer/stores/appStore.ts`, `src/renderer/components/common/TopBar.tsx`
- Modify: `src/renderer/main.tsx`

- [ ] **Step 1: 글로벌 스타일 작성**

Create `src/renderer/styles/global.css`:
```css
* { margin: 0; padding: 0; box-sizing: border-box; }

html, body, #root {
  width: 1920px;
  height: 1080px;
  overflow: hidden;
  font-family: 'Nanum Gothic', 'Malgun Gothic', sans-serif;
  background: #1a1a2e;
  color: #ffffff;
  user-select: none;
  cursor: none;
}

button {
  cursor: none;
  border: none;
  outline: none;
  font-family: inherit;
  touch-action: manipulation;
}

input, textarea {
  font-family: inherit;
  outline: none;
}

::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: #16213e; }
::-webkit-scrollbar-thumb { background: #6c63ff; border-radius: 4px; }
```

- [ ] **Step 2: 전역 앱 상태 스토어 작성**

Create `src/renderer/stores/appStore.ts`:
```ts
import { create } from 'zustand';

interface AppState {
  currentPage: string;
  isAdmin: boolean;
  settings: Record<string, string>;
  setCurrentPage: (page: string) => void;
  setIsAdmin: (val: boolean) => void;
  setSettings: (settings: Record<string, string>) => void;
  updateSetting: (key: string, value: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentPage: '/',
  isAdmin: false,
  settings: {},
  setCurrentPage: (page) => set({ currentPage: page }),
  setIsAdmin: (val) => set({ isAdmin: val }),
  setSettings: (settings) => set({ settings }),
  updateSetting: (key, value) =>
    set((state) => ({ settings: { ...state.settings, [key]: value } })),
}));
```

- [ ] **Step 3: TopBar 공통 컴포넌트 작성**

Create `src/renderer/components/common/TopBar.tsx`:
```tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface TopBarProps {
  title: string;
  showBack?: boolean;
  rightContent?: React.ReactNode;
}

export default function TopBar({ title, showBack = true, rightContent }: TopBarProps) {
  const navigate = useNavigate();

  return (
    <div style={{
      height: 60, background: '#2d3436', display: 'flex',
      alignItems: 'center', justifyContent: 'space-between', padding: '0 25px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
        {showBack && (
          <button onClick={() => navigate(-1)}
            style={{ color: '#fff', fontSize: 16, background: 'none', padding: '8px 16px' }}>
            ← 뒤로
          </button>
        )}
        <span style={{ color: '#ddd', fontSize: 18, fontWeight: 'bold' }}>{title}</span>
      </div>
      {rightContent && <div style={{ display: 'flex', gap: 12 }}>{rightContent}</div>}
    </div>
  );
}
```

- [ ] **Step 4: App.tsx 라우터 작성**

Create `src/renderer/App.tsx`:
```tsx
import React, { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { useAppStore } from './stores/appStore';
import { useIpc } from './hooks/useIpc';

// Pages (placeholder components for now)
function Placeholder({ name }: { name: string }) {
  return <div style={{ fontSize: 36, textAlign: 'center', marginTop: 200 }}>{name}</div>;
}

export default function App() {
  const setSettings = useAppStore((s) => s.setSettings);
  const api = useIpc();

  useEffect(() => {
    api.getAllSettings().then(setSettings);
  }, []);

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Placeholder name="홈 화면" />} />
        <Route path="/product-select" element={<Placeholder name="상품 선택" />} />
        <Route path="/editor" element={<Placeholder name="디자인 편집기" />} />
        <Route path="/preview" element={<Placeholder name="미리보기" />} />
        <Route path="/payment" element={<Placeholder name="결제" />} />
        <Route path="/printing" element={<Placeholder name="인쇄 중" />} />
        <Route path="/complete" element={<Placeholder name="완료" />} />
        <Route path="/admin/*" element={<Placeholder name="관리자" />} />
      </Routes>
    </HashRouter>
  );
}
```

- [ ] **Step 5: main.tsx 업데이트**

Overwrite `src/renderer/main.tsx`:
```tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/global.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 6: 커밋**

```bash
git add -A && git commit -m "feat: App Shell - 라우터, 글로벌 스타일, 전역 상태 구성"
```

---

### Task 5: 홈 화면 + 무동작 타이머 + 관리자 진입

**Files:**
- Create: `src/renderer/pages/HomePage.tsx`, `src/renderer/hooks/useIdleTimer.ts`
- Create: `src/renderer/components/common/Modal.tsx`

- [ ] **Step 1: 무동작 타이머 훅 작성**

Create `src/renderer/hooks/useIdleTimer.ts`:
```ts
import { useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../stores/appStore';

export function useIdleTimer() {
  const navigate = useNavigate();
  const location = useLocation();
  const settings = useAppStore((s) => s.settings);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const timeout = parseInt(settings.idle_timeout || '120', 10) * 1000;

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (location.pathname === '/' || location.pathname.startsWith('/admin')) return;

    timerRef.current = setTimeout(() => {
      navigate('/');
    }, timeout);
  }, [timeout, location.pathname, navigate]);

  useEffect(() => {
    const events = ['touchstart', 'mousedown', 'mousemove', 'keydown'];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resetTimer]);
}
```

- [ ] **Step 2: Modal 공통 컴포넌트 작성**

Create `src/renderer/components/common/Modal.tsx`:
```tsx
import React from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: '#16213e', borderRadius: 16, padding: 30,
        minWidth: 400, maxWidth: 600, border: '1px solid #0f3460',
      }}>
        <h2 style={{ fontSize: 22, marginBottom: 20, color: '#fff' }}>{title}</h2>
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 홈 화면 작성**

Create `src/renderer/pages/HomePage.tsx`:
```tsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/common/Modal';

export default function HomePage() {
  const navigate = useNavigate();
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleScreenTouch = () => {
    navigate('/product-select');
  };

  const handleAdminArea = (e: React.MouseEvent) => {
    e.stopPropagation();
    tapCountRef.current += 1;

    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    tapTimerRef.current = setTimeout(() => { tapCountRef.current = 0; }, 2000);

    if (tapCountRef.current >= 5) {
      tapCountRef.current = 0;
      setShowAdminModal(true);
      setAdminPassword('');
      setAdminError('');
    }
  };

  const handleAdminLogin = async () => {
    const stored = await window.electronAPI.getSetting('admin_password');
    if (adminPassword === stored) {
      setShowAdminModal(false);
      navigate('/admin');
    } else {
      setAdminError('비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <div onClick={handleScreenTouch} style={{
      width: '100%', height: '100%', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      position: 'relative',
    }}>
      <div style={{ fontSize: 72, fontWeight: 'bold', color: '#6c63ff', marginBottom: 20 }}>
        ⛳ 골프공 인쇄 키오스크
      </div>
      <div style={{ fontSize: 32, color: '#aaa', animation: 'pulse 2s infinite' }}>
        화면을 터치하여 시작하세요
      </div>

      {/* 관리자 진입 영역 (우측 하단) */}
      <div onClick={handleAdminArea} style={{
        position: 'absolute', bottom: 0, right: 0, width: 100, height: 100,
      }} />

      <Modal open={showAdminModal} onClose={() => setShowAdminModal(false)} title="관리자 로그인">
        <input
          type="password"
          value={adminPassword}
          onChange={(e) => setAdminPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
          placeholder="비밀번호 입력"
          style={{
            width: '100%', padding: 12, fontSize: 18, borderRadius: 8,
            border: '1px solid #0f3460', background: '#1a1a2e', color: '#fff',
            marginBottom: 12,
          }}
          autoFocus
        />
        {adminError && <div style={{ color: '#e94560', marginBottom: 12 }}>{adminError}</div>}
        <button onClick={handleAdminLogin} style={{
          width: '100%', padding: 14, fontSize: 18, borderRadius: 8,
          background: '#6c63ff', color: '#fff', fontWeight: 'bold',
        }}>
          로그인
        </button>
      </Modal>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
```

- [ ] **Step 4: App.tsx에 홈 페이지 연결 + idle timer 적용**

Modify `src/renderer/App.tsx` — import 변경:
```tsx
import HomePage from './pages/HomePage';
import { useIdleTimer } from './hooks/useIdleTimer';

// Routes 내부에서 Placeholder 대신:
// <Route path="/" element={<HomePage />} />

// App 컴포넌트 내부에 useIdleTimer 추가:
function AppContent() {
  useIdleTimer();
  const setSettings = useAppStore((s) => s.setSettings);
  const api = useIpc();
  useEffect(() => { api.getAllSettings().then(setSettings); }, []);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      {/* 나머지 라우트 유지 */}
    </Routes>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}
```

- [ ] **Step 5: 커밋**

```bash
git add -A && git commit -m "feat: 홈 화면, 무동작 타이머, 관리자 진입 모달 구현"
```

---

### Task 6: 상품 선택 화면

**Files:**
- Create: `src/renderer/pages/ProductSelectPage.tsx`

- [ ] **Step 1: 상품 선택 페이지 작성**

Create `src/renderer/pages/ProductSelectPage.tsx`:
```tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/common/TopBar';
import { useAppStore } from '../stores/appStore';

export default function ProductSelectPage() {
  const navigate = useNavigate();
  const settings = useAppStore((s) => s.settings);
  const golfPrice = parseInt(settings.price_golf_ball || '5000', 10);
  const stickerPrice = parseInt(settings.price_sticker || '3000', 10);

  const handleSelect = (type: 'golf_ball' | 'sticker') => {
    navigate('/editor', { state: { productType: type } });
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <TopBar title="상품 선택" />
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 60,
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      }}>
        {/* 골프공 인쇄 */}
        <button onClick={() => handleSelect('golf_ball')} style={{
          width: 400, height: 500, borderRadius: 24, background: '#16213e',
          border: '2px solid #6c63ff', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 20, padding: 40,
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}>
          <div style={{ fontSize: 100 }}>⛳</div>
          <div style={{ fontSize: 28, fontWeight: 'bold', color: '#fff' }}>골프공 인쇄</div>
          <div style={{ fontSize: 16, color: '#aaa', textAlign: 'center', lineHeight: 1.6 }}>
            골프공에 원하는 텍스트, 이미지,<br/>캐릭터를 인쇄합니다
          </div>
          <div style={{
            fontSize: 24, fontWeight: 'bold', color: '#6c63ff',
            background: '#0f3460', padding: '10px 30px', borderRadius: 12,
          }}>
            {golfPrice.toLocaleString()}원
          </div>
        </button>

        {/* 스티커/데칼 커팅 */}
        <button onClick={() => handleSelect('sticker')} style={{
          width: 400, height: 500, borderRadius: 24, background: '#16213e',
          border: '2px solid #e94560', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 20, padding: 40,
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}>
          <div style={{ fontSize: 100 }}>✂️</div>
          <div style={{ fontSize: 28, fontWeight: 'bold', color: '#fff' }}>스티커/데칼 커팅</div>
          <div style={{ fontSize: 16, color: '#aaa', textAlign: 'center', lineHeight: 1.6 }}>
            원하는 디자인을 스티커 또는<br/>데칼로 커팅합니다
          </div>
          <div style={{
            fontSize: 24, fontWeight: 'bold', color: '#e94560',
            background: '#0f3460', padding: '10px 30px', borderRadius: 12,
          }}>
            {stickerPrice.toLocaleString()}원
          </div>
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: App.tsx 라우트 연결**

Modify `src/renderer/App.tsx`:
```tsx
import ProductSelectPage from './pages/ProductSelectPage';
// Route 교체:
<Route path="/product-select" element={<ProductSelectPage />} />
```

- [ ] **Step 3: 커밋**

```bash
git add -A && git commit -m "feat: 상품 선택 화면 (골프공 인쇄 / 스티커 커팅)"
```

---

### Task 7: 디자인 편집기 — 캔버스 + 레이어 패널 + 상태 관리

**Files:**
- Create: `src/renderer/stores/designStore.ts`
- Create: `src/renderer/components/editor/GolfBallCanvas.tsx`
- Create: `src/renderer/components/editor/LayerPanel.tsx`
- Create: `src/renderer/pages/DesignEditorPage.tsx`

- [ ] **Step 1: 디자인 상태 스토어 작성**

Create `src/renderer/stores/designStore.ts`:
```ts
import { create } from 'zustand';

export interface DesignElement {
  id: string;
  type: 'text' | 'image' | 'character';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  // text-specific
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fill?: string;
  // image/character-specific
  src?: string;
}

interface DesignState {
  elements: DesignElement[];
  selectedId: string | null;
  productType: 'golf_ball' | 'sticker';
  addElement: (el: DesignElement) => void;
  updateElement: (id: string, updates: Partial<DesignElement>) => void;
  removeElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  moveElementUp: (id: string) => void;
  moveElementDown: (id: string) => void;
  setProductType: (type: 'golf_ball' | 'sticker') => void;
  clearAll: () => void;
}

export const useDesignStore = create<DesignState>((set) => ({
  elements: [],
  selectedId: null,
  productType: 'golf_ball',

  addElement: (el) => set((s) => ({ elements: [...s.elements, el] })),

  updateElement: (id, updates) =>
    set((s) => ({
      elements: s.elements.map((el) => (el.id === id ? { ...el, ...updates } : el)),
    })),

  removeElement: (id) =>
    set((s) => ({
      elements: s.elements.filter((el) => el.id !== id),
      selectedId: s.selectedId === id ? null : s.selectedId,
    })),

  selectElement: (id) => set({ selectedId: id }),

  moveElementUp: (id) =>
    set((s) => {
      const idx = s.elements.findIndex((el) => el.id === id);
      if (idx >= s.elements.length - 1) return s;
      const arr = [...s.elements];
      [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
      return { elements: arr };
    }),

  moveElementDown: (id) =>
    set((s) => {
      const idx = s.elements.findIndex((el) => el.id === id);
      if (idx <= 0) return s;
      const arr = [...s.elements];
      [arr[idx], arr[idx - 1]] = [arr[idx - 1], arr[idx]];
      return { elements: arr };
    }),

  setProductType: (type) => set({ productType: type }),
  clearAll: () => set({ elements: [], selectedId: null }),
}));
```

- [ ] **Step 2: 골프공 캔버스 컴포넌트 작성**

Create `src/renderer/components/editor/GolfBallCanvas.tsx`:
```tsx
import React, { useRef } from 'react';
import { Stage, Layer, Circle, Group, Text, Image as KonvaImage, Transformer } from 'react-konva';
import { useDesignStore, DesignElement } from '../../stores/designStore';
import useImage from 'use-image';

const CANVAS_SIZE = 500;
const BALL_RADIUS = 220;

function ImageElement({ el }: { el: DesignElement }) {
  const [img] = useImage(el.src || '');
  const updateElement = useDesignStore((s) => s.updateElement);
  const selectElement = useDesignStore((s) => s.selectElement);

  return (
    <KonvaImage
      id={el.id}
      image={img}
      x={el.x} y={el.y}
      width={el.width} height={el.height}
      rotation={el.rotation}
      draggable
      onClick={() => selectElement(el.id)}
      onTap={() => selectElement(el.id)}
      onDragEnd={(e) => updateElement(el.id, { x: e.target.x(), y: e.target.y() })}
      onTransformEnd={(e) => {
        const node = e.target;
        updateElement(el.id, {
          x: node.x(), y: node.y(),
          width: node.width() * node.scaleX(),
          height: node.height() * node.scaleY(),
          rotation: node.rotation(),
        });
        node.scaleX(1);
        node.scaleY(1);
      }}
    />
  );
}

function TextElement({ el }: { el: DesignElement }) {
  const updateElement = useDesignStore((s) => s.updateElement);
  const selectElement = useDesignStore((s) => s.selectElement);

  return (
    <Text
      id={el.id}
      text={el.text || ''}
      x={el.x} y={el.y}
      fontSize={el.fontSize || 24}
      fontFamily={el.fontFamily || 'Nanum Gothic'}
      fill={el.fill || '#000000'}
      rotation={el.rotation}
      draggable
      onClick={() => selectElement(el.id)}
      onTap={() => selectElement(el.id)}
      onDragEnd={(e) => updateElement(el.id, { x: e.target.x(), y: e.target.y() })}
    />
  );
}

export default function GolfBallCanvas() {
  const elements = useDesignStore((s) => s.elements);
  const selectedId = useDesignStore((s) => s.selectedId);
  const selectElement = useDesignStore((s) => s.selectElement);
  const stageRef = useRef<any>(null);

  const handleStageClick = (e: any) => {
    if (e.target === e.target.getStage()) selectElement(null);
  };

  return (
    <div style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#e8e8e8', position: 'relative',
    }}>
      <Stage
        ref={stageRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        onClick={handleStageClick}
        onTap={handleStageClick}
      >
        <Layer>
          {/* Golf ball background */}
          <Circle
            x={CANVAS_SIZE / 2} y={CANVAS_SIZE / 2}
            radius={BALL_RADIUS}
            fill="#f5f5f5"
            shadowColor="rgba(0,0,0,0.3)"
            shadowBlur={20}
            shadowOffset={{ x: 5, y: 5 }}
          />
          {/* Clip group to ball shape */}
          <Group
            clipFunc={(ctx: any) => {
              ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, BALL_RADIUS, 0, Math.PI * 2);
            }}
          >
            {elements.map((el) => {
              if (el.type === 'text') return <TextElement key={el.id} el={el} />;
              return <ImageElement key={el.id} el={el} />;
            })}
          </Group>
        </Layer>
      </Stage>

      <div style={{
        position: 'absolute', top: 15, left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '6px 15px',
        borderRadius: 20, fontSize: 14,
      }}>
        골프공을 터치하여 요소를 배치하세요
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 레이어 패널 작성**

Create `src/renderer/components/editor/LayerPanel.tsx`:
```tsx
import React from 'react';
import { useDesignStore } from '../../stores/designStore';

export default function LayerPanel() {
  const elements = useDesignStore((s) => s.elements);
  const selectedId = useDesignStore((s) => s.selectedId);
  const selectElement = useDesignStore((s) => s.selectElement);
  const removeElement = useDesignStore((s) => s.removeElement);
  const moveElementUp = useDesignStore((s) => s.moveElementUp);
  const moveElementDown = useDesignStore((s) => s.moveElementDown);

  const icons: Record<string, string> = { text: '✏️', image: '🖼️', character: '😀' };

  return (
    <div style={{ width: 220, background: '#fff', borderLeft: '1px solid #ddd', padding: 15, overflowY: 'auto' }}>
      <div style={{ fontWeight: 'bold', color: '#333', fontSize: 14, marginBottom: 12 }}>레이어</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {elements.map((el) => (
          <div
            key={el.id}
            onClick={() => selectElement(el.id)}
            style={{
              background: selectedId === el.id ? '#f0edff' : '#f8f9fa',
              border: `1px solid ${selectedId === el.id ? '#6c63ff' : '#ddd'}`,
              borderRadius: 6, padding: 10, display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            <span>{icons[el.type] || '📦'}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 'bold', color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {el.type === 'text' ? (el.text || '텍스트') : el.type === 'character' ? '캐릭터' : '이미지'}
              </div>
              <div style={{ fontSize: 10, color: '#888' }}>{el.type}</div>
            </div>
          </div>
        ))}
      </div>

      {selectedId && (
        <div style={{ marginTop: 20, paddingTop: 15, borderTop: '1px solid #eee' }}>
          <div style={{ fontWeight: 'bold', color: '#333', fontSize: 13, marginBottom: 8 }}>레이어 조작</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => moveElementUp(selectedId)}
              style={{ flex: 1, background: '#f0f0f0', padding: 8, borderRadius: 4, fontSize: 11, color: '#333' }}>↑ 위로</button>
            <button onClick={() => moveElementDown(selectedId)}
              style={{ flex: 1, background: '#f0f0f0', padding: 8, borderRadius: 4, fontSize: 11, color: '#333' }}>↓ 아래</button>
            <button onClick={() => removeElement(selectedId)}
              style={{ flex: 1, background: '#ffe0e0', padding: 8, borderRadius: 4, fontSize: 11, color: '#e74c3c' }}>🗑️</button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: 디자인 편집기 페이지 작성**

Create `src/renderer/pages/DesignEditorPage.tsx`:
```tsx
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TopBar from '../components/common/TopBar';
import GolfBallCanvas from '../components/editor/GolfBallCanvas';
import LayerPanel from '../components/editor/LayerPanel';
import { useDesignStore } from '../stores/designStore';

export default function DesignEditorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const productType = (location.state as any)?.productType || 'golf_ball';
  const setProductType = useDesignStore((s) => s.setProductType);
  const clearAll = useDesignStore((s) => s.clearAll);
  const elements = useDesignStore((s) => s.elements);

  useEffect(() => {
    setProductType(productType);
  }, [productType]);

  const handleNext = () => {
    if (elements.length === 0) return;
    navigate('/preview');
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <TopBar
        title={productType === 'golf_ball' ? '골프공 디자인' : '스티커 디자인'}
        rightContent={<>
          <button onClick={clearAll} style={{
            background: '#636e72', color: '#fff', padding: '8px 20px', borderRadius: 6, fontSize: 14,
          }}>초기화</button>
          <button onClick={handleNext} style={{
            background: elements.length > 0 ? '#00b894' : '#555', color: '#fff',
            padding: '8px 25px', borderRadius: 6, fontSize: 14, fontWeight: 'bold',
          }}>다음 →</button>
        </>}
      />
      <div style={{ flex: 1, display: 'flex' }}>
        {/* Tool panel placeholder - Task 8 에서 구현 */}
        <div style={{
          width: 280, background: '#fff', borderRight: '1px solid #ddd',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#999', fontSize: 14,
        }}>
          도구 패널 (Task 8)
        </div>
        <GolfBallCanvas />
        <LayerPanel />
      </div>
    </div>
  );
}
```

- [ ] **Step 5: use-image 패키지 설치 및 App.tsx 라우트 연결**

```bash
npm install use-image
```

Modify `src/renderer/App.tsx`:
```tsx
import DesignEditorPage from './pages/DesignEditorPage';
// Route 교체:
<Route path="/editor" element={<DesignEditorPage />} />
```

- [ ] **Step 6: 커밋**

```bash
git add -A && git commit -m "feat: 디자인 편집기 - Konva 캔버스, 레이어 패널, 상태 관리"
```

---

### Task 8: 디자인 편집기 — 텍스트 도구 + 가상 키보드 + 도구 패널

**Files:**
- Create: `src/renderer/components/editor/TextTool.tsx`
- Create: `src/renderer/components/editor/ToolPanel.tsx`
- Create: `src/renderer/components/common/VirtualKeyboard.tsx`
- Modify: `src/renderer/pages/DesignEditorPage.tsx`

- [ ] **Step 1: 가상 키보드 컴포넌트 작성**

Create `src/renderer/components/common/VirtualKeyboard.tsx`:
```tsx
import React, { useRef, useEffect } from 'react';
import Keyboard from 'simple-keyboard';
import 'simple-keyboard/build/css/index.css';

interface VirtualKeyboardProps {
  onChange: (input: string) => void;
  initialValue?: string;
  visible: boolean;
}

export default function VirtualKeyboard({ onChange, initialValue = '', visible }: VirtualKeyboardProps) {
  const keyboardRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && visible) {
      keyboardRef.current = new Keyboard(containerRef.current, {
        onChange,
        layout: {
          default: [
            '1 2 3 4 5 6 7 8 9 0 {bksp}',
            'ㅂ ㅈ ㄷ ㄱ ㅅ ㅛ ㅕ ㅑ ㅐ ㅔ',
            'ㅁ ㄴ ㅇ ㄹ ㅎ ㅗ ㅓ ㅏ ㅣ',
            '{shift} ㅋ ㅌ ㅊ ㅍ ㅠ ㅜ ㅡ {shift}',
            '{space}',
          ],
          shift: [
            '! @ # $ % ^ & * ( ) {bksp}',
            'ㅃ ㅉ ㄸ ㄲ ㅆ ㅛ ㅕ ㅑ ㅒ ㅖ',
            'ㅁ ㄴ ㅇ ㄹ ㅎ ㅗ ㅓ ㅏ ㅣ',
            '{shift} ㅋ ㅌ ㅊ ㅍ ㅠ ㅜ ㅡ {shift}',
            '{space}',
          ],
        },
        display: { '{bksp}': '⌫', '{shift}': '⇧', '{space}': '스페이스' },
      });
      keyboardRef.current.setInput(initialValue);
    }
    return () => { keyboardRef.current?.destroy(); };
  }, [visible]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: '#2d3436', padding: 10, zIndex: 1000,
    }}>
      <div ref={containerRef} />
    </div>
  );
}
```

- [ ] **Step 2: 텍스트 도구 작성**

Create `src/renderer/components/editor/TextTool.tsx`:
```tsx
import React, { useState } from 'react';
import { useDesignStore } from '../../stores/designStore';

const COLORS = ['#000000', '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#ffffff'];
const FONTS = ['Nanum Gothic', 'Malgun Gothic', 'Arial', 'Georgia'];

export default function TextTool() {
  const [text, setText] = useState('');
  const [font, setFont] = useState('Nanum Gothic');
  const [fontSize, setFontSize] = useState(24);
  const [color, setColor] = useState('#000000');
  const addElement = useDesignStore((s) => s.addElement);
  const selectedId = useDesignStore((s) => s.selectedId);
  const elements = useDesignStore((s) => s.elements);
  const updateElement = useDesignStore((s) => s.updateElement);

  const selectedEl = elements.find((el) => el.id === selectedId && el.type === 'text');

  const handleAdd = () => {
    if (!text.trim()) return;
    addElement({
      id: `text-${Date.now()}`,
      type: 'text',
      x: 180, y: 220,
      width: 0, height: 0,
      rotation: 0,
      text, fontFamily: font, fontSize, fill: color,
    });
    setText('');
  };

  const handleUpdate = () => {
    if (!selectedId || !selectedEl) return;
    updateElement(selectedId, { text, fontFamily: font, fontSize, fill: color });
  };

  React.useEffect(() => {
    if (selectedEl) {
      setText(selectedEl.text || '');
      setFont(selectedEl.fontFamily || 'Nanum Gothic');
      setFontSize(selectedEl.fontSize || 24);
      setColor(selectedEl.fill || '#000000');
    }
  }, [selectedId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <div style={{ color: '#888', fontSize: 11, marginBottom: 4 }}>내용</div>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="텍스트 입력"
          style={{
            width: '100%', padding: 10, fontSize: 14, borderRadius: 6,
            border: '1px solid #ddd', background: '#fafafa', color: '#333',
          }}
        />
      </div>

      <div>
        <div style={{ color: '#888', fontSize: 11, marginBottom: 4 }}>폰트</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {FONTS.map((f) => (
            <button key={f} onClick={() => setFont(f)} style={{
              background: font === f ? '#6c63ff' : '#f0f0f0',
              color: font === f ? '#fff' : '#555',
              padding: '5px 10px', borderRadius: 4, fontSize: 11, fontFamily: f,
            }}>{f}</button>
          ))}
        </div>
      </div>

      <div>
        <div style={{ color: '#888', fontSize: 11, marginBottom: 4 }}>크기: {fontSize}px</div>
        <input type="range" min={12} max={72} value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
          style={{ width: '100%' }} />
      </div>

      <div>
        <div style={{ color: '#888', fontSize: 11, marginBottom: 4 }}>색상</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {COLORS.map((c) => (
            <div key={c} onClick={() => setColor(c)} style={{
              width: 28, height: 28, background: c, borderRadius: '50%',
              border: color === c ? '3px solid #6c63ff' : '1px solid #ccc', cursor: 'none',
            }} />
          ))}
        </div>
      </div>

      <button onClick={selectedEl ? handleUpdate : handleAdd} style={{
        background: '#6c63ff', color: '#fff', padding: 12, borderRadius: 8,
        fontSize: 14, fontWeight: 'bold', marginTop: 8,
      }}>
        {selectedEl ? '수정 적용' : '텍스트 추가'}
      </button>
    </div>
  );
}
```

- [ ] **Step 3: 도구 패널 작성**

Create `src/renderer/components/editor/ToolPanel.tsx`:
```tsx
import React, { useState } from 'react';
import TextTool from './TextTool';

type ToolType = 'text' | 'image' | 'character';

export default function ToolPanel() {
  const [activeTool, setActiveTool] = useState<ToolType>('text');

  const tools: { key: ToolType; icon: string; label: string }[] = [
    { key: 'text', icon: '✏️', label: '텍스트' },
    { key: 'image', icon: '🖼️', label: '이미지' },
    { key: 'character', icon: '😀', label: '캐릭터' },
  ];

  return (
    <div style={{
      width: 280, background: '#fff', borderRight: '1px solid #ddd',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ padding: 15, borderBottom: '1px solid #eee' }}>
        <div style={{ fontWeight: 'bold', color: '#333', fontSize: 14, marginBottom: 10 }}>도구 선택</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {tools.map((t) => (
            <button key={t.key} onClick={() => setActiveTool(t.key)} style={{
              background: activeTool === t.key ? '#6c63ff' : '#f8f9fa',
              color: activeTool === t.key ? '#fff' : '#333',
              padding: '12px 5px', borderRadius: 8, textAlign: 'center',
              fontSize: 11, border: activeTool === t.key ? 'none' : '1px solid #ddd',
            }}>
              <div style={{ fontSize: 20 }}>{t.icon}</div>{t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: 15, flex: 1, overflowY: 'auto' }}>
        {activeTool === 'text' && <TextTool />}
        {activeTool === 'image' && <div style={{ color: '#999' }}>이미지 도구 (Task 9)</div>}
        {activeTool === 'character' && <div style={{ color: '#999' }}>캐릭터 도구 (Task 10)</div>}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: DesignEditorPage에 ToolPanel 연결**

Modify `src/renderer/pages/DesignEditorPage.tsx` — placeholder div를 교체:
```tsx
import ToolPanel from '../components/editor/ToolPanel';

// 기존 "도구 패널 (Task 8)" placeholder div를 교체:
<ToolPanel />
```

- [ ] **Step 5: 커밋**

```bash
git add -A && git commit -m "feat: 텍스트 도구, 가상 키보드, 도구 패널 구현"
```

---

### Task 9: 디자인 편집기 — 이미지 도구 (USB 메모리)

**Files:**
- Create: `src/renderer/components/editor/ImageTool.tsx`
- Create: `src/main/hardware/usb-monitor.ts`, `src/main/ipc/usb.ts`
- Modify: `src/renderer/components/editor/ToolPanel.tsx`

- [ ] **Step 1: USB 메모리 감지 모듈 작성**

```bash
npm install drivelist
```

Create `src/main/hardware/usb-monitor.ts`:
```ts
import { list as listDrives } from 'drivelist';
import fs from 'fs';
import path from 'path';

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.bmp', '.gif'];

export async function getRemovableDrives(): Promise<string[]> {
  const drives = await listDrives();
  const removable: string[] = [];
  for (const drive of drives) {
    if (drive.isRemovable && drive.mountpoints.length > 0) {
      removable.push(drive.mountpoints[0].path);
    }
  }
  return removable;
}

export function listImagesOnDrive(drivePath: string): { path: string; name: string; size: number }[] {
  const results: { path: string; name: string; size: number }[] = [];

  function walk(dir: string, depth: number) {
    if (depth > 3) return; // max 3 depth
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && !entry.name.startsWith('.')) {
          walk(fullPath, depth + 1);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (IMAGE_EXTENSIONS.includes(ext)) {
            const stat = fs.statSync(fullPath);
            results.push({ path: fullPath, name: entry.name, size: stat.size });
          }
        }
      }
    } catch { /* skip inaccessible dirs */ }
  }

  walk(drivePath, 0);
  return results;
}
```

- [ ] **Step 2: USB IPC 핸들러 작성**

Create `src/main/ipc/usb.ts`:
```ts
import { ipcMain } from 'electron';
import fs from 'fs';
import { getRemovableDrives, listImagesOnDrive } from '../hardware/usb-monitor';

export function registerUsbIpc(): void {
  ipcMain.handle('usb:list-images', async () => {
    const drives = await getRemovableDrives();
    const allImages: { path: string; name: string; size: number }[] = [];
    for (const drive of drives) {
      allImages.push(...listImagesOnDrive(drive));
    }
    return allImages;
  });

  ipcMain.handle('usb:read-image', async (_event, filePath: string) => {
    const data = fs.readFileSync(filePath);
    const ext = filePath.split('.').pop()?.toLowerCase() || 'png';
    const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : `image/${ext}`;
    return `data:${mime};base64,${data.toString('base64')}`;
  });
}
```

- [ ] **Step 3: Main Process에 USB IPC 등록**

Modify `src/main/index.ts`:
```ts
import { registerUsbIpc } from './ipc/usb';
// createWindow 내부에:
registerUsbIpc();
```

- [ ] **Step 4: 이미지 도구 컴포넌트 작성**

Create `src/renderer/components/editor/ImageTool.tsx`:
```tsx
import React, { useState } from 'react';
import { useDesignStore } from '../../stores/designStore';
import { useIpc } from '../../hooks/useIpc';

export default function ImageTool() {
  const [images, setImages] = useState<{ path: string; name: string; size: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const addElement = useDesignStore((s) => s.addElement);
  const api = useIpc();

  const handleScan = async () => {
    setLoading(true);
    const list = await api.listUsbImages();
    setImages(list);
    setLoading(false);
  };

  const handleSelect = async (img: { path: string; name: string }) => {
    const dataUrl = await api.readUsbImage(img.path);
    addElement({
      id: `img-${Date.now()}`,
      type: 'image',
      x: 150, y: 150,
      width: 100, height: 100,
      rotation: 0,
      src: dataUrl,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <button onClick={handleScan} style={{
        background: '#6c63ff', color: '#fff', padding: 12, borderRadius: 8,
        fontSize: 14, fontWeight: 'bold',
      }}>
        {loading ? '검색 중...' : '📁 USB에서 이미지 가져오기'}
      </button>

      {images.length === 0 && !loading && (
        <div style={{ color: '#888', fontSize: 13, textAlign: 'center', padding: 20 }}>
          USB 메모리를 삽입 후<br/>위 버튼을 눌러 이미지를 검색하세요
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, maxHeight: 400, overflowY: 'auto' }}>
        {images.map((img) => (
          <button key={img.path} onClick={() => handleSelect(img)} style={{
            background: '#f8f9fa', borderRadius: 8, padding: 8, textAlign: 'center',
            border: '1px solid #ddd',
          }}>
            <div style={{ fontSize: 11, color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {img.name}
            </div>
            <div style={{ fontSize: 10, color: '#888' }}>{(img.size / 1024).toFixed(0)}KB</div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: ToolPanel에 ImageTool 연결**

Modify `src/renderer/components/editor/ToolPanel.tsx`:
```tsx
import ImageTool from './ImageTool';
// activeTool === 'image' 부분을:
{activeTool === 'image' && <ImageTool />}
```

- [ ] **Step 6: 커밋**

```bash
git add -A && git commit -m "feat: 이미지 도구 + USB 메모리 감지/읽기 구현"
```

---

### Task 10: 디자인 편집기 — 캐릭터 도구

**Files:**
- Create: `src/renderer/components/editor/CharacterTool.tsx`
- Create: `src/renderer/assets/characters/` (샘플 파일)
- Modify: `src/renderer/components/editor/ToolPanel.tsx`

- [ ] **Step 1: 캐릭터 도구 작성**

Create `src/renderer/components/editor/CharacterTool.tsx`:
```tsx
import React, { useEffect, useState } from 'react';
import { useDesignStore } from '../../stores/designStore';
import { useIpc } from '../../hooks/useIpc';

interface Character {
  id: number;
  name: string;
  category: string;
  image_path: string;
}

export default function CharacterTool() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [category, setCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const addElement = useDesignStore((s) => s.addElement);
  const api = useIpc();

  useEffect(() => {
    api.dbQuery('SELECT * FROM characters WHERE is_active = 1 ORDER BY sort_order').then((rows: any) => {
      setCharacters(rows);
      const cats = [...new Set(rows.map((r: Character) => r.category))] as string[];
      setCategories(cats);
    });
  }, []);

  const filtered = category === 'all' ? characters : characters.filter((c) => c.category === category);

  const handleSelect = (char: Character) => {
    addElement({
      id: `char-${Date.now()}`,
      type: 'character',
      x: 180, y: 180,
      width: 80, height: 80,
      rotation: 0,
      src: char.image_path,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <button onClick={() => setCategory('all')} style={{
          background: category === 'all' ? '#6c63ff' : '#f0f0f0',
          color: category === 'all' ? '#fff' : '#555',
          padding: '5px 12px', borderRadius: 15, fontSize: 12,
        }}>전체</button>
        {categories.map((cat) => (
          <button key={cat} onClick={() => setCategory(cat)} style={{
            background: category === cat ? '#6c63ff' : '#f0f0f0',
            color: category === cat ? '#fff' : '#555',
            padding: '5px 12px', borderRadius: 15, fontSize: 12,
          }}>{cat}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, maxHeight: 450, overflowY: 'auto' }}>
        {filtered.map((char) => (
          <button key={char.id} onClick={() => handleSelect(char)} style={{
            background: '#f8f9fa', borderRadius: 8, padding: 10, textAlign: 'center',
            border: '1px solid #ddd', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          }}>
            <img src={char.image_path} alt={char.name}
              style={{ width: 50, height: 50, objectFit: 'contain' }} />
            <div style={{ fontSize: 10, color: '#555' }}>{char.name}</div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ color: '#888', fontSize: 13, textAlign: 'center', padding: 20 }}>
          등록된 캐릭터가 없습니다.<br/>관리자 모드에서 캐릭터를 추가하세요.
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: ToolPanel에 CharacterTool 연결**

Modify `src/renderer/components/editor/ToolPanel.tsx`:
```tsx
import CharacterTool from './CharacterTool';
// activeTool === 'character' 부분을:
{activeTool === 'character' && <CharacterTool />}
```

- [ ] **Step 3: 커밋**

```bash
git add -A && git commit -m "feat: 캐릭터 도구 - DB 기반 캐릭터 선택 및 배치"
```

---

### Task 11: 미리보기 + 완료 화면 + 주문 스토어

**Files:**
- Create: `src/renderer/stores/orderStore.ts`
- Create: `src/renderer/pages/PreviewPage.tsx`
- Create: `src/renderer/pages/CompletePage.tsx`

- [ ] **Step 1: 주문 상태 스토어 작성**

Create `src/renderer/stores/orderStore.ts`:
```ts
import { create } from 'zustand';

interface OrderState {
  orderId: number | null;
  productType: 'golf_ball' | 'sticker';
  amount: number;
  designDataJson: string;
  transactionId: string;
  approvalNo: string;
  setOrder: (data: Partial<OrderState>) => void;
  reset: () => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  orderId: null,
  productType: 'golf_ball',
  amount: 0,
  designDataJson: '{}',
  transactionId: '',
  approvalNo: '',
  setOrder: (data) => set((s) => ({ ...s, ...data })),
  reset: () => set({
    orderId: null, productType: 'golf_ball', amount: 0,
    designDataJson: '{}', transactionId: '', approvalNo: '',
  }),
}));
```

- [ ] **Step 2: 미리보기 페이지 작성**

Create `src/renderer/pages/PreviewPage.tsx`:
```tsx
import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stage, Layer, Circle, Group, Text, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import TopBar from '../components/common/TopBar';
import { useDesignStore, DesignElement } from '../stores/designStore';
import { useOrderStore } from '../stores/orderStore';
import { useAppStore } from '../stores/appStore';

const PREVIEW_SIZE = 600;
const BALL_RADIUS = 260;
const SCALE = PREVIEW_SIZE / 500; // 캔버스 500 → 미리보기 600

function PreviewImage({ el }: { el: DesignElement }) {
  const [img] = useImage(el.src || '');
  return <KonvaImage image={img} x={el.x * SCALE} y={el.y * SCALE}
    width={el.width * SCALE} height={el.height * SCALE} rotation={el.rotation} />;
}

export default function PreviewPage() {
  const navigate = useNavigate();
  const elements = useDesignStore((s) => s.elements);
  const productType = useDesignStore((s) => s.productType);
  const settings = useAppStore((s) => s.settings);
  const setOrder = useOrderStore((s) => s.setOrder);
  const stageRef = useRef<any>(null);

  const price = productType === 'golf_ball'
    ? parseInt(settings.price_golf_ball || '5000', 10)
    : parseInt(settings.price_sticker || '3000', 10);

  const handlePay = () => {
    const designDataJson = JSON.stringify(elements);
    setOrder({ productType, amount: price, designDataJson });
    navigate('/payment');
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <TopBar title="인쇄 미리보기" />
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', gap: 60,
      }}>
        <Stage ref={stageRef} width={PREVIEW_SIZE} height={PREVIEW_SIZE}>
          <Layer>
            <Circle x={PREVIEW_SIZE / 2} y={PREVIEW_SIZE / 2} radius={BALL_RADIUS}
              fill="#f5f5f5" shadowColor="rgba(0,0,0,0.3)" shadowBlur={30} shadowOffset={{ x: 8, y: 8 }} />
            <Group clipFunc={(ctx: any) => {
              ctx.arc(PREVIEW_SIZE / 2, PREVIEW_SIZE / 2, BALL_RADIUS, 0, Math.PI * 2);
            }}>
              {elements.map((el) => {
                if (el.type === 'text') {
                  return <Text key={el.id} text={el.text} x={el.x * SCALE} y={el.y * SCALE}
                    fontSize={(el.fontSize || 24) * SCALE} fontFamily={el.fontFamily}
                    fill={el.fill} rotation={el.rotation} />;
                }
                return <PreviewImage key={el.id} el={el} />;
              })}
            </Group>
          </Layer>
        </Stage>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 'bold' }}>
            {productType === 'golf_ball' ? '⛳ 골프공 인쇄' : '✂️ 스티커 커팅'}
          </div>
          <div style={{ fontSize: 48, fontWeight: 'bold', color: '#6c63ff' }}>
            {price.toLocaleString()}원
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            <button onClick={() => navigate('/editor', { state: { productType } })} style={{
              padding: '16px 40px', fontSize: 20, borderRadius: 12,
              background: '#636e72', color: '#fff',
            }}>← 수정하기</button>
            <button onClick={handlePay} style={{
              padding: '16px 40px', fontSize: 20, borderRadius: 12,
              background: '#6c63ff', color: '#fff', fontWeight: 'bold',
            }}>결제하기 →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 완료 페이지 작성**

Create `src/renderer/pages/CompletePage.tsx`:
```tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../stores/appStore';
import { useDesignStore } from '../stores/designStore';
import { useOrderStore } from '../stores/orderStore';

export default function CompletePage() {
  const navigate = useNavigate();
  const settings = useAppStore((s) => s.settings);
  const clearAll = useDesignStore((s) => s.clearAll);
  const resetOrder = useOrderStore((s) => s.reset);
  const timeout = parseInt(settings.complete_timeout || '10', 10) * 1000;

  useEffect(() => {
    const timer = setTimeout(() => {
      clearAll();
      resetOrder();
      navigate('/');
    }, timeout);
    return () => clearTimeout(timer);
  }, []);

  const handleHome = () => {
    clearAll();
    resetOrder();
    navigate('/');
  };

  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', gap: 30,
    }}>
      <div style={{ fontSize: 120 }}>✅</div>
      <div style={{ fontSize: 48, fontWeight: 'bold' }}>인쇄가 완료되었습니다!</div>
      <div style={{ fontSize: 24, color: '#aaa' }}>골프공을 수령해 주세요</div>
      <button onClick={handleHome} style={{
        marginTop: 30, padding: '16px 50px', fontSize: 20, borderRadius: 12,
        background: '#6c63ff', color: '#fff', fontWeight: 'bold',
      }}>처음으로</button>
      <div style={{ fontSize: 14, color: '#666', marginTop: 10 }}>
        {Math.round(timeout / 1000)}초 후 자동으로 처음 화면으로 돌아갑니다
      </div>
    </div>
  );
}
```

- [ ] **Step 4: App.tsx 라우트 연결**

Modify `src/renderer/App.tsx`:
```tsx
import PreviewPage from './pages/PreviewPage';
import CompletePage from './pages/CompletePage';
// Routes:
<Route path="/preview" element={<PreviewPage />} />
<Route path="/complete" element={<CompletePage />} />
```

- [ ] **Step 5: 커밋**

```bash
git add -A && git commit -m "feat: 미리보기, 완료 화면, 주문 스토어 구현"
```

---

### Task 12: 인쇄 진행 화면 + 프린터 하드웨어 스텁

**Files:**
- Create: `src/main/hardware/printer.ts`, `src/main/ipc/printer.ts`
- Create: `src/renderer/pages/PrintingPage.tsx`

- [ ] **Step 1: 프린터 하드웨어 스텁 작성**

Create `src/main/hardware/printer.ts`:
```ts
// 실제 프린터 연동은 프린터 모델 확인 후 구현.
// 현재는 Windows 프린터 드라이버 기반 스텁.

export interface PrintResult {
  success: boolean;
  error?: string;
}

export async function printImage(imageDataUrl: string, printerName: string): Promise<PrintResult> {
  // TODO: 실제 프린터 모델 확인 후 win32-api 또는 프린터 SDK 연동
  // 개발/테스트 시에는 시뮬레이션으로 동작
  console.log(`[Printer] Printing to "${printerName}", image size: ${imageDataUrl.length} bytes`);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 3000); // 3초 시뮬레이션
  });
}

export function getPrinterStatus(printerName: string): { connected: boolean; status: string } {
  // TODO: 실제 프린터 상태 조회
  return { connected: printerName !== '', status: printerName ? 'ready' : 'not_configured' };
}
```

- [ ] **Step 2: 프린터 IPC 핸들러 작성**

Create `src/main/ipc/printer.ts`:
```ts
import { ipcMain, BrowserWindow } from 'electron';
import { printImage, getPrinterStatus } from '../hardware/printer';
import { getDb } from '../database/connection';

export function registerPrinterIpc(): void {
  ipcMain.handle('printer:print', async (_event, imageDataUrl: string) => {
    const db = getDb();
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('printer_name') as { value: string } | undefined;
    const printerName = row?.value || '';

    const result = await printImage(imageDataUrl, printerName);

    // 인쇄 상태를 Renderer에 알림
    const win = BrowserWindow.getAllWindows()[0];
    if (win) {
      win.webContents.send('printer:status', result);
    }

    return result;
  });

  ipcMain.handle('printer:status', () => {
    const db = getDb();
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('printer_name') as { value: string } | undefined;
    return getPrinterStatus(row?.value || '');
  });
}
```

- [ ] **Step 3: Main Process에 프린터 IPC 등록**

Modify `src/main/index.ts`:
```ts
import { registerPrinterIpc } from './ipc/printer';
// createWindow 내부에:
registerPrinterIpc();
```

- [ ] **Step 4: 인쇄 진행 페이지 작성**

Create `src/renderer/pages/PrintingPage.tsx`:
```tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIpc } from '../hooks/useIpc';
import { useOrderStore } from '../stores/orderStore';

type PrintPhase = 'prepare' | 'printing' | 'done' | 'error';

export default function PrintingPage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<PrintPhase>('prepare');
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const orderId = useOrderStore((s) => s.orderId);
  const designDataJson = useOrderStore((s) => s.designDataJson);
  const api = useIpc();

  useEffect(() => {
    let cancelled = false;

    async function runPrint() {
      // Phase 1: 준비
      setPhase('prepare');
      await new Promise((r) => setTimeout(r, 1500));
      if (cancelled) return;

      // Phase 2: 인쇄
      setPhase('printing');
      const progressInterval = setInterval(() => {
        setProgress((p) => Math.min(p + 10, 90));
      }, 300);

      const result = await api.printImage(designDataJson);
      clearInterval(progressInterval);

      if (cancelled) return;

      if (result.success) {
        setProgress(100);
        setPhase('done');
        // DB에 인쇄 완료 기록
        if (orderId) {
          await api.dbExecute(
            "UPDATE orders SET print_status = 'completed', completed_at = datetime('now','localtime') WHERE id = ?",
            [orderId]
          );
          await api.dbExecute(
            "INSERT INTO print_logs (order_id, status, message) VALUES (?, 'completed', '인쇄 완료')",
            [orderId]
          );
        }
        setTimeout(() => navigate('/complete'), 1000);
      } else {
        setPhase('error');
        setErrorMsg(result.error || '인쇄 중 오류가 발생했습니다.');
        if (orderId) {
          await api.dbExecute("UPDATE orders SET print_status = 'failed' WHERE id = ?", [orderId]);
          await api.dbExecute(
            "INSERT INTO print_logs (order_id, status, message) VALUES (?, 'error', ?)",
            [orderId, result.error || 'unknown error']
          );
        }
      }
    }

    runPrint();
    return () => { cancelled = true; };
  }, []);

  const messages: Record<PrintPhase, string> = {
    prepare: '골프공을 인쇄대에 올려주세요...',
    printing: '인쇄 중입니다. 잠시만 기다려주세요...',
    done: '인쇄가 완료되었습니다!',
    error: errorMsg,
  };

  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', gap: 30,
    }}>
      <div style={{ fontSize: 80 }}>
        {phase === 'error' ? '❌' : phase === 'done' ? '✅' : '🖨️'}
      </div>
      <div style={{ fontSize: 32, fontWeight: 'bold' }}>{messages[phase]}</div>

      {(phase === 'prepare' || phase === 'printing') && (
        <div style={{ width: 500, height: 12, background: '#0f3460', borderRadius: 6, overflow: 'hidden' }}>
          <div style={{
            height: '100%', background: '#6c63ff', borderRadius: 6,
            width: `${progress}%`, transition: 'width 0.3s',
          }} />
        </div>
      )}

      {phase === 'error' && (
        <div style={{ display: 'flex', gap: 20, marginTop: 20 }}>
          <button onClick={() => navigate('/')} style={{
            padding: '14px 30px', fontSize: 18, borderRadius: 10,
            background: '#636e72', color: '#fff',
          }}>처음으로</button>
          <div style={{ fontSize: 16, color: '#e94560', marginTop: 20 }}>
            관리자를 호출해 주세요
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: App.tsx 라우트 연결 및 커밋**

```tsx
import PrintingPage from './pages/PrintingPage';
<Route path="/printing" element={<PrintingPage />} />
```

```bash
git add -A && git commit -m "feat: 인쇄 진행 화면 + 프린터 하드웨어 스텁"
```

---

### Task 13: 결제 화면 + KICC 결제 스텁

**Files:**
- Create: `src/main/hardware/payment.ts`, `src/main/ipc/payment.ts`
- Create: `src/renderer/pages/PaymentPage.tsx`

- [ ] **Step 1: KICC 결제 하드웨어 스텁 작성**

Create `src/main/hardware/payment.ts`:
```ts
// KICC 결제 연동 스텁 — 실제 DLL/에이전트 연동은 KICC SDK 확보 후 구현

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  approvalNo?: string;
  error?: string;
}

export async function requestPayment(amount: number): Promise<PaymentResult> {
  console.log(`[Payment] Requesting KICC payment: ${amount}원`);

  // TODO: KICC DLL 호출 또는 에이전트 TCP 통신
  return new Promise((resolve) => {
    setTimeout(() => {
      const txId = `TX${Date.now()}`;
      const approvalNo = `AP${Math.floor(Math.random() * 900000 + 100000)}`;
      resolve({ success: true, transactionId: txId, approvalNo });
    }, 3000);
  });
}

export async function cancelPayment(transactionId: string): Promise<{ success: boolean; error?: string }> {
  console.log(`[Payment] Cancelling: ${transactionId}`);
  return new Promise((resolve) => {
    setTimeout(() => resolve({ success: true }), 1500);
  });
}
```

- [ ] **Step 2: 결제 IPC 핸들러 작성**

Create `src/main/ipc/payment.ts`:
```ts
import { ipcMain, BrowserWindow } from 'electron';
import { requestPayment, cancelPayment } from '../hardware/payment';

export function registerPaymentIpc(): void {
  ipcMain.handle('payment:request', async (_event, amount: number) => {
    const result = await requestPayment(amount);
    const win = BrowserWindow.getAllWindows()[0];
    if (win) win.webContents.send('payment:result', result);
    return result;
  });

  ipcMain.handle('payment:cancel', async (_event, transactionId: string) => {
    return cancelPayment(transactionId);
  });
}
```

- [ ] **Step 3: Main Process에 결제 IPC 등록**

Modify `src/main/index.ts`:
```ts
import { registerPaymentIpc } from './ipc/payment';
registerPaymentIpc();
```

- [ ] **Step 4: 결제 페이지 작성**

Create `src/renderer/pages/PaymentPage.tsx`:
```tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/common/TopBar';
import { useOrderStore } from '../stores/orderStore';
import { useIpc } from '../hooks/useIpc';

type PayPhase = 'waiting' | 'processing' | 'success' | 'failed';

export default function PaymentPage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<PayPhase>('waiting');
  const [retryCount, setRetryCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const { amount, productType, designDataJson, setOrder } = useOrderStore();
  const api = useIpc();

  const processPayment = async () => {
    setPhase('processing');
    const result = await api.requestPayment(amount);

    if (result.success) {
      setPhase('success');
      // DB에 주문 생성
      const dbResult = await api.dbExecute(
        `INSERT INTO orders (product_type, design_data, amount, payment_status, kicc_transaction_id, kicc_approval_no)
         VALUES (?, ?, ?, 'completed', ?, ?)`,
        [productType, designDataJson, amount, result.transactionId, result.approvalNo]
      );
      setOrder({
        orderId: dbResult.lastInsertRowid,
        transactionId: result.transactionId || '',
        approvalNo: result.approvalNo || '',
      });
      setTimeout(() => navigate('/printing'), 1500);
    } else {
      setPhase('failed');
      setErrorMsg(result.error || '결제에 실패했습니다.');
      setRetryCount((c) => c + 1);
    }
  };

  useEffect(() => {
    const timer = setTimeout(processPayment, 1000);
    return () => clearTimeout(timer);
  }, []);

  // 60초 타임아웃
  useEffect(() => {
    if (phase !== 'waiting' && phase !== 'processing') return;
    const timeout = setTimeout(() => {
      if (phase === 'waiting' || phase === 'processing') {
        setPhase('failed');
        setErrorMsg('결제 시간이 초과되었습니다.');
      }
    }, 60000);
    return () => clearTimeout(timeout);
  }, [phase]);

  const handleRetry = () => {
    if (retryCount >= 3) {
      navigate('/');
      return;
    }
    setPhase('waiting');
    setTimeout(processPayment, 500);
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <TopBar title="결제" showBack={phase === 'waiting' || phase === 'failed'} />
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', gap: 30,
      }}>
        <div style={{ fontSize: 36, fontWeight: 'bold', color: '#ffd700' }}>
          {amount.toLocaleString()}원
        </div>

        {phase === 'waiting' && <>
          <div style={{ fontSize: 80 }}>💳</div>
          <div style={{ fontSize: 28 }}>카드를 결제기에 투입해주세요</div>
        </>}

        {phase === 'processing' && <>
          <div style={{ fontSize: 80, animation: 'pulse 1s infinite' }}>⏳</div>
          <div style={{ fontSize: 28 }}>결제 처리 중...</div>
        </>}

        {phase === 'success' && <>
          <div style={{ fontSize: 80 }}>✅</div>
          <div style={{ fontSize: 28, color: '#00b894' }}>결제가 완료되었습니다!</div>
        </>}

        {phase === 'failed' && <>
          <div style={{ fontSize: 80 }}>❌</div>
          <div style={{ fontSize: 24, color: '#e94560' }}>{errorMsg}</div>
          <div style={{ display: 'flex', gap: 20, marginTop: 20 }}>
            <button onClick={() => navigate('/')} style={{
              padding: '14px 30px', fontSize: 18, borderRadius: 10, background: '#636e72', color: '#fff',
            }}>취소</button>
            {retryCount < 3 && (
              <button onClick={handleRetry} style={{
                padding: '14px 30px', fontSize: 18, borderRadius: 10, background: '#6c63ff', color: '#fff',
              }}>재시도 ({3 - retryCount}회 남음)</button>
            )}
          </div>
        </>}
      </div>
      <style>{`@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }`}</style>
    </div>
  );
}
```

- [ ] **Step 5: App.tsx 라우트 연결 및 커밋**

```tsx
import PaymentPage from './pages/PaymentPage';
<Route path="/payment" element={<PaymentPage />} />
```

```bash
git add -A && git commit -m "feat: 결제 화면 + KICC 결제 스텁 구현"
```

---

### Task 14: 커팅기 하드웨어 스텁

**Files:**
- Create: `src/main/hardware/cutter.ts`, `src/main/ipc/cutter.ts`

- [ ] **Step 1: 커팅기 스텁 + IPC 작성**

Create `src/main/hardware/cutter.ts`:
```ts
export async function cutDesign(designData: string, port: string): Promise<{ success: boolean; error?: string }> {
  console.log(`[Cutter] Cutting on port ${port}, data size: ${designData.length}`);
  // TODO: 커팅기 제조사 SDK 연동
  return new Promise((resolve) => {
    setTimeout(() => resolve({ success: true }), 2000);
  });
}

export function getCutterStatus(port: string): { connected: boolean; status: string } {
  return { connected: port !== '', status: port ? 'ready' : 'not_configured' };
}
```

Create `src/main/ipc/cutter.ts`:
```ts
import { ipcMain } from 'electron';
import { cutDesign, getCutterStatus } from '../hardware/cutter';
import { getDb } from '../database/connection';

export function registerCutterIpc(): void {
  ipcMain.handle('cutter:cut', async (_event, designData: string) => {
    const db = getDb();
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('cutter_port') as { value: string } | undefined;
    return cutDesign(designData, row?.value || '');
  });

  ipcMain.handle('cutter:status', () => {
    const db = getDb();
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('cutter_port') as { value: string } | undefined;
    return getCutterStatus(row?.value || '');
  });
}
```

- [ ] **Step 2: 하드웨어 상태 통합 IPC 추가**

Modify `src/main/index.ts` — registerCutterIpc 추가 및 hardware:status 핸들러 추가:
```ts
import { registerCutterIpc } from './ipc/cutter';
import { getPrinterStatus } from './hardware/printer';
import { getCutterStatus } from './hardware/cutter';

// createWindow 내부에:
registerCutterIpc();

ipcMain.handle('hardware:status', () => {
  const db = getDb();
  const printerName = (db.prepare('SELECT value FROM settings WHERE key = ?').get('printer_name') as any)?.value || '';
  const cutterPort = (db.prepare('SELECT value FROM settings WHERE key = ?').get('cutter_port') as any)?.value || '';
  return {
    printer: getPrinterStatus(printerName).connected,
    payment: true, // KICC 상태는 에이전트 연동 후 구현
    cutter: getCutterStatus(cutterPort).connected,
  };
});
```

- [ ] **Step 3: 커밋**

```bash
git add -A && git commit -m "feat: 커팅기 스텁 + 하드웨어 상태 통합 IPC"
```

---

### Task 15: 관리자 — 레이아웃 + 대시보드

**Files:**
- Create: `src/renderer/pages/admin/AdminLayout.tsx`
- Create: `src/renderer/pages/admin/AdminDashboard.tsx`

- [ ] **Step 1: 관리자 레이아웃 작성**

Create `src/renderer/pages/admin/AdminLayout.tsx`:
```tsx
import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/admin', label: '📊 대시보드', end: true },
  { path: '/admin/orders', label: '💰 결제 내역', end: false },
  { path: '/admin/pricing', label: '💲 가격 설정', end: false },
  { path: '/admin/hardware', label: '🔧 하드웨어', end: false },
  { path: '/admin/content', label: '🎨 콘텐츠', end: false },
  { path: '/admin/settings', label: '⚙️ 시스템 설정', end: false },
];

export default function AdminLayout() {
  const navigate = useNavigate();

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex' }}>
      {/* Sidebar */}
      <div style={{
        width: 240, background: '#0f3460', display: 'flex', flexDirection: 'column',
        padding: '20px 0',
      }}>
        <div style={{ padding: '0 20px 20px', fontSize: 18, fontWeight: 'bold', color: '#6c63ff' }}>
          🔧 관리자 모드
        </div>
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.path} to={item.path} end={item.end}
            style={({ isActive }) => ({
              display: 'block', padding: '14px 20px', fontSize: 15,
              color: isActive ? '#fff' : '#8899aa', textDecoration: 'none',
              background: isActive ? '#16213e' : 'transparent',
              borderLeft: isActive ? '3px solid #6c63ff' : '3px solid transparent',
            })}>
            {item.label}
          </NavLink>
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={() => navigate('/')} style={{
          margin: '0 20px', padding: 12, borderRadius: 8,
          background: '#e94560', color: '#fff', fontSize: 14,
        }}>
          키오스크 모드로 돌아가기
        </button>
      </div>
      {/* Content */}
      <div style={{ flex: 1, background: '#1a1a2e', overflowY: 'auto', padding: 30 }}>
        <Outlet />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 대시보드 페이지 작성**

Create `src/renderer/pages/admin/AdminDashboard.tsx`:
```tsx
import React, { useEffect, useState } from 'react';
import { useIpc } from '../../hooks/useIpc';

interface Stats {
  todaySales: number;
  todayCount: number;
  weekSales: number;
  weekCount: number;
  monthSales: number;
  monthCount: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ todaySales: 0, todayCount: 0, weekSales: 0, weekCount: 0, monthSales: 0, monthCount: 0 });
  const [hw, setHw] = useState({ printer: false, payment: false, cutter: false });
  const api = useIpc();

  useEffect(() => {
    async function load() {
      const today = await api.dbQuery(
        "SELECT COALESCE(SUM(amount),0) as sales, COUNT(*) as cnt FROM orders WHERE payment_status='completed' AND date(created_at)=date('now','localtime')"
      ) as any[];
      const week = await api.dbQuery(
        "SELECT COALESCE(SUM(amount),0) as sales, COUNT(*) as cnt FROM orders WHERE payment_status='completed' AND created_at >= datetime('now','localtime','-7 days')"
      ) as any[];
      const month = await api.dbQuery(
        "SELECT COALESCE(SUM(amount),0) as sales, COUNT(*) as cnt FROM orders WHERE payment_status='completed' AND created_at >= datetime('now','localtime','-30 days')"
      ) as any[];

      setStats({
        todaySales: today[0]?.sales || 0, todayCount: today[0]?.cnt || 0,
        weekSales: week[0]?.sales || 0, weekCount: week[0]?.cnt || 0,
        monthSales: month[0]?.sales || 0, monthCount: month[0]?.cnt || 0,
      });

      setHw(await api.getHardwareStatus());
    }
    load();
  }, []);

  const Card = ({ title, value, sub }: { title: string; value: string; sub: string }) => (
    <div style={{
      background: '#16213e', borderRadius: 12, padding: 20,
      border: '1px solid #0f3460', flex: 1,
    }}>
      <div style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 'bold', color: '#6c63ff' }}>{value}</div>
      <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{sub}</div>
    </div>
  );

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>대시보드</h1>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <Card title="오늘 매출" value={`${stats.todaySales.toLocaleString()}원`} sub={`${stats.todayCount}건`} />
        <Card title="주간 매출" value={`${stats.weekSales.toLocaleString()}원`} sub={`${stats.weekCount}건`} />
        <Card title="월간 매출" value={`${stats.monthSales.toLocaleString()}원`} sub={`${stats.monthCount}건`} />
      </div>

      <h2 style={{ fontSize: 18, marginBottom: 16 }}>하드웨어 상태</h2>
      <div style={{ display: 'flex', gap: 16 }}>
        {[
          { label: '프린터', ok: hw.printer },
          { label: 'KICC 결제기', ok: hw.payment },
          { label: '커팅기', ok: hw.cutter },
        ].map((h) => (
          <div key={h.label} style={{
            background: '#16213e', borderRadius: 12, padding: 16,
            border: `1px solid ${h.ok ? '#00b894' : '#e94560'}`, flex: 1, textAlign: 'center',
          }}>
            <div style={{ fontSize: 30 }}>{h.ok ? '✅' : '❌'}</div>
            <div style={{ fontSize: 14, marginTop: 8 }}>{h.label}</div>
            <div style={{ fontSize: 12, color: h.ok ? '#00b894' : '#e94560' }}>
              {h.ok ? '정상' : '연결 안됨'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: App.tsx 관리자 라우트 연결**

Modify `src/renderer/App.tsx`:
```tsx
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';

// Route 교체:
<Route path="/admin" element={<AdminLayout />}>
  <Route index element={<AdminDashboard />} />
</Route>
```

- [ ] **Step 4: 커밋**

```bash
git add -A && git commit -m "feat: 관리자 레이아웃 + 대시보드 (매출 통계, 하드웨어 상태)"
```

---

### Task 16: 관리자 — 결제 내역 + 가격 설정

**Files:**
- Create: `src/renderer/pages/admin/AdminOrders.tsx`
- Create: `src/renderer/pages/admin/AdminPricing.tsx`

- [ ] **Step 1: 결제 내역 페이지 작성**

Create `src/renderer/pages/admin/AdminOrders.tsx`:
```tsx
import React, { useEffect, useState } from 'react';
import { useIpc } from '../../hooks/useIpc';

interface Order {
  id: number; product_type: string; amount: number;
  payment_status: string; print_status: string; created_at: string;
  kicc_transaction_id: string; kicc_approval_no: string;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState('all');
  const api = useIpc();

  const load = async () => {
    const where = filter === 'all' ? '' : `WHERE payment_status = '${filter}'`;
    const rows = await api.dbQuery(
      `SELECT * FROM orders ${where} ORDER BY created_at DESC LIMIT 100`
    ) as Order[];
    setOrders(rows);
  };

  useEffect(() => { load(); }, [filter]);

  const handleRefund = async (order: Order) => {
    if (order.payment_status !== 'completed') return;
    const result = await api.cancelPayment(order.kicc_transaction_id);
    if (result.success) {
      await api.dbExecute(
        "UPDATE orders SET payment_status = 'refunded' WHERE id = ?", [order.id]
      );
      load();
    }
  };

  const statusColors: Record<string, string> = {
    completed: '#00b894', failed: '#e94560', refunded: '#fdcb6e', pending: '#888',
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>결제 내역</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['all', 'completed', 'failed', 'refunded'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '8px 16px', borderRadius: 8, fontSize: 13,
            background: filter === f ? '#6c63ff' : '#16213e', color: '#fff',
          }}>{f === 'all' ? '전체' : f === 'completed' ? '완료' : f === 'failed' ? '실패' : '환불'}</button>
        ))}
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #0f3460' }}>
            {['ID', '상품', '금액', '결제상태', '인쇄상태', '일시', ''].map((h) => (
              <th key={h} style={{ padding: 10, textAlign: 'left', fontSize: 13, color: '#888' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} style={{ borderBottom: '1px solid #0f3460' }}>
              <td style={{ padding: 10, fontSize: 13 }}>{o.id}</td>
              <td style={{ padding: 10, fontSize: 13 }}>{o.product_type === 'golf_ball' ? '골프공' : '스티커'}</td>
              <td style={{ padding: 10, fontSize: 13 }}>{o.amount.toLocaleString()}원</td>
              <td style={{ padding: 10, fontSize: 13, color: statusColors[o.payment_status] }}>{o.payment_status}</td>
              <td style={{ padding: 10, fontSize: 13 }}>{o.print_status}</td>
              <td style={{ padding: 10, fontSize: 13, color: '#888' }}>{o.created_at}</td>
              <td style={{ padding: 10 }}>
                {o.payment_status === 'completed' && (
                  <button onClick={() => handleRefund(o)} style={{
                    padding: '6px 12px', fontSize: 12, borderRadius: 6,
                    background: '#e94560', color: '#fff',
                  }}>환불</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 2: 가격 설정 페이지 작성**

Create `src/renderer/pages/admin/AdminPricing.tsx`:
```tsx
import React, { useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import { useIpc } from '../../hooks/useIpc';

export default function AdminPricing() {
  const settings = useAppStore((s) => s.settings);
  const updateSetting = useAppStore((s) => s.updateSetting);
  const [golfPrice, setGolfPrice] = useState(settings.price_golf_ball || '5000');
  const [stickerPrice, setStickerPrice] = useState(settings.price_sticker || '3000');
  const [saved, setSaved] = useState(false);
  const api = useIpc();

  const handleSave = async () => {
    await api.setSetting('price_golf_ball', golfPrice);
    await api.setSetting('price_sticker', stickerPrice);
    updateSetting('price_golf_ball', golfPrice);
    updateSetting('price_sticker', stickerPrice);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>가격 설정</h1>
      <div style={{ maxWidth: 500, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label style={{ fontSize: 14, color: '#888', display: 'block', marginBottom: 6 }}>골프공 인쇄 가격 (원)</label>
          <input type="number" value={golfPrice} onChange={(e) => setGolfPrice(e.target.value)}
            style={{ width: '100%', padding: 12, fontSize: 18, borderRadius: 8, border: '1px solid #0f3460', background: '#16213e', color: '#fff' }} />
        </div>
        <div>
          <label style={{ fontSize: 14, color: '#888', display: 'block', marginBottom: 6 }}>스티커 커팅 가격 (원)</label>
          <input type="number" value={stickerPrice} onChange={(e) => setStickerPrice(e.target.value)}
            style={{ width: '100%', padding: 12, fontSize: 18, borderRadius: 8, border: '1px solid #0f3460', background: '#16213e', color: '#fff' }} />
        </div>
        <button onClick={handleSave} style={{
          padding: 14, fontSize: 16, borderRadius: 8, background: '#6c63ff', color: '#fff', fontWeight: 'bold',
        }}>{saved ? '✅ 저장 완료!' : '저장'}</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: App.tsx 관리자 라우트 추가**

```tsx
import AdminOrders from './pages/admin/AdminOrders';
import AdminPricing from './pages/admin/AdminPricing';

// <Route path="/admin"> 내부에:
<Route path="orders" element={<AdminOrders />} />
<Route path="pricing" element={<AdminPricing />} />
```

- [ ] **Step 4: 커밋**

```bash
git add -A && git commit -m "feat: 관리자 결제 내역 (필터/환불) + 가격 설정"
```

---

### Task 17: 관리자 — 하드웨어 + 콘텐츠 + 시스템 설정

**Files:**
- Create: `src/renderer/pages/admin/AdminHardware.tsx`
- Create: `src/renderer/pages/admin/AdminContent.tsx`
- Create: `src/renderer/pages/admin/AdminSettings.tsx`

- [ ] **Step 1: 하드웨어 상태 페이지 작성**

Create `src/renderer/pages/admin/AdminHardware.tsx`:
```tsx
import React, { useEffect, useState } from 'react';
import { useIpc } from '../../hooks/useIpc';

export default function AdminHardware() {
  const [status, setStatus] = useState({ printer: false, payment: false, cutter: false });
  const api = useIpc();

  const refresh = async () => setStatus(await api.getHardwareStatus());
  useEffect(() => { refresh(); }, []);

  const devices = [
    { key: 'printer', label: '🖨️ USB 프린터', ok: status.printer },
    { key: 'payment', label: '💳 KICC 결제기', ok: status.payment },
    { key: 'cutter', label: '✂️ 커팅기', ok: status.cutter },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>하드웨어 상태</h1>
      <button onClick={refresh} style={{
        padding: '8px 20px', borderRadius: 8, background: '#6c63ff', color: '#fff', fontSize: 14, marginBottom: 20,
      }}>새로고침</button>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {devices.map((d) => (
          <div key={d.key} style={{
            background: '#16213e', borderRadius: 12, padding: 20,
            border: `1px solid ${d.ok ? '#00b894' : '#e94560'}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div style={{ fontSize: 18 }}>{d.label}</div>
            <div style={{ fontSize: 16, color: d.ok ? '#00b894' : '#e94560', fontWeight: 'bold' }}>
              {d.ok ? '✅ 연결됨' : '❌ 연결 안됨'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 콘텐츠 관리 페이지 작성**

Create `src/renderer/pages/admin/AdminContent.tsx`:
```tsx
import React, { useEffect, useState } from 'react';
import { useIpc } from '../../hooks/useIpc';

interface Character { id: number; name: string; category: string; image_path: string; is_active: number; }
interface Font { id: number; name: string; file_path: string; is_active: number; }

export default function AdminContent() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [fonts, setFonts] = useState<Font[]>([]);
  const api = useIpc();

  const loadData = async () => {
    setCharacters(await api.dbQuery('SELECT * FROM characters ORDER BY sort_order') as Character[]);
    setFonts(await api.dbQuery('SELECT * FROM fonts ORDER BY sort_order') as Font[]);
  };
  useEffect(() => { loadData(); }, []);

  const toggleChar = async (id: number, current: number) => {
    await api.dbExecute('UPDATE characters SET is_active = ? WHERE id = ?', [current ? 0 : 1, id]);
    loadData();
  };

  const deleteChar = async (id: number) => {
    await api.dbExecute('DELETE FROM characters WHERE id = ?', [id]);
    loadData();
  };

  const toggleFont = async (id: number, current: number) => {
    await api.dbExecute('UPDATE fonts SET is_active = ? WHERE id = ?', [current ? 0 : 1, id]);
    loadData();
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>콘텐츠 관리</h1>

      <h2 style={{ fontSize: 18, marginBottom: 12 }}>캐릭터 ({characters.length})</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 30 }}>
        {characters.map((c) => (
          <div key={c.id} style={{
            background: '#16213e', borderRadius: 8, padding: 12, textAlign: 'center',
            opacity: c.is_active ? 1 : 0.4,
          }}>
            <div style={{ fontSize: 13, marginBottom: 8 }}>{c.name} ({c.category})</div>
            <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
              <button onClick={() => toggleChar(c.id, c.is_active)} style={{
                padding: '4px 10px', fontSize: 11, borderRadius: 4,
                background: c.is_active ? '#e94560' : '#00b894', color: '#fff',
              }}>{c.is_active ? '비활성화' : '활성화'}</button>
              <button onClick={() => deleteChar(c.id)} style={{
                padding: '4px 10px', fontSize: 11, borderRadius: 4, background: '#636e72', color: '#fff',
              }}>삭제</button>
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 18, marginBottom: 12 }}>폰트 ({fonts.length})</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {fonts.map((f) => (
          <div key={f.id} style={{
            background: '#16213e', borderRadius: 8, padding: 12,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            opacity: f.is_active ? 1 : 0.4,
          }}>
            <span style={{ fontSize: 14 }}>{f.name}</span>
            <button onClick={() => toggleFont(f.id, f.is_active)} style={{
              padding: '4px 12px', fontSize: 12, borderRadius: 4,
              background: f.is_active ? '#e94560' : '#00b894', color: '#fff',
            }}>{f.is_active ? '비활성화' : '활성화'}</button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 시스템 설정 페이지 작성**

Create `src/renderer/pages/admin/AdminSettings.tsx`:
```tsx
import React, { useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import { useIpc } from '../../hooks/useIpc';

export default function AdminSettings() {
  const settings = useAppStore((s) => s.settings);
  const updateSetting = useAppStore((s) => s.updateSetting);
  const api = useIpc();
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    admin_password: settings.admin_password || '',
    idle_timeout: settings.idle_timeout || '120',
    complete_timeout: settings.complete_timeout || '10',
    printer_name: settings.printer_name || '',
    cutter_port: settings.cutter_port || '',
  });

  const handleChange = (key: string, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSave = async () => {
    for (const [key, value] of Object.entries(form)) {
      await api.setSetting(key, value);
      updateSetting(key, value);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const fields: { key: string; label: string; type: string }[] = [
    { key: 'admin_password', label: '관리자 비밀번호', type: 'password' },
    { key: 'idle_timeout', label: '무동작 타임아웃 (초)', type: 'number' },
    { key: 'complete_timeout', label: '완료 화면 자동복귀 (초)', type: 'number' },
    { key: 'printer_name', label: '프린터 이름', type: 'text' },
    { key: 'cutter_port', label: '커팅기 포트', type: 'text' },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>시스템 설정</h1>
      <div style={{ maxWidth: 500, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {fields.map((f) => (
          <div key={f.key}>
            <label style={{ fontSize: 14, color: '#888', display: 'block', marginBottom: 6 }}>{f.label}</label>
            <input
              type={f.type}
              value={(form as any)[f.key]}
              onChange={(e) => handleChange(f.key, e.target.value)}
              style={{ width: '100%', padding: 12, fontSize: 16, borderRadius: 8, border: '1px solid #0f3460', background: '#16213e', color: '#fff' }}
            />
          </div>
        ))}
        <button onClick={handleSave} style={{
          padding: 14, fontSize: 16, borderRadius: 8, background: '#6c63ff', color: '#fff', fontWeight: 'bold',
        }}>{saved ? '✅ 저장 완료!' : '저장'}</button>
        <div style={{ marginTop: 20, fontSize: 12, color: '#666' }}>앱 버전: 1.0.0</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: App.tsx 관리자 라우트 추가**

```tsx
import AdminHardware from './pages/admin/AdminHardware';
import AdminContent from './pages/admin/AdminContent';
import AdminSettings from './pages/admin/AdminSettings';

// <Route path="/admin"> 내부에:
<Route path="hardware" element={<AdminHardware />} />
<Route path="content" element={<AdminContent />} />
<Route path="settings" element={<AdminSettings />} />
```

- [ ] **Step 5: 커밋**

```bash
git add -A && git commit -m "feat: 관리자 하드웨어 상태, 콘텐츠 관리, 시스템 설정 페이지"
```

---

### Task 18: 키오스크 모드 + 빌드 + 패키징

**Files:**
- Modify: `src/main/index.ts`
- Modify: `electron-builder.yml`

- [ ] **Step 1: 키오스크 모드 설정**

Modify `src/main/index.ts` — `createWindow` 함수의 BrowserWindow 옵션을 프로덕션 모드 분기로 변경:
```ts
const isDev = process.env.NODE_ENV === 'development';

mainWindow = new BrowserWindow({
  width: 1920,
  height: 1080,
  webPreferences: {
    preload: path.join(__dirname, '../preload/index.js'),
    contextIsolation: true,
    nodeIntegration: false,
  },
  frame: isDev, // 프로덕션에서는 프레임 없음
  fullscreen: !isDev,
  kiosk: !isDev, // 프로덕션에서는 키오스크 모드
  autoHideMenuBar: true,
});

// 키오스크 모드에서 Alt+F4 차단
if (!isDev) {
  mainWindow.on('close', (e) => {
    // 관리자가 명시적으로 종료하지 않으면 차단
    e.preventDefault();
  });

  // 글로벌 단축키로 관리자 종료 기능 (Ctrl+Shift+Q)
  const { globalShortcut } = require('electron');
  globalShortcut.register('Ctrl+Shift+Q', () => {
    mainWindow?.destroy();
    app.quit();
  });
}
```

- [ ] **Step 2: 앱 자동 시작 설정 (Windows 시작 프로그램)**

Modify `src/main/index.ts` — app.whenReady 이후에 추가:
```ts
// 프로덕션에서 Windows 시작 시 자동 실행
if (!isDev) {
  app.setLoginItemSettings({
    openAtLogin: true,
    path: app.getPath('exe'),
  });
}
```

- [ ] **Step 3: 빌드 및 패키징 테스트**

```bash
cd /c/Users/201-B1/golf-kiosk
npm run build
# Expected: dist/main/ 및 dist/renderer/ 생성 확인
```

- [ ] **Step 4: 커밋**

```bash
git add -A && git commit -m "feat: 키오스크 모드 (전체화면, 키 차단, 자동시작) + 빌드 설정"
```

---

## Summary

| Task | 내용 | 예상 커밋 |
|------|------|-----------|
| 1 | Electron + Vite + React 스캐폴딩 | 프로젝트 초기 설정 |
| 2 | SQLite DB 스키마 + 마이그레이션 | 데이터 레이어 |
| 3 | Preload IPC 브릿지 | Main ↔ Renderer 통신 |
| 4 | App Shell (라우터, 스타일, 상태) | 앱 뼈대 |
| 5 | 홈 화면 + 무동작 타이머 | 사용자 진입점 |
| 6 | 상품 선택 화면 | 상품 선택 UI |
| 7 | 디자인 편집기 캔버스 + 레이어 | 핵심 편집기 기반 |
| 8 | 텍스트 도구 + 가상 키보드 | 텍스트 편집 |
| 9 | 이미지 도구 + USB 감지 | USB 이미지 불러오기 |
| 10 | 캐릭터 도구 | DB 기반 캐릭터 |
| 11 | 미리보기 + 완료 + 주문 스토어 | 플로우 완성 |
| 12 | 인쇄 진행 + 프린터 스텁 | 프린터 연동 기반 |
| 13 | 결제 화면 + KICC 스텁 | 결제 연동 기반 |
| 14 | 커팅기 스텁 + 하드웨어 통합 | 커팅기 연동 기반 |
| 15 | 관리자 레이아웃 + 대시보드 | 관리자 기반 |
| 16 | 관리자 결제 내역 + 가격 설정 | 관리자 기능 |
| 17 | 관리자 하드웨어/콘텐츠/설정 | 관리자 완성 |
| 18 | 키오스크 모드 + 빌드 | 프로덕션 배포 |
