#!/usr/bin/env python3
"""
View Valy Life Database Contents
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'python_server'))

try:
    from app.database import SessionLocal, engine
    from app.db_models import TaskDB, TransactionDB, AssetDB
    from sqlalchemy import text
except ImportError as e:
    print(f"Error importing modules: {e}")
    print("Make sure you're running from the project root directory")
    sys.exit(1)

def check_connection():
    """Check if database connection works"""
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            return True
    except Exception as e:
        print(f"❌ Cannot connect to database: {e}")
        print("\nMake sure:")
        print("1. PostgreSQL is running")
        print("2. Database 'life_organizer' exists")
        print("3. Connection settings in .env are correct")
        return False

def view_tables():
    """View all tables and their record counts"""
    db = SessionLocal()
    try:
        print("📊 Database: life_organizer")
        print("=" * 60)
        
        # Check tables exist
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name;
            """))
            tables = [row[0] for row in result]
            
            if not tables:
                print("⚠️  No tables found in database")
                print("Run: cd python_server && python init_db.py")
                return
            
            print(f"\n📋 Found {len(tables)} table(s): {', '.join(tables)}")
            print()
        
        # View Transactions
        print("💵 TRANSACTIONS")
        print("-" * 60)
        try:
            count = db.query(TransactionDB).count()
            print(f"Total records: {count}")
            if count > 0:
                transactions = db.query(TransactionDB).order_by(TransactionDB.date.desc()).limit(10).all()
                print("\nRecent transactions:")
                for t in transactions:
                    type_emoji = "💰" if t.type.value == "income" else "💸"
                    print(f"  {type_emoji} [{t.id}] {t.description} - ${t.amount:.2f} ({t.category}) - {t.date.strftime('%Y-%m-%d')}")
            else:
                print("  No transactions yet")
        except Exception as e:
            print(f"  ⚠️  Table doesn't exist: {e}")
        
        print()
        
        # View Assets
        print("💼 ASSETS")
        print("-" * 60)
        try:
            count = db.query(AssetDB).count()
            print(f"Total records: {count}")
            if count > 0:
                assets = db.query(AssetDB).order_by(AssetDB.date.desc()).limit(10).all()
                print("\nRecent assets:")
                for a in assets:
                    icons = {
                        "Money": "💵",
                        "Bank": "🏦",
                        "Gold": "🥇",
                        "Crypto": "₿",
                        "Stock": "📈",
                        "Loan": "💳"
                    }
                    icon = icons.get(a.type.value, "📦")
                    print(f"  {icon} [{a.id}] {a.name} - {a.type.value} - {a.value:.2f} {a.currency}")
            else:
                print("  No assets yet")
        except Exception as e:
            print(f"  ⚠️  Table doesn't exist: {e}")
        
        print()
        
        # View Tasks
        print("✅ TASKS")
        print("-" * 60)
        try:
            count = db.query(TaskDB).count()
            print(f"Total records: {count}")
            if count > 0:
                tasks = db.query(TaskDB).order_by(TaskDB.created_at.desc()).limit(10).all()
                print("\nRecent tasks:")
                for t in tasks:
                    status = "✓" if t.completed else "○"
                    print(f"  {status} [{t.id}] {t.title}")
                    if t.description:
                        print(f"      {t.description}")
            else:
                print("  No tasks yet")
        except Exception as e:
            print(f"  ⚠️  Table doesn't exist: {e}")
        
        print()
        print("=" * 60)
        print("💡 To view more details, use SQL:")
        print("   psql -U postgres -d life_organizer")
        print("   SELECT * FROM transactions;")
        print("   SELECT * FROM assets;")
        print("   SELECT * FROM tasks;")
        
    except Exception as e:
        print(f"Error viewing database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    print("=== Viewing Valy Life Database ===\n")
    
    if not check_connection():
        sys.exit(1)
    
    view_tables()

