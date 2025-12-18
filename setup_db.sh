#!/bin/bash

echo "=== Setting up Valy Life Database ==="
echo ""

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "❌ PostgreSQL is not running!"
    echo "Start it with: brew services start postgresql@14"
    exit 1
fi

echo "✓ PostgreSQL is running"
echo ""

# Check if database exists
DB_EXISTS=$(psql -h localhost -U postgres -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw "life_organizer" && echo "yes" || echo "no")

if [ "$DB_EXISTS" = "no" ]; then
    echo "Creating database 'life_organizer'..."
    echo "You may be prompted for the PostgreSQL password"
    psql -h localhost -U postgres -c "CREATE DATABASE life_organizer;" 2>&1
    
    if [ $? -eq 0 ]; then
        echo "✓ Database created successfully"
    else
        echo "❌ Failed to create database"
        echo "You may need to run manually:"
        echo "  psql -h localhost -U postgres"
        echo "  CREATE DATABASE life_organizer;"
        exit 1
    fi
else
    echo "✓ Database 'life_organizer' already exists"
fi

echo ""
echo "Initializing database tables..."
cd python_server
source venv/bin/activate
python init_db.py

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Database setup complete!"
    echo ""
    echo "You can now view the database with:"
    echo "  python3 view_db.py"
    echo "  psql -h localhost -U postgres -d life_organizer"
else
    echo ""
    echo "⚠️  Database tables may not have been created"
    echo "Check the error messages above"
fi

