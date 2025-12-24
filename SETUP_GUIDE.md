# 🚀 Guía de instalación y ejecución

## Requisitos previos

- Node.js 14+ instalado
- MongoDB ejecutándose (local o en la nube)
- npm o yarn

## 1️⃣ Configurar backend

```bash
cd pos/backend

# Instalar dependencias
npm install

# Crear archivo .env
cp .env.example .env

# Editar .env con tus variables
nano .env
```

**Variables importantes en .env:**
```
PORT=4000
MONGODB_URI=mongodb://localhost:27017/pos_db
JWT_SECRET=tu_secreto_muy_seguro_aqui
CORS_ORIGIN=http://localhost:5173
```

**Iniciar backend:**
```bash
npm run dev
```

Backend debe estar ejecutándose en `http://localhost:4000`

---

## 2️⃣ Configurar frontend

```bash
cd pos/frontend

# Instalar dependencias
npm install

# Crear archivo .env
cp .env.example .env

# Editar .env si es necesario
nano .env
```

**Variables en .env:**
```
VITE_API_URL=http://localhost:4000/api
```

**Iniciar frontend:**
```bash
npm run dev
```

Frontend estará disponible en `http://localhost:5173`

---

## 3️⃣ Crear usuario administrador (primera vez)

### Opción A: Usar el formulario de registro

1. Abre http://localhost:5173/login
2. Haz clic en "Registrarse"
3. Rellena:
   - Nombre: Administrador
   - Rol: Administrador
   - Email: admin@example.com
   - Contraseña: Admin123
4. Haz clic en "Registrarse"
5. Automáticamente iniciarás sesión

### Opción B: Usar cURL o Postman

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

---

## 4️⃣ Iniciar sesión

1. Ve a http://localhost:5173/login
2. Ingresa:
   - Email: `admin@example.com`
   - Contraseña: `Admin123`
3. Haz clic en "Ingresar"
4. Deberías ver el dashboard

---

## ✅ Verificar que todo funciona

- [ ] Backend ejecutándose sin errores
- [ ] Frontend conectado a http://localhost:5173
- [ ] Puedes registrar un usuario
- [ ] Puedes iniciar sesión
- [ ] Ves tu nombre en la esquina superior derecha
- [ ] Puedes navegar por el menú
- [ ] La opción "Cerrar sesión" funciona

---

## 🔧 Comandos útiles

### Backend
```bash
cd pos/backend

# Desarrollo (con hot reload)
npm run dev

# Producción
npm start

# Ver logs
npm run logs
```

### Frontend
```bash
cd pos/frontend

# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview de build
npm run preview

# Linting
npm run lint
```

---

## 🐛 Solución de problemas

### "Cannot GET /api/auth/login"
→ Backend no está ejecutándose. Ejecuta `npm run dev` en carpeta `backend`

### "Failed to fetch"
→ Verifica que `VITE_API_URL` en frontend sea correcto

### "MongoDB connection error"
→ Asegúrate que MongoDB está ejecutándose
→ Verifica `MONGODB_URI` en .env

### "Token not valid"
→ Borra localStorage: `localStorage.clear()`
→ Intenta login nuevamente

### Puerto 4000 o 5173 ocupado
→ Cambia el puerto en el comando: `npm run dev -- --port 3001`

---

## 📊 Estructura de carpetas

```
pos/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── app.js
│   ├── .env (crear desde .env.example)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── features/
│   │   ├── hooks/
│   │   └── main.jsx
│   ├── .env (crear desde .env.example)
│   └── package.json
│
├── AUTH_SYSTEM.md
├── LOGIN_GUIDE.md
└── IMPLEMENTATION_SUMMARY.md
```

---

## 🔐 Notas de seguridad

1. **Nunca** subes `.env` a git
2. **Cambia** `JWT_SECRET` en producción
3. **Usa HTTPS** en producción
4. **Nunca** expongas credenciales en el código
5. **Valida** siempre en backend, no solo frontend

---

## 📝 Próximas mejoras (recomendadas)

- [ ] Implementar refresh tokens
- [ ] Usar cookies HttpOnly en lugar de localStorage
- [ ] Agregar rate limiting
- [ ] Implementar recuperación de contraseña
- [ ] Agregar 2FA
- [ ] Logs de auditoría
- [ ] Cambio de contraseña
- [ ] Perfil de usuario

---

## 💡 Notas finales

- El sistema está **100% funcional**
- Puedes empezar a usar inmediatamente
- La autenticación está **securizada**
- Los roles están implementados
- Documentación completa disponible

¡Estás listo para comenzar! 🎉
