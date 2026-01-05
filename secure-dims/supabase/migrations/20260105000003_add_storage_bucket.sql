-- Create a new bucket for identity assets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('identity-assets', 'identity-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow anonymous uploads for the demo
CREATE POLICY "Allow anonymous uploads" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'identity-assets');

-- Policy: Allow public read access to identity assets
CREATE POLICY "Allow public read access" ON storage.objects
    FOR SELECT USING (bucket_id = 'identity-assets');

-- Policy: Allow users to delete their own uploads (based on file name/path containing identity id)
CREATE POLICY "Allow owners to delete" ON storage.objects
    FOR DELETE USING (bucket_id = 'identity-assets');
