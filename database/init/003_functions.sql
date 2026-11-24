SET search_path TO georisk, public;

CREATE OR REPLACE FUNCTION classify_risk(score numeric)
RETURNS georisk.risk_level
LANGUAGE sql
IMMUTABLE
STRICT
AS $$
    SELECT CASE
        WHEN score <= 0.15 THEN 'low'::georisk.risk_level
        WHEN score <= 0.30 THEN 'medium'::georisk.risk_level
        WHEN score <= 0.50 THEN 'high'::georisk.risk_level
        ELSE 'very_high'::georisk.risk_level
    END;
$$;

CREATE OR REPLACE FUNCTION calculate_vulnerability(
    physical numeric,
    social numeric,
    economic numeric,
    environmental numeric
)
RETURNS numeric
LANGUAGE sql
IMMUTABLE
STRICT
AS $$
    SELECT round(
        0.35 * physical +
        0.30 * social +
        0.20 * economic +
        0.15 * environmental,
        6
    );
$$;

CREATE OR REPLACE VIEW risk_priorities AS
SELECT
    tu.external_id,
    tu.name AS territorial_unit,
    hs.code AS scenario_code,
    hs.hazard,
    ra.hazard_index,
    ra.exposure_index,
    ra.vulnerability_index,
    ra.risk_score,
    ra.risk_level,
    ra.confidence,
    ST_AsGeoJSON(ST_PointOnSurface(tu.geom))::jsonb AS representative_point
FROM risk_assessment ra
JOIN territorial_unit tu ON tu.id = ra.territorial_unit_id
JOIN hazard_scenario hs ON hs.id = ra.scenario_id
ORDER BY ra.risk_score DESC;

CREATE OR REPLACE FUNCTION assets_within_distance(
    longitude double precision,
    latitude double precision,
    distance_meters double precision
)
RETURNS TABLE (
    asset_id uuid,
    asset_type text,
    asset_name text,
    distance_m double precision
)
LANGUAGE sql
STABLE
AS $$
    SELECT
        ea.id,
        ea.asset_type,
        ea.name,
        ST_Distance(
            ea.geom::geography,
            ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
        )
    FROM exposed_asset ea
    WHERE ST_DWithin(
        ea.geom::geography,
        ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
        distance_meters
    )
    -- Positional ordering avoids ambiguity with the RETURNS TABLE output name.
    ORDER BY 4 ASC;
$$;
