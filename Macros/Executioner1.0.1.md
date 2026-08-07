# Executioner command reference

Active source: `Scripts/Executioner1.0.1.js`.  
Complexity: branching command script.  
Audience: player-usable; no GM/controller check is implemented.  
Selection: not read. Every pathway accepts one explicit token ID.

## Set weapon form

```text
!executioner form FORM TOKEN_ID
```

`FORM` is required and case-sensitive: `Warhammer`, `Battleaxe`, or `Spear`. The choice is stored per token.

```text
!executioner form Warhammer @{selected|token_id}
!executioner form Battleaxe @{target|Target|token_id}
!executioner form Spear TOKEN_ID
```

## Show attack buttons

```text
!executioner attack TOKEN_ID
```

The token must represent a character. If no form is stored, `Warhammer` is used. The script whispers the caller and GM buttons for these character abilities:

| Form | Melee ability | Thrown ability |
|---|---|---|
| `Warhammer` | `Hammer-Melee-Attack` | `Hammer-Throw-Attack` |
| `Battleaxe` | `Battleaxe-Melee-Attack` | `Battleaxe-Throw-Attack` |
| `Spear` | `Spear-Melee-Attack` | `Spear-Throw-Attack` |

The command itself does not act on selection; selected/target substitutions only fill its ID slot. Multiple IDs are not supported. PersistentStateManager integration removes orphaned per-token form records.
