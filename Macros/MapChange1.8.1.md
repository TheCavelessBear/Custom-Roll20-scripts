# MapChange command reference

Active source: `Scripts/MapChange1.8.1.js`.  
Complexity: high-variance command system.  
Prefixes: `!mapchange` and `!mc` are aliases.  
Selection: never read. `--token` is always an explicit token ID, not selected-token context.

## Grammar

```text
!mc COMMAND [--parameter value ...]
```

Parameters use whitespace, not `|`. Each `--name` consumes all words until the next `--name`; the parser reconstructs spaces through comma-joining. Map and player names may therefore contain spaces. Blocked players are denied all MapChange routes unless GM.

## Menus and discovery

| Purpose | Syntax | Values/access |
|---|---|---|
| Help | `!mc` or `!mc help [--show TOPIC]` | Topics include `index`, command names, `map`, `api`, `params`, `credits`, `version`. |
| Map/utility menu | `!mc menu [--show FILTER]` | Filters: `all`, `public`, `utilities`/`utils`; GM menu also presents `private`, `archive`, `hidden`. |
| Rebuild map lists | `!mc refresh` | Configuration/setup route. Active parser has no GM check even though UI presents it as a GM utility. |

## Player and bookmark movement

| Purpose | Syntax | Access |
|---|---|---|
| Move caller | `!mc move --target MAP NAME` | Player-usable for public maps; GM may use private/archive/hidden maps. |
| Move named player | `!mc move --target MAP NAME --player PLAYER NAME` | Active parser does not GM-gate this variant; live-restrict its macro exposure. |
| Rejoin caller to bookmark | `!mc rejoin` | Player-usable. |
| Rejoin named player | `!mc rejoin --player PLAYER NAME` | GM, or caller only when the supplied name exactly equals `msg.who`. |
| Rejoin everyone | `!mc rejoinall` | GM-only inside the operation. |
| Move everyone/bookmark | `!mc moveall --target MAP NAME` | GM-only inside the operation. |
| Toggle player block | `!mc block [--player PLAYER NAME]` | GM-only. With no player it targets the sender (normally the GM), so the named form is the useful route. |

## Token-controller movement and return-token workflows

```text
!mc shift --target MAP NAME --token TOKEN_ID [additional generated parameters]
!mc return --target MAP NAME --token TOKEN_ID [additional generated parameters]
!mc movetoken --target MAP NAME --token TOKEN_ID
```

All three are GM-only and accept exactly one explicit token ID. `shift` and `return` are specialized return-token workflows; `movetoken` moves the token's controllers. Supported substitutions where an explicit ID is desired:

```text
--token @{selected|token_id}
--token @{target|Token|token_id}
--token TOKEN_ID
```

The commands themselves do not read selection. Dependencies: Campaign player ribbon/specific pages, named page registries constructed from configured markers, player display names, and SpawnDefaultToken for return-token spawning. Live verification: page classification markers, access policy, multi-controller tokens, and return-token parameters.

Registry/help discrepancies: source confirms `shift`, `return`, and `movetoken` though the main registry summarizes them; `refresh` and `move --player` are not GM-gated by the active parser.
