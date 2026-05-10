# C0 — The Net-Zero Protocol

A full-stack carbon credit marketplace platform for transparent carbon offset trading, MRV (Measurement, Reporting & Verification) tracking, and real-time market analytics.

## Project Structure

```
C0 Project/
├── c0_frontend/        # React + Vite + TypeScript (port 5173)
│   ├── src/
│   │   ├── api/        # Axios API client with JWT auth
│   │   ├── context/    # React context (AuthContext)
│   │   ├── components/ # UI components
│   │   └── assets/     # Static assets
│   └── package.json
│
└── c0_backend/         # Django + DRF (port 8000)
    ├── c0/             # Django project settings
    ├── auth_app/       # User auth (JWT login, register, profile)
    ├── marketplace/    # Carbon credit listings & transactions
    ├── dashboard/      # Aggregate platform statistics
    ├── manage.py
    └── requirements.txt
```

## Quick Start

### Backend (Django)

```bash
cd c0_backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data      # Load sample data
python manage.py runserver      # → http://localhost:8000
```

### Frontend (React + Vite)

```bash
cd c0_frontend
npm install
npm run dev                     # → http://localhost:5173
```

## API Endpoints

| Method | Endpoint                          | Description                |
|--------|-----------------------------------|----------------------------|
| POST   | `/api/auth/register/`             | Create account             |
| POST   | `/api/auth/login/`                | Get JWT tokens             |
| GET    | `/api/auth/me/`                   | Current user profile       |
| POST   | `/api/auth/token/refresh/`        | Refresh access token       |
| GET    | `/api/marketplace/listings/`      | Browse credit listings     |
| GET    | `/api/marketplace/listings/:id/`  | Listing detail             |
| POST   | `/api/marketplace/buy/`           | Purchase credits           |
| GET    | `/api/marketplace/my-transactions/` | User's purchase history  |
| GET    | `/api/marketplace/trends/`        | Monthly price trends       |
| GET    | `/api/dashboard/stats/`           | Platform-wide statistics   |

## Demo Credentials

After running `seed_data`:
- **Seller:** `demo_seller` / `demo1234`
- **Buyer:** `demo_buyer` / `demo1234`

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Three.js, Framer Motion, Recharts
- **Backend:** Django 5.2, Django REST Framework, SimpleJWT
- **Database:** SQLite (dev) — easily swappable to PostgreSQL for production
