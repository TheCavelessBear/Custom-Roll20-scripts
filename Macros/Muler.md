# Muler command reference

Complexity: embedded command/scripting language.

Source: active `Scripts/Muler.js` (2.0.3). Muler loads values from character abilities ("mules") or rollable tables into the message variable bank, then optionally persists assignments. With ZeroFrame it registers load/get at priority **25** (`get`, `muleget`, `muleload`, `load`) and set at **65** (`set`, `muleset`); it is not a `!muler` command.

## Load and read grammar

```text
{& mule MULE [MULE ...] }
get.VARIABLE/get
get.MULE.VARIABLE/get
get.CHARACTER.MULE.VARIABLE/get
get.table.TABLE.ITEM?name|avatar|url|image|html/get
```

Names may be quoted with `'`, `"`, or backticks when their permitted characters require it. A mule is an ability whose action contains one variable per line:

```text
key=value
10-19=medium
>=20=large
```

`{& mule}` removes itself after loading. A read looks in the selected mule/character mule, or all loaded mules; numeric reads can match the first range key (`low-high`, `!=N`, `>=N`, `<=N`, `>N`, `<N`). Rollable-table mules expose item name by default, `avatar/url` as avatar, and `image/html` as image. Unresolved reads become empty text and record an unresolved meta note.

## Persist grammar

```text
set.MULE.VARIABLE = VALUE /set
set.CHARACTER.MULE.VARIABLE = VALUE /set
```

The mule must already resolve; an ability mule is updated by replacing/appending its `VARIABLE=VALUE` action line. The source processes set only after variables exist, hence the normal pattern is load/get first, then set.

```text
!example {& mule Hero.Resources } --spent|get.Resources.hp/get set.Resources.hp = {& math get.Resources.hp/get - 1 } /set
```

Use distinct punctuation in real macro text: the example illustrates pipeline order, not a Beacon-sheet attribute write. Muler uses legacy ability/table storage, never Beacon `getSheetItem`/`setSheetItem`.

## Configuration, ownership, and permissions

```text
!mulerconfig
!mulerconfig +playersneedcontrol
!mulerconfig -playersneedcontrol
```

These are GM-only (case-insensitive). `playersneedcontrol` controls whether a player must control a source character; verify the installed setting in its configuration card. The module requires `libTable` and `Messenger`; ZeroFrame is optional but required for coordinated meta ordering. It publishes no callable return API.

Escaping: quote mule/character/table names with spaces; use HTML entities in nested Roll20 queries for `@`, `{`, `}`, and `|`. The parser splits ability actions by newlines and accepts only `key=value` lines. Since source lookup and player-control behavior depend on live campaign objects, verify both GM and player access before relying on a macro.
