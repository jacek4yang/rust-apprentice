#!/usr/bin/env sh
# Run directly under Linux/macOS, including WSL without Node installed.
set -eu
TEST_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd -P)
REPO=$(dirname -- "$TEST_DIR")
TEMP_TEST=$(mktemp -d /tmp/rust-apprentice-install-XXXXXXXX)
case "$TEMP_TEST" in /tmp/rust-apprentice-install-*) ;; *) exit 1 ;; esac
cleanup() { rm -rf -- "$TEMP_TEST"; }
trap cleanup EXIT
SOURCE="$TEMP_TEST/source checkout"
TARGET="$TEMP_TEST/skills [literal]"
mkdir -p "$SOURCE/scripts" "$TARGET/unrelated" "$TEMP_TEST/mock-bin"
cp -R "$REPO/skills" "$SOURCE/skills"
cp "$REPO/scripts/install.sh" "$SOURCE/scripts/install.sh"
cp "$TEST_DIR/helpers/fail-mv.sh" "$TEMP_TEST/mock-bin/mv"
chmod +x "$TEMP_TEST/mock-bin/mv"
export CLAUDE_SKILLS_DIR="$TARGET"
sh "$SOURCE/scripts/install.sh"
for skill in rust-learn-init rust-learn-continue rust-learn-status; do
  touch "$TARGET/$skill/old-version.txt"
done
export EVAL_FAIL_FILE="$TEMP_TEST/failure-injected"
if PATH="$TEMP_TEST/mock-bin:$PATH" sh "$SOURCE/scripts/install.sh"; then
  printf '%s\n' 'Fault injection did not fail' >&2; exit 1
fi
[ -f "$EVAL_FAIL_FILE" ]
for skill in rust-learn-init rust-learn-continue rust-learn-status; do
  [ -f "$TARGET/$skill/old-version.txt" ]
done
sh "$SOURCE/scripts/install.sh"
sh "$SOURCE/scripts/install.sh"
for skill in rust-learn-init rust-learn-continue rust-learn-status; do
  [ ! -e "$TARGET/$skill/old-version.txt" ]
done
if CLAUDE_SKILLS_DIR="$SOURCE" sh "$SOURCE/scripts/install.sh"; then exit 1; fi
ln -s "$TARGET" "$TEMP_TEST/linked"
if CLAUDE_SKILLS_DIR="$TEMP_TEST/linked" sh "$SOURCE/scripts/install.sh"; then exit 1; fi
sh "$SOURCE/scripts/install.sh" --uninstall
sh "$SOURCE/scripts/install.sh" --uninstall
for skill in rust-learn-init rust-learn-continue rust-learn-status; do
  [ ! -e "$TARGET/$skill" ]
done
[ -d "$TARGET/unrelated" ]
find "$TEMP_TEST" -path '*/old/rust-learn-init/SKILL.md' | grep -q .
printf '%s\n' 'POSIX install/update/rollback/uninstall passed.'
