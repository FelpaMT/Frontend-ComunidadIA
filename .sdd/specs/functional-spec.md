# Especificacion Funcional — ComunidadIA Frontend

**Generado por**: reverse engineering automatizado
**Fecha**: 2026-03-07
**Version**: 1.0.0
**Repositorio**: comunidadia-frontend-core-develop
**Confianza global**: 🔸 CODE_ONLY (sin OpenAPI spec de backend, sin docs previos)

---

## 1. Descripcion del Sistema

ComunidadIA es una plataforma web para educadores que integra inteligencia artificial en la practica pedagogica. Es una SPA (Single-Page Application) que permite a los docentes publicar articulos, seguir a otros educadores, y comentar publicaciones en una red social educativa.

**Tagline**: "IA para docentes"
**Idioma de la UI**: Espanol
**Tipo de aplicacion**: SPA con HashRouter (URLs tipo `/#/ruta`)

---

## 2. Sistema de Contexto

### Actores Principales

| Actor | Tipo | Descripcion | Fuente |
|-------|------|-------------|--------|
| Educador (usuario autenticado) | Humano | Docente registrado. Unico rol existente. Puede crear, editar, publicar y comentar. | Codigo |
| Visitante (no autenticado) | Humano | Solo puede ver la landing page, iniciar sesion o registrarse. | Codigo |
| API Backend | Sistema externo | `https://comunidadia-backend.pedagogiavirtual.com` — provee todos los datos y autenticacion. | Codigo |
| Browser / Cookie Store | Sistema | Almacena tokens JWT en cookies (no HttpOnly). | Codigo |

### Dependencias Salientes (lo que consume este frontend)

| Dependencia | Tipo | Proposito |
|-------------|------|-----------|
| Backend REST API | Servicio externo | Autenticacion, publicaciones, educadores, suscripciones, comentarios, uploads |
| Browser `document.cookie` | API del navegador | Persistencia de tokens de sesion |

---

## 3. Casos de Uso

### Dominio: Autenticacion

#### UC-001: Iniciar Sesion ✅✅ (CODE_ONLY)
- **Actor**: Educador
- **Precondicion**: Usuario registrado, no autenticado
- **Flujo principal**:
  1. Accede a `/signin`
  2. Ingresa email y contrasena
  3. El sistema llama a `POST /api/auth/login`
  4. Se almacenan `access_token` y `refresh_token` en cookies con expiracion de 7 dias
  5. Se obtiene el perfil del usuario via `GET /api/educator/me`
  6. Se redirige a `/home`
- **Flujos alternativos**:
  - 401/400: Muestra "Credenciales incorrectas"
  - Otro error: Muestra "Error inesperado"
- **Postcondicion**: Usuario autenticado, `isAuthenticated = true`

#### UC-002: Registrarse 🔸 (CODE_ONLY)
- **Actor**: Visitante
- **Flujo principal**:
  1. Accede a `/signup`
  2. Ingresa nombre, nick_name, email, contrasena
  3. El sistema llama a `POST /api/auth/signup` con `role: "EDUCATOR"` (fijo, no seleccionable)
  4. En exito, redirige a `/signin` con mensaje de exito
- **Flujos alternativos**:
  - 400/409: "Datos invalidos o email ya registrado"
  - Otro error: "Error inesperado"
- **Regla de negocio**: Solo se puede registrar como `EDUCATOR`. No existe otro rol en el frontend.

#### UC-003: Cerrar Sesion 🔸 (CODE_ONLY)
- **Actor**: Educador autenticado
- **Flujo principal**:
  1. Hace click en "Cerrar sesion" en el Navbar
  2. El sistema llama a `POST /api/auth/logout` con el refresh_token
  3. Se borran las cookies de tokens independientemente del resultado de la API
  4. Se redirige a `/inicio`
- **Postcondicion**: `user = null`, cookies limpiadas

#### UC-004: Renovacion Automatica de Token 🔸 (CODE_ONLY)
- **Actor**: Sistema (automatico)
- **Trigger**: Respuesta 401 de cualquier endpoint que no sea `/api/auth/*`
- **Flujo**:
  1. Interceptor de Axios detecta 401
  2. Si no hay renovacion en curso, llama a `POST /api/auth/refresh` con el refresh_token
  3. Mientras se renueva, encola las peticiones pendientes
  4. Al obtener nuevo token, reinvoca todas las peticiones encoladas
  5. Si la renovacion falla: limpia cookies (logout silencioso)
- **Regla**: Las peticiones a `/api/auth/*` quedan excluidas del refresh automatico

---

### Dominio: Publicaciones

#### UC-005: Ver Feed Personal (Home) 🔸 (CODE_ONLY)
- **Actor**: Educador autenticado
- **Pagina**: `/home`
- **Flujo**:
  1. Al cargar la pagina, obtiene la lista de usuarios seguidos via `GET /api/subscription/me/following` (limit=50)
  2. Para cada usuario seguido, obtiene sus publicaciones via `GET /api/publication/by-user/:userId` (limit=10)
  3. Combina todas las publicaciones y las ordena por `created_at` descendente (mas recientes primero)
  4. Muestra tarjetas de publicaciones clicables
- **Navegacion desde Home**: "Mi perfil" → `/profile`, "Suscripciones" → `/subscriptions`, "Crear publicacion" → `/create-publication`
- **Problema conocido**: N+1 llamadas secuenciales a la API (ver I-001 en DISCREPANCIES_REPORT.md)

#### UC-006: Explorar Todas las Publicaciones 🔸 (CODE_ONLY)
- **Actor**: Educador autenticado
- **Pagina**: `/publications`
- **Flujo principal**:
  1. Carga publicaciones paginadas via `GET /api/publication` (limit=10, offset calculado por pagina)
  2. Muestra lista con paginacion ("Anterior" / "Siguiente")
  3. Al llegar a una pagina donde `data.length < 10`, el boton "Siguiente" queda desactivado
- **Flujo alternativo (busqueda)**:
  1. Usuario ingresa `nick_name` del autor y/o `titulo` de la publicacion
  2. Se llama a `GET /api/publication/search` con `nickname_part` y/o `title_part`
  3. "Limpiar" restablece la busqueda y vuelve a la pagina 1
- **Postcondicion**: Usuario puede hacer click en cualquier publicacion para ver el detalle

#### UC-007: Ver Detalle de Publicacion 🔸 (CODE_ONLY)
- **Actor**: Educador autenticado
- **Pagina**: `/publications/:id`
- **Flujo**:
  1. Carga la publicacion via `GET /api/publications/:id`
  2. Muestra: fecha, autor (clicable → `/users/:writerId`), titulo, contenido HTML renderizado
  3. Muestra listado de comentarios existentes con fecha y contenido
  4. Formulario de nuevo comentario (textarea + boton)
  5. Al enviar comentario: `POST /api/commentary/me/:publicationId` con `{ content }`
  6. El nuevo comentario se agrega al estado local sin recargar la pagina

#### UC-008: Crear Publicacion 🔸 (CODE_ONLY)
- **Actor**: Educador autenticado
- **Pagina**: `/create-publication`
- **Flujo**:
  1. Usuario ingresa titulo y crea contenido usando el editor de bloques (`HtmlEditor`)
  2. Al publicar:
     a. `POST /api/publication/me/create` con `{ title, publication_type: "ARTICLE", content: "temporal" }` — obtiene `id`
     b. Para cada imagen pendiente en el editor: `POST /api/upload/` con FormData (`publication_id`, `file`) — obtiene URL
     c. Actualiza URLs de imagenes en los bloques del editor
     d. Serializa el HTML final de todos los bloques
     e. `PUT /api/publication/me/update/:id` con `{ title, content: htmlFinal, type: "ARTICLE" }`
     f. Redirige a `/publications/:id`
- **Regla de negocio**: El tipo de publicacion es siempre `"ARTICLE"`. No hay seleccion de tipo.
- **Regla de negocio**: La creacion es un proceso de dos pasos: primero crea con contenido placeholder "temporal", luego actualiza con el contenido real.

#### UC-009: Editar Publicacion 🔸 (CODE_ONLY)
- **Actor**: Educador autenticado (solo sus propias publicaciones)
- **Pagina**: `/publications/:id/edit`
- **Flujo**:
  1. Carga la publicacion via `GET /api/publications/:id`
  2. Convierte el HTML almacenado a bloques via `htmlToBlocks()` para el editor
  3. Usuario modifica titulo y/o contenido
  4. Al guardar: mismo flujo multi-paso que UC-008 (upload imagenes, serialize, PUT update)
- **Problema conocido**: El preview usa `marked.parse()` sobre HTML, lo que produce renderizado incorrecto (ver I-004)

#### UC-010: Eliminar Publicacion 🔸 (CODE_ONLY)
- **Actor**: Educador autenticado (solo sus propias publicaciones)
- **Pagina**: `/profile`
- **Flujo**:
  1. En la seccion "Mis Publicaciones" del perfil, hace click en "Eliminar"
  2. Se muestra `window.confirm()` pidiendo confirmacion
  3. Si confirma: `DELETE /api/publication/me/:id`
  4. La publicacion desaparece del listado local

---

### Dominio: Educadores y Suscripciones

#### UC-011: Explorar Educadores 🔸 (CODE_ONLY)
- **Actor**: Educador autenticado
- **Pagina**: `/users`
- **Flujo**:
  1. Carga educadores paginados via `GET /api/educator` (limit=10)
  2. Muestra tarjetas con nick_name, nombre, email, boton "Detalle" y boton "Seguir"/"Siguiendo"
  3. Busqueda por nick_name: `GET /api/educator/search?q=...`
- **Flujo alternativo (seguir/dejar de seguir)**:
  1. Click en "Seguir": `POST /api/subscription/follow/:educatorId`
  2. Click en "Siguiendo" (toggle): `POST /api/subscription/unfollow/:educatorId`
  3. El estado local se actualiza inmediatamente (optimistic update del campo `followed_by_me`)

#### UC-012: Ver Perfil de otro Educador 🔸 (CODE_ONLY)
- **Actor**: Educador autenticado
- **Pagina**: `/users/:id`
- **Flujo**:
  1. Carga educador via `GET /api/educators/:id`
  2. Muestra: nick_name, nombre, email, si el educador sigue al usuario actual (`following_me`)
  3. Boton de seguir/dejar de seguir
  4. Listado de publicaciones del educador (cada una clicable)

#### UC-013: Ver Mis Suscripciones 🔸 (CODE_ONLY)
- **Actor**: Educador autenticado
- **Pagina**: `/subscriptions`
- **Flujo**:
  1. Carga en paralelo seguidores (`GET /api/subscription/me/followers`, limit=50) y seguidos (`GET /api/subscription/me/following`, limit=50)
  2. Muestra dos columnas: "Usuarios que me siguen" / "Usuarios que sigo"
  3. Cada usuario es clicable → `/users/:id`

---

### Dominio: Perfil Propio

#### UC-014: Ver y Editar Mi Perfil 🔸 (CODE_ONLY)
- **Actor**: Educador autenticado
- **Pagina**: `/profile`
- **Datos mostrados**: nick_name, nombre, email (desde `GET /api/educator/me`)
- **Actualizaciones independientes**:
  - Actualizar nick_name: campo + boton → `PUT /api/educator/me/update` con `{ nick_name }`
  - Actualizar nombre: campo + boton → `PUT /api/educator/me/update` con `{ name }`
  - Actualizar email: campo + boton → `PUT /api/educator/me/update` con `{ email }`
- **Seccion "Mis Publicaciones"**: lista las publicaciones del usuario con botones "Ver", "Editar", "Eliminar"

#### UC-015: Eliminar Cuenta 🔸 (CODE_ONLY)
- **Actor**: Educador autenticado
- **Pagina**: `/profile`
- **Flujo**:
  1. Ingresa contrasena en campo de eliminacion de cuenta
  2. `window.confirm()` solicita confirmacion
  3. `PUT /api/educator/me/delete` con `{ password }`
  4. Logout automatico y redireccion a `/inicio`

---

## 4. Navegacion y Restricciones de Acceso

| Pagina | Ruta | Requiere Auth | Descripcion |
|--------|------|---------------|-------------|
| Landing | `/inicio` | No | CTA para login/registro |
| Login | `/signin` | No | Formulario de acceso |
| Registro | `/signup` | No | Formulario de alta |
| Feed | `/home` | SI | Publicaciones de seguidos |
| Perfil propio | `/profile` | SI | Ver/editar datos, mis publicaciones |
| Suscripciones | `/subscriptions` | SI | Seguidores y seguidos |
| Todas las publicaciones | `/publications` | SI | Explorar/buscar publicaciones |
| Detalle publicacion | `/publications/:id` | SI | Leer + comentar |
| Editar publicacion | `/publications/:id/edit` | SI | Editar (solo propias) |
| Todos los educadores | `/users` | SI | Explorar/buscar/seguir |
| Perfil de educador | `/users/:id` | SI | Ver publicaciones y seguir |
| Crear publicacion | `/create-publication` | SI | Editor de bloques |
| Raiz | `/` | No | Redirige a `/home` o `/inicio` |

**Mecanismo de proteccion**: Componente `ProtectedRoute` que valida `isAuthenticated` del contexto de autenticacion. No autenticado → redirige a `/inicio`.

---

## 5. Modelo de Datos (inferred desde frontend)

### Educador
```
{
  id: string|number,
  nick_name: string,
  user: {
    id: string|number,
    name: string,
    email: string,
    role: "EDUCATOR"   // siempre
  },
  publications: Publication[],     // solo en respuestas de perfil
  followed_by_me: boolean,         // en listas y detalle
  following_me: boolean            // solo en detalle (/api/educators/:id)
}
```

### Publicacion
```
{
  id: string|number,
  title: string,
  content: string,                // HTML serializado
  publication_type: "ARTICLE",    // siempre ARTICLE
  created_at: string,             // ISO datetime
  writer: {
    id: string|number,
    nick_name: string
  },
  comments: Comment[]             // solo en detalle
}
```

### Comentario
```
{
  id: string|number,
  content: string,
  created_at: string              // ISO datetime
}
```

### Tokens de Autenticacion
```
{
  access_token: string,    // JWT
  refresh_token: string
}
```
Almacenados en cookies: `comunidadia_access`, `comunidadia_refresh` (7 dias de expiracion)

---

## 6. E2E Scenarios

### E2E-001: Flujo completo de nuevo educador
1. Visita la landing page `/inicio`
2. Hace click en "Crear cuenta" → registro exitoso
3. Inicia sesion → redireccion a `/home`
4. Explora educadores en `/users` y sigue a 2
5. Crea una publicacion en `/create-publication` con imagen
6. Ve su publicacion en el feed `/home`
7. Otro educador comenta su publicacion
8. Cierra sesion

### E2E-002: Busqueda y comentario
1. Educador autenticado va a `/publications`
2. Busca por nombre del autor
3. Abre una publicacion
4. Lee el contenido y los comentarios
5. Agrega un comentario
6. Ve el comentario en la lista actualizada

---

## 7. Reglas de Negocio

| ID | Regla | Evidencia |
|----|-------|-----------|
| RN-001 | Solo existe el rol EDUCATOR — el registro siempre envia `role: "EDUCATOR"` | `src/pages/Signup.jsx` |
| RN-002 | El tipo de publicacion siempre es "ARTICLE" — no es seleccionable por el usuario | `src/pages/CreatePublication.jsx`, `EditPublication.jsx` |
| RN-003 | La creacion de publicacion es de dos pasos: primero crea con contenido "temporal", luego actualiza | `src/pages/CreatePublication.jsx` |
| RN-004 | Las imagenes se suben al backend ligadas a un `publication_id` especifico | `src/pages/CreatePublication.jsx`, `EditPublication.jsx` |
| RN-005 | La eliminacion de publicacion requiere confirmacion del navegador (`window.confirm`) | `src/pages/Profile.jsx` |
| RN-006 | La eliminacion de cuenta requiere contrasena + confirmacion del navegador | `src/pages/Profile.jsx` |
| RN-007 | El feed del home se construye en cliente: N+1 llamadas por usuario seguido | `src/pages/Home.jsx` |
| RN-008 | Las actualizaciones de perfil son por campo independiente (nick_name, name, email) | `src/pages/Profile.jsx` |
| RN-009 | Los tokens JWT se almacenan en cookies JavaScript (no HttpOnly) con 7 dias de TTL | `src/api/client.js` |
| RN-010 | Las solicitudes a `/api/auth/*` no llevan header de Authorization ni disparan refresh | `src/api/client.js` |
