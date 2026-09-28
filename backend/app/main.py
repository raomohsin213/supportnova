from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from app.config import settings, BASE_DIR
from app.database import init_db, SyncSessionLocal
from app.models.policy import PolicyChunk
from app.services.vector_store import vector_store
from app.api.complaints import router as complaints_router
from app.api.tickets import router as tickets_router
from app.api.policies import router as policies_router
from app.api.rule_matrix import router as rule_matrix_router
from app.api.analytics import router as analytics_router
from app.api.auth import router as auth_router
from app.api.benchmark import router as benchmark_router

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
        
    # Test MongoDB Atlas connection
    try:
        from app.mongodb import ping_mongodb
        mongo_status = ping_mongodb()
        if mongo_status.get("status") == "connected":
            print(f"[Startup] Connected to MongoDB Atlas: {mongo_status.get('cluster')} -> database: {mongo_status.get('database')}")
            print(f"[Startup] Collections in MongoDB: {mongo_status.get('collections')}")
        else:
            print(f"[Startup] MongoDB Atlas ping returned: {mongo_status}")
    except Exception as e:
        print(f"[Startup] MongoDB Atlas initialization warning: {e}")

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
app.include_router(benchmark_router, prefix="/api")

@app.get("/health")
@app.get("/api/health")
def health_check():
    from app.mongodb import ping_mongodb
    mongo_info = ping_mongodb()
    return {
        "status": "healthy",
        "database": "MongoDB Atlas (Cluster0)",
        "database_backend": "mongodb",
        "mongodb": mongo_info,
        "gemini_model": settings.GEMINI_MODEL,
        "vector_store_chunks": len(vector_store.chunks_db)
    }

@app.get("/api")
def api_status():
    return {
        "system": settings.PROJECT_NAME,
        "theme": settings.THEME,
        "version": settings.VERSION,
        "status": "Operational",
        "database": "MongoDB Atlas (Cluster0)",
        "dual_pipeline_active": True,
        "docs_url": "/docs"
    }

# -------------------------------------------------------------------------
# Static Frontend & Single-Service SPA Routing for Railway / Production
# -------------------------------------------------------------------------
_candidate_dist_dirs = [
    (BASE_DIR.parent / "frontend" / "dist").resolve(),
    (BASE_DIR / "frontend_dist").resolve(),
    (BASE_DIR / "static").resolve(),
    Path("/app/frontend/dist").resolve(),
]

frontend_dist_dir = None
for candidate in _candidate_dist_dirs:
    if candidate.exists() and (candidate / "index.html").exists():
        frontend_dist_dir = candidate
        break

if frontend_dist_dir:
    assets_dir = frontend_dist_dir / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/")
    def serve_frontend_root():
        return FileResponse(frontend_dist_dir / "index.html")

    @app.get("/{full_path:path}")
    def serve_frontend_spa(full_path: str):
        if full_path.startswith("api/") or full_path == "api":
            raise HTTPException(status_code=404, detail="API route not found")
        if full_path in ("docs", "redoc", "openapi.json"):
            raise HTTPException(status_code=404, detail="Documentation path not found")
        
        target_file = frontend_dist_dir / full_path
        if target_file.is_file():
            return FileResponse(target_file)
        return FileResponse(frontend_dist_dir / "index.html")
else:
    @app.get("/")
    def root():
        return {
            "system": settings.PROJECT_NAME,
            "theme": settings.THEME,
            "version": settings.VERSION,
            "status": "Operational",
            "database": "MongoDB Atlas (Cluster0)",
            "dual_pipeline_active": True,
            "docs_url": "/docs"
        }

