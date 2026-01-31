# Analytics

Privacy-friendly website analytics using Plausible.

## What We Track

**User Authentication**
- Authentication method selection (PAT, OAuth, GitHub App, Demo)

**Repository Management**
- Repository additions and removals
- Settings changes with repository counts

**User Interactions**
- Demo mode usage and interactions
- Tab navigation within repository cards
- Card expansion/collapse

## Privacy

- GDPR/CCPA compliant
- No cookies
- Fully anonymized
- No personal data collected

## Implementation

Plausible script included in [index.html](../index.html). Events tracked via `trackEvent()` utility in [src/utils/analytics.js](../src/utils/analytics.js).

**View dashboard:** [plausible.io/actions-dashboard.samholden.pro](https://plausible.io/actions-dashboard.samholden.pro)
