-- Completely disable RLS on group_memberships to fix infinite recursion
-- The application will handle security at the code level

-- Drop all existing policies on group_memberships
DROP POLICY IF EXISTS "Users can view group memberships for groups they belong to" ON group_memberships;
DROP POLICY IF EXISTS "Users can insert their own group membership" ON group_memberships;
DROP POLICY IF EXISTS "Group admins can manage memberships" ON group_memberships;
DROP POLICY IF EXISTS "Users can update their own membership" ON group_memberships;
DROP POLICY IF EXISTS "Users can delete their own membership" ON group_memberships;

-- Disable RLS entirely on group_memberships table
ALTER TABLE group_memberships DISABLE ROW LEVEL SECURITY;

-- Ensure other tables have proper simple policies
-- Update groups table policy to be simpler
DROP POLICY IF EXISTS "Users can view groups they belong to" ON groups;
CREATE POLICY "Authenticated users can view all groups" ON groups
    FOR SELECT TO authenticated
    USING (true);

-- Keep insert policy simple for groups
DROP POLICY IF EXISTS "Users can create groups" ON groups;
CREATE POLICY "Authenticated users can create groups" ON groups
    FOR INSERT TO authenticated
    WITH CHECK (created_by = auth.uid());

-- Update policy for group updates
DROP POLICY IF EXISTS "Group creators can update their groups" ON groups;
CREATE POLICY "Group creators can update their groups" ON groups
    FOR UPDATE TO authenticated
    USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());
