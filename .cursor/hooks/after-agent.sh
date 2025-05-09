#!/usr/bin/env bash
# Salva o output completo do Agent em cursor_logs/ com data+hora.
set -euo pipefail

LOG_DIR="cursor_logs"
mkdir -p "$LOG_DIR"

timestamp=$(date +"%Y-%m-%d_%H-%M-%S")
file="$LOG_DIR/${timestamp}.md"

echo -e "# Cursor Agent log – $timestamp\n" > "$file"
cat - >> "$file"

echo "📝  Log automático salvo em $file" 