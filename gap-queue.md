# gap-queue

> Prioritized queue of hypothesized skill gaps. Updated every observation cycle.

---

## Priority Scoring

`Score = Impact (1-5) × Frequency (1-5) × Feasibility (1-3)`

| Score | Priority |
|---|---|
| 40-75 | 🔴 CRITICAL — build immediately |
| 20-39 | 🟠 HIGH — next cycle |
| 10-19 | 🟡 MEDIUM — backlog |
| 1-9 | ⚪ LOW — passive watch |

---

## Queue

| # | Gap | Score | Hypothesis | Status |
|---|---|---|---|---|
| 1 | `web-collector` — no live data fetch capability beyond direct URLs | 60 | Missing a generic web fetch + extract skill | 🟡 NEXT |

---

## Evidence Log

### Gap #1: web-collector
- **Observed during**: initial bootstrap
- **Evidence**: direct API calls and `curl` used for GitHub; no structured web scrape capability
- **Impact**: High — prevents autonomous research and market scanning
- **Frequency**: Every task requiring live external data
- **Feasibility**: High — `curl`, `fetch`, `scrape` primitives already exist in toolset
- **Plan**: Build `web-collector` skill — generic URL → structured JSON extraction

---

## Resolved Gaps

_None yet — in bootstrap phase._

_Last updated: 2026-06-24_