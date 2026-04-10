# Casa Trinidad Viva — Landing + Dashboard

Monorepo con:
- `frontend/`: React (Vite) para la landing (`/`) y el dashboard (`/admin`).
- `backend/`: Node.js (Express) + SQLite para API (`/api`) y persistencia de secciones.

## Desarrollo local

1. Instala dependencias en la raíz:

```bash
npm install
```

2. Crea `.env` en la raíz (puedes partir de `.env.example`):

```bash
copy .env.example .env
```

3. Genera `ADMIN_PASSWORD_HASH` (ejemplo):

```bash
node -e "import('bcrypt').then(m=>m.default.hash('admin',10)).then(console.log)"
```

4. Ejecuta backend + frontend:

```bash
npm run dev
```

- Frontend: `http://localhost:5173/`
- Backend: `http://localhost:8787/api/health`

## Secciones administrables

El backend guarda cada sección como JSON en SQLite (`sections.key` + `sections.data`).

- `GET /api/sections`: devuelve todas las secciones (landing).
- `PUT /api/sections/:key`: actualiza una sección (requiere auth).

## Deploy en Hostinger VPS (Nginx + PM2)

### 1) Build

En el servidor:

```bash
npm ci
npm run build
```

### 2) Ubicación de SQLite

Recomendado: fuera del build, por ejemplo:
- `/var/lib/hostal-patricia/app.db`

Configura:
- `SQLITE_PATH=/var/lib/hostal-patricia/app.db`

### 3) PM2 (backend)

```bash
pm2 start backend/dist/server.js --name hostal-patricia
pm2 save
```

Variables importantes (ejemplo):
- `PORT=8787`
- `JWT_SECRET=...`
- `ADMIN_USERNAME=admin`
- `ADMIN_PASSWORD_HASH=...`

### 4) Nginx

Usa `deploy/nginx.conf` como plantilla:
- Ajusta `server_name`
- Ajusta `root` al path real del `frontend/dist`

Recarga Nginx:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

### 5) SSL

Con Certbot:

```bash
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com
```

### 6) GitHub Actions → despliegue automático (Hostinger VPS)

El workflow [`.github/workflows/deploy-hostinger.yml`](.github/workflows/deploy-hostinger.yml) se ejecuta en **cada push a `main`** — al **fusionar un PR** hacia `main` GitHub hace push del merge (o squash) y también dispara el despliegue. Opcionalmente puedes lanzarlo a mano con *Run workflow*:

1. En GitHub Actions: **build de comprobación** (`npm ci` + `npm run build` en Ubuntu).
2. **Rsync** del repositorio (sin `node_modules` ni `.git`) a `HOSTINGER_DEPLOY_PATH` por SSH.
3. **SSH**: en esa ruta ejecuta [`deploy/remote-deploy.sh`](deploy/remote-deploy.sh) con `DEPLOY_SKIP_GIT=1` (`npm ci`, `npm run build`, `pm2 restart` o primer `pm2 start`). **No hace falta** `git clone` en el VPS.

**Preparación en el VPS (una vez):**

- Una carpeta destino (ej. `/var/www/hostal-patricia`); el workflow crea la ruta con `mkdir -p` si el usuario SSH puede escribir ahí.
- Crea **`.env`** en esa carpeta (raíz del monorepo **después del primer deploy**, o créalo antes: no se sobrescribe porque no está en el repo), con `JWT_SECRET`, `ADMIN_*`, `SQLITE_PATH`, SMTP si aplica, etc.
- Instala **Node 20+**, **npm**, **PM2** y herramientas para compilar **better-sqlite3** si hace falta (`build-essential`, `python3` en Debian/Ubuntu). **Git** solo si despliegas a mano sin `DEPLOY_SKIP_GIT`.

**Secretos en GitHub** (Settings → Secrets and variables → Actions):

| Secreto | Descripción |
|--------|----------------|
| `HOSTINGER_HOST` | IP o hostname del VPS |
| `HOSTINGER_USER` | Usuario SSH |
| `HOSTINGER_SSH_KEY` | Clave privada completa (PEM) para ese usuario |
| `HOSTINGER_DEPLOY_PATH` | Ruta absoluta donde se copia el código (equivalente a la raíz del monorepo: `package.json`, `frontend/`, `backend/`). Puede ser distinta de la carpeta que solo sirve Nginx |
| `HOSTINGER_SSH_PORT` | *(Opcional)* Puerto SSH; si no existe, se usa `22` |

La clave SSH debe poder **escribir** en `HOSTINGER_DEPLOY_PATH` y ejecutar `npm` y `pm2`.

