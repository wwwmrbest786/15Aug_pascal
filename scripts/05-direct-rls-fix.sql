-- Fix infinite recursion in group_memberships RLS policies
-- Drop all existing policies and create simple ones

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Users can view group memberships for groups they belong to" ON group_memberships;
DROP POLICY IF EXISTS "Users can insert their own group memberships" ON group_memberships;
DROP POLICY IF EXISTS "Users can delete their own group memberships" ON group_memberships;
DROP POLICY IF EXISTS "Group creators can manage all memberships" ON group_memberships;

-- Create simple policies without circular references
CREATE POLICY "Users can view their own memberships" ON group_memberships
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own memberships" ON group_memberships
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own memberships" ON group_memberships
    FOR DELETE USING (user_id = auth.uid());

-- Allow group creators to manage memberships (using groups table directly)
CREATE POLICY "Group creators can view all memberships" ON group_memberships
    FOR SELECT USING (
        group_id IN (
            SELECT id FROM groups WHERE created_by = auth.uid()
        )
    );

CREATE POLICY "Group creators can insert memberships" ON group_memberships
    FOR INSERT WITH CHECK (
        group_id IN (
            SELECT id FROM groups WHERE created_by = auth.uid()
        )
    );

CREATE POLICY "Group creators can delete memberships" ON group_memberships
    FOR DELETE USING (
        group_id IN (
            SELECT id FROM groups WHERE created_by = auth.uid()
        )
    );
