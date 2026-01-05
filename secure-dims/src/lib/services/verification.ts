import { supabase } from '../supabase/client';
import { TrustEngine } from './trust-engine';

/**
 * Service to handle the verification workflows for identity attributes.
 */
export class VerificationService {
    /**
     * Simulates the issuance of a verification challenge (e.g., OTP via Email/SMS).
     * 
     * @param identityId - The UUID of the identity holder.
     * @param attributeName - The name of the attribute to verify (email, phone, etc.).
     */
    static async sendVerificationChallenge(identityId: string, attributeName: string) {
        // Note: In a production environment, this would integrate with Twilio, SendGrid, 
        // or Supabase Auth OTP. For the MVP, we simulate the 'sent' state.

        const { error } = await supabase
            .from('identity_attributes')
            .update({ verification_status: 'pending' })
            .eq('identity_id', identityId)
            .eq('attribute_name', attributeName);

        if (error) throw error;

        return { success: true, message: `Verification challenge sent for ${attributeName}` };
    }

    /**
     * Completes the verification process for an attribute.
     * This is called after a successful OTP check or Admin approval.
     */
    static async completeVerification(identityId: string, attributeName: string) {
        const { data, error } = await supabase
            .from('identity_attributes')
            .update({
                verification_status: 'verified',
                verified_at: new Date().toISOString()
            })
            .eq('identity_id', identityId)
            .eq('attribute_name', attributeName)
            .select();

        if (error) throw error;

        // Recalculate trust score and identity level after verification
        const newTrust = await TrustEngine.calculateScore(identityId);

        return {
            verifiedAttribute: data[0],
            newTrustLevel: newTrust.level,
            newScore: newTrust.score
        };
    }

    /**
     * Admin-only verification for high-assurance attributes.
     */
    static async adminVerify(identityId: string) {
        // Verify the 'admin_check' special attribute to boost to L4
        return await this.completeVerification(identityId, 'admin_check');
    }
}
