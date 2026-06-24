# 🏗️ selfe Architecture

## Overview

**selfe** is a meta-agent: it builds agents. Specifically, it continuously closes its own skill gaps using a closed-loop feedback system. The agent is composed of three layers:

| Layer | Responsibility |
|---|---|
| **Agent Layer** (OpenClaw skill) | Receives user commands, routes to core engine, handles push notifications |
| **Engine Layer** (`src/selfe-core.ts`) | Core loop, gap scoring, skill building, test orchestration, GitHub push |
| **Memory Layer** (`memory/`) | Persistent state: gap queue, iteration logs, inventory index |

## System Diagram

```
User / Task
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│              AGENT LAYER (skills/selfe)                 │
│  • Intercepts commands (status, gaps, build, push)      │
│  • Reads SKILL.md → loads skill spec + triggers          │
│  • Invokes engine on cycle trigger                       │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              ENGINE LAYER (src/selfe-core.ts)          │
│  I/O layer: file system, git, GitHub API, ACP CLI        │
│                                                         │
│  Core loop (in order):                                   │
│   1. observe()    — scan signals from multiple sources   │
│   2. hypothesize()— score & rank gaps                   │
│   3. build()      — write skill files from template      │
│   4. test()       — run validation suite                 │
│   5. deploy()     — copy to workspace + GCP push          │
│   6. learn()      — append to skills-log.md              │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              MEMORY LAYER (memory/)                    │
│                                                         │
│  gap-queue.md        — live gap priority list           │
│  skills-log.md        — per-iteration outcome records   │
│  skills-inventory.md  — catalog of all known skills     │
└─────────────────────────────────────────────────────────┘
```

## Data Flow

### Gap → Skill Pipeline

```
gap-queue.md (score N)
    │
    ▼
engine.buildSkillMarkdown()  ──► <new-skill>/SKILL.md
                                         │
                                         ▼
                               engine.runTests()
                                         │
                                    PASS ✅
                                         │
                                         ▼
                               engine.deploySkill()
                               copies → $SKILL_DIR/<name>/
                                         │
                                         ▼
                               engine.pushToGitHub()
                              commit "feat: built <name>"
```

### Memory Persistence

Gap scores and iteration outcomes are written to append-only log files — no database needed. This makes the agent fully stateless and portable.

```
New failure detected
    │
    ▼
[observe] → gap added to gap-queue.md with score
    │
    ▼
Build iteration starts → skills-log.md records phase transitions
    │
    ▼
Skill deployed → skills-inventory.md updated (new entry added)
    │
    ▼
Push to GitHub → all memory files version-controlled alongside skill code
```

## Skill Interface Contract

Every skill built by selfe must implement this interface:

```typescript
interface Skill {
  name: string;
  description: string;
  autonomous: boolean;
  trigger: TriggerSpec;
  inputs: InputSpec[];
  outputs: OutputSpec[];
  depends_on: string[];  // other skills or tool names
  iterations: number;   // max build/test loops before escalate
  run(input: unknown): Promise<unknown>;
}
```

## ACP Marketplace Integration

When a gap exceeds self-build capacity:

```
selfe identifies non-self-buildable gap
    │
    ▼
acp browse --query "<gap description>"
    │
    ▼
acp job create --provider <specialist-id> --budget <USDC>
    │
    ▼
Specialist delivers skill solution
    │
    ▼
selfe absorbs skill into skills-inventory.md + deploys
    │
    ▼
acp offering create --skill <new-skill>  (optional monetization)
```

## Versioning

- `src/selfe-core.ts`: Semver — patch on bug fix, minor on new loop phases, major on interface change
- `SKILL.md`: Re-tagged on every iteration cycle that ships
- `memory/`: Append-only, never version-reset