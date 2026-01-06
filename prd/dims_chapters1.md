# CHAPTER ONE – INTRODUCTION

## 1.1 Background of the Study

The digital landscape is currently witnessing a fundamental shift in how personal identity is managed and verified. For decades, the internet has relied on centralized and federated identity models, where user identities are siloed within proprietary databases (e.g., social media logins, corporate directories) or managed by overarching third-party providers. While these models offered early convenience, they have introduced systemic vulnerabilities, including single points of failure, massive data breaches, and a pervasive lack of user control over personal data.

The emergence of the Self-Sovereign Identity (SSI) paradigm offers a transformative solution. SSI is a user-centric model that empowers individuals to generate, own, and control their digital personas without the need for centralized intermediaries. By leveraging advancements in asymmetric cryptography, decentralized identifiers (DIDs), and verifiable credentials, SSI allows for the establishment of trust through mathematical proof rather than institutional permission. This project, the Secure Digital Identity Management System (Secure-DIMS), also known as the Vortex Identity Ecosystem, is designed to implement these principles into a practical, secure, and user-centric platform.

## 1.2 Problem Statement

Traditional identity management systems are plagued by several critical issues:
1. **Centralized Vulnerability**: Storing millions of user credentials in single databases makes them prime targets for hackers, as evidenced by frequent high-profile data breaches.
2. **Identity Fragmentation**: Users must manage dozens of inconsistent accounts across different platforms, leading to "password fatigue" and poor security practices.
3. **Lack of Data Sovereignty**: Users have little to no control over how their data is shared or used by identity providers once it is collected.
4. **Privacy Violations**: To verify a single attribute (like age or employment), users often have to disclose their entire identity profile, leading to unnecessary exposure of sensitive data.

There is an urgent need for a system that provides robust security through cryptographic trust while guaranteeing user privacy and data ownership.

## 1.3 Aim and Objectives

### 1.3.1 Aim
The primary aim of this study is to design and implement a Secure Digital Identity Management System (Secure-DIMS) that leverages decentralized principles to provide a privacy-preserving and user-centric identity infrastructure.

### 1.3.2 Objectives
To achieve this aim, the following specific objectives have been defined:
1. To design a decentralized architecture based on the SSI Trust Triangle involving Holders, Issuers, and Verifiers.
2. To implement a client-side cryptographic engine for secure key generation and digital signatures.
3. To develop a graduated trust scoring system that reflects different levels of identity assurance.
4. To implement a selective disclosure mechanism allowing users to share specific identity attributes without exposing their full profile.
5. To evaluate the system’s effectiveness against common identity security threats and privacy requirements.

## 1.4 Scope of the Study

The scope of this project is limited to the design and implementation of a functional prototype of a digital identity management system. The system focuses on:
- **Core acting portals**: Digital Wallet (Holder), Trust Authority (Issuer), and Verifier Playground.
- **Technologies**: Next.js 16/React 19 for the frontend, Supabase for the identity registry, and the Web Crypto API for client-side security.
- **Identity lifecycle**: Identity issuance, attribute management, verification workflows, and selective disclosure.
- **Standardization**: Use of W3C DID-lite methods and JWS-based tokens for interoperability.

This study does not cover the deployment of a public blockchain node but adheres to the architectural principles of blockchain-based decentralized identity.

## 1.5 Significance of the Study

The significance of this study lies in its potential to revolutionize digital trust. By providing a practical implementation of SSI, the project demonstrates how:
- **Individuals** can reclaim control over their digital lives and reduce the risk of identity theft.
- **Organizations** can reduce their security burden by not having to store sensitive user passwords or full identity profiles.
- **Developers** can integrate secure, verifiable identity checks into their applications without building complex custom authentication backends.

Ultimately, this study contributes to the global effort to build a more secure, private, and user-centric internet.

## 1.6 Definition of Terms

- **DID (Decentralized Identifier)**: A new type of identifier that enables verifiable, decentralized digital identity.
- **SSI (Self-Sovereign Identity)**: An identity model that gives individuals full control over their digital persona.
- **Holder**: The user who owns and controls their digital identity.
- **Issuer**: An authority that verifies and signs identity claims (e.g., a university or government).
- **Verifier**: A third-party service that checks the validity of an identity claim.
- **JWS (JSON Web Signature)**: A standard for representing content to be digitally signed.
- **RLS (Row-Level Security)**: A database feature that restricts data access based on the user's role and identity.
