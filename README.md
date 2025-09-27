# ScrapeTok – Frontend

React (TypeScript + Vite) single-page application that consumes the ScrapeTok microservices platform. It centralises authentication, admin tooling, scraped account insights, and the questions/answers hub.

## ⚙️ Requirements

- Node.js 18+
- npm 9+
- Running backend services:
  - **Accounts service** (`microservicio1` – Spring Boot)
  - **Content service** (`microservicio2` – Node/Express)

## 🚀 Getting started

```powershell
cd cloud-front
npm install
```

Create a `.env` (or `.env.local`) file in `cloud-front/` with the service URLs that match your deployment:

```env
# Fallback used when a specific service URL is not provided
VITE_API_BASE_URL=http://localhost:8080

# Spring Boot accounts microservice (auth, profiles, upgrades)
VITE_ACCOUNTS_SERVICE_URL=http://localhost:8080

# Node/Express content microservice (questions, histories, scraped accounts)
VITE_CONTENT_SERVICE_URL=http://localhost:3000
```

If a variable is omitted, the app falls back to `VITE_API_BASE_URL`.

### Development server

```powershell
npm run dev
```

### Quality gates

- **Type-check & build:** `npm run build`
- **Lint (if configured):** `npm run lint`

## 🔌 Service integration highlights

- `Api` utility now exposes dedicated clients for `accounts` and `content`, automatically injecting `Authorization`, `x-user-id`, and `x-user-role` headers based on the authenticated session.
- QA flows consume the content service endpoints (`/questions`, `/questions/status/*`, `/questions/reply`). Pagination is handled client-side to keep the UI unchanged while microservice responses remain array based.
- Profile and admin panels aggregate information from both microservices, so keep both services available during development.

## 🧪 Testing tips

- Use the provided Postman collections under the repository root to validate microservice endpoints before pointing the frontend at them.
- Log out and back in after restarting the accounts service—JWTs are issued by microservicio1 and are required for content service calls.

## 🤝 Contributing

1. Fork / branch from `main`.
2. Implement the change, keeping components typed and side-effect free when possible.
3. Run `npm run build` to ensure the project compiles.
4. Open a PR describing the microservice endpoints impacted and any new environment variables.
