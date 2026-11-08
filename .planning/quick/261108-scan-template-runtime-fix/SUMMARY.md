---
quick_id: 261108-scan-template-runtime-fix
status: complete
phase: 41
---

# Scan view runtime template repair

The browser exposed that the previous size-only extraction used an external Vue
template resource that the active Vite server rejected. The scan view now keeps
its template in a feature component and moves its scan orchestration into the
`useScanView` composable. Focused footer and live-progress components preserve
their domain responsibilities without adding a second scan state owner.

Verification: frontend typecheck passed. Authenticated Playwright checks on
`/scan` passed at 1440px and 390px. They opened and closed the results explorer,
changed and reset platform and outcome filters, searched by game name, and
observed only HTTP 200 scan-operation responses. No tests or test suites were
added or run before live UAT.
