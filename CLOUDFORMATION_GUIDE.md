# 🚀 Guía de Despliegue Automático con CloudFormation

Esta guía te ayuda a desplegar **AWS Amplify** completamente automatizado usando **CloudFormation**, incluyendo todas las variables de entorno y configuraciones necesarias para solucionar el problema de Mixed Content.

---

## 📋 ¿Qué Automatiza Esta Solución?

✅ **Creación de la aplicación Amplify**  
✅ **Configuración del repositorio GitHub**  
✅ **Todas las variables de entorno** (URLs de microservicios, tokens)  
✅ **Custom headers** para solucionar Mixed Content  
✅ **Build settings** optimizados  
✅ **IAM roles** necesarios  
✅ **Auto-deploy** en cada push a main  

---

## 🛠️ Prerequisitos

Antes de empezar, necesitas:

### 1. AWS CLI Instalado y Configurado

```powershell
# Verificar si está instalado
aws --version

# Si no está instalado, descárgalo de:
# https://aws.amazon.com/cli/

# Configurar credenciales
aws configure
```

Te pedirá:
- **AWS Access Key ID**: Tu access key de AWS
- **AWS Secret Access Key**: Tu secret key
- **Default region**: `us-east-1` (recomendado)
- **Default output format**: `json`

### 2. GitHub Personal Access Token

Necesitas un token de GitHub con permisos:
- ✅ `repo` (acceso completo a repositorios)
- ✅ `admin:repo_hook` (webhooks y servicios)

**Cómo obtenerlo:**
1. Ve a GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. Click en **Generate new token (classic)**
3. Selecciona los scopes: `repo` y `admin:repo_hook`
4. Copia el token (guárdalo, no lo verás de nuevo)

### 3. Token de Apify (si lo usas)

Ya tienes tu token de Apify configurado en tu `.env` local

---

## 🚀 Opción 1: Despliegue Rápido con PowerShell (RECOMENDADO)

### Paso 1: Ejecutar el Script

```powershell
# Navega al directorio
cd c:\Users\pomaj\Downloads\UTEC_2025_2\Cloud_Computing\proyecto\parte1\cloud-front

# Ejecuta el script
.\deploy-cloudformation.ps1 `
  -GitHubToken "tu_github_token_aqui" `
  -ApifyToken "tu_apify_token_aqui" `
  -StackName "scrapetok-amplify-stack" `
  -Region "us-east-1"
```

### Paso 2: Esperar (5-10 minutos)

El script hará todo automáticamente:
- ✅ Validar credenciales de AWS
- ✅ Crear el stack de CloudFormation
- ✅ Configurar Amplify con todas las variables
- ✅ Conectar con GitHub
- ✅ Iniciar el primer build

### Paso 3: ¡Listo!

Al finalizar verás:
```
✅ ¡Stack desplegado exitosamente!

📊 Información del Stack:
   App ID: d2my79sg8gizuz
   URL: https://main.d2my79sg8gizuz.amplifyapp.com/

🎛️  Consola de Amplify:
   https://console.aws.amazon.com/amplify/...
```

---

## 🛠️ Opción 2: Despliegue Manual con AWS CLI

Si prefieres más control:

### Paso 1: Editar el archivo de parámetros

Edita `cloudformation-parameters.json` y reemplaza:
- `TU_GITHUB_TOKEN_AQUI` con tu token real
- `TU_APIFY_TOKEN_AQUI` con tu token de Apify

### Paso 2: Validar la plantilla

```powershell
aws cloudformation validate-template `
  --template-body file://cloudformation-amplify.yml
```

### Paso 3: Crear el stack

```powershell
aws cloudformation create-stack `
  --stack-name scrapetok-amplify-stack `
  --template-body file://cloudformation-amplify.yml `
  --parameters file://cloudformation-parameters.json `
  --capabilities CAPABILITY_NAMED_IAM `
  --region us-east-1
```

### Paso 4: Monitorear el progreso

```powershell
# Ver el status del stack
aws cloudformation describe-stacks `
  --stack-name scrapetok-amplify-stack

# Ver eventos en tiempo real
aws cloudformation describe-stack-events `
  --stack-name scrapetok-amplify-stack
```

---

## 🎯 Opción 3: Despliegue desde AWS Console

Si prefieres la interfaz gráfica:

### Paso 1: Subir la plantilla

1. Ve a [AWS CloudFormation Console](https://console.aws.amazon.com/cloudformation)
2. Click en **Create stack** → **With new resources**
3. **Upload a template file** → Selecciona `cloudformation-amplify.yml`
4. Click **Next**

### Paso 2: Configurar parámetros

Llena los parámetros:
- **Stack name**: `scrapetok-amplify-stack`
- **GitHubRepository**: `https://github.com/Anyeli1204/cloud-front`
- **GitHubBranch**: `main`
- **GitHubToken**: Tu token de GitHub
- **AccountsServiceURL**: `http://54.162.117.139:8084/api/v1`
- **ContentServiceURL**: `http://54.162.117.139:8083`
- **DashboardServiceURL**: `http://54.162.117.139:8081`
- **OrchestratorServiceURL**: `http://35.175.5.172:8085`
- **AnalyticsServiceURL**: `http://35.175.5.172:8086`
- **MS3ServiceURL**: `http://54.162.117.139:8082`
- **ApifyToken**: Tu token de Apify

### Paso 3: Configurar opciones del stack

- **Tags** (opcional): Agrega tags si quieres
- **Permissions**: Deja por defecto o selecciona un IAM role
- **Stack failure options**: Selecciona "Roll back all stack resources"

### Paso 4: Review y crear

- Revisa toda la configuración
- ✅ Check "I acknowledge that AWS CloudFormation might create IAM resources"
- Click **Submit**

---

## 📊 Verificar el Despliegue

### 1. Verificar en CloudFormation

```powershell
# Ver outputs del stack
aws cloudformation describe-stacks `
  --stack-name scrapetok-amplify-stack `
  --query 'Stacks[0].Outputs'
```

### 2. Verificar en Amplify Console

1. Ve a [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Busca tu app: `cloud-front-app`
3. Ve a **App settings** → **Environment variables**
4. ✅ Verifica que todas las variables estén configuradas

### 3. Probar la aplicación

1. Copia la URL de los outputs (ejemplo: `https://main.d2my79sg8gizuz.amplifyapp.com/`)
2. Abre en tu navegador
3. Abre DevTools (F12) → Console
4. Intenta hacer login
5. ✅ **No debería haber errores de Mixed Content**

---

## 🔄 Actualizar la Configuración

Si necesitas cambiar las URLs de los microservicios:

### Opción A: Actualizar con el script

```powershell
.\deploy-cloudformation.ps1 `
  -GitHubToken "tu_token" `
  -ApifyToken "tu_apify_token" `
  -StackName "scrapetok-amplify-stack"
```

El script detectará el stack existente y lo actualizará.

### Opción B: Actualizar manualmente

```powershell
# Edita cloudformation-parameters.json con las nuevas URLs

# Actualiza el stack
aws cloudformation update-stack `
  --stack-name scrapetok-amplify-stack `
  --template-body file://cloudformation-amplify.yml `
  --parameters file://cloudformation-parameters.json `
  --capabilities CAPABILITY_NAMED_IAM
```

---

## 🗑️ Eliminar Todo (Rollback)

Si quieres eliminar todo lo creado:

```powershell
# Eliminar el stack (esto elimina Amplify y todos los recursos)
aws cloudformation delete-stack `
  --stack-name scrapetok-amplify-stack

# Verificar que se eliminó
aws cloudformation describe-stacks `
  --stack-name scrapetok-amplify-stack
```

⚠️ **ADVERTENCIA**: Esto eliminará:
- La aplicación Amplify
- Todas las configuraciones
- El historial de builds
- (NO elimina tu repositorio de GitHub)

---

## 🐛 Troubleshooting

### Error: "No credentials found"

**Solución:**
```powershell
aws configure
```

### Error: "User is not authorized to perform: amplify:CreateApp"

**Solución:** Tu usuario de AWS no tiene permisos. Necesitas:
- `AdministratorAccess-Amplify` (mínimo)
- O permisos completos de CloudFormation e IAM

### Error: "Template validation error"

**Solución:**
```powershell
# Validar la plantilla
aws cloudformation validate-template `
  --template-body file://cloudformation-amplify.yml
```

### Error: "Stack already exists"

**Solución:** Usa `update-stack` en lugar de `create-stack`, o usa el script de PowerShell que lo hace automáticamente.

### El build falla en Amplify

**Causas comunes:**
1. **Variables de entorno mal configuradas**: Verifica en Amplify Console
2. **npm install falla**: Revisa `package.json` y `package-lock.json`
3. **Build timeout**: Aumenta el timeout en la configuración de Amplify

**Ver logs:**
```powershell
# En la consola de Amplify → Build history → Click en el build → Ver logs
```

---

## 🎁 Ventajas de Esta Solución

✅ **Infraestructura como Código**: Todo versionado en Git  
✅ **Reproducible**: Puedes recrear el entorno en segundos  
✅ **Automatizado**: Un comando y todo se configura  
✅ **Sin errores manuales**: No hay que copiar/pegar en la consola  
✅ **Fácil de actualizar**: Cambias la plantilla y actualizas el stack  
✅ **Rollback automático**: Si algo falla, CloudFormation revierte  

---

## 📝 Próximos Pasos

Después de desplegar con CloudFormation, considera:

### 1. Configurar un Dominio Personalizado

Descomenta la sección `AmplifyDomain` en `cloudformation-amplify.yml` y agrega tu dominio.

### 2. Configurar HTTPS en los Backends

Esta solución con Mixed Content es **temporal**. Para producción:
- ✅ Configura un **Application Load Balancer** con SSL
- ✅ O usa **API Gateway** con certificado
- ✅ Actualiza las URLs en los parámetros de CloudFormation a HTTPS

### 3. Configurar CI/CD Avanzado

Puedes agregar:
- Tests automáticos antes del deploy
- Notificaciones en Slack/Discord
- Ambientes de staging/producción

---

## 🆘 ¿Necesitas Ayuda?

Si tienes problemas:
1. Revisa los logs en CloudFormation Console
2. Revisa los logs en Amplify Console
3. Ejecuta el script con `-Verbose` para más detalles
4. Consulta la [documentación de AWS Amplify](https://docs.aws.amazon.com/amplify/)

---

**Creado:** $(Get-Date -Format "yyyy-MM-dd")  
**Autor:** GitHub Copilot  
**Versión:** 1.0  
