import { supabase } from '../supabase/client';
import { CryptoProvider } from '../crypto/provider';

/**
 * Service for external systems (Verifiers) to validate identity claims.
 */
export class VerifierService {
    /**
     * Validates a signed disclosure token.
     * This logic would typically run on the Verifier's backend or an Edge Function.
     */
    static async verifyDisclosureToken(token: string) {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) throw new Error('Malformed token');

            const [encodedHeader, encodedPayload, signature] = parts;

            // 1. Decode payload to find the subject (identity ID)
            const payload = JSON.parse(atob(encodedPayload));
            const identityId = payload.sub;

            // 2. Resolve the Identity's Public Key from the platform
            const { data: identity, error } = await supabase
                .from('identities')
                .select(`
          id,
          security_level,
          cryptographic_keys (public_key)
        `)
                .eq('id', identityId)
                .single();

            if (error || !identity.cryptographic_keys?.[0]) {
                throw new Error('Identity or Public Key not found');
            }

            const publicKey = identity.cryptographic_keys[0].public_key;

            // 3. Verify cryptographic integrity
            const signatureInput = `${encodedHeader}.${encodedPayload}`;
            const isValid = await CryptoProvider.verifySignature(
                signatureInput,
                signature,
                publicKey
            );

            if (!isValid) throw new Error('Cryptographic signature verification failed');

            // 4. Check temporal validity (expiration)
            const now = Math.floor(Date.now() / 1000);
            if (payload.exp < now) throw new Error('Token has expired');

            return {
                verified: true,
                identityId: identity.id,
                trustLevel: identity.security_level,
                claims: payload.attrs,
                auditTrail: `Verified by VORTEX-ID-SYSTEM at ${new Date().toISOString()}`
            };

        } catch (err: any) {
            return {
                verified: false,
                error: err.message
            };
        }
    }

    /**
     * Resolves a DID to its public identity profile.
     */
    static async resolveDID(did: string) {
        const { data, error } = await supabase
            .from('identities')
            .select('did, security_level, created_at')
            .eq('did', did)
            .single();

        if (error) throw error;
        return data;
    }
}
