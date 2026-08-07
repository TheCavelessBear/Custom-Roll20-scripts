# ZeroFrame command reference

Complexity: embedded command/scripting language.

Source: active `Scripts/ZeroFrame.js`; the registry assigns it installation slot 23. ZeroFrame is the message-loop coordinator for the installed meta tools. It registers functions by priority and repeatedly rewrites an API message until no registered operation asks for another pass. Current known registrations include SelectManager 20, Muler-get 25, Plugger 50, MathOps 55, Muler-set 65, and APILogic 70; Fetch registers with its default priority 50. Equal-priority order is live registration order and requires live verification.

Selection: ZeroFrame itself requires no token selection and accepts no token-ID argument. It preserves message selection/context for downstream processors; SelectManager can deliberately replace that context. Add selected/target references only for the final command grammar that accepts them.

## Core tags

```text
{& 0 HANDLES...}                  set this message's operation order
{& log}                           enable loop logging for this message
{& delay[(DEFERRAL)] SECONDS}     defer the rewritten message
{& stop}                          suppress final output
{& escape CHARACTERS}             remove each named character at release
{& simple}   / {& flat}           release plain/chat-friendly output
{& template:TEMPLATE}             becomes &{template:TEMPLATE}
{& r} / {& /r}                    becomes [[ / ]]
{& cr} / {& nl}                   becomes <br>+newline / newline
{& tp} / {& /tp}                  becomes {{ / }}
```

`{& 0}` accepts whitespace-separated registered function names or handles, then appends every other registered operation in its current order. It affects only that message. Delay uses numeric seconds (largest tag wins); its optional deferral text is removed before the delayed command is sent. `stop` is checked only at final release.

```text
!token-mod {& 0 get math logic set} {& mule Hero.Resources } --set bar1_value|{& math get.Resources.hp/get - 1 }
```

The precise availability of each handle depends on the active modules that registered successfully; inspect `!0` in the live sandbox/config card before relying on a custom ordering.

## Values, globals, batch, and formatting

```text
$[[N]].value              ({&N}).value
$[[N]].expanded           ({&N}).expanded
$[[N]].items(SEP)         ({&N}).items(SEP)
{& globals ([TERM] "TEXT") ([OTHER] 'TEXT') }
!{{ COMMAND-1\nCOMMAND-2 }}
```

`value` supplies the parsed numeric value; `expanded` supplies display text. `items` supplies table-item values joined by `SEP` (default comma); quote the separator or use the documented deferred `X#text`/`X|text` form when the separator conflicts with macro syntax. Globals are literal replacements retained across loop passes. `!{{...}}` is ZeroFrame batch syntax: one command per line, with optional parenthetical escaping on each line; it dispatches them sequentially through internal `!{&batch ID}` messages.

## Permissions, APIs, and diagnostics

ZeroFrame does not authorize downstream commands. It handles API text, preserves original message context internally, and flattens the original while it redispatches the final command. Its public API is `ZeroFrame.RegisterMetaOp(func, { priority, handles })`. Registration requires a named function or a handle; duplicate registrations by name/first handle are ignored, while state may override priority.

`!0` (or `!0 help`) opens its configuration/help route; configured operation priorities are GM-facing operational state and must be checked live. `{& log}` writes loop history to the API log; repeated identical content more than five passes is treated as a possible infinite loop and released with a warning.

## Escaping and limitations

Tags accept parenthesized forms so they can be nested, e.g. `({& math ...})`. Escape Roll20 query/template punctuation separately (`&#64;`, `&#123;`, `&#124;`, `&#125;`). A tag is not automatically safe inside another parser: use the target module's quote/escape rules. The registry's exact ordering statement is authoritative for install order, but equal-priority runtime ordering and third-party registrations are live-only checks.
