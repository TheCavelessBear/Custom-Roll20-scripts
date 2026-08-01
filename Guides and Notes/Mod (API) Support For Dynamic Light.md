Mod (API) Support For Dynamic Lighting
February 20, 2024 at 5:13 PM
Are you a programming wizard, or enjoy working with Roll20 Mods (API)? If so, we've got great news for you - Dynamic Lighting now integrates with Roll20 Mods (API) ! Check out all of the awesome Lighting and Vision functions and features you can use in your custom code. Keep in mind, Mod (API) access is only available to Pro subscribers, so upgrade your account if you haven't already.

Token Settings
Syntax	Context	Type
has_bright_light_vision 	Toggles vision for the token.	Boolean
has_night_vision	Toggles night vision for the token. 	Boolean
night_vision_distance	Sets the range of night vision for the token. 	Integer
emits_bright_light	Toggles bright light for the token. 	Boolean
bright_light_distance	Sets the range of the amount of bright light emitting from a token. 	Integer
emits_low_light	Toggles low light for the token. This would be useful for a torch or a source with a low amount of light. Use the booleans true to turn on or false to turn off.	Boolean
low_light_distance	Sets the range of the amount of low light emitting from a token. When setting this value, you must include any Bright Light Distance you have set. The reason for this is because Low Light Distance is calculated from the center of the token. So if you have set Bright Light Distance to 10, and you would like an additional 10 feet of Low Light Distance, the value of low_light_distance must be 20.	Integer 
light_sensitivity_multiplier	Multiplier on the effectiveness of light sources. A multiplier of 200 would allow the token to see twice as far as a token with a multiplier of 100, with the same light source.	Integer
night_vision_effect
Changes the Night Vision Effect. Other options include “Dimming” and “Nocturnal”	String
 
Directional Vision and Lighting
Syntax	Context	Type
has_limit_field_of_vision	Toggles limit field of vision for the token.	Boolean
limit_field_of_vision_center	Sets the value for where the center of the field of vision starts.	Integer
limit_field_of_vision_total	Set the value for the total size of the field of vision.	Integer
has_limit_field_of_night_vision

Toggles limit field of night vision for the token.	Boolean
limit_field_of_night_vision_center	Sets the value for where the center of the field of night vision starts.	Integer 
limit_field_of_night_vision_total	Set the value for the total size of the field of night vision.	Integer
has_directional_bright_light	Toggles directional bright light for the token.	Boolean
directional_bright_light_center

Sets the value for where the center of the field of bright light starts.	Integer
directional_bright_light_total	Set the value for the total size of the field of bright light.	Integer 
has_directional_dim_light

Toggles directional low light for the token.	Boolean
directional_dim_light_center	Sets the value for where the center of the field of low light starts.	Integer
directional_dim_light_total	Set the value for the total size of the field of low light.	Integer
 

Page Settings
Syntax	Context	Type
dynamic_lighting_enabled	Toggles updated dynamic lighting for the page. 	Boolean
daylight_mode_enabled	Toggles daylight mode for the page. This should not be turned on if dynamic_lighting_enabled is not turned on. 	Boolean
explorer_mode	
Toggles explorer mode for the page. This should not be turned on if dynamic_lighting_enabled is not turned on.

Use the strings ”basic” to turn on or ”off” to turn off. 

String

force_lighting_refresh	
Triggers a refresh of all token lighting/vision on a page. Can be used in a single call after putting multiple tokens onto a page. (Will be deprecated in the coming months!) 

Boolean

fog_opacity	
Opacity of the fog of war for the GM.

Boolean

lightupdatedrop
Only update Dynamic Lighting when an object is dropped.

Boolean

 

Examples 
on("change:graphic", function(obj) {
  obj.set({
    has_bright_light_vision: true,
    emits_bright_light: true,
    bright_light_distance: 10
  });
});
This will add the above values to a token in two instances:

upon adding a new token to the VTT
moving a token that already exists on the VTT, with or without token settings already set.
However, using on(“change is dangerous because if you update the token settings for a specific token, that triggers a change event, which will trigger this API. So, if you have something like this in your Mod (API) script, your token settings will always stay this way for every token, unless you add some conditional statements so it works the way you want.

on("change:graphic", function(obj) {
  obj.set({
    has_bright_light_vision: true,
    emits_bright_light: true,
    bright_light_distance: 10,
    emits_low_light: true,
    low_light_distance: 25
  });
});
This example will set Vision to any token that has changed (moved, updated, added to the VTT, etc). The token will also emit 10 feet of Bright Light Distance, as well as 15 feet of Low Light Distance.

Notice how low_light_distance is set to 25. That is because the value of low_light_distance must be the sum of bright_light_distance and however much you would like the token to emit Low Light Distance - in this case, it is 15.