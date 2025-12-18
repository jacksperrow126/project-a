from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(TaskBase):
    title: Optional[str] = None
    completed: Optional[bool] = None

class Task(TaskBase):
    id: int
    completed: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Transaction Models
class TransactionBase(BaseModel):
    type: str
    amount: float
    description: str
    category: str
    wallet_id: Optional[int] = None
    date: datetime

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    type: Optional[str] = None
    amount: Optional[float] = None
    description: Optional[str] = None
    category: Optional[str] = None
    wallet_id: Optional[int] = None
    date: Optional[datetime] = None

class Transaction(TransactionBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Asset Models
class AssetBase(BaseModel):
    type: str
    name: str
    amount: float
    value: float
    currency: str
    notes: Optional[str] = None
    date: datetime

class AssetCreate(AssetBase):
    pass

class AssetUpdate(BaseModel):
    type: Optional[str] = None
    name: Optional[str] = None
    amount: Optional[float] = None
    value: Optional[float] = None
    currency: Optional[str] = None
    notes: Optional[str] = None
    date: Optional[datetime] = None

class Asset(AssetBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Wallet Models
class WalletBase(BaseModel):
    name: str
    type: str
    detail: Optional[str] = None
    margin: Optional[float] = None
    cash: Optional[float] = None
    investment_value: Optional[float] = None
    gross_balance: Optional[float] = None
    loan: Optional[float] = None
    not_mine: Optional[bool] = False

class WalletCreate(WalletBase):
    pass

class WalletUpdate(BaseModel):
    name: Optional[str] = None
    balance: Optional[float] = None
    detail: Optional[str] = None
    margin: Optional[float] = None
    cash: Optional[float] = None
    investment_value: Optional[float] = None
    gross_balance: Optional[float] = None
    loan: Optional[float] = None
    not_mine: Optional[bool] = None

class Wallet(WalletBase):
    id: int
    balance: float
    created_at: datetime
    
    class Config:
        from_attributes = True

# Note Models
class NoteBase(BaseModel):
    title: Optional[str] = None
    content: str
    tag: str
    remark: Optional[bool] = False
    image: Optional[str] = None

class NoteCreate(NoteBase):
    pass

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    tag: Optional[str] = None
    remark: Optional[bool] = None
    image: Optional[str] = None

class Note(NoteBase):
    id: int
    date: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True

# Stock Models
class StockBase(BaseModel):
    wallet_id: int
    code: str
    volume: float
    start_price: float
    start_date: datetime
    margin: Optional[float] = None

class StockCreate(StockBase):
    pass

class StockUpdate(BaseModel):
    code: Optional[str] = None
    volume: Optional[float] = None
    start_price: Optional[float] = None
    start_date: Optional[datetime] = None
    sell_price: Optional[float] = None
    sell_date: Optional[datetime] = None
    is_holding: Optional[bool] = None
    margin: Optional[float] = None

class Stock(StockBase):
    id: int
    sell_price: Optional[float] = None
    sell_date: Optional[datetime] = None
    is_holding: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Budget Plan Models
class BudgetPlanBase(BaseModel):
    name: str
    value: float
    type: str
    icon: Optional[str] = None

class BudgetPlanCreate(BudgetPlanBase):
    pass

class BudgetPlanUpdate(BaseModel):
    name: Optional[str] = None
    value: Optional[float] = None
    type: Optional[str] = None
    icon: Optional[str] = None

class BudgetPlan(BudgetPlanBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# User Models
class UserBase(BaseModel):
    username: Optional[str] = None
    name: str
    avatar: Optional[str] = None
    age: Optional[int] = None
    address: Optional[str] = None
    bio: Optional[str] = None

class UserCreate(UserBase):
    password: Optional[str] = None

class UserUpdate(BaseModel):
    username: Optional[str] = None
    name: Optional[str] = None
    password: Optional[str] = None
    avatar: Optional[str] = None
    age: Optional[int] = None
    address: Optional[str] = None
    bio: Optional[str] = None

class UserLogin(BaseModel):
    username: Optional[str] = None
    password: str

class User(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Transfer Model
class MoneyTransfer(BaseModel):
    from_wallet_id: int
    to_wallet_id: int
    amount: float
    description: Optional[str] = None
