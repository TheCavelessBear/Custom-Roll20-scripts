# System Overview

## Scope and Authority

This overview is derived from the current `.js` files directly under `Scripts/`. Archived files, `Scripts/Un-grouped`, old audits, and uploaded Project copies are not part of the active inventory. The detailed source-of-truth records are the [Command and API Registry](Command-and-API-Registry.md) and [State and Ownership Registry](State-and-Ownership-Registry.md).

## System Shape

The project has four layers:

1. Owned game mechanics: ActionEconomyV2, SaveEffects, AttackDamageResolver, HPManager, AoEBoom, TokenTriggers, LootManager, HandoutAccess, TargetReport, TokenActionBuilder, and TokenAnimator.
2. General automation engines: ScriptCards, SmartAoE, SpawnDefaultToken, TokenMod, GroupInitiative, and map/door/sound utilities.
3. Shared metaprogramming, math, token, initiative, selection, and messaging infrastructure installed as individual scripts.
4. Repository governance: version/archive workflow, integration registries, validation strategy, live-test evidence, and scoped agents.

The active root contains exactly 43 individual `.js` files, one for each script in the supplied live installation order. Combined Project-upload batches are not Roll20 installations and are excluded from the active inventory.

## Primary Owned Flow

```text
TokenActionBuilder/macros
        |
        v
ActionEconomyV2 <----> SaveEffects
        ^                  |
        |                  v
AttackDamageResolver --> HP/bar changes --> TokenTriggers
        |
        v
explicit AE damage hooks

AoEBoom --> SaveEffects chat commands
   |------> SpawnDefaultToken API
   `------> ActionEconomyV2 pending summon/hazard APIs

LootManager --> HandoutAccess
           `--> Beacon gp/sleight_of_hand_bonus
```

ActionEconomyV2 owns conditions, effects, action economy, movement, concentration, hazards, summons, and combat-owned state. SaveEffects owns save/DC resolution and save-based damage. AttackDamageResolver owns attack target memory, damage application, source tracking, caching, and undo. HPManager owns healing and direct HP adjustment. Scripts integrate through guarded global APIs or documented chat commands.

## Platform Boundary

The 43 active scripts execute inside Roll20's API sandbox in the order recorded by the Command and API Registry. The repository can validate JavaScript syntax and, once built, mocked event/data behavior. A dedicated live Test Game remains authoritative for Beacon synchronization, actual event ordering, selected/target expansion, permissions, UI templates, paths/FX/dynamic lighting, doors, audio, and default-token callbacks.

## Current Requires Verification Items

- `Scripts/TokenTriggers1.3.3.js` exposes the generic `TokenTriggersAPI.processBar1Change` hook used by AttackDamageResolver and SaveEffects. Live verification must still establish Roll20's native-event ordering and confirm each transition processes once.
- The exact order is user-confirmed and documented, but the live API-script panel and startup log remain the required evidence that all 43 files are enabled with no external or obsolete uploads.
