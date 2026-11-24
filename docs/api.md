# API

Base local: `http://localhost:8000/api/v1`

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | Estado del servicio |
| GET | `/api/v1/catalog` | Peligros, formatos y versión |
| POST | `/api/v1/risk/evaluate` | Evalúa una unidad |
| POST | `/api/v1/risk/batch` | Evalúa hasta 1,000 escenarios |
| GET | `/api/v1/demo/risks.geojson` | FeatureCollection sintética |

## Errores

- `422`: contrato inválido, valores fuera de rango o campos inesperados.
- `500`: fallo no controlado; debe generar un identificador de correlación en producción.

## Versionado

La versión mayor forma parte de la URL. Cambios compatibles se documentan en OpenAPI; cambios de fórmula incrementan `method_version` y no sobrescriben evaluaciones históricas.
