from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .analyzer import analyze_incident

app = FastAPI(title="AI DevOps Incident Analyzer")

# Enable CORS so the frontend/backend can communicate with the AI service
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class IncidentRequest(BaseModel):
    logs: str
    metrics: dict = {}
    service: str = "Unknown Service"
    deployment: str = ""


@app.get("/")
def health():
    return {"status": "AI service running"}


@app.post("/analyze")
def analyze(request: IncidentRequest):
    return analyze_incident(
        request.logs,
        request.metrics,
        request.service,
        request.deployment
    )