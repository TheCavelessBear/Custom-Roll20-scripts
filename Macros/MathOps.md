# MathOps command reference

Complexity: embedded command/scripting language.

Source: active `Scripts/MathOps.js` (version 1.0.8). MathOps is a ZeroFrame meta-operation, not a stand-alone `!math` command. It also listens to API chat directly only when ZeroFrame is absent; when ZeroFrame exists it declines that direct pass and registers at priority **55** with handle `math`.

## Grammar

```text
{& math EXPRESSION }
({& math EXPRESSION })
```

Whitespace after `math` is optional. The body ends at the first `}`; consequently do not put an unprotected `}` in an expression. Parenthesized form is accepted so the construct can survive enclosing syntax. Inline-roll placeholders `$[[N]]` are replaced by parsed roll values before evaluation.

`EXPRESSION` is parsed by MathOps' internal arithmetic parser, not JavaScript `eval`. It supports numeric literals, names from the shared `msg.variables` bank, parentheses, and `+ - * / %` (`*`/`/`/`%` bind before `+`/`-`). Built-in names are `e`, `pi`, `lntwo`, `lnten`, `logtwoe`, and `logtene`. Functions are `abs`, `min`, `max`, `maxn`, `minn`, `acos`, `acosh`, `asin`, `asinh`, `atan`, `atanh`, `atantwo`, `cbrt`, `ceiling`, `cos`, `cosh`, `exp`, `expmone`, `floor`, `hypot`, `log`, `logonep`, `logten`, `logtwo`, `pow`, `rand`, `randb`, `randib`, `randa`, `round`, `sin`, `sinh`, `sqrt`, `tan`, `tanh`, and `trunc`. `maxn`/`minn` can take a delimiter (including `roll`) to join their selected values. Unknown names are returned as text by the evaluator; malformed expressions remain in the command and make the meta pass unresolved.

```text
!some-script --amount|{& math 2 + 3 * 4 }
!some-script --dc|{& math $[[0]] + bonus }
```

The second example requires an inline roll at index 0 and a variable named `bonus` (usually loaded by Muler). MathOps substitutes only after the roll is available; ZeroFrame repeats its loop when a replacement or unresolved construct exists.

## Ordering, permissions, and dependencies

No permission check is implemented by MathOps. It transforms API-message text, so the receiving command's permissions still control the actual action. It has no command-generated help/configuration route and exposes one contextual API: `MathOps.MathProcessor({ code, known })`.

It requires only the Roll20 environment when used alone. In this installed project it depends operationally on ZeroFrame being loaded later in registry order; registration is live-state dependent. Verify a message containing the first example reaches its final command with `14`, and verify a malformed expression produces no accidental downstream command.

## Escaping and limitations

Use Roll20 HTML escaping when the containing macro itself needs `@`, `{`, `}`, or `|` in a query/button. MathOps does not escape them for you. The source does not publish a complete user-facing function catalogue; treat any function not proven in the active parser as unsupported. This is a parser capability reference, not a generated/admin command reference.
