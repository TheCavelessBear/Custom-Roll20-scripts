Player Token Actions:
GENERAL
Actions
&{template:default} {{name=@{selected|token_name} — Actions}} {{Options=[Dash](~selected|Action-Dash) [Disengage](~selected|Action-Disengage) [Dodge](~selected|Action-Dodge) [Help](~selected|Action-Help) [Hide](~selected|Action-Hide) [Ready](~selected|Action-Ready) [Drink Healing Potion](~selected|Action-Potion-Menu) [Other Action](~selected|Action-Other)}}
Action-Dash
&{template:default} {{name=@{selected|token_name} — Dash}} {{Action=You take the Dash action. For the rest of the current turn, your Speed increases by an amount equal to your Speed after applying any modifiers.}} 
!ae action
!ae-effect dash

Action-Disengage
&{template:default} {{name=@{selected|token_name} — Disengage}} {{Action=You take the Disengage action. Your movement doesn’t provoke Opportunity Attacks for the rest of the current turn.}} 
!ae action
!ae-effect disengage

Action-Dodge
&{template:default} {{name=@{selected|token_name} — Dodge}} {{Action=You take the Dodge action. Until the start of your next turn, attack rolls against you have Disadvantage if you can see the attacker, and you make Dexterity saving throws with Advantage. The benefit ends early if you have the Incapacitated condition or your Speed is 0.}} 
!ae action
!ae-effect dodge

Action-Help
&{template:default} {{name=@{selected|token_name} — Help}} {{Action=You take the Help action to assist another creature. When you help with an ability check, choose a skill or tool proficiency you have and one ally within 5 feet of you who also has that proficiency. That ally has Advantage on the next ability check it makes with that skill or tool before the start of your next turn.}}
!ae action

Action-Hide
&{template:default} {{name=@{selected|token_name} — Action: Hide}} {{Action=You take the Hide action and expose yourself from a hidden position while attempting to remain unnoticed.}} {{Stealth Check=?{Stealth Roll|Normal,[[1d20 + @{selected|stealth_bonus}]]|Advantage,[[2d20kh1 + @{selected|stealth_bonus}]]|Disadvantage,[[2d20kl1 + @{selected|stealth_bonus}]]}}} {{Success?=[Add Hidden](!ae-con hidden @{selected|token_id})}}
!ae action 

Action-Ready
&{template:default} {{name=@{selected|token_name} — Ready}} {{Action=State a trigger and an action. When the trigger occurs before the start of your next turn, you may take the readied action as a Reaction.}}
!ae action

Action-Other

&{template:default} {{name=@{selected|token_name} — Other Action}} {{Action=You take another action not listed in the action menu.}}
!ae action

Bonus-Potion-Menu

?{Drink Potion (Bonus Action)|Potion of Healing,%&#123;selected&#124;Bonus-Potion-Healing&#125;|Potion of Greater Healing,%&#123;selected&#124;Bonus-Potion-Greater-Healing&#125;|Potion of Superior Healing,%&#123;selected&#124;Bonus-Potion-Superior-Healing&#125;|Potion of Supreme Healing,%&#123;selected&#124;Bonus-Potion-Supreme-Healing&#125;}

Action-Potion-Menu

?{Drink Potion (Action)|Potion of Healing,%&#123;selected&#124;Action-Potion-Healing&#125;|Potion of Greater Healing,%&#123;selected&#124;Action-Potion-Greater-Healing&#125;|Potion of Superior Healing,%&#123;selected&#124;Action-Potion-Superior-Healing&#125;|Potion of Supreme Healing,%&#123;selected&#124;Action-Potion-Supreme-Healing&#125;} 

Bonus-Potion-Healing

!hp potion bonus healing @{selected|token_id}
!ae bonus


Bonus-Potion-Greater-Healing

!hp potion bonus greater @{selected|token_id}
!ae bonus

Bonus-Potion-Superior-Healing

!hp potion bonus superior @{selected|token_id}
!ae bonus

Bonus-Potion-Supreme-Healing

!hp potion bonus supreme @{selected|token_id}
!ae bonus

Action-Potion-Healing

!hp potion action healing @{selected|token_id}
!ae action

Action-Potion-Greater-Healing

!hp potion action greater @{selected|token_id}
!ae action

Action-Potion-Superior-Healing

!hp potion action superior @{selected|token_id}
!ae action

Action-Potion-Supreme-Healing

!hp potion action supreme @{selected|token_id}
!ae action

Cleave

&{template:default} {{name=Cleave}} {{Mastery=If you hit a creature with a melee attack using this weapon, you can make a melee attack roll with the weapon against a second creature within 5 feet of the first creature and within your reach. On a hit, the second creature takes the weapon’s damage, but don’t add your ability modifier to that damage unless that modifier is negative. You can make this extra attack only once per turn.}}

Graze

&{template:default} {{name=Graze}} {{Mastery=If your attack roll with this weapon misses a creature, you can deal damage to that creature equal to the ability modifier you used to make the attack roll. This damage is the same type dealt by the weapon, and the damage can be increased only by increasing the ability modifier.}}

Nick

&{template:default} {{name=Nick}} {{Mastery=When you make the extra attack of the Light property, you can make it as part of the Attack action instead of as a Bonus Action. You can make this extra attack only once per turn.}}

Push

&{template:default} {{name=Push}} {{Mastery=If the target is a Large or smaller creature, you can push it 10 feet straight away from you.}} 

!ae push @{target|Push|token_id} 10

Sap

&{template:default} {{name=Sap}} {{Mastery=Until the start of your next turn, the target has Disadvantage on its next attack roll.}}

Slow

&{template:default} {{name=Slow}} {{Mastery=If you hit a creature with this weapon and deal damage to it, you can reduce its Speed by 10 feet until the start of your next turn. If the creature is hit more than once by weapons that have this property, the Speed reduction doesn’t exceed 10 feet.}}

Topple

&{template:default} {{name=Topple}} {{Mastery=If you hit a creature with this weapon, you can force the target to make a Constitution saving throw. On a failed save, the target has the Prone condition.}} {{Save DC=?{Topple DC Ability|Strength,[[8 + @{selected|strength_mod} + @{selected|pb}]]|Dexterity,[[8 + @{selected|dexterity_mod} + @{selected|pb}]]} Constitution}}
!se topple @{target|Topple|token_id} ?{Topple DC Ability|Strength,[[8 + @{selected|strength_mod} + @{selected|pb}]]|Dexterity,[[8 + @{selected|dexterity_mod} + @{selected|pb}]]}

Vex

&{template:default} {{name=Vex}} {{Mastery=If you hit a creature with this weapon and deal damage to it, you have Advantage on your next attack roll against that creature before the end of your next turn.}}

JOHN DARKSOLES
Bonus-Actions
&{template:default} {{name=@{selected|token_name} — Bonus Actions}} {{Options=[Lay on Hands](~selected|Lay-On-Hands) [Transform Executioner](~selected|Executioner-Transform) [Heavenly Wings](~selected|Heavenly-Wings) [Drink Healing Potion](~selected|Bonus-Potion-Menu) [Other Bonus Action](~Bonus-Other)}}

Bonus-Action-Spells
&{template:default}} {{name=@{selected|token_name} — Bonus Action Spells}} {{Options=[Divine Favor](~selected|Divine-Favor) [Healing Word](~selected|Healing-Word) [Shield of Faith](~selected|Shield-of-Faith) [Sanctuary](~selected|Sanctuary) [Lesser Restoration](~selected|Lesser-Restoration)}}
Spells
&{template:default} {{name=@{selected|token_name} — Spells}} {{Cantrips=[Toll the Dead](~selected|Toll-the-Dead) [Sorcerous Burst](~selected|Sorcerous-Burst) [Blade Ward](~selected|Blade-Ward)}} {{Spells=[Cure Wounds](~selected|Cure-Wounds)   [Aid](~selected|Aid-Menu) [Chromatic Orb](~selected|Chromatic-Orb) [Find Steed](~selected|Find-Steed)}}
Executioner-Transform
!executioner form ?{Choose Executioner Form|Warhammer|Battleaxe|Spear} @{selected|token_id}
!ae bonus
Attacks
!executioner attack @{selected|token_id}
Hammer-Melee-Attack
!adr attack @{selected|token_id} @{target|Executioner|token_id}

&{template:atk} {{mod=[Damage](~selected|Hammer-Melee-Damage" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Crit Damage](~selected|Hammer-Melee-Crit-Damage" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Push](~selected|Push" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Sacred Weapon](~selected|Sacred-On" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;)}} {{rname=Executioner Warhammer}} {{charname=@{selected|token_name}}} {{desc=Your attack rolls with this weapon are calculated by rolling a D20 and adding your Charisma Modifier, Proficiency Bonus, and the Magic Weapon Bonus.&#10;Charisma: +@{selected|charisma_mod}&#10;Proficiency: +@{selected|pb}&#10;Item Bonus: +2&#10;&#10;This melee attack benefits from Dueling. On a hit, the Warhammer deals an additional 1d8 Radiant damage.}} ?{Roll Type?|Normal,{{normal=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb} + @{selected|user.sacredatk} + 2]]&#125;&#125;|Advantage,{{advantage=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb} + @{selected|user.sacredatk} + 2]]&#125;&#125; {{r2=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb} + @{selected|user.sacredatk} + 2]]&#125;&#125;|Disadvantage,{{disadvantage=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb} + @{selected|user.sacredatk} + 2]]&#125;&#125; {{r2=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb} + @{selected|user.sacredatk} + 2]]&#125;&#125;}

!ae attack
!token-mod --set currentside|3
/fx glow-smoke @{selected|token_id}
!splay Hammer Swing

Hammer-Melee-Damage

&{template:dmg} {{rname=Executioner Warhammer Melee Damage}} {{damage=1}} {{dmg1flag=1}} {{dmg1=[[1d8 + @{selected|charisma_mod} + 2 + 2]]}} {{dmg1type=Bludgeoning}} {{dmg2flag=1}} {{dmg2=[[1d8]]}} {{dmg2type=Radiant}} {{charname=@{selected|token_name}}} {{desc=[Divine Smite](~selected|Divine-Smite" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Divine Favor](~selected|Divine-Favor-Damage" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;)}}

!adr apply --magic
!adr fx glow-holy 
!adr fx pooling-blood 
!splay Blood Splatter

Hammer-Melee-Crit-Damage

&{template:dmg} {{rname=Executioner Warhammer Melee Critical Damage}} {{damage=1}} {{dmg1flag=1}} {{dmg1=[[1d8 + @{selected|charisma_mod} + 2 + 2 + 8]]}} {{dmg1type=Bludgeoning}} {{dmg2flag=1}} {{dmg2=[[1d8 + 8]]}} {{dmg2type=Radiant}} {{charname=@{selected|token_name}}} {{desc=[Critical Divine Smite](~selected|Divine-Smite-Crit" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Divine Favor](~selected|Divine-Favor-Crit-Damage" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;)}}

!adr apply --magic
!adr fx glow-holy 
!adr fx pooling-blood 
!splay Blood Splatter
Hammer-Throw-Attack
!adr attack @{selected|token_id} @{target|Executioner|token_id}

&{template:atk} {{mod=[Damage](~selected|Hammer-Throw-Damage" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Crit Damage](~selected|Hammer-Throw-Crit-Damage" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Push](~selected|Push" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;)}} {{rname=Executioner Warhammer Throw}} {{charname=@{selected|token_name}}} {{desc=Your thrown attack rolls with this weapon are calculated by rolling a D20 and adding your Charisma Modifier, Proficiency Bonus, and the Magic Weapon Bonus.&#10;Charisma: +@{selected|charisma_mod}&#10;Proficiency: +@{selected|pb}&#10;Item Bonus: +2&#10;&#10;Dueling is not included on this thrown attack. On a hit, the Warhammer deals an additional 1d8 Radiant damage.}} ?{Roll Type?|Normal,{{normal=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb} + @{selected|user.sacredatk} + 2]]&#125;&#125;|Advantage,{{advantage=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb} + @{selected|user.sacredatk} + 2]]&#125;&#125; {{r2=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb} + @{selected|user.sacredatk} + 2]]&#125;&#125;|Disadvantage,{{disadvantage=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb} + @{selected|user.sacredatk} + 2]]&#125;&#125; {{r2=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb} + @{selected|user.sacredatk} + 2]]&#125;&#125;}

!ae attack
!token-mod --set currentside|3
!ae-effect remove sacred @{selected|token_id}
/fx glow-smoke @{selected|token_id}
!splay Hammer Throw

Hammer-Throw-Damage

&{template:dmg} {{rname=Executioner Warhammer Throw Damage}} {{damage=1}} {{dmg1flag=1}} {{dmg1=[[1d8 + @{selected|charisma_mod} + 2]]}} {{dmg1type=Bludgeoning}} {{dmg2flag=1}} {{dmg2=[[1d8]]}} {{dmg2type=Radiant}} {{charname=@{selected|token_name}}} {{desc=[Divine Smite](~selected|Divine-Smite" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Divine Favor](~selected|Divine-Favor-Damage" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;)}}

!adr apply --magic
!adr fx glow-holy 
!adr fx pooling-blood 
!splay Blood Splatter

Hammer-Throw-Crit-Damage

&{template:dmg} {{rname=Executioner Warhammer Throw Critical Damage}} {{damage=1}} {{dmg1flag=1}} {{dmg1=[[1d8 + @{selected|charisma_mod} + 2 + 8]]}} {{dmg1type=Bludgeoning}} {{dmg2flag=1}} {{dmg2=[[1d8 + 8]]}} {{dmg2type=Radiant}} {{charname=@{selected|token_name}}} {{desc=[Critical Divine Smite](~selected|Divine-Smite-Crit" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Divine Favor](~selected|Divine-Favor-Crit-Damage" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;)}}

!adr apply --magic
!adr fx glow-holy 
!adr fx pooling-blood 
!splay Blood Splatter

Battleaxe-Melee-Attack

!adr attack @{selected|token_id} @{target|Executioner|token_id}

&{template:atk} {{mod=[Damage](~selected|Battleaxe-Melee-Damage" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Crit Damage](~selected|Battleaxe-Melee-Crit-Damage" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Topple](~selected|Topple" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Sacred Weapon](~selected|Sacred-On" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;)}} {{rname=Executioner Battleaxe}} {{charname=@{selected|token_name}}} {{desc=Your attack rolls with this weapon are calculated by rolling a D20 and adding your Charisma Modifier, Proficiency Bonus, and the Magic Weapon Bonus.&#10;Charisma: +@{selected|charisma_mod}&#10;Proficiency: +@{selected|pb}&#10;Item Bonus: +2&#10;&#10;This melee attack benefits from Dueling. Once per turn, when you hit a creature with this weapon, you can deal 1d8 Slashing damage to a second creature within 5 feet of the original target.}} ?{Roll Type?|Normal,{{normal=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb} + @{selected|user.sacredatk} + 2]]&#125;&#125;|Advantage,{{advantage=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb} + @{selected|user.sacredatk} + 2]]&#125;&#125; {{r2=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb} + @{selected|user.sacredatk} + 2]]&#125;&#125;|Disadvantage,{{disadvantage=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb} + @{selected|user.sacredatk} + 2]]&#125;&#125; {{r2=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb} + @{selected|user.sacredatk} + 2]]&#125;&#125;}

!ae attack
!token-mod --set currentside|3
/fx glow-smoke @{selected|token_id}
!splay Sword Swing SFX

Battleaxe-Throw-Attack

!adr attack @{selected|token_id} @{target|Executioner|token_id}

&{template:atk} {{mod=[Damage](~selected|Battleaxe-Throw-Damage" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Crit Damage](~selected|Battleaxe-Throw-Crit-Damage" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Topple](~selected|Topple" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;)}} {{rname=Executioner Battleaxe Throw}} {{charname=@{selected|token_name}}} {{desc=Your thrown attack rolls with this weapon are calculated by rolling a D20 and adding your Charisma Modifier, Proficiency Bonus, and the Magic Weapon Bonus.&#10;Charisma: +@{selected|charisma_mod}&#10;Proficiency: +@{selected|pb}&#10;Item Bonus: +2&#10;&#10;Dueling is not included on this thrown attack. Once per turn, when you hit a creature with this weapon, you can deal 1d8 Slashing damage to a second creature within 5 feet of the original target.}} ?{Roll Type?|Normal,{{normal=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb} + @{selected|user.sacredatk} + 2]]&#125;&#125;|Advantage,{{advantage=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb} + @{selected|user.sacredatk} + 2]]&#125;&#125; {{r2=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb} + @{selected|user.sacredatk} + 2]]&#125;&#125;|Disadvantage,{{disadvantage=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb} + @{selected|user.sacredatk} + 2]]&#125;&#125; {{r2=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb} + @{selected|user.sacredatk} + 2]]&#125;&#125;}

!ae attack
!token-mod --set currentside|3
!ae-effect remove sacred @{selected|token_id}
/fx glow-smoke @{selected|token_id}
!splay Sword Swing SFX

Battleaxe-Melee-Damage

&{template:dmg} {{rname=Executioner Battleaxe Melee Damage}} {{damage=1}} {{dmg1flag=1}} {{dmg1=[[1d8 + @{selected|charisma_mod} + 2 + 2]]}} {{dmg1type=Slashing}} {{charname=@{selected|token_name}}} {{desc=[Divine Smite](~selected|Divine-Smite" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Executioner Cleave](~selected|Executioner-Cleave" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Divine Favor](~selected|Divine-Favor-Damage" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;)}}

!adr apply --magic
!adr fx pooling-blood 
!splay Blood Splatter

Battleaxe-Melee-Crit-Damage

&{template:dmg} {{rname=Executioner Battleaxe Melee Critical Damage}} {{damage=1}} {{dmg1flag=1}} {{dmg1=[[1d8 + @{selected|charisma_mod} + 2 + 2 + 8]]}} {{dmg1type=Slashing}} {{charname=@{selected|token_name}}} {{desc=[Critical Divine Smite](~selected|Divine-Smite-Crit" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Executioner Cleave](~selected|Executioner-Cleave" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Divine Favor](~selected|Divine-Favor-Crit-Damage" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;)}}

!adr apply --magic
!adr fx pooling-blood 
!splay Blood Splatter

Battleaxe-Throw-Damage

&{template:dmg} {{rname=Executioner Battleaxe Throw Damage}} {{damage=1}} {{dmg1flag=1}} {{dmg1=[[1d8 + @{selected|charisma_mod} + 2]]}} {{dmg1type=Slashing}} {{charname=@{selected|token_name}}} {{desc=[Divine Smite](~selected|Divine-Smite" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Executioner Cleave](~selected|Executioner-Cleave" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Divine Favor](~selected|Divine-Favor-Damage" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;)}}

!adr apply --magic
!adr fx pooling-blood 
!splay Blood Splatter

Battleaxe-Throw-Crit-Damage

&{template:dmg} {{rname=Executioner Battleaxe Throw Critical Damage}} {{damage=1}} {{dmg1flag=1}} {{dmg1=[[1d8 + @{selected|charisma_mod} + 2 + 8]]}} {{dmg1type=Slashing}} {{charname=@{selected|token_name}}} {{desc=[Critical Divine Smite](~selected|Divine-Smite-Crit" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Executioner Cleave](~selected|Executioner-Cleave" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Divine Favor](~selected|Divine-Favor-Crit-Damage" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;)}}

!adr apply --magic
!adr fx pooling-blood 
!splay Blood Splatter

Executioner-Cleave

&{template:dmg} {{rname=Executioner Cleave}} {{damage=1}} {{dmg1flag=1}} {{dmg1=[[1d8]]}} {{dmg1type=Slashing}} {{desc=Once per turn, when you hit a creature with Executioner in battleaxe form, you can deal this damage to a second creature within 5 feet of the original target.}}

!adr apply @{target|Cleave|token_id} --magic

Spear-Melee-Attack

!adr attack @{selected|token_id} @{target|Executioner|token_id}

&{template:atk} {{mod=[Damage](~selected|Spear-Melee-Damage" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Crit Damage](~selected|Spear-Melee-Crit-Damage" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Halt](~selected|Executioner-Halt" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Sacred Weapon](~selected|Sacred-On" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;)}} {{rname=Executioner Spear}} {{charname=@{selected|token_name}}} {{desc=Your attack rolls with this weapon are calculated by rolling a D20 and adding your Charisma Modifier, Proficiency Bonus, and the Magic Weapon Bonus.&#10;Charisma: +@{selected|charisma_mod}&#10;Proficiency: +@{selected|pb}&#10;Item Bonus: +2&#10;&#10;This melee attack benefits from Dueling. This form has a melee range of 10 feet. Once per turn, when you hit a creature with this weapon, its movement is reduced to 0 until the end of its next turn.}} ?{Roll Type?|Normal,{{normal=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb} + @{selected|user.sacredatk} + 2]]&#125;&#125;|Advantage,{{advantage=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb} + @{selected|user.sacredatk} + 2]]&#125;&#125; {{r2=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb} + @{selected|user.sacredatk} + 2]]&#125;&#125;|Disadvantage,{{disadvantage=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb} + @{selected|user.sacredatk} + 2]]&#125;&#125; {{r2=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb} + @{selected|user.sacredatk} + 2]]&#125;&#125;}

!ae attack
!token-mod --set currentside|3
/fx glow-smoke @{selected|token_id}
!splay Sword Stab SFX

Spear-Throw-Attack

!adr attack @{selected|token_id} @{target|Executioner|token_id}

&{template:atk} {{mod=[Damage](~selected|Spear-Throw-Damage" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Crit Damage](~selected|Spear-Throw-Crit-Damage" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Halt](~selected|Executioner-Halt" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;)}} {{rname=Executioner Spear Throw}} {{charname=@{selected|token_name}}} {{desc=Your thrown attack rolls with this weapon are calculated by rolling a D20 and adding your Charisma Modifier, Proficiency Bonus, and the Magic Weapon Bonus.&#10;Charisma: +@{selected|charisma_mod}&#10;Proficiency: +@{selected|pb}&#10;Item Bonus: +2&#10;&#10;Dueling is not included on this thrown attack. Once per turn, when you hit a creature with this weapon, its movement is reduced to 0 until the end of its next turn.}} ?{Roll Type?|Normal,{{normal=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb} + @{selected|user.sacredatk} + 2]]&#125;&#125;|Advantage,{{advantage=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb} + @{selected|user.sacredatk} + 2]]&#125;&#125; {{r2=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb} + @{selected|user.sacredatk} + 2]]&#125;&#125;|Disadvantage,{{disadvantage=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb} + @{selected|user.sacredatk} + 2]]&#125;&#125; {{r2=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb} + @{selected|user.sacredatk} + 2]]&#125;&#125;}

!ae attack
!token-mod --set currentside|3
!ae-effect remove sacred @{selected|token_id}
/fx glow-smoke @{selected|token_id}
!splay Sword Stab SFX

Spear-Melee-Damage

&{template:dmg} {{rname=Executioner Spear Melee Damage}} {{damage=1}} {{dmg1flag=1}} {{dmg1=[[1d6 + @{selected|charisma_mod} + 2 + 2]]}} {{dmg1type=Piercing}} {{charname=@{selected|token_name}}} {{desc=[Divine Smite](~selected|Divine-Smite" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Divine Favor](~selected|Divine-Favor-Damage" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;)}}

!adr apply --magic
!adr fx pooling-blood 
!splay Blood Splatter

Spear-Melee-Crit-Damage

&{template:dmg} {{rname=Executioner Spear Melee Critical Damage}} {{damage=1}} {{dmg1flag=1}} {{dmg1=[[1d6 + @{selected|charisma_mod} + 2 + 2 + 6]]}} {{dmg1type=Piercing}} {{charname=@{selected|token_name}}} {{desc=[Critical Divine Smite](~selected|Divine-Smite-Crit" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Divine Favor](~selected|Divine-Favor-Crit-Damage" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;)}}

!adr apply --magic
!adr fx pooling-blood 
!splay Blood Splatter

Spear-Throw-Damage

&{template:dmg} {{rname=Executioner Spear Throw Damage}} {{damage=1}} {{dmg1flag=1}} {{dmg1=[[1d6 + @{selected|charisma_mod} + 2]]}} {{dmg1type=Piercing}} {{charname=@{selected|token_name}}} {{desc=[Divine Smite](~selected|Divine-Smite" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Divine Favor](~selected|Divine-Favor-Damage" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;)}}

!adr apply --magic
!adr fx pooling-blood 
!splay Blood Splatter

Spear-Throw-Crit-Damage

&{template:dmg} {{rname=Executioner Spear Throw Critical Damage}} {{damage=1}} {{dmg1flag=1}} {{dmg1=[[1d6 + @{selected|charisma_mod} + 2 + 6]]}} {{dmg1type=Piercing}} {{charname=@{selected|token_name}}} {{desc=[Critical Divine Smite](~selected|Divine-Smite-Crit" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Divine Favor](~selected|Divine-Favor-Crit-Damage" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;)}}

!adr apply --magic
!adr fx pooling-blood 
!splay Blood Splatter

Executioner-Halt

&{template:default} {{name=Executioner: Halt}} {{Effect=The target’s movement is locked until the end of its next turn.}}
!ae-effect lockmove @{target|Halt|token_id} --duration targetNextTurn

Divine-Favor-Damage

&{template:dmg} {{rname=Divine Favor}} {{damage=1}} {{dmg1flag=1}} {{dmg1=[[1d4]]}} {{dmg1type=Radiant}} 

!adr apply

Divine-Favor-Crit-Damage
&{template:dmg} {{rname=Divine Favor Critical}} {{damage=1}} {{dmg1flag=1}} {{dmg1=[[2d4]]}} {{dmg1type=Radiant}} 

!adr apply 

Divine-Smite
?{Divine Smite|1st Level Slot,&{template:dmg&#125; {{rname=Divine Smite &#40;1st Level&#41;&#125;&#125; {{damage=1&#125;&#125; {{dmg1flag=1&#125;&#125; {{dmg1=[[2d8]]&#125;&#125; {{dmg1type=Radiant&#125;&#125; {{charname=@{selected|token_name}&#125;&#125; &#10;!adr apply|2nd Level Slot,&{template:dmg&#125; {{rname=Divine Smite &#40;2nd Level&#41;&#125;&#125; {{damage=1&#125;&#125; {{dmg1flag=1&#125;&#125; {{dmg1=[[3d8]]&#125;&#125; {{dmg1type=Radiant&#125;&#125; {{charname=@{selected|token_name}&#125;&#125; &#10;!adr apply}

Divine-Smite-Crit

?{Divine Smite Critical|1st Level Slot,&{template:dmg&#125; {{rname=Divine Smite Critical &#40;1st Level&#41;&#125;&#125; {{damage=1&#125;&#125; {{dmg1flag=1&#125;&#125; {{dmg1=[[4d8]]&#125;&#125; {{dmg1type=Radiant&#125;&#125; {{charname=@{selected|token_name}&#125;&#125; &#10;!adr apply|2nd Level Slot,&{template:dmg&#125; {{rname=Divine Smite Critical &#40;2nd Level&#41;&#125;&#125; {{damage=1&#125;&#125; {{dmg1flag=1&#125;&#125; {{dmg1=[[6d8]]&#125;&#125; {{dmg1type=Radiant&#125;&#125; {{charname=@{selected|token_name}&#125;&#125; &#10;!adr apply}

Sacred-Weapon

!ae-effect sacred

Lay-on-Hands

?{Lay on Hands Option|Heal,!hp layonhands @{target|Target|token_id} ?{Lay on Hands Points&#124;5&#125;|Remove Poison,!hp layonhands @{target|Target|token_id} ?{Lay on Hands Points&#124;5&#125; poison}

!ae bonus

Heavenly-Wings

&{template:default} {{name=@{selected|token_name} — Heavenly Wings}} {{Bonus Action=You manifest heavenly wings as per your Celestial Revelation feature. This use does not count against your normal Celestial Revelation use. You can use this feature a number of times equal to your Proficiency Bonus, and regain all uses when you finish a Long Rest.}} {{Effect=While your heavenly wings are manifested, either from this feature or your species feature, you can Dash as a Bonus Action. Whenever you Dash, whether using an Action or Bonus Action, the effect of that Dash is doubled for your flying speed for that turn.}}

!ae fly
!ae bonus

Divine-Favor

&{template:default} {{name=@{selected|token_name} — Divine Favor}} {{Bonus Action=Your prayer empowers your weapon attacks. For one minute, your attacks with weapons deal an extra 1d4 Radiant damage on a hit.}}

!ae-effect divine
!ae bonus

Shield of Faith

&{template:default} {{name=Shield of Faith}} {{Bonus Action=A shimmering field appears and grants a creature +2 AC for up to 10 minutes while you maintain Concentration.}}

!ae concentration
!ae bonus

Sanctuary

&{template:default} {{name=Sanctuary}} {{Bonus Action=Until the spell ends, any creature that targets the warded creature with an attack roll or damaging spell must first succeed on a Wisdom saving throw or choose a new target or lose the attack/spell.}}

!ae sanctuary
!ae bonus

Cure-Wounds

!hp heal @{target|Ally|token_id} [[2d8 + @{selected|spell_dc_mod}]] Cure Wounds
!ae action

Healing-Word

!hp heal @{target|Target|token_id} [[2d4 + @{selected|charisma_mod}]] Healing Word
!ae bonus

Blade-Ward

&{template:default} {{name=@{selected|token_name} — Blade Ward}} {{Cantrip=You ward yourself. Until concentration ends, attack rolls against you subtract 1d4.}}
!ae spell
!ae-effect bladeward @{selected|token_id} --duration concentration --source @{selected|token_id}

Aid-Menu

&{template:default} {{name=Aid}} {{Targets=[1 Target](~selected|Aid-1) [2 Targets](~selected|Aid-2) [3 Targets](~selected|Aid-3)}}

Aid-1

!ae-effect aid @{target|Aid Target 1|token_id}

Aid-2

!ae-effect aid @{target|Aid Target 1|token_id}
!ae-effect aid @{target|Aid Target 2|token_id}

Aid-3

!ae-effect aid @{target|Aid Target 1|token_id}
!ae-effect aid @{target|Aid Target 2|token_id}
!ae-effect aid @{target|Aid Target 3|token_id}

Aura-Toggle

!aura toggle protection @{selected|token_id}

Lesser-Restoration

?{Lesser Restoration|Blinded,&{template:default&#125; {{name=Lesser Restoration&#125;&#125; {{Effect=The Blinded condition ends on the target.&#125;&#125; &#10;!ae spell &#10;!ae-con remove blinded @{target|Lesser Restoration|token_id}|Deafened,&{template:default&#125; {{name=Lesser Restoration&#125;&#125; {{Effect=The Deafened condition ends on the target.&#125;&#125; &#10;!ae spell &#10;!ae-con remove deafened @{target|Lesser Restoration|token_id}|Paralyzed,&{template:default&#125; {{name=Lesser Restoration&#125;&#125; {{Effect=The Paralyzed condition ends on the target.&#125;&#125; &#10;!ae spell &#10;!ae-con remove paralyzed @{target|Lesser Restoration|token_id}|Poisoned,&{template:default&#125; {{name=Lesser Restoration&#125;&#125; {{Effect=The Poisoned condition ends on the target.&#125;&#125; &#10;!ae spell &#10;!ae-con remove poisoned @{target|Lesser Restoration|token_id}}

!ae bonus

Toll-the-Dead

&{template:dmg} {{rname=Toll the Dead}} {{damage=0}} {{save=1}} {{saveattr=Wisdom}} {{savedesc=@{target|Foe|token_name}** rolled a: [[$[[0]] + @{target|Foe|wisdom_save_bonus}]]&#13;&#13;Breakdown: {$[[0]] + @{target|Foe|wisdom_save_bonus}}&#13;&#13;Save for no damage.&#13;&#13;You point at one creature you can see within range&#44; and the sound of a dolorous bell fills the air around it for a moment. The target must succeed on a Wisdom saving throw or take 1d8 necrotic damage. If the target is missing any of its hit points&#44; it instead takes 1d12 necrotic damage. The spell's damage increases by one die when you reach 5th level (2d8 or 2d12&rpar;&#44; 11th level (3d8 or 3d12&rpar;&#44; and 17th level (4d8 or 4d12&rpar;.}}{{savedescription=&#13;&#13;Range:60ft}} {{savedc=@{selected|spell_save_dc}}} {{spelllevel=Necromancy Cantrip}} [[1d20cs>[[@{selected|spell_save_dc}-@{target|Foe|wisdom_save_bonus}]]]]
&{template:dmg} {{rname=Toll the Dead}} {{damage=1}} {{dmg1flag=1}} {{dmg1=[[[[floor((@{selected|level}+1)/6)+1]]d[[ {{ @{target|Foe|bar1},0 }>@{target|Foe|bar1|max}}*(8-12) + 12 ]]]]}} {{dmg1type=Necrotic}}

!adr apply @{target|Toll the Dead|token_id}
!ae action
/fx nova-slime @{target|Toll the Dead|token_id}
!splay Taco Bell

Find-Steed *Caster Token Action*

&{template:default} {{name=Find Steed}} {{description=@{selected|token_name} summons an otherworldly steed in an unoccupied space within 30 feet.}}

!scriptcard  {{ 
--#hideTitleCard|1
--#emoteState|0
--#emoteText|
--#sourceToken|@{selected|token_id}

--:SPAWN SUMMON TARGET TOKEN USING SMARTAOE API|
	--@forselected|smartaoe _title|Find Steed _instant|1 _radius|0ft _aoetype|circle, float _aoeColor|#00000000 _aoeOutlineColor|#00000000 _gridcolor|#00000000 _controlTokName|Teleporter _autoapply|1 _noSave|TRUE

--:STORE CASTER TOKEN ID|
	--&TokenID|[*S:t-id]
	--!a:@{Teleporter|character_id}|!caster_ID:[&TokenID]

--:TURN ON 30FT RADIUS FOR REFERENCE|
	--@forselected|token-mod _set aura1_radius|!30 aura1_color|#f1c232
}}

HUGE-O STRANGE

Attacks

&{template:default} {{name=@{selected|token_name} — Attacks}} {{Options=[Crushing Maul](~selected|Crushing-Maul-Attack) [Sling](~selected|Sling-Attack) [Unarmed Strike](~selected|Unarmed-Strike-Attack) [Grapple](~selected|Grapple)}}

Bonus-Actions

&{template:default} {{name=@{selected|token_name} — Bonus Actions}} {{Options=[Rage](~selected|Rage) [Hew](~selected|Hew) [Pommel Spike](~selected|Pommel-Spike) [Eagle Dash](~selected|Eagle-Dash) [Large Form](~selected|Large-Form) [Force of Nature](~selected|Force-of-Nature) [Potion](~selected|Bonus-Potion-Menu) [Other Bonus Action](~selected|Bonus-Other)}}

Crushing-Maul-Attack

!adr attack @{selected|token_id} @{target|Crushing Maul|token_id}

&{template:atk} {{mod=[Damage](~selected|Crushing-Maul-Damage" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Crit Damage](~selected|Crushing-Maul-Crit-Damage" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Topple](~selected|Topple" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;)}} {{rname=Crushing Maul}} {{charname=@{selected|token_name}}} {{desc=Your attack rolls with this weapon are calculated by rolling a D20 and adding your Strength Modifier, Proficiency Bonus, and the Magic Weapon Bonus.&#10;Strength: +@{selected|strength_mod}&#10;Proficiency: +@{selected|pb}&#10;Item Bonus: +1&#10;&#10;You have a +1 bonus to attack rolls and damage rolls made with this magic weapon.}} ?{Roll Type?|Normal,{{normal=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|strength_mod} + @{selected|pb} + 1]]&#125;&#125;|Advantage,{{advantage=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|strength_mod} + @{selected|pb} + 1]]&#125;&#125; {{r2=[[1d20cs>20 + @{selected|strength_mod} + @{selected|pb} + 1]]&#125;&#125;|Disadvantage,{{disadvantage=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|strength_mod} + @{selected|pb} + 1]]&#125;&#125; {{r2=[[1d20cs>20 + @{selected|strength_mod} + @{selected|pb} + 1]]&#125;&#125;} 

!ae attack
/fx glow-smoke @{selected|token_id} 
!splay Maul Swing SFX 

Crushing-Maul-Damage

&{template:dmg} {{rname=Crushing Maul Damage}} {{damage=1}} {{dmg1flag=1}} {{dmg1=[[2d6 + @{selected|strength_mod} + 1 + @{selected|pb} + @{selected|user.ragedmg}]]}} {{dmg1type=Bludgeoning}} {{dmg2flag=1}} {{dmg2=[[1d4]]}} {{dmg2type=Force}} {{charname=@{selected|token_name}}} {{desc=[Force of Nature Damage](~selected|Force-of-Nature-Damage" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;)}}

!adr apply --magic
!adr fx pooling-blood 
!splay Blood Splatter

Crushing-Maul-Crit-Damage

&{template:dmg} {{rname=Crushing Maul Critical Damage}} {{damage=1}} {{dmg1flag=1}} {{dmg1=[[2d6 + @{selected|strength_mod} + 1 + @{selected|pb} + @{selected|user.ragedmg} + 12]]}} {{dmg1type=Bludgeoning}} {{dmg2flag=1}} {{dmg2=[[2d4]]}} {{dmg2type=Force}} {{charname=@{selected|token_name}}} {{desc=[Force of Nature Damage](~selected|Force-of-Nature-Damage" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;)}}

!adr apply --magic
!adr fx pooling-blood 
!splay Blood Splatter

Unarmed-Strike-Attack

!adr attack @{selected|token_id} @{target|Unarmed Strike|token_id}

&{template:atk} {{mod=[Damage](~selected|Unarmed-Strike-Damage" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Crit Damage](~selected|Unarmed-Strike-Crit-Damage" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Grapple](~selected|Grapple" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;)}} {{rname=Unarmed Strike}} {{charname=@{selected|token_name}}} {{desc=Your attack rolls with this attack are calculated by rolling a D20 and adding your Strength Modifier and Proficiency Bonus.&#10;Strength: +@{selected|strength_mod}&#10;Proficiency: +@{selected|pb}}} ?{Roll Type?|Normal,{{normal=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|strength_mod} + @{selected|pb}]]&#125;&#125;|Advantage,{{advantage=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|strength_mod} + @{selected|pb}]]&#125;&#125; {{r2=[[1d20cs>20 + @{selected|strength_mod} + @{selected|pb}]]&#125;&#125;|Disadvantage,{{disadvantage=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|strength_mod} + @{selected|pb}]]&#125;&#125; {{r2=[[1d20cs>20 + @{selected|strength_mod} + @{selected|pb}]]&#125;&#125;}

!ae attack
/fx glow-smoke @{selected|token_id} 
!splay Maul Swing SFX 

Unarmed-Strike-Damage

&{template:dmg} {{rname=Unarmed Strike Damage}} {{damage=1}} {{dmg1flag=1}} {{dmg1=[[?{Unarmed Fighting Style|One Hand Free (1d6),1d6|Both Hands Free (1d8),1d8} + @{selected|strength_mod} + @{selected|ragedmg}]]}} {{dmg1type=Bludgeoning}} {{charname=@{selected|token_name}}} {{desc=[Force of Nature](~selected|Force-of-Nature-Damage" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;)}}

!adr apply 
!adr fx pooling-blood 
!splay Blood Splatter

Unarmed-Strike-Crit-Damage

&{template:dmg} {{rname=Unarmed Strike Critical Damage}} {{damage=1}} {{dmg1flag=1}} {{dmg1=[[?{Unarmed Fighting Style|One Hand Free (1d6),1d6 + 6|Both Hands Free (1d8),1d8 + 8} + @{selected|strength_mod} + @{selected|user.ragedmg}]]}} {{dmg1type=Bludgeoning}} {{charname=@{selected|token_name}}} {{desc=[Force of Nature](~selected|Force-of-Nature-Damage" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;)}}

!adr apply 
!adr fx pooling-blood 
!splay Blood Splatter

Sling-Attack

!adr attack @{selected|token_id} @{target|Sling|token_id}

&{template:atk} {{mod=[Damage](~selected|Sling-Damage" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Crit Damage](~selected|Sling-Crit-Damage" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;)}} {{rname=Sling}} {{charname=@{selected|token_name}}} {{desc=Your attack rolls with this weapon are calculated by rolling a D20 and adding your Dexterity Modifier and Proficiency Bonus.&#10;Dexterity: +@{selected|dexterity_mod}&#10;Proficiency: +@{selected|pb}}} ?{Roll Type?|Normal,{{normal=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|dexterity_mod} + @{selected|pb}]]&#125;&#125;|Advantage,{{advantage=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|dexterity_mod} + @{selected|pb}]]&#125;&#125; {{r2=[[1d20cs>20 + @{selected|dexterity_mod} + @{selected|pb}]]&#125;&#125;|Disadvantage,{{disadvantage=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|dexterity_mod} + @{selected|pb}]]&#125;&#125; {{r2=[[1d20cs>20 + @{selected|dexterity_mod} + @{selected|pb}]]&#125;&#125;}

!ae attack
/fx glow-smoke @{selected|token_id} 

Sling-Damage

&{template:dmg} {{rname=Sling Damage}} {{damage=1}} {{dmg1flag=1}} {{dmg1=[[1d4 + @{selected|dexterity_mod}]]}} {{dmg1type=Bludgeoning}} {{charname=@{selected|token_name}}}

!adr apply 
!adr fx pooling-blood 

Sling-Crit-Damage

&{template:dmg} {{rname=Sling Critical Damage}} {{damage=1}} {{dmg1flag=1}} {{dmg1=[[1d4 + @{selected|dexterity_mod} + 4]]}} {{dmg1type=Bludgeoning}} {{charname=@{selected|token_name}}}

!adr apply 
!adr fx pooling-blood 

Grapple

&{template:default} {{name=@{selected|token_name} — Grapple}} {{Description=You attempt to grapple a creature. The target must succeed on a Strength saving throw or gain the Grappled condition.}} {{Save DC=[[8 + @{selected|strength_mod} + @{selected|pb}]] Strength}}
!se grapple @{target|Grapple|token_id} [[8 + @{selected|strength_mod} + @{selected|pb}]]

!ae attack

Reckless-Attack

&{template:default} {{name=@{selected|token_name} — Reckless Attack}} {{Effect=You have Advantage on Strength-based attack rolls until the start of your next turn, but attack rolls against you also have Advantage until then.}}
!ae-effect reckless

Eagle-Dash

&{template:default} {{name=@{selected|token_name} — Eagle Dash}} {{Bonus Action=You take the Dash and Disengage actions as a Bonus Action.}}
!ae bonus
!ae-effect dash
!ae-effect disengage

Hew

!adr attack @{selected|token_id} @{target|Hew|token_id}

&{template:atk} {{mod=[Damage](~selected|Crushing-Maul-Damage" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Crit Damage](~selected|Crushing-Maul-Crit-Damage" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Topple](#Topple" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;)}} {{rname=Crushing Maul, +1}} {{charname=@{selected|token_name}}} {{desc=Your attack rolls with this weapon are calculated by rolling a D20 and adding your Strength Modifier, Proficiency Bonus, and the Magic Weapon Bonus.&#10;Strength: +@{selected|strength_mod}&#10;Proficiency: +@{selected|pb}&#10;Item Bonus: +1&#10;&#10;You have a +1 bonus to attack rolls and damage rolls made with this magic weapon.}} ?{Roll Type?|Normal,{{normal=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|strength_mod} + @{selected|pb} + 1]]&#125;&#125;|Advantage,{{advantage=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|strength_mod} + @{selected|pb} + 1]]&#125;&#125; {{r2=[[1d20cs>20 + @{selected|strength_mod} + @{selected|pb} + 1]]&#125;&#125;|Disadvantage,{{disadvantage=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|strength_mod} + @{selected|pb} + 1]]&#125;&#125; {{r2=[[1d20cs>20 + @{selected|strength_mod} + @{selected|pb} + 1]]&#125;&#125;} 

!ae bonus 
/fx glow-smoke @{selected|token_id} 
!splay Maul Swing SFX 

Force-of-Nature

&{template:default} {{name=@{selected|token_name} — Force of Nature}} {{Bonus Action=Once per Long Rest, you invoke the spirit within you for 1 minute. While active, you gain a climbing speed equal to your Speed, you can move across difficult terrain without expending extra movement, you can Dash as a Bonus Action, and once on each of your turns when you hit with a melee attack, you deal extra damage equal to your Strength modifier.}}
!ae-effect nature
!ae bonus

Force-of-Nature-Damage

&{template:dmg} {{rname=Force of Nature Damage}} {{damage=1}} {{dmg1flag=1}} {{dmg1=[[@{selected|strength_mod}]]}} {{dmg1type=Bludgeoning}} {{desc=Once on each of your turns while Force of Nature is active, when you hit a creature with a melee attack, you deal additional damage equal to your Strength modifier.}}
!adr apply

Pommel-Spike

!adr attack @{selected|token_id} @{target|Pommel Spike|token_id}

&{template:atk} {{mod=[Damage](~selected|Pommel-Spike-Damage" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) =[Critical Damage](~selected|Pommel-Spike-Crit-Damage" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;)}} {{rname=Django's Pommel Spike}} {{charname=@{selected|token_name}}} {{desc=While the spike is affixed to the weapon you are currently wielding, once per combat, you can use a Bonus Action to stab it at an enemy by making an attack roll with the weapon it is affixed to. On a hit, it deals 1d6 Piercing damage.}} ?{Roll Type?|Normal,{{normal=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|strength_mod} + @{selected|pb} + 1]]&#125;&#125;|Advantage,{{advantage=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|strength_mod} + @{selected|pb} + 1]]&#125;&#125; {{r2=[[1d20cs>20 + @{selected|strength_mod} + @{selected|pb} + 1]]&#125;&#125;|Disadvantage,{{disadvantage=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|strength_mod} + @{selected|pb} + 1]]&#125;&#125; {{r2=[[1d20cs>20 + @{selected|strength_mod} + @{selected|pb} + 1]]&#125;&#125;} 

!ae bonus

Pommel-Spike-Damage

&{template:dmg} {{rname=Django's Pommel Spike Damage}} {{damage=1}} {{dmg1flag=1}} {{dmg1=[[1d6]]}} {{dmg1type=Piercing}} {{charname=@{selected|token_name}}}

!adr apply 
!adr fx pooling-blood
!splay Sword Stab SFX

Pommel-Spike-Crit-Damage

&{template:dmg} {{rname=Django's Pommel Spike Damage}} {{damage=1}} {{dmg1flag=1}} {{dmg1=[[1d6 + 6]]}} {{dmg1type=Piercing}} {{charname=@{selected|token_name}}}

!adr apply 
!adr fx pooling-blood
!splay Sword Stab SFX

Rage

!ae bonus
!token-mod --set currentside|4
!splay Rage
/fx explode-water @{selected|token_id}

?{Choose a Rage of the Wilds|
Bear,!splay Bear
!ae-effect bear|
Wolf,!splay Wolf
!ae-effect wolf|
Eagle,!splay Eagle
!ae dash
!ae-effect disengage
!ae-effect eagle}

Rage-Off

!effect rage off
!token-mod --set currentside|3
!splay Rage End
/fx shield-smoke @{selected|token_id}

Large-Form

&{template:default} {{name=Large Form}} {{Bonus Action=You draw upon your giant heritage and become Large if there is room. While Large, you have Advantage on Strength checks and your reach increases by 5 feet.}}
!ae bonus

Wolf-Aura-Toggle

!aura toggle wolf @{selected|token_id}

DEEPAK

Attacks

/w &{template:default} {{name=Choose Weapon}} {{[Katana](~selected|Katana-Attack)}} {{[Gutshot Crossbow](~selected|Crossbow-Attack)}}

Crossbow-Attack

!adr attack @{selected|token_id} @{target|Target|token_id}

&{template:atk} {{mod=[Damage](~selected|Crossbow-Damage" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Crit Damage](~selected|Crossbow-Crit-Damage" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Push](~selected|Push" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Gutshot](~selected|Gutshot" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;)}} {{rname=Gutshot Crossbow}} {{charname=@{selected|token_name}}} {{desc=Your attack rolls with this weapon are calculated by rolling a D20 and adding your Dexterity Modifier, Proficiency Bonus, and the Magic Weapon Bonus.&#10;Dexterity: +@{selected|dexterity_mod}&#10;Proficiency: +@{selected|pb}&#10;Item Bonus: +1&#10;&#10;&#10;You have a +1 bonus to attack rolls and damage rolls made with this magic weapon.}} ?{Roll Type?|Normal,{{normal=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|dexterity_mod} + @{selected|pb} + 1]]&#125;&#125;|Advantage,{{advantage=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|dexterity_mod} + @{selected|pb} + 1]]&#125;&#125; {{r2=[[1d20cs>20 + @{selected|dexterity_mod} + @{selected|pb} + 1]]&#125;&#125;|Disadvantage,{{disadvantage=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|dexterity_mod} + @{selected|pb} + 1]]&#125;&#125; {{r2=[[1d20cs>20 + @{selected|dexterity_mod} + @{selected|pb} + 1]]&#125;&#125;} 

!token-mod --set currentside|2 
!ae attack 
/fx glow-smoke @{selected|token_id} 
!splay Crossbow

Crossbow-Damage

&{template:dmg} {{rname=Gutshot Crossbow Damage}} {{damage=1}} {{dmg1flag=1}} {{dmg1=[[1d10 + @{selected|dexterity_mod} + 1]]}} {{dmg1type=Piercing}} {{charname=@{selected|token_name}}} {{desc=[Sneak Attack](~selected|Crossbow-Sneak-Attack" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Assassinate (First Round Only!)](~selected|Assassinate" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Poison](~selected|Poison-Damage-Menu" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;)}}

!adr apply --magic
!adr fx pooling-blood 
!splay Blood Splatter

Crossbow-Crit-Damage

&{template:dmg} {{rname=Crossbow Critical Damage}} {{damage=1}} {{dmg1flag=1}} {{dmg1=[[2d10 + @{selected|dexterity_mod} + 1]]}} {{dmg1type=Piercing}}{{charname=@{selected|token_name}}} {{desc=[Sneak Attack](~selected|Crossbow-Sneak-Attack-Crit" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;)[Assassinate (First Round Only!)](~selected|Assassinate" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;)[Poison](~selected|Poison-Crit-Damage-Menu" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;)}}

!adr apply --magic
!adr fx pooling-blood 
!splay Blood Splatter

Crossbow-Sneak-Attack

?{Sneak Attack Option|Sneak Attack,&{template:dmg&#125; {{rname=Sneak Attack&#125;&#125; {{damage=1&#125;&#125; {{dmg1flag=1&#125;&#125; {{dmg1=[[ [[ceil(@{selected|level}/2 + 1)]]d6 ]]&#125;&#125; {{dmg1type=Piercing&#125;&#125; {{charname=@{selected|token_name}&#125&#125; &#10;!adr apply --magic|Cunning Strike (Poison),&{template:dmg&#125; {{rname=Cunning Strike: Poison&#125;&#125; {{damage=1&#125;&#125; {{dmg1flag=1&#125;&#125; {{dmg1=[[ [[ceil(@{selected|level}/2)]]d6 ]]&#125;&#125; {{dmg1type=Piercing&#125;&#125; {{charname=@{selected|token_name}&#125&#125; {{desc=Cost: 1d6 Sneak Attack damage. The target must make a Constitution saving throw. On a failure&#44; it has the Poisoned condition.&#125;&#125; &#10;!adr apply --magic &#10;!adr targetcmd !se poison @@target [[8 + @{selected|dexterity_mod} + @{selected|pb}]]|Cunning Strike (Trip),&{template:dmg&#125; {{rname=Cunning Strike: Trip&#125;&#125; {{damage=1&#125;&#125; {{dmg1flag=1&#125;&#125; {{dmg1=[[ [[ceil(@{selected|level}/2)]]d6 ]]&#125;&#125; {{dmg1type=Piercing&#125;&#125; {{charname=@{selected|token_name}&#125&#125; {{desc=Cost: 1d6 Sneak Attack damage. The target must make a Dexterity saving throw. On a failure&#44; it has the Prone condition.&#125;&#125; &#10;!adr apply --magic &#10;!adr targetcmd !se trip @@target [[8 + @{selected|dexterity_mod} + @{selected|pb}]]|Cunning Strike (Withdraw),&{template:dmg&#125; {{rname=Cunning Strike: Withdraw&#125;&#125; {{damage=1&#125;&#125; {{dmg1flag=1&#125;&#125; {{dmg1=[[ [[ceil(@{selected|level}/2)]]d6 ]]&#125;&#125; {{dmg1type=Piercing&#125;&#125; {{charname=@{selected|token_name}&#125&#125; {{desc=Cost: 1d6 Sneak Attack damage. Immediately after the attack&#44; you move up to half your Speed without provoking Opportunity Attacks.&#125;&#125; &#10;!adr apply --magic &#10;!ae-effect disengage @{selected|token_id} &#10;!ae addmove [[floor(@{selected|speed}/2)]]}

Crossbow-Sneak-Attack-Crit

?{Sneak Attack Critical Option|Sneak Attack,&{template:dmg&#125; {{rname=Sneak Attack Critical&#125;&#125; {{damage=1&#125;&#125; {{dmg1flag=1&#125;&#125; {{dmg1=[[ [[ceil(@{selected|level}/2)*2+1]]d6 ]]&#125;&#125; {{dmg1type=Piercing&#125;&#125; {{charname=@{selected|token_name}&#125&#125; &#10;!adr apply --magic|Cunning Strike (Poison),&{template:dmg&#125; {{rname=Cunning Strike: Poison Critical&#125;&#125; {{damage=1&#125;&#125; {{dmg1flag=1&#125;&#125; {{dmg1=[[ [[ceil(@{selected|level}/2)*2]]d6 ]]&#125;&#125; {{dmg1type=Piercing&#125;&#125; {{charname=@{selected|token_name}&#125&#125; {{desc=Cost: 1d6 Sneak Attack damage. The target must make a Constitution saving throw. On a failure&#44; it has the Poisoned condition.&#125;&#125; &#10;!adr apply --magic &#10;!adr targetcmd !se poison @@target [[8 + @{selected|dexterity_mod} + @{selected|pb}]]|Cunning Strike (Trip),&{template:dmg&#125; {{rname=Cunning Strike: Trip Critical&#125;&#125; {{damage=1&#125;&#125; {{dmg1flag=1&#125;&#125; {{dmg1=[[ [[ceil(@{selected|level}/2)*2]]d6 ]]&#125;&#125; {{dmg1type=Piercing&#125;&#125; {{charname=@{selected|token_name}&#125&#125; {{desc=Cost: 1d6 Sneak Attack damage. The target must make a Dexterity saving throw. On a failure&#44; it has the Prone condition.&#125;&#125; &#10;!adr apply --magic &#10;!adr targetcmd !se trip @@target [[8 + @{selected|dexterity_mod} + @{selected|pb}]]|Cunning Strike (Withdraw),&{template:dmg&#125; {{rname=Cunning Strike: Withdraw Critical&#125;&#125; {{damage=1&#125;&#125; {{dmg1flag=1&#125;&#125; {{dmg1=[[ [[ceil(@{selected|level}/2)*2]]d6 ]]&#125;&#125; {{dmg1type=Piercing&#125;&#125; {{charname=@{selected|token_name}&#125&#125; {{desc=Cost: 1d6 Sneak Attack damage. Immediately after the attack&#44; you move up to half your Speed without provoking Opportunity Attacks.&#125;&#125; &#10;!adr apply --magic &#10;!ae-effect disengage @{selected|token_id} &#10;!ae addmove [[floor(@{selected|speed}/2)]]}

Katana-Attack

!adr attack @{selected|token_id} @{target|Target|token_id}

&{template:atk} {{mod=[Damage](~selected|Katana-Damage" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Crit Damage](~selected|Katana-Crit-Damage" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Sap](~selected|Sap" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;)}} {{rname=Katana, +1}} {{charname=@{selected|token_name}}} {{desc=Your attack rolls with this weapon are calculated by rolling a D20 and adding your Dexterity Modifier, Proficiency Bonus, and the Magic Weapon Bonus.&#10;Dexterity: +@{selected|dexterity_mod}&#10;Proficiency: +@{selected|pb}&#10;Item Bonus: +1&#10;&#10;&#10;You have a +1 bonus to attack rolls and damage rolls made with this magic weapon.}} ?{Roll Type?|Normal,{{normal=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|dexterity_mod} + @{selected|pb} + 1]]&#125;&#125;|Advantage,{{advantage=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|dexterity_mod} + @{selected|pb} + 1]]&#125;&#125; {{r2=[[1d20cs>20 + @{selected|dexterity_mod} + @{selected|pb} + 1]]&#125;&#125;|Disadvantage,{{disadvantage=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|dexterity_mod} + @{selected|pb} + 1]]&#125;&#125; {{r2=[[1d20cs>20 + @{selected|dexterity_mod} + @{selected|pb} + 1]]&#125;&#125;}

!token-mod --set currentside|3 
!ae attack 
/fx glow-smoke @{selected|token_id} 
!splay Katana

Katana-Damage

&{template:dmg} {{rname=Katana Damage}} {{damage=1}} {{dmg1flag=1}} {{dmg1=[[1d10 + @{selected|dexterity_mod} + 1]]}} {{dmg1type=Slashing}} {{charname=@{selected|token_name}}} {{desc=[Sneak Attack](~selected|Katana-Sneak-Attack" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Assassinate (First Round Only!)](~selected|Assassinate" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Poison](~selected|Poison-Damage-Menu" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;)}}

!adr apply --magic
!adr fx pooling-blood
!splay Blood Splatter 

Katana-Crit-Damage

&{template:dmg} {{rname=Katana Critical Damage}} {{damage=1}} {{dmg1flag=1}} {{dmg1=[[1d10 + @{selected|dexterity_mod} + 1 + 10]]}} {{dmg1type=Slashing}} {{charname=@{selected|token_name}}} {{desc=[Sneak Attack](~selected|Katana-Sneak-Attack-Crit" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Assassinate (First Round Only!)](~selected|Assassinate" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Poison](~selected|Poison-Crit-Damage-Menu" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;)}} 

!adr apply --magic
!adr fx pooling-blood
!splay Blood Splatter 

Katana-Sneak-Attack

?{Sneak Attack Option|Sneak Attack,&{template:dmg&#125; {{rname=Sneak Attack&#125;&#125; {{damage=1&#125;&#125; {{dmg1flag=1&#125;&#125; {{dmg1=[[ [[ceil(@{selected|level}/2)+1]]d6 ]]&#125;&#125;{{dmg1type=Slashing&#125;&#125: {{charname=@{selected|token_name}&#125;&#125; &#10;!adr apply --magic|Cunning Strike (Poison),&{template:dmg&#125; {{rname=Cunning Strike: Poison&#125;&#125; {{damage=1&#125;&#125; {{dmg1flag=1&#125;&#125; {{dmg1=[[ [[ceil(@{selected|level}/2)]]d6 ]]&#125;&#125; {{dmg1type=Slashing&#125;&#125: {{charname=@{selected|token_name}&#125;&#125; {{desc=Cost: 1d6 Sneak Attack damage. The target must make a Constitution saving throw. On a failure&#44; it has the Poisoned condition.&#125;&#125; &#10;!adr apply --magic &#10;!adr targetcmd !se poison @@target [[8 + @{selected|dexterity_mod} + @{selected|pb}]]|Cunning Strike (Trip),&{template:dmg&#125; {{rname=Cunning Strike: Trip&#125;&#125; {{damage=1&#125;&#125; {{dmg1flag=1&#125;&#125; {{dmg1=[[ [[ceil(@{selected|level}/2)]]d6 ]]&#125;&#125; {{dmg1type=Slashing&#125;&#125: {{charname=@{selected|token_name}&#125;&#125; {{desc=Cost: 1d6 Sneak Attack damage. The target must make a Dexterity saving throw. On a failure&#44; it has the Prone condition.&#125;&#125; &#10;!adr apply --magic &#10;!adr targetcmd !se trip @@target [[8 + @{selected|dexterity_mod} + @{selected|pb}]]|Cunning Strike (Withdraw),&{template:dmg&#125; {{rname=Cunning Strike: Withdraw&#125;&#125; {{damage=1&#125;&#125; {{dmg1flag=1&#125;&#125; {{dmg1=[[ [[ceil(@{selected|level}/2)]]d6 ]]&#125;&#125; {{dmg1type=Slashing&#125;&#125: {{charname=@{selected|token_name}&#125;&#125; {{desc=Cost: 1d6 Sneak Attack damage. Immediately after the attack&#44; you move up to half your Speed without provoking Opportunity Attacks.&#125;&#125; &#10;!adr apply --magic &#10;!ae-effect disengage @{selected|token_id} &#10;!ae addmove [[floor(@{selected|speed}/2)]]}

Katana-Sneak-Attack-Crit

?{Sneak Attack Critical Option|Sneak Attack,&{template:dmg&#125; {{rname=Sneak Attack Critical&#125;&#125; {{damage=1&#125;&#125; {{dmg1flag=1&#125;&#125; {{dmg1=[[ [[ceil(@{selected|level}/2)*2+1]]d6 ]]&#125;&#125; {{dmg1type=Slashing&#125;&#125: {{charname=@{selected|token_name}&#125;&#125; &#10;!adr apply --magic|Cunning Strike (Poison),&{template:dmg&#125; {{rname=Cunning Strike: Poison Critical&#125;&#125; {{damage=1&#125;&#125; {{dmg1flag=1&#125;&#125; {{dmg1=[[ [[ceil(@{selected|level}/2)*2]]d6 ]]&#125;&#125; {{dmg1type=Slashing&#125;&#125: {{charname=@{selected|token_name}&#125;&#125; {{desc=Cost: 1d6 Sneak Attack damage. The target must make a Constitution saving throw. On a failure&#44; it has the Poisoned condition.&#125;&#125; &#10;!adr apply --magic &#10;!adr targetcmd !se poison @@target [[8 + @{selected|dexterity_mod} + @{selected|pb}]]|Cunning Strike (Trip),&{template:dmg&#125; {{rname=Cunning Strike: Trip Critical&#125;&#125; {{damage=1&#125;&#125; {{dmg1flag=1&#125;&#125; {{dmg1=[[ [[ceil(@{selected|level}/2)*2]]d6 ]]&#125;&#125; {{dmg1type=Slashing&#125;&#125: {{charname=@{selected|token_name}&#125;&#125; {{desc=Cost: 1d6 Sneak Attack damage. The target must make a Dexterity saving throw. On a failure&#44; it has the Prone condition.&#125;&#125; &#10;!adr apply --magic &#10;!adr target cmd !se trip @@target [[8 + @{selected|dexterity_mod} + @{selected|pb}]]|Cunning Strike (Withdraw),&{template:dmg&#125; {{rname=Cunning Strike: Withdraw Critical&#125;&#125; {{damage=1&#125;&#125; {{dmg1flag=1&#125;&#125; {{dmg1=[[ [[ceil(@{selected|level}/2)*2-1]]d6 ]]&#125;&#125; {{dmg1type=Slashing&#125;&#125: {{charname=@{selected|token_name}&#125;&#125; {{desc=Cost: 1d6 Sneak Attack damage. Immediately after the attack&#44; you move up to half your Speed without provoking Opportunity Attacks.&#125;&#125; &#10;!adr apply --magic &#10;!ae-effect disengage @{selected|token_id} &#10;!ae addmove [[floor(@{selected|speed}/2)]]}

Sap

&{template:default} {{name=Weapon Mastery: Sap}} {{Effect=Until the start of your next turn, the target has Disadvantage on its next attack roll.}}

Crossbow-Assassinate

&{template:dmg} {{rname=Assassinate}} {{damage=1}} {{dmg1flag=1}} {{dmg1=[[@{selected|level}]]}} {{dmg1type=Piercing}} {{desc=On the first round of combat, if you hit a creature that hasn't taken a turn yet, the target takes extra damage equal to your Rogue level.}}

!adr apply --magic

Katana-Assassinate

&{template:dmg} {{rname=Assassinate}} {{damage=1}} {{dmg1flag=1}} {{dmg1=[[@{selected|level}]]}} {{dmg1type=Slashing}} {{desc=On the first round of combat, if you hit a creature that hasn't taken a turn yet, the target takes extra damage equal to your Rogue level.}}

!adr apply --magic

Gutshot

&{template:default} {{name=Gutshot}} {{Trigger=When a creature is hit by the Gutshot Crossbow.}} {{Saving Throw=DC 15 Constitution}} {{Failure=The creature is Paralyzed until the end of your next turn.}} {{Usage=Once per Short Rest}}
!adr targetcmd !se gutshot @@target 15 --source @{selected|token_id}

Bonus Actions (Rogue)

&{template:default} {{name=@{selected|token_name} — Bonus Actions}} {{Options=[Dash (Cunning Action)](~selected|Cunning-Dash) [Disengage (Cunning Action)](~selected|Cunning-Disengage) [Hide (Cunning Action)](~selected|Cunning-Hide) [Steady Aim](~selected|Bonus-Steady-Aim) [Apply Poison to Weapon](~selected|Bonus-Poison-Menu) [Drink Healing Potion](~selected|Bonus-Potion-Menu) [Shadowstep](~selected|Shadowstep-Caster) [Other Bonus Action](~selected|Bonus-Other)}}

Steady-Aim

&{template:default} {{name=@{selected|token_name} — Steady Aim}} {{Bonus Action=If you haven't moved during this turn, you give yourself Advantage on your next attack roll on the current turn. After using Steady Aim, your Speed is 0 until the end of the current turn.}} 

!ae bonus 
!ae lockmove 

Cunning-Hide

&{template:default} {{name=@{selected|token_name} — Cunning Action: Hide}} {{Bonus Action=You take the Hide action as a Bonus Action and expose yourself from a hidden position while attempting to remain unnoticed.}} {{Stealth Check=?{Stealth Roll|Normal,[[1d20 + @{selected|stealth_bonus}]]|Advantage,[[2d20kh1 + @{selected|stealth_bonus}]]|Disadvantage,[[2d20kl1 + @{selected|stealth_bonus}]]}}} {{Success?=[Add Hidden](!ae-con hidden @{selected|token_id})}}
!ae bonus

Cunning-Dash

&{template:default} {{name=@{selected|token_name} — Cunning Action: Dash}} {{Bonus Action=You take the Dash action as a Bonus Action. For the rest of the current turn, your Speed increases by an amount equal to your Speed after applying any modifiers.}}
!ae bonus
!ae dash

Cunning-Disengage

&{template:default} {{name=@{selected|token_name} — Cunning Action: Disengage}} {{Bonus Action=You take the Disengage action as a Bonus Action. Your movement doesn’t provoke Opportunity Attacks for the rest of the current turn.}} 

!ae-effect disengage
!ae bonus

Bonus-Poison-Menu

/w @{selected|character_name} &{template:default} {{name=Choose Poison}} {{[Wyvern Poison](~selected|Poison-Wyvern)}} {{[Serpent Venom](~selected|Poison-Serpent-Venom)}}

Poison-Damage-Menu

?{Choose Poison|Wyvern Poison,!adr targetcmd !se damageone @@target con 15 7d6 Poison half|Serpent Venom,!adr targetcmd !se damageone @@target con 11 3d6 Poison half}

Poison-Damage-Crit-Menu

?{Choose Poison|Wyvern Poison,!adr targetcmd !se damageone @@target con 15 14d6 Poison half|Serpent Venom,!adr target cmd !se damageone @@target con 11 6d6 Poison half}

Poison-Wyvern

&{template:default} {{name=@{selected|token_name} — Wyvern Poison}} {{Bonus Action=You coat one weapon or piece of ammunition with Wyvern Poison.}} {{Effect=A creature subjected to this poison must make a DC 15 Constitution saving throw, taking 7d6 poison damage on a failed save, or half as much damage on a successful one.}}
!ae bonus


Poison-Serpent-Venom

&{template:default} {{name=@{selected|token_name} — Serpent Venom}} {{Bonus Action=You coat one weapon or piece of ammunition with Serpent Venom.}} {{Effect=A creature subjected to this poison must make a DC 11 Constitution saving throw, taking 3d6 poison damage on a failed save, or half as much damage on a successful one.}}
!ae bonus


Shadowstep-Caster

&{template:npcaction} {{name=Shadowstep}} {{description=@{selected|token_name} melts into the darkness and reappears from another shadow.}}
!scriptcard {{
--#hideTitleCard|1
--#emoteState|0
--#emoteText|
--#sourceToken|@{selected|token_id}
--:SPAWN SHADOWSTEP TARGET TOKEN|
--@forselected|smartaoe _title|Shadowstep _instant|1 _radius|0ft _aoetype|circle, float _aoeColor|#00000000 _aoeOutlineColor|#00000000 _gridcolor|#00000000 _controlTokName|Shadowstep Target _autoapply|1 _noSave|TRUE
--:STORE CASTER TOKEN ID|
--&TokenID|[*S:t-id]
--!a:@{Shadowstep Target|character_id}|!caster_ID:[&TokenID]
--:TURN ON 60FT RADIUS FOR REFERENCE|
--@forselected|token-mod _set aura1_radius|!60 aura1_color|#4b0082
--X|
}}
!ae bonus
!ae teleport

Shadowstep-Target

!scriptcard {{
--#sourceToken|@{selected|token_id}
--#hideTitleCard|1
--#emoteState|1

--:GET CASTER TOKEN ID|
--&TokenID|[*S:caster_ID]

--:VISUAL EFFECTS|
--vtoken|[&TokenID] burst-death
--vtoken|@{selected|token_id} glow-death
--a|Effulgent Sphere
--w|1

--:MOVE CASTER TOKEN AND REMOVE AURA|
--!t:[&TokenID]|aura1_radius:!60
--!t:[&TokenID]|layer:gmlayer
--w1:!t:[&TokenID]|top:[*S:t-top]|left:[*S:t-left]
--w2:!t:[&TokenID]|layer:objects

--:REAPPEAR EFFECT|
	--w2:vtoken|[&TokenID] burst-death

--:DELETE TARGET TOKEN|
--@forselected|smarttrigger
}}

VALERIUS
Bonus-Actions
&{template:default} {{name=@{selected|token_name} — Bonus Actions}} {{Options=[Witch Bolt Sustained Damage](~selected|Witch-Bolt-Sustain) [Nameless Attack](~selected|Sting) [Produce Flame](~selected|Produce-Flame-Attack) [Other Bonus Action](~selected|Bonus-Other)}}
Spells
&{template:default} {{name=@{selected|token_name} — Warlock Spells}} {{Cantrips=[Eldritch Blast](~selected|Eldritch-Blast-Attack) [Fire Bolt](~selected|Firebolt-Attack) [Shocking Grasp](~selected|Shocking-Grasp-Attack)}} {{Warlock Spells=[Witch Bolt](~selected|Witch-Bolt-Attack) [Scorching Ray](~selected|Scorching-Ray-Attack) [Burning Hands](~selected|Burning-Hands) [Fireball](~selected|Fireball) [Fire Shield](~selected|Fire-Shield) [Hold Person](~selected|Hold-Person) [Invisibility](~selected|Invisibility) [Stinking Cloud](~selected|Stinking-Cloud) [Summon Shadowspawn](~selected|Summon-Shadowspawn) [Summon Greater Demon](~selected|Summon-Greater-Demon) [Summon Lesser Demons](~selected|Summon-Lesser-Demons) [Wall of Fire](~selected|Wall-of-Fire) [Gravity Repulsion](~selected|Gravity-Repulsion)}} {{Other=[Darkness](~selected|Darkness) [Find Familiar](~selected|Find-Familiar)}}
Eldritch-Blast-Attack
!adr setslots @{selected|token_id} ray1=@{target|Beam 1|token_id} ray2=@{target|Beam 2|token_id} 

&{template:atk} {{mod=[Damage](~selected|Eldritch-Blast-Damage1" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Crit Damage](~selected|Eldritch-Blast-Crit-Damage1" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Repelling Blast](~selected|Repelling-Blast1" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;)}} {{rname=Eldritch Blast — Beam 1}} {{charname=@{selected|token_name}}} {{desc=Spell Attack.}} ?{Beam 1 Roll Type?|Normal,{{normal=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|spell_attack_mod}]]&#125;&#125;|Advantage,{{advantage=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|spell_attack_mod}]]&#125;&#125; {{r2=[[1d20cs>20 + @{selected|spell_attack_mod}]]&#125;&#125;|Disadvantage,{{disadvantage=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|spell_attack_mod}]]&#125;&#125; {{r2=[[1d20cs>20 + @{selected|spell_attack_mod}]]&#125;&#125;}

&{template:atk} {{mod=[Damage](~selected|Eldritch-Blast-Damage2" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Crit Damage](~selected|Eldritch-Blast-Crit-Damage2" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Repelling Blast](~selected|Repelling-Blast2" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;)}} {{rname=Eldritch Blast — Beam 2}} {{charname=@{selected|token_name}}} {{desc=Spell Attack.}} ?{Beam 2 Roll Type?|Normal,{{normal=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|spell_attack_mod}]]&#125;&#125;|Advantage,{{advantage=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|spell_attack_mod}]]&#125;&#125; {{r2=[[1d20cs>20 + @{selected|spell_attack_mod}]]&#125;&#125;|Disadvantage,{{disadvantage=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|spell_attack_mod}]]&#125;&#125; {{r2=[[1d20cs>20 + @{selected|spell_attack_mod}]]&#125;&#125;}

!ae spell
/fx glow-death @{selected|token_id}
Eldritch-Blast-Damage1
&{template:dmg} {{rname=Eldritch Blast Beam 1 Damage}} {{damage=1}} {{dmg1flag=1}} {{dmg1=[[1d10 + @{selected|charisma_mod}]]}} {{dmg1type=Force}} {{charname=@{selected|token_name}}}

!adr applyslot beam1 
!adr fxslot beam1 burn-death
!splay Force Blast
Eldritch-Blast-Damage2
&{template:dmg} {{rname=Eldritch Blast Beam 2 Damage}} {{damage=1}} {{dmg1flag=1}} {{dmg1=[[1d10 + @{selected|charisma_mod}]]}} {{dmg1type=Force}} {{charname=@{selected|token_name}}}
!adr applyslot beam2 
!adr fxslot beam2 burn-death
!splay Force Blast
Eldritch-Blast-Crit-Damage1
&{template:dmg} {{rname=Eldritch Blast Beam 1 Damage}} {{damage=1}} {{dmg1flag=1}} {{dmg1=[[2d10 + @{selected|charisma_mod}]]}} {{dmg1type=Force}} {{charname=@{selected|token_name}}}
!adr applyslot beam1
!adr fxslot beam1 burn-death 
!splay Force Blast
Eldritch-Blast-Crit-Damage2
&{template:dmg} {{rname=Eldritch Blast Beam 2 Damage}} {{damage=1}} {{dmg1flag=1}} {{dmg1=[[2d10 + @{selected|charisma_mod}]]}} {{dmg1type=Force}} {{charname=@{selected|token_name}}}

!adr applyslot beam2
!adr fxslot beam2 burn-death 
!splay Force Blast
Firebolt-Attack
!adr attack @{selected|token_id} @{target|Firebolt|token_id}
&{template:atk} {{mod=[Damage](~selected|Firebolt-Damage" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Crit Damage](~selected|Firebolt-Crit-Damage" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;)}} {{rname=Fire Bolt}} {{charname=@{selected|token_name}}} {{desc=Ranged Spell Attack.}} ?{Roll Type?|Normal,{{normal=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|spell_attack_mod}]]&#125;&#125;|Advantage,{{advantage=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|spell_attack_mod}]]&#125;&#125; {{r2=[[1d20cs>20 + @{selected|spell_attack_mod}]]&#125;&#125;|Disadvantage,{{disadvantage=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|spell_attack_mod}]]&#125;&#125; {{r2=[[1d20cs>20 + @{selected|spell_attack_mod}]]&#125;&#125;}
!ae spell
/fx glow-fire @{selected|token_id}
!splay Firebolt
Firebolt-Damage
&{template:dmg} {{rname=Fire Bolt Damage}} {{damage=1}} {{dmg1flag=1}} {{dmg1=[[{2d10+2d2r<1}kh2]]}} {{dmg1type=Fire}} {{charname=@{selected|token_name}}}

!adr apply --adept fire
!adr fx burn-fire
Firebolt-Crit-Damage
&{template:dmg} {{rname=Fire Bolt Critical Damage}} {{damage=1}} {{dmg1flag=1}} {{dmg1=[[{4d10+4d2r<1}kh4]]}} {{dmg1type=Fire}} {{charname=@{selected|token_name}}}

!adr apply --adept fire
!adr fx burn-fire 
Fireball
&{template:default} {{name=@{selected|token_name} — Fireball}} {{Area=20-foot radius}} {{Save=DEX vs Spell DC}} {{Damage=9d6 Fire, half on success}}
!ae-aoe cast Fireball @{selected|token_id} 20 dex spell 9d6 Fire half --adept fire
!ae spell
Darkness
&{template:default} {{name=Darkness}} {{description=@{selected|token_name} sends forth a sphere of magical darkness.}}
!ae-summon pending @{selected|token_id} Darkness --concentration
!scriptcard  {{
--#hideTitleCard|1
--#emoteState|0
--#emoteText|
--#sourceToken|@{selected|token_id}
--:SPAWN AOECONTROLTOKEN|
	--@forselected|Spawn _name|AoeControlToken _tokenName|AoeControlToken _size|1,1 _order|toFront _tokenProps|aura1_radius:15,aura1_color:#000000,showplayers_aura1:true
--:STORE CASTER TOKEN ID|
	--&TokenID|[*S:t-id]
	--!a:@{AoeControlToken|character_id}|!caster_ID:[&TokenID]
--:TURN ON CASTER 60FT REFERENCE AURA|
	--@forselected|token-mod _set aura1_radius|!60 aura1_color|#4b0082
--X|
}}
!ae spell
!ae-effect concentrate @{selected|token_id}
Shocking Grasp
!adr attack @{selected|token_id} @{target|Shocking Grasp|token_id}

&{template:atk} {{mod=[Damage](~selected|Shocking-Grasp-Damage) [Crit Damage](~selected|Shocking-Grasp-Crit-Damage)}} {{rname=Shocking Grasp}} {{charname=@{selected|token_name}}} {{desc=Melee spell attack.}} ?{Roll Type?|Normal,{{normal=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb}]]&#125;&#125;|Advantage,{{advantage=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb}]]&#125;&#125; {{r2=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb}]]&#125;&#125;|Disadvantage,{{disadvantage=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb}]]&#125;&#125; {{r2=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb}]]&#125;&#125;}
!ae spell

/fx glow-smoke @{selected|token_id}
Shocking-Grasp-Damage
&{template:dmg} {{rname=Shocking Grasp Damage}} {{damage=1}} {{dmg1flag=1}} {{dmg1=[[2d8]]}} {{dmg1type=Lightning}} {{charname=@{selected|token_name}}}

!adr apply 
!adr fx glow-frost 
Shocking-Grasp-Crit-Damage
&{template:dmg} {{rname=Shocking Grasp Critical Damage}} {{damage=1}} {{dmg1flag=1}} {{dmg1=[[4d8]]}} {{dmg1type=Lightning}} {{charname=@{selected|token_name}}}

!adr apply 
!adr fx glow-frost 
Fire-Shield
&{template:default} {{name=@{selected|token_name} — Fire Shield}} {{Effect=Flames erupt around @{selected|token_name}, wreathing them in a mantle of elemental fire. The shield blazes with either searing heat or biting cold, burning those foolish enough to strike from arm’s reach.}}
!ae spell
?{Shield Type|Warm Shield,!ae-effect fireshieldwarm @{selected|token_id} &#10;!ae-visual pending @{selected|token_id} Fire_Shield fireshieldwarm &#10;!Spawn &#123;&#123; --name&#124;Fire Shield --size&#124;3&#44;3 --layer&#124;map &#125;&#125;|Chill Shield,!ae-effect fireshieldchill @{selected|token_id} &#10;!ae-visual pending @{selected|token_id} Cold_Shield fireshieldchill &#10;!Spawn &#123;&#123; --name&#124;Cold Shield --size&#124;3&#44;3 --layer&#124;map &#125;&#125;}
Burning-Hands
&{template:default} {{name=@{selected|token_name} — Burning Hands}} {{Effect=Flames surge from @{selected|token_name}'s outstretched hands in a 15-foot cone. Creatures caught in the blaze make a Dexterity saving throw, taking 6d6 Fire damage on a failed save, or half as much on a success. Flammable objects in the cone that aren’t worn or carried ignite.}}
!boom cone @{selected|token_id} 15 53.14 dex spell 6d6 Fire half --source @{selected|token_id} --adept fire --title Burning Hands --facing caster --color #ff6600 --fill rgba(255,102,0,0.20) --applyAbility Burning-Hands-Apply
!ae spell
Burning-Hands-Apply
/fx breath-fire @{selected|token_id}
Wall-of-Fire
&{template:default} {{name=@{selected|token_name} — Wall of Fire}} {{Effect=You create an opaque wall of fire. When the wall appears, each creature in its area makes a Dexterity saving throw, taking 5d8 Fire damage on a failed save or half as much on a success. One side of the wall deals 5d8 Fire damage to creatures that enter it for the first time on a turn or end their turn within 10 feet of that side or inside the wall.}}

!boom wall @{selected|token_id} 60 5 dex spell 5d8 Fire half --source @{selected|token_id} –adept fire --title Wall of Fire --facing template --color #ff3300 --fill rgba(255,51,0,0.25) --applyAbility Wall-of-Fire-Apply
!ae spell
!ae-effect concentrate @{selected|token_id}
Wall-of-Fire-Apply
!Spawn {{ --name|Wall of Fire --size|14,3 --layer|map --concentration --hazard|directional --shape|rect --side|top --range|10 --damage|5d8 --type|Fire --trigger|enter,endTurn }}
Find-Familiar
&{template:default} {{name=Find Familiar}} {{description=@{selected|token_name} yanks his unpaid intern Nameless from his PTO in Hell to an unoccupied space within 10 feet.}}
!scriptcard  {{ 
--#hideTitleCard|1
--#emoteState|0
--#emoteText|
--#sourceToken|@{selected|token_id}
--:SPAWN SUMMON TARGET TOKEN USING SMARTAOE API|
	--@forselected|smartaoe _title|Find Familiar _instant|1 _radius|0ft _aoetype|circle, float _aoeColor|#00000000 _aoeOutlineColor|#00000000 _gridcolor|#00000000 _controlTokName|Teleporter _autoapply|1 _noSave|TRUE
--:STORE CASTER TOKEN ID|
	--&TokenID|[*S:t-id]
	--!a:@{Teleporter|character_id}|!caster_ID:[&TokenID]
--:TURN ON 10FT RADIUS FOR REFERENCE|
	--@forselected|token-mod _set aura1_radius|!10 aura1_color|#4b0082
--X|	
}}
!ae spell
Summon-Shadowspawn
&{template:default} {{name=Summon Shadowspawn}} {{description=@{selected|token_name} summons a Shadow Spirit in an unoccupied space within 90 feet.}}
!ae-summon pending @{selected|token_id} Shadow_Spirit --concentration
!scriptcard  {{ 
--#hideTitleCard|1
--#emoteState|0
--#emoteText|
--#sourceToken|@{selected|token_id}
--:SPAWN SUMMON TARGET TOKEN USING SMARTAOE API|
	--@forselected|smartaoe _title|Summon Shadowspawn _instant|1 _radius|0ft _aoetype|circle, float _aoeColor|#00000000 _aoeOutlineColor|#00000000 _gridcolor|#00000000 _controlTokName|Teleporter _autoapply|1 _noSave|TRUE
--:STORE CASTER TOKEN ID|
	--&TokenID|[*S:t-id]
	--!a:@{Teleporter|character_id}|!caster_ID:[&TokenID]
--:TURN ON 90FT RADIUS FOR REFERENCE|
	--@forselected|token-mod _set aura1_radius|!90 aura1_color|#4b0082
}}
!ae spell
!ae-effect concentrate @{selected|token_id}
Hold-Person
&{template:default} {{name=Hold Person}} {{Targets=[1 Target](~selected|Hold-Person-1) [2 Targets](~selected|Hold-Person-2) [3 Targets](~selected|Hold-Person-3)}}
Hold-Person-1
&{template:default} {{name=Hold Person}} {{Spell=One humanoid makes a Wisdom save or becomes Paralyzed. Concentration.}}
!se holdperson @{target|Hold Person Target 1|token_id} spell --source @{selected|token_id}
!ae spell
Hold-Person-2
&{template:default} {{name=Hold Person}} {{Spell=Two humanoids make Wisdom saves or become Paralyzed. Concentration.}}
!se holdperson @{target|Hold Person Target 1|token_id} spell --source @{selected|token_id}
!se holdperson @{target|Hold Person Target 2|token_id} spell --source @{selected|token_id}
!ae spell
Hold-Person-3
&{template:default} {{name=Hold Person}} {{Spell=Two humanoids make Wisdom saves or become Paralyzed. Concentration.}}
!se holdperson @{target|Hold Person Target 1|token_id} spell --source @{selected|token_id}
!se holdperson @{target|Hold Person Target 2|token_id} spell --source @{selected|token_id}
!ae spell
Invisibility
&{template:default} {{name=Invisibility}} {{Targets=[1 Target](~selected|Invisibility-1) [2 Targets](~selected|Invisibility-2) [3 Targets](~selected|Invisibility-3)}}
Invisibility-1
&{template:default} {{name=Invisibility}} {{Spell=One creature becomes Invisible. Concentration.}}
!ae-con invisible @{target|Invisibility Target 1|token_id} --duration concentration --source @{selected|token_id}
!ae spell
Invisibility-2
&{template:default} {{name=Invisibility}} {{Spell=Level 4. Two creatures become Invisible. Concentration.}}
!ae-con invisible @{target|Invisibility Target 1|token_id} --duration concentration --source @{selected|token_id}
!ae-con invisible @{target|Invisibility Target 2|token_id} --duration concentration --source @{selected|token_id}
!ae spell
Invisibility-3
&{template:default} {{name=Invisibility}} {{Spell=Level 4. Three creatures become Invisible. Concentration.}}
!ae-con invisible @{target|Invisibility Target 1|token_id} --duration concentration --source @{selected|token_id}
!ae-con invisible @{target|Invisibility Target 2|token_id} --duration concentration --source @{selected|token_id}
!ae-con invisible @{target|Invisibility Target 3|token_id} --duration concentration --source @{selected|token_id}
!ae spell
Repelling-Blast1
&{template:default} {{name=Repelling Blast}} {{Effect=When you hit a Large or smaller creature with Eldritch Blast, you can push that creature up to 10 feet straight away from you.}}
!adr targetcmdslot beam1 !ae push @@target 10
Scorching-Ray-Attack
!adr setslots @{selected|token_id} ray1=@{target|Scorching Ray 1|token_id} ray2=@{target|Scorching Ray 2|token_id} ray3=@{target|Scorching Ray 3|token_id} ray4=@{target|Scorching Ray 4|token_id} ray5=@{target|Scorching Ray 5|token_id}
&{template:atk} {{mod=[Damage](~selected|Scorching-Ray-Damage1" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Crit Damage](~selected|Scorching-Ray-Crit-Damage1" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;)}} {{rname=Scorching Ray 1}} {{charname=@{selected|token_name}}} ?{Ray 1 Roll Type?|Normal,{{normal=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb}]]&#125;&#125;|Advantage,{{advantage=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb}]]&#125;&#125; {{r2=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb}]]&#125;&#125;|Disadvantage,{{disadvantage=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb}]]&#125;&#125; {{r2=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb}]]&#125;&#125;}
&{template:atk} {{mod=[Damage](~selected|Scorching-Ray-Damage2" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Crit Damage](~selected|Scorching-Ray-Crit-Damage2" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;)}} {{rname=Scorching Ray 2}} {{charname=@{selected|token_name}}} ?{Ray 2 Roll Type?|Normal,{{normal=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb}]]&#125;&#125;|Advantage,{{advantage=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb}]]&#125;&#125; {{r2=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb}]]&#125;&#125;|Disadvantage,{{disadvantage=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb}]]&#125;&#125; {{r2=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb}]]&#125;&#125;}
&{template:atk} {{mod=[Damage](~selected|Scorching-Ray-Damage3" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Crit Damage](~selected|Scorching-Ray-Crit-Damage3" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;)}} {{rname=Scorching Ray 3}} {{charname=@{selected|token_name}}} ?{Ray 3 Roll Type?|Normal,{{normal=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb}]]&#125;&#125;|Advantage,{{advantage=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb}]]&#125;&#125; {{r2=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb}]]&#125;&#125;|Disadvantage,{{disadvantage=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb}]]&#125;&#125; {{r2=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb}]]&#125;&#125;}
&{template:atk} {{mod=[Damage](~selected|Scorching-Ray-Damage4" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Crit Damage](~selected|Scorching-Ray-Crit-Damage4" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;)}} {{rname=Scorching Ray 4}} {{charname=@{selected|token_name}}} ?{Ray 4 Roll Type?|Normal,{{normal=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb}]]&#125;&#125;|Advantage,{{advantage=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb}]]&#125;&#125; {{r2=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb}]]&#125;&#125;|Disadvantage,{{disadvantage=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb}]]&#125;&#125; {{r2=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb}]]&#125;&#125;}
&{template:atk} {{mod=[Damage](~selected|Scorching-Ray-Damage5" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;) [Crit Damage](~selected|Scorching-Ray-Crit-Damage5" style&#61;"display:inline-block;border:1px solid #444;background-color:#111;padding:5px 8px;margin:2px 4px 2px 0px;box-shadow:none;color:#d8d8d8;font-size:12px;font-family:Arial,sans-serif;font-weight:600;text-decoration:none;border-radius:4px;)}} {{rname=Scorching Ray 5}} {{charname=@{selected|token_name}}} ?{Ray 5 Roll Type?|Normal,{{normal=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb}]]&#125;&#125;|Advantage,{{advantage=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb}]]&#125;&#125; {{r2=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb}]]&#125;&#125;|Disadvantage,{{disadvantage=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb}]]&#125;&#125; {{r2=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb}]]&#125;&#125;}
!ae spell
Scorching-Ray-Damage
&{template:dmg} {{rname=Scorching Ray 1 Damage}} {{damage=1}} {{dmg1flag=1}} {{dmg1=[[{2d6+2d2r<1}kh2]]}} {{dmg1type=Fire}} {{charname=@{selected|token_name}}}
!adr applyslot ray1 --adept fire
!adr fxslot ray1 burn-fire
Scorching-Ray-Crit-Damage
&{template:dmg} {{rname=Scorching Ray 1 Critical Damage}} {{damage=1}} {{dmg1flag=1}} {{dmg1=[[{4d6+4d2r<1}kh4]]}} {{dmg1type=Fire}} {{charname=@{selected|token_name}}}
!adr applyslot ray1 --adept fire
!adr fxslot ray1 burn-fire
Witch-Bolt
!adr attack @{selected|token_id} @{target|Witch Bolt|token_id}
&{template:atk} {{mod=[Damage](~selected|Witch-Bolt-Damage) [Crit Damage](~selected|Witch-Bolt-Crit-Damage) [Sustain](~selected|Witch-Bolt-Sustain)}} {{rname=Witch Bolt}} {{charname=@{selected|token_name}}} {{desc=Level 4 ranged spell attack. Concentration.}} ?{Roll Type?|Normal,{{normal=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb}]]&#125;&#125;|Advantage,{{advantage=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb}]]&#125;&#125; {{r2=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb}]]&#125;&#125;|Disadvantage,{{disadvantage=1&#125;&#125; {{r1=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb}]]&#125;&#125; {{r2=[[1d20cs>20 + @{selected|charisma_mod} + @{selected|pb}]]&#125;&#125;}
!ae-effect concentrate
!ae spell
Witch-Bolt-Damage
&{template:dmg} {{rname=Witch Bolt Damage}} {{damage=1}} {{dmg1flag=1}} {{dmg1=[[5d12]]}} {{dmg1type=Lightning}} {{charname=@{selected|token_name}}}

!adr apply @{target|Witch Bolt|token_id}
Witch-Bolt-Crit-Damage
&{template:dmg} {{rname=Witch Bolt Critical Damage}} {{damage=1}} {{dmg1flag=1}} {{dmg1=[[10d12]]}} {{dmg1type=Lightning}} {{charname=@{selected|token_name}}}

!adr apply @{target|Witch Bolt|token_id}
Witch-Bolt-Sustain
&{template:dmg} {{rname=Witch Bolt Sustained Damage}} {{damage=1}} {{dmg1flag=1}} {{dmg1=[[1d12]]}} {{dmg1type=Lightning}} {{charname=@{selected|token_name}}}

!adr apply @{target|Witch Bolt|token_id}
!ae bonus
