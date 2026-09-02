---
target: TodoPage (main app surface)
total_score: 22
max_score: 36
na_heuristics: 10
p0_count: 1
p1_count: 2
target_identity: "file:C:\\Users\\User\\IdeaProjects\\React_SpringBoot_API_TodoList\\frontend\\src\\pages\\TodoPage.tsx"
target_fingerprint: "sha256:a9e36c2994255d2bb63ca32031ae6f92139daa66c07f83f827562ed08f913720"
target_path: "C:\\Users\\User\\IdeaProjects\\React_SpringBoot_API_TodoList\\frontend\\src\\pages\\TodoPage.tsx"
timestamp: 2026-09-02T14-44-24Z
slug: frontend-src-pages-todopage-tsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 3/4 | Mutations (toggle, delete, rename, upload) show no pending/saving state |
| 2 | Match System/Real World | 3/4 | "진행 중" status is purely deadline-derived, not something the user sets |
| 3 | User Control and Freedom | 2/4 | Delete has no undo, only a native confirm(); category delete impact unclear |
| 4 | Consistency and Standards | 3/4 | Delete confirmation drops to a native browser dialog, breaking crafted feel |
| 5 | Error Prevention | 2/4 | No client-side length limit on category name; no image size/dimension guard |
| 6 | Recognition Rather Than Recall | 3/4 | Stamp/category recognition good; status-card semantics not self-evident |
| 7 | Flexibility and Efficiency | 1/4 | No keyboard path for new-todo, toggle-complete, or rescheduling |
| 8 | Aesthetic and Minimalist Design | 3/4 | Clean overall; lots of chrome stacks above the actual list |
| 9 | Error Recovery | 2/4 | Error banners are generic fallback strings, no retry action |
| 10 | Help and Documentation | n/a | Not expected for a small personal tool |
| **Total** | | **22/36** | **Acceptable band (61%)** |

## Design Specificity Verdict

LLM assessment: Partially specific. The stamp interaction is real product-specific craft. Surrounding chrome (sidebar nav, status cards, settings panel) is boilerplate SaaS-dashboard layout. Apple palette correctly tokenized but reads as "a clean neutral palette," not distinctly Apple.

Deterministic scan: detect.mjs over all 10 UI files -> 0 findings, exit 0, verified genuine via sanity-check against known-bad scratch files.

Visual overlays: unavailable both assessments (Chrome extension not connected). No overlay exists; source-code-only review.

## Overall Impression

The stamp idea is executed well and confined to one button. Everything else is competent but interchangeable, and three real trust/usability gaps (unstyled destructive confirms, no in-flight feedback, a status label that lies about being user-controlled) sit underneath a now-polished Apple palette.

## What's Working

1. The stamp interaction itself (TodoCard.tsx) — layered animation, reused consistently.
2. 60-30-10 token system in index.css — systemic Tailwind @theme remap, not scattered hex.
3. Deadline-proximity treatment (isApproaching) — escalates only inside the <=24h window.

## Priority Issues

[P0] Destructive actions use a native confirm() with no undo — TodoPage.tsx delete handlers. Fix: in-app styled confirm with affected-count, or undo-toast. Suggested: /impeccable harden

[P1] "진행 중" status is silently deadline-derived, not user-set — TodoPage.tsx classifyTodo. Fix: rename bucket to reflect deadline-driven nature, or add a real in-progress state. Suggested: /impeccable clarify

[P1] No pending/saving feedback on any mutation — toggle/delete/rename/upload mutations never surface isPending. Fix: disable control + spinner while in flight. Suggested: /impeccable harden

[P2] Category creation exposes 7 visible choices for one decision — name + 6 shapes + upload link all at once. Cognitive load checklist: 4/8 failed (high load). Fix: collapse behind a "커스터마이즈" disclosure. Suggested: /impeccable layout

[P2] Todo list + calendar default to a 50/50 split — showCalendar defaults true, halves list width on first load, works against "여백이 디자인이다" principle. Fix: default closed or persist last-used state. Suggested: /impeccable distill

## Persona Red Flags

Jordan (첫 사용자): empty list + calendar both showing, no clear "start here"; category creation box unlabeled; "진행 중" card teaches wrong mental model on day one.

Sam (접근성): edit/delete buttons reveal only via group-hover, not group-focus-within — keyboard-only users can't reach them. Unchecked stamp button contrast likely fails WCAG. Drag-to-calendar has no keyboard equivalent.

Riley (경계 케이스): no debounce on stamp toggle (double-fire risk). ImageCropModal's canvas.toBlob has no loading state or size guard.

## Minor Observations

- Header "달력" toggle and sidebar 카테고리/설정 nav use two different active-state visual languages.
- "새 할 일" is a filled button; "새 카테고리" is a quiet bordered field — hierarchy choice may be unintentional.
- Calendar Sun/Sat red/blue correctly carved out as convention per PRODUCT.md — good discipline.
- ImageCropModal.tsx inline style={{}} wasn't fully inspectable by the regex detector (coverage blind spot, not a finding).

## Questions to Consider

1. If "진행 중" is entirely deadline-derived, is a 3-bucket kanban-style model the right vocabulary at all?
2. The stamp is the one distinctive idea — why does it stop at a single todo?
3. Should deleting a deadline-bearing todo route through the same generic confirm as deleting an empty category?
