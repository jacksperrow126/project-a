# How to Check Server and Database Status

## Quick Status Check

Run the status check script:
```bash
./check_status.sh
```

## Manual Checks

### Check Python Server

1. **Check if server is running:**
   ```bash
   lsof -ti:8000
   ```
   If it returns a process ID, the server is running.

2. **Test server health:**
   ```bash
   curl http://localhost:8000/health
   ```
   Should return: `{"status":"healthy"}`

3. **Test API endpoints:**
   ```bash
   curl http://localhost:8000/api/transactions
   curl http://localhost:8000/api/assets
   ```

4. **View API documentation:**
   Open in browser: http://localhost:8000/docs

### Check PostgreSQL Database

1. **Check if PostgreSQL is running:**
   ```bash
   pg_isready -h localhost -p 5432
   ```
   Should return: `localhost:5432 - accepting connections`

2. **Check if database exists:**
   ```bash
   psql -U postgres -l | grep life_organizer
   ```

3. **Connect to database:**
   ```bash
   psql -U postgres -d life_organizer
   ```

4. **Check tables:**
   ```sql
   \dt
   ```
   Should show: `tasks`, `transactions`, `assets`

### Check Next.js Website

1. **Check if website is running:**
   ```bash
   lsof -ti:3000
   ```

2. **Open in browser:**
   http://localhost:3000

## Start Services

### Start Python Server
```bash
cd python_server
source venv/bin/activate
python main.py
```

### Start PostgreSQL (macOS)
```bash
brew services start postgresql@14
```

### Start PostgreSQL (Linux)
```bash
sudo systemctl start postgresql
```

### Create Database
```bash
psql -U postgres
CREATE DATABASE life_organizer;
\q
```

### Initialize Database Tables
```bash
cd python_server
source venv/bin/activate
python init_db.py
```

### Start Next.js Website
```bash
cd nextjs_website
npm run dev
```

## Troubleshooting

### Server not starting
- Check if port 8000 is already in use: `lsof -ti:8000`
- Kill existing process: `lsof -ti:8000 | xargs kill -9`
- Check for errors in logs

### Database connection errors
- Verify PostgreSQL is running: `pg_isready`
- Check database exists: `psql -U postgres -l`
- Verify connection string in `.env` file
- Check PostgreSQL credentials

### API returning errors
- Check server logs
- Verify database tables exist
- Test endpoints with curl
- Check CORS settings

