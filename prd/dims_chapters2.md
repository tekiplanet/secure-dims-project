# CHAPTER TWO – LITERATURE REVIEW

## 2.1 Introduction

The concept of identity is foundational to human interaction, and its transition into the digital realm has introduced complex challenges regarding security, privacy, and trust. In the 21st century, digital identity has moved from a peripheral technical requirement to a central pillar of the global economy and social structure. However, the current infrastructure for managing these identities is fraught with systemic flaws. This chapter provides an extensive review of the literature surrounding digital identity management, tracing its historical evolution from centralized silos to the modern paradigm of Self-Sovereign Identity (SSI). It explores the theoretical frameworks, the enabling cryptographic technologies, and the empirical studies that define the current state of the field.

## 2.2 Historical Evolution of Digital Identity Models

The literature characterizes the evolution of digital identity through four distinct phases, as identified by researchers such as Christopher Allen and the W3C community.

### 2.2.1 Siloed Identity (The Early Web)
In the early days of the internet, identity was managed in a fragmented manner. Every website or service provider maintained its own independent database of user credentials. This "Siloed" model required users to create and manage separate usernames and passwords for every service they accessed. While simple to implement for developers, it placed an immense cognitive burden on users (leading to "password fatigue") and introduced massive security risks, as a breach in one silo often led to credential stuffing attacks across others.

### 2.2.2 Federated Identity (OAuth, SAML, and Social Login)
To address the friction of siloed accounts, the federated model emerged. In this model, a user's identity is managed by a central Identity Provider (IdP), such as a corporation (Active Directory) or a social media giant (Google, Facebook). Through protocols like SAML and OAuth, these IdPs vouch for the user to third-party Service Providers (SPs). While this significantly improved usability through "Single Sign-On" (SSO), it created a dangerous concentration of power. Users became dependent on IdPs who could unilaterally revoke access to their digital lives, and these IdPs gained unprecedented visibility into user behavior across the web.

### 2.2.3 User-Centric Identity (OpenID and Centralized Portals)
User-centric identity was an intermediate attempt to give users more choice by allowing them to select their preferred IdP. Standards like OpenID allowed for a more flexible federation. However, the underlying architecture remained centralized; the user still did not "own" the root of their identity, and the transaction still required the active participation and permission of a central authority.

### 2.2.4 Self-Sovereign Identity (SSI)
The Self-Sovereign Identity paradigm represents the most advanced stage of this evolution. Influenced by the decentralization movement of the 2010s, SSI posits that individuals should be the sole owners and controllers of their digital identities. In an SSI model, there is no central IdP. Instead, users hold their own cryptographic keys and manage their data using digital wallets, acting as the primary source of truth for their identity claims.

## 2.3 Theoretical Foundations of Self-Sovereign Identity

### 2.3.1 The 10 Principles of SSI
The academic study of SSI is largely anchored by the "Ten Principles of Self-Sovereign Identity" proposed by Christopher Allen. These principles serve as a roadmap for designing ethical and robust identity systems:
1.  **Existence**: Users must have a digital existence that is independent of any institution.
2.  **Control**: Users must have ultimate control over their digital identities and be the primary authority on their use.
3.  **Access**: Users must have easy access to all the data associated with their identity.
4.  **Transparency**: The algorithms and protocols used for identity management must be open and observable.
5.  **Persistence**: Identities must be long-lived and not subject to the lifespan of a single service provider.
6.  **Portability**: Identity data must be transportable across different jurisdictions and systems.
7.  **Interoperability**: Different identity systems must be able to communicate using shared standards.
8.  **Consent**: Users must provide explicit, informed consent for any use of their identity data.
9.  **Minimalization**: Disclosure of data must be limited to the minimum necessary to complete a transaction.
10. **Protection**: The system must prioritize the rights and security of the individual over the convenience of the institution.

### 2.3.2 The Trust Triangle Model
Literature on SSI frequently references the "Trust Triangle" or "Identity Diamond" model. This theoretical framework defines three primary roles:
- **The Holder**: The individual who manages their identity via a digital wallet and holds the private keys.
- **The Issuer**: An authority (such as a government, employer, or university) that issues signed assertions about a holder.
- **The Verifier**: A service provider that checks the validity of an issuer's signature on a holder's claim before granting access.
Trust in this model is "decoupled"; the issuer and verifier do not need to communicate directly, as they both rely on the cryptographic proof provided by the holder and a decentralized registry.

## 2.4 Enabling Technologies for Decentralized Identity

The transition from theory to practice in SSI is enabled by several key technical standards and cryptographic primitives.

### 2.4.1 Decentralized Identifiers (DIDs)
A Decentralized Identifier (DID) is a new type of globally unique identifier that enables verifiable, decentralized digital identity. Unlike traditional identifiers (e.g., email addresses or usernames), a DID is not issued by a central authority. Instead, it is generated by the user and anchored on a decentralized network or ledger. The W3C DID Core specification defines a DID Document as a JSON object that contains the public keys and service endpoints required to interact with the DID owner.

### 2.4.2 Verifiable Credentials (VCs)
While DIDs provide the identifier, Verifiable Credentials (VCs) provide the data. The W3C VC Data Model defines a standard for digital cards that can be cryptographically signed by an issuer. VCs are tamper-evident and can be easily shared by the holder with a verifier. The primary advantage of VCs is their ability to represent any attribute—from a driver's license to a library card—in a machine-readable, verifiable format.

### 2.4.3 JSON Web Signatures (JWS) and Tokens
To maintain interoperability in web environments, many SSI systems utilize JSON Web Signatures (JWS). JWS is a standard for representing signed content (claims) that is easily transportable across HTTP. It provides the mechanism for "Selective Disclosure," where a holder can generate a specific JWS token containing only a subset of their attributes, signed with their private key to prove ownership.

### 2.4.4 Zero-Knowledge Proofs (ZKP)
A critical area of ongoing research is the application of Zero-Knowledge Proofs in identity management. ZKPs allow a holder to prove a statement (e.g., "I am over 18") without revealing the underlying data (the actual birth date). This represents the pinnacle of privacy-by-design, as the verifier gains the necessary assurance without ever "seeing" the sensitive personal information.

## 2.5 Review of Cryptographic Primitives

The literature emphasizes the need for high-performance and future-proof cryptographic algorithms in identity systems.

### 2.5.1 Asymmetric vs. Symmetric Cryptography
Identity systems rely almost exclusively on asymmetric (public-key) cryptography. While symmetric cryptography is faster, it requires a shared secret between participants, which is impractical for decentralized systems. Asymmetric cryptography allows the holder to keep a private key secret while sharing a public key with the world to verify their signatures.

### 2.5.2 RSA-PSS vs. ECDSA
Two primary standards for digital signatures are RSA-PSS (Probabilistic Signature Scheme) and ECDSA (Elliptic Curve Digital Signature Algorithm). RSA-PSS is often preferred for its strong security proofs and its inclusion of randomness, which prevents certain types of signature attacks. ECDSA is favored in mobile and resource-constrained environments due to its shorter key lengths. The literature suggests that the choice of algorithm should be driven by the specific security context of the application.

## 2.6 Empirical Review of Existing SSI Implementations

### 2.6.1 Government and Institutional Projects
Several governments have begun exploring SSI for national identity programs. The **European Blockchain Services Infrastructure (EBSI)** is a notable example, aiming to provide a cross-border identity layer for EU citizens. Similarly, the **Sovrin Network** provides a global public utility for identity, governed by a non-profit foundation. These projects demonstrate the scalability of SSI but often highlight the challenges of regulatory compliance and international standardization.

### 2.6.2 Corporate and Enterprise Solutions
In the private sector, companies like **Microsoft (Entra Verified ID)** and **IBM** have integrated SSI into their identity and access management (IAM) products. While these solutions are robust, critics in the literature argue that they may inadvertently recreate the silos of the federated model if they are not built on truly open and neutral registries.

### 2.6.3 The "Zero-Knowledge" Web
A growing body of empirical research focuses on "Zero-Knowledge" web applications, where the server provides a platform for data exchange without ever seeing the raw data (which is encrypted or signed at the edge). This project sits within this research area, investigating how standard web technologies can be used to facilitate zero-knowledge identity transactions.

## 2.7 Summary of Literature Review and Identification of Gaps

The literature review confirms that the shift toward Self-Sovereign Identity is both necessary and technically feasible. However, several gaps remain:
1.  **Complexity Gap**: Many existing SSI solutions are highly complex, requiring deep knowledge of blockchain and distributed systems, which creates a barrier for general web developers.
2.  **Usability Gap**: There is a lack of practical frameworks that demonstrate how to provide a "premium" user experience without compromising the underlying cryptographic security.
3.  **Standardization vs. Practicality**: While official W3C standards exist, they are often too heavyweight for lightweight web prototypes.

This study aims to address these gaps by designing a system that utilizes standard web technologies (Next.js, Supabase, Web Crypto API) to implement SSI principles in a way that is modern, accessible, and secure. By focusing on a "Web-Native SSI" approach, the project provides a practical model for how decentralized identity can be integrated into the next generation of web applications.
