# Domain Services

This directory contains stateless domain services that encapsulate pure domain logic.

## When to Use Domain Services

Domain services should be used for:

- **Cross-aggregate rules or orchestration logic**
- **Domain logic that doesn't naturally belong to any specific model**
- **Complex business operations that require coordination between multiple aggregates**

## When NOT to Use Domain Services

⚠️ **If the logic is stateless, reusable, and expresses a business invariant, prefer placing it in `invariants/` instead.**

Examples of logic that belongs in `invariants/`:

- Password policies
- Business eligibility checks
- Permission rules
- Format validation rules

## Guidelines

- Keep services stateless and focused on coordination
- Avoid putting simple business rules here - use `invariants/` instead
- Services should orchestrate domain operations, not contain them
- Follow the naming convention: `[purpose].service.js`

## Current Status

This directory contains:

- `passwordStrength.service.js` - Provides computational logic for calculating password strength scores

This demonstrates proper separation of concerns where:

- **Invariants** enforce business rules (password validation)
- **Services** provide computational logic (strength calculation)

When adding new domain services, ensure they truly require orchestration logic and cannot be expressed as simple invariant rules.
