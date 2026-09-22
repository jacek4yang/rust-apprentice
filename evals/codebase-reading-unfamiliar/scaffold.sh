#!/usr/bin/env bash
# The harness executes this script with the isolated run directory as cwd.
set -eu
CASE_DIR=$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
node "$CASE_DIR/../fixtures/build.mjs" "codebase-reading-unfamiliar"
