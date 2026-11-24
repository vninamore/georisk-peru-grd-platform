"""Robust indicator normalization functions."""

from collections.abc import Iterable


def min_max(values: Iterable[float], *, invert: bool = False) -> list[float]:
    """Normalize numeric indicators to [0, 1], optionally reversing direction."""

    data = list(values)
    if not data:
        return []
    lower, upper = min(data), max(data)
    if upper == lower:
        normalized = [0.0 for _ in data]
    else:
        normalized = [(value - lower) / (upper - lower) for value in data]
    if invert:
        normalized = [1.0 - value for value in normalized]
    return [round(value, 6) for value in normalized]


def winsorize(
    values: Iterable[float], lower: float = 0.02, upper: float = 0.98
) -> list[float]:
    """Clip outliers using dependency-free empirical quantiles."""

    if not 0 <= lower < upper <= 1:
        raise ValueError("quantiles must satisfy 0 <= lower < upper <= 1")
    data = list(values)
    if not data:
        return []
    ordered = sorted(data)
    low_value = ordered[round((len(ordered) - 1) * lower)]
    high_value = ordered[round((len(ordered) - 1) * upper)]
    return [min(max(value, low_value), high_value) for value in data]
