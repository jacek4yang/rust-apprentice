# Verification status

Baseline: e229888. Implementation under review: uncommitted working tree, 2026-09-22.
These observations describe this environment, not a promise of learning outcomes.

## Verified

- Windows, Node 26.1.0: repository checks, YAML state examples and invalid-state/path/version cases.
- 29 eval case contracts: isolated fixtures, correct Skill/tool grants, domain objectives, large history.
- rustc accepts the original ownership example; the observed-failure example produces E0502.
- PowerShell 5.1 installation: literal Unicode/space/bracket paths, repeat/update/uninstall, missing source,
  path overlap and junction rejection, and rollback after an injected second-skill switch failure.
- WSL Ubuntu POSIX installation: repeat/update/uninstall, overlap/link rejection and injected-switch rollback.
- Pinned skills-ref 0.1.5 validates three skills; pinned skills 1.7.0 discovers three. Shell concatenation is
  no longer used to launch these tools on Windows.
- Windows harness path bug fixed in our runner: Claude Code 2.1.270 native Windows strips backslashes from
  harness script paths (exit 127, zero model turns). Passing forward-slash root and output paths through
  `scripts/run-evals.mjs` makes scaffolded initialized-workspace cases run end to end on this host.
- Skill-loading observability fixed: slash-command prompts are expanded by the client (command-message
  injection) and never produce a Skill tool call. All 26 slash-prefixed case prompts were rewritten to the
  documented natural-language invocation path, and the contract checks now reject leading slash commands.
  Natural-language smoke runs: total-beginner 1.00 (8/8 graders), async-rust 1.00 (8/8),
  init-impatient-learner 1.00 (4/4, workspace actually written), status-compact-summary 0.88 — a genuine
  product failure: the mentor listed only the domains it judged relevant instead of one line per domain.

## Infrastructure failure

Claude Code 2.1.270, native Windows, backslash paths: scaffold runs failed before model execution (exit 127,
zero model turns). Fixed on our side by using forward-slash paths in `scripts/run-evals.mjs`; reports in
`evals/results/2026-09-22T06-28-09.813Z/` predate the fix. The runner does not change the client, so other
harness entry points may still need the same workaround.

## Behavioural smoke

Model: `glm-5.3-flash[1m]` from the existing provider configuration; judge votes 3×3 per LLM grader. Four
cases, one run each, 2026-09-22, after the path and invocation fixes. This is not evidence for other models,
other cases, or repeated stability.

## Not yet established

- All 29 behavioural cases passing three runs; model/judge performance and actual read budgets. The
  status-compact-summary failure and every remaining case still need three clean runs.
- Three complete multi-session learner trajectories, interrupted migration/write recovery and lossless rollup
  as performed by the model. The files specify these protocols; static checks do not prove compliance.
- Personal/project/plugin invocation matrix across client versions, including the manual-only flag variant.
- PowerShell 7 and macOS installation. CI covers Windows/Linux but was not remotely executed in this session.
- Long-term learning outcomes with real learners.

Use `IMPLEMENTATION_PLAN.md` at the repository root as the implementation handoff. Never convert an unrun
check, missing dependency or infrastructure error into a passing result.
