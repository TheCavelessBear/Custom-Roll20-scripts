# TurnMarker command reference

Active source: `Scripts/TurnMarker1.js`.  
Complexity: branching command script.  
Selection: not used by chat commands. The script operates on the campaign turn order, its marker, or an explicit ping token.

## Player turn controls

```text
!eot
!pot
```

`!eot` advances to the next turn; `!pot` retreats to the previous turn. A GM may always use them. A player succeeds only when the current turn token is controlled by that player (directly or through its represented character).

## Marker and announcement controls

`!tm` and `!turnmarker` are exact aliases.

| Purpose | Syntax | Access/values |
|---|---|---|
| Help | `!tm help` or `!turnmarker help` | GM-only. A bare root also reaches help. |
| Reset round | `!tm reset [ROUND]` | GM-only. Invalid/missing round becomes `0`. |
| Set auto-pull | `!tm autopull MODE` | GM-only. `MODE`: `all`, `npcs`, or `none`. |
| Toggle round announcements | `!tm toggle-announce` | GM-only. |
| Toggle turn announcements | `!tm toggle-announce-turn` | GM-only. |
| Include player in turn announcement | `!tm toggle-announce-player` | GM-only. |
| Toggle hidden-turn skipping | `!tm toggle-skip-hidden` | GM-only. |
| Toggle marker animations | `!tm toggle-animations` | GM-only. |
| Toggle rotation | `!tm toggle-rotate` | GM-only. |
| Toggle Aura 1 pulse | `!tm toggle-aura-1` | GM-only. |
| Toggle Aura 2 pulse | `!tm toggle-aura-2` | GM-only. |
| Ping a token | `!tm ping-target TOKEN_ID` | GM gets a GM ping; a non-GM receives a player ping only when the token has some controller. |

Ping variants:

```text
!tm ping-target @{selected|token_id}
!tm ping-target @{target|Ping Target|token_id}
!tm ping-target TOKEN_ID
```

The command itself does not read selection and accepts one ID. Parser discrepancy: the non-GM ping branch tests whether the token has any controller, not specifically whether the caller controls it; verify live before making this player-facing.

Dependencies: Campaign turn order, initiative page, marker graphic, and GroupInitiative observer integration. Live verification: turn-order transitions, custom `-1` entries, pulls, pings, and animations.
