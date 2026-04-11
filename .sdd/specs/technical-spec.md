# Especificacion Tecnica — ComunidadIA Frontend

**Generado por**: reverse engineering automatizado
**Fecha**: 2026-03-07
**Version**: 1.0.0
**Repositorio**: comunidadia-frontend-core-develop
**Confianza global**: 🔸 CODE_ONLY

---

## 1. Stack Tecnologico

| Capa | Tecnologia | Version | Confianza |
|------|-----------|---------|-----------|
| Lenguaje | JavaScript (JSX) | ES2020+ | ✅✅ HIGH |
| Framework UI | React | 19.2.0 | ✅✅ HIGH |
| Router | react-router-dom (HashRouter) | 7.9.6 | ✅✅ HIGH |
| HTTP Client | axios | 1.13.2 | ✅✅ HIGH |
| Markdown | marked | 17.0.1 | ✅✅ HIGH |
| Build Tool | Vite | 7.2.4 | ✅✅ HIGH |
| Plugin React | @vitejs/plugin-react | 5.1.1 | ✅✅ HIGH |
| Linter | ESLint 9 (flat config) | 9.39.1 | ✅✅ HIGH |
| Modulos | ESM (`"type": "module"`) | — | ✅✅ HIGH |
| TypeScript | NO (pure JSX) | — | ✅✅ HIGH |
| Testing | NINGUNO | — | ✅✅ (ausencia confirmada) |
| CSS | CSS plano con variables custom | — | ✅✅ HIGH |
| Estado global | React Context API | — | ✅✅ HIGH |
| Estado local | useState (por pagina) | — | ✅✅ HIGH |

---

## 2. Arquitectura

### Patron Arquitectonico

**Page-based SPA con Context-driven Auth**. No existe separacion en capas (no hay carpeta `services/`, `hooks/`, `utils/`). Arquitectura flat con componentes de pagina que llaman directamente al cliente HTTP.

```
src/
  api/
    client.js             → instancia axios, helpers de cookies, interceptores JWT
  context/
    AuthContext.jsx        → estado global de autenticacion (login/signup/logout/me)
  components/             → componentes reutilizables (Navbar, cards, editor, etc.)
  pages/                  → vistas (una por ruta)
  styles.css              → hoja de estilos principal (~802 lineas)
  main.jsx                → entry point
  App.jsx                 → router + layout global
```

### Router

- **Tipo**: `HashRouter` (URLs con `#/`)
- **Razon**: Soporte para hosting estatico sin reescritura de rutas en el servidor
- **Layout global**: `LayoutWithNav` en `App.jsx`
  - Oculta `Navbar` y sidebars en rutas `/inicio`, `/signin`, `/signup`
  - Sidebar derecho: `SidebarMyFollowers` + `SidebarMyPublications` (rutas autenticadas)

### Tabla de Rutas Completa

| Path | Componente | Protegida | Descripcion |
|------|-----------|-----------|-------------|
| `/` | `RootRedirect` | No | Redirige a `/home` (auth) o `/inicio` (no auth) |
| `/inicio` | `Inicio` | No | Landing page |
| `/signin` | `Signin` | No | Formulario de login |
| `/signup` | `Signup` | No | Formulario de registro |
| `/home` | `Home` | SI | Feed de publicaciones |
| `/profile` | `Profile` | SI | Perfil propio + mis publicaciones |
| `/subscriptions` | `Subscriptions` | SI | Seguidores / seguidos |
| `/publications` | `Publications` | SI | Todas las publicaciones con busqueda |
| `/publications/:id` | `PublicationDetail` | SI | Detalle + comentarios |
| `/publications/:id/edit` | `EditPublication` | SI | Editor de publicacion existente |
| `/users` | `Users` | SI | Todos los educadores con busqueda |
| `/users/:id` | `UserDetail` | SI | Perfil de un educador |
| `/create-publication` | `CreatePublication` | SI | Editor de nueva publicacion |
| `*` | redirect a `/` | No | Fallback |

---

## 3. Autenticacion

### Almacenamiento de Tokens

| Cookie | Contenido | TTL | Tipo |
|--------|-----------|-----|------|
| `comunidadia_access` | JWT access token | 7 dias | JavaScript-accessible (NO HttpOnly) |
| `comunidadia_refresh` | Refresh token | 7 dias | JavaScript-accessible (NO HttpOnly) |

### `src/api/client.js` — Logica Completa

```javascript
// baseURL hardcodeada (ver W-006 en DISCREPANCIES)
baseURL: 'https://comunidadia-backend.pedagogiavirtual.com'

// Request interceptor: inyecta Bearer token en todas las peticiones excepto /api/auth/*
// Response interceptor:
//   - Si 401 y no es /api/auth/*:
//       1. Si no está renovando: llama POST /api/auth/refresh
//       2. Encola peticiones pendientes mientras renueva (pendingRequests [])
//       3. isRefreshing flag evita loops
//       4. En fallo de refresh: clearCookies() → logout silencioso
//   - Si 200: retorna respuesta normal
```

### `isAuthenticated` en AuthContext

```javascript
isAuthenticated = !!user || !!getRefreshToken()
// La presencia del refresh token en cookie es suficiente para considerar la sesion activa.
// El user object se obtiene via GET /api/educator/me en el arranque (fetchMe).
```

---

## 4. Catalogo Completo de Endpoints Consumidos

**Base URL**: `https://comunidadia-backend.pedagogiavirtual.com`

### 4.1 Autenticacion

| Metodo | Endpoint | Body/Params | Respuesta | Confianza |
|--------|----------|-------------|-----------|-----------|
| POST | `/api/auth/login` | `{ email, password }` | `{ access_token, refresh_token }` | 🔸 CODE_ONLY |
| POST | `/api/auth/signup` | `{ name, email, password, role: "EDUCATOR", nick_name }` | (status) | 🔸 CODE_ONLY |
| POST | `/api/auth/logout` | `{ refresh_token }` | (status) | 🔸 CODE_ONLY |
| POST | `/api/auth/refresh` | `{ refresh_token }` | `{ new_access_token }` (campo exacto incierto) | 🔸 CODE_ONLY |

### 4.2 Educadores

| Metodo | Endpoint | Query Params | Body | Respuesta | Confianza |
|--------|----------|-------------|------|-----------|-----------|
| GET | `/api/educator/me` | — | — | Educador con `user`, `publications` | 🔸 CODE_ONLY |
| PUT | `/api/educator/me/update` | — | `{ nick_name }` \| `{ name }` \| `{ email }` | Educador actualizado | 🔸 CODE_ONLY |
| PUT | `/api/educator/me/delete` | — | `{ password }` | (status) | 🔸 CODE_ONLY |
| GET | `/api/educator` | `limit`, `offset` | — | `Educator[]` con `followed_by_me` | 🔸 CODE_ONLY |
| GET | `/api/educator/search` | `limit`, `offset`, `q` | — | `Educator[]` con `followed_by_me` | 🔸 CODE_ONLY |
| GET | `/api/educators/:id` | — | — | Educador con `followed_by_me`, `following_me`, `publications` | 🔸 CODE_ONLY |

**Nota**: La inconsistencia `educator` (singular) vs `educators` (plural) en las URLs es del backend.

### 4.3 Publicaciones

| Metodo | Endpoint | Query Params | Body | Respuesta | Confianza |
|--------|----------|-------------|------|-----------|-----------|
| GET | `/api/publication` | `limit`, `offset` | — | `Publication[]` | 🔸 CODE_ONLY |
| GET | `/api/publication/search` | `limit`, `offset`, `nickname_part`, `title_part` | — | `Publication[]` | 🔸 CODE_ONLY |
| GET | `/api/publications/:id` | — | — | `Publication` con `writer`, `comments`, `content` | 🔸 CODE_ONLY |
| GET | `/api/publication/by-user/:userId` | `limit`, `offset` | — | `Publication[]` | 🔸 CODE_ONLY |
| GET | `/api/publication/me` | `limit`, `offset` | — | `Publication[]` del usuario actual | 🔸 CODE_ONLY |
| POST | `/api/publication/me/create` | — | `{ title, publication_type: "ARTICLE", content: "temporal" }` | `{ id, ...Publication }` | 🔸 CODE_ONLY |
| PUT | `/api/publication/me/update/:id` | — | `{ title, content, type: "ARTICLE" }` | (status) | 🔸 CODE_ONLY |
| DELETE | `/api/publication/me/:id` | — | — | (status) | 🔸 CODE_ONLY |

**Nota**: `publication` (singular) vs `publications` (plural) en URLs — inconsistencia del backend.

### 4.4 Suscripciones

| Metodo | Endpoint | Query Params | Body | Respuesta | Confianza |
|--------|----------|-------------|------|-----------|-----------|
| GET | `/api/subscription/me/followers` | `limit`, `offset` | — | `Educator[]` (seguidores) | 🔸 CODE_ONLY |
| GET | `/api/subscription/me/following` | `limit`, `offset` | — | `Educator[]` (seguidos) | 🔸 CODE_ONLY |
| POST | `/api/subscription/follow/:educatorId` | — | — | (status) | 🔸 CODE_ONLY |
| POST | `/api/subscription/unfollow/:educatorId` | — | — | (status) | 🔸 CODE_ONLY |

### 4.5 Comentarios

| Metodo | Endpoint | Body | Respuesta | Confianza |
|--------|----------|------|-----------|-----------|
| POST | `/api/commentary/me/:publicationId` | `{ content }` | `Comment` creado | 🔸 CODE_ONLY |

### 4.6 Uploads

| Metodo | Endpoint | Body | Respuesta | Confianza |
|--------|----------|------|-----------|-----------|
| POST | `/api/upload/` | FormData: `publication_id`, `file` | `{ url }` | 🔸 CODE_ONLY |

**Total de endpoints consumidos**: 21

---

## 5. Componentes

### 5.1 Navbar
- **Props**: ninguna (usa `useAuth()`)
- **Muestra**: logo, "ComunidadIA", "IA para docentes", links de navegacion, nick_name del usuario, boton logout
- **Links activos**: usa `NavLink` con clase `active`
- **Logout**: llama `logout()`, navega a `/inicio`, fuerza `window.location.hash = ''`

### 5.2 ProtectedRoute
- **Props**: `children`
- **Logica**: Si `loading` → "Cargando..."; si `!isAuthenticated` → `<Navigate to="/inicio" />`; si auth → renderiza `children`

### 5.3 PublicationCard
- **Props**: `publication` (objeto), `onClick` (funcion)
- **Renderiza**: `created_at`, `writer.nick_name`, `title`

### 5.4 UserCard
- **Props**: `user`, `onDetail`, `onToggleFollow`, `loadingFollow`
- **Renderiza**: `nick_name`, `user.name`, `user.email`, botones "Detalle" y "Seguir"/"Siguiendo"
- El boton de seguir muestra un spinner mientras `loadingFollow === user.id`

### 5.5 Pagination
- **Props**: `page` (number), `onChange` (function), `disabled` (boolean)
- **Logica**: boton "Anterior" deshabilitado si `page <= 1`; boton "Siguiente" deshabilitado si `disabled === true`

### 5.6 StatusMessage
- **Props**: `type` ("info" | "success" | "error"), `message` (string)
- **Retorna**: `null` si `!message`; `<div className="status-{type}">` si hay mensaje

### 5.7 HtmlEditor (forwardRef)
- **Props**: `value` (string), `onChange` (function), `initialBlocks` (array)
- **Ref API** (`useImperativeHandle`):
  - `getBlocks()` → array de bloques actuales
  - `getPendingImages()` → bloques de tipo "image" con `file` pendiente de upload
  - `setImageUrl(index, url)` → actualiza URL y limpia el `file` del bloque
  - `forceSerialize()` → dispara serializacion del HTML
- **Tipos de bloque**: `paragraph`, `heading1`–`heading6`, `orderedList`, `unorderedList`, `link`, `table`, `image`
- **Toolbar**: Parrafo, Titulo H2, Lista ordenada, Lista, Enlace, Tabla, Imagen, Actualizar HTML
- **Preview**: `dangerouslySetInnerHTML` con HTML serializado (sin sanitizacion cliente)

### 5.8 SidebarMyFollowers
- **Props**: ninguna
- **Fetch**: `GET /api/subscription/me/followers` (limit=20)
- **Navegacion**: click → `/users/:id`

### 5.9 SidebarMyPublications
- **Props**: ninguna
- **Fetch**: `GET /api/publication/me` (limit=10)
- **Navegacion**: click → `/publications/:id`

---

## 6. Mapa de Ownership del Codigo

| Componente | Archivos Primarios (1.0) | Archivos de Soporte (0.8) | Archivos Compartidos (0.2-0.4) |
|-----------|--------------------------|---------------------------|-------------------------------|
| Auth | `src/context/AuthContext.jsx` | `src/api/client.js` | `src/App.jsx` |
| Routing/Layout | `src/App.jsx` | `src/components/Navbar.jsx`, `src/components/ProtectedRoute.jsx` | `src/context/AuthContext.jsx` |
| Home | `src/pages/Home.jsx` | `src/components/PublicationCard.jsx` | `src/api/client.js` |
| Publicaciones (lista) | `src/pages/Publications.jsx` | `src/components/PublicationCard.jsx`, `src/components/Pagination.jsx` | `src/api/client.js` |
| Publicacion (detalle) | `src/pages/PublicationDetail.jsx` | `src/components/StatusMessage.jsx` | `src/api/client.js` |
| Crear Publicacion | `src/pages/CreatePublication.jsx` | `src/components/HtmlEditor.jsx`, `src/components/StatusMessage.jsx` | `src/api/client.js` |
| Editar Publicacion | `src/pages/EditPublication.jsx` | `src/components/HtmlEditor.jsx`, `src/components/StatusMessage.jsx` | `src/api/client.js` |
| Perfil | `src/pages/Profile.jsx` | `src/components/StatusMessage.jsx` | `src/api/client.js` |
| Suscripciones | `src/pages/Subscriptions.jsx` | — | `src/api/client.js` |
| Usuarios (lista) | `src/pages/Users.jsx` | `src/components/UserCard.jsx`, `src/components/Pagination.jsx` | `src/api/client.js` |
| Detalle Usuario | `src/pages/UserDetail.jsx` | — | `src/api/client.js` |
| Editor de Bloques | `src/components/HtmlEditor.jsx` | — | `src/pages/CreatePublication.jsx`, `src/pages/EditPublication.jsx` |
| Sidebar Seguidores | `src/components/SidebarMyFollowers.jsx` | — | `src/api/client.js` |
| Sidebar Publicaciones | `src/components/SidebarMyPublications.jsx` | — | `src/api/client.js` |
| Estilos | `src/styles.css` | — | Todos los componentes |

---

## 7. CSS y Diseno

### Variables CSS (Design Tokens)

```css
--primary: #ff2e2e          /* rojo principal */
--primary-light: #ff5959
--primary-dark: #d92020
--bg: #f7f7f7               /* fondo general */
--card-bg: #ffffff
--text: #111111
--text-muted: #616161
--border: #e5e5e5
--border-radius: 10px
--shadow-sm, --shadow-md
```

### Breakpoints

| Breakpoint | Comportamiento |
|-----------|----------------|
| `900px` | Sidebar se apila debajo del contenido principal |
| `700px` | Tarjetas de publicaciones van en layout vertical |

### Problemas CSS Identificados

- `btn-danger` utilizado en `Profile.jsx` pero sin definicion en `styles.css`
- `App.css` e `index.css` son residuos del scaffold de Vite con tema oscuro (no importados actualmente)

---

## 8. CI/CD

### Workflows Activos

| Workflow | Archivo | Trigger | Proposito |
|---------|---------|---------|-----------|
| Conventional Commits | `conventional-commits.yaml` | PR opened/edited | Valida que el titulo del PR siga el formato `prefix(scope): summary` |
| Branch Freshness | `is-pr-too-behind-develop.yml` | PR a develop | Falla si el branch esta mas de 30 commits atras de `develop` |
| Merge Strategy | `squash-merge-warn.yml` | PR opened | Comenta la estrategia de merge segun el prefijo del branch |

### Prefijos de Branch validos (segun CI)

`feature/`, `fix/`, `release/`, `hotfix/`, `backport/`

### Estrategias de Merge (segun CI)

| Prefijo | Estrategia |
|---------|-----------|
| `feature/*`, `fix/*` | Squash & merge |
| `hotfix/*` | Squash & merge |
| `release/*`, `backport/*` | Merge commit |

### Prefijos de Commits validos (PR title)

`feat`, `docs`, `fix`, `chore`, `style`, `refactor`, `perf`, `test`

---

## 9. Deuda Tecnica (Identificada)

| ID | Descripcion | Impacto | Archivo(s) |
|----|-------------|---------|------------|
| TD-001 | N+1 API calls en Home feed | Performance alta latencia | `Home.jsx` |
| TD-002 | `serializeBlocks()` duplicado 3 veces | Mantenibilidad | `HtmlEditor.jsx`, `CreatePublication.jsx`, `EditPublication.jsx` |
| TD-003 | `dangerouslySetInnerHTML` sin sanitizacion | Seguridad XSS | `PublicationDetail.jsx`, `HtmlEditor.jsx`, `EditPublication.jsx` |
| TD-004 | Tokens en cookies JavaScript (no HttpOnly) | Seguridad | `client.js` |
| TD-005 | `HtmlEditorUpdate.jsx` es codigo muerto | Mantenibilidad | `HtmlEditorUpdate.jsx` |
| TD-006 | `handleUpdateProfile` y `handleUpdatePublication` en Profile sin UI | Mantenibilidad | `Profile.jsx` |
| TD-007 | URL de backend hardcodeada sin variables de entorno | Deployabilidad | `client.js` |
| TD-008 | `marked.parse()` sobre HTML en preview de EditPublication | Comportamiento incorrecto | `EditPublication.jsx` |
| TD-009 | setTimeout 100ms como hack de sincronizacion de estado | Fragilidad | `CreatePublication.jsx`, `EditPublication.jsx` |
| TD-010 | `btn-danger` CSS class indefinida | Visual | `Profile.jsx` |
| TD-011 | Sin tests (unitarios, integracion, E2E) | Confiabilidad | Todo el proyecto |
| TD-012 | Inconsistencia en shape de respuesta de suscripciones | Bug potencial | `Subscriptions.jsx`, `SidebarMyFollowers.jsx` |
