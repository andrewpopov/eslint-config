# Security Policy

## Supported versions

Security fixes are made on the default branch and included in the next tagged
release. Older releases are not maintained separately.

## Reporting a vulnerability

Do not open a public issue for a suspected vulnerability. Use GitHub's private
reporting flow at <https://github.com/andrewpopov/eslint-config/security/advisories/new>.
Include the package version, a minimal reproduction, impact, and any suggested
mitigation. Please allow a reasonable period for investigation and a coordinated
fix before public disclosure.

## Scope

Report flaws in this package's source, published artifacts, or release process.
This is a lint-rule and config package with no runtime attack surface in
consuming applications; a "vulnerability" here is more likely a rule that fails
to catch what it claims to, or a preset that silently no-ops. For a consuming
application's own credentials, deployment, or configuration, report the issue
to that application separately.
