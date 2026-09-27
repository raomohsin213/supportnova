#!/usr/bin/env bash
# =======================================================================
# SupportNova - Automated Installation & Setup Wizard for macOS / Linux
# =======================================================================

set -e
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

echo "======================================================================="
echo "       SupportNova - Automated Installation & Setup Wizard"
echo "======================================================================="
echo ""

# 1. Determine Python command
PYTHON_CMD=""
if command -v python3 &>/dev/null; then
    PYTHON_CMD="python3"
elif command -v python &>/dev/null; then
    PYTHON_CMD="python"
else
    echo "[ERROR] Python 3 is not installed or not in PATH!"
    echo "Please install Python 3.11+ using your package manager (e.g. brew install python3 or apt install python3 python3-venv)"
    exit 1
fi
echo "[1/6] Using Python: $($PYTHON_CMD --version)"

# 2. Check Node.js and npm
echo ""
echo "[2/6] Checking Node.js and npm..."
if ! command -v node &>/dev/null; then
    echo "[ERROR] Node.js is not installed! Please install Node.js v18+ (https://nodejs.org/)"
    exit 1
fi
if ! command -v npm &>/dev/null; then
    echo "[ERROR] npm is not found in PATH!"
    exit 1
fi
echo "Node: $(node -v) | npm: $(npm -v)"

# 3. Setup Virtual Environment
echo ""
echo "[3/6] Setting up Python virtual environment..."
if [ ! -d "venv" ]; then
    echo "Creating virtual environment in ./venv ..."
    $PYTHON_CMD -m venv venv
fi
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# 4. Environment File Setup
echo ""
echo "[4/6] Checking .env configuration..."
if [ ! -f ".env" ]; then
    echo "Copying .env.example to .env ..."
    cp .env.example .env
    echo "[OK] Created .env"
else
    echo "[OK] .env already exists."
fi

# 5. Seed Database & Generate Test PDFs
echo ""
echo "[5/6] Initializing database and generating test assets..."
cd backend
python -m app.seeds.seed_data || echo "[WARNING] Database seed encountered an issue, continuing..."
cd "$PROJECT_ROOT"

python generate_test_pdfs.py || echo "[WARNING] PDF generation encountered an issue, continuing..."

# 6. Frontend Dependencies
echo ""
echo "[6/6] Installing frontend npm packages..."
cd frontend
npm install
cd "$PROJECT_ROOT"

chmod +x start.sh 2>/dev/null || true

echo ""
echo "======================================================================="
echo "           [SUCCESS] Setup Completed Successfully!"
echo "======================================================================="
echo ""
echo "To launch SupportNova, run:"
echo "   ./start.sh"
echo ""
echo "Or run the automated test suite with:"
echo "   source venv/bin/activate && pytest backend/tests/ -v"
echo ""
