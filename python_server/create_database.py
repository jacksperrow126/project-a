#!/usr/bin/env python3
"""
Create the database if it doesn't exist
"""
import psycopg
import sys
import os
from dotenv import load_dotenv

load_dotenv()

def create_database():
    """Create the database if it doesn't exist"""
    # Try to connect to postgres database first
    db_url = os.getenv(
        "POSTGRES_URL",
        "postgresql://postgres:postgres@localhost:5432/postgres"
    )
    
    # Try different connection strings
    connection_strings = [
        db_url,
        "postgresql://postgres@localhost:5432/postgres",
        f"postgresql://{os.getenv('USER', 'postgres')}@localhost:5432/postgres",
    ]
    
    conn = None
    for conn_str in connection_strings:
        try:
            print(f"Trying to connect with: {conn_str.split('@')[0]}@...")
            conn = psycopg.connect(conn_str, autocommit=True)
            print("✓ Connected to PostgreSQL")
            break
        except Exception as e:
            print(f"  Failed: {str(e)[:50]}")
            continue
    
    if not conn:
        print("\n❌ Could not connect to PostgreSQL")
        print("Please create the database manually:")
        print("  psql -h localhost -U postgres")
        print("  CREATE DATABASE life_organizer;")
        return False
    
    try:
        # Check if database exists
        with conn.cursor() as cur:
            cur.execute("SELECT 1 FROM pg_database WHERE datname = 'life_organizer'")
            exists = cur.fetchone()
            
            if exists:
                print("✓ Database 'life_organizer' already exists")
                return True
            
            # Create database
            print("Creating database 'life_organizer'...")
            cur.execute('CREATE DATABASE life_organizer')
            print("✓ Database 'life_organizer' created successfully")
            return True
            
    except Exception as e:
        print(f"❌ Error creating database: {e}")
        return False
    finally:
        conn.close()

if __name__ == "__main__":
    print("=" * 60)
    print("Creating Valy Life Database")
    print("=" * 60)
    print()
    
    if create_database():
        print("\n✅ Database setup complete!")
        print("\nNext step: Run 'python init_db.py' to create tables")
    else:
        print("\n⚠️  Could not create database automatically")
        sys.exit(1)

