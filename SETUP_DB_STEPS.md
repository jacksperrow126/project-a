# Database Setup - Step by Step

## Current Status
✅ PostgreSQL is running
❌ Database 'life_organizer' needs to be created

## Step 1: Create the Database

Open a terminal and run:

```bash
psql -h localhost -U postgres
```

You'll be prompted for the PostgreSQL password. Enter it, then run:

```sql
CREATE DATABASE life_organizer;
\q
```

**Alternative:** If you don't know the postgres password, try using your macOS username:
```bash
psql -h localhost -U annguyen -d postgres
```

Then create the database:
```sql
CREATE DATABASE life_organizer;
\q
```

## Step 2: Initialize Tables

After creating the database, run:

```bash
cd python_server
source venv/bin/activate
python init_db.py
```

This will create all the necessary tables (tasks, transactions, assets).

## Step 3: Verify Setup

Check if everything is working:

```bash
python3 view_db.py
```

Or test the API:
```bash
curl http://localhost:8000/api/transactions
```

## Troubleshooting

### If you don't know the PostgreSQL password:

1. **Reset the password:**
   ```bash
   psql -h localhost -U postgres
   # Then in psql:
   ALTER USER postgres PASSWORD 'newpassword';
   ```

2. **Or use your macOS user:**
   ```bash
   psql -h localhost -U annguyen -d postgres
   ```

3. **Or check if there's a .pgpass file:**
   ```bash
   cat ~/.pgpass
   ```

### If connection fails:

Check PostgreSQL is running:
```bash
pg_isready -h localhost -p 5432
```

Start PostgreSQL if needed:
```bash
brew services start postgresql@14
```

