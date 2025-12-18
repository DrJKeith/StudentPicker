# Beta Defects List (Likely Breakpoints)

- Auth boundary: dev-only header injection; missing real auth/session store could allow header spoofing. Mitigation: integrate proper auth provider before production.
- Role enforcement: relies on headers; instructor student-id scoping via header may be misconfigured. Mitigation: enforce enrollment-based scoping and server-side role checks.
- Exports: PDF generation stub; path handling and file persistence not implemented. Mitigation: implement secure storage and signed download URLs; validate session ownership before generation.
- Readiness accuracy: placeholder readiness returns ready=true after completion; needs real thresholds. Mitigation: implement configurable readiness rules per guide with server-side checks.
- Audio caching: elevenlabs integration stubbed; cost controls and caching not implemented. Mitigation: add server-side cache and preflight cost notices before API calls.
- Data persistence: in-memory stores for sessions/assessments/journals/exports lose data on restart. Mitigation: wire to PostgreSQL schema with migrations before beta rollout.
- Input validation: minimal validation on assessment/journal payloads. Mitigation: add schema validation and length limits to prevent injection and oversized payloads.
