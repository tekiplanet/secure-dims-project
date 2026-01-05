-- Create identities table
CREATE TABLE identities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    did TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id), -- Nullable if not linked to a Supabase user yet
    security_level INTEGER DEFAULT 1, -- L1, L2, L3, L4
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cryptographic keys table
CREATE TABLE cryptographic_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identity_id UUID REFERENCES identities(id) ON DELETE CASCADE,
    public_key TEXT NOT NULL,
    key_type TEXT NOT NULL, -- e.g., 'RSA', 'ECDSA'
    key_purpose TEXT DEFAULT 'authentication',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create identity attributes table
CREATE TABLE identity_attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identity_id UUID REFERENCES identities(id) ON DELETE CASCADE,
    attribute_name TEXT NOT NULL,
    attribute_value TEXT NOT NULL,
    verification_status TEXT DEFAULT 'unverified', -- 'unverified', 'pending', 'verified'
    verified_at TIMESTAMP WITH TIME ZONE,
    trust_score_contribution INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE cryptographic_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity_attributes ENABLE ROW LEVEL SECURITY;

-- Create auth challenges table for cryptographic proofs
CREATE TABLE auth_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    did TEXT NOT NULL,
    challenge TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE auth_challenges ENABLE ROW LEVEL SECURITY;

-- Policies (Simplified for now)
CREATE POLICY "Users can view their own identity" ON identities
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own attributes" ON identity_attributes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM identities 
            WHERE identities.id = identity_attributes.identity_id 
            AND identities.user_id = auth.uid()
        )
    );

CREATE POLICY "Public can insert challenges" ON auth_challenges
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own challenges" ON auth_challenges
    FOR SELECT USING (true);

-- Create audit logs table for non-repudiation
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identity_id UUID REFERENCES identities(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own logs
CREATE POLICY "Users can view their own logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM identities 
            WHERE identities.id = audit_logs.identity_id 
            AND identities.user_id = auth.uid()
        )
    );
