-- Seed data for Pascal Betting App
-- Create some demo groups and users for testing

-- Insert demo groups (these will be created by actual users in production)
INSERT INTO groups (id, name, description, invite_code, created_by, settings) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Demo Sports Group', 'Betting on sports events with friends', 'SPORTS', '550e8400-e29b-41d4-a716-446655440000', '{"tick_size_increment": 10, "max_bet_size": 1000, "anti_sniping_enabled": true}'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Movie Night Predictions', 'Predict movie outcomes and box office results', 'MOVIES', '550e8400-e29b-41d4-a716-446655440000', '{"tick_size_increment": 5, "max_bet_size": 500, "anti_sniping_enabled": false}')
ON CONFLICT (id) DO NOTHING;

-- Note: In production, users will be created automatically via the auth trigger
-- when they sign up through Supabase Auth. The demo data above is just for testing.
