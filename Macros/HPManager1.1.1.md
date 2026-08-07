# HPManager command reference

Active source: `Scripts/HPManager1.1.1.js`.  
Complexity: branching command script.  
Audience: player-usable; none of the routes, including `admin`, has a GM check.  
Targeting: explicit-ID routes accept one token. The `selected` route uses Roll20's actual current selection and accepts multiple tokens.

## Menu and direct HP operations

| Purpose | Canonical syntax | Arguments |
|---|---|---|
| Open the menu | `!hp` or `!hp admin` | No selection required. The generated buttons use targeted IDs or current selection. |
| Heal one token | `!hp heal TOKEN_ID AMOUNT [LABEL...]` | `AMOUNT` must be numeric and nonnegative. Default label: `Healing`. |
| Add/subtract HP | `!hp adjust TOKEN_ID AMOUNT [LABEL...]` | Signed numeric `AMOUNT`; result is clamped to 0 and Bar 1 max when max is positive. |
| Set HP | `!hp set TOKEN_ID VALUE [LABEL...]` | `VALUE` is `full`, `0`, or a number; result is clamped. |
| Adjust selected tokens | `!hp selected adjust AMOUNT [LABEL...]` | Uses every actually selected graphic; no token-ID argument. |
| Set selected tokens | `!hp selected set VALUE [LABEL...]` | Uses every actually selected graphic; `VALUE` follows `set`. |
| Drink/administer potion | `!hp potion MODE TYPE TOKEN_ID` | Canonical `MODE`: `action` (maximum healing) or `bonus` (rolled healing). `TYPE`: `healing`, `greater`, `superior`, `supreme`. |
| Lay on Hands | `!hp layonhands TOKEN_ID AMOUNT` | Nonnegative amount. At 5 or more, sends generated `!ae-con remove poisoned TOKEN_ID`. |

Explicit-ID variants:

```text
!hp heal @{selected|token_id} 10 Cure Wounds
!hp adjust @{target|HP Target|token_id} -5 Admin HP
!hp set TOKEN_ID full Long Rest
!hp potion bonus greater @{target|Potion Target|token_id}
```

Actual-selection variants (do not add a token reference):

```text
!hp selected adjust 5 Admin HP
!hp selected set full Long Rest
```

Inline rolls are replaced by their totals. The parser treats any potion mode other than exact `action` as the rolled/non-action branch, but `bonus` is the supported canonical value.

Dependencies: Bar 1 is HP; represented characters are synchronized with `setSheetItem(characterId, 'hp', value)` when available. ActionEconomyV2 is consulted only for friendly/enemy presentation, and Lay on Hands uses AE to remove poison. Healing deliberately does not initiate concentration saves. Unlinked tokens rely on Bar 1.

Live verification: Beacon synchronization, linked versus unlinked tokens, and player exposure of the ungated `admin` menu.
