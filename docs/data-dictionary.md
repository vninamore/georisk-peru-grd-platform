# Diccionario de datos

## Evaluación de riesgo

| Campo | Tipo | Dominio | Descripción |
|---|---|---|---|
| `unit_id` | texto | identificador único | Unidad territorial |
| `hazard_type` | enum | flood, landslide, earthquake, wildfire | Tipo de peligro |
| `hazard_index` | decimal | 0–1 | Intensidad/probabilidad normalizada |
| `exposure_index` | decimal | 0–1 | Exposición normalizada |
| `vulnerability_physical` | decimal | 0–1 | Fragilidad constructiva/física |
| `vulnerability_social` | decimal | 0–1 | Condiciones sociales relevantes |
| `vulnerability_economic` | decimal | 0–1 | Capacidad y pérdidas económicas relativas |
| `vulnerability_environmental` | decimal | 0–1 | Fragilidad ambiental |
| `vulnerability_index` | decimal | 0–1 | Agregación ponderada |
| `risk_score` | decimal | 0–1 | Índice compuesto auditable |
| `risk_level` | enum | low, medium, high, very_high | Clase ordinal |
| `confidence` | decimal | 0–1 | Confianza en insumos |
| `method_version` | texto | SemVer | Versión de fórmula y parámetros |

## Convenciones espaciales

- Intercambio web: EPSG:4326.
- Análisis métrico en Lima: EPSG:32718 cuando corresponda.
- Longitud antes que latitud en GeoJSON.
- Geometrías PostGIS con SRID no nulo.
- Fuentes raster productivas: preferentemente COG con NoData documentado.

## Calidad mínima

| Dimensión | Control |
|---|---|
| Completitud | porcentaje de registros válidos |
| Unicidad | combinación unidad + escenario + versión |
| Validez | geometrías y rangos permitidos |
| Consistencia | CRS, fecha y semántica común |
| Actualidad | fecha de fuente y vigencia |
| Linaje | fuente, licencia, transformación y responsable |
