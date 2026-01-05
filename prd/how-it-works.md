# 🧠 The OZORO Identity Ecosystem: The Complete Guide

Welcome to the future of the internet! This document explains how Secure-DIMS works—from the simple "Gold Star" analogy to the complex cryptographic code running behind the scenes.

---

## 🌟 1. The Quick Start Flow (Your First 5 Minutes)

To see the system in action, follow these exact steps:

1.  **Issue Identity**: On the home screen, enter your name/email. This creates your "Magic Keys" and a unique **DID** (Decentralized Identifier).
2.  **Add Attributes**: Go to **My Attributes**. Click "Add New Attribute" to add things like your School Name or Phone.
3.  **Get Verified (The Roleplay)**: 
    - Go to the **Request Queue** (under *Authority*). 
    - Act as the "Admin" and click **Approve** on your attributes.
    - Notice your **Trust Level** on the dashboard go from L1 ➡️ L2 ➡️ L3!
4.  **Share Proof**: 
    - Go to **Selective Disclosure**. 
    - Check ONLY the boxes you want to share. Click **Generate**.
    - Copy the long "Token" code that appears.
5.  **Test the Proof**: 
    - Go to the **Verifier Playground**. 
    - Paste your token and click **Verify**. 
    - The system will prove it's really you without ever seeing your profile!

---

## 📝 2. Common Attributes (What should I fill?)

If you're not sure what values to use, here are some common examples for your profile:

| Attribute | What it is | Example Values |
| :--- | :--- | :--- |
| **Full Name** | Your legal name | `John Doe`, `Jane Smith` |
| **Email** | Your contact address | `john@example.com` |
| **Institution** | An organization that vouches for you | `Ozoro University`, `Tekiplanet Corp`, `Ministry of Health` |
| **Identity Number** | A unique ID from your country/work | `NIN-12345`, `EMP-8890` |

> [!TIP]
> **Pro Tip**: In this demo, the **Institution** is special. Since it represents a formal authority, it requires "Approval" from the **Authority (Issuer)** portal before it becomes verified!

---

## 📂 3. Section Breakdown: What is each room for?

We have split the dashboard into three logical areas based on the **SSI Trust Triangle**.

### 🏠 A. Digital Wallet (Holder) - *Your Private Space*
*This is where you live and manage your assets.*
-   **Dashboard**: Your "ID Card" summary. It shows your **DID** (your digital name address) and your **Trust Level** (assurance score).
-   **My Attributes**: Your digital filing cabinet. You can add, edit, or delete any information about yourself here.
-   **Selective Disclosure**: Your privacy tool. Use this to create a "temporary pass" (Token) that only contains specific information for a specific person.

### 🏛️ B. Trust Authority (Issuer) - *The Official Space*
*This space represents the organizations that vouch for you.*
-   **Request Queue**: Imagine this is an office at your University. In the real world, an official would look at your documents and click "Approve." Here, you can click it yourself to see how the system updates your trust score!

### � C. Public Space (Verifier) - *The External Space*
*This represents an "External App" (like a bank or a website).*
-   **Verifier Playground**: This section acts as a 3rd-party app. It doesn't have access to your private database. It only knows how to read the "Tokens" you give it. Paste a token here to see the cryptographic magic verify your identity.

---

## 🔑 4. The Science (How it works under the hood)

### The Identity Lifecycle
The system doesn't use standard usernames/passwords. It uses **Asymmetric Cryptography**.

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Supabase
    User->>Browser: Clicks "Issue Identity"
    Browser->>Browser: Generates RSA Key Pair (Private/Public)
    Browser->>Browser: Creates Unique DID (did:ozoro:...)
    Browser->>Supabase: Stores DID + Public Key + Metadata
    Supabase-->>Browser: Identity Anchored Successfully
```

### The Trust Scoring Engine (Verification Paths)

Assurance levels are calculated based on how an attribute was verified.

| Attribute | Points | Level | Verification Path |
| :--- | :--- | :--- | :--- |
| Email | +10 | **L1** | **Self-Service**: Immediate (Simulated OTP) |
| Phone | +15 | **L2** | **Self-Service**: Immediate (Simulated SMS) |
| Institution| +25 | **L3** | **Authority-Driven**: Requires Issuer Portal Approval |
| Biometrics | +30 | **L4** | **Authority-Driven**: Requires Admin Unlock |

### Cryptographic Proof (The Challenge-Response)
When a verifier wants to check you, you don't give them your private key. 

1.  **Challenge:** The verifier gives you a random string: `x7j9...`
2.  **Signing:** Your browser signs it with your **Private Key** (Your secret stamp).
3.  **Verification:** The verifier checks the signature with your **Public Key** (The open lock). If they match, you are verified!

---

## 🛡️ 5. Attribute Lifecycle & Revocation

To ensure persistent trust, identity attributes follow strict lifecycle rules:

### 1. Verification Revocation
Authorities (Issuers) have the power to **Revoke** a previously verified attribute. 
- **Scenario**: A University discovers a student provided fraudulent documents after initial approval.
- **Action**: The Issuer clicks "Revoke" in the Issuer Portal, resetting the attribute to `unverified`.

### 2. Automatic Status Reset (Edit Protection)
If a Holder modifies the value of a verified attribute, its status is **immediately reset** to `unverified`.
- **Reasoning**: A cryptographic "Secret Stamp" is tied to a specific value. If that value changes (e.g., updating your name), the old stamp is no longer valid for the new data.

### 3. Immutable Audit Trail
To prevent fraud, the system records every significant event in an **Immutable Log**.
- **Transparency**: You can see exactly when you added an attribute, when it was verified, and by whom.
- **Security**: These logs provide a permanent "Paper Trail" for your digital identity that cannot be altered.

---

## 🔑 6. Advanced Security & Portability

### Key Rotation (Security Refresh)
Imagine your "Magic Key" (Private Key) is lost or compromised. In our system, you can **Rotate** your keys.
- **How it works**: You generate a brand new set of keys, but your **DID** (your ID number) stays the same. 
- **Benefit**: It's like changing the locks on your house without having to change your home address.

### Identity Export (Data Portability)
Your identity belongs to **YOU**, not us. 
- **JSON DID Document**: You can download your official Identity Document at any time. This file follows international standards (W3C), meaning you could theoretically take it to any other compatible digital wallet in the future.

---

## ️ 7. Selective Disclosure (Novice Edition)

Imagine you want to buy a ticket for a scary movie. The ticket seller needs to know your **Age**, but they don't need to know your **Home Address**.

- **Normal ID Card:** You show it, and they see everything.
- **OZORO ID:** You pick **ONLY** the "Age" box. Our system makes a special temporary ticket that *only* proves your age. This is the ultimate privacy.

---

## 🌟 8. Summary for a Kindergarten Genius:
1.  **Wallet**: Your backpack with your stickers.
2.  **Authority**: The teacher who puts a "Gold Star" on your stickers.
3.  **Verifier**: The librarian who checks if you have a "Gold Star" before letting you borrow a book.
4.  **Playground**: The place where you test your stickers to see if they are real!

**You are now a Digital Identity Master!** 🔐🚀
