# ActionEconomyV2 command-system reference

Active source: `Scripts/ActionEconomyV2.9.0.js` (version 2.9.0).
Complexity: high-variance command system.  
Audience: mixed player-facing, setup, administrative, diagnostic, and generated commands. Only `!ae setup ...` and `!ae registry ...` actually enforce `playerIsGM`; other routes have no caller/controller check even when their output is whispered to GM or their menu labels say “Admin.”  
Primary roots: `!ae`, `!ae-effect`, `!ae-con`, `!ae-terrain`, `!ae-hazard`, `!ae-ongoing`, `!ae-aoe`, `!ae-telekinesis`, `!ae-disarm`, `!ae-summon`, `!ae-visual`, `!ae-ability`, and `!ae-savemod`.

## Contents

1. [Token references and targeting model](#token-references-and-targeting-model)
2. [Menus, combat, economy, and movement](#menus-combat-economy-and-movement)
3. [Character setup and registries](#character-setup-and-registries)
4. [Effects, conditions, and durations](#effects-conditions-and-durations)
5. [Terrain, hazards, and ongoing damage](#terrain-hazards-and-ongoing-damage)
6. [AoE targeting](#aoe-targeting)
7. [Telekinesis and disarm](#telekinesis-and-disarm)
8. [Summons and visuals](#summons-and-visuals)
9. [Ability scores and next-save modifiers](#ability-scores-and-next-save-modifiers)
10. [Dependencies and source discrepancies](#dependencies-and-source-discrepancies)

## Token references and targeting model

An explicit token argument accepts a Roll20 token ID and therefore supports the following substitutions where shown:

```text
@{selected|token_id}
@{target|Target|token_id}
TOKEN_ID
```

`resolveTargets` means: use the one explicit token ID in that position, otherwise use all actually selected graphic tokens. An explicit ID never expands to multiple targets; actual selection can. Commands described as “selection only” read `msg.selected` and do not accept a selected-token reference as a substitute.

No `!ae...` command checks that the caller controls the supplied or selected token. Commands can consequently mutate combat state when invoked by any player who can send API chat commands.

## Menus, combat, economy, and movement

### Entry menus

```text
!ae admin
!ae menu [main|admin|core|movement|economy|terrain|hazard|hazards|ongoing|summon|summons|visual|visuals|debug]
!ae tokenoptions [TOKEN_ID]
!ae card [TOKEN_ID]
```

`admin` and `menu` are useful entry points and require no selection. Unknown menu names fall back to `main`. They whisper GM-oriented cards but are not GM-gated. `tokenoptions` and its alias `card` display the token’s Action Economy card; they use `resolveTargets`, accept one explicit token or multiple actual selections, and do not require a selected-token reference when an ID is provided.

### Combat and turn state

```text
!ae start
!ae startcombat
!ae reset [TOKEN_ID]
!ae update [TOKEN_ID]
!ae grab [TOKEN_ID]
!ae type [TOKEN_ID]
!ae clear [TOKEN_ID]
!ae off [TOKEN_ID]
```

- `start` processes the current turn-order transition and needs no token.
- `startcombat` initializes combat from the current turn-order entry. Because of the active parser’s shared selection guard, at least one token must be actually selected even though that selected token is not used by `startcombat`.
- `reset` refreshes Beacon cache data and starts a fresh turn for each target.
- `update` refreshes token state; `grab` refreshes cached Beacon values; `type` reports creature classifications.
- `clear` removes AE state for the target. `off` clears the movement bar.
- The target routes use one explicit ID or multiple actual selected tokens.

### Action economy

```text
!ae action [TOKEN_ID]
!ae bonus [TOKEN_ID]
!ae attack [TOKEN_ID]
!ae spell [TOKEN_ID]
!ae attacks COUNT
```

The first four spend an action, bonus action, one configured attack, or a spell/action respectively. `attack` and `spell` also fire effect triggers. They accept one explicit token or multiple actual selections. `attacks COUNT` is selection-only, requires one or more represented tokens and an integer `COUNT >= 1`, and sets that character’s attacks-per-action configuration.

### Speed and movement accounting

```text
!ae speed FEET
!ae speedmod half
!ae speedmod +FEET
!ae speedmod -FEET
!ae speedmod set FEET
!ae speedrestore
!ae addmove FEET
!ae spendmove FEET
!ae stand [TOKEN_ID]
!ae teleport [TOKEN_ID]
!ae moveundo [TOKEN_ID]
```

`speed`, all `speedmod` forms, `speedrestore`, `addmove`, and `spendmove` are actual-selection-only and can affect multiple selected tokens. A token ID or `@{selected|token_id}` typed after these commands is not read as the target. `speed` stores a base speed; `speedmod` changes the Beacon sheet speed; `speedrestore` restores its cached original. `addmove` and `spendmove` adjust current movement. `stand` spends the active cost for Prone, `teleport` makes the next token drag exempt from movement accounting, and `moveundo` restores the last movement snapshot.

```text
!ae stand @{target|Creature|token_id}
!ae speedmod +10
```

### Mounts and forced movement

```text
!ae mount MOUNT_ID [--side SIDE_NUMBER] [--side-offset SIGNED_INTEGER]
!ae dismount [TOKEN_ID]
!ae push TARGET_ID FEET
!ae pull TARGET_ID FEET
!ae pushfrom SOURCE_ID TARGET_ID FEET
!ae pullfrom SOURCE_ID TARGET_ID FEET
!ae forcemove SOURCE_ID TARGET_ID DIRECTION FEET
```

`mount` uses every actually selected token as a rider and therefore requires selection; `MOUNT_ID` is one explicit mount token. `--side` selects the rider's rollable-token side for a combined mounted appearance. `--side-offset` accepts a complete signed base-10 safe integer, including `0`, and uses the targeted mount's current one-based side plus that offset as the rider side. If both options are present, `--side` takes precedence regardless of order; a bare or invalid `--side` uses the existing invalid-mounted-side GM warning and does not fall back to the offset.

Either valid side option uses the existing combined-mount behavior: the rider adopts the selected side and mount presentation, the mount moves to the GM layer, and normal movement, restoration, state, and cleanup rules apply. With neither side option, mounting retains the legacy non-combined relationship. Missing, decimal, malformed, option-token, non-finite, or unsafe offsets whisper an invalid-offset warning to GM without a mount mutation or movement cost. A computed side outside the rider's usable rollable sides uses the existing invalid-mounted-side GM warning before mount changes. `dismount` uses `resolveTargets`.

`push` and `pull` use each actually selected token as the source and the explicit `TARGET_ID` as the moved token. `pushfrom`, `pullfrom`, and `forcemove` use explicit source and target IDs, but the active shared guard still requires at least one otherwise-unused actual selection.

`DIRECTION` accepts `toward`, `towards`, or `pull`; `away` or `push`; a numeric degree heading; or the implemented compass/directional names used by AE (`n`/`north`/`up`, `ne`/`northeast`, `e`/`east`/`right`, `se`/`southeast`, `s`/`south`/`down`, `sw`/`southwest`, `w`/`west`/`left`, `nw`/`northwest`). Distance is in feet.

```text
!ae mount @{target|Mount|token_id} --side 2
!ae mount @{target|Mount|token_id} --side-offset +1
!ae mount @{target|Mount|token_id} --side-offset -1 --side 2
!ae mount @{target|Mount|token_id}
!ae forcemove @{selected|token_id} @{target|Moved Token|token_id} away 15
```

## Character setup and registries

### GM-only setup

All routes in this section enforce GM status and require a represented token.

```text
!ae setup
!ae setup TOKEN_ID
!ae setup menu TOKEN_ID
!ae setup features TOKEN_ID
!ae setup auras TOKEN_ID
!ae setup type TOKEN_ID pc|ally|none
!ae setup pc TOKEN_ID add|remove
!ae setup attacks TOKEN_ID COUNT
!ae setup feature TOKEN_ID FEATURE_KEY add|remove
!ae setup aura TOKEN_ID protection add|remove
!ae setup clear TOKEN_ID yes
```

Bare `!ae setup` uses the first actually selected represented token; all other forms accept one explicit token. `clear` changes state only with literal confirmation `yes`.

Permanent setup `FEATURE_KEY` values are `eldritchmind`, `darkonesblessing`, `dangersense`, `evasion`, and `psychicdefenses`. The separate selection-only `!ae feature` route below also accepts `rage`, but GM character setup does not.

### GM-only registry

```text
!ae registry
!ae registry menu
!ae registry clean
!ae registry remove pc|ally|attacks|features|auras CHARACTER_ID
```

These are administrative commands, enforce GM status, need no selection, and use a character ID—not a token ID—for removal. `clean` removes stale/duplicate registrations.

### Direct selection-based configuration

```text
!ae pcs
!ae feature add|remove FEATURE_KEY
!ae features
!ae aura add|remove protection
!ae auras
!ae saveadv SAVE_KEY on|off
```

These routes are not GM-gated and are actual-selection-only. `pcs` replaces the PC registry with the unique represented characters in the current selection. Feature keys are `eldritchmind`, `darkonesblessing`, `dangersense`, `evasion`, `psychicdefenses`, and `rage`. `features` and `auras` report active entries. Save keys for `saveadv` are `str`, `dex`, `con`, `int`, `wis`, `cha`, `all`, and `concentration`.

## Effects, conditions, and durations

### Effects

```text
!ae-effect menu
!ae-effect EFFECT_KEY [TOKEN_ID] [--duration DURATION] [--source SOURCE_ID]
!ae-effect remove EFFECT_KEY [TOKEN_ID]
```

Application/removal uses one explicit target or multiple actual selected tokens. A source is not selection; provide its ID explicitly. `menu` needs no selection and generates buttons.

Implemented effect keys are:

```text
dash disengage dodge haste slow fly mounted concentrate shield
bladeward sanctuary divine reckless bloodfrenzy steadyaim
bear wolf eagle sacred nature faithshield vengeblade lockmove
extrabonus aid fireshieldwarm fireshieldchill largeform
```

`bear`, `wolf`, and `eagle` are mutually exclusive. `dash`, `disengage`, `reckless`, `haste`, and `lockmove` have specialized command branches in addition to registry mechanics. Duration/source options are not passed through those specialized branches. An unrecognized effect name is technically stored by the compatibility fallback, but it has no registered marker, duration, sheet, trigger, or cleanup mechanics and is not a supported macro effect.

### Conditions

```text
!ae-con menu
!ae-con CONDITION_KEY [TOKEN_ID] [--duration DURATION] [--source SOURCE_ID]
!ae-con remove CONDITION_KEY [TOKEN_ID]
!ae-con exhaustion [TOKEN_ID]
!ae-con exhaustion LEVEL [TOKEN_ID]
!ae-con exhaustion+ [TOKEN_ID]
!ae-con exhaustion- [TOKEN_ID]
```

Implemented condition keys are:

```text
blinded charmed deafened disarmed exhaustion frightened grappled hidden
incapacitated invisible paralyzed petrified poisoned stinkingpoisoned
prone restrained stunned unconscious
```

Application/removal accepts one explicit token or multiple actual selections. `exhaustion` without a numeric level increments it. Numeric levels are clamped to `0..6`; level `0` removes Exhaustion. `exhaustion+` and `exhaustion-` increment/decrement within that range.

An unrecognized condition name is stored only by a compatibility fallback and is not a supported mechanical condition.

### Duration and repeat-save options

Duration strings used by the active registries and cleanup code include `manual`, `movement`, `endOfTurn`, `startOfNextTurn`, `targetNextTurn`, `casterNextTurn`, `combat`, and `concentration`. Use a `--source SOURCE_ID` for source-relative or concentration durations. A concentration application also establishes AE’s `concentrate` effect on the source.

Conditions additionally accept a repeat-save bundle:

```text
--repeatSave startOfTurn|endOfTurn
--repeatSaveKey str|dex|con|int|wis|cha
--repeatSaveDc NUMBER
[--repeatSaveSuccess remove]
[--repeatSaveEndConcentration true|1|yes]
[--repeatSaveLabel LABEL_WITH_UNDERSCORES]
```

Timing, key, and numeric DC are jointly required before a repeat save is stored. The implemented success action is `remove`; `--repeatSaveEndConcentration` ends source concentration on success. Underscores in the label become spaces.

```text
!ae-con paralyzed @{target|Target|token_id} --duration concentration --source @{selected|token_id} --repeatSave endOfTurn --repeatSaveKey wis --repeatSaveDc 16 --repeatSaveSuccess remove
```

## Terrain, hazards, and ongoing damage

### Difficult terrain

```text
!ae-terrain addradius TERRAIN_TOKEN_ID RADIUS_FEET NAME...
!ae-terrain addtoken TERRAIN_TOKEN_ID NAME...
!ae-terrain addselected NAME...
!ae-terrain addselectedradius RADIUS_FEET NAME...
!ae-terrain remove TERRAIN_TOKEN_ID
!ae-terrain list
!ae-terrain clear
```

The explicit forms accept one terrain token ID. `addselected` and `addselectedradius` require actual selection and add every selected terrain token. Names consume all remaining words; underscores are also converted to spaces. `list` and `clear` need no selection.

Terrain immunity is selection-only and affects every actually selected creature token:

```text
!ae-terrain immune AREA_NAME...
!ae-terrain unimmune AREA_NAME...
!ae-terrain clearimmune
!ae-terrain immunelist
```

The literal name `all` is an implemented global terrain-immunity entry.

### Hazards

```text
!ae-hazard add HAZARD_TOKEN_ID NAME RADIUS_FEET|token SAVE DC CONDITION DURATION SOURCE [DAMAGE TYPE SUCCESS TRIGGERS]
!ae-hazard addselected NAME RADIUS_FEET|token SAVE DC CONDITION DURATION SOURCE [DAMAGE TYPE SUCCESS TRIGGERS]
!ae-hazard remove HAZARD_TOKEN_ID
!ae-hazard list
!ae-hazard clear
```

`addselected` applies the same definition to every actually selected hazard token. `NAME` is one argument; use underscores for spaces, or `@name` to copy the hazard token name. `RADIUS_FEET` is an integer; literal `token` uses the token footprint. `SAVE` is normalized by AE; practical saves are `str`, `dex`, `con`, `int`, `wis`, or `cha`. `DC`, condition, and duration are stored for SaveEffects/AE processing.

`SOURCE` accepts a token ID, `none`, `self`, or `@self`. To omit damage, use `none` for both damage and type. `SUCCESS` is normally `half` or `none`. `TRIGGERS` is a comma-separated list; implemented event checks use `startOfTurn`, `endOfTurn`, `enter`, and `moveInto` (normalized case-insensitively). The default is `startOfTurn`.

```text
!ae-hazard add @{selected|token_id} Stinking_Cloud 20 con 15 stinkingpoisoned endOfTurn self none none none startOfTurn,enter
```

Hazard immunity is actual-selection-only:

```text
!ae-hazard immune HAZARD_NAME...
!ae-hazard unimmune HAZARD_NAME...
!ae-hazard clearimmune
!ae-hazard immunelist
```

Unlike terrain immunity, hazard immunity does not give `all` special matching behavior.

### Ongoing damage

```text
!ae-ongoing add TOKEN_ID|selected NAME --timing startOfTurn|endOfTurn --save SAVE --dc NUMBER|spell --damage FORMULA --type TYPE --success half|none [--source SOURCE_ID] [--duration manual|concentration]
!ae-ongoing remove TOKEN_ID|selected [NAME|all]
```

Literal `selected` uses all actual selected tokens; an explicit ID accepts one. `SAVE` must be one of the six ability-save abbreviations. `spell` DC requires a source token whose represented Beacon character has a spell save DC. Damage type is passed through as text. Duration defaults to `manual`; concentration requires a source to establish/clean up concentration correctly.

```text
!ae-ongoing add selected Moonbeam --timing startOfTurn --save con --dc spell --damage 2d10 --type radiant --success half --source @{selected|token_id} --duration concentration
```

## AoE targeting

AE AoEs create a movable control token, calculate affected tokens, then dispatch SaveEffects. There are separate damage and condition grammars:

```text
!ae-aoe cast NAME CASTER_ID RADIUS SAVE DC DAMAGE TYPE half|none [OPTIONS]
!ae-aoe cast NAME CASTER_ID RADIUS SAVE DC --condition|CONDITION [--duration|DURATION] [OPTIONS]
!ae-aoe trigger CONTROL_TOKEN_ID
!ae-aoe clear CONTROL_TOKEN_ID
```

`NAME` is one whitespace argument. `CASTER_ID` and control IDs are explicit single-token arguments; no selection fallback is implemented. `RADIUS` is a nonnegative integer. `SAVE` is normalized by AE, and `DC` can be a number or `spell`.

Options:

| Option | Meaning and values |
|---|---|
| `--token|CHARACTER NAME` | Character whose default token is used; pipe form preserves spaces. Default `AoEControlToken`. |
| `--size|W` or `--size|W,H` | Positive grid-square dimensions. The parser also accepts `W x H`. |
| `--range|FEET` | Positive placement range shown on the caster. |
| `--rangeColor|COLOR` | Placement aura color; default `#ffff00`. |
| `--color COLOR` | AoE control-token aura color; default `#ff3300`. |
| `--adept TYPE` | Damage-trait tag passed to SaveEffects for damage AoEs. |
| `--instant true|1|yes` | Remove the control after triggering; default true. Other supplied values mean false. |
| `--affectsCaster true|1|yes` | Include the caster in target calculation; default false. |
| `--concentration true|1|yes` | Apply concentration to the caster. |

`--condition|...`, `--duration|...`, `--token|...`, `--size|...`, and `--range|...` are designed for pipe-delimited values. Other flags are ordinary whitespace options in the active parser.

```text
!ae-aoe cast Fireball @{selected|token_id} 20 dex spell 8d6 Fire half --token|AoEControlToken --size|2,2 --range|150 --instant true
!ae-aoe cast Hold @{selected|token_id} 10 wis 16 --condition|restrained --duration|concentration --concentration true
```

`trigger` is normally a generated button command. It sends `!se damagebatch ...` or `!se save ...`; it is not self-contained without SaveEffects. `clear` is the manual cleanup entry.

## Telekinesis and disarm

### Telekinesis

```text
!ae-telekinesis creature CASTER_ID TARGET_ID DIRECTION DISTANCE
!ae-telekinesis object CASTER_ID TARGET_ID DIRECTION DISTANCE
!ae-telekinesis worn CASTER_ID CARRIER_ID OBJECT_TOKEN_ID DIRECTION DISTANCE
!ae-telekinesis fine CASTER_ID TARGET_ID
!ae-telekinesis release CASTER_ID
```

All IDs are explicit single-token arguments; selection is not read. Direction uses the movement vocabulary described above. Telekinesis enforces its implemented range/distance rules, spends the caster’s action, and maintains one controlled target per caster. Creature and worn-object contests rely on SaveEffects API integration; object and fine-control pathways do not use the same save route.

### Disarm

```text
!ae-disarm attempt TARGET_ID SOURCE_ID ITEM_KEY SAVE DC
!ae-disarm apply TARGET_ID ITEM_KEY
!ae-disarm pickup TARGET_ID RECORD_ID
!ae-disarm clear TARGET_ID
```

All IDs are explicit and selection is not read. `attempt` is the useful entry and calls SaveEffects; `apply` and `pickup` are generated failure/card buttons users normally do not construct. `clear` removes dropped-equipment records and the `disarmed` condition.

`ITEM_KEY` values are `longsword`, `greatsword`, `dagger`, `bow`, `crossbow`, `glaive`, `warhammer`, `maul`, `spear`, `battleaxe`, `greataxe`, `club`, `staff`, and `shield`. `SAVE` must be one of the six save abbreviations.

## Summons and visuals

### Summon linking

```text
!ae-summon pending CASTER_ID SUMMON_NAME [--count N] [--timeout SECONDS] [--concentration] [CONTROL_OPTIONS] [INITIATIVE_OPTIONS]
!ae-summon link CASTER_ID SUMMON_TOKEN_ID [--concentration] [CONTROL_OPTIONS] [INITIATIVE_OPTIONS]
!ae-summon claim SUMMON_TOKEN_ID
```

All token IDs are explicit and singular. `pending` watches for up to `N` newly created matching tokens on the caster’s page; count defaults to 1 and invalid/nonpositive values normalize to 1. Timeout defaults to 300 seconds and invalid/nonpositive values normalize to 300. `SUMMON_NAME` is one argument and is normalized for matching; use underscores for a multiword name. `link` links an already-created token. `claim` is normally generated/internal.

Control options become active only when `--controlSave` is present:

```text
--controlSave str|dex|con|int|wis|cha
--dc spell|NUMBER
--controlDc spell|NUMBER
--saveTiming startOfTurn|endOfTurn
--timing startOfTurn|endOfTurn
--saveMode normal|advantage|disadvantage
--success controlled|uncontrolled|remove|none
--failure controlled|uncontrolled|remove|none
--lingerOnConcentrationEnd ROUNDS|NdM
--label LABEL_WITH_UNDERSCORES
```

`--dc` and `--controlDc` are alternatives, as are `--saveTiming` and `--timing`. Defaults are end-of-turn, normal, success=`uncontrolled`, and failure=`controlled`. Linger accepts a nonnegative integer or a simple `NdM` expression.

Initiative options:

```text
--initiative none|roll|group|caster|value
[--initiativeValue NUMBER]
```

`value` requires `--initiativeValue`; `roll` uses the summon’s Beacon `initiative_bonus`; `group` shares one roll across the pending batch; `caster` copies an existing caster turn-order value; default is `none`.

### Visual links and diagnostics

```text
!ae-visual pending CASTER_ID VISUAL_NAME EFFECT_NAME
!ae-visual debug
!ae-visual cleanup
!ae-visual cleanupall
```

`pending` is a setup/integration command that watches for a new visual token, with each name limited to one whitespace argument. `debug` reports pending/link state; `cleanup` removes orphaned links; `cleanupall` removes all linked visual tokens. These are administrative/diagnostic in purpose but are not GM-gated and require no selection.

## Ability scores and next-save modifiers

### Temporary ability-score changes

```text
!ae-ability reduce TOKEN_ID ABILITY AMOUNT [LABEL...]
!ae-ability increase TOKEN_ID ABILITY AMOUNT [LABEL...]
!ae-ability restore TOKEN_ID ABILITY
!ae-ability restoreall TOKEN_ID
!ae-ability status TOKEN_ID
```

IDs are explicit and singular. `ABILITY` is `strength`, `dexterity`, `constitution`, `intelligence`, `wisdom`, or `charisma`. `AMOUNT` accepts a positive integer or simple `NdM` dice expression. Labels consume the remaining words. These routes read/write Beacon ability values and require a represented token.

### One-use saving-throw penalty

```text
!ae-savemod add TARGET_ID KEY NdM SOURCE_ID [LABEL...]
!ae-savemod remove TARGET_ID [KEY|all]
```

IDs are explicit; no selection fallback exists. `KEY` is normalized to lowercase alphanumerics and identifies/replaces the stored modifier. The dice grammar is exactly unsigned `NdM`—no flat value or `+modifier`. The rolled amount is subtracted from the target’s next AE/SaveEffects-integrated save, then consumed. With a valid source ID it also expires at the appropriate end of the source’s next turn; labels consume remaining words and underscores become spaces.

## Dependencies and source discrepancies

- Beacon sheet access: active mechanics use `getSheetItem`/`setSheetItem` for sheet values. Token bars follow the project contract, especially bar 3 for AE movement.
- SaveEffects: AoE triggering, hazards, ongoing saves, disarm, and Telekinesis contests dispatch SaveEffects commands or APIs. ADR, HPManager, TokenTriggers, and other scripts call `ActionEconomyV2API` for their owned integrations.
- Roll20 objects/state: tokens, paths, characters, campaign turn order, custom markers, default tokens, and persistent `state.ActionEconomyV2` are prerequisites. `PersistentStateManager` is optional for pruning.
- Permission discrepancy: embedded cards label many routes administrative and whisper the GM, but only `setup` and `registry` enforce GM status.
- Parser discrepancy: `startcombat`, `pushfrom`, `pullfrom`, and `forcemove` require an otherwise-unused actual selection because they pass through the shared core selection guard.
- Compatibility discrepancy: unknown effect/condition keys are stored but have no registry mechanics; they should not be treated as supported effects or conditions.
- Telekinesis’ live behavior must be verified in Roll20 against the installed SaveEffects API version; the integration expects contest helpers beyond what the current `SaveEffects1.3.2.js` registry documents.
- Exact marker availability, default-token characters (`AoEControlToken`, disarmed-item assets), turn-order edge cases, and Beacon writes require live campaign verification.
