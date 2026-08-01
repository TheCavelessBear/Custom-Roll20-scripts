##Darkness##

Caster Token Action:

&{template:default} {{name=Darkness}} {{description=@{selected|token_name} sends forth a sphere of magical darkness.}}

!ae-summon pending @{selected|token_id} Darkness --concentration

!scriptcard  {{
--#hideTitleCard|1
--#emoteState|0
--#emoteText|
--#sourceToken|@{selected|token_id}

--:SPAWN AOECONTROLTOKEN|
	--@forselected|Spawn _name|Darkness Target _tokenName|Darkness Target _size|1,1 _order|toFront _tokenProps|aura1_radius:15,aura1_color:#000000,showplayers_aura1:true

--:STORE CASTER TOKEN ID|
	--&TokenID|[*S:t-id]
	--!a:@{AoeControlToken|character_id}|!caster_ID:[&TokenID]

--:TURN ON CASTER 60FT REFERENCE AURA|
	--@forselected|token-mod _set aura1_radius|!60 aura1_color|#4b0082

--X|
}}

!ae spell
!ae-effect concentrate @{selected|token_id}

Target Token Action:

!scriptcard  {{ 
--#sourceToken|@{selected|token_id}
--#hideTitleCard|1
--#emoteState|1

--:GET CASTER TOKEN ID|
	--&TokenID|[*S:caster_ID]

--:PLAY SOUND|
	--a|Cloudkill

--:REMOVE CASTER AURA|
    --!t:[&TokenID]|aura1_radius:!60

--:CAST DARKNESS USING SMARTAOE API|
    --@forselected|Spawn _name|Darkness _layer|foreground _size|6,6 _order|toFront _fx|burst-death _deleteSource|yes
}}

##Find-Familiar##

Caster Token Action:

&{template:default} {{name=Find Familiar}} {{description=@{selected|token_name} yanks his unpaid intern Nameless from his vacation in Hell to serve his master.}}

!scriptcard  {{ 
--#hideTitleCard|1
--#emoteState|0
--#emoteText|
--#sourceToken|@{selected|token_id}

--:SPAWN SUMMON TARGET TOKEN|
	--@forselected|Spawn _name|Summon Nameless Target _qty|1 _placement|stack _size|1,1 _layer|objects _tokenName|Summon Nameless Target _mook|yes _order|toFront

--:STORE CASTER TOKEN ID|
	--&TokenID|[*S:t-id]
	--!a:@{Summon Nameless Target|character_id}|!caster_ID:[&TokenID]

--:TURN ON 10FT RADIUS FOR REFERENCE|
	--@forselected|token-mod _set aura1_radius|!10 aura1_color|#4b0082

--X|	
}}

!ae spell

Target Token Action:

!scriptcard  {{ 
--#sourceToken|@{selected|token_id}
--#hideTitleCard|1
--#emoteState|1

--:GET CASTER TOKEN ID|
	--&TokenID|[*S:caster_ID]

--:CHOOSE INITIATIVE MODE|
	--&InitMode|?{Are you placing Nameless into initiative?|No,none|Yes,caster}

--:PLAY SOUND|
        --a|Summon Nameless 2

--:VISUAL EFFECTS|
	--vtoken|@{selected|token_id} glow-fire

--:REGISTER FAMILIAR WITH AE|
	--@ae-summon|pending [&TokenID] Nameless _count 1 _timeout 600 _initiative [&InitMode]

--:REMOVE CASTER AURA|
    --!t:[&TokenID]|aura1_radius:!10

--:SUMMON FAMILIAR USING SPAWNDEFAULTTOKEN|
    --@forselected|Spawn _name|Nameless _qty|1 _placement|stack _size|.5,.5 _layer|objects _tokenName|Nameless _mook|yes _order|toFront _fx|burst-fire _deleteSource|yes
}}

##Fireball##

Caster Token Action:

&{template:default} {{name=@{selected|token_name} — Fireball}} {{Area=20-foot radius}} {{Save=DEX vs Spell DC}} {{Damage=9d6 Fire, half on success}}
!ae-aoe cast Fireball @{selected|token_id} 20 dex spell 9d6 Fire half --adept fire
!ae spell

Target Token Action:

!splay Fireball
/fx Fireball @{selected|token_id}
!ae-aoe trigger @{selected|token_id}

##Misty-Step##

Caster Token Action:

&{template:default} {{name=Misty Step}} {{description=@{selected|token_name} vanishes in a swirl of silver mist and reappears nearby!}}

!scriptcard  {{ 
--#hideTitleCard|1
--#emoteState|0
--#emoteText|
--#sourceToken|@{selected|token_id}

--:SPAWN MISTY STEP TOKEN USING SMARTAOE API|
	--@forselected|smartaoe _title|Misty Step _instant|1 _radius|0ft _aoetype|circle, float _aoeColor|#00000000 _aoeOutlineColor|#00000000 _gridcolor|#00000000 _controlTokName|Teleporter _autoapply|1 _noSave|TRUE

--:GET AND STORE CASTER TOKEN ID ONTO MISTY STEP TOKEN FOR LATER USE|
	--&TokenID|[*S:t-id]
	--!a:@{Teleporter|character_id}|!caster_ID:[&TokenID]

--:TURN ON 30FT RADIUS FOR REFERENCE|
	--@forselected|token-mod _set aura1_radius|!30 aura1_color|#9fc5e8

--X|	
}}

Target Token Action:

!scriptcard  {{ 
--#sourceToken|@{selected|token_id}
--#hideTitleCard|1
--#emoteState|1
--:GET COORDINATES|
	--=SeltopCord|[*S:t-top]
	--=SelleftCord|[*S:t-left]
--:PLAY SOUND|
	--a|Misty Step 2
--:GET CASTER TOKEN ID|
	--&TokenID|[*S:caster_ID]
--:VISUAL EFFECTS|
	--vtoken|[&TokenID] burst-smoke
	--vtoken|@{selected|token_id} glow-smoke
	
--:MOVE CASTER TOKEN AND REMOVE AURA|
	--!t:[&TokenID]|aura1_radius:!30
	--!t:[&TokenID]|layer:gmlayer
	--w1:!t:[&TokenID]|top:[*S:t-top]|left:[*S:t-left]
	--w2:!t:[&TokenID]|layer:objects

--:REAPPEAR EFFECT|
	--w2:vtoken|[&TokenID] burst-smoke

--:DELETE TARGET TOKEN|
	--@forselected|smarttrigger
}}

##Stinking-Cloud##

Caster Token Action:

&{template:default} {{name=Stinking Cloud}} {{description=@{selected|token_name} creates a sphere of yellow, nauseating gas.}}

!ae-summon pending @{selected|token_id} Stinking_Cloud --concentration

!scriptcard  {{
--#hideTitleCard|1
--#emoteState|0
--#emoteText|
--#sourceToken|@{selected|token_id}

--:SPAWN AOECONTROLTOKEN|
	--@forselected|Spawn _name|AoEControlToken _tokenName|AoEControlToken _size|1,1 _order|toFront _tokenProps|aura1_radius:20,aura1_color:#b5a642,showplayers_aura1:true

--:STORE CASTER TOKEN ID|
	--&TokenID|[*S:t-id]
	--!a:@{AoEControlToken|character_id}|!caster_ID:[&TokenID]

--:TURN ON CASTER 90FT REFERENCE AURA|
	--@forselected|token-mod _set aura1_radius|!90 aura1_color|#b5a642

--X|
}}

!ae spell
!ae-effect concentrate @{selected|token_id}

Target Token Action:

!scriptcard  {{ 
--#sourceToken|@{selected|token_id}
--#hideTitleCard|1
--#emoteState|1

--:GET CASTER TOKEN ID|
	--&TokenID|[*S:caster_ID]

--:PLAY SOUND|
	--a|Cloudkill

--:REMOVE CASTER AURA|
    --!t:[&TokenID]|aura1_radius:!90

--:REGISTER STINKING CLOUD HAZARD|
    --@ae-hazard|add @{selected|token_id} StinkingCloud 20 con 16 stinkingpoisoned endOfTurn [&TokenID]

--:PLACE STINKING CLOUD|
    --@forselected|Spawn _name|Stinking Cloud _layer|foreground _size|8,8 _order|toFront

--:HIDE CONTROL TOKEN|
    --@token-mod|_ids @{selected|token_id} _set layer|gmlayer aura1_radius|!20
}}

##Summon-Greater-Demon##

Caster Token Action:

&{template:default} {{name=@{selected|token_name} — Summon Greater Demons}} {{Range=60 ft}} {{Blood Circle=[Form](~selected|Form-Circle)}} {{Description=@{selected|token_name} utters foul words, tearing open a brief wound to the chaos of the Abyss. A 60-foot summoning boundary burns around the caster as the air curdles with the stink of blood, smoke, and sulfur.}}

!scriptcard {{
--#hidecard|1
--#emoteState|0
--#sourceToken|@{selected|token_id}

--:SPAWN SUMMON DEMON TARGET|
	--@forselected|Spawn _name|Summon Greater Demon Target _qty|1 _placement|stack _size|1,1 _layer|objects _tokenName|Summon Greater Demon Target _mook|yes _order|toFront

--:STORE CASTER TOKEN ID ON LOCATOR CHARACTER|
	--&CasterID|[*S:t-id]
	--!a:@{Summon Greater Demon Target|character_id}|!caster_ID:[&CasterID]|!sgd_active:1

--:TURN ON 60FT SUMMONING AURA|
	--@forselected|token-mod _set aura1_radius|60 aura1_color|#990000 showplayers_aura1|true

--X|
}}

!ae spell
!ae-effect concentrate @{selected|token_id}
!splay Summon Demons

Target Token Action:

!scriptcard {{
--#sourceToken|@{selected|token_id}
--#hidecard|1
--#emoteState|0

--:GET CASTER TOKEN ID|
	--&CasterID|[*S:caster_ID]

--:CHOOSE DEMON|
	--&DemonChoice|?{Demon Type|Shadow Demon,shadow|Barlgura,barlgura|Tanarukk,tanarukk|Babau,babau}

--:TRUE NAME QUERY|
	--&SaveMode|?{Do you speak the demon's true name?|No,normal|Yes,disadvantage}

--:ROUTE DEMON CHOICE|
	--c[&DemonChoice]|shadow:SHADOWDEMON|barlgura:BARLGURA|tanarukk:TANARUKK|babau:BABAU

--:SHADOWDEMON|
	--&DemonName|Shadow Demon
	--&DemonKey|Shadow_Demon
	--&DemonSize|1.25,1.25
	--&DemonFX|burn-death
	--^SUMMONDEMON|

--:BARLGURA|
	--&DemonName|Barlgura
	--&DemonKey|Barlgura
	--&DemonSize|2.25,2.25
	--&DemonFX|burst-fire
	--^SUMMONDEMON|

--:TANARUKK|
	--&DemonName|Tanarukk
	--&DemonKey|Tanarukk
	--&DemonSize|1.25,1.25
	--&DemonFX|burst-fire
	--^SUMMONDEMON|

--:BABAU|
	--&DemonName|Babau
	--&DemonKey|Babau
	--&DemonSize|1,1
	--&DemonFX|burn-death
	--^SUMMONDEMON|

--:SUMMONDEMON|
	--@ae-summon|pending [&CasterID] [&DemonKey] _count 1 _timeout 600 _concentration _initiative roll _controlSave cha _dc spell _saveTiming endOfTurn _saveMode [&SaveMode] _success uncontrolled _failure controlled _lingerOnConcentrationEnd 1d6 _label Demon_Control
	--a|Maw Demon
	--@forselected|Spawn _name|[&DemonName] _qty|1 _placement|stack _size|[&DemonSize] _layer|objects _tokenName|[&DemonName] _mook|yes _order|toFront _fx|[&DemonFX] _deleteSource|yes
	--!t:[&CasterID]|aura1_radius:!60|showplayers_aura1:false
	--X|
}}

##Summon-Lesser-Demons##

Caster Token Action:

&{template:default} {{name=@{selected|token_name} — Summon Lesser Demons}} {{Range=60 ft}} {{Roll=[[1d6]]}} {{1–2=Two Maw Demons}} {{3–4=Four Cacklers}} {{5–6=Eight Dretches}} {{Blood Circle=[Form](~selected|Form-Circle)}} {{Description=@{selected|token_name} utters foul words, tearing open a brief wound to the chaos of the Abyss. A 60-foot summoning boundary burns around the caster as the air curdles with the stink of blood, smoke, and sulfur.}}

!scriptcard {{
--#hidecard|1
--#emoteState|0
--#sourceToken|@{selected|token_id}

--:SPAWN SUMMON DEMON TARGET|
	--@forselected|Spawn _name|Summon Lesser Demon Target _qty|1 _placement|stack _size|1,1 _layer|objects _tokenName|Summon Demon Target _mook|yes _order|toFront

--:STORE CASTER TOKEN ID ON LOCATOR CHARACTER|
	--&CasterID|[*S:t-id]
	--!a:@{Summon Lesser Demon Target|character_id}|!caster_ID:[&CasterID]|!sl_session:0|!sl_type:|!sl_remaining:0|!sl_total:0

--:TURN ON 60FT SUMMONING AURA|
	--@forselected|token-mod _set aura1_radius|60 aura1_color|#990000 showplayers_aura1|true

--X|
}}

!ae spell
!ae-effect concentrate @{selected|token_id}
!splay Summon Demons

Target Token Action:

Summon-Cackler:

!scriptcard {{
--#sourceToken|@{selected|token_id}
--#hidecard|1
--#emoteState|0

--:GET STORED SESSION DATA|
	--&CasterID|[*S:caster_ID]
	--&Session|[*S:sl_session:::0]
	--&Type|[*S:sl_type:::]
	--&Remaining|[*S:sl_remaining:::0]

--:START SESSION IF NEEDED|
	--c[&Session]|0:STARTCACKLER|1:CHECKCACKLER

--:STARTCACKLER|
	--&Type|Cackler
	--&Remaining|4
	--!a:@{selected|character_id}|!sl_session:1|!sl_type:Cackler|!sl_remaining:4|!sl_total:4
	--@ae-summon|pending [&CasterID] Cackler _count 4 _timeout 600 _concentration _initiative group
	--^PLACECACKLER|

--:CHECKCACKLER|
	--c[&Type]|Cackler:PLACECACKLER
	--*Wrong Summon Type|This locator is already placing [&Type]. Finish that summon before using another summon action.
	--X|

--:PLACECACKLER|
	--=NewRemaining|[&Remaining] - 1
	--!a:@{selected|character_id}|!sl_remaining:[$NewRemaining]
	--c[$NewRemaining]|0:FINALCACKLER|1:CONTINUECACKLER|2:CONTINUECACKLER|3:CONTINUECACKLER

--:CONTINUECACKLER|
	--a|Cackler
	--@forselected|Spawn _name|Cackler _qty|1 _placement|stack _size|1,1 _layer|objects _tokenName|Cackler _mook|yes _order|toFront _bringSourceToFront|yes _fx|burn-fire
	--X|

--:FINALCACKLER|
	--a|Cackler
	--@forselected|Spawn _name|Cackler _qty|1 _placement|stack _size|1,1 _layer|objects _tokenName|Cackler _mook|yes _order|toFront _fx|burn-fire _deleteSource|yes
	--!t:[&CasterID]|aura1_radius:!60|showplayers_aura1:false
	--X|
}}

Summon-Dretch

!scriptcard {{
--#sourceToken|@{selected|token_id}
--#hidecard|1
--#emoteState|0

--:GET STORED SESSION DATA|
	--&CasterID|[*S:caster_ID]
	--&Session|[*S:sl_session:::0]
	--&Type|[*S:sl_type:::]
	--&Remaining|[*S:sl_remaining:::0]

--:START SESSION IF NEEDED|
	--c[&Session]|0:STARTDRETCH|1:CHECKDRETCH

--:STARTDRETCH|
	--&Type|Dretch
	--&Remaining|8
	--!a:@{selected|character_id}|!sl_session:1|!sl_type:Dretch|!sl_remaining:8|!sl_total:8
	--@ae-summon|pending [&CasterID] Dretch _count 8 _timeout 900 _concentration _initiative group
	--^PLACEDRETCH|

--:CHECKDRETCH|
	--c[&Type]|Dretch:PLACEDRETCH
	--*Wrong Summon Type|This locator is already placing [&Type]. Finish that summon before using another summon action.
	--X|

--:PLACEDRETCH|
	--=NewRemaining|[&Remaining] - 1
	--!a:@{selected|character_id}|!sl_remaining:[$NewRemaining]
	--c[$NewRemaining]|0:FINALDRETCH|1:CONTINUEDRETCH|2:CONTINUEDRETCH|3:CONTINUEDRETCH|4:CONTINUEDRETCH|5:CONTINUEDRETCH|6:CONTINUEDRETCH|7:CONTINUEDRETCH

--:CONTINUEDRETCH|
	--a|Dretch
	--@forselected|Spawn _name|Dretch _qty|1 _placement|stack _size|1,1 _layer|objects _tokenName|Dretch _mook|yes _order|toFront _bringSourceToFront|yes _fx|burn-fire
	--X|

--:FINALDRETCH|
	--a|Dretch
	--@forselected|Spawn _name|Dretch _qty|1 _placement|stack _size|1,1 _layer|objects _tokenName|Dretch _mook|yes _order|toFront _fx|burn-fire _deleteSource|yes
	--!t:[&CasterID]|aura1_radius:!60|showplayers_aura1:false
	--X|
}}

Summon-Maw-Demon

!scriptcard {{
--#sourceToken|@{selected|token_id}
--#hidecard|1
--#emoteState|0

--:GET STORED SESSION DATA|
	--&CasterID|[*S:caster_ID]
	--&Session|[*S:sl_session:::0]
	--&Type|[*S:sl_type:::]
	--&Remaining|[*S:sl_remaining:::0]

--:START SESSION IF NEEDED|
	--c[&Session]|0:STARTMAW|1:CHECKMAW

--:STARTMAW|
	--&Type|Maw_Demon
	--&Remaining|2
	--!a:@{selected|character_id}|!sl_session:1|!sl_type:Maw_Demon|!sl_remaining:2|!sl_total:2
	--@ae-summon|pending [&CasterID] Maw_Demon _count 2 _timeout 600 _concentration _initiative group
	--^PLACEMAW|

--:CHECKMAW|
	--c[&Type]|Maw_Demon:PLACEMAW
	--*Wrong Summon Type|This locator is already placing [&Type]. Finish that summon before using another summon action.
	--X|

--:PLACEMAW|
	--=NewRemaining|[&Remaining] - 1
	--!a:@{selected|character_id}|!sl_remaining:[$NewRemaining]
	--c[$NewRemaining]|0:FINALMAW|1:CONTINUEMAW

--:CONTINUEMAW|
	--a|Maw Demon
	--@forselected|Spawn _name|Maw Demon _qty|1 _placement|stack _size|1,1 _layer|objects _tokenName|Maw Demon _mook|yes _order|toFront _bringSourceToFront|yes _fx|burn-fire
	--X|

--:FINALMAW|
	--a|Maw Demon
	--@forselected|Spawn _name|Maw Demon _qty|1 _placement|stack _size|1,1 _layer|objects _tokenName|Maw Demon _mook|yes _order|toFront _fx|burn-fire _deleteSource|yes
	--!t:[&CasterID]|aura1_radius:!60|showplayers_aura1:false
	--X|
}}

##Summon-Shadowspawn##

Caster Token Action:

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

Target Token Action:

!scriptcard  {{ 
--#sourceToken|@{selected|token_id}
--#hideTitleCard|1
--#emoteState|1

--:GET CASTER TOKEN ID|
	--&TokenID|[*S:caster_ID]

--:PLAY SOUND|
	--a|Windy Impact

--:VISUAL EFFECTS|
	--vtoken|@{selected|token_id} glow-death
	--w|1

--:REMOVE CASTER AURA|
	--!t:[&TokenID]|aura1_radius:!90

--:SUMMON SHADOW SPIRIT AND DELETE TELEPORTER|
	--@forselected|Spawn _name|Shadow Spirit _order|toFront _fx|burst-death _deleteSource|yes
}}

##Find-Steed##

Caster Token Action:

&{template:default} {{name=Find Steed}} {{description=@{selected|token_name} summons an otherworldly steed in an unoccupied space within 30 feet.}}

!scriptcard  {{ 
--#hideTitleCard|1
--#emoteState|0
--#emoteText|
--#sourceToken|@{selected|token_id}

--:SPAWN SUMMON TARGET TOKEN USING SMARTAOE API|
	--@forselected|smartaoe _title|Find Steed _instant|1 _radius|0ft _aoetype|circle, float _aoeColor|#00000000 _aoeOutlineColor|#00000000 _gridcolor|#00000000 _controlTokName|Find Steed Target _autoapply|1 _noSave|TRUE

--:STORE CASTER TOKEN ID|
	--&TokenID|[*S:t-id]
	--!a:@{Find Steed Target|character_id}|!caster_ID:[&TokenID]

--:TURN ON 30FT RADIUS FOR REFERENCE|
	--@forselected|token-mod _set aura1_radius|!30 aura1_color|#f1c232
}}

Target Token Action:

!scriptcard  {{ 
--#sourceToken|@{selected|token_id}
--#hideTitleCard|1
--#emoteState|1

--:GET CASTER TOKEN ID|
	--&TokenID|[*S:caster_ID]

--:PLAY SOUND|
	--a|Effulgent Sphere

--:VISUAL EFFECTS|
	--vtoken|@{selected|token_id} glow-holy
	--w|1

--:REMOVE CASTER AURA|
	--!t:[&TokenID]|aura1_radius:!30

--:SUMMON OTHERWORLDLY STEED AND DELETE TARGET TOKEN|
	--@forselected|Spawn _name|Otherworldly Steed _side|?{Steed Type|Celestial,1|Fiend,2|Fey,3} _size|2,2 _order|toBack _fx|burst-holy _deleteSource|yes
}}

##Cloudkill##

Caster Token Action:

&{template:default} {{name=Cloudkill}} {{description=@{selected|token_name} creates a  sphere of poisonous green fog.}}

!ae-summon pending @{selected|token_id} Cloudkill --concentration

!scriptcard  {{
--#hideTitleCard|1
--#emoteState|0
--#emoteText|
--#sourceToken|@{selected|token_id}

--:SPAWN AOECONTROLTOKEN|
    --@forselected|Spawn _name|Cloudkill Target _tokenName|Cloudkill Target _size|1,1 _order|toFront _tokenProps|aura1_radius:20,aura1_color:#93a84f,showplayers_aura1:true

--:STORE CASTER TOKEN ID|
    --&TokenID|[*S:t-id]
    --!a:@{Cloudkill Target|character_id}|!caster_ID:[&TokenID]

--:TURN ON CASTER 120FT REFERENCE AURA|
    --@forselected|token-mod _set aura1_radius|!120 aura1_color|#93a84f

--X|
}}

!ae spell
!ae-effect concentrate @{selected|token_id}
!token-mod --set currentside|3
/fx glow-smoke @{selected|token_id}

Target Token Action:

!scriptcard  {{
--#sourceToken|@{selected|token_id}
--#hideTitleCard|1
--#emoteState|1

--:GET CASTER TOKEN ID|
    --&TokenID|[*S:caster_ID]

--:PLAY SOUND|
    --a|Cloudkill

--:REMOVE CASTER AURA|
    --!t:[&TokenID]|aura1_radius:!120

--:REGISTER CLOUDKILL HAZARD|
    --@ae-hazard|add @{selected|token_id} Cloudkill 20 con 17 none endOfTurn [&TokenID] 5d8 poison half startOfTurn,enter,endOfTurn,moveInto

--:PLACE CLOUDKILL|
    --@forselected|Spawn _name|Cloudkill _layer|foreground _size|8,8 _order|toFront

--:HIDE CONTROL TOKEN|
    --@token-mod|_ids @{selected|token_id} _set layer|gmlayer aura1_radius|!20
}}

##Shadowstep##

Caster Token Action:

&{template:npcaction} {{name=Shadowstep}} {{description=@{selected|token_name} melts into the darkness and reappears from another shadow.}} 

!scriptcard {{ 

--#hideTitleCard|1 

--#emoteState|0 

--#emoteText| 

--#sourceToken|@{selected|token_id} 

--:SPAWN SHADOWSTEP TARGET TOKEN| 

--@forselected|smartaoe _title|Shadowstep _instant|1 _radius|0ft _aoetype|circle, float _aoeColor|#00000000 _aoeOutlineColor|#00000000 _gridcolor|#00000000 _controlTokName|Teleporter _autoapply|1 _noSave|TRUE 

--:STORE CASTER TOKEN ID| 

--&TokenID|[*S:t-id] 

--!a:@{Teleporter|character_id}|!caster_ID:[&TokenID] 

--:TURN ON 60FT RADIUS FOR REFERENCE| 

--@forselected|token-mod _set aura1_radius|!60 aura1_color|#4b0082 

--X| 
}} 

!ae bonus 
!ae teleport 

Target Token Action:

!scriptcard {{ 
--#sourceToken|@{selected|token_id} 
--#hideTitleCard|1 
--#emoteState|1 

--:GET CASTER TOKEN ID| 
--&TokenID|[*S:caster_ID] 

--:VISUAL EFFECTS| 
--vtoken|[&TokenID] burst-death 
--vtoken|@{selected|token_id} glow-death 
--a|Shadowstep
--w|1 

--:MOVE CASTER TOKEN AND REMOVE AURA| 
--!t:[&TokenID]|aura1_radius:!60 
--w1:!t:[&TokenID]|top:[*S:t-top]|left:[*S:t-left] 


--:REAPPEAR EFFECT| 
--w2:vtoken|[&TokenID] burst-death 

--:DELETE TARGET TOKEN| 
--@forselected|smarttrigger 
}}