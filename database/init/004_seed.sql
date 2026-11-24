SET search_path TO georisk, public;

INSERT INTO hazard_scenario (code, name, hazard, return_period_years, model_version, source)
VALUES
    ('SYN-FLOOD-100', 'Inundación sintética TR 100', 'flood', 100, '1.0.0', 'Synthetic portfolio data'),
    ('SYN-LANDSLIDE', 'Susceptibilidad sintética a movimientos en masa', 'landslide', NULL, '1.0.0', 'Synthetic portfolio data'),
    ('SYN-EQ', 'Escenario sísmico sintético', 'earthquake', 475, '1.0.0', 'Synthetic portfolio data'),
    ('SYN-WILDFIRE', 'Peligro sintético de incendio forestal', 'wildfire', NULL, '1.0.0', 'Synthetic portfolio data')
ON CONFLICT (code) DO NOTHING;
