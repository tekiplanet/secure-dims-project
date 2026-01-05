import { DIDService } from './did';
import { supabase } from '../supabase/client';

export interface IdentityMetadata {
    name?: string;
    email?: string;
    [key: string]: any;
}

/**
 * Service to orchestrate the creation and management of digital identities.
 */
export class IdentityService {
    /**
     * Issues a new identity on the platform.
     * 
     * @param userId - Optional Supabase Auth user ID to link this identity to.
     * @param publicKey - The public key generated on the client side.
     * @param metadata - Initial identity attributes (e.g., name, email).
     */
    static async issueIdentity(
        userId: string | null,
        publicKey: string,
        metadata: IdentityMetadata
    ) {
        const did = DIDService.generateDID();

        // 1. Create Identity entry
        const { data: identity, error: idError } = await supabase
            .from('identities')
            .insert({
                did,
                user_id: userId,
                security_level: 1, // Initial assurance level
            })
            .select()
            .single();

        if (idError) throw idError;

        // 2. Store the Public Key associated with this identity
        const { error: keyError } = await supabase
            .from('cryptographic_keys')
            .insert({
                identity_id: identity.id,
                public_key: publicKey,
                key_type: 'RSA-PSS',
            });

        if (keyError) throw keyError;

        // 3. Store initial attributes as unverified
        const attributes = Object.entries(metadata).map(([name, value]) => ({
            identity_id: identity.id,
            attribute_name: name,
            attribute_value: String(value),
            verification_status: 'unverified',
        }));

        if (attributes.length > 0) {
            const { error: attrError } = await supabase
                .from('identity_attributes')
                .insert(attributes);

            if (attrError) throw attrError;
        }

        return { id: identity.id, did };
    }

    /**
     * Fetches the identity record by DID.
     */
    static async getIdentityByDID(did: string) {
        const { data, error } = await supabase
            .from('identities')
            .select(`
        *,
        cryptographic_keys (*),
        identity_attributes (*)
      `)
            .eq('did', did)
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Updates an attribute's value.
     */
    static async updateAttribute(attributeId: string, value: string) {
        const { data, error } = await supabase
            .from('identity_attributes')
            .update({
                attribute_value: value,
                verification_status: 'unverified', // Reset verification if value changes
                updated_at: new Date().toISOString()
            })
            .eq('id', attributeId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Deletes an attribute.
     */
    static async deleteAttribute(attributeId: string) {
        const { error } = await supabase
            .from('identity_attributes')
            .delete()
            .eq('id', attributeId);

        if (error) throw error;
        return true;
    }
}
