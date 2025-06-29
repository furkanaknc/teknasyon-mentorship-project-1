# Teknasyon Mentorship - Microservices Project

A modern microservices architecture built with NestJS, featuring an API Gateway and multiple specialized services for authentication, list management, and user profiles.

## 🏗️ Architecture Overview

This project implements a microservices architecture with the following components:

- **API Gateway** (Port 4000) - Routes requests to appropriate services
- **Auth Service** (Port 3001) - Handles authentication and authorization
- **List Service** (Port 3002) - Manages lists and list items
- **Profile Service** (Port 3003) - Manages user profiles
- **Web Application** (Next.js) - Frontend interface

## 📁 Project Structure

```
src/
├── apps/
│   ├── gateway/          # API Gateway service
│   │   ├── src/
│   │   │   ├── controllers/     # Route controllers
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── list.controller.ts
│   │   │   │   ├── list-items.controller.ts
│   │   │   │   └── profile.controller.ts
│   │   │   ├── app/            # Core application
│   │   │   ├── common/         # Shared utilities
│   │   │   └── validations/    # Request validation
│   │   └── .env               # Gateway configuration
│   ├── auth/             # Authentication service
│   ├── list/             # List management service
│   ├── profile/          # Profile management service
│   └── web/              # Next.js frontend
├── libs/
│   └── shared-auth/      # Shared authentication library
└── docker-compose.yml    # Container orchestration
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- MongoDB (for data persistence)
- Redis (for caching)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd first-project
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**

   Create `.env` files for each service:

   **Gateway (.env)**

   ```env
   NODE_ENV=development
   PORT=4000
   JWT_SECRET=your_jwt_secret_at_least_16_chars
   CORS_ORIGIN=http://localhost:3030

   # Service URLs
   AUTH_SERVICE_URL=http://localhost:3001
   LIST_SERVICE_URL=http://localhost:3002
   PROFILE_SERVICE_URL=http://localhost:3003
   ```

4. **Build all services**

   ```bash
   npm run build
   ```

5. **Start services**
   ```bash
   # Start each service in separate terminals
   cd src/apps/auth && npm run start:dev
   cd src/apps/list && npm run start:dev
   cd src/apps/profile && npm run start:dev
   cd src/apps/gateway && npm run start:dev
   ```

### Using Docker (Recommended)

```bash
# Start all services with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🔌 API Endpoints

### Gateway Health Check

- `GET /api/health` - Check all services health

### Authentication (`/api/auth/`)

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify JWT token
- `GET /api/auth/health` - Auth service health

### Lists (`/api/list/`)

- `GET /api/list/lists` - Get all lists
- `GET /api/list/lists/:listId` - Get specific list
- `GET /api/list/lists/slug/:slug` - Get list by slug
- `POST /api/list/lists` - Create new list (🔒 Auth required)
- `PUT /api/list/lists/:listId` - Update list (🔒 Auth required)
- `DELETE /api/list/lists/:listId` - Delete list (🔒 Auth required)
- `GET /api/list/health` - List service health

### List Items (`/api/list-items/`)

- `GET /api/list-items/:listId` - Get list items
- `GET /api/list-items/:listId/:itemId` - Get specific item
- `POST /api/list-items/:listId` - Create list item (🔒 Auth required)
- `PUT /api/list-items/:listId/:itemId` - Update item (🔒 Auth required)
- `DELETE /api/list-items/:listId/:itemId` - Delete item (🔒 Auth required)

### Profile (`/api/profile/`)

- `GET /api/profile` - Get user profile (🔒 Auth required)
- `PUT /api/profile` - Update profile (🔒 Auth required)
- `DELETE /api/profile` - Delete profile (🔒 Auth required)
- `GET /api/profile/health` - Profile service health

## 🔐 Authentication

The system uses JWT (JSON Web Tokens) for authentication:

1. **Register/Login** to get an access token
2. **Include token** in requests: `Authorization: Bearer <token>`
3. **Token expires** in 7 days (configurable)

### Example Usage

```bash
# Login and get token
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Use token in authenticated requests
curl -X GET http://localhost:4000/api/profile \
  -H "Authorization: Bearer <your-token>"
```

## 🧪 Testing

### Health Checks

```bash
# Check all services
curl http://localhost:4000/api/health

# Check individual services
curl http://localhost:4000/api/auth/health
curl http://localhost:4000/api/list/health
curl http://localhost:4000/api/profile/health
```

### Authentication Flow

```bash
# Register new user
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "username": "testuser"
  }'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

## 🛠️ Development

### Adding New Endpoints

1. **Add to appropriate controller**

   ```typescript
   @Get('new-endpoint')
   async newEndpoint(@Req() req: Request, @Res() res: Response) {
     return this.proxyService.proxyToService('service-name', 'GET', '/new-endpoint', null, req, res);
   }
   ```

2. **Update the microservice** to handle the new endpoint

3. **Test the endpoint** through the gateway

### Project Scripts

```bash
# Build all services
npm run build

# Run tests
npm run test

# Lint code
npm run lint

# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

## 🔧 Configuration

### Environment Variables

| Variable              | Description         | Default                 |
| --------------------- | ------------------- | ----------------------- |
| `NODE_ENV`            | Environment mode    | `development`           |
| `PORT`                | Service port        | Service specific        |
| `JWT_SECRET`          | JWT signing secret  | Required                |
| `CORS_ORIGIN`         | CORS allowed origin | `http://localhost:3030` |
| `AUTH_SERVICE_URL`    | Auth service URL    | `http://localhost:3001` |
| `LIST_SERVICE_URL`    | List service URL    | `http://localhost:3002` |
| `PROFILE_SERVICE_URL` | Profile service URL | `http://localhost:3003` |

### Service Ports

| Service | Port | Purpose                    |
| ------- | ---- | -------------------------- |
| Gateway | 4000 | API Gateway and routing    |
| Auth    | 3001 | Authentication service     |
| List    | 3002 | List management service    |
| Profile | 3003 | Profile management service |
| Web     | 3030 | Next.js frontend           |

## 🏛️ Architecture Decisions

### API Gateway Pattern

- **Centralized routing** - Single entry point for all API requests
- **Service discovery** - Automatic health checking of services
- **Request/Response transformation** - Consistent API responses
- **Authentication handling** - JWT validation at gateway level

### Controller Separation

- **Domain-specific controllers** - Each service has dedicated controllers
- **Clean separation** - Lists and List Items have separate controllers
- **RESTful design** - Consistent URL patterns and HTTP methods

### Shared Libraries

- **@teknasyon/shared-auth** - Common authentication utilities
- **Reusable components** - Shared across all services
- **Type safety** - TypeScript interfaces and types

## 🚨 Troubleshooting

### Common Issues

1. **Service Unavailable (503)**

   - Check if microservices are running
   - Verify service URLs in gateway configuration
   - Check network connectivity between services

2. **Authentication Errors (401)**

   - Ensure JWT_SECRET is consistent across services
   - Check token expiration
   - Verify token format in Authorization header

3. **Port Conflicts**
   - Ensure each service uses a unique port
   - Check if ports are already in use: `netstat -an | grep :PORT`

### Debugging

```bash
# View service logs
docker-compose logs -f gateway
docker-compose logs -f auth

# Check service health
curl http://localhost:4000/api/health

# Test individual services directly
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
```

## 📈 Monitoring and Logging

- **Structured logging** with request IDs
- **Health check endpoints** for all services
- **Error handling** with proper HTTP status codes
- **Request/Response logging** in gateway

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes
4. Run tests: `npm run test`
5. Commit changes: `git commit -am 'Add new feature'`
6. Push to branch: `git push origin feature/new-feature`
7. Submit a Pull Request

## 📝 License

This project is part of the Teknasyon Mentorship Program.

## 🔗 Links

- [NestJS Documentation](https://nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [JWT.io](https://jwt.io/)
- [Docker Documentation](https://docs.docker.com/)

---

**Built with ❤️ for Teknasyon Mentorship Program**
