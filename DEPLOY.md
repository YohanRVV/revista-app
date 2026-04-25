# Despliegue

Esta guía cubre el despliegue en **InfinityFree** (gratis para siempre, cPanel) y resumen para **Render**.

---

## Opción A — InfinityFree (recomendado: gratis sin tarjeta)

Tienes un dominio asignado: `revista-app.infinityfreeapp.com`. Sigue estos pasos en orden.

### Paso 1 · Crear la base de datos MySQL en InfinityFree

1. En el panel de InfinityFree → **MySQL Databases**.
2. Crea una nueva base de datos. InfinityFree generará un nombre tipo `if0_41748688_revista`.
3. Anota: **MySQL Hostname** (ej: `sql105.infinityfree.com`), **Username**, **Database name**, **Password**.

### Paso 2 · Cargar el esquema en MySQL (con tus datos demo)

Como InfinityFree no permite ejecutar `php artisan migrate` desde su servidor, generamos el SQL **localmente** y lo importamos.

En tu máquina (terminal en la carpeta del proyecto):

```bash
# 1. Apunta Laravel temporalmente a un MySQL local (Laragon ya trae uno).
#    Edita .env (NO commitees este cambio):
#    DB_CONNECTION=mysql
#    DB_HOST=127.0.0.1
#    DB_PORT=3306
#    DB_DATABASE=revista_dump
#    DB_USERNAME=root
#    DB_PASSWORD=

# 2. Crea la DB local "revista_dump" (HeidiSQL desde Laragon, o):
mysql -u root -e "CREATE DATABASE revista_dump CHARACTER SET utf8mb4;"

# 3. Migra y siembra
php artisan migrate:fresh --seed

# 4. Exporta el dump
mysqldump -u root revista_dump > deploy/infinityfree/revista.sql

# 5. Restaura tu .env a sqlite (no subir el cambio a git)
```

> Si no tienes `mysqldump` en PATH, abre HeidiSQL desde Laragon → click derecho en `revista_dump` → **Export database as SQL** → guarda como `revista.sql`.

Luego en InfinityFree:

1. Panel → **phpMyAdmin** (dentro de MySQL Databases).
2. Selecciona tu DB → pestaña **Import** → sube `revista.sql` → Go.

### Paso 3 · Compilar el proyecto localmente

```bash
# Producción: dependencias sin dev y autoloader optimizado
composer install --no-dev --optimize-autoloader

# Build de assets (Vite)
npm ci --legacy-peer-deps
npm run build
```

Esto deja `vendor/` y `public/build/` listos para subir.

### Paso 4 · Preparar el `.env` de producción

```bash
# Copia la plantilla
cp deploy/infinityfree/env.production.example .env.production

# Genera APP_KEY (lo imprimes y lo pegas en .env.production)
php artisan key:generate --show
```

Edita `.env.production` y reemplaza:
- `APP_KEY` con el valor generado
- `DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` con los datos del Paso 1
- `APP_URL` ya viene con tu dominio

### Paso 5 · Subir todo por FTP

Usa **FileZilla** (recomendado) — File Manager web es lentísimo con tantos archivos.

**Datos FTP**: panel de InfinityFree → **FTP Details**.

Estructura a subir DENTRO de `htdocs/`:

```
htdocs/
├── .htaccess          ← copia desde deploy/infinityfree/.htaccess
├── app/
├── bootstrap/
├── config/
├── database/
├── public/            ← carpeta pública de Laravel
├── resources/
├── routes/
├── storage/
├── vendor/            ← generado por composer install
├── .env               ← renombra .env.production a solo .env al subir
└── artisan
```

> **NO subas**: `node_modules/`, `tests/`, `.git/`, `.env.example`, `mockup.html`, `CLAUDE.md`, `deploy/`, `database/database.sqlite`, `database/database.sqlite-journal`.

**Tip de inodes**: InfinityFree limita ~30k archivos. Si te quedas sin inodes, borra `vendor/laravel/framework/src/Illuminate/Database/Console/` y otras carpetas de comandos artisan no necesarias en producción (alternativa: usa `composer install --no-dev --optimize-autoloader --classmap-authoritative` que reduce inodes).

### Paso 6 · Permisos en `storage/` y `bootstrap/cache/`

En el File Manager web de InfinityFree:
1. Click derecho en `htdocs/storage/` → **Permissions** → `755` recursivo.
2. Click derecho en `htdocs/bootstrap/cache/` → **Permissions** → `755` recursivo.

### Paso 7 · Activar SSL (HTTPS)

1. Panel InfinityFree → **SSL/TLS** → instalar certificado **Let's Encrypt** gratis para tu dominio.
2. Esperar ~10 min a que se active.
3. Ya está, `https://revista-app.infinityfreeapp.com` funcionará.

### Paso 8 · Probar

Abre `https://revista-app.infinityfreeapp.com/` en el navegador.

Login admin: `admin@revista.test` / `password`.

### Si algo no carga

- **500 error** → revisa `htdocs/storage/logs/laravel.log`
- **Página en blanco** → verifica que `APP_DEBUG=false` y mira el log
- **CSS sin cargar** → confirma que subiste `public/build/` y que `npm run build` corrió antes
- **Error de DB** → verifica las credenciales en `.env` y que importaste el `.sql`
- **Tarda 72h en propagar** → es normal en InfinityFree, sé paciente

---

## Opción B — Render (también gratis, requiere Docker pero está pre-configurado)

El repo ya incluye `Dockerfile` y `render.yaml`.

1. Cuenta gratis en [render.com](https://render.com) (no pide tarjeta).
2. Dashboard → **New** → **Blueprint**.
3. Conecta tu repo `YohanRVV/revista-app`.
4. Render lee `render.yaml` y crea: web service + Postgres free.
5. Tras el primer build, en el dashboard del servicio: **Environment** → setea `APP_URL` con tu URL de Render (algo como `https://revista-app.onrender.com`).
6. Espera 5-8 min al primer deploy.

**Limitaciones del free tier de Render**:
- Se duerme tras 15 min de inactividad → primera carga tras descansar tarda ~30 segundos.
- Postgres gratis caduca a los 90 días (hay que recrearla).
- Disco efímero → uploads del admin se pierden en cada redeploy. El seeder usa URLs externas (picsum) así que la demo siempre se ve bien.

---

## Comparación rápida

| | InfinityFree | Render |
|---|---|---|
| Precio | Gratis para siempre | Gratis con cold starts |
| Tarjeta | ❌ No pide | ❌ No pide |
| Setup inicial | ~30 min (FTP, manual) | ~10 min (auto desde GitHub) |
| Velocidad | Rápido siempre | Lento al despertar (30s) |
| Updates | Re-FTP manual | Auto desde `git push` |
| DB | MySQL nativo | Postgres (90 días) |
| Mejor para | Demo siempre activa | Pruebas rápidas iterando |

Para portfolio que recibe pocas visitas, **InfinityFree** da mejor primera impresión (sin esperar 30s).
