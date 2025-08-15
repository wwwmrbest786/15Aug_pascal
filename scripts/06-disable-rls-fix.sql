-- Fix infinite recursion in group_memberships RLS policies
-- by temporarily disabling RLS and creating simpler policies

-- Drop all existing policies on group_memberships
DROP POLICY IF EXISTS "Users can view group memberships for groups they belong to" ON group_memberships;
DROP POLICY IF EXISTS "Users can insert their own group memberships" ON group_memberships;
DROP POLICY IF EXISTS "Group admins can manage memberships" ON group_memberships;
DROP POLICY IF EXISTS "Users can update their own memberships" ON group_memberships;
DROP POLICY IF EXISTS "Users can delete their own memberships" ON group_memberships;

-- Disable RLS temporarily to break the recursion
ALTER TABLE group_memberships DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE group_memberships ENABLE ROW LEVEL SECURITY;

-- Create simple policies that don't reference group_memberships table
CREATE POLICY "Allow authenticated users to view all memberships" ON group_memberships
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert memberships" ON group_memberships
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own memberships" ON group_memberships
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own memberships" ON group_memberships
    FOR DELETE USING (auth.uid() = user_id);

-- Allow group creators to manage memberships in their groups
CREATE POLICY "Allow group creators to manage memberships" ON group_memberships
    FOR ALL USING (
        group_id IN (
            SELECT id FROM groups WHERE created_by = auth.uid()
        )
    );
