"""
MongoDB Atlas Database Service for SupportNova.
Aptech TechWiz 7 - ResponseX Intelligence Primary NoSQL Store.
Provides async (Motor) and sync (PyMongo) connections to MongoDB Atlas Cluster0.
"""

import logging
from typing import Optional, Dict, Any, List
from datetime import datetime
import pymongo
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import settings

logger = logging.getLogger("supportnova.mongodb")

_sync_client: Optional[pymongo.MongoClient] = None
_async_client: Optional[AsyncIOMotorClient] = None

def get_sync_mongo_client() -> Optional[pymongo.MongoClient]:
    global _sync_client
    if _sync_client is None and settings.MONGODB_URI:
        try:
            _sync_client = pymongo.MongoClient(
                settings.MONGODB_URI,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=5000
            )
        except Exception as e:
            logger.error(f"Failed to create sync MongoDB client: {e}")
            return None
    return _sync_client

def get_sync_mongo_db() -> Optional[pymongo.database.Database]:
    client = get_sync_mongo_client()
    if client:
        return client[settings.MONGODB_DB_NAME]
    return None

def get_async_mongo_client() -> Optional[AsyncIOMotorClient]:
    global _async_client
    if _async_client is None and settings.MONGODB_URI:
        try:
            _async_client = AsyncIOMotorClient(
                settings.MONGODB_URI,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=5000
            )
        except Exception as e:
            logger.error(f"Failed to create async Motor client: {e}")
            return None
    return _async_client

def get_async_mongo_db() -> Optional[AsyncIOMotorDatabase]:
    client = get_async_mongo_client()
    if client:
        return client[settings.MONGODB_DB_NAME]
    return None

def ping_mongodb() -> Dict[str, Any]:
    """Tests connectivity to MongoDB Atlas Cluster and returns collection counts."""
    client = get_sync_mongo_client()
    if not client:
        return {"status": "unconfigured", "error": "No MONGODB_URI configured"}
    try:
        res = client.admin.command('ping')
        db = client[settings.MONGODB_DB_NAME]
        collections = db.list_collection_names()
        counts = {c: db[c].count_documents({}) for c in collections if not c.startswith("system")}
        return {
            "status": "connected",
            "cluster": "MongoDB Atlas (Cluster0)",
            "database": settings.MONGODB_DB_NAME,
            "ping": res.get("ok", 0) == 1,
            "collections": counts
        }
    except Exception as e:
        logger.warning(f"MongoDB ping failed: {e}")
        return {"status": "error", "error": str(e)}

async def sync_ticket_to_mongo(ticket_data: Dict[str, Any]) -> bool:
    """Inserts or updates a ticket in MongoDB Atlas asynchronously."""
    try:
        db = get_async_mongo_db()
        if db is None:
            return False
        doc = dict(ticket_data)
        doc.pop("_id", None)
        complaint_id = doc.get("complaint_id")
        if not complaint_id:
            return False
        
        doc["updated_at_mongo"] = datetime.utcnow().isoformat() + "Z"
        await db.complaint_tickets.update_one(
            {"complaint_id": complaint_id},
            {"$set": doc},
            upsert=True
        )
        return True
    except Exception as e:
        logger.warning(f"Failed to sync ticket {ticket_data.get('complaint_id')} to MongoDB: {e}")
        return False

def sync_ticket_to_mongo_sync(ticket_data: Dict[str, Any]) -> bool:
    """Inserts or updates a ticket in MongoDB Atlas synchronously."""
    try:
        db = get_sync_mongo_db()
        if db is None:
            return False
        doc = dict(ticket_data)
        doc.pop("_id", None)
        complaint_id = doc.get("complaint_id")
        if not complaint_id:
            return False
        
        doc["updated_at_mongo"] = datetime.utcnow().isoformat() + "Z"
        db.complaint_tickets.update_one(
            {"complaint_id": complaint_id},
            {"$set": doc},
            upsert=True
        )
        return True
    except Exception as e:
        logger.warning(f"Failed sync to MongoDB (sync): {e}")
        return False
