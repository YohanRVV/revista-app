# CLAUDE.md — Guía de agente de IA

> **Lee este archivo primero** antes de hacer cambios. Contiene contexto que no está en el código y que evitará que rompas cosas o repitas errores que ya resolvimos.

---

## TL;DR del proyecto

**Revista Digital** — una app Laravel + Inertia + React donde un admin sube imágenes de las páginas de una revista, y los lectores las ven en el navegador con efecto de **hojeo real** (curvatura + drag de esquinas).

Tech: Laravel 12 · Inertia.js · React 18 · Tailwind 3 · SQLite · `react-pageflip`.

Público objetivo: lectores que prefieren la experiencia de papel. El admin es para un equipo editorial pequeño — simple, no es un CMS completo.

---

## Mapa de archivos

Ordenados por importancia.

### Componente clave
- **`resources/js/Components/Magazine/Flipbook.jsx`** — el corazón visual. Envuelve `HTMLFlipBook` de `react-pageflip`. Delicado: cambios aquí pueden romper el efecto (ver *Gotchas del flipbook* más abajo).

### Páginas React (Inertia)
- `resources/js/Pages/Public/Home.jsx` — landing editorial con edición destacada + archivo
- `resources/js/Pages/Public/Viewer.jsx` — visor que renderiza `<Flipbook/>`
- `resources/js/Pages/Admin/Magazines/Index.jsx` — dashboard admin con stats y cards
- `resources/js/Pages/Admin/Magazines/Create.jsx` — nueva revista (con preview de portada)
- `resources/js/Pages/Admin/Magazines/Edit.jsx` — editor completo (info + drag-and-drop de páginas)

### Layouts
- `resources/js/Layouts/AdminLayout.jsx` — sidebar + flash messages (usar este para cualquier pantalla admin nueva)
- `resources/js/Layouts/AuthenticatedLayout.jsx` — layout de Breeze; solo lo usan las páginas de perfil. **Para admin usa `AdminLayout`**.
- `resources/js/Layouts/GuestLayout.jsx` — login/registro

### Backend
- `app/Models/Magazine.php` — genera `slug` automáticamente vía `saving` event
- `app/Models/MagazinePage.php`
- `app/Http/Controllers/MagazineController.php` — rutas públicas
- `app/Http/Controllers/Admin/MagazineController.php` — CRUD admin
- `app/Http/Controllers/Admin/MagazinePageController.php` — `store` (multi-upload), `reorder`, `destroy`
- `app/Http/Middleware/HandleInertiaRequests.php` — **comparte `auth` y `flash` con todas las páginas**

### Config
- `routes/web.php`
- `tailwind.config.js` — define `font-display` (Playfair), `font-sans` (Inter), colores `paper-*` e `ink-*`
- `resources/css/app.css` — importa Google Fonts y Tailwind
- `vite.config.js`
- `database/seeders/DatabaseSeeder.php` — crea admin + 1 revista demo con 8 páginas (URLs picsum)

### Docs
- `README.md` — para humanos (setup, stack, deploy)
- `CLAUDE.md` — este archivo (para IAs)
- `mockup.html` — mockup visual de todas las pantallas, abrir en navegador

---

## Convenciones del proyecto

Al escribir código, respeta estas convenciones existentes:

1. **Layouts admin**: siempre `AdminLayout` con props `title`, `breadcrumbs`, `actions`, `children`. No reinventar.
2. **Formularios**: usar `useForm` de Inertia. Para uploads, `forceFormData: true`.
3. **Clases de input reutilizadas** en admin:
   ```
   w-full bg-white border border-ink-900/15 rounded-lg px-3.5 py-2.5 text-sm
   focus:border-ink-900 focus:ring-2 focus:ring-ink-900/10 outline-none transition
   ```
   Ver helper `Field` + `inputClass` en `Create.jsx` / `Edit.jsx`.
4. **Tipografía**: `font-display` (Playfair) para títulos/encabezados editoriales. `font-sans` (Inter) por defecto para UI.
5. **Colores**: `bg-paper-50` (fondo claro editorial), `text-ink-900` (texto principal). `amber-600` como accent.
6. **Flash**: emitir desde controladores con `->with('success', '...')`; el `AdminLayout` ya lo muestra como toast.
7. **Imágenes**: siempre pasar por `resolveImage()` (maneja URLs externas y paths de storage). Ver implementación en `Home.jsx`, `Viewer.jsx`, `Index.jsx`.
8. **Español en UI**: toda la copy visible al usuario está en español (admin + público).

---

## Gotchas importantes (de errores pasados)

### 🔴 Flipbook — NO remover esto

1. **`safePages` useMemo en `Flipbook.jsx`**: agrega una contraportada blanca si `(total - 1)` es impar. Sin esto, el último flip se ve roto cuando `showCover={true}`. No lo quites "porque no se usa" — sí se usa.

2. **Componente `Page` usa `forwardRef`**: react-pageflip asigna refs a cada child directo. Si creas una page con otro componente, también tiene que ser `forwardRef`. La blank page se renderiza **dentro** del mismo componente `Page` con prop `blank={true}` para evitar este problema.

3. **NO añadir CSS custom a clases internas** (`.stf__parent`, `.stf__block`, `.stf__item`). Rompe el efecto 3D / z-index.

4. **NO envolver `<HTMLFlipBook>`** con divs extra con `relative`/`absolute`/`glow` etc. Crea stacking contexts que hacen desaparecer páginas durante el flip.

5. **NO usar `usePortrait={true}`**: fuerza modo portrait y rompe el spread en desktop. Dejar el default.

6. **`key={dims.width}x{dims.height}`** en `HTMLFlipBook`: re-monta el libro cuando cambia el tamaño de ventana. Sin esto, resize deja el libro en tamaño viejo.

### 🟡 Backend

- **Seeder con `WithoutModelEvents`**: el trait en el seeder desactiva el evento `saving` del modelo `Magazine`, así que el **slug no se autogenera**. Cualquier magazine creado en seeders debe pasar `slug` explícito.
- **Slug duplicado**: el modelo agrega un sufijo random (`Str::random(6)`) al slug auto-generado para evitar colisiones. No cambiar esto sin manejar el caso de títulos repetidos.
- **Autorización**: actualmente **cualquier usuario autenticado es admin**. Si agregas usuarios públicos, crea un middleware `admin` o usa policies.

### 🟡 Infra

- **Windows/Laragon**: composer no está en PATH. Usar `/c/laragon/bin/composer/composer.bat` en bash, o `C:\laragon\bin\composer\composer.bat` en PowerShell.
- **`npm install` requiere `--legacy-peer-deps`** por conflicto Vite 8 / `@vitejs/plugin-react` 4.7. Si alguien actualiza el plugin a 5+, el flag se puede quitar.
- **`bootstrap.js` debe tener extensión explícita** en `app.jsx` (`import './bootstrap.js'`, no `'./bootstrap'`). Vite 8 + rolldown es estricto con esto.

---

## Tareas comunes — cómo abordarlas

### Agregar una nueva página al admin
1. Crear controller action (o reutilizar)
2. Agregar ruta en `routes/web.php` dentro del grupo `admin.` con middleware `auth,verified`
3. Crear `resources/js/Pages/Admin/.../NombrePagina.jsx`
4. Usar `AdminLayout` con props `title`, `breadcrumbs`, `actions`
5. Si hay forms, usar el patrón `Field` + `inputClass` de Create/Edit

### Agregar un nuevo modelo relacionado a Magazine
1. `php artisan make:model Nombre -mcr`
2. Editar migración (ver estilo de `2026_04_24_221231_create_magazine_pages_table.php`)
3. Declarar `$fillable` y relaciones en el modelo
4. Actualizar `Magazine::pages()` si aplica
5. `php artisan migrate`
6. Si hay dashboard, actualizar `Index.jsx` stats

### Cambiar el diseño del visor sin romper el flip
- Toca solo `Viewer.jsx` (header, footer, fondo, chrome exterior)
- **No tocar `Flipbook.jsx` a menos que entiendas la sección "Gotchas del flipbook"**
- Para cambios en el background/ambiente, usar `bg-*` en el `<div>` root de `Viewer`

### Switch de SQLite a MySQL/Postgres
1. `.env`: cambiar `DB_CONNECTION` y agregar credenciales
2. `php artisan migrate:fresh --seed`
3. Borrar `database/database.sqlite` (opcional, para limpieza)
4. El resto del código es DB-agnóstico.

### Subir a producción
- Ver sección "Despliegue" del `README.md`
- Siempre: `npm run build` antes de deploy (Vite manifest)
- SQLite necesita disco persistente; si el host no lo tiene, migrar a Postgres/MySQL

---

## Lo que NO debes hacer

- ❌ Reemplazar `react-pageflip` por otra librería "mejor" sin pedir autorización. Se evaluaron alternativas (turn.js, dflip) y se descartaron.
- ❌ Convertir a SPA pura con API REST separada. Inertia es una decisión arquitectónica fuerte.
- ❌ Agregar dependencias pesadas sin justificar (Redux, MobX, UI kits enteros como Chakra/MUI). Tailwind + componentes propios bastan.
- ❌ Subir archivos a `public/` directamente. Todo va a `storage/app/public/` y se sirve via el symlink.
- ❌ Escribir comentarios obvios. Solo comentar el "por qué", no el "qué". Ver gotchas: todos están comentados solo cuando no-obvio.
- ❌ Crear archivos `.md` de planificación, notas, análisis etc. Trabaja desde la conversación o edita los existentes (README / CLAUDE).
- ❌ Dejar `console.log` o `dd()` en el código que entregues.

---

## Comandos rápidos de dev

```bash
# Reset total
php artisan migrate:fresh --seed

# Build
npm run build

# Rutas (verificar que lo nuevo esté registrado)
php artisan route:list --except-vendor

# Tinker
php artisan tinker
>>> \App\Models\Magazine::with('pages')->first()
```

---

## Contexto histórico (para no repetir errores)

Bugs reales que se encontraron y arreglaron:

1. **"Las páginas desaparecen al voltear"** — causado por CSS custom en `.stf__parent`/`.stf__block` + wrappers con `relative` y glow `absolute`. Solución: eliminar todo lo anterior; render directo de `HTMLFlipBook`.
2. **"Algunos flips animan y otros no"** — `usePortrait={true}` + `size="stretch"` + `autoSize={true}` peleándose entre sí. Solución: `size="fixed"`, sin `usePortrait`, sin `autoSize`.
3. **"El último flip se ve roto"** — `showCover={true}` requiere `(total - 1) % 2 === 0`. Solución: padding con página en blanco vía `useMemo`.
4. **"La blank page rompe el ref"** — la blank page era otro componente sin `forwardRef`. Solución: renderizar blank dentro del mismo `Page` con prop.
5. **"Composer no se reconoce"** — no está en PATH en Windows/Laragon. Usar `composer.bat` con ruta completa.
6. **"npm install falla con peer deps"** — Vite 8 vs plugin-react 4.7. Solución: `--legacy-peer-deps`.

---

## Si algo no está en este archivo

- Código: el código es la fuente de verdad, no las memorias.
- Decisiones de producto: preguntar al usuario (YohanRVV).
- Deploy específico: ver README sección Despliegue.
- Historial: `git log` es más confiable que cualquier doc.

Al añadir un gotcha importante nuevo, **actualiza este archivo**. Un agente futuro te lo agradecerá.
