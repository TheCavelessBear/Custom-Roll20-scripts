# DoorControl command reference

Active source: `Scripts/DoorControl.js`.  
Complexity: simple command script.  
Audience: GM-only.  
Selection: not used. Commands accept one Roll20 door ID, not a token ID.

```text
!doorctl open DOOR_ID
!doorctl close DOOR_ID
!doorctl toggle DOOR_ID
```

`open`, `close`, and `toggle` are the complete implemented mode set. `DOOR_ID` must resolve through `getObj('door', ...)`. Token substitutions such as `@{selected|token_id}` are not valid door references.

Dependencies: Roll20 door objects. Door state changes are observed by DoorSounds when that script is installed. Live verification is required for door IDs and campaign door permissions.
