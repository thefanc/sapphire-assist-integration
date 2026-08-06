/**
 * Assist Manager end-to-end smoke test — runs against the real backend with the
 * public (anon) key, exactly like the browser console does. No mocks.
 *
 *   bun tests/assist-rls-smoke.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, "")];
    }),
);

const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY;
const db = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
  global: {
    fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      headers.delete("Authorization");
      headers.set("apikey", key);
      return fetch(input, { ...init, headers });
    },
  },
});

let pass = 0;
let fail = 0;
const log = (ok, name, extra = "") => {
  if (ok) { pass += 1; console.log(`  PASS  ${name}`); }
  else { fail += 1; console.log(`  FAIL  ${name} ${extra}`); }
};
const allow = async (name, p) => { const r = await p; log(!r.error, name, r.error?.message ?? ""); return r; };
const deny = async (name, p) => {
  const r = await p;
  const blocked = Boolean(r.error) || (Array.isArray(r.data) && r.data.length === 0);
  log(blocked, name, "expected the backend to refuse this action but it succeeded");
  return r;
};
const code = (p, n = 6) => {
  const a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return `${p}-${Array.from({ length: n }, () => a[Math.floor(Math.random() * a.length)]).join("")}`;
};

console.log("\nAssist Manager smoke test — real backend, public role\n");

/* ---------------------------------- view --------------------------------- */
console.log("view");
const tables = [
  "assist_sessions", "assist_agents", "assist_end_users", "assist_session_requests",
  "assist_approvals", "assist_chat_messages", "assist_file_transfers",
  "assist_session_windows", "assist_ai_suggestions", "assist_emergency_stops",
  "assist_privacy_controls", "assist_access_modes", "assist_settings", "assist_control_state",
];
for (const t of tables) await allow(`read ${t}`, db.from(t).select("*").limit(5));

const { data: agents } = await db.from("assist_agents").select("id").limit(1);
const { data: users } = await db.from("assist_end_users").select("id").limit(1);
const agentId = agents?.[0]?.id;
const endUserId = users?.[0]?.id;
log(Boolean(agentId && endUserId), "seed agents and end users exist");

/* --------------------------------- create -------------------------------- */
console.log("\ncreate assist");
const { data: session } = await allow(
  "create session",
  db.from("assist_sessions").insert({
    session_code: code("SVL"), end_user_id: endUserId, agent_id: agentId,
    assist_type: "support", access_mode: "view_only", status: "pending",
    purpose: "Smoke test session", permissions: ["screen_view"],
  }).select("id, session_code").single(),
);
const sessionId = session?.id;

const { data: approval } = await allow(
  "create approval",
  db.from("assist_approvals").insert({
    approval_code: code("APR", 4), session_id: sessionId, agent_id: agentId,
    end_user_id: endUserId, assist_type: "support", scope: "View + Chat",
  }).select("id").single(),
);
await allow("create control state", db.from("assist_control_state").insert({ session_id: sessionId, control_mode: "view" }));

/* --------------------------------- approve -------------------------------- */
console.log("\napprove");
await allow("approve pending approval", db.from("assist_approvals")
  .update({ status: "approved", decided_at: new Date().toISOString() }).eq("id", approval?.id).select("id").single());
await deny("re-decide an already-decided approval", db.from("assist_approvals")
  .update({ status: "rejected" }).eq("id", approval?.id).select("id"));
await allow("activate session", db.from("assist_sessions")
  .update({ status: "active", started_at: new Date().toISOString() }).eq("id", sessionId).select("id").single());

/* -------------------------------- transfer -------------------------------- */
console.log("\ntransfer");
const { data: transfer } = await allow("create file transfer", db.from("assist_file_transfers").insert({
  transfer_code: code("FT", 4), session_id: sessionId, file_name: "smoke.log",
  size_bytes: 2048, direction: "send", status: "pending", progress: 0,
}).select("id").single());
await allow("advance transfer", db.from("assist_file_transfers")
  .update({ status: "completed", progress: 100 }).eq("id", transfer?.id).select("id").single());
await deny("reopen a completed transfer", db.from("assist_file_transfers")
  .update({ status: "in_progress", progress: 10 }).eq("id", transfer?.id).select("id"));

/* ---------------------------------- chat ---------------------------------- */
console.log("\nchat");
await allow("send chat message", db.from("assist_chat_messages")
  .insert({ session_id: sessionId, sender: "agent", body: "Smoke test message" }));

/* --------------------------- toggles: privacy etc -------------------------- */
console.log("\ntoggles");
const { data: privacy } = await db.from("assist_privacy_controls").select("id, is_critical, enabled");
const critical = privacy?.find((p) => p.is_critical);
const optional = privacy?.find((p) => !p.is_critical);
if (critical) await deny("disable a critical privacy control", db.from("assist_privacy_controls")
  .update({ enabled: false }).eq("id", critical.id).select("id"));
if (optional) {
  await allow("toggle a non-critical privacy control off", db.from("assist_privacy_controls")
    .update({ enabled: false }).eq("id", optional.id).select("id").single());
  await allow("toggle it back on", db.from("assist_privacy_controls")
    .update({ enabled: true }).eq("id", optional.id).select("id").single());
}

const { data: modes } = await db.from("assist_access_modes").select("id, is_active").limit(1);
if (modes?.[0]) await allow("toggle access mode", db.from("assist_access_modes")
  .update({ is_active: !modes[0].is_active }).eq("id", modes[0].id).select("id").single());

const { data: settings } = await db.from("assist_settings").select("id, value, is_locked");
const unlocked = settings?.find((s) => !s.is_locked);
const locked = settings?.find((s) => s.is_locked);
if (unlocked) await allow("update unlocked setting", db.from("assist_settings")
  .update({ value: unlocked.value }).eq("id", unlocked.id).select("id").single());
if (locked) await deny("update locked setting", db.from("assist_settings")
  .update({ value: "tampered" }).eq("id", locked.id).select("id"));

await allow("update control state", db.from("assist_control_state")
  .update({ cursor_control: true }).eq("session_id", sessionId).select("id").single());

/* ----------------------------------- stop ---------------------------------- */
console.log("\nstop");
await allow("terminate session", db.from("assist_sessions").update({
  status: "terminated", ended_at: new Date().toISOString(), end_reason: "Smoke test stop",
}).eq("id", sessionId).select("id").single());
await allow("record emergency stop", db.from("assist_emergency_stops").insert({
  stop_code: code("STOP", 4), session_code: session?.session_code, reason: "Smoke test stop",
  stopped_by: "Assist Manager", stop_type: "force_single",
}));
await deny("revive a terminated session", db.from("assist_sessions")
  .update({ status: "active" }).eq("id", sessionId).select("id"));

/* --------------------------- destructive protection ------------------------ */
console.log("\naudit trail protection");
await deny("delete a session", db.from("assist_sessions").delete().eq("id", sessionId).select("id"));
await deny("delete an emergency stop", db.from("assist_emergency_stops").delete().eq("stop_type", "force_single").select("id"));
await deny("delete a chat message", db.from("assist_chat_messages").delete().eq("session_id", sessionId).select("id"));

/* --------------------- role / permission edge cases ------------------------ */
console.log("\nrole and permission edge cases");

// view: catalogue tables are read-only reference data for the console role
await deny("add a new privacy control", db.from("assist_privacy_controls").insert({
  control_key: code("pc", 4), label: "Rogue control", description: "should not exist",
}).select("id"));
await deny("add a new access mode", db.from("assist_access_modes").insert({
  mode_key: code("mode", 4), label: "Rogue mode", description: "should not exist",
}).select("id"));
await deny("add a new setting", db.from("assist_settings").insert({
  section: "general", setting_key: code("s", 4), label: "Rogue", control_type: "toggle", value: "on",
}).select("id"));
await deny("delete a privacy control", db.from("assist_privacy_controls").delete().neq("id", "00000000-0000-0000-0000-000000000000").select("id"));
await deny("delete an access mode", db.from("assist_access_modes").delete().neq("id", "00000000-0000-0000-0000-000000000000").select("id"));
await deny("delete a setting", db.from("assist_settings").delete().neq("id", "00000000-0000-0000-0000-000000000000").select("id"));

// audit trail: recorded history can never be rewritten
await deny("edit a chat message after sending", db.from("assist_chat_messages")
  .update({ body: "tampered" }).eq("session_id", sessionId).select("id"));
await deny("edit an emergency stop record", db.from("assist_emergency_stops")
  .update({ reason: "tampered" }).eq("session_code", session?.session_code).select("id"));
await deny("delete a file transfer", db.from("assist_file_transfers").delete().eq("id", transfer?.id).select("id"));
await deny("delete an approval", db.from("assist_approvals").delete().eq("id", approval?.id).select("id"));
await deny("delete a session request", db.from("assist_session_requests").delete().neq("id", "00000000-0000-0000-0000-000000000000").select("id"));
await deny("delete an agent", db.from("assist_agents").delete().eq("id", agentId).select("id"));
await deny("delete an end user", db.from("assist_end_users").delete().eq("id", endUserId).select("id"));
await deny("delete an AI suggestion", db.from("assist_ai_suggestions").delete().neq("id", "00000000-0000-0000-0000-000000000000").select("id"));
await deny("delete a control state row", db.from("assist_control_state").delete().eq("session_id", sessionId).select("id"));
await deny("delete a session window", db.from("assist_session_windows").delete().neq("id", "00000000-0000-0000-0000-000000000000").select("id"));

// stop: a terminated session is frozen in every dimension, not just status
await deny("reopen a terminated session by clearing its end reason", db.from("assist_sessions")
  .update({ end_reason: null, ended_at: null }).eq("id", sessionId).select("id"));
await deny("re-escalate access on a terminated session", db.from("assist_sessions")
  .update({ access_mode: "control_full", risk_level: "high" }).eq("id", sessionId).select("id"));

// approve: decided requests and approvals are final for every role
const { data: decidedReq } = await db.from("assist_session_requests")
  .select("id").neq("status", "pending").limit(1);
if (decidedReq?.[0]) await deny("re-decide an already-reviewed session request",
  db.from("assist_session_requests").update({ status: "approved" }).eq("id", decidedReq[0].id).select("id"));
await deny("mark a decided approval back to pending", db.from("assist_approvals")
  .update({ status: "pending" }).eq("id", approval?.id).select("id"));

// transfer: a completed transfer can neither be rewound nor re-flagged
await deny("rewind progress on a completed transfer", db.from("assist_file_transfers")
  .update({ progress: 0 }).eq("id", transfer?.id).select("id"));
await deny("disable one-time access on a completed transfer", db.from("assist_file_transfers")
  .update({ one_time_access: false, auto_delete: false }).eq("id", transfer?.id).select("id"));

// privacy: critical protections stay on no matter which flag is targeted
if (critical) {
  await deny("mark a critical privacy control as non-critical", db.from("assist_privacy_controls")
    .update({ is_critical: false, enabled: false }).eq("id", critical.id).select("id"));
}

// settings: locked settings resist relabelling as well as value changes
if (locked) {
  await deny("unlock a locked setting", db.from("assist_settings")
    .update({ is_locked: false }).eq("id", locked.id).select("id"));
}

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
