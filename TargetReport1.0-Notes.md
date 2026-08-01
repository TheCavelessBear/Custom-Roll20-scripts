# TargetReport 1.0

## Overview

TargetReport creates a private, player-facing qualitative report for one targeted token. It reports the target's AE conditions and effects, Challenge Rating tier, Armor Class tier, and current-health tier without revealing the underlying numbers.

## Required Scripts

- `ActionEconomyV2.8.1.js`
- `TargetReport1.0.js`

TargetReport requires the read-only target-status API added in ActionEconomyV2 2.8.1. No other script changes are required.

Replace ActionEconomyV2 2.8 with ActionEconomyV2 2.8.1. Do not run both versions. No StateWipe is required.

## Collections Macro

Create a Collections-tab macro with this complete action:

```roll20
!targetreport @{target|Target|token_id}
```

The shorter `!tr` command is also supported:

```roll20
!tr @{target|Target|token_id}
```

Assign the macro to the players who should be able to use it. The report is whispered only to the player who activated the macro.

## Report Bands

### Enemy Quality

| Challenge Rating | Report |
|---:|---|
| 0–1/2 | Grunt |
| 1–2 | Regular |
| 3–4 | Veteran |
| 5–8 | Elite |
| 9–12 | Boss |
| 13–16 | Legendary |
| 17+ | Mythic Threat |

### Armor

| Armor Class | Report |
|---:|---|
| Below 10 | Easy Target |
| 10–12 | Lightly Defended |
| 13–15 | Guarded |
| 16–18 | Well Armored |
| 19–21 | Heavily Armored |
| 22+ | Formidable Defense |

### Health

| Current HP as a proportion of maximum HP | Report |
|---:|---|
| 100% or more | Unharmed |
| 76–99% | Scratched |
| 51–75% | Wounded |
| 26–50% | Bloodied |
| 1–25% | Weak |
| 0% | Defeated |

Temporary HP does not change the health rating.

## Data Sources

- Conditions and effects come from ActionEconomyV2.
- HP uses token Bar 1 first, then Beacon `hp` and `hp_max` for represented tokens.
- AC uses token Bar 4 first, then Beacon `ac` and `npc_ac` for represented tokens.
- Enemy Quality uses Beacon `npc_challenge`.

An unlinked token can still receive Armor and Health ratings from Bars 4 and 1. Its Enemy Quality is `Unknown` because Challenge Rating is not stored in a token bar.

## Player Access Rules

- Players can inspect an object-layer token on their current page.
- Players cannot inspect tokens on another page or the GM layer.
- A hidden token name remains hidden and appears as `Target` in the report.
- Exact CR, AC, HP, and percentage values are never included in the report.
- GMs can inspect tokens on any layer or page when using the command directly.

## Validation

Syntax validation and mocked Roll20 integration tests passed for:

- Linked NPCs using Beacon Challenge Rating.
- Unlinked NPCs using token bars.
- Fractional Challenge Ratings.
- Each data source taking the correct priority.
- Active conditions, Exhaustion level, and active effects.
- Repeated reports after conditions and effects change.
- Hidden token names.
- Invalid token IDs.
- Off-page and GM-layer access prevention.
- Regression coverage for Shield, Mind Sliver, Dominate Person, and Telekinesis in ActionEconomyV2 2.8.1.
