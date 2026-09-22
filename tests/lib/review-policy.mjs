// Oracle for testing the documented policy and future model-produced schedules, not a learner runtime.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ROOT, parseYaml } from "./state-contracts.mjs";
const prose = readFileSync(resolve(ROOT, "skills/rust-learn-continue/references/core/review.md"), "utf8");
export const policy = parseYaml(prose.match(/```yaml\r?\n([\s\S]*?)```/)[1]).review_policy;
function day(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("invalid date");
  const time = Date.parse(`${date}T00:00:00Z`);
  if (!Number.isFinite(time) || new Date(time).toISOString().slice(0, 10) !== date) throw new Error("invalid date");
  return time / 86400000;
}
export function schedule(previous, event) {
  const currentDay = day(event.date);
  if (!event.id || !event.session || !["pass", "partial", "fail"].includes(event.result)) throw new Error("invalid retrieval event");
  if (previous.eventIds?.includes(event.id)) return structuredClone(previous);
  const gap = previous.lastAttempted ? currentDay - day(previous.lastAttempted) : 0;
  if (gap < 0) throw new Error("retrieval cannot precede prior evidence");
  const clean = event.result === "pass";
  const distinct = previous.lastSession !== event.session;
  const streak = clean ? (previous.cleanStreak ?? 0) + (distinct ? 1 : 0) : 0;
  const retired = clean && distinct && Boolean(previous.lastAttempted) && gap >= policy.retirement_gap_days;
  const failures = event.result === "fail" ? (previous.consecutiveFailures ?? 0) + 1 : 0;
  const interval = clean ? policy.clean_days[Math.max(0, Math.min(streak, policy.clean_days.length) - 1)] : policy[`${event.result}_days`];
  return { ...previous, attempts: (previous.attempts ?? 0) + 1, cleanStreak: streak, consecutiveFailures: failures,
    lastAttempted: event.date, lastSession: event.session, lastResult: event.result, retired,
    due: retired ? null : new Date((currentDay + interval) * 86400000).toISOString().slice(0, 10),
    activeWeakness: Boolean(previous.activeWeakness) || failures >= policy.failure_weakness_threshold,
    eventIds: [...(previous.eventIds ?? []), event.id] };
}
