# 📋 Project Roadmap: Secure Digital Identity Management System

This document tracks the progress of the system implementation.

## 🏗️ Stage 1: Foundation & Identity Issuance
*Goal: Establishing the core identity record with cryptographic anchors.*
- [ ] Setup Supabase SQL schema (Identities, Keys tables)
- [ ] Implementation of Ozoro-DID generation logic
- [ ] Client-side cryptographic key pair generation (RSA/ECDSA)
- [ ] Identity Issuance Bridge (Public Key submission & Metadata storage)

## 🎖️ Stage 2: Attribute Verification & Trust Engine
*Goal: Turning raw data into verified identity assets and scoring them.*
- [ ] Dynamic Attribute Store (Scalable schema for Name, DOB, Institution)
- [ ] Trust Engine Logic (Point-based scoring for L1 to L4 assurance levels)
- [ ] Verification Handlers (OTP for Email/Phone)
- [ ] Admin Verification Interface (For high-assurance L4 verification)

## 🔐 Stage 3: Cryptographic Proofs & Challenge-Response
*Goal: Proving you are who you say you are without revealing passwords.*
- [ ] Challenge Generation Logic (Server-side)
- [ ] Signature Signing (Client-side Holder wallet)
- [ ] Verification Engine (Signature & Public Key matching)
- [ ] Non-repudiation logging

## 🤝 Stage 4: Consent & Attribute Disclosure
*Goal: Giving users power over their own data.*
- [ ] Consent UI (Granular selection of attributes to share)
- [ ] Signed Verification Tokens (JWS/JWT based)
- [ ] Privacy Controls (Expiring tokens for verifiers)
- [ ] Row Level Security (RLS) policies for attribute protection

## 🌐 Stage 5: Verifier API & External integration
*Goal: Enabling the "Identity-as-a-Service" capability.*
- [ ] External Verification API endpoints
- [ ] Developer Documentation (Mock API playground)
- [ ] DID Resolution API

## 🎨 Stage 6: UI/UX & Compliance Layer
*Goal: Making it look premium and audit-ready.*
- [ ] Holder Dashboard (Identity Card UI & Activity Feed)
- [ ] Admin Compliance Dashboard (Global system health & Audit trials)
- [ ] Animated UI transitions and Dark Mode support
- [ ] Final end-to-end security audit
