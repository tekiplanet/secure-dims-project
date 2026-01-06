-- Migration: Enable Attribute Deletion
-- Description: Adds the missing DELETE policy for identity_attributes to fix the bug where attributes cannot be removed.

CREATE POLICY "Anybody can delete attributes" ON identity_attributes
    FOR DELETE USING (true);
