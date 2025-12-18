from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.models import MoneyTransfer
from app.database import get_db
from app.db_models import WalletDB, WalletType, TransactionDB, TransactionType
from datetime import datetime

router = APIRouter(prefix="/api/transfers", tags=["transfers"])

@router.post("")
async def transfer_money(transfer: MoneyTransfer, db: Session = Depends(get_db)):
    """Transfer money between wallets"""
    try:
        from_wallet = db.query(WalletDB).filter(WalletDB.id == transfer.from_wallet_id).first()
        to_wallet = db.query(WalletDB).filter(WalletDB.id == transfer.to_wallet_id).first()
        
        if not from_wallet:
            raise HTTPException(status_code=404, detail="Source wallet not found")
        if not to_wallet:
            raise HTTPException(status_code=404, detail="Destination wallet not found")
        if from_wallet.id == to_wallet.id:
            raise HTTPException(status_code=400, detail="Cannot transfer to the same wallet")
        
        # Check balance for non-credit wallets
        if from_wallet.type != WalletType.credit:
            if from_wallet.type == WalletType.stock:
                if (from_wallet.cash or 0.0) < transfer.amount:
                    raise HTTPException(status_code=400, detail="Insufficient cash in source wallet")
            else:
                if from_wallet.balance < transfer.amount:
                    raise HTTPException(status_code=400, detail="Insufficient balance in source wallet")
        
        now = datetime.now()
        
        # Handle credit card transfers specially
        if from_wallet.type == WalletType.credit:
            # Transferring from credit = paying off debt
            from_wallet.loan = (from_wallet.loan or 0.0) - transfer.amount
            if to_wallet.type == WalletType.credit:
                to_wallet.loan = (to_wallet.loan or 0.0) + transfer.amount
            elif to_wallet.type == WalletType.stock:
                to_wallet.cash = (to_wallet.cash or 0.0) + transfer.amount
                to_wallet.balance += transfer.amount
                to_wallet.gross_balance = (to_wallet.cash or 0.0) + (to_wallet.investment_value or 0.0)
            else:
                to_wallet.balance += transfer.amount
        elif to_wallet.type == WalletType.credit:
            # Transferring to credit = using credit
            to_wallet.loan = (to_wallet.loan or 0.0) + transfer.amount
            if from_wallet.type == WalletType.stock:
                from_wallet.cash = (from_wallet.cash or 0.0) - transfer.amount
                from_wallet.balance -= transfer.amount
                from_wallet.gross_balance = (from_wallet.cash or 0.0) + (from_wallet.investment_value or 0.0)
            else:
                from_wallet.balance -= transfer.amount
        else:
            # Regular transfer between non-credit wallets
            if from_wallet.type == WalletType.stock:
                from_wallet.cash = (from_wallet.cash or 0.0) - transfer.amount
                from_wallet.balance -= transfer.amount
                from_wallet.gross_balance = (from_wallet.cash or 0.0) + (from_wallet.investment_value or 0.0)
            else:
                from_wallet.balance -= transfer.amount
            
            if to_wallet.type == WalletType.stock:
                to_wallet.cash = (to_wallet.cash or 0.0) + transfer.amount
                to_wallet.balance += transfer.amount
                to_wallet.gross_balance = (to_wallet.cash or 0.0) + (to_wallet.investment_value or 0.0)
            else:
                to_wallet.balance += transfer.amount
        
        # Create transaction records
        description = transfer.description or f"Transfer to {to_wallet.name}"
        expense_transaction = TransactionDB(
            type=TransactionType.expense,
            amount=transfer.amount,
            description=description,
            category="Transfer",
            wallet_id=from_wallet.id,
            date=now
        )
        
        income_transaction = TransactionDB(
            type=TransactionType.income,
            amount=transfer.amount,
            description=f"Transfer from {from_wallet.name}",
            category="Transfer",
            wallet_id=to_wallet.id,
            date=now
        )
        
        db.add(expense_transaction)
        db.add(income_transaction)
        db.commit()
        
        return {
            "message": "Transfer completed successfully",
            "from_wallet_balance": from_wallet.balance,
            "to_wallet_balance": to_wallet.balance
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database unavailable: {str(e)}")

