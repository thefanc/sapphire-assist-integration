/**
 * Repeat + parallel runner for the Assist Manager smoke suite.
 *
 * Runs `bun tests/assist-rls-smoke.mjs` several times concurrently, several
 * rounds in a row, all against the real backend. Every worker uses its own
 * fresh session/approval/transfer records, so concurrent consoles exercise the
 * same RLS policies at the same time — which is exactly where flakiness and
 * order-dependent policy bugs show up.
 *
 *   bun tests/assist-rls-stress.mjs
 *   SMOKE_ROUNDS=5 SMOKE_CONCURRENCY=6 bun tests/assist-rls-stress.mjs
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const SMOKE = fileURLToPath(new URL("./assist-rls-smoke.mjs", import.meta.url));
const ROUNDS = Number(process.env["SMOKE_ROUNDS"] ?? 3);
const CONCURRENCY = Number(process.env["SMOKE_CONCURRENCY"] ?? 4);

function runOnce(label) {
  return new Promise((resolve) => {
    const started = Date.now();
    const child = spawn(process.execPath, [SMOKE], { stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    child.stdout.on("data", (c) => { out += c; });
    child.stderr.on("data", (c) => { out += c; });
    child.on("close", (exitCode) => {
      const checks = [...out.matchAll(/^ {2}(PASS|FAIL) {2}(.+?)(?: expected the backend.*)?$/gm)]
        .map((m) => ({ status: m[1], name: m[2].trim() }));
      const summary = out.match(/(\d+) passed, (\d+) failed/);
      resolve({
        label,
        exitCode,
        durationMs: Date.now() - started,
        passed: summary ? Number(summary[1]) : 0,
        failed: summary ? Number(summary[2]) : checks.length ? checks.filter((c) => c.status === "FAIL").length : -1,
        checks,
        output: out,
      });
    });
  });
}

console.log(
  `\nAssist Manager smoke suite — ${ROUNDS} round(s) x ${CONCURRENCY} concurrent run(s) ` +
    `= ${ROUNDS * CONCURRENCY} full passes against the real backend\n`,
);

const runs = [];
for (let round = 1; round <= ROUNDS; round += 1) {
  const batch = await Promise.all(
    Array.from({ length: CONCURRENCY }, (_, i) => runOnce(`round ${round} / worker ${i + 1}`)),
  );
  for (const r of batch) {
    console.log(
      `  ${r.failed === 0 && r.exitCode === 0 ? "OK  " : "BAD "} ${r.label.padEnd(24)} ` +
        `${r.passed} passed, ${r.failed} failed  (${(r.durationMs / 1000).toFixed(1)}s)`,
    );
  }
  runs.push(...batch);
}

/* ------------------------------- determinism ------------------------------ */
const baseline = runs[0];
const signature = (r) => r.checks.map((c) => `${c.status} ${c.name}`).join("\n");
const baseSig = signature(baseline);

const drifted = runs.filter((r) => signature(r) !== baseSig);
const broken = runs.filter((r) => r.exitCode !== 0 || r.failed !== 0);

console.log("\ndeterminism");
console.log(`  checks per run:      ${baseline.checks.length}`);
console.log(`  runs completed:      ${runs.length}`);
console.log(`  runs with failures:  ${broken.length}`);
console.log(`  runs that drifted:   ${drifted.length}`);

if (drifted.length) {
  const baseMap = new Map(baseline.checks.map((c) => [c.name, c.status]));
  const seen = new Set();
  for (const r of drifted) {
    for (const c of r.checks) {
      const before = baseMap.get(c.name);
      const key = `${c.name}:${before}->${c.status}`;
      if (before !== c.status && !seen.has(key)) {
        seen.add(key);
        console.log(`    flaky: "${c.name}" was ${before ?? "absent"}, became ${c.status}`);
      }
    }
    for (const name of baseMap.keys()) {
      if (!r.checks.some((c) => c.name === name) && !seen.has(`missing:${name}`)) {
        seen.add(`missing:${name}`);
        console.log(`    missing: "${name}" did not run in ${r.label}`);
      }
    }
  }
}

if (broken.length) {
  console.log(`\nfirst failing run output (${broken[0].label}):\n`);
  console.log(broken[0].output);
}

const ok = broken.length === 0 && drifted.length === 0;
console.log(
  `\n${ok ? "stable" : "UNSTABLE"} — ${runs.length} runs, ${broken.length} failing, ${drifted.length} non-deterministic\n`,
);
process.exit(ok ? 0 : 1);
