# APILogic command reference

Complexity: embedded command/scripting language.

Source: active `Scripts/APILogic.js` 2.0.9. APILogic is ZeroFrame control flow, registered at priority **70** with handles `apil` and `logic`; it has no direct API command and exposes no callable return API.

## Definitions

```text
{& define ([TERM] "REPLACEMENT") ([OTHER] 'TEXT') }
```

Definitions are retained on the message (`msg.definitions`) and replace every literal occurrence of `TERM` in later passes. Quote the replacement with `'`, `"`, or backticks when needed. A definition block may be written in parenthesized tag form. Do not use this as a general escaping mechanism: replacement is literal global text substitution.

## Conditional grammar

```text
{& if CONDITION } TRUE TEXT {& elseif CONDITION } ... {& else } FALSE TEXT {& end}
```

`elseif` and `else` are optional; nesting is supported and must be properly balanced. A condition is an argument or a comparison:

```text
VALUE
!VALUE
LEFT = RIGHT       LEFT != RIGHT
LEFT ~ RIGHT       LEFT !~ RIGHT
LEFT > RIGHT       LEFT >= RIGHT
LEFT < RIGHT       LEFT <= RIGHT
```

Connect conditions with `&&` and `||`; parenthesize groups, optionally give a group a name with `[name]`, and negate it with `!(...)`. Named-group truth values can be reused as a later condition. Single values test truthiness. `~`/`!~` use JavaScript string containment. Numeric-looking operands are compared numerically for ordering; otherwise JavaScript comparison applies. `$[[N]]` and ZeroFrame `({&N})` resolve to inline-roll values in conditions.

```text
!token-mod --set bar1_value|{& if $[[0]] >= 10 && !("immune" ~ "fire") }0{& else }@{selected|bar1}{& end}
```

## Pipeline behavior and failure modes

APILogic removes non-selected branches and rewrites the command; it does not execute the surviving command. The receiving script owns all permissions, target selection, and effects. In the registered toolchain it runs after MathOps/Plugger/Fetch and before Muler's set pass, so construct cross-tool commands deliberately and verify live precedence.

An `elseif`/`else`/`end` without an open `if`, an `elseif` after `else`, unmatched closing parenthesis, or malformed definition emits an unresolved parser error and leaves no dependable output. Protect braces and pipes inside Roll20 queries/buttons with HTML entities (`&#123;`, `&#125;`, `&#124;`); use quotes for comparison values containing operators or spaces. There is no embedded help command, diagnostic chat command, or admin route in the active source.
