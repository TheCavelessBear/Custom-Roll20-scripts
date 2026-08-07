# BeaconAttributeTester command reference

Active source: `Scripts/BeaconAttributeTester1.0.1.js`.  
Complexity: branching diagnostic command script.  
Audience: GM-only.  
Selection: exactly the first actually selected token is used. The command accepts no token ID.

| Purpose | Canonical syntax | Details |
|---|---|---|
| Show help | `!btest help` | No selection required. |
| Read | `!btest read ATTRIBUTE` | Calls asynchronous `getSheetItem` for the selected token's represented character. |
| Snapshot | `!btest snapshot ATTRIBUTE` | Stores the current value for this player/character/attribute comparison workflow. |
| Compare | `!btest compare ATTRIBUTE` | Reads the current value and compares it to the saved snapshot. |
| Write test | `!btest write ATTRIBUTE VALUE --confirm` | Calls `setSheetItem`; exact `--confirm` is required by the write handler. `VALUE` is the joined value text before the confirmation flag. |

Example workflow:

```text
!btest read hp
!btest snapshot hp
!btest write hp 25 --confirm
!btest compare hp
```

Do not add `@{selected|token_id}`: selection is message context, not an argument. The token must represent a valid character. Attribute names are not enumerated by the script; use only names verified in the Beacon attribute reference. PersistentStateManager removes orphaned snapshots.

Live verification is required for Beacon read/write permissions and delayed sheet synchronization.
