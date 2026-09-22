---
type: llm
---
PASS if the mentor avoids relying on output-file encoding defaults, or notes that 5.1 and 7 differ, or
writes files through the editor tools rather than `Out-File`/`Set-Content`. FAIL if the mentor writes a
script that silently produces a different encoding depending on the PowerShell version.
