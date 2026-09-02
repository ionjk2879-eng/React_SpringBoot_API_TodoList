# Wayfinder Map
label: wayfinder:map

## Destination

로컬에서 완전히 동작하는 Todo 리스트 앱.
- Frontend: React (Vite) + Tailwind CSS + React Query
- Backend: Spring Boot 3 + JPA + H2 (파일 모드)
- Auth: JWT (Access Token + Refresh Token)
- 기능: Todo CRUD, Category CRUD, 페이지네이션, 완료/마감임박 시각 구분
- 구조: 모노레포 (`frontend/`, `backend/`)
- 범위: 로컬 환경만 (운영 배포는 별도 맵)

## Notes

도메인: CONTEXT.md 참조.
스택 결정 사항은 grilling 세션에서 확정됨.
로컬/운영 환경은 Spring 프로파일로 분리 예정.
세부 기능 요구사항은 사용자가 제공함.

## Decisions so far

- [Category 삭제 시 Todo 처리 정책](tickets/001-category-deletion-policy.md): Null out — Todo 유지, category 필드만 null
- [Refresh Token 저장소 선택](tickets/002-refresh-token-storage.md): HttpOnly Cookie
- [API 응답 형식 표준화](tickets/003-api-response-format.md): 공통 래퍼 `{ success, data, message, code }`
- [모노레포 초기 세팅](tickets/004-project-setup.md): backend/ (Spring Boot 3 + JPA + H2 + Security + JWT) + frontend/ (Vite + React TS + Tailwind + React Query) 구성 완료

## Not yet specified

- 운영 배포 환경 구성 (EC2, Docker, Nginx 등) — 별도 맵으로 분리 예정

## Out of scope

- 운영 배포 (EC2) — 이번 맵의 목적지는 로컬 동작까지
- 소셜 로그인 (OAuth)
- 실시간 알림
