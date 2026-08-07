# SaveEffects command-system reference

Active source: `Scripts/SaveEffects1.3.2.js` (v1.3.2).  
Complexity: branching command system with save/damage option families.  
Audience: player-usable; the active parser has no GM or token-controller checks. Menus and many errors are whispered to GM, but that is not a permission gate.  
Primary prefix: `!se`.

## Contents

1. [Common grammar and token forms](#common-grammar-and-token-forms)
2. [Menus and saved source](#menus-and-saved-source)
3. [Named and generic condition saves](#named-and-generic-condition-saves)
4. [Damage saves](#damage-saves)
5. [Checks, forced movement, and skills](#checks-forced-movement-and-skills)
6. [Ongoing damage and Life Drain](#ongoing-damage-and-life-drain)
7. [Dependencies and discrepancies](#dependencies-and-discrepancies)

## Common grammar and token forms

Where `TOKEN_ID`, `TARGET_ID`, or `SOURCE_ID` appears, the parser accepts the resolved Roll20 token ID, so copy/paste forms include:

```text
@{selected|token_id}
@{target|Target|token_id}
TOKEN_ID
```

Literal `selected` is special only in the pathways that explicitly show it. Those commands use one or more actual selected tokens and do not need `@{selected|token_id}`. Explicit target lists accept one or many whitespace-separated IDs; selection-based routes accept every actual selected graphic token.

All positional arguments must precede the first `--option`. The parser discards later tokens from the positional list after it sees the first option. Inline rolls such as `[[8d6]]` are replaced with their total before parsing.

Save values are `str`, `dex`, `con`, `int`, `wis`, and `cha`. DC is a number or, where stated, literal `spell`; `spell` requires a source token representing a Beacon character with a readable spell-save DC.

Supported AE condition values are:

```text
blinded charmed deafened exhaustion frightened grappled incapacitated
invisible paralyzed petrified poisoned stinkingpoisoned prone restrained
stunned unconscious
```

SaveEffects rolls Beacon saving-throw/skill bonuses, incorporates AE save modes and Aura of Protection, and calls AE to apply conditions. It does not own condition duration or cleanup.

## Menus and saved source

```text
!se
!se menu
!se conditions
!se targetmenu manual|spell
!se namedmenu EFFECT_KEY
!se namedtargetmenu EFFECT_KEY
!se source SOURCE_TOKEN_ID
```

These need no target selection except that menu-generated `source` buttons use a selected token. `targetmenu` and `namedtargetmenu` generate one-to-five target buttons using `@{target|...|token_id}`. `namedmenu` builds a named-effect button. The practical menu entry points are `!se`, `!se menu`, and `!se conditions`; the other menu routes are generated navigation paths.

`!se source` stores one source token per calling player for a later selection-based spell DC/damage/check command. It is neither a target nor a selected-token reference requirement:

```text
!se source @{selected|token_id}
```

The saved source is short-lived in normal selection/batch/check workflows and is also pruned when its token/player is destroyed. An explicit `--source` overrides it.

## Named and generic condition saves

### Named effects

```text
!se EFFECT_KEY TARGET_ID [TARGET_ID ...] DC [--source SOURCE_ID]
```

This pathway accepts one or multiple explicit targets and does not use `msg.selected`. Implemented named keys are:

| Key | Save | Failed-save effect | Source requirement |
|---|---|---|---|
| `trip` | Dex | Prone | optional |
| `topple` | Con | Prone | optional |
| `poison` | Con | Poisoned, duration `combat` | optional |
| `grapple` | Str | Grappled | optional |
| `gutshot` | Con | Paralyzed, duration `casterNextTurn` | required |
| `holdperson` | Wis | Paralyzed, concentration, repeat Wis save at end of turn to remove | required |

`DC` may be numeric. Literal `spell` requires `--source`. `lifedrain` is intercepted by a separate command before this registry and is documented below.

```text
!se trip @{target|Target|token_id} 15
!se holdperson @{target|Target 1|token_id} @{target|Target 2|token_id} spell --source @{selected|token_id}
```

### Generic explicit-target condition save

```text
!se save CONDITION SAVE TARGET_ID [TARGET_ID ...] DC [--duration DURATION] [--source SOURCE_ID]
```

One or multiple explicit token IDs are accepted; selection is not read. On failure, SaveEffects sends `!ae-con CONDITION TOKEN_ID` with duration/source. Useful duration values implemented by AE include `manual`, `combat`, `endOfTurn`, `targetNextTurn`, `casterNextTurn`, and `concentration`.

```text
!se save restrained str @{target|Target|token_id} 15 --duration endOfTurn --source @{selected|token_id}
```

### Actual-selection condition save

```text
!se selected CONDITION SAVE DC [--duration DURATION] [--source SOURCE_ID] [--adept TYPE]
```

This requires one or more actual selected tokens and acts on all of them. Literal `spell` DC uses explicit `--source` or the caller’s saved source. `--adept` is parsed on this route but is not used by its condition-only application code; do not rely on it.

```text
!se selected poisoned con spell --duration combat --source @{selected|token_id}
```

## Damage saves

Damage formulas accept `NdM`, optionally followed by one signed integer, such as `8d6`, `4d10+2`, or `2d8-1`. One damage total is rolled and reused for every target in a selected/batch invocation. `TYPE` is passed to AE’s damage-trait handling; `half` applies half on a successful save and `none` applies zero. All damage routes honor temp HP, Beacon HP writes, AE damage traits, TokenTriggers integration, and AE damage-result notification.

### Selected targets

```text
!se damage selected SAVE DC DAMAGE TYPE half|none [--source SOURCE_ID] [--adept TYPE] [HOOKS]
```

This requires actual selection and accepts multiple selected tokens. `DC` can be numeric or `spell`; source can be explicit or saved.

### Explicit batch

```text
!se damagebatch SAVE DC DAMAGE TYPE half|none TOKEN_ID [TOKEN_ID ...] [--source SOURCE_ID] [--adept TYPE] [HOOKS]
```

This accepts one or multiple explicit target IDs and no selection fallback. `DC` can be numeric or `spell` with a source.

### Explicit single target

```text
!se damageone TOKEN_ID SAVE DC DAMAGE TYPE half|none [--source SOURCE_ID] [--adept TYPE] [HOOKS]
```

Exactly one explicit target is accepted. Despite accepting `--source`, this handler calls the active DC resolver without the source; therefore `DC` must be numeric and `spell` does not work on `damageone` in v1.3.2.

### Damage plus condition on failure

```text
!se damagecondition CONDITION SAVE TOKEN_ID DC DAMAGE TYPE half|none [--duration DURATION] [--source SOURCE_ID] [--adept TYPE]
```

Exactly one explicit target is accepted. On a failed save it applies both damage and the specified AE condition; success damage still follows `half|none`. `DC` can be numeric or `spell` with a source. This route does not parse save hooks.

### Hook grammar

The three damage routes marked `[HOOKS]` accept:

```text
--onFail API_COMMAND_AND_ARGUMENTS...
--onSuccess API_COMMAND_AND_ARGUMENTS...
--onAny API_COMMAND_AND_ARGUMENTS...
```

Each hook consumes words until the next `--option`. `--onAny` always runs, then the outcome-specific hook. Text substitutions are:

```text
@@source   source token ID, or empty
@@target   result target token ID
@@result   success or failure
@@damage   damage actually taken
```

The resulting string must already be a complete API command. Keep all positional damage targets before the first hook.

```text
!se damagebatch dex 15 8d6 Fire half TOKEN_ID TOKEN_ID --source @{selected|token_id} --onFail !ae-con prone @@target --duration endOfTurn --onAny !some-log @@target @@result @@damage
```

Here `--duration` is part of the hook boundary and would not be forwarded as part of `--onFail`; construct nested commands carefully.

## Checks, forced movement, and skills

### Save-only check

```text
!se check TOKEN_ID SAVE DC [--source SOURCE_ID] [--title WORDS...] [--success WORDS...] [--failure WORDS...] [HOOKS]
```

This rolls one explicit target and does not apply a condition or damage. `DC` can be numeric or `spell` with explicit/saved source. `--title`, `--success`, and `--failure` each consume words until the next option. Underscores in title are converted to spaces. Hooks use the grammar above; `@@damage` is `0`.

### Save-gated forced movement

```text
!se forcedmove SAVE TARGET_ID DC --source SOURCE_ID --direction DIRECTION --distance FEET [--name LABEL]
```

Source and target are required explicit single-token IDs; selection is not read. `FEET` must be positive. On failure, SaveEffects calls `ActionEconomyV2API.forceMove`.

`DIRECTION` is interpreted by AE and supports `toward`/`towards`/`pull`, `away`/`push`, numeric degrees, and AE’s compass/directional aliases. `--name` is a one-argument label; underscores become spaces.

```text
!se forcedmove str @{target|Target|token_id} 15 --source @{selected|token_id} --direction away --distance 10 --name Repelling_Blast
```

### Skill check

```text
!se skill TOKEN_ID SKILL DC [--remove CONDITION] [--action] [--title TITLE]
```

This accepts one explicit token; selection is not read. `DC` must be numeric. `--action` spends an AE action before the check. On success, `--remove CONDITION` sends AE’s condition-removal command. `--title` is one argument, with underscores converted to spaces.

Skill keys are normalized by removing spaces, underscores, hyphens, and other nonletters. Implemented keys are:

```text
acrobatics animalhandling arcana athletics deception history insight
intimidation investigation medicine nature perception performance
persuasion religion sleightofhand stealth survival
```

Thus inputs such as `animal_handling`, `animal-handling`, and `Animal Handling` normalize to `animalhandling` only if they remain a single parsed argument; for a macro, prefer the canonical no-space key.

## Ongoing damage and Life Drain

### Initial save plus ongoing record

```text
!se ongoing selected NAME SAVE DC DAMAGE TYPE half|none [--timing startOfTurn|endOfTurn] [--duration manual|concentration] [--source SOURCE_ID] [--adept TYPE]
!se ongoingremove selected [NAME|all]
```

Both routes require actual selection and accept multiple selected tokens. `NAME` is one argument. The first command immediately resolves the save/damage once for each target, then emits `!ae-ongoing add ...` for later turns. Timing defaults to `startOfTurn`; duration defaults to `manual`. `spell` DC and concentration require explicit or saved source. `--adept` affects the initial damage; AE’s ongoing record does not retain an adept field.

`ongoingremove` emits one AE removal command per selected token. Neither command needs or accepts `@{selected|token_id}` in place of actual selection.

### Life Drain

```text
!se lifedrain TOKEN_ID DC
```

This is a fixed special pathway: one explicit target, numeric DC, Constitution save, and fixed `1d8+3` Necrotic damage on failure. After AE damage-trait modification, it applies the damage and reduces maximum HP by the actual damage taken. It does not accept `spell`, source, selection, custom damage, hooks, or an undo flag.

## Dependencies and discrepancies

- Required mechanics: represented Beacon characters and asynchronous `getSheetItem`/`setSheetItem` for saves, skills, spell DC, HP, temp HP, and max HP.
- ActionEconomyV2 owns conditions, durations, forced movement, save modes/bonuses, damage traits, and damage-result hooks. SaveEffects calls `ActionEconomyV2API` and emits `!ae-con`, `!ae-effect`, and `!ae-ongoing` commands.
- TokenTriggers is notified explicitly through `TokenTriggersAPI.processBar1Change` when available. `PersistentStateManager` is optional and only prunes saved-source state.
- Parser/help discrepancy: `damageone` advertises/reads `--source` but resolves DC with `null`, so `spell` DC is not supported there.
- Parser discrepancy: `!se selected` reads `--adept` but never uses it.
- Registry discrepancy: `lifedrain` exists in the named registry, but the earlier dedicated `lifedrain` branch always intercepts it, so the fixed special grammar is authoritative.
- Display discrepancy: the active `SKILL_NAMES` label for `insight` is `WInsight`; the Beacon lookup key remains `insight_bonus`.
- Live Roll20 verification remains necessary for Beacon attribute availability, asynchronous HP synchronization, damage/TokenTriggers duplicate prevention, AE version compatibility, and menu escaping.
