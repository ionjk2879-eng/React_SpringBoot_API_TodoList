# Category 삭제 시 Todo 처리 정책
label: wayfinder:grilling
status: closed

## Question

사용자가 Category를 삭제할 때, 그 Category에 연결된 Todo들을 어떻게 처리할까?

선택지:
- A) **Null out** — Todo는 유지, category 필드만 null로 변경 (추천)
- B) **Block** — Todo가 연결된 Category는 삭제 불가
- C) **Cascade** — Category 삭제 시 연결된 Todo도 모두 삭제
