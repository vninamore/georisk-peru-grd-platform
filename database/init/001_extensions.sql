CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS georisk;
COMMENT ON SCHEMA georisk IS 'GeoRisk Peru disaster-risk analytics domain';
