# StateWipe command reference

Active source: `Scripts/StateWipe1.1.0.js` (`PersistentStateManager` 1.1.0).  
Complexity: branching administrative command script.  
Audience: GM-only.  
Selection: not used.

## List and orphan cleanup

| Purpose | Syntax | Effect |
|---|---|---|
| List managed roots | `!statelist` | Shows which known custom state roots exist. |
| Preview orphan cleanup | `!statewipe prune preview` | Runs every registered owner pruner with `dryRun=true`; no state is changed. |
| Apply orphan cleanup | `!statewipe prune` | Removes invalid owner records. It is designed to be idempotent. |

No token or other object IDs are accepted. The pruner coordinator expects AE, ADR, AoEBoom, BeaconAttributeTester, DoorSounds, Executioner, GroupInitiative, LootManager, MapChange, SaveEffects, SmartAoE, TokenAnimator, and TokenTriggers to register; unavailable owners are reported.

## Whole-root wipe

```text
!statewipe
!statewipe WIPE
```

`!statewipe` displays a confirmation card. Exact uppercase `WIPE` permanently deletes every currently present root from the script's `CUSTOM_STATE_ROOTS` list. It does not delete Roll20 objects, token bars, or Beacon sheet values. Restart the Mod sandbox afterward so owners recreate fresh state.

Do not place `!statewipe WIPE` on a player-facing macro. The prune and whole-root wipe systems are separate operations.
