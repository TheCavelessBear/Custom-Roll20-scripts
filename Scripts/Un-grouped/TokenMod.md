TokenMod v0.8.88
TokenMod provides an interface to setting almost all settable properties of a token.
Commands
!token-mod <--help | --rebuild-help | --help-statusmarkers | --ignore-selected | --current-page | --active-pages | --api-as | --config | --on | --off | --flip | --set | --move | --report | --order> <parameter> [<parameter> ...] ... [--ids | <token_id> | [<token_id> ...]]
This command takes a list of modifications and applies them to the selected tokens (or tokens specified with --ids by a GM or Player depending on configuration).
Note: Each --option can be specified multiple times and in any order.
Note: If you are using multiple @{target|token_id} calls in a macro, and need to adjust fewer than the supplied number of token ids, simply select the same token several times. The duplicates will be removed.
Note: Anywhere you use |, you can use # instead. Sometimes this makes macros easier.
Note: You can use the {{ and }} to span multiple lines with your command for easier clarity and editing:
!token-mod {{
  --on
    flipv
    fliph
  --set
    rotation|180
    bar1|[[8d8+8]]
    light_radius|60
    light_dimradius|30
    name|"My bright token"
}}
•	--help -- Displays this help
•	--rebuild-help -- Recreated the help handout in the journal. Useful for showing updated custom status markers.
•	--help-statusmarkers -- Output just the list of known status markers into the chat.
•	--ignore-selected -- Prevents modifications to the selected tokens (only modifies tokens passed with --ids).
•	--current-page -- Only modifies tokens on the calling player's current page. This is particularly useful when passing character_ids to --ids.
•	--active-pages -- Only modifies tokens on pages where there is a player or the GM. This is particularly useful when passing character_ids to --ids.
•	--api-as <playerid> -- Sets the player id to use as the player when the API is calling the script.
•	--config -- Sets Config options.
•	--on -- Turns on any of the specified parameters (See Boolean Arguments below).
•	--off -- Turns off any of the specified parameters (See Boolean Arguments below).
•	--flip -- Flips the value of any of the specified parameters (See Boolean Arguments below).
•	--set -- Each parameter is treated as a key and value, divided by a | character. Sets the key to the value. If the value has spaces, you must enclose it ' or ". See below for specific value handling logic.
•	--move -- Moves each token in a direction and distance based on its facing.
•	--order -- Changes the ordering of tokens. Specify one of tofront, front, f, top to bring something to the front or toback, back, b, bottom to push it to the back.
•	--report -- Displays a report of what changed for each token. 
Experimental
•	--ids -- Each parameter is a Token ID, usually supplied with something like @{target|Target 1|token_id}. By default, only a GM can use this argument. You can enable players to use it as well with --config players-can-ids|on.
Token Specification
By default, any selected token is adjusted when the command is executed. Note that there is a bug where using @{target|} commands, they may cause them to get skipped.
--ids takes token ids to operate on, separated by spaces.
!token-mod --ids -Jbz-mlHr1UXlfWnGaLh -JbjeTZycgyo0JqtFj-r -JbjYq5lqfXyPE89CJVs --on showname showplayers_name
Usually, you will want to specify these with the @{target|} syntax:
!token-mod --ids @{target|1|token_id} @{target|2|token_id} @{target|3|token_id} --on showname showplayers_name
--ignore-selected can be used when you want to be sure selected tokens are not affected. This is particularly useful when specifying the id of a known token, such as moving a graphic from the gm layer to the objects layer, or coloring an object on the map.
Boolean Arguments
--on, --off and --flip options only work on properties of a token that are either true or false, usually represented as checkboxes in the User Interface. Specified properties will only be changed once, priority is given to arguments to --on first, then --off and finally to --flip.
!token-mod --on showname light_hassight --off isdrawing --flip flipv fliph
Available Boolean Properties:
showname
show_tooltip
gm_only_tooltip
showplayers_name
showplayers_bar1
showplayers_bar2
showplayers_bar3
showplayers_bar4
showplayers_aura1
showplayers_aura2
playersedit_name
playersedit_bar1
playersedit_bar2
playersedit_bar3
playersedit_bar4
playersedit_aura1
playersedit_aura2
light_otherplayers
light_hassight
isdrawing
disableSnapping
disableTokenMenu
flipv
fliph
aura1_square
aura2_square
has_bright_light_vision
has_limit_field_of_vision
has_limit_field_of_night_vision
has_directional_bright_light
has_directional_dim_light
bright_vision
has_night_vision
night_vision
emits_bright_light
emits_bright
emits_low_light
emits_low
lockMovement
Any of the booleans can be set with the --set command by passing a true or false as the value
!token-mod --set showname|yes isdrawing|no
The following are considered true values: 1, on, yes, true, sure, yup
Probabilistic Booleans
TokenMod accepts the following probabilistic values which are true some of the time and false otherwise: couldbe (true 1 in 8 times) , sometimes (true 1 in 4 times) , maybe (true 1 in 2 times), probably (true 3 in 4 times), likely (true 7 in 8 times)
Anything else is considered false.
isdrawing split properties: disableSnapping and disableTokenMenu (Jumpgate)
On Jumpgate, these two properties control the individual facets of what was handled by isdrawing. You can set disableSnapping to true to prevent a graphic from snapping to the page's grid lines while still retaining the bubbles and token menu:
!token-mod --set disableSnapping|yes
Setting disableTokenmenu to true will hide the token menu while still snapping the graphic to the grid:
!token-mod --set disableTokenMenu|yes
Setting isdrawing on Jumpgate will set both disableSnapping and disableTokenMenu. These two commands have the same effect:
!token-mod --set isdrawing|yes
!token-mod --set disableSnapping|yes disableTokenMenu|yes
If not on Jumpgate, setting either disableSnapping or disableTokenMenu will be the same as setting isdrawing. These will all be the same if not on Jumpgate:
!token-mod --set isdrawing|yes
!token-mod --set disableTokenMenu|yes
!token-mod --set disableSnapping|yes
If setting both, be sure to set the one that is more important to you second as it will set isdrawing. In this example, if not on Jumpgate, you'll end up with snapping and token menus:
!token-mod --set disableSnapping|no disableTokenMenu|yes
Updated Dynamic Lighting
has_bright_light_vision is the UDL version of light_hassight. It controls if a token can see at all, and must be turned on for a token to use UDL. You can also use the alias bright_vision.
has_night_vision controls if a token can see without emitted light around it. This was handled with light_otherplayers in the old light system. In the new light system, you don't need to be emitting light to see if you have night vision turned on. You can also use the alias night_vision.
emits_bright_light determines if the configured bright_light_distance is active or not. There wasn't a concept like this in the old system, it would be synonymous with setting the light_radius to 0, but now it's not necessary. You can also use the alias emits_bright.
emits_low_light determines if the configured low_light_distance is active or not. There wasn't a concept like this in the old system, it would be synonymous with setting the light_dimradius to 0 (kind of), but now it's not necessary. You can also use the alias emits_low.
Set Arguments
--set takes key-value pairs, separated by | characters (or # characters).
!token-mod --set key|value key|value key|value
You can use inline rolls wherever you like, including rollable tables:
!token-mod --set bar[[1d3]]_value|X statusmarkers|blue:[[1d9]]|green:[[1d9]] name:"[[1t[randomName]]]"
You can use + or - before any number to make an adjustment to the current value:
!token-mod --set bar1_value|-3 statusmarkers|blue:+1|green:-1
You can preface a + or - with an = to explicitly set the number to a negative or positive value:
!token-mod --set bar1_value|=+3 light_radius|=-10
There are several types of keys with special value formats:
Numbers
Number values can be any floating point number (though most fields will drop the fractional part). Numbers must be given a numeric value. They cannot be blank or a non-numeric string.
Available Numbers Properties:
left
top
width
height
scale
light_sensitivity_multiplier
It's probably a good idea not to set the location of a token off screen, or the width or height to 0.
Placing a token in the top left corner of the map and making it take up a 2x2 grid section:
!token-mod --set top|0 left|0 width|140 height|140
You can also apply relative change using +, -, *, and /. This will move each token one unit down, 2 units left, then make it 5 times as wide and half as tall.
!token-mod --set top|+70 left|-140 width|*5 height|/2
You can use = to explicity set a value. This is the default behavior, but you might need to use it to move something to a location off the edge using a negative number but not a relative number:
!token-mod --set top|=-140
scale is a pseudo field which adjusts both width and height with the same operation. This will scale a token to twice it's current size.
!token-mod --set scale|*2
You can follow a number by one of u, g, or s to adjust the scale that the number is applied in.
Use u to use a number based on Roll20 Units, which are 70 pixels at 100% zoom. This will set a graphic to 280x140.
!token-mod --set width|4u height|2u
Use g to use a number based on the current grid size. This will set a token to the middle of the 8th column, 4rd row grid. (.5 offset for half the center)
!token-mod --set left|7.5g top|3.5g
Use s to use a number based on the current unit if measure. (ft, m, mi, etc) This will set a token to be 25ft by 35ft (assuming ft are the unit of measure)
!token-mod --set width|25s height|35s
Currently, you can also use any of the default units of measure as alternatives to s: ft, m, km, mi, in, cm, un, hex, sq
!token-mod --set width|25ft height|35ft
Percentage
Percentage values can be a floating point number between 0 and 1.0, such as 0.35, or an integer number between 1 and 100.
Available Percentage Properties:
dim_light_opacity
Setting the low light opacity to 30%:
!token-mod --set dim_light_opacity|30
!token-mod --set dim_light_opacity|0.3
Numbers or Blank
Just like the Numbers fields, except you can set them to blank as well.
Available Numbers or Blank Properties:
light_radius
light_dimradius
light_multiplier
aura1_radius
aura2_radius
adv_fow_view_distance
night_vision_distance
night_distance
bright_light_distance
bright_distance
low_light_distance
low_distance
Here is setting a standard DnD 5e torch, turning off aura1 and setting aura2 to 30. Note that the | is still required for setting a blank value, such as aura1_radius below.
!token-mod --set light_radius|40 light_dimradius|20 aura1_radius| aura2_radius|30
Just as above, you can use =, +, -, *, and / when setting these values.
Here is setting a standard DnD 5e torch, with advanced fog of war revealed for 30.
!token-mod --set light_radius|40 light_dimradius|20 adv_fow_view_distance|30
Sometimes it is convenient to have a way to set a radius if there is none, but remove it if it is set. This allows toggling a known radius on and off, or setting a multiplier if there isn't one, but clearing it if there is. You can preface a number with ! to toggle it's value on and off. Here is an example that will add or remove a 20' radius aura 1 from a token:
!token-mod --set aura1_radius|!20
These also support the relative scale operations that Numbers support: u, g, s
!token-mod --set aura1_radius|3g aura2_radius|10u light_radius|25s
Note: light_multiplier ignores these modifiers. Additionally, the rest are already in the scale of measuring distance (s) so there is no difference between 25s, 25ft, and 25.
Updated Dynamic Lighting
night_vision_distance lets you set how far away a token can see with no light. You need to have has_night_vision turned on for this to take effect. You can also use the alias night_distance.
bright_light_distance lets you set how far bright light is emitted from the token. You need to have has_bright_light_vision turned on for this to take effect. You can also use the alias bright_distance.
low_light_distance lets you set how far low light is emitted from the token. You need to have has_bright_light_vision turned on for this to take effect. You can also use the alias low_distance.
Degrees
Any positive or negative number. Values will be automatically adjusted to be in the 0-360 range, so if you add 120 to 270, it will wrap around to 90.
Available Degrees Properties:
rotation
limit_field_of_vision_center
limit_field_of_night_vision_center
directional_bright_light_center
directional_dim_light_center
Rotating a token by 180 degrees.
!token-mod --set rotation|+180
Circle Segment (Arc)
Any Positive or negative number, with the final result being clamped to from 0-360. This is different from a degrees setting, where 0 and 360 are the same thing and subtracting 1 from 0 takes you to 359. Anything lower than 0 will become 0 and anything higher than 360 will become 360.
Available Circle Segment (Arc) Properties:
light_angle
light_losangle
limit_field_of_vision_total
limit_field_of_night_vision_total
directional_bright_light_total
directional_dim_light_total
Setting line of sight angle to 90 degrees.
!token-mod --set light_losangle|90
Colors
Colors can be specified in multiple formats:
•	Transparent -- This is the special literal transparent and represents no color at all (fully transparent).
•	HTML Color -- This is 3, 4, 6, or 8 hexadecimal digits, optionally prefaced by #. Three digits are expanded to six (each digit doubled), four digits are expanded to six (each digit doubled). Eight digits are rrggbbaa with alpha. When alpha is omitted (3 or 6 digits), it is treated as fully opaque and is not included in output; when specified (4 or 8 digits), output may be 8-digit hex if alpha is less than 1. All of the following are the same: #ff00aa, #f0a, ff00aa, f0a.
•	RGB Color -- This is an RGB color in the format rgb(1.0,1.0,1.0) or rgb(255,255,255). An optional fourth value sets alpha: rgb(1,0,0,0.5) or rgb(255,0,0,50) (decimal 0.0–1.0, integer 0–100). When omitted, alpha is 1. Decimal numbers are in the scale of 0.0 to 1.0, integer numbers are scaled 0 to 255. Note that numbers can be outside this range for the purpose of doing math.
•	HSV Color -- This is an HSV color in the format hsv(1.0,1.0,1.0) or hsv(360,100,100). An optional fourth value sets alpha (same as RGB: 0.0–1.0 or 0–100). Decimal numbers are in the scale of 0.0 to 1.0, integer numbers are scaled 0 to 360 for the hue and 0 to 100 for saturation and value (and alpha). Note that numbers can be outside this range for the purpose of doing math.
When alpha is not specified, it is assumed to be 1 (fully opaque) and is not written in the output (e.g. #ff0000 not #ff0000ff). When alpha is specified and is less than 1, the output uses 8-digit hex (e.g. #ff000080).
Available Colors Properties:
tint_color
aura1_color
aura2_color
night_vision_tint
lightColor
lightcolor
Turning off the tint and setting aura1 to a reddish color. All of the following are the same:
!token-mod --set tint_color|transparent aura1_color|ff3366
!token-mod --set tint_color| aura1_color|f36
!token-mod --set tint_color|transparent aura1_color|#f36
!token-mod --set tint_color| aura1_color|#ff3366
Setting the tint_color using an RGB Color using Integer and Decimal notations:
!token-mod --set tint_color|rgb(127,0,256)
!token-mod --set tint_color|rgb(.5,0.0,1.0)
Setting the tint_color using an HSV Color using Integer and Decimal notations:
!token-mod --set tint_color|hsv(0,50,100)
!token-mod --set tint_color|hsv(0.0,.5,1.0)
Setting a color with optional alpha (e.g. half-transparent red):
!token-mod --set aura1_color|#ff000080
!token-mod --set aura1_color|rgb(1,0,0,0.5)
You can toggle a color on and off by prefacing it with !. If the color is currently transparent, it will be set to the specified color, otherwise it will be set to transparent:
!token-mod --set tint_color|!rgb(1.0,.0,.2)
Color Math
You can perform math on colors using +, -, and *. If the color you are adding, subtracting, or multiplying by does not include alpha, the target color's alpha is left unchanged (e.g. #ff000080 − #110000 gives #ee000080). If the operand does include alpha, the same operation is applied to alpha (a target with no alpha is treated as fully opaque; e.g. #ff0000 − #11000011 gives #ee0000ee).
Making the aura just a little more red:
!token-mod --set aura1_color|+#330000
Making the aura just a little less blue:
!token-mod --set aura1_color|-rgb(0.0,0.0,0.1)
HSV colors are especially good for color math. Making the aura twice as bright:
!token-mod --set aura1_color|*hsv(1.0,1.0,2.0)
Performing math operations with a transparent color as the command argument does nothing:
!token-mod --set aura1_color|*transparent
Performing math operations on a transparent color on a token treats the color as black. Assuming a token had a transparent aura1, this would set it to #330000.
!token-mod --set aura1_color|+300
Text
These can be pretty much anything. If your value has spaces in it, you need to enclose it in ' or ".
Available Text Properties:
name
tooltip
bar1_value
bar2_value
bar3_value
bar4_value
bar1_current
bar2_current
bar3_current
bar4_current
bar1_max
bar2_max
bar3_max
bar4_max
bar1
bar2
bar3
bar4
bar1_reset
bar2_reset
bar3_reset
bar4_reset
Setting a token's name to "Sir Thomas" and bar1 value to 23.
!token-mod --set name|"Sir Thomas" bar1_value|23
Setting a bar to a numeric value will be treated as a relative change if prefaced by +, -, *, or /, or will be explicitly set when prefaced with a =. If you are setting a bar value, you can append a ! to the value to force it to be bounded between 0 and max for the bar.
bar1, bar2, bar3, and bar4 are special. Any value set on them will be set in both the _value and _max fields for that bar. This is most useful for setting hit points, particularly if the value comes from an inline roll.
!token-mod --set bar1|[[3d6+8]]
bar1_reset, bar2_reset, bar3_reset, and bar4_reset are special. Any value set on them will be ignored, instead they will set the _value field for that bar to whatever the matching _max field is set to. This is most useful for resetting hit points or resource counts like spells. (The | is currently still required.)
!token-mod --set bar1_reset| bar3_reset|
Night Vision Effect
Night Vision Effect specifies how the region of night vision around a token looks. There are two effects that can be turned on: dimming and nocturnal. You can disable Night Vision Effects using off, none, or leave the field blank. Any other value is ignored.
Available Night Vision Effect Properties:
night_vision_effect
Enable the nocturnal Night Vision Effect on a token:
!token-mod --set night_vision_effect|nocturnal
Enable the dimming Night Vision Effect on a token, with dimming starting at 5ft from the token:
!token-mod --set night_vision_effect|dimming
Dimming can take an additional argument to set the distance from the token to begin dimming. The default is 5ft if not specified. Distances are provided by appending a another | character and adding a number followed by either a unit or a %:
!token-mod --set night_vision_effect|dimming|5ft
!token-mod --set night_vision_effect|dimming|1u
Using the % allows you to specify the distance as a percentage of the Night Vision Distance. Numbers less than 1 are treated as a decimal percentage. Both of the following are the same:
!token-mod --set night_vision_effect|dimming|20%
!token-mod --set night_vision_effect|dimming|0.2%
You can also use operators to make relative changes. Operators are +, -, *, and /
!token-mod --set night_vision_effect|dimming|+10%
!token-mod --set night_vision_effect|dimming|-5ft
!token-mod --set night_vision_effect|dimming|/2
!token-mod --set night_vision_effect|dimming|*10
Disable any Night Vision Effects on a token:
!token-mod --set night_vision_effect|off
!token-mod --set night_vision_effect|none
!token-mod --set night_vision_effect|
Bar Location
Bar Location specifes where the bar on a token appears. There are 4 options: above, overlap_top, overlap_bottom, and below. You can also use off, none, or leave the field blank as an alias for above. Any other value is ignored.
Available Bar Location Properties:
bar_location
Setting the bar location to below the token:
!token-mod --set bar_location|below
Setting the bar location to overlap the top of the token:
!token-mod --set bar_location|overlap_top
Setting the bar location to overlap the bottom of the token:
!token-mod --set bar_location|overlap_bottom
Setting the bar location to above the token:
!token-mod --set bar_location|above
!token-mod --set dim_light_opacity|none
!token-mod --set dim_light_opacity|off
!token-mod --set dim_light_opacity|
Compact Bar
Compact Bar specifes how the bar looks. A compact bar is much smaller than the normal presentation and does not have numbers overlaying it. To enable Compact Bar for a token, use compact or on. You can disable Compact Bar using off, none, or leave the field blank. Any other value is ignored.
Available Compact Bar Properties:
compact_bar
Enable Compact Bar on a token:
!token-mod --set compact_bar|compact
!token-mod --set compact_bar|on
Disable Compact Bar on a token:
!token-mod --set compact_bar|off
!token-mod --set compact_bar|none
!token-mod --set compact_bar|
Bar Permission
Bar Permission specifies who sees numbers overlaid on the bar. To not show any numbers, you can set it to hidden or none. To only show it to editors (the default), you can set it to editor or leave the field blank. To make the numbers visible to everyone, you can set it to everyone or all. Any other value is ignored.
Available Bar Permission Properties:
bar1_num_permission
bar2_num_permission
bar3_num_permission
bar4_num_permission
Hide the numbers from everyone:
!token-mod --set bar1_num_permission|hidden
!token-mod --set bar2_num_permission|none
Showing only the editors the numbers:
!token-mod --set bar3_num_permission|editor
!token-mod --set bar2_num_permission|
Making the numbers visible to everyone:
!token-mod --set bar1_num_permission|everyone
!token-mod --set bar4_num_permission|all
Aura Options
Aura Options sets the shape that an aura is displayed in on the tabletop. There are two shapes that can be used: square and circle. Any other value is ignored.
Available Aura Options Properties:
aura1_options
aura2_options
Set aura1 to be square:
!token-mod --set aura1_options|square
In addition, you can also use the aliases aura1_option, aura2_option, aura1_shape, and aura2_shape.
!token-mod --set aura1_option|square aura2_shape|circle
Layer
There is only one Layer property. It can be one of 4 values, listed below.
Available Layer Values:
gmlayer
objects
map
walls
foreground
Moving something to the gmlayer.
!token-mod --set layer|gmlayer
Status
There is only one Status property. Status has a somewhat complicated syntax to support the greatest possible flexibility.
Available Status Property:
statusmarkers
Status is the only property that supports multiple values, all separated by | as seen below. This command adds the blue, red, green, padlock and broken-sheilds to a token, on top of any other status markers it already has:
!token-mod --set statusmarkers|blue|red|green|padlock|broken-shield
You can optionally preface each status with a + to remind you it is being added. This command is identical:
!token-mod --set statusmarkers|+blue|+red|+green|+padlock|+broken-shield
Each value can be followed by a : and a number between 0 and 9. (The number following the dead status is ignored as that status is special.) This will set the blue status with no number overlay, red with a 3 overlay, green with no overlay, padlock with a 2 overlay, and broken-shield with a 7 overlay:
!token-mod --set statusmarkers|blue:0|red:3|green|padlock:2|broken-shield:7
Note: TokenMod will now show 0 on status markers everywhere that makes sense to do.
You can use a semicolon (;) in place of a colon (:) to allow setting statuses with numbers from API Buttons.
[[Set some statuses](!token-mod --set statusmarkers|blue;0|red;3|green|padlock;2|broken-shield;7)
The numbers following a status can be prefaced with a + or -, which causes their value to be applied to the current value. Here's an example showing blue getting incremented by 2, and padlock getting decremented by 1. Values will be bounded between 0 and 9.
!token-mod --set statusmarkers|blue:+2|padlock:-1
You can append two additional numbers separated by :. These numbers will be used as the minimum and maximum value when setting or adjusting the number on a status marker. Specified minimum and maximum values will be kept between 0 and 9.
!token-mod --set statusmarkers|blue:+1:2:5
Omitting either of the numbers will cause them to use their default value. Here is an example limiting the max to 5:
!token-mod --set statusmarkers|blue:+1::5
You can optionally preface each status with a ? to modify the way + and - on status numbers work. With ? on the front of the status, only selected tokens that have that status will be modified. Additionally, if the status reaches 0, it will be removed. Here's an example showing blue getting decremented by 1. If it reaches 0, it will be removed and no status will be added if it is missing.
!token-mod --set statusmarkers|?blue:-1
By default, status markers will be added, retaining whichever status markers are already present. You can override this behavior by prefacing a status with a - to cause the status to be removed. This will remove the blue and padlock status:
!token-mod --set statusmarkers|-blue|-padlock
Sometimes it is convenient to have a way to add a status if it is not there, but remove it if it is. This allows marking tokens with markers and clearing them with the same command. You can preface a status with ! to toggle it's state on and off. Here is an example that will add or remove the Rook piece from a token:
!token-mod --set statusmarkers|!white-tower
Sometimes, you might want to clear all status marker as part of setting a new status marker. You can do this by prefacing a status marker with an =. Note that this affects all status markers before as well, so you will want to do this only on the first status marker. This will remove all status markers and set only the dead marker:
!token-mod --set statusmarkers|=dead
If you want to remove all status markers, just set an empty status marker with =. This will clear all the status markers:
!token-mod --set statusmarkers|=
You can also do this by setting a single status marker, then removing it:
!token-mod --set statusmarkers|=blue|-blue
You can set multiple of the same status marker with a bracket syntax. Copies of a status are indexed starting at 1 from left to right. Leaving brackets off will be the same as specifying index 1. Using empty brackets is the same as specifying an index 1 greater than the highest index in use. When setting a status at an index that doesn't exist (say, 8 when you only have 2 of that status) it will be appended to the right as the next index. When removing a status that doesn't exist, it will be ignored. Removing the empty bracket status will remove all statues of that type.
Adding 2 blue status markers with the numbers 7 and 5 in a few different ways:
!token-mod --set statusmarkers|blue:7|blue[]:5
!token-mod --set statusmarkers|blue[]:7|blue[]:5
!token-mod --set statusmarkers|blue[1]:7|blue[2]:5
Removing the second blue status marker:
!token-mod --set statusmarkers|-blue[2]
Removing all blue status markers:
!token-mod --set statusmarkers|-blue[]
All of these operations can be combine in a single statusmarkers command.
!token-mod --set statusmarkers|blue:3|-dead|red:3
Available Status Markers:
red
blue
green
brown
purple
pink
yellow
X
dead
skull
sleepy
half-heart
half-haze
interdiction
snail
lightning-helix
spanner
chained-heart
chemical-bolt
death-zone
drink-me
edge-crack
ninja-mask
stopwatch
fishing-net
overdrive
strong
fist
padlock
three-leaves
fluffy-wing
pummeled
tread
arrowed
aura
back-pain
black-flag
bleeding-eye
bolt-shield
broken-heart
cobweb
broken-shield
flying-flag
radioactive
trophy
broken-skull
frozen-orb
rolling-bomb
white-tower
grab
screaming
grenade
sentry-gun
all-for-one
angel-outfit
archery-target
Status Markers with a space in the name must be specified using the tag name, which appears in [] above.
!token-mod --set statusmarkers|Mountain_Pass::1234568
You can use a semicolon (;) in place of a colon (:) to allow setting statuses with numbers from API Buttons.
[3 Mountain Pass](!token-mod --set statusmarkers|Mountain_Pass;;1234568;3)
Image
The Image type lets you manage the image a token uses, as well as the available images for Multi-Sided tokens. Images must be in a user library or will be ignored. The full path must be provided.
Available Image Properties:
imgsrc
Setting the token image to a library image using a url (in this case, the orange ring I use for TurnMarker1):
!token-mod --set imgsrc|https://files.d20.io/images/4095816/086YSl3v0Kz3SlDAu245Vg/max.png?1400535580
Setting the token image from another token by specifying it's token_id:
!token-mod --set imgsrc|@{target|token_id} --ids @{selected|token_id}
WARNING: Because of a Roll20 bug with @{target|} and the API, you must specify the tokens you want to change using --ids when using @{target|}.
Multi-Sided Token Options
Appending (+)
You can append additional images to the list of sides by prefacing the source of an image with +:
!token-mod --set imgsrc|+https://files.d20.io/images/4095816/086YSl3v0Kz3SlDAu245Vg/max.png?1400535580
!token-mod --set imgsrc|+@{target|token_id} --ids @{selected|token_id}
If you follow the + with a =, it will update the current side to the freshly added image:
!token-mod --set imgsrc|+=@{target|token_id} --ids @{selected|token_id}
When getting the image from a token, you can append a : and follow it with an index to copy. Indicies start at 1, if you specify an index that doesn't exist, nothing will happen:
!token-mod --set imgsrc|+@{target|token_id}:3 --ids @{selected|token_id}
You can specify the = with this syntax:
!token-mod --set imgsrc|+=@{target|token_id}:3 --ids @{selected|token_id}
You can specify multiple indices to copy by using a , separated list:
!token-mod --set imgsrc|+@{target|token_id}:3,4,5,9 --ids @{selected|token_id}
Using = with this syntax will set the current side to the last added image:
!token-mod --set imgsrc|+=@{target|token_id}:3,4,5,9 --ids @{selected|token_id}
Images are copied in the order specified. You can even copy images from a token you're setting.
!token-mod --set imgsrc|+@{target|token_id}:3,2,1 --ids @{selected|token_id}
You can use an * after the : to copy all the images from a token. The order will be from 1 to the maximum image.
!token-mod --set imgsrc|+@{target|token_id}:* --ids @{selected|token_id}
When appending a url, you can use a followed by a number to specify where to place the new image. Indicies start at 1.
!token-mod --set imgsrc|+https://files.d20.io/images/4095816/086YSl3v0Kz3SlDAu245Vg/max.png?1400535580:@1
When appending from a token, you can use an @ followed by a number to specify where each copied image is inserted. Indicies start at 1.
!token-mod --set imgsrc|+@{target|token_id}:3@1,4@2,5@4,9@5 --ids @{selected|token_id}
Note that inserts are performed in order, so continuously inserting at a position will insert in reverse order.
!token-mod --set imgsrc|+@{target|token_id}:3@1,4@1,5@1,9@1 --ids @{selected|token_id}
Replacing (^)
You can replace images in the list of sides by prefacing the source of an image with ^ and append followed by a number to specify which images to replace. Indicies start at 1.
!token-mod --set imgsrc|^https://files.d20.io/images/4095816/086YSl3v0Kz3SlDAu245Vg/max.png?1400535580:@2
!token-mod --set imgsrc|^@{target|token_id}:@2 --ids @{selected|token_id}
When replacing from a token, you can specify multiple replacements from a source token to the destination token:
!token-mod --set imgsrc|^@{target|token_id}:3@1,4@2,5@4,9@5 --ids @{selected|token_id}
Reordering (/)
You can use a / followed by a pair of numbers separated by @ to move an image on the token from one postion to another. Indicies start at 1.
!token-mod --set imgsrc|/3@1 --ids @{selected|token_id}
You can string these together with commas. Note that operationes are performed in order and may displace prior moved images.
!token-mod --set imgsrc|/3@1,4@2,5@3,9@4 --ids @{selected|token_id}
Removing (-)
You can remove images from the image list using - followed by the index to remove. If you remove the currently used image, the side will be set to 1.
!token-mod --set imgsrc|-3
If you omit the number, it will remove the current side:
!token-mod --set imgsrc|-
You can follow the - with a , separated list of indicies to remove. If any of the indicies don't exist, they will be ignored:
!token-mod --set imgsrc|-3,4,7
You can follow the - with an * to remove all the images, turning the Multi-Sided token back into a regular token. (This also happens if you remove the last image by index.):
!token-mod --set imgsrc|-*
WARNING: If you attempt to change the image list for a token with images in the Marketplace Library, it will remove all of them from that token.
SideNumber
This is the index of the side to show for Multi-Sided tokens. Indicies start at 1. If you have a 6-sided token, it will have indicies 1, 2, 3, 4, 5 and 6. An empty index is considered to be 1. If a token doesn't have the index specified, it isn't changed.
NOTICE: This only works for images in the User Image library. If your token has images that are stored in the Marketplace Library, they will not be selectable with this command. You can download those images and upload them to your User Image Library to use them with this.
Available SideNumber Properties:
currentside
Setting a token to index 2:
!token-mod --set currentside|2
Not specifying an index will set the index to 1, the first image:
!token-mod --set currentside|
You can shift the image by some amount by using + or - followed by an optional number.
Moving all tokens to the next image:
!token-mod --set currentside|+
Moving all tokens back 2 images:
!token-mod --set currentside|-2
By default, if you go off either end of the list of images, you will wrap back around to the opposite side. If this token is showing image 3 out of 4 and this command is run, it will be on image 2:
!token-mod --set currentside|+3
If you preface the command with a ?, the index will be bounded to the number of images and not wrap. In the same scenario, this would leave the above token at image 4:
!token-mod --set currentside|?+3
In the same scenario, this would leave the above token at image 1:
!token-mod --set currentside|?-30
If you want to choose a random image, you can use *. This will choose one of the valid images at random (all equally weighted):
!token-mod --set currentside|*
Character ID
You can use the @{CHARACTER NAME|character_id} syntax to specify a character_id directly or use the name of a character (quoted if it contains spaces) or just the shortest part of the name that is unique ('Sir Maximus Strongbow' could just be 'max'.). Not case sensitive: Max = max = MaX = MAX
Available Character ID Properties:
represents
Here is setting the represents to the character Bob.
!token-mod --set represents|@{Bob|character_id}
Note that setting the represents will clear the links for the bars, so you will probably want to set those again.
Attribute Name
These are resolved from the represented character id. If the token doesn't represent a character, these will be ignored. If the Attribute Name specified doesn't exist for the represented character, the link is unchanged. You can clear a link by passing a blank Attribute Name.
Available Attribute Name Properties:
bar1_link
bar2_link
bar3_link
bar4_link
Here is setting the represents to the character Bob and setting bar1 to be the npc hit points attribute.
!token-mod --set represents|@{Bob|character_id} bar1_link|npc_HP
Here is clearing the link for bar3:
!token-mod --set bar3_link|
DefaultToken
You can set the default token by specifying defaulttoken in your set list.
Available DefaultToken Properties:
defaulttoken
There is no argument for defaulttoken, and this relies on the token representing a character.
!token-mod --set defaulttoken
Setting defaulttoken along with represents works as expected:
!token-mod --set represents|@{Bob|character_id} defaulttoken
Be sure that defaulttoken is after all changes to the token you want to store are made. For example, if you set the defaulttoken, then set the bar links, the bars won't be linked when you pull out the token.
Player
You can specify Players using one of five methods: Player ID, Roll20 ID Number, Player Name Matching, Token ID, Character ID
•	Player ID is a unique identifier assigned that player in a specific game. You can only find this id from the API, so this is likely the least useful method.
•	Roll20 ID Number is a unique identifier assigned to a specific player. You can find it in the URL of their profile page as the number preceeding their name. This is really useful if you play with the same people all the time, or are cloning the same game with the same players, etc.
•	Player Name Matching is a string that will be matched to the current name of the player in game. Just like with Characters above, it can be quoted if it has spaces and is case insensitive. All players that match a given string will be used.
•	Token ID will be used to collect the controlledby entries for a token or the associated character if the token represetns one.
•	Character ID will be used to collect the controlledby entries for a character.
Note that you can use the special string all to denote the All Players special player.
Available Player Properties:
controlledby
Controlled by supports multiple values, all separated by | as seen below.
!token-mod --set controlledby|aaron|+stephen|+russ
There are 3 operations that can be specified with leading characters: +, -, = (default)
•	+ will add the player(s) to the controlledby list.
•	- will remove the player(s) from the controlledby list.
•	= will set the controlledby list to only the player(s). (Default)
Adding control for roll20 player number 123456:
!token-mod --set controlledby|+123456
Setting control for all players:
!token-mod --set controlledby|all
Adding all the players with k in their name but removing karen:
!token-mod --set controlledby|+k|-karen
Adding the player with player id -JsABCabc123-12:
!token-mod --set controlledby|+-JsABCabc123-12
In the case of a leading character on the name that would be interpreted as an operation, you can use quotes:
!token-mod --set controlledby|"-JsABCabc123-12"
When using Token ID or Character ID methods, it's a good idea to use an explicit operation:
!token-mod --set controlledby|=@{target|token_id}
Quotes will also help with names that have spaces, or with nested other quotes:
!token-mod --set controlledby|+'Bob "tiny" Slayer'
You can remove all controlling players by using a blank list or explicitly setting equal to nothing:
!token-mod --set controlledby|
!token-mod --set controlledby|=
A specified action that doesn't match any player(s) will be ignored. If there are no players named Tim, this won't change the list:
!token-mod --set controlledby|tim
If you wanted to force an empty list and set tim if tim is available, you can chain this with blanking the list:
!token-mod --set controlledby||tim
Using controlledby with represents
When a token represents a character, the controlledby property that is adjusted is the one on the character. This works as you would want it to, so if you are changing the represents as part of the same command, it will adjust the location that will be correct after all commands are run.
Set the token to represent the character with rook in the name and assign control to players matching bob:
!token-mod --set represents|rook controlledby|bob
Remove the represent setting for the token and then give bob control of that token (useful for one-offs from npcs or monsters):
!token-mod --set represents| controlledby|bob
Move
Use --move to supply a sequence of move operations to apply to a token. By default, moves are relative to the current facing of the token as defined by the rotation handle (generally, the "up" direction when the token is unrotated). Each operation can be either a distance, or a rotation followed by a distance, separated by a pipe |. Distances can use the unit specifiers (g,u,ft,etc -- see the Numbers section for more) and may be positive or negative. Rotations can be positive or negative. They can be prefaced by a = to ignore the current rotation of the character and instead move based on up being 0. They can further be followed by a ! to also rotate the token to the new direction.
Moving 3 grid spaces in the current facing.
!token-mod --move 3g
Moving 3 grid spaces at 45 degrees to the current facing.
!token-mod --move 45|3g
Moving 2 units to the right, ignoring the current facing.
!token-mod --move =90|2u
Moving 10ft in the direction 90 degrees to the left of the current facing, and updating the facing to that new direction.
!token-mod --move -90!|10ft
Moving forward 2 grid spaces, then right 10ft, then 3 units at 45 degrees to the current facing and updating to that face that direction.
!token-mod --move 2g 90|10ft =45!|3u
Report
Experimental
 --report provides feedback about the changes that were made to each token that a command affects. Arguments to the --report command are | separated pairs of Who to tell, and what to tell them, with the following format:
!token-mod --report Who[:Who ...]|Message
You can specify multiple different Who arguments by separating them with a :. Be sure you have no spaces.
Available options for Who
•	player will whisper the report to the player who issued the command.
•	gm will whisper the report to the gm.
•	all will send the report publicly to chat for everyone to see.
•	token will whisper to whomever controls the token.
•	character will whisper to whomever controls the character the token represents.
•	control will whisper to whomever can control the token from either the token or character controlledby list. This is equivalent to specifying token:character.
The Message must be enclosed in quotes if it has spaces in it. The Message can contain any of the properties of the of the token, enclosed in { }, and they will be replaced with the final value of that property. Additionally, each property may have a modifier to select slightly different information:
Available options for Property Modifiers
•	before -- Show the value of the property before a change was applied.
•	change -- Show the change that was applied to the property. (Only works on numeric fields, will result in 0 on things like name or imagsrc.)
•	abschange -- Show the absolute value of the change that was applied to the property. (Only works on numeric fields, will result in 0 on things like name or imagsrc.)
Showing the amount of damage done to a token.
!token-mod {{
  --set
    bar1_value|-[[2d6+8]]
  --report
    all|"{name} takes {bar1_value:abschange} points of damage."
}}
Showing everyone the results of the hit, but only the gm and the controlling players the actual damage and original hit point value.
!token-mod {{
  --set
    bar1_value|-[[2d6+8]]
  --report
    all|"{name} takes a vicious wound leaving them at {bar1_value}hp out of {bar1_max}hp."
    gm:control|"{name} damage: {bar1_value:change}hp, was at {bar1_value:before}hp"
}}
Configuration
--config takes option value pairs, separated by | characters.
!token-mod --config option|value option|value
Available Configuration Properties:
•	players-can-ids -- Determines if players can use --ids. Specifying a value which is true allows players to use --ids. Omitting a value flips the current setting.
API Notifications
API Scripts can register for the following notifications:
Token Changes -- Register your function by passing it to TokenMod.ObserveTokenChange(yourFuncObject);. When TokenMod changes a token, it will call your function with the Token as the first argument and the previous properties as the second argument, identical to an on('change:graphic',yourFuncObject); call.
Example script that notifies when a token's status markers are changed by TokenMod:
on('ready',function(){
  if('undefined' !== typeof TokenMod && TokenMod.ObserveTokenChange){
    TokenMod.ObserveTokenChange(function(obj,prev){
      if(obj.get('statusmarkers') !== prev.statusmarkers){
        sendChat('Observer Token Change','Token: '+obj.get('name')+' has changed status markers!');
      }
    });
  }
});



