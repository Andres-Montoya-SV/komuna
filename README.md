# Komuna

A backend API service for the Komuna platform, built with Go and Firebase Authentication.

## 🏗️ Architecture

```
komuna/
├── komuna-backend/         # Go API server
│   ├── cmd/api/           # Application entrypoint
│   ├── internal/          # Private application code
│   │   ├── auth/          # Authentication logic
│   │   ├── config/        # Configuration management
│   │   ├── db/            # Database connections
│   │   ├── errors/        # Custom error handling
│   │   ├── firebase/      # Firebase SDK integration
│   │   ├── logger/        # Structured logging (Zap)
│   │   ├── middleware/    # HTTP middlewares
│   │   ├── ratelimit/     # Rate limiting
│   │   ├── routes/        # API route definitions
│   │   └── user/          # User domain logic
│   └── .firebase/         # Firebase credentials
```

## 🛠️ Tech Stack

- **Language**: Go 1.25
- **Framework**: [Fiber](https://github.com/gofiber/fiber) v2 - Fast HTTP framework
- **Database**: PostgreSQL (via [pgx](https://github.com/jackc/pgx) v5)
- **Authentication**: Firebase Authentication v4
- **Logging**: [Zap](https://github.com/uber-go/zap) - Structured logging
- **Deployment**: Heroku-ready (Procfile included)

## 🚀 Getting Started

### Prerequisites

- Go 1.25 or later
- PostgreSQL 14+
- Firebase project with Authentication enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/komuna.git
   cd komuna/komuna-backend
   ```

2. **Install dependencies**
   ```bash
   go mod download
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the `komuna-backend` directory:
   ```env
   APP_ENV=development
   PORT=2077
   DATABASE_URL="postgres://user:password@localhost:5432/komuna?sslmode=disable"
   JWT_SECRET=your-jwt-secret
   FIREBASE_CREDENTIALS_PATH="./.firebase/your-credentials.json"
   FIREBASE_API_KEY="your-firebase-api-key"
   FIREBASE_WEB_API_KEY="your-firebase-web-api-key"
   ```

4. **Set up Firebase**
   
   See [FIREBASE_SETUP.md](./komuna-backend/FIREBASE_SETUP.md) for detailed Firebase configuration instructions.

5. **Run the server**
   ```bash
   go run cmd/api/main.go
   ```
   
   The API will be available at `http://localhost:2077`

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/users/register` | Register a new user |
| `POST` | `/api/v1/users/login` | Login with email/password |

### User Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/users/:id` | Get user by ID |
| `PUT` | `/api/v1/users/:id` | Update user profile |

## 🔐 Authentication Flow

1. Users register/login through Firebase Authentication
2. Firebase returns ID tokens and refresh tokens
3. Protected endpoints verify Firebase ID tokens via Admin SDK
4. User metadata is synchronized between Firebase and PostgreSQL

## 🧪 Development

### Running Tests
```bash
go test ./...
```

### Code Structure

The project follows a clean architecture pattern:

- **`cmd/`** - Application entrypoints
- **`internal/`** - Private application code (not importable by external packages)
  - Each domain (user, auth, etc.) has its own package with repository, service, and handler layers

## 🔧 Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `APP_ENV` | Environment (development/production) | `development` |
| `PORT` | Server port | `2077` |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `JWT_SECRET` | JWT signing secret | - |
| `FIREBASE_CREDENTIALS_PATH` | Path to Firebase service account JSON | - |
| `FIREBASE_API_KEY` | Firebase API key | - |

## 🚢 Deployment

### Heroku

The project includes a `Procfile` for Heroku deployment:
```
web: ./api
```

Deploy with:
```bash
git push heroku main
```

## 📝 License

This project is proprietary software. All rights reserved.

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.
