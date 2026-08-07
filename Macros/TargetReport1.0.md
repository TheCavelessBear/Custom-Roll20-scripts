# TargetReport command reference

Active source: `Scripts/TargetReport1.0.js`.  
Complexity: simple command script.  
Audience: player-usable; GMs may inspect any valid token. Players may inspect only object-layer tokens on their current player page.  
Selection: not read. One explicit target token ID is required.

```text
!targetreport TOKEN_ID
!tr TOKEN_ID
```

The prefixes are aliases. Supported substitutions:

```text
!targetreport @{selected|token_id}
!targetreport @{target|Target|token_id}
!tr TOKEN_ID
```

The command itself does not operate on selected tokens and does not accept multiple IDs. It whispers a qualitative report for enemy quality, armor, health, AE-owned conditions, and AE-owned effects. Hidden token names remain `Target` for players.

Dependencies: Bar 1/Bar 4 are preferred for HP/AC; represented-character fallbacks use Beacon `hp`, `hp_max`, `ac`, `npc_ac`, and `npc_challenge`; ActionEconomyV2API supplies condition/effect status. Missing dependencies degrade fields to `Unknown` or `Unavailable`.

Live verification: player-page access, PC/NPC Beacon values, and ActionEconomyV2 version compatibility.
