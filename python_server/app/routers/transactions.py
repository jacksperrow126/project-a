from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from app.models import Transaction, TransactionCreate, TransactionUpdate
from app.database import get_db
from app.db_models import TransactionDB, TransactionType, WalletDB, WalletType
from datetime import datetime

router = APIRouter(prefix="/api/transactions", tags=["transactions"])

@router.get("", response_model=List[Transaction])
async def get_transactions(db: Session = Depends(get_db)):
    """Get all transactions"""
    try:
        transactions = db.query(TransactionDB).order_by(TransactionDB.date.desc()).all()
        return transactions
    except Exception as e:
        # Return empty list if database is not available
        return []

@router.get("/{transaction_id}", response_model=Transaction)
async def get_transaction(transaction_id: int, db: Session = Depends(get_db)):
    """Get a specific transaction by ID"""
    transaction = db.query(TransactionDB).filter(TransactionDB.id == transaction_id).first()
    if transaction is None:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction

@router.post("", response_model=Transaction)
async def create_transaction(transaction: TransactionCreate, db: Session = Depends(get_db)):
    """Create a new transaction"""
    try:
        # Validate transaction type
        try:
            transaction_type = TransactionType(transaction.type)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid transaction type. Must be 'income' or 'expense'")
        
        # Update wallet balance if wallet_id is provided
        if transaction.wallet_id:
            wallet = db.query(WalletDB).filter(WalletDB.id == transaction.wallet_id).first()
            if not wallet:
                raise HTTPException(status_code=404, detail="Wallet not found")
            
            # Update wallet balance
            if transaction_type == TransactionType.income:
                if wallet.type == WalletType.credit:
                    wallet.loan = (wallet.loan or 0.0) - transaction.amount  # Reduce debt
                else:
                    wallet.balance += transaction.amount
                    if wallet.type == WalletType.stock:
                        wallet.cash += transaction.amount
                        wallet.gross_balance = (wallet.cash or 0.0) + (wallet.investment_value or 0.0)
            else:  # expense
                if wallet.type == WalletType.credit:
                    wallet.loan = (wallet.loan or 0.0) + transaction.amount  # Increase debt
                else:
                    wallet.balance -= transaction.amount
                    if wallet.type == WalletType.stock:
                        wallet.cash -= transaction.amount
                        wallet.gross_balance = (wallet.cash or 0.0) + (wallet.investment_value or 0.0)
        
        db_transaction = TransactionDB(
            type=transaction_type,
            amount=transaction.amount,
            description=transaction.description,
            category=transaction.category,
            wallet_id=transaction.wallet_id,
            date=transaction.date
        )
        db.add(db_transaction)
        db.commit()
        db.refresh(db_transaction)
        return db_transaction
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database unavailable: {str(e)}")

@router.put("/{transaction_id}", response_model=Transaction)
async def update_transaction(transaction_id: int, transaction: TransactionUpdate, db: Session = Depends(get_db)):
    """Update a transaction"""
    db_transaction = db.query(TransactionDB).filter(TransactionDB.id == transaction_id).first()
    if db_transaction is None:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    if transaction.type is not None:
        try:
            db_transaction.type = TransactionType(transaction.type)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid transaction type. Must be 'income' or 'expense'")
    if transaction.amount is not None:
        db_transaction.amount = transaction.amount
    if transaction.description is not None:
        db_transaction.description = transaction.description
    if transaction.category is not None:
        db_transaction.category = transaction.category
    if transaction.date is not None:
        db_transaction.date = transaction.date
    
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@router.delete("/{transaction_id}")
async def delete_transaction(transaction_id: int, db: Session = Depends(get_db)):
    """Delete a transaction and update wallet balance"""
    try:
        db_transaction = db.query(TransactionDB).filter(TransactionDB.id == transaction_id).first()
        if db_transaction is None:
            raise HTTPException(status_code=404, detail="Transaction not found")
        
        # Update wallet balance if wallet_id is provided
        if db_transaction.wallet_id:
            wallet = db.query(WalletDB).filter(WalletDB.id == db_transaction.wallet_id).first()
            if wallet:
                # Reverse the transaction effect
                if db_transaction.type == TransactionType.income:
                    if wallet.type == WalletType.credit:
                        wallet.loan = (wallet.loan or 0.0) + db_transaction.amount  # Increase debt
                    else:
                        wallet.balance -= db_transaction.amount
                        if wallet.type == WalletType.stock:
                            wallet.cash -= db_transaction.amount
                            wallet.gross_balance = (wallet.cash or 0.0) + (wallet.investment_value or 0.0)
                else:  # expense
                    if wallet.type == WalletType.credit:
                        wallet.loan = (wallet.loan or 0.0) - db_transaction.amount  # Reduce debt
                    else:
                        wallet.balance += db_transaction.amount
                        if wallet.type == WalletType.stock:
                            wallet.cash += db_transaction.amount
                            wallet.gross_balance = (wallet.cash or 0.0) + (wallet.investment_value or 0.0)
        
        db.delete(db_transaction)
        db.commit()
        return {"message": "Transaction deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database unavailable: {str(e)}")

@router.get("/summary/totals")
async def get_transaction_totals(db: Session = Depends(get_db)):
    """Get total income and expenses"""
    try:
        transactions = db.query(TransactionDB).all()
        total_income = sum(t.amount for t in transactions if t.type == TransactionType.income)
        total_expenses = sum(t.amount for t in transactions if t.type == TransactionType.expense)
        balance = total_income - total_expenses
        
        return {
            "total_income": total_income,
            "total_expenses": total_expenses,
            "balance": balance
        }
    except Exception as e:
        # Return zeros if database is not available
        return {
            "total_income": 0.0,
            "total_expenses": 0.0,
            "balance": 0.0
        }

