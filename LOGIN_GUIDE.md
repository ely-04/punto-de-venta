# 🔐 Guía de Login - Sistema POS

## Resumen de cambios implementados

### ✅ Frontend (React/Vite)
1. **Protección de rutas mejorada** - Las rutas ahora requieren autenticación
2. **Componente Login profesional** - Con validaciones y mejor UX
3. **Hook useAuth** - Para acceder a datos del usuario en cualquier componente
4. **ProtectedRoute components** - Para proteger rutas por rol
5. **CSS mejorado** - Interfaz más moderna y responsiva

### ✅ Backend (Node/Express)
1. **Autenticación con JWT** - Tokens con validez de 8 horas
2. **Control de acceso por roles** - admin, cajero, reportes
3. **Middleware de permisos** - Validación de roles y permisos específicos
4. **Seguridad de contraseñas** - Hasheado con bcryptjs
5. **Bloqueo de cuenta** - Después de 5 intentos fallidos

---

## 🚀 Pasos para probar el login

### 1. Crear un usuario administrador

**Opción A: Usando Postman/cURL**
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Administrador",
    "email": "admin@example.com",
    "password": "Admin123",
    "rol": "admin"
  }'
```

**Opción B: Usando el formulario de registro**
1. Ve a http://localhost:5173/login
2. Haz clic en "Registrarse"
3. Rellena los datos:
   - Nombre: "Administrador"
   - Rol: Selecciona "Administrador"
   - Email: "admin@example.com"
   - Contraseña: "Admin123"
4. Haz clic en "Registrarse"

### 2. Iniciar sesión

1. Accede a http://localhost:5173/login
2. Ingresa las credenciales:
   - Email: `admin@example.com`
   - Contraseña: `Admin123`
3. Haz clic en "Ingresar"
4. Deberías ser redirigido automáticamente a la página de inicio

### 3. Verificar que estás autenticado

- Verás tu nombre en la esquina superior derecha
- Puedes navegar por el menú
- Si intentas acceder directamente a `/login`, serás redirigido al home
- Si cierras sesión ("Cerrar sesión"), volverás a `/login`

---

## 🔒 Características de seguridad implementadas

### En el Frontend
- ✅ Las rutas protegidas redirigen al login si no hay sesión
- ✅ El token se almacena en localStorage (puede mejorar a cookies HttpOnly)
- ✅ Validación de formularios antes de enviar
- ✅ Mensajes de error claros

### En el Backend
- ✅ Contraseñas hasheadas con bcryptjs
- ✅ JWT para autenticación stateless
- ✅ Middleware de autenticación en todas las rutas protegidas
- ✅ Control de intentos fallidos (bloquea después de 5)
- ✅ Tokens con expiración de 8 horas
- ✅ Validación de permisos por rol

---

## 📋 Estructura de roles

### Admin
Acceso total al sistema
- Gestión de usuarios
- Gestión de productos
- Reportes completos
- Configuración

### Cajero
Operaciones de ventas
- Crear ventas
- Ver productos
- Ver reportes del día
- Procesar pagos

### Reportes
Solo lectura de reportes
- Ver reportes completos
- Descargar reportes
- Historial de ventas

---

## 🛠️ Archivos modificados/creados

### Frontend
- `src/app/routes.jsx` - Rutas protegidas
- `src/pages/Login/Login.jsx` - Componente de login mejorado
- `src/pages/Login/Login.css` - Estilos modernos
- `src/hooks/useAuth.js` - Hook personalizado
- `src/components/ProtectedRoute.jsx` - Protección de rutas por rol

### Backend
- `src/controllers/auth.controller.js` - Lógica de autenticación
- `src/middleware/auth.js` - Middleware JWT
- `src/middleware/permisos.js` - Sistema de permisos
- `src/models/User.js` - Modelo de usuario

---

## 🔄 Flujo de autenticación

```
1. Usuario ingresa credenciales
                ↓
2. Frontend valida formato
                ↓
3. POST /api/auth/login
                ↓
4. Backend valida y compara contraseña
                ↓
5. Backend genera JWT
                ↓
6. Frontend recibe {user, token}
                ↓
7. Redux almacena datos + localStorage almacena token
                ↓
8. Usuario autenticado, acceso a rutas protegidas
```

---

## ⚠️ Notas importantes

1. **Token en localStorage**: Por seguridad, considera usar cookies HttpOnly en producción
2. **HTTPS**: Usa HTTPS en producción para proteger los tokens en tránsito
3. **JWT_SECRET**: Asegúrate de tener una variable de entorno segura en el backend
4. **Renovación de token**: Actualmente los tokens duran 8 horas, considera implementar refresh tokens

---

## 🐛 Troubleshooting

### Error "Usuario no encontrado"
→ Verifica que el email sea correcto y que el usuario haya sido creado

### Error "Credenciales incorrectas"
→ Verifica la contraseña (sensible a mayúsculas/minúsculas)

### La sesión no persiste al recargar
→ Verifica que el token esté en localStorage en DevTools

### Redirigido a login sin motivo
→ Verifica que el token sea válido en `jwt.io`

---

## 📞 Soporte

Si tienes dudas sobre la implementación, revisa:
- `AUTH_SYSTEM.md` - Documentación detallada
- `src/features/auth/authSlice.js` - Estado de Redux
- `src/features/auth/services/authApi.js` - Configuración de API
