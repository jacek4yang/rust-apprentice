#!/usr/bin/env sh
# Install the rust-apprentice skills into the personal Claude Code skills directory.
#
# Usage:
#   ./scripts/install.sh              # install from this checkout
#   ./scripts/install.sh --uninstall  # remove them again
#
# The skills are plain directories; this script only copies them. Nothing else on the system is modified.

set -eu

SKILLS="rust-learn-init rust-learn-continue rust-learn-status"
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
REPO_DIR=$(dirname -- "$SCRIPT_DIR")
TARGET="${CLAUDE_SKILLS_DIR:-$HOME/.claude/skills}"

UNINSTALL=0
for arg in "$@"; do
  case "$arg" in
    --uninstall|-u) UNINSTALL=1 ;;
    --help|-h)
      sed -n '2,9p' "$0" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *)
      echo "Unknown option: $arg" >&2
      exit 2
      ;;
  esac
done

if [ "$UNINSTALL" -eq 1 ]; then
  for skill in $SKILLS; do
    if [ -e "$TARGET/$skill" ]; then
      rm -rf "$TARGET/$skill"
      echo "Removed $TARGET/$skill"
    else
      echo "Not installed: $TARGET/$skill"
    fi
  done
  echo "Done. Your learning workspace was not touched."
  exit 0
fi

for skill in $SKILLS; do
  if [ ! -f "$REPO_DIR/skills/$skill/SKILL.md" ]; then
    echo "Cannot find skills/$skill/SKILL.md — run this script from a checkout of the repository." >&2
    exit 1
  fi
done

mkdir -p "$TARGET"

for skill in $SKILLS; do
  rm -rf "$TARGET/$skill"
  cp -R "$REPO_DIR/skills/$skill" "$TARGET/$skill"
  echo "Installed $TARGET/$skill"
done

echo
echo "In Claude Code, run: /rust-learn-init"
