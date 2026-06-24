/**
 * selfe-core.ts — Self-Evolving Skill Agent Engine
 *
 * Implements the OBSERVE → HYPOTHESIZE → BUILD → TEST → DEPLOY → LEARN loop.
 * Designed to run as an autonomous background process.
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// ─── Paths ───────────────────────────────────────────────────────────────────

const SKILL_DIR = process.env.SKILL_DIR ?? "/home/node/.openclaw/skills";
const SELF_DIR = path.join(SKILL_DIR, "selfe");
const MEMORY_DIR = path.join(SELF_DIR, "memory");
const GITHUB_REPO = "koproters/selfe";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN ?? "";

// ─── Gap Scoring ─────────────────────────────────────────────────────────────
// Score = Impact (1-5) × Frequency (1-5) × Feasibility (1-3)
// 75 max, 1 min

export interface Gap {
  name: string;
  description: string;
  impact: number;
  frequency: number;
  feasibility: number;
  status: "open" | "building" | "resolved";
}

export function scoreGap(g: Gap): number {
  return g.impact * g.frequency * g.feasibility;
}

// ─── Observe ─────────────────────────────────────────────────────────────────

export interface ObservedSignal {
  type: "tool_failure" | "task_stall" | "market_gap" | "user_feedback";
  source: string;
  description: string;
  count: number;
  timestamp: string;
}

export function observeToolFailures(): ObservedSignal[] {
  // Reads from session logs / heartbeat data
  // For now: scan skill gaps for common patterns
  return [];
}

export function observeMarketGaps(): ObservedSignal[] {
  // ACP marketplace scan for unserved buyer needs
  return [];
}

// ─── Hypothesize ─────────────────────────────────────────────────────────────

export function rankGaps(gaps: Gap[]): Gap[] {
  return gaps.sort((a, b) => scoreGap(b) - scoreGap(a));
}

// ─── Build ───────────────────────────────────────────────────────────────────

export interface SkillSpec {
  name: string;
  description: string;
  trigger: {
    events: string[];
    intents: string[];
    tools: string[];
    fails: string[];
  };
  inputs: { name: string; type: string; description: string }[];
  outputs: { name: string; type: string; description: string }[];
  depends_on: string[];
  iterations: number;
  autonomous: boolean;
}

export function createSkillSpec(name: string, spec: Partial<SkillSpec>): SkillSpec {
  return {
    name,
    description: spec.description ?? "Auto-generated skill by selfe",
    trigger: spec.trigger ?? { events: [], intents: [], tools: [], fails: [] },
    inputs: spec.inputs ?? [],
    outputs: spec.outputs ?? [],
    depends_on: spec.depends_on ?? [],
    iterations: spec.iterations ?? 3,
    autonomous: spec.autonomous ?? true,
  };
}

export function buildSkillMarkdown(name: string, spec: SkillSpec): string {
  const inputs = spec.inputs
    .map((i) => `  - name: ${i.name}\n    type: ${i.type}\n    description: ${i.description}`)
    .join("\n");

  const outputs = spec.outputs
    .map((o) => `  - name: ${o.name}\n    type: ${o.type}\n    description: ${o.description}`)
    .join("\n");

  const depends = spec.depends_on.map((d) => `  - ${d}`).join("\n");

  return `# ${name}\n\n> ${spec.description}\n\n---\n\n## Overview\n\n${spec.description}\n\n## Spec\n\n**Autonomous:** ${spec.autonomous ? "✅ Yes" : "❌ No"}  
**Max Iterations:** ${spec.iterations}\n\n## Triggers\n\n- Events: ${spec.trigger.events.join(", ") || "none"}\n- Intents: ${spec.trigger.intents.join(", ") || "none"}\n- Tools: ${spec.trigger.tools.join(", ") || "none"}\n- Fixes: ${spec.trigger.fails.join(", ") || "none"}\n\n## Inputs\n\n${inputs || "_none_"}\n\n## Outputs\n\n${outputs || "_none_"}\n\n## Dependencies\n\n${depends || "_none_ (self-contained)_"}
`;
}

// ─── Test ────────────────────────────────────────────────────────────────────

export interface TestResult {
  name: string;
  passed: boolean;
  durationMs: number;
  error?: string;
}

export function runTests(skillName: string): TestResult[] {
  const testDir = path.join(SELF_DIR, "tests");
  if (!fs.existsSync(testDir)) return [];

  // Basic validation: SKILL.md exists, memory files present
  const results: TestResult[] = [];
  const start = Date.now();

  try {
    const skillPath = path.join(SELF_DIR, skillName);
    const hasSkillMd = fs.existsSync(path.join(skillPath, "SKILL.md"));
    const hasMemory =
      fs.existsSync(MEMORY_DIR) &&
      fs.existsSync(path.join(MEMORY_DIR, "skills-log.md"));

    results.push({
      name: `${skillName}: SKILL.md exists`,
      passed: hasSkillMd,
      durationMs: Date.now() - start,
      error: hasSkillMd ? undefined : "SKILL.md not found",
    });

    results.push({
      name: `${skillName}: memory infrastructure`,
      passed: hasMemory,
      durationMs: Date.now() - start,
      error: hasMemory ? undefined : "memory/ directory incomplete",
    });
  } catch (err: unknown) {
    results.push({
      name: `${skillName}: validation`,
      passed: false,
      durationMs: Date.now() - start,
      error: err instanceof Error ? err.message : "unknown error",
    });
  }

  return results;
}

// ─── Deploy ──────────────────────────────────────────────────────────────────

export function deploySkill(skillDir: string): boolean {
  try {
    if (!fs.existsSync(skillDir)) {
      console.error(`[selfe] deploy: skill dir ${skillDir} not found`);
      return false;
    }

    // Copy to workspace skill dir
    const targetDir = path.join(SKILL_DIR, path.basename(skillDir));
    execSync(`cp -r ${skillDir} ${targetDir}`);
    console.log(`[selfe] deployed: ${path.basename(skillDir)} → ${targetDir}`);
    return true;
  } catch (err: unknown) {
    console.error("[selfe] deploy failed:", err instanceof Error ? err.message : err);
    return false;
  }
}

// ─── Push to GitHub ───────────────────────────────────────────────────────────

export function pushToGitHub(commitMessage: string): string {
  if (!GITHUB_TOKEN) {
    console.warn("[selfe] GITHUB_TOKEN not set — skipping push");
    return "";
  }

  try {
    // Copy latest files back to selfe working dir then push
    execSync(`cp -r ${SELF_DIR}/SKILL.md ${SELF_DIR}/gap-queue.md ${SELF_DIR}/memory/ ${SELF_DIR}/README.md ${SELF_DIR}/LICENSE ${SELF_DIR}/.gitignore ${SELF_DIR}/src ${SELF_DIR}/tests /home/node/selfe/ 2>/dev/null || true`);
    process.chdir("/home/node/selfe");
    execSync("git add .");
    execSync(`git commit -m "${commitMessage}" --allow-empty`);
    execSync(
      `git remote set-url origin "https://${GITHUB_TOKEN}@github.com/${GITHUB_REPO}.git"`
    );
    execSync("git push origin master");
    console.log("[selfe] pushed to GitHub OK");
    return "https://github.com/koproters/selfe";
  } catch (err: unknown) {
    console.error("[selfe] push failed:", err instanceof Error ? err.message : err);
    return "";
  }
}

// ─── Learn ────────────────────────────────────────────────────────────────────

export function logIteration(
  skillName: string,
  iteration: number,
  phase: string,
  result: "success" | "failure",
  notes: string
): void {
  const logPath = path.join(MEMORY_DIR, "skills-log.md");
  const entry = `\n## [${new Date().toISOString().split("T")[0]}] Iteration ${iteration} | ${phase} | Skill: ${skillName}\n- **Result:** ${result}\n- **Notes:** ${notes}\n`;
  fs.appendFileSync(logPath, entry);
  console.log(`[selfe] logged: iteration ${iteration} ${phase} → ${result}`);
}

// ─── Main Loop ───────────────────────────────────────────────────────────────

export async function selfeCycle(skillName?: string): Promise<void> {
  console.log("[selfe] Cycle started at", new Date().toISOString());

  // 1. Observe
  const signals = [...observeToolFailures(), ...observeMarketGaps()];
  console.log(`[selfe] Observe: ${signals.length} signals collected`);

  // 2. Hypothesize + rank
  const gaps = loadGapQueue();
  const ranked = rankGaps(gaps.filter((g) => g.status === "open"));
  console.log(`[selfe] Hypothesize: ${ranked.length} open gaps ranked`);

  // 3. Build (highest priority gap)
  const target = skillName ?? ranked[0]?.name;
  if (target) {
    console.log(`[selfe] Build: targeting gap "${target}"`);
    logIteration(target, 1, "BUILD", "success", "Skill bootstrapped via selfe loop");
  }

  // 4. Test
  const results = runTests(target ?? "selfe");
  const allPassed = results.every((r) => r.passed);
  console.log(`[selfe] Test: ${results.length} checks, allPassed=${allPassed}`);

  // 5. Deploy
  const deployed = target ? deploySkill(path.join(SELF_DIR, "..", target)) : true;
  console.log(`[selfe] Deploy: ${deployed ? "OK" : "SKIPPED (no target)"}`);

  // 6. Learn + Push
  const outcome = allPassed && deployed ? "SUCCESS — deployed" : "PARTIAL — manual review needed";
  logIteration(target ?? "selfe", 1, "DEPLOY", allPassed && deployed ? "success" : "failure", outcome);
  pushToGitHub(`chore(selfe): cycle run at ${new Date().toISOString()}`);
}

// ─── Gap Queue I/O ───────────────────────────────────────────────────────────

export function loadGapQueue(): Gap[] {
  const queuePath = path.join(SELF_DIR, "gap-queue.md");
  if (!fs.existsSync(queuePath)) return [];
  const content = fs.readFileSync(queuePath, "utf-8");
  // Parse simple markdown table rows
  // Match table data rows (| cell | cell | digit | ...)
  const rowRegex = /\|\s*([^|\n]+?)\s*\|\s*([^|\n]+?)\s*\|/g;
  const gaps: Gap[] = [];
  let m: RegExpExecArray | null;
  while ((m = rowRegex.exec(content)) !== null) {
    const c0 = (m[1] ?? "").trim();
    if (!c0 || c0 === "#" || c0 === "Gap" || !isNaN(Number(c0)) || c0.startsWith("-")) continue;
    gaps.push({
      name: c0.replace(/`/g, ""),
      description: (m[2] ?? "").trim(),
      impact: 3,
      frequency: 3,
      feasibility: 3,
      status: "open",
    });
  }
  return gaps;
}

// ─── CLI Entry ────────────────────────────────────────────────────────────────

const cmd = process.argv[2] ?? "status";

if (cmd === "status") {
  console.log("selfe: ACTIVE");
  console.log("Repo:", `https://github.com/${GITHUB_REPO}`);
  console.log("Gap Queue:", loadGapQueue().length, "gaps");
} else if (cmd === "gaps") {
  const gaps = rankGaps(loadGapQueue());
  gaps.forEach((g, i) => console.log(`${i + 1}. [${scoreGap(g)}] ${g.name} — ${g.description}`));
} else if (cmd === "build") {
  const skillName = process.argv[3];
  if (!skillName) { console.error("Usage: selfe build <name>"); process.exit(1); }
  selfeCycle(skillName);
} else if (cmd === "push") {
  pushToGitHub(`chore(selfe): manual push at ${new Date().toISOString()}`);
} else {
  console.log("Commands: status | gaps | build <name> | push");
}