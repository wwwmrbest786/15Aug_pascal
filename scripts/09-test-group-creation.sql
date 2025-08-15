-- Create a test group to verify the system works
INSERT INTO groups (id, name, description, invite_code, created_by, created_at, updated_at, settings)
VALUES (
  gen_random_uuid(),
  'Test Betting Group',
  'A test group for betting functionality',
  upper(substring(md5(random()::text) from 1 for 8)),
  (SELECT id FROM auth.users LIMIT 1),
  now(),
  now(),
  '{"max_bet": 1000, "min_bet": 10}'::jsonb
);

-- Add the creator as an admin member
INSERT INTO group_memberships (id, group_id, user_id, role, status, joined_at)
SELECT 
  gen_random_uuid(),
  g.id,
  g.created_by,
  'admin',
  'active',
  now()
FROM groups g
WHERE g.name = 'Test Betting Group'
AND NOT EXISTS (
  SELECT 1 FROM group_memberships gm 
  WHERE gm.group_id = g.id AND gm.user_id = g.created_by
);
