# Roll20 D&D 2024 Beacon API Project

This repository contains the active Roll20 Mod/API scripts, reusable macros, custom FX material, and governance documentation for a D&D 2024 Beacon game. The goal is to preserve stable live-game behavior while making integrations, ownership, versioning, validation, and future regression testing explicit.

## Sources of Truth

The current `.js` files directly under [`Scripts/`](Scripts/) and the registries under [`Guides and Notes/Architecture/`](Guides%20and%20Notes/Architecture/) are the technical source of truth. [`AGENTS.md`](AGENTS.md) governs repository work. Archived versions, legacy material under `Scripts/Un-grouped`, uploaded Project files, and dated audit reports are historical references only.

When code and documentation disagree, inspect the active script, mark the documentation gap as `Requires verification`, and correct the registry as part of the authorized work. Do not infer current behavior from an archive.

## Repository Layout

```text
/
├── AGENTS.md
├── README.md
├── Scripts/                 current root .js inventory; install only syntax-valid intended files
│   └── Prior Versions/      replaced versioned scripts
├── Macros/                  current reusable macros
├── FX/                      current custom FX material
├── Guides and Notes/
│   ├── Architecture/        durable system contracts and registries
│   └── Audits/              dated read-only historical findings
├── tests/
│   ├── harness/             future mocked Roll20 runtime and helpers
│   ├── fixtures/            future representative data
│   ├── scenarios/           future behavior/regression scenarios
│   └── reports/             generated local reports only
└── .codex/agents/           project-scoped custom agents
```

`Macros/Prior Versions/` and `FX/Prior Versions/` are created only when a superseded version needs archiving. Existing legacy files are preserved in place unless the user authorizes a reorganization.

## Architecture

- [System Overview](Guides%20and%20Notes/Architecture/System-Overview.md)
- [Integration Contract](Guides%20and%20Notes/Architecture/Integration-Contract.md)
- [Command and API Registry](Guides%20and%20Notes/Architecture/Command-and-API-Registry.md)
- [State and Ownership Registry](Guides%20and%20Notes/Architecture/State-and-Ownership-Registry.md)
- [Test Strategy](Guides%20and%20Notes/Architecture/Test-Strategy.md)
- [Live Roll20 Verification](Guides%20and%20Notes/Architecture/Live-Roll20-Verification.md)

## Installation and Update Workflow

Install the 43 active `.js` files from `Scripts/` in the exact order recorded by the [Command and API Registry](Guides%20and%20Notes/Architecture/Command-and-API-Registry.md). Each installed Roll20 script has one individual source file. Combined Project-upload batches are not active source, are not installed in Roll20, and do not belong in the `Scripts/` root.

For an authorized script revision:

1. Read the active version in `Scripts/` and the applicable Architecture registry entries.
2. Select the semantic version increment: patch for a fix, minor for a compatible feature or integration, major for an incompatible redesign.
3. Preserve the replaced `.js` unchanged in `Scripts/Prior Versions/`; never overwrite a nonidentical archive.
4. Install the new versioned `.js` in `Scripts/` and remove the replaced version from the active root as part of the same change.
5. Update the canonical [`Roll20-Coding-Change-Log.md`](Guides%20and%20Notes/Roll20-Coding-Change-Log.md), the affected Architecture registry, and validation evidence.
6. Run available local validation and complete the required dedicated Roll20 Test Game checks before production installation.

Macros and durable reports use semantic versioned filenames when revised. Macro content stays in `Macros/`; FX definitions and references stay in `FX/`. JavaScript builds remain `.js`, not Markdown copies.

## Test Strategy

The future local harness under `tests/` will provide repeatable mocked-runtime regression checks. It is not a substitute for a dedicated live Roll20 Test Game. Beacon synchronization, API sandbox event timing, permissions, FX, dynamic lighting, default-token callbacks, Jukebox behavior, UI output, and other platform behavior require live verification. See [Test Strategy](Guides%20and%20Notes/Architecture/Test-Strategy.md) and [tests/README.md](tests/README.md).

## Agent Workflow

Delegation is conditional. Small macros, documentation corrections, syntax questions, and clearly bounded isolated fixes may be handled directly. A substantive revision normally uses a focused `roll20-explorer`, a scoped `roll20-implementer`, and an independent `roll20-reviewer`; the lead agent controls scope and architecture and personally accepts or rejects the result. `roll20-contract-indexer` and `roll20-test-runner` are limited to bounded, repeatable, low-judgment extraction and test execution.

## Contribution Workflow

Keep each change scoped. Preserve unrelated user work. Update contracts when an integration changes, validate the final diff, and provide exact Roll20 reproduction steps with expected results. Do not stage, commit, amend, push, or force-push without explicit authorization. After validated repository changes, ask whether the user wants the completed changes committed and pushed.
