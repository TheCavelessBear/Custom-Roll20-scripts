/*
================================================================
ROLL20 SCRIPT BATCH 4
TABLE OF CONTENTS
Line 14 - SpawnDefaultToken
Line 1921 - MapChange
Line 3638 - Group Initiative
Line 5913 - TokenMod
================================================================
*/

/*
================================================================
BEGIN SCRIPT: SpawnDefaultToken
SOURCE FILE: SpawnDefaultToken(2).md
================================================================
*/
/*
    Select an existing token, then call !spawn --name|<CharToSpawn> --optionalArgs
    
    Description of of syntax:
    !Spawn {{
      --name|        < charName >    //(REQUIRED) name of the character whose target we want to spawn
      --targets|     < #, optional text >           //Destination override. Instead of using selected token(s) as origin, use target token(s). If commas are to be included in Text, use replacement value %comma%
      --qty|         < # >           //How many tokens to spawn at each origin point. DEFAULT =
      --offset|	 < #,# >         //X,Y pos or neg shift in position of the spawn origin point(s) relative to the origin token(s), in number of SQUARES 
                                            //DEFAULT = 0,0  // (NOTE: a POSITIVE Y offset means LOWER on the map)
      --placement|   < option >      //How to arrange the tokens relative to the origin point (+ offset)
                                            //'stack'      : (DEFAULT) All tokens will be stacked on top of each other
                                            //'row'        : A horizontal row of tokens
                                            //'column,col' : A vertical column of tokens
                                            //'surround'   : A clockwise spiral placement around origin token, starting at top  (NOTE: any supplied offset will be ignored)
                                            //'grid #'     : A square grid with "#" tokens per row. Raster left to right
                                            //'burst #'    : An expanding diagonal distribution of tokens starting "#" squares from the 4 origin token corners. Large qty will form an "X" pattern
                                            //'cross #'    : "evenly" distributed vert/horiz qty, starting directly above origin by # squares. Large qty will form a "+" pattern
                                            //'random,rand #' : randomly populates tokens within a (# by #) square grid
      --size|        < #,# >                //DEFAULT = 1,1 (X,Y) - How many SQUARES wide and tall are the spawned tokens?
      --side|        < # or rand>           //DEFAULT = 1. Sets the side of a rollable table token. 
                                                    // #              : Sets the side of all spawned tokens to "#"
                                                    // 'rand,random'  : Each spawned token will be set to a random side
      --order|       < option >             //The z-order of the token. (NOTE: a recent Roll20 "feature" will always put character tokens with sight above those without, so YMMV.)
                                                    // toFront,front,top,above  : Spawn token moved to front
                                                    // toBack,back,bottom,below : Spawn token moved to back
      --light|       < #,# >                //Set light radius that all players can see. 
                                                    //For Legacy Dynamic Lighting (LDL):
                                                        //First # is the total radius of the light (light_radius)
                                                        //Second # is the start of dim light (light_dimradius) (so: 10,5 will be 10 ft of total light, with dim radius starting at 5ft)
                                                    //For Updated Dynamic Lighting (UDL):
                                                        //First # is the radius of bright light (bright_light_distance)
                                                        //Second # is the additional radius of dim light (so: 10,5 will be 10ft of bright light + 5ft of dim light)
      --mook|        < yes/true/1/no/false/0 >      //DEFAULT = false (the "represents" characteristic of the token is removed so changes to one linked attribute, e.g. hp, will not propagate to other associated tokens.
                                                        //If set to true, linked attributes will affect all tokens associated with that sheet
      --force|       < yes/true/1/no/false/0 >      //DEFAULT = false. The origin point is by default relative to the geometric center of the origin token
                                                        //Origin tokens of larger than 1x1 may spawn tokens in between squares, which may be strange depending on the specific case
                                                        //Set to true in order to force the token to spawn in a full square
      --sheet|       < charName2 >          //DEFAULT = selected character. The character sheet in which to look for the supplied ability
                                                    //useful if the ability exists on a "macro mule" or simply another character sheet
      --ability|     < abilityName >        //The ability to trigger after spawning occurs. With caveats s described below
      --fx|          < type-color >         //Trigger FX at each origin point.
                                                    //Supported types are: bomb,bubbling,burn,burst,explode,glow,missile,nova,splatter
                                                    //Supported colors are: acid,blood,charm,death,fire,frost,holy,magic,slime,smoke,water
      --bar1|        < currentVal/optionalMax optional "KeepLink">            //overrides the token's bar1 current and max values. Max is optional. Default is to remove bar1_link. If "KeepLink" is appended, the bar1_link will be preserved 
      --bar2|        < currentVal/optionalMax optional "KeepLink">            //overrides the token's bar2 current and max values. Max is optional. Default is to remove bar2_link. If "KeepLink" is appended, the bar2_link will be preserved
      --bar3|        < currentVal/optionalMax optional "KeepLink">            //overrides the token's bar3 current and max values. Max is optional. Default is to remove bar3_link. If "KeepLink" is appended, the bar3_link will be preserved
      --expand|      < #frames, delay, optional yes/true/1 >         //DEFAULT = 0,0,false. Animates the token during spawn. Expands from size = 0 to max size. If third param =true, will delete spawned token after animation completes
                                                        //#frames: how many frames the expansion animation will use. Start with something like 20
                                                        //delay: how many milliseconds between triggering each frame? Start with something like 50. Any less than 30 may appear instant
      --deleteSource|  < yes/true/1/no/false/0 >    //DEFAULT = false. Deletes the selected token(s) upon spawn
      --deleteTarget|  < yes/true/1/no/false/0 >    //DEFAULT = false. Deletes the target token(s) upon spawn
      --resizeSource|  < #,# <optional #frames, #delay> >    //DEFAULT = n/a. Animates the selected token(s) during spawn. 
                                                        //#,#: the new size of the selected token(s). If any dimension is set to 0, it will delete the token after animation
                                                        //#frames: DEFAULT = 20. how many frames the animation will use.
                                                        //delay: DEFAULT = 50. how many milliseconds between triggering each frame? Anything less than 30 may appear instant
      --resizeTarget|  < #,# <optional #frames, #delay> >    //DEFAULT = n/a. Animates the target token(s) during spawn. 
                                                        //#,#: the new size of the target token(s). If any dimension is set to 0, it will delete the token after animation
                                                        //#frames: DEFAULT = 20. how many frames the animation will use.
                                                        //delay: DEFAULT = 50. how many milliseconds between triggering each frame? Anything less than 30 may appear instant
      --layer| < object/token/map/gm >                  //DEFAULT = token(s) spawn on the same layer as the selected token(s). May explicitly set to spawn on a different layer.
      --tokenName| < some name >                        //optional override for the token name - allows token name to be different than the character name
      --controlledby| <optional +> <comma-delimited list of playerIDs or displayNames>   //adds or replaces the  controlledby property of the CHARACTER SHEET defined by the --name command
      --tokenProps|<prop1:val1,prop2:val2...>           //sets various token properties. Valid properties include:
                                                            name,statusmarkers,bar1_value,bar1_max,bar2_value,bar2_max,bar3_value,bar3_max,top,left,
                                                            width,height,rotation,layer,aura1_radius,aura1_color,aura2_radius,aura2_color,aura1_square,
                                                            aura2_square,tint_color,light_radius,light_dimradius,light_angle,light_losangle,light_multiplier,
                                                            light_otherplayers,light_hassight,flipv,fliph,bar1_link,bar2_link,bar3_link,represents,layer,
                                                            isdrawing,name,gmnotes,showname,showplayers_name,showplayers_bar1,showplayers_bar2,showplayers_bar3,
                                                            showplayers_aura1,showplayers_aura2,playersedit_name,playersedit_bar1,playersedit_bar2,
                                                            playersedit_bar3,playersedit_aura1,playersedit_aura2,lastmove,tooltip,show_tooltip,
                                                            adv_fow_view_distance,has_bright_light_vision,has_night_vision,night_vision_distance,
                                                            emits_bright_light,bright_light_distance,emits_low_light,low_light_distance,has_limit_field_of_vision,
                                                            limit_field_of_vision_center,limit_field_of_vision_total,has_limit_field_of_night_vision,
                                                            limit_field_of_night_vision_center,limit_field_of_night_vision_total,has_directional_bright_light,
                                                            directional_bright_light_center,directional_bright_light_total,has_directional_dim_light,
                                                            directional_dim_light_center,directional_dim_light_total,bar_location,compact_bar,
                                                            light_sensitivity_multiplier,night_vision_effect,lightColor
    }}
    
    
*/
// adding API_Meta for line offset
var API_Meta = API_Meta || {};
API_Meta.Spawn = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{
    try { throw new Error(''); } catch (e) { API_Meta.Spawn.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (71)); }
}
//        log(`Spawn Offset: ${API_Meta.Spawn.offset}`);

const SpawnDefaultToken = (() => {
    
    const scriptName = "SpawnDefaultToken";
    const version = '0.26';
    var gridSize = 70;  //this may be updated based on page settings 
    
    //an array of token properties which may be set for Spawned tokens
	var tokenAttributes = ['name','statusmarkers','bar1_value','bar1_max','bar2_value','bar2_max','bar3_value','bar3_max','top','left','width','height','rotation','layer','aura1_radius','aura1_color','aura2_radius','aura2_color','aura1_square','aura2_square','tint_color','light_radius','light_dimradius','light_angle','light_losangle','light_multiplier','light_otherplayers','light_hassight','flipv','fliph','bar1_link','bar2_link','bar3_link','layer','isdrawing','name','gmnotes','showname','showplayers_name','showplayers_bar1','showplayers_bar2','showplayers_bar3','showplayers_aura1','showplayers_aura2','playersedit_name','playersedit_bar1','playersedit_bar2','playersedit_bar3','playersedit_aura1','playersedit_aura2','lastmove','tooltip','show_tooltip','adv_fow_view_distance','has_bright_light_vision','has_night_vision','night_vision_distance','emits_bright_light','bright_light_distance','emits_low_light','low_light_distance','has_limit_field_of_vision',' limit_field_of_vision_center',' limit_field_of_vision_total',' has_limit_field_of_night_vision',' limit_field_of_night_vision_center',' limit_field_of_night_vision_total',' has_directional_bright_light','directional_bright_light_center','directional_bright_light_total','has_directional_dim_light','directional_dim_light_center','directional_dim_light_total','bar_location','compact_bar','light_sensitivity_multiplier','night_vision_effect','lightColor'];
	
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //Due to a bug in the API, if a @{target|...} is supplied, the API does not acknowledge msg.selected anymore
        //This code block helps enable the user to pass both selected and target info into the script
            //---The initial api call will create a chat button that stores the original msg.content & selected tokenID as a "memento"...
                //...clicking this button will trigger a second api call that will prompt for a number of targets. 
                    //"--qty" number of tkens will spawn for EACH origin token (determined by selected or targeted)
                    //Trick developed by TheAaron. 
                    //Forum thread here : https://app.roll20.net/forum/post/8998098/can-you-pass-both-a-selected-and-target-tokenid-to-an-api-script/?pageforid=8998098#post-8998098
                
        //----------------------------------------------------------------------------
        // Registry functions for storing an object and retrieving it by ID
        let store;
        let retrieve;
        
        // destructing assignment of two functions
        [store,retrieve] = (() => {
            // closure containing the id counter and storage for msgs
            const mementos = {};
            let num = 0;
            
            return [
                /* store */ (msg) => {
                    mementos[++num] = msg;
                    return num;
                },
                /* retrieve */ (mid) => {
                    let m = mementos[mid];
                    delete mementos[mid];
                    return m;
                }
            ];
        })();
        
        // making an array of numbers from 1..n
        const range = (n)=>[...Array(n+1).keys()].slice(1);
    //----------------------------------------------------------------------------
    
    const checkInstall = function() {
        log(scriptName + ' v' + version + ' initialized.');
        log(`Spawn Offset: ${API_Meta.Spawn.offset}`);

    };
    
    function processInlinerolls(msg) {
    	if(_.has(msg,'inlinerolls')){
    		return _.chain(msg.inlinerolls)
    		.reduce(function(m,v,k){
    			var ti=_.reduce(v.results.rolls,function(m2,v2){
    				if(_.has(v2,'table')){
    					m2.push(_.reduce(v2.results,function(m3,v3){
    						m3.push(v3.tableItem.name);
    						return m3;
    					},[]).join(', '));
    				}
    				return m2;
    			},[]).join(', ');
    			m['$[['+k+']]']= (ti.length && ti) || v.results.total || 0;
    			return m;
    		},{})
    		.reduce(function(m,v,k){
    			return m.replace(k,v);
    		},msg.content)
    		.value();
    	} else {
    		return msg.content;
    	}
    }
    
    const getCleanImgsrc = function (imgsrc) {
        let parts = imgsrc.match(/(.*\/images\/.*)(thumb|med|original|max)([^\?]*)(\?[^?]+)?$/);
            if(parts) {
                return parts[1]+'thumb'+parts[3]+(parts[4]?parts[4]:`?${Math.round(Math.random()*9999999)}`);
            }
        return;
    };
    
    function round(value, decimals) {
        return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
    }
    
    async function resizeToken (tok, iterations, delay, start_W, start_H, end_W, end_H, destroyWhenDone=false) {
        let new_W = start_W;
        let new_H = start_H;
        
        let incrementX = Math.abs(start_W-end_W) * (1 / iterations);  // size expansion factor.
        let incrementY = Math.abs(start_H-end_H) * (1 / iterations);  // size expansion factor.  
        
        while (new_W !== end_W && new_H !== end_H) {
            promise = new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (start_W > end_W) {    //shrink X
                        new_W = Math.max(new_W - incrementX, end_W)
                    } else {                //grow X
                        new_W = Math.min(new_W + incrementX, end_W)
                    }
                    if (start_H > end_H) {    //shrink Y
                        new_H = Math.max(new_H - incrementY, end_H)
                    } else {                //grow Y
                        new_H = Math.min(new_H + incrementY, end_H)
                    }
                    
                    tok.set({
                        width: new_W,
                        height: new_H
                    });
                    //tok.set("width", new_W);
                    //tok.set("height", new_H);
                    
                    resolve("done!");
                }, delay);
            });
            
            result = await promise;
           
        }
        
        if (new_W <= 0 || new_H <= 0 || destroyWhenDone) {
            tok.remove();
        } 
        return;
    }
    
    //This function runs asynchronously, as called from the processCommands function
    //We will sendChat errors, but the rest of processCommands keeps running :(
    function spawnTokenAtXY (who, tokenJSON, pageID, spawnLayer, spawnX, spawnY, currentSideNew, sizeX, sizeY, zOrder, lightRad, lightDim, mook, UDL, bar1Val, bar1Max, bar1Link, bar2Val, bar2Max, bar2Link, bar3Val, bar3Max, bar3Link, expandIterations, expandDelay, destroyWhenDone, angle, isDrawing, tokenName, tooltip, tokenPropValPairs, bringSourceTokenToFront) {
        let newSideImg;
        let spawnObj;
        let currentSideOld;
        let imgsrc;
        let sides;
        let sidesArr;
        let iLightRad;
        let iLightDim;      
        let result;
                
        try {
            let baseObj = JSON.parse(tokenJSON);
            //log(baseObj);
            //set token properties
            baseObj.pageid = pageID;
            baseObj.layer = spawnLayer;
            if (expandIterations === 0) {       //spawn full-sized token 
                baseObj.left = spawnX;
                baseObj.top = spawnY;
                baseObj.width = sizeX;
                baseObj.height = sizeY;
                baseObj.rotation = angle;
                baseObj.isdrawing = isDrawing;
                if (tokenName !== '') { baseObj.name = tokenName }
            } else {                            //will animate and expand token to full size after spawning
                baseObj.left = spawnX;
                baseObj.top = spawnY;
                baseObj.width = 0;
                baseObj.height = 0;
                baseObj.rotation = angle;
                baseObj.isdrawing = isDrawing;
                if (tokenName !== '') { baseObj.name = tokenName }
            }
            
            baseObj.imgsrc = getCleanImgsrc(baseObj.imgsrc); //ensure that we're using the thumb.png
            
            //image must exist in personal Roll20 image library 
            if (baseObj.imgsrc ===undefined) {
                sendChat('SpawnAPI',`/w "${who}" `+ 'Unable to find imgsrc for default token of \(' + baseObj.name + '\)' + "<br>" + 'You must use an image file that has been uploaded to your Roll20 Library.')
                return;
            }
            
            //check for mook
            if (mook === true) {
                baseObj.bar1_link = "";
                baseObj.bar2_link = "";
                baseObj.bar3_link = "";
            }
            
            //token bar overrides
            if (bar1Val !== "") {
                baseObj.bar1_value = bar1Val;
                if (bar1Link === false) {baseObj.bar1_link = ""}
            }
            if (bar1Max !== "") {
                baseObj.bar1_max = bar1Max;
            }
            
            if (bar2Val !== "") {
                baseObj.bar2_value = bar2Val;
                if (bar2Link === false) {baseObj.bar2_link = ""}
            }
            if (bar2Max !== "") {
                baseObj.bar2_max = bar2Max;
            }
            
            if (bar3Val !== "") {
                baseObj.bar3_value = bar3Val;
                if (bar3Link === false) {baseObj.bar3_link = ""}
            }
            if (bar3Max !== "") {
                baseObj.bar3_max = bar3Max;
            }
            
            //Get page lighting mode (UDL vs LDL)
            var page = findObjs({                              
              _id: pageID,                        
            });
            let UDL = page[0].get("dynamic_lighting_enabled");
            
            //set emitted light
            if (UDL && lightRad !== -999) {
                //Updated Dynamic Lighting
                iLightRad = parseInt(lightRad);
                iLightDim = parseInt(lightDim);
                
                if (iLightRad === 0) {baseObj.emits_bright_light = false;}
                if (iLightDim === 0) {baseObj.emits_low_light = false;}
                
                if (lightRad !== "" && iLightRad > 0) {
                    baseObj.emits_bright_light = true;
                    baseObj.bright_light_distance = lightRad
                }
                if (lightDim !== "" && iLightDim > 0) {
                    baseObj.emits_low_light = true;
                    baseObj.low_light_distance = (iLightRad + iLightDim).toString();
                }
            } else if (lightRad !== -999) {
                //Legacy Dynamic Lighting
                baseObj.light_radius = lightRad;
                baseObj.light_dimradius = lightDim;
                baseObj.light_otherplayers = true;
            }
            
            
            //Check for rollable table token and side selection
            if (baseObj.hasOwnProperty('sides')) {
                sidesArr=baseObj["sides"].split('|');
                if ( (currentSideNew !== -999) && (sidesArr[0] !== '') ) {
                    
                    //check for random side
                    if ( isNaN(currentSideNew) ) {
                        currentSideNew = randomInteger(sidesArr.length) - 1;    // Setting to random side. currentSide is 1-based for user
                    } else {
                        currentSideNew = parseInt(currentSideNew) - 1;          //currentSide is 1-based for user
                    }
                    
                    //set the current side (wtih data validation for the requested side)
                    if ( (currentSideNew > 0) || (currentSideNew <= sidesArr.length-1) ) {
                        newSideImg = getCleanImgsrc(sidesArr[currentSideNew]);     //URL of the image
                        baseObj["currentSide"] = currentSideNew;
                        baseObj["imgsrc"] = newSideImg;
                    } else {
                        sendChat('SpawnAPI',`/w "${who}" `+ 'Error: Requested index of currentSide is invalid');
                        return retVal;
                    }
                }
            }
            
            if (tooltip) {
                baseObj.tooltip = tooltip;
                baseObj.show_tooltip = true;
            }
            
            if (tokenPropValPairs) {
                tokenPropValPairs.forEach(pair => {
                    if (pair.indexOf(':') !== -1) {
                        let pairArr = pair.split(":")
                        let prop = pairArr[0].trim();
                        if (tokenAttributes.includes(prop)) {
                            baseObj[prop] = pairArr[1];
                        }
                    }
                });
            }
            ////////////////////////////////////////////////////////////
            //      Spawn the Token!
            ////////////////////////////////////////////////////////////
            spawnObj = createObj('graphic',baseObj);

            // Roll20 may normalize UDL values while creating a graphic.
            // Reapply the saved or overridden lighting properties afterward.
            if (spawnObj && UDL) {
                const udlLightProps = {};

                [
                    'emits_bright_light',
                    'bright_light_distance',
                    'emits_low_light',
                    'low_light_distance'
                ].forEach(prop => {
                    if (Object.prototype.hasOwnProperty.call(baseObj, prop)) {
                        udlLightProps[prop] = baseObj[prop];
                    }
                });

                if (Object.keys(udlLightProps).length > 0) {
                    spawnObj.set(udlLightProps);
                }
            }
            
            //---------------------------------------------------------
            //Support for TokenNameNumber script by TheAaron
            //  Triggers a global function in v0.5.12 or later of his script to rename the token
            if (baseObj.name) {
                if (baseObj.name.match( /%%NUMBERED%%/ ) ) {
                    processCreated = (( 'undefined' !== typeof TokenNameNumber && TokenNameNumber.NotifyOfCreatedToken ) 
                		? TokenNameNumber.NotifyOfCreatedToken
                		: _.noop ),
            	
                    processCreated(spawnObj);
                }
            }
            //---------------------------------------------------------
            
            //set the z-order
            switch (zOrder) {
                case 'toBack':
                    toBack(spawnObj);
                    break;
                default:
                    toFront(spawnObj);
                    break;
            }

            if (bringSourceTokenToFront) {
                setTimeout(() => {
                    const sourceToken = getObj("graphic", bringSourceTokenToFront.id);
                    if (sourceToken) {
                        toFront(sourceToken);
                    }
                }, 50);

                setTimeout(() => {
                    const sourceToken = getObj("graphic", bringSourceTokenToFront.id);
                    if (sourceToken) {
                        toFront(sourceToken);
                    }
                }, 250);
            }
            
            //check for expanding token size
            
            if (expandIterations > 0) {
                resizeToken(spawnObj, expandIterations, expandDelay, 0, 0, sizeX, sizeY, destroyWhenDone);
                /*
                let new_W, new_H;
                
                let factor = 1 / expandIterations;  // size expansion factor.  
                
                while (spawnObj.get("width") <= sizeX) {
                    promise = new Promise((resolve, reject) => {
                        setTimeout(() => {
                            new_W = Math.min(spawnObj.get("width") + sizeX * factor, sizeX)
                            new_H = Math.min(spawnObj.get("height") + sizeY * factor, sizeY)
                            
                            spawnObj.set("width", new_W);
                            spawnObj.set("height", new_H);
                            //spawnObj.set("width", spawnObj.get("width") + sizeX * factor);
                            //spawnObj.set("height", spawnObj.get("height") + sizeX * factor);
                            resolve("done!");
                        }, expandDelay);
                    });
                    
                    result = await promise;
                }
                if (spawnObj.get("width") > sizeX) {
                    spawnObj.set("width", sizeX);
                }
                if (spawnObj.get("height") > sizeY) {
                    spawnObj.set("height", sizeY);
                }
                */
            }
            
        }
        catch(err) {
          sendChat('SpawnAPI',`/w "${who}" `+ 'Unhandled exception: ' + err.message)
        }
    };
    
    //returns character object for given token
    const getCharacterFromToken = function (tokenObj) {
        let charID = tokenObj.get("represents");
        character = getObj("character", charID);
        return character;
    };
    
    //returns character object for given name
    const getCharacterFromName = function (charName) {
        let character = findObjs({
            _type: 'character',
            name: charName
        }, {caseInsensitive: true})[0];
        return character;
    };
    
    //returns ability object for given characterID and ability name
    const getAbilityFromName = function (charID, abilityName) {
        let ability = findObjs({
            _type: 'ability',
            _characterid: charID,
            name: abilityName
        }, {caseInsensitive: true})[0];
        return ability;
    };
    
    //returns a string value: either 'true', or an appropriate errorString if a prior findObjs returned undefined
    const validateObject = function (who, obj, type, name) {
        let retValue
        if (typeof obj !== 'undefined') {
            retValue = 'true';  //Success!
        } else {
            switch(type) {
                case "character":
                    retValue = 'character \"' + name + '\" not found';
                    break;
                case "ability":
                    retValue = 'ability \"' + name + '\" not found';
                    break;
                default:
                    retValue = 'object not defined';
                    break;
            }
            //sendChat('SpawnAPI',`/w "${who}" `+ 'Error: ' + retValue); //send error msg
        }
        return retValue;
    };
    
    //Returns an array of x,y coordinate objects corresponding to the squares surrounding the origin token.
        //Based on size of token. Spirals clockwise a number of squares = qty
        //starts one square to the right of upper left corner (so, directly above a 1x1 token, left top of larger token), and spirals clockwise
        //Examples:   1x1 token         2x2 token
                    
                    //  9--> etc.       13	14--> etc.
                    //  8   1   2       12	1	2	3
                    //  7   --  3       11	--  --  4
                    //  6   5   4       10	--  --	5
                    //                  9	8	7	6
                    
    const GetSurroundingSquaresArr = function (qty, tok) {
        function pt(x,y) {
            this.x = x,
            this.y = y
        };
        let pts = [];
        
        let originX = tok.get("left");
        let originY = tok.get("top");
        let w = parseFloat(tok.get("width"));
        let h = parseFloat(tok.get("height"));
        
        let startX
        let startY
        if ( (w/gridSize)%2 === 0 ) {     //width is an even number of squares
            startX = originX - w/2 + gridSize/2;
            startY = originY - h/2 - gridSize/2;
        } else {                    //width is an odd number of squares
            startX = originX;
            startY = originY - h/2 - gridSize/2;
        }
            
        let x = startX; 
        let y = startY;
        
        //Nested loops to generate coordinates
        let done = false;
        let i = 0;
        while (i < qty) {
            //go across right until upper right corner
            while ( (x < originX + w/2 + gridSize/2) && (i < qty) ) {
                pts.push( new pt(x,y) );
                if (i === qty) {done = true;}
                x += gridSize;
                i++;
            }
            if (done === true) {break;}
            
            //go down until lower right corner
            while ( y < originY + h/2 + gridSize/2 && i < qty ) {
                pts.push( new pt(x,y) );
                if (i === qty) {done = true;}
                y += gridSize;
                i++;
            }
            if (done === true) {break;}
            
            //go across left until lower left corner
            while ( x > originX - w/2 - gridSize/2 && i < qty ) {
                pts.push( new pt(x,y) );
                if (i === qty) {done = true;}
                x -= gridSize;
                i++;
            }
            if (done === true) {break;}
            
            //go up until just past upper left corner
            while ( y > originY - h/2 - gridSize*1.5 && i < qty ) {
                pts.push( new pt(x,y) );
                if (i === qty) {done = true;}
                y -= gridSize;
                i++;
            }
            if (done === true) {break;}
            
            //We've gone all the way around the token. Now continue spiraling with a larger radius
            w = w + gridSize*2;
            h = h + gridSize*2;
        }
        
        return pts;
    };
    
    //Similar to GetSurroundingSquaresArr function above, but just returns an array of rastering grid coords with numCols tokens per row
    const GetGridArr = function (qty, startX, startY, numCols) {
        function pt(x,y) {
            this.x = x,
            this.y = y
        };
        let pts = [];
        
        let x = startX; 
        let y = startY;
        
        let done = false;
        let i = 0;
        let c = 0;
        
        //Nested loops to generate coordinates
        while (i < qty) {
            while ( (c < numCols) && (i < qty) ) {
                pts.push( new pt(x,y) );
                if (i === qty) {done = true;}
                x += gridSize;
                c++;
                i++;
            }
            if (done === true) {break;}
            
            //Next row
            x -= numCols*gridSize;
            y += gridSize;
            c = 0;
        }
        
        return pts;
    };
    
    //Places tokens in random squares within a (numCols x numCols) grid
    const GetRandArr = function (qty, startX, startY, numCols) {
        function pt(x,y) {
            this.x = x,
            this.y = y
        };
        let pts = [];
        
        //first, populate all the coords as if the grid was filled completely
        let fullQty = numCols*numCols;
        let fullGridPts = GetGridArr(fullQty, startX, startY, numCols)
        
        for (let i=0; i<qty; i++) {
            let idx = randomInteger(fullGridPts.length) - 1;
            pts.push( fullGridPts[idx] );
            fullGridPts.splice(idx, 1);    //remove used array element
        }
        
        return pts;
    };
    
    //Similar to GetGridArr function above, but returns an array of coords "evenly" distributed at a certain burst radius...
    //      ... relative to the outer corner squares of the origin token (NOTE: when adjusted for offset, retains the "size" of origin token)
                    //  5           8
                    //    1       4
                    //       Tok  
                    //    3       2
                    //  7           6
    const GetBurstArr = function (qty, tok, rad, offsetX, offsetY) {
        function pt(x,y) {
            this.x = x,
            this.y = y
        };
        let pts = [];
        
        
        let originX = tok.get("left") + offsetX;
        let originY = tok.get("top") + offsetY;
        let w = parseFloat(tok.get("width"));
        let h = parseFloat(tok.get("height"));
        
        let xSpacing = (2 * rad)*gridSize + w - gridSize;
        let ySpacing = (2 * rad)*gridSize + h - gridSize;
        let startX = (originX - w/2 - gridSize/2) - (rad-1)*gridSize;;
        let startY = (originY - h/2 - gridSize/2)  - (rad-1)*gridSize;;
        let x;
        let y;
        
        let i = 0;
        
        while (i < qty) {
            x = startX; 
            y = startY; 
            
            for (let n = 0; n < 4; n++) {
                if (i < qty) {
                    switch (n) {
                        case 0:
                            pts.push( new pt(x,y) );
                            break;
                        case 1:
                            pts.push( new pt(x+xSpacing,y+ySpacing) );
                            break;
                        case 2:
                            pts.push( new pt(x,y+ySpacing) );
                            break;
                        case 3:
                            pts.push( new pt(x+xSpacing,y) );
                            break;
                    }
                }
            }
            xSpacing += gridSize*2;
            ySpacing += gridSize*2;
            startX -= gridSize;
            startY -= gridSize;
            i++;
        }
        return pts;
        
    };
    
    //Similar to GetBurstArr function above, but returns an array of coords "evenly" distributed in a "Plus" pattern at a certain radius...
    //      ... relative origin token (NOTE: when adjusted for offset, retains the "size" of origin token)
                    //         5
                    //         1
                    //    7 3 Tok 4 8  
                    //         2
                    //         6
    const GetCrossArr = function (qty, left, top, width, height, rad, force) {
        function pt(x,y) {
            this.x = x,
            this.y = y
        };
        let pts = [];
        
        let originX = left;
        let originY = top;
        
        let xSpacing = (2 * rad)*gridSize + width - gridSize;
        let ySpacing = (2 * rad)*gridSize + height - gridSize;
        
        
        let startX = originX;
        let startY 
        
        if ( (height/gridSize)%2===0 ) {
            if (force) {
                startY = originY -gridSize - Math.floor(height/2) - (rad-1)*gridSize;
            } else {
                startY = originY -gridSize/2 - Math.floor(height/2) - (rad-1)*gridSize;
            }
        } else {
            startY = originY - height/2 -gridSize/2 - (rad-1)*gridSize;
        }
      
        
        let x;
        let y;
        
        let revolutions = 0;
        let i = 0;
        
        while (i < qty) {
            x = startX; 
            y = startY; 
            
            for (let n = 0; n < 4; n++) {
                if (i < qty) {
                    switch (n) {
                        case 0:         //ABOVE
                            pts.push( new pt(x,y) );
                            break;
                        case 1:         //BELOW
                            pts.push( new pt(x,y+ySpacing) );
                            break;
                        case 2:         //LEFT
                            if ( (width/70)%2===0 ) {
                                if (force) {
                                    pts.push( new pt(x - gridSize - Math.floor(width/2) - (rad-1)*gridSize - revolutions*gridSize, originY ) );
                                } else {
                                    pts.push( new pt(x - width/2 -gridSize/2 - (rad-1)*gridSize - revolutions*gridSize, originY ) );
                                }
                            } else {
                                pts.push( new pt(x - gridSize/2 - Math.floor(width/2) - (rad-1)*gridSize - revolutions*gridSize, originY ) );
                            }
                            break;
                        case 3:         //RIGHT
                            pts.push( new pt( pts[pts.length-1].x + xSpacing, originY ) );
                            break;
                    }
                }
            }
            revolutions += 1;
            xSpacing += gridSize*2;
            ySpacing += gridSize*2;
            //startX -= 70;     //no X adjustment, start of each cross is just directly above the previous start
            startY -= gridSize;
            i++;
        }
        return pts;
        
    };
    
    const isNumber = function isNumber(value) {
       return typeof value === 'number' && isFinite(value);
    }
    
    //This is the primary worker function
    const processCommands = function(data, args) {
        let retVal = [];        //array of potential error messages to pass back to main handleInput funtion
        let validObj = "false"; //data validation string
        let o = 0;              //counter for originTok loops
        let q = 0;              //counter for spawn qty loops
        let fxModes = ['bomb', 'bubbling', 'burn', 'burst', 'explode', 'glow', 'missile', 'nova', 'splatter'];
        let fxColors = ['acid', 'blood', 'charm', 'death', 'fire', 'frost', 'holy', 'magic', 'slime', 'smoke', 'water'];
        let charControlledBy = [];
        let appendControlledBy = false;
        let pageGridIncrement = 1;
        
        try {
            //args is an array object full of cmd:params pairs
            //get rid of the api call !Spawn
            args.shift();
            
            if (args.length >= 1) {
                //assign values to our params arrray based on args
                args.forEach((arg) => {
                    let option = arg["cmd"].toLowerCase().trim();
                    let param = arg["params"].trim();
                    
                    switch(option) {
                        case "memento":
                        case "targs":
                            //In case somebody clicks the api chat button again (the oldMsg info has been deleted)
                            retVal.push('Cannot re-use the api chat button');
                            return retVal;
                            break;
                        case "targets":
                            //ignore this cmd from the original message, we already obtained targets from processing the api-generated chat button call 
                            break;
                        case "name":
                            data.spawnName = param;
                            break;
                        case "qty":
                            data.qty = parseInt(param) || 1;
                            break;
                        case "placement":
                            data.placement = param;
                            break;
                        case 'force':
                            if (_.contains(['true', 'yes', '1'], param.toLowerCase())) {
                                data.forceToSquare = true;
                            } else if (_.contains(['false', 'no', '0'], param.toLowerCase())) {
                                data.forceToSquare = false;
                            }
                            else {
                                retVal.push('Invalid force to square argument (\"' + param + '\"). Choose from: (' + data.validPlacements + ')');
                                return retVal;
                            }
                            break;
                        case "offset":
                            let direction = param.split(',');
                            data.offsetX = parseFloat(direction[0]);    //wil convert to pixels later
                            data.offsetY = parseFloat(direction[1]);    //wil convert to pixels later
                            break;
                        case "sheet":
                            data.sheetName = param;
                            break;
                        case "ability":
                            data.abilityName = param;
                            break;
                        case "side":
                            //either a number or ("random"/"rand"). Actually, any text will default to random
                            data.currentSide = parseInt(param) || param;
                            break;
                        case "size":
                            let sizes = param.split(',');
                            data.sizeX = parseFloat(sizes[0]);              //wil convert to pixels later
                            if (sizes.length > 1) {
                                data.sizeY = parseFloat(sizes[1]);          //wil convert to pixels later
                            } else {
                                data.sizeY = data.sizeX;
                            }
                            break;
                        case "order":
                            if (_.contains(['tofront', 'front', 'top', 'above'], param.toLowerCase())) {
                                data.zOrder = "toFront";
                            }
                            if (_.contains(['toback', 'back', 'bottom', 'below'], param.toLowerCase())) {
                                data.zOrder = "toBack";
                            }
                            break;
                        case "bringsourcetofront":
                            if (_.contains(['true','yes', '1'], param.toLowerCase())) {
                                data.bringSourceToFront = true;
                            }
                            break;
                        case "light":
                            let lights = param.split(',');
                            data.lightRad = lights[0];
                            data.lightDim = lights[1];
                            break;
                        case "mook":
                            //Default case is false. Only change if user requests false
                            if (_.contains(['true','yes', '1'], param.toLowerCase())) {
                                data.mook = true;
                            }
                            break;
                        case "bar1":
                            if (param.toLowerCase().includes('keeplink')) {
                                data.bar1Link = true;
                                param = param.replace(/keeplink/i,'').trim();
                            } else {
                                data.bar1Link = false;
                            }
                            let bar1 = param.split('/');
                            data.bar1Val = bar1[0].trim();
                            if (bar1.length > 1) {
                                data.bar1Max = bar1[1].trim();
                            } else {
                                data.bar1Max = data.bar1Val
                            }
                            break;
                         case "bar2":
                            if (param.toLowerCase().includes('keeplink')) {
                                data.bar2Link = true;
                                param = param.replace(/keeplink/i,'').trim();
                            } else {
                                data.bar2Link = false;
                            }
                            let bar2 = param.split('/');
                            data.bar2Val = bar2[0].trim();
                            if (bar2.length > 1) {
                                data.bar2Max = bar2[1].trim();
                            } else {
                                data.bar2Max = data.bar2Val
                            }
                            break;
                         case "bar3":
                             if (param.toLowerCase().includes('keeplink')) {
                                data.bar3Link = true;
                                param = param.replace(/keeplink/i,'').trim();
                            } else {
                                data.bar3Link = false;
                            }
                            let bar3 = param.split('/');
                            data.bar3Val = bar3[0].trim();
                            if (bar3.length > 1) {
                                data.bar3Max = bar3[1].trim();
                            } else {
                                data.bar3Max = data.bar3Val
                            }
                            break;
                        case "fx":
                            data.fx = param;
                            break;
                        case "expand":
                            let p = param.split(',').map(e=>e.trim());
                            data.expandIterations = parseInt(p[0]);
                            if (p.length > 1) {
                                data.expandDelay = parseInt(p[1]);
                            }
                            if (p.length > 2) {
                                if ( _.contains(['true','yes', '1'], p[2]) ) {
                                    data.destroySpawnWhenDone = true;
                                }
                            }
                            break;
                        case "deletesource":
                            if (_.contains(['true','yes', '1'], param.toLowerCase())) {
                                data.deleteSource = true;
                            }
                            break;
                        case "deletetarget":
                            if (_.contains(['true','yes', '1'], param.toLowerCase())) {
                                data.deleteTarget = true;
                            }
                            break;
                        case "resizesource":
                            let sourceSizes = param.split(',');
                            data.resizeSourceX = parseFloat(sourceSizes[0]);   //will convert to pixels later
                            data.resizeSourceY = parseFloat(sourceSizes[1]);   //will convert to pixels later
                            if (sourceSizes.length >2) {
                                data.resizeSourceIterations = parseInt(sourceSizes[2]);
                            }
                            if (sourceSizes.length >3) {
                                data.resizeSourceDelay = parseInt(sourceSizes[3]);
                            }
                            break;
                        case "resizetarget":
                            let targetSizes = param.split(',');
                            data.resizeTargetX = parseFloat(targetSizes[0]);    //will convert to pixels later
                            data.resizeTargetY = parseFloat(targetSizes[1]);    //will convert to pixels later
                            if (targetSizes.length >2) {
                                data.resizeTargetIterations = parseInt(targetSizes[2]);
                            }
                            if (targetSizes.length >3) {
                                data.resizeTargetDelay = parseInt(targetSizes[3]);
                            }
                            break;
                        case "rotation":
                            //either a number or ("random"/"rand"). Actually, any text will default to random
                            data.angle = parseInt(param) || param;
                            break;
                        case "layer":
                            //send token to object, gm, or map layer
                            data.spawnLayer = param;
                            data.userSpecifiedLayer = true;
                            break;
                        case "isdrawing":
                            //Default case is false. Only change if user requests false
                            if (_.contains(['true','yes', '1'], param.toLowerCase())) {
                                data.isDrawing = true;
                            }
                            break;
                        case "tokenname":
                            data.tokenName = param;
                            break;
                        case "tooltip":
                            data.tooltip = param;
                            break;
                        case "tokenprops":
                        case "tokenprop":
                            data.tokenPropValPairs = param.split(',');
                            data.tokenPropValPairs = data.tokenPropValPairs.map(s => s.replace('%comma%',','));
                            data.tokenPropValPairs.forEach(pair => {
                                let pairArr = pair.split(':');
                                let prop = pairArr[0].trim();
                                if (!tokenAttributes.includes(prop)) {
                                    retVal.push('Invalid token attribute requested (' + prop + ')');
                                }
                            });
                            break;
                        case "controlledby":
                            if (param.charAt(0)==='+') {
                                appendControlledBy = true;
                                param = param.substring(1);
                            }
                            let list = param.split(',').map(e=>e.trim());
                            let players=findObjs({_type:'player'});
                            list.forEach(item => {
                                if (item.toLowerCase().includes('all') && item.length===3) {
                                    charControlledBy.push('all');
                                } else {
                                    let playerID;
                                    let player = players.filter(p=>p.get('_id')===item);
                                    if (player.length > 0) {
                                        playerID = player[0].get('_id');
                                        charControlledBy.push(playerID);
                                    } else {
                                        player = players.filter(p=>p.get('_displayname')===item);
                                        if (player.length > 0) {
                                            playerID = player[0].get('_id');
                                            charControlledBy.push(playerID);
                                        } else {
                                            retVal.push('Invalid playerID or displayname (' + item + ') in --controlledby statement.)');
                                        }
                                    }
                                }
                            });
                            break;
                        default:
                            retVal.push('Unexpected argument identifier (' + option + '). Choose from: (' + data.validArgs + ')');
                            break;    
                    }
                }); //end forEach arg
            } else {
                retVal.push('No arguments supplied. Format is \"!Spawn --Command|Value\"');
                return retVal;
            }
            //First data validation checkpoint
            if (retVal.length > 0) {return retVal};
            
            //////////////////////////////////////////////////////
            //  Input commands are good. Validate input parameters
            //////////////////////////////////////////////////////
            //SpawnName is a required arg
            if (data.spawnName === "") {
                retVal.push('No spawn target identified. Argument \"spawn|characterName\" required');;
            }
            
            //"Placement" parameter. Additional checks if 'grid', 'burst', 'cross', or 'random' 
            if ( _.contains(['stack', 'row', 'col', 'column', 'surround'], data.placement.toLowerCase()) ) {
                //Good, no additional info req'd
            } else if ( data.placement.match(/grid/i) ) {
                    //grid case     --check for number
                    if ( !data.placement.match(/(\d+)/) ) {
                        retVal.push('Invalid grid row length supplied (\"' + data.placement + '\"). Format is --placement|grid #');
                    } else {        
                        //good grid #
                        data.gridCols = data.placement.match(/(\d+)/)[0];   //use first number found for gridCols
                        data.placement = 'grid';
                    }
            } else if ( data.placement.match(/burst/i) ) {  
                    //burst case    --check for number
                    if ( !data.placement.match(/(\d+)/) ) {
                        retVal.push('Invalid burst radius supplied (\"' + data.placement + '\"). Format is --placement|burst #');
                    } else {        
                        //good burst #
                        data.burstRad = data.placement.match(/(\d+)/)[0];   //use first number found for burstRad
                        data.placement = 'burst';
                    }
            }  else if ( data.placement.match(/cross/i) ) {  
                    //burst case    --check for number
                    if ( !data.placement.match(/(\d+)/) ) {
                        retVal.push('Invalid cross radius supplied (\"' + data.placement + '\"). Format is --placement|cross #');
                    } else {        
                        //good burst #
                        data.crossRad = data.placement.match(/(\d+)/)[0];   //use first number found for crossRad
                        data.placement = 'cross';
                    }
            }  else if ( data.placement.match(/rand/i) ) {
                    //random case     --check for number
                    if ( !data.placement.match(/(\d+)/) ) {
                        retVal.push('Invalid random grid row length supplied (\"' + data.placement + '\"). Format is --placement|random #');
                    } else if (data.qty > data.placement.match(/(\d+)/)[0]*data.placement.match(/(\d+)/)[0]) {
                        let numSquares = data.placement.match(/(\d+)/)[0] * data.placement.match(/(\d+)/)[0];
                        retVal.push('Input qty (\"' + data.qty + '\") exceeds the number of available grid squares(\"'+ numSquares + '\"). Consider increasing the grid size or reducing qty.');
                    } else {        
                        //good grid #
                        data.gridCols = data.placement.match(/(\d+)/)[0];   //use first number found for gridCols
                        data.placement = 'random';
                    }
            } else {
                retVal.push('Invalid placement argument (\"' + data.placement + '\"). Choose from: (' + data.validPlacements + ')');
            }
            
            //Check for valid offset X/Y (numeric)
            if (isNaN(data.offsetX) || isNaN(data.offsetY)) {
                retVal.push('Non-numeric offset detected. Format is \"--offset|#,#\" in Squares');
            } else if (data.offsetX > 50*70 || data.offsetY > 50*70) {
                //In case the offset was entered in pixels
                retVal.push('Offset out of range. Format is \"--offset|#,#\" in Squares (Max 50)');
            }
            
            //size must be "#,#""
            if (isNaN(data.sizeX) || isNaN(data.sizeY) || data.sizeX === null || data.sizeY === null) {
                retVal.push('Non-numeric size detected. Format is \"--size|#,#\"');
            }
            
            //light must be "#,#""
            if (isNaN(data.lightRad) || isNaN(data.lightDim) || data.lightRad === null || data.lightDim === null) {
                retVal.push('Non-numeric light radius detected. Format is \"--size|#,#\" \(bright, dim\)');
            }
            
            //Numeric qty between 1 and 20 required
            if (isNaN(data.qty)) {
                retVal.push('Non-numeric qty detected. Format is \"--qty|#\"');
            } /* else if ( data.qty <  1 || data.qty > 20 ) {
                retVal.push('Input qty out of range. Must be between 1 and 20.');
            }
            */
            
            //Check for supported FX
            if (data.fx !== '') {
                let fx = data.fx.split('-');
                if (fx.length !== 2) {
                    retVal.push('Invalid FX format. Format is --fx|type-color');
                } else if (fxModes.indexOf(fx[0]) === -1 ) {
                    retVal.push('Invalid FX type requested. Supported types are ' + fxModes.join(','));
                } else if (fxColors.indexOf(fx[1]) === -1 ) {
                    retVal.push('Invalid FX color requested. Supported colors are ' + fxColors.join(','));
                }
            }

            //check token expansion animation parameters
            if (data.expandIterations !== 0) {
                if (isNaN(data.expandIterations)) {
                    retVal.push('Non-numeric animation iterations detected. Format is \"--expand|#,#\" \(iterations, delay\)');
                }
                if (isNaN(data.expandDelay)) {
                    retVal.push('Non-numeric animation delay detected. Format is \"--expand|#,#\" \(iterations, delay\)');
                }
            }
            
            //check rotation input
            if (!isNumber(data.angle)) {
                if(!_.contains(['random','rand'], data.angle.toLowerCase())) {
                    retVal.push('Invalid rotation detected. Format is \"--rotation|# or rand/random\"');
                } else {
                    data.angle = randomInteger(360)-1;  //0 to 359deg
                }
            } else {    //normalize to account for excess degrees
                data.angle %= 360
            }
            
            //check layer input
            if (data.userSpecifiedLayer) {
                if ( data.spawnLayer.match(/obj/i) || data.spawnLayer.match(/tok/i) ) {
                    data.spawnLayer = 'objects';
                } else if ( data.spawnLayer.match(/gm/i) ) {
                    data.spawnLayer = 'gmlayer';
                } else if ( data.spawnLayer.match(/map/i) ) {
                    data.spawnLayer = 'map';
                } else if ( data.spawnLayer.match(/fore/i) ) {
                    data.spawnLayer = 'foreground';
                } else {
                    retVal.push('Invalid layer requested. Valid layers are \"object(s)\", \"token\", \"tok\", \"gm\",\"map\",\"foreground\"');
                }
            }
            
            
            //2nd data validation checkpoint. Potentially return several error msgs
            if (retVal.length > 0) {return retVal};
            
            //////////////////////////////////////////////////////////////////////
            //  Input parameters are Valid. Continue with the collected parameters
            //////////////////////////////////////////////////////////////////////
            
            //The spawn location is determined relative to spawn origin token. Default is selected token. Optionally was passed as arg by user via "--targets"
            //  Get token objects for "selected" and "targets"
            if (data.originIDs.length === 0) {
                //  Origin(s) = selected token(s) --default condition
                data.selectedIDs.forEach(id => {
                    data.selectedToks.push(getObj("graphic",id));
                    data.originToks.push(getObj("graphic",id));
                });
            } else {
                //  Origin(s) are targets, separate from selected tokens
                data.selectedIDs.forEach(id => data.selectedToks.push(getObj("graphic",id)));
                data.originIDs.forEach(id => data.originToks.push(getObj("graphic",id)));
            }
            
            //get the page grid settings
            data.spawnPageID = data.originToks[0].get("pageid");
            if (data.spawnPageID) {
                let page = getObj("page", data.spawnPageID);
                if (page) {
                    pageGridIncrement = page.get("snapping_increment");
                    gridSize = 70 * pageGridIncrement;
                } else {
                    sendChat('SpawnAPI',`/w "${data.who}" `+ 'Error: Unable to find pageGridIncrement for current page. Default 70px will be used');
                }
            } else {
                 return 'Error: Unable to find SpawnPageID for origin token';
            }
            
            //convert user input to pixels using current gridSize
            data.offsetX = data.offsetX * gridSize;
            data.offsetY = data.offsetY * gridSize;
            data.sizeX = data.sizeX * gridSize;
            data.sizeY = data.sizeY * gridSize;
            if (data.resizeSourceX !== -999) { data.resizeSourceX = data.resizeSourceX * gridSize }
            if (data.resizeSourceY !== -999) { data.resizeSourceY = data.resizeSourceY * gridSize }
            
            if (data.resizeTargetX !== -999) { data.resizeTargetX = data.resizeTargetX * gridSize }
            if (data.resizeTargetY !== -999) { data.resizeTargetY = data.resizeTargetY * gridSize }
            
            
            //For spawn tokens larger than 1x1, we need to apply a correction to the spawn position 
                    //otherwise inputting an offset could still spawn on top of the origin token 
            let tokSizeCorrectX = [];
            let tokSizeCorrectY = [];
            
            data.originToks.forEach(tok => {
                let w = parseFloat(tok.get("width"));
                let h = parseFloat(tok.get("height"));
                
                data.originToksWidth.push(w);
                data.originToksHeight.push(h);
                
                //Handle all cases for the sign of offset X & Y
                //NOTE: special case if the origin token is an even number of squares and forceToSquare===true, we'd like it to spawn within a full square, not halfway between squares
                switch (true) {
                    case data.offsetX === 0 && data.offsetY === 0:  //X=0 && Y=0
                        tokSizeCorrectX.push(0);
                        tokSizeCorrectY.push(0);
                        if (data.forceToSquare) {
                            /*   */if ( (w/gridSize)%2 === 0 && (h/gridSize)%2 === 0) {     //EVEN && EVEN
                                        tokSizeCorrectX[tokSizeCorrectX.length - 1] += gridSize/2;
                                        tokSizeCorrectY[tokSizeCorrectY.length - 1] += gridSize/2;
                            } else if ( (w/gridSize)%2 === 0 && (h/gridSize)%2 !== 0) {     //EVEN && ODD
                                        tokSizeCorrectX[tokSizeCorrectX.length - 1] += gridSize/2;
                            } else if ( (w/gridSize)%2 !== 0 && (h/gridSize)%2 === 0) {     //ODD && EVEN
                                        tokSizeCorrectY[tokSizeCorrectY.length - 1] += gridSize/2;
                            } else if ( (w/gridSize)%2 !== 0 && (h/gridSize)%2 !== 0) {     //ODD && ODD
                                        //no additional correction
                            } 
                            break;
                        }
                    case data.offsetX === 0 && data.offsetY > 0:    //X=0 && Y POS
                        tokSizeCorrectX.push(0);
                        tokSizeCorrectY.push( (w-gridSize)/2 ); 
                        if (data.forceToSquare) {
                            /*   */if ( (w/gridSize)%2 === 0 && (h/gridSize)%2 === 0) {     //EVEN && EVEN
                                        tokSizeCorrectX[tokSizeCorrectX.length - 1] += gridSize/2;
                            } else if ( (w/gridSize)%2 === 0 && (h/gridSize)%2 !== 0) {     //EVEN && ODD
                                        tokSizeCorrectX[tokSizeCorrectX.length - 1] += gridSize/2;
                                        tokSizeCorrectY[tokSizeCorrectY.length - 1] -= gridSize/2;
                            } else if ( (w/gridSize)%2 !== 0 && (h/gridSize)%2 === 0) {     //ODD && EVEN
                                        tokSizeCorrectY[tokSizeCorrectY.length - 1] += gridSize/2;
                            } else if ( (w/gridSize)%2 !== 0 && (h/gridSize)%2 !== 0) {     //ODD && ODD
                                        //no additional correction
                            } 
                            break;
                        }
                    case data.offsetX === 0 && data.offsetY < 0:    //X=0 && Y NEG
                        tokSizeCorrectX.push(0);
                        tokSizeCorrectY.push( -(w-gridSize)/2 );
                        if (data.forceToSquare) {
                                /*   */if ( (w/gridSize)%2 === 0 && (h/gridSize)%2 === 0) {     //EVEN && EVEN
                                        tokSizeCorrectX[tokSizeCorrectX.length - 1] += gridSize/2;
                            } else if ( (w/gridSize)%2 === 0 && (h/gridSize)%2 !== 0) {     //EVEN && ODD
                                        tokSizeCorrectX[tokSizeCorrectX.length - 1] += gridSize/2;
                                        tokSizeCorrectY[tokSizeCorrectY.length - 1] += gridSize/2;
                            } else if ( (w/gridSize)%2 !== 0 && (h/gridSize)%2 === 0) {     //ODD && EVEN
                                        tokSizeCorrectY[tokSizeCorrectY.length - 1] -= gridSize/2;
                            } else if ( (w/gridSize)%2 !== 0 && (h/gridSize)%2 !== 0) {     //ODD && ODD
                                        //no additional correction
                            } 
                            break;
                        }
                    case data.offsetX > 0 && data.offsetY === 0:    //X POS && Y=0
                        tokSizeCorrectX.push( (w-gridSize)/2 ); 
                        tokSizeCorrectY.push(0);
                        if (data.forceToSquare) {
                                /*   */if ( (w/gridSize)%2 === 0 && (h/gridSize)%2 === 0) {     //EVEN && EVEN
                                        tokSizeCorrectY[tokSizeCorrectY.length - 1] += gridSize/2;
                            } else if ( (w/gridSize)%2 === 0 && (h/gridSize)%2 !== 0) {     //EVEN && ODD
                                        //tokSizeCorrectX[tokSizeCorrectX.length - 1] += 35;
                            } else if ( (w/gridSize)%2 !== 0 && (h/gridSize)%2 === 0) {     //ODD && EVEN
                                        tokSizeCorrectY[tokSizeCorrectY.length - 1] += gridSize/2;
                            } else if ( (w/gridSize)%2 !== 0 && (h/gridSize)%2 !== 0) {     //ODD && ODD
                                        //no additional correction
                            } 
                            break;
                        }
                    case data.offsetX < 0 && data.offsetY === 0:    //X NEG && Y=0
                        tokSizeCorrectX.push( -(w-gridSize)/2 ); 
                        tokSizeCorrectY.push(0); 
                        if (data.forceToSquare) {
                                /*   */if ( (w/gridSize)%2 === 0 && (h/gridSize)%2 === 0) {     //EVEN && EVEN
                                        tokSizeCorrectY[tokSizeCorrectY.length - 1] += gridSize/2;
                            } else if ( (w/gridSize)%2 === 0 && (h/gridSize)%2 !== 0) {     //EVEN && ODD
                                        //tokSizeCorrectX[tokSizeCorrectX.length - 1] += 35;
                            } else if ( (w/gridSize)%2 !== 0 && (h/gridSize)%2 === 0) {     //ODD && EVEN
                                        tokSizeCorrectY[tokSizeCorrectY.length - 1] += gridSize/2;
                            } else if ( (w/gridSize)%2 !== 0 && (h/gridSize)%2 !== 0) {     //ODD && ODD
                                        //no additional correction
                            } 
                            break;
                        }
                    case data.offsetX > 0 && data.offsetY > 0:    //X POS && Y POS
                        tokSizeCorrectX.push( (w-gridSize)/2 ); 
                        tokSizeCorrectY.push( (w-gridSize)/2 );
                        if (data.forceToSquare) {
                                /*   */if ( (w/gridSize)%2 === 0 && (h/gridSize)%2 === 0) {     //EVEN && EVEN
                                        //no additional correction
                            } else if ( (w/gridSize)%2 === 0 && (h/gridSize)%2 !== 0) {     //EVEN && ODD
                                        tokSizeCorrectY[tokSizeCorrectY.length - 1] -= gridSize/2;
                            } else if ( (w/gridSize)%2 !== 0 && (h/gridSize)%2 === 0) {     //ODD && EVEN
                                        tokSizeCorrectY[tokSizeCorrectY.length - 1] += gridSize/2;
                            } else if ( (w/gridSize)%2 !== 0 && (h/gridSize)%2 !== 0) {     //ODD && ODD
                                        //no additional correction
                            } 
                            break;
                        }
                    case data.offsetX > 0 && data.offsetY < 0:    //X POS && Y NEG
                        tokSizeCorrectX.push( (w-gridSize)/2 ); 
                        tokSizeCorrectY.push( -(w-gridSize)/2 );
                        if (data.forceToSquare) {
                                /*   */if ( (w/gridSize)%2 === 0 && (h/gridSize)%2 === 0) {     //EVEN && EVEN
                                        //no additional correction
                            } else if ( (w/gridSize)%2 === 0 && (h/gridSize)%2 !== 0) {     //EVEN && ODD
                                        tokSizeCorrectY[tokSizeCorrectY.length - 1] += gridSize/2;
                            } else if ( (w/gridSize)%2 !== 0 && (h/gridSize)%2 === 0) {     //ODD && EVEN
                                        tokSizeCorrectY[tokSizeCorrectY.length - 1] -= gridSize/2;
                            } else if ( (w/gridSize)%2 !== 0 && (h/gridSize)%2 !== 0) {     //ODD && ODD
                                        //no additional correction
                            } 
                            break;
                        }
                    case data.offsetX < 0 && data.offsetY > 0:    //X NEG && Y POS
                        tokSizeCorrectX.push( -(w-gridSize)/2 ); 
                        tokSizeCorrectY.push( (w-gridSize)/2 ); 
                        if (data.forceToSquare) {
                                /*   */if ( (w/gridSize)%2 === 0 && (h/gridSize)%2 === 0) {     //EVEN && EVEN
                                        //no additional correction
                            } else if ( (w/gridSize)%2 === 0 && (h/gridSize)%2 !== 0) {     //EVEN && ODD
                                        tokSizeCorrectY[tokSizeCorrectY.length - 1] -= gridSize/2;
                            } else if ( (w/gridSize)%2 !== 0 && (h/gridSize)%2 === 0) {     //ODD && EVEN
                                        tokSizeCorrectY[tokSizeCorrectY.length - 1] += gridSize/2;
                            } else if ( (w/gridSize)%2 !== 0 && (h/gridSize)%2 !== 0) {     //ODD && ODD
                                        //no additional correction
                            } 
                            break;
                        }
                    case data.offsetX < 0 && data.offsetY < 0:    //X NEG && Y NEG
                        tokSizeCorrectX.push( -(w-gridSize)/2 ); 
                        tokSizeCorrectY.push( -(w-gridSize)/2 );
                        if (data.forceToSquare) {
                                /*   */if ( (w/gridSize)%2 === 0 && (h/gridSize)%2 === 0) {     //EVEN && EVEN
                                        //no additional correction
                            } else if ( (w/gridSize)%2 === 0 && (h/gridSize)%2 !== 0) {     //EVEN && ODD
                                        tokSizeCorrectY[tokSizeCorrectY.length - 1] += gridSize/2;
                            } else if ( (w/gridSize)%2 !== 0 && (h/gridSize)%2 === 0) {     //ODD && EVEN
                                        tokSizeCorrectY[tokSizeCorrectY.length - 1] -= gridSize/2;
                            } else if ( (w/gridSize)%2 !== 0 && (h/gridSize)%2 !== 0) {     //ODD && ODD
                                        //no additional correction
                            } 
                            break;    
                        }
                }
            }); //end of data.originToks.forEach block (spawn placement corrections based on origin token size)
            
             
            ///////////////////////////////////////////////////////////////
            //  Spawn Placement  -- calculate all coordinates
            ///////////////////////////////////////////////////////////////
            
            //All tokens spawn on the same page and layer as the origin token(s) unless specified by user command
            //data.spawnPageID = data.originToks[0].get("pageid");      //this line moved up so we can get the page grid settings 
            if (data.userSpecifiedLayer===false) {
                data.spawnLayer = data.originToks[0].get("layer");
            } 
            
            
            let left;
            let top;
            let width;
            let height;
            //Calculate spawn coords
            switch (data.placement) {   //If user gave no "placement" command, default to "stack" tokens on top of each other
                //there will be (qty*num_OriginToks) coordinate pairs
                case "row":
                    for (o = 0; o < data.originToks.length; o++) {
                        left = data.originToks[o].get("left");
                        top = data.originToks[o].get("top");
                        for (q = 0; q < data.qty; q++) {
                            data.spawnX.push(left + data.offsetX  + tokSizeCorrectX[o] + q*gridSize);   
                            data.spawnY.push(top + data.offsetY  + tokSizeCorrectY[o]);
                        }
                    }
                    break;
                case "col":
                case "column":
                    for (o = 0; o < data.originToks.length; o++) {
                        left = data.originToks[o].get("left");
                        top = data.originToks[o].get("top");
                        for (q = 0; q < data.qty; q++) {
                            data.spawnX.push(left + data.offsetX + tokSizeCorrectX[o]);   
                            data.spawnY.push(top + data.offsetY  + tokSizeCorrectY[o] + q*gridSize);
                        }
                    }
                    break;
                case "surround":
                    //NOTE: This case ignores offset. Starts above the token and spirals clockwise
                    for (o = 0; o < data.originToks.length; o++) {
                        let surroundingSquares = GetSurroundingSquaresArr(data.qty, data.originToks[o]);
                        for (q = 0; q < data.qty; q++) {
                            data.spawnX.push(surroundingSquares[q].x);   
                            data.spawnY.push(surroundingSquares[q].y);
                        }
                    }
                    break;
                case "grid":   //arrange in a square grid 
                    for (o = 0; o < data.originToks.length; o++) {
                        left = data.originToks[o].get("left") + data.offsetX + tokSizeCorrectX[o];
                        top = data.originToks[o].get("top") + data.offsetY + tokSizeCorrectY[o];
                        
                        let gridSquares = GetGridArr(data.qty, left, top, data.gridCols);
                        for (q = 0; q < data.qty; q++) {
                            data.spawnX.push(gridSquares[q].x);   
                            data.spawnY.push(gridSquares[q].y);
                        }
                    }
                    break; 
                case "burst":   //arrange in an expanding burst from corners 
                    for (o = 0; o < data.originToks.length; o++) {
                        let burstSquares = GetBurstArr(data.qty, data.originToks[o], data.burstRad, data.offsetX, data.offsetY);
                        for (q = 0; q < data.qty; q++) {
                            data.spawnX.push(burstSquares[q].x);   
                            data.spawnY.push(burstSquares[q].y);
                        }
                    }
                    break;   
                case "cross":   //arrange in an expanding cross pattern vertically & horizontally 
                    for (o = 0; o < data.originToks.length; o++) {
                        left = data.originToks[o].get("left") + data.offsetX + tokSizeCorrectX[o];
                        top = data.originToks[o].get("top") + data.offsetY + tokSizeCorrectY[o];
                        width = parseFloat(data.originToks[o].get("width"));
                        height = parseFloat(data.originToks[o].get("height"))
                        
                        let crossSquares = GetCrossArr(data.qty, left, top, width, height, data.crossRad, data.forceToSquare);
                        for (q = 0; q < data.qty; q++) {
                            data.spawnX.push(crossSquares[q].x);   
                            data.spawnY.push(crossSquares[q].y);
                        }
                    }
                    break;
                case "random":   //arrange in random spaces within a square grid 
                    for (o = 0; o < data.originToks.length; o++) {
                        left = data.originToks[o].get("left") + data.offsetX + tokSizeCorrectX[o];
                        top = data.originToks[o].get("top") + data.offsetY + tokSizeCorrectY[o];
                        
                        let randSquares = GetRandArr(data.qty, left, top, data.gridCols);
                        for (q = 0; q < data.qty; q++) {
                            data.spawnX.push(randSquares[q].x);   
                            data.spawnY.push(randSquares[q].y);
                        }
                    }
                    break; 
                case "stack":   //The default case is "stack"
                default:    
                    for (o = 0; o < data.originToks.length; o++) {
                        left = data.originToks[o].get("left");
                        top = data.originToks[o].get("top");
                        for (q = 0; q < data.qty; q++) {
                            data.spawnX.push(left + data.offsetX + tokSizeCorrectX[o]);
                            data.spawnY.push(top + data.offsetY + tokSizeCorrectY[o]);
                        }
                    }
                    break;    
            }
            
            //Get page lighting mode (UDL vs LDL)
            var page = findObjs({                              
              _id: data.spawnPageID,                        
            });
            data.UDL = page[0].get("dynamic_lighting_enabled");
            let spawnX_max = parseInt(page[0].get("width")) * 70/pageGridIncrement;
            let spawnY_max = parseInt(page[0].get("height")) * 70/pageGridIncrement;
            
            //grab the character object to spawn from supplied spawnName
            let spawnObj = getCharacterFromName(data.spawnName);
            let validObj = validateObject(data.who, spawnObj, 'character', data.spawnName);
            if (!(validObj === 'true')) {
                retVal.push(validObj);
                return retVal;
            }
            
            //potentially update the controlledby property of the character sheet to be spawned
            if (charControlledBy.length > 0) {
                let cbList = '';
                let tempArr = [];
                if (appendControlledBy) {
                    let currentControlledBy = spawnObj.get('controlledby');
                    if (currentControlledBy === '') {
                        cbList = charControlledBy.join(',');
                    } else {
                        charControlledBy.forEach(pid => {
                            if (currentControlledBy.includes(pid)===false) {
                                tempArr.push(pid);
                            }
                        });
                        if (tempArr.length > 0) {
                            cbList = currentControlledBy + ',' + tempArr.join(',');
                        } else {
                            cbList = currentControlledBy;
                        }
                    }
                } else {
                    cbList = charControlledBy.join(',');
                }
                spawnObj.set('controlledby', cbList);
            }
            
            ///////////////////////////////////////////////////////////////////////////////////
            //  Start spawning!         --spawns (q=qty) tokens at each of (o=origin) locations
            ///////////////////////////////////////////////////////////////////////////////////
            //get defaulttoken for SpawnObj, then start spawning with the assembled options 
            //  NOTE: this runs asynchronously, so calling the spawn function from within callback
                spawnObj.get("_defaulttoken", function(defaultToken) {
                    let iteration = 0
                    for (o = 0; o < data.originToks.length; o++) {
                        for (q = 0; q < data.qty; q++) {
                            //Make sure we don't try to spawn off the map
                            if (data.spawnX[iteration] > 0 && data.spawnX[iteration] < spawnX_max & data.spawnY[iteration] > 0 && data.spawnY[iteration] < spawnY_max) {
                                //trigger special FX?
                                if (data.fx !== ''){
                                    spawnFx(data.spawnX[iteration], data.spawnY[iteration], data.fx, data.spawnPageID);
                                }
                                //Spawn the token!
                                spawnTokenAtXY(data.who, defaultToken, data.spawnPageID, data.spawnLayer, data.spawnX[iteration], data.spawnY[iteration], data.currentSide, data.sizeX, data.sizeY, data.zOrder, data.lightRad, data.lightDim, data.mook, data.UDL, data.bar1Val, data.bar1Max, data.bar1Link, data.bar2Val, data.bar2Max, data.bar2Link, data.bar3Val, data.bar3Max, data.bar3Link, data.expandIterations, data.expandDelay, data.destroySpawnWhenDone, data.angle, data.isDrawing, data.tokenName, data.tooltip, data.tokenPropValPairs, data.bringSourceToFront ? data.originToks[o] : null);
                                
                            } else {
                                log("off the map!");
                            }
                            iteration += 1;
                        }    
                    }
                });
            
            //Optional resize source token
            if (data.resizeSourceX !== -999 && data.resizeSourceY !== -999) {
                data.selectedToks.forEach(tok => {
                    resizeToken(tok, data.resizeSourceIterations, data.resizeSourceDelay, tok.get("width"), tok.get("height"), data.resizeSourceX, data.resizeSourceY, data.destroySpawnWhenDone)
                });
            }
            //Optional resize target token
            if (data.resizeTargetX !== -999 && data.resizeTargetY !== -999) {
                data.originToks.forEach(tok => {
                    resizeToken(tok, data.resizeTargetIterations, data.resizeTargetDelay, tok.get("width"), tok.get("height"), data.resizeTargetX, data.resizeTargetY, data.destroySpawnWhenDone)
                });
            }
            
            //Optional delete source token
            if (data.deleteSource === true) {
                data.selectedToks.forEach(tok => {
                    tok.remove();
                });
            }
            //Optional delete target token
            if (data.deleteTarget === true) {
                data.originToks.forEach(tok => {
                    tok.remove();
                });
            }
            
            
            /////////////////////////////////////////////////////////////////////////////////
            //Optional automatic trigger of a supplied ability "macro" when spawn is complete
            //      Default sheet is from the selected token, 
            //      ...but allow looking from another character sheet if supplied (e.g. "macro mule") via --sheet|charName
            /////////////////////////////////////////////////////////////////////////////////
            
            validObj = 'false';
            if (data.abilityName !== "") {  //user wants to trigger an ability after spawn
                if (data.sheetName === "") {
                    //Look for the ability on the first selected token. Get character sheet first.
                    var sheetCharObj = getCharacterFromToken(data.selectedToks[0]);  
                        validObj = validateObject(data.who, sheetCharObj, 'character', data.selectedToks[0].get("name"));
                } else {
                    //User sepecified ability is found on a sheet other than the first selected token. Get character sheet first.
                    var sheetCharObj = getCharacterFromName(data.sheetName);
                        validObj = validateObject(data.who, sheetCharObj, 'character', data.sheetName);
                }
                if (!(validObj === 'true')) {
                    retVal.push(validObj);
                    return retVal
                }
                
                //Get the characterID to find the ability 
                let sheetCharID = sheetCharObj.get("id");
                
                //now actually look for the ability and call it with sendChat
                validObj = 'false';
                let abilityObj = getAbilityFromName(sheetCharID, data.abilityName);
                    validObj = validateObject(data.who, abilityObj, 'ability', data.abilityName);
                    if (!(validObj === 'true')) {
                        retVal.push(validObj);
                        return retVal
                    }
                 
                let action = abilityObj.get("action");
                //log(action);
                sendChat(data.who, action);
            }
        
            return retVal;
        
        } catch(err) {
            sendChat('SpawnAPI',`/w "${data.who}" `+ 'Unhandled exception: ' + err.message);
        }
    };
    
    const parseArgs = function(msg) {
        msg.content = msg.content
            .replace(/<br\/>\n/g, ' ')
            .replace(/(\{\{(.*?)\}\})/g," $2 ")
        
        //Check for inline rolls for spawn qty e.g. [[1d4]] or [[ 1t[tableName] ]]
        inlineContent = processInlinerolls(msg);
        
        let args = inlineContent.split(/\s+--/).map(arg=>{
                let cmds = arg.split('|');
                return {
                    cmd: cmds.shift().toLowerCase().trim(),
                    params: cmds[0]
                };
            });
        return args;
    };
    
    ////////////////////////////////////////////////////////////////////////////////////////
    //          PRIMARY MESSAGE HANDLER
    ////////////////////////////////////////////////////////////////////////////////////////
    const handleInput = function(msg) {
        try {
            if(msg.type=="api" && msg.content.indexOf("!Spawn") === 0 ) {
                whoDat = getObj('player',msg.playerid).get('_displayname');
                //only a valid call if token(s) have been selected, or if the api was called from the script-generated chat button using the "memento" registry
                if (msg.selected === undefined && msg.content.indexOf("memento") === -1 ) {
                    sendChat('SpawnAPI',`/w "${whoDat}" `+ 'You must select a token to proceed');
                    return;
                }
                
                ////////////////////////////////////////////////////////////////////////////////////////
                //  Container for all of the possible relevant parameters, with defaults when available
                ////////////////////////////////////////////////////////////////////////////////////////
                    // data object hoisted for use in functions above
                var data = {
                    who: whoDat,        //Who called the script
                    spawnName: "",      //name of the target to spawn
                    validArgs: "name, qty, targets, placement, force, offset, sheet, ability, side, size, order, bringSourceToFront, light, mook, fx, bar1, bar2, bar3, expand, deleteSource, deleteTarget, resizeSource, resizeTarget, rotation, layer",    //list of valid user commands for error message
                    qty: 1,             //how many tokens to spawn at each origin
                    //tokenIDs and objects
                    originToks: [],     //array of token objects to be used as reference point(s) for spawn location(s). 
                                            //---(Default will be the selected token, but --numTargets is an optional argument that will spawn from target token(s))
                    originIDs: [],      //array of originIDs
                    originToksWidth: [], //used for cases where token is larger size. Will shift spawn location to perimeter
                    originToksHeight: [], //used for cases where token is larger size. Will shift spawn location to perimeter
                    selectedToks: [],   //array of the selected tokens
                    selectedIDs: [],    //the selected tokenID(s)
                    
                    //Where the token will spawn -> (pageID, left, top)
                        //---Defaults to selected token unless supplied by user with @{target|...}
                        //---May be additionally modified by offset(X,Y)
                    spawnPageID: "",     //what page to spawn.
                    spawnX: [],         //spawn coordinates. Array to handle multiple spawns
                    spawnY: [],         //spawn coordinates. Array to handle multiple spawns
                    offsetX: 0,         //offset from origin token. (Note: offset is input in SQUARES and converted to pixels)
                    offsetY: 0,
                    forceToSquare: false,    //Forces spawn to occur in a full square. If false && origin token is even number of squares, may spawn between squares depending on offset conditions
                    validPlacements: "stack, row, col/column, surround, grid, burst, cross",    //list of valid placement arguments for error message
                    placement: "stack", //how to place multiple tokens:
                                            //'stack'       = tokens stacked on top of each other
                                            //'row'         = horizontal row of tokens
                                            //'column/col'  = vertical column of tokens
                                            //'surround'    = clockwise spiral placement around origin  (ignores offset)
                                            //'grid #'      = square grid with # cols. Raster left to right
                                            //'burst #'     = "evenly" distributed diagonal qty, starting at corners and away from origin by #
                                            //'cross #'     = "evenly" distributed vert/horiz qty, starting directly above origin by # squares
                    burstRad: 0,        //how far away from origin the burst placement starts
                    crossRad: 0,        //how far away from origin the cross placement starts
                    gridCols: 3,        //Only used for grid placement. number of tokens per row 
                                            
                    //Spawned token properties
                    currentSide: -999,  //sets the side of a rollable table token
                    sizeX: 1,          //sets the size of token (will be converted to pixels based on pege grid size)
                    sizeY: 1,              //--Defaults to 1x1 square. (NOTE: user inputs in squares and gets converted to pixels)
                    zOrder: "toFront",  //Default z-order
                    bringSourceToFront: false, //Bring the origin/source token back above spawned tokens after spawn completes
                    lightRad: -999,     //Optional change the emitted light characteristics --> light_radius
                    lightDim: -999,     //Optional change the emitted light characteristics --> light_dimradius
                    mook: false,        //Will the token use "represents"? If true, will change linked attributes for all associated tokens (e.g. hp)
                    bar1Val: "",        //bar1 overridevalue 
                    bar1Max: "",        //bar1_max overridevalue
                    bar1Link: false,    //Do we retain the bar1 attribute link?
                    bar2Val: "",        //bar2 overridevalue 
                    bar2Max: "",        //bar2_max overridevalue
                    bar2Link: false,    //Do we retain the bar2 attribute link?
                    bar3Val: "",        //bar3 overridevalue 
                    bar3Max: "",        //bar3_max overridevalue
                    bar3Link: false,    //Do we retain the bar3 attribute link?
                    UDL: false,         //Does the page use UDL?
                    sheetName: "",          //the char sheet in which to look for the supplied ability, defaults to the sheet tied to the first selected token 
                    abilityName: "",        //an ability to trigger after spawning
                    fx: "",                  //fx to trigger at the origin point(s)
                    expandIterations: 0,    //how many animation frames to use if animated token expansion is called for
                    expandDelay: 50,         //delay (in ms) between each frame if animated expansion is called for
                    deleteSource: false,    //deletes the source token upon spawning new token
                    deleteTarget: false,    //deletes the target token upon spawning new token
                    resizeSourceX: -999,    //resizes the source token upon spawning new token
                    resizeSourceY: -999,    //resizes the source token upon spawning new token
                    resizeTargetX: -999,    //resizes the target token upon spawning new token
                    resizeTargetY: -999,    //resizes the target token upon spawning new token
                    resizeSourceIterations: 20,    //how many animation frames to use if animated source token resize is called for
                    resizeSourceDelay: 50,         //delay (in ms) between each frame if animated source resize is called for
                    resizeTargetIterations: 20,    //how many animation frames to use if animated target token resize is called for
                    resizeTargetDelay: 50,         //delay (in ms) between each frame if animated target resize is called for
                    destroySpawnWhenDone: false,   //delete the spawned token after animation is complete    
                    angle: 0,                      //change the rotation of the spawned token
                    userSpecifiedLayer: false,     //flag to determine how spawned token layer is defined
                    spawnLayer: "objects",         //user can set to "object", "token", "gm", or "map"
                    isDrawing: false,              //user can set isdrawing property of token 
                    tokenName: "",                 //optional override for the token name - allows token name to be different than the character name 
                    tooltip: "",                   //new tooltip token property   
                    tokenPropValPairs: ""          //array of tokenProp:value pairs
                };
                
                //Parse msg into an array of argument objects [{cmd:params}]
                        //using helper function because we may have to do it a second time on oldMsg for the --targets case
                let args = parseArgs(msg);
                
                /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                //  Due to a bug in the API, if a @{target|...} is supplied, the API does not acknowledge msg.selected anymore.
                //      See notes at the top of the script
                //      This code block handles this "targets" case by creating a chat button to enable both selected(s) and target(s) 
                /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                
                //First, see if there was a --targets argument
                let targ = args.find(c=>'targets' === c.cmd);
                if (targ) { // USER REQUESTING TARGETS CASE
                    // if --targets was specified, find the number of targets to get and whisper a button to the caller
                    let mid = store(msg);
                    
                    let splits = targ.params.split(',');
                    let userText = "";
                    if (splits.length > 1){          
                        userText = splits[1].replace(/%comma%/g,",").trim();          	
                    }
					let num = parseInt(splits[0])||1;
                    
                    sendChat('',`/w "${data.who}" [Select Targets](!Spawn --memento|${mid} --targs|${range(num).map(n=>`&commat;{target|Pick ${n}|token_id}`).join(',')}) ${userText}`);
                    
                    
                } else {    // NO "--TARGETS" IN MESSAGE -- could be an original call or a call from the api-generated chat button
                    
                    //CHECK FOR "OLD" MESSAGE -- occurs when user previously requested targets and has clicked the chat button
                    // see if this is a button call back for getting targets
                    let marg = args.find(c=>'memento' === c.cmd);
                    if (marg) {  // TARGETS REQUESTED CASE
                        let oldMsg = retrieve(parseInt(marg.params));
                        
                        // found the old message
                        if(oldMsg){
                            //get list of targets
                            let tsarg = args.find(c=>'targs' === c.cmd);
                            let targets = tsarg["params"].split(",");
                            
                            //reassign args using  the original message
                            args = parseArgs(oldMsg);
                            //assign targetIDs to data object (extracted from chat button message)
                            targets.forEach((targ) => {
                                data.originIDs.push(targ);
                            });
                            
                            //assign selectedIDs to params (extracted from old message)
                            oldMsg.selected.forEach((sel) => {
                                data.selectedIDs.push(sel["_id"]);
                            });
                        } 
                    } else {  // NO OLD MESSAGE -- this is a singular api call, using only "selected" token (no targets)  
                        //assign selectedIDs to data object directly from the one (and only) call to the script
                        msg.selected.forEach((sel) => {
                            data.selectedIDs.push(sel["_id"]);
                        });
                    }
                    
                    ///////////////////////////////////////////////////////////////////////////////////////////////////
                    //Ok, now that we've handled all the selected/target unpleasantness, we're ready to start spawning!
                    ///////////////////////////////////////////////////////////////////////////////////////////////////
                    let errorMsg = processCommands(data, args) || [];
                    if (errorMsg.length > 0) {
                        //Spam the chat with one or more errors (could be multiple due to user input validation checks)
                        errorMsg.forEach((errMsg) => {
                            sendChat('SpawnAPI',`/w "${data.who}" `+ errMsg);
                        });
                        return;
                    } 
                    
                }
            }
        }
        catch(err) {
          sendChat('SpawnAPI',`/w "${data.who}" `+ 'Unhandled exception: ' + err.message);
        }
    };
    
    const registerEventHandlers = function() {
        on('chat:message', handleInput);
    };

    on("ready",() => {
        checkInstall();
        registerEventHandlers();
    });

    return {
        spawnAtXY: function(options) {
            const character = getCharacterFromName(options.name);

            if (!character) {
                sendChat('SpawnAPI', '/w gm character "' + options.name + '" not found');
                return;
            }

            character.get('_defaulttoken', function(defaultToken) {
                if (!defaultToken) {
                    sendChat('SpawnAPI', '/w gm character "' + options.name + '" has no readable default token');
                    return;
                }

                spawnTokenAtXY(
                    'gm',
                    defaultToken,
                    options.pageId,
                    options.layer || 'objects',
                    options.left,
                    options.top,
                    options.side === undefined || options.side === null ? -999 : options.side,
                    options.width,
                    options.height,
                    'toFront',
                    -999,
                    -999,
                    false,
                    false,
                    '',
                    '',
                    false,
                    '',
                    '',
                    false,
                    '',
                    '',
                    false,
                    0,
                    50,
                    false,
                    options.rotation || 0,
                    false,
                    options.tokenName || options.name,
                    '',
                    options.tokenProps || [],
                    null
                );
            });
        }
    };
})();
{ try { throw new Error(''); } catch (e) { API_Meta.Spawn.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.Spawn.offset); } }
/*
================================================================
END SCRIPT: SpawnDefaultToken
================================================================
*/

/*
================================================================
BEGIN SCRIPT: MapChange
SOURCE FILE: MapChange(1).md
================================================================
*/
// Github:   https://github.com/TheWhiteWolves/MapChange.git
// By:       TheWhiteWolves
// Contact:  https://app.roll20.net/users/1043/thewhitewolves

var MapChange = MapChange || (function() {
    'use strict';
    // Defaults.
    // Date last modified in unix timestamp format.
    var lastModified = "1718838000";
    // Name of the person who last modified the script.
    var modifiedBy = "TheWhiteWolves, keithcurtis";
    // Local version of the script.
    var version = "1.8";
    // Set to true to use built in debug statements
    var debug = false;
    // Set to false to turn off notifing the GM when a player moves.
    var gmNotify = false;
    // The marker used to decide what is placed in the private map.
    var marker = "[GM]";
    // The marker used to decide what is placed in the hidden map.
    var hideMarker = "[Hide]";
    // When true this places the pages with name containing the marker into the public list.
    // Use this if you want maps to be private by default instead of public by default.
    var invertedMarker = false;
    // Check the installation of the script and setup the default configs.
    var checkInstall = function() {
        if (!state.MapChange || state.MapChange.version !== version) {
            state.MapChange = state.MapChange || {};
            state.MapChange = {
                // Version number
                version: version,
                // Date last modified in unix timestamp format.
                lastModified: lastModified,
                // Name of the person who last modified the script.
                modifiedBy: modifiedBy,
                // Timestamp when the global config was last updated.
                gcUpdated: 0,
                // List of available user configs.
                config: {
                    // Set to true to use built in debug statements
                    debug: debug,
                    // Set to false to turn off notifing the GM when a player moves.
                    gmNotify: gmNotify,
                    // The marker used to decide what is placed in the private map.
                    marker: marker,
                    // The marker used to decide what is placed in the hidden map.
                    hideMarker: hideMarker,
                    // When true this places the pages with name containing the marker into the public list.
                    // Use this if you want maps to be private by default instead of public by default.
                    invertedMarker: invertedMarker
                },
                // These are maps that players are able to move to using the commands.
                publicMaps: {},
                // These are maps that only the GM can move people to.
                privateMaps: {},
                // These are maps that have been moved to the archived folder.
                archiveMaps: {},
                // These are maps that have been marked as hidden.
                hiddenMaps: {}
            };
        }
        // Check if the state doesn't contain the blocked players list.
        if (!_.has(state.MapChange, "blockedPlayers")) {
            // If it doesn't then initilise it with an empty array.
            state.MapChange.blockedPlayers = [];
        }
        // Load and changes to the defaults from the global config.
        loadGlobalConfig();
    };
    
    // Loads the config options from the global config.
    var loadGlobalConfig = function() {
        // Get a reference to the global config.
        var gc = (globalconfig && (globalconfig.MapChange || globalconfig.mapchange));
        // Get a reference to the state.
        var st = state.MapChange;
        // Check if the settings need updating from the global config.
        if (gc && gc.lastsaved && gc.lastsaved > st.gcUpdated) {
            // Get the last saved time.
            //st.gcUpdated = gc.lastsaved;
            // Get the debug setting from the global config.
            st.config.debug = gc['Debug Mode'] == "true";
            // Get the gmNotify setting from the global config.
            st.config.gmNotify = gc['GM Notification'] == "true";
            // Get the marker setting from the global config.
            st.config.marker = gc['Marker'] || "[GM]";
            // Get the hide marker setting from the global config.
            st.config.hideMarker = gc['Hide Marker'] || "[Hide]";
            // Get the invertedMarker setting from the global config.
            st.config.invertedMarker = gc['Inverted Marker'] == "true";
        }
        // Debug
        if (st.config.debug) {
            log("Global Config");
            log(gc)
            log("State Config:");
            log(st.config);
        }
    };
    
    // Constructs the private and public maps for use in the api script.
    var constructMaps = function() {
        // Clear the public maps.
        state.MapChange.publicMaps = {};
        // Clear the private maps.
        state.MapChange.privateMaps = {};
        // Clear the archive maps.
        state.MapChange.archiveMaps = {};
        // Clear the hidden maps.
        state.MapChange.hiddenMaps = {};
        // Get an object containing all the pages in the campaign.
        var pages = findObjs({_type: 'page'});
        // Loop through the pages adding them to their relevent maps.
        for (var key in pages) {
            if (pages.hasOwnProperty(key)) {
                // Get the name of the page that is current being processed.
                var name = pages[key].get("name");
                // Get the id of the page that is current being processed.
                var id = pages[key].get("_id");
                // Check if the page has been marked as hidden.
                if (name.indexOf(state.MapChange.config.hideMarker) > -1) {
                    // If it has then remove the hidden marker and trim off any whitespace.
                    name = name.replace(state.MapChange.config.hideMarker, "").trim();
                    // Place the name and id in the hidden maps.
                    state.MapChange.hiddenMaps[name] = id;
                }
                else {
                    // Check if the page is an archived page.
                    if (pages[key].get("archived") === true) {
                        // If it is then remove the private map marker if it exists and trim off any whitespace.
                        name = name.replace(state.MapChange.config.marker, "").trim();
                        // Place the name and id in the archive maps.
                        state.MapChange.archiveMaps[name] = id;
                    }
                    else {
                        // Check if the name of the page contains the marker.
                        if (name.indexOf(state.MapChange.config.marker) > -1) {
                            // If the name does then remove the marker from the name and trim off any whitespace.
                            name = name.replace(state.MapChange.config.marker, "").trim();
                            // If invertedMarker is being used then place the name and id of the page in the 
                            // public map else place it in the private map.
                            state.MapChange.config.invertedMarker ? state.MapChange.publicMaps[name] = id : state.MapChange.privateMaps[name] = id;
                        }
                        else {
                            // If the name does not contain the marker then place the name and id in the public map
                            // if invertedMarker is being used else place it in the private map.
                            state.MapChange.config.invertedMarker ? state.MapChange.privateMaps[name] = id : state.MapChange.publicMaps[name] = id;
                        }
                    }
                }
            }
        }
        // Debug
        if (state.MapChange.config.debug) {
            log("Public:");
            log(state.MapChange.publicMaps);
            log("Private:");
            log(state.MapChange.privateMaps);
            log("Archived:");
            log(state.MapChange.archiveMaps);
            log("Hidden:");
            log(state.MapChange.hiddenMaps);
        }
    };
    
    // Handle the input message call for the api from the chat event.
    var handleInput = function(msg) {
        // Check that the message sent is for the api, if not return as we don't need to do anything.
        if (msg.type !== "api") {
            return;
        }
        // Grab the contents of the msg sent and split it into the individual arguments.
        var args = msg.content.split(/\s+--/);
        // Parse the first section of the arguments to get an array containing the commands.
        var commands = parseCommands(args.shift());
        // Parse the remaining aruments to get any parameters passed in.
        var params = parseParameters(args);
        // Check the lower cased version of the message to see if it contains the call for
        // this script to run, if it doesn't then return.
        switch (commands.shift().toLowerCase()) {
            case "!mapchange":
            case "!mc":
                // Check if the sending player is on the list of blocked players and is not a GM.
                if (_.contains(state.MapChange.blockedPlayers, msg.playerid) && !playerIsGM(msg.playerid)) {
                    // Send the player a message 
                    chat("/w", msg.who, "Your GM has blocked you from using commands from MapChange.<br>Please contact a GM to remove the block.");
                }
                else {
                    // Check to see if any further commands were passed in and process them, else
                    // show the help test on how to use the script.
                    if (commands.length > 0) {
                        // Process the remaining commands with the passed in paramters.
                        processCommands(msg, commands, params);
                    }
                    else {
                        // Show the sender the script help message.
                        showHelp(msg, "index");
                    }
                }
                break;
            default:
                // If we reached here it means that the call to the api was not meant for us.
                return;
        }
    };
    
    // Parses the commands of the call to the api script.
    var parseCommands = function(args) {
        if (args === undefined) {
            // If it is then return an empty array.
            return [];
        }
        // Split the arguments by spaces and return the array containing them all.
        return args.split(/\s+/);
    };
    
    // Parses the parameters of the call to the api script.
    var parseParameters = function(args) {
        // Check if args is undefined.
        if (args === undefined) {
            // If it is then return an empty object.
            return {};
        }
        // Declare a new object to hold the parameters.
        var params = {};
        // Loop through all the passed in arguments and construct them in into the parameters.
        for (var param in args) {
            if (args.hasOwnProperty(param)) {
                // Split the parameter down by spaces and temporarily store it.
                var tmp = args[param].split(/\s+/);
                // Take the first element in tmp and use it as the parameter name and reassemble the
                // remaining elements and replace the commas with spaces for the parameter value.
                params[tmp.shift()] = tmp.join().replace(/,/g, " ");
            }
        }
        // Return the constructed object of parameters.
        return params;
    };
    
    // Processes the commands provided in the call to the api script.
    var processCommands = function(msg, commands, params) {
        // Take the command and decide what function to run.
        switch (commands.shift().toLowerCase()) {
            case "help":
                // Specify the default show behaviour to be "all".
                var show = "index";
                // Check to see if the show parameter was provided in the api call.
                if (params.hasOwnProperty("show")) {
                    // If it was then check that it is not empty and if it isn't then change show to 
                    // the value of the parameter.
                    show = (params.show !== "") ? params.show.toLowerCase() : "index";
                }
                // Send the help text to the player who sent the message.
                showHelp(msg, show);
                break;
            case "menu":
                // Specify the default show behaviour to be "all".
                var show = "all";
                // Check to see if the show parameter was provided in the api call.
                if (params.hasOwnProperty("show")) {
                    // If it was then check that it is not empty and if it isn't then change show to 
                    // the value of the parameter.
                    show = (params.show !== "") ? params.show.toLowerCase() : "all";
                }
                // Show the menu to the sender of the api call with the applicable filters.
                showMenu(msg, show);
                break;
            case "refresh":
                // Refresh the public and private maps to pull in any changes made since the script
                // was last started.
                refresh(msg);
                break;
            case "move":
                // Check to see if the sender has provided and target map for the move, if they
                // haven't then send them a chat message to tell them it is missing.
                if (params.hasOwnProperty("target")) {
                    // Check to see if the sender has provided a player to be moved, if they 
                    // haven't then user the id of the sender.
                    if (params.hasOwnProperty("player")) {
                        // Move the provided player to the map with the provided name.
                        move(msg, getPlayerIdFromDisplayName(params.player), params.target);
                    }
                    else {
                        // Move the sender to the map with the provided name.
                        move(msg, msg.playerid, params.target);
                    }
                }
                else {
                    // Send a chat message to tell teh sender that they missed the target map parameter.
                    chat("/w", msg.who, "Target map parameter missing, use !mc help to see how to use this script.");
                }
                break;
            case "shift":
                if (!playerIsGM(msg.playerid)) {
                    chat("/w", msg.who, "You do not have the permission required to perform that action.");
                    break;
                }

                if (!params.hasOwnProperty("target")) {
                    chat("/w", msg.who, "Target map parameter missing.");
                    break;
                }

                if (!params.hasOwnProperty("token")) {
                    chat("/w", msg.who, "Token parameter missing.");
                    break;
                }

                shiftControlledTokenPlayer(msg, params.token, params.target, params);
                break;
            case "return":
                if (!playerIsGM(msg.playerid)) {
                    chat("/w", msg.who, "You do not have the permission required to perform that action.");
                    break;
                }

                if (!params.hasOwnProperty("target")) {
                    chat("/w", msg.who, "Target map parameter missing.");
                    break;
                }

                if (!params.hasOwnProperty("token")) {
                    chat("/w", msg.who, "Token parameter missing.");
                    break;
                }

                returnControlledTokenPlayer(msg, params.token, params.target, params);
                break;
                break;
            case "movetoken":
                if (!playerIsGM(msg.playerid)) {
                    chat("/w", msg.who, "You do not have the permission required to perform that action.");
                    break;
                }

                if (!params.hasOwnProperty("target")) {
                    chat("/w", msg.who, "Target map parameter missing.");
                    break;
                }

                if (!params.hasOwnProperty("token")) {
                    chat("/w", msg.who, "Token parameter missing.");
                    break;
                }

                moveControlledTokenPlayers(msg, params.token, params.target);
                break;
            case "rejoin":
                // Check to see if a player name was provided, if so then run rejoin on that player only if
                // the sender is either a GM or the provided player is the sender.
                if (params.hasOwnProperty("player")) {
                    // Check the sender is either a GM or the provided player.
                    if (playerIsGM(msg.playerid) || params.player === msg.who) {
                        // Run the rejoin on the provided player.
                        rejoin(msg, getPlayerIdFromDisplayName(params.player));
                    }
                    else {
                        // Send a warning to the sender to tell them that they cannot perform the action.
                        chat("/w", msg.who, "You do not have the permission required to perform that action.");
                    }
                }
                else {
                    // Run rejoin on the sender of the api call.
                    rejoin(msg, msg.playerid);
                }
                break;
            case "rejoinall":
                // Move all the players back to the bookmark.
                rejoinall(msg);
                break;
            case "moveall":
                // Move all the players back to the bookmark and then move the bookmark to the map with
                // the provided name.
                moveall(msg, params.target);
                break;
            case "block":
                // Check if the sender of the message is a GM.
                if (playerIsGM(msg.playerid)) {
                    // If they are then check to see if the params contain the player parameter.
                    if (params.hasOwnProperty("player")) {
                        // Toggle the block on the provided player.
                        block(msg, getPlayerIdFromDisplayName(params.player));
                    }
                    else {
                        // Toggle the block on the sender of the message
                        block(msg, msg.playerid);
                    }
                }
                else {
                    // Send a warning to the sender to tell them that they cannot perform the action.
                    chat("/w", msg.who, "You do not have the permission required to perform that action.");
                }
                break;
            default:
                // Show the scripts help text is no further command was provided.
                showHelp(msg, "index");
                break;
        }
    };

    var getControlledPlayerIdsFromToken = function(tokenId) {
        var token = getObj("graphic", tokenId);
        var playerIds = [];

        if (!token) {
            return playerIds;
        }

        var controlledBy = token.get("controlledby") || "";

        if (!controlledBy && token.get("represents")) {
            var character = getObj("character", token.get("represents"));

            if (character) {
                controlledBy = character.get("controlledby") || "";
            }
        }

        controlledBy.split(",").forEach(function(playerId) {
            playerId = playerId.trim();

            if (!playerId || playerId === "all") {
                return;
            }

            if (!_.contains(playerIds, playerId)) {
                playerIds.push(playerId);
            }
        });

        return playerIds;
    };

    var moveControlledTokenPlayers = function(msg, tokenId, target) {
        var token = getObj("graphic", tokenId);

        if (!token) {
            chat("/w", msg.who, "Token not found.");
            return;
        }

        var playerIds = getControlledPlayerIdsFromToken(tokenId);

        if (!playerIds.length) {
            chat("/w", msg.who, "No specific player controls " + token.get("name") + ".");
            return;
        }

        playerIds.forEach(function(playerId) {
            move(msg, playerId, target);
        });

        chat("/w", msg.who, "Moved controller(s) of " + token.get("name") + " to " + target + ".");
    };

    var getControlledPlayerIdsFromToken = function(tokenId) {
        var token = getObj("graphic", tokenId);
        var playerIds = [];

        if (!token) {
            return playerIds;
        }

        var controlledBy = token.get("controlledby") || "";

        if (!controlledBy && token.get("represents")) {
            var character = getObj("character", token.get("represents"));

            if (character) {
                controlledBy = character.get("controlledby") || "";
            }
        }

        controlledBy.split(",").forEach(function(playerId) {
            playerId = playerId.trim();

            if (!playerId || playerId === "all") {
                return;
            }

            if (!_.contains(playerIds, playerId)) {
                playerIds.push(playerId);
            }
        });

        return playerIds;
    };

    var getMapPageIdFromTargetName = function(target) {
        if (target in state.MapChange.publicMaps) {
            return state.MapChange.publicMaps[target];
        }

        if (target in state.MapChange.privateMaps) {
            return state.MapChange.privateMaps[target];
        }

        if (target in state.MapChange.archiveMaps) {
            return state.MapChange.archiveMaps[target];
        }

        if (target in state.MapChange.hiddenMaps) {
            return state.MapChange.hiddenMaps[target];
        }

        return null;
    };

    var getSpawnNameFromToken = function(token) {
        var characterId = token.get("represents") || "";
        var character = characterId ? getObj("character", characterId) : null;

        if (character) {
            return character.get("name") || token.get("name");
        }

        return token.get("name");
    };

    var spawnShiftedDefaultToken = function(sourceToken, targetPageId) {
        if (
            typeof SpawnDefaultToken === "undefined" ||
            !SpawnDefaultToken ||
            typeof SpawnDefaultToken.spawnAtXY !== "function"
        ) {
            return false;
        }

        var spawnName = getSpawnNameFromToken(sourceToken);

        if (!spawnName) {
            return false;
        }

        SpawnDefaultToken.spawnAtXY({
            name: spawnName,
            tokenName: spawnName,
            pageId: targetPageId,
            layer: "objects",
            left: sourceToken.get("left"),
            top: sourceToken.get("top"),
            width: sourceToken.get("width"),
            height: sourceToken.get("height"),
            rotation: sourceToken.get("rotation")
        });

        return true;
    };

    var getCustomFxIdByName = function(fxName) {
        var name = String(fxName || "").toLowerCase();

        if (!name) {
            return null;
        }

        var matches = findObjs({
            _type: "custfx"
        });

        var match = _.find(matches, function(fx) {
            return String(fx.get("name") || "").toLowerCase() === name;
        });

        return match ? match.id : null;
    };

    var playShiftFx = function(token, fxName) {
        if (!fxName) {
            return;
        }

        var fxId = getCustomFxIdByName(fxName) || fxName;

        spawnFx(
            token.get("left"),
            token.get("top"),
            fxId,
            token.get("_pageid")
        );
    };

    var stashShiftedSourceToken = function(sourceToken, stashTokenId, vanish) {
        var stashToken = getObj("graphic", stashTokenId);

        if (!stashToken || stashToken.get("subtype") !== "token") {
            return false;
        }

        if (sourceToken.get("_pageid") !== stashToken.get("_pageid")) {
            return false;
        }

        if (vanish) {
            sourceToken.set("layer", "gmlayer");
        }

        sourceToken.set({
            left: stashToken.get("left"),
            top: stashToken.get("top")
        });

        if (vanish) {
            setTimeout(function() {
                sourceToken.set("layer", "objects");
            }, 750);
        }

        return true;
    };

    var findMatchingTokenOnPage = function(sourceToken, pageId) {
        var characterId = sourceToken.get("represents") || "";

        if (!characterId) {
            return null;
        }

        var matches = findObjs({
            type: "graphic",
            subtype: "token",
            pageid: pageId,
            represents: characterId
        });

        if (!matches.length) {
            return null;
        }

        if (matches.length > 1) {
            return {
                duplicate: true,
                count: matches.length
            };
        }

        return matches[0];
    };

    var copyTokenPlacement = function(sourceToken, destinationToken) {
        destinationToken.set({
            left: sourceToken.get("left"),
            top: sourceToken.get("top"),
            width: sourceToken.get("width"),
            height: sourceToken.get("height"),
            rotation: sourceToken.get("rotation"),
            layer: "objects"
        });
    };

    var shiftControlledTokenPlayer = function(msg, tokenId, target, params) {
        var token = getObj("graphic", tokenId);

        if (!token || token.get("subtype") !== "token") {
            chat("/w", msg.who, "Token not found.");
            return;
        }

        var targetPageId = getMapPageIdFromTargetName(target);

        if (!targetPageId) {
            chat("/w", msg.who, "Map " + target + " not found.");
            return;
        }

        var playerIds = getControlledPlayerIdsFromToken(tokenId);

        if (!playerIds.length) {
            chat("/w", msg.who, "No specific player controls " + token.get("name") + ".");
            return;
        }

        if (!spawnShiftedDefaultToken(token, targetPageId)) {
            chat("/w", msg.who, "SpawnDefaultToken.spawnAtXY is not available or no token name could be resolved.");
            return;
        }

        playerIds.forEach(function(playerId) {
            move(msg, playerId, target);
        });

        if (params && params.hasOwnProperty("fx")) {
            playShiftFx(token, params.fx);
        }

        if (params && params.hasOwnProperty("stash")) {
            if (!stashShiftedSourceToken(token, params.stash, params.hasOwnProperty("vanish"))) {
                chat("/w", msg.who, "Shift completed, but stash token was invalid or on a different page.");
                return;
            }
        }

        chat("/w", msg.who, "Shifted " + token.get("name") + " to " + target + ".");
    };

    var returnControlledTokenPlayer = function(msg, tokenId, target, params) {
        var token = getObj("graphic", tokenId);

        if (!token || token.get("subtype") !== "token") {
            chat("/w", msg.who, "Token not found.");
            return;
        }

        var targetPageId = getMapPageIdFromTargetName(target);

        if (!targetPageId) {
            chat("/w", msg.who, "Map " + target + " not found.");
            return;
        }

        var playerIds = getControlledPlayerIdsFromToken(tokenId);

        if (!playerIds.length) {
            chat("/w", msg.who, "No specific player controls " + token.get("name") + ".");
            return;
        }

        var returnToken = findMatchingTokenOnPage(token, targetPageId);

        if (!returnToken) {
            chat("/w", msg.who, "No matching stashed token found on " + target + ".");
            return;
        }

        if (returnToken.duplicate) {
            chat("/w", msg.who, "Multiple matching tokens found on " + target + ". Return cancelled.");
            return;
        }

        if (params && params.hasOwnProperty("departfx")) {
            playShiftFx(token, params.departfx);
        }
        else if (params && params.hasOwnProperty("fx")) {
            playShiftFx(token, params.fx);
        }

        copyTokenPlacement(token, returnToken);

        if (params && params.hasOwnProperty("arrivefx")) {
            playShiftFx(returnToken, params.arrivefx);
        }

        playerIds.forEach(function(playerId) {
            move(msg, playerId, target);
        });

        token.remove();

        chat("/w", msg.who, "Returned " + returnToken.get("name") + " to " + target + " and removed the departure token.");
    };


    // Convert the provided display name into the player id for that player.
    var getPlayerIdFromDisplayName = function(name) {
        // Remove the GM tag from a players name and trim any leftover whitespace
        name = name.replace("(GM)", "").trim();
        // Find all the player objects in the campaign.
        var players = findObjs({_type: 'player'});
        // Loop through them and try to convert the display name into the player's id.
        for (var key in players) {
            if (players.hasOwnProperty(key)) {
                // Check if the current players display name is equal to the provided one.
                if (players[key].get("_displayname") === name) {
                    // If it is then return that players id.
                    return players[key].get("_id");
                }
            }
        }
        // If no match was found then return undefined.
        return undefined;
    };
    
    // Convert the provided player id into the display name for that player.
    var getDisplayNameFromPlayerId = function(id) {
        // Find all the player objects in the campaign.
        var players = findObjs({_type: 'player'})
        // Loop through them and try to convert the id into the player's display name.
        for (var key in players) {
            if (players.hasOwnProperty(key)) {
                // Check if the current players id is equal to the provided one.
                if (players[key].get("_id") == id) {
                    // If it is then return that players display name.
                    return players[key].get("_displayname");
                }
            }
        }
        // If no match was found then return undefined.
        return undefined;
    };

    // TODO
    var showHelp = function(msg, show) {
        // Create the variable to hold the assembled menu text.
        var text = "";
        // Assemble the text for the help menu.
        if (show === "index") {
            // Add the opening tag for the table.
            text += "<table border='1' cellspacing='2' cellpadding='4'>";
            // Add in the header row for the help menu.
            text += "<tr><td style-'text-align: left;' colspan='3'><strong><em>Help Menu</em></strong></td></tr>";
            // Add a heading row to provide names for the columns.
            text += "<tr><td><strong>Command</strong></td><td colspan='2'><strong>Description</strong></td></tr>";
            // Add a row for the menu command.
            text += "<tr><td>menu</td><td>Menu for running commands.</td><td><a href='!mc help --show menu'>Info</a></td></tr>";
            // Add a row for the move command.
            text += "<tr><td>move</td><td>Moves a player to a map.</td><td><a href='!mc help --show move'>Info</a></td></tr>";
            // Check if the calling player is a GM or not.
            if (playerIsGM(msg.playerid)) {
                // If they are then add a row for the moveall command.
                text += "<tr><td>moveall</td><td>Moves all players to a map.</td><td><a href='!mc help --show moveall'>Info</a></td></tr>";
            }
            // Add a row for the rejoin command.
            text += "<tr><td>rejoin</td><td>Rejoins a player to the bookmark.</td><td><a href='!mc help --show rejoin'>Info</a></td></tr>";
            // Check if the calling player is a GM or not.
            if (playerIsGM(msg.playerid)) {
                // If they are then add a row for the rejoinall command.
                text += "<tr><td>rejoinall</td><td>Rejoins all players to the bookmark.</td><td><a href='!mc help --show rejoinall'>Info</a></td></tr>";
                // Add a row for the refresh command.
                text += "<tr><td>refresh</td><td>Refreshes the map lists.</td><td><a href='!mc help --show refresh'>Info</a></td></tr>";
            }
            // Add a row for the help command.
            text += "<tr><td>help</td><td>Shows the help for the script.</td><td><a href='!mc help --show help'>Info</a></td></tr>";
            // Check if the calling player is a GM or not.
            if (playerIsGM(msg.playerid)) {
                // Add a row for the block command.
                text += "<tr><td>block</td><td>Toggle blocking of command use.</td><td><a href='!mc help --show block'>Info</a></td></tr>";
            }
            // Add the closing tag for the table.
            text += "</table>";
            // Add in a blank line to seperate the command information from the general information.
            text += "<br line-height='1'>";
            // Add the opening tag for the table.
            text += "<table border='1' cellspacing='2' cellpadding='4'>";
            // Add a header for the general information table.
            text += "<tr><td colspan='2'><strong>General Information:</strong></td></tr>";
            // Check if the calling player is a GM or not.
            if (playerIsGM(msg.playerid)) {
                text += "<tr><td>Configuring Maps</td><td><a href='!mc help --show map'>Info</a></td></tr>";
            }
            // Add a row for the information on constructing an API call.
            text += "<tr><td>Constructing an API call</td><td><a href='!mc help --show api'>Info</a></td></tr>";
            // Add a row for the information on using parameters.
            text += "<tr><td>Using Parameters</td><td><a href='!mc help --show params'>Info</a></td></tr>";
            // Add a row for the credits.
            text += "<tr><td>Credits</td><td><a href='!mc help --show credits'>Info</a></td></tr>";
            // Add a row for the version information.
            text += "<tr><td>Version</td><td><a href='!mc help --show version'>Info</a></td></tr>";
            // Add the closing tag for the table.
            text += "</table>";
        }
        // Assemble the text for the menu documentation.
        if (show === "menu") {
            // Add the opening tag for the table.
            text += "<table border='1' cellspacing='2' cellpadding='4'>";
            // Add in the header row for the move help.
            text += "<tr><td colspan='3'><strong><em>Menu</em></strong></td></tr>";
            // Add a row for the description header.
            text += "<tr><td colspan='3'><strong>Description</strong></td></tr>";
            // Add a row for the description of the command.
            text += "<tr><td colspan='3'>The menu command provides a menu for the user to launch commands that are available to them.</td></tr>";
            // Add a row for the parameters section headers.
            text += "<tr><td><strong>Parameter</strong></td><td><strong>Description</strong></td><td><strong>Options</strong></td></tr>";
            // Add a row for the show parameter.
            text += "<tr><td>--show</td><td><em>[Optional]</em><br>Used to filter the returned view.</td><td>All<br>Public<br>" + ((playerIsGM(msg.playerid)) ? "Private<br>Archive<br>Hidden<br>" : "") + "Utilities<br>Utils</td></tr>";
            // Add a row for the example header.
            text += "<tr><td colspan='3'><strong>Example</strong></td></tr>";
            // Add a row with an example and an api button to launch that example.
            text += "<tr><td colspan='2'>!mc menu</td><td><a href='!mc menu'>Show Me!</a></td></tr>";
            // Add the closing tag for the table.
            text += "</table>";
            // Add in a back button for going back to the menu.
            text += navigation("", "move");
        }
        // Assemble the text for the move documentation.
        if (show === "move") {
            // Add the opening tag for the table.
            text += "<table border='1' cellspacing='2' cellpadding='4'>";
            // Add in the header row for the move help.
            text += "<tr><td colspan='3'><strong><em>Move</em></strong></td></tr>";
            // Add a row for the description header.
            text += "<tr><td colspan='3'><strong>Description</strong></td></tr>";
            // Add a row for the description of the command.
            text += "<tr><td colspan='3'>The move command moves a player to the provided target map.</td></tr>";
            // Add a row for the parameters section headers.
            text += "<tr><td><strong>Parameter</strong></td><td><strong>Description</strong></td><td><strong>Options</strong></td></tr>";
            // Add a row for the target parameter.
            text += "<tr><td>--target</td><td><em>[Required]</em><br>The target map to move to.</td><td>Name of the Map</td></tr>";
            // Check if the calling player is a GM or not.
            if (playerIsGM(msg.playerid)) {
                // If they are then add a row for the player parameter.
                text += "<tr><td>--player</td><td><em>[Optional]</em><br>The player to move.</td><td>Player Name</td></tr>";
            }
            // Add a row for the example header.
            text += "<tr><td colspan='3'><strong>Example</strong></td></tr>";
            // Add a row with an example and an api button to launch that example.
            text += "<tr><td colspan='2'>!mc move --target " + _.first(_.keys(state.MapChange.publicMaps)) + "</td><td><a href='!mc move --target " + _.first(_.keys(state.MapChange.publicMaps)) + "'>Show Me!</a></td></tr>";
            // Add the closing tag for the table.
            text += "</table>";
            // Add in a back button for going back to the menu.
            text += navigation("menu", "moveall");
        }
        // Assemble the text for the moveall documentation.
        if (show === "moveall") {
            // Add the opening tag for the table.
            text += "<table border='1' cellspacing='2' cellpadding='4'>";
            // Add in the header row for the move help.
            text += "<tr><td colspan='3'><strong><em>Moveall</em></strong></td></tr>";
            // Add a row for the description header.
            text += "<tr><td colspan='3'><strong>Description</strong></td></tr>";
            // Add a row for the description of the command.
            text += "<tr><td colspan='3'>The moveall command moves all players to the provided target map.</td></tr>";
            // Add a row for the parameters section headers.
            text += "<tr><td><strong>Parameter</strong></td><td><strong>Description</strong></td><td><strong>Options</strong></td></tr>";
            // Add a row for the target parameter.
            text += "<tr><td>--target</td><td><em>[Required]</em><br>The target map to move to.</td><td>Name of the Map</td></tr>";
            // Add a row for the example header.
            text += "<tr><td colspan='3'><strong>Example</strong></td></tr>";
            // Add a row with an example and an api button to launch that example.
            text += "<tr><td colspan='2'>!mc moveall --target " + _.first(_.keys(state.MapChange.publicMaps)) + "</td><td><a href='!mc moveall --target " + _.first(_.keys(state.MapChange.publicMaps)) + "'>Show Me!</a></td></tr>";
            // Add the closing tag for the table.
            text += "</table>";
            // Add in a back button for going back to the menu.
            text += navigation("move", "rejoin");
        }
        // Assemble the text for the rejoin documentation.
        if (show === "rejoin") {
            // Add the opening tag for the table.
            text += "<table border='1' cellspacing='2' cellpadding='4'>";
            // Add in the header row for the move help.
            text += "<tr><td colspan='3'><strong><em>Rejoin</em></strong></td></tr>";
            // Add a row for the description header.
            text += "<tr><td colspan='3'><strong>Description</strong></td></tr>";
            // Add a row for the description of the command.
            text += "<tr><td colspan='3'>The rejoin command moves a player back to the bookmark.</td></tr>";
            // Add a row for the parameters section headers.
            text += "<tr><td><strong>Parameter</strong></td><td><strong>Description</strong></td><td><strong>Options</strong></td></tr>";
            // Check if the calling player is a GM or not.
            if (playerIsGM(msg.playerid)) {
                // If they are then add a row for the player parameter.
                text += "<tr><td>--player</td><td><em>[Optional]</em><br>The player to move.</td><td>Player Name</td></tr>";
            }
            // Add a row for the example header.
            text += "<tr><td colspan='3'><strong>Example</strong></td></tr>";
            // Add a row with an example and an api button to launch that example.
            text += "<tr><td colspan='2'>!mc rejoin</td><td><a href='!mc rejoin'>Show Me!</a></td></tr>";
            // Add the closing tag for the table.
            text += "</table>";
            // Add in a back button for going back to the menu.
            text += navigation("moveall", "rejoinall");
        }
        // Assemble the text for the rejoinall documentation.
        if (show === "rejoinall") {
            // Add the opening tag for the table.
            text += "<table border='1' cellspacing='2' cellpadding='4'>";
            // Add in the header row for the move help.
            text += "<tr><td colspan='3'><strong><em>Rejoinall</em></strong></td></tr>";
            // Add a row for the description header.
            text += "<tr><td colspan='3'><strong>Description</strong></td></tr>";
            // Add a row for the description of the command.
            text += "<tr><td colspan='3'>The rejoinall command moves all players back to the bookmark.</td></tr>";
            // Add a row for the parameters section headers.
            text += "<tr><td><strong>Parameter</strong></td><td><strong>Description</strong></td><td><strong>Options</strong></td></tr>";
            // Add a row for the example header.
            text += "<tr><td colspan='3'><strong>Example</strong></td></tr>";
            // Add a row with an example and an api button to launch that example.
            text += "<tr><td colspan='2'>!mc rejoinall</td><td><a href='!mc rejoinall'>Show Me!</a></td></tr>";
            // Add the closing tag for the table.
            text += "</table>";
            // Add in a back button for going back to the menu.
            text += navigation("rejoin", "refresh");
        }
        // Assemble the text for the refresh documentation.
        if (show === "refresh") {
            // Add the opening tag for the table.
            text += "<table border='1' cellspacing='2' cellpadding='4'>";
            // Add in the header row for the move help.
            text += "<tr><td colspan='3'><strong><em>Refresh</em></strong></td></tr>";
            // Add a row for the description header.
            text += "<tr><td colspan='3'><strong>Description</strong></td></tr>";
            // Add a row for the description of the command.
            text += "<tr><td colspan='3'>The refresh command clears and reloads the map lists without needing to restart the script.</td></tr>";
            // Add a row for the parameters section headers.
            text += "<tr><td><strong>Parameter</strong></td><td><strong>Description</strong></td><td><strong>Options</strong></td></tr>";
            // Add a row for the example header.
            text += "<tr><td colspan='3'><strong>Example</strong></td></tr>";
            // Add a row with an example and an api button to launch that example.
            text += "<tr><td colspan='2'>!mc refresh</td><td><a href='!mc refresh'>Show Me!</a></td></tr>";
            // Add the closing tag for the table.
            text += "</table>";
            // Add in a back button for going back to the menu.
            text += navigation("rejoinall", "help");
        }
        // Assemble the text for the help documentation.
        if (show === "help") {
            // Add the opening tag for the table.
            text += "<table border='1' cellspacing='2' cellpadding='4'>";
            // Add in the header row for the move help.
            text += "<tr><td colspan='3'><strong><em>Help</em></strong></td></tr>";
            // Add a row for the description header.
            text += "<tr><td colspan='3'><strong>Description</strong></td></tr>";
            // Add a row for the description of the command.
            text += "<tr><td colspan='3'>The help command provides an interactive menu for the documentation of the script.</td></tr>";
            // Add a row for the parameters section headers.
            text += "<tr><td><strong>Parameter</strong></td><td><strong>Description</strong></td><td><strong>Options</strong></td></tr>";
            // Add a row for the show parameter.
            text += "<tr><td>--show</td><td><em>[Optional]</em><br>Used to filter the returned view.</td><td>Menu<br>Move<br>" + ((playerIsGM(msg.playerid)) ? "Moveall<br>" : "") + "Rejoin<br>" + ((playerIsGM(msg.playerid)) ? "Refresh<br>" : "") + "Help<br>Api<br>Params<br>Credits<br>Version</td></tr>";
            // Add a row for the example header.
            text += "<tr><td colspan='3'><strong>Example</strong></td></tr>";
            // Add a row with an example and an api button to launch that example.
            text += "<tr><td colspan='2'>!mc help</td><td><a href='!mc help'>Show Me!</a></td></tr>";
            // Add the closing tag for the table.
            text += "</table>";
            // Add in a back button for going back to the menu.
            text += navigation("refresh", "block");
        }
        // 
        if (show === "block") {
            // Add the opening tag for the table.
            text += "<table border='1' cellspacing='2' cellpadding='4'>";
            // Add in the header row for the move help.
            text += "<tr><td colspan='3'><strong><em>Block</em></strong></td></tr>";
            // Add a row for the description header.
            text += "<tr><td colspan='3'><strong>Description</strong></td></tr>";
            // Add a row for the description of the command.
            text += "<tr><td colspan='3'>The block command toggles the players ability to use MapChange commands.</td></tr>";
            // Add a row for the parameters section headers.
            text += "<tr><td><strong>Parameter</strong></td><td><strong>Description</strong></td><td><strong>Options</strong></td></tr>";
            // If they are then add a row for the player parameter.
            text += "<tr><td>--player</td><td><em>[Optional]</em><br>The player to block/unblock.</td><td>Player Name</td></tr>";
            // Add a row for the example header.
            text += "<tr><td colspan='3'><strong>Example</strong></td></tr>";
            // Add a row with an example and an api button to launch that example.
            text += "<tr><td colspan='2'>!mc block</td><td><a href='!mc help'>Show Me!</a></td></tr>";
            // Add the closing tag for the table.
            text += "</table>";
            // Add in a back button for going back to the menu.
            text += navigation("help", "");
        }
        // Assemble the text for the configuring maps documentation.
        if (show === "map") {
            // Add the opening tag for the table.
            text += "<table border='1' cellspacing='2' cellpadding='4'>";
            // Add in the header row for the configuring maps information.
            text += "<tr><td colspan='3'><strong><em>Configuring Maps</em></strong></td></tr>";
            // Add the decription on how to configure the campaigns maps.
            text += "<tr><td colspan='3'>By default all maps are made public and available for any user to move to, there are a couple of\
                                         options included in the script to modify this behaviour.<br><br>\
                                         The first option available is to mark a map as private, to do this the GM must include the marker in \
                                         the maps name, by default this is <strong>[GM]</strong> (this is also configurable), so for example,\
                                         if you have a map called <strong>Baron Trevis' Keep</strong> then you would add the marker to this name\
                                         to make it <strong>[GM] Baron Trevis' Keep</strong>, this would then add that map to the private list\
                                         instead of public.<br><br>\
                                         The second way to modify the behaviour is to invert the map markings, for this the GM must set the\
                                         Inverted Marker option to true, what this will do is place all maps into the private listing by default\
                                         instead of the public listings, this then requires the GM to mark a map in the above way to make it public.\
                                         (this is where changing the marker may be useful).</td></tr>";
            // Add the closing tag for the table.
            text += "</table>";
            // Add in a back button for going back to the menu.
            text += navigation("", "api");
        }
        // Assemble the text for the constructing an API documentation.
        if (show === "api") {
            // Add the opening tag for the table.
            text += "<table border='1' cellspacing='2' cellpadding='4'>";
            // Add in the header row for the constructing an api call information.
            text += "<tr><td colspan='3'><strong><em>Constructing an API call</em></strong></td></tr>";
            // Add the decription on how to construct an api call.
            text += "<tr><td colspan='3'>An API call in MapChange consists of two required components and one optional component.<br><br>\
                                         The first required component is the call to the script, this is started by using a exclamation \
                                         mark followed by the script name or alias (e.g. !mc or !mapchange)<br><br>\
                                         The second required component is the command for the script, this must be seperated from the \
                                         script call marker by using a space. (e.g. !mc help)<br><br>\
                                         Finally the optional component is the parameters for the command you are using, this is started by \
                                         using two dashes (e.g. --show), note that sometimes a command may allow or require more than one \
                                         parameter.<br><br>As with the command this must be seperated from the command using a space and each \
                                         parameter must be seperated using a space. (e.g. !mc help --show index)</td></tr>";
            // Add the closing tag for the table.
            text += "</table>";
            // Add in a back button for going back to the menu.
            text += navigation("map", "params");
        }
        // Assemble the text for the using parameters documentation.
        if (show === "params") {
            // Add the opening tag for the table.
            text += "<table border='1' cellspacing='2' cellpadding='4'>";
            // Add in the header row for the using parameters information.
            text += "<tr><td colspan='3'><strong><em>Using Parameters</em></strong></td></tr>";
            // Add in a row for the information on parameters.
            text += "<tr><td colspan='3'>Parameters in MapChange are composed of three pieces, the first is the Parameter Marker, the second \
                                         is the Parameter Name and the third is the Parameter Value.<br><br>\
                                         The Parameter Marker consists of two dashes (e.g. --), this allows the script to know that the \
                                         following text is a parameter.<br><br>\
                                         The Parameter Name is the name that the script will use when applying it to the command (e.g. show), see \
                                         the help on each command to find out what parameters they accept.<br><br>\
                                         The Parameter Value is the piece of information or option you pass to the script to use with the \
                                         Parameter.<br><br>\
                                         Some commands only accept a set amount of options whereas others will accept what the user sends and \
                                         attempt to use it, see the help on each command to find out what can be used with each parameter.</td></tr>";
            // Add the closing tag for the table.
            text += "</table>";
            // Add in a back button for going back to the menu.
            text += navigation("api", "credits");
        }
        // Assemble the text for the credits.
        if (show === "credits") {
            // Declare the styling for the profile link, this makes it look like an api button.
            var buttonStyle = "background-color: #CE0F69; color: white; padding: 6px 6px; text-decoration: none; display: inline-block; font-family: Arial;";
            // Add the opening tag for the table.
            text += "<table border='1' cellspacing='2' cellpadding='4'>";
            // Add in the header row for the credits.
            text += "<tr><td colspan='2'><strong><em>Credits</em></strong></td></tr>";
            // Add in the header row for the authors.
            text += "<tr><td colspan='2'><strong>Authors</strong></td></tr>";
            // Add in in TheWhiteWolves as an author.
            text += "<tr><td>TheWhiteWolves</td><td><a style='" + buttonStyle + "' href='https://app.roll20.net/users/1043/thewhitewolves'>Profile</a></td></tr>";
            // Add in the header row for the testers.
            text += "<tr><td colspan='2'><strong>Testers</strong></td></tr>";
            // Add in in WhiteStar as a tester.
            text += "<tr><td>WhiteStar</td><td><a style='" + buttonStyle + "' href='https://app.roll20.net/users/484663/whitestar'>Profile</a></td></tr>";
            // Add in in Kaelev as a tester.
            text += "<tr><td>Kaelev</td><td><a style='" + buttonStyle + "' href='https://app.roll20.net/users/618858/kaelev'>Profile</a></td></tr>";
            // Add in in Enzo S.as a tester.
            text += "<tr><td>Enzo S.</td><td><a style='" + buttonStyle + "' href='https://app.roll20.net/users/1191835/enzo-s'>Profile</a></td></tr>";
            // Add the closing tag for the table.
            text += "</table>";
            // Add in a back button for going back to the menu.
            text += navigation("params", "version");
        }
        // Assemble the text for the version information.
        if (show === "version") {
            // Add the opening tag for the table.
            text += "<table border='1' cellspacing='2' cellpadding='4'>";
            // Add a row for the version number.
            text += "<tr><td><strong>Version</strong></td><td>" + state.MapChange.version + "</td></tr>";
            // Add a row for the last modified date and time.
            text += "<tr><td><strong>Last Modified</strong></td><td>" + new Date(state.MapChange.lastModified * 1000).toUTCString() + "</td></tr>";
            // Add a row for who last modified the script.
            text += "<tr><td><strong>By</strong></td><td>" + state.MapChange.modifiedBy + "</td></tr>";
            // Add the closing tag for the table.
            text += "</table>";
            // Add in a back button for going back to the menu.
            text += navigation("credits", "");
        }
        // Send the assembled menu text to the chat to be displayed.
        chat("/w", msg.who, text);
        // Debug
        if (state.MapChange.config.debug) {
            log(msg);
            log(text);
            log(show);
        }
    };
    
    // Displays a chat based menu for the teleportation, this provides users with  a set of
    // easy to use api buttons in the chat that will launch the commands for them.
    var showMenu = function(msg, show) {
        // Specify what the max display length of the map names will be on the api buttons.
        var displayLength = 20;
        // Find all the player objects in the campaign.
        var players = findObjs({_type: 'player'});
        // Create the variable to hold the assembled menu text.
        var text = "";
        // Check if the show parameter is set to show any of the maps.
        if (show === "all" || show === "public" || show === "private" || show === "archive" || show === "hidden") {
            // Start off the chat message with the Available Maps title.
            text += "<tr><td colspan='3'><strong><em>Available Maps:</em></strong></td></tr>";
        }
        // Check if the "show" parameter is set to either "all" or "public".
        if (show === "all" || show === "public") {
            // If it is then check if the calling player is a GM or not.
            if (playerIsGM(msg.playerid)) {
                // If they are then add a row for the Public title.
                text += "<tr><td colspan='3'><strong><em>Public</em></strong></td></tr>";
            }
            // Loop through the map displaying an api button for each one.
            for (var key in state.MapChange.publicMaps) {
                if (state.MapChange.publicMaps.hasOwnProperty(key)) {
                    // Add a tag to open start a row on the table.
                    text += "<tr>";
                    // Generate an api button with the map name that will teleport the user to that map.
                    // If the map name is longer than 20 characters then trim it and add an elipse.
                    text += "<td><a href='!mc move --target " + _.escape(key) + "'>" + ((key.length > displayLength) ? key.substr(0, displayLength) + "..." : key) + "</a></td>";
                    // Check if the calling player is a GM or not.
                    if (playerIsGM(msg.playerid)) {
                        // If they are then add extra GM only buttons.
                        // Add a button to teleport all players to the chosen map.
                        text += "<td><a href='!mc moveall --target " + _.escape(key) + "'>All</a></td>";
                        // Add a button to teleport a differnet player to the chosen map.
                        text += "<td><a href='!mc move --target " + _.escape(key) + " --player ?{Player";
                        // Loop through the players in the campaign adding them to the dropdown for the Other command.
                        for (var key in players) {
                            if (players.hasOwnProperty(key)) {
                                // Add the current players name with any brackets replaced for their ASCII equivalents.
                                text += "|" + _.escape(players[key].get("_displayname"));
                            }
                        }
                        // Complete the Other api button.
                        text += "}'>Other</a></td>";
                    }
                    // Add a closing tag to finish the row in the table.
                    text += "</tr>";
                }
            }
        }
        // Check if the "show" parameter is set to either "all" or "private".
        if (show === "all" || show === "private") {
            // If it is then check if the calling player is a GM or not.
            if (playerIsGM(msg.playerid)) {
                // If they are then add a row for the Private title..
                text += "<tr><td colspan='3'><strong><em>Private</em></strong></td></tr>";
                // Loop through the map displaying an api button for each one.
                for (var key in state.MapChange.privateMaps) {
                    if (state.MapChange.privateMaps.hasOwnProperty(key)) {
                        // Add a tag to open start a row on the table.
                        text += "<tr>";
                        // Generate an api button with the map name that will teleport the user to that map.
                        // If the map name is longer than 20 characters then trim it and add an elipse.
                        text += "<td><a href='!mc move --target " + _.escape(key) + "'>" + ((key.length > displayLength) ? key.substr(0, displayLength) + "..." : key) + "</a></td>";
                        // Add a button to teleport all players to the chosen map.
                        text += "<td><a href='!mc moveall --target " + _.escape(key) + "'>All</a></td>";
                        // Add a button to teleport a differnet player to the chosen map.
                        text += "<td><a href='!mc move --target " + _.escape(key) + " --player ?{Player";
                        // Loop through the players in the campaign adding them to the dropdown for the command.
                        for (var key in players) {
                            // Add the current players name with any brackets replaced for their ASCII equivalents.
                            text += "|" + _.escape(players[key].get("_displayname"));
                        }
                        // Complete the Other api button.
                        text += "}'>Other</a></td>";
                        
                        // Add a closing tag to finish the row in the table.
                        text += "</tr>";
                    }
                }
            }
        }
        // Check if the "show" parameter is set to "archive".
        if (show === "archive") {
            // If it is then check if the calling player is a GM or not.
            if (playerIsGM(msg.playerid)) {
                // If they are then add a row for the Archive title..
                text += "<tr><td colspan='3'><strong><em>Archive</em></strong></td></tr>";
                // Loop through the map displaying an api button for each one.
                for (var key in state.MapChange.archiveMaps) {
                    if (state.MapChange.archiveMaps.hasOwnProperty(key)) {
                        // Add a tag to open start a row on the table.
                        text += "<tr>";
                        // Generate an api button with the map name that will teleport the user to that map.
                        // If the map name is longer than 20 characters then trim it and add an elipse.
                        text += "<td><a href='!mc move --target " + _.escape(key) + "'>" + ((key.length > displayLength) ? key.substr(0, displayLength) + "..." : key) + "</a></td>";
                        // Add a button to teleport all players to the chosen map.
                        text += "<td><a href='!mc moveall --target " + _.escape(key) + "'>All</a></td>";
                        // Add a button to teleport a differnet player to the chosen map.
                        text += "<td><a href='!mc move --target " + _.escape(key) + " --player ?{Player";
                        // Loop through the players in the campaign adding them to the dropdown for the command.
                        for (var key in players) {
                            // Add the current players name with any brackets replaced for their ASCII equivalents.
                            text += "|" + _.escape(players[key].get("_displayname"));
                        }
                        // Complete the Other api button.
                        text += "}'>Other</a></td>";
                        
                        // Add a closing tag to finish the row in the table.
                        text += "</tr>";
                    }
                }
            }
        }
        else {
            // Check if the "show" parameter is set to "all".
            if (show === "all") {
                // If it is then check if the calling player is a GM or not.
                if (playerIsGM(msg.playerid)) {
                    // If they are then add a row for the Private title..
                    text += "<tr><td colspan='3'><strong><em>Archive</em></strong></td></tr>";
                    // Add a row with a placeholder button for the archived maps.
                    text += "<tr><td colspan='3'><a href='!mc menu --show archive'>List All Archive Maps</a></td></tr>";
                }
            }
        }
        // Check if the "show" parameter is set to "hidden".
        if (show === "hidden") {
            // If it is then check if the calling player is a GM or not.
            if (playerIsGM(msg.playerid)) {
                // If they are then add a row for the Hidden title.
                text += "<tr><td colspan='3'><strong><em>Hidden</em></strong></td></tr>";
                // Loop through the map displaying an api button for each one.
                for (var key in state.MapChange.hiddenMaps) {
                    if (state.MapChange.hiddenMaps.hasOwnProperty(key)) {
                        // Add a tag to open start a row on the table.
                        text += "<tr>";
                        // Generate an api button with the map name that will teleport the user to that map.
                        // If the map name is longer than 20 characters then trim it and add an elipse.
                        text += "<td><a href='!mc move --target " + _.escape(key) + "'>" + ((key.length > displayLength) ? key.substr(0, displayLength) + "..." : key) + "</a></td>";
                        // Add a button to teleport all players to the chosen map.
                        text += "<td><a href='!mc moveall --target " + _.escape(key) + "'>All</a></td>";
                        // Add a button to teleport a differnet player to the chosen map.
                        text += "<td><a href='!mc move --target " + _.escape(key) + " --player ?{Player";
                        // Loop through the players in the campaign adding them to the dropdown for the command.
                        for (var key in players) {
                            // Add the current players name with any brackets replaced for their ASCII equivalents.
                            text += "|" + _.escape(players[key].get("_displayname"));
                        }
                        // Complete the Other api button.
                        text += "}'>Other</a></td>";
                        
                        // Add a closing tag to finish the row in the table.
                        text += "</tr>";
                    }
                }
            }
        }
        else {
            // Check if the "show" parameter is set to "all".
            if (show === "all") {
                // If it is then check if the calling player is a GM or not.
                if (playerIsGM(msg.playerid)) {
                    // If they are then add a row for the Private title..
                    text += "<tr><td colspan='3'><strong><em>Hidden</em></strong></td></tr>";
                    // Add a row with a placeholder button for the archived maps.
                    text += "<tr><td colspan='3'><a href='!mc menu --show hidden'>List All Hidden Maps</a></td></tr>";
                }
            }
        }
        // Check to see if the text is currently empty.
        if (text !== "") {
            // If it isn't then wrap the text within a set of table tags.
            text = "<table border='1' cellspacing='0' cellpadding='0'>" + text + "</table>";
        }
        // Check to see if the filter is set to display all.
        if (show === "all" || show === "archive" || show === "hidden") {
            // Add in a blank line to seperate the menus.
            text += "<br line-height='1'>";
        }
        // Check if the "show" paramter is set to either "all" or "utilities"/"utils".
        if (show === "all" || show === "utilities" || show === "utils" || show === "archive" || show === "hidden") {
            // Add a table to start a new table.
            text += "<table <table border='1' cellspacing='0' cellpadding='0'>";
            // Add in the title for the utilities section.
            text += "<tr><td colspan='4'><strong><em>Utilities:</em></strong></td></tr>";
            // Add a tag to start a new row for the utility commands.
            text += "<tr>";
            // Add an api button for the rejoin command.
            text += "<td><a href='!mc rejoin'>Rejoin</a></td>";
            // Check if the caller is a GM or not.
            if (playerIsGM(msg.playerid)) {
                // Add an api button for the GM to force all players to rejoin the bookmark.
                text += "<td><a href='!mc rejoinall'>All</a></td>"
                // Add an api button for the GM to force rejoin another player to the bookmark.
                text += "<td><a href='!mc rejoin --player ?{Player";
                // Loop through the players in the campaign adding them to the dropdown for the command.
                for (var key in players) {
                    if (players.hasOwnProperty(key)) {
                        // Add the current players name with any brackets replaced for their ASCII equivalents.
                        text += "|" + players[key].get("_displayname").replace("(", _.escape("(")).replace(")", _.escape(")"));
                    }
                }
                // Complete the Rejoin Other api button.
                text += "}'>Other</a></td>";
                // If they are then add an api button for the map refresh command.
                text += "<td><a href='!mc refresh'>Refresh</a></td>";
            }
            // Check if the caller is a GM or not.
            if (!playerIsGM(msg.playerid)) {
                // Add an api button for the help command.
                text += "<td><a href='!mc help'>Help</a></td>";
            }
            // Add the closing tag of the last row.
            text += "</tr>";
            // Check if the caller is a GM or not.
            if (playerIsGM(msg.playerid)) {
                // Add the opening tag for a new row.
                text += "<tr>";
                // Add an api button for toggling the block on a player.
                text += "<td colspan='2'><a href='!mc block --player ?{Player";
                // Loop through the players in the campaign adding them to the dropdown for the command.
                for (var key in players) {
                    if (players.hasOwnProperty(key)) {
                        // Add the current players name with any brackets replaced for their ASCII equivalents.
                        text += "|" + players[key].get("_displayname").replace("(", _.escape("(")).replace(")", _.escape(")"));
                    }
                }
                // Complete the Toggle Block api button.
                text += "}'>Toggle Block</a></td>";
                // Add an api button for the help command.
                text += "<td><a href='!mc help'>Help</a></td></tr>";
            }
            // Add a tag to close the table.
            text += "</table>";
        }
        // Debug
        if (state.MapChange.config.debug) {
            log(show);
            log(text);
        }
        // Send the assembled menu text to the chat to be displayed.
        chat("/w", msg.who, text);
    };

    // Refreshes the maps without needing to restart the script.
    var refresh = function(msg) {
        log("Refreshing Maps...");
        // Clear out the public maps.
        state.MapChange.publicMaps = {};
        // Clear out the private maps.
        state.MapChange.privateMaps = {};
        // Clear out the archive maps.
        state.MapChange.archiveMaps = {};
        // Clear out the hidden maps.
        state.MapChange.hiddenMaps = {};
        // Debug
        if (state.MapChange.config.debug) {
            log("Clear Public:");
            log(state.MapChange.publicMaps);
            log("Clear Private:");
            log(state.MapChange.privateMaps);
            log("Clear Archived:");
            log(state.MapChange.archiveMaps);
            log("Clear Hidden:");
            log(state.MapChange.hiddenMaps);
        }
        // Reassemble the maps.
        constructMaps();
        log("Refresh Complete");
        // Check if the GM should be notified.
        if (state.MapChange.config.gmNotify) {
            // If they should then send them a message.
            chat("/w", "gm", "Map Refresh Complete");
        }
        // Debug
        if (state.MapChange.config.debug) {
            log("Rebuilt Public:");
            log(state.MapChange.publicMaps);
            log("Rebuilt Private:");
            log(state.MapChange.privateMaps);
            log("Rebuilt Archived:");
            log(state.MapChange.archiveMaps);
            log("Rebuilt Hidden:");
            log(state.MapChange.hiddenMaps);
        }
    };
    
    // Moves a player to the specified map.
    var move = function(msg, sender, target) {
        var pages = findObjs({_type: 'page'});
        var playerPages = Campaign().get("playerspecificpages");
        var differentSender = false;
        
        if (msg.playerid != sender) {
            differentSender = true;
        }
        
        if (playerPages === false) {
            playerPages = {};
        }
        
        if (target in state.MapChange.publicMaps) {
            // Move player.
            if (sender in playerPages) {
                delete playerPages[sender];
            }
            playerPages[sender] = state.MapChange.publicMaps[target];
            
            if (state.MapChange.config.gmNotify) {
                var playerAddition = ((differentSender) ? getDisplayNameFromPlayerId(sender) + " " : "");
                chat("/w", "gm", msg.who.replace("(GM)", "") + " has moved " + playerAddition + "to " + target);
            }
        }
        else if (target in state.MapChange.privateMaps) {
            if (playerIsGM(msg.playerid)) {
                // Move player.
                if (sender in playerPages) {
                    delete playerPages[sender];
                }
                playerPages[sender] = state.MapChange.privateMaps[target];
                
                if (state.MapChange.config.gmNotify) {
                    var playerAddition = ((differentSender) ? getDisplayNameFromPlayerId(sender) + " " : "");
                    chat("/w", "gm", msg.who.replace("(GM)", "") + " has moved " + playerAddition + "to " + target);
                }
            }
        }
        else if (target in state.MapChange.archiveMaps) {
            if (playerIsGM(msg.playerid)) {
                // Move player.
                if (sender in playerPages) {
                    delete playerPages[sender];
                }
                playerPages[sender] = state.MapChange.archiveMaps[target];
                
                if (state.MapChange.config.gmNotify) {
                    var playerAddition = ((differentSender) ? getDisplayNameFromPlayerId(sender) + " " : "");
                    chat("/w", "gm", msg.who.replace("(GM)", "") + " has moved " + playerAddition + "to " + target);
                }
            }
        }
        else if (target in state.MapChange.hiddenMaps) {
            if (playerIsGM(msg.playerid)) {
                // Move player.
                if (sender in playerPages) {
                    delete playerPages[sender];
                }
                playerPages[sender] = state.MapChange.hiddenMaps[target];
                
                if (state.MapChange.config.gmNotify) {
                    var playerAddition = ((differentSender) ? getDisplayNameFromPlayerId(sender) + " " : "");
                    chat("/w", "gm", msg.who.replace("(GM)", "") + " has moved " + playerAddition + "to " + target);
                }
            }
        }
        else {
            // Report Map not found.
            chat("/w", msg.who, "Map " + target + " not found");
        }
        
        Campaign().set("playerspecificpages", false);
        Campaign().set("playerspecificpages", playerPages);
    };

    var rejoin = function(msg, sender) {
        var playerPages = Campaign().get("playerspecificpages");
        var differentSender = false;
        
        if (msg.playerid != sender) {
            differentSender = true;
        }
        
        if (playerPages !== false) {
            if (sender in playerPages) {
                delete playerPages[sender];
                Campaign().set("playerspecificpages", false);
            }
        }
        if (_.isEmpty(playerPages)) {
            playerPages = false;
        }
        Campaign().set("playerspecificpages", playerPages);
        
        if (state.MapChange.config.gmNotify) {
            if (differentSender) {
                chat("/w", "gm", msg.who.replace("(GM)", "") + " has rejoined " + getDisplayNameFromPlayerId(sender) + " with the bookmark")
            }
            else {
                chat("/w", "gm", msg.who.replace("(GM)", "") + " has rejoined the bookmark");
            }
        }
    };
    
    var rejoinall = function(msg) {
        if (playerIsGM(msg.playerid)) { 
            Campaign().set("playerspecificpages", false);
            
            if (state.MapChange.config.gmNotify) {
                chat("/w", "gm", "All players have rejoined the bookmark");
            }
        }
    };

    // Add teh archive maps move in here
    var moveall = function(msg, target) {
        if (playerIsGM(msg.playerid)) {
            var bookmarkPage = Campaign().get("playerpageid");
            if (target in state.MapChange.publicMaps) {
                Campaign().set("playerspecificpages", false);
                bookmarkPage = state.MapChange.publicMaps[target];
                
                if (state.MapChange.config.gmNotify) {
                    chat("/w", "gm", "All players have moved to " + target);
                }
            }
            else if (target in state.MapChange.privateMaps) {
                Campaign().set("playerspecificpages", false);
                bookmarkPage = state.MapChange.privateMaps[target];
                
                if (state.MapChange.config.gmNotify) {
                    chat("/w", "gm", "All players have moved to " + target);
                }
            }
            else if (target in state.MapChange.archiveMaps) {
                Campaign().set("playerspecificpages", false);
                bookmarkPage = state.MapChange.archiveMaps[target];
                
                if (state.MapChange.config.gmNotify) {
                    chat("/w", "gm", "All players have moved to " + target);
                }
            }
            else if (target in state.MapChange.hiddenMaps) {
                Campaign().set("playerspecificpages", false);
                bookmarkPage = state.MapChange.hiddenMaps[target];
                
                if (state.MapChange.config.gmNotify) {
                    chat("/w", "gm", "All players have moved to " + target);
                }
            }
            else {
                chat("/w", msg.who, "Map " + target + " not found");
            }
            
            Campaign().set("playerpageid", bookmarkPage);
        }
    };
    
    var block = function(msg, player) {
        // Check if the sender is a GM.
        if (playerIsGM(msg.playerid)) {
            // Check if the block players list contains the provided player.
            if (_.contains(state.MapChange.blockedPlayers, player)) {
                // Find the index of the player in the list.
                var index = _.indexOf(state.MapChange.blockedPlayers, player);
                // Remove the player from the list.
                state.MapChange.blockedPlayers = state.MapChange.blockedPlayers.splice(index - 1, index);
                // Check if the GM should be notified.
                if (state.MapChange.config.gmNotify) {
                    // Send a message to the GM to tell them that a player has been unblocked.
                    chat("/w", "gm", "Unblocked " + getDisplayNameFromPlayerId(player) + " from using commands.");
                }
            }
            else {
                // Add the player to the blocked player list.
                state.MapChange.blockedPlayers.push(player);
                // Check if the GM should be notified.
                if (state.MapChange.config.gmNotify) {
                    // Send a message to the GM to tell them that a player has been unblocked.
                    chat("/w", "gm", "Blocked " + getDisplayNameFromPlayerId(player) + " from using commands.");
                }
            }
        }
        // Debug
        if (state.MapChange.config.debug) {
            log(state.MapChange.blockedPlayers);
        }
    };
    
    var chat = function(type, who, message) {
        who = who.split(" ")[0].replace(" (GM)", "");
        sendChat("MapChange", type + " " + who + " " + message, {noarchive:true});
    };
    
    var navigation = function(prev, next) {
        // Create a varaible to hold the total colspan for the title bar.
        var colspan = 1;
        // Check if prev is not empty.
        if (prev !== "") {
            // If it is then increment colspan.
            colspan += 1;
        }
        // Check if next is not empty.
        if (next !== "") {
            // If it is then increment colspan.
            colspan += 1;
        }
        // Add in a blank line to seperate the information from the back button.
        var text = "<br line-height='1'>";
        // Add in a new table for the back button.
        text += "<table border='1' cellspacing='2' cellpadding='4'>";
        // Add in the title row for the navigation bar.
        text += "<tr><td colspan='" + colspan + "'><strong><em>Navigation<em></strong></td></tr>";
        // Add the opening tag for the row.
        text += "<tr>";
        // Check if prev is not empty.
        if (prev !== "") {
            // If it is then add a table element in for the previous button.
            text += "<td><a href='!mc help --show " + prev + "'>Previous</a></td>";
        }
        // Add in the row for the back button.
        text += "<td><a href='!mc help'>Back</a></td>";
        // Check if next is not empty.
        if (next !== "") {
            // If it is then add a table element in for the next button.
            text += "<td><a href='!mc help --show " + next + "'>Next</a></td>";
        }
        // Add the closing tag for the table.
        text += "</tr></table>";
        // Return the assembled text.
        return text;
    };

    var registerEventHandlers = function() {
        on('chat:message', handleInput);
    };

    return {
        ConstructMaps: constructMaps,
        RegisterEventHandlers: registerEventHandlers,
        CheckInstall: checkInstall
    };
}());

on("ready", function() {
    'use strict';
    // Load in the global config settings.
    MapChange.CheckInstall();
    // If it is then log out the map construction.
    log("Map Change Started");
    log("Blocked Players");
    log(state.MapChange.blockedPlayers);
    MapChange.ConstructMaps();
    log("Maps Constructed");
    MapChange.RegisterEventHandlers();
    log("Map Change Ready");
    // If it is then send a message to the GM to tell them the script is ready.
    //Commented this out, since it produces a string of chat spam. - keithcurtis
    //sendChat("Map Change", "/w gm Map Change Ready");
});
/*
================================================================
END SCRIPT: MapChange
================================================================
*/

/*
================================================================
BEGIN SCRIPT: Group Initiative
SOURCE FILE: Group Initiative(1).md
================================================================
*/
// Github:   https://github.com/shdwjk/Roll20API/blob/master/GroupInitiative/GroupInitiative.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron
var API_Meta = API_Meta||{}; //eslint-disable-line no-var
API_Meta.GroupInitiative={offset:Number.MAX_SAFE_INTEGER,lineCount:-1};
{try{throw new Error('');}catch(e){API_Meta.GroupInitiative.offset=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-6);}}

const GroupInitiative = (() => { // eslint-disable-line no-unused-vars

  const scriptName = "GroupInitiative";
  const version = '0.9.41';
  API_Meta.GroupInitiative.version = version;
  const lastUpdate = 1737482748;
  const schemaVersion = 1.3;

  const isString = (s)=>'string'===typeof s || s instanceof String;
  const isFunction = (f)=>'function'===typeof f;
  const getComputedProxy = ("undefined" !== typeof getComputed)
    ? async (...a) => await getComputed(...a)
    : async ()=>{}
    ;


  let observers = {
    turnOrderChange: []
  };
  let validCharacterSheets = [];

  const sorters = {
    'None': {
      desc: `No sorting is applied.`,
      func: (to)=>to
    },
    'Ascending': {
      desc: `Sorts the Turn Order from highest to lowest`,
      func: (to,preserveFirst) => {
        let first = to[0];
        const sorter_asc = (a, b) => a.pr - b.pr;
        let newTo = to.sort(sorter_asc);
        if(preserveFirst){
          let idx = newTo.findIndex(e=>e===first);
          newTo = [...newTo.slice(idx),...newTo.slice(0,idx)];
        }
        return newTo;
      }
    },
    'Descending': {
      desc: `Sorts the Turn Order from lowest to highest.`,
      func: (to,preserveFirst) => {
        let first = to[0];
        const sorter_desc = (a, b) => b.pr - a.pr;
        let newTo = to.sort(sorter_desc);
        if(preserveFirst){
          let idx = newTo.findIndex(e=>e===first);
          newTo = [...newTo.slice(idx),...newTo.slice(0,idx)];
        }
        return newTo;
      }
    }
  };

  const ch = (c) => {
    const entities = {
      '<' : 'lt',
      '>' : 'gt',
      '&' : 'amp',
      "'" : '#39',
      '@' : '#64',
      '{' : '#123',
      '|' : '#124',
      '}' : '#125',
      '[' : '#91',
      ']' : '#93',
      '"' : 'quot',
      '*' : 'ast',
      '/' : 'sol',
      ' ' : 'nbsp'
    };

    if( entities.hasOwnProperty(c) ){
      return `&${entities[c]};`;
    }
    return '';
  };

  const standardConfigs = {
    'dnd2024byroll20': {
      title: `D${ch('&')}D 2024 by Roll20`,
      desc: `This is the Roll20 provided 2024 edition character sheet build on Beacon Technology.  Note: This sheet requires using the Experimental Mod (API) Server.`,
      func: ()=>{
        state[scriptName].bonusStatGroups = [
          [
            {
              adjustments:[
                "filter-sheet"
              ],
              attribute: 'dnd2024byroll20'
            },
            {
              adjustments: [
                "computed"
              ],
              attribute: "initiative_bonus"
            },
            {
              adjustments: [
                "computed"
              ],
              attribute: "init_tiebreaker"
            }
          ],
          ...(state[scriptName].bonusStatGroups||[])
        ];
        state[scriptName].dieSize = 20;
        state[scriptName].diceCount = 1;
      }
    },
    'dnd5eogl': {
      title: `D${ch('&')}D 5E by Roll20`,
      desc: `This is the standard Roll20 provided 5th edition character sheet.  It is the one used by default in most 5th edition Modules and all Official Dungeons and Dragons Modules and Addons.`,
      func: ()=>{
        state[scriptName].bonusStatGroups = [
          [
            {
              adjustments:[
                "filter-sheet"
              ],
              attribute: 'ogl5e'
            },
            {
              attribute: "initiative_bonus"
            },
            {
              adjustments: [
                "tie-breaker"
              ],
              attribute: "initiative_bonus"
            }
          ],
          ...(state[scriptName].bonusStatGroups||[])
        ];
        state[scriptName].dieSize = 20;
        state[scriptName].diceCount = 1;
      }
    },
    'dnd5eshaped2': {
      title: `D${ch('&')}D 5e Shaped Sheet`,
      desc: `This is the high-powered and very customizable Dungeons and Dragons 5e Shaped Sheet.  You'll know you're using it because you had to manually install it (probably) and it has a nice heart shaped hit-point box.  This is not the default sheet for DnD Modules on Roll20, if you aren't sure if you're using this sheet, you aren't.`,
      func: ()=>{
        state[scriptName].bonusStatGroups = [
          [
            {
              "attribute": "initiative_formula"
            }
          ]
        ];
        state[scriptName].dieSize = 20;
        state[scriptName].diceCount = 0;
      }
    },
    'stargaterpgofficial': {
      title: `Stargate RPG by Wyvern Gaming`,
      desc: `This will configure GroupInitiative to work with the Official Stargate RPG sheet. It adds Initiative & Moxie options for rolling, with Initiative enabled by default.  You can swap between using Initiative and Moxie by issuing the command "!group-init --promote 2" in the chat, with subsequent calls again reversing the selection.`,
      func: ()=>{
        state[scriptName].bonusStatGroups = [
          [
            {
              "attribute": "init"
            }
          ],
          [
            {
              "attribute": "moxie"
            }
          ]
        ];
        state[scriptName].dieSize = 20;
        state[scriptName].diceCount = 1;
      }
    }
  };

  const HE = (() => {
    const esRE = (s) => s.replace(/(\\|\/|\[|\]|\(|\)|\{|\}|\?|\+|\*|\||\.|\^|\$)/g,'\\$1');
    const e = (s) => `&${s};`;
    const entities = {
      '<' : e('lt'),
      '>' : e('gt'),
      "'" : e('#39'),
      '@' : e('#64'),
      '{' : e('#123'),
      '|' : e('#124'),
      '}' : e('#125'),
      '[' : e('#91'),
      ']' : e('#93'),
      '"' : e('quot')
    };
    const re = new RegExp(`(${Object.keys(entities).map(esRE).join('|')})`,'g');
    return (s) => s.replace(re, (c) => (entities[c] || c) );
  })();


  const observeTurnOrderChange = function(handler){
    if(handler && _.isFunction(handler)){
      observers.turnOrderChange.push(handler);
    }
  };

  const notifyObservers = function(event,obj,prev){
    _.each(observers[event],function(handler){
      handler(obj,prev);
    });
  };

  const formatDieRoll = function(rollData) {
    const critFail = rollData.rolls.reduce((m,r)=> m || r.rolls.includes(1),false);
    const critSuccess = rollData.rolls.reduce((m,r)=> m || r.rolls.includes(r.sides),false);
    const highlight = ( (critFail && critSuccess)
        ? '#4A57ED'
        : ( critFail
          ? '#B31515'
          : ( critSuccess
            ? '#3FB315'
            : '#FEF68E'
          )
        )
      );

    const HH = (a)=>HE(HE(a));
    const HDie = (n,m) => n===m ? '#00ff00' : (n===1 ? '#ff0000' : '#ffffff'); 
    const HR = (n,m) => `<span style="font-weight:bold;color:${HDie(n,m)};">${n}</span>`;
    const HDiscard = () => '#999999';
    const HD = (n,m) => `<span style="color: ${HDiscard(n,m)};">${n}</span>`;
    const HRolls = rollData.rolls.reduce((m,rs)=>({
        r:[...m.r,...rs.rolls.map(n=>HR(n,rs.sides))],
        d:[...m.d,...rs.discards.map(n=>HD(n,rs.sides))]
    }),{r:[],d:[]});

    const b = (text)=>`<span style="font-weight:bold;">${text}</span>`;
    const block = (text,style)=>`<span style="display:block;${style}">${text}</span>`;
    const LabelBlock = (label) => block(label,`font-size:1em;`);
    const FormulaBlock = (formula,bonus) => block(`${b(formula)} ${bonus}`,`font-size:.8em;`);
    const ResultBlock = (result) => block(block(result,`display:inline-block;background:#fef68e;color:#404040;font-weight:bold;padding: .1em .2em; border:3px solid ${highlight};border-radius:.5em;min-width:2em;font-size:2em;`));
    const RollsBlock = (rolls,bonus) => block(`${b('(')}${[...rolls.r,...rolls.d].join(',')}${b(')')} ${bonus}`,`font-size:1.5em;`);
    const popup = (label,formula,bonus,result,rolls) => block(`${LabelBlock(label)}${FormulaBlock(formula,bonus)}${ResultBlock(result)}${RollsBlock(rolls,bonus)}`,`font-color:white`);

    let bonus = `${(rollData.bonus>=0 ? '+' :'-')} ${b(Math.abs(rollData.bonus))}`;
    let popText = popup(
      rollData.source.label,
      rollData.source.formula,
      bonus,
      rollData.total,
      HRolls);

    return '<span class="inlinerollresult showtip tipsy" style="min-width:1em;display: inline-block; border: 2px solid '+
      highlight+
      '; background-color: #FEF68E;color: #404040; font-weight:bold;padding: 0px 3px;cursor: help"'+
      ' title="'+HH(popText)+'">'+
      rollData.total+
      '</span>';
  };

  const buildAnnounceGroups = function(l) {
    let groupColors = {
      npc: '#eef',
      character: '#efe',
      gmlayer: '#aaa'
    };
    return _.reduce(l,function(m,s){
      let type= ('gmlayer' === s.token.get('layer') ?
        'gmlayer' : (
          (s.character && _.filter(s.character.get('controlledby').split(/,/),function(c){ 
            return 'all' === c || ('' !== c && !playerIsGM(c) );
          }).length>0) || false ?
          'character' :
          'npc'
        ));
      if('graphic'!==s.token.get('type') || 'token' !==s.token.get('subtype')) {
        return m;
      }
      m[type].push('<div style="float: left;display: inline-block;border: 1px solid #888;border-radius:5px; padding: 1px 3px;background-color:'+groupColors[type]+';">'+
        '<div style="font-weight:bold; font-size: 1.3em;">'+
        '<img src="'+(s.token && s.token.get('imgsrc').trim())+'" style="height: 2.5em;float:left;margin-right:2px;">'+
        ((s.token && s.token.get('name')) || (s.character && s.character.get('name')) || '(Creature)')+
        '</div>'+
        '<div>'+
        formatDieRoll(s.rollResults)+
        '</div>'+
        '<div style="clear: both;"></div>'+
        '</div>');
      return m;
    },{npc:[],character:[],gmlayer:[]});
  };

  const announcers = {
    'None': {
      desc: `Shows nothing in chat when a roll is made.`,
      func: () => {}
    },
    'Hidden': {
      desc: `Whispers all rolls to the GM, regardless of who controls the tokens.`,
      func: (l) => {
        let groups = buildAnnounceGroups(l);
        if(groups.npc.length || groups.character.length || groups.gmlayer.length){
          sendChat(scriptName,'/w gm '+
            '<div>'+
            groups.character.join('')+
            groups.npc.join('')+
            groups.gmlayer.join('')+
            '<div style="clear:both;"></div>'+
            '</div>');
        }
      }
    },
    'Partial': {
      desc: `Character rolls are shown in chat (Player controlled tokens), all others are whispered to the GM.`,
      func: (l) => {
        let groups = buildAnnounceGroups(l);
        if(groups.character.length){
          sendChat(scriptName,'/direct '+
            '<div>'+
            groups.character.join('')+
            '<div style="clear:both;"></div>'+
            '</div>');
        }
        if(groups.npc.length || groups.gmlayer.length){
          sendChat(scriptName,'/w gm '+
            '<div>'+
            groups.npc.join('')+
            groups.gmlayer.join('')+
            '<div style="clear:both;"></div>'+
            '</div>');
        }
      }
    },
    'Visible': {
      desc: `Rolls for tokens on the Objects Layer are shown to all in chat.  Tokens on the GM Layer have their rolls whispered to the GM. `,
      func: (l) => {
        let groups=buildAnnounceGroups(l);
        if(groups.npc.length || groups.character.length){
          sendChat(scriptName,'/direct '+
            '<div>'+
            groups.character.join('')+
            groups.npc.join('')+
            '<div style="clear:both;"></div>'+
            '</div>');
        }
        if(groups.gmlayer.length){
          sendChat(scriptName,'/w gm '+
            '<div>'+
            groups.gmlayer.join('')+
            '<div style="clear:both;"></div>'+
            '</div>');
        }
      }
    }
  };

  const adjustments = {
    STAT: 'stat',
    COMPUTED: 'computed',
    TOKEN: 'token',
    CHARACTER: 'character',
    BONUS: 'bonus',
    FILTER: 'filter',
    ROLLADJ: 'roll-adjustment',
    LABEL: 'label'
  };

  const statAdjustments = {
    'filter-sheet': {
      type: adjustments.FILTER,
      func: async (t,c,v) => c && isFunction(c.get) && c.get('charactersheetname') === v,
      desc: 'Forces calculations only for specific character sheets.'
    },
    'filter-status': {
      type: adjustments.FILTER,
      func: async (t,c,v) => t && isFunction(t.get) && t.get(`status_${v}`) !== false,
      desc: 'Forces calculations only for tokens with a given status marker.'
    },
    'filter-tooltip': {
      type: adjustments.FILTER,
      func: async (t,c,v) => t && isFunction(t.get) && (t.get(`tooltip`)||'').toLowerCase().split(/[^a-zA-Z0-9:#|-]+/).includes(v),
      desc: 'Forces calculations only for tokens with a tooltip containing the given word.'
    },
    'roll-die-count': {
      type: adjustments.ROLLADJ,
      func: async (t,c,v) => ({die_count:Number(v)||state[scriptName].config.diceCount}),
      desc: 'Forces the number of dice rolled to this value for the matching tokens.'
    },
    'roll-die-size': {
      type: adjustments.ROLLADJ,
      func: async (t,c,v) => ({die_size:Number(v)||state[scriptName].config.dieSize}),
      desc: 'Forces the size of the die rolled to this value for the matching tokens.'
    },
    'roll-die-mod': {
      type: adjustments.ROLLADJ,
      func: async (t,c,v) => ({die_mod:v}),
      desc: 'Applies the given die mod to the roll.'
    },
    'label': {
      type: adjustments.LABEL,
      func: async (t,c,v) => ({label:v}),
      desc: 'Attaches a label to the rule for use in reporting.'
    },
    'bonus': {
      type: adjustments.BONUS,
      func: async (v) => Number(v),
      desc: 'Adds a raw number.'
    },
    'computed': {
      type: adjustments.COMPUTED,
      func: async (c,v) => {
        return await getComputedProxy({characterId:c.id,property:v});
      },
      desc: 'Reads the adjustment from a Beacon Sheet Computed.'
    },
    'stat-dnd': {
      type: adjustments.STAT,
      func: async function(v) {
        return 'floor((('+v+')-10)/2)';
      },
      desc: 'Calculates the bonus as if the value were a DnD Stat.'
    },
    'negative': {
      type: adjustments.STAT,
      func: async function(v) {
        return '(-1*('+v+'))';
      },
      desc: 'Returns the negative version of the stat'
    },
    'bare': {
      type: adjustments.STAT,
      func: async function(v) {
        return v;
      },
      desc: 'No Adjustment.'
    },
    'floor': {
      type: adjustments.STAT,
      func: async function(v) {
        return 'floor('+v+')';
      },
      desc: 'Rounds down to the nearest integer.'
    },
    'tie-breaker': {
      type: adjustments.STAT,
      func: async function(v) {
        return '(0.01*('+v+'))';
      },
      desc: 'Adds the accompanying attribute as a decimal (0.01)'
    },
    'ceiling': {
      type: adjustments.STAT,
      func: async function(v) {
        return 'ceil('+v+')';
      },
      desc: 'Rounds up to the nearest integer.'
    },
    'token_bar': {
      type: adjustments.TOKEN,
      func: async function(t,idx) {
        return parseFloat(t && isFunction(t.get) && t.get(`bar${idx}_value`))||0;
      },
      desc: 'Takes the bonus from the numbered bar on the token. Use 1, 2, or 3.  Defaults to 0 in the absense of a number.'
    },
    'token_bar_max': {
      type: adjustments.TOKEN,
      func: async function(t,idx) {
        return parseFloat(t && isFunction(t.get) && t.get(`bar${idx}_max`))||0;
      },
      desc: 'Takes the bonus from the max value of the numbered bar on the token. Use 1, 2, or 3.  Defaults to 0 in the absense of a number.'
    },
    'token_aura': {
      type: adjustments.TOKEN,
      func: async function(t,idx) {
        return parseFloat(t && isFunction(t.get) && t.get(`aura${idx}_radius`))||0;
      },
      desc: 'Takes the bonus from the radius of the token aura. Use 1 or 2.  Defaults to 0 in the absense of a number.'
    }

  };

  const buildInitDiceExpression = function(s,a){
    let diceCount = state[scriptName].config.diceCount;
    let diceSize = a?.die_size || state[scriptName].config.dieSize;
    let diceMod = a?.die_mod || state[scriptName].config.diceMod || '';
    
    if(a.hasOwnProperty('die_count')){
      diceCount = a.die_count;
    } else {
      let stat=(''!== state[scriptName].config.diceCountAttribute && s.character && getAttrByName(s.character.id, state[scriptName].config.diceCountAttribute, 'current'));
      if(stat ) {
        stat = (_.isString(stat) ? stat : stat+'');
        if('0' !== stat) {
          stat = stat.replace(/@\{([^|]*?|[^|]*?\|max|[^|]*?\|current)\}/g, '@{'+(s.character.get('name'))+'|$1}');
          diceCount = `(${stat})`;
        }
      } 
    }
    return `${diceCount}d${diceSize}${diceMod}`;
  };

  const rollers = {
    'Individual-Roll': {
      mutator: function(l){
        return l;
      },
      func: function(s,a){
        return buildInitDiceExpression(s,a);
      },
      desc: 'Sets the initiative individually for each member of the group.'
    },
    'Least-All-Roll':{
      mutator: function(l){
        let min=_.reduce(l,function(m,r){
          if(!m || (r.total < m.total)) {
            return r;
          } 
          return m;
        },false);
        return _.times(l.length, function(){
          return min;
        });
      },
      func: function(s,a){
        return buildInitDiceExpression(s,a);
      },
      desc: 'Sets the initiative to the lowest of all initiatives rolled for the group.'
    },
    'Mean-All-Roll':{
      mutator: function(l){
        let mean = l[Math.round((l.length/2)-0.5)];
        return _.times(l.length, function(){
          return mean;
        });
      },
      func: function(s,a){
        return buildInitDiceExpression(s,a);
      },
      desc: 'Sets the initiative to the mean (average) of all initiatives rolled for the group.'
    },
    'Constant-By-Stat': {
      mutator: function(l){
        return l;
      },
      func: function(){
        return '0';
      },
      desc: 'Sets the initiative individually for each member of the group to their bonus with no roll.'
    }
  };

  const assureHelpHandout = (create = false) => {
    const helpIcon = "https://s3.amazonaws.com/files.d20.io/images/295769190/Abc99DVcre9JA2tKrVDCvA/thumb.png?1658515304";

    // find handout
    let props = {type:'handout', name:`Help: ${scriptName}`};
    let hh = findObjs(props)[0];
    if(!hh) {
      hh = createObj('handout',Object.assign(props, {avatar: helpIcon}));
      create = true;
    }
    if(create || version !== state[scriptName].lastHelpVersion){
      hh.set({
        notes: helpParts.helpDoc({who:'handout',playerid:'handout'})
      });
      state[scriptName].lastHelpVersion = version;
      log('  > Updating Help Handout to v'+version+' <');
    }
  };

  const buildCharacterSheetList = () => {
    validCharacterSheets = [...new Set(findObjs({type:"character"}).map(c=>c.get('charactersheetname')))];
  };


  const checkForNoConfig = () => {
    if(state[scriptName].config.checkForNoConfig && (0 === state[scriptName].bonusStatGroups.length)){
      setTimeout(()=>{
        sendChat(scriptName,`/w gm ${helpParts.helpNoConfig()}`);
      },1000);
    }
  };

  const checkInstall = function() {    
    log(`-=> ${scriptName} v${version} <=-  [${new Date(lastUpdate*1000)}]`);

    if( ! _.has(state,scriptName) || state[scriptName].version !== schemaVersion) {
      log('  > Updating Schema to v'+schemaVersion+' <');
      switch(state[scriptName] && state[scriptName].version) {
        case 0.5:
          state[scriptName].replaceRoll = false;
          /* break; // intentional dropthrough */ /* falls through */

        case 0.6:
          state[scriptName].config = {
            rollType: state[scriptName].rollType,
            replaceRoll: state[scriptName].replaceRoll,
            dieSize: 20,
            autoOpenInit: true,
            sortOption: 'Descending'
          };
          delete state[scriptName].replaceRoll;
          delete state[scriptName].rollType;
          /* break; // intentional dropthrough */ /* falls through */

        case 0.7:
          state[scriptName].config.announcer = 'Partial';
          /* break; // intentional dropthrough */ /* falls through */

        case 0.8:
          state[scriptName].config.diceCount = 1;
          state[scriptName].config.maxDecimal = 2;
          /* break; // intentional dropthrough */ /* falls through */

        case 0.9:
          state[scriptName].config.diceCountAttribute = '';
          /* break; // intentional dropthrough */ /* falls through */

        case 0.10:
          if(_.has(state[scriptName].config,'dieCountAttribute')){
            delete state[scriptName].config.dieCountAttribute;
            state[scriptName].config.diceCountAttribute = '';
          }
          if(_.has(state[scriptName].config,'dieCount')){
            delete state[scriptName].config.dieCount;
            state[scriptName].config.diceCount = 1;
          }
          /* break; // intentional dropthrough */ /* falls through */

        case 1.0:
          state[scriptName].savedTurnOrders =[];
          /* break; // intentional dropthrough */ /* falls through */

        case 1.1:
          state[scriptName].config.diceMod='';
          /* break; // intentional dropthrough */ /* falls through */

        case 1.2:
          state[scriptName].lastHelpVersion=version;
          state[scriptName].config.checkForNoConfig = true;
          /* break; // intentional dropthrough */ /* falls through */

        case 1.3:
          state[scriptName].config.preserveFirst=false;
          /* break; // intentional dropthrough */ /* falls through */

        case 'UpdateSchemaVersion':
          state[scriptName].version = schemaVersion;
          break;

        default:
          state[scriptName] = {
            version: schemaVersion,
            lastHelpVersion: version,
            bonusStatGroups: [],
            savedTurnOrders: [],
            config: {
              rollType: 'Individual-Roll',
              replaceRoll: false,
              dieSize: 20,
              diceCount: 1,
              maxDecimal: 2,
              diceCountAttribute: '',
              diceMod: '',
              checkForNoConfig: true,
              autoOpenInit: true,
              sortOption: 'Descending',
              preserveFirst: true,
              announcer: 'Partial'
            }
          };
          break;
      }
    }
    assureHelpHandout();
    buildCharacterSheetList();
    checkForNoConfig();
  };

  const S = {

    button: {
      'border': '1px solid #cccccc',
      'border-radius': '.5em',
      'background-color': '#006dcc',
      'margin': '0 .1em',
      'font-weight': 'bold',
      'padding': '.1em 1em',
      'color': 'white'
    },
    buttonCompact: {
      'border': '1px solid #cccccc',
      'border-radius': '.5em',
      'background-color': '#006dcc',
      'margin': '0 .1em',
      'font-weight': 'bold',
      'padding': '.1em .25em',
      'color': 'white'
    },
    bubble: {
      'display': 'inline-block',
      'border': '1px solid #999',
      'border-radius': '1em',
      'padding': '.1em .5em',
      'font-weight': 'bold',
      'background-color': '#009688',
      'color': 'white'
    },
    adj: {
      default: {
        'display': 'inline-block',
        'border': '1px solid #999',
        'border-radius': '.25em',
        'padding': '.1em .25em',
        'font-weight': 'bold',
        'background-color': '#009688',
        'color': 'white',
        'margin':'.25em'
      },
      'negative': {
        'background-color': 'white',
        'color': '#009688'
      },
      'floor': {
        'background-color': '#274e13'
      },
      'ceiling': {
        'background-color': '#3c78d8'
      },
      'stat-dnd': {
        'background-color': '#990099'
      },
      'filter-sheet': {
        'background-color': '#996600'
      },
      'filter-status': {
        'background-color': '#993300'
      },
      'filter-tooltip': {
        'background-color': '#cc6600'
      },
      'roll-die-count': {
        'background-color': '#0066cc'
      },
      'roll-die-size': {
        'background-color': '#0033cc'
      },
      'roll-die-mod': {
        'background-color': '#0099cc'
      },
      'label': {
        'color': '#000000',
        'background-color': '#ffff00'
      },
      'computed': {
        'background-color': '#a61c00'
      },
      'bonus': {
        'background-color': '#f1c232',
        'color': '#555500'
      },
      'token_bar': {
        'background-color': '#1c4587'
      },
      'token_bar_max': {
        'background-color': '#674ea7'
      },
      'token_aura': {
        'background-color': '#a64d79'
      }

    },
    configRow: {
      'border': '1px solid #ccc;',
      'border-radius': '.2em;',
      'background-color': 'white;',
      'margin': '0 1em;',
      'padding': '.1em .3em;'
    },
    bsgRow:{
      'position': 'relative',
      'padding': '.5em 4em .5em .5em',
      'margin-bottom': '.5em'
    },
    oe: [
      { 'background-color': '#eeffee' },
      { 'background-color': '#eeeeff' }
    ],
    block: {
      'border': '1px solid #ff0000'
    }
  };

  const css = (rules) => `style="${Object.keys(rules).map(k=>`${k}:${rules[k]};`).join('')}"`;

  const _h = {
    outer: (...o) => `<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">${o.join(' ')}</div>`,
    title: (t,v) => `<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">${t} v${v}</div>`,
    subhead: (...o) => `<b>${o.join(' ')}</b>`,
    minorhead: (...o) => `<u>${o.join(' ')}</u>`,
    optional: (...o) => `${ch('[')}${o.join(` ${ch('|')} `)}${ch(']')}`,
    required: (...o) => `${ch('<')}${o.join(` ${ch('|')} `)}${ch('>')}`,
    header: (...o) => `<div style="padding-left:10px;margin-bottom:3px;">${o.join(' ')}</div>`,
    section: (s,...o) => `${_h.subhead(s)}${_h.inset(...o)}`,
    paragraph: (...o) => `<p>${o.join(' ')}</p>`,
    items: (o) => o.map(i=>`<li>${i}</li>`).join(''),
    ol: (...o) => `<ol>${_h.items(o)}</ol>`,
    ul: (...o) => `<ul>${_h.items(o)}</ul>`,
    block: (...o) => `<div ${css(S.block)}>${o.join(' ')}</div>`,
    grid: (...o) => `<div style="padding: 12px 0;">${o.join('')}<div style="clear:both;"></div></div>`,
    cell: (o) =>  `<div style="width: 130px; padding: 0 3px; float: left;">${o}</div>`,
    inset: (...o) => `<div style="padding-left: 10px;padding-right:20px">${o.join(' ')}</div>`,
    join: (...o) => o.join(' '),
    pre: (...o) =>`<div style="border:1px solid #e1e1e8;border-radius:4px;padding:8.5px;margin-bottom:9px;font-size:12px;white-space:normal;word-break:normal;word-wrap:normal;background-color:#f7f7f9;font-family:monospace;overflow:auto;">${o.join(' ')}</div>`,
    preformatted: (...o) =>_h.pre(o.join('<br>').replace(/\s/g,ch(' '))),
    code: (...o) => `<code>${o.join(' ')}</code>`,
    attr: {
      bare: (o)=>`${ch('@')}${ch('{')}${o}${ch('}')}`,
      selected: (o)=>`${ch('@')}${ch('{')}selected${ch('|')}${o}${ch('}')}`,
      target: (o)=>`${ch('@')}${ch('{')}target${ch('|')}${o}${ch('}')}`,
      char: (o,c)=>`${ch('@')}${ch('{')}${c||'CHARACTER NAME'}${ch('|')}${o}${ch('}')}`
    },
    bold: (...o) => `<b>${o.join(' ')}</b>`,
    italic: (...o) => `<i>${o.join(' ')}</i>`,
    font: {
      command: (...o)=>`<b><span style="font-family:serif;">${o.join(' ')}</span></b>`
    },
    bsgAdj: (adj,m) => `<span ${css({...S.adj.default,...(S.adj[adj]||{})})}>${adj}( ${m} )</span>`,
    bsgRowBlock: (c,n) => `<div ${css({...S.bsgRow,...S.oe[n%2]})}>${c}</div>`,
    bsgAdjPart: (e) => (e.adjustments||['']).reduce((m,adj) => _h.bsgAdj(adj,m) , `${e.attribute}${e.type?`|${e.type}`:''}`),
    bsgRowStats: (g) => `<div>${g.map(_h.bsgAdjPart).join('')}</div>`,
    bsgRowButtons: (n) => `<div style="position: absolute; right: 0; top:0;">${_h.ui.buttonCompact(`⮙`,`!group-init --promote ${n}`)}${_h.ui.buttonCompact(`🚫`,`!group-init --del-group ${n}`)}</div>`,
    bsgRow: (g,n) =>_h.bsgRowBlock(`${_h.bsgRowStats(g)}${_h.bsgRowButtons(n)}`,n-1),
    ui : {
      float: (t) => `<div style="display:inline-block;float:right">${t}</div>`,
      clear: () => `<div style="clear:both;"></div>`,
      bubble: (label) => `<span ${css(S.bubble)}>${label}</span>`,
      button: (label,link) => `<a ${css(S.button)} href="${link}">${label}</a>`,
      buttonCompact: (label,link) => `<a ${css(S.buttonCompact)} href="${link}">${label}</a>`
    }
  };




  const helpParts = {
    helpBody: (context) => _h.join(
      _h.header(
        _h.paragraph(
          `Rolls initiative for the selected tokens and adds them to the Turn Order if they don${ch("'")}t have a turn yet.`
        ),
        _h.paragraph(
          `The calculation of initiative is handled by the combination of Roller (See ${_h.bold("Roller Options")} below) and a Bonus.  The Bonus is determined based on an ordered list of Stat Groups (See ${_h.bold("Bonus Stat Groups")} below).  Stat Groups are evaluated in order.  The bonus computed by the first Stat Group for which all attributes exist and have a numeric value is used.  This allows you to have several Stat Groups that apply to different types of characters.  In practice you will probably only have one, but more are there if you need them.`
        )
      ),
      helpParts.commands(context)
    ),
    rollingCommands: (/*context*/) => _h.section('Commands for Rolling',
      _h.paragraph(`GroupInitiative's primary role is rolling initiative.  It has many options for performing the roll, most of which operate on the selected tokens.`),
      _h.inset(
        _h.font.command(
          `!group-init`
        ),
        _h.paragraph(
          `This command uses the configured Roller to dtermine the initiative order for all the selected tokens.`
        ),
        _h.font.command(
          `!group-init`,
          `--bonus`,
          _h.required('bonus')
        ),
        _h.paragraph(
          `This command is just line the bare !group-init roll, but will add the supplied bonus to all rolls.  The bonus can be from an inline roll.`
        ),
        _h.font.command(
          `!group-init`,
          `--reroll`,
          _h.optional('bonus')
        ),
        _h.paragraph(
          `This command rerolls all of the tokens currently in the turn order as if they were selected when you executed !group-init.  An optional bonus can be supplied, which can be the result of an inline roll.`
        ),
        _h.font.command(
          `!group-init`,
          `--ids`,
          _h.optional('...')
        ),
        _h.paragraph(
          `This command uses the configured Roller to determine the initiative order for all tokens whose ids are specified.`
        ),

        _h.font.command(
          `!group-init`,
          `--adjust`,
          _h.required('adjustment'),
          _h.optional('minimum')
        ),
        _h.paragraph(
          `Applies an adjustment to all the current Turn Order tokens (Custom entries ignored).  The required adjustment value will be applied to the current value of all Turn Order entries.  The optional minium value will be used if the value after adjustiment is lower, which can end up raising Turn Order values even if they were already lower.`
        ),
        _h.font.command(
          `!group-init`,
          `--adjust-current`,
          _h.required('adjustment'),
          _h.optional('minimum')
        ),
        _h.paragraph(
          `This is identical to --adjust, save that it is only applied to the top entry in the Turn Order.`
        )
      )
    ),
    helpCommands: (/*context*/) => _h.section('Help and Configuration',
      _h.paragraph(
        `All of these commands are documented in the build in help.  Additionally, there are many configuration options that can only be accessed there.`
      ),
      _h.inset(
        _h.font.command(
          `!group-init`,
          `--help`
        ),
        _h.paragraph(`This command displays the help and configuration options.`)
      )
    ),

    buildStatAdjustmentRows: ( /* context */) => _h.ul(
      ...Object.keys(statAdjustments).map(k=>`${_h.bold(k)} -- ${statAdjustments[k].desc}`)
    ),

    buildCharacterSheetRows: ( /* context */) => _h.ul(
      ...validCharacterSheets.map(k=>`${_h.bold(k)}`)
    ),

    showStandardConfigOptions: ( /* context */ ) => _h.ul(
      ...Object.keys(standardConfigs).map(c=>_h.join(
        _h.ui.float(_h.ui.button(`Apply Config`,`!group-init-config --apply-standard-config|${c}`)),
        _h.subhead(standardConfigs[c].title),
        _h.paragraph(`${standardConfigs[c].desc}${_h.ui.clear()}`)
      ))
    ),

    statGroupCommands: (/*context*/) => _h.section('Commands for Stat Groups',
      _h.paragraph(
        `Stat Groups are the method through which GroupInitiative knows what to do to create the initiative value for a token.  Generally, they will be some combination of attributes and adjustments to look up on each token and character.`
      ),
      _h.inset(
        _h.font.command(
          `!group-init`,
          `--add-group --${_h.required('adjustment')} ${_h.optional('arguments')}`,
          _h.optional(
            `--add-group --${_h.required('adjustment')} ${_h.optional('arguments')}`,
            `...`
          )
        ),
        _h.paragraph(
          `Adds a new Bonus Stat Group to the end of the list.  Each adjustment operation can be followed by another adjustment operation, but eventually must end in an attribute name.  Adjustment operations are applied to the result of the adjustment operations that follow them.`
        ),
        _h.minorhead('Available Stat Adjustment Options:'),
        helpParts.buildStatAdjustmentRows(),

        _h.font.command(
          `!group-init`,
          `--show-sheets`
        ),
        _h.paragraph(
          `This command shows the names of the character sheets currently installed in the game, for use with ${_h.code('--filter-sheet')}.`
        ),

        _h.font.command(
          `!group-init`,
          `--promote`,
          _h.required('index')
        ),
        _h.paragraph(
          `This command increases the importants of the Bonus Stat Group at the supplied index.`
        ),

        _h.font.command(
          `!group-init`,
          `--del-group`,
          _h.required('index')
        ),
        _h.paragraph(
          `This command removes the Bonus Stat Group at the supplied index.`
        )
      )
    ),
    stackCommands: (/*context*/) => _h.section('Commands for Stacks of Initiative',
      _h.paragraph(
        `GroupInitiative provides a system called ${_h.bold('Stacks')} which lets you store collections of prerolled initiative values and combine or cycle them as desired.`
      ),
      _h.inset(
        _h.font.command(
          `!group-init`,
          `--stack`,
          _h.optional('operation'),
          _h.optional('label')
        ),
        _h.inset(
          _h.minorhead('Available Operations:'),
          _h.ul(
            `${_h.bold('list')} -- Displays the stack of saved Turn Orders. (default)`,
            `${_h.bold('clear')} -- Clears the stack of saved Turn Orders.`,
            `${_h.bold(`copy${ch('|')}dup ${ch('[')}label${ch(']')}`)} -- Adds a copy of the current Turn Order to the stack.`,
            `${_h.bold(`push ${ch('[')}label${ch(']')}`)} -- Adds a copy of the current Turn Order to the stack and clears the Turn Order.  Anything after the command will be used as a label for the entry.`,
            `${_h.bold('pop')} -- Replaces the current Turn Order with the last entry in the stack removing it from the stack.`,
            `${_h.bold('apply')} -- Replaces the current Turn Order with the last entry in the stack leaving it on the stack.`,
            `${_h.bold(`swap ${ch('[')}label${ch(']')}`)} -- Swaps the current Turn Order with the last entry in the stack.  Anything after the command will be used as a label for the entry placed in the stack.`,
            `${_h.bold(`tswap${ch('|')}tail-swap ${ch('[')}label${ch(']')}`)} -- Swaps the current Turn Order with the first entry in the stack.  Anything after the command will be used as a label for the entry placed in the stack.`,
            `${_h.bold('merge')} -- Removes the last entry in the stack and adds it to the current Turn Order and sorts the new Turn Order with the configured sort method.`,
            `${_h.bold(`apply-merge${ch('|')}amerge`)} -- Merges the last entry in the stack with the current Turn Order and sorts the new Turn Order with the configured sort method, leaving the stack unchanged.`,
            `${_h.bold(`rotate${ch('|')}rot ${ch('[')}label${ch(']')}`)} -- Pushes the current Turn Order onto the end of the stack and restores the first entry from the stack to the Turn Order.  Anything after the command will be used as a label for the entry placed in the stack.`,
            `${_h.bold(`reverse-rotate${ch('|')}rrot ${ch('[')}label${ch(']')}`)} -- Pushes the current Turn Order onto the beginning of the stack and restores the last entry from the stack to the Turn Order.  Anything after the command will be used as a label for the entry placed in the stack.`
          )
        )
      )
    ),
    turnOrderCommands: (/*context*/) => _h.section('Commands for Turn Order Management',
      _h.paragraph(
        `The Turn Order is an integral part of initiative, so GroupInitiative provides some methods for manipulating it.`
      ),
      _h.inset(
        _h.font.command(
          `!group-init`,
          `--toggle-turnorder`
        ),
        _h.paragraph(
          `Opens or closes the Turn Order window.`
        ),
        _h.font.command(
          `!group-init`,
          `--sort`
        ),
        _h.paragraph(
          `Applies the configured sort operation to the current Turn Order.`
        ),
        _h.font.command(
          `!group-init`,
          `--clear`
        ),
        _h.paragraph(
          `Removes all tokens from the Turn Order.  If Auto Open Init is enabled it will also close the Turn Order box.`
        ))
    ),
    commands: (context) => _h.join(
      _h.subhead('Commands'),
      helpParts.rollingCommands(context),
      helpParts.helpCommands(context),
      helpParts.statGroupCommands(context),
      helpParts.turnOrderCommands(context),
      helpParts.stackCommands(context)
    ),

    rollerConfig: (/*context*/) => _h.section('Roller Options',
      _h.paragraph(
        `The Roller determines how token rolls are performed for groups of tokens.`
      ),
      _h.inset(
        _h.ul(
          ...Object.keys(rollers).map(r=>`${_h.ui.float(
            ( r === state[scriptName].config.rollType)
            ? _h.ui.bubble(_h.bold('Selected'))
            : _h.ui.button(`Use ${r}`,`!group-init-config --set-roller|${r}`)
          )}${_h.bold(r)} -- ${rollers[r].desc}${_h.ui.clear()}` )
        )
      )
    ),

    sortOptionsConfig: ( /* context */ ) => _h.section('Sorter Options',
      _h.paragraph(
        `The Sorter is used to determine how to reorder entries in the Turn Order whenever GroupInitiative performs a sort.  Sorting occurs when the sort command (${_h.code('!group-init --sort')}) is issued, when stack entries are merged into the current Turn Order, and when new entries are added to the Turn Order with a GroupInitiative command (like ${_h.code('!group-init')}).`
      ),
      _h.inset(
        _h.ul(
          ...Object.keys(sorters).map(s=>`${_h.ui.float(
            (s === state[scriptName].config.sortOption)
            ? _h.ui.bubble(_h.bold('Selected'))
            : _h.ui.button(`Use ${s}`,`!group-init-config --sort-option|${s}`)
          )}${_h.bold(s)} -- ${sorters[s].desc}${_h.ui.clear()}`)
        )
      )
    ),

    dieSizeConfig: ( /* context */ ) => _h.section('Initiative Die Size',
      _h.paragraph(
        `The Initiative Die sets the size of the die that GroupInitiative will roll for each initiative value.`
      ),
      _h.inset(
        _h.paragraph(`${_h.ui.float(_h.ui.button('Set Die Size', `!group-init-config --set-die-size|?{Number of sides the initiative die has:|${state[scriptName].config.dieSize}}`))}Initiative Die Size is currently set to ${_h.bold(state[scriptName].config.dieSize)}. ${_h.ui.clear()}`)
      )
    ),
    diceCountConfig: ( /* context */ ) => _h.section('Initiative Dice Count',
      _h.paragraph(
        `The Initiative Dice Count sets the number of dice GroupInitiative will roll for each initiative value.  You can set this number to 0 to prevent any dice from being rolled.`
      ),
      _h.inset(
        _h.paragraph(`${_h.ui.float(_h.ui.button('Set Dice Count', `!group-init-config --set-dice-count|?{Number of initiative dice to roll:|${state[scriptName].config.diceCount}}`))}Initiative Dice Count is currently set to ${_h.bold(state[scriptName].config.diceCount)}. ${_h.ui.clear()}`)
      )
    ),
    diceCountAttributeConfig: ( /* context */ ) => _h.section('Dice Count Attribute',
      _h.paragraph(
        `If this attribute is set, it will be used to determine the number of dice to roll for each initiatitve value.  If the value is not set, or not a valid number, the Intiative Dice Count is used instead.`
      ),
      _h.inset(
        _h.paragraph(`${_h.ui.float(_h.ui.button('Set Attribute', `!group-init-config --set-dice-count-attribute|?{Attribute to use for number of initiative dice to roll (Blank to disable):|${state[scriptName].config.diceCountAttribute}}`))}Dice Count Attribute is currently set to ${_h.bold((state[scriptName].config.diceCountAttribute.length ? state[scriptName].config.diceCountAttribute : 'DISABLED'))}. ${_h.ui.clear()}`)
      )
    ),
    diceModConfig: ( /* context */ ) => _h.section('Dice Modifier String',
      _h.paragraph(
        `The Dice Modifier String is appended to the roll made by GroupInitiative for each Initiative.  It can be used for rerolling 1s or dropping the lower roll, etc.`
      ),
      _h.inset(
        _h.paragraph(`${_h.ui.float(_h.ui.button('Set Dice Modifiers', `!group-init-config --set-dice-mod|?{Dice Modifiers to be appended to roll (Blank to disable):|${state[scriptName].config.diceMod}}`))}Dice Modifier String is currently set to ${_h.bold((state[scriptName].config.diceMod.length ? state[scriptName].config.diceMod : 'DISABLED'))}. ${_h.ui.clear()}`)
      )
    ),
    maxDecimalConfig: ( /* context */ ) => _h.section('Maximum Decimal Places',
      _h.paragraph(
        `This is the Maximum number of decimal places to show in the Initiative when Tie-Breakers are rolled.`
      ),
      _h.inset(
        _h.paragraph(`${_h.ui.float(_h.ui.button('Set Max Decimal', `!group-init-config --set-max-decimal|?{Maximum number of decimal places:|${state[scriptName].config.maxDecimal}}`))}Maximum Decimal Places is currently set to ${_h.bold(state[scriptName].config.maxDecimal)}. ${_h.ui.clear()}`)
      )
    ),
    autoOpenInitConfig: ( /* context */ ) => _h.section('Auto Open Turn Order',
      _h.paragraph(
        `This option causes GroupInitiative to open the Turn Order whenever it makes an initiative roll.`
      ),
      _h.inset(
        _h.paragraph(`${_h.ui.float(_h.ui.button((state[scriptName].config.autoOpenInit ? 'Disable' : 'Enable'), `!group-init-config --toggle-auto-open-init`))}Auto Open Turn Order is currently ${_h.bold( (state[scriptName].config.autoOpenInit ? 'On' : 'Off') )}. ${_h.ui.clear()}`)
      )
    ),
    replaceRollConfig: ( /* context */ ) => _h.section('Replace Roll',
      _h.paragraph(
        `This option causes GroupInitiative to replace a roll in the Turn Order if a token is already present there when it makes a roll for it.  Otherwise, the token is ignored and the current roll is retained.`
      ),
      _h.inset(
        _h.paragraph(`${_h.ui.float(_h.ui.button((state[scriptName].config.replaceRoll ? 'Disable' : 'Enable'), `!group-init-config --toggle-replace-roll`))}Replace Roll is currently ${_h.bold( (state[scriptName].config.replaceRoll ? 'On' : 'Off') )}. ${_h.ui.clear()}`)
      )
    ),
    checkForNoConfigConfig: ( /* context */ ) => _h.section('Check For No Configuration',
      _h.paragraph(
        `This option causes GroupInitiative to prompt with standard configuration options when it starts up and there are no Stat Groups.  You can suppress it by turning it off, in the case that your game is just dice and you don't need Stat Groups.`
      ),
      _h.inset(
        _h.paragraph(`${_h.ui.float(_h.ui.button((state[scriptName].config.checkForNoConfig ? 'Disable' : 'Enable'), `!group-init-config --toggle-check-for-no-config`))}No Configuration Checking is currently ${_h.bold( (state[scriptName].config.checkForNoConfig ? 'On' : 'Off') )}. ${_h.ui.clear()}`)
      )
    ),
    preserveFirstConfig: ( /* context */ ) => _h.section('Preserve First on Sorted Add',
      _h.paragraph(
        `This option causes GroupInitiative to preserve the first Turn Order entry when sorting the Turn Order after adding creatures.`
      ),
      _h.inset(
        _h.paragraph(`${_h.ui.float(_h.ui.button((state[scriptName].config.preserveFirst ? 'Disable' : 'Enable'), `!group-init-config --toggle-preserve-first`))}Preserve First on Sorted Add is currently ${_h.bold( (state[scriptName].config.preserveFirst ? 'On' : 'Off') )}. ${_h.ui.clear()}`)
      )
    ),
    announcerConfig: (/*context*/) => _h.section('Announcer Options',
      _h.paragraph(
        `The Announcer controls what is shown in chat when a roll is performed.`
      ),
      _h.inset(
        _h.ul(
          ...Object.keys(announcers).map(a=>`${_h.ui.float(
            (a === state[scriptName].config.announcer)
            ? _h.ui.bubble(_h.bold('Selected'))
            : _h.ui.button(`Use ${a}`,`!group-init-config --set-announcer|${a}`)
          )}${_h.bold(a)} -- ${announcers[a].desc}${_h.ui.clear()}` )
        )
      )
    ),
    standardConfig: (context) => _h.join(
      _h.subhead('Configuration'),
      _h.paragraph(
        `Standard Configurations give you some quick options for certain character sheets.  If you${ch("'")}re using one of these sheets in a pretty standard game, look no further than one of these options.`
      ),
      _h.inset(
        _h.minorhead('Available Standard Configuration Options:'),
        helpParts.showStandardConfigOptions(context)
      )
    ),

    showBonusStatGroupsConfig: (/*context*/) => _h.section('Bonus Stat Groups',
      _h.ol( ...state[scriptName].bonusStatGroups.map((a,n)=>_h.bsgRow(a,n+1) ))
    ),

    configuration: (context) => _h.join(
      _h.subhead('Configuration'),
      _h.inset(
        helpParts.rollerConfig(context),
        helpParts.sortOptionsConfig(context),
        helpParts.preserveFirstConfig(context),
        helpParts.dieSizeConfig(context),
        helpParts.diceCountConfig(context),
        helpParts.diceCountAttributeConfig(context),
        helpParts.diceModConfig(context),
        helpParts.maxDecimalConfig(context),
        helpParts.autoOpenInitConfig(context),
        helpParts.replaceRollConfig(context),
        helpParts.checkForNoConfigConfig(context),
        helpParts.announcerConfig(context),
        helpParts.showBonusStatGroupsConfig(context)
      )
    ),

    helpDoc: (context) => _h.join(
      _h.title(scriptName, version),
      helpParts.helpBody(context)
    ),

    helpChat: (context) => _h.outer(
      _h.title(scriptName, version),
      helpParts.helpBody(context),
      helpParts.standardConfig(context),
      helpParts.configuration(context)
    ),

    helpNoConfig: (context) => _h.outer(
      _h.title(scriptName, version),
      _h.paragraph(`You do not have any Bonus Stat Groups configured right now.  Usually that means this is the first time you have used GroupInitiative. If you would like, you can try one of the Standard Configurations below to configure GroupInitiative for some popular character sheets.  If you want to configure a different sheet or without a sheet at all, see the extensive ${_h.ui.button('Online Help',`!group-init --help`)}.  If you do not want to see this message again, you can ${_h.ui.button('Hide it',`!group-init-config --toggle-check-for-no-config`)}.`),
      _h.inset(
        _h.minorhead('Available Standard Configuration Options:'),
        helpParts.showStandardConfigOptions(context)
      )
    ),

    helpConfig: (context) => _h.outer(
      _h.title(scriptName, version),
      helpParts.configuration(context)
    )

  };

  const showHelp = (playerid) => {
    const who=(getObj('player',playerid)||{get:()=>'API'}).get('_displayname');
    let context = {
      who,
      playerid
    };
    sendChat('', '/w "'+who+'" '+ helpParts.helpChat(context));
  };

  const parseEmbeddedStatReferences = function(stat,charObj){
    let charName=charObj.get('name'),
      stext=(stat+'').replace(/@{[^}]*}/g,(s)=>{
        let parts=_.rest(s.match(/@{([^|}]*)\|?([^|}]*)\|?([^|}]*)}/)),
          statName,modName;
        if(parts[2].length){
          statName=parts[1];
          modName=parts[2];
        } else if(parts[1].length){
          if(_.contains(['max','current'],parts[1])){
            statName=parts[0];
            modName=parts[1];
          } else {
            statName=parts[1];
          }
        } else {
          statName=parts[0];
        }

        return `@{${charName}|${statName}${modName?`|${modName}`:''}}`;
      })
      .replace(/&{tracker}/,'');
    return stext;
  };

const findInitiativeBonus = async (charObj, token) => {
  let bonus = '';
  let rolladj = {};

  const GetBonuses = async (group, index) => {
    let cachedRollAdj = {index};
    let bonusPromises = group.map( async (details) => {
      let stat=getAttrByName(charObj.id, details.attribute, details.type||'current');

      if( undefined === stat || null === stat){
        stat = undefined;
      } else if(!Number.isNaN(Number(stat))){
        stat = parseFloat(stat);
      } else if(isString(stat)) {
        stat = parseEmbeddedStatReferences(stat,charObj);
        stat = stat.length ? stat : 0;
      } else {
        stat = undefined;
      }

      return await (details.adjustments || []).reduce(async (memo,a) => {
        let args = a.split(':');
        let adjustment = args.shift().toLowerCase();
        let func=statAdjustments[adjustment].func;
        let adjType=statAdjustments[adjustment].type;
        if(isFunction(func)) {
          switch(adjType){

            case adjustments.STAT:
              if(undefined !== stat){
                args.unshift(memo);
                memo = await func.apply({},[...args]);
              }
              break;

            case adjustments.COMPUTED:
              args.unshift(memo);
              memo = await func.apply({},[charObj,details.attribute]);
              break;

            case adjustments.TOKEN:
              memo = await func(token,details.attribute);
              break;

            case adjustments.BONUS:
              memo = await func(details.attribute);
              break;

            case adjustments.FILTER:
              if(!await func(token,charObj,details.attribute)) {
                memo=null;
              } else {
                memo = 0; // necessary to select this stat group
              }
              break;
            case adjustments.LABEL:
            case adjustments.ROLLADJ:{
                let adj = await func(token,charObj,details.attribute);
                cachedRollAdj = {...cachedRollAdj,...adj};
                memo = 0; // necessary to select this stat group
              }
              break;
          }
        }
        return memo;
      },stat);
    });

    bonus = await Promise.all(bonusPromises);


    if(_.contains(bonus,undefined) || _.contains(bonus,null) || _.contains(bonus,NaN)) {
      bonus='';
      return false;
    }
    bonus = bonus.join('+');
    rolladj = cachedRollAdj;

    return true;
  };


  for(let i = 0; i<state[scriptName].bonusStatGroups.length; ++i){
    let found = await GetBonuses(state[scriptName].bonusStatGroups[i],i);

    if(found){
      break;
    }
  }
  return {bonus,rolladj};
};

const rollForTokenIDsExternal = (ids,options) => {
  if(Array.isArray(ids)){
    setTimeout(()=>makeRollsForIDs(ids,{
      isReroll: false,
      prev: Campaign().get('turnorder'),
      manualBonus: parseFloat(options && options.manualBonus)||0
    }), 0);
  }
};

const makeRollsForIDs = async (ids,options={}) => {
  let turnorder = Campaign().get('turnorder');

  turnorder = ('' === turnorder) ? [] : JSON.parse(turnorder);
  if(state[scriptName].config.replaceRoll || options.isReroll) {
    turnorder = turnorder.filter(e => !ids.includes(e.id));
  }

  let turnorderIDS = turnorder.map(e=>e.id);

  let initFunc=rollers[state[scriptName].config.rollType].func;

  let rollSetupPromises = ids
    .filter( id => !turnorderIDS.includes(id))
    .map(id => getObj('graphic',id))
    .filter( g => undefined !== g)
    .map(g => ({
      token: g,
      character: getObj('character', g.get('represents'))
    }))
    .map(async g => {
      g.roll=[];

      let {bonus,rolladj} = await findInitiativeBonus(g.character||{},g.token);
      bonus = (isString(bonus) ? (bonus.trim().length ? bonus : '0') : bonus);
      g.roll.push(bonus);

      if(options.manualBonus){
        g.roll.push( `${options.manualBonus}`.trim() );
      }
      g.label = rolladj.label||(rolladj.hasOwnProperty('index') ? `Rule #${rolladj.index+1}` : `No Matching Rule`);
      g.formula = initFunc(g,rolladj);
      g.roll.push(g.formula );
      return g;
    });

  let rollSetup = await Promise.all(rollSetupPromises);

  let pageid = (rollSetup[0]||{token:{get:()=>{}}}).token.get('pageid');


  let initRolls = _.map(rollSetup,function(rs,i){
    return {
      index: i,
      label: rs.label,
      formula: rs.formula,
      roll: `[[(${rs.roll.filter(r=>isString(r) && r.length).join(`) + (`)})]]`.replace(/\[\[\[/g, "[[ [")
    };
  });

  let turnEntries = [];
  let finalize = _.after(initRolls.length,function(){
    turnEntries = _.sortBy(turnEntries,'order');
    turnEntries = rollers[state[scriptName].config.rollType].mutator(turnEntries);

    Campaign().set({
      turnorder: JSON.stringify(
        sorters[state[scriptName].config.sortOption].func(
          turnorder.concat(
            _.chain(rollSetup)
            .map(function(s,i){
              s.rollResults={
                ...turnEntries.shift(),
                source: initRolls[i]
              };
              return s;
            })
            .tap(announcers[state[scriptName].config.announcer].func)
            .map(function(s){
              return {
                id: s.token.id,
                pr: s.rollResults.total,
                _pageid: s.token.get('pageid'),
                custom: ''
              };
            })
            .value()
          ),
          state[scriptName].config.preserveFirst
        )
      )
    });
    notifyObservers('turnOrderChange',Campaign().get('turnorder'), options.prev);

    if(state[scriptName].config.autoOpenInit && !Campaign().get('initativepage')) {
      Campaign().set({
        initiativepage: pageid
      });
    }
  });

  initRolls.forEach((ir) => {
    let chatText = ir.index+':'+ir.roll.replace(/\[\[\s+/,'[[');
    sendChat('',chatText ,(msg) => {
      let parts = msg[0].content.split(/:/);
      let ird = msg[0].inlinerolls[parts[1].match(/\d+/)];
      let rdata = {
          order: parseInt(parts[0],10),
          total: (ird.results.total%1===0 ?
            ird.results.total :
            parseFloat(ird.results.total.toFixed(state[scriptName].config.maxDecimal))),
          rolls: _.reduce(ird.results.rolls,function(m,rs){
            if('R' === rs.type) {
              m.push({
                sides: rs.sides,
                rolls: _.pluck(rs.results.filter(r=>true!==r.d),'v'),
                discards: _.pluck(rs.results.filter(r=>true===r.d),'v')
              });
            }
            return m;
          },[])
        };

      rdata.bonus = (ird.results.total - (_.reduce(rdata.rolls,function(m,r){
        m+=_.reduce(r.rolls,function(s,dieroll){
          return s+dieroll;
        },0);
        return m;
      },0)));

      rdata.bonus = (rdata.bonus%1===0 ?
        rdata.bonus :
        parseFloat(rdata.bonus.toFixed(state[scriptName].config.maxDecimal)));

      turnEntries.push(rdata);

      finalize();
    });
  });
};

const handleInput = async (msg_orig) => {
  let msg = _.clone(msg_orig),
    prev=Campaign().get('turnorder'),
    args,
    cmds,
    workgroup,
    workvar,
    error=false,
    cont=false,
    manualBonus=0,
    manualBonusMin=0,
    isReroll=false
  ;
  const who=(getObj('player',msg.playerid)||{get:()=>'API'}).get('_displayname');

  let context = {
    who,
    playerid: msg.playerid
  };

  let ids =[];

  if(msg.selected){
    ids = [...ids, ...msg.selected.map(o=>o._id)];
  }

  if (msg.type !== "api" ) {
    return;
  }

  if(_.has(msg,'inlinerolls')){
    msg.content = _.chain(msg.inlinerolls)
      .reduce(function(m,v,k){
        m['$[['+k+']]']=v.results.total || 0;
        return m;
      },{})
      .reduce(function(m,v,k){
        return m.replace(k,v);
      },msg.content)
      .value();
  }

  args = msg.content.split(/\s+--/);
  switch(args.shift()) {
    case '!group-init':
      if(args.length > 0) {
        cmds=args.shift().split(/\s+/);

        switch(cmds[0]) {
          case 'help':
            if(!playerIsGM(msg.playerid)){
              return;
            }
            showHelp(msg.playerid);
            break;

          case 'ids':
            if(playerIsGM(msg.playerid) || msg.playerid === 'api' ){
              ids = [...new Set([...ids, ...cmds.slice(1)])];
              cont = true;
            }
            break;

          case 'show-sheets':
            sendChat('!group-init --add-group', `/w "${who}" ` +
              '<div style="padding:1px 3px;border: 1px solid #8B4513;background: #eeffee; color: #8B4513; font-size: 80%;">'+
              'The following sheets are present in the game currently:'+
              helpParts.buildCharacterSheetRows(context) +
              '</div>'
            );
            return;

          case 'add-group':
            if(!playerIsGM(msg.playerid)){
              return;
            }
            workgroup=[];
            workvar={};

            _.each(args,function(arg){
              let argParts=arg.split(/\s+(.+)/),
                adjustmentName,
                parameter=argParts[0].split(/:/);
              parameter[0]=parameter[0].toLowerCase();

              if(_.has(statAdjustments, parameter[0])) {
                if('filter-sheet' === parameter[0]){
                  if( ! validCharacterSheets.includes(argParts[1])) {
                    sendChat('!group-init --add-group', `/w "${who}" ` +
                      '<div style="padding:1px 3px;border: 1px solid #8B4513;background: #eeffee; color: #8B4513; font-size: 80%;">'+
                      'Unknown Character Sheet: '+argParts[1]+'<br>'+
                      'Use one of the following:'+
                      helpParts.buildCharacterSheetRows(context) +
                      '</div>'
                    );
                    error=true;

                  }
                }

                if('bare' !== parameter[0]) {
                  if(!_.has(workvar,'adjustments')) {
                    workvar.adjustments=[];
                  }
                  workvar.adjustments.unshift(argParts[0]);
                }
                if(argParts.length > 1){
                  adjustmentName=argParts[1].split(/\|/);
                  workvar.attribute=adjustmentName[0];
                  if('max'===adjustmentName[1]) {
                    workvar.type = 'max';
                  }
                  workgroup.push(workvar);
                  workvar={};
                }
              } else {
                sendChat('!group-init --add-group', `/w "${who}" ` +
                  '<div style="padding:1px 3px;border: 1px solid #8B4513;background: #eeffee; color: #8B4513; font-size: 80%;">'+
                  'Unknown Stat Adjustment: '+parameter[0]+'<br>'+
                  'Use one of the following:'+
                  helpParts.buildStatAdjustmentRows(context) +
                  '</div>'
                );
                error=true;
              }
            });
            if(!error) {
              if(!_.has(workvar,'adjustments')){
                state[scriptName].bonusStatGroups.push(workgroup);
                sendChat(scriptName, `/w "${who}" ${_h.outer(helpParts.showBonusStatGroupsConfig(context))}`);
              } else {
                sendChat('!group-init --add-group', `/w "${who}" ` +
                  '<div style="padding:1px 3px;border: 1px solid #8B4513;background: #eeffee; color: #8B4513; font-size: 80%;">'+
                  'All Stat Adjustments must have a final attribute name as an argument.  Please add an attribute name after --'+args.pop()+
                  '</div>'
                );
              }
            }
            break;

          case 'stack': {
            if(!playerIsGM(msg.playerid)){
              return;
            }
            cmds.shift();
            let operation=cmds.shift(),
            showdate=function(ms){
              let ds=Math.round((_.now()-ms)/1000),
                str=[];

              if(ds>86400){
                str.push(`${Math.round(ds/86400)}d`);
                ds%=86400;
              }
              if(ds>3600){
                str.push(`${Math.round(ds/3600)}h`);
                ds%=3600;
              }

              if(ds>60){
                str.push(`${Math.round(ds/60)}m`);
                ds%=60;
              }
              str.push(`${Math.round(ds)}s`);

              return str.join(' ');
            },
            stackrecord=function(label){
              let toRaw=Campaign().get('turnorder'),
                to=JSON.parse(toRaw)||[],
                summary=_.chain(to)
                .map((o)=>{
                  return {
                    entry: o,
                    token: getObj('graphic',o.id)
                  };
                })
                .map((o)=>{
                  return {
                    img: (o.token ? o.token.get('imgsrc') : ''), 
                    name: (o.token ? o.token.get('name') : o.entry.custom), 
                    pr: o.entry.pr
                  };
                })
                .value();

              return {
                label: label || (to.length ? `{${to.length} records}`: '{empty}'),
                date: _.now(),
                summary: summary,
                turnorder: toRaw
              };
            },
            toMiniDisplay=function(summary){
              return '<div style="border: 1px solid #ccc;border-radius:.5em;padding:.5em;background-color:#eee;">'+
                _.map(summary,(sume)=>{
                  return `<div style="border-bottom: 1px solid #ccc;clear:both;"><div style="float:right;font-weight:bold;">${sume.pr}</div><img style="max-height:1.5em;float:left;" src="${sume.img}">${sume.name||'&'+'nbsp;'}</div>`;
                }).join('')+
                '</div>';
            },
            stacklist=function(){
              sendChat('', `/w "${who}" ` +
                '<div style="padding:1px 3px;border: 1px solid #8B4513;background: #eeffee; color: #8B4513; font-size: 80%;"><ol>'+
                _.map(state[scriptName].savedTurnOrders,(o)=>`<li>${o.label} [${showdate(o.date)}]${toMiniDisplay(o.summary)}</li>`).join('')+
                '</ol></div>'
              );

            };
            switch(operation){
              case 'dup':
              case 'copy':
                // take current Turn Order and put it on top.
                state[scriptName].savedTurnOrders.push(stackrecord(cmds.join(' ')));
                stacklist();
                break;

              case 'push':
                // take current Turn Order and put it on top.
                state[scriptName].savedTurnOrders.push(stackrecord(cmds.join(' ')));
                Campaign().set('turnorder','[]');
                notifyObservers('turnOrderChange',Campaign().get('turnorder'),prev);
                stacklist();
                break;

              case 'pop':
                if(state[scriptName].savedTurnOrders.length){
                  let sto=state[scriptName].savedTurnOrders.pop();
                  Campaign().set('turnorder',sto.turnorder);
                  notifyObservers('turnOrderChange',Campaign().get('turnorder'),prev);
                  stacklist();
                } else {
                  sendChat('!group-init --stack pop', `/w "${who}" ` +
                    '<div style="padding:1px 3px;border: 1px solid #8B4513;background: #eeffee; color: #8B4513; font-size: 80%;">'+
                    'No Saved Turn Orders to restore!'+
                    '</div>'
                  );
                }
                break;

              case 'apply':
                if(state[scriptName].savedTurnOrders.length){
                  let sto=state[scriptName].savedTurnOrders[0];
                  Campaign().set('turnorder',sto.turnorder);
                  notifyObservers('turnOrderChange',Campaign().get('turnorder'),prev);
                  stacklist();
                } else {
                  sendChat('!group-init --stack pop', `/w "${who}" ` +
                    '<div style="padding:1px 3px;border: 1px solid #8B4513;background: #eeffee; color: #8B4513; font-size: 80%;">'+
                    'No Saved Turn Orders to apply!'+
                    '</div>'
                  );
                }
                break;

              case 'rot':
              case 'rotate':
                if(state[scriptName].savedTurnOrders.length){
                  let sto=state[scriptName].savedTurnOrders.shift();
                  state[scriptName].savedTurnOrders.push(stackrecord(cmds.join(' ')));
                  Campaign().set('turnorder',sto.turnorder);
                  notifyObservers('turnOrderChange',Campaign().get('turnorder'),prev);
                  stacklist();
                }
                break;

              case 'rrot':
              case 'reverse-rotate':
                if(state[scriptName].savedTurnOrders.length){
                  let sto=state[scriptName].savedTurnOrders.pop();
                  state[scriptName].savedTurnOrders.unshift(stackrecord(cmds.join(' ')));
                  Campaign().set('turnorder',sto.turnorder);
                  notifyObservers('turnOrderChange',Campaign().get('turnorder'),prev);
                  stacklist();
                }
                break;

              case 'swap':
                if(state[scriptName].savedTurnOrders.length){
                  let sto=state[scriptName].savedTurnOrders.shift();
                  state[scriptName].savedTurnOrders.unshift(stackrecord(cmds.join(' ')));
                  Campaign().set('turnorder',sto.turnorder);
                  notifyObservers('turnOrderChange',Campaign().get('turnorder'),prev);
                  stacklist();
                }
                break;

              case 'tswap':
              case 'tail-swap':
                if(state[scriptName].savedTurnOrders.length){
                  let sto=state[scriptName].savedTurnOrders.pop();
                  state[scriptName].savedTurnOrders.push(stackrecord(cmds.join(' ')));
                  Campaign().set('turnorder',sto.turnorder);
                  notifyObservers('turnOrderChange',Campaign().get('turnorder'),prev);
                  stacklist();
                }
                break;

              case 'amerge':
              case 'apply-merge':
                if(state[scriptName].savedTurnOrders.length){
                  let sto=state[scriptName].savedTurnOrders[0];

                  Campaign().set('turnorder', JSON.stringify(
                    sorters[state[scriptName].config.sortOption].func(
                      _.union(
                        JSON.parse(Campaign().get('turnorder'))||[],
                        JSON.parse(sto.turnorder)||[]
                      ),
                      state[scriptName].config.preserveFirst
                    )
                  ));

                  notifyObservers('turnOrderChange',Campaign().get('turnorder'),prev);
                  stacklist();
                }
                break;

              case 'merge':
                if(state[scriptName].savedTurnOrders.length){
                  let sto=state[scriptName].savedTurnOrders.pop();

                  Campaign().set('turnorder', JSON.stringify(
                    sorters[state[scriptName].config.sortOption].func(
                      _.union(
                        JSON.parse(Campaign().get('turnorder'))||[],
                        JSON.parse(sto.turnorder)||[]
                      ),
                      state[scriptName].config.preserveFirst
                    )
                  ));

                  notifyObservers('turnOrderChange',Campaign().get('turnorder'),prev);
                  stacklist();
                }
                break;

              case 'clear':
                state[scriptName].savedTurnOrders=[];
                break;

              default:
              case 'list':
                stacklist();
                break;
            }
          }
            break;

          case 'promote':
            if(!playerIsGM(msg.playerid)){
              return;
            }
            cmds[1]=Math.max(parseInt(cmds[1],10),1);
            if(state[scriptName].bonusStatGroups.length >= cmds[1]) {
              if(1 !== cmds[1]) {
                workvar=state[scriptName].bonusStatGroups[cmds[1]-1];
                state[scriptName].bonusStatGroups[cmds[1]-1] = state[scriptName].bonusStatGroups[cmds[1]-2];
                state[scriptName].bonusStatGroups[cmds[1]-2] = workvar;
              }

              sendChat(scriptName, `/w "${who}" ${_h.outer(helpParts.showBonusStatGroupsConfig(context))}`);
            } else {
              sendChat('!group-init --promote', `/w "${who}" ` +
                '<div style="padding:1px 3px;border: 1px solid #8B4513;background: #eeffee; color: #8B4513; font-size: 80%;">'+
                'Please specify one of the following by number:'+
                _h.outer(helpParts.showBonusStatGroupsConfig(context)) +
                '</div>'
              );
            }
            break;

          case 'del-group':
            if(!playerIsGM(msg.playerid)){
              return;
            }
            cmds[1]=Math.max(parseInt(cmds[1],10),1);
            if(state[scriptName].bonusStatGroups.length >= cmds[1]) {
              state[scriptName].bonusStatGroups=_.filter(state[scriptName].bonusStatGroups, function(v,k){
                return (k !== (cmds[1]-1));
              });

              sendChat(scriptName, `/w "${who}" ${_h.outer(helpParts.showBonusStatGroupsConfig(context))}`);
            } else {
              sendChat('!group-init --del-group', `/w "${who}" ` +
                '<div style="padding:1px 3px;bhttps://raytheon.benefitcenter.com/v3/client_docs/en_us/rth/HealthAdvocate_Top_Ten_Reasons.pdforder: 1px solid #8B4513;background: #eeffee; color: #8B4513; font-size: 80%;">'+
                'Please specify one of the following by number:'+
                _h.outer(helpParts.showBonusStatGroupsConfig(context)) +
                '</div>'
              );
            }
            break;

          case 'toggle-turnorder':
            if(!playerIsGM(msg.playerid)){
              return;
            }
            if(false !== Campaign().get('initiativepage') ){
              Campaign().set({
                initiativepage: false
              });
            } else {
              let player = (getObj('player',msg.playerid)||{get: ()=>true});
              let pid = player.get('_lastpage');
              if(!pid){
                pid = Campaign().get('playerpageid');
              }
              Campaign().set({
                initiativepage: pid
              });
            }
            break;

          case 'reroll':
            isReroll=true;
            if(cmds[1] && cmds[1].match(/^[-+]?\d+(\.\d+)?$/)){
              manualBonus=parseFloat(cmds[1])||0;
            }

            ids = JSON.parse(Campaign().get('turnorder')||'[]')
              .filter(e=> '-1' !== e.id)
              .map(e=>e.id);

            cont=true;
            break;

          case 'sort':
              if(!playerIsGM(msg.playerid)){
                return;
              }
            Campaign().set('turnorder', JSON.stringify(
              sorters[state[scriptName].config.sortOption].func(
                JSON.parse(Campaign().get('turnorder'))||[],
                false
              )
            ));
            notifyObservers('turnOrderChange',Campaign().get('turnorder'),prev);

            break;

          case 'adjust':
              if(!playerIsGM(msg.playerid)){
                return;
              }
            if(cmds[1] && cmds[1].match(/^[-+]?\d+(\.\d+)?$/)){
              manualBonus=parseFloat(cmds[1]);
              manualBonusMin=parseFloat(cmds[2]);
              manualBonusMin=_.isNaN(manualBonusMin)?-10000:manualBonusMin;

              Campaign().set({
                turnorder: JSON.stringify(
                  _.map(JSON.parse(Campaign().get('turnorder'))||[], function(e){
                    if('-1' !== e.id){
                      e.pr=Math.max((_.isNaN(parseFloat(e.pr))?0:parseFloat(e.pr))+manualBonus,manualBonusMin).toFixed(state[scriptName].config.maxDecimal);
                    }
                    return e;
                  })
                )
              });
              notifyObservers('turnOrderChange',Campaign().get('turnorder'),prev);
            } else {
              sendChat(scriptName,  `/w "${who}" ` +
                '<div style="padding:1px 3px;border: 1px solid #8B4513;background: #eeffee; color: #8B4513; font-size: 80%;">'+
                'Not a valid adjustment: <b>'+cmds[1]+'</b>'+
                '</div>'
              );
            }
            break;

          case 'adjust-current':
              if(!playerIsGM(msg.playerid)){
                return;
              }
            if(cmds[1] && cmds[1].match(/^[-+]?\d+(\.\d+)?$/)){
              manualBonus=parseFloat(cmds[1]);
              manualBonusMin=parseFloat(cmds[2]);
              manualBonusMin=_.isNaN(manualBonusMin)?-10000:manualBonusMin;

              Campaign().set({
                turnorder: JSON.stringify(
                  _.map(JSON.parse(Campaign().get('turnorder'))||[], function(e,idx){
                    if(0===idx && '-1' !== e.id){
                      e.pr=Math.max((_.isNaN(parseFloat(e.pr))?0:parseFloat(e.pr))+manualBonus,manualBonusMin).toFixed(state[scriptName].config.maxDecimal);
                    }
                    return e;
                  })
                )
              });
              notifyObservers('turnOrderChange',Campaign().get('turnorder'),prev);
            } else {
              sendChat(scriptName, `/w "${who}" ` +
                '<div style="padding:1px 3px;border: 1px solid #8B4513;background: #eeffee; color: #8B4513; font-size: 80%;">'+
                'Not a valid adjustment: <b>'+cmds[1]+'</b>'+
                '</div>'
              );
            }
            break;


          case 'clear':
              if(!playerIsGM(msg.playerid)){
                return;
              }
            Campaign().set({
              turnorder: '[]',
              initiativepage: (state[scriptName].config.autoOpenInit ? false : Campaign().get('initiativepage'))
            });
            notifyObservers('turnOrderChange',Campaign().get('turnorder'),prev);
            break;

          case 'bonus':
              if(cmds[1] && cmds[1].match(/^[-+]?\d+(\.\d+)?$/)){
                manualBonus=parseFloat(cmds[1]);
                cont=true;
              } else {
                sendChat(scriptName, `/w "${who}" ` +
                  '<div style="padding:1px 3px;border: 1px solid #8B4513;background: #eeffee; color: #8B4513; font-size: 80%;">'+
                  'Not a valid bonus: <b>'+cmds[1]+'</b>'+
                  '</div>'
                );
              }
            break;

          default:
              if(!playerIsGM(msg.playerid)){
                return;
              }
            sendChat(scriptName, `/w "${who}" ` +
              '<div style="padding:1px 3px;border: 1px solid #8B4513;background: #eeffee; color: #8B4513; font-size: 80%;">'+
              'Not a valid command: <b>'+cmds[0]+'</b>'+
              '</div>'
            );
            break;
        }
      } else {
        cont=true;
      }

      if(cont) {
        if(ids.length) {
          await makeRollsForIDs(ids,{isReroll,manualBonus,prev});
        } else {
          showHelp(msg.playerid);
        }
      }
      break;

    case '!group-init-config':
      if(!playerIsGM(msg.playerid)){
        return;
      }
      if(_.contains(args,'--help')) {
        showHelp(msg.playerid);
        return;
      }
      if(!args.length) {
        sendChat('',`/w "${who}" ${helpParts.helpConfig(context)}`);
        return;
      }
      _.each(args,function(a){
        let opt=a.split(/\|/),
          omsg='';
        switch(opt.shift()) {
          case 'apply-standard-config':
            if(standardConfigs[opt[0]]) {
              standardConfigs[opt[0]].func();
              sendChat('',`/w "${who}" `+
                '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
                `Now configured for <b>${standardConfigs[opt[0]].title}</b>`+
                '</div>'
              );
            } else {
              sendChat('',`/w "${who}" `+
                '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
                '<div><b>Error:</b> Not a valid standard Config: '+opt[0]+'</div>'+
                helpParts.showStandardConfigOptions(context)+
                '</div>'
              );
            }

            break;

          case 'sort-option':
            if(sorters[opt[0]]) {
              state[scriptName].config.sortOption=opt[0];
            } else {
              omsg='<div><b>Error:</b> Not a valid sort method: '+opt[0]+'</div>';
            }
            sendChat('',`/w "${who}" `+
              '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
              omsg+
              helpParts.sortOptionsConfig(context)+
              '</div>'
            );
            break;

          case 'set-die-size':
            if(opt[0].match(/^\d+$/)) {
              state[scriptName].config.dieSize=parseInt(opt[0],10);
            } else {
              omsg='<div><b>Error:</b> Not a die size: '+opt[0]+'</div>';
            }
            sendChat('',`/w "${who}" `+
              '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
              omsg+
              helpParts.dieSizeConfig(context)+
              '</div>'
            );
            break;

          case 'set-max-decimal':
            if(opt[0].match(/^\d+$/)) {
              state[scriptName].config.maxDecimal=parseInt(opt[0],10);
            } else {
              omsg='<div><b>Error:</b> Not a valid decimal count: '+opt[0]+'</div>';
            }
            sendChat('',`/w "${who}" `+
              '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
              omsg+
              helpParts.maxDecimalConfig(context)+
              '</div>'
            );
            break;


          case 'set-dice-count':
            if(opt[0].match(/^\d+$/)) {
              state[scriptName].config.diceCount=parseInt(opt[0],10);
            } else {
              omsg='<div><b>Error:</b> Not a valid dice count: '+opt[0]+'</div>';
            }
            sendChat('',`/w "${who}" `+
              '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
              omsg+
              helpParts.diceCountConfig(context)+
              '</div>'
            );
            break;

          case 'set-dice-count-attribute':
            if(opt[0]) {
              state[scriptName].config.diceCountAttribute=opt[0];
            } else {
              state[scriptName].config.diceCountAttribute='';
              omsg='<div>Cleared Dice Count Attribute.</div>';
            }
            sendChat('',`/w "${who}" `+
              '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
              omsg+
              helpParts.diceCountAttributeConfig(context)+
              '</div>'
            );
            break;

          case 'set-dice-mod':
            if(opt[0]) {
              state[scriptName].config.diceMod=opt[0];
            } else {
              state[scriptName].config.diceMod='';
              omsg='<div>Cleared Dice Modifiers.</div>';
            }
            sendChat('',`/w "${who}" `+
              '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
              omsg+
              helpParts.diceModConfig(context)+
              '</div>'
            );
            break;

          case 'toggle-auto-open-init':
            state[scriptName].config.autoOpenInit = !state[scriptName].config.autoOpenInit;
            sendChat('',`/w "${who}" `+
              '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
              helpParts.autoOpenInitConfig(context)+
              '</div>'
            );
            break;

          case 'toggle-replace-roll':
            state[scriptName].config.replaceRoll = !state[scriptName].config.replaceRoll;
            sendChat('',`/w "${who}" `+
              '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
              helpParts.replaceRollConfig(context)+
              '</div>'
            );
            break;

          case 'toggle-preserve-first':
            state[scriptName].config.preserveFirst = !state[scriptName].config.preserveFirst;
            sendChat('',`/w "${who}" `+
              '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
              helpParts.preserveFirstConfig(context)+
              '</div>'
            );
            break;

          case 'toggle-check-for-no-config':
            state[scriptName].config.checkForNoConfig = !state[scriptName].config.checkForNoConfig;
            sendChat('',`/w "${who}" `+
              '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
              helpParts.checkForNoConfigConfig(context)+
              '</div>'
            );
            break;

          case 'set-announcer':
            if(announcers[opt[0]]) {
              state[scriptName].config.announcer=opt[0];
            } else {
              omsg='<div><b>Error:</b> Not a valid announcer: '+opt[0]+'</div>';
            }
            sendChat('',`/w "${who}" `+
              '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
              omsg+
              helpParts.announcerConfig(context)+
              '</div>'
            );
            break;

          case 'set-roller':
            if(rollers[opt[0]]) {
              state[scriptName].config.rollType=opt[0];
            } else {
              omsg='<div><b>Error:</b> Not a valid roller: '+opt[0]+'</div>';
            }
            sendChat('',`/w "${who}" `+
              '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
              omsg+
              helpParts.rollerConfig(context)+
              '</div>'
            );
            break;

          default:
            sendChat('',`/w "${who}" `+
              '<div><b>Unsupported Option:</div> '+a+'</div>'
            );
        }

      });

      break;
  }

};


const registerEventHandlers = function() {
  on('chat:message', handleInput);
};

on("ready",() => {
  checkInstall();
  registerEventHandlers();
});

return {
  ObserveTurnOrderChange: observeTurnOrderChange,
  RollForTokenIDs: rollForTokenIDsExternal
};

})();


{try{throw new Error('');}catch(e){API_Meta.GroupInitiative.lineCount=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-API_Meta.GroupInitiative.offset);}}
/*
================================================================
END SCRIPT: Group Initiative
================================================================
*/

/*
================================================================
BEGIN SCRIPT: TokenMod
SOURCE FILE: TokenMod.md
================================================================
*/
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
/*
================================================================
END SCRIPT: TokenMod
================================================================
*/
