from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from app.database import get_sync_db
from app.models.user import User
from app.services.auth import hash_password, verify_password, create_access_token, verify_access_token

router = APIRouter(prefix="/auth", tags=["Authentication & RBAC"])

class LoginRequest(BaseModel):
    username_or_email: str
    password: str

class SwitchRoleRequest(BaseModel):
    role: str  # customer, support_agent, reviewer, support_manager, system_admin

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    full_name: Optional[str] = None
    department: Optional[str] = None

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

@router.post("/login", response_model=LoginResponse)
def login(req: LoginRequest, db: Session = Depends(get_sync_db)):
    user = db.query(User).filter(
        (User.username == req.username_or_email) | (User.email == req.username_or_email)
    ).first()
    
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username/email or password.")
        
    token = create_access_token({
        "sub": str(user.id),
        "username": user.username,
        "email": user.email,
        "role": user.role
    })
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user.to_dict()
    }

@router.post("/switch-role", response_model=LoginResponse)
def switch_role(req: SwitchRoleRequest, db: Session = Depends(get_sync_db)):
    """Fast persona switch for competition judging and role demonstration."""
    valid_roles = ["customer", "support_agent", "reviewer", "support_manager", "system_admin"]
    if req.role not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of: {valid_roles}")
        
    user = db.query(User).filter(User.role == req.role).first()
    if not user:
        # Fallback to create or find first
        user = db.query(User).first()
        if not user:
            raise HTTPException(status_code=404, detail="No users found in database.")
            
    token = create_access_token({
        "sub": str(user.id),
        "username": user.username,
        "email": user.email,
        "role": req.role
    })
    
    user_dict = user.to_dict()
    user_dict["role"] = req.role
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user_dict
    }

@router.get("/me", response_model=UserResponse)
def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_sync_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header.")
    token = authorization.split(" ")[1]
    payload = verify_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired access token.")
        
    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return user.to_dict()

@router.get("/demo-users")
def get_demo_users(db: Session = Depends(get_sync_db)):
    """Provides evaluators with pre-configured personas and passwords."""
    users = db.query(User).all()
    return [
        {
            "role": u.role,
            "username": u.username,
            "email": u.email,
            "full_name": u.full_name,
            "demo_password": f"{u.role.capitalize()}123!" if not u.role.startswith("support_") else f"{u.role.split('_')[1].capitalize()}123!"
        }
        for u in users
    ]
