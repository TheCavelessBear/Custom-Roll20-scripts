# DoorSounds command reference

Active source: `Scripts/DoorSounds1.0.1.js`.  
Complexity: branching administrative command script.  
Audience: GM-only.  
Selection: never used. Commands accept explicit Roll20 door IDs, group keys/names, and exact Jukebox track titles; token IDs are not valid door IDs.

The tokenizer preserves double- or single-quoted arguments. Quote track names and other multiword values.

## Menus and reports

```text
!doorsound
!doorsound menu
!doorsound help
!doorsound groups
!doorsound doors
!doorsound list
!doorsound door DOOR_ID
```

`doors` and `list` are aliases. `door` reports one door's page, assigned group, open/closed state, and secret flag.

## Sound groups

```text
!doorsound group create GROUP
!doorsound group delete GROUP
!doorsound group addopen GROUP "TRACK NAME"
!doorsound group addclose GROUP "TRACK NAME"
!doorsound group removeopen GROUP "TRACK NAME"
!doorsound group removeclose GROUP "TRACK NAME"
!doorsound group clearopen GROUP
!doorsound group clearclose GROUP
```

`create` adds a named group; `delete` also removes all its door assignments. `add*` and `remove*` maintain exact track-title lists. `clear*` empties one event list.

## Door assignment, test, and configuration

```text
!doorsound assign DOOR_ID GROUP
!doorsound remove DOOR_ID
!doorsound test GROUP open
!doorsound test GROUP close
!doorsound config secret on
!doorsound config secret off
```

`assign` and `remove` operate on one door. `test` plays a random configured opening or closing track. `config secret` controls whether secret-door changes make sounds.

Dependencies: Roll20 door objects and exact Jukebox track titles. Door state changes may originate from DoorControl or manual UI actions. PersistentStateManager prunes deleted-door assignments. Live verification: secret-door policy, Jukebox playback, and actual door IDs.

Registry/help reconciliation: the registry lists only the root prefix; the branches above are all active. The parser's `doors`/`list` aliases and `menu`/`help` aliases are confirmed in source.
