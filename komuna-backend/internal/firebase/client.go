package firebase

import (
	"context"
	"log"
	"os"

	"firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"google.golang.org/api/option"
)

var (
	authClient *auth.Client
)

// Init inicializa el cliente de Firebase Admin SDK
func Init() (*auth.Client, error) {
	ctx := context.Background()

	// Obtener la ruta al archivo de credenciales desde variable de entorno
	credentialsPath := os.Getenv("FIREBASE_CREDENTIALS_PATH")
	if credentialsPath == "" {
		log.Fatal("FIREBASE_CREDENTIALS_PATH environment variable is required")
	}

	opt := option.WithCredentialsFile(credentialsPath)
	app, err := firebase.NewApp(ctx, nil, opt)
	if err != nil {
		return nil, err
	}

	client, err := app.Auth(ctx)
	if err != nil {
		return nil, err
	}

	authClient = client
	return client, nil
}

// GetAuthClient retorna el cliente de autenticación de Firebase
func GetAuthClient() *auth.Client {
	return authClient
}

