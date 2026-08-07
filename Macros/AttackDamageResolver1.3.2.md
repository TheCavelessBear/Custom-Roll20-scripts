# AttackDamageResolver command reference

Active source: `Scripts/AttackDamageResolver1.3.2.js`.  
Complexity: high-variance branching command system.  
Audience: player-usable; there is no GM/controller check. Several status/menu results are whispered to GM.  
Selection: most routes use explicit IDs or remembered targets. Ray/missile FX may fall back to the first selected origin only when a remembered attacker is unavailable.

## Damage cache and apply

ADR first captures Beacon advanced damage rolls or compatible default damage templates.

```text
!adr apply [TARGET_ID] [DAMAGE_TYPE] [LABEL...] [--magic] [--melee] [--adept TYPE] [--attacker ATTACKER_ID]
!adr applyslot SLOT [--magic] [--melee] [--adept TYPE]
!adr undo
!adr uncanny TOKEN_ID
!adr reduce TOKEN_ID AMOUNT [--source SOURCE_ID] [--range FEET] [--label LABEL]
```

`apply` uses explicit target, then `--attacker` target memory, then the last attack target. A positional type overrides all cached part types; remaining positional words override the label. `--magic` and `--adept` feed AE damage traits. `--melee` records melee context for AE hooks. `applyslot` resolves a stored slot first.

`uncanny` halves only the most recent still-unchanged ADR hit for that same target and only once. `reduce` accepts a nonnegative number or dice such as `1d10+3`; optional source/range validates edge distance, and underscores in `--label` become spaces. `undo` restores the last ADR HP/temp-HP snapshot.

```text
!adr apply @{target|Damage Target|token_id} Fire Fireball --magic
!adr apply --attacker @{selected|token_id} --magic --melee
!adr reduce @{target|Damaged Token|token_id} 1d10+3 --source @{selected|token_id} --range 30 --label Interception
```

## Attack and target memory

```text
!adr attack ATTACKER_ID TARGET_ID [--slot SLOT]
!adr settarget TARGET_ID
!adr cleartarget
!adr setslots ATTACKER_ID SLOT=TARGET_ID [SLOT=TARGET_ID ...]
!adr slots
!adr clearslots
!adr status
!adr admin
```

`attack` remembers the pair, optionally stores a lowercased slot, and reports AE advantage/disadvantage/penalty guidance; it does not roll the attack. `setslots` accepts multiple whitespace-separated assignments. `admin` is a menu label, not a permission gate.

Explicit IDs accept normal substitutions:

```text
!adr attack @{selected|token_id} @{target|Target|token_id}
!adr setslots @{selected|token_id} primary=@{target|Primary|token_id} secondary=TOKEN_ID
```

## Chained commands and FX

| Purpose | Remembered target | Named slot |
|---|---|---|
| Dispatch another API command | `!adr targetcmd !COMMAND ... @@target ...` | `!adr targetcmdslot SLOT !COMMAND ... @@target ...` |
| Point FX on target | `!adr fx FX_NAME...` | `!adr fxslot SLOT FX_NAME...` |
| Ray from attacker/origin | `!adr ray FX_NAME...` | `!adr rayslot SLOT FX_NAME...` |
| Missile/custom FX between points | `!adr missile FX_NAME...` | `!adr missileslot SLOT FX_NAME...` |

`@@target` is replaced everywhere in the forwarded command. The forwarded text must start `!`. Custom FX names are matched case-insensitively before falling back to a built-in FX identifier.

Diagnostic/generated route:

```text
!adr fxtest SOURCE_ID TARGET_ID
```

It directly emits `/fx missile-fire SOURCE_ID TARGET_ID` and normally should not be hand-authored.

Dependencies: ActionEconomyV2 damage/attack hooks, TokenTriggers explicit HP hook, Beacon `hp`/`hp_temp` writes, Bar 1 HP and Bar 2 temp HP, roll-template formats, and Roll20 FX. Live verification: roll capture variants, temp HP, prevention/resistance, concentration, HP 0, TokenTriggers, undo, and event deduplication.

Help/registry discrepancies: active source additionally implements `setslots`, `missile`, `missileslot`, `fxtest`, target omission through memory, `--attacker`, and `--adept`; these are absent or incomplete in the embedded command string.
