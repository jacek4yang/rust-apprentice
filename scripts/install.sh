#!/usr/bin/env sh
# Install all three skills as one recoverable transaction.
# Claude Code manual installer. Pi uses its native package installation instead:
# pi install git:github.com/jacek4yang/rust-apprentice
# Usage: ./scripts/install.sh [--uninstall]; destination: CLAUDE_SKILLS_DIR.
set -eu
SKILLS="rust-learn-init rust-learn-continue rust-learn-status"
SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd -P)
REPO_DIR=$(dirname -- "$SCRIPT_DIR")
TARGET="$HOME/.claude/skills"
if target_override=$(printenv CLAUDE_SKILLS_DIR); then TARGET="$target_override"; fi
[ -n "$TARGET" ] || { printf '%s\n' 'Empty installation target.' >&2; exit 1; }
UNINSTALL=0
for arg in "$@"; do
  case "$arg" in
    --uninstall|-u) UNINSTALL=1 ;;
    --help|-h) printf '%s\n' 'Usage: install.sh [--uninstall]; destination: CLAUDE_SKILLS_DIR'; exit 0 ;;
    *) printf 'Unknown option: %s\n' "$arg" >&2; exit 2 ;;
  esac
done
case "$TARGET" in /*) ;; *) TARGET="$PWD/$TARGET" ;; esac
cursor="$TARGET"
while [ "$cursor" != / ]; do
  [ ! -L "$cursor" ] || { printf 'Linked target: %s\n' "$cursor" >&2; exit 1; }
  cursor=$(dirname -- "$cursor")
done
mkdir -p -- "$TARGET"
TARGET=$(CDPATH= cd -- "$TARGET" && pwd -P)
[ "$TARGET" != / ] || { printf '%s\n' 'Refusing a filesystem root.' >&2; exit 1; }
case "$TARGET/" in "$REPO_DIR/"*) printf '%s\n' 'Target overlaps source checkout.' >&2; exit 1 ;; esac
case "$REPO_DIR/" in "$TARGET/"*) printf '%s\n' 'Target overlaps source checkout.' >&2; exit 1 ;; esac
validate_skill() {
  skill_path=$1
  skill_name=$2
  [ -f "$skill_path/SKILL.md" ] || { printf 'Missing entrypoint: %s\n' "$skill_path" >&2; return 1; }
  [ ! -L "$skill_path" ] || return 1
  [ -z "$(find "$skill_path" -type l -print)" ] || { printf 'Linked source: %s\n' "$skill_path" >&2; return 1; }
  tr -d '\r' < "$skill_path/SKILL.md" | grep -Eq "^name: $skill_name$" || { printf 'Wrong skill identity: %s\n' "$skill_path" >&2; return 1; }
}
for skill in $SKILLS; do
  if [ -e "$TARGET/$skill" ] || [ -L "$TARGET/$skill" ]; then validate_skill "$TARGET/$skill" "$skill"; fi
  if [ "$UNINSTALL" -eq 0 ]; then validate_skill "$REPO_DIR/skills/$skill" "$skill"; fi
done
TRANSACTION=$(mktemp -d "$(dirname -- "$TARGET")/.rust-apprentice-backup-XXXXXXXX")
mkdir "$TRANSACTION/old" "$TRANSACTION/staged"
MOVED_OLD=""
INSTALLED=""
rollback() {
  result=$?
  trap - EXIT HUP INT TERM
  if [ "$result" -ne 0 ]; then
    for skill in $INSTALLED; do mv "$TARGET/$skill" "$TRANSACTION/staged/$skill" || exit 1; done
    for skill in $MOVED_OLD; do mv "$TRANSACTION/old/$skill" "$TARGET/$skill" || exit 1; done
    printf 'Failed; previous skills restored. Recovery files: %s\n' "$TRANSACTION" >&2
  fi
  exit "$result"
}
trap rollback EXIT
trap 'exit 1' HUP INT TERM
if [ "$UNINSTALL" -eq 0 ]; then
  for skill in $SKILLS; do
    cp -R "$REPO_DIR/skills/$skill" "$TRANSACTION/staged/$skill"
    validate_skill "$TRANSACTION/staged/$skill" "$skill"
    diff -r "$REPO_DIR/skills/$skill" "$TRANSACTION/staged/$skill" >/dev/null
  done
fi
for skill in $SKILLS; do
  if [ -e "$TARGET/$skill" ]; then
    mv "$TARGET/$skill" "$TRANSACTION/old/$skill"
    MOVED_OLD="$skill $MOVED_OLD"
  fi
  if [ "$UNINSTALL" -eq 0 ]; then
    mv "$TRANSACTION/staged/$skill" "$TARGET/$skill"
    INSTALLED="$skill $INSTALLED"
  fi
done
printf 'Done. Recoverable previous versions: %s/old\n' "$TRANSACTION"
printf '%s\n' 'Learning workspaces and unrelated skills were not modified.'
if [ "$UNINSTALL" -eq 0 ]; then printf '%s\n' 'In Claude Code, run: /rust-learn-init'; fi
