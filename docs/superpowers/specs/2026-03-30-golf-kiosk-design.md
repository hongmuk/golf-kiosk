# 골프공 인쇄/각인 키오스크 소프트웨어 설계서

## 1. 개요

골프공 및 사물에 문자, 이미지, 캐릭터 등을 인쇄/각인하는 윈도우 기반 키오스크 소프트웨어. 기존 운영 중인 키오스크의 기능과 화면을 벤치마킹하여 동일한 기능을 수행하며, 기 구축된 하드웨어 장비와 연동되는 신규 소프트웨어를 개발한다.

**핵심 제약 조건:**
- 별도 백엔드 서버 없이 Electron 앱 단독으로 동작
- 모든 데이터는 로컬 SQLite에 저장
- 하드웨어 제어는 Electron Main Process에서 직접 수행

## 2. 기술 스택

| 구분 | 기술 | 비고 |
|------|------|------|
| 프레임워크 | Electron | 윈도우 키오스크 환경 |
| 프론트엔드 | React | 컴포넌트 기반 UI |
| 빌드 도구 | Vite | 빠른 HMR, Electron 통합 |
| 상태 관리 | Zustand | 경량, 간결한 API |
| 라우팅 | React Router | 화면 전환 |
| 데이터베이스 | better-sqlite3 | 동기식 SQLite, Electron Main에서 구동 |
| 하드웨어 연동 | node-serialport, ffi-napi | 프린터/결제기/커팅기 제어 |
| USB 감지 | drivelist + fs.watch | USB 메모리 삽입 감지 및 이미지 탐색 |
| 캔버스 편집기 | Konva.js + react-konva | 디자인 편집기 캔버스 렌더링 및 터치 조작 |
| 가상 키보드 | simple-keyboard | 온스크린 터치 키보드 |
| 패키징 | electron-builder | Windows 설치 파일(.exe) 생성 |

## 3. 시스템 아키텍처

```
┌─────────────────────────────────────────────────────┐
│                   Electron App                       │
│                                                      │
│  ┌──────────────────┐    IPC    ┌─────────────────┐  │
│  │  Main Process    │◄────────►│ Renderer Process │  │
│  │  (Node.js)       │          │ (React)          │  │
│  │                  │          │                  │  │
│  │ - SQLite DB      │          │ - 홈 화면        │  │
│  │ - USB 프린터 제어 │          │ - 상품 선택      │  │
│  │ - KICC 결제 연동  │          │ - 디자인 편집기  │  │
│  │ - 커팅기 제어     │          │ - 인쇄 미리보기  │  │
│  │ - USB 메모리 감지 │          │ - 결제 화면      │  │
│  │ - 시스템 설정     │          │ - 인쇄 진행      │  │
│  └──────────────────┘          │ - 완료 화면      │  │
│                                │ - 관리자 대시보드 │  │
│                                └─────────────────┘  │
└─────────────────────────────────────────────────────┘
         │              │             │          │
    ┌────┴────┐   ┌─────┴────┐  ┌────┴───┐  ┌──┴───┐
    │USB 프린터│   │KICC 결제기│  │ 커팅기  │  │USB   │
    └─────────┘   └──────────┘  └────────┘  │메모리│
                                             └──────┘
```

### 3.1 Main Process 역할

Main Process는 Node.js 환경에서 시스템 레벨 작업을 담당한다:
- SQLite 데이터베이스 읽기/쓰기
- USB 프린터에 인쇄 명령 전송
- KICC 결제 단말기와 통신 (결제 요청/결과 수신)
- 커팅기에 커팅 명령 전송
- USB 메모리 장치 삽입 감지 및 이미지 파일 목록 제공
- 앱 설정, 윈도우 관리, 키오스크 모드(전체화면 고정) 제어

### 3.2 Renderer Process 역할

React 기반 UI를 렌더링하고, IPC를 통해 Main Process에 하드웨어 제어 및 데이터를 요청한다.

### 3.3 IPC 채널 설계

| 채널명 | 방향 | 용도 |
|--------|------|------|
| `db:query` | Renderer → Main | DB 조회 |
| `db:execute` | Renderer → Main | DB 실행 (insert/update/delete) |
| `printer:print` | Renderer → Main | 인쇄 명령 전송 |
| `printer:status` | Main → Renderer | 프린터 상태 알림 |
| `payment:request` | Renderer → Main | 결제 요청 |
| `payment:result` | Main → Renderer | 결제 결과 알림 |
| `cutter:cut` | Renderer → Main | 커팅 명령 전송 |
| `cutter:status` | Main → Renderer | 커팅기 상태 알림 |
| `usb:detect` | Main → Renderer | USB 메모리 삽입/제거 알림 |
| `usb:list-images` | Renderer → Main | USB 내 이미지 파일 목록 요청 |
| `usb:read-image` | Renderer → Main | USB 이미지 파일 읽기 |
| `settings:get` | Renderer → Main | 설정 조회 |
| `settings:set` | Renderer → Main | 설정 저장 |
| `hardware:status` | Renderer → Main | 전체 하드웨어 상태 조회 |

## 4. 사용자 화면 흐름

```
[홈 화면] ──터치──► [상품 선택] ──선택──► [디자인 편집기] ──완료──► [미리보기]
                                                                      │
                                              ◄──수정──┘              │확인
                                                                      ▼
[완료] ◄──인쇄완료── [인쇄 진행] ◄──결제완료── [결제 화면]
  │
  └──타임아웃──► [홈 화면]
```

### 4.1 홈 화면

- 전체 화면으로 광고/안내 영상 또는 이미지 슬라이드 반복 재생
- 화면 아무 곳 터치 시 상품 선택 화면으로 이동
- 일정 시간(설정 가능) 무동작 시 홈으로 자동 복귀
- 관리자 진입: 화면 특정 영역(우측 하단 등) 5회 연속 터치 → 비밀번호 입력 팝업

### 4.2 상품 선택

- 골프공 인쇄 / 스티커·데칼 커팅 중 선택
- 각 상품별 가격, 간단한 설명 표시
- 뒤로가기 버튼으로 홈 복귀

### 4.3 디자인 편집기 (핵심 화면)

3단 레이아웃 (1920x1080):

**좌측 패널 (280px) — 도구 & 옵션:**
- 도구 선택 탭: 텍스트 / 이미지 / 캐릭터
- 텍스트 도구: 내용 입력(온스크린 키보드), 폰트 선택, 크기 슬라이더, 색상 팔레트
- 이미지 도구: USB 메모리에서 이미지 파일 선택, 크기/회전 조정
- 캐릭터 도구: 카테고리별 캐릭터 그리드, 터치로 선택

**중앙 캔버스 — 골프공 미리보기 (Konva.js 기반):**
- Konva.js(react-konva)를 사용한 원형 캔버스 렌더링
- 골프공 형태의 원형 클리핑 영역 내에 텍스트/이미지/캐릭터 배치
- Konva의 내장 드래그/리사이즈 기능으로 터치 조작 구현
- 캔버스 내용을 이미지(PNG)로 내보내기하여 프린터에 전달
- 확대/축소 버튼
- 안내 가이드 텍스트 표시

**우측 패널 (220px) — 레이어:**
- 현재 배치된 요소 목록 (텍스트, 이미지 등)
- 선택하여 편집, 순서 변경(위/아래), 삭제

**상단 바:**
- 뒤로가기 버튼
- 현재 단계 표시
- 초기화 / 다음 버튼

### 4.4 인쇄 미리보기

- 골프공에 인쇄될 최종 결과물을 큰 크기로 표시
- "수정하기" 버튼 → 편집기로 복귀
- "결제하기" 버튼 → 결제 화면으로 이동
- 상품명, 가격 정보 표시

### 4.5 결제 화면

- 결제 금액 표시
- KICC 결제 단말기에 카드 투입 안내 애니메이션
- 결제 진행 상태 표시 (대기 → 처리 중 → 완료/실패)
- 결제 실패 시 재시도/취소 선택
- 결제 타임아웃 처리 (일정 시간 내 카드 미투입 시 취소)

### 4.6 인쇄 진행 화면

- 프로그레스 바와 함께 인쇄 진행 상태 표시
- "골프공을 인쇄대에 올려주세요" 등 단계별 안내 메시지
- 예상 소요 시간 표시
- 인쇄 오류 발생 시 오류 메시지 및 관리자 호출 안내

### 4.7 완료 화면

- 인쇄 완료 안내
- 골프공 수령 안내 메시지
- 설정된 시간(예: 10초) 후 자동으로 홈 화면 복귀
- "처음으로" 버튼으로 즉시 복귀 가능

## 5. 데이터 모델 (SQLite)

### 5.1 orders (주문/결제 내역)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | INTEGER PK | 자동 증가 |
| product_type | TEXT | 'golf_ball' 또는 'sticker' |
| design_data | TEXT (JSON) | 디자인 편집 데이터 (텍스트, 이미지 위치 등) |
| amount | INTEGER | 결제 금액 (원) |
| payment_status | TEXT | 'pending', 'completed', 'failed', 'refunded' |
| payment_method | TEXT | 'card' |
| kicc_transaction_id | TEXT | KICC 거래 고유번호 |
| kicc_approval_no | TEXT | KICC 승인번호 |
| print_status | TEXT | 'pending', 'printing', 'completed', 'failed' |
| created_at | TEXT | ISO 8601 형식 |
| completed_at | TEXT | 인쇄 완료 시각 |

### 5.2 print_logs (인쇄 로그)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | INTEGER PK | 자동 증가 |
| order_id | INTEGER FK | orders.id 참조 |
| status | TEXT | 'started', 'completed', 'error' |
| message | TEXT | 상태 메시지 또는 에러 내용 |
| created_at | TEXT | ISO 8601 형식 |

### 5.3 settings (시스템 설정)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| key | TEXT PK | 설정 키 |
| value | TEXT | 설정 값 (JSON 가능) |
| updated_at | TEXT | 마지막 수정 시각 |

**기본 설정 항목:**
- `price_golf_ball`: 골프공 인쇄 가격
- `price_sticker`: 스티커 커팅 가격
- `admin_password`: 관리자 비밀번호 (해시 저장)
- `idle_timeout`: 무동작 시 홈 복귀 시간(초)
- `complete_timeout`: 완료 화면 자동 복귀 시간(초)
- `printer_name`: 연결된 프린터 이름
- `cutter_port`: 커팅기 연결 포트

### 5.4 characters (캐릭터 목록)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | INTEGER PK | 자동 증가 |
| name | TEXT | 캐릭터 이름 |
| category | TEXT | 카테고리 (동물, 스포츠, 이모지 등) |
| image_path | TEXT | 이미지 파일 경로 |
| is_active | INTEGER | 활성화 여부 (1/0) |
| sort_order | INTEGER | 정렬 순서 |

### 5.5 fonts (폰트 목록)

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | INTEGER PK | 자동 증가 |
| name | TEXT | 폰트 표시명 |
| file_path | TEXT | 폰트 파일 경로 (.ttf/.otf) |
| is_active | INTEGER | 활성화 여부 (1/0) |
| sort_order | INTEGER | 정렬 순서 |

## 6. 관리자 대시보드

### 6.1 진입 방식

홈 화면의 특정 영역(우측 하단 모서리 등)을 5회 연속 터치하면 비밀번호 입력 팝업이 표시된다. 올바른 비밀번호 입력 시 관리자 대시보드로 진입한다.

### 6.2 기능 목록

**대시보드 (메인):**
- 오늘/주간/월간 매출 요약
- 오늘/주간/월간 인쇄 건수
- 하드웨어 연결 상태 요약 (정상/이상)

**결제 내역:**
- 전체 결제 목록 (날짜, 상품, 금액, 상태)
- 날짜 범위 필터
- 상태별 필터 (완료/실패/환불)
- 환불 처리 기능

**하드웨어 상태:**
- 프린터 연결 상태 및 상세 정보
- KICC 결제기 연결 상태
- 커팅기 연결 상태
- 각 장비 테스트 버튼 (테스트 인쇄, 테스트 결제 등)

**가격 설정:**
- 골프공 인쇄 단가 설정
- 스티커 커팅 단가 설정

**콘텐츠 관리:**
- 캐릭터 추가/삭제/활성화·비활성화
- 폰트 추가/삭제/활성화·비활성화
- 홈 화면 광고 이미지/영상 관리

**시스템 설정:**
- 관리자 비밀번호 변경
- 무동작 타임아웃 시간 설정
- 완료 화면 자동 복귀 시간 설정
- 프린터/커팅기 연결 설정
- 앱 버전 정보

## 7. 하드웨어 연동

### 7.1 USB 프린터

- Windows에 설치된 프린터 드라이버를 통해 인쇄 명령 전송
- Electron Main Process에서 `win32-api` 또는 프린터 제조사 SDK를 사용
- 디자인 편집기에서 구성한 레이아웃을 이미지로 렌더링한 후 프린터에 전달
- 인쇄 상태 모니터링 (대기/인쇄중/완료/오류)

### 7.2 KICC 결제 단말기

- KICC에서 제공하는 결제 연동 방식 사용 (DLL 호출 또는 에이전트 프로그램 TCP 통신)
- `ffi-napi`를 사용하여 KICC DLL을 Node.js에서 직접 호출하거나, KICC 에이전트에 TCP 소켓으로 결제 요청
- 결제 요청 → 카드 투입 대기 → 승인 요청 → 결과 수신 흐름
- 결제 취소(환불) 기능 지원

### 7.3 커팅기

- USB로 연결된 커팅기에 커팅 명령 전송
- 커팅기 제조사 SDK 또는 직접 바이너리 명령어 전송
- 스티커/데칼 디자인을 벡터 경로로 변환하여 커팅기에 전달

### 7.4 USB 메모리 감지

- `drivelist` 패키지로 연결된 드라이브 목록 주기적 폴링
- 새로운 이동식 드라이브 감지 시 Renderer에 알림
- 이미지 파일 확장자(.jpg, .jpeg, .png, .bmp, .gif) 필터링하여 목록 제공
- 드라이브 제거 시 알림 및 선택된 이미지 처리

## 8. 키오스크 모드 설정

- Electron `BrowserWindow`를 전체화면(`fullscreen: true`), 프레임 없음(`frame: false`)으로 설정
- `kiosk: true` 모드로 Alt+F4, Alt+Tab 등 시스템 키 차단
- 마우스 커서 숨김 (터치스크린 전용)
- 앱 시작 시 자동 실행 (Windows 시작 프로그램 등록)
- 비정상 종료 시 자동 재시작 (pm2 또는 Windows 서비스)

## 9. 프로젝트 디렉토리 구조

```
golf-kiosk/
├── package.json
├── electron-builder.yml
├── src/
│   ├── main/                    # Electron Main Process
│   │   ├── index.ts             # 앱 진입점
│   │   ├── ipc/                 # IPC 핸들러
│   │   │   ├── db.ts            # DB 관련 IPC
│   │   │   ├── printer.ts       # 프린터 제어 IPC
│   │   │   ├── payment.ts       # 결제 연동 IPC
│   │   │   ├── cutter.ts        # 커팅기 제어 IPC
│   │   │   └── usb.ts           # USB 메모리 감지 IPC
│   │   ├── database/
│   │   │   ├── connection.ts    # SQLite 연결
│   │   │   ├── migrations.ts    # 스키마 마이그레이션
│   │   │   └── seed.ts          # 초기 데이터
│   │   └── hardware/
│   │       ├── printer.ts       # 프린터 제어 로직
│   │       ├── payment.ts       # KICC 결제 로직
│   │       ├── cutter.ts        # 커팅기 제어 로직
│   │       └── usb-monitor.ts   # USB 메모리 감지 로직
│   ├── renderer/                # Electron Renderer (React)
│   │   ├── index.html
│   │   ├── main.tsx             # React 진입점
│   │   ├── App.tsx              # 라우터 설정
│   │   ├── pages/               # 페이지 컴포넌트
│   │   │   ├── HomePage.tsx
│   │   │   ├── ProductSelectPage.tsx
│   │   │   ├── DesignEditorPage.tsx
│   │   │   ├── PreviewPage.tsx
│   │   │   ├── PaymentPage.tsx
│   │   │   ├── PrintingPage.tsx
│   │   │   ├── CompletePage.tsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.tsx
│   │   │       ├── AdminOrders.tsx
│   │   │       ├── AdminHardware.tsx
│   │   │       ├── AdminPricing.tsx
│   │   │       ├── AdminContent.tsx
│   │   │       └── AdminSettings.tsx
│   │   ├── components/          # 재사용 컴포넌트
│   │   │   ├── common/          # 공통 (버튼, 모달 등)
│   │   │   ├── editor/          # 디자인 편집기 관련
│   │   │   └── admin/           # 관리자 화면 관련
│   │   ├── stores/              # Zustand 상태 관리
│   │   │   ├── designStore.ts   # 디자인 편집 상태
│   │   │   ├── orderStore.ts    # 주문 상태
│   │   │   └── appStore.ts      # 전역 앱 상태
│   │   ├── hooks/               # 커스텀 훅
│   │   │   ├── useIpc.ts        # IPC 통신 훅
│   │   │   ├── useIdleTimer.ts  # 무동작 타이머
│   │   │   └── useHardware.ts   # 하드웨어 상태 훅
│   │   ├── styles/              # CSS/스타일
│   │   └── assets/              # 정적 자산
│   │       ├── characters/      # 캐릭터 이미지
│   │       ├── fonts/           # 커스텀 폰트
│   │       └── images/          # UI 이미지
│   └── preload/
│       └── index.ts             # preload 스크립트 (IPC 브릿지)
├── resources/                   # 앱 아이콘, 설치 파일 리소스
└── docs/                        # 문서
```

## 10. 에러 처리 전략

| 상황 | 처리 방식 |
|------|-----------|
| 프린터 미연결 | 상품 선택 시 경고 표시, 인쇄 불가 안내 |
| 결제 실패 | 재시도/취소 선택지 제공, 3회 실패 시 주문 취소 |
| 결제 타임아웃 | 60초 내 카드 미투입 시 자동 취소, 홈으로 복귀 |
| 인쇄 오류 | 오류 메시지 표시, 관리자 호출 안내, 환불 자동 처리 |
| 커팅기 오류 | 오류 메시지 표시, 관리자 호출 안내 |
| USB 메모리 미감지 | USB 삽입 안내 메시지, 재시도 버튼 |
| 앱 비정상 종료 | 자동 재시작, 미완료 주문 복구 처리 |
| 무동작 타임아웃 | 설정 시간 후 홈 화면 자동 복귀, 진행 중 데이터 초기화 |

## 11. 화면 사양

- 해상도: 1920 x 1080 (FHD, 가로)
- 입력: 터치스크린 (멀티터치 지원)
- 키보드: 온스크린 가상 키보드 (텍스트 입력 시 표시)
