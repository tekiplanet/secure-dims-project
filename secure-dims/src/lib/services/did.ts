import { v4 as uuidv4 } from 'uuid';

/**
 * Service to handle Ozoro Decentralized Identifiers (DID).
 * Following the format: did:ozoro:<unique_hash>
 */
export class DIDService {
    private static PREFIX = 'did:ozoro:';

    /**
     * Generates a new unique Ozoro DID.
     * For the MVP, we use a UUID-based string to ensure uniqueness.
     */
    static generateDID(): string {
        const uniqueId = uuidv4().replace(/-/g, '');
        return `${this.PREFIX}${uniqueId}`;
    }

    /**
     * Validates if a string is a valid Ozoro DID.
     */
    static isValid(did: string): boolean {
        return did.startsWith(this.PREFIX) && did.length > this.PREFIX.length;
    }
}
