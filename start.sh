#!/usr/bin/env bash
# =======================================================================
# SupportNova - Application Launcher for macOS / Linux
# =======================================================================

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

echo "======================================================================="
echo "           SupportNova - Launching Application Services"
echo "======================================================================="
echo ""

# Activate virtual environment if present
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Cleanup handler for graceful shutdown on Ctrl+C
cleanup() {
    echo ""
    echo "Stopping SupportNova services..."
    if [ -n "$BACKEND_PID" ]; then
        kill "$BACKEND_PID" 2>/dev/null || true
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill "$FRONTEND_PID" 2>/dev/null || true
    fi
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# 1. Start Backend FastAPI Server
echo "[1/2] Launching Backend on http://127.0.0.1:8000 ..."
cd "$PROJECT_ROOT/backend"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload &
BACKEND_PID=$!
cd "$PROJECT_ROOT"

# Wait for backend
sleep 2

# 2. Start Frontend Vite Dev Server
echo "[2/2] Launching Frontend on http://localhost:5173 ..."
cd "$PROJECT_ROOT/frontend"
npm run dev &
FRONTEND_PID=$!
cd "$PROJECT_ROOT"

# Open browser if open/xdg-open available
sleep 2
if command -v open &>/dev/null; then
    open "http://localhost:5173"
elif command -v xdg-open &>/dev/null; then
    xdg-open "http://localhost:5173" 2>/dev/null || true
fi

echo ""
echo "======================================================================="
echo "SupportNova is now running!"
echo ""
echo "  * Web Application:  http://localhost:5173"
echo "  * Backend REST API: http://127.0.0.1:8000/api"
echo "  * Swagger API Docs: http://127.0.0.1:8000/docs"
echo "  * Health Endpoint:  http://127.0.0.1:8000/api/health"
echo ""
echo "Press Ctrl+C to shut down all services."
echo "======================================================================="

# Keep script running to maintain processes
wait
