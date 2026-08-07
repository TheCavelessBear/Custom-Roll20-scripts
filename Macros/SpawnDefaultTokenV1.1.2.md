# SpawnDefaultToken command reference

Active source: `Scripts/SpawnDefaultTokenV1.1.2.js` (header filename 1.1.2; internal script version `0.26.2`).  
Complexity: high-variance command system.  
Audience: player-usable; no GM/controller check is implemented.  
Command: case-sensitive `!Spawn` only.

## Grammar, origins, and targets

```text
!Spawn {{ --name|CHARACTER NAME [--option|value ...] }}
```

Double braces are optional parser wrappers. Arguments split on whitespace plus `--`; each option splits at `|` and uses only the first value segment. Inline rolls become totals or rollable-table item names. At least one actual selected token is required unless the command is the script-generated target callback.

By default every selected token is an origin, and `--qty` tokens spawn per origin. To use target origins while preserving original selection:

```text
!Spawn --name|Goblin --targets|2,Choose two origins
```

The script whispers a generated `Select Targets` button containing internal `--memento|... --targs|...`; users should not construct or reuse that callback. `%comma%` inserts a comma in the optional prompt text.

## Complete option families

| Option | Structure and values |
|---|---|
| `--name` | Required exact character name whose default token is spawned. |
| `--qty` | Integer tokens per origin; default `1`. |
| `--targets` | `COUNT[,PROMPT]`; switches to generated Roll20 target collection. |
| `--placement` | `stack` (default), `row`, `col`/`column`, `surround`, `grid N`, `burst N`, `cross N`, or `random N`/`rand N`. Random requires `qty <= N*N`; surround ignores offset. |
| `--offset` | `X,Y` in page squares; positive Y is down. |
| `--force` | `true/yes/1` or `false/no/0`; force origin alignment to a full square. |
| `--size` | `WIDTH[,HEIGHT]` in squares; one value makes a square. |
| `--side` | Side number; nonnumeric text takes the random-side branch (canonical `rand`/`random`). |
| `--rotation` | Degrees; nonnumeric text takes the random-rotation branch. |
| `--order` | Front aliases `tofront/front/top/above`; back aliases `toback/back/bottom/below`. |
| `--bringSourceToFront` | `true/yes/1` enables. |
| `--layer` | Canonical `object`/`token`/`objects`, `gm`/`gmlayer`, or `map` as accepted by later validation. Default follows origin unless explicitly set. |
| `--light` | `BRIGHT_OR_TOTAL,DIM_OR_ADDITIONAL`; mapped according to page LDL/UDL mode. |
| `--mook` | `true/yes/1` removes linked behavior/representation as implemented; false is default. |
| `--bar1`, `--bar2`, `--bar3` | `CURRENT[/MAX] [KeepLink]`; omitted max becomes current. Without `KeepLink`, the bar link is removed. |
| `--tokenName` | Spawned token name override. |
| `--tooltip` | Tooltip text. |
| `--isdrawing` | `true/yes/1` enables drawing behavior. |
| `--sheet` | Character name containing the post-spawn ability; defaults from first selected token. |
| `--ability` | Exact ability name sent after spawn. Use with `--sheet` when needed. |
| `--fx` | `TYPE-COLOR`; types `bomb,bubbling,burn,burst,explode,glow,missile,nova,splatter`; colors `acid,blood,charm,death,fire,frost,holy,magic,slime,smoke,water`. |
| `--expand` | `FRAMES[,DELAY_MS[,true/yes/1]]`; optional third value deletes spawned token after animation. |
| `--deleteSource`, `--deleteTarget` | `true/yes/1` enables deletion after spawn. |
| `--resizeSource`, `--resizeTarget` | `WIDTH,HEIGHT[,FRAMES,DELAY_MS]` in squares; a zero dimension deletes after resize. Defaults 20 frames/50 ms. |
| `--controlledby` | `[+]PLAYER[,PLAYER...]`; each value is `all`, player ID, or exact display name. Leading `+` appends instead of replacing the spawned character sheet's controller list. |
| `--tokenProps` / `--tokenProp` | `PROPERTY:VALUE[,PROPERTY:VALUE...]`; `%comma%` embeds a comma in a value. |

Exact `tokenProps` whitelist from the active array:

```text
name,statusmarkers,bar1_value,bar1_max,bar2_value,bar2_max,bar3_value,bar3_max,
top,left,width,height,rotation,layer,aura1_radius,aura1_color,aura2_radius,
aura2_color,aura1_square,aura2_square,tint_color,light_radius,light_dimradius,
light_angle,light_losangle,light_multiplier,light_otherplayers,light_hassight,
flipv,fliph,bar1_link,bar2_link,bar3_link,isdrawing,gmnotes,showname,
showplayers_name,showplayers_bar1,showplayers_bar2,showplayers_bar3,
showplayers_aura1,showplayers_aura2,playersedit_name,playersedit_bar1,
playersedit_bar2,playersedit_bar3,playersedit_aura1,playersedit_aura2,lastmove,
tooltip,show_tooltip,adv_fow_view_distance,has_bright_light_vision,
has_night_vision,night_vision_distance,emits_bright_light,bright_light_distance,
emits_low_light,low_light_distance,has_limit_field_of_vision,
directional_bright_light_center,directional_bright_light_total,
has_directional_dim_light,directional_dim_light_center,directional_dim_light_total,
bar_location,compact_bar,light_sensitivity_multiplier,night_vision_effect,lightColor
```

Representative combinations:

```text
!Spawn --name|Goblin --qty|4 --placement|surround --size|1 --side|random
!Spawn --name|Wall of Fire --placement|row --qty|6 --offset|0,-1 --fx|burn-fire
!Spawn --name|Spirit --bar1|10/10 --tokenName|Summoned Spirit --controlledby|+all
!Spawn --name|Marker --tokenProps|aura1_radius:10,aura1_color:#ff0000,showplayers_aura1:true
```

Selection substitutions are not command arguments here: the script requires actual selected-token message context. `@{target|...}` should be used only through `--targets`, because a direct Roll20 target prompt removes `msg.selected` and is the reason for the memento pathway.

Dependencies: exact character/default-token/ability/player names, page grid/lighting, Roll20 FX, and timers. AoEBoom and MapChange also call the JavaScript `SpawnDefaultToken.spawnAtXY`; that API is not a macro.

Source/help discrepancies: internal version differs from filename; the `validArgs` error list omits active `rotation`, `isdrawing`, `tokenName`, `tooltip`, `tokenProps`, and `controlledby` handling. Conversely, header help lists `represents` and several UDL limit/directional boolean properties that the active trimmed whitelist does not accept (some array entries contain leading-space defects), so they are not included above. Live verification is required for layer aliases, controller writes, UDL/LDL mapping, callbacks, animations, and destructive source/target options.
