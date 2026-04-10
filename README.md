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

## Deploy en Hostinger

### Aplicación Node.js en hPanel (Node.js Web App)

Si despliegas con **Websites → Añadir sitio → Aplicación Node.js** / **Node.js Apps** (GitHub o ZIP), Hostinger ejecuta instalación, build y arranque por ti. Este repo es un **monorepo**: la raíz debe ser donde está el `package.json` con workspaces (`frontend/`, `backend/`).

| Campo (según el asistente) | Valor típico |
|----------------------------|----------------|
| Node.js | **20.x** o superior (`engines` en la raíz del repo) |
| Instalar dependencias | Predeterminado del panel o **`npm ci`** |
| Build | **`npm run build`** (Vite + bundle del API) |
| Start | **`npm start`** (arranca `backend/dist/server.js` vía workspace) |

**Variables de entorno** en el panel (o importar `.env`):

- **`SERVE_FRONTEND=1`** — imprescindible: Express sirve la SPA desde `frontend/dist` además del API.
- **`PORT`** — suele inyectarla Hostinger (a menudo `3000`). El servidor ya usa `process.env.PORT`.
- **`BIND_HOST=0.0.0.0`** — si tras el deploy no carga nada, prueba esto: el proxy del hosting debe poder conectar al proceso (el valor por defecto del código es `127.0.0.1`, válido en muchos VPS con Apache delante, pero no siempre en el entorno “Node App”).
- Resto como en local: `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, `SQLITE_PATH`, SMTP si aplica, etc. (ver `.env.example`).

**SQLite:** elige una ruta **persistente** (que no se pierda al redeploy). En hosting gestionado a veces conviene un directorio fuera del árbol que se reescribe en cada build; en VPS, por ejemplo `/var/lib/hostal-patricia/app.db`.

Si el asistente pide **directorio de salida** o **archivo de entrada** pensando en un front estático, aquí el proceso que atiende HTTP es el **Node del backend** tras el build; el arranque correcto sigue siendo **`npm start`** en la raíz del monorepo, no solo abrir `frontend/dist` en un servidor de ficheros.

Las secciones siguientes (**Nginx + PM2**, **Apache / `public_html`**, script **`remote-deploy.sh`**) aplican sobre todo a **VPS** o a sitios donde el document root es Apache y la API va aparte; con la **Aplicación Node** y `SERVE_FRONTEND=1` suele bastar el dominio que asigne el panel sin montar la SPA con `.htaccess`.

---

## Deploy en VPS (Nginx + PM2)

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

### Hostinger sin poder cambiar el “document root”

**Si ya tienes `public_html/app/`** con el frontend (deploy con `HOSTINGER_STATIC_SUBDIR=app`):

1. Pon en `public_html/.htaccess` el contenido de [`deploy/htaccess-opcion-b-subcarpeta-app.example`](deploy/htaccess-opcion-b-subcarpeta-app.example) (no el de `hostinger-public-html.htaccess.example`).
2. En el `.env` del monorepo en el VPS: **`HOSTINGER_STATIC_SUBDIR=app`** (cada deploy copia el build a `public_html/app/`).
3. Abre **`https://tu-dominio.com/app/`** (desde `/` el `.htaccess` redirige a `/app/`).

---

**SPA en la raíz del dominio** (`/`): Apache solo puede reescribir a rutas **bajo** `public_html`. La **raíz del monorepo en el VPS** (donde está `package.json`) suele ser, por ejemplo:

`.../domains/tudominio.com/public_html/hostal-web`

**O bien** despliegas el repo **entero dentro de `public_html`** (sin subcarpeta `hostal-web`): entonces la raíz del monorepo es `.../domains/tudominio.com/public_html` y el `.htaccess` debe ser [`deploy/hostinger-public-html-flat.htaccess.example`](deploy/hostinger-public-html-flat.htaccess.example) (rutas `frontend/dist/...`). El script `remote-deploy.sh` detecta `basename` = `public_html` y crea `assets` → `frontend/dist/assets` y el proxy PHP en el sitio correcto.

(no un path tipo `/var/www/...` distinto del dominio, salvo que enlaces con un symlink dentro de `public_html`).

1. **No** definas `HOSTINGER_STATIC_SUBDIR` en el `.env` del VPS (`VITE_BASE=/`, build en `frontend/dist`).
2. Copia el `.htaccess` que corresponda: [`deploy/hostinger-public-html.htaccess.example`](deploy/hostinger-public-html.htaccess.example) si el monorepo está en `public_html/hostal-web/` (o otra subcarpeta; ajusta el nombre en las reglas), **o** [`deploy/hostinger-public-html-flat.htaccess.example`](deploy/hostinger-public-html-flat.htaccess.example) si el monorepo **es** la raíz de `public_html`.
3. Tras cada deploy (pull Git en el servidor, rsync, etc.), [`deploy/remote-deploy.sh`](deploy/remote-deploy.sh) crea **`public_html/assets`** como enlace simbólico a `…/frontend/dist/assets` (evita error MIME `text/html` en los `.js` en algunos planes). Si ya tienes una carpeta real `public_html/assets`, renómbrala o define `HOSTINGER_SKIP_ASSETS_SYMLINK=1`.
4. Si Hostinger dejó un `index.html` por defecto en `public_html`, renómbralo o bórralo para que no compita con la SPA.
5. Comprueba en SSH el build: `ls public_html/hostal-web/frontend/dist/index.html` o, si es layout plano, `ls public_html/frontend/dist/index.html`.
6. Abre **`https://tu-dominio.com/`**. Si ves **500**, comenta en `.htaccess` las reglas `[P]` de `/api` y `/uploads` (a veces `mod_proxy` no está permitido) y configura el proxy con soporte Hostinger si hace falta.

**`/api/*` en 503** con Node OK en `curl http://127.0.0.1:8787/...`: muchos planes **no** dan LiteSpeed Web Admin. Usa el **puente PHP**: [`deploy/hostal-api-proxy.php.example`](deploy/hostal-api-proxy.php.example) → `public_html/hostal-api-proxy.php` y el `.htaccess` del repo (reglas a ese script, no `[P]`). El deploy lo copia la primera vez si falta. Alternativa con panel: *External App* — ver comentarios en [`deploy/hostinger-public-html.htaccess.example`](deploy/hostinger-public-html.htaccess.example).

### 6) Git en el VPS + Apache / PM2 (sin usar Aplicación Node del panel)

Si el código llega al servidor con **Git** clásico en hPanel (sitio → **Git**, no el flujo **Node.js Web App**) o lo subes a mano, Hostinger **solo** actualiza ficheros: el build y el proceso Node los resuelves con SSH y [`deploy/remote-deploy.sh`](deploy/remote-deploy.sh).

Tras el pull o la copia de archivos:

```bash
export DEPLOY_SKIP_GIT=1
bash deploy/remote-deploy.sh
```

`DEPLOY_SKIP_GIT=1` evita `git fetch`/`reset` dentro del script cuando el árbol ya está al día. El script hace `npm ci`, `npm run build`, symlink `assets`/proxy PHP si aplica y **pm2** restart/start.

**Preparación (una vez):** raíz del monorepo en el VPS (`package.json` ahí), **`.env`**, Node 20+, npm, PM2, y **nvm** en `~/.profile` si aplica.

Si gestionas el repo **solo** por SSH con `git pull` y quieres que el script alinee la rama, ejecuta `bash deploy/remote-deploy.sh` **sin** `DEPLOY_SKIP_GIT` (variable `GIT_REF`, por defecto `main`).

