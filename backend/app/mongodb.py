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

async def sync_customer_purchase(purchase_data: Dict[str, Any]) -> bool:
    """Saves a customer purchase record to MongoDB Atlas."""
    try:
        db = get_async_mongo_db()
        if db is None:
            return False
        doc = dict(purchase_data)
        doc.pop("_id", None)
        doc["updated_at_mongo"] = datetime.utcnow().isoformat() + "Z"
        # Upsert by order_id + customer_email
        filter_key = {}
        if doc.get("order_id"):
            filter_key["order_id"] = doc["order_id"]
        if doc.get("customer_email"):
            filter_key["customer_email"] = doc["customer_email"]
        if not filter_key:
            filter_key = {"order_id": doc.get("order_id", f"ORD-{datetime.utcnow().timestamp()}")}
        await db.customer_purchases.update_one(
            filter_key,
            {"$set": doc},
            upsert=True
        )
        return True
    except Exception as e:
        logger.warning(f"Failed to sync purchase to MongoDB: {e}")
        return False

async def sync_customer_activity(activity_data: Dict[str, Any]) -> bool:
    """Saves a customer activity event (login, complaint, reply, close) to MongoDB Atlas."""
    try:
        db = get_async_mongo_db()
        if db is None:
            return False
        doc = dict(activity_data)
        doc.pop("_id", None)
        doc["recorded_at"] = datetime.utcnow().isoformat() + "Z"
        await db.customer_activity_log.insert_one(doc)
        return True
    except Exception as e:
        logger.warning(f"Failed to sync customer activity to MongoDB: {e}")
        return False

async def get_customer_history(customer_email: str) -> Dict[str, Any]:
    """Retrieves a customer's full history from MongoDB Atlas (purchases, complaints, activity)."""
    try:
        db = get_async_mongo_db()
        if db is None:
            return {"error": "MongoDB not configured"}
        
        purchases = []
        async for doc in db.customer_purchases.find({"customer_email": customer_email}).sort("updated_at_mongo", -1):
            doc.pop("_id", None)
            purchases.append(doc)
        
        complaints = []
        async for doc in db.complaint_tickets.find({"customer_email": customer_email}).sort("created_at", -1):
            doc.pop("_id", None)
            complaints.append(doc)
        
        activity = []
        async for doc in db.customer_activity_log.find({"customer_email": customer_email}).sort("recorded_at", -1).limit(50):
            doc.pop("_id", None)
            activity.append(doc)
        
        return {
            "customer_email": customer_email,
            "purchases": purchases,
            "complaints": complaints,
            "activity_log": activity,
            "total_purchases": len(purchases),
            "total_complaints": len(complaints)
        }
    except Exception as e:
        logger.warning(f"Failed to get customer history: {e}")
        return {"error": str(e)}

async def sync_policy_to_mongo(doc_data: Dict[str, Any], chunks_data: Optional[List[Dict[str, Any]]] = None) -> bool:
    """Saves or updates a policy document and its chunks in MongoDB Atlas."""
    try:
        db = get_async_mongo_db()
        if db is None:
            return False
        doc = dict(doc_data)
        doc.pop("_id", None)
        doc["updated_at_mongo"] = datetime.utcnow().isoformat() + "Z"
        await db.policy_documents.update_one(
            {"doc_id": doc["doc_id"]},
            {"$set": doc},
            upsert=True
        )
        if chunks_data is not None:
            await db.policy_chunks.delete_many({"doc_id": doc["doc_id"]})
            if chunks_data:
                cleaned_chunks = []
                for ch in chunks_data:
                    c = dict(ch)
                    c.pop("_id", None)
                    c["doc_id"] = doc["doc_id"]
                    cleaned_chunks.append(c)
                await db.policy_chunks.insert_many(cleaned_chunks)
        return True
    except Exception as e:
        logger.warning(f"Failed to sync policy {doc_data.get('doc_id')} to MongoDB: {e}")
        return False

async def delete_policy_from_mongo(doc_id: str) -> bool:
    """Deletes a policy document and its chunks from MongoDB Atlas."""
    try:
        db = get_async_mongo_db()
        if db is None:
            return False
        await db.policy_documents.delete_one({"doc_id": doc_id})
        await db.policy_chunks.delete_many({"doc_id": doc_id})
        return True
    except Exception as e:
        logger.warning(f"Failed to delete policy {doc_id} from MongoDB: {e}")
        return False
