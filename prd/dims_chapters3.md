# CHAPTER THREE – SYSTEM DESIGN AND METHODOLOGY

## 3.1 Introduction

This chapter presents the comprehensive design and methodology employed in the development of the Secure Digital Identity Management System (Secure-DIMS), commercially identified as the Vortex Identity Ecosystem. The system addresses critical challenges in modern digital identity infrastructure, including identity theft, data fragmentation, centralized trust monopolies, and the lack of user sovereignty over personal data. The design follows internationally recognized Self-Sovereign Identity (SSI) principles and implements cryptographic protocols that ensure privacy, security, and interoperability.

## 3.2 System Overview and Objectives

### 3.2.1 Problem Statement

Traditional identity management systems exhibit fundamental architectural vulnerabilities. Centralized identity providers such as social login systems (Facebook Login, Google Sign-In) create single points of failure, concentrate user data in proprietary silos, and vest control of personal identity in corporate entities rather than individuals. These systems are characterized by password-based authentication mechanisms that are susceptible to credential theft, phishing attacks, and database breaches. Furthermore, users lack granular control over what personal information is shared with third parties, leading to privacy violations and unauthorized data aggregation.

### 3.2.2 System Objectives

The Secure-DIMS project was designed with the following primary objectives:

1. **Decentralization of Identity Control**: Eliminate reliance on centralized identity providers by implementing a self-sovereign identity model where users generate and control their own cryptographic credentials.

2. **Cryptographic Trust Anchoring**: Replace password-based authentication with asymmetric cryptography, establishing trust through mathematical proof rather than shared secrets.

3. **Privacy-Preserving Verification**: Enable third-party verification of identity attributes without requiring disclosure of the complete identity profile through selective disclosure mechanisms.

4. **Multi-Level Trust Assurance**: Implement a graduated trust scoring system that reflects different levels of identity verification rigor, from self-asserted claims to formally verified credentials.

5. **Interoperability and Standards Compliance**: Design the system to conform with W3C Decentralized Identifier (DID) specifications, ensuring portability and compatibility with emerging SSI ecosystems.

6. **User Sovereignty**: Ensure that individuals retain complete ownership of their identity data, including the ability to export, rotate cryptographic keys, and revoke attribute verifications.

### 3.2.3 Scope Definition

The system encompasses three distinct operational domains corresponding to the SSI Trust Triangle:

- **Digital Wallet (Holder Domain)**: User-facing interface for identity creation, attribute management, and selective disclosure operations.
- **Trust Authority (Issuer Domain)**: Administrative interface for credential verification, approval workflows, and trust establishment.
- **Public Verification (Verifier Domain)**: External service interface for cryptographic validation of identity claims without accessing the underlying identity database.

## 3.3 Architectural Design

### 3.3.1 System Architecture Overview

The Secure-DIMS architecture follows a client-server model with critical cryptographic operations executed client-side to ensure private key material never leaves the user's device. The architecture consists of four primary layers:

**Presentation Layer**: Implemented using Next.js 16 with React 19, providing server-side rendering (SSR) capabilities for optimized page delivery and enhanced security. The presentation layer is organized into three persona-based interfaces corresponding to the SSI Trust Triangle actors.

**Application Layer**: Contains the business logic for identity lifecycle management, trust scoring algorithms, verification workflows, and cryptographic operations. This layer is implemented in TypeScript to ensure type safety and prevent logical errors in security-critical operations.

**Data Layer**: Utilizes Supabase (PostgreSQL) as the persistent identity registry, implementing Row-Level Security (RLS) policies to enforce access control at the database level. The data layer stores DIDs, public keys, attribute metadata, verification status, and audit logs.

**Cryptographic Layer**: Leverages the Web Crypto API (`crypto.subtle`) for hardware-accelerated cryptographic operations including key pair generation, digital signatures, and signature verification. All private key operations occur exclusively in the browser context.

### 3.3.2 SSI Trust Triangle Implementation

The system implements a complete SSI Trust Triangle comprising three distinct actors:

**Holder (Identity Owner)**: The individual who creates and manages their digital identity. Holders generate their own cryptographic key pairs, add attributes to their identity profile, request verification from authorities, and generate selective disclosure proofs for verifiers. The Holder operates through the Digital Wallet interface.

**Issuer (Trust Authority)**: Organizations or institutions that verify and vouch for the authenticity of identity attributes. Issuers review documentation, validate claims, and cryptographically sign approved attributes. The system models universities, government agencies, and employers as potential issuers. Issuers operate through the Trust Authority interface.

**Verifier (Relying Party)**: External services or applications that need to validate identity claims without accessing the complete identity profile. Verifiers receive selective disclosure tokens from holders and perform cryptographic validation using the holder's public key. Verifiers interact with the system through the Public Verification interface and API endpoints.

### 3.3.3 Architectural Principles

The architectural design adheres to the following principles:

**Holder-Centricity**: All design decisions prioritize user control and privacy. Sensitive cryptographic material (private keys) is generated and stored exclusively on the user's device. The server never has access to private keys, ensuring that even a complete database compromise cannot lead to identity theft.

**Zero-Knowledge Architecture**: The system is designed such that verifiers can validate identity claims without learning any information beyond what the holder explicitly consents to share. This is achieved through selective disclosure mechanisms and cryptographic proofs.

**Defense in Depth**: Multiple security layers are implemented, including client-side key generation, Row-Level Security in the database, non-root container execution, and immutable audit logging.

**Cryptographic Non-Repudiation**: All verification actions and token generation events are logged with cryptographic signatures, creating an immutable audit trail that prevents later denial of actions.

## 3.4 System Components and Modules

### 3.4.1 Identity Issuance Module

The Identity Issuance Module is responsible for creating new digital identities and establishing their cryptographic foundation.

**Key Generation Component**: Utilizes the Web Crypto API to generate RSA or ECDSA key pairs with configurable key lengths (2048-bit or 4096-bit RSA). The key generation occurs entirely in the browser using hardware-accelerated cryptographic operations. The private key is stored in the browser's local storage or IndexedDB with appropriate security flags, while the public key is extracted for registration with the identity registry.

**DID Generation Component**: Implements the VORTEX-DID specification, a custom DID method that follows the general structure `did:VORTEX:{unique-identifier}`. The unique identifier is derived from a combination of a cryptographic hash of the public key and a timestamp, ensuring global uniqueness. The DID serves as a persistent identifier that remains constant even if the user rotates their cryptographic keys.

**Identity Anchoring Component**: Submits the DID, public key, and initial metadata to the Supabase identity registry. This anchoring process creates the foundational identity record that subsequent operations reference. The anchoring transaction is logged with a timestamp and transaction ID for audit purposes.

### 3.4.2 Attribute Management Module

The Attribute Management Module provides comprehensive functionality for storing, updating, and managing identity claims.

**Dynamic Attribute Store**: Implements a flexible schema capable of accommodating arbitrary attribute types including textual data (name, email, phone, institution, identity numbers) and binary assets (photographs, scanned documents, certificates). The attribute store uses a key-value structure with metadata including attribute type, creation timestamp, last modification timestamp, and verification status.

**Visual Asset Management Component**: Handles the upload, storage, and retrieval of visual identity documents. Uploaded files are stored in a secured Supabase storage bucket (`identity-assets`) with access controlled via signed URLs. The system generates thumbnails for document preview without requiring full file download. Supported formats include JPEG, PNG, and PDF.

**Attribute Lifecycle Controller**: Manages the complete lifecycle of identity attributes from creation through verification, modification, and potential revocation. This component enforces critical business rules including automatic verification status reset when attribute values are modified and maintains the immutable audit trail for all attribute state changes.

### 3.4.3 Trust Scoring Engine

The Trust Scoring Engine calculates multi-level assurance scores based on verification pathways and attribute types.

**Verification Pathway Classification**: The engine distinguishes between two primary verification pathways:

- **Self-Service Verification**: Attributes verified through automated mechanisms such as email OTP or SMS verification. These provide lower assurance levels (L1-L2) due to the lack of human review.
- **Authority-Driven Verification**: Attributes requiring manual review and approval by authorized issuers. These provide higher assurance levels (L3-L4) due to the involvement of trusted institutions.

**Point-Based Scoring Algorithm**: Each attribute type is assigned a point value reflecting its assurance level:

```
Email: +10 points → Level L1
Phone: +15 points → Level L2
Institution: +25 points → Level L3
Biometric/Government ID: +30 points → Level L4
```

The system maintains a running trust score for each identity, which is recalculated whenever attributes are verified or revoked. The trust level displayed to the user corresponds to the highest level achieved based on their cumulative score.

**Trust Level Interpretation**:
- **L1 (Basic Assurance)**: Email verified, suitable for low-risk interactions
- **L2 (Medium Assurance)**: Phone verified, suitable for communications
- **L3 (High Assurance)**: Institutional affiliation verified, suitable for credential validation
- **L4 (Maximum Assurance)**: Government-issued ID or biometric verified, suitable for regulated services

### 3.4.4 Verification Request Management Module

This module orchestrates the workflow for attribute verification requests between holders and issuers.

**Request Queue System**: Implements a queue data structure that holds pending verification requests. Each request contains the holder's DID, the attribute requiring verification, any supporting documentation (visual assets), and a timestamp. The queue is accessible to authorized issuers through the Trust Authority interface.

**Approval Workflow Engine**: Provides issuers with tools to review verification requests, examine supporting documentation, and make approval or rejection decisions. Upon approval, the system updates the attribute's verification status, increments the holder's trust score, creates a cryptographic signature of the verification event, and logs the transaction in the immutable audit trail.

**Self-Service Verification Handlers**: For attributes supporting automated verification (email, phone), the system implements simulation handlers that mimic OTP delivery and validation. In a production deployment, these handlers would integrate with SMS gateways and email services.

### 3.4.5 Cryptographic Proof Module

The Cryptographic Proof Module implements challenge-response protocols for identity verification without password transmission.

**Challenge Generation Service**: When a verifier needs to authenticate a holder, the system generates a cryptographically secure random challenge string. This challenge is unique per verification attempt and includes a timestamp to prevent replay attacks.

**Signature Generation Component**: The holder's browser receives the challenge and uses the private key to generate a digital signature over the challenge string. The signature algorithm uses RSA-PSS with SHA-256 hashing. The signed challenge is returned to the verifier along with any requested identity attributes.

**Signature Verification Engine**: The verifier receives the signed challenge and the holder's public key (retrieved via the DID resolution mechanism). The verification engine validates the signature using the public key. Successful verification proves that the holder possesses the private key corresponding to the registered DID without the private key ever being transmitted or exposed.

**Non-Repudiation Logging**: All challenge-response transactions are logged with cryptographic signatures, creating a permanent record that can be used to prove that a specific verification occurred at a specific time.

### 3.4.6 Selective Disclosure Module

The Selective Disclosure Module enables privacy-preserving identity verification by allowing holders to share only specific attributes with verifiers.

**Consent Interface**: Provides a granular interface where holders can select individual attributes to include in a verification token. The interface displays all available attributes with their current verification status, allowing informed consent decisions.

**Token Generation Engine**: Creates cryptographically signed verification tokens containing only the consented attributes. The token format follows JSON Web Signature (JWS) standards, ensuring tamper-evidence and authenticity. Each token includes:
- Selected attribute claims
- DID of the holder
- Timestamp and expiration time
- Signature over the entire payload using the holder's private key

**Token Expiration Management**: Tokens are generated with configurable expiration periods (default: 15 minutes). After expiration, the token becomes invalid, preventing indefinite reuse and limiting the window for potential token theft.

**Privacy Controls**: The system enforces strict privacy controls ensuring that verifiers receive only the attributes explicitly selected by the holder. The verification process confirms the authenticity of the disclosed attributes without granting access to the complete identity profile.

### 3.4.7 Verifier API Module

The Verifier API Module exposes endpoints that external applications can use to integrate identity verification into their services.

**DID Resolution Endpoint**: Accepts a DID as input and returns the corresponding DID Document containing the holder's public key and service endpoints. This endpoint follows W3C DID Resolution specifications.

**Token Verification Endpoint**: Accepts a verification token (JWS) and validates its signature, expiration status, and issuer. Returns the decrypted attribute claims if the token is valid, or an error response if validation fails.

**Challenge-Response Endpoints**: Provides a complete challenge-response flow:
1. Request Challenge: Returns a unique challenge string
2. Submit Response: Accepts signed challenge and validates signature
3. Return Verification Result: Confirms or denies authentication

**Developer Documentation**: The system includes a Verifier Playground interface that serves as interactive API documentation, allowing developers to test token validation without writing integration code.

## 3.5 Identity Lifecycle Model

### 3.5.1 Identity Creation Phase

The identity creation phase begins when a user initiates identity issuance through the Digital Wallet interface. The following sequence occurs:

1. User provides minimal metadata (name, email) to associate with the identity
2. Browser generates RSA key pair using Web Crypto API
3. System derives unique DID from public key hash and timestamp
4. Public key and DID are submitted to identity registry
5. Identity record is created in database with initial trust level L0
6. User receives confirmation with their DID and initial identity card display

### 3.5.2 Attribute Addition and Management Phase

After identity creation, users progressively build their identity profile by adding attributes:

1. User navigates to "My Attributes" interface
2. User selects attribute type (text or visual asset)
3. For text attributes: User enters value (email, phone, institution name)
4. For visual attributes: User uploads document/photo, system generates thumbnail
5. Attribute is stored with status "unverified" and timestamp
6. Attribute appears in user's profile with visual indication of unverified status

### 3.5.3 Verification Request Phase

Attributes requiring authority-driven verification enter the verification request workflow:

1. User submits attribute for verification (implicitly by adding it)
2. System creates verification request in issuer queue
3. Request includes attribute details and any supporting documentation
4. Issuer receives notification in Trust Authority interface
5. Request remains in "pending" state until issuer action

### 3.5.4 Verification Approval Phase

Issuers review and approve or reject verification requests:

**For Self-Service Attributes (Email/Phone)**:
1. System sends simulated OTP to email/phone
2. User enters OTP code
3. System validates code and updates attribute status to "verified"
4. Trust score increments automatically
5. Verification event logged in audit trail

**For Authority-Driven Attributes (Institution/ID)**:
1. Issuer reviews request in Request Queue
2. Issuer examines uploaded documentation
3. Issuer makes approval or rejection decision
4. Upon approval:
   - Attribute status updated to "verified"
   - Verification signature created and attached
   - Trust score increments
   - Audit log entry created
5. Upon rejection:
   - Attribute remains "unverified"
   - Rejection reason recorded
   - User notified of rejection

### 3.5.5 Attribute Modification and Revocation Phase

The system implements strict controls around attribute modifications to maintain cryptographic integrity:

**Automatic Status Reset on Edit**:
- If a user modifies a verified attribute's value, the system immediately resets its status to "unverified"
- The original verification signature is invalidated
- Trust score is recalculated, potentially decreasing the trust level
- This prevents users from obtaining verification for one value and then changing it to another

**Issuer-Initiated Revocation**:
- Issuers can revoke previously granted verifications if fraud is discovered
- Revocation updates attribute status to "revoked" (distinct from "unverified")
- Trust score is recalculated
- Revocation event logged with reason and timestamp
- User is notified of revocation

### 3.5.6 Selective Disclosure and Verification Phase

When a holder needs to prove identity claims to a verifier:

1. Holder navigates to Selective Disclosure interface
2. Holder selects specific attributes to share
3. System generates JWS token containing only selected attributes
4. Token includes expiration timestamp (15 minutes default)
5. Holder copies token and transmits to verifier through secure channel
6. Verifier submits token to verification endpoint or Verifier Playground
7. System validates token signature and expiration
8. System returns attribute claims to verifier if valid
9. Transaction logged in both holder and verifier audit logs

### 3.5.7 Key Rotation Phase

In the event of suspected key compromise, users can rotate their cryptographic keys:

1. User navigates to Settings and selects "Rotate Magic Keys"
2. System generates new RSA key pair
3. New public key replaces old public key in identity record
4. DID remains unchanged (persistence of identity)
5. All future operations use new key pair
6. Old private key should be securely deleted by user
7. Rotation event logged in audit trail with timestamp

### 3.5.8 Identity Export Phase

Users can export their identity for backup or portability:

1. User navigates to Settings and selects "Download JSON DID Document"
2. System generates W3C-compliant DID Document containing:
   - DID
   - Public key in JWK format
   - Service endpoints
   - Metadata and verification methods
3. Document is downloaded as JSON file
4. User can import this document to compatible SSI wallets in the future

## 3.6 Trust and Verification Framework

### 3.6.1 Trust Model Architecture

The system implements a graduated trust model that recognizes different levels of identity assurance based on verification rigor. This model acknowledges that not all verifications are equivalent in their trustworthiness.

**Trust Dimensions**:
- **Verification Method**: Self-asserted vs. Authority-verified
- **Attribute Sensitivity**: Low-risk (email) vs. High-risk (government ID)
- **Issuer Reputation**: Implicit trust in institutional issuers
- **Verification Recency**: Newer verifications carry more weight

**Trust Accumulation**: Trust is accumulated progressively as users verify additional attributes. Each verification contributes to the overall trust score, allowing users to build credibility over time.

### 3.6.2 Verification Pathways

The system supports two distinct verification pathways optimized for different risk profiles:

**Self-Service Verification Pathway**:
- **Target Attributes**: Email, Phone
- **Mechanism**: Automated OTP delivery and validation
- **Assurance Level**: Low to Medium (L1-L2)
- **Processing Time**: Immediate (< 1 minute)
- **Use Cases**: Account recovery, low-risk communications

**Authority-Driven Verification Pathway**:
- **Target Attributes**: Institution affiliation, Government ID, Professional credentials
- **Mechanism**: Manual review by authorized issuers with supporting documentation
- **Assurance Level**: High to Maximum (L3-L4)
- **Processing Time**: Variable (hours to days depending on issuer)
- **Use Cases**: Academic credentials, financial services KYC, regulated industries

### 3.6.3 Issuer Authorization Model

The system implements role-based access control for issuers:

**Issuer Registration**: Organizations register as issuers through administrative channels (outside the scope of this prototype but designed for future implementation).

**Issuer Capabilities**: Authorized issuers can:
- Access verification request queues
- Review supporting documentation
- Approve or reject verification requests
- Revoke previously granted verifications
- View audit logs of their verification activities

**Issuer Accountability**: All issuer actions are cryptographically logged, creating an immutable record of who verified what and when.

### 3.6.4 Verification Revocation Mechanism

The system implements comprehensive revocation capabilities to handle fraud detection and credential expiration:

**Revocation Triggers**:
- Fraudulent documentation discovered post-verification
- Credential expiration (e.g., student no longer enrolled)
- Identity owner request to remove verification
- Issuer policy changes

**Revocation Process**:
1. Issuer initiates revocation through Trust Authority interface
2. System updates attribute status to "revoked"
3. Trust score recalculated (decremented)
4. Revocation event logged with reason and timestamp
5. Holder notified through dashboard notification
6. Future selective disclosure tokens exclude revoked attributes

**Revocation Propagation**: While the current implementation is standalone, the architecture is designed to support future revocation list publication, allowing verifiers to check revocation status in real-time.

## 3.7 Cryptographic Design and Security Mechanisms

### 3.7.1 Asymmetric Cryptography Foundation

The system's security model is built on asymmetric (public-key) cryptography, specifically RSA with probabilistic signature scheme (RSA-PSS).

**Key Generation Parameters**:
- Algorithm: RSA
- Key Length: 2048 bits (configurable to 4096 bits for high-security deployments)
- Signature Scheme: RSA-PSS
- Hash Function: SHA-256
- Mask Generation Function: MGF1 with SHA-256

**Security Properties**:
- **Confidentiality**: Private keys never leave the user's device
- **Authentication**: Public keys serve as persistent identifiers tied to DIDs
- **Non-repudiation**: Digital signatures prevent denial of actions
- **Integrity**: Any tampering with signed data invalidates the signature

### 3.7.2 DID Method Specification

The VORTEX-DID method implements a custom DID specification:

**DID Syntax**: `did:VORTEX:{unique-identifier}`

**Unique Identifier Generation**:
```
unique-identifier = Base58(SHA256(publicKey || timestamp))
```

**DID Document Structure**:
```json
{
  "@context": "https://www.w3.org/ns/did/v1",
  "id": "did:VORTEX:8kYdE9fG3hJ2mN5pQ7rS",
  "verificationMethod": [{
    "id": "did:VORTEX:8kYdE9fG3hJ2mN5pQ7rS#keys-1",
    "type": "RsaVerificationKey2018",
    "controller": "did:VORTEX:8kYdE9fG3hJ2mN5pQ7rS",
    "publicKeyJwk": { ... }
  }],
  "authentication": ["did:VORTEX:8kYdE9fG3hJ2mN5pQ7rS#keys-1"],
  "service": [{
    "id": "did:VORTEX:8kYdE9fG3hJ2mN5pQ7rS#vortex-identity",
    "type": "VortexIdentityService",
    "serviceEndpoint": "https://vortex-identity.example/api"
  }]
}
```

### 3.7.3 Digital Signature Workflow

**Signature Generation Algorithm**:
```
Input: message (M), privateKey (K_priv)
Output: signature (S)

1. hash = SHA256(M)
2. S = RSA-PSS-Sign(hash, K_priv)
3. Return S
```

**Signature Verification Algorithm**:
```
Input: message (M), signature (S), publicKey (K_pub)
Output: valid (boolean)

1. hash = SHA256(M)
2. valid = RSA-PSS-Verify(hash, S, K_pub)
3. Return valid
```

**Challenge-Response Protocol**:
```
Verifier → Holder: challenge = Random(256 bits)
Holder → Verifier: response = Sign(challenge, K_priv) || DID
Verifier: 
  1. Resolve DID to get K_pub
  2. Verify(challenge, response, K_pub)
  3. If valid, authenticate holder
```

### 3.7.4 Selective Disclosure Token Format

The system uses JSON Web Signature (JWS) for selective disclosure tokens:

**Token Structure**:
```
Header:
{
  "alg": "RS256",
  "typ": "JWT",
  "kid": "did:VORTEX:8kYdE9fG3hJ2mN5pQ7rS#keys-1"
}

Payload:
{
  "iss": "did:VORTEX:8kYdE9fG3hJ2mN5pQ7rS",
  "sub": "did:VORTEX:8kYdE9fG3hJ2mN5pQ7rS",
  "iat": 1704547200,
  "exp": 1704548100,
  "attributes": {
    "fullName": "John Doe",
    "institution": "VORTEX University",
    "institutionVerified": true
  }
}

Signature: RSA-PSS signature over (Header || Payload)
```

**Token Validation Process**:
1. Parse JWS token into header, payload, signature
2. Extract DID from payload
3. Resolve DID to retrieve public key
4. Verify signature using public key
5. Check expiration timestamp
6. Return attributes if all validations pass

### 3.7.5 Security Controls

**Client-Side Security**:
- Private keys stored in browser's IndexedDB with encryption
- Automatic session timeout after inactivity
- Key material cleared from memory after use
- Content Security Policy (CSP) headers to prevent XSS

**Server-Side Security**:
- Row-Level Security (RLS) in Supabase ensuring users can only access their own data
- SQL injection prevention through parameterized queries
- HTTPS enforcement for all communications
- Rate limiting on API endpoints to prevent brute force

**Data Security**:
- Public keys stored in database (non-sensitive)
- Private keys never transmitted or stored server-side
- Attribute data encrypted at rest in Supabase
- Visual assets stored in access-controlled buckets with signed URLs

**Audit Security**:
- Immutable audit logs using append-only tables
- Cryptographic signatures on audit entries
- Timestamp verification to detect log tampering
- Audit log export for external archival

## 3.8 Data Models and Flow Descriptions

### 3.8.1 Database Schema

**Identities Table**:
```sql
CREATE TABLE identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  did TEXT UNIQUE NOT NULL,
  public_key TEXT NOT NULL,
  metadata JSONB,
  trust_score INTEGER DEFAULT 0,
  trust_level TEXT DEFAULT 'L0',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Attributes Table**:
```sql
CREATE TABLE attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identity_id UUID REFERENCES identities(id),
  attribute_type TEXT NOT NULL,
  attribute_key TEXT NOT NULL,
  attribute_value TEXT,
  visual_asset_url TEXT,
  verification_status TEXT DEFAULT 'unverified',
  verified_by TEXT,
  verified_at TIMESTAMP,
  verification_signature TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Verification Requests Table**:
```sql
CREATE TABLE verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identity_id UUID REFERENCES identities(id),
  attribute_id UUID REFERENCES attributes(id),
  request_status TEXT DEFAULT 'pending',
  supporting_documents JSONB,
  reviewer_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP
);
```

**Audit Logs Table**:
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identity_id UUID REFERENCES identities(id),
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL,
  event_signature TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3.8.2 Data Flow Diagrams

**Identity Issuance Flow**:
```
User Browser                 Application Server           Database
     |                              |                         |
     |--[1] Request Identity------->|                         |
     |                              |                         |
     |<-[2] Return Form-------------|                         |
     |                              |                         |
     |--[3] Generate Keys---------->|                         |
     |    (Client-side)             |                         |
     |                              |                         |
     |--[4] Submit DID + PubKey---->|                         |
     |                              |                         |
     |                              |--[5] INSERT Identity--->|
     |                              |                         |
     |                              |<-[6] Success------------|
     |                              |                         |
     |<-[7] Identity Created--------|                         |
```

**Attribute Verification Flow (Authority-Driven)**:
```
Holder Browser          Issuer Browser          Server              Database
      |                       |                    |                    |
      |--[1] Add Attribute--->|                    |                    |
      |                       |                    |--[2] INSERT Attr-->|
      |                       |                    |                    |
      |                       |<--[3] Notify-------|                    |
      |                       |    New Request     |                    |
      |                       |                    |                    |
      |                       |--[4] Review Docs-->|                    |
      |                       |                    |                    |
      |                       |--[5] Approve------>|                    |
      |                       |                    |                    |
      |                       |                    |--[6] UPDATE Attr-->|
      |                       |                    |    status=verified |
      |                       |                    |                    |
      |                       |                    |--[7] UPDATE Score->|
      |                       |                    |                    |
      |<--[8] Notification----|                    |                    |
      |    Trust Level Up     |                    |                    |
```

**Selective Disclosure Flow**:
```
Holder Browser          Verifier System          Server              Database
      |                       |                    |                    |
      |--[1] Select Attrs---->|                    |                    |
      |                       |                    |                    |
      |--[2] Sign Token------>|                    |                    |
      |    (Client-side)      |                    |                    |
      |                       |                    |                    |
      |--[3] Generate JWS---->|                    |                    |
      |                       |                    |                    |
      |<-[4] Return Token-----|                    |                    |
      |                       |                    |                    |
      |--[5] Share Token----->|                    |                    |
      |    (Out of band)      |                    |                    |
      |                       |                    |                    |
      |                       |--[6] Verify Token->|                    |
      |                       |                    |                    |
      |                       |                    |--[7] GET PubKey--->|
      |                       |                    |                    |
      |                       |                    |<-[8] Return Key----|
      |                       |                    |                    |
      |                       |                    |--[9] Verify Sig--->|
      |                       |                    |                    |
      |                       |<-[10] Return Attrs-|                    |
```

### 3.8.3 State Transition Diagrams

**Attribute Verification Status States**:
```
[unverified] --Self-Service OTP--> [verified]
                                      |
[unverified] --Authority Approval--> [verified]
                                      |
[verified] --User Edits Value------> [unverified]
                                      |
[verified] --Authority Revokes-----> [revoked]
```

**Trust Level Progression**:
```
[L0: No Verification] --+10 Email--> [L1: Basic]
                                        |
[L1: Basic] --+15 Phone--------------> [L2: Medium]
                                        |
[L2: Medium] --+25 Institution-------> [L3: High]
                                        |
[L3: High] --+30 Gov ID/Biometric----> [L4: Maximum]
```

## 3.9 Technology Stack Justification

### 3.9.1 Next.js 16/React 19

The system leverages Next.js 16 and React 19 to provide a high-performance, secure, and modern web application framework. 

**Server-Side Rendering (SSR)**: Next.js provides robust SSR capabilities, allowing for the pre-rendering of pages on the server. This significantly improves initial load times and enhances SEO. More critically, for a security-focused application, SSR ensures that the initial state of the application is delivered securely, reducing the surface area for client-side manipulation during the bootstrapping phase.

**React 19 Features**: The adoption of React 19 brings advanced features such as improved hooks and optimized rendering logic. These enhancements contribute to a more responsive and fluid user experience, which is essential for complex interfaces like the Digital Wallet and Trust Authority dashboards.

**Unified Routing and API Handling**: Next.js combines frontend components and backend API routes within a single framework. This integration simplifies the development of the Verifier API and ensures seamless communication between the presentation and application layers.

### 3.9.2 TypeScript

TypeScript is utilized throughout the codebase to introduce static typing to the JavaScript ecosystem.

**Type Safety and Error Prevention**: In a system handling sensitive identity data and cryptographic operations, logical errors can have severe security implications. TypeScript’s static analysis detects potential bugs during development, long before the code is deployed to a production environment.

**Enhanced Developer Productivity**: Features such as autocompletion, refactoring tools, and clear interface definitions improve development velocity and code maintainability. This is particularly beneficial for the complex data structures involved in DID documents and selective disclosure tokens.

**Self-Documenting Code**: Type definitions serve as a living documentation of the system's internal data structures, making the codebase more accessible for peer review and security audits.

### 3.9.3 Supabase (PostgreSQL)

Supabase provides a powerful Backend-as-a-Service (BaaS) built on top of PostgreSQL, offering the scalability and security required for a robust identity registry.

**Row-Level Security (RLS)**: This is a critical security feature where access control is enforced at the database level rather than just the application level. RLS policies ensure that users can only interact with their own identity records and attributes, providing a strong defense against unauthorized data access.

**Secure Storage**: Supabase Storage is used to manage visual identity assets (photos, documents). It provides secure, access-controlled buckets where files are retrieved via temporary signed URLs, ensuring that sensitive documents are never exposed through static public links.

**PostgreSQL Foundation**: By utilizing PostgreSQL, the system benefits from decades of reliability, ACID compliance, and advanced JSONB support for flexible attribute management.

### 3.9.4 Web Crypto API

The system relies on the browser-native Web Crypto API (`crypto.subtle`) for all cryptographic operations.

**Privacy-by-Design**: By performing key generation and digital signing exclusively within the user's browser, the system adheres to the principle that private keys should never leave the owner's device. This eliminates the risk of server-side key compromise.

**Hardware Acceleration**: The Web Crypto API leverages underlying hardware capabilities to perform complex mathematical operations efficiently, ensuring that cryptographic functions do not negatively impact application performance.

**Zero-Knowledge Implementation**: This approach allows the system to function as a zero-knowledge service provider. The server facilitates the exchange and storage of public keys and verified attributes without ever having the capability to impersonate the user.

### 3.9.5 Docker & Containerization

The application is containerized using Docker to ensure environment consistency and simplify deployment.

**Multi-Stage Build Optimization**: The system employs a multi-stage `Dockerfile` that separates the dependency installation, building, and execution phases. This results in a highly optimized production image that contains only the necessary standalone assets, reducing the image size and minimizing the security attack surface.

**Portability and Reliability**: Docker containers encapsulate the entire runtime environment, ensuring that the application behaves identically across development, testing, and production environments. This eliminates the "it works on my machine" class of deployment issues.

**Simplified Infrastructure Management**: Through `docker-compose`, the complex interplay between the application server, environment variables, and external service configurations is managed as a single declared stack, facilitating reproducible research and deployment.

## 3.10 System Implementation Requirements

### 3.10.1 Hardware Requirements

**Client-Side (User Device)**:
- Processor: Dual-core 2.0 GHz or higher (supports hardware acceleration for cryptography)
- RAM: 4 GB minimum (8 GB recommended for smooth multi-tab operations)
- Storage: 100 MB available for browser local storage and IndexedDB
- Connectivity: Broadband internet connection for real-time synchronization with the identity registry

**Server-Side (Deployment Environment)**:
- Processor: 2-core CPU minimum (4-core recommended for API high concurrency)
- RAM: 2 GB minimum (4 GB recommended)
- Storage: 10 GB SSD for OS, Docker images, and temporary cache
- Environment: Support for Docker and Docker Compose

### 3.10.2 Software Requirements

**Operating System**:
- Development/Deployment: Windows (via PowerShell or WSL2), Linux (Ubuntu 22.04 LTS recommended), or macOS.
- Client: Any modern OS capable of running a compatible web browser.

**Browser Compatibility**:
- Google Chrome (Version 110+)
- Mozilla Firefox (Version 110+)
- Microsoft Edge (Version 110+)
- Safari (Version 16+)
- *Note: Browsers must support the W3C Web Crypto API and IndexedDB.*

**Tools and Runtimes**:
- Docker Desktop (for containerized deployment)
- Node.js 20.x or 22.x (for local development)
- Git (for version control)

## 3.11 Summary

Chapter 3 has detailed the comprehensive design and methodology of the Secure Digital Identity Management System. By adopting the SSI Trust Triangle and leveraging modern cryptographic standards, the system provides a robust framework for decentralized identity. The architecture prioritizes user sovereignty, privacy preservation through selective disclosure, and a graduated trust model that reflects the rigor of verification. The choice of a modern technology stack including Next.js, Supabase, and the Web Crypto API ensures that the implementation is secure, scalable, and prepared for real-world academic and professional applications.