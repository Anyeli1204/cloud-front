# Script de PowerShell para desplegar la plantilla de CloudFormation
# Configura AWS Amplify con todas las variables de entorno y custom headers

param(
    [Parameter(Mandatory=$false)]
    [string]$StackName = "scrapetok-amplify-stack",
    
    [Parameter(Mandatory=$false)]
    [string]$Region = "us-east-1",
    
    [Parameter(Mandatory=$false)]
    [string]$ProfileName = "default",
    
    [Parameter(Mandatory=$true, HelpMessage="Token de GitHub con permisos repo y admin:repo_hook")]
    [string]$GitHubToken,
    
    [Parameter(Mandatory=$true, HelpMessage="Token de Apify API")]
    [string]$ApifyToken
)

Write-Host "🚀 Desplegando Stack de CloudFormation para AWS Amplify..." -ForegroundColor Cyan
Write-Host ""

# Verificar que AWS CLI está instalado
try {
    $awsVersion = aws --version
    Write-Host "✅ AWS CLI detectado: $awsVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ AWS CLI no está instalado. Instálalo desde: https://aws.amazon.com/cli/" -ForegroundColor Red
    exit 1
}

# Verificar credenciales de AWS
Write-Host "🔍 Verificando credenciales de AWS..." -ForegroundColor Yellow
try {
    $identity = aws sts get-caller-identity --profile $ProfileName --region $Region 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Credenciales válidas" -ForegroundColor Green
        Write-Host $identity
    } else {
        Write-Host "❌ Error: Credenciales inválidas o no configuradas" -ForegroundColor Red
        Write-Host "Configura AWS CLI con: aws configure --profile $ProfileName" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Error al verificar credenciales" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📋 Configuración del Stack:" -ForegroundColor Cyan
Write-Host "  - Stack Name: $StackName" -ForegroundColor White
Write-Host "  - Region: $Region" -ForegroundColor White
Write-Host "  - Profile: $ProfileName" -ForegroundColor White
Write-Host ""

# Crear el stack
Write-Host "🔨 Creando/Actualizando el stack..." -ForegroundColor Yellow

$parameters = @(
    "ParameterKey=GitHubRepository,ParameterValue=https://github.com/Anyeli1204/cloud-front",
    "ParameterKey=GitHubBranch,ParameterValue=main",
    "ParameterKey=GitHubToken,ParameterValue=$GitHubToken",
    "ParameterKey=AccountsServiceURL,ParameterValue=http://54.162.117.139:8084/api/v1",
    "ParameterKey=ContentServiceURL,ParameterValue=http://54.162.117.139:8083",
    "ParameterKey=DashboardServiceURL,ParameterValue=http://54.162.117.139:8081",
    "ParameterKey=OrchestratorServiceURL,ParameterValue=http://35.175.5.172:8085",
    "ParameterKey=AnalyticsServiceURL,ParameterValue=http://35.175.5.172:8086",
    "ParameterKey=MS3ServiceURL,ParameterValue=http://54.162.117.139:8082",
    "ParameterKey=ApifyToken,ParameterValue=$ApifyToken"
)

try {
    # Intentar actualizar el stack primero
    Write-Host "Intentando actualizar stack existente..." -ForegroundColor Yellow
    
    aws cloudformation update-stack `
        --stack-name $StackName `
        --template-body file://cloudformation-amplify.yml `
        --parameters $parameters `
        --capabilities CAPABILITY_NAMED_IAM `
        --region $Region `
        --profile $ProfileName
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Stack actualizado correctamente" -ForegroundColor Green
        $action = "update"
    } else {
        throw "Update failed"
    }
    
} catch {
    # Si el update falla, intentar crear el stack
    Write-Host "Stack no existe. Creando nuevo stack..." -ForegroundColor Yellow
    
    aws cloudformation create-stack `
        --stack-name $StackName `
        --template-body file://cloudformation-amplify.yml `
        --parameters $parameters `
        --capabilities CAPABILITY_NAMED_IAM `
        --region $Region `
        --profile $ProfileName
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Stack creado correctamente" -ForegroundColor Green
        $action = "create"
    } else {
        Write-Host "❌ Error al crear el stack" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "⏳ Esperando que el stack se complete..." -ForegroundColor Yellow
Write-Host "   (Esto puede tomar 5-10 minutos)" -ForegroundColor Gray
Write-Host ""

# Esperar a que el stack se complete
if ($action -eq "create") {
    aws cloudformation wait stack-create-complete `
        --stack-name $StackName `
        --region $Region `
        --profile $ProfileName
} else {
    aws cloudformation wait stack-update-complete `
        --stack-name $StackName `
        --region $Region `
        --profile $ProfileName
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ ¡Stack desplegado exitosamente!" -ForegroundColor Green
    Write-Host ""
    
    # Obtener outputs del stack
    Write-Host "📊 Información del Stack:" -ForegroundColor Cyan
    Write-Host ""
    
    $outputs = aws cloudformation describe-stacks `
        --stack-name $StackName `
        --region $Region `
        --profile $ProfileName `
        --query 'Stacks[0].Outputs' `
        --output table
    
    Write-Host $outputs
    
    Write-Host ""
    Write-Host "🌐 Para ver tu aplicación:" -ForegroundColor Cyan
    
    $appUrl = aws cloudformation describe-stacks `
        --stack-name $StackName `
        --region $Region `
        --profile $ProfileName `
        --query 'Stacks[0].Outputs[?OutputKey==`AppURL`].OutputValue' `
        --output text
    
    Write-Host "   $appUrl" -ForegroundColor White
    
    Write-Host ""
    Write-Host "🎛️  Consola de Amplify:" -ForegroundColor Cyan
    
    $consoleUrl = aws cloudformation describe-stacks `
        --stack-name $StackName `
        --region $Region `
        --profile $ProfileName `
        --query 'Stacks[0].Outputs[?OutputKey==`ConsoleURL`].OutputValue' `
        --output text
    
    Write-Host "   $consoleUrl" -ForegroundColor White
    
    Write-Host ""
    Write-Host "✨ ¡Listo! Tu aplicación está desplegándose automáticamente." -ForegroundColor Green
    Write-Host "   Amplify detectará cambios en GitHub y se actualizará automáticamente." -ForegroundColor Gray
    
} else {
    Write-Host ""
    Write-Host "❌ Error: El stack no se completó correctamente" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔍 Para ver los detalles del error:" -ForegroundColor Yellow
    Write-Host "   aws cloudformation describe-stack-events --stack-name $StackName --region $Region" -ForegroundColor White
    exit 1
}
