from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Database URL from environment variable or default
# Using postgresql+psycopg for psycopg3
database_url = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/life_organizer"
)
# Convert to psycopg3 format if using psycopg3
if database_url.startswith("postgresql://"):
    DATABASE_URL = database_url.replace("postgresql://", "postgresql+psycopg://", 1)
else:
    DATABASE_URL = database_url

# Create engine with pool_pre_ping to handle connection errors gracefully
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # Verify connections before using them
    connect_args={"connect_timeout": 5}  # Timeout after 5 seconds
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

