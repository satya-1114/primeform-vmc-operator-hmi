# Primeform Labs VMC Operator HMI

## Working notes

- Keep the existing industrial HMI design and workflow logic intact.
- The frontend uses TanStack Start + React and the backend uses Express + MongoDB.
- Do not change the staged workflow, persistence model, API contract, or machine states.
- Prefer surgical edits only for branding, metadata, and cleanup.
- Validate frontend build and backend tests after any changes.
