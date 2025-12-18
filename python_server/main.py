from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from app.database import engine, Base
from app.routers import tasks, transactions, assets, wallets, notes, stocks, budget_plans, users, transfers, market_data

load_dotenv()

# Create database tables (only if database is available)
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Warning: Could not connect to database: {e}")
    print("Server will start, but database operations will fail until PostgreSQL is set up.")

app = FastAPI(
    title="Valy Life API",
    description="Backend API for Valy Life application",
    version="1.0.0"
)

# CORS middleware to allow requests from Flutter app and Next.js website
cors_origins = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins if cors_origins != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(tasks.router)
app.include_router(transactions.router)
app.include_router(assets.router)
app.include_router(wallets.router)
app.include_router(notes.router)
app.include_router(stocks.router)
app.include_router(budget_plans.router)
app.include_router(users.router)
app.include_router(transfers.router)
app.include_router(market_data.router)

@app.get("/")
async def root():
    return {
        "message": "Welcome to Valy Life API",
        "version": "1.0.0",
        "database": "PostgreSQL"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

