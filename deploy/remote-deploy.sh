#!/usr/bin/env bash
# Ejecutar en la raíz del monorepo en el VPS: bash deploy/remote-deploy.sh
# Requiere: Node 20+, npm, pm2. Git solo si no usas DEPLOY_SKIP_GIT=1 (código ya en disco, p. ej. Git Hostinger).
set -euo pipefail

# SSH/ejecución no interactiva no carga .bashrc: nvm/fnm quedan fuera del PATH.
load_node_env() {
  command -v npm >/dev/null 2>&1 && return 0
  set +u
  local nvm_dir="${NVM_DIR:-$HOME/.nvm}"
  if [ -s "$nvm_dir/nvm.sh" ]; then
    # shellcheck disable=SC1091
    . "$nvm_dir/nvm.sh"
    if type nvm >/dev/null 2>&1; then
      nvm use default >/dev/null 2>&1 || nvm use node >/dev/null 2>&1 || true
    fi
  fi
  if command -v fnm >/dev/null 2>&1; then
    eval "$(fnm env 2>/dev/null)" || true
  fi
  if [ -f "$HOME/.profile" ]; then
    # shellcheck disable=SC1091
    . "$HOME/.profile" 2>/dev/null || true
  fi
  for d in /usr/local/bin "$HOME/.local/bin" /opt/nodejs/bin "$HOME/.npm-global/bin"; do
    if [ -d "$d" ]; then
      case ":$PATH:" in *":$d:"*) ;; *) PATH="$d:$PATH" ;; esac
    fi
  done
  export PATH
  set -u
}

load_node_env

echo ">>> Binarios: node=$(command -v node 2>/dev/null || echo MISSING) npm=$(command -v npm 2>/dev/null || echo MISSING) pm2=$(command -v pm2 2>/dev/null || echo MISSING)"

command -v npm >/dev/null 2>&1 || {
  echo ">>> Error: npm no está en PATH."
  echo "    Las sesiones SSH del deploy no son 'login shell': no se lee .bashrc (donde suele estar nvm)."
  echo "    Solución: en el VPS añade a ~/.profile (o ~/.bash_profile):"
  echo "      export NVM_DIR=\"\$HOME/.nvm\""
  echo "      [ -s \"\$NVM_DIR/nvm.sh\" ] && . \"\$NVM_DIR/nvm.sh\""
  echo "    O instala Node con apt/NodeSource para que quede en /usr/bin."
  exit 1
}
command -v node >/dev/null 2>&1 || { echo ">>> Error: node no está en PATH"; exit 1; }
command -v pm2 >/dev/null 2>&1 || {
  echo ">>> Error: pm2 no está en PATH (tras cargar Node, prueba: npm i -g pm2)."
  exit 1
}

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# Hostinger: por defecto no definas HOSTINGER_STATIC_SUBDIR (SPA en / vía .htaccess → hostal-web/frontend/dist).
# Si defines HOSTINGER_STATIC_SUBDIR=app en .env, VITE_BASE=/app/ y se copia dist a ../app (ver deploy/htaccess-opcion-b-subcarpeta-app.example).
read_env_var() {
  local key="$1"
  [ -f .env ] || return 0
  # grep sin match devuelve 1: con set -o pipefail no debe tumbar el deploy
  grep -E "^${key}=" .env 2>/dev/null | tail -n1 | cut -d= -f2- | tr -d '\r' | sed 's/^"\(.*\)"$/\1/' || true
}
if [ -z "${HOSTINGER_STATIC_SUBDIR:-}" ]; then
  HOSTINGER_STATIC_SUBDIR="$(read_env_var HOSTINGER_STATIC_SUBDIR)"
  export HOSTINGER_STATIC_SUBDIR
fi

REF="${GIT_REF:-main}"
echo ">>> Deploy ref: $REF (repo: $ROOT)"
node -v
npm -v

# Con DEPLOY_SKIP_GIT=1 el código ya está actualizado en disco (p. ej. deploy Git de Hostinger); no hace falta git en el VPS.
if [ "${DEPLOY_SKIP_GIT:-}" != "1" ]; then
  command -v git >/dev/null 2>&1 || { echo ">>> Error: git no está en PATH"; exit 1; }
  git fetch origin
  git checkout "$REF"
  git reset --hard "origin/$REF"
fi

echo ">>> npm ci (workspaces: frontend + backend)"
npm ci || {
  echo ">>> ERROR: npm ci falló (lockfile, red, disco, memoria o better-sqlite3 sin toolchain)."
  exit 1
}

if [ -n "${HOSTINGER_STATIC_SUBDIR:-}" ]; then
  export VITE_BASE="/${HOSTINGER_STATIC_SUBDIR}/"
  echo ">>> Hostinger subcarpeta: VITE_BASE=$VITE_BASE -> ../${HOSTINGER_STATIC_SUBDIR}/"
fi

echo ">>> npm run build"
npm run build || {
  echo ">>> ERROR: npm run build falló."
  exit 1
}

if [ -n "${HOSTINGER_STATIC_SUBDIR:-}" ]; then
  PARENT="$(dirname "$ROOT")"
  DEST="$PARENT/${HOSTINGER_STATIC_SUBDIR}"
  mkdir -p "$DEST"
  echo ">>> Copiando SPA a $DEST"
  rsync -a --delete "$ROOT/frontend/dist/" "$DEST/"
fi

# Hostinger/LiteSpeed: a veces /assets/*.js devuelve index.html (rewrite). Enlace desde
# public_html/assets → …/frontend/dist/assets evita depender de mod_rewrite para Vite.
# Omitir: HOSTINGER_SKIP_ASSETS_SYMLINK=1. No borra un directorio "assets" real (solo avisa).
if [ -z "${HOSTINGER_STATIC_SUBDIR:-}" ] && [ "${HOSTINGER_SKIP_ASSETS_SYMLINK:-}" != "1" ]; then
  # Monorepo en public_html (plano): enlaces dentro del mismo directorio.
  # Monorepo en public_html/subcarpeta: enlaces desde public_html hacia subcarpeta/frontend/dist.
  if [ "$(basename "$ROOT")" = "public_html" ]; then
    PUB="$ROOT"
    LINK_TARGET="frontend/dist/assets"
    FAVICON_TARGET="frontend/dist/favicon.svg"
  else
    PUB="$(dirname "$ROOT")"
    REPO="$(basename "$ROOT")"
    LINK_TARGET="${REPO}/frontend/dist/assets"
    FAVICON_TARGET="${REPO}/frontend/dist/favicon.svg"
  fi
  if [ -d "$ROOT/frontend/dist/assets" ] && [ -w "$PUB" ]; then
    if [ -L "$PUB/assets" ] || [ ! -e "$PUB/assets" ]; then
      rm -f "$PUB/assets"
      ln -sfn "$LINK_TARGET" "$PUB/assets"
      echo ">>> Symlink $PUB/assets -> $LINK_TARGET (MIME correcto para /assets/*)"
    elif [ -d "$PUB/assets" ]; then
      echo ">>> Aviso: $PUB/assets es un directorio, no un enlace. Renómbralo o bórralo para permitir symlink, o usa HOSTINGER_SKIP_ASSETS_SYMLINK=1"
    fi
    if [ -f "$ROOT/frontend/dist/favicon.svg" ]; then
      if [ -L "$PUB/favicon.svg" ] || [ ! -e "$PUB/favicon.svg" ]; then
        rm -f "$PUB/favicon.svg"
        ln -sfn "$FAVICON_TARGET" "$PUB/favicon.svg"
        echo ">>> Symlink $PUB/favicon.svg -> $FAVICON_TARGET"
      fi
    fi
  fi
fi

# Puente PHP → Node si no hay mod_proxy (503). Solo si aún no existe en public_html.
if [ -z "${HOSTINGER_STATIC_SUBDIR:-}" ] && [ "${HOSTINGER_SKIP_PHP_API_PROXY:-}" != "1" ]; then
  PROXY_SRC="$ROOT/deploy/hostal-api-proxy.php.example"
  if [ "$(basename "$ROOT")" = "public_html" ]; then
    PROXY_DST="$ROOT/hostal-api-proxy.php"
    PROXY_WRITE_DIR="$ROOT"
  else
    PROXY_WRITE_DIR="$(dirname "$ROOT")"
    PROXY_DST="$PROXY_WRITE_DIR/hostal-api-proxy.php"
  fi
  if [ -f "$PROXY_SRC" ] && [ -w "$PROXY_WRITE_DIR" ] && [ ! -f "$PROXY_DST" ]; then
    cp "$PROXY_SRC" "$PROXY_DST"
    echo ">>> Instalado $PROXY_DST (puente /api sin [P]). .htaccess: flat o hostal-web según tu layout"
  fi
fi

if pm2 describe hostal-patricia >/dev/null 2>&1; then
  echo ">>> pm2 restart hostal-patricia"
  pm2 restart hostal-patricia || {
    echo ">>> ERROR: pm2 restart falló"
    exit 1
  }
else
  echo ">>> pm2 start (primera vez)"
  pm2 start backend/dist/server.js --name hostal-patricia || {
    echo ">>> ERROR: pm2 start falló (¿puerto 8787 ocupado?)"
    exit 1
  }
fi

# pm2 save a veces falla por permisos en ~/.pm2 sin tumbar el proceso ya arrancado
if ! pm2 save; then
  echo ">>> Aviso: pm2 save falló (persistencia tras reinicio puede fallar); el deploy del código sí terminó."
fi

echo ">>> Listo. Comprueba: curl -sS http://127.0.0.1:8787/api/health"
