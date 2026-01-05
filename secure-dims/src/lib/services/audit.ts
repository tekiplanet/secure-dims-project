import { supabase } from '../supabase/client';

export type AuditEventType =
    | 'IDENTITY_ISSUED'
    | 'ATTRIBUTE_ADDED'
    | 'ATTRIBUTE_UPDATED'
    | 'ATTRIBUTE_DELETED'
    | 'ATTRIBUTE_VERIFIED'
    | 'VERIFICATION_REQUESTED'
    | 'VERIFICATION_REVOKED'
    | 'VERIFICATION_REJECTED'
    | 'KEY_ROTATION'
    | 'CRYPTO_PROOF_SUCCESS'
    | 'CRYPTO_PROOF_FAILURE'
    | 'CONSENT_GRANTED'
    | 'CONSENT_REVOKED';

/**
 * Service to handle immutable audit logs for security events.
 */
export class AuditService {
    /**
     * Logs a security event to the audit trail.
     */
    static async logEvent(
        identityId: string,
        eventType: AuditEventType,
        details: any = {}
    ) {
        const { error } = await supabase
            .from('audit_logs')
            .insert({
                identity_id: identityId,
                event_type: eventType,
                details,
                created_at: new Date().toISOString(),
            });

        if (error) console.error('Audit Log Error:', error);
    }

    /**
     * Fetches the audit trail for a specific identity.
     */
    static async getLogs(identityId: string) {
        const { data, error } = await supabase
            .from('audit_logs')
            .select('*')
            .eq('identity_id', identityId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }
}
