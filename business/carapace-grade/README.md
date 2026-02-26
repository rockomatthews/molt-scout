# Carapace Grade (internal runner)

Deterministic runner to generate a before/after Carapace security grade report for our repos.

## Run

```bash
cd business/carapace-grade
npm run scan:all
```

Outputs land in `business/carapace-grade/reports/<timestamp>/<repo>/`.

## Notes

- Uses `npx -y carapace` so it doesn’t require global install.
- For customer work we will run against a clean checkout and open a PR with fixes.
