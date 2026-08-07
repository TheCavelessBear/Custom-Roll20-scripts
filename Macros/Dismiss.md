# Dismiss command reference

Active source: `Scripts/Dismiss.js`.  
Complexity: simple command script.  
Audience: player-usable; there is no GM or controller check.  
Selection: not read. One explicit token ID is accepted.

## Delete a token

```text
!dismiss TOKEN_ID
```

`TOKEN_ID` is required. If it resolves to a graphic, the graphic is immediately removed; invalid or missing IDs fail silently. There is no confirmation and no undo.

```text
!dismiss @{selected|token_id}
!dismiss @{target|Target|token_id}
!dismiss TOKEN_ID
```

The command itself does not use selection, and it cannot process multiple IDs. The parser uses `startsWith('!dismiss')`; macros should use the exact canonical prefix.

Live verification is recommended before exposing this macro to players because source does not enforce token ownership.
