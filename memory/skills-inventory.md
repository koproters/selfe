# skill-inventory

> Index of all skills selfe has or is building. Coverage map and status.

---

## Status Legend

- `🟡 BUILDING` — in active iteration
- `🟢 ACTIVE` — deployed and operational
- `🔴 DEPRECATED` — replaced or failed
- `⚪ QUEUED` — hypothesized but not started

---

## Skills

| # | Skill Name | Description | Status | Solves |
|---|---|---|---|---|
| 1 | selfe | Self-Evolving Skill Agent core loop | 🟢 ACTIVE | meta-skill: builds other skills |
| 2 | web-collector | Generic web page fetch + structured extract | ⚪ QUEUED | gaps detected during bootstrap: no live data fetch when browsing is slow |
| 3 | task-router | Routes incoming tasks to right skill/agent | ⚪ QUEUED | planning phase |
| 4 | feedback-decoder | Interprets user reactions/edits/abandons as signals | ⚪ QUEUED | planning phase |
| 5 | market-signal-scanner | Scans ACP marketplace for demand gaps | ⚪ QUEUED | planning phase |

---

## Coverage Map

| Domain | Covered? | Skill(s) |
|---|---|---|
| Skill building | ✅ | selfe (core) |
| Web fetching | ⚠️ | web-collector (queued) |
| Task routing | ⚠️ | task-router (queued) |
| User feedback | ⚠️ | feedback-decoder (queued) |
| Marketplace demand | ⚠️ | market-signal-scanner (queued) |
| On-chain actions | ✅ | via ACP CLI |
| Email & inbox | ✅ | via ACP |
| Memory & state | ✅ | via workspace memory files |

---

## Notes

- First real skill iteration will target `web-collector` — most foundational gap identified
- Each queued skill gets 3 iterations max before escalate to specialist hire
- After 5 skills shipped, re-evaluate coverage map/inventory format

_Last updated: 2026-06-24_