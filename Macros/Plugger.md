# Plugger command reference

Complexity: embedded command/scripting language.

Source: active `Scripts/Plugger.js`: Plugger 1.0.10 plus bundled `PluggerPlugins01` 0.0.4. Plugger is a ZeroFrame meta-operation at priority **50**, with handles `eval` and `plug`; it is not a direct `!plugger` command.

Selection: Plugger itself neither requires nor changes selected tokens. ZeroFrame preserves the incoming message context, and only the API command dispatched by an evaluated block decides whether actual selection or explicit token IDs are required. Do not add selected/target references unless that downstream command accepts them.

## Evaluation grammar

```text
{& eval} CONTENT {& /eval}
({& eval(ESCAPE) } CONTENT {& /eval})
```

Nested `{& eval}` blocks are parsed recursively. An `ESCAPE` string inside the opening tag's parentheses is removed from the nested text before it is dispatched. The content is processed only if the outer message is API text and the ZeroFrame loop owns it.

The inner text has two execution modes:

```text
ruleName(arguments)
any other command text
```

For `ruleName(arguments)`, Plugger lower-cases the rule name and calls the registered function. Primitive string/number/boolean/bigint results replace the block; non-primitive results become empty text. An unregistered function form is sent as `!ruleName arguments`. Any other text is sent as `!` plus its content (with an initial `!` removed first). Evaluation can therefore dispatch a real API command: never expose a user-controlled eval block to an unsafe recipient.

## Bundled rules

The installed bundled rules are case-insensitive names `getDiceByVal`, `getDiceByPos`, `filter`, and `replace`.

```text
getDiceByVal($[[0]] TESTS RESULT[|DELIMITER])
getDiceByPos($[[0]] TESTS RESULT[|DELIMITER])
filter(--ITEMS --TESTS --RESULT[|DELIMITER])
replace(--source|TEXT --find|FIND|REPLACE[|FLAGS] ...)
```

`TESTS` is pipe-separated numeric tests: `N-M`, `!=N`, `>=N`, `<=N`, `>N`, or `<N`. The dice rules inspect a named inline roll by value or position. Supported result modes documented in source are `included`, `count`, `total`, and `list`; use `|DELIMITER` for list output. `filter` works on supplied list values with the same comparison syntax. `replace` is sequential and accepts multiple `--find` clauses; quote/tick-aware splitting preserves separator characters within `'...'`, `"..."`, or `` `...` ``.

```text
!chat --kept|{& eval}filter(--1|4|9 -->=4 --list|, ){& /eval}
```

## Registration and diagnostics

External scripts add callable rules through `Plugger.RegisterRule(fn1, fn2, ...)`; functions without names are ignored and duplicate names are overwritten by the last loaded function (a log warning is emitted). The public API is registration only; there is no safe return API.

The registry confirms ZeroFrame is the dependency and its live operation order must be verified. The source has no help/config command. Missing `/{& /eval}` produces an unresolved parser note instead of a reliable macro result. Parenthesized tags and normal Roll20 HTML escaping are needed in nested queries/templates; braces/pipes inside a rule's textual arguments otherwise participate in the enclosing parser.
