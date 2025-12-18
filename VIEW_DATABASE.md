# How to View the Database

## Option 1: View via API (Currently Working)

Since the database isn't set up yet, you can view data through the API:

```bash
# View all transactions
curl http://localhost:8000/api/transactions | python3 -m json.tool

# View all assets
curl http://localhost:8000/api/assets | python3 -m json.tool

# View transaction totals
curl http://localhost:8000/api/transactions/summary/totals | python3 -m json.tool

# View asset totals
curl http://localhost:8000/api/assets/summary/totals | python3 -m json.tool
```

Or use the Python script:
```bash
python3 view_db.py
```

## Option 2: View via PostgreSQL (After Setup)

### Step 1: Install PostgreSQL (if not installed)

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Step 2: Create Database

```bash
psql -U postgres
CREATE DATABASE life_organizer;
\q
```

### Step 3: Initialize Tables

```bash
cd python_server
source venv/bin/activate
python init_db.py
```

### Step 4: View Database

**Using psql command line:**
```bash
psql -U postgres -d life_organizer
```

Then run SQL queries:
```sql
-- List all tables
\dt

-- View all transactions
SELECT * FROM transactions;

-- View all assets
SELECT * FROM assets;

-- View all tasks
SELECT * FROM tasks;

-- Count records
SELECT 
    (SELECT COUNT(*) FROM transactions) as transactions,
    (SELECT COUNT(*) FROM assets) as assets,
    (SELECT COUNT(*) FROM tasks) as tasks;
```

**Using the Python script:**
```bash
python3 view_db.py
```

**Using a GUI tool:**
- **pgAdmin** (https://www.pgadmin.org/)
- **DBeaver** (https://dbeaver.io/)
- **TablePlus** (macOS: https://tableplus.com/)

## Option 3: View in Browser

Open the API documentation:
```
http://localhost:8000/docs
```

You can test all endpoints and see the data directly in the browser.

## Quick Commands

```bash
# View database (Python script)
python3 view_db.py

# View via API
curl http://localhost:8000/api/transactions | python3 -m json.tool

# Connect to PostgreSQL
psql -U postgres -d life_organizer

# Check database status
./check_status.sh
```

