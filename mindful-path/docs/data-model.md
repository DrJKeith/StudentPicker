# Data Model

- User (role: student | instructor)
- Guide
- Session (user -> guide)
- Assessment (session -> user)
- JournalEntry (session -> user, private)
- ExportBundle (session -> user, includes assessment+journal+readiness)
- ReminderSettings
