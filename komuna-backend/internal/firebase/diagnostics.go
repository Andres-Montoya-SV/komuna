package firebase

import (
	"context"
	"fmt"
	"os"
	"strings"
)

// CheckHealth verifica que Firebase esté correctamente configurado
func CheckHealth(ctx context.Context) error {
	// Verificar variable de entorno
	credentialsPath := os.Getenv("FIREBASE_CREDENTIALS_PATH")
	if credentialsPath == "" {
		return fmt.Errorf("FIREBASE_CREDENTIALS_PATH environment variable is not set")
	}

	// Verificar que el archivo exista
	if _, err := os.Stat(credentialsPath); os.IsNotExist(err) {
		return fmt.Errorf("firebase credentials file not found at: %s", credentialsPath)
	}

	// Verificar que el cliente esté inicializado
	client := GetAuthClient()
	if client == nil {
		return fmt.Errorf("firebase auth client is nil - Init() may not have been called")
	}

	// Intentar una operación simple para verificar conectividad
	// (no creamos un usuario real, solo verificamos que el cliente funcione)
	_, err := client.GetUser(ctx, "test-connection-check-this-user-does-not-exist")
	if err != nil {
		// Esperamos un error "user not found", pero si es otro tipo de error
		// puede indicar un problema de conectividad o permisos
		errStr := strings.ToLower(err.Error())
		// Reconocer varios formatos de "user not found" que Firebase puede retornar
		isUserNotFound := strings.Contains(errStr, "not found") ||
			strings.Contains(errStr, "user_not_found") ||
			strings.Contains(errStr, "no user exists") ||
			strings.Contains(errStr, "user does not exist")
		
		if !isUserNotFound {
			return fmt.Errorf("firebase client connectivity check failed: %w", err)
		}
		// Si es "user not found", significa que la conexión funciona correctamente
	}

	return nil
}

