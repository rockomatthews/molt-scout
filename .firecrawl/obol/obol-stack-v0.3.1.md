[Skip to content](https://github.com/ObolNetwork/obol-stack/releases/tag/v0.3.1#start-of-content)

You signed in with another tab or window. [Reload](https://github.com/ObolNetwork/obol-stack/releases/tag/v0.3.1) to refresh your session.You signed out in another tab or window. [Reload](https://github.com/ObolNetwork/obol-stack/releases/tag/v0.3.1) to refresh your session.You switched accounts on another tab or window. [Reload](https://github.com/ObolNetwork/obol-stack/releases/tag/v0.3.1) to refresh your session.Dismiss alert

{{ message }}

[ObolNetwork](https://github.com/ObolNetwork)/ **[obol-stack](https://github.com/ObolNetwork/obol-stack)** Public

- [Notifications](https://github.com/login?return_to=%2FObolNetwork%2Fobol-stack) You must be signed in to change notification settings
- [Fork\\
0](https://github.com/login?return_to=%2FObolNetwork%2Fobol-stack)
- [Star\\
4](https://github.com/login?return_to=%2FObolNetwork%2Fobol-stack)


# Release v0.3.1

[Latest](https://github.com/ObolNetwork/obol-stack/releases/latest)

[Latest](https://github.com/ObolNetwork/obol-stack/releases/latest)

Compare

# Choose a tag to compare

## Sorry, something went wrong.

Filter

Loading

## Sorry, something went wrong.

### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/ObolNetwork/obol-stack/releases/tag/v0.3.1).

## No results found

[View all tags](https://github.com/ObolNetwork/obol-stack/tags)

![@github-actions](https://avatars.githubusercontent.com/in/15368?s=40&v=4)[github-actions](https://github.com/apps/github-actions)

released this

3 days ago
20 Feb 12:48


·
[4 commits](https://github.com/ObolNetwork/obol-stack/compare/v0.3.1...main)
to main
since this release


[v0.3.1](https://github.com/ObolNetwork/obol-stack/tree/v0.3.1)

[`7585bfc`](https://github.com/ObolNetwork/obol-stack/commit/7585bfc53db60d43446f4496a7de568e4752e200)

This commit was created on GitHub.com and signed with GitHub’s **verified signature**.


GPG key ID: B5690EEEBB952194

Verified
on Feb 20, 2026, 07:30 AM

[Learn about vigilant mode](https://docs.github.com/github/authenticating-to-github/displaying-verification-statuses-for-all-of-your-commits).


[![Obol banner](https://camo.githubusercontent.com/ffca6da9120089c836bae9ba62cef548478d0183d0e3985a5514f32f78fa065b/68747470733a2f2f6f626f6c2e6f72672f6f626f6c6e6574776f726b2e706e67)](https://camo.githubusercontent.com/ffca6da9120089c836bae9ba62cef548478d0183d0e3985a5514f32f78fa065b/68747470733a2f2f6f626f6c2e6f72672f6f626f6c6e6574776f726b2e706e67)

# v0.3.1 — Obol Agents gain Obol Skills

This release pre-loads key skills for Agents running in the [Obol Stack](https://docs.obol.org/next/obol-stack/obol-stack).

Get started on levelling up your Openclaw agents with the quickstart guide [here](https://docs.obol.org/next/obol-stack/quickstart).

[![The Obol Stack](https://github.com/ObolNetwork/obol-stack/raw/v0.3.1/assets/frontend.png)](https://github.com/ObolNetwork/obol-stack/blob/v0.3.1/assets/frontend.png)

## Highlights

**OpenClaw Agent Integration** — Deploy and manage [OpenClaw](https://openclaw.ai/) AI agents directly in the stack. A new `obol openclaw` command group provides setup, onboarding, and dashboard access. Agents are configured with your choice of model provider (Local Ollama, Anthropic, or OpenAI) and deployed as first-class Kubernetes workloads.

**Obol Model Gateway (llmspy)** — A cluster-wide OpenAI-compatible proxy that routes all LLM traffic. Cloud provider API keys are stored as Kubernetes secrets and managed via `obol model setup`. Supports provider waterfall routing and hot-swapping between Ollama, Anthropic, and OpenAI.

**Application Management** — Install arbitrary Helm charts as managed applications with `obol app install`, `sync`, `list`, and `delete`. Supports ArtifactHub references (`bitnami/redis`, `bitnami/postgresql@15.0.0`) with auto-generated helmfile configuration and petname namespaces.

**Traefik + Gateway API** — Replaced nginx-ingress with Traefik 38.0.2 using the Kubernetes Gateway API for HTTP routing. Cleaner routing rules for the frontend, ERPC, and per-network endpoints.

**Cloudflare Tunnel Integration** — Expose your stack to the internet via `obol tunnel`. Supports quick tunnel mode (default), persistent hostnames via `obol tunnel login`, and API-based provisioning.

Important

All of these features are in varying levels of alpha or beta, please report/pull request any issues encountered.

## Contributors

- [@bussyjd](https://github.com/bussyjd)
- [@OisinKyne](https://github.com/OisinKyne)
- [@agaskrobot](https://github.com/agaskrobot)

## What's Changed

- Fix default Ollama overlay missing api field for llmspy routing by [@bussyjd](https://github.com/bussyjd) in [#181](https://github.com/ObolNetwork/obol-stack/pull/181)
- Release/pre flight and testing by [@OisinKyne](https://github.com/OisinKyne) in [#191](https://github.com/ObolNetwork/obol-stack/pull/191)
- Ability to update the stack and its apps gracefully by [@OisinKyne](https://github.com/OisinKyne) in [#179](https://github.com/ObolNetwork/obol-stack/pull/179)
- Add eRPC metadata ConfigMap for frontend discovery by [@OisinKyne](https://github.com/OisinKyne) in [#192](https://github.com/ObolNetwork/obol-stack/pull/192)
- fix(deps): bump golang.org/x/crypto to v0.45.0 by [@bussyjd](https://github.com/bussyjd) in [#193](https://github.com/ObolNetwork/obol-stack/pull/193)
- fix: prevent k3d and k3s backends running side by side by [@bussyjd](https://github.com/bussyjd) in [#194](https://github.com/ObolNetwork/obol-stack/pull/194)
- chore: bump obol-frontend to v0.1.6 by [@agaskrobot](https://github.com/agaskrobot) in [#200](https://github.com/ObolNetwork/obol-stack/pull/200)
- Openclaw skills by [@OisinKyne](https://github.com/OisinKyne) in [#197](https://github.com/ObolNetwork/obol-stack/pull/197)

**Full Changelog**: [`v0.3.0...v0.3.1`](https://github.com/ObolNetwork/obol-stack/compare/v0.3.0...v0.3.1)

### Contributors

- [![@bussyjd](https://avatars.githubusercontent.com/u/145845?s=64&v=4)](https://github.com/bussyjd)
- [![@OisinKyne](https://avatars.githubusercontent.com/u/4981644?s=64&v=4)](https://github.com/OisinKyne)
- [![@agaskrobot](https://avatars.githubusercontent.com/u/11446164?s=64&v=4)](https://github.com/agaskrobot)

bussyjd, OisinKyne, and agaskrobot


Assets7

Loading

### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/ObolNetwork/obol-stack/releases/tag/v0.3.1).

All reactions

You can’t perform that action at this time.