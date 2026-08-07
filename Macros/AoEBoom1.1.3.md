# AoEBoom command reference

Active source: `Scripts/AoEBoom1.1.3.js`.  
Complexity: high-variance command system.  
Audience: player-usable; no GM/controller check is implemented.  
Selection: never read. Caster/source/template IDs are explicit. Shape commands create one template or execute one burst per invocation.

## Common grammar

Shape positionals come first; flags follow as `--flag VALUE`. Multiword `--title`, `--onFail`, `--onSuccess`, and `--onAny` values consume words until the next flag. Inline rolls are replaced with totals.

Common values:

- `SAVE`: expected SaveEffects keys `str`, `dex`, `con`, `int`, `wis`, `cha` (AoEBoom itself stores free text; SaveEffects validates).
- `DC`: number or `spell`; spell resolution uses the source's Beacon `spell_save_dc`.
- `DAMAGE`: dice/flat expression accepted downstream; `TYPE` is normalized to title case.
- `SUCCESS`: `half` or `none` for downstream SaveEffects.
- `--source SOURCE_ID`: defaults to caster.
- `--adept TYPE`: forwarded to SaveEffects/AE damage modification.
- Hooks: forwarded to SaveEffects; may use `@@source`, `@@target`, `@@result`, and `@@damage` there.

## Shape systems

### Cone template

```text
!boom cone CASTER_ID RANGE_FT ANGLE_DEG SAVE DC DAMAGE TYPE SUCCESS
  [--source SOURCE_ID] [--title TITLE...] [--facing template|caster]
  [--condition CONDITION] [--duration DURATION]
  [--color COLOR] [--fill FILL] [--applyAbility ABILITY_NAME]
  [--adept TYPE] [--onFail CMD...] [--onSuccess CMD...] [--onAny CMD...]
```

`template` orientation follows path rotation; `caster` recreates/follows caster rotation/movement. `--condition` switches apply to `!se save`, but the active cone parser still requires the positional damage/type/success placeholders.

### Wall template

```text
!boom wall CASTER_ID LENGTH_FT WIDTH_FT SAVE DC DAMAGE TYPE SUCCESS
  [--source SOURCE_ID] [--title TITLE...] [--facing caster|template]
  [--color COLOR] [--fill FILL] [--applyAbility ABILITY_NAME]
  [--adept TYPE] [--onFail CMD...] [--onSuccess CMD...] [--onAny CMD...]
```

Default facing is `caster`. Apply cards can choose `--hazardSide top` or `bottom`, used by substituted ability content.

### Ring template

```text
!boom ring CASTER_ID DIAMETER_FT SAVE DC DAMAGE TYPE SUCCESS
  [--source SOURCE_ID] [--title TITLE...] [--color COLOR] [--fill FILL]
  [--applyAbility ABILITY_NAME] [--adept TYPE]
```

Ring is template-oriented. Apply cards can use `--hazardSide inside` or `outside`. Unlike cone/wall, the active ring constructor does not store hooks or a condition pathway.

### Immediate burst

```text
!boom burst CASTER_ID RADIUS_FT SAVE DC DAMAGE TYPE SUCCESS
  [--source SOURCE_ID] [--title TITLE...] [--affectsCaster true]
  [--adept TYPE] [--onFail CMD...] [--onSuccess CMD...] [--onAny CMD...]
```

No path is created. It finds represented object-layer tokens within the sphere; the caster is excluded unless the value is exact lowercase `true` after normalization.

## Apply, clear, and ability execution

```text
!boom apply TEMPLATE_ID [--hazardSide top|bottom|inside|outside]
!boom clear TEMPLATE_ID
```

`TEMPLATE_ID` is normally the created path ID. Apply refreshes orientation, resolves targets, optionally executes a named caster ability, calls SaveEffects, then clears the template/path. Ability lines support substitutions `{{BOOM_LEFT}}`, `{{BOOM_TOP}}`, `{{BOOM_ROTATION}}`, `{{BOOM_CASTER_TOKEN_ID}}`, `{{BOOM_HAZARD_SHAPE}}`, `{{BOOM_HAZARD_SIDE}}`, `{{BOOM_TOKEN_SIDE}}`, and `{{BOOM_SPAWN_SIZE}}`; `!Spawn` lines are routed through SpawnDefaultToken and `/fx` lines are interpreted specially. This is a generated/integration pathway rather than ordinary macro syntax.

ID variants where appropriate:

```text
!boom cone @{selected|token_id} 30 90 dex spell 8d6 fire half --source @{selected|token_id} --title Burning Hands
!boom burst @{target|Caster|token_id} 20 con 15 4d8 thunder none
!boom apply TOKEN_ID
```

The command itself never acts on selected tokens; substitutions only fill explicit ID positions.

Dependencies: SaveEffects for saves/damage, SpawnDefaultToken for generated ability spawns, ActionEconomyV2 pending summon/hazard APIs, Roll20 paths/pages/FX, and Beacon spell DC for `spell`. PersistentStateManager prunes missing paths/tokens/pages. Live verification: geometry on grid types, token-overlap thresholds, path rotation, ability substitutions, and source/DC resolution.

Help discrepancy: embedded help documents only cone/apply/clear; wall, ring, burst, flags, hooks, conditions, and ability integration are active in the parser.
