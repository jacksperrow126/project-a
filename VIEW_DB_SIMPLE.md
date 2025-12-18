# Quick Guide: View Your Database

## PostgreSQL is Installed! ✅

Since psql is installed, here's how to view your database:

## Step 1: Create Database (if not exists)

You'll need to enter your PostgreSQL password when prompted:

```bash
psql -h localhost -U postgres
```

Then in psql:
```sql
CREATE DATABASE life_organizer;
\q
```

Or use the setup script:
```bash
./setup_db.sh
```

## Step 2: Initialize Tables

```bash
cd python_server
source venv/bin/activate
python init_db.py
```

## Step 3: View Database

### Option A: Using psql
```bash
psql -h localhost -U postgres -d life_organizer
```

Then run SQL queries:
```sql
-- List all tables
\dt

-- View transactions
SELECT * FROM transactions;

-- View assets
SELECT * FROM assets;

-- View tasks
SELECT * FROM tasks;

-- Count records
SELECT 
    (SELECT COUNT(*) FROM transactions) as transactions,
    (SELECT COUNT(*) FROM assets) as assets,
    (SELECT COUNT(*) FROM tasks) as tasks;
```

### Option B: Using Python Script
```bash
python3 view_db.py
```

### Option C: Using API
```bash
curl http://localhost:8000/api/transactions | python3 -m json.tool
curl http://localhost:8000/api/assets | python3 -m json.tool
```

### Option D: Using Browser
Open: http://localhost:8000/docs

## Quick Commands

```bash
# Setup database (first time)
./setup_db.sh

# View database
python3 view_db.py

# Connect to database
psql -h localhost -U postgres -d life_organizer

# Check status
./check_status.sh
```

## Note About Password

If you don't know your PostgreSQL password, you can:
1. Reset it: `psql -h localhost -U postgres -c "ALTER USER postgres PASSWORD 'newpassword';"`
2. Or use your macOS user account: `psql -h localhost -U $(whoami) -d postgres`

