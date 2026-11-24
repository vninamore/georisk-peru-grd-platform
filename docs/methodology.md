# Metodología de análisis de riesgo

## Marco conceptual

El proyecto representa el riesgo como interacción entre:

- **Peligro (P):** probabilidad o intensidad relativa del fenómeno.
- **Exposición (E):** personas, infraestructura, actividades y ecosistemas potencialmente afectados.
- **Vulnerabilidad (V):** susceptibilidad física, social, económica y ambiental.

La formulación demostrativa es:

```text
V = 0.35·Vfísica + 0.30·Vsocial + 0.20·Veconómica + 0.15·Vambiental
R = P × E × V
```

Todos los índices se normalizan entre 0 y 1. Los pesos son explícitos, versionados y deben sumar 1.

## Clasificación

| Índice de riesgo | Nivel | Uso analítico |
|---:|---|---|
| 0.00–0.15 | Bajo | Seguimiento |
| >0.15–0.30 | Medio | Prevención focalizada |
| >0.30–0.50 | Alto | Evaluación prioritaria |
| >0.50–1.00 | Muy alto | Acción y validación urgente |

Los umbrales son parámetros demostrativos. Una aplicación institucional debe calibrarlos con expertos, evidencia histórica y sensibilidad territorial.

## Flujo recomendado

1. Definir unidad espacial, escala, fenómeno y horizonte temporal.
2. Inventariar fuentes, fecha, resolución, licencia y calidad.
3. Homogeneizar CRS y resolución espacial.
4. Corregir geometrías y controlar duplicados.
5. Construir indicadores con dirección semántica explícita.
6. Normalizar, tratar valores atípicos y documentar faltantes.
7. Calcular subíndices y ejecutar análisis de sensibilidad.
8. Validar con eventos observados y conocimiento local.
9. Comunicar incertidumbre, limitaciones y fecha de vigencia.

## Confianza e incertidumbre

`confidence` expresa confianza en los insumos y produce un valor ajustado separado. El sistema conserva el riesgo bruto para evitar ocultar el efecto de datos incompletos. En producción se recomienda estimar intervalos mediante Monte Carlo y reportar sensibilidad por variable.

## Limitaciones

- Un índice compuesto simplifica procesos complejos.
- La resolución espacial condiciona el uso de resultados.
- Correlación entre indicadores puede duplicar información.
- Pesos y umbrales requieren validación participativa.
- El resultado no reemplaza inspección, evaluación EVAR ni decisión experta.
