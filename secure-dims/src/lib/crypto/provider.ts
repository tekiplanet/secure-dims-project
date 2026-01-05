/**
 * Provider for cryptographic operations using the Web Crypto API.
 */
export class CryptoProvider {
    /**
     * Generates a new RSA-PSS key pair for signing and verification.
     */
    static async generateKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
        if (!window.crypto?.subtle) {
            throw new Error("Web Crypto (subtle) is not available. Please ensure you are using a secure context (HTTPS or localhost).");
        }
        const keyPair = await window.crypto.subtle.generateKey(
            {
                name: "RSA-PSS",
                modulusLength: 2048,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: "SHA-256",
            },
            true,
            ["sign", "verify"]
        );

        const publicKeyExported = await window.crypto.subtle.exportKey(
            "spki",
            keyPair.publicKey
        );
        const privateKeyExported = await window.crypto.subtle.exportKey(
            "pkcs8",
            keyPair.privateKey
        );

        return {
            publicKey: this.arrayBufferToBase64(publicKeyExported),
            privateKey: this.arrayBufferToBase64(privateKeyExported),
        };
    }

    /**
     * Signs a message with a private key.
     */
    static async signMessage(message: string, privateKeyBase64: string): Promise<string> {
        const encoder = new TextEncoder();
        const data = encoder.encode(message);
        const privateKeyBuffer = this.base64ToArrayBuffer(privateKeyBase64);

        const privateKey = await window.crypto.subtle.importKey(
            "pkcs8",
            privateKeyBuffer,
            {
                name: "RSA-PSS",
                hash: "SHA-256",
            },
            false,
            ["sign"]
        );

        const signature = await window.crypto.subtle.sign(
            {
                name: "RSA-PSS",
                saltLength: 32,
            },
            privateKey,
            data
        );

        return this.arrayBufferToBase64(signature);
    }

    /**
     * Verifies a signature with a public key.
     */
    static async verifySignature(
        message: string,
        signatureBase64: string,
        publicKeyBase64: string
    ): Promise<boolean> {
        const encoder = new TextEncoder();
        const data = encoder.encode(message);
        const signatureBuffer = this.base64ToArrayBuffer(signatureBase64);
        const publicKeyBuffer = this.base64ToArrayBuffer(publicKeyBase64);

        const publicKey = await window.crypto.subtle.importKey(
            "spki",
            publicKeyBuffer,
            {
                name: "RSA-PSS",
                hash: "SHA-256",
            },
            false,
            ["verify"]
        );

        return await window.crypto.subtle.verify(
            {
                name: "RSA-PSS",
                saltLength: 32,
            },
            publicKey,
            signatureBuffer,
            data
        );
    }

    private static arrayBufferToBase64(buffer: ArrayBuffer): string {
        const binary = String.fromCharCode(...new Uint8Array(buffer));
        return window.btoa(binary);
    }

    private static base64ToArrayBuffer(base64: string): ArrayBuffer {
        const binaryString = window.atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }
}
