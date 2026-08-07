# TokenAnimator command reference

Active source: `Scripts/TokenAnimator1.3.1.js`.  
Complexity: high-variance command system.  
Audience: GM-only.  
Prefixes: `!tokenanimator`; legacy compatibility alias `!tokensize` has identical parsing.

## Grammar and targets

```text
!tokenanimator COMMAND [--OPTION|VALUE ...]
```

Options use `--key|value`; option values continue until the next ` --key|`. By default the command processes every selected graphic. An explicit `--token|`, `--tokens|`, or `--target|` value replaces selection and may contain one or multiple IDs separated by commas or spaces; duplicates are removed.

```text
!tokenanimator fadeout --token|@{selected|token_id} --duration|1000
!tokenanimator fadeout --token|@{target|Target|token_id} --duration|1000
!tokenanimator cancel --tokens|TOKEN_ID_1,TOKEN_ID_2
```

## Commands

| Command | Canonical syntax | Required/options |
|---|---|---|
| Help | `!tokenanimator help` | No target required. |
| Move | `!tokenanimator move --direction|DIRECTION --distance|DISTANCE [--duration|MS] [--easing|MODE]` | Direction and distance required. `--degrees|` is an alias for direction. Distance uses page scale units. |
| Rotate | `!tokenanimator rotate --degrees|DEGREES [--duration|MS] [--easing|MODE]` | `--rotation|` is an alias for degrees. Positive is clockwise. |
| Baseline-relative scale | `!tokenanimator animate --scale|FACTOR [--duration|MS] [--easing|MODE]` | Scale required for `animate`. |
| Preset scale | `!tokenanimator shrink|grow|fall [--scale|FACTOR] [--duration|MS] [--easing|MODE]` | Defaults: shrink `.5`, grow `2`, fall `.25` over 3000 ms with `easeIn`. |
| Fade | `!tokenanimator fade --opacity|0..1 [--duration|MS] [--easing|MODE] [--complete|MODE]` | Opacity required. |
| Fade in/out | `!tokenanimator fadein|fadeout [--duration|MS] [--easing|MODE] [--complete|MODE]` | Target opacity is 1 or 0. |
| Restore | `!tokenanimator restore [--duration|MS] [--easing|MODE]` | Restores stored baseline dimensions, not arbitrary other properties. |
| Save baseline | `!tokenanimator setbase` | Stores current dimensions/animation baseline. |
| Clear baseline | `!tokenanimator clearbase` | Removes stored baseline. |
| Cancel | `!tokenanimator cancel` | Stops active animation timers without restoring. |

Valid values:

- `DIRECTION`: degrees (normalized), or `n/north/up`, `ne/northeast/upright`, `e/east/right`, `se/southeast/downright`, `s/south/down`, `sw/southwest/downleft`, `w/west/left`, `nw/northwest/upleft`. Spaces, underscores, and hyphens are ignored in names.
- `MODE` for easing: `linear`, `easeIn`, `easeOut`, `easeInOut` (case-insensitive).
- `--complete`: `none`, `delete`, or `gmlayer`; it is meaningful to fade routes.
- Scale range: `0.01`–`20`; distance: `0`–`100000` page units; duration: `0`–`60000` ms; degrees: `-36000`–`36000`; opacity: `0`–`1`.

Examples:

```text
!tokenanimator move --direction|northeast --distance|30 --duration|1000 --easing|easeInOut
!tokenanimator rotate --degrees|-90 --duration|500
!tokenanimator fadeout --duration|2000 --complete|gmlayer
!tokenanimator animate --scale|1.5 --tokens|TOKEN_ID_1,TOKEN_ID_2
```

Persistent baselines are pruned for missing tokens; legacy `TokenSizeAnimator` state is migrated then removed. There are no external script dependencies. Timings and page-scale movement require live Roll20 verification.
