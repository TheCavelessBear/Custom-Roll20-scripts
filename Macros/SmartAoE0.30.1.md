# SmartAoE 0.30.1 command reference

Complexity: high-variance command system.

Source: active `Scripts/SmartAoE0.30.1.js`; registry install slot 17. SmartAoE creates linked control-token/path AoEs and applies geometry-triggered effects. It is a legacy direct parser: it does not use Beacon async sheet access, and its damage/resource behavior uses legacy attributes/token bars. Do not use it as precedent for new Beacon work.

## Create grammar

```text
!smartaoe {{
  --aoeType|TYPE
  --radius|NUMBER[UNIT]
  --OPTION|VALUE
}}
```

The parser normalizes `{{...}}` to whitespace, then splits at whitespace-plus-`--`; each option splits at the first `|`. Therefore use HTML escaping/queries carefully when option values contain `|`, braces, or nested macro syntax. A selected origin token is required unless `--selectedID|TOKEN_ID` is supplied. API-generated calls must supply **both** `--selectedID|TOKEN_ID` and `--playerID|PLAYER_ID`.

`TYPE` recognizes `line` (default), `square[, float]`, `circle[, float]`, `PFcircle[, float]`, `5econe`, `PFcone`, `cone[, DEGREES]`, and `wall`. `radius`/`width` accept a numeric value optionally followed by units; `u` is grid units and other suffixes use page scale. A floating circle/square radius may default to intersection snapping; walls force floating geometry and default origin `nearest,face`.

### Geometry and control option families

| Option | Accepted structure and behavior |
|---|---|
| `selectedID|TOKEN_ID` | Explicit origin token; replaces actual selection. API-originated calls must also set `playerID`. |
| `playerID|PLAYER_ID` | Effective player for API-generated calls, whispers, control, and player colors. |
| `radius|NUMBER[UNIT]` | Fixed length/radius. Omitting it leaves a variable AoE. Unit letters trigger page-scale conversion; `u` is grid units. |
| `width|NUMBER[UNIT]` | Wall width; default one 70-pixel cell before page-grid conversion. |
| `aoeType|TYPE` | Types above. `square` is recognized by any value containing `sq`; unknown input falls back to `line`. `cone,DEGREES` defaults to 90 when invalid. |
| `origin|center|nearest[,face]` | `center` is default. `nearest` chooses a nearest candidate origin; optional `face` uses token-face rather than corner candidates where that pathway applies. |
| `offset|X,Y` | Numeric grid-unit origin offset, converted later to pixels. |
| `forceIntersection|true|yes|1|false|no|0` | Forces grid intersection and drawing mode when true. Walls default this based on their own geometry. |
| `minGridArea|FRACTION` | Minimum affected fraction of a grid cell; default `0.01`; ignored by line effects. |
| `minTokArea|FRACTION` | Minimum affected fraction of a token; default `0.01`. |
| `controlTokName|CHARACTER_NAME|self` | Default-token character name, default `AoEControlToken`. The source’s documented/safe `self` pathway is a fixed-radius floating circle/PFcircle/square. See the validation discrepancy below. |
| `controlTokSize|NUMBER` | Control-token size in grid squares; default 1. |
| `controlTokSide|SIDE` | Side selector passed to the spawn helper for a multi-sided default token. |
| `aoeColor|#HEX|player` | Fill color. `player` uses effective player color; API calls need `playerID`. |
| `aoeOutlineColor|#HEX|player` | Outline color; same player-color rule. |
| `gridColor|#HEX` | Grid overlay color. |
| `fx|FX_NAME` | Built-in or custom Roll20 FX name stored for movement/trigger display. |
| `instant|true|yes|1` | One-use/instant flag; omitted/other values remain false. |
| `isDrawing|true|yes|1` | Marks control token as drawing; floating AoEs also force it true. |
| `outlineOnly|true|yes|1` | Draw outline without fill; explicit other values false. |
| `aoeLayer|objects|object|token|tok|gm|map` | Normalizes to `objects`, `gmlayer`, or `map`. |
| `tooltip|TEXT` | Control-token tooltip text. |
| `affectsCaster|true|yes|1` | Includes caster; omitted/other values false. |
| `turnOrder|NAME[,VALUE[,FORMULA[,LINK]]]` | Adds a custom turn entry. `VALUE` and `FORMULA` are parsed as integers. `LINK=false|no|0` makes the entry independent of the control token; otherwise it is linked. |

### Save, damage, condition, and resource families

| Option | Accepted structure and behavior |
|---|---|
| `ignore|ATTRIBUTE,VALUE` | Requires exactly the attribute/value structure used to exclude matching represented tokens. |
| `dc|INTEGER` | Save DC; default 0. |
| `noSave|true|yes|1` | Suppresses a meaningful save by assigning the internal sentinel DC. |
| `saveFormula|MODE|CUSTOM` | Built-ins: `5estr`, `5edex`, `5econ`, `5eint`, `5ewis`, `5echa`, `pf1fort`, `pf1ref`, `pf1will`, `pf2fort`, `pf2ref`, `pf2will`, `pfcfort`, `pfcref`, `pfcwill`, and `custom`. Any non-built-in text becomes the formula after the custom substitutions below. These are legacy sheet formulas, not Beacon-safe lookups. |
| `bar|N[,N...]` | One or more token-bar numbers used in sequence for auto-applied damage/healing; default bar 1. |
| `autoApply|true|yes|1` | Applies calculated damage/conditions to token bars/status markers. Omitted/other values false. |
| `damageFormula1|VALUE`, `damageFormula2|VALUE` | A numeric base, a Roll20 inline roll, or a custom `<<...>>` roll. Two independent damage components are supported. |
| `damageType1|TYPE`, `damageType2|TYPE` | Free-text type strings matched case-insensitively against configured resistance/vulnerability/immunity attribute contents. |
| `damageSaveRule|RULE` | Successful-save math rule; default `*0.5`. |
| `resistanceRule|RULE` | Resistance math rule; default `*0.5`. |
| `vulnerableRule|RULE` | Vulnerability math rule; default `*2`. |
| `resistAttr|ATTR[,ATTR...]` | Legacy character attributes to scan; default `npc_resistances`. |
| `vulnerableAttr|ATTR[,ATTR...]` | Defaults to `npc_vulnerabilities`. |
| `immunityAttr|ATTR[,ATTR...]` | Defaults to `npc_immunities`; immunity math is fixed internally at `*0` because no `immunityRule` parser case exists. |
| `conditionPass|MARKER[,MARKER...]`, `conditionFail|...` | Comma-separated Roll20 status-marker tags applied only with `autoApply`. |
| `zeroHPmarker|MARKER[,MARKER...]` | Markers toggled when the last configured damage bar reaches/leaves zero. |
| `removeAtZero|true|yes|1` | Removes token at zero on the last configured bar when auto-apply reaches that path. |
| `casterCondition|MARKER[,onfail]` | Applies caster marker; `onfail` restricts it to a batch containing at least one failed save. |
| `resource|ATTRIBUTE[,COST[,LABEL]]` | Deducts a legacy attribute on the origin’s represented character before creation. Cost defaults to 1; label defaults to attribute name. Insufficient/missing resource aborts. |
| `spawnSound`, `moveSound`, `triggerSound`, `deleteSound` | Exact Jukebox track name for each lifecycle event. |
| `whisperAll|true|yes|1`, `whisperResults|true|yes|1` | Whisper full output or auto-apply results; other values false. |
| `hideName|true|yes|1`, `hideNames|true|yes|1` | Aliases that replace target names with numbered labels. |

Math `RULE` is exactly an operator `*`, `/`, `+`, or `-` followed by a number, for example `*0.5`, `/2`, `+5`, or `-10`; multiplication/division results are floored. Custom save/damage formula syntax replaces `<<...>>` with `[[...]]`, `>>` with `]]`, and `a{...}` with `@{...}`, then removes whitespace. This is specifically the active legacy formula language.

Card-display options are `desc|description`, `title`, `leftsub`, `rightsub`, `titlecardbackground`, `titlefontface`, `titlefontcolor`, `titlefontsize`, `titlefontlineheight`, `subtitlefontface`, `subtitlefontcolor`, `subtitlefontsize`, `bodyfontface`, `bodyfontsize`, `tablebgcolor`, `tableborder`, `tableborderradius`, `tableshadow`, `titlecardbottomborder`, `evenrowbackground`, `oddrowbackground`, `evenrowfontcolor`, `oddrowfontcolor`, and `chatavatarsenabled`. Except for `chatavatarsenabled|true|yes|1`, these values are stored as literal display strings.

```text
!smartaoe {{ --aoeType|circle, float --radius|20ft --minGridArea|0.5 --fx|burn-fire }}
!smartaoe {{ --aoeType|line --radius|60ft --damageFormula1|[[8d6]] --damageType1|fire --dc|15 --saveFormula|dex }}
```

## Generated/control commands

```text
!smartclearcache
!smartremove [TOKEN_ID]
!smartquery [TOKEN_ID]
!smarttrigger                              (selected control; all affected targets)
!smarttrigger CONTROL_TOKEN_ID TARGET_TOKEN_ID
!smartrotateorigin cw|ccw
!smartpinggm TOKEN_ID
!smartpingall TOKEN_ID
!smartapply --args|...                 (generated card action only)
```

`clearcache` unlinks all cached AoEs and explicitly warns that existing objects must be deleted manually. `remove` takes one ID or the first actual selected token. `query` takes one target ID or the first actual selected token and emits generated two-ID `smarttrigger` calls. Bare `smarttrigger` requires an actual selected control token and checks every represented token in range; its explicit pathway requires both control and single-target IDs—supplying only one ID is not a valid variant. Rotate requires an actual selected control/origin token; `ccw` rotates counter-clockwise and every other supplied direction defaults clockwise. Ping takes one explicit ID. `smartapply` parses a positional pipe payload emitted by SmartAoE itself, so do not hand-author it.

## Permissions, dependencies, and limits

The active handler does not consistently GM-gate these commands; source therefore does not prove a safe player permission model. Token control, object layer, Roll20 visibility, and the caller's ability availability must be live-tested. Dependencies include Roll20 paths/pages/tokens, `libInline` for parser roll data, and installed geometry libraries per registry; SmartAoE exposes `SmartAoE.ObserveTokenChange` only.

The registry lists graphic/path/page cleanup and `PersistentStateManager` pruning as live integration behavior. Verify a simple selected-token AoE, API call with/without both required IDs, remove/query/trigger, rotation, cache warning, path/control cleanup, and effects on linked versus unlinked tokens. Damage, temporary HP, concentration, TokenTriggers, Beacon synchronization, and undo are owned by other scripts and are not guaranteed by this legacy script.

Source discrepancy: the `controlTokName|self` error text says only fixed-radius floating circle/square AoEs are permitted, but the active boolean validation does not correctly test the shape and may let another floating fixed shape pass into code not designed for it. Treat circle/PFcircle/square as the supported contract and live-test any historical macro that used another shape.
