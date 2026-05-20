# C0 Backend — Django REST API

Django REST Framework backend for the C0 Net-Zero Protocol platform.

## Prerequisites

Ensure PostgreSQL is installed, running, and a database + user have been created:

```bash
# Fedora
sudo dnf install -y postgresql-server postgresql postgresql-devel
sudo postgresql-setup --initdb
sudo systemctl enable --now postgresql

# Create database and user
sudo -u postgres psql -c "CREATE USER c0_user WITH PASSWORD 'c0_pass';"
sudo -u postgres psql -c "CREATE DATABASE c0_db OWNER c0_user;"
sudo -u postgres psql -c "ALTER USER c0_user CREATEDB;"
```

> **Note:** If you get authentication errors, ensure `pg_hba.conf` uses `md5` auth instead of `ident`/`peer`, then restart PostgreSQL.

## Setup

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data          # Load sample marketplace data
python manage.py createsuperuser     # Create admin account for web GUI
python manage.py runserver
```

## Viewing the Database (Django Admin)

1. Start the server: `python manage.py runserver`
2. Open **http://127.0.0.1:8000/admin/** in your browser
3. Log in with the superuser credentials you created
4. Browse, search, filter, and edit all tables: Users, Carbon Projects, Credit Listings, and Transactions

## Apps

- **auth_app** — Custom user model (`C0User`), JWT authentication (login, register, profile)
- **marketplace** — Carbon credit listings, purchases, market trends
- **dashboard** — Aggregated platform statistics

## Configuration

Key settings in `c0/settings.py`:
- `AUTH_USER_MODEL = 'auth_app.C0User'`
- JWT tokens via `djangorestframework-simplejwt`
- CORS configured for Vite dev server (`localhost:5173`)
- PostgreSQL database (configurable via `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` env vars)
