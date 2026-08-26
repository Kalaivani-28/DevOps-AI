# AI-Powered DevOps Incident & Root-Cause Analyzer

This repository implements the project described in the supplied specification: a full-stack system for incident detection, log analysis, root-cause analysis and recommended corrective actions. The architecture uses React, Spring Boot, PostgreSQL and a Python FastAPI AI analysis service, with Prometheus/Grafana and Docker prepared for expansion.

## Project flow
Application -> Logs/Metrics -> Incident Detection -> Spring Boot API -> AI Analysis -> Root Cause -> Recommended Solution -> React Dashboard

## Folder structure
- backend/ — Java 17 + Spring Boot API
- ai-service/ — Python + FastAPI analysis engine
- frontend/ — React + Vite dashboard
- monitoring/ — Prometheus/Grafana configuration
- database/ — PostgreSQL schema
- docker-compose.yml — local multi-service environment

## Run with Docker
Install Docker Desktop, then from this folder run:
`docker compose up`

Open:
- Frontend: http://localhost:5173
- AI service: http://localhost:8000
- Backend: http://localhost:8080

## Run without Docker
AI service:
`cd ai-service`
`pip install -r requirements.txt`
`uvicorn app.main:app --reload --port 8000`

Frontend:
`cd frontend`
`npm install`
`npm run dev`

Backend:
`cd backend`
`mvn spring-boot:run`

## Important
The current AI service is a deterministic starter/root-cause engine. To match the full project specification, connect it to an LLM/ML model, add real metrics ingestion, JWT authentication/RBAC, incident correlation, alerting, CI/CD and cloud deployment.
