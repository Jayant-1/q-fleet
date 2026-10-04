#!/usr/bin/env bash
set -e

# Quantum-Inspired Fuel Consumption Prediction and Green Fleet Optimization Platform (SIH26138)
# Master Single-Command Startup Script

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "================================================================================"
echo "  SIH26138: QUANTUM-INSPIRED GREEN FLEET OPTIMIZATION PLATFORM"
echo "  Style: Data as Art | Responsive & Adaptive Art Direction"
echo "================================================================================"

# 1. Activate or create Python virtual environment
if [ -d ".venv" ]; then
    source .venv/bin/activate
else
    echo "Creating virtual environment..."
    if command -v uv >/dev/null 2>&1; then
        uv venv .venv
        source .venv/bin/activate
        uv pip install -r requirements.txt
    else
        python3 -m venv .venv
        source .venv/bin/activate
        python3 -m pip install --upgrade pip
        python3 -m pip install -r requirements.txt
    fi
fi

# Detect Node package manager (pnpm preferred, fallback to npm)
if command -v pnpm >/dev/null 2>&1; then
    PKG_MGR="pnpm"
    INSTALL_CMD="pnpm --prefix frontend install"
    DEV_CMD="pnpm --prefix frontend run dev -- --host 127.0.0.1 --port 5173"
elif command -v npm >/dev/null 2>&1; then
    PKG_MGR="npm"
    INSTALL_CMD="npm --prefix frontend install"
    DEV_CMD="npm --prefix frontend run dev -- --host 127.0.0.1 --port 5173"
else
    echo ">> Error: Neither pnpm nor npm found on PATH. Please install Node.js."
    exit 1
fi

# Ensure frontend dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    echo ">> Installing frontend dependencies via $PKG_MGR..."
    $INSTALL_CMD
fi


# 2. Trap SIGINT and SIGTERM to kill background processes cleanly
cleanup() {
    echo ""
    echo ">> Shutting down Quantum Green Fleet platform services..."
    if [ -n "$BACKEND_PID" ]; then
        kill "$BACKEND_PID" 2>/dev/null || true
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill "$FRONTEND_PID" 2>/dev/null || true
    fi
    echo ">> All services terminated gracefully."
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# 3. Start FastAPI Backend Service
echo ">> [1/2] Launching FastAPI Backend on http://127.0.0.1:8000 ..."
python3 -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --log-level warning &
BACKEND_PID=$!

# Wait for backend to be ready
echo ">> Waiting for backend healthcheck..."
for i in {1..20}; do
    if curl -s http://127.0.0.1:8000/api/health >/dev/null 2>&1; then
        echo ">> Backend service online and healthy!"
        break
    fi
    sleep 0.5
done

# 4. Start Vite Frontend Service
echo ">> [2/2] Launching Vite Frontend on http://127.0.0.1:5173 via $PKG_MGR ..."
$DEV_CMD &
FRONTEND_PID=$!

echo ""
echo "================================================================================"
echo "  PLATFORM READY FOR DEMONSTRATION & MARITIME DECISION SUPPORT"
echo "  Frontend UI:  http://127.0.0.1:5173"
echo "  Backend API:   http://127.0.0.1:8000/docs"
echo "  Press Ctrl+C to stop all services."
echo "================================================================================"

# Keep running until user terminates
wait
