# HandoutAccess command reference

Active source: `Scripts/HandoutAccess1.1.js`.  
Complexity: branching administrative command script.  
Audience: GM-only.  
Selection: not used. No token IDs are accepted.

## Grammar

Options use `--key|value`; values may contain spaces.

```text
!handout ACTION [--OPTION|VALUE ...]
```

## Commands

| Purpose | Canonical syntax | Values |
|---|---|---|
| Reveal/share | `!handout reveal (--name|HANDOUT NAME | --id|HANDOUT_ID) --to|RECIPIENT [--announce|no]` | Alias: `show`. `RECIPIENT` is `all`, a player ID, or exact player display name. |
| Hide/withdraw | `!handout hide (--name|HANDOUT NAME | --id|HANDOUT_ID) --from|RECIPIENT [--announce|no]` | Alias: `withdraw`. Recipient forms match reveal. |
| Show access status | `!handout status (--name|HANDOUT NAME | --id|HANDOUT_ID)` | Reports current journal sharing. |
| Browse handouts | `!handout menu [--filter|FILTER] [--page|NUMBER]` | Alias: `list`. `FILTER`: `hidden`, `shared`, or `all`; default menu behavior is source-defined. |
| Help | `!handout help` | No arguments. |

```text
!handout reveal --name|Expedition Diary --to|all
!handout reveal --id|HANDOUT_ID --to|PLAYER_ID --announce|no
!handout hide --name|Expedition Diary --from|Player Name
!handout menu --filter|shared --page|2
```

The command modifies the handout's player journal access list; it does not edit handout text. For integration context, LootManager calls the JavaScript reveal functions for handout rewards. Live verification: player names/IDs, handout links, archived items, and access propagation.
