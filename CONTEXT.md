# Domain Glossary

## User
An authenticated person who owns Todos and Categories. Identified by email. Cannot access another User's data.

## Todo
A task belonging to a User. Has a title, content (optional), deadline (optional), completion status, and an optional Category.

- A Todo is **Completed** when `completed = true`, regardless of deadline.
- A Todo is **Approaching** when `completed = false` AND its deadline is within 24 hours from now.
- A Todo is **Active** when `completed = false` (includes both Approaching and non-Approaching Todos).
- Completed and Approaching are mutually exclusive states. A Completed Todo is never Approaching.

## Category
A user-defined label that can be applied to Todos. Belongs to a User; other Users cannot see or use it. A Todo may have zero or one Category.

## Access Token
A short-lived JWT issued on login. Sent in the `Authorization: Bearer` header on every API request.

## Refresh Token
A long-lived token used to issue a new Access Token without re-login. Storage location TBD (see ticket: Refresh Token 저장소 선택).
