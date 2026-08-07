# LootManager command reference

Active source: `Scripts/LootManager1.3.1.js`.  
Complexity: high-variance command system.  
Audience: inspection, unlocking, key use, and generated claim buttons are player-usable; configuration and keyring administration are GM-only.  
Selection: `inspect` may use the first selected token. The universal form uses explicit looter and loot IDs. Currency claims may additionally require a selected represented recipient, as directed by the generated card.

## Parser grammar

```text
!loot ACTION [POSITIONAL ...] [--option|value ...]
```

Options begin at whitespace plus `--`; values extend to the next option and may contain spaces. Percent-encoded generated values are decoded.

## Player-facing entry points

| Purpose | Canonical syntax | Target behavior |
|---|---|---|
| Universal loot inspection | `!loot LOOTER_TOKEN_ID TARGET_TOKEN_ID` | Exactly two explicit IDs. Uses the looter for containers, keys, and recipient context. |
| Inspect a source | `!loot inspect [TOKEN_ID]` or `!loot inspect --token|TOKEN_ID` | Alias: `show`. With no ID, uses first selected token. One source only. |
| Lock check | `!loot unlock-check LOOTER_TOKEN_ID CONTAINER_TOKEN_ID` | Both explicit; looter must represent a Beacon character. Rolls `1d20 + sleight_of_hand_bonus` against the container `lock-dc`. |
| Use stored key | `!loot use-key LOOTER_TOKEN_ID CONTAINER_TOKEN_ID --key|KEY NAME` | Normally generated. Requires the represented character to own the exact normalized key required by the container. |
| Help | `!loot help` | No selection required. |

Copy/paste universal forms:

```text
!loot @{selected|token_id} @{target|Loot|token_id}
!loot TOKEN_ID @{target|Loot|token_id}
!loot inspect --token|@{target|Loot Source|token_id}
```

The universal command itself does not operate on selection: `@{selected|token_id}` is substitution into an explicit looter slot. `inspect` without an ID truly reads selection.

## Generated claim language

Inspect cards generate `!loot take` commands. Users should click those buttons rather than construct them; the payload contains concurrency/staleness guards tied to current GM Notes.

| Type | Generated option structure |
|---|---|
| Item | `--token|ID --type|item --index|N --name|ENCODED --expected|QTY --quantity|1|QTY` |
| Currency | `--token|ID --type|gp --amount|N --expected|N` plus a generated recipient expectation |
| Handout | `--token|ID --type|handout --index|N --source-index|N --name|ENCODED --before|ENCODED --after|ENCODED [--looter|ID]` |
| Key | Same index/source/before/after integrity fields with `--type|key`, plus generated recipient/looter context |
| Loose token | `--token|ID --type|loose --name|ENCODED` |

Supported LOOT payload families are `gp`, `item`, `handout`, `key-item`, and loose unrepresented item tokens. Items are removed/announced but not written to Beacon inventory. Keys are stored by character ID. Handouts require HandoutAccess. Currency writes Beacon `gp`.

## GM configuration

```text
!loot config
!loot config --delete-when-empty|on|off
!loot config --item-sound|TRACK NAME
!loot config --currency-sound|TRACK NAME
```

Toggle synonyms accepted for delete: `on/yes/true/1` and `off/no/false/0`. Use exact value `clear` for either sound to disable it. Multiple configuration options may be combined.

## GM keyring administration

```text
!loot keys [--page|N]
!loot keys --character|CHARACTER_ID
!loot keys grant --character|CHARACTER_ID --key|KEY NAME
!loot keys remove --character|CHARACTER_ID --key|KEY NAME
!loot keys clear-character --character|CHARACTER_ID --confirm|yes [--page|N]
!loot keys prune [--page|N]
!loot keys clear-all --confirm|yes [--page|N]
```

Dependencies/prerequisites: structured `LOOT ... END LOOT` token GM Notes, Beacon `getSheetItem`/`setSheetItem` for skills/currency, HandoutAccess for rewards, Jukebox for sounds, and configured rollable-token container sides. PersistentStateManager prunes deleted-character keyrings. Live verification: concurrent claims, delayed GP readback, handout permission changes, locks, and delete-when-empty.
