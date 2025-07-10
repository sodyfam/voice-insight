# 열린마음협의회 정보 구조 (Information Architecture)

## 📋 목차
1. [시스템 개요](#시스템-개요)
2. [사용자 유형](#사용자-유형)
3. [사이트맵](#사이트맵)
4. [페이지별 상세 구조](#페이지별-상세-구조)
5. [컴포넌트 계층구조](#컴포넌트-계층구조)
6. [데이터 구조](#데이터-구조)
7. [네비게이션 시스템](#네비게이션-시스템)
8. [상태 관리](#상태-관리)

---

## 시스템 개요

**열린마음협의회**는 OK금융그룹 내부 직원들의 의견 수집 및 관리를 위한 웹 애플리케이션입니다.

### 기술 스택
- **Frontend**: React + TypeScript + Vite
- **UI Framework**: shadcn/ui + Tailwind CSS
- **Routing**: React Router DOM
- **상태 관리**: React Query + Local State
- **Backend**: Supabase + MAKE.com Webhooks
- **인증**: 쿠키 기반 세션 관리

---

## 사용자 유형

### 👤 일반 사용자 (직원)
- **권한**: 의견 제출, 본인 의견 조회
- **기본 페이지**: 의견제출 화면
- **접근 가능**: 의견제출, 로그아웃

### 👨‍💼 관리자
- **권한**: 전체 의견 조회/관리, 통계 대시보드, 사용자 관리
- **기본 페이지**: 대시보드
- **접근 가능**: 대시보드, 의견제출, 의견관리, 사용자관리, 로그아웃

---

## 사이트맵

```
열린마음협의회
├── 🔐 로그인 (/login)
│   ├── 로그인 폼
│   └── 사용자등록 모달
│
├── 📊 대시보드 (/dashboard) [관리자만]
│   ├── KPI 카드 (4개)
│   ├── 분기별 통계
│   ├── 카테고리 분포 차트
│   └── 최근 의견 목록
│
├── ✍️ 의견제출 (/dashboard#submit)
│   ├── 계열사 선택
│   ├── 카테고리 선택
│   ├── 분기 선택
│   └── 의견 내용 입력
│
├── 📋 의견관리 (/dashboard#admin) [관리자만]
│   ├── 검색 및 필터
│   ├── 의견 목록
│   └── 상세보기 모달
│
├── 👥 사용자관리 (/dashboard#users) [관리자만]
│   ├── 사용자 목록
│   └── 사용자 정보 카드
│
├── 📄 의견상세 (/opinion/:id)
│   └── 개별 의견 상세 화면
│
└── ❌ 404 (/404)
    └── 페이지 없음 안내
```

---

## 페이지별 상세 구조

### 🔐 로그인 페이지 (`/login`)
```
📋 로그인 폼
├── 브랜딩 헤더
│   ├── OK금융그룹 로고
│   └── 열린마음 협의회 제목
├── 인증 필드
│   ├── 사번 입력
│   └── 비밀번호 입력
├── 액션 버튼
│   ├── 로그인 버튼
│   └── 사용자등록 링크
└── 배경 이미지 및 그라데이션
```

**인증 흐름**:
1. MAKE.com 웹훅으로 사용자 인증
2. 쿠키 + localStorage에 사용자 정보 저장
3. 권한별 리다이렉트 (관리자 → 대시보드, 일반 → 의견제출)

### 📊 대시보드 (`/dashboard`) [관리자만]
```
📈 통계 대시보드
├── 상단 네비게이션
├── KPI 카드 섹션 (4개)
│   ├── 📝 총 의견 수
│   ├── 👥 참여자 수
│   ├── 📊 참여율
│   └── ⚡ 처리율
├── 차트 섹션
│   ├── 📈 분기별 의견 추이
│   └── 🥧 카테고리별 분포
└── 📋 최근 의견 테이블
    ├── 날짜/시간
    ├── 계열사
    ├── 카테고리
    ├── 의견 내용 (요약)
    └── 상태 배지
```

**데이터 소스**:
- 총 의견/참여자: `pptkg5i1e54vr7hniw7pnl2xf7m7ccqf` 웹훅
- 처리 현황: `ud2hqqq4mp42xxsc8k7qfqdpuz4wjqmt` 웹훅
- 카테고리 분포: `8gxl7a5m79wn5197445pv3tkhk4r4ywk` 웹훅

### ✍️ 의견제출 (`/dashboard#submit`)
```
📝 의견 등록 폼
├── 폼 필드 섹션
│   ├── 🏢 계열사 선택 (드롭다운)
│   ├── 📂 카테고리 선택 (드롭다운)
│   ├── 📅 분기 선택 (Q1-Q4)
│   └── 💭 의견 내용 (텍스트에리어)
├── 제출 버튼
└── 작성 안내 메시지
```

**제출 흐름**:
1. 폼 검증 (모든 필드 필수)
2. MAKE.com 웹훅으로 데이터 전송
3. Toast 피드백 (성공/실패)
4. 성공 시 폼 자동 초기화

### 📋 의견관리 (`/dashboard#admin`) [관리자만]
```
🔍 의견 관리 패널
├── 검색 및 필터 영역
│   ├── 🔎 키워드 검색
│   ├── 🏢 계열사 필터
│   ├── 📂 카테고리 필터
│   ├── 📅 분기 필터
│   └── 🏷️ 상태 필터
├── 의견 목록 테이블
│   ├── 선택 체크박스
│   ├── 제출일시
│   ├── 계열사
│   ├── 카테고리
│   ├── 의견 내용 (요약)
│   ├── 상태 배지
│   └── 액션 버튼
├── 페이지네이션
└── 상세보기 모달
    ├── 전체 의견 내용
    ├── 제출자 정보
    ├── 답변 상태 관리
    └── 닫기 버튼
```

### 👥 사용자관리 (`/dashboard#users`) [관리자만]
```
👤 사용자 관리 패널
├── 사용자 목록
└── 사용자 카드 (각각)
    ├── 👤 사용자 아바타
    ├── 📋 기본 정보
    │   ├── 이름
    │   ├── 사번
    │   ├── 부서
    │   └── 이메일
    ├── 🏷️ 권한 배지
    └── 상태 정보
```

---

## 컴포넌트 계층구조

### 🏗️ 애플리케이션 구조
```
App.tsx
├── QueryClientProvider
├── TooltipProvider
├── BrowserRouter
├── Toaster (전역 알림)
└── Routes
    ├── /login → Login.tsx
    ├── /dashboard → Index.tsx
    ├── /admin → Admin.tsx
    ├── /opinion/:id → OpinionDetailPage
    └── /404 → NotFound.tsx
```

### 📱 메인 페이지 (Index.tsx)
```
Index Component
├── 🧭 Navigation Header
│   ├── 브랜딩 영역
│   ├── 데스크톱 메뉴
│   ├── 모바일 햄버거
│   └── 로그아웃 버튼
├── 📱 Mobile Menu (조건부)
└── 📋 Tab Content
    ├── dashboard → DashboardStats
    ├── submit → OpinionSubmissionForm
    ├── admin → AdminPanel
    ├── users → UserManagement
    └── opinion-detail → OpinionDetail
```

### 📊 대시보드 컴포넌트 (DashboardStats.tsx)
```
DashboardStats
├── 📈 KPI Cards (4개)
│   ├── Icon + Title
│   ├── Value + Description
│   └── Trend Indicator
├── 📊 Charts Section
│   ├── Quarterly Trend Chart
│   └── Category Distribution (Pie)
└── 📋 Recent Opinions Table
    ├── Table Header
    ├── Data Rows
    └── Loading/Empty States
```

### 📝 관리자 패널 (AdminPanel.tsx)
```
AdminPanel
├── admin/ (하위 컴포넌트)
│   ├── AdminPanelHeader
│   ├── SearchFilters
│   ├── SearchResults
│   ├── OpinionDetailModal
│   ├── LoadingState
│   ├── EmptyState
│   └── AdminActions
└── UI State Management
```

### 🔧 공통 UI 컴포넌트 (`/ui/`)
```
shadcn/ui 컴포넌트
├── Layout
│   ├── card, sheet, dialog
│   ├── tabs, navigation-menu
│   └── sidebar, breadcrumb
├── Form
│   ├── input, textarea, select
│   ├── button, checkbox
│   └── form, label
├── Data Display
│   ├── table, badge, avatar
│   ├── progress, chart
│   └── accordion, collapsible
└── Feedback
    ├── alert, alert-dialog
    ├── toast, sonner
    └── skeleton, spinner
```

---

## 데이터 구조

### 🗃️ 사용자 정보
```typescript
interface UserInfo {
  id: string;           // 사번
  name: string;         // 이름
  company: string;      // 계열사
  dept: string;         // 부서
  email: string;        // 이메일
  role: string;         // 권한 (user/관리자)
  status: string;       // 상태
}
```

### 💭 의견 데이터
```typescript
interface Opinion {
  id: string;
  company: string;      // 계열사
  category: string;     // 카테고리
  quarter: string;      // 분기 (Q1-Q4)
  content: string;      // 의견 내용
  status: string;       // 상태 (대기/처리중/완료)
  created_at: string;   // 제출일시
  user_id: string;      // 제출자 사번
}
```

### 📊 통계 데이터
```typescript
interface DashboardStats {
  total_cnt: number;    // 총 의견 수
  user_cnt: number;     // 참여자 수
  proc_cnt: number;     // 처리 완료 수
  participationRate: number;  // 참여율 (%)
  processingRate: number;     // 처리율 (%)
}

interface CategoryData {
  category: string;
  count: number;
  percentage: number;
}
```

---

## 네비게이션 시스템

### 🧭 권한 기반 네비게이션
```
일반 사용자
├── 의견제출 (기본)
└── 로그아웃

관리자
├── 대시보드 (기본)
├── 의견제출
├── 의견관리
├── 사용자관리
└── 로그아웃
```

### 📱 반응형 네비게이션
- **데스크톱**: 수평 메뉴바
- **모바일**: 햄버거 → 수직 메뉴

### 🔗 URL 구조
```
/login              # 로그인
/dashboard          # 관리자 대시보드
/dashboard#submit   # 의견제출
/dashboard#admin    # 의견관리
/dashboard#users    # 사용자관리
/opinion/:id        # 의견상세
/404               # 페이지 없음
```

---

## 상태 관리

### 🔄 React Query
```typescript
// 주요 쿼리 키
'recentOpinions'      // 최근 의견 목록
'processingCount'     // 처리 현황
'categoryDistribution' // 카테고리 분포
'opinionsSearch'      // 의견 검색 결과
'userList'           // 사용자 목록
```

### 💾 로컬 상태
```typescript
// Index.tsx
const [activeTab, setActiveTab] = useState<string>
const [isAdmin, setIsAdmin] = useState<boolean>
const [selectedOpinionId, setSelectedOpinionId] = useState<string | null>
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>

// Login.tsx
const [employeeId, setEmployeeId] = useState<string>
const [password, setPassword] = useState<string>
const [isLoading, setIsLoading] = useState<boolean>
```

### 🍪 세션 관리
```typescript
// 쿠키 저장 (7일 유효)
document.cookie = `${key}=${value}; expires=${expires}; path=/`

// localStorage 저장
localStorage.setItem('userInfo', JSON.stringify(userInfo))
```

---

## 📊 현재 구현 상태

### ✅ 완료된 기능
- 🔐 사용자 인증 및 권한 관리
- 📊 실시간 대시보드 (KPI + 차트)
- ✍️ 의견 제출 시스템
- 📋 의견 관리 (검색/필터/모달)
- 👥 사용자 관리 패널
- 📱 완전 반응형 UI
- 🔔 Toast 기반 피드백
- 🎨 일관된 디자인 시스템

### 🔄 개선 예정
- 📈 실시간 데이터 동기화
- 🔍 고급 검색 기능
- 📊 추가 통계 차트
- 🚀 성능 최적화
- ♿ 접근성 개선

---

**최종 업데이트**: 2024년 12월 현재
**문서 버전**: v1.0
**작성자**: AI Assistant (소스 코드 분석 기반)
