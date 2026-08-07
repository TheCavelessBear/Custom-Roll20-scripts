# GroupInitiative 0.9.42 command reference

Complexity: high-variance command system.

Source: active `Scripts/GroupInitiative0.9.42.js`; registry install slot 1. It rolls initiative, manages bonus stat groups and saved turn orders, and notifies observers. Commands are case-sensitive source dispatches and use `--` to split options.

## Rolling and turn-order commands

```text
!group-init
!group-init --bonus NUMBER
!group-init --reroll [NUMBER]
!group-init --ids TOKEN_ID [TOKEN_ID ...]
!group-init --adjust NUMBER [MINIMUM]
!group-init --adjust-current NUMBER [MINIMUM]
!group-init --sort
!group-init --clear
!group-init --toggle-turnorder
!group-init --help
```

Bare and `--bonus` use selected tokens; `--reroll` takes the non-custom turn-order entries; `--ids` is GM/API only. `--bonus` accepts a signed integer/decimal after Roll20 has resolved an inline roll. `--adjust` changes every non-custom (`id !== -1`) entry and `--adjust-current` only entry 0; optional minimum defaults to `-10000`. `--sort`, `--clear`, and `--toggle-turnorder` are GM-only. `--help` is GM-only. The bare command with no usable IDs opens help instead of rolling.

Normal selected-token rolling and `--bonus` are not explicitly GM-gated in the handler; actual token/sheet availability and configured stat groups determine whether a roll is produced. Custom `-1` turn-order entries survive adjustment filtering.

## Bonus stat groups (GM only)

```text
!group-init --add-group --ADJUSTMENT [--ADJUSTMENT ...] ATTRIBUTE[|max]
!group-init --show-sheets
!group-init --promote INDEX
!group-init --del-group INDEX
```

Each `--add-group` segment is parsed as an adjustment name optionally followed by its parameter/attribute text. Stat-transform adjustments are accumulated in reverse parse order until an attribute terminates that component; a final transform with no attribute is rejected. Stat groups are tried in configured order, the first complete group wins, and `ATTRIBUTE|max` reads an attribute maximum.

Every active adjustment and its parameter structure:

| Adjustment segment | Meaning |
|---|---|
| `--bare ATTRIBUTE[|max]` | Read the attribute unchanged. `bare` itself is not stored. |
| `--stat-dnd ATTRIBUTE` | Convert a D&D score to `floor((score-10)/2)`. |
| `--negative ATTRIBUTE` | Negate the value. |
| `--floor ATTRIBUTE` | Round down. |
| `--ceiling ATTRIBUTE` | Round up. |
| `--tie-breaker ATTRIBUTE` | Add the attribute as `0.01 * value`. |
| `--computed PROPERTY` | Read Beacon/Jumpgate computed `PROPERTY` with `getComputed`; requires the experimental API server/sheet implementation. |
| `--bonus NUMBER` | Add a raw numeric component. This is inside `--add-group`, not the rolling command’s top-level manual bonus. |
| `--filter-sheet SHEET_NAME` | Accept this group only for an exact character-sheet name; the value must appear in `--show-sheets`. |
| `--filter-status MARKER` | Accept only tokens whose `status_MARKER` is not false. |
| `--filter-tooltip WORD` | Accept only tokens whose lowercased tooltip contains the supplied split word. |
| `--token_bar 1|2|3` | Use that token bar’s current value. |
| `--token_bar_max 1|2|3` | Use that token bar’s maximum. |
| `--token_aura 1|2` | Use that token aura radius. |
| `--roll-die-count COUNT` | Override dice count for the matching group/token. |
| `--roll-die-size SIZE` | Override die size. |
| `--roll-die-mod TEXT` | Append the supplied dice modifier text to the roll expression. |
| `--label TEXT` | Store the reporting label for this matching group. |

Representative composed groups:

```text
!group-init --add-group --bare initiative_bonus --tie-breaker dexterity
!group-init --add-group --filter-sheet dnd2024byroll20 --computed initiative_bonus --computed init_tiebreaker
!group-init --add-group --filter-status red --roll-die-count 2 --token_bar 3
```

Each final parameter above terminates one component; subsequent `--...` segments add another component to the same group.

## Saved initiative stacks (GM only)

```text
!group-init --stack [list]
!group-init --stack clear
!group-init --stack copy|dup [LABEL]
!group-init --stack push [LABEL]
!group-init --stack pop|apply
!group-init --stack swap|tswap|tail-swap [LABEL]
!group-init --stack merge|apply-merge|amerge
!group-init --stack rotate|rot|reverse-rotate|rrot [LABEL]
```

`copy` saves current order; `push` also clears it. `pop` restores/removes the newest saved order, `apply` restores without removal (source uses the first entry), and merge variants union/sort saved and current order. `swap` uses the first saved entry; `tswap` the last. `rotate` moves first saved order into current order and saves current at the end; reverse rotate does the opposite end. Labels are remaining words. `clear` empties saved stacks.

## GM configuration

```text
!group-init-config [--help]
!group-init-config --apply-standard-config|NAME
!group-init-config --sort-option|NAME
!group-init-config --set-roller|NAME
!group-init-config --set-announcer|NAME
!group-init-config --set-die-size|INTEGER
!group-init-config --set-dice-count|INTEGER
!group-init-config --set-dice-count-attribute|ATTRIBUTE
!group-init-config --set-dice-mod|TEXT
!group-init-config --set-max-decimal|INTEGER
!group-init-config --toggle-auto-open-init|--toggle-replace-roll
!group-init-config --toggle-preserve-first|--toggle-check-for-no-config
```

All routes are GM-only. Omit a value for dice-count attribute/modifier to clear it. Enumerated names are case-sensitive object keys in the active parser:

- Standard configurations: `dnd2024byroll20`, `dnd5eogl`, `dnd5eshaped2`, `stargaterpgofficial`.
- Sort options: `None`, `Ascending`, `Descending`. Despite their source descriptions being worded backwards, the comparison functions sort `Ascending` from low to high and `Descending` from high to low.
- Rollers: `Individual-Roll`, `Least-All-Roll`, `Mean-All-Roll`, `Constant-By-Stat`.
- Announcers: `None`, `Hidden`, `Partial`, `Visible`.

`Individual-Roll` rolls separately; `Least-All-Roll` gives everyone the lowest rolled result; `Mean-All-Roll` actually selects the middle array element after roll processing (the source description calls it an average); `Constant-By-Stat` rolls zero dice and uses the configured stat bonus. `Hidden` whispers all; `Partial` exposes player-controlled character results and whispers other results; `Visible` exposes object-layer rolls and whispers GM-layer results.

The source/parser therefore disagrees with two embedded descriptions: sort direction prose is reversed relative to its comparators, and `Mean-All-Roll` is a middle-result selection rather than a calculated arithmetic mean. Live-test existing campaign expectations before changing either setting.

## API, integration, and verification

Public APIs: `GroupInitiative.ObserveTurnOrderChange(handler)` and `GroupInitiative.RollForTokenIDs(ids, options)`. TurnMarker observes turn-order changes; the registry requires keeping custom `-1` entries while pruning destroyed token entries. Verify: selected roll; GM-only rejection; reroll; each stack mutation; custom-entry preservation; a destroyed token cleanup; and TurnMarker notification. Inline Roll20 queries that contain `|`/`{` must be entity-escaped. The enumerations above come from the active parser registries; only the campaign-specific names returned by `--show-sheets` remain live data.
