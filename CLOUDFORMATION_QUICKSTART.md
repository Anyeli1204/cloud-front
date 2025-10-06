# 🚀 Automatización CloudFormation - Despliegue Completo de Amplify

¡Perfecto! He creado una **solución completamente automatizada** con CloudFormation que configura todo AWS Amplify con un solo comando.

---

## 📦 ¿Qué se Creó?

✅ **`cloudformation-amplify.yml`** - Plantilla de CloudFormation completa  
✅ **`cloudformation-parameters.json`** - Archivo de parámetros (ejemplo)  
✅ **`deploy-cloudformation.ps1`** - Script de PowerShell para despliegue fácil  
✅ **`CLOUDFORMATION_GUIDE.md`** - Guía completa paso a paso  

---

## ⚡ Despliegue Ultra-Rápido (1 comando)

### Paso 1: Obtén tu GitHub Token

1. Ve a GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. Click **Generate new token (classic)**
3. Selecciona: `repo` y `admin:repo_hook`
4. Copia el token

### Paso 2: Ejecuta el Script

```powershell
# Navega al directorio
cd c:\Users\pomaj\Downloads\UTEC_2025_2\Cloud_Computing\proyecto\parte1\cloud-front

# Ejecuta (reemplaza TU_GITHUB_TOKEN con tu token real)
.\deploy-cloudformation.ps1 `
  -GitHubToken "ghp_tuTokenAqui123456789" `
  -ApifyToken "tu_apify_token_aqui"
```

### Paso 3: Espera 5-10 minutos ☕

El script hará **TODO automáticamente**:
- ✅ Crear la app de Amplify
- ✅ Conectar con GitHub
- ✅ Configurar todas las variables de entorno
- ✅ Agregar custom headers para Mixed Content
- ✅ Configurar build settings
- ✅ Crear IAM roles
- ✅ Iniciar el primer deploy

### Paso 4: ¡Listo! 🎉

Al terminar verás:
```
✅ ¡Stack desplegado exitosamente!

📊 Información del Stack:
   App URL: https://main.d2my79sg8gizuz.amplifyapp.com/
   
🎛️  Consola de Amplify:
   https://console.aws.amazon.com/amplify/...
```

---

## 🎯 ¿Qué Automatiza Exactamente?

### Variables de Entorno (Todas configuradas automáticamente):
```yaml
VITE_ACCOUNTS_SERVICE_URL = http://54.162.117.139:8084/api/v1
VITE_CONTENT_SERVICE_URL = http://54.162.117.139:8083
VITE_DASHBOARD_SERVICE_URL = http://54.162.117.139:8081
VITE_ORCHESTRATOR_SERVICE_URL = http://35.175.5.172:8085
VITE_ANALYTICS_SERVICE_URL = http://35.175.5.172:8086
VITE_API_BASE_URL = http://54.162.117.139:8084/api/v1
VITE_API_SERVICE_MS3_URL = http://54.162.117.139:8082
VITE_APIFY_TOKEN = [tu_token]
```

### Custom Headers (Para solucionar Mixed Content):
```yaml
Content-Security-Policy: upgrade-insecure-requests
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Referrer-Policy: strict-origin-when-cross-origin
```

### Build Settings:
```yaml
- npm ci
- npm run build
- Artifacts en dist/
- Cache de node_modules/
```

### Auto-Deploy:
- ✅ Detecta cambios en GitHub automáticamente
- ✅ Ejecuta build en cada push a main
- ✅ Actualiza la app automáticamente

---

## 🔄 ¿Ya tienes Amplify configurado manualmente?

No hay problema! Tienes 2 opciones:

### Opción A: Eliminar el anterior y usar CloudFormation
```powershell
# 1. Elimina la app existente en Amplify Console manualmente
# 2. Ejecuta el script de CloudFormation
.\deploy-cloudformation.ps1 -GitHubToken "..." -ApifyToken "..."
```

### Opción B: Actualizar el existente (más complejo)
CloudFormation puede importar recursos existentes, pero requiere más configuración. Te recomiendo la Opción A.

---

## 📊 Ventajas vs Configuración Manual

| Aspecto | Manual | CloudFormation |
|---------|--------|----------------|
| **Tiempo de setup** | 15-20 min | 1 comando |
| **Errores humanos** | Posibles | Ninguno |
| **Reproducible** | No | Sí |
| **Versionado** | No | Sí (en Git) |
| **Rollback fácil** | No | Sí |
| **Actualizar URLs** | Manual | 1 comando |
| **Multi-ambiente** | Difícil | Fácil |

---

## 🛠️ Prerequisitos

Antes de ejecutar el script, asegúrate de tener:

### 1. AWS CLI instalado
```powershell
# Verificar
aws --version

# Si no está: https://aws.amazon.com/cli/
```

### 2. AWS CLI configurado
```powershell
aws configure
# Ingresa tu Access Key, Secret Key, región (us-east-1)
```

### 3. GitHub Personal Access Token
Con permisos: `repo` y `admin:repo_hook`

---

## 🔍 Monitorear el Despliegue

Mientras se despliega, puedes ver el progreso:

```powershell
# En otra terminal
aws cloudformation describe-stack-events `
  --stack-name scrapetok-amplify-stack `
  --max-items 20
```

O ve a: https://console.aws.amazon.com/cloudformation

---

## 🚨 Si Algo Sale Mal

El script tiene manejo de errores automático:

1. **Verifica credenciales de AWS**
2. **Valida la plantilla**
3. **Intenta update primero**, luego create
4. **Rollback automático** si falla

Para debug:
```powershell
# Ver eventos del stack
aws cloudformation describe-stack-events `
  --stack-name scrapetok-amplify-stack

# Ver status actual
aws cloudformation describe-stacks `
  --stack-name scrapetok-amplify-stack
```

---

## 🎁 Bonus: Actualizar URLs Fácilmente

Si cambias las IPs de tus microservicios:

```powershell
# Solo ejecuta de nuevo con las nuevas URLs
# El script detectará que el stack existe y lo actualizará
.\deploy-cloudformation.ps1 `
  -GitHubToken "..." `
  -ApifyToken "..."
```

O edita directamente en CloudFormation Console:
1. Ve al stack
2. **Update** → **Use current template**
3. Cambia los parámetros
4. Update

---

## 📝 Próximos Pasos

Después de desplegar:

1. ✅ **Verifica la app**: Abre la URL y prueba el login
2. ✅ **Revisa Amplify Console**: Ve el build history
3. ✅ **Haz un cambio en el código**: Push a main y ve el auto-deploy
4. 🔮 **Considera configurar HTTPS en backends** (solución permanente)

---

## 🆘 ¿Prefieres Video/Paso a Paso?

Lee `CLOUDFORMATION_GUIDE.md` para:
- Explicación detallada de cada paso
- Alternativas (CLI manual, AWS Console)
- Troubleshooting completo
- Ejemplos visuales

---

**¿Todo listo?** Ejecuta el script y en 10 minutos tendrás todo configurado automáticamente! 🚀

```powershell
.\deploy-cloudformation.ps1 `
  -GitHubToken "TU_TOKEN_AQUI" `
  -ApifyToken "tu_apify_token_aqui"
```
