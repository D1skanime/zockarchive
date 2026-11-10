# ZockArchive ScreenScraper gateway: release security and transport plan

Status: design and release-secret removal implemented on feature branch. The public gateway and ZA gateway transport are **not** implemented or approved by this change.

## Background

ZA's `backend/adapters/services/screenscraper.py` calls ScreenScraper directly using `aiohttp` GET and a request middleware which adds `devid`, `devpassword`, `ssid`, `sspassword`, `output=json`, and `softname`. Its default API base is `https://api.screenscraper.fr/api2`.

The existing release image included CI-owned developer credentials via Docker build ARG and final-image ENV. That design exposes developer credentials in distributable image configuration. The release workflow and Dockerfile must not do this, regardless of whether GitHub Actions secrets are private.

## Deployment modes

1. **Direct (backwards compatible):** the operator provides *their own* ScreenScraper developer credentials as runtime configuration in addition to their ScreenScraper account. No embedded credentials. Existing service behavior remains unchanged.
2. **Gateway (future, opt-in):** a separately operated HTTPS service supplies the registered ZA developer identity only after abuse-resistant authentication and policy enforcement. No shared immutable authentication token may be included in a publicly distributed ZA image.

Until the gateway protocol and authorization are ready, do not make it the default. An installation with no developer credentials and no approved gateway cannot rely on ScreenScraper being available.

## Existing API behaviors to preserve

- `jeuRecherche.php`, `jeuInfos.php`, `ssuserInfos.php`, `ssinfraInfos.php`, and all additional API paths identified through call-site review
- Account-specific thread and request quotas, daily quota breaker, retry/error mapping (notably 401, 426, 429, 430, 431), scan lifecycle behavior and timeouts
- Remote artwork/media downloads; these may be independent URLs and should not silently bypass gateway controls
- Sensitive query parameters never appear in ZA/gateway/proxy logs, tracing, monitoring or error reporting
- Personal account details are provided only by the user's own installation; a third-party gateway necessarily receives personal secrets in the current ScreenScraper query-parameter protocol, so explicit security/privacy review is mandatory

## Gateway threat model

A public endpoint without per-installation authorization would permit anyone to spend the developer quota. Using a single embedded bearer token or relying on CORS, IP alone or unverified self-registration is not authentication.

Required before community use:
- explicit provider authorization for central aggregation
- scoped and revocable client enrollment, abuse controls at identity/IP/global levels, and operator procedures for revocation
- strict endpoint/parameter allowlists, fixed upstream host, TLS verification, no redirects and no arbitrary proxying
- bounded responses and streaming design for large media; no user credential persistence
- privacy notice, TLS everywhere, gateway/proxy redaction, quota telemetry with no personal data
- deployment isolation from private NAS, Team4S, and development services
- outage/fallback policy and documented transfer to VPS using the same public DNS
- independent security review and negative tests

## Current pilot limitations

The privately operated Synology pilot supports a subset of the API with POST JSON plus a *single* shared pilot bearer token. It is **not** a public transport contract. It has no enrollment or public abuse prevention, does not cover account priming endpoints, and has not been integrated into ZA. Keep it private and do not publish the pilot token.

## Tests before merging a production-ready integration

1. Build full/slim images and verify the exact OCI image config, layer contents, build output, and build history do not include developer secrets.
2. Direct-mode integration tests with operator-supplied credentials; preserve all existing direct paths and quota behavior.
3. Contract tests for gateway and direct mode; missing/invalid authentication, input limits, no open redirect/SSRF, retry status mapping.
4. Media (including larger downloads), account quota priming, scan and scheduled-scan regression tests.
5. Isolated end-to-end installation, rollback and redacted logs; do not touch live NAS data.

## Immediate release behavior change

After the Dockerfile/CI change, a stock ZA release image **will not include developer credentials**. Direct mode must receive developer credentials at runtime from each operator, until a safe managed-gateway alternative has been implemented. Do not publish a public release claiming turnkey ScreenScraper support before that user experience is resolved.

## Boundaries

This branch does not deploy to Synology, change Portainer, edit the user's credentials, alter other projects, enable public DNS, or migrate data. This document does not imply ScreenScraper's permission for shared developer-credential usage.
