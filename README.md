# Paxx

A secure and lightweight web-based password manager built with modern encryption standards. Designed with simplicity, speed, and privacy in mind.

## 🏗️ Architecture

This is a monorepo containing:

- **Frontend** (`/frontend`) - Next.js app deployed to Vercel
- **Backend** (`/backend`) - Bun + Elysia API deployed to Railway

## 🚀 Getting Started

### Prerequisites

- **Node.js 20+** (for frontend)
- **Bun 1.0+** (for backend)
- **PostgreSQL** (for production database)

### Frontend Setup

```bash
cd frontend
npm install
# or
bun install

# Create environment file
cp .env.example .env.local
# Edit .env.local and set NEXT_PUBLIC_API_URL

# Run development server
npm run dev
```

Frontend will run at `http://localhost:3000`

### Backend Setup

```bash
cd backend
bun install

# Create environment file
cp .env.example .env
# Edit .env and set required variables (FRONTEND_URL, DATABASE_URL, etc.)

# Run development server
bun run dev
```

Backend will run at `http://localhost:3001`

## 📦 Project Structure

```
paxx/
├── frontend/              # Next.js frontend
│   ├── app/              # Next.js app directory
│   ├── lib/              # Utilities and API client
│   │   └── api-client.ts # Type-safe backend client
│   ├── public/           # Static assets
│   └── package.json
│
├── backend/              # Bun + Elysia backend
│   ├── src/
│   │   ├── index.ts      # Server entry point
│   │   └── routes/       # API routes
│   │       ├── auth.ts   # Authentication routes
│   │       └── vault.ts  # Password vault routes
│   └── package.json
│
├── railway.toml          # Railway deployment config
└── README.md
```

## 🌐 Deployment

### Frontend (Vercel)

1. Push your code to GitHub
2. Import project in Vercel
3. Set Root Directory to `frontend`
4. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = your Railway backend URL
5. Deploy!

### Backend (Railway)

1. Connect your GitHub repo to Railway
2. Railway will automatically use `railway.toml` configuration
3. Add environment variables in Railway dashboard:
   - `FRONTEND_URL` = your Vercel frontend URL
   - `DATABASE_URL` = your PostgreSQL connection string
   - `ENCRYPTION_KEY` = generate with `openssl rand -base64 32`
   - `JWT_SECRET` = your JWT secret
   - `PORT` = 3001 (or Railway's default)
4. Deploy!

## 🔒 Security Features

- End-to-end encryption for stored passwords
- Master password never leaves the client
- Secure JWT authentication
- CORS protection
- Environment-based configuration

## 🛠️ Tech Stack

**Frontend:**
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS

**Backend:**
- Bun runtime
- Elysia framework
- TypeScript
- PostgreSQL (production)

## 📝 Environment Variables

See `.env.example` files in each directory for required environment variables.

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome!

## 📄 License

Private project - All rights reserved
