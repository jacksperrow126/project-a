from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from app.models import Note, NoteCreate, NoteUpdate
from app.database import get_db
from app.db_models import NoteDB, NoteTag
from datetime import datetime

router = APIRouter(prefix="/api/notes", tags=["notes"])

@router.get("", response_model=List[Note])
async def get_notes(
    tag: Optional[str] = None,
    date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all notes, optionally filtered by tag or date"""
    try:
        query = db.query(NoteDB)
        
        if tag:
            try:
                note_tag = NoteTag(tag)
                query = query.filter(NoteDB.tag == note_tag)
            except ValueError:
                pass  # Invalid tag, ignore filter
        
        if date:
            try:
                date_obj = datetime.fromisoformat(date.replace('Z', '+00:00'))
                query = query.filter(NoteDB.date >= date_obj)
            except:
                pass  # Invalid date, ignore filter
        
        notes = query.order_by(NoteDB.date.desc()).all()
        return notes
    except Exception as e:
        return []

@router.get("/{note_id}", response_model=Note)
async def get_note(note_id: int, db: Session = Depends(get_db)):
    """Get a specific note by ID"""
    try:
        note = db.query(NoteDB).filter(NoteDB.id == note_id).first()
        if note is None:
            raise HTTPException(status_code=404, detail="Note not found")
        return note
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database unavailable: {str(e)}")

@router.post("", response_model=Note)
async def create_note(note: NoteCreate, db: Session = Depends(get_db)):
    """Create a new note"""
    try:
        # Validate tag
        try:
            note_tag = NoteTag(note.tag)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid note tag. Must be one of: {[e.value for e in NoteTag]}"
            )
        
        # Default title if empty
        title = note.title if note.title and note.title.strip() else "Không Đề"
        
        db_note = NoteDB(
            title=title,
            content=note.content,
            tag=note_tag,
            remark=note.remark or False,
            image=note.image
        )
        db.add(db_note)
        db.commit()
        db.refresh(db_note)
        return db_note
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database unavailable: {str(e)}")

@router.put("/{note_id}", response_model=Note)
async def update_note(note_id: int, note: NoteUpdate, db: Session = Depends(get_db)):
    """Update a note"""
    try:
        db_note = db.query(NoteDB).filter(NoteDB.id == note_id).first()
        if db_note is None:
            raise HTTPException(status_code=404, detail="Note not found")
        
        if note.title is not None:
            db_note.title = note.title if note.title.strip() else "Không Đề"
        if note.content is not None:
            db_note.content = note.content
        if note.tag is not None:
            try:
                db_note.tag = NoteTag(note.tag)
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid note tag. Must be one of: {[e.value for e in NoteTag]}"
                )
        if note.remark is not None:
            db_note.remark = note.remark
        if note.image is not None:
            db_note.image = note.image
        
        db.commit()
        db.refresh(db_note)
        return db_note
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database unavailable: {str(e)}")

@router.delete("/{note_id}")
async def delete_note(note_id: int, db: Session = Depends(get_db)):
    """Delete a note"""
    try:
        db_note = db.query(NoteDB).filter(NoteDB.id == note_id).first()
        if db_note is None:
            raise HTTPException(status_code=404, detail="Note not found")
        
        db.delete(db_note)
        db.commit()
        return {"message": "Note deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database unavailable: {str(e)}")

