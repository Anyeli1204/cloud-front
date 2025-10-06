# 🚀 Quick Start - Analytics Frontend

## Inicio Rápido en 3 Pasos

### 1️⃣ Verificar que el Microservicio 6 esté corriendo

```powershell
# Verificar el contenedor
docker ps | Select-String "microservicio6"

# Si no está corriendo, iniciarlo
cd microservicio6
docker-compose up -d
```

**Debe mostrar:**
```
microservicio6-container   Up   0.0.0.0:8006->8000/tcp
```

### 2️⃣ Configurar variable de entorno del frontend

```bash
# En cloud-front/.env (crear si no existe)
VITE_ANALYTICS_SERVICE_URL=http://localhost:8006
```

O copiar del ejemplo:
```powershell
cd cloud-front
cp .env.example .env
# Editar .env y agregar la línea de arriba si no está
```

### 3️⃣ Iniciar el frontend

```powershell
cd cloud-front
npm install  # Solo la primera vez
npm run dev
```

## ✅ Probar la Página

1. Abrir navegador en http://localhost:5173 (o el puerto que indique)
2. Hacer login con tus credenciales
3. Click en "**Analytics**" en el navbar (icono 📊)
4. Deberías ver:
   - Tab "Users" con 3 usuarios
   - Tab "Admin Metrics" con métricas de TikTok

## 🎯 Endpoints Disponibles

La página consume estos endpoints automáticamente:

- `GET /users/list` - Lista de usuarios
- `GET /admins/questions_and_views` - Métricas de admins

## 🐛 Troubleshooting Rápido

### Error: "No se carga la página de Analytics"

**Verificar microservicio:**
```powershell
curl http://localhost:8006/docs
# Debe abrir Swagger UI
```

**Verificar logs:**
```powershell
docker logs microservicio6-container
```

### Error: "Network Error" o "Failed to fetch"

**Problema:** La variable de entorno no está configurada

**Solución:**
```powershell
# En cloud-front/.env
VITE_ANALYTICS_SERVICE_URL=http://localhost:8006
```

Luego reiniciar el servidor de desarrollo (Ctrl+C y `npm run dev`)

### Error: "TABLE_NOT_FOUND"

**Problema:** Credenciales AWS incorrectas en el microservicio

**Solución:**
```powershell
# En microservicio6/.env
AWS_ACCESS_KEY_ID=tu_access_key
AWS_SECRET_ACCESS_KEY=tu_secret_key
AWS_SESSION_TOKEN=tu_session_token  # Si usas credenciales temporales
DATABASE=scrapetok
```

## 📊 Vista de la Página

```
╔════════════════════════════════════════════════════════╗
║  📊 ScrapeTok Analytics                                ║
║  Insights powered by AWS Athena - Microservice 6       ║
╠════════════════════════════════════════════════════════╣
║  [👥 Users (3)]  [🎯 Admin Metrics (1)]               ║
╠════════════════════════════════════════════════════════╣
║  [🔄 Refresh Data]                                     ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ ║
║  │ 👤 user1     │  │ 👤 user2     │  │ 👤 user3     │ ║
║  │ ID: 1        │  │ ID: 2        │  │ ID: 3        │ ║
║  │ Name: Test   │  │ Name: Admin  │  │ Name: Demo   │ ║
║  └──────────────┘  └──────────────┘  └──────────────┘ ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
```

## 🎨 Características

- ✅ 2 tabs: Users y Admin Metrics
- ✅ Refresh automático de datos
- ✅ Diseño responsivo
- ✅ Manejo de errores con alertas
- ✅ Animaciones de carga
- ✅ Formateo de números (68.5M views, etc.)
- ✅ Formateo de fechas

## 📖 Documentación Completa

Para más detalles, ver:
- `ANALYTICS_FRONTEND_IMPLEMENTATION.md` - Documentación técnica completa
- `RESUMEN_FINAL_MS6_FRONTEND.md` - Resumen ejecutivo
- `microservicio6/ESTADO_FINAL_FUNCIONANDO.md` - Estado del backend

## 🎉 ¡Listo!

Tu página de Analytics está funcionando. Ahora puedes:

1. Ver usuarios registrados
2. Ver métricas de administradores en TikTok
3. Analizar vistas, likes, comentarios, etc.
4. Refrescar datos en tiempo real

**¡Disfruta de tu nueva página de Analytics!** 🚀📊
