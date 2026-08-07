# ScriptCards command-language reference

Complexity: embedded command/scripting language.

Source authority: active `Scripts/ScriptCards.js` (v3.0.23d). This documents the active interpreter dispatcher and parser, not archived source or a stale help page. ScriptCards is a general card/program engine; owning scripts retain ownership of the mechanics they are invoked to perform.

## Contents

1. [Entrypoints and execution model](#entrypoints-and-execution-model)
2. [Card grammar, escaping, and expansion](#card-grammar-escaping-and-expansion)
3. [All statement families](#all-statement-families)
4. [Variables, rolls, arrays, and hashes](#variables-rolls-arrays-and-hashes)
5. [Flow control](#flow-control)
6. [Functions and object operations](#functions-and-object-operations)
7. [Settings, storage, dependencies, and permissions](#settings-storage-dependencies-and-permissions)
8. [Event and message triggers](#event-and-message-triggers)
9. [Examples and live verification](#examples-and-live-verification)

## Entrypoints and execution model

Accepted card aliases are `!scriptcards`, `!scriptcard`, and `!script`, each followed by a space or directly by `{{`. All invoke the same interpreter:

```text
!scriptcard {{ --#title|Example --+Result|Done }}
```

Active administrative/generated routes are: `!sc-liststoredsettings [group]`, `!sc-reloadtemplates`, `!sc-deletestoredsettings <group>`, `!sc-deleteindividualstoredsetting <group>|<setting>`, `!sc-editstoredsetting <group>|<setting>|<value>`, `!sc-addstoredsetting <group>|<setting>|<value>`, `!sc-purgestoredsettings`, `!sc-purgestachedscripts` (spelling is active source), `!sc-resume <stash>-|-<name;value>...`, and `!sc-reentrant <stash>-|-<label;reentry-value>`. Resume/reentrant commands are internal continuations produced by `--i`; do not hand-author stash IDs.

The interpreter serializes messages through a queue. It preloads selected graphic IDs as `@SC_SelectedTokens` and initializes sender variables such as `&SendingPlayerID`, `&SendingPlayerName`, `&SendingPlayerColor`, `&SendingPlayerSpeakingAs`, `&SendingPlayerIsGM`, their `Original...` counterparts, `&ScriptCards_Version`, and `&SC_VERSION_NUMERIC`.

## Card grammar, escaping, and expansion

The outer card is the first outermost `{{...}}`; newlines and `<br>` are removed. Card statements are delimited by `--` and use:

```text
--<tag>|<content>
```

The tag's first character selects the statement family. Tags and most function modes are case-insensitive unless source explicitly requires a case-sensitive name (library/template names and labels preserve case). `+++LibraryName[;OtherLibrary]+++` at the end of a card injects matching ScriptCards library-handout content before parse; it is a dependency on live handouts and is case-sensitive.

The default parameter delimiter is `;`; `--#parameterdelimiter|X` changes it for later parameterized statements. Escape a literal split pipe in relevant list grammars as `\|`. In Roll20 nested menus use HTML entities (`&#64;`, `&#123;`, `&#125;`, `&#124;`) as required. ScriptCards itself also protects `${...$}` blocks when splitting `--`, and accepts `!{!{` / `!}!}` as protected literal braces.

Expansion is statement-dependent. `&name` resolves a string/array item, `$name` resolves roll content, `@name` addresses arrays, `:table("key")` addresses hash tables, and `[%...%]`/inline formatting are handled by the current replacement path. Disable switches include `disablestringexpansion`, `disablerollvariableexpansion`, `disableparameterexpansion`, `disablevariableexpansion`, `disableattributereplacement`, `disableinlineformatting`, and `disablerollprocessing`. Do not presume a plain Roll20 attribute reference is Beacon-safe: generic ScriptCards object/attribute facilities are not an approved substitute for the Beacon async sheet API.

## All statement families

| Tag | Exact working grammar / capability |
|---|---|
| `--#setting` | Card setting: `--#title|Attack`; all current settings are listed below. |
| `--+label` / `--*label` | Public output / GM-only row: `--+Damage|$dmg.Total`; row prefixes support ScriptCards inline formatting such as `[b]`, `[i]`, `[r]`, `[c]`, `[button]`. |
| `--=var` | Roll variable: `--=attack|1d20 + 5`; parsed roll object is available through `$attack` fields. |
| `--&name` | String/array assignment: `--&name|value`; array element forms use `&array[index]`, `&array[]`, and related active array operations. |
| `--:label` | Defines a jump/subroutine label; label content is not executed as an action. |
| `--^label` | Direct jump to label. |
| `-->label` | Gosub; content is CSV parameters, stored in `@args` and numbered call parameters. |
| `--<` | Return from gosub. |
| `--?condition` | Conditional; content supplies true/false destinations. See flow control. |
| `--cvalue` | Case dispatch: `match:destination|other:destination`; comparisons are case-insensitive exact string matches. |
| `--%counter` / `--%` / `--%!` | Loop begin / next / break. See flow control. |
| `--]` | Ends a conditional block. |
| `--x` | Stops card execution; with `reentrant` it stashes continuation state. |
| `--w` / `--w:command` | `--w|seconds` delays sandbox; `--w:<seconds>:<statement-tag>|content` schedules a fresh `!script` continuation. |
| `--i...` | Information request / continuation. Content is `t;var;prompt||q;var;query` elements; source generates a whisper button and `!sc-resume`. |
| `--d!` / `--dname` / `--d<` | Load CSV data into a queue; pop next into `&name`; `d<` restores original data queue. Empty queue yields `EndOfDataError`. |
| `--hTable("key")` | Set hash key to content; blank content deletes it. |
| `--s...` / `--l...` | Store/load runtime variables or settings in state/character attributes. See storage. |
| `--p...` | Pointer-variable object lookup/set; source accepts object types graphic, text, path, card, character, handout, ability, attribute. |
| `--!` | Object creation/modification/deletion family. See object operations. |
| `--z:graphic:<id>` | Z order: content `tofront` or `toback`. |
| `--vtoken`, `--vbetweentokens`, `--vpoint`, `--vline` | VFX or ping families. See object/VFX operations. |
| `--a` | Plays named Jukebox track. |
| `--e` | Emits emote/chat text using the current card emote settings. |
| `--@api-command` | Sends `!api-command <content>`; leading `_` arguments become `--`. It is the generic cross-script command bridge. |
| `--~result` | Built-in function dispatcher. See functions. |
| `--\\` | Writes content to API console log. |
| `--r...` | Repeating-section parser/query family. See functions. |
| `--/` | Ignored/comment line. |

## Variables, rolls, arrays, and hashes

`--=name|expression` creates a roll variable. Roll output supports `.Total`, `.Base`, `.Text`, and roll-set/detail fields rendered by the active parser; use `$name` for formatted output and `$name.Total` for arithmetic/output values. Dice math accepts `+ - * / % \`, functions `round:`, `pad:`, `min:`, `max:`, and `clamp:` in the active roll parser. Crit/fumble thresholds are the `critd*` and `fumbled*` settings.

`--&name|text` stores a string. Active array grammar is selected by the name form: `name[index]` writes an indexed item, `name[]` appends, and the function `array` modes provide explicit create/read/update/delete/sort/count operations. `--hTable("key")|value` writes a hash record; a blank value deletes it. Read variables with ScriptCards replacement syntax rather than trying to access JavaScript state.

## Flow control

### Labels, gosubs, and destinations

`--:label|` defines a label. `--^label|` jumps. `-->label|a,b,"c,d"` gosubs and makes the parsed CSV arguments available in `@args`; `--<|` returns. Conditions/cases accept the same destination forms:

```text
label                 jump
>label;arg1;arg2      gosub
<                    return
%                    next loop
%!                   break loop
+Row;content          add public output row
*Row;content          add GM-only output row
=roll;formula         set roll variable
&string;text          set string/array variable
[                    begin a conditional block
```

### Conditions and cases

`--?<left>-<operator>-<right>|<true-destination>|<false-destination>` evaluates active comparison operators: `-gt`, `-ge`, `-lt`, `-le`, `-eq`, `-eqi`, `-ne`, `-nei`, `-inc`, `-ninc`, `-csinc`, `-csninc`, `-match`, `-imatch`; combine with `-and` / `-or`. `eqi/nei/inc/ninc` are case-insensitive; `cs*` is case-sensitive; regex operators compile the right side. `--cvalue|case:destination|...` picks the first case-insensitive exact match. `[` / `--]` supports skip-block control; balance blocks.

### Loops

```text
--%i|start;end[;step]       numeric loop (step defaults to 1; never 0)
--%item|foreach;arrayName   foreach array
--%flag|while;condition     loop while true
--%flag|until;condition     loop until true
--%|                         next current loop
--%!|                        break current loop
```

The named loop variable is stored as a string. A loop end with no active loop logs an error. `while`/`until` behavior and condition replacement depend on the source's current card parameter delimiter.

## Functions and object operations

All built-in functions use `--~result|family;mode;...`; parameters use the current delimiter. Function names/modes below are source dispatcher names.

| Family | Modes and exact parameter shape |
|---|---|
| `character` | `runability;<character-or-token-id>;<ability-name>` sends that ability action as the character. |
| `system;date` | `getdatetime`, `gettime`, `getdate`, `getraw`/`gettimestamp`; applies `locale` and `timezone` where applicable. |
| `system` | `playerisgm;<player-id>`, `runaction`/`runability;<character-id>;<ability-name>[;replacement...]`, `readsetting;<name>`, `dumpvariables;rolls|string|array|hash`, `findability;<character-name>;<ability-name>`, `dropoutputlines;all|both|direct|gmonly`. |
| `roll`/`rollvar`/`rollvariable` | `sethilight`/`sethighlight`/`setrollhighlight`/`sethighlightmode`/`sethilightmode;<roll-name>;none|crit|critical|fumble|both`. |
| `repeatingrow` | `copybyindex;<source-character-id>;<destination-character-id>;<section>;<source-index>[;<destination-section>]`; `copybyfieldmatch;<source-character-id>;<destination-character-id>;<section>;<field>;<value>[;<destination-section>]`. |
| `turnorder` | `clear`, `next`/`advance`, `previous`/`rewind`, `getcurrentactor`, `sort[;ascending|up]`, `removetoken;<token-id>`, `removecustom;<custom>`, `findtoken;<token-id>`, `addtoken;<token-id>;<priority>[;<custom>;<formula>]`, `replacetoken;<token-id>;<priority>[;<custom>;<formula>]`, `addcustom;<name>;<priority>[;<formula>;<top|bottom|before:id|after:id|above:id|below:id>]`. |
| Distance | `distance`/`chebyshevdistance`, `euclideandistance`, `manhattandistance`/`taxicabdistance`, `euclideanpixel`, `euclideanlong`; all take `<token-id>;<token-id>` and put numeric result in roll variable. |
| `getselected` | no extra argument; writes `<result>1...`, `<result>Count` string and roll count. |
| `stateitem` | `write|read;rollvariable|stringvariable|array`; persistent state bridge, use cautiously. |
| Math/range | `math`/`round`/`range;min|max|abs|sqrt|squareroot|clamp;...`; returns a roll variable. |
| `attribute` | active attribute-read mode; generic Roll20 attribute lookup, not a Beacon async API guarantee. |
| Strings | `stringfuncs`/`strings`/`string`: `strlength`/`length`, `tolowercase`, `touppercase`, `striphtml`, `striplinefeeds`/`linefeedstobr(s)`, `brtolinefeed(s)`/`brstolinefeed(s)`, `trim`, `onlynumbers`, `nonumbers`, `totitlecase`, `bytes`; plus `split`, `before`, `after`, `left`, `right`, `stripchars`, `substring`, `replace`, `replaceall`, `replaceencoding`. |
| `hashtable`/`hash` | Creates/reads/sets/deletes/queries active hash records; use `--h` for direct keyed write and the function's parser modes for programmatic operations. |
| `array` | Active array creation, element read/write, remove, count, join, and related operations; use matching source mode spelling and current delimiter. |
| `object` | Generic Roll20 object lookup/property workflows; object IDs/properties are live Roll20 dependencies. |

### Exact hash, array, and repeating modes

The following are the active parser spellings; all use `--~result|family;mode;...` (or the `--r` form noted below).

| Family | Exact modes |
|---|---|
| `hash` / `hashtable` | `clear;<table>`; `set;<table>;key==value;...`; `fromobject;<table>;<object-type>;<object-id>`; `fromjson;<table>;<json-fragments...>`; `fromrepeatingsection;<character-id>;<section>;<identifier-field>;<table>`; `fromrepeatingrow;<character-id>;<section>;<section-id>;<table>`; `getjukeboxtracks;<table>`; `getplayerspecificpages;<table>`; `setplayerspecificpages;<table>`. |
| `array` general | `define;<array>;value...`; `add;<array>;value...`; `remove;<array>;value...`; `removeat;<array>;<zero-based-index>`; `replace;<array>;<old>;<new>`; `setatindex;<array>;<zero-based-index>;<new>`; `setindex;<array>;<zero-based-index>`; `getindex;<array>`; `indexof;<array>;<value>`; `getlength`/`getcount;<array>`; `getcurrent`, `getfirst`, `getlast`, `getnext`, `getprevious;<array>`; `sort;<array>[;descending]`; `numericsort;<array>[;descending]`; `stringify;<array>[;separator]`; `fromstring;<array>;<separator>;<text>`. Read modes write `&result` (or `ArrayError`); mutations reset/maintain the array index as source does. |
| `array` sources | `fromrollvar;<array>;<roll-variable>;rolled|kept|dropped`; `fromtable;<array>;<rollable-table-name>`; `fromrollabletable;<array>;<table-name>;avatar|image|name|text|both`; `fromtable;<array>;<table-name>;avatar|image|name|text|both` when five parameters; `fromtableweighted;<array>;<table-name>`; `fromhashtablekeys`/`fromkeys;<array>;<hash-or-table-name>`; `fromcontrolledcharacters;<array>;<player-id>`; `fromplayerlist;<array>`; `fromgmplayerlist;<array>`; `pagedoors;<array>;<page-or-token-id>`; `pagetokens;<array>;<page-or-token-id>[;char|chars|graphic|graphics|npc|npcs|pc|pcs|attr:name=value|attr:name~=value|prop:name=value|prop:name~=value|tprop:name=value|tprop:name~=value ...]`; `selectedtokens;<array>`; `statusmarkers;<array>;<token-id>`; `properties;<array>;<object-id>[;<property-prefix>]`; `fromrepeatingsection`/`fromrepsection;<array>;<character-id>;<section>;<field>`; `fullrepeatingsection`/`fullrepsection;<array>;<character-id>;<section>;<field:field...>;<joiner>`. |
| `--r` repeating cursor | `--rfind|<character-id>;<entry-name>;<section>;<search-text>` (exact) and `--rsearch|...` (fuzzy); `--rfirst|<character-id>;<section>`; `--rbyindex|<character-id>;<section>;<zero-based-index>`; `--rbysectionid|<character-id>;<section>;<section-id>[;1|i]`; `--rnext|`; `--rdump|`. These set/update the interpreter's current repeating-row cursor rather than independently returning a value. |

`pagetokens` filters use the legacy synchronous Roll20 attribute/object APIs in the active source. They are not Beacon-safe sheet reads and must not be used to infer Beacon PC/NPC semantics.

### Object and VFX operations

`--!<type>:...|settings` is powerful and does not add a ScriptCards GM authorization check. These are the exact active `!` submodes (the text after `:` becomes the result variable or target ID as shown):

| Tag | Content grammar / effect |
|---|---|
| `--!oc:<result>` | `<character-name>`; creates character and stores ID in `&result`, else `OBJECT_CREATION_ERROR`. |
| `--!oh:<result>` | `property:value|...`; creates handout and stores ID. `*notes` fields receive inline formatting. |
| `--!ot:<result>` | `property:value|...`; creates graphic token and stores ID. Defaults: `subtype:token`, `layer:objects`, player page, left/top 200, width/height 70. A setting name beginning `t-` loses that prefix. |
| `--!op:<result>` | Alternate graphic creation parser with the same defaults and result behavior. |
| `--!o#:<result>` | `<table-name>[;<show-players true|yes|1>]`; creates rollable table. |
| `--!oe:<result>` | `<table-id>;<item-name>[;<weight>;<avatar-url>]`; creates table item. |
| `--!ob:<result>:<character-id>:<ability-name>[:y]` | Content is ability action; creates ability. `y` sets token action. |
| `--!or:<character-id>:<section>` | `field:current:max|...`; creates one repeating-section row, records `&SC_LAST_CREATED_ROWID`, and uses sheet workers for current values. Escape colons in data as `%3A`. |
| `--!x:<token-id|s|t>` | Removes the graphic. `s` and `t` resolve `sourcetoken`/`targettoken`. |
| `--!h:<handout-id>` | `property:value|...`; updates handout. |
| `--!t:<token-id|s|t>` | `property:value|...`; updates graphic token. `+=`/`-=` are numeric-or-concatenating deltas; `barN_link` resolves an attribute on the represented character; `currentSide` also updates image; `limitmaxbarvalues` may cap bar values. Each setting can notify registered token observers unless `dontnotifyobservers=1`. |
| `--!c:<character-id|s|t>` | `property:value|...`; updates character. Prefix property `c-` or `b-` uses `getSheetItem`/`setSheetItem`; otherwise it is a character property. `defaulttoken:<token-id>` saves that default token. `+=`/`-=` reads the matching property/sheet value first. |
| `--!a:<character-or-token-id|s|t>` | `attribute:value|...`; updates an attribute with sheet worker by default. Prefix `!` creates missing attribute; `repeating_` also permits creation; suffix `^` writes max; prefix `$` disables worker. Notes/gmnotes/bio are explicitly rejected. |
| `--!<object-type>:<object-id>` | Generic `property:value|...` update for a Roll20 object. `imgsrc` is normalized, `night_vision_effect:dimming` becomes `Dimming_0`, booleans accept literal `true`/`false`, and `speakingas` converts `^` to `|`. |

Settings are pipe-separated `property:value` items; quoted values protect spaces and `\|` protects a literal pipe. Generic object writes are not a way to bypass ownership or Beacon rules. In particular, the `!c` `b-`/`c-` path is the active code's explicit asynchronous sheet path; legacy generic attribute operations do not establish Beacon validity.

VFX grammar is: `--vtoken|<token-id> <fx-name|ping> [moveall]`; `--vbetweentokens|<token-id> <token-id> <fx-name>`; `--vpoint|<x> <y> <fx-name|ping> [moveall]`; `--vline|<x1> <y1> <x2> <y2> <fx-name>`. A custom FX name is looked up first; `none` emits nothing. Point/line use `activepage` when set, otherwise player page.

## Settings, storage, dependencies, and permissions

`--#name|value` changes card parameters. Exact aliases: `tablebackgroundcolor→tablebgcolor`, `titlecardbackgroundcolor→titlecardbackground`, `nominmaxhilight→nominmaxhighlight`, `norollhilight→norollhighlight`, `buttonbackgroundcolor→buttonbackground`, `concatentioncharacter→concatenationcharacter`, `reentry→reentrant`.

Current settings include title/card styling (`tableborder`, `tablebgcolor`, `tableborderradius`, `tableshadow`, `title`, `titlecardbackground`, `titlecardgradient`, `titlecardbackgroundimage`, title/subtitle/body/row font/color/background settings), output (`whisper`, `gmoutputtarget`, `hidecard`, `hidetitlecard`, `showfromfornonwhispers`, `outputtagprefix`, `outputcontentprefix`, `overridetemplate`), source/target/emote (`sourcetoken`, `targettoken`, `activepage`, `emote*`), button (`buttonbackground`, `buttonbackgroundimage`, `buttontextcolor`, `buttonbordercolor`, `buttonfontsize`, `buttonfontface`, `buttonpadding`, `buttonwidth`), parser/runtime switches listed above, dice (`rollfontface`, `dicefontcolor`, `dicefontsize`, `critd20/100/10/8/6/4`, `fumbled20/100/10/8/6/4`, `roundup`, `explodingonesandaces`), storage (`storagecharid`, `usersetting0..9`), and execution (`executionlimit`, `functionbenchmarking`, `reentrant`, `deferralcharacter`, `locale`, `timezone`, `beaconsheet`, `hpbar`, `limitmaxbarvalues`, `dontnotifyobservers`). Boolean settings accept true/on/1; number settings currently include the emote token sizes. Unknown settings are retained as parameters rather than rejected.

`--srollvariables|name`, `--sstringvariables|name`, and `--ssettings|name` save state snapshots; matching `--l...` loads them. Character-backed storage uses `--s$prefix|rollNames`, `--s&prefix|stringNames`, `--s@prefix|arrayNames`, `--s:prefix|hashNames`, `--s#prefix|settingNames|allsettings`; matching `--l` forms load. These require `storagecharid` and create/read Roll20 attributes with `SCR_`, `SCS_`, `SCA_`, `SCH_`, and `SCT_` naming.

No general ScriptCards command is source-proven GM-only. That means macro authors must constrain player-visible abilities themselves. `--@` calls a named API command, so it must use only registered command grammar and should prefer a public API when ordering/result correctness matters. The registry identifies ScriptCards as optionally observing `TokenMod.ObserveTokenChange`; it also warns that generic bars and attributes do not transfer ownership of game mechanics.

## Event and message triggers

Triggers are not `!scriptcards` command-line flags. They are reusable ScriptCards programs stored as abilities on a character named exactly `ScriptCards_Triggers`. Trigger registration occurs only at sandbox `ready`, only while `state.ScriptCards.triggersenabled` is true, and only if that character already exists. Each ability action must be a complete ScriptCards invocation containing this placeholder statement:

```text
--/|TRIGGER_REPLACEMENTS
```

When the matching event fires, ScriptCards replaces that statement with generated `--&Variable|value` assignments and submits the resulting card as API chat. Minimal pattern:

```text
!scriptcard {{ --/|TRIGGER_REPLACEMENTS --+Event|Graphic &GraphicNewname changed. }}
```

Create an ability on `ScriptCards_Triggers` whose name is one of the implemented event names:

```text
change:campaign:turnorder
change:campaign:playerpageid
change:attribute:ATTRIBUTE_NAME
change:graphic
change:pin
change:door
change:page
change:character
add:attribute
add:page
add:character
destroy:page
add:graphic
add:pin
destroy:graphic
destroy:pin
add:door
destroy:door
```

The attribute event includes the previous attribute name in the ability name. Change events generate `&<Type>Old<property>` and `&<Type>New<property>` variables for each changed property: for example `&GraphicOldleft` / `&GraphicNewleft`, `&AttributeOldcurrent` / `&AttributeNewcurrent`, or `&DoorOldisOpen` / `&DoorNewisOpen`. Character changes generate both `CharOld...`/`CharNew...` and `CharacterOld...`/`CharacterNew...`, plus `&CharChanged`. Player-page changes generate `&PreviousPageID` and `&NewPageID`. Add events provide `&AttributeAdded`, `&PageAdded`, `&CharAdded`, `&GraphicAdded`, `&Pin`, or `&DoorAdded`; destroy events provide property variables prefixed `PageRemoved`, `GraphicRemoved`, `PinRemoved`, or `DoorRemoved`.

Message triggers use an ability named:

```text
chat:message:MATCH-TEXT
```

Hyphens in `MATCH-TEXT` are converted to spaces before the source performs a substring match against incoming chat content. The generated variables are `&TriggerWho`, `&TriggerPlayerID`, `&TriggerType`, and `&TriggerContent`. Generated trigger cards contain `SC_TRIGGER_GENERATED`, which prevents message-trigger recursion. An advanced trigger can branch on these variables and use `--@` to call another installed API command:

```text
!scriptcard {{ --/|TRIGGER_REPLACEMENTS --?&TriggerType-eq-api|+API Event;&TriggerContent|+Chat Event;&TriggerContent --x| }}
```

Optional TokenMod observation requires an attribute named `listen_to_tokenmod` with current value `1` on `ScriptCards_Triggers`, plus `TokenMod.ObserveTokenChange`. It dispatches the first `change:graphic` ability with `GraphicOld...`/`GraphicNew...` variables for TokenMod-mediated changes. Native Roll20 `change:graphic` dispatches every ability with that name. Trigger character, abilities, state switch, event object properties, and TokenMod availability are all live-campaign prerequisites; no trigger path adds its own GM authorization check.

## Examples and live verification

Minimal card:

```text
!scriptcard {{ --#title|Saving Throw --=save|1d20+3 --+Result|$save.Total }}
```

Control flow and output:

```text
!script {{ --=n|1d4 --?$n.Total-ge-3|+Success;High roll|+Failure;Try again --x| }}
```

Loop and subroutine:

```text
!scriptcard {{ --%i|1;3 --+Count|&i --%| --:done| --x| }}
```

Registered command bridge (use a real installed command and correct selection requirements):

```text
!scriptcard {{ --#sourcetoken|@{selected|token_id} --@token-mod|_set name|"Marked" --+Status|Requested token update. }}
```

Live verification should cover: each entry alias; a normal selected token and no-selection error path; one output, roll, condition, loop, gosub/return, storage, VFX, and API bridge; a repeated run (state/continuation); a token observer route; and a linked versus unlinked token. Test ScriptCards generic object/attribute calls only against sandbox objects: their source parsing does not prove Beacon sheet compatibility, live handout/template availability, player authorization policy, or external API command semantics.
