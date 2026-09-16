---
type: llm
criteria: |
  Mojibake is not treated as evidence that the build failed.
---
PASS if the mentor separates the display problem from the actual result, and proposes checking the exit
code or the filesystem rather than concluding the build is broken. FAIL if the mentor treats the garbled
text as the error, or declares the toolchain broken.
