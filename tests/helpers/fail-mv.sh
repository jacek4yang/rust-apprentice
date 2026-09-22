#!/usr/bin/env sh
set -eu
case "$1" in
  */staged/rust-learn-continue)
    if [ ! -e "$EVAL_FAIL_FILE" ]; then
      touch "$EVAL_FAIL_FILE"
      printf '%s\n' 'Injected failure during the second skill switch' >&2
      exit 1
    fi ;;
esac
command -p mv "$@"
