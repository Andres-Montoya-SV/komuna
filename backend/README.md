# Exposure Monitor Backend (MVP)

Defensive SaaS backend for authorization-gated inventory and drift monitoring (certificate transparency-derived subdomains, TLS certificate validity, passive DNS fingerprints, read-only bucket presence/listing probes).

Security posture:
- Executes checks only against organizations you create and domains you register.
- Verification uses DNS TXT at `_exposure-monitor.<registered-domain>` before scans are queued.
- No exploitation, brute force, uploads, deletes, destructive writes against third-party infra, credential testing, or auth bypass tooling.

Stack
- FastAPI / Pydantic v2 settings
- SQLAlchemy 2.x + PostgreSQL (`psycopg2-binary`)
- Alembic migrations
- Firebase Admin SDK verifies ID tokens (**authentication only**) — memberships and policy live in Postgres
- APScheduler drains queued scans in-process (MVP; replace with a dedicated worker/service later once scale demands)

## Quickstart

1. **Start Postgres**:

```bash
cd backend
docker compose up -d
```

2. **Python deps + env**:

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

3. **Run migrations**:

```bash
alembic upgrade head
```

4. **Run API**:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

`/health` is anonymous. Authenticated endpoints require:

`Authorization: Bearer <Firebase ID token>`

5. **Tests**:

```bash
pytest
```

### Firebase bootstrap

Populate `FIREBASE_CREDENTIALS_PATH` pointing at a Firebase service account JSON (local dev recommended). Audience allow-listing (`FIREBASE_ALLOWED_AUDIENCES`) is optional; leave empty unless you intentionally hard-pin acceptable OAuth audiences.

---

## Operational notes / TODOs intentionally deferred

- **Rate limiting & API keys** belong on the edge/API gateway layer (later).
- Replace in-process scanning with bounded worker pools/task queues once scan volume warrants it (`APScheduler` is intentionally MVP-sized).
- Harden concurrency with `SKIP LOCKED` row locks if you run multiple schedulers/processes concurrently.
