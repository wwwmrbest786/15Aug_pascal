-- Fix infinite recursion in group_memberships RLS policies
-- Drop all existing policies that cause recursion
DROP POLICY IF EXISTS "Users can view group memberships for groups they belong to" ON group_memberships;
DROP POLICY IF EXISTS "Users can insert their own group memberships" ON group_memberships;
DROP POLICY IF EXISTS "Users can delete their own group memberships" ON group_memberships;

-- Create simple, non-recursive policies
CREATE POLICY "Users can view their own memberships" ON group_memberships
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own memberships" ON group_memberships
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own memberships" ON group_memberships
    FOR DELETE USING (user_id = auth.uid());

-- Allow group creators to manage memberships
CREATE POLICY "Group creators can manage memberships" ON group_memberships
    FOR ALL USING (
        group_id IN (
            SELECT id FROM groups WHERE created_by = auth.uid()
        )
    );
