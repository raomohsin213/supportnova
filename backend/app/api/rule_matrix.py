import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.rule_matrix import RuleMatrixEntry
from app.schemas.rule_matrix import RuleMatrixEntryCreate, RuleMatrixEntryUpdate, RuleMatrixEntryRead

router = APIRouter(prefix="/rule-matrix", tags=["Rule Matrix (Ground Truth)"])

@router.get("", response_model=list[RuleMatrixEntryRead])
async def list_rule_matrix(db: AsyncSession = Depends(get_db)):
    """
    Retrieves all master organizational boundaries from the Rule Matrix.
    """
    stmt = select(RuleMatrixEntry).order_by(RuleMatrixEntry.category, RuleMatrixEntry.subcategory)
    result = await db.execute(stmt)
    entries = result.scalars().all()
    
    return [
        RuleMatrixEntryRead(
            id=e.id,
            category=e.category,
            subcategory=e.subcategory,
            allowed_departments=e.allowed_departments,
            sla_hours_by_priority=e.sla_hours_by_priority,
            mandatory_escalation_triggers=e.mandatory_escalation_triggers,
            prohibited_actions=e.prohibited_actions,
            mandatory_actions=e.mandatory_actions,
            active_policy_id=e.active_policy_id,
            active_section_id=e.active_section_id,
            created_at=e.created_at,
            updated_at=e.updated_at
        )
        for e in entries
    ]

@router.get("/{id}", response_model=RuleMatrixEntryRead)
async def get_rule_matrix_entry(id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(RuleMatrixEntry).where(RuleMatrixEntry.id == id)
    result = await db.execute(stmt)
    entry = result.scalars().first()
    if not entry:
        raise HTTPException(status_code=404, detail=f"Rule Matrix entry {id} not found.")

    return RuleMatrixEntryRead(
        id=entry.id,
        category=entry.category,
        subcategory=entry.subcategory,
        allowed_departments=entry.allowed_departments,
        sla_hours_by_priority=entry.sla_hours_by_priority,
        mandatory_escalation_triggers=entry.mandatory_escalation_triggers,
        prohibited_actions=entry.prohibited_actions,
        mandatory_actions=entry.mandatory_actions,
        active_policy_id=entry.active_policy_id,
        active_section_id=entry.active_section_id,
        created_at=entry.created_at,
        updated_at=entry.updated_at
    )

@router.post("", status_code=status.HTTP_201_CREATED, response_model=RuleMatrixEntryRead)
async def create_rule_matrix_entry(
    entry_in: RuleMatrixEntryCreate,
    db: AsyncSession = Depends(get_db)
):
    entry = RuleMatrixEntry(
        category=entry_in.category,
        subcategory=entry_in.subcategory,
        allowed_departments_json=json.dumps(entry_in.allowed_departments),
        sla_hours_by_priority_json=json.dumps(entry_in.sla_hours_by_priority),
        mandatory_escalation_triggers_json=json.dumps(entry_in.mandatory_escalation_triggers),
        prohibited_actions_json=json.dumps(entry_in.prohibited_actions),
        mandatory_actions_json=json.dumps(entry_in.mandatory_actions),
        active_policy_id=entry_in.active_policy_id,
        active_section_id=entry_in.active_section_id
    )
    db.add(entry)
    await db.commit()
    await db.refresh(entry)

    return RuleMatrixEntryRead(
        id=entry.id,
        category=entry.category,
        subcategory=entry.subcategory,
        allowed_departments=entry.allowed_departments,
        sla_hours_by_priority=entry.sla_hours_by_priority,
        mandatory_escalation_triggers=entry.mandatory_escalation_triggers,
        prohibited_actions=entry.prohibited_actions,
        mandatory_actions=entry.mandatory_actions,
        active_policy_id=entry.active_policy_id,
        active_section_id=entry.active_section_id,
        created_at=entry.created_at,
        updated_at=entry.updated_at
    )

@router.put("/{id}", response_model=RuleMatrixEntryRead)
async def update_rule_matrix_entry(
    id: int,
    entry_in: RuleMatrixEntryUpdate,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(RuleMatrixEntry).where(RuleMatrixEntry.id == id)
    result = await db.execute(stmt)
    entry = result.scalars().first()
    if not entry:
        raise HTTPException(status_code=404, detail=f"Rule Matrix entry {id} not found.")

    if entry_in.category is not None:
        entry.category = entry_in.category
    if entry_in.subcategory is not None:
        entry.subcategory = entry_in.subcategory
    if entry_in.allowed_departments is not None:
        entry.allowed_departments = entry_in.allowed_departments
    if entry_in.sla_hours_by_priority is not None:
        entry.sla_hours_by_priority = entry_in.sla_hours_by_priority
    if entry_in.mandatory_escalation_triggers is not None:
        entry.mandatory_escalation_triggers = entry_in.mandatory_escalation_triggers
    if entry_in.prohibited_actions is not None:
        entry.prohibited_actions = entry_in.prohibited_actions
    if entry_in.mandatory_actions is not None:
        entry.mandatory_actions = entry_in.mandatory_actions
    if entry_in.active_policy_id is not None:
        entry.active_policy_id = entry_in.active_policy_id
    if entry_in.active_section_id is not None:
        entry.active_section_id = entry_in.active_section_id

    await db.commit()
    await db.refresh(entry)

    return RuleMatrixEntryRead(
        id=entry.id,
        category=entry.category,
        subcategory=entry.subcategory,
        allowed_departments=entry.allowed_departments,
        sla_hours_by_priority=entry.sla_hours_by_priority,
        mandatory_escalation_triggers=entry.mandatory_escalation_triggers,
        prohibited_actions=entry.prohibited_actions,
        mandatory_actions=entry.mandatory_actions,
        active_policy_id=entry.active_policy_id,
        active_section_id=entry.active_section_id,
        created_at=entry.created_at,
        updated_at=entry.updated_at
    )

@router.delete("/{id}")
async def delete_rule_matrix_entry(id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(RuleMatrixEntry).where(RuleMatrixEntry.id == id)
    result = await db.execute(stmt)
    entry = result.scalars().first()
    if not entry:
        raise HTTPException(status_code=404, detail=f"Rule Matrix entry {id} not found.")

    await db.delete(entry)
    await db.commit()
    return {"success": True, "message": f"Rule entry {id} deleted."}
