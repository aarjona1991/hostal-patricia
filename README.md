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

