#!/bin/bash

echo "=== Viewing Valy Life Database ==="
echo ""

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "❌ PostgreSQL is not running!"
    echo "Start it with: brew services start postgresql@14"
    exit 1
fi

# Check if database exists
if ! psql -U postgres -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw "life_organizer"; then
    echo "❌ Database 'life_organizer' does not exist!"
    echo "Create it with: psql -U postgres -c 'CREATE DATABASE life_organizer;'"
    exit 1
fi

echo "📊 Database: life_organizer"
echo ""

# Show tables
echo "📋 Tables in database:"
psql -U postgres -d life_organizer -c "\dt" 2>/dev/null || echo "  No tables found"

echo ""
echo "📈 Data Summary:"

# Count records in each table
echo ""
echo "Transactions:"
TRANS_COUNT=$(psql -U postgres -d life_organizer -t -c "SELECT COUNT(*) FROM transactions;" 2>/dev/null | xargs)
if [ ! -z "$TRANS_COUNT" ]; then
    echo "  Total: $TRANS_COUNT records"
    if [ "$TRANS_COUNT" != "0" ]; then
        echo "  Recent transactions:"
        psql -U postgres -d life_organizer -c "SELECT id, type, description, amount, date FROM transactions ORDER BY date DESC LIMIT 5;" 2>/dev/null
    fi
else
    echo "  Table doesn't exist yet"
fi

echo ""
echo "Assets:"
ASSET_COUNT=$(psql -U postgres -d life_organizer -t -c "SELECT COUNT(*) FROM assets;" 2>/dev/null | xargs)
if [ ! -z "$ASSET_COUNT" ]; then
    echo "  Total: $ASSET_COUNT records"
    if [ "$ASSET_COUNT" != "0" ]; then
        echo "  Recent assets:"
        psql -U postgres -d life_organizer -c "SELECT id, type, name, value, currency FROM assets ORDER BY date DESC LIMIT 5;" 2>/dev/null
    fi
else
    echo "  Table doesn't exist yet"
fi

echo ""
echo "Tasks:"
TASK_COUNT=$(psql -U postgres -d life_organizer -t -c "SELECT COUNT(*) FROM tasks;" 2>/dev/null | xargs)
if [ ! -z "$TASK_COUNT" ]; then
    echo "  Total: $TASK_COUNT records"
    if [ "$TASK_COUNT" != "0" ]; then
        echo "  Recent tasks:"
        psql -U postgres -d life_organizer -c "SELECT id, title, completed, created_at FROM tasks ORDER BY created_at DESC LIMIT 5;" 2>/dev/null
    fi
else
    echo "  Table doesn't exist yet"
fi

echo ""
echo "💡 To view full data, run:"
echo "   psql -U postgres -d life_organizer"
echo ""
echo "   Then use SQL commands:"
echo "   SELECT * FROM transactions;"
echo "   SELECT * FROM assets;"
echo "   SELECT * FROM tasks;"

