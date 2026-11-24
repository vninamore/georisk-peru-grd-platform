import unittest

from georisk_etl.normalize import min_max
from georisk_etl.quality import validate_feature_collection


class PipelineTests(unittest.TestCase):
    def test_valid_collection(self) -> None:
        report = validate_feature_collection(
            {
                "type": "FeatureCollection",
                "features": [
                    {
                        "type": "Feature",
                        "id": "A",
                        "geometry": {"type": "Point", "coordinates": [-77.0, -12.0]},
                        "properties": {},
                    }
                ],
            }
        )
        self.assertTrue(report.passed)
        self.assertEqual(report.completeness, 1.0)

    def test_duplicate_ids_fail(self) -> None:
        feature = {
            "type": "Feature",
            "id": "A",
            "geometry": {"type": "Point", "coordinates": [-77.0, -12.0]},
            "properties": {},
        }
        report = validate_feature_collection(
            {"type": "FeatureCollection", "features": [feature, feature]}
        )
        self.assertFalse(report.passed)

    def test_min_max(self) -> None:
        self.assertEqual(min_max([10, 20, 30]), [0.0, 0.5, 1.0])


if __name__ == "__main__":
    unittest.main()
