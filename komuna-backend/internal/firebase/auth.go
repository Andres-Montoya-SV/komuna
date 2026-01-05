package firebase

import (
	"context"
	"fmt"

	"firebase.google.com/go/v4/auth"
)

func CreateUser(ctx context.Context, email, password string, displayName string) (*auth.UserRecord, error) {
	client := GetAuthClient()
	if client == nil {
		return nil, fmt.Errorf("firebase auth client not initialized - make sure Firebase.Init() was called")
	}

	params := (&auth.UserToCreate{}).
		Email(email).
		Password(password).
		EmailVerified(false).
		Disabled(false)

	if displayName != "" {
		params = params.DisplayName(displayName)
	}

	userRecord, err := client.CreateUser(ctx, params)
	if err != nil {
		// Wrappear el error con más contexto
		return nil, fmt.Errorf("firebase CreateUser failed: %w", err)
	}

	return userRecord, nil
}

func GetUserByEmail(ctx context.Context, email string) (*auth.UserRecord, error) {
	client := GetAuthClient()
	if client == nil {
		return nil, fmt.Errorf("firebase auth client not initialized")
	}

	userRecord, err := client.GetUserByEmail(ctx, email)
	if err != nil {
		return nil, err
	}

	return userRecord, nil
}

func GetUserByUID(ctx context.Context, uid string) (*auth.UserRecord, error) {
	client := GetAuthClient()
	if client == nil {
		return nil, fmt.Errorf("firebase auth client not initialized")
	}

	userRecord, err := client.GetUser(ctx, uid)
	if err != nil {
		return nil, err
	}

	return userRecord, nil
}

// VerifyIDToken verifica un ID token de Firebase
func VerifyIDToken(ctx context.Context, idToken string) (*auth.Token, error) {
	client := GetAuthClient()
	if client == nil {
		return nil, fmt.Errorf("firebase auth client not initialized")
	}

	token, err := client.VerifyIDToken(ctx, idToken)
	if err != nil {
		return nil, err
	}

	return token, nil
}

// UpdateUser actualiza un usuario en Firebase
func UpdateUser(ctx context.Context, uid string, updates *auth.UserToUpdate) (*auth.UserRecord, error) {
	client := GetAuthClient()
	if client == nil {
		return nil, fmt.Errorf("firebase auth client not initialized")
	}

	userRecord, err := client.UpdateUser(ctx, uid, updates)
	if err != nil {
		return nil, err
	}

	return userRecord, nil
}

// DeleteUser elimina un usuario de Firebase
func DeleteUser(ctx context.Context, uid string) error {
	client := GetAuthClient()
	if client == nil {
		return fmt.Errorf("firebase auth client not initialized")
	}

	return client.DeleteUser(ctx, uid)
}
