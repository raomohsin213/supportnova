from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db, SyncSessionLocal
from app.models.policy import PolicyChunk
from app.services.vector_store import vector_store
from app.api.complaints import router as complaints_router
from app.api.tickets import router as tickets_router
from app.api.policies import router as policies_router
from app.api.rule_matrix import router as rule_matrix_router
from app.api.analytics import router as analytics_router
from app.api.auth import router as auth_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    await init_db()
    
    # Load all chunks from DB into vector store index
    db = SyncSessionLocal()
    try:
        chunks = db.query(PolicyChunk).all()
        if chunks:
            chunk_data = [
                {
                    "chunk_id": c.chunk_id,
                    "doc_id": c.doc_id,
                    "section_id": c.section_id,
                    "heading": c.heading,
                    "content": c.content,
                    "category": c.category,
                    "version": c.version,
                    "status": c.status
                }
                for c in chunks
            ]
            vector_store.add_chunks(chunk_data)
            print(f"[Startup] Loaded and indexed {len(chunk_data)} policy chunks into semantic vector store.")
    finally:
        db.close()
        
    yield
    print("[Shutdown] SupportNova Engine safely shutdown.")

app = FastAPI(
    title="SupportNova AI Complaint Intelligence & Autonomous Governance System",
    description="TechWiz 7 ResponseX Intelligence Dual-Pipeline AI Governance and Deterministic Ground-Truth Engine",
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers under /api
app.include_router(complaints_router, prefix="/api")
app.include_router(tickets_router, prefix="/api")
app.include_router(policies_router, prefix="/api")
app.include_router(rule_matrix_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")
app.include_router(auth_router, prefix="/api")

@app.get("/")
def root():
    return {
        "system": settings.PROJECT_NAME,
        "theme": settings.THEME,
        "version": settings.VERSION,
        "status": "Operational",
        "dual_pipeline_active": True,
        "docs_url": "/docs"
    }

@app.get("/health")
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "database": "sqlite_connected",
        "gemini_model": settings.GEMINI_MODEL,
        "vector_store_chunks": len(vector_store.chunks_db)
    }
