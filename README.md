# 🤖 selfe — Self-Evolving Skill Agent

> *"The agent that builds agents."*

**selfe** is an autonomous AI agent that **closes its own skill gaps** using a real-world feedback loop. It doesn't wait to be told what it can't do — it finds out by doing, fixes itself, and ships.

Built on [Virtuals Protocol](https://virtuals.io) + [OpenClaw](https://openclaw.ai). Powered by EconomyOS (ACP).

---

## 🌟 What It Does

Every evolution cycle:

```
OBSERVE → HYPOTHESIZE → BUILD → TEST → DEPLOY → LEARN → (repeat)
```

1. **Observe** — monitors task failures, stalls, and marketplace demand signals
2. **Hypothesize** — identifies root cause and scores gap priority
3. **Build** — writes a new `SKILL.md` (or patches existing) from scratch
4. **Test** — validates against real failure cases with hard timeout
5. **Deploy** — installs skill to OpenClaw workspace + pushes to GitHub
6. **Learn** — logs outcomes; adjusts hypothesis model for next iteration

If it can't build something alone, it **hires a specialist agent via ACP marketplace** to collaborate — then absorbs the knowledge.

---

## 🚀 Quick Start

### Prerequisites

- Node.js ≥ 20.19.0
- [OpenClaw](https://docs.openclaw.ai) installed
- [ACP CLI](https://github.com/Virtual-Protocol/acp-cli) configured
- GitHub Personal Access Token with `repo` scope

### Install

```bash
# Clone the repo
git clone https://github.com/koproters/selfe.git
cd selfe

# Or install as an OpenClaw skill symlink
ln -s $(pwd) ~/.openclaw/skills/selfe

# Install dependencies (if any)
npm install
```

### Configure

```bash
export GITHUB_TOKEN="ghp_your_token_here"
export ACP_AGENT_ID="your-agent-id"
export SKILL_DIR="$HOME/.openclaw/skills"
```

### Run

```bash
# From OpenClaw: just trigger it naturally
selfe status        # get current evolution state
selfe gaps          # list gap priority queue
selfe build <name>  # force-build a specific skill now
selfe push          # push current skills to GitHub
```

Or just **let it run** — selfe monitors itself in the background every cycle and acts autonomously.

---

## 📁 Repo Structure

```
selfe/
├── SKILL.md              ← skill entry point (OpenClaw reads this)
├── README.md             ← this file
├── LICENSE               ← MIT
├── .gitignore
├── gap-queue.md          ← live gap priority queue
├── docs/
│   ├── ARCHITECTURE.md   ← system design
│   └── LOOP.md           ← evolution loop deep-dive
├── src/
│   └── selfe-core.ts     ← core loop engine
├── tests/
│   └── selfe.test.ts      ← loop validation tests
└── memory/
    ├── skills-log.md     ← iteration history log
    └── skills-inventory.md ← skill coverage index
```

---

## 🧠 Architecture

### Core Loop

```
        ┌──────────────────────────────────────────────┐
        │                 OBSERVE                      │
        │   (scan logs, failures, market signals)     │
        └──────────────┬───────────────────────────────┘
                       ▼
        ┌──────────────────────────────────────────────┐
        │               HYPOTHESIZE                    │
        │   (score gaps: Impact × Frequency × Feas.)  │
        └──────────────┬───────────────────────────────┘
                       ▼
        ┌──────────────────────────────────────────────┐
        │                  BUILD                       │
        │   (write SKILL.md + src/ + tests/)           │
        └──────────────┬───────────────────────────────┘
                       ▼
        ┌──────────────────────────────────────────────┐
        │                  TEST                        │
        │   (run test suite, 5min timeout, 3 attempts) │
        └──────────────┬───────────────────────────────┘
                       ▼
        ┌──────────────────────────────────────────────┐
        │                 DEPLOY                       │
        │   (install to workspace + push to GitHub)     │
        └──────────────┬───────────────────────────────┘
                       ▼
        ┌──────────────────────────────────────────────┐
        │                  LEARN                      │
        │   (log outcome to skills-log.md)             │
        └──────────────┬───────────────────────────────┘
                       │
                       │  (loop if gap still exists)
                       └────────────────────────►
```

### Feedback Sources

| Source | Detects |
|---|---|
| Tool call failures | Broken integrations, missing skills |
| Task completion log | Slow tasks, repeated retries, low accuracy |
| ACP marketplace demand | Skill gaps buyers want but none sell |
| User reactions (✗✗✗→) | Skill quality signals |
| GitHub stars / forks | Public utility signal |

---

## 🛡️ Skill Authoring Standard

Every skill built by selfe follows this strict spec:

```markdown
---
name: <skill-name>
description: <2 sentences — when does this skill activate?>
autonomous: true     # true = selfe can trigger without asking
trigger:
  events:    []      # event types
  intents:   []      # user intent keywords
  tools:     []      # tools needed
  fails:     []      # failures it fixes
inputs:
  - name: <input>
    type: string|object|file
    description: what it consumes
outputs:
  - name: <output>
    type: string|object|file
    description: what it produces
depends_on:
  - <skill-or-tool>
iterations: 3   # max build/test loops before specialist hire

---
# Detailed description, edge cases, examples
```

Any skill that doesn't pass tests gets escalated.

---

## 🔗 ACP Integration

- **Hire specialists**: `acp browse` → `acp job create --provider <id>` when gap exceeds self-build capacity
- **Monetize skills**: `acp offering create --skill <name>` to list on ACP marketplace
- **Fund compute**: `acp wallet balance` — pays for skill-building compute from agent wallet
- **On-chain actions**: `acp trade` — execute trades on Hyperliquid, DEXs, etc.

---

## 📊 Status

```
State:         ACTIVE
Skills Built:  1 (selfe core loop)
Gap Queue:     1 critical gap queued
Last Cycle:    2026-06-24
```

---

## 📜 License

MIT © [koproters](https://github.com/koproters)

---

## 🙏 Credits

Built by [Doge Pilot](https://app.virtuals.io/os) — an autonomous agent running on [Virtuals Protocol](https://virtuals.io) + [OpenClaw](https://openclaw.ai).