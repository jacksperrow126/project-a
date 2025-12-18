"""
Database initialization script.
Run this once to create the database and tables.
"""
import os
import sys
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from app.database import Base, DATABASE_URL
from app.db_models import TaskDB, TransactionDB, AssetDB

load_dotenv()

def create_database_if_not_exists():
    """Create database if it doesn't exist"""
    try:
        import psycopg
    except ImportError:
        return False
    
    # Try to connect to postgres database
    db_url = DATABASE_URL.replace("life_organizer", "postgres")
    db_url = db_url.replace("postgresql+psycopg://", "postgresql://")
    
    # Try different connection methods
    connection_strings = [
        db_url,
        "postgresql://postgres@localhost:5432/postgres",
        f"postgresql://{os.getenv('USER', 'postgres')}@localhost:5432/postgres",
    ]
    
    for conn_str in connection_strings:
        try:
            conn = psycopg.connect(conn_str, autocommit=True)
            with conn.cursor() as cur:
                cur.execute("SELECT 1 FROM pg_database WHERE datname = 'life_organizer'")
                if not cur.fetchone():
                    print("Creating database 'life_organizer'...")
                    cur.execute('CREATE DATABASE life_organizer')
                    print("✓ Database created")
                else:
                    print("✓ Database already exists")
            conn.close()
            return True
        except Exception:
            continue
    
    return False

def init_database():
    """Initialize the database by creating all tables"""
    print("=" * 60)
    print("Initializing Valy Life Database")
    print("=" * 60)
    print()
    
    # Try to create database if it doesn't exist
    print("Step 1: Checking database...")
    if not create_database_if_not_exists():
        print("⚠️  Could not create database automatically")
        print("Database may already exist or needs manual creation")
    
    print(f"\nStep 2: Connecting to database...")
    print(f"URL: {DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else DATABASE_URL}")
    
    # Create engine
    engine = create_engine(DATABASE_URL)
    
    # Test connection
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print("✓ Database connection successful")
    except Exception as e:
        print(f"✗ Database connection failed: {e}")
        print("\nPlease ensure:")
        print("1. PostgreSQL is running")
        print("2. Database 'life_organizer' exists")
        print("3. Update DATABASE_URL in .env if needed")
        return False
    
    # Create all tables
    print("\nStep 3: Creating tables...")
    try:
        Base.metadata.create_all(bind=engine)
        print("✓ All tables created successfully")
        
        # Verify tables
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name;
            """))
            tables = [row[0] for row in result]
            print(f"\n✓ Created {len(tables)} table(s): {', '.join(tables)}")
        
        return True
    except Exception as e:
        print(f"✗ Failed to create tables: {e}")
        return False

if __name__ == "__main__":
    if init_database():
        print("\n" + "=" * 60)
        print("✅ Database initialization complete!")
        print("=" * 60)
        print("\nYou can now:")
        print("  - View database: python3 ../view_db.py")
        print("  - Use the website: http://localhost:3000")
        print("  - Check API: http://localhost:8000/docs")
    else:
        print("\n⚠️  Database initialization failed")
        sys.exit(1)
