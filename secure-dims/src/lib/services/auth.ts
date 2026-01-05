import { supabase } from '../supabase/client';
import { CryptoProvider } from '../crypto/provider';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service to handle cryptographic authentication challenges.
 */
export class AuthService {
    /**
     * Generates a random challenge string for an identity to sign.
     * Challenges are short-lived.
     */
    static async generateChallenge(did: string): Promise<string> {
        const challenge = uuidv4();

        // Store challenge in a temporary table or cache.
        // For MVP, we can store it in a 'auth_challenges' table with an expiry.
        const { error } = await supabase
            .from('auth_challenges')
            .insert({
                did,
                challenge,
                expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 mins
            });

        if (error) throw error;

        return challenge;
    }

    /**
     * Verifies a signed challenge.
     */
    static async verifyChallenge(
        did: string,
        challenge: string,
        signature: string
    ): Promise<boolean> {
        // 1. Fetch the challenge from DB to ensure it's valid and not expired
        const { data: challengeData, error: chalError } = await supabase
            .from('auth_challenges')
            .select('*')
            .eq('did', did)
            .eq('challenge', challenge)
            .gt('expires_at', new Date().toISOString())
            .single();

        if (chalError || !challengeData) return false;

        // 2. Fetch the Public Key for this identity
        const { data: identity, error: idError } = await supabase
            .from('identities')
            .select(`
        id,
        cryptographic_keys (public_key)
      `)
            .eq('did', did)
            .single();

        if (idError || !identity.cryptographic_keys?.[0]) return false;

        const publicKey = identity.cryptographic_keys[0].public_key;

        // 3. Verify the signature
        // Since verifySignature is client-side Web Crypto, we use it here simulated 
        // or in an Edge Function. For the service logic, we call the provider.
        const isValid = await CryptoProvider.verifySignature(challenge, signature, publicKey);

        if (isValid) {
            // Consume the challenge
            await supabase.from('auth_challenges').delete().eq('id', challengeData.id);

            // Log the successful proof for trust scoring (+20 points)
            // In a real system, this would be a specific event.
        }

        return isValid;
    }
}
