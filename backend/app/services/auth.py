import hmac
import hashlib
import base64
import json
import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

SECRET_KEY = os.getenv("JWT_SECRET", "supportnova-techwiz7-supersecret-jwt-key-2026")
TOKEN_EXPIRY_HOURS = 24

def hash_password(password: str) -> str:
    """Hash a password using PBKDF2-HMAC-SHA256 with a fixed salt for reproducibility."""
    salt = b"supportnova_salt_techwiz7"
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100000)
    return key.hex()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against stored PBKDF2 hash."""
    return hmac.compare_digest(hash_password(plain_password), hashed_password)

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create a signed JWT-style token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(hours=TOKEN_EXPIRY_HOURS))
    to_encode.update({"exp": expire.timestamp()})
    
    header = {"alg": "HS256", "typ": "JWT"}
    header_b64 = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
    payload_b64 = base64.urlsafe_b64encode(json.dumps(to_encode).encode()).decode().rstrip("=")
    
    signature = hmac.new(
        SECRET_KEY.encode(),
        f"{header_b64}.{payload_b64}".encode(),
        hashlib.sha256
    ).digest()
    sig_b64 = base64.urlsafe_b64encode(signature).decode().rstrip("=")
    
    return f"{header_b64}.{payload_b64}.{sig_b64}"

def verify_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Verify a signed token and extract payload if valid."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        header_b64, payload_b64, sig_b64 = parts
        
        # Verify signature
        expected_sig = hmac.new(
            SECRET_KEY.encode(),
            f"{header_b64}.{payload_b64}".encode(),
            hashlib.sha256
        ).digest()
        actual_sig = base64.urlsafe_b64decode(sig_b64 + "=="[:len(sig_b64) % 4])
        
        if not hmac.compare_digest(expected_sig, actual_sig):
            return None
            
        payload_json = base64.urlsafe_b64decode(payload_b64 + "=="[:len(payload_b64) % 4]).decode()
        payload = json.loads(payload_json)
        
        if payload.get("exp") and payload["exp"] < datetime.utcnow().timestamp():
            return None  # Expired
            
        return payload
    except Exception:
        return None
