# Todo List

할 일을 카테고리별로 관리하고, 반복 일정·마감 추적·달력 뷰까지 지원하는 풀스택 웹 애플리케이션입니다.

**서비스 주소:** http://13.125.211.216/

---

## 주요 기능

| 기능 | 설명 |
|---|---|
| 할 일 관리 | 추가 · 수정 · 삭제 · 완료 토글 · 소프트 딜리트(휴지통) |
| 카테고리 | 색상 · 커스텀 도장 이미지로 할 일 분류, 고정 · 보관 · 드래그 정렬 |
| 반복 일정 | 매일 / 매주 반복, 종료일 설정, 완료 시 다음 항목 자동 생성 |
| 마감 관리 | 마감임박(24시간 이내) · 기한초과 상태 자동 분류 및 색상 구분 |
| 달력 뷰 | 월별 달력에서 마감 할 일 확인, 날짜 필터 · 드래그 이동 |
| 하위 할 일 | 할 일 안에 서브태스크 관리 |
| 검색 | 제목 · 내용 실시간 검색 |
| 키보드 단축키 | `N` 새 할 일, `Esc` 닫기, `Space` 완료 토글, `E` 수정 |
| 프로필 | 닉네임 · 아바타 이미지 · 포인트 컬러 7종 |
| 알림 | 마감 전 브라우저 Push 알림 |
| 반응형 | 모바일(드로어 사이드바) · 태블릿 · 데스크탑 대응 |

---

## 기술 스택

### Frontend

| 분류 | 기술 |
|---|---|
| 프레임워크 | React 18 + TypeScript |
| 빌드 도구 | Vite |
| 스타일링 | Tailwind CSS v4 |
| 서버 상태 | TanStack React Query v5 |
| HTTP 클라이언트 | Axios (JWT 인터셉터 · 토큰 자동 갱신) |
| 라우팅 | React Router DOM v7 |

### Backend

| 분류 | 기술 |
|---|---|
| 언어 · 런타임 | Java 21 |
| 프레임워크 | Spring Boot 3 |
| 인증 | Spring Security + JWT (jjwt 0.12.6), Refresh Token |
| ORM | Spring Data JPA + Hibernate |
| 데이터베이스 | H2 (로컬 개발) / MySQL 8 (프로덕션) |
| 빌드 도구 | Gradle (Kotlin DSL) |
| 기타 | Lombok, Bean Validation |

### Infrastructure

| 분류 | 기술 |
|---|---|
| 서버 | AWS EC2 (Ubuntu) |
| 데이터베이스 | AWS RDS MySQL 8 |
| CI/CD | GitHub Actions (push to main → 자동 빌드 · 배포) |
| 프로세스 관리 | systemd |

---

## 아키텍처

```
Browser
  │
  ├── React SPA (Vite 빌드 결과물, EC2 정적 서빙)
  │
  └── REST API (/api/**)
        │
        └── Spring Boot 3 (EC2, port 8080)
              │
              └── MySQL 8 (RDS)
```

- 프론트엔드 빌드 결과물(`dist/`)을 Spring Boot가 정적 파일로 서빙
- API는 `/api/**` 경로로 분리, JWT Bearer 토큰으로 인증
- Access Token 만료 시 Refresh Token으로 자동 갱신 (Axios 인터셉터)

---

## 로컬 개발 환경 설정

### 사전 요구사항

- Java 21
- Node.js 18+
- Gradle (wrapper 포함)

### 백엔드 실행

```bash
# 프로젝트 루트에서
./gradlew :backend:bootRun
# → http://localhost:8080
# → H2 콘솔: http://localhost:8080/h2-console
```

### 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### 환경 변수

`frontend/.env.local`

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

---

## CI/CD

`main` 브랜치에 push하면 GitHub Actions가 자동으로 실행됩니다.

```
push to main
  → Gradle bootJar 빌드
  → SCP로 EC2에 JAR 전송
  → EC2: git pull → npm install → npm run build → systemctl restart
```

---

## 프로젝트 구조

```
React_Spring_API/
├── backend/                  # Spring Boot 3 API 서버
│   └── src/main/java/com/mysite/todo/
│       ├── domain/
│       │   ├── todo/         # 할 일 (CRUD, 반복, 토글)
│       │   ├── category/     # 카테고리 (정렬, 도장 이미지)
│       │   ├── subtask/      # 하위 할 일
│       │   └── user/         # 사용자 (프로필, 설정)
│       └── global/           # JWT, Security, CORS 설정
│
└── frontend/                 # React + Vite SPA
    └── src/
        ├── pages/            # TodoPage (메인 화면)
        ├── components/       # TodoCard, TodoForm, Calendar 등
        ├── api/              # Axios API 클라이언트
        ├── hooks/            # 마감 알림 등 커스텀 훅
        └── utils/            # 포인트 컬러, 카테고리 색상 등
```
