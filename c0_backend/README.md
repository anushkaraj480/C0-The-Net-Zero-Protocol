# C0 Net-Zero Protocol — Backend

> Django REST API powering the C0 carbon credit marketplace platform.

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Django 4.2 + Django REST Framework |
| **Database** | PostgreSQL 15 (Alpine) |
| **Auth** | JWT via `djangorestframework-simplejwt` |
| **Async Tasks** | Celery + Redis 7 |
| **IoT Ingestion** | Eclipse Mosquitto (MQTT Broker) |
| **Containerization** | Docker Compose |
| **Static Files** | WhiteNoise |

---

## 📁 Project Structure

```
c0_backend/
├── config/                  # Django project settings
│   ├── settings.py          # Main configuration
│   ├── urls.py              # Root URL routing
│   ├── celery.py            # Celery app config
│   └── wsgi.py              # WSGI entry point
│
├── apps/
│   ├── accounts/            # Custom User model, JWT auth, roles
│   ├── registry/            # FarmerProfile, LandParcel
│   ├── sensors/             # SensorDevice, SensorReading, MQTT
│   ├── mrv/                 # MRV Projects & Calculations (VM0042)
│   ├── aggregation/         # AggregationGroup, Allocation
│   ├── credits/             # CarbonCreditCertificate (hash-chained)
│   └── marketplace/         # CreditListing, CreditTransaction, Trends
│
├── scripts/
│   ├── simulate_sensors.py  # Dataset-driven sensor simulation
│   └── mosquitto.conf       # MQTT broker configuration
│
├── docker-compose.yml       # Full local stack (6 services)
├── Dockerfile               # Python 3.11 slim image
├── requirements.txt         # Python dependencies
├── manage.py                # Django CLI
└── .env.example             # Environment variable template
```

---

## 🚀 Quick Start

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) & Docker Compose

### Setup

```bash
# 1. Navigate to backend
cd c0_backend

# 2. Copy environment file
cp .env.example .env        # edit SECRET_KEY at minimum

# 3. Start all services (PostgreSQL, Redis, MQTT, Django, Celery, Celery Beat)
docker compose up --build -d

# 4. Generate & apply database migrations
docker compose exec web python manage.py makemigrations accounts registry sensors mrv aggregation credits marketplace
docker compose exec web python manage.py migrate

# 5. Create an admin superuser
docker compose exec web python manage.py createsuperuser --noinput --username admin --email admin@example.com
docker compose exec web python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); u = User.objects.get(username='admin'); u.set_password('admin123'); u.save()"

# 6. Seed the marketplace with demo data
docker compose exec web python manage.py seed_marketplace
```

The API will be available at **http://localhost:8000/**

---

## 🐳 Docker Services

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| `db` | `postgres:15-alpine` | `5432` | PostgreSQL database |
| `redis` | `redis:7-alpine` | `6379` | Celery broker & result backend |
| `mqtt` | `eclipse-mosquitto:2.0` | `1883` | MQTT broker for IoT sensors |
| `web` | Custom (Dockerfile) | `8000` | Django REST API |
| `celery` | Custom (Dockerfile) | — | Async task worker |
| `celery-beat` | Custom (Dockerfile) | — | Periodic task scheduler |

---

## 🔑 Authentication

The API uses **JWT (JSON Web Tokens)** for authentication. Tokens include the user's `role` and `email` in the payload for frontend convenience.

### User Roles

| Role | Value | Description |
|------|-------|-------------|
| Farmer | `farmer` | Land owners who generate credits |
| NGO | `ngo` | Non-profit organizations |
| Agro Firm | `agro_firm` | Agricultural companies |
| Industrial Buyer | `industrial_buyer` | Companies purchasing credits |
| Verifier | `verifier` | Third-party verification agents |
| Admin | `admin` | Platform administrators |

---

## 📡 API Endpoints

### Auth (`/api/auth/`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/register/` | Register new user | Public |
| `POST` | `/api/auth/login/` | JWT login (returns access + refresh tokens) | Public |
| `POST` | `/api/auth/token/refresh/` | Refresh access token | Public |
| `GET` | `/api/auth/me/` | Current user profile | JWT |
| `PUT` | `/api/auth/me/` | Update user profile | JWT |

### Dashboard (`/api/dashboard/`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/dashboard/stats/` | Aggregate platform statistics | Public |

**Response:**
```json
{
  "total_sequestered_tco2e": 12163.5,
  "total_hectares": 500.0,
  "active_listings": 7,
  "total_credits_available": 105950.0,
  "total_transactions": 0,
  "active_projects": 1,
  "active_sensors": 0
}
```

### Marketplace (`/api/marketplace/`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/marketplace/listings/` | Browse all active listings | Public |
| `POST` | `/api/marketplace/listings/` | Create a new listing | JWT |
| `GET` | `/api/marketplace/listings/<id>/` | Listing detail | Public |
| `POST` | `/api/marketplace/buy/` | Purchase credits from a listing | JWT |
| `GET` | `/api/marketplace/my-transactions/` | Buyer's purchase history | JWT |
| `GET` | `/api/marketplace/trends/` | Price trend data (grouped by month) | Public |

**Filters supported on `/api/marketplace/listings/`:**
- `?project_type=forestry` — Filter by type
- `?standard=vm0042` — Filter by verification standard
- `?search=Punjab` — Search project name or location
- `?ordering=price_per_credit` — Sort results

### Core Modules

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET/POST` | `/api/farmers/` | Farmer profiles & land parcels | JWT |
| `GET/POST` | `/api/sensors/` | Sensor devices & readings | JWT |
| `GET/POST` | `/api/mrv/` | MRV projects & calculations | JWT |
| `GET/POST` | `/api/aggregation/` | Aggregation groups | JWT |
| `GET/POST` | `/api/credits/` | Carbon credit certificates | JWT |

---

## 🗄️ Database Access

### Django Admin Panel
Visit **http://localhost:8000/admin/** and log in with your superuser credentials.

### Direct PostgreSQL Access
```bash
docker compose exec db psql -U c0_user -d c0_db
```

**Useful psql commands:**
| Command | Description |
|---------|-------------|
| `\dt` | List all tables |
| `\d <table_name>` | Describe a table's columns |
| `SELECT * FROM accounts_user;` | View all users |
| `SELECT * FROM marketplace_creditlisting;` | View all listings |
| `\q` | Exit psql |

**Connection details (for GUI tools like DBeaver/pgAdmin):**
| Field | Value |
|-------|-------|
| Host | `localhost` |
| Port | `5432` |
| Database | `c0_db` |
| User | `c0_user` |
| Password | `c0_pass` |

---

## 🔗 Hash Chain Verification

Every `CarbonCreditCertificate` has a tamper-evident hash chain:

```
record_hash = SHA-256(ccc_id | mrv_id | quantity | date | prev_hash)
```

To verify integrity:
```python
from apps.credits.models import CarbonCreditCertificate
for ccc in CarbonCreditCertificate.objects.all():
    assert ccc.verify_chain(), f"TAMPERED: {ccc.ccc_id}"
```

---

## 🌡️ IoT Sensor Simulation

For development without physical hardware, use the dataset simulator:

```bash
# CSV format: timestamp, parcel_id, sensor_type, value, unit
python scripts/simulate_sensors.py --file datasets/sample.csv --speed 10
```

**Recommended datasets:**
- **ISRIC SoilGrids** → SOC values for Indian farmland
- **ICRISAT Village Dynamics** → Indian farm patterns
- **FAO GHG data** → N₂O, CH₄ emission factors

---

## ⚙️ Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SECRET_KEY` | — | Django secret key (**required**) |
| `DEBUG` | `False` | Debug mode |
| `ALLOWED_HOSTS` | `localhost` | Comma-separated allowed hosts |
| `DATABASE_URL` | — | PostgreSQL connection string |
| `CELERY_BROKER_URL` | — | Redis URL for Celery |
| `CELERY_RESULT_BACKEND` | — | Redis URL for task results |
| `MQTT_BROKER_HOST` | `localhost` | MQTT broker hostname |
| `MQTT_BROKER_PORT` | `1883` | MQTT broker port |
| `MQTT_TOPIC_PREFIX` | `c0/farm` | MQTT topic prefix |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | Frontend origin for CORS |
| `ACCESS_TOKEN_LIFETIME_MINUTES` | `60` | JWT access token TTL |
| `REFRESH_TOKEN_LIFETIME_DAYS` | `7` | JWT refresh token TTL |

---

## 🛑 Stopping Services

```bash
# Stop all containers
docker compose down

# Stop and remove all data (including database)
docker compose down -v
```

---

## 📄 License

This project is part of the C0 Net-Zero Protocol.
