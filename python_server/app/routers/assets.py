from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from app.models import Asset, AssetCreate, AssetUpdate
from app.database import get_db
from app.db_models import AssetDB, AssetType

router = APIRouter(prefix="/api/assets", tags=["assets"])

@router.get("", response_model=List[Asset])
async def get_assets(db: Session = Depends(get_db)):
    """Get all assets"""
    try:
        assets = db.query(AssetDB).order_by(AssetDB.date.desc()).all()
        return assets
    except Exception as e:
        # Return empty list if database is not available
        return []

@router.get("/{asset_id}", response_model=Asset)
async def get_asset(asset_id: int, db: Session = Depends(get_db)):
    """Get a specific asset by ID"""
    asset = db.query(AssetDB).filter(AssetDB.id == asset_id).first()
    if asset is None:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset

@router.post("", response_model=Asset)
async def create_asset(asset: AssetCreate, db: Session = Depends(get_db)):
    """Create a new asset"""
    try:
        # Validate asset type
        try:
            asset_type = AssetType(asset.type)
        except ValueError:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid asset type. Must be one of: {[e.value for e in AssetType]}"
            )
        
        db_asset = AssetDB(
            type=asset_type,
            name=asset.name,
            amount=asset.amount,
            value=asset.value,
            currency=asset.currency,
            notes=asset.notes,
            date=asset.date
        )
        db.add(db_asset)
        db.commit()
        db.refresh(db_asset)
        return db_asset
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database unavailable: {str(e)}")

@router.put("/{asset_id}", response_model=Asset)
async def update_asset(asset_id: int, asset: AssetUpdate, db: Session = Depends(get_db)):
    """Update an asset"""
    db_asset = db.query(AssetDB).filter(AssetDB.id == asset_id).first()
    if db_asset is None:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    if asset.type is not None:
        try:
            db_asset.type = AssetType(asset.type)
        except ValueError:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid asset type. Must be one of: {[e.value for e in AssetType]}"
            )
    if asset.name is not None:
        db_asset.name = asset.name
    if asset.amount is not None:
        db_asset.amount = asset.amount
    if asset.value is not None:
        db_asset.value = asset.value
    if asset.currency is not None:
        db_asset.currency = asset.currency
    if asset.notes is not None:
        db_asset.notes = asset.notes
    if asset.date is not None:
        db_asset.date = asset.date
    
    db.commit()
    db.refresh(db_asset)
    return db_asset

@router.delete("/{asset_id}")
async def delete_asset(asset_id: int, db: Session = Depends(get_db)):
    """Delete an asset"""
    db_asset = db.query(AssetDB).filter(AssetDB.id == asset_id).first()
    if db_asset is None:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    db.delete(db_asset)
    db.commit()
    return {"message": "Asset deleted successfully"}

@router.get("/summary/totals")
async def get_asset_totals(db: Session = Depends(get_db)):
    """Get total portfolio value and breakdown by type"""
    try:
        assets = db.query(AssetDB).all()
        
        totals_by_type = {}
        for asset_type in AssetType:
            type_assets = [a for a in assets if a.type == asset_type]
            type_value = sum(a.value for a in type_assets)
            if asset_type == AssetType.loan:
                type_value = -type_value  # Loans are negative
            totals_by_type[asset_type.value] = {
                "count": len(type_assets),
                "value": type_value
            }
        
        total_portfolio_value = sum(
            -a.value if a.type == AssetType.loan else a.value 
            for a in assets
        )
        
        return {
            "total_portfolio_value": total_portfolio_value,
            "by_type": totals_by_type
        }
    except Exception as e:
        # Return empty totals if database is not available
        totals_by_type = {asset_type.value: {"count": 0, "value": 0.0} for asset_type in AssetType}
        return {
            "total_portfolio_value": 0.0,
            "by_type": totals_by_type
        }

