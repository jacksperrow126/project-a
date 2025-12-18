#!/usr/bin/env python3
"""
Interactive Database Setup Script for Valy Life
"""
import subprocess
import sys
import os

def run_command(cmd, check=True):
    """Run a shell command and return the result"""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        if check and result.returncode != 0:
            print(f"Error: {result.stderr}")
            return False, result.stderr
        return True, result.stdout
    except Exception as e:
        return False, str(e)

def check_postgresql():
    """Check if PostgreSQL is running"""
    print("🔍 Checking PostgreSQL status...")
    success, output = run_command("pg_isready -h localhost -p 5432", check=False)
    if success and "accepting connections" in output:
        print("✓ PostgreSQL is running")
        return True
    else:
        print("❌ PostgreSQL is not running")
        print("Please start PostgreSQL first:")
        print("  macOS: brew services start postgresql@14")
        print("  Linux: sudo systemctl start postgresql")
        return False

def check_database_exists():
    """Check if database exists"""
    print("\n🔍 Checking if database exists...")
    
    # Try with postgres user
    success, output = run_command("psql -h localhost -U postgres -lqt 2>&1", check=False)
    if success and "life_organizer" in output:
        print("✓ Database 'life_organizer' exists")
        return True
    
    # Try with current user
    username = os.getenv('USER', 'postgres')
    success, output = run_command(f"psql -h localhost -U {username} -lqt 2>&1", check=False)
    if success and "life_organizer" in output:
        print("✓ Database 'life_organizer' exists")
        return True
    
    print("Database 'life_organizer' does not exist")
    return False

def create_database():
    """Create the database"""
    print("\n📦 Creating database 'life_organizer'...")
    
    # Try with postgres user first
    print("Attempting to create database (you may be prompted for password)...")
    success, output = run_command("psql -h localhost -U postgres -c 'CREATE DATABASE life_organizer;' 2>&1", check=False)
    
    if success and "CREATE DATABASE" in output:
        print("✓ Database created successfully")
        return True
    
    # Try with current user
    username = os.getenv('USER', 'postgres')
    print(f"Trying with user '{username}'...")
    success, output = run_command(f"psql -h localhost -U {username} -c 'CREATE DATABASE life_organizer;' 2>&1", check=False)
    
    if success and "CREATE DATABASE" in output:
        print("✓ Database created successfully")
        return True
    
    # If both fail, provide manual instructions
    print("❌ Could not create database automatically")
    print("\nPlease create it manually:")
    print("  psql -h localhost -U postgres")
    print("  CREATE DATABASE life_organizer;")
    print("  \\q")
    return False

def initialize_tables():
    """Initialize database tables"""
    print("\n📋 Initializing database tables...")
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    python_server_dir = os.path.join(script_dir, 'python_server')
    init_script = os.path.join(python_server_dir, 'init_db.py')
    
    if not os.path.exists(init_script):
        print(f"❌ init_db.py not found at {init_script}")
        return False
    
    # Change to python_server directory
    os.chdir(python_server_dir)
    
    # Activate venv and run init script
    venv_python = os.path.join(python_server_dir, 'venv', 'bin', 'python')
    if os.path.exists(venv_python):
        cmd = f"{venv_python} init_db.py"
    else:
        cmd = f"python3 init_db.py"
    
    success, output = run_command(cmd, check=False)
    
    if success:
        print("✓ Database tables initialized")
        return True
    else:
        print(f"⚠️  Error initializing tables: {output}")
        print("You can try manually:")
        print(f"  cd {python_server_dir}")
        print("  source venv/bin/activate")
        print("  python init_db.py")
        return False

def verify_setup():
    """Verify the database setup"""
    print("\n✅ Verifying setup...")
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    python_server_dir = os.path.join(script_dir, 'python_server')
    sys.path.insert(0, python_server_dir)
    
    try:
        from app.database import SessionLocal, engine
        from app.db_models import TaskDB, TransactionDB, AssetDB
        from sqlalchemy import text
        
        # Test connection
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print("✓ Database connection successful")
        
        # Check tables
        db = SessionLocal()
        try:
            # Try to query each table
            task_count = db.query(TaskDB).count()
            trans_count = db.query(TransactionDB).count()
            asset_count = db.query(AssetDB).count()
            
            print(f"✓ Tables exist:")
            print(f"  - tasks: {task_count} records")
            print(f"  - transactions: {trans_count} records")
            print(f"  - assets: {asset_count} records")
            
            return True
        except Exception as e:
            print(f"⚠️  Tables may not exist: {e}")
            return False
        finally:
            db.close()
            
    except Exception as e:
        print(f"❌ Verification failed: {e}")
        return False

def main():
    print("=" * 60)
    print("Valy Life Database Setup")
    print("=" * 60)
    print()
    
    # Step 1: Check PostgreSQL
    if not check_postgresql():
        sys.exit(1)
    
    # Step 2: Check or create database
    if not check_database_exists():
        if not create_database():
            print("\n⚠️  Please create the database manually and run this script again")
            sys.exit(1)
    
    # Step 3: Initialize tables
    if not initialize_tables():
        print("\n⚠️  Tables may not have been created. Check errors above.")
    
    # Step 4: Verify
    if verify_setup():
        print("\n" + "=" * 60)
        print("✅ Database setup complete!")
        print("=" * 60)
        print("\nYou can now:")
        print("  - View database: python3 view_db.py")
        print("  - Use the website: http://localhost:3000")
        print("  - Check API: http://localhost:8000/docs")
    else:
        print("\n⚠️  Setup completed but verification failed")
        print("Check the errors above and try again")

if __name__ == "__main__":
    main()

