# Roll20 Local Test Harness

This directory is reserved for a future mocked Roll20 runtime and repeatable regression suite. The harness is not implemented yet.

Planned structure:

- `harness/`: mocked Roll20 globals, event dispatch, object models, chat capture, timers, and shared assertions.
- `fixtures/`: representative linked and unlinked tokens, PC and NPC characters, Beacon sheet values, campaign state, turn order, paths, doors, handouts, and tracks.
- `scenarios/`: behavior and regression tests organized by owned workflow and cross-script contract.
- `reports/`: generated local results only. Reports are not production code, architecture decisions, expected behavior, or manually maintained source-of-truth documentation.

The harness will complement, not replace, a dedicated live Roll20 Test Game. Live testing remains required for Beacon synchronization, Roll20 API sandbox timing and event order, permissions and player/GM visibility, FX, paths, dynamic lighting, doors, Jukebox audio, default-token callbacks, UI/template rendering, and other platform-specific behavior.

The exact next implementation task is to build a minimal event/object harness that mocks `on`, event dispatch, `state`, `getObj`, `findObjs`, `createObj`, `Campaign`, `sendChat`, `getSheetItem`, `setSheetItem`, token `get`/`set`, and controllable timers, then prove it with one isolated HP-change scenario covering explicit dependent hooks and duplicate-event suppression. Do not add broad scenario coverage until that foundation has deterministic tests.

See [Test Strategy](../Guides%20and%20Notes/Architecture/Test-Strategy.md) and [Live Roll20 Verification](../Guides%20and%20Notes/Architecture/Live-Roll20-Verification.md).
