from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.models import User, UserCreate, UserUpdate, UserLogin
from app.database import get_db
from app.db_models import UserDB
import hashlib

router = APIRouter(prefix="/api/users", tags=["users"])

def hash_password(password: str) -> str:
    """Simple password hashing (use bcrypt in production)"""
    return hashlib.sha256(password.encode()).hexdigest()

@router.post("/register", response_model=User)
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    try:
        # Check if username already exists
        if user.username:
            existing = db.query(UserDB).filter(UserDB.username == user.username).first()
            if existing:
                raise HTTPException(status_code=400, detail="Username already exists")
        
        db_user = UserDB(
            username=user.username,
            name=user.name,
            password_hash=hash_password(user.password) if user.password else None,
            avatar=user.avatar,
            age=user.age,
            address=user.address,
            bio=user.bio
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database unavailable: {str(e)}")

@router.post("/login", response_model=User)
async def login_user(login: UserLogin, db: Session = Depends(get_db)):
    """Login user"""
    try:
        if login.username:
            user = db.query(UserDB).filter(UserDB.username == login.username).first()
        else:
            # If no username, get first user (for apps without username)
            user = db.query(UserDB).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        if user.password_hash:
            if hash_password(login.password) != user.password_hash:
                raise HTTPException(status_code=401, detail="Invalid password")
        
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database unavailable: {str(e)}")

@router.get("/me", response_model=User)
async def get_current_user(db: Session = Depends(get_db)):
    """Get current user (first user for now)"""
    try:
        user = db.query(UserDB).first()
        if not user:
            raise HTTPException(status_code=404, detail="No user found")
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database unavailable: {str(e)}")

@router.put("/me", response_model=User)
async def update_current_user(user: UserUpdate, db: Session = Depends(get_db)):
    """Update current user profile"""
    try:
        db_user = db.query(UserDB).first()
        if not db_user:
            raise HTTPException(status_code=404, detail="No user found")
        
        if user.name is not None:
            db_user.name = user.name
        if user.username is not None:
            # Check if username is taken by another user
            existing = db.query(UserDB).filter(
                UserDB.username == user.username,
                UserDB.id != db_user.id
            ).first()
            if existing:
                raise HTTPException(status_code=400, detail="Username already taken")
            db_user.username = user.username
        if user.password is not None:
            db_user.password_hash = hash_password(user.password)
        if user.avatar is not None:
            db_user.avatar = user.avatar
        if user.age is not None:
            db_user.age = user.age
        if user.address is not None:
            db_user.address = user.address
        if user.bio is not None:
            db_user.bio = user.bio
        
        db.commit()
        db.refresh(db_user)
        return db_user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database unavailable: {str(e)}")

