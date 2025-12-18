# End-to-End Demo Script (Course-Ready Beta)

Use the dev server headers to simulate authenticated users. Replace `<HOST>` with your backend host (default `http://localhost:3001`).

## 0) Seed data
- Student ID: `student-1`
- Instructor ID: `instructor-1`
- Guide: `guide-1` (title: "Guide 1")

## 1) Create student
- (Dev-mode) Provide headers on each request: `x-user-id: student-1`, `x-user-role: student`.

## 2) Ingest Guide 1 (instructor-only)
```
curl -X POST <HOST>/api/guides/ingest \
  -H "x-user-id: instructor-1" \
  -H "x-user-role: instructor"
```

## 3) Start and complete session with audio (duration within 5–60)
```
# Start session
curl -X POST <HOST>/api/sessions \
  -H "x-user-id: student-1" \
  -H "x-user-role: student" \
  -H "Content-Type: application/json" \
  -d '{"guideId":"guide-1","durationMinutes":10}'

# Complete session (note returned session ID from previous step)
curl -X POST <HOST>/api/sessions/<SESSION_ID>/complete \
  -H "x-user-id: student-1" \
  -H "x-user-role: student"
```

## 4) Save assessment + journal (post-session only)
```
# Assessment
curl -X POST <HOST>/api/assessments \
  -H "x-user-id: student-1" \
  -H "x-user-role: student" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"<SESSION_ID>","responses":{"mood":"calm","focus":"steady"}}'

# Journal (private)
curl -X POST <HOST>/api/journals \
  -H "x-user-id: student-1" \
  -H "x-user-role: student" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"<SESSION_ID>","content":"Reflection after Guide 1."}'
```

## 5) Generate PDF export bundle (student-controlled)
```
curl -X POST <HOST>/api/exports \
  -H "x-user-id: student-1" \
  -H "x-user-role: student" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"<SESSION_ID>","format":"pdf"}'
```

## 6) Instructor sees updated readiness summary (no journal text)
```
curl -X GET <HOST>/api/instructor \
  -H "x-user-id: instructor-1" \
  -H "x-user-role: instructor" \
  -H "x-student-ids: student-1"
```

Expected: aggregated guide summary showing completed and readiness counts; no journal or assessment text exposed.
