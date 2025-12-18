# Mindful Path Internal Contract (Immutable until explicitly revised)

## Invariants (must never be violated)
- All meditation content originates solely from instructor-uploaded Guides; no generation, invention, or paraphrasing.
- Student data remains student-owned; instructor access is read-only and excludes journal text and assessments by default.
- Duration bounds for sessions are enforced: minimum 5 minutes, maximum 60 minutes for any guided session.
- Readiness evaluation follows readiness-based logic only; no streaks, rewards, or gamification elements are allowed.
- Exports must include only the student’s own data and maintain linkage among session metadata, assessments, journals, and readiness state.
- Privacy defaults are conservative: sharing or visibility beyond the student requires explicit student action or institutional policy override.

## Out-of-Scope Behaviors
- Mental health diagnostics, therapeutic claims, or wellness scoring.
- Gamification features (streaks, points, badges, leaderboards).
- Instructor editing or deleting any student data.
- Automatic sharing of journals or assessments with instructors without explicit student consent.
- AI-generated meditation guidance or filler content beyond canonical Guides.

## Non-Negotiable Data Ownership Rules
- Students can delete their own data; no other role may delete student data on their behalf.
- Instructors have read-only visibility limited to aggregates and readiness indicators; journals and assessment text remain private by default.
- Export bundles are student-controlled artifacts; instructor access to exports is opt-in by the student or governed by course policy explicitly captured in system configuration.
- All data retention and visibility choices default to the most privacy-preserving option unless a student explicitly opts in otherwise.

## Progression Conditions (allow/block)
- Allow progression when readiness engine confirms readiness for the next Guide based on completed session(s) meeting duration bounds and required reflection/assessment completion.
- Block progression if minimum duration (5 minutes) not met, required assessment or reflection is missing, or readiness engine signals not ready for the next Guide.
- Block instructor-triggered progression changes; only readiness logic informed by student activity may advance state.
- Allow retries or additional practice without penalizing readiness; ensure pauses or adaptations do not bypass minimum criteria.
