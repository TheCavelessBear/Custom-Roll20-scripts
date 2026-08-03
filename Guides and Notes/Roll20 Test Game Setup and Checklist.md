# Roll20 API Test Ground Setup and Checklist

## Purpose

Maintain one permanent, non-production Roll20 campaign named **Roll20 API Test Ground**. It complements the local suite in [tests/README.md](../tests/README.md); it is the required environment for Beacon synchronization and all Roll20 platform behavior the local mocks cannot prove.

Before testing, record the active 43 filenames/order from the [Command and API Registry](Architecture/Command-and-API-Registry.md), Beacon sheet version, page settings, token links, GM/player identities, bars, relevant sheet values, state roots, and turn order. Upload no batches, archived versions, or duplicate active files.

## Reusable Setup

Create these permanent fixtures on a compact square-grid test map:

- Linked Beacon PC: Bar 1 HP, Bar 2 Temporary HP, Bar 3 AE movement, and Bar 4 AC.
- Linked Beacon ally with the same bar meanings.
- Unlinked NPC with bar-only HP, temporary HP, movement, and AC.
- Generic enemy with no Beacon character-sheet assumption.
- Mount and rider pair.
- A target token for ADR and SaveEffects tests.
- A movement lane, an AoE zone, a path/door, an FX marker, and a dynamic-light test area.
- A separated HP-zero/death-token, cleanup, and loot section.
- A GM-only test character and macro collection containing only commands verified from the active scripts/registry.

## Reset Procedure

After every scenario:

1. Restore each fixture's `represents` link, bars 1–4, position, layer, markers, aura, rotation, and controlled-by values.
2. Restore the linked PCs' Beacon HP, temporary HP, movement, AC, and any feature values changed by the scenario; confirm delayed bar synchronization has settled.
3. Clear AE effects/conditions, concentration, durations, pending hazards/summons, ADR target/damage/undo data, SaveEffects sources, TokenTriggers runtime presentation, and test loot changes using the owning script's verified command or the controlled sandbox reset.
4. Restore turn order, initiative page, player ribbon, paths/doors, Jukebox state, handout permissions, and map/page settings.
5. Restart the API sandbox before any test that requires startup confirmation, and record errors/messages before continuing.

## Checklist

### Startup

1. Restart the API sandbox after uploading the individual active files in registry order.
2. Confirm one intended ready log/registration per script, no redeclaration errors, and no duplicate output from an archive or batch.
3. Run one verified changed-command route as GM and, where applicable, as a player.

Expected: the sandbox starts cleanly; each command produces one intended result; no duplicate card, state mutation, sound, or FX occurs.

### Linked and unlinked token paths

1. Apply the same owner command to the linked Beacon PC and unlinked NPC.
2. Compare bars 1–4 and the represented character's `getSheetItem` values before/after.
3. Repeat after a direct sheet edit and a token-bar edit.

Expected: bars retain HP/temp HP/AE movement/AC meanings; represented values synchronize as designed; unlinked NPC values remain bar-only; processing does not duplicate.

### Damage, temporary HP, undo, and concentration

1. Use the current ADR command shown by its GM menu: `!adr apply TARGET_ID [TYPE] [LABEL]` after rolling a supported damage card.
2. Test damage fully absorbed by temporary HP, spillover to HP, a positive-to-zero result, and `!adr undo`.
3. Repeat with a concentrating represented target and record AE's one intended concentration result.

Expected: temporary HP is consumed first, undo restores ADR-owned values, and any explicit/native dependent hooks occur once. Beacon timing and concentration UI are live-only evidence.

### Healing boundary

1. Run `!hp heal TOKEN_ID AMOUNT LABEL` on a damaged represented target, including a value that would exceed maximum HP.
2. Inspect AE cards/logs and the token/Beacon HP value.

Expected: HP is capped at maximum and mirrors through the represented-token path; healing does not trigger a concentration save.

### HP zero and TokenTriggers

1. Start with a represented token above 0 HP and no Relentless Endurance configuration. As GM, run `!tokentrigger enable TOKEN_ID`.
2. Reduce Bar 1 from a positive value to 0 and allow the zero-delay presentation update to finish.
3. Confirm the token has active HP-zero presentation, its configured dead side is attempted, and Bar 1 is cleared. Reset with `!tokentrigger restore TOKEN_ID`, then run `!hp set TOKEN_ID full HP Zero Reset`; confirm the presentation is removed and HP/max are restored.
4. Repeat the Bar 1 transition on the generic unrepresented enemy; confirm TokenTriggers ignores it.
5. With a represented token above 0 HP, run `!tokentrigger relentlessenable TOKEN_ID` as GM.
6. Change Bar 2 only; confirm Relentless Endurance does not activate. Then reduce Bar 1 from a positive value to 0.
7. Confirm Bar 1 becomes 1 and one `Reduced to 1 HP instead of falling.` card appears. Repeat the transition in the same combat and confirm the once-per-combat runtime prevents another activation.
8. Reset with `!tokentrigger relentlessreset TOKEN_ID`, restore the token bars, and repeat once to prove the reset.
9. Repeat one configured threshold transition through ADR and one through SaveEffects. Observe sandbox logs/event order and confirm each produces one TokenTriggers card/state change, not one from the explicit API plus another from the native Bar 1 event.

Expected: ordinary configured HP-zero behavior stores and clears its presentation through the verified enable/restore commands; Relentless Endurance separately intercepts the represented token at 1 HP once per combat; ADR and SaveEffects use the same generic TokenTriggers hook without owning threshold mechanics; generic unrepresented tokens are ignored.

### SaveEffects and ActionEconomy

1. Use the current `!se` menu/verified save-damage route against the target token.
2. Test a failed save with a lethal result, then a failed save with an AE-owned consequence/duration.
3. Verify condition/duration cleanup through AE, not SaveEffects.

Expected: SaveEffects resolves saves/save damage and calls AE only for AE-owned failed-save consequences or the documented lethal damage handoff; SaveEffects does not own AE effect cleanup.

### Current feature probes

Test Haste, Fire Shield, Uncanny Dodge, Evasion, mounts, and AoEBoom only through their current generated menu/card or verified command route. For each, record the initiating command, targets, bar/state changes, cleanup, and expected chat output.

**Requires verification:** the exact current command/API route for each named feature is not established in the registry at this time; do not invent a macro from this checklist.

### Platform-only behavior

With a GM and a player account, test FX, sound, permissions, macros, selected/target substitution, dynamic lighting, path/door behavior, map changes, default-token callbacks, handouts, and UI/template rendering.

Expected: only Roll20's live game can establish these results. Record failures and reproduce them before changing scripts.

Run the reset procedure after each section and record results as a dated audit report. Promote only confirmed durable facts into the Architecture registry.
