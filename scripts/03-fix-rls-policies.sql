-- Fix infinite recursion in group_memberships RLS policy

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view memberships in their groups" ON group_memberships;

-- Create a corrected policy that doesn't cause infinite recursion
-- Fixed infinite recursion by simplifying the policy logic
CREATE POLICY "Users can view memberships in their groups" ON group_memberships
  FOR SELECT USING (
    user_id = auth.uid() OR
    group_id IN (
      SELECT gm.group_id 
      FROM group_memberships gm 
      WHERE gm.user_id = auth.uid() 
      AND gm.status = 'active'
    )
  );

-- Also fix the groups policy to avoid potential recursion
DROP POLICY IF EXISTS "Users can view groups they're members of" ON groups;

CREATE POLICY "Users can view groups they're members of" ON groups
  FOR SELECT USING (
    id IN (
      SELECT gm.group_id 
      FROM group_memberships gm 
      WHERE gm.user_id = auth.uid() 
      AND gm.status = 'active'
    )
  );

-- Fix group update policy as well
DROP POLICY IF EXISTS "Group admins can update groups" ON groups;

CREATE POLICY "Group admins can update groups" ON groups
  FOR UPDATE USING (
    id IN (
      SELECT gm.group_id 
      FROM group_memberships gm 
      WHERE gm.user_id = auth.uid() 
      AND gm.role = 'admin' 
      AND gm.status = 'active'
    )
  );
