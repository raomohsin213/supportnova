"""User Authentication and Token Generation."""
import hashlib
from typing import Optional, Dict, Any

USERS_DB = {
    "admin@supportnova.io": {"role": "admin", "name": "System Administrator", "pass_hash": hashlib.sha256("Admin123!".encode()).hexdigest()},
    "manager@supportnova.io": {"role": "manager", "name": "Support Manager", "pass_hash": hashlib.sha256("Manager123!".encode()).hexdigest()},
    "agent@supportnova.io": {"role": "agent", "name": "Support Agent", "pass_hash": hashlib.sha256("Agent123!".encode()).hexdigest()},
    "customer@supportnova.io": {"role": "customer", "name": "John Doe", "pass_hash": hashlib.sha256("Customer123!".encode()).hexdigest()}
}

class AuthService:
    @staticmethod
    def authenticate(email: str, password: str) -> Optional[Dict[str, Any]]:
        user = USERS_DB.get(email.lower())
        if user and user["pass_hash"] == hashlib.sha256(password.encode()).hexdigest():
            return {"email": email, "name": user["name"], "role": user["role"], "token": f"mock-token-{user['role']}"}
        return None

auth_service = AuthService()
