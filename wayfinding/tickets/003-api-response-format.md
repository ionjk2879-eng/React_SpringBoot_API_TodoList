# API 응답 형식 표준화
label: wayfinder:grilling
status: closed

## Question

모든 API 응답을 공통 래퍼 구조로 감쌀까, 아니면 데이터를 직접 반환할까?

선택지:
- A) **공통 래퍼** — `{ success, data, message, code }` 형식 (추천)
- B) **직접 반환** — 성공 시 데이터 그대로, 실패 시 RFC 7807 Problem Details

Blocks: Todo CRUD API, Category CRUD API, 프론트엔드 API 연동
