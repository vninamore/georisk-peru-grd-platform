import unittest

from pydantic import ValidationError

from app.models import RiskLevel, RiskRequest
from app.risk_engine import classify_risk, evaluate_risk, validate_weights


class RiskEngineTests(unittest.TestCase):
    def setUp(self) -> None:
        self.payload = {
            "unit_id": "TEST-001",
            "hazard_type": "flood",
            "hazard": 0.8,
            "exposure": 0.7,
            "vulnerability": {
                "physical": 0.9,
                "social": 0.6,
                "economic": 0.5,
                "environmental": 0.4,
            },
        }

    def test_weighted_risk_is_reproducible(self) -> None:
        result = evaluate_risk(RiskRequest.model_validate(self.payload))
        self.assertAlmostEqual(result.vulnerability_index, 0.655)
        self.assertAlmostEqual(result.risk_score, 0.3668)
        self.assertEqual(result.risk_level, RiskLevel.HIGH)

    def test_invalid_normalized_value_is_rejected(self) -> None:
        self.payload["hazard"] = 1.1
        with self.assertRaises(ValidationError):
            RiskRequest.model_validate(self.payload)

    def test_threshold_boundaries_are_explicit(self) -> None:
        self.assertEqual(classify_risk(0.15), RiskLevel.LOW)
        self.assertEqual(classify_risk(0.30), RiskLevel.MEDIUM)
        self.assertEqual(classify_risk(0.50), RiskLevel.HIGH)
        self.assertEqual(classify_risk(0.51), RiskLevel.VERY_HIGH)

    def test_weights_must_sum_to_one(self) -> None:
        with self.assertRaisesRegex(ValueError, "sum to 1.0"):
            validate_weights(
                {"physical": 0.3, "social": 0.3, "economic": 0.2, "environmental": 0.1}
            )


if __name__ == "__main__":
    unittest.main()
