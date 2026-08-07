# TokenTriggers command reference

Active source: `Scripts/TokenTriggers1.3.4.js`.  
Complexity: high-variance administrative command system.  
Audience: every direct `!tokentrigger` route is GM-only.  
Targeting: setup/register can use actual selection; configuration routes accept one explicit represented token ID. No route accepts a list of explicit IDs.

## Menus, registration, and registry

```text
!tokentrigger help
!tokentrigger menu
!tokentrigger setup [TOKEN_ID]
!tokentrigger register
!tokentrigger registry
!tokentrigger registry clean
!tokentrigger removechar CHARACTER_ID yes
```

`setup` uses its explicit ID or the first selected represented token. `register` uses every selected represented token, enables HP-0 handling, and uses dead side 2 when available. `removechar` requires a character ID, not a token ID.

## HP-zero configuration

All forms below use one represented `TOKEN_ID`:

```text
!tokentrigger enable TOKEN_ID
!tokentrigger disable TOKEN_ID
!tokentrigger side TOKEN_ID SIDE_NUMBER
!tokentrigger sound TOKEN_ID "EXACT TRACK NAME"
!tokentrigger soundclear TOKEN_ID
!tokentrigger fx TOKEN_ID "FX NAME"
!tokentrigger fxclear TOKEN_ID
!tokentrigger maplayer TOKEN_ID on|off
!tokentrigger autorestore TOKEN_ID on|off
!tokentrigger test TOKEN_ID
!tokentrigger restore TOKEN_ID
!tokentrigger remove TOKEN_ID yes
```

Side must exist on the rollable token. `maplayer` controls background-corpse presentation; `autorestore` controls restoration when HP becomes positive. `test` exercises presentation without requiring an HP transition. `remove` deletes the character registration only with exact `yes`.

## Relentless Endurance

```text
!tokentrigger relentlessenable TOKEN_ID
!tokentrigger relentlessdisable TOKEN_ID
!tokentrigger relentlessreset TOKEN_ID
!tokentrigger relentlessclear TOKEN_ID yes
```

`reset` clears runtime use for the token; `clear` removes stored character configuration and runtime only with confirmation.

## Bloodied threshold system

```text
!tokentrigger bloodiedenable TOKEN_ID
!tokentrigger bloodieddisable TOKEN_ID
!tokentrigger bloodiedlabel TOKEN_ID LABEL...
!tokentrigger bloodiedcommand TOKEN_ID !API_COMMAND...
!tokentrigger bloodiedcommandclear TOKEN_ID
!tokentrigger bloodiedreverse TOKEN_ID !API_COMMAND...
!tokentrigger bloodiedreverseclear TOKEN_ID
!tokentrigger bloodiedside TOKEN_ID SIDE_NUMBER
!tokentrigger bloodiedsideclear TOKEN_ID
!tokentrigger bloodiedfx TOKEN_ID FX NAME...
!tokentrigger bloodiedfxclear TOKEN_ID
!tokentrigger bloodiedsound TOKEN_ID EXACT TRACK NAME...
!tokentrigger bloodiedsoundclear TOKEN_ID
!tokentrigger bloodiedreversible TOKEN_ID on|off
!tokentrigger bloodiedreset TOKEN_ID
!tokentrigger bloodiedclear TOKEN_ID yes
```

Stored command and reverse-command text must begin `!`. `@@token` is replaced by the triggering token ID. `bloodiedreset` reverses an active trigger first only when reversible is on; `bloodiedclear` also needs exact `yes`.

Preset grammar:

```text
!tokentrigger bloodiedpreset TOKEN_ID bloodfrenzy [SIDE] [FX NAME...]
!tokentrigger bloodiedpreset TOKEN_ID bloodfrenzy [SIDE] --fx FX NAME... [--sound TRACK NAME...]
```

`bloodfrenzy` is the only preset. Side `0`/omitted disables side switching. `none` clears FX or sound. It stores `!ae-effect bloodfrenzy @@token`, enables the trigger, labels it Blood Frenzy, disables reversibility, and clears runtime.

Explicit ID variants may use `@{selected|token_id}`, `@{target|Target|token_id}`, or a literal `TOKEN_ID`; these are substitutions into the ID slot and the command itself does not select tokens.

Dependencies: Bar 1 HP transitions; ActionEconomyV2 for friendliness/effects; Jukebox/FX; character and multi-sided token state. ADR and SaveEffects call `TokenTriggersAPI.processBar1Change` explicitly to prevent event-order loss and duplicates. Live verification: linked/unlinked tokens, HP 0, recovery, temp HP, bloodied reversal, turn-order reset, and duplicate native/explicit hooks.
