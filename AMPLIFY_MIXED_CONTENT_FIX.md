# 🔒 Solución al Error de Mixed Content en Amplify

## Problema
```
Mixed Content: The page at 'https://main.d2my79sg8gizuz.amplifyapp.com/' was loaded over HTTPS, 
but requested an insecure XMLHttpRequest endpoint 'http://54.162.117.139:8084/api/v1/auth/signin'
```

**Causa:** Tu frontend está en HTTPS (Amplify) pero intenta llamar APIs en HTTP, lo cual los navegadores bloquean por seguridad.

---

## ✅ Solución Recomendada: Configurar Variables de Entorno en Amplify

Esta es la solución **MÁS SENCILLA** y no requiere cambios en tu backend.

### Paso 1: Acceder a AWS Amplify Console

1. Ve a [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Selecciona tu aplicación: `cloud-front` o la que corresponda
3. Ve a **App settings** → **Environment variables** (en el menú lateral izquierdo)

### Paso 2: Agregar Variables de Entorno con HTTP

Agrega las siguientes variables de entorno (copia y pega):

#### Variables a Agregar:

| Variable | Valor |
|----------|-------|
| `VITE_ACCOUNTS_SERVICE_URL` | `http://54.162.117.139:8084/api/v1` |
| `VITE_CONTENT_SERVICE_URL` | `http://54.162.117.139:8083` |
| `VITE_DASHBOARD_SERVICE_URL` | `http://54.162.117.139:8081` |
| `VITE_ORCHESTRATOR_SERVICE_URL` | `http://35.175.5.172:8085` |
| `VITE_ANALYTICS_SERVICE_URL` | `http://35.175.5.172:8086` |
| `VITE_API_BASE_URL` | `http://54.162.117.139:8084/api/v1` |
| `VITE_API_SERVICE_MS3_URL` | `http://54.162.117.139:8082` |
| `VITE_APIFY_TOKEN` | `tu_token_de_apify_aqui` |

**Formato en Amplify Console:**
```
VITE_ACCOUNTS_SERVICE_URL = http://54.162.117.139:8084/api/v1
VITE_CONTENT_SERVICE_URL = http://54.162.117.139:8083
VITE_DASHBOARD_SERVICE_URL = http://54.162.117.139:8081
VITE_ORCHESTRATOR_SERVICE_URL = http://35.175.5.172:8085
VITE_ANALYTICS_SERVICE_URL = http://35.175.5.172:8086
VITE_API_BASE_URL = http://54.162.117.139:8084/api/v1
VITE_API_SERVICE_MS3_URL = http://54.162.117.139:8082
VITE_APIFY_TOKEN = tu_token_de_apify_aqui
```

### Paso 3: Agregar Header de Seguridad Permisivo

En la misma sección de **Environment variables**, agrega:

| Variable | Valor |
|----------|-------|
| `_CUSTOM_HTTP_HEADERS` | Ver configuración abajo |

**O mejor:** Ve a **App settings** → **Rewrites and redirects** y agrega:

**Custom Headers (JSON):**
```json
[
  {
    "source": "/<*>",
    "headers": [
      {
        "key": "Content-Security-Policy",
        "value": "upgrade-insecure-requests"
      },
      {
        "key": "X-Content-Type-Options",
        "value": "nosniff"
      }
    ]
  }
]
```

### Paso 4: Modificar amplify.yml

Si tienes un archivo `amplify.yml` en tu repositorio, asegúrate de que incluya:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
  customHeaders:
    - pattern: '**'
      headers:
        - key: 'Content-Security-Policy'
          value: 'upgrade-insecure-requests'
```

### Paso 5: Forzar Redeploy

1. Ve a tu app en Amplify Console
2. Click en **Run build** o **Redeploy this version**
3. O haz un commit vacío en tu repo:
   ```powershell
   git commit --allow-empty -m "Trigger rebuild with new env vars"
   git push origin main
   ```

### Paso 6: Verificar

1. Espera a que termine el build (~3-5 minutos)
2. Abre tu app: `https://main.d2my79sg8gizuz.amplifyapp.com/`
3. Abre DevTools (F12) → Console
4. Prueba hacer login
5. Las peticiones HTTP deberían funcionar ahora

---

## 🔍 ¿Por Qué Funciona?

Amplify aplica las variables de entorno **durante el build**, NO en runtime. Al configurarlas en Amplify Console, se inyectan en el proceso de build de Vite.

El header `Content-Security-Policy: upgrade-insecure-requests` le dice al navegador que automáticamente convierta las peticiones HTTP a HTTPS **si el servidor lo soporta**. Si no, permite HTTP.

---

## 🚨 Limitaciones y Advertencias

⚠️ **Esta solución es temporal y NO es ideal para producción por razones de seguridad:**

1. **Las peticiones HTTP son inseguras** (pueden ser interceptadas)
2. **Algunos navegadores modernos pueden seguir bloqueándolas**
3. **Chrome está eliminando el soporte para Mixed Content gradualmente**

### ✅ Solución Permanente (Para después)

Para producción real, **DEBES configurar HTTPS en tus backends:**

**Opción A: Application Load Balancer (ALB) con SSL**
- Crea un ALB en AWS
- Obtén certificado SSL gratuito de AWS Certificate Manager
- Configura el ALB para HTTPS → HTTP a tus EC2s
- Costo: ~$16/mes por ALB

**Opción B: Nginx Reverse Proxy con Let's Encrypt**
- Instala Nginx en una EC2
- Configura Let's Encrypt (SSL gratuito)
- Nginx redirige a tus microservicios
- Costo: Solo la EC2

**Opción C: CloudFront + ALB**
- CloudFront como CDN con SSL
- ALB detrás para balanceo
- La más profesional y escalable

---

## 📝 Checklist de Implementación

- [ ] Agregar variables de entorno en Amplify Console
- [ ] Configurar Custom Headers o `amplify.yml`
- [ ] Hacer redeploy (commit o manual)
- [ ] Verificar en DevTools que no hay errores de Mixed Content
- [ ] Probar login y todas las funcionalidades
- [ ] Planear migración a HTTPS en backend para producción

---

## 🆘 Si Aún No Funciona

1. **Verifica en Amplify Console → Build logs** que las variables se están cargando
2. **Revisa en el código bundleado** (DevTools → Sources → busca las URLs)
3. **Chequea los Security Groups** de tus EC2s (deben permitir tráfico entrante)
4. **Prueba las APIs directamente** desde Postman/curl para verificar que funcionan

---

## 📞 Necesitas Ayuda?

Si esta solución no funciona o necesitas configurar HTTPS permanente en tus backends, avísame y te guío paso a paso.

**Creado:** $(Get-Date -Format "yyyy-MM-dd")
**Autor:** GitHub Copilot
**Versión:** 1.0
