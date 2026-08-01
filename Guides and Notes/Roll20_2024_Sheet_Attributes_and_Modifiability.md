# Roll20 D&D 2024 Sheet Attribute Reference and Modifiability

## Scope

This document accounts for all 315 attributes exposed in the Attributes tab of the Roll20 D&D 2024 character sheet.

The descriptions, Attributes-tab editability, and field types were transcribed from the sheet interface. Beacon/API write status and known behavior are based on direct testing described below.

## Important Value Layers

The 2024 Beacon sheet can expose different values through three separate surfaces:

1. **Attributes tab and `@{selected|attribute}` substitutions:** these may expose backing, compatibility, override, or incomplete intermediate values.
2. **`getSheetItem(characterId, attribute)`:** this often returns a Beacon-computed value, but it may still omit equipment or feature modifiers.
3. **Styled character sheet:** this can display a final effective value after calculations, equipment, overrides, and other modifiers.

A matching attribute name does not guarantee that all three surfaces return the same value.

## Modifiability Legend

- **Attributes-tab editable — Yes:** the row showed an edit/pencil control.
- **Attributes-tab editable — No:** the row showed a lock control.
- **Confirmed writable:** `setSheetItem()` successfully changed the value and updated the styled sheet during testing.
- **Confirmed not writable:** the attempted `setSheetItem()` write did not change the value.
- **Untested:** no direct Beacon write test has been completed.

A locked Attributes-tab field may still be writable through `setSheetItem()`. An editable Attributes-tab field may be an override or compatibility field rather than the final computed statistic.

## Field-Type Notes

- **Number:** an ordinary numeric value, including negative values.
- **Signed number:** a numeric value stored with an explicit leading sign, such as `+2`.
- **Binary number:** a numeric flag using values such as `0` and `1`.
- **Coded number:** a number representing a category or proficiency state rather than a direct mathematical quantity.
- **Text:** words or freeform text.
- **Text list:** text containing one or more entries in a defined display format.
- **Boolean-style checkbox value:** an editable `0`/`1` value representing an unchecked or checked state.
- **Ratio:** a paired current/maximum value such as `7/7` or `70/70`.
- **Formula/text token:** a text value containing a Roll20 expression or token, such as `@{d20}`.
- **Number or fraction:** a numeric field that may contain an integer or fractional value, such as an NPC Challenge Rating.
- **Dice formula/text:** a formula-like text value such as an NPC hit-point expression.
- **Text or formula:** a value that may contain text or a formula-like expression.
- **Text category:** a constrained text value selected from named categories.
- **Text code:** a short textual identifier used internally by the sheet.
- **Text command:** a command fragment or control string.
- **Decimal number:** a numeric value that may include decimal places.
- **Parameterized repeating reference:** a legacy repeating-section accessor that requires an index, ID, or shortID plus a requested subattribute.

## Attributes

| Attribute | Description | Attributes-tab editable | Field type | Beacon/API write status | Known behavior |
|---|---|---:|---|---|---|
| `ac` | — | Yes | Number | Confirmed writable | `getSheetItem()` returned the AC displayed on the styled sheet. The Attributes-tab value could omit the Dexterity contribution. `setSheetItem()` updated AC and the styled sheet accurately in testing. |
| `acrobatics_bonus` | The total bonus to Acrobatics checks | No | Number | Untested | For proficient PC skills, `getSheetItem()` returned the computed total including proficiency. The Attributes tab and `@{selected\|...}` could omit proficiency unless the Proficiency Bonus Override was manually set. NPC behavior and API write behavior remain untested. |
| `acrobatics_bonuswithoperand` | The total bonus to Acrobatics checks, with its preceding operand | No | Signed number | Untested |  |
| `acrobatics_flat` | The custom bonus to Acrobatics checks | No | Number | Untested |  |
| `acrobatics_prof` | Whether or not the character is proficient in Acrobatics. (no = 0; yes = 1) | No | Binary number | Untested |  |
| `acrobatics_type` | What type of proficiency the character has in Acrobatics. (1 = Untrained, Half, Proficient; 2 = Expertise) | No | Coded number | Untested |  |
| `age` | Age of character | Yes | Text | Untested |  |
| `alignment` | Alignment of character | Yes | Text | Untested |  |
| `animal_handling_bonus` | The total bonus to Animal Handling checks | No | Number | Untested | For proficient PC skills, `getSheetItem()` returned the computed total including proficiency. The Attributes tab and `@{selected\|...}` could omit proficiency unless the Proficiency Bonus Override was manually set. NPC behavior and API write behavior remain untested. |
| `animal_handling_bonuswithoperand` | The total bonus to Animal Handling checks, with its preceding operand | No | Signed number | Untested |  |
| `animal_handling_flat` | The custom bonus to Animal Handling checks | No | Number | Untested |  |
| `animal_handling_prof` | Whether or not the character is proficient in Animal Handling. (no = 0; yes = 1) | No | Binary number | Untested |  |
| `animal_handling_type` | What type of proficiency the character has in Animal Handling. (1 = Untrained, Half, Proficient; 2 = Expertise) | No | Coded number | Untested |  |
| `arcana_bonus` | The total bonus to Arcana checks | No | Number | Untested | For proficient PC skills, `getSheetItem()` returned the computed total including proficiency. The Attributes tab and `@{selected\|...}` could omit proficiency unless the Proficiency Bonus Override was manually set. NPC behavior and API write behavior remain untested. |
| `arcana_bonuswithoperand` | The total bonus to Arcana checks, with its preceding operand | No | Signed number | Untested |  |
| `arcana_flat` | The custom bonus to Arcana checks | No | Number | Untested |  |
| `arcana_prof` | Whether or not the character is proficient in Arcana. (no = 0; yes = 1) | No | Binary number | Untested |  |
| `arcana_type` | What type of proficiency the character has in Arcana. (1 = Untrained, Half, Proficient; 2 = Expertise) | No | Coded number | Untested |  |
| `athletics_bonus` | The total bonus to Athletics checks | No | Number | Untested | For proficient PC skills, `getSheetItem()` returned the computed total including proficiency. The Attributes tab and `@{selected\|...}` could omit proficiency unless the Proficiency Bonus Override was manually set. NPC behavior and API write behavior remain untested. |
| `athletics_bonuswithoperand` | The total bonus to Athletics checks, with its preceding operand | No | Signed number | Untested |  |
| `athletics_flat` | The custom bonus to Athletics checks | No | Number | Untested |  |
| `athletics_prof` | Whether or not the character is proficient in Athletics. (no = 0; yes = 1) | No | Binary number | Untested |  |
| `athletics_type` | What type of proficiency the character has in Athletics. (1 = Untrained, Half, Proficient; 2 = Expertise) | No | Coded number | Untested |  |
| `background` | Background of character | No | Text | Untested |  |
| `base_level` | The level for the character's first chosen class | No | Number | Untested |  |
| `bonds` | Bonds of character | No | Text | Untested |  |
| `character_appearance` | Appearance of character | No | Text | Untested |  |
| `character_backstory` | Backstory of character | No | Text | Untested |  |
| `character_name` | Name of character | No | Text | Untested |  |
| `charisma` | — | Yes | Number | Untested |  |
| `charisma_base` | — | No | Number | Untested |  |
| `charisma_bonus` | — | No | Number | Untested |  |
| `charisma_mod` | — | No | Number | Untested |  |
| `charisma_save_bonus` | — | No | Number | Untested | For proficient PC saves, `getSheetItem()` returned the computed total including proficiency. The Attributes tab and `@{selected\|...}` could omit proficiency unless the Proficiency Bonus Override was manually set. NPC behavior and API write behavior remain untested. |
| `charisma_save_mod` | — | No | Number | Untested |  |
| `charisma_save_prof` | — | No | Binary number | Untested |  |
| `class` | The class name for the character's first chosen class | No | Text | Untested |  |
| `class_display` | The character’s classes, as a comma separated list of "[ClassName] [level]" | No | Text list | Untested |  |
| `constitution` | — | Yes | Number | Untested |  |
| `constitution_base` | — | No | Number | Untested |  |
| `constitution_bonus` | — | No | Number | Untested |  |
| `constitution_mod` | — | No | Number | Untested |  |
| `constitution_save_bonus` | — | No | Number | Untested | For proficient PC saves, `getSheetItem()` returned the computed total including proficiency. The Attributes tab and `@{selected\|...}` could omit proficiency unless the Proficiency Bonus Override was manually set. NPC behavior and API write behavior remain untested. |
| `constitution_save_mod` | — | No | Number | Untested |  |
| `constitution_save_prof` | — | No | Binary number | Untested |  |
| `cp` | The total amount of copper currency in your possession. | Yes | Number | Untested |  |
| `cust_classname` | The first custom class name. This will consider changed compendium-classes, or entirely custom classes. | No | Text | Untested |  |
| `death_save_bonus` | — | No | Number | Untested |  |
| `deathsave_fail1` | Whether the character has failed their 1st death save | Yes | Boolean-style checkbox value | Untested |  |
| `deathsave_fail2` | Whether the character has failed their 2nd death save | Yes | Boolean-style checkbox value | Untested |  |
| `deathsave_fail3` | Whether the character has failed their 3rd death save | Yes | Boolean-style checkbox value | Untested |  |
| `deathsave_succ1` | Whether the character has succeeded their 1st death save | Yes | Boolean-style checkbox value | Untested |  |
| `deathsave_succ2` | Whether the character has succeeded their 2nd death save | Yes | Boolean-style checkbox value | Untested |  |
| `deathsave_succ3` | Whether the character has succeeded their 3rd death save | Yes | Boolean-style checkbox value | Untested |  |
| `deception_bonus` | The total bonus to Deception checks | No | Number | Untested | For proficient PC skills, `getSheetItem()` returned the computed total including proficiency. The Attributes tab and `@{selected\|...}` could omit proficiency unless the Proficiency Bonus Override was manually set. NPC behavior and API write behavior remain untested. |
| `deception_bonuswithoperand` | The total bonus to Deception checks, with its preceding operand | No | Signed number | Untested |  |
| `deception_flat` | The custom bonus to Deception checks | No | Number | Untested |  |
| `deception_prof` | Whether or not the character is proficient in Deception. (no = 0; yes = 1) | No | Binary number | Untested |  |
| `deception_type` | What type of proficiency the character has in Deception. (1 = Untrained, Half, Proficient; 2 = Expertise) | No | Coded number | Untested |  |
| `dexterity` | — | Yes | Number | Untested |  |
| `dexterity_base` | — | No | Number | Untested |  |
| `dexterity_bonus` | — | No | Number | Untested |  |
| `dexterity_mod` | — | No | Number | Untested |  |
| `dexterity_save_bonus` | — | No | Number | Untested | For proficient PC saves, `getSheetItem()` returned the computed total including proficiency. The Attributes tab and `@{selected\|...}` could omit proficiency unless the Proficiency Bonus Override was manually set. NPC behavior and API write behavior remain untested. |
| `dexterity_save_mod` | — | No | Number | Untested |  |
| `dexterity_save_prof` | — | No | Binary number | Untested |  |
| `ep` | The total amount of electrum currency in your possession. | Yes | Number | Untested |  |
| `experience` | The current experience points a character has. | Yes | Number | Untested |  |
| `eyes` | Eye color of character | Yes | Text | Untested |  |
| `faith` | Faith of character | Yes | Text | Untested |  |
| `flaws` | Flaws of character | No | Text | Untested |  |
| `gender` | Gender of character | Yes | Text | Untested |  |
| `globalsavingthrowbonus` | — | No | Number | Untested |  |
| `gp` | The total amount of gold currency in your possession. | Yes | Number | Untested |  |
| `hair` | Hair color of character | Yes | Text | Untested |  |
| `height` | Height of character | Yes | Text | Untested |  |
| `history_bonus` | The total bonus to History checks | No | Number | Untested | For proficient PC skills, `getSheetItem()` returned the computed total including proficiency. The Attributes tab and `@{selected\|...}` could omit proficiency unless the Proficiency Bonus Override was manually set. NPC behavior and API write behavior remain untested. |
| `history_bonuswithoperand` | The total bonus to History checks, with its preceding operand | No | Signed number | Untested |  |
| `history_flat` | The custom bonus to History checks | No | Number | Untested |  |
| `history_prof` | Whether or not the character is proficient in History. (no = 0; yes = 1) | No | Binary number | Untested |  |
| `history_type` | What type of proficiency the character has in History. (1 = Untrained, Half, Proficient; 2 = Expertise) | No | Coded number | Untested |  |
| `hit_dice` | The current number of unused hit dice | Yes | Ratio | Untested |  |
| `hit_dice_max` | The total number of hit dice | No | Number | Untested |  |
| `hit_dice_rolled` | The total number of used hit dice | No | Number | Untested |  |
| `hp` | Current and Maximum HP for this character. | Yes | Ratio | Confirmed writable | Despite appearing as a current/maximum ratio in the Attributes tab, `getSheetItem()` read current HP correctly and `setSheetItem()` updated current HP and the styled sheet accurately. |
| `hp_max` | The total HP this character has (excluding temporary HP) | Yes | Number | Confirmed writable | `getSheetItem()` read maximum HP correctly and `setSheetItem()` updated maximum HP and the styled sheet accurately. |
| `hp_temp` | The amount of temporary HP | Yes | Number | Confirmed writable | `getSheetItem()` read temporary HP correctly and `setSheetItem()` updated temporary HP and the styled sheet accurately. |
| `ideals` | Ideals of character | No | Text | Untested |  |
| `init_tiebreaker` | — | No | Number | Untested |  |
| `initiative_bonus` | — | No | Number | Untested |  |
| `initiative_style` | — | No | Formula/text token | Untested |  |
| `insight_bonus` | The total bonus to Insight checks | No | Number | Untested | For proficient PC skills, `getSheetItem()` returned the computed total including proficiency. The Attributes tab and `@{selected\|...}` could omit proficiency unless the Proficiency Bonus Override was manually set. NPC behavior and API write behavior remain untested. |
| `insight_bonuswithoperand` | The total bonus to Insight checks, with its preceding operand | No | Signed number | Untested |  |
| `insight_flat` | The custom bonus to Insight checks | No | Number | Untested |  |
| `insight_prof` | Whether or not the character is proficient in Insight. (no = 0; yes = 1) | No | Binary number | Untested |  |
| `insight_type` | What type of proficiency the character has in Insight. (1 = Untrained, Half, Proficient; 2 = Expertise) | No | Coded number | Untested |  |
| `inspiration` | Whether the character has inspiration or not | Yes | Boolean-style checkbox value | Untested |  |
| `intelligence` | — | Yes | Number | Untested |  |
| `intelligence_base` | — | No | Number | Untested |  |
| `intelligence_bonus` | — | No | Number | Untested |  |
| `intelligence_mod` | — | No | Number | Untested |  |
| `intelligence_save_bonus` | — | No | Number | Untested | For proficient PC saves, `getSheetItem()` returned the computed total including proficiency. The Attributes tab and `@{selected\|...}` could omit proficiency unless the Proficiency Bonus Override was manually set. NPC behavior and API write behavior remain untested. |
| `intelligence_save_mod` | — | No | Number | Untested |  |
| `intelligence_save_prof` | — | No | Binary number | Untested |  |
| `intimidation_bonus` | The total bonus to Intimidation checks | No | Number | Untested | For proficient PC skills, `getSheetItem()` returned the computed total including proficiency. The Attributes tab and `@{selected\|...}` could omit proficiency unless the Proficiency Bonus Override was manually set. NPC behavior and API write behavior remain untested. |
| `intimidation_bonuswithoperand` | The total bonus to Intimidation checks, with its preceding operand | No | Signed number | Untested |  |
| `intimidation_flat` | The custom bonus to Intimidation checks | No | Number | Untested |  |
| `intimidation_prof` | Whether or not the character is proficient in Intimidation. (no = 0; yes = 1) | No | Binary number | Untested |  |
| `intimidation_type` | What type of proficiency the character has in Intimidation. (1 = Untrained, Half, Proficient; 2 = Expertise) | No | Coded number | Untested |  |
| `investigation_bonus` | The total bonus to Investigation checks | No | Number | Untested | For proficient PC skills, `getSheetItem()` returned the computed total including proficiency. The Attributes tab and `@{selected\|...}` could omit proficiency unless the Proficiency Bonus Override was manually set. NPC behavior and API write behavior remain untested. |
| `investigation_bonuswithoperand` | The total bonus to Investigation checks, with its preceding operand | No | Signed number | Untested |  |
| `investigation_flat` | The custom bonus to Investigation checks | No | Number | Untested |  |
| `investigation_prof` | Whether or not the character is proficient in Investigation. (no = 0; yes = 1) | No | Binary number | Untested |  |
| `investigation_type` | What type of proficiency the character has in Investigation. (1 = Untrained, Half, Proficient; 2 = Expertise) | No | Coded number | Untested |  |
| `level` | The character's total level | No | Number | Untested |  |
| `lvl1_slots_expended` | The count of spell slots that have been used for 1st level spells | Yes | Number | Untested |  |
| `lvl1_slots_total` | The total amount of spell slots for 1st level spells | Yes | Number | Untested |  |
| `lvl2_slots_expended` | The count of spell slots that have been used for 2nd level spells | Yes | Number | Untested |  |
| `lvl2_slots_total` | The total amount of spell slots for 2nd level spells | Yes | Number | Untested |  |
| `lvl3_slots_expended` | The count of spell slots that have been used for 3rd level spells | Yes | Number | Untested |  |
| `lvl3_slots_total` | The total amount of spell slots for 3rd level spells | Yes | Number | Untested |  |
| `lvl4_slots_expended` | The count of spell slots that have been used for 4th level spells | Yes | Number | Untested |  |
| `lvl4_slots_total` | The total amount of spell slots for 4th level spells | Yes | Number | Untested |  |
| `lvl5_slots_expended` | The count of spell slots that have been used for 5th level spells | Yes | Number | Untested |  |
| `lvl5_slots_total` | The total amount of spell slots for 5th level spells | Yes | Number | Untested |  |
| `lvl6_slots_expended` | The count of spell slots that have been used for 6th level spells | Yes | Number | Untested |  |
| `lvl6_slots_total` | The total amount of spell slots for 6th level spells | Yes | Number | Untested |  |
| `lvl7_slots_expended` | The count of spell slots that have been used for 7th level spells | Yes | Number | Untested |  |
| `lvl7_slots_total` | The total amount of spell slots for 7th level spells | Yes | Number | Untested |  |
| `lvl8_slots_expended` | The count of spell slots that have been used for 8th level spells | Yes | Number | Untested |  |
| `lvl8_slots_total` | The total amount of spell slots for 8th level spells | Yes | Number | Untested |  |
| `lvl9_slots_expended` | The count of spell slots that have been used for 9th level spells | Yes | Number | Untested |  |
| `lvl9_slots_total` | The total amount of spell slots for 9th level spells | Yes | Number | Untested |  |
| `medicine_bonus` | The total bonus to Medicine checks | No | Number | Untested | For proficient PC skills, `getSheetItem()` returned the computed total including proficiency. The Attributes tab and `@{selected\|...}` could omit proficiency unless the Proficiency Bonus Override was manually set. NPC behavior and API write behavior remain untested. |
| `medicine_bonuswithoperand` | The total bonus to Medicine checks, with its preceding operand | No | Signed number | Untested |  |
| `medicine_flat` | The custom bonus to Medicine checks | No | Number | Untested |  |
| `medicine_prof` | Whether or not the character is proficient in Medicine. (no = 0; yes = 1) | No | Binary number | Untested |  |
| `medicine_type` | What type of proficiency the character has in Medicine. (1 = Untrained, Half, Proficient; 2 = Expertise) | No | Coded number | Untested |  |
| `name` | Name of character | No | Text | Untested |  |
| `nature_bonus` | The total bonus to Nature checks | No | Number | Untested | For proficient PC skills, `getSheetItem()` returned the computed total including proficiency. The Attributes tab and `@{selected\|...}` could omit proficiency unless the Proficiency Bonus Override was manually set. NPC behavior and API write behavior remain untested. |
| `nature_bonuswithoperand` | The total bonus to Nature checks, with its preceding operand | No | Signed number | Untested |  |
| `nature_flat` | The custom bonus to Nature checks | No | Number | Untested |  |
| `nature_prof` | Whether or not the character is proficient in Nature. (no = 0; yes = 1) | No | Binary number | Untested |  |
| `nature_type` | What type of proficiency the character has in Nature. (1 = Untrained, Half, Proficient; 2 = Expertise) | No | Coded number | Untested |  |
| `npc` | Whether or not the character is an NPC | No | Binary number | Untested |  |
| `npc_ac` | The NPC's armor class | No | Number | Untested |  |
| `npc_acrobatics` | The total bonus to Acrobatics checks for an NPC | No | Number | Untested |  |
| `npc_acrobatics_base` | The base bonus to Acrobatics checks for an NPC | No | Number | Untested |  |
| `npc_acrobatics_flag` | Whether or not Acrobatics will show on the npc sheet. (no = 0; yes = 1) | No | Binary number | Untested |  |
| `npc_animal_handling` | The total bonus to Animal Handling checks for an NPC | No | Number | Untested |  |
| `npc_animal_handling_base` | The base bonus to Animal Handling checks for an NPC | No | Number | Untested |  |
| `npc_animal_handling_flag` | Whether or not Animal Handling will show on the npc sheet. (no = 0; yes = 1) | No | Binary number | Untested |  |
| `npc_arcana` | The total bonus to Arcana checks for an NPC | No | Number | Untested |  |
| `npc_arcana_base` | The base bonus to Arcana checks for an NPC | No | Number | Untested |  |
| `npc_arcana_flag` | Whether or not Arcana will show on the npc sheet. (no = 0; yes = 1) | No | Binary number | Untested |  |
| `npc_athletics` | The total bonus to Athletics checks for an NPC | No | Number | Untested |  |
| `npc_athletics_base` | The base bonus to Athletics checks for an NPC | No | Number | Untested |  |
| `npc_athletics_flag` | Whether or not Athletics will show on the npc sheet. (no = 0; yes = 1) | No | Binary number | Untested |  |
| `npc_cha_save` | The total bonus to cha saves for an NPC | No | Number | Untested |  |
| `npc_cha_save_base` | The base bonus to cha saves for an NPC | No | Number | Untested |  |
| `npc_cha_save_flag` | Whether or not cha saves will show on the npc sheet. (no = 0; yes = 1) | No | Binary number | Untested |  |
| `npc_challenge` | The NPC's Challenge Rating | No | Number or fraction | Untested |  |
| `npc_con_save` | The total bonus to con saves for an NPC | No | Number | Untested |  |
| `npc_con_save_base` | The base bonus to con saves for an NPC | No | Number | Untested |  |
| `npc_con_save_flag` | Whether or not con saves will show on the npc sheet. (no = 0; yes = 1) | No | Binary number | Untested |  |
| `npc_condition_immunities` | Comma-separated list of all condition immunities on a sheet. | No | Text list | Untested |  |
| `npc_deception` | The total bonus to Deception checks for an NPC | No | Number | Untested |  |
| `npc_deception_base` | The base bonus to Deception checks for an NPC | No | Number | Untested |  |
| `npc_deception_flag` | Whether or not Deception will show on the npc sheet. (no = 0; yes = 1) | No | Binary number | Untested |  |
| `npc_dex_save` | The total bonus to dex saves for an NPC | No | Number | Untested |  |
| `npc_dex_save_base` | The base bonus to dex saves for an NPC | No | Number | Untested |  |
| `npc_dex_save_flag` | Whether or not dex saves will show on the npc sheet. (no = 0; yes = 1) | No | Binary number | Untested |  |
| `npc_history` | The total bonus to History checks for an NPC | No | Number | Untested |  |
| `npc_history_base` | The base bonus to History checks for an NPC | No | Number | Untested |  |
| `npc_history_flag` | Whether or not History will show on the npc sheet. (no = 0; yes = 1) | No | Binary number | Untested |  |
| `npc_hpformula` | The NPC's HP Formula | No | Dice formula/text | Untested |  |
| `npc_immunities` | Comma-separated list of all non-condition immunities on a sheet. | No | Text list | Untested |  |
| `npc_insight` | The total bonus to Insight checks for an NPC | No | Number | Untested |  |
| `npc_insight_base` | The base bonus to Insight checks for an NPC | No | Number | Untested |  |
| `npc_insight_flag` | Whether or not Insight will show on the npc sheet. (no = 0; yes = 1) | No | Binary number | Untested |  |
| `npc_int_save` | The total bonus to int saves for an NPC | No | Number | Untested |  |
| `npc_int_save_base` | The base bonus to int saves for an NPC | No | Number | Untested |  |
| `npc_int_save_flag` | Whether or not int saves will show on the npc sheet. (no = 0; yes = 1) | No | Binary number | Untested |  |
| `npc_intimidation` | The total bonus to Intimidation checks for an NPC | No | Number | Untested |  |
| `npc_intimidation_base` | The base bonus to Intimidation checks for an NPC | No | Number | Untested |  |
| `npc_intimidation_flag` | Whether or not Intimidation will show on the npc sheet. (no = 0; yes = 1) | No | Binary number | Untested |  |
| `npc_investigation` | The total bonus to Investigation checks for an NPC | No | Number | Untested |  |
| `npc_investigation_base` | The base bonus to Investigation checks for an NPC | No | Number | Untested |  |
| `npc_investigation_flag` | Whether or not Investigation will show on the npc sheet. (no = 0; yes = 1) | No | Binary number | Untested |  |
| `npc_medicine` | The total bonus to Medicine checks for an NPC | No | Number | Untested |  |
| `npc_medicine_base` | The base bonus to Medicine checks for an NPC | No | Number | Untested |  |
| `npc_medicine_flag` | Whether or not Medicine will show on the npc sheet. (no = 0; yes = 1) | No | Binary number | Untested |  |
| `npc_name` | The NPC's Name | No | Text | Untested |  |
| `npc_nature` | The total bonus to Nature checks for an NPC | No | Number | Untested |  |
| `npc_nature_base` | The base bonus to Nature checks for an NPC | No | Number | Untested |  |
| `npc_nature_flag` | Whether or not Nature will show on the npc sheet. (no = 0; yes = 1) | No | Binary number | Untested |  |
| `npc_perception` | The total bonus to Perception checks for an NPC | No | Number | Untested |  |
| `npc_perception_base` | The base bonus to Perception checks for an NPC | No | Number | Untested |  |
| `npc_perception_flag` | Whether or not Perception will show on the npc sheet. (no = 0; yes = 1) | No | Binary number | Untested |  |
| `npc_performance` | The total bonus to Performance checks for an NPC | No | Number | Untested |  |
| `npc_performance_base` | The base bonus to Performance checks for an NPC | No | Number | Untested |  |
| `npc_performance_flag` | Whether or not Performance will show on the npc sheet. (no = 0; yes = 1) | No | Binary number | Untested |  |
| `npc_persuasion` | The total bonus to Persuasion checks for an NPC | No | Number | Untested |  |
| `npc_persuasion_base` | The base bonus to Persuasion checks for an NPC | No | Number | Untested |  |
| `npc_persuasion_flag` | Whether or not Persuasion will show on the npc sheet. (no = 0; yes = 1) | No | Binary number | Untested |  |
| `npc_religion` | The total bonus to Religion checks for an NPC | No | Number | Untested |  |
| `npc_religion_base` | The base bonus to Religion checks for an NPC | No | Number | Untested |  |
| `npc_religion_flag` | Whether or not Religion will show on the npc sheet. (no = 0; yes = 1) | No | Binary number | Untested |  |
| `npc_resistances` | Comma-separated list of all resistances on a sheet. | No | Text list | Untested |  |
| `npc_sleight_of_hand` | The total bonus to Sleight of Hand checks for an NPC | No | Number | Untested |  |
| `npc_sleight_of_hand_base` | The base bonus to Sleight of Hand checks for an NPC | No | Number | Untested |  |
| `npc_sleight_of_hand_flag` | Whether or not Sleight of Hand will show on the npc sheet. (no = 0; yes = 1) | No | Binary number | Untested |  |
| `npc_speed` | Walk speed of this character | Yes | Number | Untested |  |
| `npc_speed_burrow` | Burrow speed of this character | Yes | Number | Untested |  |
| `npc_speed_climb` | Climb speed of this character | Yes | Number | Untested |  |
| `npc_speed_fly` | Fly speed of this character | Yes | Number | Untested |  |
| `npc_speed_swim` | Swim speed of this character | Yes | Number | Untested |  |
| `npc_stealth` | The total bonus to Stealth checks for an NPC | No | Number | Untested |  |
| `npc_stealth_base` | The base bonus to Stealth checks for an NPC | No | Number | Untested |  |
| `npc_stealth_flag` | Whether or not Stealth will show on the npc sheet. (no = 0; yes = 1) | No | Binary number | Untested |  |
| `npc_str_save` | The total bonus to str saves for an NPC | No | Number | Untested |  |
| `npc_str_save_base` | The base bonus to str saves for an NPC | No | Number | Untested |  |
| `npc_str_save_flag` | Whether or not str saves will show on the npc sheet. (no = 0; yes = 1) | No | Binary number | Untested |  |
| `npc_survival` | The total bonus to Survival checks for an NPC | No | Number | Untested |  |
| `npc_survival_base` | The base bonus to Survival checks for an NPC | No | Number | Untested |  |
| `npc_survival_flag` | Whether or not Survival will show on the npc sheet. (no = 0; yes = 1) | No | Binary number | Untested |  |
| `npc_type` | The NPC's Creature Type | No | Text | Untested |  |
| `npc_vulnerabilities` | Comma-separated list of all vulnerabilities on a sheet. | No | Text list | Untested |  |
| `npc_wis_save` | The total bonus to wis saves for an NPC | No | Number | Untested |  |
| `npc_wis_save_base` | The base bonus to wis saves for an NPC | No | Number | Untested |  |
| `npc_wis_save_flag` | Whether or not wis saves will show on the npc sheet. (no = 0; yes = 1) | No | Binary number | Untested |  |
| `npc_xp` | The XP awarded for defeating the NPC | No | Number | Untested |  |
| `passive_wisdom` | — | No | Number | Untested |  |
| `passiveperceptionmod` | — | No | Number | Untested |  |
| `pb` | The character's proficiency bonus | No | Number | Confirmed not writable | Value layers differ. On a level 7 PC, the Attributes tab and `@{selected\|pb}` returned `0`, while `getSheetItem()` returned the correct computed value `3`. On a CR 4 NPC, the Attributes tab returned `2`, while `getSheetItem()` returned `0`. The field could not be written through `setSheetItem()`; the Attributes-tab value changed only through the styled sheet's Proficiency Bonus Override. |
| `pbd_safe` | The character's proficiency dice if using the variant rule (not implemented) | No | Text or formula | Untested |  |
| `perception_bonus` | The total bonus to Perception checks | No | Number | Untested | For proficient PC skills, `getSheetItem()` returned the computed total including proficiency. The Attributes tab and `@{selected\|...}` could omit proficiency unless the Proficiency Bonus Override was manually set. NPC behavior and API write behavior remain untested. |
| `perception_bonuswithoperand` | The total bonus to Perception checks, with its preceding operand | No | Signed number | Untested |  |
| `perception_flat` | The custom bonus to Perception checks | No | Number | Untested |  |
| `perception_prof` | Whether or not the character is proficient in Perception. (no = 0; yes = 1) | No | Binary number | Untested |  |
| `perception_type` | What type of proficiency the character has in Perception. (1 = Untrained, Half, Proficient; 2 = Expertise) | No | Coded number | Untested |  |
| `performance_bonus` | The total bonus to Performance checks | No | Number | Untested | For proficient PC skills, `getSheetItem()` returned the computed total including proficiency. The Attributes tab and `@{selected\|...}` could omit proficiency unless the Proficiency Bonus Override was manually set. NPC behavior and API write behavior remain untested. |
| `performance_bonuswithoperand` | The total bonus to Performance checks, with its preceding operand | No | Signed number | Untested |  |
| `performance_flat` | The custom bonus to Performance checks | No | Number | Untested |  |
| `performance_prof` | Whether or not the character is proficient in Performance. (no = 0; yes = 1) | No | Binary number | Untested |  |
| `performance_type` | What type of proficiency the character has in Performance. (1 = Untrained, Half, Proficient; 2 = Expertise) | No | Coded number | Untested |  |
| `persuasion_bonus` | The total bonus to Persuasion checks | No | Number | Untested | For proficient PC skills, `getSheetItem()` returned the computed total including proficiency. The Attributes tab and `@{selected\|...}` could omit proficiency unless the Proficiency Bonus Override was manually set. NPC behavior and API write behavior remain untested. |
| `persuasion_bonuswithoperand` | The total bonus to Persuasion checks, with its preceding operand | No | Signed number | Untested |  |
| `persuasion_flat` | The custom bonus to Persuasion checks | No | Number | Untested |  |
| `persuasion_prof` | Whether or not the character is proficient in Persuasion. (no = 0; yes = 1) | No | Binary number | Untested |  |
| `persuasion_type` | What type of proficiency the character has in Persuasion. (1 = Untrained, Half, Proficient; 2 = Expertise) | No | Coded number | Untested |  |
| `pp` | The total amount of platinum currency in your possession. | Yes | Number | Untested |  |
| `race` | Race of character | No | Text | Untested | Legacy Race-named compatibility field on the 2024 sheet. Its exact relationship to the styled sheet's Species field remains untested. |
| `race_display` | Race of character | No | Text | Untested | Legacy Race-named compatibility field on the 2024 sheet. Its exact relationship to the styled sheet's Species field remains untested. |
| `religion_bonus` | The total bonus to Religion checks | No | Number | Untested | For proficient PC skills, `getSheetItem()` returned the computed total including proficiency. The Attributes tab and `@{selected\|...}` could omit proficiency unless the Proficiency Bonus Override was manually set. NPC behavior and API write behavior remain untested. |
| `religion_bonuswithoperand` | The total bonus to Religion checks, with its preceding operand | No | Signed number | Untested |  |
| `religion_flat` | The custom bonus to Religion checks | No | Number | Untested |  |
| `religion_prof` | Whether or not the character is proficient in Religion. (no = 0; yes = 1) | No | Binary number | Untested |  |
| `religion_type` | What type of proficiency the character has in Religion. (1 = Untrained, Half, Proficient; 2 = Expertise) | No | Coded number | Untested |  |
| `repeating_attack` | Legacy repeating attack attributes. The first argument passed in must be the attack's position in your list of attacks, and second is the attribute you're requesting. | No | Parameterized repeating reference | Untested | Legacy parameterized repeating-section accessor, not an ordinary single-value attribute. It requires an index, ID, or shortID and a requested subattribute. |
| `repeating_inventory` | Legacy repeating item attributes. The first argument passed in must be the item's position in your inventory, and second is the attribute you're requesting. | No | Parameterized repeating reference | Untested | Legacy parameterized repeating-section accessor, not an ordinary single-value attribute. It requires an index, ID, or shortID and a requested subattribute. |
| `repeating_npcaction` | Legacy repeating NPC action attributes. The first argument passed in must be the action's position in your list of actions or its shortID, and second is the attribute you're requesting. | No | Parameterized repeating reference | Untested | Legacy parameterized repeating-section accessor, not an ordinary single-value attribute. It requires an index, ID, or shortID and a requested subattribute. |
| `repeating_npcaction-l` | Legacy repeating NPC legendary action attributes. The first argument passed in must be the action's position in your list of actions or its shortID, and second is the attribute you're requesting. | No | Parameterized repeating reference | Untested | Legacy parameterized repeating-section accessor, not an ordinary single-value attribute. It requires an index, ID, or shortID and a requested subattribute. |
| `repeating_npcaction-m` | Legacy repeating NPC mythic action attributes. The first argument passed in must be the action's position in your list of actions or its shortID, and second is the attribute you're requesting. | No | Parameterized repeating reference | Untested | Legacy parameterized repeating-section accessor, not an ordinary single-value attribute. It requires an index, ID, or shortID and a requested subattribute. |
| `repeating_npcbonusaction` | Legacy repeating NPC bonus action attributes. The first argument passed in must be the action's position in your list of actions or its shortID, and second is the attribute you're requesting. | No | Parameterized repeating reference | Untested | Legacy parameterized repeating-section accessor, not an ordinary single-value attribute. It requires an index, ID, or shortID and a requested subattribute. |
| `repeating_npcfreeaction` | Legacy repeating NPC free action attributes. The first argument passed in must be the action's position in your list of actions or its shortID, and second is the attribute you're requesting. | No | Parameterized repeating reference | Untested | Legacy parameterized repeating-section accessor, not an ordinary single-value attribute. It requires an index, ID, or shortID and a requested subattribute. |
| `repeating_npcreaction` | Legacy repeating NPC reaction attributes. The first argument passed in must be the action's position in your list of actions or its shortID, and second is the attribute you're requesting. | No | Parameterized repeating reference | Untested | Legacy parameterized repeating-section accessor, not an ordinary single-value attribute. It requires an index, ID, or shortID and a requested subattribute. |
| `repeating_resource` | Legacy repeating resource attributes. The first argument passed in must be the resource's shortID, and second is the attribute you're requesting. | No | Parameterized repeating reference | Untested | Legacy parameterized repeating-section accessor, not an ordinary single-value attribute. It requires an index, ID, or shortID and a requested subattribute. |
| `repeating_spell` | Legacy repeating spell attributes. The first argument passed in must be the spell's position in your list of spells or its ID, and second is the attribute you're requesting. | No | Parameterized repeating reference | Untested | Legacy parameterized repeating-section accessor, not an ordinary single-value attribute. It requires an index, ID, or shortID and a requested subattribute. |
| `size` | Size of character | Yes | Text category | Untested |  |
| `skin` | Skin color of character | Yes | Text | Untested |  |
| `sleight_of_hand_bonus` | The total bonus to Sleight of Hand checks | No | Number | Untested | For proficient PC skills, `getSheetItem()` returned the computed total including proficiency. The Attributes tab and `@{selected\|...}` could omit proficiency unless the Proficiency Bonus Override was manually set. NPC behavior and API write behavior remain untested. |
| `sleight_of_hand_bonuswithoperand` | The total bonus to Sleight of Hand checks, with its preceding operand | No | Signed number | Untested |  |
| `sleight_of_hand_flat` | The custom bonus to Sleight of Hand checks | No | Number | Untested |  |
| `sleight_of_hand_prof` | Whether or not the character is proficient in Sleight of Hand. (no = 0; yes = 1) | No | Binary number | Untested |  |
| `sleight_of_hand_type` | What type of proficiency the character has in Sleight of Hand. (1 = Untrained, Half, Proficient; 2 = Expertise) | No | Coded number | Untested |  |
| `sp` | The total amount of silver currency in your possession. | Yes | Number | Untested |  |
| `speed` | Walk speed of this character | Yes | Number | Confirmed writable | `getSheetItem()` read the styled-sheet speed correctly and `setSheetItem()` updated it accurately. |
| `speed_burrow` | Burrow speed of this character | Yes | Number | Untested |  |
| `speed_climb` | Climb speed of this character | Yes | Number | Untested |  |
| `speed_fly` | Fly speed of this character | Yes | Number | Untested |  |
| `speed_swim` | Swim speed of this character | Yes | Number | Untested |  |
| `spell_attack_bonus` | — | No | Number | Untested | `getSheetItem()` may return the ordinary calculated spell attack bonus without item-derived modifiers that are included on the styled sheet. API write behavior remains untested. |
| `spell_attack_mod` | — | No | Number | Untested | Relationship to final styled-sheet spell attack/DC modifiers remains unverified. Do not assume this is the complete effective value. |
| `spell_dc_mod` | — | No | Number | Untested | Relationship to final styled-sheet spell attack/DC modifiers remains unverified. Do not assume this is the complete effective value. |
| `spell_save_dc` | — | No | Number | Untested | This is not consistently the final effective DC. In testing, the Attributes tab showed `13`, `getSheetItem()` returned the ordinary calculated DC `19`, and the styled sheet showed `21` after a Robe of the Archmagi added +2. Item-derived modifiers were omitted from the `getSheetItem()` result. |
| `spellcasting_ability` | — | No | Text code | Untested |  |
| `stealth_bonus` | The total bonus to Stealth checks | No | Number | Untested | For proficient PC skills, `getSheetItem()` returned the computed total including proficiency. The Attributes tab and `@{selected\|...}` could omit proficiency unless the Proficiency Bonus Override was manually set. NPC behavior and API write behavior remain untested. |
| `stealth_bonuswithoperand` | The total bonus to Stealth checks, with its preceding operand | No | Signed number | Untested |  |
| `stealth_flat` | The custom bonus to Stealth checks | No | Number | Untested |  |
| `stealth_prof` | Whether or not the character is proficient in Stealth. (no = 0; yes = 1) | No | Binary number | Untested |  |
| `stealth_type` | What type of proficiency the character has in Stealth. (1 = Untrained, Half, Proficient; 2 = Expertise) | No | Coded number | Untested |  |
| `strength` | — | Yes | Number | Untested |  |
| `strength_base` | — | No | Number | Untested |  |
| `strength_bonus` | — | No | Number | Untested |  |
| `strength_mod` | — | No | Number | Untested |  |
| `strength_save_bonus` | — | No | Number | Untested | For proficient PC saves, `getSheetItem()` returned the computed total including proficiency. The Attributes tab and `@{selected\|...}` could omit proficiency unless the Proficiency Bonus Override was manually set. NPC behavior and API write behavior remain untested. |
| `strength_save_mod` | — | No | Number | Untested |  |
| `strength_save_prof` | — | No | Binary number | Untested |  |
| `survival_bonus` | The total bonus to Survival checks | No | Number | Untested | For proficient PC skills, `getSheetItem()` returned the computed total including proficiency. The Attributes tab and `@{selected\|...}` could omit proficiency unless the Proficiency Bonus Override was manually set. NPC behavior and API write behavior remain untested. |
| `survival_bonuswithoperand` | The total bonus to Survival checks, with its preceding operand | No | Signed number | Untested |  |
| `survival_flat` | The custom bonus to Survival checks | No | Number | Untested |  |
| `survival_prof` | Whether or not the character is proficient in Survival. (no = 0; yes = 1) | No | Binary number | Untested |  |
| `survival_type` | What type of proficiency the character has in Survival. (1 = Untrained, Half, Proficient; 2 = Expertise) | No | Coded number | Untested |  |
| `weight` | Weight of character | Yes | Text or number | Untested |  |
| `weighttotal` | The total weight of the character's items, rounded to two decimal places. | No | Decimal number | Untested |  |
| `whispertoggle` | The whisper state. "/w gm" if whispering is set, otherwise "" | No | Text command | Untested |  |
| `wisdom` | — | Yes | Number | Untested |  |
| `wisdom_base` | — | No | Number | Untested |  |
| `wisdom_bonus` | — | No | Number | Untested |  |
| `wisdom_mod` | — | No | Number | Untested |  |
| `wisdom_save_bonus` | — | No | Number | Untested | For proficient PC saves, `getSheetItem()` returned the computed total including proficiency. The Attributes tab and `@{selected\|...}` could omit proficiency unless the Proficiency Bonus Override was manually set. NPC behavior and API write behavior remain untested. |
| `wisdom_save_mod` | — | No | Number | Untested |  |
| `wisdom_save_prof` | — | No | Binary number | Untested |  |
| `wtype` | The whisper state. "/w gm" if whispering is set, otherwise "" | No | Text command | Untested |  |


## Review Notes

1. The displayed descriptions for the `_type` skill fields appear internally incomplete: `1` is described as covering Untrained, Half, and Proficient, while `2` means Expertise. The wording is preserved as shown.
2. `hit_dice` and `hp` appear as ratio fields in the Attributes tab, while `hit_dice_max`, `hp_max`, and related fields are separate number values.
3. `npc_hpformula` is classified as **Dice formula/text** because it stores a formula rather than a resolved numeric total.
4. The `repeating_*` entries are legacy parameterized accessors, not ordinary single-value attributes.
5. Except where expressly marked, Beacon/API write behavior remains untested.
