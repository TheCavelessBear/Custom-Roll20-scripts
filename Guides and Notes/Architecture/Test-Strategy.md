# Test Strategy

## Purpose

Testing has two complementary layers: deterministic local regression tests in a future mocked Roll20 harness, and mandatory verification in a dedicated live Roll20 Test Game. Neither layer replaces source review, ownership review, or final diff inspection.

## Validation Layers

1. Static validation: inspect the completed diff, run JavaScript syntax checks where feasible, check version/archive/changelog changes, and confirm the active root contains one intended active version per script.
2. Local unit/contract tests: exercise pure parsers, state migrations, guarded API calls, damage/healing math, deduplication, and event sequencing against mocked Roll20 objects.
3. Local integration scenarios: dispatch realistic chat, turn-order, bar, object, and timer events across selected active scripts.
4. Live Test Game verification: prove Beacon, sandbox, permissions, UI, FX, lighting, audio, path, door, and callback behavior on Roll20.

## Required Scenario Matrix

For relevant revisions, cover:

- normal success and invalid input;
- repeated use and duplicate-trigger prevention;
- cleanup/reset and state persistence;
- represented/linked and unlinked tokens;
- PCs and NPCs;
- public API and chat-command handoffs;
- upload/event order where multiple handlers observe the same transition;
- undo and partial failure where supported.

HP or damage work additionally covers temporary HP, prevention/resistance/immunity, concentration, TokenTriggers, healing isolation, HP zero, represented Beacon synchronization, unlinked bar-only behavior, and undo.

## Harness Boundaries

The future harness belongs under `tests/` and must not redefine expected behavior merely to pass a test. Fixtures and scenarios are reviewed source; `tests/reports/` is generated output only. The first harness milestone is defined in [tests/README.md](../../tests/README.md).

Mocking is appropriate for Roll20 globals, object storage, events, chat capture, timers, state, and Beacon calls. It cannot prove Roll20's real scheduler, sheet-worker synchronization, selected/target substitution, player permissions, template rendering, path/door/dynamic-light behavior, FX, audio, or default-token callbacks.

## Acceptance Evidence

A substantive revision is not complete until the lead has reviewed:

- the final diff and version/archive/changelog changes;
- explorer findings and implementer validation;
- reviewer blocking/optional findings and their dispositions;
- local validation output;
- exact live Roll20 steps with expected results;
- actual live results for platform-dependent behavior, or an explicit `Requires live verification` limitation when the user has not yet run them.

Test reports may summarize evidence but are never the technical source of truth.
