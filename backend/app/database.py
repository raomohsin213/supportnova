from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from sqlalchemy import create_engine
from app.config import settings

class Base(DeclarativeBase):
    pass

# Async Engine and Session
async_engine = create_async_engine(
    settings.ASYNC_DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False}
)
AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

# Sync Engine and Session (for CLI/seed scripts and synchronous operations)
sync_engine = create_engine(
    settings.SYNC_DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False}
)
SyncSessionLocal = sessionmaker(
    bind=sync_engine,
    autocommit=False,
    autoflush=False
)

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

def get_sync_db():
    db = SyncSessionLocal()
    try:
        yield db
    finally:
        db.close()

async def init_db():
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        try:
            from sqlalchemy import text
            cur = await conn.execute(text("PRAGMA table_info(complaint_tickets)"))
            cols = [r[1] for r in cur.fetchall()]
            if cols and "conversation_history_json" not in cols:
                await conn.execute(text("ALTER TABLE complaint_tickets ADD COLUMN conversation_history_json TEXT DEFAULT '[]'"))
        except Exception:
            pass

def init_sync_db():
    Base.metadata.create_all(bind=sync_engine)
    try:
        with sync_engine.connect() as conn:
            from sqlalchemy import text
            cur = conn.execute(text("PRAGMA table_info(complaint_tickets)"))
            cols = [r[1] for r in cur.fetchall()]
            if cols and "conversation_history_json" not in cols:
                conn.execute(text("ALTER TABLE complaint_tickets ADD COLUMN conversation_history_json TEXT DEFAULT '[]'"))
                conn.commit()
    except Exception:
        pass
