# Patrones del Proyecto — ComunidadIA Frontend

**Generado por**: reverse engineering automatizado
**Fecha**: 2026-03-07
**Tamano del repositorio**: pequeno (<10k LOC)

---

## Patron 1: Estado de Pagina Estandar

**Categoria**: State Management

**Descripcion**: Todas las paginas utilizan el mismo set de variables de estado: `data`, `loading`, `status`.

**Evidencia**:
- `src/pages/Publications.jsx` — `const [loading, setLoading] = useState(false)` + `const [status, setStatus] = useState({ type: '', message: '' })`
- `src/pages/Users.jsx` — mismo patron
- `src/pages/Profile.jsx` — mismo patron
- `src/pages/PublicationDetail.jsx` — mismo patron
- `src/pages/Subscriptions.jsx` — mismo patron

**Ejemplo**:
```jsx
const [data, setData] = useState([])
const [loading, setLoading] = useState(false)
const [status, setStatus] = useState({ type: '', message: '' })

// En el fetch:
setLoading(true)
try {
  const res = await client.get('/api/...')
  setData(res.data)
} catch (err) {
  setStatus({ type: 'error', message: 'Error inesperado' })
} finally {
  setLoading(false)
}
```

**Cuando usar**: En cualquier pagina nueva que haga fetch de datos al montar.

---

## Patron 2: Manejo de Errores HTTP con Codigos Especificos

**Categoria**: Error Handling

**Descripcion**: Los errores de Axios son capturados y traducidos a mensajes de usuario basados en `err.response.status`.

**Evidencia**:
- `src/pages/Signin.jsx`
- `src/pages/Signup.jsx`
- `src/pages/Profile.jsx`

**Ejemplo**:
```jsx
} catch (err) {
  const status = err.response?.status
  if (status === 401 || status === 400) {
    setStatus({ type: 'error', message: 'Credenciales incorrectas' })
  } else if (status === 409) {
    setStatus({ type: 'error', message: 'Email ya registrado' })
  } else {
    setStatus({ type: 'error', message: 'Error inesperado' })
  }
}
```

**Cuando usar**: En todos los handlers de formularios que interactuan con la API.

---

## Patron 3: Componente StatusMessage para Feedback de UI

**Categoria**: UI / Feedback

**Descripcion**: Todos los formularios y paginas con acciones mutantes usan el componente `StatusMessage` con el estado `{ type, message }`.

**Evidencia**:
- `src/pages/Signin.jsx`, `Signup.jsx`, `Profile.jsx`, `CreatePublication.jsx`, `EditPublication.jsx`, `PublicationDetail.jsx`
- `src/components/StatusMessage.jsx` (definicion)

**Ejemplo**:
```jsx
// En el componente:
const [status, setStatus] = useState({ type: '', message: '' })

// Al renderizar:
<StatusMessage type={status.type} message={status.message} />

// Al setear exito:
setStatus({ type: 'success', message: 'Guardado correctamente' })

// Al setear error:
setStatus({ type: 'error', message: 'Error al guardar' })
```

**Cuando usar**: En cualquier pagina con operaciones que pueden fallar o tener exito visible para el usuario.

---

## Patron 4: Paginacion con LIMIT + Deteccion de Fin

**Categoria**: API / Pagination

**Descripcion**: Se usa `LIMIT = 10` con `offset = (page - 1) * LIMIT`. Se detecta el fin de datos cuando `data.length < LIMIT`.

**Evidencia**:
- `src/pages/Publications.jsx`
- `src/pages/Users.jsx`

**Ejemplo**:
```jsx
const LIMIT = 10
const [page, setPage] = useState(1)
const [noMore, setNoMore] = useState(false)

const fetchData = async (p) => {
  const offset = (p - 1) * LIMIT
  const res = await client.get('/api/publication', { params: { limit: LIMIT, offset } })
  setData(res.data)
  setNoMore(res.data.length < LIMIT)
}

// En el renderizado:
<Pagination page={page} onChange={setPage} disabled={noMore} />
```

**Cuando usar**: En cualquier listado paginado con API REST.

---

## Patron 5: Optimistic Update para Toggle de Follow

**Categoria**: State Management / UX

**Descripcion**: Al seguir/dejar de seguir un educador, el estado local se actualiza inmediatamente sin esperar confirmacion del servidor. El campo `followed_by_me` se invierte en el array local.

**Evidencia**:
- `src/pages/Users.jsx` (~linea 70-85)

**Ejemplo**:
```jsx
const handleToggleFollow = async (educatorId, currentlyFollowing) => {
  setFollowLoadingId(educatorId)
  try {
    if (currentlyFollowing) {
      await client.post(`/api/subscription/unfollow/${educatorId}`)
    } else {
      await client.post(`/api/subscription/follow/${educatorId}`)
    }
    // Optimistic: actualiza estado local sin re-fetch
    setUsers(prev =>
      prev.map(u => u.id === educatorId ? { ...u, followed_by_me: !currentlyFollowing } : u)
    )
  } finally {
    setFollowLoadingId(null)
  }
}
```

**Cuando usar**: Para acciones de toggle binario (like, follow, etc.) donde la latencia afectaria la percepcion de velocidad.

---

## Patron 6: Flujo de Upload con Publication ID Previo

**Categoria**: API / File Upload

**Descripcion**: Para subir imagenes dentro de una publicacion, primero se debe tener un `publication_id`. El flujo es: crear publicacion con contenido temporal → subir imagenes ligadas al ID → actualizar publicacion con contenido final.

**Evidencia**:
- `src/pages/CreatePublication.jsx` (flujo completo)
- `src/pages/EditPublication.jsx` (mismo flujo en edicion)

**Ejemplo**:
```jsx
// 1. Crear con placeholder
const { data: created } = await client.post('/api/publication/me/create', {
  title,
  publication_type: 'ARTICLE',
  content: 'temporal'
})
const pubId = created.id

// 2. Subir imagenes
const pendingImages = editorRef.current.getPendingImages()
for (const [index, block] of pendingImages.entries()) {
  const fd = new FormData()
  fd.append('publication_id', pubId)
  fd.append('file', block.file)
  const { data: uploaded } = await client.post('/api/upload/', fd)
  editorRef.current.setImageUrl(index, uploaded.url)
}

// 3. Actualizar con contenido final
const html = editorRef.current.getBlocks() // serializado
await client.put(`/api/publication/me/update/${pubId}`, {
  title, content: html, type: 'ARTICLE'
})
```

**Cuando usar**: Siempre que se requiera subir archivos asociados a una entidad que debe existir previamente en el backend.

---

## Patron 7: Context de Autenticacion con Refresh Automatico

**Categoria**: Auth / Security

**Descripcion**: El cliente HTTP tiene un interceptor que detecta 401s y renueva el token automaticamente. Las peticiones concurrentes durante el refresh se encolan y se reinvocan al completar.

**Evidencia**:
- `src/api/client.js` (interceptores completos)
- `src/context/AuthContext.jsx` (estado y metodos de auth)

**Ejemplo**:
```javascript
let isRefreshing = false
let pendingRequests = []

client.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.status === 401 && !err.config.url.startsWith('/api/auth')) {
      if (!isRefreshing) {
        isRefreshing = true
        try {
          const { data } = await axios.post('/api/auth/refresh', { refresh_token: getRefreshToken() })
          setAccessToken(data.new_access_token)
          pendingRequests.forEach(cb => cb(data.new_access_token))
          pendingRequests = []
        } catch {
          clearCookies()
        } finally {
          isRefreshing = false
        }
      }
      return new Promise(resolve => {
        pendingRequests.push(token => {
          err.config.headers.Authorization = `Bearer ${token}`
          resolve(client(err.config))
        })
      })
    }
    return Promise.reject(err)
  }
)
```

**Cuando usar**: En cualquier cliente HTTP de SPA con JWT + refresh tokens.

---

## Patron 8: Editor de Bloques con Ref API

**Categoria**: Component Design / Editor

**Descripcion**: El `HtmlEditor` usa `forwardRef` + `useImperativeHandle` para exponer una API imperativa que permite al padre (paginas de create/edit) controlar el estado del editor (obtener bloques, subir imagenes, serializar).

**Evidencia**:
- `src/components/HtmlEditor.jsx`
- `src/pages/CreatePublication.jsx` (uso de `editorRef`)
- `src/pages/EditPublication.jsx` (uso de `editorRef`)

**Ejemplo**:
```jsx
// En el editor (HtmlEditor.jsx):
useImperativeHandle(ref, () => ({
  getBlocks: () => blocks,
  getPendingImages: () => blocks
    .map((b, i) => ({ ...b, index: i }))
    .filter(b => b.type === 'image' && b.file),
  setImageUrl: (index, url) => {
    setBlocks(prev => prev.map((b, i) =>
      i === index ? { ...b, url, file: null } : b
    ))
  },
  forceSerialize: () => setBlocks(prev => [...prev])
}))

// En la pagina padre:
const editorRef = useRef()
// ...
const blocks = editorRef.current.getBlocks()
const pending = editorRef.current.getPendingImages()
```

**Cuando usar**: Cuando un componente padre necesita controlar imperativamente un componente hijo complejo (editores, canvas, reproductores multimedia).
