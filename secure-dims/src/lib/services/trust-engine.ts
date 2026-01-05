import { supabase } from '../supabase/client';

export type VerificationLevel = 'L1' | 'L2' | 'L3' | 'L4';

export interface TrustScore {
    score: number;
    level: VerificationLevel;
}

/**
 * Service to calculate identity trust scores and assurance levels.
 * Based on ISO/NIST inspired standards.
 */
export class TrustEngine {
    private static WEIGHTS: Record<string, number> = {
        'email': 10,
        'phone': 15,
        'admin_check': 30,
        'cryptographic_proof': 20,
        'institution_verify': 25,
    };

    /**
     * Calculates the total trust score for an identity based on its verified attributes.
     */
    static async calculateScore(identityId: string): Promise<TrustScore> {
        const { data: attributes, error } = await supabase
            .from('identity_attributes')
            .select('attribute_name, verification_status')
            .eq('identity_id', identityId)
            .eq('verification_status', 'verified');

        if (error) throw error;

        let score = 0;

        // Sum weights of verified attributes
        attributes?.forEach(attr => {
            score += this.WEIGHTS[attr.attribute_name] || 5; // Default 5 for unknown attributes
        });

        const level = this.determineLevel(score);

        // Update the identity's security level in the database
        await this.updateIdentityLevel(identityId, level);

        return { score, level };
    }

    /**
     * Maps numerical score to Assurance Level.
     */
    private static determineLevel(score: number): VerificationLevel {
        if (score >= 75) return 'L4';
        if (score >= 45) return 'L3';
        if (score >= 20) return 'L2';
        return 'L1';
    }

    /**
     * Persists the calculated level to the identity record.
     */
    private static async updateIdentityLevel(identityId: string, level: VerificationLevel) {
        const levelMap: Record<VerificationLevel, number> = {
            'L1': 1, 'L2': 2, 'L3': 3, 'L4': 4
        };

        const { error } = await supabase
            .from('identities')
            .update({ security_level: levelMap[level] })
            .eq('id', identityId);

        if (error) console.error('Error updating identity level:', error);
    }
}
