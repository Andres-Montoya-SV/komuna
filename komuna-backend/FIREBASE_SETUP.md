# Firebase Authentication Setup

Este proyecto usa Firebase Authentication v4 Admin SDK para manejar autenticación de usuarios.

## Instalación de Dependencias

Ejecuta el siguiente comando para instalar Firebase Admin SDK v4:

```bash
go get firebase.google.com/go/v4@latest
go get firebase.google.com/go/v4/auth@latest
go mod tidy
```

## Configuración

### 1. Obtener credenciales de Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto (o crea uno nuevo)
3. Ve a **Project Settings** (⚙️) → **Service Accounts**
4. Haz clic en **Generate New Private Key**
5. Descarga el archivo JSON de credenciales

### 2. Configurar variables de entorno

Agrega las siguientes variables a tu archivo `.env`:

```env
# Ruta al archivo JSON de credenciales de Firebase
FIREBASE_CREDENTIALS_PATH=/path/to/your/firebase-credentials.json

# API Key de Firebase (para REST API de autenticación)
FIREBASE_API_KEY=your-firebase-api-key
```

**Para obtener FIREBASE_API_KEY:**
1. En Firebase Console, ve a **Project Settings** → **General**
2. En la sección "Your apps", busca "Web API Key" o crea una nueva app web
3. Copia el valor de "API Key"

### 3. Habilitar Authentication en Firebase

1. En Firebase Console, ve a **Authentication** → **Sign-in method**
2. Habilita **Email/Password** provider
3. Guarda los cambios

## Cambios en la Base de Datos

### Actualizar tabla users

La tabla `users` ahora usa el **Firebase UID** como ID principal en lugar de UUIDs generados localmente. El campo `password_hash` ya no se usa (Firebase maneja las contraseñas).

**Migración SQL (opcional si ya tienes datos):**

```sql
-- Si necesitas migrar usuarios existentes, primero crea los usuarios en Firebase
-- y luego actualiza los IDs en PostgreSQL para que coincidan con los Firebase UIDs
```

**Nota:** Los nuevos registros automáticamente usarán Firebase UID como ID.

## Endpoints Actualizados

### POST /api/v1/users/register

Ahora crea el usuario en Firebase Authentication primero, luego guarda los datos adicionales en PostgreSQL.

**Request:**
```json
{
  "first_name": "Andres",
  "last_name": "Lopez",
  "username": "andres123",
  "phone": "+50370000000",
  "email": "andres@example.com",
  "password": "SuperSeguro123"
}
```

**Response:**
```json
{
  "id": "firebase-uid-here",
  "first_name": "Andres",
  "last_name": "Lopez",
  "username": "andres123",
  "phone": "+50370000000",
  "email": "andres@example.com",
  "status": "pending",
  "email_verified": false,
  "created_at": "2025-01-05T10:00:00Z",
  "updated_at": "2025-01-05T10:00:00Z"
}
```

### POST /api/v1/users/login

Ahora autentica usando Firebase REST API y retorna tokens de Firebase.

**Request:**
```json
{
  "identifier": "andres@example.com",
  "password": "SuperSeguro123"
}
```

**Response:**
```json
{
  "id_token": "firebase-id-token",
  "refresh_token": "firebase-refresh-token",
  "token_type": "Bearer",
  "expires_in": "3600",
  "user": {
    "id": "firebase-uid",
    "username": "andres123",
    "email": "andres@example.com",
    "status": "pending",
    "email_verified": false
  }
}
```

## Verificar Tokens de Firebase

Para verificar tokens ID de Firebase en otros endpoints, usa:

```go
import "komuna/internal/firebase"

token, err := firebase.VerifyIDToken(ctx, idToken)
if err != nil {
    // Token inválido
    return
}

uid := token.UID // Firebase UID del usuario
```

## Referencias

- [Firebase Admin SDK Go v4 Documentation](https://firebase.google.com/docs/admin/migrate-go-v4)
- [Firebase Authentication REST API](https://firebase.google.com/docs/reference/rest/auth)

