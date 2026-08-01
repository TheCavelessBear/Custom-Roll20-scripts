January 6, 2026 at 6:19 PM
The Effects (FX) tool allows users to create dynamic visual Effects at a click of a button to help bring stories to life. The tool includes a pre-build particle Effects Library and the ability to create custom Particle Effects.
Previously, the Effects (FX) tool was only available to Pro subscribers. With the launch of Roll20's new tabletop engine, the tool was uplifted and made available to provide access to pre-built effects to all users regardless of subscription. Pro subscribers maintain access to the ability to create and modify custom effects.
 
Custom Effects
Custom Effects allow you to create more particle emission patterns than the small number of built-in effects. Pro subscribers can create and edit custom effects. If a game creator has a Pro subscription, custom effects will be available for all players to view and use in game.
In order to create your own custom Effect, first select the Effects Tool (wand icon) from the left toolbar, then select the "+Custom Effect" option in the menu. This will open a dialog, much like the Macro dialog, where you can modify different attributes available in the default effect or add additional properties/attributes referenced below in this article. This info must be in a JSON format, if the format is incorrect it will not let you save your new custom Effect. If you don't know exactly what JSON is you start off with the general format of the default code and just change the numbers. You can also add code snippets for additional properties explained further in the article.
Custom Effects Properties
These properties (attributes of particle emission patterns) are shared between our Classic Tabletop custom Effects feature, and the new tabletop engine.
angle
This is the angle at which the particle are ejected from the spawn point (your cursor). The angle is measured in degrees starting with 0 pointing to the right, so 90 is straight down, 180 is to the left, 270 is straight up. If you enter -1 for this value the system will ask you to "aim" it every time you use it. This is useful when you want to fire an effect in a different direction each time you use it.
angleRandom
How much the particles spread from the original angle to either side. An angleRandom of 45 would result in a 90 degree fire arc centered on the original angle.
duration
This is how long the effect will last, even if the mouse is held down. This is mostly used with, and required for (if it's not set, or is -1 it will be defaulted to 25), aimed and for onDeath effects, since the mouse can't be held down, so they will last for the duration. The max duration in these instances is 50, which is just about 2 seconds. It can also be useful if you want the effect just to be a single burst of particles, like in the Bomb and Nova effects where the duration is just 10. If you set the duration to -1 the effect will last as long as you hold down the mouse button, otherwise the effect will stop after the duration has finished even if you hold down the button.
emissionRate
This is a measure of how quickly particles are created and fired from the origin. This attribute ties closely with the maxParticles attribute because if that limit is reached the system will stop creating particles, so make sure that you set the max hight enough to support your emission rate.
gravity
This attribute is the only one that has 2 "sub-attributes", x and y. It has these 2 options because you are able to have the "gravity" work in any direction. You cannot use the 0 value for either of these attributes, so use 0.01 for "no gravity". X and Y both accept positive and negative values, a positive Y would pull the particles down where as a negative value would pull the particles up and it works the same way with X and left and right.
lifeSpan
lifeSpan defines how long, in a measure of time, a particle will last before it disappears. This attribute, combined with speed, will decide how far the particle will fly before it is destroyed.
lifeSpanRandom
How much variation there is in the lifespan of individual particles.
If an effect has a lifespan of 10 and a lifeSpanRandom of 5 the particles will be alive for a span of 5-15.
maxParticles
maxParticles defines the total number of particles, for that specific effect, that can be on the board at one time. Once this max is reached the particles will stop being generated until some of already existing particles reach the end of their "life".
size
size defines the relative size of the particles that are created.
sizeRandom
How much variation in size there is in the particles of the effect.
If an effect has a size of 10 and a sizeRandom of 5 the particles will have a size of 5-15.
speed
speed defines the speed at which the particles will move away from the origin.
speedRandom
How much variation in speed there is in the particles of the effect.
If an effect has a speed of 10 and a sizeRandom of 5 the particles will have a speed of 5-15.
startColour / endColour
start/endColour defines the color of the particle when it is created and right before it is destroyed, respectively, using an array [Red, Green, Blue, Alpha]. The colors, RGB, use values between 0-255 and the Alpha channel is a decimal between 0-1. If you're looking for a specific color you can look up "hex color picker" in your favorite search engine and that should give you the numbers you're looking for. The colors will fade from the start value to the end value over the course of their life span. Since all of the particles are piled on top of each other to begin with the colors tend to be much lighter, turning into a ball of white, than you expect so you will want to use darker colors at least in the startColour block. There are a bunch of color examples at the end of this page, if you're looking for inspiration.
startColour / endColour Random
The start and end randoms determine how much difference there is in the color of the particles at the beginning and end of their lifespans. Example:
startColour: [220, 35, 0, 1],
startColourRandom: [62, 0, 0, 0.25]
an effect with these values will range from an RGBA of
[158, 35, 0, 0.75] to
[255, 35, 0, 1]
resulting in a more varied color range for your effect’s particles.
onDeath
This is the only value that accepts a string, so make sure if you use it to wrap the value in "quotes" or it won't let you save. This is used, like in the Burst effect, to spawn an additional effect as soon as the original one finishes. The Burst effect is basically just the Burn effect with "onDeath": "explosion", so the Burn effect lasts until you let go of the mouse, after which it will spawn the Explosion effect at the same location. This the effect that is spawned in the onDeath sequence cannot be an "aimed" effect and must have a duration. If it has a -1 for either of these it will either be given a default or not work as intended. This also only works for other Custom FX, if multiple FX have the same name you are referencing it will only select the first one on the list.
Custom Effects Properties added with the Latest VTT Engine
These additional properties (attributes of particle emission patterns) are not available in games which use the Legacy VTT.
sizeGradient
Size gradients allow for the particles in the effect to grow and shrink over the lifetime of the particle. “gradient” is used to denote where in the life span the size should be at “factor” which is a multiplier for the base size of the particle. In the below example the particles in the effect would start at 75% size then grow to normal size over the first 20% of the particle’s lifespan then it would grow to 1.5x its base size over the rest of its life.
[
{ "gradient": 0, "factor": 0.75 },
{ "gradient": 0.2, "factor": 1 },
{ "gradient": 1, "factor": 1.5 }
]
emitRateGradients
Emit Rate Gradients define how the emit rate of the effect changes over the life of the effect’s duration similarly to the sizeGradient changing the size of particles over the lifespan of the individual particles. In the below example the effect would fire a burst of particles at the beginning and then taper off over its duration.
[
{ "gradient": 0, "factor": 1 },
{ "gradient": 0.25, "factor": 0.2 },
{ "gradient": 1, "factor": 0 }
]
velocityGradients
Velocity Gradients define how the particles change their speed over their lifetime.
In the above example the particles would fire out much faster than their base speed and then rapidly slow down to 20% of base speed over the first 60% of its lifespan, then slowing to a stop over the remaining 40%.
[
{ "gradient": 0, "factor": 3 },
{ "gradient": 0.6, "factor": 0.2 },
{ "gradient": 1, "factor": 0 }
]
rulerType
This defines what the aiming interface presents as and supports
•	‘cone’
•	‘line’
•	‘beam’
additionalEmissinRatePerPixel
This property is used in conjunction with the rulerType and denotes how much faster the effect should produce particles the longer the range of the effect is.
scaleX
Determines how much wider the particles should be, is a multiplier to the base size.
scaleY
Determines how much taller the particles should be, is a multiplier to the base size.
alignParticles
This forces the alignment of each particle to match the angle it was fired upon.
rotationSpeed
Determines how fast particles should spin, default is no spin.
emitterSize
Determines the size of the emitter box. It will be 2x the value as a square.
A value of 5 would result in a 10x10 pixel emitter box.
isPointToPoint
Determines if the Effect should move from the start to end while firing particles along the path, only usable with aimed Effects.
subEmitters
subEmitters has a list of emitters.
•	type - 0 is for when you want a subEmitter attached to a particle, 1 indicates that it'll spawn at the end of a particle's life cycle
•	inheritDirection - Set the +Y direction of the sub emitter equal to the direction the particle is/was heading true or false
•	inheritedVelocityAmount - determines how much of the existing particles speed should be added to the emitter particles
•	emitterNames - other emitters you may be targeting by name. This will randomly choose one of these emitters when running on a particle
{
"emitters": [{
"type": 1,
"inheritDirection": false,
"inheritedVelocityAmount": 0,
"emitterNames": ["pooling"]
}]
}
baseEffect
Name of an existing effect to base a new effect off of. You get all the properties of the baseEffect and you can additionally override other properties to add custom effects. For example our "Rocket" effect is based off of our "Missile" effect with an additional explosion onDeath.
{
"name": "Rocket",
"baseEffect": "missile",
"onDeath": "explode",
}
Built-in Effects
Effect
Beam
{
"name": "tool_fx_beam",
"maxParticles": 500,
"scaleX": 2,
"scaleY": 3,
"alignParticles": true,
"size": 60,
"sizeGradients": [
{ "gradient": 0, "factor": 0 },
{ "gradient": 0.3, "additionalGradientPerPixel": -0.0002, "factor": 1 },
{ "gradient": 0.8, "factor": 1.2 }
],
"sizeRandom": 0,
"lifeSpan": 15,
"lifeSpanRandom": 0,
"emissionRate": 4,
"additionalEmissionRatePerPixel": 0.02,
"emitterSize": 1,
"speed": 0,
"additionalSpeedPerPixel": 0.07,
"speedRandom": 0,
"angle": -1,
"angleRandom": 1,
"duration": 25,
"rulerType": "beam"
}
Bomb
{
"name": "tool_fx_bomb",
"maxParticles": 500,
"alignParticles": true,
"size": 30,
"sizeRandom": 10,
"sizeGradients": [
{ "gradient": 0, "factor": 0 },
{ "gradient": 0.3, "additionalGradientPerPixel": -0.0002, "factor": 0.5 },
{ "gradient": 0.8, "factor": 2 },
{ "gradient": 1, "factor": 1.5 }
],
"lifeSpan": 25,
"lifeSpanRandom": 5,
"speed": 5,
"speedRandom": 2,
"velocityGradients": [
{ "gradient": 0, "factor": 2 },
{ "gradient": 0.6, "factor": 0.2 },
{ "gradient": 1, "factor": 0 }
],
"angle": 270,
"angleRandom": 70,
"emissionRate": 250,
"duration": 10
}
Breath
{
"name": "tool_fx_breath",
"alignParticles": true,
"maxParticles": 500,
"size": 10,
"sizeRandom": 5,
"sizeGradients": [
{ "gradient": 0, "factor": 1 },
{ "gradient": 0.2, "factor": 0, "additionalFactorPerPixel": 0.0125 },
{ "gradient": 0.7, "factor": 0, "additionalFactorPerPixel": 0.025 },
{ "gradient": 1, "factor": 1 }
],
"lifeSpan": 25,
"lifeSpanRandom": 2,
"emissionRate": 120,
"additionalEmissionRatePerPixel": 0.143,
"emitRateGradients": [
{ "gradient": 0, "factor": 1 },
{ "gradient": 0.25, "factor": 0.2 },
{ "gradient": 1, "factor": 0 }
],
"speed": -1,
"additionalSpeedPerPixel": 0.04,
"velocityGradients": [
{ "gradient": 0, "factor": 3 },
{ "gradient": 0.6, "factor": 0.2 },
{ "gradient": 1, "factor": 0 }
],
"speedRandom": 0,
"angle": -1,
"angleRandom": 15,
"duration": 25,
"rulerType": "cone"
}
Bubbling
{
name: 'tool_fx_bubbling',
maxParticles: 200,
size: 8,
sizeRandom: 3,
sizeGradients: [
{ gradient: 0, factor: 0.5 },
{ gradient: 0.2, factor: 1 }
],
lifeSpan: 60,
lifeSpanRandom: 5,
speed: 0.5,
speedRandom: 2,
gravity: { x: 0, y: 0, z: -0.01 },
angle: 0,
angleRandom: 180,
emissionRate: 5
}
Burn
{
"name": "tool_fx_burn",
"maxParticles": 100,
"size": 70,
"sizeGradients": [
{ "gradient": 0, "factor": 1 },
{ "gradient": 0.5, "factor": 2 },
{ "gradient": 1, "factor": 4 }
],
"sizeRandom": 15,
"lifeSpan": 10,
"lifeSpanRandom": 3,
"speed": 3,
"angle": 0,
"emissionRate": 12
}
Burst
{
"name": "tool_fx_burst",
"maxParticles": 100,
"size": 35,
"sizeRandom": 15,
"lifeSpan": 10,
"lifeSpanRandom": 3,
"speed": 3,
"angle": 0,
"emissionRate": 12,
"onDeath": "explode"
}
Explode
{
"name": "tool_fx_explode",
"maxParticles": 500,
"alignParticles": true,
"size": 60,
"sizeRandom": 10,
"duration": 20,
"sharpnessRandom": 10,
"sharpness": 20,
"lifeSpan": 20,
"lifeSpanRandom": 5,
"speed": 7,
"velocityGradients": [
{ "gradient": 0, "factor": 3 },
{ "gradient": 0.6, "factor": 0.2 },
{ "gradient": 1, "factor": 0 }
],
"speedRandom": 0,
"angle": 0,
"angleRandom": 360,
"emissionRate": 200,
"emitRateGradients": [
{ "gradient": 0, "factor": 1 },
{ "gradient": 0.25, "factor": 0.2 },
{ "gradient": 1, "factor": 0 }
]
}
Glow
{
"name": "tool_fx_glow",
"maxParticles": 250,
"size": 140,
"sizeRandom": 0,
"lifeSpan": 10,
"lifeSpanRandom": 0,
"emissionRate": 1,
"speed": 0,
"speedRandom": 0,
"angle": 0,
"rotationSpeed": 2,
"emitterSize": 0.5
}
Missile
{
"name: "tool_fx_missile",
"maxParticles": 350,
"size": 7,
"sizeRandom": 3,
"lifeSpan": 7,
"lifeSpanRandom": 5,
"emissionRate": 50,
"speed": 7,
"speedRandom": 5,
"angle": -1,
"rulerType": 'line',
"duration": 25,
"isPointToPoint": true
}
Nova
{
"name": "tool_fx_nova",
"maxParticles": 500,
"alignParticles": true,
"scaleX": 2,
"size": 25,
"sizeRandom": 0,
"sizeGradients": [
{ "gradient": 0, "factor": 0.5 },
{ "gradient": 0.2, "factor": 0.75 },
{ "gradient": 0.7, "factor": 1 },
{ "gradient": 1, "factor": 2 }
],
"lifeSpan": 30,
"lifeSpanRandom": 0,
"emissionRate": 1000,
"speed": 7,
"speedRandom": 0,
"angle": 0,
"angleRandom": 180,
"duration": 5
}
Pooling
{
"name": "tool_fx_pooling",
"type: "tool_fx_click",
"blendMode": 4,
"angle": 0,
"angleRandom": 359,
"duration": 10,
"emissionRate": 1,
"lifeSpan": 20,
"lifeSpanRandom": 0,
"maxParticles": 1,
"size": 15,
"sizeRandom": 5,
"speed": 0,
"speedRandom": 0,
"rotationSpeed": 0,
"sizeGradients": [
{ "gradient": 0, "factor": 0.01 },
{ "gradient": 0.1, "factor": 2 },
{ "gradient": 0.7, "factor": 2.5 },
{ "gradient": 1, "factor": 0.01 }
]
}
Rocket
{
"name": "Rocket",
"baseEffect": "missile",
"onDeath": "explode"
}
Shield
{
"name": "tool_fx_shield",
"maxParticles": 250,
"size": 140,
"sizeRandom": 0,
"lifeSpan": 10,
"lifeSpanRandom": 0,
"emissionRate": 5,
"speed": 0,
"speedRandom": 0,
"angle": 0,
"blendMode": ParticleSystem.BLENDMODE_ADD,
"rotationSpeed": 2,
"emitterSize": 0.5
}
Sparkle
 
{
"name: "tool_fx_sparkle",
"maxParticles": 150,
"size": 30,
"sizeRandom": 3,
"sizeGradients": [
{ "gradient": 0, "factor": 0.75 },
{ "gradient": 0.2, "factor": 1 },
{ "gradient": 0.7, "factor": 1.5 },
{ "gradient": 1, "factor": 0.5 }
],
"lifeSpan": 20,
"lifeSpanRandom": 5,
"emissionRate": 7,
"speed": 4,
"speedRandom": 2,
"angle": 0,
"angleRandom": 0,
"gravity": { x: 0.0, y: 0.0, z: -10.0 },
"blendMode": ParticleSystem.BLENDMODE_ADD,
"rotationSpeed": 1,
"emitterSize": 0.5
}
Splatter (upgraded)
{
"name": "tool_fx_splatter",
"type": "tool_fx_aimed",
"alignParticles": true,
"angle": 15,
"angleRandom": 15,
"blendMode": 4,
"duration": 25,
"emissionRate": 20,
"lifeSpan": 10,
"lifeSpanRandom": 0,
"maxParticles": 50,
"rulerType": 'line',
"size": 35,
"sizeRandom": 10,
"speed": 20,
"speedRandom": 1,
"sizeGradients": [
{ "gradient": 0, "factor": 0.5 },
{ "gradient": 1, "factor": 1 }
],
"subEmitters": {
"emitters": [{
"type": 1,
"inheritDirection": false,
"inheritedVelocityAmount": 0,
"emitterNames": ["pooling"]
}]
}
}

