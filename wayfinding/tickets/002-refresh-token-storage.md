# Refresh Token 저장소 선택
label: wayfinder:grilling
status: closed

## Question

Refresh Token을 어디에 저장할까?

선택지:
- A) **HttpOnly Cookie** — XSS 공격 방어, CSRF 고려 필요 (추천)
- B) **DB (H2)** — 토큰 무효화 가능, 조회 오버헤드 있음
- C) **클라이언트 localStorage** — 구현 단순하나 XSS에 취약

Blocks: 백엔드 JWT 인증 구현, 프론트엔드 인증 구현
