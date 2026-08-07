# TokenMod command-language reference

Complexity: high-variance command system.

Source authority: active `Scripts/TokenMod.js` (v0.8.88). This is an implementation reference, not a replacement for the Roll20 Help handout. `Scripts/Un-grouped/TokenMod.md` is not authoritative.

## Contents

1. [Invocation, targeting, and permissions](#invocation-targeting-and-permissions)
2. [Top-level commands](#top-level-commands)
3. [Shared value grammar](#shared-value-grammar)
4. [Every `--set` property](#every---set-property)
5. [Complex property grammar](#complex-property-grammar)
6. [Reports, observers, and integration](#reports-observers-and-integration)
7. [Copy/paste examples](#copypaste-examples)
8. [Live verification notes](#live-verification-notes)

## Invocation, targeting, and permissions

```text
!token-mod [--command arguments ...]
```

The command name is exactly `!token-mod` (hyphen required). It accepts multiple `--command` groups in any order; each group may be repeated. `{{` and `}}` are stripped and may be used to format a multiline macro. Each group is split on whitespace; quote a single argument containing spaces with `'...'` or `"..."`. In set/move/report values, `#` is accepted wherever `|` is accepted (and `|#`/`##` preserve a literal `#`). Inline rolls are resolved before parsing.

Targets are the union of selected graphics and `--ids` IDs, deduplicated. An ID can identify either a graphic or a character; a character target expands to all graphics representing it. `--ignore-selected` suppresses the selected-token portion. `--current-page` restricts expansion to the caller's current page; `--active-pages` restricts it to player/GM active pages. Both filters can be supplied; the last parser result is not mutually exclusive, so do not rely on their combination without live testing.

`--ids` is GM-only by default. A GM may enable the campaign setting with `--config players-can-ids` (or configure it globally); then players may use IDs. Normal selected-token commands do not have an additional TokenMod GM gate. `--api-as <player-id>` is honored only when the originating sender ID is exactly `API`; it changes the permission/reporting identity for the rest of that command.

## Top-level commands

| Command | Exact argument grammar | Effect |
|---|---|---|
| `--help` | no parser subgrammar | whispers the built-in help. |
| `--rebuild-help` | none | rebuilds the Help: TokenMod handout, then reports success. |
| `--help-statusmarkers` | none | whispers current known marker names/tags. |
| `--api-as` | `<player-id>` | API-origin only; changes effective caller. |
| `--debug` | none | whispers parsed targets and the original command; it does not prevent modification. |
| `--config` | `[players-can-ids[|<truthy>]]` | GM-only; without value toggles, with `1,on,yes,true,sure,yup` enables; any other value disables. |
| `--ids` | `<graphic-or-character-id>...` | adds explicit targets; player use depends on config. |
| `--ignore-selected` | none | excludes selected targets. |
| `--current-page` | none | filters targets to caller current page. |
| `--active-pages` | none | filters targets to active pages. |
| `--on`, `--off`, `--flip` | `<boolean-property>...` | sets true, false, or toggles each supported boolean. `on` wins over `off`; either wins over `flip`. Aliases work. |
| `--set` | `<property>|<value> [property|value ...]` | applies typed property operations below. |
| `--move` | `<distance>` or `<angle>|<distance>` | translates token(s); repeat for several moves. |
| `--order` | `tofront|front|f|top` or `toback|back|b|bottom` | changes z order. |
| `--report` | `<recipients>|<message>` | sends a post-change report for each affected token. |

Unrecognized top-level commands are ignored (but appear in `--debug`). `--config`, `--help*`, and `--rebuild-help` return immediately; do not combine them expecting edits in the same invocation.

## Shared value grammar

### Booleans

For `--on/--off/--flip`, use only boolean properties. In `--set`, `1,on,yes,true,sure,yup` mean true; `couldbe`, `sometimes`, `maybe`, `probably`, and `likely` randomly yield true with 1/8, 2/8, 4/8, 6/8, and 7/8 probability respectively; every other value means false.

### Number operators and units

Numeric forms are `N`, `=N`, `+N`, `-N`, `*N`, `/N`, and (where allowed) `!N`; a trailing `!` enforces applicable bounds. `=` forces a literal signed value; otherwise a leading `+ - * /` is relative to the current field. Accepted units: `u` (70 pixels), `g` (grid increment), `s`, `ft`, `m`, `km`, `mi`, `in`, `cm`, `un`, `hex`, `sq`. Position/size fields convert to pixels; radius/distance fields convert to Roll20 page distance. `light_multiplier` and `light_sensitivity_multiplier` do not convert units.

### Text, bars, and links

Text accepts quoted values. A numeric `name` or bar value uses the relative-number behavior. `barN|value` expands to both `barN_value|value` and `barN_max|value`; `barN_reset|anything` sets current to current max. A numeric `barN_value` ending `!` clamps to 0 through that bar's max. Linked bars 1–3 use `setWithWorker` on their linked attribute; bar 4 does not. This is generic TokenMod behavior and does not transfer ownership of HP, temporary HP, movement, or AC from their owning scripts.

### Property aliases

`barN_current→barN_value`; `auraN_option`, `auraN_shape→auraN_options`; `bright_vision→has_bright_light_vision`; `night_vision→has_night_vision`; `emits_bright→emits_bright_light`; `emits_low→emits_low_light`; `night_distance`, `bright_distance`, `low_distance` map to the corresponding UDL distance; `low_light_opacity→dim_light_opacity`; `has_directional_low_light→has_directional_dim_light`; `directional_low_light_total/center→directional_dim_light_total/center`; `currentside→currentSide`; `lightcolor`/`light_color→lightColor`; `lockmovement`/`lock_movement→lockMovement`; `disablesnapping`/`disable_snapping→disableSnapping`; `disabletokenmenu`/`disable_token_menu→disableTokenMenu`; `fadeonoverlap→fadeOnOverlap`; `renderasscenery→renderAsScenery`; `fadeopacity→fadeOpacity`; `baseopacity→baseOpacity`.

## Every `--set` property

| Family / exact properties | Type and accepted values |
|---|---|
| Boolean | `showname`, `show_tooltip`, `gm_only_tooltip`, `showplayers_name`, `showplayers_bar1..bar4`, `showplayers_aura1..aura2`, `playersedit_name`, `playersedit_bar1..bar4`, `playersedit_aura1..aura2`, `light_otherplayers`, `light_hassight`, `isdrawing`, `disableSnapping`, `disableTokenMenu`, `flipv`, `fliph`, `aura1_square`, `aura2_square`, `lockMovement`, `fadeOnOverlap`, `renderAsScenery`, `has_bright_light_vision`, `has_night_vision`, `emits_bright_light`, `emits_low_light`, `has_limit_field_of_vision`, `has_limit_field_of_night_vision`, `has_directional_bright_light`, `has_directional_dim_light`; use boolean grammar. |
| Percentage | `fadeOpacity`, `baseOpacity`, `dim_light_opacity`; `0..1` or `0..100`, clamped to `0..1`; numeric operators are accepted. |
| Screen numbers | `left`, `top`, `width`, `height`, `scale`; number grammar. `scale` expands to width and height. |
| Plain numbers | `light_sensitivity_multiplier`; numeric grammar but no blank value. |
| Degrees (wrap 0–359) | `rotation`, `limit_field_of_vision_center`, `limit_field_of_night_vision_center`, `directional_bright_light_center`, `directional_dim_light_center`; absolute or `+/-`, optionally `=`. |
| Arc (clamp 0–360) | `light_angle`, `light_losangle`, `limit_field_of_vision_total`, `limit_field_of_night_vision_total`, `directional_bright_light_total`, `directional_dim_light_total`; absolute or `+/-`, optionally `=`. |
| Number or blank | `light_radius`, `light_dimradius`, `light_multiplier`, `adv_fow_view_distance`, `aura1_radius`, `aura2_radius`, `night_vision_distance`, `bright_light_distance`, `low_light_distance`; number/unit grammar, empty clears, `!N` toggles blank/number. |
| Text / bar pseudo-fields | `name`, `tooltip`, `bar1_value..bar4_value`, `bar1_max..bar4_max`, `bar1..bar4`, `bar1_reset..bar4_reset`; see shared grammar. |
| Color | `aura1_color`, `aura2_color`, `tint_color`, `night_vision_tint`, `lightColor`; see [Colors](#colors). |
| Options | `aura1_options`, `aura2_options`, `night_vision_effect`, `bar_location`, `compact_bar`, `bar1_num_permission..bar4_num_permission`; see [Options](#options). |
| Token identity / links | `represents`, `bar1_link..bar4_link`, `controlledby`, `defaulttoken`; see [Identity and control](#identity-and-control). |
| Layer | `layer`; exactly `gmlayer`, `objects`, `map`, `walls`, or `foreground`. |
| Markers | `statusmarkers`; see [Status markers](#status-markers). |
| Multi-sided images | `currentSide`, `imgsrc`, `sides`; see [Images and sides](#images-and-sides). |

### Options

`auraN_options`: `circle` (default) or `square`. `bar_location`: `above`/blank/`off`/`none` means Roll20 null, `overlap_top`, `overlap_bottom`, or `below`. `compact_bar`: `compact`/`on`, or blank/`off`/`none` (null). `barN_num_permission`: blank/`editor` (empty), `hidden`/`none`, or `everyone`/`all`. `night_vision_effect`: blank/`off`/`none` → `None`; `nocturnal` → `Nocturnal`; `dimming[|<distance-or-percent>]` → `Dimming_fraction`. Dimming defaults to `5ft`; distance accepts units or `%` of night vision (values over 1 become percent), and accepts `= + - * /` relative operations.

### Colors

Color accepts `transparent`, hexadecimal `RGB`, `RGBA`, `RRGGBB`, or `RRGGBBAA` (optional `#`), `rgb(r,g,b[,a])`, and `hsv(h,s,v[,a])`. Decimal channels are proportions; integer RGB is 0–255 and HSV is H 0–360/S,V 0–100. Prefix `!` toggles transparent/current color; prefix `+`, `-`, or `*` performs channel math. Alpha participates only if supplied by the operand. Examples: `aura1_color|#ff000080`, `tint_color|!rgb(1,0,.2)`, `aura1_color|*hsv(1,1,2)`.

### Status markers

`statusmarkers|entry|entry...`; entries use `[operation]marker[index][:number[:min[:max]]]`, with `;` interchangeable with `:` for API buttons. Markers are resolved from the campaign registry plus built-in/legacy names; unknown markers leave markers unchanged. Default/+ adds or updates; `-` removes (without `[index]`, removes the last matching marker); `!` toggles; `?` changes only if present; `=` replaces the complete set with this marker; `=`, with no marker, clears every marker. `marker[]` addresses all/canonical marker instances for operations, while `marker[1]` is first (one-based). Number accepts `+ - * /`, clamps to min/max (default 0–9), and `dead` never renders a number. Example: `--set statusmarkers|blue:+2:1:5|-red|!dead`.

### Images and sides

`currentSide|N` selects one-based side `N`; `+N`/`-N` moves N sides (wraps), `?+N`/`?-N` clamps, and `*` selects a random valid side. `imgsrc` and `sides` use image operations: a clean Roll20 image URL or a source token ID; source suffix `:N` selects its Nth side and `:*` selects all source sides. Prefix `+` appends, `^` replaces/appends side entries, `-N[,N...]` removes side numbers (`-*` removes all), `/N@P[,N@P...]` reorders existing side N to P, and bare input replaces current image only. `=` with `+`/`^` selects the newly appended/replaced last side. URLs must be Roll20 image URLs with a valid image-size segment; TokenMod normalizes them to `thumb`.

### Identity and control

`represents|<character-id-or-unique-name>` changes representation and clears all four bar links. `barN_link|<attribute-name>` resolves case-insensitively on the represented character and copies current/max; blank clears link. If a recognized assignable computed Beacon/modern-sheet property is supplied, it links directly; otherwise a missing conventional attribute becomes `sheetattr_<name>` only when a represented character exists. `controlledby|[=|+|-]<player-id-or-name> ...` writes the represented character's controls when there is one, otherwise token controls; `=` replaces, `+` adds, `-` removes, blank clears. `defaulttoken|` saves the post-modification token as the represented character's default token; it does nothing without a represented character.

## Complex property grammar

### Movement

```text
--move <distance>
--move <angle>[!]|<distance>
```

`angle` is relative to current rotation unless prefixed `=` (absolute). `!` also writes the movement angle to token rotation. Distance uses the shared unit grammar but no arithmetic operator. Repeated `--move` entries compose in order and append the previous location to `lastmove`.

### Reporting

```text
--report <recipient[:recipient...]>|<message>
```

Recipients: `gm`, `player` (effective caller), `all`, `token` (token controllers), `character` (represented-character controllers), or `control` (both controller lists). Message substitutions are `{property}`, `{property:before}`, `{property:change}`, and `{property:abschange}`; aliases work. `currentSide` reports one-based. Quote the message if it has whitespace.

## Reports, observers, and integration

After each changed token, TokenMod calls every `TokenMod.ObserveTokenChange(handler)` subscriber with `(token, previousSnapshot)`. The registry says ScriptCards may observe this API. The observer runs after `token.set`; do not assume it supersedes native Roll20 change events, and avoid duplicate mechanical processing.

TokenMod is a generic mechanism. Per the state/ownership registry it can mutate bars 1–4 but does not own HP, temporary HP, movement, AC, conditions, damage, healing, or Beacon synchronization semantics. In particular, do not use it as a substitute for ADR/SE/HPManager/AE public integration paths.

## Copy/paste examples

```text
!token-mod --on showname showplayers_name --set name|"Guard Captain" aura1_radius|10ft aura1_options|square
!token-mod --set bar1_value|-7! --report gm|"{name}: {bar1_value:before} → {bar1_value} ({bar1_value:change})"
!token-mod --ignore-selected --ids @{target|Token|token_id} --current-page --move =90!|3g --order tofront
!token-mod {{ --set statusmarkers|blue:+1:0:5|red:3 --on has_night_vision --set night_vision_distance|60 night_vision_effect|dimming|20% }}
!token-mod --set represents|@{selected|character_id} bar1_link|hp bar2_link|hp_temp
```

## Live verification notes

The active source proves parsing and attempted mutation, not current Roll20 object-property availability, Jumpgate behavior, campaign marker names, computed-attribute assignability, or player permission configuration. Verify in the live campaign: selected and `--ids` targeting (GM and player), a linked and an unlinked token, a character ID expanding to multiple tokens, one UDL option, a marker operation, a bar write with a registered observer, and reports to each intended recipient category.
