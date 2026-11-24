import unittest

from fastapi.testclient import TestClient

from app.main import app


class ApiTests(unittest.TestCase):
    client = TestClient(app)

    def test_health(self) -> None:
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "ok")

    def test_demo_is_valid_feature_collection(self) -> None:
        response = self.client.get("/api/v1/demo/risks.geojson")
        body = response.json()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(body["type"], "FeatureCollection")
        self.assertGreaterEqual(len(body["features"]), 4)

    def test_rejects_unexpected_fields(self) -> None:
        response = self.client.post(
            "/api/v1/risk/evaluate",
            json={
                "unit_id": "TEST-API",
                "hazard": 0.5,
                "exposure": 0.5,
                "vulnerability": {
                    "physical": 0.5,
                    "social": 0.5,
                    "economic": 0.5,
                    "environmental": 0.5,
                },
                "unexpected": "blocked",
            },
        )
        self.assertEqual(response.status_code, 422)


if __name__ == "__main__":
    unittest.main()
