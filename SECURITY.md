# Seguridad

No publique secretos, credenciales, datos personales ni información territorial restringida.

Para reportar una vulnerabilidad, abra un aviso privado de seguridad en GitHub. Incluya impacto, versión afectada y pasos de reproducción. No publique detalles explotables en un issue abierto.

En producción:

- Reemplace todas las credenciales de ejemplo.
- Use TLS, secretos administrados y mínimo privilegio.
- Restrinja CORS y acceso a PostGIS.
- Valide tamaño, geometría, CRS y procedencia de cada carga.
- Ejecute análisis de dependencias y contenedores.
