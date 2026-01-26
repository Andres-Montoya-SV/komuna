# Komuna

A backend API service for the Komuna platform, built with Go and Firebase Authentication.

## 🏗️ Architecture

```
komuna/
├── cmd/api/           # Application entrypoint
├── internal/          # Private application code
│   ├── auth/          # Authentication logic
│   ├── community/     # Community domain logic
│   ├── config/        # Configuration management
│   ├── db/            # Database connections
│   ├── errors/        # Custom error handling
│   ├── firebase/      # Firebase SDK integration
│   ├── logger/        # Structured logging (Zap)
│   ├── middleware/    # HTTP middlewares
│   ├── ratelimit/     # Rate limiting
│   ├── routes/        # API route definitions
│   ├── store/         # Store/Product domain logic
│   └── user/          # User domain logic
├── migrations/        # SQL migration files
├── .firebase/         # Firebase credentials
└── README.md          # Project documentation
```

## 🛠️ Tech Stack

- **Language**: Go 1.25
- **Framework**: [Fiber](https://github.com/gofiber/fiber) v2 - Fast HTTP framework
- **Database**: PostgreSQL (via [pgx](https://github.com/jackc/pgx) v5)
    - Entities: Users, Profiles, Communities, Products
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
   cd komuna
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
   
   See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed Firebase configuration instructions.

5. **Run the server**
   ```bash
   go run cmd/api/main.go
   ```
   
   The API will be available at `http://localhost:2077`

### 📚 Documentation

The API documentation is available via Swagger UI:
- **URL**: `http://localhost:2077/swagger/index.html`
- **JSON Spec**: `http://localhost:2077/swagger/doc.json`

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

### Communities

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/communities` | Create a new community |
| `GET` | `/api/v1/communities` | List all communities |
| `GET` | `/api/v1/communities/:id` | Get community details |
| `PUT` | `/api/v1/communities/:id` | Update community details |

### Store Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/store` | Create a new store |
| `GET` | `/api/v1/store/me` | Get my store |
| `GET` | `/api/v1/store/:id` | Get store details (public) |
| `PUT` | `/api/v1/store/:id` | Update store details |

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/store/products` | Create a new product (requires store) |
| `GET` | `/api/v1/store/products` | List products (requires `community_id`) |

## 🔐 Authentication Flow

1.  Users register/login through Firebase Authentication
2.  Firebase returns ID tokens and refresh tokens
3.  Protected endpoints verify Firebase ID tokens via Admin SDK
4.  User metadata is synchronized between Firebase and PostgreSQL

## 🧪 Development

### Running Tests
```bash
go test ./...
```

### CI/CD
The project uses GitHub Actions for continuous integration:
- **Lint**: `golangci-lint`
- **Test**: `go test`
- **Build**: `go build`

A `Dockerfile` is included for containerized deployment (multi-stage alpine build).

### Code Structure

The project follows a clean architecture pattern:

  - Each domain (user, auth, community, store, etc.) has its own package with repository, service, and handler layers

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
