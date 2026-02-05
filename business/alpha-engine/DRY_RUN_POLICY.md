# Alpha Engine Dry-Run Policy

Per user instruction (2026-02-04):
- Keep the system in **dry run** until it produces **5 good alerts**.
- Then ask the user for explicit permission to go live.

## Definition of "good alert" (v1)
- A candidate alert with score >= 75
- Contains at least 1 extracted ticker
- Not suppressed by cooldown

This is a starting heuristic; we will refine based on actual outcomes.
