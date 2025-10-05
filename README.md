# Diagrama Entidad-Relación - Microservicio 4

## 📊 Diagrama ER

```mermaid
erDiagram
    DASHBOARD_PUBLISHED_DATA {
        Long id PK "Clave primaria auto-generada"
        List_DashboardData data "Lista de datos relacionados"
    }
    
    DASHBOARD_DATA {
        Long id PK "Clave primaria auto-generada"
        Long adminId "ID del administrador"
        String usedHashTag "Hashtag utilizado"
        LocalDate datePosted "Fecha de publicación"
        String usernameTiktokAccount "Usuario de TikTok"
        String postId "ID del post"
        String postURL "URL del post"
        Integer views "Número de visualizaciones"
        Integer likes "Número de likes"
        Double engagement "Nivel de engagement"
        Long publication_id FK "Referencia a DashboardPublishedData"
    }
    
    TIKTOK_DATA_DTO {
        Long adminId "ID del administrador"
        String usedHashTag "Hashtag utilizado"
        String postId "ID del post"
        LocalDate datePosted "Fecha de publicación"
        String usernameTiktokAccount "Usuario de TikTok"
        String postURL "URL del post"
        Integer views "Visualizaciones (mínimo 1)"
        Integer likes "Likes (mínimo 1)"
        Double engagement "Nivel de engagement"
    }

    %% Relaciones
    DASHBOARD_PUBLISHED_DATA ||--o{ DASHBOARD_DATA : "contiene"
    DASHBOARD_DATA ||--|| DASHBOARD_PUBLISHED_DATA : "pertenece_a"
    
    %% DTO no tiene relación directa con las entidades JPA
    %% pero se usa para transferir datos entre capas
```

## 🔗 Relaciones

### Relación Principal:
- **DASHBOARD_PUBLISHED_DATA** (1) ←→ (N) **DASHBOARD_DATA**
  - **Tipo**: One-to-Many / Many-to-One
  - **Descripción**: Una publicación puede contener múltiples datos de dashboard
  - **Cardinalidad**: 1:N
  - **Clave foránea**: `publication_id` en DASHBOARD_DATA

### DTO:
- **TIKTOK_DATA_DTO** es un objeto de transferencia de datos
- No tiene relación directa con las entidades JPA
- Se usa para recibir/enviar datos de TikTok en las APIs

## 📋 Descripción de Entidades

### 🏢 DASHBOARD_PUBLISHED_DATA
- **Propósito**: Agrupa y gestiona las publicaciones de datos del dashboard
- **Atributos**: 
  - `id`: Identificador único de la publicación
  - `data`: Lista de todos los datos asociados a esta publicación

### 📊 DASHBOARD_DATA
- **Propósito**: Almacena los datos individuales de métricas de TikTok
- **Atributos principales**:
  - Datos del post (ID, URL, fecha, hashtag)
  - Métricas (visualizaciones, likes, engagement)
  - Información del usuario (adminId, usernameTiktokAccount)
  - Relación con la publicación padre

### 📦 TIKTOK_DATA_DTO
- **Propósito**: Transferir datos de TikTok entre capas de la aplicación
- **Validaciones**: 
  - Views y Likes deben ser mínimo 1
  - Campos obligatorios con @NotNull y @NotBlank
