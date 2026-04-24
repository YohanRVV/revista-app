# Revista Digital

> Plataforma de revista digital interactiva con efecto de **hojeo real** en el navegador. El admin sube las páginas como imágenes desde un panel, y los lectores las recorren página por página como si tuvieran la revista en la mano.

![Stack](https://img.shields.io/badge/Laravel-12-red) ![React](https://img.shields.io/badge/React-18-blue) ![Inertia](https://img.shields.io/badge/Inertia.js-2-purple) ![Tailwind](https://img.shields.io/badge/Tailwind-3-teal) ![SQLite](https://img.shields.io/badge/SQLite-local-lightgrey)

---

## Características

- **Visor tipo flipbook** con curvatura, sombra y drag de esquinas (`react-pageflip`)
- **Panel administrativo** completo: CRUD de revistas, subida múltiple de páginas con drag-and-drop, preview en vivo
- **Vista pública editorial** con tipografía de revista (Playfair Display + Inter)
- **Pantalla completa** en el visor
- **Responsive**: una página en móvil, spread doble en desktop
- **Autenticación** de administradores lista (Laravel Breeze)
- **Base de datos SQLite** (cero setup; fácil de migrar a MySQL/Postgres)

## Stack

| Capa | Tecnología |
|---|---|
| Backend | Laravel 12, PHP 8.3 |
| Bridge | Inertia.js (sin API REST separada) |
| Frontend | React 18 + Vite 8 |
| Estilos | Tailwind CSS 3 + Google Fonts (Playfair Display, Inter) |
| Efecto hojeo | [`react-pageflip`](https://www.npmjs.com/package/react-pageflip) (wrapper de StPageFlip) |
| DB | SQLite (por defecto) |
| Auth | Laravel Breeze stack React |

## Requisitos

- PHP **8.2+** (probado con 8.3)
- Composer 2.x
- Node.js **18+** y npm
- SQLite (incluido en PHP)
- Opcional: [Laragon](https://laragon.org/) si estás en Windows — ya sirve la app como `revista-app.test`

## Setup rápido

```bash
# 1. Clonar
git clone https://github.com/YohanRVV/revista-app.git
cd revista-app

# 2. Dependencias
composer install
npm install --legacy-peer-deps   # ver nota abajo

# 3. Entorno
cp .env.example .env
php artisan key:generate

# 4. Base de datos (SQLite se crea automáticamente)
touch database/database.sqlite
php artisan migrate --seed

# 5. Storage symlink (para servir imágenes subidas)
php artisan storage:link

# 6. Levantar en dev
npm run dev          # terminal 1 — Vite HMR
php artisan serve    # terminal 2 — Laravel (si no usas Laragon)
```

> **Nota `--legacy-peer-deps`**: Vite 8 pide `@vitejs/plugin-react` ≥ 5 pero Breeze instala 4.7. El flag evita el error de resolución. Funciona bien.

## Credenciales demo

Tras `php artisan migrate --seed`:

- **Email**: `admin@revista.test`
- **Password**: `password`

El seeder también crea una revista demo con 8 páginas (imágenes de `picsum.photos`).

## Rutas principales

### Públicas
| Método | URL | Descripción |
|---|---|---|
| GET | `/` | Listado de ediciones publicadas |
| GET | `/revista/{slug}` | Visor flipbook |

### Admin (requiere login)
| Método | URL | Descripción |
|---|---|---|
| GET | `/admin/magazines` | Dashboard con stats + listado |
| GET | `/admin/magazines/create` | Nueva revista |
| GET | `/admin/magazines/{id}/edit` | Editor (info + páginas) |
| POST | `/admin/magazines/{id}/pages` | Subir páginas (multi-upload) |
| DELETE | `/admin/magazines/{id}/pages/{page}` | Borrar página |

## Modelo de datos

```
Magazine
├── id, title, slug, issue, description
├── cover_image (path)
├── is_published, published_at
└── hasMany: MagazinePage
        ├── order, image, caption
```

Las imágenes de cada página se guardan en `storage/app/public/magazines/{magazine_id}/` (y la portada en `covers/`). El seeder usa URLs externas de `picsum.photos` para demo — el frontend resuelve automáticamente si el valor es URL o path relativo.

## Estructura del proyecto

```
revista-app/
├── app/
│   ├── Models/
│   │   ├── Magazine.php
│   │   └── MagazinePage.php
│   └── Http/
│       ├── Controllers/
│       │   ├── MagazineController.php         (cliente público)
│       │   └── Admin/
│       │       ├── MagazineController.php     (CRUD admin)
│       │       └── MagazinePageController.php (upload/delete pages)
│       └── Middleware/
│           └── HandleInertiaRequests.php      (comparte auth + flash)
├── database/
│   ├── database.sqlite (ignorado por git)
│   ├── migrations/
│   └── seeders/DatabaseSeeder.php
├── resources/
│   ├── css/app.css                            (Google Fonts + Tailwind)
│   └── js/
│       ├── app.jsx
│       ├── Components/Magazine/Flipbook.jsx   ← componente clave
│       ├── Layouts/
│       │   ├── AdminLayout.jsx                (sidebar + flash)
│       │   ├── AuthenticatedLayout.jsx        (Breeze, poco usado)
│       │   └── GuestLayout.jsx                (login)
│       └── Pages/
│           ├── Public/
│           │   ├── Home.jsx                   (landing editorial)
│           │   └── Viewer.jsx                 (visor con flipbook)
│           └── Admin/Magazines/
│               ├── Index.jsx                  (dashboard stats + cards)
│               ├── Create.jsx
│               └── Edit.jsx                   (info + drag-and-drop pages)
├── routes/web.php
├── tailwind.config.js                         (fuentes + paleta paper/ink)
├── vite.config.js
├── mockup.html                                (mockup visual standalone)
├── CLAUDE.md                                  (guía para IAs)
└── README.md                                  (este archivo)
```

## Comandos útiles

```bash
# Reiniciar DB con datos demo
php artisan migrate:fresh --seed

# Build de producción
npm run build

# Ver rutas registradas
php artisan route:list --except-vendor

# Tinker (REPL de Laravel)
php artisan tinker
```

## Despliegue

Para hosting gratuito/barato con Laravel + SQLite, recomendamos:

1. **Fly.io** — Docker, volumen persistente, 3 VMs gratis. Mejor opción para SQLite.
2. **Railway** — deploy desde GitHub en 1 click ($5 crédito/mes).
3. **AlwaysData** — plan gratis 100MB, SSH, PHP + SQLite.

> **Ojo con SQLite en producción**: en tiers "free" sin disco persistente (como Render Free), **se borra la DB en cada reinicio**. En ese caso, cambia a MySQL/Postgres en `.env` (la app funciona igual).

Pasos antes de deploy:
```bash
npm run build
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## Gotchas conocidos

- **`--legacy-peer-deps` en `npm install`**: mismatch Vite 8 / `@vitejs/plugin-react` 4.7. Removerlo si actualizas plugin-react a v5.
- **Composer en Windows/Laragon**: `composer` no está en PATH por defecto. Usa `C:\laragon\bin\composer\composer.bat` o agrégalo al PATH.
- **Flipbook**: si el número total de páginas (descontando la portada) es impar, `react-pageflip` pinta mal el último flip. El componente compensa automáticamente agregando una contraportada en blanco — no quitarlo.
- **`WithoutModelEvents`** en el seeder: el autogenerador de `slug` del modelo `Magazine` usa el evento `saving`, que el seeder desactiva. Por eso el seeder pasa el slug explícito.

## Pendientes (roadmap sugerido)

- [ ] Drag-and-drop para reordenar páginas (endpoint `reorder` ya existe)
- [ ] Compresión automática de imágenes al subir (Intervention Image)
- [ ] Zoom en el visor
- [ ] Índice lateral / saltar a página
- [ ] Separar roles "admin" vs "usuario" (ahora cualquier `auth` es admin)
- [ ] Analytics por página
- [ ] SEO (meta, og:image por revista)
- [ ] Tema claro/oscuro
- [ ] Multi-idioma

## Trabajando con IA (Claude / Copilot / Cursor)

Este repo incluye [`CLAUDE.md`](./CLAUDE.md) con contexto completo para que un asistente de IA pueda continuar el trabajo con fidelidad. Antes de pedirle cambios grandes a una IA, pídele que lea ese archivo primero.

## Licencia

MIT. Libre para clonar, aprender y usar.

---

Hecho por [YohanRVV](https://github.com/YohanRVV) · Laravel + React + `react-pageflip`
