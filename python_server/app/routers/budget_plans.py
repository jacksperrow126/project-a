from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from app.models import BudgetPlan, BudgetPlanCreate, BudgetPlanUpdate
from app.database import get_db
from app.db_models import BudgetPlanDB, PlanType

router = APIRouter(prefix="/api/budget-plans", tags=["budget-plans"])

@router.get("", response_model=List[BudgetPlan])
async def get_budget_plans(plan_type: Optional[str] = None, db: Session = Depends(get_db)):
    """Get all budget plans, optionally filtered by type"""
    try:
        query = db.query(BudgetPlanDB)
        if plan_type:
            try:
                plan_type_enum = PlanType(plan_type)
                query = query.filter(BudgetPlanDB.type == plan_type_enum)
            except ValueError:
                pass
        plans = query.order_by(BudgetPlanDB.name).all()
        return plans
    except Exception as e:
        return []

@router.get("/{plan_id}", response_model=BudgetPlan)
async def get_budget_plan(plan_id: int, db: Session = Depends(get_db)):
    """Get a specific budget plan by ID"""
    try:
        plan = db.query(BudgetPlanDB).filter(BudgetPlanDB.id == plan_id).first()
        if plan is None:
            raise HTTPException(status_code=404, detail="Budget plan not found")
        return plan
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database unavailable: {str(e)}")

@router.post("", response_model=BudgetPlan)
async def create_budget_plan(plan: BudgetPlanCreate, db: Session = Depends(get_db)):
    """Create a new budget plan"""
    try:
        # Validate plan type
        try:
            plan_type = PlanType(plan.type)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid plan type. Must be 'income' or 'expense'"
            )
        
        db_plan = BudgetPlanDB(
            name=plan.name,
            value=plan.value,
            type=plan_type,
            icon=plan.icon
        )
        db.add(db_plan)
        db.commit()
        db.refresh(db_plan)
        return db_plan
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database unavailable: {str(e)}")

@router.put("/{plan_id}", response_model=BudgetPlan)
async def update_budget_plan(plan_id: int, plan: BudgetPlanUpdate, db: Session = Depends(get_db)):
    """Update a budget plan"""
    try:
        db_plan = db.query(BudgetPlanDB).filter(BudgetPlanDB.id == plan_id).first()
        if db_plan is None:
            raise HTTPException(status_code=404, detail="Budget plan not found")
        
        if plan.name is not None:
            db_plan.name = plan.name
        if plan.value is not None:
            db_plan.value = plan.value
        if plan.type is not None:
            try:
                db_plan.type = PlanType(plan.type)
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid plan type. Must be 'income' or 'expense'"
                )
        if plan.icon is not None:
            db_plan.icon = plan.icon
        
        db.commit()
        db.refresh(db_plan)
        return db_plan
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database unavailable: {str(e)}")

@router.delete("/{plan_id}")
async def delete_budget_plan(plan_id: int, db: Session = Depends(get_db)):
    """Delete a budget plan"""
    try:
        db_plan = db.query(BudgetPlanDB).filter(BudgetPlanDB.id == plan_id).first()
        if db_plan is None:
            raise HTTPException(status_code=404, detail="Budget plan not found")
        
        db.delete(db_plan)
        db.commit()
        return {"message": "Budget plan deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database unavailable: {str(e)}")

