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

# 1. Activate Python virtual environment
if [ -d ".venv" ]; then
    source .venv/bin/activate
else
    echo "Creating virtual environment..."
    uv venv .venv
    source .venv/bin/activate
    uv pip install fastapi uvicorn pydantic numpy scipy scikit-learn pytest httpx jinja2
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
echo ">> [2/2] Launching Vite Frontend on http://127.0.0.1:5173 ..."
npm --prefix frontend run dev -- --host 127.0.0.1 --port 5173 &
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
