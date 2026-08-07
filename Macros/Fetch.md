# Fetch command reference

Complexity: embedded command/scripting language.

Source: active `Scripts/Fetch.js` (header 2.2.1; runtime constant 2.2.0 — discrepancy retained from source). Fetch is a ZeroFrame meta processor (default registration priority 50) for object, property, macro, and repeating-sheet lookup. It has no `!fetch` action command.

## Lookup grammar

```text
@(OBJECT|PROPERTY[|SUBPROPERTY][|SUBSUBPROPERTY][DEFAULT])
%(OBJECT|ABILITY[DEFAULT])
#(MACRO[DEFAULT])
*(CHARACTER|SECTION|ROW-SELECTOR|FIELD[|current|max][DEFAULT])
```

`@` fetches an attribute/property and `%` an ability/action. Separators may be `|` or `.`. `OBJECT` can be an object type, object ID, token/character name, `selected`, `speaker`, `table`, or `tracker[FILTER][+|-OFFSET]`. `tracker` selects a turn-order token; `FILTER` is `page`, `ribbon`, or GM-only `gm`. A name may include `[page]`. `[DEFAULT]` is emitted when lookup fails.

`#(NAME[DEFAULT])` resolves a macro. `*` reads repeating attributes: its row selector is a criteria pattern `[field OP value ...]`, a row reference (`$N`, `$n`, `1dw`, `1dweight`, or a row ID), or aggregate `min|max|avg|sum|vals|uniq|rowids|ids` with an optional `?` argument. Pattern fields use `=`, `!=`, `~`, `!~`, `>`, `>=`, `<`, `<=`; prefix a field with `m|` to read its max value.

```text
!token-mod --set bar1_value|@(selected|bar1[0])
!chat --name|@(tracker+1|name[No next token])
!chat --value|*(selected|inventory|[itemname~potion]|itemcount|current[0])
```

Fetch loops until no supported construct remains. It resolves Roll20 object properties and legacy attribute objects synchronously; per the registry it is not evidence of Beacon-safe sheet access and must not be used to implement Beacon read/write logic.

## Configuration and reports

```text
!fetchconfig
!fetchconfig +playerscanids
!fetchconfig -playerscanids
!fetchprops
!fetchprops --type=TYPE
!fetchprops-rebuild
!fetchprops-rebuild --type=TYPE
```

All configuration/property-report routes are GM-only. `!fetchprops` displays the known property set; `rebuild` refreshes it. These routes are diagnostic/admin aids, not macro substitution syntax.

The public contextual objects are `Fetch.KnownObjectTypes`, `Fetch.PropContainers`, and `Fetch.CustomPropsByType`. Fetch requires `libTokenMarkers`, `libTable`, and `Messenger`; `checkLightLevel` is optional. Selection and sender behavior are supplied by SelectManager/ZeroFrame when installed.

## Permissions and escaping

Fetch itself enforces campaign policy for object IDs (`playerscanids`) and object visibility/control in its resolvers; it does not grant the resulting downstream command any permission. Quote values in repeating patterns with `'`, `"`, or backticks where needed. Escape `@`, braces, and pipes inside Roll20 queries/templates. Property names and currently registered custom property containers are campaign/live-source dependent; use `!fetchprops` to verify them rather than assuming undocumented aliases.
