package firebase

import (
	"context"
	"encoding/json"
	"errors"
	"os"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"google.golang.org/api/option"
)

var (
	App        *firebase.App
	authClient *auth.Client
)

// Init inicializa Firebase Admin SDK
func Init() (*firebase.App, error) {
	raw := os.Getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
	if raw == "" {
		return nil, errors.New("FIREBASE_SERVICE_ACCOUNT_JSON not set")
	}

	// Validar JSON
	var creds map[string]interface{}
	if err := json.Unmarshal([]byte(raw), &creds); err != nil {
		return nil, err
	}

	opt := option.WithCredentialsJSON([]byte(raw))

	app, err := firebase.NewApp(context.Background(), nil, opt)
	if err != nil {
		return nil, err
	}

	client, err := app.Auth(context.Background())
	if err != nil {
		return nil, err
	}

	App = app
	authClient = client

	return app, nil
}

// GetAuthClient retorna el cliente de Firebase Auth
func GetAuthClient() *auth.Client {
	return authClient
}
