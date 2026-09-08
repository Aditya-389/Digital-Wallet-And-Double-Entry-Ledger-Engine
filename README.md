# Digital Wallet & Double-Entry Ledger Engine

A production-oriented backend for a digital wallet system built around **PostgreSQL, ACID transactions, double-entry bookkeeping, idempotent APIs, concurrency control, webhook security, and financial auditability**.

The project focuses on the engineering challenges of financial systems: **money correctness, duplicate requests, concurrent transactions, immutable financial history, secure payment webhooks, and reconciliation**.

---

## Features

### Authentication & Authorization

- JWT-based authentication
- Short-lived access tokens
- Refresh token rotation
- Refresh token hashing
- Unique `jti` for refresh token sessions
- Token/session revocation
- Role-based access control:
  - Customer
  - Support
  - Admin
- HTTP-only authentication cookies
- Password hashing with Argon2

### Wallets

- Users can own multiple wallets
- Multiple wallets can use the same currency
- Wallet activation/deactivation
- Wallet ownership validation
- One ledger account per wallet
- Currency consistency between wallet and ledger account
- Balance derived from ledger entries

### Double-Entry Ledger

The ledger is the **source of truth for wallet balances**.

Balance is derived using:

```text
Balance = Total Credits - Total Debits
```

# Architecture
                         Client
                           |
                           v
                    Express REST API
                           |
             +-------------+-------------+
             |             |             |
             v             v             v
       Authentication  Idempotency   Validation
             |             |             |
             +-------------+-------------+
                           |
                           v
                     Controllers
                           |
                           v
                       Services
                           |
                           v
                        Prisma
                           |
                           v
                      PostgreSQL
                           |
          +----------------+----------------+
          |                |                |
          v                v                v
        Users           Wallets           Ledger
                                             |
                                  +----------+----------+
                                  |                     |
                                  v                     v
                           LedgerTransaction       LedgerEntry
                    
