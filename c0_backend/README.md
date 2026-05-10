# C0 Backend — Django REST API

Django REST Framework backend for the C0 Net-Zero Protocol platform.

## Setup

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data
python manage.py runserver
```

## Apps

- **auth_app** — Custom user model, JWT authentication (login, register, profile)
- **marketplace** — Carbon credit listings, purchases, market trends
- **dashboard** — Aggregated platform statistics

## Configuration

Key settings in `c0/settings.py`:
- `AUTH_USER_MODEL = 'auth_app.C0User'`
- JWT tokens via `djangorestframework-simplejwt`
- CORS configured for Vite dev server (`localhost:5173`)
- SQLite for development (swap to PostgreSQL via `DATABASES` setting)
