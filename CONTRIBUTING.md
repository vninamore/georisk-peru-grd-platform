# Contribuir a GeoRisk Peru

Gracias por contribuir. El proyecto prioriza trazabilidad, claridad metodológica e interoperabilidad.

## Flujo

1. Cree una rama desde `main`.
2. Describa el problema y el criterio de aceptación.
3. Añada pruebas para cada cambio funcional.
4. Documente nuevos campos, fuentes y supuestos.
5. Ejecute `make test` y `make lint`.
6. Abra un pull request pequeño y revisable.

## Convenciones

- Python: Ruff, tipos y docstrings en lógica pública.
- TypeScript: modo estricto, componentes accesibles y sin `any` implícito.
- SQL: nombres `snake_case`, SRID explícito e índices espaciales.
- Datos: no versionar información personal, restringida o con licencia incompatible.
- Modelos: documentar variables, pesos, umbrales, sesgos y limitaciones.

## Commits

Use Conventional Commits: `feat:`, `fix:`, `docs:`, `test:`, `refactor:` o `chore:`.
