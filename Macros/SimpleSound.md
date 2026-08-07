# SimpleSound command reference

Active source: `Scripts/SimpleSound.js` (state version `0.2.1`).  
Complexity: simple command script.  
Audience: player-usable; the parser contains no GM check.  
Selection: never used. These commands do not accept token IDs.

## Commands

| Purpose | Canonical syntax | Arguments and behavior |
|---|---|---|
| Play a Jukebox track | `!splay TRACK NAME` | `TRACK NAME` is required and is the exact remaining text after the command. The first exact-title Jukebox match is restarted and played. Inline rolls are replaced by totals. |
| Stop one track | `!sstop TRACK NAME` | The exact remaining text identifies the first exact-title Jukebox match. |
| Stop all playing tracks | `!sstop` | No argument. Stops every currently playing Jukebox track. |
| Toggle GM status whispers | `!swhisper` | No argument. Toggles the global `state.simpleSound.whisper` flag; confirmation is whispered to the GM. |

Examples:

```text
!splay Door - Stone Open
!sstop Door - Stone Open
!sstop
!swhisper
```

Important parser detail: the active source tests whether the command text appears anywhere in an API message, not only at its beginning. Macros should still use the canonical forms above to avoid accidental matches. Track names are not quoted or tokenized; quotes would become part of the title.

Dependencies: Roll20 Jukebox tracks and persistent state. Live verification is required for track visibility and whether players in the campaign can cause the intended Jukebox playback.

Registry/help reconciliation: the registry and header help agree on all three prefixes. The embedded revision comment says `0.2.2`, while `checkInstall()` stores `0.2.1`; this reference records the implemented state version.
