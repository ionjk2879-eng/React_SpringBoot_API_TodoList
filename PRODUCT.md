# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React (Vite + TypeScript + Tailwind CSS + React Query) frontend, Spring Boot 3 (JPA + H2 local / MySQL prod + JWT) backend. Monorepo.

## Users

개인 사용자. 공부, 자격증 시험, 과제 등 학습 관련 할 일을 관리하는 상황에서 사용. 모바일보다 데스크톱 브라우저가 주 사용 환경.

## Product Purpose

개인 Todo 관리 앱. 카테고리별로 할 일을 분류하고, 마감일 임박 항목을 시각적으로 구분하며, 완료 처리로 진행 상황을 추적한다. 사용자별 인증으로 본인 데이터만 접근한다.

## Positioning

로그인 기반 개인 Todo 관리. 카테고리 분류 + 마감일 임박 시각 경고 + 완료 상태 구분이 한 화면에서 동작한다.

## Operating Context

- 할 일: 제목(필수), 내용(선택), 마감일(선택), 카테고리(선택), 완료 여부
- 마감 24시간 이내 항목은 시각적으로 구분 표시
- 완료 항목은 별도 시각 처리 (완료 배지, 취소선)
- 카테고리 CRUD로 태그 관리
- 페이지네이션으로 목록 탐색
- JWT 인증: 액세스 토큰 15분, 리프레시 토큰 7일

## Capabilities and Constraints

- 인증 필수 (JWT, 리프레시 토큰은 HttpOnly 쿠키)
- 로컬: H2 파일 DB / 운영: MySQL on AWS EC2
- API: Spring Boot REST, `/api` prefix, `ApiResponse<T>` 공통 래퍼
- Vite proxy: `/api` → `localhost:8080`

## Brand Commitments

- 앱 이름: Todo List (변경 가능)
- 라이트 모드 전용
- 레퍼런스 무드: Apple macOS/iOS 시스템 UI — 절제된 뉴트럴 배경, 시스템 컬러, 부드러운 depth
- 컨셉: 스터디플래너 도장(스탬프) — 완료 처리를 도장 찍는 인터랙션으로 표현, 카테고리별 커스텀 도장(프리셋 6종 또는 업로드 이미지) 지원
- 색 전략: 60-30-10
  - 60% 배경: `#F5F5F7` 캔버스, `#FFFFFF` 카드
  - 30% 구조: `#1D1D1F` 텍스트, `#86868B` 보조텍스트, `#D2D2D7` 경계선
  - 10% 포인트: 오렌지 `#FF9F0A` (행동/진행중), 그린 `#34C759` (완료/도장) — Tailwind `orange-*`/`green-*`/`red-*`/`blue-*` 스케일을 `frontend/src/index.css`의 `@theme`에서 macOS 시스템 컬러로 재정의해 전역 적용
  - 달력 일/토, 삭제 버튼의 빨강/파랑은 브랜드색이 아니라 보편적 UI 관례로 별도 취급

## Evidence on Hand

- 현재 구현된 React 프론트엔드: `frontend/src/`
- 도장 컨셉 + 애플 톤 팔레트 적용 완료 (2026-09-02)

## Product Principles

1. 여백이 디자인이다 — 빈 공간을 활용해 집중도를 높인다
2. 상태는 즉시 읽힌다 — 마감 임박, 완료, 미완료를 한눈에 구분
3. 마찰 없는 입력 — Todo 추가와 카테고리 전환이 최소 클릭으로 동작
