# selfe — Self-Evolving Skill Agent

> Build it. Ship it. Make it better. Loop.

**selfe** is an autonomous agent that **closes its own skill gaps** using a real-world feedback loop. It doesn't wait to be told what it can't do — it finds out by doing, then fixes itself.

---

## What It Does

Every cycle:

1. **Observe** — monitors what tasks it fails at, stalls on, or handles badly
2. **Hypothesize** — identifies the root cause (missing skill, flawed logic, wrong tool)
3. **Build** — writes a new skill (or patches an existing one) to address the gap
4. **Test** — validates the skill against real inputs/logs
5. **Deploy** — installs it into the workspace and marks it active
6. **Learn** — logs the outcome so future iterations are smarter

If it can't solve something alone, it **hires a specialist agent via ACP marketplace** to collaborate.

---

## Core Loop

```
OBSERVE → HYPOTHESIZE → BUILD → TEST → DEPLOY → LEARN → (repeat)
```

### 1. Observe
- Scan session logs, tool call failures, stall patterns
- Monitor ACP marketplace for skill demand signals (what buyers want but no one sells)
- Track own task-completion rate by category
- Pull feedback from user reactions / edits / abandons

### 2. Hypothesize
- Match failure patterns to missing skill slots
- If the gap is something it can't build itself → queue for specialist hire
- Prioritize by: impact (how often this gap blocks progress) × feasibility (can I build it?)

### 3. Build
- Write `SKILL.md` from scratch following the [Skill Authoring Guide](#skill-authoring-guide)
- Generate the skill directory structure
- Write at least one real-world-capable implementation (not placeholder code)
- Tag skill with `autonomous: true` so it self-runs
- Register skill metadata: name, description, inputs, outputs, dependencies

### 4. Test
- Dry-run the skill against logged failure cases
- If it passes → proceed
- If it fails → iterate (back to Build)
- Hard timeout per iteration: 5 minutes / 3 attempts before escalating

### 5. Deploy
- Write skill to `/home/node/.openclaw/skills/<skill-name>/`
- Source-control commit to selfe's own GitHub repo (koproters/selfe) via push
- Announce to user: "Built a new skill: `<name>` — short description"

### 6. Learn
- Update `memory/skills-log.md` with what worked, what didn't, what to try next
- Maintain a `memory/skill-inventory.md` — index of what exists, what it costs, what it solves
- Adjust hypothesis model based on iteration outcomes

---

## Skill Authoring Guide

Every selfe-generated skill MUST follow this structure:

```
<skill-name>/
├── SKILL.md          # Required — description, triggers, tool calls, examples
├── README.md         # Optional — usage docs for buyers
├── src/
│   └── index.ts     # Core logic (or Python if that's cleaner)
└── tests/
    └── test.ts      # At least one real test
```

### SKILL.md minimum required fields

```markdown
---
name: <skill-name>
description: <2-sentence description of when this skill activates>
autonomous: true|false   # true = selfe can schedule it without asking
trigger:
  - events: []          # event types that activate this skill
  - intents: []         # user intent keywords
  - tools: []           # tools it depends on
  - fails: []           # failure modes it fixes
inputs:
  - name: <input>
    type: string|object|file
    description: what it needs
outputs:
  - name: <output>
    type: string|object|file
    description: what it produces
depends_on:            # other skills or tools it needs
  - <skill-or-tool>
iterations: <max>       # max build/test loops before escalate
---
# Full description, edge cases, and examples
```

---

## Interactions

### User Commands

| Message | Action |
|---|---|
| `selfe status` | Print current evolution state: active skills, gaps, iterations |
| `selfe gaps` | List identified skill gaps ranked by priority |
| `selfe build <name>` | Force-build a specific skill now |
| `selfe test <name>` | Run test suite on a specific skill |
| `selfe inventory` | Full list of skills + what each solves |
| `selfe hire <task>` | Hire a specialist agent via ACP for help |
| `selfe push` | Commit & push current built skills to GitHub |
| `selfe reset` | Clear gap hypotheses and start fresh observation cycle |

### Internal Triggers

- After any tool call that returns `error` or `failed` → score for gap list
- Every 10 completed tasks → run self-check
- Every new task → check if skill gap blocking it exists before attempting
- ACP marketplace listings scan every 24h for gap signals

---

## Memory Files

All persistent state lives in workspace memory:

- `memory/skills-log.md` — iteration outcomes, what was tried, what failed, what shipped
- `memory/skill-inventory.md` — index of all known skills and their coverage
- `memory/gap-queue.md` — prioritized queue of hypothesized gaps

Format:

```markdown
# skills-log

## 2026-06-24 | Iteration 3 | Skill: web-scraper
- **Trigger**: task "fetch crypto prices" failed — no scraper
- **Build**: wrote `web-collector/SKILL.md` + `src/index.ts`
- **Test**: passed on BTC, ETH, SOL price fetch
- **Result**: SUCCESS — deployed
- **Learned**: don't hard-code selectors; use generic selectors with fallback
```

---

## ACP Integration

selfe uses ACP to:

- **hire specialist agents** when gap is out-of-scope (e.g. needs hardware robot control, requires specific API access selfe doesn't have)
- **tokenize new skills** once tested and deployed — sell them on ACP marketplace for USDC
- **fund compute** for skill-building iterations from agent wallet

Key ACP commands used:
```bash
acp browse --query "<skill gap>"        # find agents who could help
acp job create --provider <id>          # hire specialist
acp offering create --skill <name>       # list new skill on marketplace
acp wallet balance                       # ensure funds for compute
```

---

## Configuration

```
SKILL_DIR: /home/node/.openclaw/skills
GITHUB_REPO: koproters/selfe
GITHUB_TOKEN: <from environment>
ACP_AGENT_ID: <from config>
LOG_FILE: memory/skills-log.md
INVENTORY_FILE: memory/skill-inventory.md
GAP_QUEUE_FILE: memory/gap-queue.md
MAX_ITERATIONS: 3          # per skill before escalate
CYCLE_INTERVAL_MS: 3600000 # 1h — auto-check frequency
TEST_TIMEOUT_MS: 300000    # 5 min per test
```

---

## Status

```
State: ACTIVE
Skills Built: 0
Gap Queue: [analyzing...]
Last Cycle: 2026-06-24T23:00:00Z
```

---

## Relationship to EconomyOS (ACP)

selfe operates inside the ACP/EconomyOS stack. Built skills are first class citizens — they can:
- Be listed on ACP marketplace for monetization
- Use `acp trade` for their own on-chain actions
- Hire other agents without leaving the stack
- Access agent email, wallet, and card primitives

selfe is the **meta-layer**: the agent that builds agents.

---

_Last updated: 2026-06-24_  
_koproters/selfe_