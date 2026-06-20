# Shopping Home

A personal grocery and retail price-tracking app. Record prices across stores, log purchases, compare where things are cheapest, and upload product photos — all in one place.

Built with Go + Next.js, runs locally via Docker.

---

## Features

- **Products** — catalog items with category, unit, and description; upload photos
- **Stores** — manage the stores you shop at
- **Price tracking** — record observed prices per store over time; see the cheapest store at a glance
- **Purchases** — log what you actually bought, at what price and quantity
- **Full CRUD** — create, edit, and delete everything directly from each page
- **Thai / English UI** — toggle language in the nav

---

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Go 1.25, Gin, GORM |
| Database | PostgreSQL 16 (Docker) |
| Frontend | Next.js 16 (App Router), Tailwind CSS v4 |
| Language | TypeScript |

---

## Getting started

### 1. Start the database

```bash
docker compose up -d
```

PostgreSQL will be available on `localhost:5432`. The database `wiki_shopping` is created automatically.

### 2. Run the backend

```bash
cd backend
go run ./cmd/server
```

The API starts on **http://localhost:8080**. Schema is auto-migrated on startup — no migration files needed.

> Copy `.env.example` to `.env` if you need to override any defaults (DB host, port, password, etc.).

### 3. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

The UI is available at **http://localhost:3000**.

---

## Project structure

```
Shopping-app/
├── backend/
│   ├── cmd/server/        # Entry point
│   ├── config/            # Env-var config loader
│   ├── internal/
│   │   ├── model/         # GORM structs (Product, Store, PriceEntry, Purchase, ProductImage)
│   │   ├── service/       # Business logic / DB queries
│   │   ├── handler/       # Gin HTTP handlers
│   │   ├── router/        # Route registration + CORS
│   │   └── db/            # DB connection + AutoMigrate
│   └── uploads/           # Uploaded product images (local filesystem)
├── frontend/
│   └── src/
│       ├── app/           # Next.js App Router pages
│       ├── components/    # Nav, Logo, locale provider
│       └── lib/           # API client, types, styles, i18n
└── docker-compose.yml
```

---

## API

Base URL: `http://localhost:8080/api/v1`

| Resource | Endpoints |
|---|---|
| Products | `GET /products` · `POST /products` · `GET /products/:id` · `PATCH /products/:id` · `DELETE /products/:id` |
| Stores | `GET /stores` · `POST /stores` · `PATCH /stores/:id` · `DELETE /stores/:id` |
| Prices | `POST /prices` · `PATCH /prices/:id` · `DELETE /prices/:id` |
| Purchases | `GET /purchases` · `POST /purchases` · `PATCH /purchases/:id` · `DELETE /purchases/:id` |
| Images | `POST /products/:id/images` · `DELETE /images/:id` |

Product images are served at `http://localhost:8080/uploads/<filename>`.
