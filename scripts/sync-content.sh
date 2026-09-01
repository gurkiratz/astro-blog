#!/usr/bin/env bash
# Pulls posts from the Obsidian vault (synced via iCloud, edited on desktop
# and mobile) into src/content/, which is what's actually committed to git.
#
# Why: Vercel builds from a clean checkout with no iCloud mount, so
# src/content must be real, git-tracked files rather than a symlink into
# the vault. Run this after writing/editing on any device, then commit.
#
# Safe to wire into predev/prebuild too: if the vault isn't mounted (e.g. CI)
# this is a silent no-op instead of a failure.
set -euo pipefail

VAULT="$HOME/Library/Mobile Documents/iCloud~md~obsidian/Documents/blog-content"
DEST="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/src/content"

if [ ! -d "$VAULT" ]; then
  echo "sync-content: vault not found at '$VAULT', skipping (expected in CI)"
  exit 0
fi

rsync -a --delete \
  --exclude ".DS_Store" \
  --exclude "_templates/" \
  --exclude ".obsidian/workspace.json" \
  --exclude ".obsidian/workspace-mobile.json" \
  --exclude ".obsidian/app.json" \
  "$VAULT/" "$DEST/"

echo "sync-content: synced '$VAULT' -> src/content/"
