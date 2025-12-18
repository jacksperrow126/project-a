from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Enum, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class TaskDB(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    description = Column(String, nullable=True)
    completed = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class TransactionType(str, enum.Enum):
    income = "income"
    expense = "expense"

class TransactionDB(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(Enum(TransactionType), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    description = Column(String, nullable=False)
    category = Column(String, nullable=False)
    wallet_id = Column(Integer, ForeignKey("wallets.id"), nullable=True, index=True)
    date = Column(DateTime(timezone=True), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    wallet = relationship("WalletDB", back_populates="transactions")

class WalletType(str, enum.Enum):
    cash = "Cash"  # Tiền mặt
    bank = "Bank"  # Ngân hàng
    stock = "Stock"  # Cổ phiếu
    savings = "Savings"  # Tiền tiết kiệm
    assets = "Assets"  # Tài sản
    credit = "Credit"  # Tín dụng

class WalletDB(Base):
    __tablename__ = "wallets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    balance = Column(Float, default=0.0, nullable=False)
    type = Column(Enum(WalletType), nullable=False, index=True)
    detail = Column(String, nullable=True)
    # Stock wallet specific fields
    margin = Column(Float, default=0.0, nullable=True)
    cash = Column(Float, default=0.0, nullable=True)  # Cash in stock wallet
    investment_value = Column(Float, default=0.0, nullable=True)  # Investment value
    gross_balance = Column(Float, default=0.0, nullable=True)  # Gross balance for stocks
    # Credit card specific
    loan = Column(Float, default=0.0, nullable=True)  # Credit/loan amount
    # Shared asset flag
    not_mine = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    transactions = relationship("TransactionDB", back_populates="wallet")
    stocks = relationship("StockDB", back_populates="wallet")

class AssetType(str, enum.Enum):
    money = "Money"
    bank = "Bank"
    gold = "Gold"
    crypto = "Crypto"
    stock = "Stock"
    loan = "Loan"

class AssetDB(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(Enum(AssetType), nullable=False, index=True)
    name = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    value = Column(Float, nullable=False)
    currency = Column(String, nullable=False, default="USD")
    notes = Column(String, nullable=True)
    date = Column(DateTime(timezone=True), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class NoteTag(str, enum.Enum):
    common = "Common"  # Chung
    drink = "Drink"
    friends = "Friends"  # Bạn bè
    study = "Study"  # Học tập
    work = "Work"  # Công việc
    life = "Life"  # Cuộc sống
    entertainment = "Entertainment"  # Giải trí
    family = "Family"  # Gia đình
    health = "Health"  # Sức khỏe

class NoteDB(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=True)
    content = Column(Text, nullable=False)
    tag = Column(Enum(NoteTag), nullable=False, index=True)
    remark = Column(Boolean, default=False, nullable=False)  # Remarkable flag
    image = Column(String, nullable=True)  # Image path/URL
    date = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class StockDB(Base):
    __tablename__ = "stocks"

    id = Column(Integer, primary_key=True, index=True)
    wallet_id = Column(Integer, ForeignKey("wallets.id"), nullable=False, index=True)
    code = Column(String, nullable=False)  # Stock code
    volume = Column(Float, nullable=False)  # Number of shares
    start_price = Column(Float, nullable=False)  # Purchase price
    start_date = Column(DateTime(timezone=True), nullable=False)
    sell_price = Column(Float, nullable=True)  # Sell price if sold
    sell_date = Column(DateTime(timezone=True), nullable=True)
    is_holding = Column(Boolean, default=True, nullable=False)  # Is currently holding
    margin = Column(Float, default=0.0, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    wallet = relationship("WalletDB", back_populates="stocks")

class PlanType(str, enum.Enum):
    income = "income"
    expense = "expense"

class BudgetPlanDB(Base):
    __tablename__ = "budget_plans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)  # Category name
    value = Column(Float, nullable=False)  # Budget amount
    type = Column(Enum(PlanType), nullable=False, index=True)
    icon = Column(String, nullable=True)  # Icon identifier
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class UserDB(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=True, index=True)
    name = Column(String, nullable=False)
    password_hash = Column(String, nullable=True)  # Hashed password
    avatar = Column(String, nullable=True)  # Avatar path/URL
    age = Column(Integer, nullable=True)
    address = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
