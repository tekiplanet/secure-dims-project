import { supabase } from '../supabase/client';
import { CryptoProvider } from '../crypto/provider';

/**
 * Service to manage user consent and granular attribute disclosure.
 * Implements privacy-by-design by allowing partial disclosure of identity.
 */
export class ConsentService {
    /**
     * Generates a signed disclosure token (verifiable credential snippet).
     * 
     * @param identityId - The UUID of the identity holder.
     * @param privateKey - The holder's private key (stays client-side in real usage).
     * @param allowedAttributes - A list of attribute names the user consents to disclose.
     */
    static async generateDisclosureToken(
        identityId: string,
        privateKey: string,
        allowedAttributes: string[]
    ) {
        // 1. Fetch the current verified state of these attributes
        const { data: attributes, error } = await supabase
            .from('identity_attributes')
            .select('attribute_name, attribute_value, verification_status')
            .eq('identity_id', identityId)
            .in('attribute_name', allowedAttributes);

        if (error) throw error;

        // 2. Build the disclosure payload
        const payload = {
            iss: 'VORTEX-ID-SYSTEM',
            sub: identityId,
            attrs: attributes?.reduce((acc: any, curr) => {
                acc[curr.attribute_name] = {
                    value: curr.attribute_value,
                    verified: curr.verification_status === 'verified'
                };
                return acc;
            }, {}),
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (3600), // Valid for 1 hour
        };

        const header = { alg: "RSA-PSS", typ: "JWT" };

        // 3. Simple JWS serialization
        const encodedHeader = btoa(JSON.stringify(header));
        const encodedPayload = btoa(JSON.stringify(payload));
        const signatureInput = `${encodedHeader}.${encodedPayload}`;

        // Sign the input
        const signature = await CryptoProvider.signMessage(signatureInput, privateKey);

        return {
            token: `${signatureInput}.${signature}`,
            expiresAt: new Date(payload.exp * 1000).toISOString()
        };
    }

    /**
     * Revokes a previous consent by logging a revocation event (Audit trail).
     */
    static async revokeConsent(identityId: string, verifierId: string) {
        // Audit revocation
        const { error } = await supabase
            .from('audit_logs')
            .insert({
                identity_id: identityId,
                event_type: 'CONSENT_REVOKED',
                details: { verifier_id: verifierId }
            });

        if (error) throw error;
        return { success: true };
    }
}
