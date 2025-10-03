# Parent-Child Monitoring Backend

Minimal notes:

- Run locally: copy `.env.example` to `.env` and adjust variables.
- Install: `npm ci`
- Run migrations: `npm run db:migrate`
- Run tests: `npm test`

CI status: ![CI](https://github.com/yasinghadiri-dev/ggg-backend/actions/workflows/ci.yml/badge.svg)

Windows / PowerShell notes:

- If you see an error about `npm.ps1` being blocked by ExecutionPolicy, either run PowerShell as administrator and set the policy (for example `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`) or run certain dev tools via node directly. Example:

```powershell
# Run ESLint via node to avoid ExecutionPolicy issues
node node_modules\eslint\bin\eslint.js . --ext .js
```

This repository's CI runs on Linux runners; Windows-specific tooling notes are for local development only.
