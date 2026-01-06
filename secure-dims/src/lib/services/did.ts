import { v4 as uuidv4 } from 'uuid';

/**
 * Service to handle VORTEX Decentralized Identifiers (DID).
 * Following the format: did:VORTEX:<unique_hash>
 */
export class DIDService {
    private static PREFIX = 'did:VORTEX:';

    /**
     * Generates a new unique VORTEX DID.
     * For the MVP, we use a UUID-based string to ensure uniqueness.
     */
    static generateDID(): string {
        const uniqueId = uuidv4().replace(/-/g, '');
        return `${this.PREFIX}${uniqueId}`;
    }

    /**
     * Validates if a string is a valid VORTEX DID.
     */
    static isValid(did: string): boolean {
        return did.startsWith(this.PREFIX) && did.length > this.PREFIX.length;
    }
}
