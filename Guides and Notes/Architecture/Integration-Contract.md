# Integration Contract

## Contract Authority

This document defines how active scripts may integrate. Exact commands, APIs, events, state roots, bars, and Beacon access are indexed in the companion registries. Active code is authoritative for implemented behavior; a registry mismatch must be marked `Requires verification` until resolved from the active source or a live test.

## Ownership Boundaries

- ActionEconomyV2 owns action economy, movement and mounts, conditions/effects/markers/durations, concentration/exhaustion, ongoing hazards, summons, visual links, and combat state.
- SaveEffects owns saving throws, DC resolution, save/damage cards, and save-based damage; it delegates AE-owned consequences to ActionEconomyV2.
- AttackDamageResolver owns attack target memory, damage caches/slots, damage application/undo, damage-source tracking, and AE attack/damage hooks.
- HPManager owns healing and direct HP adjustment. Healing must not initiate concentration saves.
- AoEBoom owns AoE geometry and targeting. TokenTriggers owns HP-threshold reactions. Executioner owns weapon-form routing. AuraToggle/Auras owns aura controls.
- General utilities may expose mechanisms but do not acquire ownership of game mechanics merely because they can alter tokens, bars, state, or chat.

## Public API Contract

A cross-script API must use a stable global object, validate inputs, preserve existing callers where possible, and return a predictable success/failure shape. Callers must guard optional dependencies before use and provide a clear failure path. New integrations update both registries in the same revision.

Chat commands are a documented integration boundary when no suitable public API exists. Generated commands must use the registered spelling and supported arguments; do not invent flags. API-to-API calls are preferred when the result or event ordering is critical.

## HP, Damage, and Beacon Contract

Token bars are assigned as follows: bar 1 HP, bar 2 temporary HP, bar 3 ActionEconomy movement, bar 4 AC. Linked and unlinked tokens differ: an unlinked NPC may store values only in bars, while represented Beacon characters may require `getSheetItem`/`setSheetItem` synchronization.

Critical damage/HP integrations must explicitly notify dependent systems. A Roll20 `change:graphic` handler is a fallback, not sufficient proof of delivery, because Beacon synchronization can update a bar before a later `token.set()`. Explicit hooks and native events must use duplicate-trigger prevention. Healing paths must remain distinct from damage/concentration paths.

## Event and State Contract

Every event handler must be attributable to one owner or a general utility. Changes involving `ready`, `chat:message`, turn order, graphic changes, bar changes, object creation/destruction, doors, or handouts must be reviewed for duplicate registration and upload-order effects.

State belongs to the script whose namespace is listed in the State and Ownership Registry. Scripts must not duplicate another owner's state. State migrations preserve compatible data and must not require StateWipe unless safe migration is impossible and explicitly authorized.

## Installation Order Contract

Each installed Roll20 script has one active `.js` file in `Scripts/`. Load the files in the exact order recorded by the Command and API Registry because shared globals and meta-operations depend on earlier registrations. Do not install combined Project-upload batches or archived copies alongside the individual active files.

## Validation Contract

A substantive integration change requires an explorer trace, scoped implementation, independent diff review, syntax validation where feasible, exact Roll20 test steps with expected results, and lead verification. Live-only items follow [Live Roll20 Verification](Live-Roll20-Verification.md). Unsupported or contradictory findings remain `Requires verification`; they are not converted into architectural claims.
