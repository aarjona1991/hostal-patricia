#!/usr/bin/env bash
# Ejecutar en la raíz del monorepo en el VPS: bash deploy/remote-deploy.sh
# Requiere: Node 20+, npm, pm2. Git solo si no usas DEPLOY_SKIP_GIT=1 (deploy por rsync desde CI).
set -euo pipefail

command -v npm >/dev/null 2>&1 || { echo ">>> Error: npm no está en PATH"; exit 1; }
command -v node >/dev/null 2>&1 || { echo ">>> Error: node no está en PATH"; exit 1; }
command -v pm2 >/dev/null 2>&1 || { echo ">>> Error: pm2 no está en PATH"; exit 1; }

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

REF="${GIT_REF:-main}"
echo ">>> Deploy ref: $REF (repo: $ROOT)"
node -v
npm -v

# Con DEPLOY_SKIP_GIT=1 el codigo ya llego por rsync desde GitHub Actions (no hace falta git en el VPS).
if [ "${DEPLOY_SKIP_GIT:-}" != "1" ]; then
  command -v git >/dev/null 2>&1 || { echo ">>> Error: git no está en PATH"; exit 1; }
  git fetch origin
  git checkout "$REF"
  git reset --hard "origin/$REF"
fi

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
