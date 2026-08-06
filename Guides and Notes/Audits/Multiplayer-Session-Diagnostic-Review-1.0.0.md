# Multiplayer Session Diagnostic Review 1.0.0

Date: 2026-08-03  
Scope: current active scripts, macros, Beacon reference, architecture registries, and local harness. Archived scripts and older audits were not used as evidence of current behavior.

## Summary

Two confirmed script defects were corrected: ADR contained committed mojibake and inserted external values into Roll20 template fields without escaping them; AE calculated Dark One’s Blessing from cached `base_level` rather than asynchronous Beacon total `level`. Current ADR/SaveEffects-to-TokenTriggers integration is present and covered locally. The query delay, Darksoles save result, and observed LootManager click failure require live evidence before a script change is justified.

| Issue | Classification | Result |
| --- | --- | --- |
| 1. ADR symbols | Confirmed script defect | Fixed in ADR 1.3.2. |
| 2. Roll query delay | Likely macro or client-performance issue | No API-side fix justified. |
| 3. ADR to TokenTriggers | Insufficient evidence of a current defect | Current explicit API path is present; live installation/order test required. |
| 4. Dark One’s Blessing | Confirmed script defect | Fixed in AE 2.8.3. |
| 5. Darksoles Constitution save | Insufficient evidence | Run the exact Beacon diagnostic below. |
| 6. LootManager Sleight of Hand | Insufficient evidence | Current parser path exists; reproduce the exact generated button live. |

## 1. Malformed Symbols in ADR Cards

### Execution path and evidence

`!adr attack` calls `handleAttackRoll`, which obtains AE attack guidance through `ActionEconomyV2API.getAttackRollModifiers` and assembles a default-template card. Damage cards flow through `cacheDefaultTemplateDamageRoll` or `cacheDamageRoll`, then `applyCachedDamage`; AE trait notes, Uncanny Dodge, damage reduction, Fire Shield retaliation, and undo each build additional cards. Current ADR 1.3.1 contained literal `â†’` and `â€”` strings. Active AE also supplied the Fire Shield and Dark One’s Blessing label paths reviewed here.

### Confirmed findings

- The malformed strings were committed source text, not a local-harness rendering transformation.
- ADR inserted token names, cached title/type/labels, and AE-provided notes/reasons directly inside `{{...=...}}` fields. `&`, `{`, `}`, `|`, `@`, `<`, and `>` can therefore alter a template field.
- ADR 1.3.2 uses a private `adrTemplateValue` helper for those component values and retains intentional `<br>` separators outside escaped components.

### Remaining hypotheses and classification

Whether a valid raw card is subsequently mis-rendered by Roll20 is **Requires live verification**. No evidence supports a remaining platform rendering defect from the active source. Classification: **Confirmed script defect**.

### Exact changed block

Prior:

```javascript
'{{Attacker=' + attacker.get('name') + '}} ' +
'{{Target=' + target.get('name') + '}} '
```

Replacement:

```javascript
'{{Attacker=' + adrTemplateValue(attacker.get('name')) + '}} ' +
'{{Target=' + adrTemplateValue(target.get('name')) + '}} '
```

Prior:

```javascript
traitNotes.push(part.amount + ' ' + damageType + ' â†’ ' + modified.amount + ' (' + modified.note + ')');
```

Replacement:

```javascript
traitNotes.push(part.amount + ' ' + damageType + ' → ' + modified.amount + ' (' + modified.note + ')');
```

The same occurrence-specific punctuation correction was applied to ADR’s target slots, Uncanny Dodge, reduction, and Fire Shield labels; dynamic card components use `adrTemplateValue` before composition.

### Tests

Local: attack guidance, standard damage, resistance note, Uncanny Dodge, reduction, Fire Shield retaliation, and names containing apostrophe/ampersand/braces/vertical-bar characters. Expected: captured `sendChat` template strings retain intended punctuation, contain escaped field values, and contain no `â`, `Â`, `ï¿½`, or replacement-character marker.

Live: repeat those cards with actual Roll20 templates, including multi-type damage, immunity, Uncanny Dodge, reduction, Fire Shield, undo, and token names `O'Brien & {A|B}`. Expected: readable punctuation and one intact card per command.

## 2. Delay Before Roll-Type Query

### Execution path and evidence

Token action, sheet ability, or macro text is expanded in the Roll20 client: attribute substitutions, query construction/display/selection, and chat submission happen before the Mod sandbox receives a `chat:message`. Only after the message is submitted can ADR cache or process it and AE provide any API-side card/condition work. The local runtime deliberately does not expand macros, sheet values, queries, or templates.

### Findings and classification

No active API command can be proven to delay browser query display before it receives the submitted chat message. The reported stronger delay on slower clients/full multiplayer sessions is therefore **Likely macro or client-performance issue**, with possible Beacon/Roll20 platform contribution. Sunday congestion is a hypothesis, not a confirmed cause. No macro was changed because no controlled live measurement shows a material macro contribution.

### Required live timing matrix

For each row, record four separate times: click→query appearance; query selection→chat message; chat message→ADR response; ADR response→rendered card.

| Case | Test content | Expected diagnostic value |
| --- | --- | --- |
| Minimal Query | `?{Roll Type?|Normal,Normal|Advantage,Advantage|Disadvantage,Disadvantage}` | isolates browser query cost. |
| Minimal Attack | same query in a basic attack template only | isolates template/roll complexity. |
| Full PC without ADR | temporary copy of affected PC attack with only `!adr attack` removed | distinguishes pre-submit client work from post-submit Mod work. |
| Full PC with ADR | unchanged current attack | measures full workflow. |
| NPC attack | current comparison attack | compares sheet/macro complexity. |

Run each as GM alone and full multiplayer, fast/slow computers, normal Chrome and incognito/clean profile, extensions off, hardware acceleration on/off, off-peak and usual Sunday time. Optional temporary API timestamps may log only `chat:message`, ADR start/end, and AE start/end; they must not be retained and cannot measure click→query time.

## 3. ADR Damage and TokenTriggers

### Execution path and evidence

ADR caches damage, consumes Bar 2 before Bar 1, computes provisional Bar 1, calls `TokenTriggersAPI.processBar1Change(token, oldHp, provisionalHp)`, writes the returned final Bar 1 and Beacon `hp`, and stores `undo.bar1After`. TokenTriggers owns Bloodied, HP-zero, Relentless Endurance, deferred clearing, and explicit/native duplicate suppression. ADR then notifies AE for lethal attack damage. SaveEffects follows the same TokenTriggers API contract for save damage.

### Findings and classification

Current `TokenTriggers1.3.3.js` exposes `TokenTriggersAPI.processBar1Change`; current `AttackDamageResolver1.3.2.js` already calls it. The reported removed-method evidence describes an older state, not the current active files. Local tests exercise temporary-only damage, pass-through damage, Relentless final HP/Beacon/undo, native/manual order, represented/unlinked behavior, and duplicate suppression. Classification: **Insufficient evidence** of a current script or integration defect.

### Required live tests

With current active ADR, TokenTriggers, AE, and SaveEffects installed exactly once: damage only temp HP; damage through temp HP; Bloodied; zero HP; registered PC/ally Relentless; ordinary enemy; linked/unlinked token where supported; repeated damage; undo; Uncanny Dodge; reduction; manual Bar 1 edit; and both possible explicit/native event orders. Expected: one TokenTriggers result per transition and final resolved HP persisted to Bar 1 and Beacon.

## 4. Dark One’s Blessing

### Execution path and evidence

Lethal ADR/SaveEffects damage invokes `ActionEconomyV2API.processDamageResult`; AE runs `processDarkOnesBlessingDeathTrigger`, checks hostile death/dedupe, chooses recorded killer and nearby qualifying holders, calls `applyDarkOnesBlessing`, and applies temp HP through `applyTempHp`. The Beacon reference defines `base_level` as first-class level and `level` as total level; `charisma_mod` is the current modifier.

### Confirmed findings

AE 2.8.2 called synchronous cached `getCharacterLevel(characterId)`, which read `base_level`, and synchronous cached Charisma data. That can use first-class level or an unpopulated cache. AE 2.8.3 awaits `getSheetItem(characterId, 'level')` and `getSheetItem(characterId, 'charisma_mod')`; only an invalid modifier causes an awaited `charisma` fallback. The amount and temp-HP application are awaited through lethal API and native Bar-1 paths.

### Exact changed block

Prior:

```javascript
function getDarkOnesBlessingAmount(token) {
  const characterId = token.get("represents");
  if (!characterId) return 0;
  return getCharacterLevel(characterId) + getCharismaMod(characterId);
}
```

Replacement:

```javascript
async function getDarkOnesBlessingAmount(token) {
  const characterId = token.get("represents");
  if (!characterId || typeof getSheetItem !== "function") return 0;
  try {
    const level = parseInt(await getSheetItem(characterId, "level"), 10);
    let charismaMod = parseInt(await getSheetItem(characterId, "charisma_mod"), 10);
    if (isNaN(charismaMod)) {
      const charisma = parseInt(await getSheetItem(characterId, "charisma"), 10);
      charismaMod = isNaN(charisma) ? 0 : Math.floor((charisma - 10) / 2);
    }
    return Math.max(0, isNaN(level) ? 0 : level) + charismaMod;
  } catch (error) { return 0; }
}
```

Classification: **Confirmed script defect**. No state migration is required.

### Tests

Local: level 7/+4 grants 11; level and modifier updates change the result; -1 modifier; `charisma` fallback; multiclass-total-level semantics through `level`; existing greater temp HP is retained; killer and nearby awards; registered friendly death excluded. Expected: no Promise is used as an amount and `hp_temp` is written only after the resolved amount.

Live: repeat with a level-7/Cha+4 PC, multiclass PC, negative modifier, level/Charisma change, greater existing temp HP, kill, nearby death, and friendly death. Expected: current sheet values determine the amount without a script change.

## 5. Darksoles Constitution Save

### Execution path and evidence

Active AE concentration/repeat-save paths use `constitution_save_bonus`; the Beacon reference records that this field is already a complete computed save bonus for tested proficient PCs. The current review found no confirmed expression adding `pb` to that field. Neither SaveEffects nor a macro was changed.

### Classification and exact live diagnostic

Classification: **Insufficient evidence**. On Darksoles and two controls (one Constitution proficient, one not), use the existing Beacon tester or a temporary GM diagnostic to display:

```text
constitution
constitution_mod
constitution_save_mod
constitution_save_prof
constitution_save_bonus
pb
```

Also record active effects/aura/item/feat/custom bonuses, the exact action clicked, raw roll expression, computed total, and whether it was native Beacon, SaveEffects, AE concentration, or macro. Expected: if `constitution_save_bonus` is used, it is not incremented by `pb` again. A checked proficiency flag that should be off is a sheet configuration correction, not a script patch; a reproducible total-value discrepancy is a Beacon issue until the raw API values prove a script double-add.

## 6. LootManager Sleight of Hand

### Execution path and evidence

The current `LootManager1.3.1.js` registers `!loot`, parses the distinct `unlock-check` action, resolves looter/container IDs, validates the locked LOOT block and access, awaits Beacon `sleight_of_hand_bonus`, rolls `1d20`, compares `lock-dc`, rewrites only `locked:`, applies the open side, plays configured success behavior, and redisplays loot. The key route is separately named `use-key`. The Beacon reference confirms `sleight_of_hand_bonus` as the current total PC skill field.

### Findings and classification

No missing active parser branch, obsolete command name, or confirmed wrong Beacon attribute was found. The local mock now exercises generated `unlock-check` and `use-key` commands, the exact submitted unlock content, looter/container/character resolution, Beacon skill reads, DC/d20 totals, successful `locked: yes`→`no` preservation, open-side mutation, repeated failure/retry, missing token/character/DC errors, and mocked GM-notes/side failures. It confirmed one narrow error-visibility defect: the successful path ignored a false open-side result. LootManager 1.3.1 now tells the clicking player that the lock opened but its image could not change, while preserving the successful unlock; this does not establish the original silent-click cause. It cannot prove Roll20 player-button delivery, live GM-notes permission, sound playback, UI rendering, natural-1/20 special rules, actual page/control permissions, or deletion/change timing after a rendered card. Classification: **Insufficient evidence** for the original observed click failure; **confirmed script defect** for the side-failure visibility path.

Prior successful-side block:

```javascript
setContainerSide(containerToken, persisted.container.openSide, 'open');
```

Replacement:

```javascript
if (!setContainerSide(containerToken, persisted.container.openSide, 'open')) {
    sendError(msg, 'The lock was opened, but the container image could not be changed.');
}
```

### Required instrumentation and 22 live cases

Temporarily capture: generated button command, received `msg.content`, parser action, looter/container IDs, represented character ID, Beacon skill value, parsed DC, d20/total, GM-notes write result, and side result; disable it after diagnosis. After a valid click every failure must visibly answer the player and warn GM for internal/configuration errors.

Run: (1) player valid click, (2) success, (3) failure, (4) natural 1 if special, (5) natural 20 if special, (6) linked PC, (7) linked NPC if allowed, (8) unlinked looter, (9) missing bonus, (10) invalid/missing DC, (11) stale unlocked container, (12) deleted container, (13) deleted looter, (14) changed GM notes, (15) non-GM player, (16) GM, (17) required key present, (18) required key absent, (19) repeated failures, (20) notes write succeeds/side fails, (21) notes write fails, and (22) exact generated button syntax. Expected success changes only `locked: no`, opens the configured side, plays current sound, and reveals loot; failure leaves lock/side/content unchanged and shows looter, total, DC, failure, and retry where currently permitted.

## Installation, Validation, and Compatibility

Install in existing order: `ActionEconomyV2.8.3.js` at slot 22, `AttackDamageResolver1.3.2.js` at slot 29, and `LootManager1.3.1.js` at slot 43. Their untouched replacements are archived as `ActionEconomyV2.8.2.js`, `AttackDamageResolver1.3.1.js`, and `LootManager1.3.js` in `Scripts/Prior Versions/`. Required companions: current `TokenTriggers1.3.3.js`; no SaveEffects, HPManager, macro, or state change is required. LootManager 1.3.1 only adds a visible player notice when an already-successful unlock cannot change its configured token side; it does not establish or resolve the original observed silent-click cause.

The local harness validates raw source/card strings, mocked asynchronous Beacon reads/writes, deterministic event dispatch, and active-load contracts. It does not validate Roll20 browser query latency, macro/attribute expansion, template rendering, sheet-worker scheduling, player permissions, live GM Notes, sounds, FX, or side/UI behavior. Those limitations are the live tests above.
