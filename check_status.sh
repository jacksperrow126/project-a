#!/bin/bash

echo "=== Valy Life Status Check ==="
echo ""

# Check Python Server
echo "📡 Python Server Status:"
if lsof -ti:8000 > /dev/null 2>&1; then
    echo "  ✓ Server is RUNNING on port 8000"
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        HEALTH=$(curl -s http://localhost:8000/health | python3 -m json.tool 2>/dev/null | grep -o '"status": "[^"]*"' | cut -d'"' -f4)
        echo "  ✓ Health check: $HEALTH"
    else
        echo "  ⚠️  Server running but not responding to health check"
    fi
    
    # Check API endpoints
    echo ""
    echo "  API Endpoints:"
    if curl -s http://localhost:8000/api/transactions > /dev/null 2>&1; then
        echo "    ✓ /api/transactions - Working"
    else
        echo "    ✗ /api/transactions - Not working"
    fi
    
    if curl -s http://localhost:8000/api/assets > /dev/null 2>&1; then
        echo "    ✓ /api/assets - Working"
    else
        echo "    ✗ /api/assets - Not working"
    fi
else
    echo "  ✗ Server is NOT running on port 8000"
    echo "  To start: cd python_server && source venv/bin/activate && python main.py"
fi

echo ""
echo "🗄️  PostgreSQL Database Status:"

# Check if PostgreSQL is running
if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "  ✓ PostgreSQL is RUNNING on port 5432"
    
    # Try to connect and check database
    if psql -h localhost -U postgres -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw "life_organizer"; then
        echo "  ✓ Database 'life_organizer' EXISTS"
        
        # Check if tables exist
        TABLE_COUNT=$(psql -h localhost -U postgres -d life_organizer -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | xargs)
        if [ ! -z "$TABLE_COUNT" ] && [ "$TABLE_COUNT" != "0" ]; then
            echo "  ✓ Database has $TABLE_COUNT table(s)"
        else
            echo "  ⚠️  Database exists but has no tables"
            echo "     Run: cd python_server && python init_db.py"
        fi
    else
        echo "  ⚠️  Database 'life_organizer' does NOT exist"
        echo "     Create it: psql -U postgres -c 'CREATE DATABASE life_organizer;'"
    fi
else
    echo "  ✗ PostgreSQL is NOT running"
    echo "  To start PostgreSQL:"
    echo "    macOS: brew services start postgresql@14"
    echo "    Linux: sudo systemctl start postgresql"
fi

echo ""
echo "🌐 Next.js Website Status:"
if lsof -ti:3000 > /dev/null 2>&1; then
    echo "  ✓ Website is RUNNING on port 3000"
    echo "  URL: http://localhost:3000"
else
    echo "  ✗ Website is NOT running on port 3000"
    echo "  To start: cd nextjs_website && npm run dev"
fi

echo ""
echo "=== Quick Test ==="
echo "Testing API connection..."
if curl -s http://localhost:8000/api/transactions > /dev/null 2>&1; then
    TRANS_COUNT=$(curl -s http://localhost:8000/api/transactions | python3 -c "import sys, json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "?")
    echo "  ✓ API is accessible (found $TRANS_COUNT transactions)"
else
    echo "  ✗ API is not accessible"
fi

