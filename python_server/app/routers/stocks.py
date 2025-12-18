from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from app.models import Stock, StockCreate, StockUpdate
from app.database import get_db
from app.db_models import StockDB, WalletDB, WalletType

router = APIRouter(prefix="/api/stocks", tags=["stocks"])

@router.get("", response_model=List[Stock])
async def get_stocks(wallet_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Get all stocks, optionally filtered by wallet"""
    try:
        query = db.query(StockDB)
        if wallet_id:
            query = query.filter(StockDB.wallet_id == wallet_id)
        stocks = query.order_by(StockDB.start_date.desc()).all()
        return stocks
    except Exception as e:
        return []

@router.get("/{stock_id}", response_model=Stock)
async def get_stock(stock_id: int, db: Session = Depends(get_db)):
    """Get a specific stock by ID"""
    try:
        stock = db.query(StockDB).filter(StockDB.id == stock_id).first()
        if stock is None:
            raise HTTPException(status_code=404, detail="Stock not found")
        return stock
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database unavailable: {str(e)}")

@router.post("", response_model=Stock)
async def create_stock(stock: StockCreate, db: Session = Depends(get_db)):
    """Create a new stock"""
    try:
        # Verify wallet exists and is a stock wallet
        wallet = db.query(WalletDB).filter(WalletDB.id == stock.wallet_id).first()
        if wallet is None:
            raise HTTPException(status_code=404, detail="Wallet not found")
        if wallet.type != WalletType.stock:
            raise HTTPException(status_code=400, detail="Stock can only be added to Stock type wallet")
        
        # Check if enough cash available
        total_cost = stock.volume * stock.start_price + (stock.margin or 0.0)
        if wallet.cash < total_cost:
            raise HTTPException(status_code=400, detail="Insufficient cash in wallet")
        
        db_stock = StockDB(
            wallet_id=stock.wallet_id,
            code=stock.code,
            volume=stock.volume,
            start_price=stock.start_price,
            start_date=stock.start_date,
            margin=stock.margin or 0.0,
            is_holding=True
        )
        
        # Update wallet cash and investment value
        wallet.cash -= total_cost
        wallet.investment_value = (wallet.investment_value or 0.0) + (stock.volume * stock.start_price)
        wallet.gross_balance = (wallet.cash or 0.0) + (wallet.investment_value or 0.0)
        
        db.add(db_stock)
        db.commit()
        db.refresh(db_stock)
        return db_stock
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database unavailable: {str(e)}")

@router.put("/{stock_id}", response_model=Stock)
async def update_stock(stock_id: int, stock: StockUpdate, db: Session = Depends(get_db)):
    """Update a stock"""
    try:
        db_stock = db.query(StockDB).filter(StockDB.id == stock_id).first()
        if db_stock is None:
            raise HTTPException(status_code=404, detail="Stock not found")
        
        if stock.code is not None:
            db_stock.code = stock.code
        if stock.volume is not None:
            db_stock.volume = stock.volume
        if stock.start_price is not None:
            db_stock.start_price = stock.start_price
        if stock.start_date is not None:
            db_stock.start_date = stock.start_date
        if stock.sell_price is not None:
            db_stock.sell_price = stock.sell_price
        if stock.sell_date is not None:
            db_stock.sell_date = stock.sell_date
        if stock.is_holding is not None:
            db_stock.is_holding = stock.is_holding
        if stock.margin is not None:
            db_stock.margin = stock.margin
        
        # If selling stock, update wallet
        if stock.is_holding == False and stock.sell_price:
            wallet = db.query(WalletDB).filter(WalletDB.id == db_stock.wallet_id).first()
            if wallet:
                cash_return = db_stock.volume * stock.sell_price
                wallet.cash = (wallet.cash or 0.0) + cash_return
                wallet.investment_value = (wallet.investment_value or 0.0) - (db_stock.volume * db_stock.start_price)
                wallet.gross_balance = (wallet.cash or 0.0) + (wallet.investment_value or 0.0)
        
        db.commit()
        db.refresh(db_stock)
        return db_stock
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database unavailable: {str(e)}")

@router.delete("/{stock_id}")
async def delete_stock(stock_id: int, db: Session = Depends(get_db)):
    """Delete a stock (sell it)"""
    try:
        db_stock = db.query(StockDB).filter(StockDB.id == stock_id).first()
        if db_stock is None:
            raise HTTPException(status_code=404, detail="Stock not found")
        
        # Return cash to wallet if holding
        if db_stock.is_holding:
            wallet = db.query(WalletDB).filter(WalletDB.id == db_stock.wallet_id).first()
            if wallet:
                cash_return = db_stock.volume * db_stock.start_price
                wallet.cash = (wallet.cash or 0.0) + cash_return
                wallet.investment_value = (wallet.investment_value or 0.0) - (db_stock.volume * db_stock.start_price)
                wallet.gross_balance = (wallet.cash or 0.0) + (wallet.investment_value or 0.0)
        
        db.delete(db_stock)
        db.commit()
        return {"message": "Stock deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database unavailable: {str(e)}")

