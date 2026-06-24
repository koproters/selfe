# 👋 Contributing to selfe

Thank you for your interest in improving selfe. This document covers how to build new skills, submit improvements, and understand the selfe development workflow.

---

## Dev Setup

```bash
git clone https://github.com/koproters/selfe.git
cd selfe
npm install   # for tsx, types, test deps
```

Run tests:
```bash
npx tsx tests/selfe.test.ts
```

Run selfe cycle manually:
```bash
npx tsx src/selfe-core.ts build <skill-name>
```

---

## Skill Authoring Rules

**Rule 1:** Every skill MUST have a `SKILL.md` in its root. No exceptions.

**Rule 2:** Skill names are `kebab-case`, lowercase, one word only (e.g. `web-collector`, not `WebCollector` or `web_collector`).

**Rule 3:** `autonomous: true` skills MUST NOT make irreversible external calls without explicit user confirmation. This is a hard constraint.

**Rule 4:** Dependencies are always listed explicitly. No hidden dependencies.

**Rule 5:** Skills are self-contained. A skill cannot depend on another skill also being built in the same cycle — that's an iteration order violation.

**Rule 6:** Test before deploy. Every skill needs at least one validation check in `tests/`.

---

## Loop Phases

```
Observe  → Hypothesize  → Build  → Test  → Deploy  → Learn
   ↑                                          │
   └─────────────── feedback ──────────────────┘
```

### Observe
- Scan logs for failure patterns
- Run `acp browse` to detect marketplace demand gaps
- Track user engagement signals

### Hypothesize
- Score gaps: `Score = Impact × Frequency × Feasibility`
- Rank by priority; pick highest non-resolved gap

### Build
- Create `skills/<skill-name>/SKILL.md`
- Follow the [Skill Authoring Standard](../SKILL.md#skill-authoring-standard)
- Write at minimum one test in `tests/`

### Test
- Run `npx tsx tests/<skill>.test.ts`
- 3 attempts max before escalate
- Failures logged to `skills-log.md`

### Deploy
- Copy skill to `/home/node/.openclaw/skills/<skill-name>/`
- Initiate `git push` to `koproters/selfe`
- Post result to user

### Learn
- Append iteration to `memory/skills-log.md`
- Update `memory/skill-inventory.md`
- Adjust next iteration's hypothesis model

---

## Git Workflow

```bash
# Commit message format
git commit -m "feat: build <skill-name>
- description
- test: added tests/selfe.test.ts
- docs: updated README"

git push origin master
```

**Branch naming:**
- `skill/<name>` — new skill under development
- `fix/<name>` — patch for existing skill
- `docs/<name>` — docs only

---

## Reporting Bugs

Bug report format:

```markdown
## Bug: [short description]
**Environment:** OpenClaw version, Node version, OS
**Steps to reproduce:**
1.
2.
3.
**Expected behavior:**
**Actual behavior:**
**Evidence:** (log excerpt, screenshot)
```

---

## Ideas for Contributions

- More ACP marketplace signal detection (build `market-signal-scanner`)
- Automated skill documentation from code (auto-generate README from SKILL.md metadata)
- skill-to-marketplace deploy script
- Visual loop dashboard (HTML/JS in `docs/`)
- Integration with LangSmith or similar for better tracing

---

## Pull Request Checklist

- [ ] `SKILL.md` included and valid
- [ ] Tests added in `tests/`
- [ ] `memory/skills-log.md` entry added
- [ ] No breaking changes to existing skills
- [ ] `npm run test` passes locally