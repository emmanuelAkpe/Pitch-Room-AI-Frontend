#!/bin/bash
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "▶  Starting PitchRoom frontend on http://localhost:5173"
npm run dev
