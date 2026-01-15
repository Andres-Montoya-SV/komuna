package firebase

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"google.golang.org/api/option"

	"komuna/internal/config"
)

var (
	App        *firebase.App
	authClient *auth.Client
)

// Init initializes the Firebase Admin SDK.
// It requires the FIREBASE_SERVICE_ACCOUNT_JSON env var to be set.
func Init() (*firebase.App, error) {
	raw := os.Getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
	if raw == "" {
		// Try default credentials if JSON not set, or fail?
		// User code implied JSON env var.
		return nil, errors.New("FIREBASE_SERVICE_ACCOUNT_JSON not set")
	}

	// Validate JSON
	var creds map[string]interface{}
	if err := json.Unmarshal([]byte(raw), &creds); err != nil {
		return nil, fmt.Errorf("invalid firebase credentials json: %w", err)
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

// GetAuthClient returns the Firebase Auth Client.
func GetAuthClient() *auth.Client {
	return authClient
}

// CreateUser creates a new user in Firebase Authentication.
func CreateUser(ctx context.Context, email, password, displayName string) (*auth.UserRecord, error) {
	if authClient == nil {
		return nil, errors.New("firebase auth client not initialized")
	}

	params := (&auth.UserToCreate{}).
		Email(email).
		Password(password).
		DisplayName(displayName)

	return authClient.CreateUser(ctx, params)
}

// DeleteUser deletes a user from Firebase Authentication.
func DeleteUser(ctx context.Context, uid string) error {
	if authClient == nil {
		return errors.New("firebase auth client not initialized")
	}

	return authClient.DeleteUser(ctx, uid)
}

// GetUser retrieves a user from Firebase Authentication by UID.
func GetUser(ctx context.Context, uid string) (*auth.UserRecord, error) {
	if authClient == nil {
		return nil, errors.New("firebase auth client not initialized")
	}

	return authClient.GetUser(ctx, uid)
}

// CheckHealth verifies if we can reach Firebase Auth service (by listing 1 user).
func CheckHealth(ctx context.Context) error {
	if authClient == nil {
		return errors.New("firebase auth client not initialized")
	}

	// Just try to list 1 user to verify connectivity
	iter := authClient.Users(ctx, "")
	_, err := iter.Next()
	// EOF means no users, which is fine for connection check.
	// Other errors mean connection issues.
	if err != nil && err.Error() == "no more items in iterator" {
		return nil
	}
	return err
}

// VerifyToken verifies the ID token sent by the frontend.
func VerifyToken(ctx context.Context, idToken string) (*auth.Token, error) {
	if authClient == nil {
		return nil, fmt.Errorf("firebase auth client not initialized")
	}

	return authClient.VerifyIDToken(ctx, idToken)
}

// SignInResponse represents the response from Firebase REST API.
type SignInResponse struct {
	IDToken       string `json:"idToken"`
	Email         string `json:"email"`
	RefreshToken  string `json:"refreshToken"`
	ExpiresIn     string `json:"expiresIn"`
	LocalID       string `json:"localId"`
	Registered    bool   `json:"registered"`
	EmailVerified bool   `json:"emailVerified"`
}

// SignInWithEmailPassword signs in a user using Firebase REST API.
// Note: Admin SDK does not support sign-in. We must use the REST API.
func SignInWithEmailPassword(ctx context.Context, email, password string) (*SignInResponse, error) {
	apiKey := config.Load().FirebaseWebApiKey
	if apiKey == "" {
		return nil, errors.New("FIREBASE_WEB_API_KEY not configured")
	}

	url := fmt.Sprintf("https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=%s", apiKey)

	body := map[string]interface{}{
		"email":             email,
		"password":          password,
		"returnSecureToken": true,
	}

	jsonBody, err := json.Marshal(body)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(jsonBody))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		var errResp map[string]interface{}
		_ = json.NewDecoder(resp.Body).Decode(&errResp)
		return nil, fmt.Errorf("firebase signin failed: %v", errResp)
	}

	var signInResp SignInResponse
	if err := json.NewDecoder(resp.Body).Decode(&signInResp); err != nil {
		return nil, err
	}

	return &signInResp, nil
}

// SendVerificationEmail sends a verification email to the user.
func SendVerificationEmail(ctx context.Context, idToken string) error {
	apiKey := config.Load().FirebaseWebApiKey
	if apiKey == "" {
		return errors.New("FIREBASE_WEB_API_KEY not configured")
	}

	url := fmt.Sprintf("https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=%s", apiKey)

	body := map[string]interface{}{
		"requestType": "VERIFY_EMAIL",
		"idToken":     idToken,
	}

	jsonBody, err := json.Marshal(body)
	if err != nil {
		return err
	}

	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(jsonBody))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		var errResp map[string]interface{}
		_ = json.NewDecoder(resp.Body).Decode(&errResp)
		return fmt.Errorf("send verification email failed: %v", errResp)
	}

	return nil
}
