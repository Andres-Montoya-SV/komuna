package firebase

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

type signInRequest struct {
	Email             string `json:"email"`
	Password          string `json:"password"`
	ReturnSecureToken bool   `json:"returnSecureToken"`
}

type signInResponse struct {
	IDToken      string `json:"idToken"`
	Email        string `json:"email"`
	RefreshToken string `json:"refreshToken"`
	ExpiresIn    string `json:"expiresIn"`
	LocalID      string `json:"localId"`
	Registered   bool   `json:"registered"`
}

// SignInWithEmailPassword autentica un usuario con email y password usando Firebase REST API
// Retorna el ID token si las credenciales son válidas
func SignInWithEmailPassword(ctx context.Context, email, password string) (*signInResponse, error) {
	apiKey := os.Getenv("FIREBASE_API_KEY")
	if apiKey == "" {
		return nil, fmt.Errorf("FIREBASE_API_KEY environment variable is required")
	}

	url := fmt.Sprintf("https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=%s", apiKey)

	reqBody := signInRequest{
		Email:             email,
		Password:          password,
		ReturnSecureToken: true,
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != http.StatusOK {
		var errorResp struct {
			Error struct {
				Code    int    `json:"code"`
				Message string `json:"message"`
			} `json:"error"`
		}
		if err := json.Unmarshal(body, &errorResp); err == nil {
			return nil, fmt.Errorf("firebase auth error: %s", errorResp.Error.Message)
		}
		return nil, fmt.Errorf("firebase auth error: status %d", resp.StatusCode)
	}

	var signInResp signInResponse
	if err := json.Unmarshal(body, &signInResp); err != nil {
		return nil, err
	}

	return &signInResp, nil
}

