SET search_path TO georisk, public;

CREATE TYPE hazard_type AS ENUM ('flood', 'landslide', 'earthquake', 'wildfire');
CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high', 'very_high');

CREATE TABLE territorial_unit (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id text NOT NULL UNIQUE,
    name text NOT NULL,
    admin_level smallint NOT NULL CHECK (admin_level BETWEEN 0 AND 5),
    ubigeo text,
    geom geometry(MultiPolygon, 4326) NOT NULL,
    source text NOT NULL,
    source_date date,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE hazard_scenario (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code text NOT NULL UNIQUE,
    name text NOT NULL,
    hazard hazard_type NOT NULL,
    return_period_years integer CHECK (return_period_years > 0),
    model_version text NOT NULL,
    source text NOT NULL,
    valid_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE risk_assessment (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    territorial_unit_id uuid NOT NULL REFERENCES territorial_unit(id) ON DELETE CASCADE,
    scenario_id uuid NOT NULL REFERENCES hazard_scenario(id) ON DELETE CASCADE,
    hazard_index numeric(8,6) NOT NULL CHECK (hazard_index BETWEEN 0 AND 1),
    exposure_index numeric(8,6) NOT NULL CHECK (exposure_index BETWEEN 0 AND 1),
    vulnerability_physical numeric(8,6) NOT NULL CHECK (vulnerability_physical BETWEEN 0 AND 1),
    vulnerability_social numeric(8,6) NOT NULL CHECK (vulnerability_social BETWEEN 0 AND 1),
    vulnerability_economic numeric(8,6) NOT NULL CHECK (vulnerability_economic BETWEEN 0 AND 1),
    vulnerability_environmental numeric(8,6) NOT NULL CHECK (vulnerability_environmental BETWEEN 0 AND 1),
    vulnerability_index numeric(8,6) NOT NULL CHECK (vulnerability_index BETWEEN 0 AND 1),
    risk_score numeric(8,6) NOT NULL CHECK (risk_score BETWEEN 0 AND 1),
    risk_level risk_level NOT NULL,
    confidence numeric(8,6) NOT NULL DEFAULT 1 CHECK (confidence BETWEEN 0 AND 1),
    method_version text NOT NULL,
    assessed_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (territorial_unit_id, scenario_id, method_version)
);

CREATE TABLE exposed_asset (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_type text NOT NULL,
    name text,
    population integer CHECK (population IS NULL OR population >= 0),
    replacement_value numeric(16,2) CHECK (replacement_value IS NULL OR replacement_value >= 0),
    criticality smallint CHECK (criticality BETWEEN 1 AND 5),
    geom geometry(Geometry, 4326) NOT NULL,
    source text NOT NULL,
    attributes jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX territorial_unit_geom_gix ON territorial_unit USING gist (geom);
CREATE INDEX exposed_asset_geom_gix ON exposed_asset USING gist (geom);
CREATE INDEX risk_assessment_score_idx ON risk_assessment (risk_score DESC);
CREATE INDEX risk_assessment_scenario_idx ON risk_assessment (scenario_id);
CREATE INDEX exposed_asset_attributes_gin ON exposed_asset USING gin (attributes);

COMMENT ON COLUMN risk_assessment.confidence IS 'Input-data confidence; does not replace the auditable raw risk score';
