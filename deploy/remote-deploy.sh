#!/usr/bin/env bash
# Ejecutar en el VPS (Hostinger) desde la raíz del repo: bash deploy/remote-deploy.sh
# Requiere: GIT_REF (rama, p. ej. main), Node 20+, npm, git, pm2 en PATH.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

REF="${GIT_REF:-main}"
echo ">>> Deploy ref: $REF (repo: $ROOT)"

git fetch origin
git checkout "$REF"
git reset --hard "origin/$REF"

echo ">>> npm ci"
npm ci

echo ">>> npm run build"
npm run build

if pm2 describe hostal-patricia >/dev/null 2>&1; then
  echo ">>> pm2 restart hostal-patricia"
  pm2 restart hostal-patricia
else
  echo ">>> pm2 start (primera vez)"
  pm2 start backend/dist/server.js --name hostal-patricia
fi

pm2 save
echo ">>> Listo. Comprueba: curl -sS http://127.0.0.1:8787/api/health"
