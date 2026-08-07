# Auras command reference

Active source: `Scripts/Auras.js`.  
Complexity: simple command script.  
Audience: player-usable; there is no GM or controller check.  
Selection: the script does not read `msg.selected`. It accepts exactly one explicit token ID and changes Aura 1.

## Toggle Aura 1

Purpose: toggle one configured aura on one token.

```text
!aura toggle AURA_KEY TOKEN_ID
```

Required arguments:

- `AURA_KEY`: `protection` (radius `10`, color `#f5d76e`) or `wolf` (radius `2`, color `#8fce00`). Values are case-sensitive.
- `TOKEN_ID`: one graphic ID. When enabling, the command sets `aura1_radius`, `aura1_color`, and `showplayers_aura1=true`. If Aura 1 already has any nonzero radius, it clears only the radius.

Supported copy/paste forms:

```text
!aura toggle protection @{selected|token_id}
!aura toggle protection @{target|Target|token_id}
!aura toggle wolf TOKEN_ID
```

The command itself does not act on the current selection; `@{selected|token_id}` is only Roll20 substitution into the explicit ID position. Multiple token IDs are not accepted.

Registry/help reconciliation: the registry lists `!aura`; the active parser implements only the `toggle` pathway and the two keys above.
