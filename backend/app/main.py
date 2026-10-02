"""
Main FastAPI Application Entrypoint.
Quantum-Inspired Fuel Consumption Prediction and Green Fleet Optimization Platform (SIH26138).
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api.routes_prediction import router as pred_router
from backend.app.api.routes_optimization import router as opt_router
from backend.app.api.routes_benchmarks import router as bench_router
from backend.app.api.routes_scenarios import router as scen_router
from backend.app.api.routes_reports import router as rep_router

app = FastAPI(
    title="Quantum-Inspired Maritime Green Fleet Optimization API",
    version="1.0.0",
    description="End-to-end decision support platform integrating QIEA feature-selected fuel prediction and multi-objective quantum-inspired fleet deployment.",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for local development and Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(pred_router)
app.include_router(opt_router)
app.include_router(bench_router)
app.include_router(scen_router)
app.include_router(rep_router)


@app.get("/api/health")
def health_check():
    """System health check endpoint."""
    return {
        "status": "online",
        "service": "SIH26138-QuantumGreenFleet",
        "version": "1.0.0",
        "engines": {
            "prediction": "QIEA-GBM + Holtrop-Mennen",
            "optimization": "MO-QIEA / NSGA-II / MO-PSO",
            "compliance": "IMO MEPC.376(80) / FuelEU Maritime"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main.py:app", host="0.0.0.0", port=8000, reload=True)
