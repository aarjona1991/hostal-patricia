#!/usr/bin/env bash
# Ejecutar en el VPS (Hostinger) desde la raíz del repo: bash deploy/remote-deploy.sh
# Requiere: GIT_REF (rama, p. ej. main), Node 20+, npm, git, pm2 en PATH.
set -euo pipefail

command -v git >/dev/null 2>&1 || { echo ">>> Error: git no está en PATH"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo ">>> Error: npm no está en PATH"; exit 1; }
command -v node >/dev/null 2>&1 || { echo ">>> Error: node no está en PATH"; exit 1; }
command -v pm2 >/dev/null 2>&1 || { echo ">>> Error: pm2 no está en PATH"; exit 1; }

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

REF="${GIT_REF:-main}"
echo ">>> Deploy ref: $REF (repo: $ROOT)"
node -v
npm -v

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
