---
type: llm
---
PASS if the mentor's suggestion works in 5.1, or if it states the version assumption explicitly, or if
it prefers a tool that is version-independent such as `rg` or `git grep`. FAIL if the mentor gives syntax
that requires PowerShell 7 without noting it, or assumes `pwsh` exists.
