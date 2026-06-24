/**
 * selfe.test.ts — Loop validation tests
 * Run: npx tsx tests/selfe.test.ts
 */

import { scoreGap, rankGaps, createSkillSpec, buildSkillMarkdown, runTests } from "../src/selfe-core";
import { strict as assert } from "assert";

console.log("🧪 Running selfe tests...\n");

// ── Scoring ──────────────────────────────────────────────────────────────────

const testGap1 = { name: "web-collector", description: "fetch & parse", impact: 5, frequency: 4, feasibility: 3, status: "open" as const };
const testGap2 = { name: "memory-broadcaster", description: "cross-session context", impact: 1, frequency: 1, feasibility: 3, status: "open" as const };

assert.equal(scoreGap(testGap1), 60, "web-collector score should be 60");
assert.equal(scoreGap(testGap2), 3, "memory-broadcaster score should be 3");
console.log("  ✅ scoreGap: correct");

// ── Ranking ───────────────────────────────────────────────────────────────────

const ranked = rankGaps([testGap2, testGap1]);
assert.equal(ranked[0].name, "web-collector", "highest score first");
assert.equal(ranked[1].name, "memory-broadcaster", "lowest score last");
console.log("  ✅ rankGaps: ordering correct");

// ── Skill Spec ────────────────────────────────────────────────────────────────

const spec = createSkillSpec("test-skill", {
  description: "Test skill for validation",
  inputs: [{ name: "url", type: "string", description: "Target URL" }],
  outputs: [{ name: "data", type: "object", description: "Extracted data" }],
  depends_on: ["web-collector"],
  iterations: 3,
  autonomous: true,
});

assert.equal(spec.name, "test-skill");
assert.equal(spec.inputs[0].name, "url");
assert.equal(spec.outputs[0].name, "data");
assert.equal(spec.depends_on[0], "web-collector");
assert.equal(spec.autonomous, true);
console.log("  ✅ createSkillSpec: defaults correct");

// ── Markdown Generation ────────────────────────────────────────────────────────

const md = buildSkillMarkdown("test-skill", spec);
assert.ok(md.includes("test-skill"), "includes skill name");
assert.ok(md.includes("url"), "includes input field");
assert.ok(md.includes("data"), "includes output field");
assert.ok(md.includes("web-collector"), "includes dependency");
console.log("  ✅ buildSkillMarkdown: output valid");

// ── Test Runner ────────────────────────────────────────────────────────────────

const results = runTests("selfe");
const names = results.map((r) => r.name);
assert.ok(names.some((n) => n.includes("SKILL.md")), "checks SKILL.md");
assert.ok(names.some((n) => n.includes("memory")), "checks memory/");
console.log("  ✅ runTests: checks correct files");

// ── Summary ───────────────────────────────────────────────────────────────────

const passed = results.filter((r) => r.passed).length;
console.log(`\n✅ All tests passed (${passed}/${results.length} checks)`);
console.log("selfe core: operational\n");
process.exit(0);