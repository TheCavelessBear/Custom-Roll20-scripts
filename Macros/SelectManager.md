# SelectManager command reference

Complexity: branching command script.

Source: active `Scripts/SelectManager.js`. SelectManager preserves `selected`, `who`, `playerid`, and inline-roll context through API-generated messages. It registers a ZeroFrame meta operation at priority **20** (`sm`) and also has a direct `!forselected` dispatcher plus GM configuration.

## Selection tags

```text
{& select ITEM[, ITEM...]}
{& inject ITEM[, ITEM...]}
```

`select` replaces the current selection; `inject` appends unique matches. An item is a token/object identifier or a criterion:

```text
+TYPE TEST VALUE       -TYPE TEST VALUE
+@attribute TEST VALUE  +*marker TEST VALUE  +#tag TEST VALUE
```

`+` requires and `-` excludes. `TYPE` can be `bar1..3`, `max1..3`, `aura1..2`, `color1..2`, `layer`, `tip`, `gmnotes`, `type`, `pc`, `npc`, `pt`, or `side`; the source also accepts installed token-marker names as marker criteria. Tests are `=`, `!=`, `~`, `!~`, `>`, `>=`, `<`, `<=`, and `in [a,b,...]`. A GM gets an implicit `+layer=objects` criterion unless a layer criterion is supplied. Criteria and identifiers are comma-separated; `in [...]` protects its internal commas.

```text
!token-mod {& select +bar1 < 1, +layer = objects} --set statusmarkers|dead
!some-script {& inject @{target|token_id}} --targets|...
```

Selection tags rewrite message context only; the receiving script decides permission and behavior.

## One command per selected token

```text
!forselected++ COMMAND
!forselected+- COMMAND
!forselected-+ COMMAND
!forselected-- COMMAND
!forselected++(X)-silent COMMAND
```

`!forselected` dispatches the remainder once per original selected token. `++` (default) replaces both the first selected token ID and its name in later dispatches; `+-` replaces ID only; `-+`/`-` replace name only; `--` replaces neither. `(X)` is accepted as a single separator character. `-silent` suppresses the no-selection warning. `{& i}`, `{& i + N}`, and `{& i - N}` resolve to the zero-based invocation index.

The wrapper's generated message preserves the original player and selection and removes its temporary state after the last dispatch (or after ten seconds). Treat it as generated machinery, not a command another script should parse.

## Configuration and API

```text
!forselected                         (also reports/uses selected context)
!smconfig [+|-]selected|who|playerid|playerscanids|acknowledgeN
```

The exact config trigger is established by the source `handleConfig`; its options are GM-only and set auto-insertion/policy state. The active direct feature route is `!forselected`; no public mutation API is exposed. Context getters are `SelectManager.GetSelected()`, `GetWho()`, and `GetPlayerID()`.

Dependencies are `libTokenMarkers` and `Messenger`; ZeroFrame is optional but needed for ordered `{& select}`/`{& inject}` handling. Use Roll20 entities for nested query/template punctuation. Actual token ownership, `playerscanids`, and existing selection are live conditions; verify GM and player runs, including no selection and duplicate criteria, before publishing a macro.
