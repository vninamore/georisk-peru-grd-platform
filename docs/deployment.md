# Despliegue

## Desarrollo

```bash
cp .env.example .env
docker compose up --build
```

## Producción

1. Use imágenes fijadas por digest y registro privado.
2. Ejecute PostGIS administrado con backups y PITR.
3. Gestione secretos fuera del repositorio.
4. Termine TLS en un proxy o gateway.
5. Restrinja CORS, red de base de datos y permisos.
6. Añada migraciones transaccionales y rollback.
7. Configure logs JSON, métricas, trazas y alertas.
8. Escanee imágenes y dependencias en CI.

## Variables

| Variable | Requerida | Uso |
|---|---|---|
| `DATABASE_URL` | sí | Conexión PostGIS |
| `CORS_ORIGINS` | sí | Orígenes web permitidos |
| `VITE_API_URL` | build web | URL pública de la API |
| `LOG_LEVEL` | no | Nivel de registro |

## Respaldo

Use `pg_dump` para respaldo lógico y snapshots consistentes para recuperación. Pruebe restauraciones periódicas; un backup no verificado no es una estrategia de recuperación.
