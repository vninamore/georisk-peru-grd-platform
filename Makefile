.PHONY: help test lint format run-api run-web up down sample

help:
	@echo "GeoRisk Peru"
	@echo "  make test     Ejecuta pruebas Python"
	@echo "  make lint     Verifica formato y tipos"
	@echo "  make up       Inicia el stack Docker"
	@echo "  make down     Detiene el stack"
	@echo "  make sample   Regenera datos sintéticos"

test:
	cd backend && python -m unittest discover -s tests -v

lint:
	cd backend && ruff check app tests && mypy app
	cd frontend && npm run lint && npm run typecheck

format:
	cd backend && ruff format app tests

run-api:
	cd backend && uvicorn app.main:app --reload

run-web:
	cd frontend && npm run dev

up:
	docker compose up --build

down:
	docker compose down -v

sample:
	python scripts/generate_sample_data.py
