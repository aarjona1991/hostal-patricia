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

Si despliegas con **Websites → Añadir sitio → Aplicación Node.js** / **Node.js Apps** (GitHub o ZIP), Hostinger ejecuta instalación, build y arranque por ti. Este repo es un **monorepo**: la raíz debe ser donde está el `package.json` con workspaces (`frontend/`, `backend/`). Si el código vive en la **raíz de `public_html`**, esa carpeta es la raíz del monorepo (mismo criterio que el layout plano con Apache).

| Campo (según el asistente) | Valor típico |
|----------------------------|----------------|
| Node.js | **20.x** o superior (`engines` en la raíz del repo) |
| Instalar dependencias | Predeterminado del panel o **`npm ci`** |
| Build | **`npm run build`** (Vite + bundle del API) |
| Start | **`npm start`** (arranca `backend/dist/server.js` vía workspace) |

**Variables de entorno** en el panel (o importar `.env`):

- **`SERVE_FRONTEND=1`** — imprescindible: Express sirve la SPA desde `frontend/dist` además del API.
- **`PORT`** — en Aplicación Node **no** la pongas en `.env`: la inyecta el panel. El código usa `process.env.PORT` (localmente puedes usar `8787` u otro).
- **`BIND_HOST=0.0.0.0`** — si el sitio no responde tras el deploy, suele ser el proxy que no alcanza `127.0.0.1`.
- **`MONOREPO_ROOT`** — solo si hace falta: **ruta absoluta** Linux (`/home/usuario/.../nodejs/app`), la carpeta donde está el `package.json` raíz con workspaces. Valores relativos tipo `domains/...` se ignoran y rompen el arranque. Ver ejemplo en `.env.example`.
- Resto como en local: `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, `SQLITE_PATH`, SMTP si aplica, etc.

Al arrancar, el log incluye `listening <host> <puerto> (repoRoot=...)`: comprueba que `repoRoot` sea la raíz real del monorepo. Si falla, revisa **Runtime logs** / `stderr.log` del deploy en hPanel.

**SQLite:** elige una ruta **persistente** (que no se pierda al redeploy). En hosting gestionado a veces conviene un directorio fuera del árbol que se reescribe en cada build; en VPS, por ejemplo `/var/lib/hostal-patricia/app.db`.

#### Que la BD no se borre en cada despliegue (sin copias manuales)

Si usas `SQLITE_PATH=./data/app.db` **dentro del repo**, un deploy que **reemplaza toda la carpeta** (ZIP, artifact nuevo, `git clean`, etc.) puede borrar `data/` y perderás secciones y mensajes de contacto.

**Qué hacer una sola vez en el servidor:**

1. Crea un directorio **fuera** del proyecto que se despliega, por ejemplo en tu home o en `/var/lib`:
   - `mkdir -p ~/persistent/hostal-patricia && chmod 700 ~/persistent/hostal-patricia`
2. En **variables de entorno del panel** (Hostinger Node, PM2, systemd…) define rutas **absolutas**:
   - `SQLITE_PATH=/home/TU_USUARIO/persistent/hostal-patricia/app.db`
   - Opcional (fotos subidas desde el admin): `UPLOAD_DIR=/home/TU_USUARIO/persistent/hostal-patricia/uploads`
3. No hace falta tocar nada en cada deploy: el proceso Node crea el fichero SQLite si no existe; las subidas van a `UPLOAD_DIR` si la defines.

Prefiere **variables del panel** a un `.env` dentro del repo si el deploy también sobrescribe el `.env`.

Si el asistente pide **directorio de salida** o **archivo de entrada** pensando en un front estático, aquí el proceso que atiende HTTP es el **Node del backend** tras el build; el arranque correcto sigue siendo **`npm start`** en la raíz del monorepo, no solo abrir `frontend/dist` en un servidor de ficheros.

**Consola: “Failed to load module script… MIME type text/html”:** casi siempre el navegador pide un `.js` y recibe HTML (404 disfrazado o `index.html`). Comprueba que el **build del monorepo** se ejecute en deploy (`npm run build` en la raíz) y exista `frontend/dist/assets/` en el servidor. Si la SPA está en una **subruta** (`/app/`), el build debe usar esa base (`VITE_BASE` o `HOSTINGER_STATIC_SUBDIR` en `.env` al construir) y la URL debe coincidir.

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

**Layout plano — monorepo en la raíz de `public_html`** (tu caso: `package.json` y `.htaccess` junto a `frontend/` y `backend/`):

Ruta típica: `.../domains/tudominio.com/public_html`

1. **No** definas `HOSTINGER_STATIC_SUBDIR` en el `.env` del VPS (`VITE_BASE=/`, build en `frontend/dist/`).
2. Copia a `public_html/.htaccess` [`deploy/hostinger-public-html-flat.htaccess.example`](deploy/hostinger-public-html-flat.htaccess.example).
3. Tras cada deploy, [`deploy/remote-deploy.sh`](deploy/remote-deploy.sh) detecta `basename` = `public_html` y crea **`public_html/assets`** → `frontend/dist/assets` (evita MIME `text/html` en `.js` en algunos planes). Si ya existe una carpeta real `assets`, renómbrala o define `HOSTINGER_SKIP_ASSETS_SYMLINK=1`.
4. Si Hostinger dejó un `index.html` por defecto en `public_html`, renómbralo o bórralo.
5. Comprueba en SSH: `ls public_html/frontend/dist/index.html` y `ls public_html/frontend/dist/assets/`.
6. Abre **`https://tu-dominio.com/`**. Si la API falla con **500/503**, el `.htaccess` plano ya enruta a `hostal-api-proxy.php`; asegúrate de tener [`deploy/hostal-api-proxy.php.example`](deploy/hostal-api-proxy.php.example) como `public_html/hostal-api-proxy.php`.

**Monorepo en subcarpeta** (p. ej. `public_html/hostal-web/`): [`deploy/hostinger-public-html.htaccess.example`](deploy/hostinger-public-html.htaccess.example) y ajusta el nombre de carpeta en las reglas si no es `hostal-web`.

**Solo si el front va en `public_html/app/`** (`HOSTINGER_STATIC_SUBDIR=app`): [`deploy/htaccess-opcion-b-subcarpeta-app.example`](deploy/htaccess-opcion-b-subcarpeta-app.example) en `public_html/.htaccess` y abre **`https://tu-dominio.com/app/`**.

(no uses un path fuera del dominio salvo que enlaces con un symlink dentro de `public_html`).

**`/api/*` en 503** con Node OK en `curl http://127.0.0.1:8787/...`: muchos planes **no** dan LiteSpeed Web Admin. Usa el **puente PHP**: [`deploy/hostal-api-proxy.php.example`](deploy/hostal-api-proxy.php.example) → `public_html/hostal-api-proxy.php` y el `.htaccess` que corresponda a tu layout ([`hostinger-public-html-flat.htaccess.example`](deploy/hostinger-public-html-flat.htaccess.example) o [`hostinger-public-html.htaccess.example`](deploy/hostinger-public-html.htaccess.example)). El deploy lo copia la primera vez si falta. Alternativa: *External App* en el panel.

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

