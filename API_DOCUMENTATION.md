# 📡 Endpoints de API - Sistema de Autenticación

## Base URL
```
http://localhost:4000/api
```

---

## 🔓 Endpoints públicos (sin autenticación)

### 1. Login
**Endpoint:** `POST /auth/login`

**Descripción:** Inicia sesión con email y contraseña

**Body:**
```json
{
  "email": "admin@example.com",
  "password": "Admin123"
}
```

**Respuesta exitosa (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "nombre": "Administrador",
    "email": "admin@example.com",
    "rol": "admin",
    "estado": true,
    "createdAt": "2025-12-23T10:30:00.000Z",
    "updatedAt": "2025-12-23T10:30:00.000Z"
  }
}
```

**Errores posibles:**
```json
// 404 - Usuario no encontrado
{ "message": "Usuario no encontrado" }

// 401 - Contraseña incorrecta
{ "message": "Credenciales incorrectas" }

// 403 - Cuenta bloqueada
{ "message": "La cuenta está bloqueada" }

// 400 - Validación fallida
{ "errors": [{ "field": "email", "msg": "Debe ser un correo válido" }] }
```

---

### 2. Registro
**Endpoint:** `POST /auth/register`

**Descripción:** Registra un nuevo usuario en el sistema

**Body:**
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "password": "Segura123",
  "rol": "cajero"
}
```

**Parámetros opcionales:**
```json
{
  "apellido": "Pérez",
  "caja": "Caja 1",
  "turno": "mañana"
}
```

**Respuesta exitosa (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439012",
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "rol": "cajero",
    "caja": "Caja 1",
    "turno": "mañana",
    "estado": true,
    "createdAt": "2025-12-23T10:35:00.000Z",
    "updatedAt": "2025-12-23T10:35:00.000Z"
  }
}
```

**Errores posibles:**
```json
// 400 - Email ya registrado
{ "message": "El correo electrónico ya está en uso" }

// 400 - Validación fallida
{ "errors": [{ "field": "password", "msg": "Mínimo 6 caracteres" }] }

// 500 - Error en servidor
{ "message": "Error al registrar el usuario" }
```

---

## 🔒 Endpoints protegidos (requieren autenticación)

**Header requerido:**
```
Authorization: Bearer <token>
```

### 3. Obtener perfil
**Endpoint:** `GET /auth/profile`

**Descripción:** Obtiene los datos del usuario autenticado

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuesta exitosa (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "nombre": "Administrador",
  "email": "admin@example.com",
  "rol": "admin",
  "estado": true,
  "ultimoAcceso": "2025-12-23T14:20:30.000Z",
  "createdAt": "2025-12-23T10:30:00.000Z",
  "updatedAt": "2025-12-23T10:30:00.000Z"
}
```

**Errores posibles:**
```json
// 401 - Sin token o token inválido
{ "message": "No hay token, autorización denegada" }

// 401 - Token expirado
{ "message": "Token no es válido" }

// 404 - Usuario no encontrado
{ "message": "Usuario no encontrado" }
```

---

## 🛡️ Códigos de estado HTTP

| Código | Significado | Descripción |
|--------|-------------|-------------|
| 200 | OK | Solicitud exitosa |
| 201 | Created | Recurso creado exitosamente |
| 400 | Bad Request | Validación fallida |
| 401 | Unauthorized | Sin autenticación o token inválido |
| 403 | Forbidden | Autenticado pero sin permisos |
| 404 | Not Found | Recurso no encontrado |
| 500 | Server Error | Error en el servidor |

---

## 🔑 Estructura del JWT Token

El token contiene:
```json
{
  "id": "507f1f77bcf86cd799439011",
  "rol": "admin",
  "iat": 1703341800,
  "exp": 1703373400
}
```

**Propiedades:**
- `id`: ID del usuario (MongoDB ObjectId)
- `rol`: Rol del usuario (admin, cajero, reportes)
- `iat`: Tiempo de emisión (Unix timestamp)
- `exp`: Tiempo de expiración (Unix timestamp = 8 horas después)

**Decodificar token:**
Puedes usar https://jwt.io para decodificar y verificar tokens

---

## 📝 Ejemplos con cURL

### Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123"
  }'
```

### Registro
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Nuevo Usuario",
    "email": "nuevo@example.com",
    "password": "Segura123",
    "rol": "cajero"
  }'
```

### Obtener perfil
```bash
curl -X GET http://localhost:4000/api/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 📝 Validaciones de entrada

### Email
- Debe ser formato válido: `usuario@dominio.com`
- Único en la base de datos
- Requerido

### Contraseña
- Mínimo 6 caracteres
- Requerida
- Se hashea automáticamente

### Nombre
- Requerido para registro
- Mínimo 2 caracteres

### Rol
- Valores válidos: `admin`, `cajero`, `reportes`
- Por defecto: `cajero` si no se especifica
- Solo `admin` puede crear otros `admin`

### Caja
- Opcional
- String libre

### Turno
- Valores válidos: `mañana`, `tarde`, `noche`
- Opcional

---

## 🔐 Permisos por rol

### Admin
```
crear_usuario, editar_usuario, eliminar_usuario, bloquear_usuario,
crear_producto, editar_producto, eliminar_producto, ver_stock,
crear_venta, cancelar_venta, anular_venta,
ver_reportes_completos, ver_historial_ventas, ver_usuarios,
configurar_negocio, respaldar_datos
```

### Cajero
```
crear_venta, ver_carrito, procesar_pago,
ver_productos, ver_stock_productos,
ver_reportes_dia, ver_mis_ventas
```

### Reportes
```
ver_reportes_completos, ver_historial_ventas, descargar_reportes
```

---

## ⚠️ Notas importantes

1. **Token vence en 8 horas** - Después debe volver a iniciar sesión
2. **Contraseña bloqueada tras 5 intentos fallidos** - Cuenta se bloquea automáticamente
3. **No se retorna la contraseña nunca** - Por seguridad
4. **Token debe ir en header Authorization** - Formato: `Bearer <token>`
5. **Validación en backend es obligatoria** - No confíes solo en frontend

---

## 🚀 Próximas mejoras (roadmap)

- [ ] Endpoint para cambiar contraseña
- [ ] Endpoint para recuperación de contraseña
- [ ] Logout en backend (invalidar token)
- [ ] Refresh tokens
- [ ] Listar usuarios (solo admin)
- [ ] Editar usuario (solo admin)
- [ ] Eliminar usuario (solo admin)
- [ ] 2FA (factor doble de autenticación)

---

## 📞 Soporte

Para más información:
- Ver `LOGIN_GUIDE.md`
- Ver `AUTH_SYSTEM.md`
- Revisar código en `backend/src/controllers/auth.controller.js`
