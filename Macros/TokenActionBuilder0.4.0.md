# TokenActionBuilder command reference

Active source: `Scripts/TokenActionBuilder0.4.0.js`.  
Complexity: high-variance builder command system.  
Audience: player-usable; there is no GM check.  
Selection: menus use the first selected represented token. Build commands use `--token ID` when present, otherwise that selection. They create/update character abilities.

## Menus and generated builders

```text
!tab
!tab menu
!tab help
!tab attack
!tab se
```

`attack` creates/updates hidden builder abilities `TAB-Build-Attack` and `TAB-Build-Attack-Secondary`. `se` creates/updates `TAB-Build-SE-Named`, `TAB-Build-SE-Condition`, `TAB-Build-SE-Damage`, and `TAB-Build-SE-Damage-Condition`. Their buttons gather options and invoke the build routes below.

## Builder grammar

```text
!tab BUILD_COMMAND [--flag VALUE ...]
```

The tokenizer preserves quoted strings. Flags are whitespace-separated `--key value`; a missing value becomes boolean `true`. Unknown flags are ignored by individual builders.

### Attack suite

```text
!tab buildattack --token TOKEN_ID --name NAME --ability ABILITY --prof YESNO
  --atkbonus FORMULA --damage1 DICE --type1 TYPE --mod1 YESNO
  --dmgbonus FORMULA --second YESNO [--damage2 DICE --type2 TYPE --mod2 YESNO]
  --economy MODE --melee YESNO --magic YESNO --attackfx MODE
  --attacksound TRACK --damagecombo YESNO
```

`ABILITY`: `str,dex,con,int,wis,cha` (invalid defaults to Strength reference). Yes values: `yes,true,1,on`; other values are false. `--economy`: `none`, `attack`/`!ae attack`, `action`/`!ae action`, `bonus`/`!ae bonus`, or `spell`/`!ae spell`. `--attackfx`: `none`, `melee`, `arrow`, `throw`. It creates visible attack plus hidden normal/critical damage abilities; crit doubles dice counts, not the separate bonus. Damage combo adds ADR blood/slash FX and `!splay Blood Splatter`.

### SaveEffects actions

```text
!tab buildsenamed --token TOKEN_ID --name NAME --key KEY --dc DC --source YESNO --economy MODE
!tab buildsecondition --token TOKEN_ID --name NAME --condition CONDITION --save SAVE --dc DC --duration DURATION --source YESNO --economy MODE
!tab buildsedamage --token TOKEN_ID --name NAME --save SAVE --dc DC --damage DICE --type TYPE --success half|none --source YESNO --economy MODE
!tab buildsedamagecondition --token TOKEN_ID --name NAME --condition CONDITION --save SAVE --dc DC --damage DICE --type TYPE --success half|none --duration DURATION --source YESNO --economy MODE
```

Named `KEY`: `trip`, `topple`, `poison`, `grapple`, `gutshot`, `holdperson`, `lifedrain`. Saves: `str,dex,con,int,wis,cha`. Condition query keys: `blinded,charmed,deafened,exhaustion,frightened,grappled,incapacitated,invisible,paralyzed,petrified,poisoned,prone,restrained,stunned,unconscious,stinkingpoisoned`. Generated duration choices: `manual,combat,casterNextTurn,targetNextTurn,concentration`. Source is automatically included for `spell` DC, concentration duration, or a named effect that requires it even if `--source` is false.

Target variants for the builder token:

```text
--token @{selected|token_id}
--token @{target|Character Token|token_id}
--token TOKEN_ID
```

The created token actions use `@{selected|...}` and `@{target|Target|token_id}` at execution time and call ADR, SaveEffects, ActionEconomyV2, and SimpleSound. Building itself does not execute an attack or save.

Dependencies: represented character abilities, Beacon modifier names used by generated macros, ADR/SE/AE/SimpleSound command contracts, and ability write permissions. Live verification: ability names/visibility, Roll20 query escaping, generated roll templates, and overwriting same-named abilities.
