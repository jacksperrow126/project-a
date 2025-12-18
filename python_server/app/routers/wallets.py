from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from app.models import Wallet, WalletCreate, WalletUpdate
from app.database import get_db
from app.db_models import WalletDB, WalletType

router = APIRouter(prefix="/api/wallets", tags=["wallets"])

@router.get("", response_model=List[Wallet])
async def get_wallets(db: Session = Depends(get_db)):
    """Get all wallets"""
    try:
        wallets = db.query(WalletDB).order_by(WalletDB.created_at.desc()).all()
        return wallets
    except Exception as e:
        return []

@router.get("/{wallet_id}", response_model=Wallet)
async def get_wallet(wallet_id: int, db: Session = Depends(get_db)):
    """Get a specific wallet by ID"""
    try:
        wallet = db.query(WalletDB).filter(WalletDB.id == wallet_id).first()
        if wallet is None:
            raise HTTPException(status_code=404, detail="Wallet not found")
        return wallet
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database unavailable: {str(e)}")

@router.post("", response_model=Wallet)
async def create_wallet(wallet: WalletCreate, db: Session = Depends(get_db)):
    """Create a new wallet"""
    try:
        # Validate wallet type
        try:
            wallet_type = WalletType(wallet.type)
        except ValueError:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid wallet type. Must be one of: {[e.value for e in WalletType]}"
            )
        
        db_wallet = WalletDB(
            name=wallet.name,
            balance=0.0,
            type=wallet_type,
            detail=wallet.detail,
            margin=wallet.margin or 0.0,
            cash=wallet.cash or 0.0,
            investment_value=wallet.investment_value or 0.0,
            gross_balance=wallet.gross_balance or 0.0,
            loan=wallet.loan or 0.0,
            not_mine=wallet.not_mine or False
        )
        db.add(db_wallet)
        db.commit()
        db.refresh(db_wallet)
        return db_wallet
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database unavailable: {str(e)}")

@router.put("/{wallet_id}", response_model=Wallet)
async def update_wallet(wallet_id: int, wallet: WalletUpdate, db: Session = Depends(get_db)):
    """Update a wallet"""
    try:
        db_wallet = db.query(WalletDB).filter(WalletDB.id == wallet_id).first()
        if db_wallet is None:
            raise HTTPException(status_code=404, detail="Wallet not found")
        
        if wallet.name is not None:
            db_wallet.name = wallet.name
        if wallet.balance is not None:
            db_wallet.balance = wallet.balance
        if wallet.detail is not None:
            db_wallet.detail = wallet.detail
        if wallet.margin is not None:
            db_wallet.margin = wallet.margin
        if wallet.cash is not None:
            db_wallet.cash = wallet.cash
        if wallet.investment_value is not None:
            db_wallet.investment_value = wallet.investment_value
        if wallet.gross_balance is not None:
            db_wallet.gross_balance = wallet.gross_balance
        if wallet.loan is not None:
            db_wallet.loan = wallet.loan
        if wallet.not_mine is not None:
            db_wallet.not_mine = wallet.not_mine
        
        db.commit()
        db.refresh(db_wallet)
        return db_wallet
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database unavailable: {str(e)}")

@router.delete("/{wallet_id}")
async def delete_wallet(wallet_id: int, db: Session = Depends(get_db)):
    """Delete a wallet"""
    try:
        db_wallet = db.query(WalletDB).filter(WalletDB.id == wallet_id).first()
        if db_wallet is None:
            raise HTTPException(status_code=404, detail="Wallet not found")
        
        db.delete(db_wallet)
        db.commit()
        return {"message": "Wallet deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database unavailable: {str(e)}")

@router.get("/summary/totals")
async def get_wallet_totals(db: Session = Depends(get_db)):
    """Get total balance across all wallets (excluding credit)"""
    try:
        wallets = db.query(WalletDB).all()
        total_balance = sum(w.balance for w in wallets if w.type != WalletType.credit)
        total_credit = sum(w.loan or 0.0 for w in wallets if w.type == WalletType.credit)
        
        return {
            "total_balance": total_balance,
            "total_credit": total_credit,
            "net_balance": total_balance - total_credit
        }
    except Exception as e:
        return {
            "total_balance": 0.0,
            "total_credit": 0.0,
            "net_balance": 0.0
        }

