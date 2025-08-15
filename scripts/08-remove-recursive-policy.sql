-- Remove the problematic RLS policy causing infinite recursion
-- The issue is in the group_memberships SELECT policy that references itself

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view memberships in their groups" ON group_memberships;

-- Create a simple policy that doesn't cause recursion
-- Allow users to see their own memberships and let application handle group-level security
CREATE POLICY "Users can view their own memberships" ON group_memberships
  FOR SELECT USING (user_id = auth.uid());

-- Allow group admins to view all memberships in their groups
-- This uses the groups table directly to avoid circular reference
CREATE POLICY "Group creators can view all memberships" ON group_memberships
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM groups g 
      WHERE g.id = group_memberships.group_id 
      AND g.created_by = auth.uid()
    )
  );

-- Update the groups policy to be simpler and avoid potential issues
DROP POLICY IF EXISTS "Users can view groups they're members of" ON groups;
CREATE POLICY "Users can view groups they're members of" ON groups
  FOR SELECT USING (
    created_by = auth.uid() OR
    id IN (
      SELECT gm.group_id FROM group_memberships gm 
      WHERE gm.user_id = auth.uid() AND gm.status = 'active'
    )
  );
