-- Migration: Fix RLS for Anonymous Identity Issuance
-- Description: Enables anonymous insertions and lookups for the SSI flow.

-- 1. Enable anonymous identity creation
DROP POLICY IF EXISTS "Users can view their own identity" ON identities;
CREATE POLICY "Public can view identity by DID" ON identities
    FOR SELECT USING (true);

CREATE POLICY "Anybody can create an identity" ON identities
    FOR INSERT WITH CHECK (true);

-- 2. Enable anonymous attribute management
DROP POLICY IF EXISTS "Users can view their own attributes" ON identity_attributes;
CREATE POLICY "Public can view attributes" ON identity_attributes
    FOR SELECT USING (true);

CREATE POLICY "Anybody can add attributes" ON identity_attributes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anybody can update attributes" ON identity_attributes
    FOR UPDATE USING (true);

-- 3. Enable anonymous key management
CREATE POLICY "Public can view keys" ON cryptographic_keys
    FOR SELECT USING (true);

CREATE POLICY "Public can insert keys" ON cryptographic_keys
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can update keys" ON cryptographic_keys
    FOR UPDATE USING (true);

-- 4. Enable anonymous audit logs
DROP POLICY IF EXISTS "Users can view their own logs" ON audit_logs;
CREATE POLICY "Public can view logs" ON audit_logs
    FOR SELECT USING (true);

CREATE POLICY "Public can insert logs" ON audit_logs
    FOR INSERT WITH CHECK (true);
