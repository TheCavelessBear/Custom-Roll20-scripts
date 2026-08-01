/*
================================================================
ROLL20 SCRIPT BATCH 2
TABLE OF CONTENTS
Line 20 - TurnMarker1
Line 906 - VectorMath
Line 1455 - ZeroFrame
Line 2835 - Messenger
Line 3508 - MetaScriptToolbox
Line 3754 - Muler
Line 4407 - PathMath
Line 6076 - Plugger
Line 6765 - SelectManager
Line 7917 - SimpleSound
================================================================
*/

/*
================================================================
BEGIN SCRIPT: TurnMarker1
SOURCE FILE: TurnMarker1.md
================================================================
*/
// Github:   https://github.com/shdwjk/Roll20API/blob/master/TurnMarker1/TurnMarker1.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

/* global GroupInitiative:false Mark:false */
/*  ############################################################### */
/*  TurnMarker */
/*  ############################################################### */

var TurnMarker = TurnMarker || (function(){
    "use strict";
    
    var version = '1.3.12',
        lastUpdate = 1643855734,
        schemaVersion = 1.18,
        active = false,
        threadSync = 1,
        autoPullOptions = {
            'none' : 'None',
            'npcs' : 'NPCs',
            'all'  : 'All'
        },

    sendPlayerPing = (left, top, pageid, playerid) => {
        sendPing(left,top,pageid,null,true,[playerid]);
    },

    getGMPlayers = (pageid) => findObjs({type:'player'})
        .filter((p)=>playerIsGM(p.id))
        .filter((p)=>undefined === pageid || p.get('lastpage') === pageid)
        .map(p=>p.id)
    ,

    sendGMPing = (left, top, pageid, playerid=null, moveAll=false) => {
        let players = getGMPlayers(pageid);
        if(players.length){
            sendPing(left,top,pageid,playerid,moveAll,players);
        }
    },

    checkInstall = function() {    
        log('-=> TurnMarker v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

        if( ! state.hasOwnProperty('TurnMarker') || state.TurnMarker.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
            switch(state.TurnMarker && state.TurnMarker.version) {
                case 1.16:
                    state.TurnMarker.autoPull = 'none';
                    /* falls through */

                case 'UpdateSchemaVersion':
                    state.TurnMarker.version = schemaVersion;
                    break;

                default:
                    state.TurnMarker = {
                        version: schemaVersion,
                        announceRounds: true,
                        announceTurnChange: true,
                        announcePlayerInTurnAnnounce: true,
                        announcePlayerInTurnAnnounceSize: '100%',
                        autoPull: 'none',
                        autoskipHidden: true,
                        tokenName: 'Round',
                        tokenURL: 'https://s3.amazonaws.com/files.d20.io/images/4095816/086YSl3v0Kz3SlDAu245Vg/thumb.png?1400535580',
                        playAnimations: false,
                        rotation: false,
                        animationSpeed: 5,
                        scale: 1.7,
                        aura1: {
                            pulse: false,
                            size: 5,
                            color: '#ff00ff'
                        },
                        aura2: {
                            pulse: false,
                            size: 5,
                            color: '#00ff00'
                        }
                    };
                    break;
            }
        }
        if(Campaign().get('turnorder') ==='') {
            Campaign().set('turnorder','[]');
        }
        if('undefined' !== typeof GroupInitiative && GroupInitiative.ObserveTurnOrderChange){
            GroupInitiative.ObserveTurnOrderChange(handleExternalTurnOrderChange);
        }
    },

    showHelp = function(who) {
        var marker = getMarker();
        var rounds =parseInt(marker.get('bar2_value'),10);
        sendChat('',
            '/w "'+who+'" '+
'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
    '<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'+
        'TurnMarker v'+version+
    '</div>'+
    '<b>Commands</b>'+
    '<div style="padding-left:10px;"><b><span style="font-family: serif;">!tm</span></b>'+
        '<div style="padding-left: 10px;padding-right:20px">'+
            'The following arguments may be supplied in order to change the configuration.  All changes are persisted between script restarts.'+
            '<ul>'+
                    '<div style="float:right;width:40px;border:1px solid black;background-color:#ffc;text-align:center;"><span style="color: blue; font-weight:bold; padding: 0px 4px;">'+rounds+'</span></div>'+
                '<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;"><b><span style="font-family: serif;">reset &lbrack;#&rbrack;</span></b> -- Sets the round counter back to 0 or the supplied #.</li> '+
                    '<div style="float:right;width:40px;border:1px solid black;background-color:#ffc;text-align:center;"><span style="color: blue; font-weight:bold; padding: 0px 4px;">'+autoPullOptions[state.TurnMarker.autoPull]+'</span></div>'+
                '<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;"><b><span style="font-family: serif;">autopull &lt;mode&gt;</span></b> -- Sets auto pulling to the token whose turn it is.  Modes: '+_.keys(autoPullOptions)+'</li> '+
                    '<div style="float:right;width:40px;border:1px solid black;background-color:#ffc;text-align:center;">'+( state.TurnMarker.announceRounds ? '<span style="color: red; font-weight:bold; padding: 0px 4px;">ON</span>' : '<span style="color: #999999; font-weight:bold; padding: 0px 4px;">OFF</span>' )+'</div>'+
                '<li style="border-bottom: 1px solid #ccc;"><b><span style="font-family: serif;">toggle-announce</span></b> -- When on, each round will be announced to chat.</li>'+
                    '<div style="float:right;width:40px;border:1px solid black;background-color:#ffc;text-align:center;">'+( state.TurnMarker.announceTurnChange ? '<span style="color: red; font-weight:bold; padding: 0px 4px;">ON</span>' : '<span style="color: #999999; font-weight:bold; padding: 0px 4px;">OFF</span>' )+'</div>'+
                '<li style="border-bottom: 1px solid #ccc;"><b><span style="font-family: serif;">toggle-announce-turn</span></b> -- When on, the transition between visible turns will be announced.</li> '+
                    '<div style="float:right;width:40px;border:1px solid black;background-color:#ffc;text-align:center;">'+( state.TurnMarker.announcePlayerInTurnAnnounce ? '<span style="color: red; font-weight:bold; padding: 0px 4px;">ON</span>' : '<span style="color: #999999; font-weight:bold; padding: 0px 4px;">OFF</span>' )+'</div>'+
                '<li style="border-bottom: 1px solid #ccc;"><b><span style="font-family: serif;">toggle-announce-player</span></b> -- When on, the player(s) controlling the current turn are included in the turn announcement.</li> '+
                    '<div style="float:right;width:40px;border:1px solid black;background-color:#ffc;text-align:center;">'+( state.TurnMarker.autoskipHidden ? '<span style="color: red; font-weight:bold; padding: 0px 4px;">ON</span>' : '<span style="color: #999999; font-weight:bold; padding: 0px 4px;">OFF</span>' )+'</div>'+
                '<li style="border-bottom: 1px solid #ccc;"><b><span style="font-family: serif;">toggle-skip-hidden</span></b> -- When on, turn order will automatically be advanced past any hidden turns.</li> '+
                    '<div style="float:right;width:40px;border:1px solid black;background-color:#ffc;text-align:center;">'+( state.TurnMarker.playAnimations ? '<span style="color: red; font-weight:bold; padding: 0px 4px;">ON</span>' : '<span style="color: #999999; font-weight:bold; padding: 0px 4px;">OFF</span>' )+'</div>'+
                '<li style="border-bottom: 1px solid #ccc;"><b><span style="font-family: serif;">toggle-animations</span></b> -- Turns on turn marker animations. [Experimental!]</li> '+
                    '<div style="float:right;width:40px;border:1px solid black;background-color:#ffc;text-align:center;">'+( state.TurnMarker.rotation ? '<span style="color: red; font-weight:bold; padding: 0px 4px;">ON</span>' : '<span style="color: #999999; font-weight:bold; padding: 0px 4px;">OFF</span>' )+'</div>'+
                '<li style="border-bottom: 1px solid #ccc;"><b><span style="font-family: serif;">toggle-rotate</span></b> -- When on, the turn marker will rotate slowly clockwise. [Animation]</li> '+
                    '<div style="float:right;width:40px;border:1px solid black;background-color:#ffc;text-align:center;">'+( state.TurnMarker.aura1.pulse ? '<span style="color: red; font-weight:bold; padding: 0px 4px;">ON</span>' : '<span style="color: #999999; font-weight:bold; padding: 0px 4px;">OFF</span>' )+'</div>'+
                '<li style="border-bottom: 1px solid #ccc;"><b><span style="font-family: serif;">toggle-aura-1</span></b> -- When on, aura 1 will pulse in and out. [Animation]</li> '+
                    '<div style="float:right;width:40px;border:1px solid black;background-color:#ffc;text-align:center;">'+( state.TurnMarker.aura2.pulse ? '<span style="color: red; font-weight:bold; padding: 0px 4px;">ON</span>' : '<span style="color: #999999; font-weight:bold; padding: 0px 4px;">OFF</span>' )+'</div>'+
                '<li style="border-bottom: 1px solid #ccc;"><b><span style="font-family: serif;">toggle-aura-2</span></b> -- When on, aura 2 will pulse in and out. [Animation]</li> '+
            '</ul>'+
        '</div>'+
    '</div>'+
    '<div style="padding-left:10px;"><b><span style="font-family: serif;">!eot</span></b>'+
        '<div style="padding-left: 10px;padding-right:20px;">'+
            'Players may execute this command to advance the initiative to the next turn.  This only succeeds if the current token is one that the caller controls or if it is executed by a GM.'+
        '</div>'+
    '</div>'+
    '<div style="padding-left:10px;"><b><span style="font-family: serif;">!pot</span></b>'+
        '<div style="padding-left: 10px;padding-right:20px;">'+
            'Players may execute this command to back up the initiative to the previous turn.  This only succeeds if the current token is one that the caller controls or if it is executed by a GM.'+
        '</div>'+
    '</div>'+
'</div>'
            );
    },

    handleInput = function(msg){
        var who, tokenized, command;

        if (msg.type !== "api") {
            return;
        }

        who=(getObj('player',msg.playerid)||{get:()=>'API'}).get('_displayname');
        tokenized = msg.content.split(/\s+/);
        command = tokenized[0];

        switch(command) {
            case "!tm":
            case "!turnmarker": {
                    let tokens=_.rest(tokenized),marker,value;
                    switch (tokens[0]) {
                        case 'reset':
                            if(!playerIsGM(msg.playerid)){
                                return;
                            }
                            marker = getMarker();
                            value = parseInt(tokens[1],10)||0;
                            marker.set({
                                name: state.TurnMarker.tokenName+' '+value,
                                bar2_value: value
                            });
                            sendChat('','/w "'+who+'" <b>Round</b> count is reset to <b>'+value+'</b>.');
                            break;

                        case 'ping-target':
                            var obj=getObj('graphic',tokens[1]);
                            if(obj){
    const playerCanControl = (obj, playerid='any') => {
        const playerInControlledByList = (list, playerid) => list.includes('all') || list.includes(playerid) || ('any'===playerid && list.length);
        let players = obj.get('controlledby')
            .split(/,/)
            .filter(s=>s.length);

        if(playerInControlledByList(players,playerid)){
            return true;
        }

        if('' !== obj.get('represents') ) {
            players = (getObj('character',obj.get('represents')) || {get: function(){return '';} } )
                .get('controlledby').split(/,/)
                .filter(s=>s.length);
            return  playerInControlledByList(players,playerid);
        }
        return false;
    };

                              if(playerIsGM(msg.playerid)){
                                sendGMPing(obj.get('left'),obj.get('top'),obj.get('pageid'),null,true);
                              } else if(playerCanControl(obj)){
                                sendPlayerPing(obj.get('left'),obj.get('top'),obj.get('pageid'),msg.playerid);
                              }
                            }
                            break;

                        case 'autopull':
                            if(!playerIsGM(msg.playerid)){
                                return;
                            }
                            if(_.contains(_.keys(autoPullOptions), tokens[1])){
                                state.TurnMarker.autoPull=tokens[1];
                                sendChat('','/w "'+who+'" <b>AutoPull</b> is now <b>'+(autoPullOptions[state.TurnMarker.autoPull])+'</b>.');
                            } else {
                                sendChat('','/w "'+who+'" "'+tokens[1]+'" is not a valid <b>AutoPull</b> options.  Please specify one of: '+_.keys(autoPullOptions).join(', ')+'</b>.');
                            }
                            break;

                        case 'toggle-announce':
                            if(!playerIsGM(msg.playerid)){
                                return;
                            }
                            state.TurnMarker.announceRounds=!state.TurnMarker.announceRounds;
                            sendChat('','/w "'+who+'" <b>Announce Rounds</b> is now <b>'+(state.TurnMarker.announceRounds ? 'ON':'OFF' )+'</b>.');
                            break;

                        case 'toggle-announce-turn':
                            if(!playerIsGM(msg.playerid)){
                                return;
                            }
                            state.TurnMarker.announceTurnChange=!state.TurnMarker.announceTurnChange;
                            sendChat('','/w "'+who+'" <b>Announce Turn Changes</b> is now <b>'+(state.TurnMarker.announceTurnChange ? 'ON':'OFF' )+'</b>.');
                            break;

                        case 'toggle-announce-player':
                            if(!playerIsGM(msg.playerid)){
                                return;
                            }
                            state.TurnMarker.announcePlayerInTurnAnnounce=!state.TurnMarker.announcePlayerInTurnAnnounce;
                            sendChat('','/w "'+who+'" <b>Player Name in Announce</b> is now <b>'+(state.TurnMarker.announcePlayerInTurnAnnounce ? 'ON':'OFF' )+'</b>.');
                            break;

                        case 'toggle-skip-hidden':
                            if(!playerIsGM(msg.playerid)){
                                return;
                            }
                            state.TurnMarker.autoskipHidden=!state.TurnMarker.autoskipHidden;
                            sendChat('','/w "'+who+'" <b>Auto-skip Hidden</b> is now <b>'+(state.TurnMarker.autoskipHidden ? 'ON':'OFF' )+'</b>.');
                            break;

                        case 'toggle-animations':
                            if(!playerIsGM(msg.playerid)){
                                return;
                            }
                            state.TurnMarker.playAnimations=!state.TurnMarker.playAnimations;
                            if(state.TurnMarker.playAnimations) {
                                stepAnimation(threadSync);
                            } else {
                                marker = getMarker();
                                marker.set({
                                    aura1_radius: '',
                                    aura2_radius: ''
                                });
                            }

                            sendChat('','/w "'+who+'" <b>Animations</b> are now <b>'+(state.TurnMarker.playAnimations ? 'ON':'OFF' )+'</b>.');
                            break;

                        case 'toggle-rotate':
                            if(!playerIsGM(msg.playerid)){
                                return;
                            }
                            state.TurnMarker.rotation=!state.TurnMarker.rotation;
                            sendChat('','/w "'+who+'" <b>Rotation</b> is now <b>'+(state.TurnMarker.rotation ? 'ON':'OFF' )+'</b>.');
                            break;

                        case 'toggle-aura-1':
                            if(!playerIsGM(msg.playerid)){
                                return;
                            }
                            state.TurnMarker.aura1.pulse=!state.TurnMarker.aura1.pulse;
                            sendChat('','/w "'+who+'" <b>Aura 1</b> is now <b>'+(state.TurnMarker.aura1.pulse ? 'ON':'OFF' )+'</b>.');
                            break;

                        case 'toggle-aura-2':
                            if(!playerIsGM(msg.playerid)){
                                return;
                            }
                            state.TurnMarker.aura2.pulse=!state.TurnMarker.aura2.pulse;
                            sendChat('','/w "'+who+'" <b>Aura 2</b> is now <b>'+(state.TurnMarker.aura2.pulse ? 'ON':'OFF' )+'</b>.');
                            break;

                        default:
                        case 'help':
                            if(!playerIsGM(msg.playerid)){
                                return;
                            }
                            showHelp(who);
                            break;

                    }
                }
                break;

            case "!eot":
                requestTurnAdvancement(msg.playerid);   
                break;
            case "!pot":
                requestTurnRetreat(msg.playerid);   
                break;
        }
    },

    getMarker = function(){  
        var marker = findObjs({
            imgsrc: state.TurnMarker.tokenURL,
            pageid: Campaign().get("playerpageid")    
        })[0];

        if (marker === undefined) {
            marker = createObj('graphic', {
                name: state.TurnMarker.tokenName+' 0',
                pageid: Campaign().get("playerpageid"),
                layer: 'gmlayer',
                imgsrc: state.TurnMarker.tokenURL,
                left: 0,
                top: 0,
                lastmove:'0,0',
                height: 70,
                width: 70,
                bar2_value: 0,
                showplayers_name: true,
                showplayers_aura1: true,
                showplayers_aura2: true
            });
        }
        if(!TurnOrder.HasTurn(marker.id)) {
            TurnOrder.AddTurn({
                id: marker.id,
                pr: -1,
                custom: "",
                _pageid: marker.get('pageid')
            });
        }
        return marker;    
    },

    stepAnimation = function( sync ){
        if (!state.TurnMarker.playAnimations || sync !== threadSync) {
            return;
        }
        var marker=getMarker();
        if(active === true) {
            var rotation=(marker.get('bar1_value')+state.TurnMarker.animationSpeed)%360;
            marker.set('bar1_value', rotation );
            if(state.TurnMarker.rotation) {
                marker.set( 'rotation', rotation );
            }
            if( state.TurnMarker.aura1.pulse ) {
                marker.set('aura1_radius', Math.abs(Math.sin(rotation * (Math.PI/180))) * state.TurnMarker.aura1.size );
            } else {
                marker.set('aura1_radius','');
            }
            if( state.TurnMarker.aura2.pulse  ) {
                marker.set('aura2_radius', Math.abs(Math.cos(rotation * (Math.PI/180))) * state.TurnMarker.aura2.size );
            } else {
                marker.set('aura2_radius','');
            }
            setTimeout(_.bind(stepAnimation,this,sync), 100);
        }
    },
    checkForTokenMove = function(obj){
        var turnOrder, current, marker;
        if(active) {
            turnOrder = TurnOrder.Get();
            current = _.first(turnOrder);
            if( obj && current && current.id === obj.id) {
               threadSync++;
                
                marker = getMarker();
                marker.set({
                    lastmove: obj.get('lastmove'),
                    layer: obj.get("layer"),
                    top: obj.get("top"),
                    left: obj.get("left")
                });
                
               setTimeout(_.bind(stepAnimation,this,threadSync), 300);
            }
        }
    },
    requestTurnRetreat = function(playerid){
        if(active) {
            let turnOrder = TurnOrder.Get();
            let previous = getObj('graphic', (((turnOrder||[]).pop())||{}).id );
            let character = getObj('character',(previous && previous.get('represents')));
            if(playerIsGM(playerid) ||
                ( previous &&
                       ( _.contains(previous.get('controlledby').split(','),playerid) ||
                       _.contains(previous.get('controlledby').split(','),'all') )
                    ) ||
                ( character &&
                       ( _.contains(character.get('controlledby').split(','),playerid) ||
                       _.contains(character.get('controlledby').split(','),'all') )
                    )
                )
            {
                TurnOrder.Prev();
                turnOrderChange(true,true);
            }
        }
    },
    requestTurnAdvancement = function(playerid){
        if(active) {
            let turnOrder = TurnOrder.Get();
            let current = getObj('graphic', (((turnOrder||[]).shift())||{}).id );
            let character = getObj('character',(current && current.get('represents')));
            if(playerIsGM(playerid) ||
                ( current &&
                       ( _.contains(current.get('controlledby').split(','),playerid) ||
                       _.contains(current.get('controlledby').split(','),'all') )
                    ) ||
                ( character &&
                       ( _.contains(character.get('controlledby').split(','),playerid) ||
                       _.contains(character.get('controlledby').split(','),'all') )
                    )
                )
            {
                TurnOrder.Next();
                turnOrderChange(true);
            }
        }
    },
    announceRound = function(round){
        if(state.TurnMarker.announceRounds) {
            sendChat(
                '', 
                "/direct "+
                "<div style='"+
                    'background-color: #4B0082;'+
                    'border: 3px solid #808080;'+
                    'font-size: 20px;'+
                    'text-align:center;'+
                    'vertical-align: top;'+
                    'color: white;'+
                    'font-weight:bold;'+
                    'padding: 5px 5px;'+
                "'>"+
                    "<img src='"+state.TurnMarker.tokenURL+"' style='width:20px; height:20px; padding: 0px 5px;' />"+
                    "Round "+ round +
                    "<img src='"+state.TurnMarker.tokenURL+"' style='width:20px; height:20px; padding: 0px 5px;' />"+
                "</div>"+
                '<a style="position:relative;z-index:10000; top:-1em; float: right;font-size: .6em; color: white; border: 1px solid #cccccc; border-radius: 1em; margin: 0 .1em; font-weight: bold; padding: .1em .4em;" href="!tm reset ?{Round number|0}">Reset &'+'#x21ba;</a>'
            );
        }
    },

    turnOrderChange = function(FirstTurnChanged,backwards=false){
        var marker = getMarker();
                    
        if( !Campaign().get('initiativepage') ) {
            return;
        }
        
        var turnOrder = TurnOrder.Get();
        
        if (!turnOrder.length) {
            return;
        }

        var current = _.first(turnOrder);

        if(state.TurnMarker.playAnimations) {
            threadSync++;
            setTimeout(_.bind(stepAnimation,this,threadSync), 300);
        }
        
        if (current.id === "-1") {
            return;
        }
      
        handleMarkerTurn(backwards);

        if(state.TurnMarker.autoskipHidden) {
            TurnOrder.NextVisible();
            handleMarkerTurn(backwards);
        }

        turnOrder=TurnOrder.Get();

        if(turnOrder[0].id === marker.id) {
            return;
        }

        current = _.first(TurnOrder.Get());
        
        var currentToken = getObj("graphic", turnOrder[0].id),
            currentChar = getObj('character', (currentToken||{get:_.noop}).get('represents'));
        if(currentToken) {

            if(FirstTurnChanged) {
                handleAnnounceTurnChange();
            }
            
            var size = Math.max(currentToken.get("height"),currentToken.get("width")) * state.TurnMarker.scale;
              
            if (marker.get("layer") === "gmlayer" && currentToken.get("layer") !== "gmlayer") {
                marker.set({
                    lastmove:`${marker.get('left')},${marker.get('top')}`,
                    top: currentToken.get("top"),
                    left: currentToken.get("left"),
                    height: size,
                    width: size
                });
                setTimeout(function() {
                    marker.set({
                        "layer": currentToken.get("layer")
                    });    
                }, 500);
            } else {
                marker.set({
                    lastmove:`${marker.get('left')},${marker.get('top')}`,
                    layer: currentToken.get("layer"),
                    top: currentToken.get("top"),
                    left: currentToken.get("left"),
                    height: size,
                    width: size
                });   
            }
            toFront(currentToken);

            if( 'all' === state.TurnMarker.autoPull ||
                ('npcs' === state.TurnMarker.autoPull && (
                    '' === currentToken.get('controlledby') &&
                    ( !currentChar || '' === currentChar.get('controlledby'))
                ))
            ){
                sendGMPing(currentToken.get('left'),currentToken.get('top'),currentToken.get('pageid'),null,true);
            }
        }
    },

    handleDestroyGraphic = function(obj){
        if(TurnOrder.HasTurn(obj.id)){
            let prev=JSON.parse(JSON.stringify(Campaign()));
            TurnOrder.RemoveTurn(obj.id);
            handleTurnOrderChange(Campaign(),prev);
        }
    },

    handleTurnOrderChange = function(obj, prev) {
        var prevOrder=JSON.parse(prev.turnorder||'[]');
        var objOrder=JSON.parse(obj.get('turnorder')||'[]');

        if( _.isArray(prevOrder) &&
            _.isArray(objOrder) &&
            prevOrder.length &&
            objOrder.length &&
            objOrder[0].id !== prevOrder[0].id
          ) {
            turnOrderChange(true);
        }
    },

    handleExternalTurnOrderChange = function() {
        var marker = getMarker(),
            turnorder = Campaign().get('turnorder'),
            markerTurn;

        turnorder = ('' === turnorder) ? [] : JSON.parse(turnorder);
        markerTurn = _.filter(turnorder, function(i){
            return marker.id === i.id;
        })[0];

        if(markerTurn.pr !== -1){
            markerTurn.pr = -1;
            turnorder =_.union([markerTurn], _.reject(turnorder, function(i){
                return marker.id === i.id || (getObj('graphic',i.id)||{get:_.noop}).get('imgsrc')===state.TurnMarker.tokenURL;
            }));
            Campaign().set('turnorder',JSON.stringify(turnorder));
        }
        _.defer(dispatchInitiativePage);
    },

    handleMarkerTurn = function(backwards = false){
        var marker = getMarker(),
            turnOrder = TurnOrder.Get(),
            round;

        if(turnOrder[0].id === marker.id) {
            round=(parseInt(marker.get('bar2_value'))||0)+ (backwards ? -1 : 1);
            marker.set({
                name: state.TurnMarker.tokenName+' '+round,
                bar2_value: round
            });
            announceRound(round);
            if(backwards) {
                TurnOrder.Prev();
            } else {
                TurnOrder.Next();
            }
        }
    },
    handleAnnounceTurnChange = function(){

        if(state.TurnMarker.announceTurnChange ) {
            var marker = getMarker();
            var turnOrder = TurnOrder.Get();
            var currentToken = getObj("graphic", turnOrder[0].id);
            if('gmlayer' === currentToken.get('layer')) {
                return;
            }
            var previousTurn=_.last(_.filter(turnOrder,function(element){
                var token=getObj("graphic", element.id);
                return token &&
                    token.get('layer') !== 'gmlayer' &&
                    element.id !== marker.id;
            }));
            
            /* find previous token. */
            var previousToken = getObj("graphic", previousTurn.id);
            var pImage=previousToken.get('imgsrc');
            var cImage=currentToken.get('imgsrc');
            var pRatio=previousToken.get('width')/previousToken.get('height');
            var cRatio=currentToken.get('width')/currentToken.get('height');
            
            var pNameString="The Previous turn is done.";
            if(previousToken && previousToken.get('showplayers_name')) {
                pNameString='<span style=\''+
                        'font-family: Baskerville, "Baskerville Old Face", "Goudy Old Style", Garamond, "Times New Roman", serif;'+
                        'text-decoration: underline;'+
                        'font-size: 130%;'                        +
                    '\'>'+
                        previousToken.get('name')+
                    '</span>\'s turn is done.';                
            }
            
            var cNameString='The next turn has begun!';
            if(currentToken && currentToken.get('showplayers_name')) {
                cNameString='<span style=\''+
                    'font-family: Baskerville, "Baskerville Old Face", "Goudy Old Style", Garamond, "Times New Roman", serif;'+
                    'text-decoration: underline;'+
                    'font-size: 130%;'+
                '\'>'+
                    currentToken.get('name')+
                '</span>, it\'s now your turn!';
            }
 
            
            var PlayerAnnounceExtra='<a style="position:relative;z-index:10000; top:-1em;float: left;font-size: .6em; color: white; border: 1px solid #cccccc; border-radius: 1em; margin: 0 .1em; font-weight: bold; padding: .1em .4em;" href="!pot">&'+'#x23ea; POT</a><a style="position:relative;z-index:10000; top:-1em;float: right;font-size: .6em; color: white; border: 1px solid #cccccc; border-radius: 1em; margin: 0 .1em; font-weight: bold; padding: .1em .4em;" href="!eot">EOT &'+'#x23e9;</a>';
            if(state.TurnMarker.announcePlayerInTurnAnnounce) {
                var Char=currentToken.get('represents');
                if(Char) {
                    Char=getObj('character',Char);
                    if(Char && _.isFunction(Char.get)) {
                        var Controllers=Char.get('controlledby').split(',');
                        _.each(Controllers,function(c){
                            switch(c) {
                                case 'all':
                                    PlayerAnnounceExtra+='<div style="'+
                                            'padding: 0px 5px;'+
                                            'font-weight: bold;'+
                                            'text-align: center;'+
                                            'font-size: '+state.TurnMarker.announcePlayerInTurnAnnounceSize+';'+
                                            'border: 5px solid black;'+
                                            'background-color: white;'+
                                            'color: black;'+
                                            'letter-spacing: 3px;'+
                                            'line-height: 130%;'+
                                        '">'+
                                            'All'+
                                        '</div>';
                                    break;

                                default:
                                    var player=getObj('player',c);
                                    if(player) {
                                        var PlayerColor=player.get('color');
                                        var PlayerName=player.get('displayname');
                                        PlayerAnnounceExtra+='<div style="'+
                                                'padding: 5px;'+
                                                'text-align: center;'+
                                                'font-size: '+state.TurnMarker.announcePlayerInTurnAnnounceSize+';'+
                                                'background-color: '+PlayerColor+';'+
                                                'text-shadow: '+
                                                    '-1px -1px 1px #000,'+
                                                    ' 1px -1px 1px #000,'+
                                                    '-1px  1px 1px #000,'+
                                                    ' 1px  1px 1px #000;'+
                                                'letter-spacing: 3px;'+
                                                'line-height: 130%;'+
                                            '">'+
                                                PlayerName+
                                            '</div>';
                                    }
                                    break;
                            }
                        });
                    }
                }
            }
            
            var tokenSize=70;
            sendChat(
                '', 
                "/direct "+
                "<div style='border: 3px solid #808080; background-color: #4B0082; color: white; padding: 1px 1px;'>"+
                    '<div style="text-align: left;  margin: 5px 5px;">'+
                        '<a style="position:relative;z-index:1000;float:left; background-color:transparent;border:0;padding:0;margin:0;display:block;" href="!tm ping-target '+previousToken.id+'">'+
                            "<img src='"+pImage+"' style='width:"+Math.round(tokenSize*pRatio)+"px; height:"+tokenSize+"px; padding: 0px 2px;' />"+
                        '</a>'+
                         pNameString+
                    '</div>'+
                    '<div style="text-align: right; margin: 5px 5px; position: relative; vertical-align: text-bottom;">'+
                        '<a style="position:relative;z-index:1000;float:right; background-color:transparent;border:0;padding:0;margin:0;display:block;" href="!tm ping-target '+currentToken.id+'">'+
                            "<img src='"+cImage+"' style='width:"+Math.round(tokenSize*cRatio)+"px; height:"+tokenSize+"px; padding: 0px 2px;' />"+
                        '</a>'+
                         '<span style="position:absolute; bottom: 0;right:'+Math.round((tokenSize*cRatio)+6)+'px;">'+
                            cNameString+
                         '</span>'+
                        '<div style="clear:both;"></div>'+
                    '</div>'+
                     PlayerAnnounceExtra+
                    '<div style="clear:both;"></div>'+
                "</div>"
            );
        }
    },
    resetMarker = function() {
        active=false;
        threadSync++;

        var marker = getMarker();
        
        marker.set({
            layer: "gmlayer",
            aura1_radius: '',
            aura2_radius: '',
            left: 35,
            top: 35,
            height: 70,
            width: 70,
            rotation: 0,
            bar1_value: 0
        });
    },
    startMarker = function() {
        var marker = getMarker();

        if(state.TurnMarker.playAnimations && state.TurnMarker.aura1.pulse) {
            marker.set({
                aura1_radius: state.TurnMarker.aura1.size,
                aura1_color: state.TurnMarker.aura1.color
            });   
        }
        if(state.TurnMarker.playAnimations && state.TurnMarker.aura2.pulse) {
            marker.set({
                aura2_radius: state.TurnMarker.aura2.size,
                aura2_color: state.TurnMarker.aura2.color
            });   
        }
        active=true;
        stepAnimation(threadSync);
        turnOrderChange(true);
    },
    dispatchInitiativePage = function(){
        if( !Campaign().get('initiativepage') ) {
            resetMarker();
        } else {
            startMarker();
        }
    },
    registerEventHandlers = function(){        
        on("change:campaign:initiativepage", dispatchInitiativePage );
        on("change:campaign:turnorder", handleTurnOrderChange );
        on("change:graphic:lastmove", checkForTokenMove );
        on("destroy:graphic", handleDestroyGraphic );
        on("chat:message", handleInput );

        dispatchInitiativePage();
    }
    ;

    return {
        CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers,
		TurnOrderChange: handleExternalTurnOrderChange
    };

}());

on("ready",function(){
    'use strict';

	TurnMarker.CheckInstall(); 
	TurnMarker.RegisterEventHandlers();
});

var TurnOrder = TurnOrder || (function() {
    "use strict";

    return {
        Get: function(){
            var to=Campaign().get("turnorder");
            to=(''===to ? '[]' : to); 
            return JSON.parse(to);
        },
        Set: function(turnOrder){
            Campaign().set({turnorder: JSON.stringify(turnOrder)});
        },
        Next: function(){
            this.Set(TurnOrder.Get().rotate(1));
            if("undefined" !== typeof Mark && _.has(Mark,'Reset') && _.isFunction(Mark.Reset)) {
                Mark.Reset();
            }
        },
        Prev: function(){
            this.Set(TurnOrder.Get().rotate(-1));
            if("undefined" !== typeof Mark && _.has(Mark,'Reset') && _.isFunction(Mark.Reset)) {
                Mark.Reset();
            }
        },
        NextVisible: function(){
            var turns=this.Get();
            var context={skip: 0};
            var found=_.find(turns,function(element){
                var token=getObj("graphic", element.id);
                if(
                    (undefined !== token) &&
                    (token.get('layer')!=='gmlayer')
                )
                {
                    return true;
                }
                else
                {
                    this.skip++;
                }
            },context);
            if(undefined !== found && context.skip>0)
            {
                this.Set(turns.rotate(context.skip));
            }
        },
        HasTurn: function(id){
         return (_.filter(this.Get(),function(turn){
                return id === turn.id;
            }).length !== 0);
        },
        AddTurn: function(entry){
            var turnorder = this.Get();
            turnorder.push(entry);
            this.Set(turnorder);
        },
        RemoveTurn: function(id){
            this.Set(_.reject(this.Get(),(o)=>o.id===id));
        }

    };
}());

Object.defineProperty(Array.prototype, 'rotate', {
    enumerable: false,
    writable: true
});

Array.prototype.rotate = (function() {
    "use strict";
    var unshift = Array.prototype.unshift,
        splice = Array.prototype.splice;

    return function(count) {
        var len = this.length >> 0;
            count = count >> 0;

        unshift.apply(this, splice.call(this, count % len, len));
        return this;
    };
}());
/*
================================================================
END SCRIPT: TurnMarker1
================================================================
*/

/*
================================================================
BEGIN SCRIPT: VectorMath
SOURCE FILE: VectorMath.md
================================================================
*/
/**
 * This is a small library for (mostly 2D) vector mathematics.
 * Internally, the vectors used by this library are simple arrays of numbers.
 * The functions provided by this library do not alter the input vectors, 
 * treating each vector as an immutable object.
 */
var VecMath = (function() {
    
    /**
     * Adds two vectors.
     * @param {vec} a
     * @param {vec} b
     * @return {vec}
     */
    var add = function(a, b) {
        var result = [];
        for(var i=0; i<a.length; i++) {
            result[i] = a[i] + b[i];
        }
        return result;
    };
    
    
    /**
     * Creates a cloned copy of a vector.
     * @param {vec} v
     * @return {vec}
     */
    var clone = function(v) {
        var result = [];
        for(var i=0; i < v.length; i++) {
            result.push(v[i]);
        }
        return result;
    };
    
    
    /** 
     * Returns an array representing the cross product of two 3D vectors. 
     * @param {vec3} a
     * @param {vec3} b
     * @return {vec3}
     */
    var cross = function(a, b) {
        var x = a[1]*b[2] - a[2]*b[1];
        var y = a[2]*b[0] - a[0]*b[2];
        var z = a[0]*b[1] - a[1]*b[0];
        return [x, y, z];
    };
    
    
    /** 
     * Returns the degree of a vector - the number of dimensions it has.
     * @param {vec} vector
     * @return {int}
     */
    var degree = function(vector) {
        return vector.length;
    };
    
    
    /**
     * Computes the distance between two points.
     * @param {vec} pt1
     * @param {vec} pt2
     * @return {number}
     */
    var dist = function(pt1, pt2) {
        var v = vec(pt1, pt2);
        return length(v);
    };
    
    
    /** 
     * Returns the dot product of two vectors. 
     * @param {vec} a
     * @param {vec} b
     * @return {number}
     */
    var dot = function(a, b) {
        var result = 0;
        for(var i = 0; i < a.length; i++) {
            result += a[i]*b[i];
        }
        return result;
    };
    
    
    /**
     * Tests if two vectors are equal.
     * @param {vec} a
     * @param {vec} b
     * @param {float} [tolerance] A tolerance threshold for comparing vector 
     *                            components.  
     * @return {boolean} true iff the each of the vectors' corresponding 
     *                  components are equal.
     */
    var equal = function(a, b, tolerance) {
        if(a.length != b.length)
            return false;
        
        for(var i=0; i<a.length; i++) {
            if(tolerance !== undefined) {
                if(Math.abs(a[i] - b[i]) > tolerance) {
                    return false;
                }
            }
            else if(a[i] != b[i])
                return false;
        }
        return true;
    };
    
    
    
    /** 
     * Returns the length of a vector. 
     * @param {vec} vector
     * @return {number}
     */
    var length = function(vector) {
        var length = 0;
        for(var i=0; i < vector.length; i++) {
            length += vector[i]*vector[i];
        }
        return Math.sqrt(length);
    };
    
    
    
    /**
     * Computes the normalization of a vector - its unit vector.
     * @param {vec} v
     * @return {vec}
     */
    var normalize = function(v) {
        var vHat = [];
        
        var vLength = length(v);
        for(var i=0; i < v.length; i++) {
            vHat[i] = v[i]/vLength;
        }
        
        return vHat;
    };
    
    
    /**
     * Computes the projection of vector b onto vector a.
     * @param {vec} a
     * @param {vec} b
     * @return {vec}
     */
    var projection = function(a, b) {
        var scalar = scalarProjection(a, b);
        var aHat = normalize(a);
        
        return scale(aHat, scalar);
    };
    
    
    /** 
     * Computes the distance from a point to an infinitely stretching line. 
     * Works for either 2D or 3D points.
     * @param {vec2 || vec3} pt
     * @param {vec2 || vec3} linePt1   A point on the line.
     * @param {vec2 || vec3} linePt2   Another point on the line.
     * @return {number}
     */
    var ptLineDist = function(pt, linePt1, linePt2) {
        var a = vec(linePt1, linePt2);
        var b = vec(linePt1, pt);
        
        // Make 2D vectors 3D to compute the cross product.
        if(!a[2])
            a[2] = 0;
        if(!b[2])
            b[2] = 0;
        
        var aHat = normalize(a);
        var aHatCrossB = cross(aHat, b);
        return length(aHatCrossB);
    };
    
    
    /** 
     * Computes the distance from a point to a line segment. 
     * Works for either 2D or 3D points.
     * @param {vec2 || vec3} pt
     * @param {vec2 || vec3} linePt1   The start point of the segment.
     * @param {vec2 || vec3} linePt2   The end point of the segment.
     * @return {number}
     */
    var ptSegDist = function(pt, linePt1, linePt2) {
        var a = vec(linePt1, linePt2);
        var b = vec(linePt1, pt);
        var aDotb = dot(a,b);
        
        // Is pt behind linePt1?
        if(aDotb < 0) {
            return length(vec(pt, linePt1));
        }
        
        // Is pt after linePt2?
        else if(aDotb > dot(a,a)) {
            return length(vec(pt, linePt2));
        }
        
        // Pt must be between linePt1 and linePt2.
        else {
            return ptLineDist(pt, linePt1, linePt2);
        }
    };
    
    
    /**
     * Computes the scalar projection of b onto a.
     * @param {vec2} a
     * @param {vec2} b
     * @return {vec2}
     */
    var scalarProjection = function(a, b) {
        var aDotB = dot(a, b);
        var aLength = length(a);
        
        return aDotB/aLength;
    };
    
    
    
    /**
     * Computes a scaled vector.
     * @param {vec2} v
     * @param {number} scalar
     * @return {vec2}
     */
    var scale = function(v, scalar) {
        var result = [];
        
        for(var i=0; i<v.length; i++) {
            result[i] = v[i]*scalar;
        }
        return result;
    };
    
    
    /** 
     * Computes the difference of two vectors.
     * @param {vec} a
     * @param {vec} b
     * @return {vec}
     */
    var sub = function(a, b) {
        var result = [];
        for(var i=0; i<a.length; i++) {
            result.push(a[i] - b[i]);
        }
        return result;
    };
    
    
    /** 
     * Returns the vector from pt1 to pt2. 
     * @param {vec} pt1
     * @param {vec} pt2
     * @return {vec}
     */
    var vec = function(pt1, pt2) {
        var result = [];
        for(var i=0; i<pt1.length; i++) {
            result.push( pt2[i] - pt1[i] );
        }
        
        return result;
    };
    
    
    // The exposed API.
    return {
        add: add,
        clone: clone,
        cross: cross,
        degree: degree,
        dist: dist,
        dot: dot,
        equal: equal,
        length: length,
        normalize: normalize,
        projection: projection,
        ptLineDist: ptLineDist,
        ptSegDist: ptSegDist,
        scalarProjection: scalarProjection,
        scale: scale,
        sub: sub,
        vec: vec
    };
})();


// Perform unit tests. Inform us in the log if any test fails. Otherwise,
// succeed silently.
(function() {
    /**
     * Does a unit test. If the test evaluates to false, then it displays with
     * a message that the unit test failed. Otherwise it passes silently.
     * @param {boolean} test    Some expression to test.
     * @param {string} failMsg  A message displayed if the test fails.
     */
    var assert = function(test, failMsg) {
        if(!test) {
            log("UNIT TEST FAILED: " + failMsg);
        }
    };
    
    
    var a = [1, 5];
    var b = [17, -8];
    
    
    // VecMath.equal
    assert(
        VecMath.equal([2, -3, 4, 8], [2, -3, 4, 8]),
        "VecMath.equal([2, -3, 4, 8], [2, -3, 4, 8])"
    );
    assert(
        !VecMath.equal([1, 3, 5], [-2, 4, -6]),
        "!VecMath.equal([1, 3, 5], [-2, 4, -6])"
    );
    assert(
        !VecMath.equal([1, 3, 5], [1, 3, 4]),
        "!VecMath.equal([1, 3, 5], [1, 3, 4])"
    );
    assert(
        !VecMath.equal([1,2,3], [1,2]),
        "!VecMath.equal([1,2,3], [1,2])"
    );
    assert(
        !VecMath.equal([1,2], [1,2,3]),
        "!VecMath.equal([1,2], [1,2,3])"
    );
    
    // VecMath.add
    assert(
        VecMath.equal(
            VecMath.add([1, 2, 3], [3, -5, 10]),
            [4, -3, 13]
        ),
        "VecMath.add([1, 2, 3], [3, -5, 10]) equals [4, -3, 13]"
    );
    assert(
        VecMath.equal(
            VecMath.add([0, 0, 0], [1, 2, 3]),
            [1, 2, 3]
        ),
        "VecMath.add([0, 0, 0], [1, 2, 3]) equals [1, 2, 3]"
    );
    
    // VecMath.clone
    assert(
        VecMath.equal( VecMath.clone(a), a),
        "VecMath.equal( VecMath.clone(a), a)"
    );
    assert(
        VecMath.clone(a) != a,
        "VecMath.clone(a) != a"
    );
    
    // VecMath.cross
    assert(
        VecMath.equal(
            VecMath.cross([1, 0, 0], [0, 1, 0]),
            [0, 0, 1]
        ),
        "VecMath.cross([1, 0, 0], [0, 1, 0]) equals [0, 0, 1]"
    );
    assert(
        VecMath.equal(
            VecMath.cross([1,2,3], [-10, 3, 5]),
            [1, -35, 23]
        ),
        "VecMath.cross([1,2,3], [-10, 3, 5]) equals [1, -35, 23]"
    );
    
    // VecMath.degree
    assert(
        VecMath.degree([1,2,3]) == 3,
        "VecMath.degree([1,2,3]) == 3"
    );
    assert(
        VecMath.degree([1]) == 1,
        "VecMath.degree([1]) == 1"
    );
    assert(
        VecMath.degree([1,1,1,1,1]) == 5,
        "VecMath.degree([1,1,1,1,1]) == 5"
    );
    
    // VecMath.dist
    assert(
        VecMath.dist([1,2], [4,6]) == 5,
        "VecMath.dist([1,2], [4,6]) == 5"
    );
    assert(
        VecMath.dist([3,4], [-3, -4]) == 10,
        "VecMath.dist([3,4], [-3, -4]) == 10"
    );
    
    // VecMath.dot
    assert(
        VecMath.dot([1, 2, 3], [-1, -2, -3]) == -14,
        "VecMath.dot([1, 2, 3], [-1, -2, -3]) == -14"
    );
    assert(
        VecMath.dot([1,0], [0,1]) == 0,
        "VecMath.dot([1,0], [0,1]) == 0"
    );
    assert(
        VecMath.dot([1,0], [0,-1]) == 0,
        "VecMath.dot([1,0], [0,-1]) == 0"
    );
    assert(
        VecMath.dot([1,0], [-1, 0]) == -1,
        "VecMath.dot([1,0], [-1, 0]) == -1"
    );
    assert(
        VecMath.dot([1,0], [1, 0]) == 1,
        "VecMath.dot([1,0], [1, 0]) == 1"
    );
    
    // VecMath.length
    assert(
        VecMath.length([1,0,0]) == 1,
        "VecMath.length([1,0,0]) == 1"
    );
    assert(
        VecMath.length([3,4]) == 5,
        "VecMath.length([3,4]) == 5"
    );
    assert(
        VecMath.length([-3, 0, 4, 0]) == 5,
        "VecMath.length([-3, 0, 4, 0]) == 5"
    );
    
    // VecMath.normalize
    assert(
        VecMath.equal(
            VecMath.normalize([3,0]),
            [1, 0]
        ),
        "VecMath.normalize([3,0]) equals [1,0]"
    );
    assert(
        VecMath.equal(
            VecMath.normalize([0,-3]),
            [0, -1]
        ),
        "VecMath.normalize([0,-3]) equals [0,-1]"
    );
    
    // VecMath.projection
    assert(
        VecMath.equal(
            VecMath.projection([5,0], [3, 4]),
            [3, 0]
        ),
        "VecMath.projection([5,0], [3, 4]) equals [3, 0]"
    );
    assert(
        VecMath.equal(
            VecMath.projection([5,5], [0, 6]),
            [3, 3],
            0.001
        ),
        "VecMath.projection([5,5], [0, 6]) equals [3, 3]"
    );
    
    // VecMath.ptLineDist
    assert(
        VecMath.ptLineDist([0,3], [-100,5], [100,5]) == 2,
        "VecMath.ptLineDist([0,3], [-100,5], [100,5]) == 2"
    );
    assert(
        VecMath.ptLineDist([3,0], [5,5], [5,10]) == 2,
        "VecMath.ptLineDist([3,0], [5,5], [5,10]) == 2"
    );
    
    // VecMath.ptSegDist
    assert(
        VecMath.ptSegDist([0,3], [-5,5], [5,5]) == 2,
        "VecMath.ptSegDist([0,3], [-5,5], [5,5]) == 2"
    );
    assert(
        VecMath.ptSegDist([3,0], [5,-5], [5,5]) == 2,
        "VecMath.ptSegDist([3,0], [5,-5], [5,5]) == 2"
    );
    assert(
        VecMath.ptSegDist([3,4], [-5,0], [0,0]) == 5,
        "VecMath.ptSegDist([3,4], [-5,0], [0,0]) == 5"
    );
    assert(
        VecMath.ptSegDist([-2,-4], [1,0], [5,0]) == 5,
        "VecMath.ptSegDist([-2,-4], [1,0], [5,0]) == 5"
    );
    
    // VecMath.scalarProjection
    assert(
        VecMath.scalarProjection([5,0], [3, 4]) == 3,
        "VecMath.scalarProjection([5,0], [3, 4]) == 3"
    );
    
    // VecMath.scale
    assert(
        VecMath.equal(
            VecMath.scale([1,-2,3], 6),
            [6, -12, 18]
        ),
        "VecMath.scale([1,-2,3], 6) equals [6, -12, 18]"
    );
    
    // VecMath.sub
    assert(
        VecMath.equal(
            VecMath.sub([10, 8, 6], [-4, 6, 1]),
            [14, 2, 5]
        ),
        "VecMath.sub([10, 8, 6], [-4, 6, 1]) equals [14, 2, 5]"
    );
    
    // VecMath.vec
    assert(
        VecMath.equal(
            VecMath.vec([1,1], [3,4]),
            [2,3]
        ),
        "VecMath.vec([1,1], [3,4]) equals [2,3]"
    );
})();
/*
================================================================
END SCRIPT: VectorMath
================================================================
*/

/*
================================================================
BEGIN SCRIPT: ZeroFrame
SOURCE FILE: ZeroFrame.md
================================================================
*/
/*
=========================================================
Name            :  ZeroFrame
GitHub          :  https://github.com/TimRohr22/Cauldron/tree/master/ZeroFrame
Roll20 Contact  :  timmaugh
Version         :  1.2.4
Last Update     :  19 NOV 2025
=========================================================
*/
var API_Meta = API_Meta || {};
API_Meta.ZeroFrame = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{ try { throw new Error(''); } catch (e) { API_Meta.ZeroFrame.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (12)); } }

const ZeroFrame = (() => { //eslint-disable-line no-unused-vars
    // ==================================================
    //		VERSION
    // ==================================================
    const apiproject = 'ZeroFrame';
    API_Meta[apiproject].version = '1.2.4';
    const schemaVersion = 0.2;
    const vd = new Date(1763582828267);
    let stateReady = false;
    const checkInstall = () => {
        if (!state.hasOwnProperty(apiproject) || state[apiproject].version !== schemaVersion) {
            log(`  > Updating ${apiproject} Schema to v${schemaVersion} <`);
            switch (state[apiproject] && state[apiproject].version) {
                case 0.1:
                    state[apiproject].config.singlebang = true;
                /* break; // intentional dropthrough */ /* falls through */
                case 0.2:
                /* break; // intentional dropthrough */ /* falls through */
                case 'UpdateSchemaVersion':
                    state[apiproject].version = schemaVersion;
                    break;

                default:
                    state[apiproject] = {
                        config: {
                            looporder: [],
                            logging: false,
                            singlebang: true
                        },
                        version: schemaVersion
                    };
                    break;
            }
        }
    };
    const assureState = () => {
        if (!stateReady) {
            checkInstall();
            stateReady = true;
        }
    };
    const versionInfo = () => {
        log(`\u0166\u0166 ${apiproject} v${API_Meta[apiproject].version}, ${vd.getFullYear()}/${vd.getMonth() + 1}/${vd.getDate()} \u0166\u0166 -- offset ${API_Meta[apiproject].offset}`);
        assureState();
    };
    const logsig = () => {
        // initialize shared namespace for all signed projects, if needed
        state.torii = state.torii || {};
        // initialize siglogged check, if needed
        state.torii.siglogged = state.torii.siglogged || false;
        state.torii.sigtime = state.torii.sigtime || Date.now() - 3001;
        if (!state.torii.siglogged || Date.now() - state.torii.sigtime > 3000) {
            const logsig = '\n' +
                '  _____________________________________________   ' + '\n' +
                '   )_________________________________________(    ' + '\n' +
                '     )_____________________________________(      ' + '\n' +
                '           ___| |_______________| |___            ' + '\n' +
                '          |___   _______________   ___|           ' + '\n' +
                '              | |               | |               ' + '\n' +
                '              | |               | |               ' + '\n' +
                '              | |               | |               ' + '\n' +
                '              | |               | |               ' + '\n' +
                '              | |               | |               ' + '\n' +
                '______________|_|_______________|_|_______________' + '\n' +
                '                                                  ' + '\n';
            log(`${logsig}`);
            state.torii.siglogged = true;
            state.torii.sigtime = Date.now();
        }
        return;
    };

    // ==================================================
    //		MESSAGE STORAGE
    // ==================================================
    const generateUUID = (() => {
        let a = 0;
        let b = [];

        return () => {
            let c = (new Date()).getTime() + 0;
            let f = 7;
            let e = new Array(8);
            let d = c === a;
            a = c;
            for (; 0 <= f; f--) {
                e[f] = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(c % 64);
                c = Math.floor(c / 64);
            }
            c = e.join("");
            if (d) {
                for (f = 11; 0 <= f && 63 === b[f]; f--) {
                    b[f] = 0;
                }
                b[f]++;
            } else {
                for (f = 0; 12 > f; f++) {
                    b[f] = Math.floor(64 * Math.random());
                }
            }
            for (f = 0; 12 > f; f++) {
                c += "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(b[f]);
            }
            return c;
        };
    })();
    const preservedMsgObj = {};
    const batchMsgLibrary = {}; // will contain key pairs of UUID:originalMsg

    // ==================================================
    //		META-OP REGISTRATION
    // ==================================================

    const loopFuncs = [];

    class Func {
        constructor({ func: func = () => { }, priority: priority = 50, handles: handles = [] }) {
            this.name = func.name || handles[0] || 'unknown';
            this.func = func;
            this.priority = priority;
            this.handles = [func.name, ...handles.filter(h => h !== func.name)]
        }
    }

    const registerMetaOp = (func, options = { priority: 50, handles: [] }) => {
        assureState();
        if (!(func.name || (options.handles && options.handles.length))) {
            log(`Functions registered for the loop must bear a name or a handle. The unnamed function attempted to register after ${Object.keys(loopFuncs).join(', ')}`);
            return;
        }
        let rFunc = new Func({ func, ...options });
        let statefunc;
        if (state[apiproject].config.looporder && state[apiproject].config.looporder.length) {
            statefunc = state[apiproject].config.looporder.filter(f => f.name === (rFunc.name || rFunc.handles[0]))[0];
        }
        if (statefunc) {
            rFunc.priority = statefunc.priority || rFunc.priority;
            statefunc.handles = [...new Set([...statefunc.handles, ...rFunc.handles])];
        } else {
            state[apiproject].config.looporder.push(rFunc);
        }
        if (!loopFuncs.filter(f => f.name === rFunc.name || f.name === rFunc.handles[0]).length) {
            loopFuncs.push(rFunc);
        }
    };
    const initState = () => {
        return {
            runloop: true,
            loopcount: 0,
            logging: state[apiproject].config.logging || false,
            looporder: loopFuncs.sort((a, b) => a.priority > b.priority ? 1 : -1),
            history: [],
            duplicatecount: 0
        }
    };
    const trackhistory = (msg, preservedstate, props = {}) => {
        preservedstate.history.push({
            action: props.action,
            content: msg.content,
            notes: props.notes || '',
            status: props.status || ''
        });
    };

    // ==================================================
    //      LOGGING
    // ==================================================
    const handleLogging = (msg, preservedstate) => {
        let logrx = /{\s*&\s*log\s*}/ig;
        msg.content = msg.content.replace(logrx, (r => { //eslint-disable-line no-unused-vars
            preservedstate.logging = true;
            return '';
        }));
    };
    // ==================================================
    //      MESSAGING AND REPORTING
    // ==================================================
    const getWhisperTo = (who) => who.toLowerCase() === 'api' ? 'gm' : who.replace(/\s\(gm\)$/i, '');
    const HE = (() => { //eslint-disable-line no-unused-vars
        const esRE = (s) => s.replace(/(\\|\/|\[|\]|\(|\)|\{|\}|\?|\+|\*|\||\.|\^|\$)/g, '\\$1');
        const e = (s) => `&${s};`;
        const entities = {
            '<': e('lt'),
            '>': e('gt'),
            "'": e('#39'),
            '@': e('#64'),
            '{': e('#123'),
            '|': e('#124'),
            '}': e('#125'),
            '[': e('#91'),
            ']': e('#93'),
            '"': e('quot'),
            '*': e('#42')
        };
        const re = new RegExp(`(${Object.keys(entities).map(esRE).join('|')})`, 'g');
        return (s) => s.replace(re, (c) => (entities[c] || c));
    })();
    const msgframe = `<div class="wrapper" style="width: 100%; position: relative; overflow: hidden;"><div class="logo" style="position: absolute; left: 5px; top: 0px; z-index: 2;"> <img src="https://imgur.com/Rz2uclB.png" height="80"></div><div class="mainvisbox" style="font-family: 'Helvetica Neue', 'Arial', sans-serif; font-size: 12px; border-radius: 20px; position: relative; box-shadow: 5px 5px 5px #909090; margin: 35px 7px 7px 0px; overflow: hidden; z-index: 1; background-color: #1f2431;"><div class="headerrow" style="min-height: 50px; overflow: hidden;"><div class="title" style="margin: auto; margin-left: 45px; font-size: 2.5em; color: rgba(232, 232, 232, 1); text-align: center; line-height: 50px; font-family: 'Contrail One','Arial', sans-serif; text-shadow: 1px 1px 1px #909090;"> ZeroFrame</div></div><div class="bodywrapper" style="margin: 0px 7px;"><div class="bodybox-message" style="background-color: rgba(232,232,232,0); width: 100%; overflow: hidden; border-radius: 6px;"><div class="bodyboxinterior-message" style="width: 98%; overflow: hidden; margin: 3px auto 3px;"> __BODYCONTENT__</div></div></div><div class="footerrow" style="min-height: 20px; overflow: hidden;"> &nbsp;</div></div></div>`;
    const msgsimpleframe = `<div class="wrapper" style="width: 100%; position: relative; overflow: hidden;"><div class="logo" style="position: absolute; left: 5px; top: 0px; z-index: 2;"> <img src="https://imgur.com/Rz2uclB.png" height="80"></div><div class="mainvisbox" style="font-family: 'Helvetica Neue', 'Arial', sans-serif; font-size: 12px; border-radius: 20px; position: relative; box-shadow: 5px 5px 5px #909090; margin: 35px 7px 7px 0px; overflow: hidden; z-index: 1; background-color: #1f2431;"><div class="headerrow" style="min-height: 50px; overflow: hidden;"><div class="title" style="margin: auto; margin-left: 45px; font-size: 2.5em; color: rgba(232, 232, 232, 1); text-align: center; line-height: 50px; font-family: 'Contrail One','Arial', sans-serif; text-shadow: 1px 1px 1px #909090;"> ZeroFrame</div></div><div class="bodywrapper" style="margin: 0px 7px;"><div class="bodybox-message" style="background-color: rgba(232,232,232,1); width: 100%; overflow: hidden; border-radius: 6px;"><div class="bodyboxinterior-message" style="width: 98%; overflow: hidden; margin: 3px auto 3px;"> __BODYCONTENT__</div></div></div><div class="footerrow" style="min-height: 20px; overflow: hidden;"> &nbsp;</div></div></div>`;
    const msgsimplecontent = `<div class="bodycontent" style="width: 98%; margin: 0px auto;"> __CONTENTMESSAGE__</div>`;
    const msgconfigcontent = `<div class="bodycontent" style="width: 98%; margin: 0px auto;"><div class="scriptnames" style="overflow: hidden; background-color: rgba(232, 232, 232, 1); width: 100%; min-height: 40px; position: relative; border-radius: 20px; margin-top: 3px;"><div class="prioritycircle" style="width: 40px; height: 100%; border-radius: 20px 0px 0px 20px; border-right: 3px solid #1f2431; line-height: 40px; text-align: center; font-size: 2em; font-family: 'Contrail One',Arial,sans-serif; color: black; vertical-align: top; background-color: #ff9637; display: inline-block; position: absolute; left: 0px; top: 0px;"> <a style="height: 100%;font-family: &quot;contrail one&quot; , &quot;arial&quot; , sans-serif;color: black;background-color: #ff9637;display: inline-block;border:0px;text-align: center;line-height: 40px;padding: 0px;" href="!0 __ALIAS1__|?{Enter new priority for __SCRIPTNAME__|__PRIORITY__}">__PRIORITY__</a></div><div class="scriptname" style="font-family: 'Contrail One','Arial', sans-serif; font-size: 1.5em; color: black; margin-left: 50px; margin-top: 3px;">__SCRIPTNAME__</div><div class="scriptaliases" style="font-size: 1em; text-align: left; margin-left: 50px; margin-top: 1px; overflow: hidden;">__ALIASES__</div></div></div>`;
    //    const msgconfigcontent = `<div class="bodycontent" style="width: 98%; margin: 0px auto;"><div class="scriptnames" style="overflow: hidden; background-color: rgba(232, 232, 232, 1); width: 100%; min-height: 40px; position: relative; border-radius: 20px; margin-top: 3px;"><div class="prioritycircle" style="width: 40px; height: 100%; border-radius: 20px 0px 0px 20px; border-right: 3px solid #1f2431; line-height: 40px; text-align: center; font-size: 2em; font-family: 'Contrail One',Arial,sans-serif; color: black; vertical-align: top; background-color: #ff9637; display: inline-block; position: absolute; left: 0px; top: 0px;">__PRIORITY__</div><div class="scriptname" style="font-family: 'Contrail One','Arial', sans-serif; font-size: 1.5em; color: black; margin-left: 50px; margin-top: 3px;">__SCRIPTNAME__</div><div class="scriptaliases" style="font-size: 1em; text-align: left; margin-left: 50px; margin-top: 1px; overflow: hidden;">__ALIASES__</div></div></div>`;
    const msglogcontent = `<div class="bodycontent" style="width: 98%; margin: 0px auto;min-height: 25px;"><div class="scriptnames-log" style="overflow: hidden; background-color: rgba(232, 232, 232, 1); width: 100%; min-height: 20px; position: relative;"><div class="status" style="width: 20px; height: 20px; color: white; vertical-align: top; border-radius: 10px; box-shadow: 1px 1px 2px #162533; position: absolute; left: 0px; top: 0px; background-image: linear-gradient(45deg, __STATUSCOLOR__, __STATUSCOLOR__30);"><div class="status-shine" style="width: 20px; height: 20px; vertical-align: top; border-radius: 10px; position: absolute; left: 0px; top: 0px; background-image: linear-gradient(180deg, transparent, transparent, rgba(255, 255, 255, .35));">&nbsp;</div></div><div class="scriptname-log" style="font-family: 'Contrail One','Arial', sans-serif; font-size: 1.5em; color: black; margin-left: 30px; margin-top: 2px;">__SCRIPTNAME__</div><div class="scriptaliases-log" style="font-size: 1em; text-align: left; margin-left: 30px; margin-top: 2px; overflow: hidden;">__LOGMESSAGE__</div></div></div>`;

    const msgboxfull = ({ c: c = 'chat message', sendas: sas = 'API', wto: wto = '', simple: simple = false }) => {
        let msg = (simple ? msgsimpleframe : msgframe).replace("__BODYCONTENT__", c);
        if (!['API', ''].includes(wto)) msg = `/w "${wto.replace(' (GM)', '')}" ${msg}`;
        sendChat(sas, msg);
    };
    const msgbox = ({ c: c = 'chat message', sendas: sas = 'API', wto: wto = '' }) => {
        let msg = msgsimplecontent.replace('__CONTENTMESSAGE__', c);
        msgboxfull({ c: msg, wto: wto, simple: true, sendas: sas });
    }
    const buildLog = (msg, ps, apitrigger) => {
        const statuscolor = {
            loop: '#ff9637',
            changed: '#339b00',
            unchanged: '#001ea6',
            unresolved: '#b70000',
            stop: '#b70000',
            simple: '#ff9637',
            release: '#001ea6'
        }
        let rows = ps.history.reduce((m, v) => {
            if (/^ORIGINAL/.test(v.action)) return m;
            let note = '';
            switch (v.status) {
                case 'unchanged':
                    if (v.notes.length) note = `NOTES: ${v.notes}`;
                    break;
                case 'release':
                case 'stop':
                case 'simple':
                    if (v.notes.length) note = `NOTES: ${v.notes}`;
                    note += note.length ? '<br>' : '';
                    note += `<b>FINAL MESSAGE</b><br>${v.content.replace(apitrigger, '').replace(/&{template:/g, `&#38;{template:`)}`;
                    break;
                default:
                    note = v.content.replace(apitrigger, '');
                    if (v.notes.length) note += `<br>NOTES: ${v.notes}`;
            }
            // if (v.status !== 'unchanged') note = v.content.replace(apitrigger,'');
            // if (note.length && v.notes.length) note += `<br>NOTES: ${v.notes}`;
            return m + msglogcontent
                .replace(/__STATUSCOLOR__/g, c => { return statuscolor[v.status] || statuscolor.loop; }) //eslint-disable-line no-unused-vars
                .replace('__SCRIPTNAME__', v.action.toUpperCase())
                .replace('__LOGMESSAGE__', note);
        }, '');
        msgboxfull({ c: rows, wto: getWhisperTo(msg.who), simple: true });

    };
    const buildConfig = (msg) => {
        let looporder = loopFuncs.sort((a, b) => a.priority > b.priority ? 1 : -1);
        let rows = looporder.reduce((m, v) => {
            return m + msgconfigcontent
                .replace(/__PRIORITY__/g, v.priority)
                .replace(/__SCRIPTNAME__/g, v.name)
                .replace(/__ALIASES__/g, v.handles.join(', '))
                .replace(/__ALIAS1__/g, v.handles[0]);
        }, '');

        msgboxfull({ c: rows, wto: getWhisperTo(msg.who) });

    };

    // ==================================================
    //      REGEX MANAGEMENT
    // ==================================================
    const escapeRegExp = (string) => { return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); };
    const getFirst = (cmd, ...args) => {
        // pass in objects of form: {type: 'text', rx: /regex/}
        // return object of form  : {regex exec object with property 'type': 'text'}

        let ret = {};
        let r;
        args.find(a => {
            r = a.rx.exec(cmd);
            if (r && (!ret.length || r.index < ret.index)) {
                ret = Object.assign(r, { type: a.type });
            }
            a.lastIndex = 0;
        }, ret);
        return ret;
    };
    const getConfigItem = e => {
        return state[apiproject].config[e];
    };

    // ==================================================
    //      UTILITIES
    // ==================================================
    const getPageForPlayer = (playerid) => {
        let player = getObj('player', playerid);
        if (playerIsGM(playerid)) {
            return player.get('lastpage') || Campaign().get('playerpageid');
        }

        let psp = Campaign().get('playerspecificpages');
        if (psp[playerid]) {
            return psp[playerid];
        }

        return Campaign().get('playerpageid');
    };

    // ==================================================
    //      ROLL MANAGEMENT
    // ==================================================
    const nestedInline = (preserved) => {
        let ores,
            ires,
            c = '',
            index = 0,
            nestedindexarray = [],
            nestedlvl = 0,
            outeropenrx = /(?<!\$)\[\[/,
            inneropenrx = /(\$\[\[|\({&)/,
            inlinecloserx = /]]/,
            nestedrx = /^(?:\$\[\[(\d+)]]|\({&(\d+)}\))/,
            outertm = { rx: outeropenrx, type: 'outer' },
            innertm = { rx: inneropenrx, type: 'inner' },
            inlineclosetm = { rx: inlinecloserx, type: 'close' },
            eostm = { rx: /$/, type: 'eos' };

        while (index < preserved.content.length) {
            c = preserved.content.slice(index);
            ores = getFirst(c, outertm, innertm, inlineclosetm, eostm);
            switch (ores.type) {
                case 'eos':
                    index = preserved.content.length;
                    break;
                case 'inner':
                    index += ores.index;
                    ires = nestedrx.exec(preserved.content.slice(index));
                    if (ires) {
                        // using unshift orders them in descending order
                        if (nestedlvl > 0) nestedindexarray.unshift({ index: index, value: preserved.parsedinline[ires[1] || ires[2]].value, replacestring: ires[0] });
                        index += ires[0].length;
                    } else {
                        // this would probably indicate an error -- something like $[[NaN]]
                        index += ores[0].length;
                    }
                    break;
                case 'outer':
                    nestedlvl++;
                    index += ores.index + ores[0].length;
                    break;
                case 'close':
                    nestedlvl--;
                    index += ores.index + ores[0].length;
                    break;
            }
        }
        //since we are working in descending order, all of our indices will survive the replacement operation
        nestedindexarray.forEach(r => {
            preserved.content = `${preserved.content.slice(0, r.index)}${r.value}${preserved.content.slice(r.index + r.replacestring.length, preserved.content.length)}`;
        });
        // return preserved.content;
    };
    const getValues = (msg, lastpass = false) => {
        // replace inline rolls tagged with .value
        const valuerx = /\$\[\[(?<rollnumber>\d+)]]\.value/gi;
        const value2rx = /\({&(?<rollnumber>\d+)}\)\.value/gi;
        const itemsrx = /\$\[\[(?<rollnumber>\d+)]]\.items\((?<separator>(?:'[^']+'|"[^"]+"|`[^`]+`|(?:[^'"`](?:#|\|))(?:'[^']+'|"[^"]+"|`[^`]+`|[^'"`)][^)]*)|[^'"`)][^#\|)]?[^)]*))\)/gi;
        const items2rx = /\({&(?<rollnumber>\d+)}\)\.items\((?<separator>(?:'[^']+'|"[^"]+"|`[^`]+`|(?:[^'"`](?:#|\|))(?:'[^']+'|"[^"]+"|`[^`]+`|[^'"`)][^)]*)|[^'"`)][^#\|)]?[^)]*))\)/gi;
        const items3rx = /\$\[\[(?<rollnumber>\d+)]]\.items(?=[^(])/gi;
        const items4rx = /\({&(?<rollnumber>\d+)}\)\.items(?=[^(])/gi;
        const expandedrx = /\$\[\[(?<rollnumber>\d+)]]\.expanded/gi;
        const expanded2rx = /\({&(?<rollnumber>\d+)}\)\.expanded/gi;

        let retval = false;

        [valuerx, value2rx].forEach(rx => {
            msg.content = msg.content.replace(rx, ((r, g1) => {
                retval = true;
                if (msg.inlinerolls.length > g1) {
                    return msg.parsedinline[g1].value;
                } else if (lastpass) {
                    return '0';
                } else {
                    return r;
                }
            }));
        });

        [expandedrx, expanded2rx].forEach(rx => {
            msg.content = msg.content.replace(rx, ((r, g1) => {
                retval = true;
                if (msg.inlinerolls.length > g1) {
                    return msg.parsedinline[g1].display;
                } else if (lastpass) {
                    return '0';
                } else {
                    return r;
                }
            }));
        });

        [itemsrx, items2rx, items3rx, items4rx].forEach((rx,rxIndex) => {
            msg.content = msg.content.replace(rx, ((r, g1, separator) => {
                let delim = ',';
                let res;
                if (msg.inlinerolls.length > g1) {
                    retval = true;
                    if (rxIndex < 2) {
                        if (/^(?:'[^']+'|"[^"]+"|`[^`]+`)$/.test(separator)) { // enclosed in quotation marks of some sort
                            delim = separator.slice(1, -1);
                        } else if (/^(?<deferral>[^'"`])(?:#|\|)(?<deferredtext>.+)$/.test(separator)) { // deferral character is present
                            res = /^(?<deferral>[^'"`])(?:#|\|)(?<deferredtext>.+)$/.exec(separator);
                            delim = (/^(?:'[^']+'|"[^"]+"|`[^`]+`)$/.test(res.groups.deferredtext)
                                ? res.groups.deferredtext.slice(1, -1) // enclosed in quotation marks of some sort
                                : res.groups.deferredtext)             // not enclosed in quotation marks
                                .replace(new RegExp(escapeRegExp(res.groups.deferral), 'g'), '')
                        } else {
                            delim = separator;
                        }
                    }
                    return msg.parsedinline[g1].getTableValues().length
                        ? msg.parsedinline[g1].getTableValues().join(delim)
                        : msg.parsedinline[g1].value;
                } else if (lastpass) {
                    retval = true;
                    return '0';
                } else {
                    return r;
                }
            }));

        });
        [items3rx, items4rx].forEach(rx => {
            msg.content = msg.content.replace(rx, ((r, g1) => {
                let delim = ', ';
                let res;
                if (msg.inlinerolls.length > g1) {
                    retval = true;
                    return msg.parsedinline[g1].getTableValues().join(delim);
                } else if (lastpass) {
                    retval = true;
                    return '0';
                } else {
                    return r;
                }
            }));

        });

        //msg.content = msg.content.replace(valuerx, ((r, g1) => {
        //    retval = true;
        //    if (msg.inlinerolls.length > g1) {
        //        return msg.parsedinline[g1].value;
        //    } else if (lastpass) {
        //        return '0';
        //    } else {
        //        return r;
        //    }
        //}));
        //msg.content = msg.content.replace(value2rx, ((r, g1) => {
        //    if (msg.inlinerolls.length > g1) {
        //        retval = true;
        //        return msg.parsedinline[g1].value;
        //    } else if (lastpass) {
        //        retval = true;
        //        return '0';
        //    } else {
        //        return r;
        //    }
        //}));
        //msg.content = msg.content.replace(itemsrx, ((r, g1, separator) => {
        //    let delim = ',';
        //    let res;
        //    if (msg.inlinerolls.length > g1) {
        //        retval = true;
        //        if (/^(?:'[^']+'|"[^"]+"|`[^`]+`)$/.test(separator)) { // enclosed in quotation marks of some sort
        //            delim = separator.slice(1, -1);
        //        } else if (/^(?<deferral>[^'"`])(?:#|\|)(?<deferredtext>.+)$/.test(separator)) { // deferral character is present
        //            res = /^(?<deferral>[^'"`])(?:#|\|)(?<deferredtext>.+)$/.exec(separator);
        //            delim = (/^(?:'[^']+'|"[^"]+"|`[^`]+`)$/.test(res.groups.deferredtext)
        //                ? res.groups.deferredtext.slice(1, -1) // enclosed in quotation marks of some sort
        //                : res.groups.deferredtext)             // not enclosed in quotation marks
        //                .replace(new RegExp(escapeRegExp(res.groups.deferral),'g'),'')
        //        } else {
        //            delim = separator;
        //        }
        //        return msg.parsedinline[g1].getTableValues().join(delim);
        //    } else if (lastpass) {
        //        retval = true;
        //        return '0';
        //    } else {
        //        return r;
        //    }
        //}));
        //msg.content = msg.content.replace(items2rx, ((r, g1, separator) => {
        //    let delim = ',';
        //    let res;
        //    if (msg.inlinerolls.length > g1) {
        //        retval = true;
        //        if (/^(?:'[^']+'|"[^"]+"|`[^`]+`)$/.test(separator)) { // enclosed in quotation marks of some sort
        //            delim = separator.slice(1, -1);
        //        } else if (/^(?<deferral>[^'"`])(?:#|\|)(?<deferredtext>.+)$/.test(separator)) { // deferral character is present
        //            res = /^(?<deferral>[^'"`])(?:#|\|)(?<deferredtext>.+)$/.exec(separator);
        //            delim = (/^(?:'[^']+'|"[^"]+"|`[^`]+`)$/.test(res.groups.deferredtext)
        //                ? res.groups.deferredtext.slice(1, -1) // enclosed in quotation marks of some sort
        //                : res.groups.deferredtext)             // not enclosed in quotation marks
        //                .replace(new RegExp(escapeRegExp(res.groups.deferral), 'g'), '')
        //        } else {
        //            delim = separator;
        //        }
        //        return msg.parsedinline[g1].getTableValues().join(delim);
        //    } else if (lastpass) {
        //        retval = true;
        //        return '0';
        //    } else {
        //        return r;
        //    }
        //}));
        return retval;
    };
    const getLoopRolls = (msg, preserved, preservedstate) => {
        let replaceTrack = {};
        if (msg.inlinerolls) {
            // insert inline rolls to preserved message, correct the placeholder shorthand index
            msg.inlinerolls.forEach((r, i) => {
                preserved.inlinerolls.push(r);
                replaceTrack[i] = (preserved.inlinerolls.length - 1);
            });
            Object.keys(replaceTrack).reverse().forEach(k => {
                msg.content = msg.content.replace(new RegExp(`\\$\\[\\[(${k})]]`, 'g'), `$[[${replaceTrack[k]}]]`);
            });
            preserved.parsedinline = [...(preserved.parsedinline || []), ...libInline.getRollData(msg)];
            preservedstate.runloop = true;
        }
    };
    const handleInit = (msg, preserved, preservedstate) => {
        if (!preserved.initArray || !preserved.initArray.length) { return; }
        class TrackerEntry {
            constructor(id,val,pgid,custom='') {
                this.id = id;
                this.pr = `${val}`;
                this.custom = custom;
                this._pageid = pgid;
            }
        }
        let parsed = libInline.getRollData(msg);
        let to = (campTO = Campaign().get('turnorder')).length ? JSON.parse(campTO) : [];

        preserved.initArray.forEach(e => {
            if (!e[1].token || !e[1].token.id || parsed.length <= e[0]) { return; }
            let newentry = new TrackerEntry(e[1].token.id, parsed[e[0]].value, e[1].token.get('pageid'));
            let oldentry;
            switch (e[1].type) {
                case 'new':
                    to.push(newentry);
                    break;
                case 'value':
                    oldentry = to.filter(te => te.id === e[1].token.id && te.pr === e[1].value)[0];
                    if (oldentry && oldentry.id) {
                        Object.assign(oldentry, newentry);
                    } else {
                        to.push(newentry);
                    }
                    break;
                case 'index':
                    oldentry = to.filter(te => te.id === e[1].token.id)[Math.max(0,parseInt(e[1].value)-1)];
                    if (oldentry && oldentry.id) {
                        Object.assign(oldentry, newentry);
                    } else {
                        to.push(newentry);
                    }
                    break;
                default:
                    oldentry = to.filter(te => te.id === e[1].token.id)[0];
                    if (oldentry && oldentry.id) {
                        Object.assign(oldentry, newentry);
                    } else {
                        to.push(newentry);
                    }
            }
        });
        Campaign().set({ turnorder: JSON.stringify(to) });
        delete preserved.initArray;
    };
    const customTracker = (preserved) => {
        let res,
            index = 0,
            rollcount = 0,
            trackerindexarray = [],
            initArray = [],
            inlineopenrx = /(?<!\$)\[\[/,
            inlinecloserx = /]]/,
            trackerrx = /{&\s*tracker(?:\s+([^}]+)){0,1}}/i,
            trackertm = { rx: trackerrx, type: 'tracker' },
            opentm = { rx: inlineopenrx, type: 'open' },
            closetm = { rx: inlinecloserx, type: 'close' },
            eostm = { rx: /$/, type: 'eos' };

        const assertStart = rx => new RegExp(`^${rx.source}`, rx.flags);

        const getToken = (info, fromto = {}) => {
            const checkControl = (t) => {
                if (playerIsGM(preserved.playerid)) { return true; }
                let cby = t.get('represents').length
                    ? findObjs({ id: t.get('represents') })[0].get('controlledby')
                    : t.get('controlledby');
                return cby.split(',').reduce((m, p) => {
                    return m || p === 'all' || p === preserved.playerid;
                }, false);
            };
            let pgid = getPageForPlayer(preserved.playerid);
            let tokens = [];
            if (fromto && fromto.type) { // from turn order, only
                tokens = JSON.parse(Campaign().get('turnorder'))
                    .filter(e => playerIsGM(preserved.playerid) || e._pageid === pgid)
                    .map(e => {
                        e.token = getObj('graphic', e.id);
                        return e;
                    })
                    .filter(e => checkControl(e.token))
                    .filter(e => {
                        if (e.token.id === info || e.token.get('name') === info) { return true; }
                        let c = (findObjs({ type: 'character', id: e.token.get('represents') })[0] || { get: () => { return undefined; } });
                        return c.id === info || c.get('name') === info;
                    })
                    .filter((e, i) => {
                        if (fromto.type === 'value') {
                            return e.pr === fromto.value;
                        } else if (fromto.type === 'index') {
                            return i === parseInt(fromto.value)-1;
                        }
                        return true;
                    })
                    .map(e => e.token);
                if (!tokens.length) {
                    fromto.type = 'new';
                }
            }
            if (!tokens.length) {
                tokens = [
                    ...findObjs({ type: 'graphic', subtype: 'token', id: info }),
                    ...findObjs({ type: 'graphic', subtype: 'card', id: info }),
                    ...findObjs({ type: 'graphic', subtype: 'token', name: info, pageid: pgid }),
                    ...findObjs({ type: 'graphic', subtype: 'token', pageid: pgid })
                        .filter(t => t.get('represents').length && findObjs({ type: 'character', id: t.get('represents') })[0].get('name') === info)
                ].filter(checkControl);
                if (!tokens.length) {
                    tokens = findObjs({ type: 'graphic', subtype: 'token', name: info });
                    if (tokens.length > 1 || !checkControl(tokens[0])) {
                        tokens = [];
                    }
                }
            }
            return tokens[0];
        };

        const getTrackerRecord = (query) => {
            let partsrx = /^([^@|+|#]+){0,1}(@(.+)|#(\d+)|\+){0,1}/;
            let res = partsrx.exec(query);
            let ret = {};
            if (res[2] === '+') { // add new turn
                ret.type = 'new';
            } else if (res[3]) { // current tracker value
                ret.type = 'value';
                ret.value = res[3];
            } else if (res[4]) { // index of turn for multi-turn token
                ret.type = 'index';
                ret.value = res[4];
            }
            if (!res[1]) { // no token identifier
                if (preserved.selected && preserved.selected.length) {
                    ret.token = getToken(preserved.selected[0]._id);
                }
            } else {
                if (ret.type && ['value', 'index'].includes(ret.type)) {
                    ret.token = getToken(res[1], ret);
                } else {
                    ret.token = getToken(res[1]);
                }
            }
            return ret;
        };
        const openRoll = (index) => {
            let testSet = [trackertm, opentm, closetm, eostm];
            let res;
            let tokens = [];
            let tags = [];

            res = getFirst(preserved.content.slice(index), ...testSet);
            index += res.index;
            while (!['eos', 'close'].includes(res.type)) {
                if (res.type === 'open') {
                    index += res[0].length;
                    index = openRoll(index);
                } else if (res.type === 'tracker') {
                    tags.push(index);
                    if (!res[1]) {
                        if (preserved.selected && preserved.selected.length) {
                            tokens.push(getTrackerRecord(preserved.selected[0]._id));
                        }
                    } else {
                        res[1].split(/\s*,\s*/).forEach(t => tokens.push(getTrackerRecord(t)));
                    }
                    index += res[0].length;
                }
                res = getFirst(preserved.content.slice(index), ...testSet);
                index += res.index;
            }

            if (res.type === 'close') {
                trackerindexarray.push(...tags);
                initArray.push(...tokens.map(t => [rollcount, t]));
                rollcount++;
                index += res[0].length;
            }
            return index;
        };

        while (index < preserved.content.length) {
            res = getFirst(preserved.content.slice(index), opentm, eostm);
            index += res.index;
            if (res.type === 'open') {
                index += res[0].length;
                index = openRoll(index);
            } else {
                index = preserved.content.length;
            }
        }

        trackerindexarray.sort((a, b) => b - a).forEach(t => {
            preserved.content = `${preserved.content.slice(0, t)}${preserved.content.slice(t).replace(assertStart(trackerrx), '')}`;
        });
        preserved.initArray = initArray;
    };

    // ==================================================
    //      GLOBAL DEFINITIONS
    // ==================================================

    const getGlobals = msg => {

        class TextToken {
            constructor({ value: value = '' } = {}) {
                this.type = 'text';
                this.value = value;
            }
        }
        class GlobalToken {
            constructor({ value: value = '' } = {}) {
                this.type = 'global';
                this.value = value;
            }
        }
        let index = 0;
        let gres;
        let globalrx = /{&\s*globals?\s+/gi;
        //        let definitionrx = /\(\s*\[\s*(?<term>.+?)\s*]\s*('|"|`?)(?<definition>.*?)\2\)\s*/g;
        let definitionrx = /\(\s*\[\s*(?<term>.+?)\s*]\s*('|"|`?)(?<definition>.*?)\2(?:\)(?<!\({&\d+}\)\s*))\s*/g;
        let tokens = [];

        const closureCheck = (c, counter = 0) => {
            let pos = 0;
            let loop = true;
            while (loop && pos <= c.length - 1) {
                if (c.charAt(pos) === '{') counter++;
                else if (c.charAt(pos) === '}') counter--;
                if (counter === 0) loop = false;
                pos++;
            }
            return loop ? undefined : pos;
        }
        while (globalrx.test(msg.content)) {
            globalrx.lastIndex = index;
            gres = globalrx.exec(msg.content);
            tokens.push(new TextToken({ value: msg.content.slice(index, gres.index) }));
            let p = closureCheck(msg.content.slice(gres.index)) || gres[0].length;
            tokens.push(new GlobalToken({ value: msg.content.slice(gres.index, gres.index + p) }));
            index = gres.index + p;
        }
        tokens.push(new TextToken({ value: msg.content.slice(index) }));
        definitionrx.lastIndex = 0;
        return tokens.reduce((m, t) => {
            if (t.type === 'text' || (t.type === 'global' && !/}$/.test(t.value))) {
                m.cmd = `${m.cmd}${t.value}`;
            } else {
                t.value.replace(definitionrx, (match, term, _, def) => {
                    m.globals[term] = def;
                    return match;
                });
            }
            return m;
        }, { cmd: '', globals: {} });

    };
    // ==================================================
    //      THE LOOP & LOOP MANAGEMENT
    // ==================================================
    const setOrder = (msg, preservedstate) => {
        let orderrx = /(\()?{&\s*0\s+([^}]+?)\s*}((?<=\({&\s*0\s+([^}]+?)\s*})\)|\1)/g;
        msg.content = msg.content.replace(orderrx, (m, padding, list) => {
            let order = list
                .split(/\s+/)
                .map(l => preservedstate.looporder.filter(f => f.name === l || f.handles.includes(l))[0])
                .filter(f => f);
            let orderedfuncs = order.map(f => f.name);
            preservedstate.looporder = [...order, ...preservedstate.looporder.filter(f => !orderedfuncs.includes(f.name))];
            return '';
        })
    };
    const runLoop = (preserved, preservedstate, apitrigger, msg = {}) => {
        const delayrx = /{&\s*delay(?:\((.+?)\))?\s+(.*?)\s*}/gi
        preservedstate.runloop = false;
        preservedstate.loopcount++;
        trackhistory(msg, preservedstate, { action: `LOOP ${preservedstate.loopcount}` });
        handleLogging(msg, preservedstate);
        setOrder(msg, preservedstate);
        if (preservedstate.logging) {
            log(`LOOP ${preservedstate.loopcount}`);
        }
        if (preservedstate.logging) {
            log(`====MSG DATA====`);
            log(`  CONT: ${preserved.content}`);
            log(`  DEFS: ${JSON.stringify(preserved.definitions || [])}`);
        }
        handleInit(msg, preserved, preservedstate);
        getLoopRolls(msg, preserved, preservedstate);
        preserved.content = msg.content.replace(/(<br\/>)?\n/g, '({&br})');
        if (!preserved.rolltemplate && msg.rolltemplate && msg.rolltemplate.length) preserved.rolltemplate = msg.rolltemplate;
        msg.content = `${msg.apitrigger}`;
        // manage delay
        let delay = 0;
        let delaydeferrals = [];
        preserved.content = preserved.content.replace(delayrx, (m, def, del) => {
            delay = Math.max(delay, (Number(del) || 0));
            if (def) delaydeferrals.push(def);
            return '';
        });
        if (delay > 0) {
            let delaycmd = delaydeferrals.reduce((m, def) => {
                m = m.replace(new RegExp(escapeRegExp(def), 'g'), '');
                return m;
            }, preserved.content);
            setTimeout(sendChat, delay * 1000, '', delaycmd);
            msg.content = ''; // flatten the original message so other scripts don't take action
            return { delay: true };
        }
        preservedstate.runloop = getValues(preserved) || preservedstate.runloop;
        // manage global definitions
        let globalCheck = getGlobals(preserved);
        let globalnote = 'No global detected.';
        if (Object.keys(globalCheck.globals).length) {
            globalnote = Object.keys(globalCheck.globals).map(k => `&bull; ${k}: ${globalCheck.globals[k]}`).join('<br>');
        }
        preserved.globals = Object.assign({}, (preserved.globals || {}), globalCheck.globals);
        Object.keys(preserved.globals).forEach(k => {
            globalCheck.cmd = globalCheck.cmd.replace(new RegExp(escapeRegExp(k), 'g'), preserved.globals[k]);
        });
        if (globalCheck.cmd !== preserved.content) {
            preserved.content = globalCheck.cmd;
            trackhistory(preserved, preservedstate, { action: 'GLOBALS', notes: `Global tag detected.<br>${globalnote}`, status: 'changed' });
            preservedstate.runloop = true;
        } else {
            trackhistory(preserved, preservedstate, { action: 'GLOBALS', notes: ``, status: 'unchanged' });
        }

        // loop through registered functions
        let funcret;
        preservedstate.looporder.forEach(f => {
            if (preservedstate.logging) log(`...RUNNING ${f.name}`);

            funcret = f.func(preserved, preservedstate);
            if (preservedstate.logging) {
                log(`....MSG DATA....`);
                log(`  CONT: ${preserved.content}`);
                log(`  DEFS: ${JSON.stringify(preserved.definitions || [])}`);
            }
            // returned object should include { runloop: boolean, status: (changed|unchanged|unresolved), notes: text}
            trackhistory(preserved, preservedstate, { action: f.name, notes: funcret.notes, status: funcret.status });
            preservedstate.runloop = preservedstate.runloop || funcret.runloop;
            // replace inline rolls tagged with .value
            getValues(preserved);

        });
        // custom roll marker (open/close)
        preserved.content = preserved.content.replace(/(\({&\s*r\s*}\)|{&\s*r\s*})/gim, m => {
            preservedstate.runloop = true;
            return '[[';
        });
        preserved.content = preserved.content.replace(/(\({&\s*\/r\s*}\)|{&\s*\/r\s*})/gim, m => {
            preservedstate.runloop = true;
            return ']]'
        });

        // see if we're done
        if (preservedstate.runloop) {
            if (preservedstate.history.filter(h => /^LOOP\s/.test(h.action) && h.content === preserved.content).length > 5) {
                msgbox({ c: 'Possible infinite loop detected. Check ZeroFrame log for more information.', wto: preserved.who });
                preservedstate.logging = true;
                releaseMsg(preserved, preservedstate, apitrigger, msg);
            } else {
                // un-escape characters
                preserved.content = preserved.content.replace(/(\[\\+]|\\.)/gm, m => {
                    if (/^\[/.test(m)) {
                        return m.length === 3 ? `[` : `[${Array(m.length - 2).join(`\\`)}]`;
                    } else {
                        return `${Array(m.length - 1).join(`\\`)}${m.slice(-1)}`;
                    }
                });
                // custom roll marker (open/close)
                preserved.content = preserved.content.replace(/(\({&\s*r\s*}\)|{&\s*r\s*})/gim, '[[');
                preserved.content = preserved.content.replace(/(\({&\s*\/r\s*}\)|{&\s*\/r\s*})/gim, ']]');
                // convert nested inline rolls to value
                nestedInline(preserved);
                // look for {&tracker} tags
                customTracker(preserved);
                // replace other inline roll markers with ({&#}) formation
                preserved.content = preserved.content.replace(/\$\[\[(\d+)]]/g, `({&$1})`);
                // properly format rolls that would normally fail in the API (but work in chat)
                preserved.content = preserved.content.replace(/\[\[\s+/g, '[[');
                // send new command line through chat
                sendChat('', preserved.content);
                msg.content = ''; // flatten the original message so other scripts don't take action
            }
        } else {
            return releaseMsg(preserved, preservedstate, apitrigger, msg);
        }
    };

    // ==================================================
    //      RELEASING THE MESSAGE
    // ==================================================
    const releaseMsg = (preserved, preservedstate, apitrigger, msg) => {
        // we're on our way out of the script, format everything and release message
        let notes = [];
        let releaseAction = `OUTRO`;
        // remove the apitrigger
        preserved.content = preserved.content.replace(apitrigger, '');
        // replace all ZF formatted inline roll shorthand markers with roll20 formatted shorthand markers
        preserved.content = preserved.content.replace(/\({&(\d+)}\)/g, `$[[$1]]`);
        // replace inline rolls tagged with .value
        getValues(preserved, true);

        const stoprx = /(\()?{&\s*stop\s*}((?<=\({&\s*stop\s*})\)|\1)/gi,
            escaperx = /(\()?{&\s*escape\s+([^}]+?)\s*}((?<=\({&\s*escape\s+([^}]+?)\s*})\)|\1)/gi,
            simplerx = /(\()?{&\s*(simple|flat)\s*}((?<=\({&\s*(simple|flat)\s*})\)|\1)/gi,
            templaterx = /(\()?{&\s*template:([^}]+?)}((?<=\({&\s*template:([^}]+?)})\)|\1)/gi;

        const escapeCheck = () => {
            // check for ESCAPE tag
            let escapearray = [];
            if (preserved.content.match(escaperx)) {
                notes.push(`ESCAPE tag detected`)
                preserved.content = preserved.content.replace(escaperx, (m, padding, escchar) => {
                    escapearray.push(escchar);
                    return ``;
                });
                escapearray.forEach(e => {
                    preserved.content = preserved.content.replace(new RegExp(escapeRegExp(e), 'g'), '');
                });
            }
        };
        // check for STOP tag
        if (preserved.content.match(stoprx)) {
            trackhistory(preserved, preservedstate, { action: releaseAction, notes: `STOP detected`, status: 'stop' });
            if (preservedstate.logging) buildLog(preserved, preservedstate, apitrigger);
            preserved.content = '';
            return { release: true };
        }
        // check for TEMPLATE tag
        let temptag;
        if (preserved.content.match(templaterx)) {
            preserved.content = preserved.content.replace(templaterx, (m, padding, template) => {
                temptag = true;
                notes.push(`TEMPLATE tag detected`);
                return `&{template:${template}}`;
            });
        }
        // line break replacements
        preserved.content = preserved.content
            .replace(/(\({&\s*cr\s*}\)|{&\s*cr\s*})/gi, '<br>\n')
            .replace(/(\({&\s*nl\s*}\)|{&\s*nl\s*})/gi, '\n')
            .replace(/(\({&\s*tp\s*}\)|{&\s*tp\s*})/gi, '{{')
            .replace(/(\({&\s*\/tp\s*}\)|{&\s*\/tp\s*})/gi, '}}');
        // check for SIMPLE tag
        if (preserved.content.match(simplerx)) {
            notes.push(`SIMPLE or FLAT tag detected`)
            preserved.content = preserved.content.replace(/^!+\s*/, '')
                .replace(simplerx, '')
                .replace(/\$\[\[(\d+)]]/g, ((m, g1) => typeof preserved.parsedinline[g1] === 'undefined' ? m : preserved.parsedinline[g1].getRollTip()))
                .replace(/\({&br}\)/g, '<br/>\n');
            if (preserved.rolltemplate && !temptag) {
                let dbpos = preserved.content.indexOf(`{{`);
                dbpos = dbpos === -1 ? 0 : dbpos;
                preserved.content = `${preserved.content.slice(0, dbpos)}&{template:${preserved.rolltemplate}} ${preserved.content.slice(dbpos)}`;
            }
            let speakas = '';
            if (preserved.who.toLowerCase() === 'api') {
                speakas = '';
            } else {
                speakas = (findObjs({ type: 'character' }).filter(c => c.get('name') === preserved.who)[0] || { id: '' }).id;
                if (speakas) speakas = `character|${speakas}`;
                else speakas = `player|${preserved.playerid}`;
            }
            trackhistory(preserved, preservedstate, { action: releaseAction, notes: notes.join('<br>'), status: 'simple' });
            if (preservedstate.logging) buildLog(preserved, preservedstate, apitrigger);
            escapeCheck();
            sendChat(speakas, preserved.content);
            setTimeout(() => { delete preservedMsgObj[apitrigger] }, 3000);
            return { release: true };
        } else if (getConfigItem('singlebang')) {
            preserved.content = preserved.content.replace(/^!!+\s*/, '!');
        }
        escapeCheck();
        trackhistory(preserved, preservedstate, { action: releaseAction, notes: notes.join('<br>'), status: 'release' });
        if (preservedstate.logging) buildLog(preserved, preservedstate, apitrigger);

        // release the message to other scripts (FINAL OUTPUT)
        preserved.content = preserved.content.replace(/\({&br}\)/g, '<br/>\n');
        if (preserved.inlinerolls && !preserved.inlinerolls.length) delete preserved.inlinerolls;
        Object.keys(preserved).forEach(k => msg[k] = preserved[k]);

        setTimeout(() => { delete preservedMsgObj[apitrigger] }, 3000);
        return { release: true };
    };
    const zfconfig = /^!0\s*(?<scripts>(?:(?:[A-Za-z]+\|\d+)(?:\s+|$))+)/;
    const testConstructs = (c) => {
        if (/^!0(\s+(cfg|config)|\s*$)/.test(c)) return 'showconfig';
        if (zfconfig.test(c)) return 'runconfig';
        if (/^!0(\s+help|$)/.test(c)) return 'help';
    };

    // ==================================================
    //      HANDLE INPUT
    // ==================================================
    const handleInput = (msg) => {
        const trigrx = new RegExp(`^!(${Object.keys(preservedMsgObj).join('|')})`);
        const batchtrigrx = new RegExp(`^!(${Object.keys(batchMsgLibrary).map(k => escapeRegExp(`{&batch ${k}}`)).join('|')})`, '');
        let preserved,
            preservedstate,
            apitrigger; // the apitrigger used by the message
        let restoreMsg;
        if (msg.type !== 'api') return;
        let configtest = testConstructs(msg.content); // special commands for zeroframe
        if (configtest) {
            let statefunc,
                localfunc;
            let configerrors = [];
            switch (configtest) {
                case 'showconfig':
                    buildConfig(msg);
                    break;
                case 'runconfig':
                    zfconfig.exec(msg.content).groups.scripts
                        .trim()
                        .split(/\s+/)
                        .map(c => c.split('|'))
                        .forEach(c => {
                            statefunc = state[apiproject].config.looporder.filter(f => f.name === c[0] || f.handles.includes(c[0]))[0];
                            if (!statefunc) {
                                configerrors.push(`No script found for ${c[0]}.`);
                            } else {
                                if (isNaN(Number(c[1]))) {
                                    configerrors.push(`Priority supplied for ${c[0]} was not a number.`);
                                } else {
                                    if (statefunc) statefunc.priority = Number(c[1]);
                                    localfunc = loopFuncs.filter(f => f.name === c[0] || f.handles.includes(c[0]))[0];
                                    if (localfunc) localfunc.priority = Number(c[1]);
                                }
                            }
                        });
                    buildConfig(msg);
                    if (configerrors.length) {
                        msgbox({ c: configerrors.join('<br>'), wto: msg.who });
                    }
                    break;
                case 'help':
                    // TO DO: build help output
                    break;
                default:
            }
        } else {
            const skiprx = /(\()?{&\s*skip\s*}((?<=\({&\s*skip\s*})\)|\1)/gi;
            if (msg.content.match(skiprx)) {
                msg.content = msg.content.replace(skiprx, '');
                return;
            }
            if (Object.keys(preservedMsgObj).length && trigrx.test(msg.content)) { // check all active apitriggers in play
                apitrigger = trigrx.exec(msg.content)[1];
                preserved = preservedMsgObj[apitrigger].message;
                preservedstate = preservedMsgObj[apitrigger].state;
            } else {    // not prepended with apitrigger, original or batch-dispatched message
                if (Object.keys(batchMsgLibrary).length && batchtrigrx.test(msg.content)) {
                    let bres = batchtrigrx.exec(msg.content);
                    let msgID = bres[0].slice(9, -1);
                    msg.content = `!${msg.content.slice(bres[0].length)}`;
                    restoreMsg = batchMsgLibrary[msgID];
                    if (restoreMsg) {
                        msg.batch = msgID;
                    }
                }
                msg.unlock = { zeroframe: generateUUID() };
                apitrigger = `${apiproject}${generateUUID()}`;
                msg.apitrigger = apitrigger;
                msg.origcontent = msg.content;
                msg.content = msg.content.replace(/(<br\/>)?\n/g, '({&br})'); //.replace(/^!(\{\{(.*)\}\})/, '!$2');
                msg.content = `!${apitrigger}${msg.content.slice(1)}`;
                if (restoreMsg && restoreMsg.hasOwnProperty('message')) {
                    // this is a batched dispatch, restore non-Roll20 properties like mules, conditional tests, definitions, etc.
                    Object.keys(restoreMsg.message).filter(k => !['inlinerolls', 'parsedinline', 'content'].includes(k))
                        .forEach(k => ['who', 'playerid'].includes(k)
                            ? msg[k] = restoreMsg.message[k]
                            : msg[k] = msg[k] || restoreMsg.message[k]);
                }
                preservedMsgObj[apitrigger] = { message: _.clone(msg), state: initState() };
                preserved = preservedMsgObj[apitrigger].message;
                preservedstate = preservedMsgObj[apitrigger].state;

                if (restoreMsg && restoreMsg.hasOwnProperty('message') && restoreMsg.message.hasOwnProperty('inlinerolls') && restoreMsg.message.inlinerolls.length) {
                    preserved.inlinerolls = [...restoreMsg.message.inlinerolls];
                    preserved.parsedinline = [...restoreMsg.message.parsedinline];
                } else {
                    preserved.inlinerolls = [];
                    preserved.parsedinline = [];
                }

                trackhistory(preserved, preservedstate, { action: 'ORIGINAL MESSAGE' });
            }
            let loopstate = runLoop(preserved, preservedstate, apitrigger, msg);
            if (loopstate && loopstate.delay) { //if we delay the command, we should not immediately dispatch the next
                return;
            }
            if (loopstate && loopstate.release && preserved.batch) {
                restoreMsg = restoreMsg || batchMsgLibrary[preserved.batch];
                if (restoreMsg && restoreMsg.hasOwnProperty('commands')) {
                    if (restoreMsg.commands.length) {
                        sendChat('BatchOp', restoreMsg.commands.shift());
                    } else {
                        delete batchMsgLibrary[restoreMsg.message.messageID];
                    }
                }
            }
        }
    };

    // ==================================================
    //		BATCH OPERATIONS
    // ==================================================
    const getBatchTextBreakpoint = c => {
        let counter = 1;
        let pos = 3;
        let openprime = false;
        let closeprime = false;
        while (counter !== 0 && pos <= c.length - 1) {
            if (c.charAt(pos) === '{') {
                closeprime = false;
                if (openprime) {
                    counter++;
                    openprime = false;
                } else {
                    openprime = true;
                }
            } else if (c.charAt(pos) === '}') {
                openprime = false;
                if (closeprime) {
                    counter--;
                    closeprime = false;
                } else {
                    closeprime = true;
                }
            } else {
                openprime = false;
                closeprime = false;
            }
            pos++;
        }
        return pos;
    };

    // ==================================================
    //		BATCH HANDLE INPUT
    // ==================================================
    const handleBatchInput = (msg) => {
        if (msg.type !== 'api' || !/^!{{/.test(msg.content)) return;
        //Object.keys(batchMsgLibrary).filter(k => Date.now() - batchMsgLibrary[k].time > 10000).forEach(k => delete batchMsgLibrary[k]);
        msg.messageID = undefined;

        const storeOutbound = (cmd) => {
            if (!msg.messageID) {
                msg.messageID = generateUUID();
                batchMsgLibrary[msg.messageID] = { message: _.clone(msg), time: Date.now(), commands: [] };
            }
            batchMsgLibrary[msg.messageID].commands.push(`!{&batch ${msg.messageID}}${cmd.replace(/\$\[\[(\d+)]]/g, `({&$1})`)}`);
        };
        let cleancmd = msg.content.replace(/\({\)/g, '{{').replace(/\(}\)/g, '}}');
        let breakpoint = getBatchTextBreakpoint(cleancmd) + 1;
        let [batchText, remainingText] = [cleancmd.slice(0, breakpoint), cleancmd.slice(breakpoint)];
        let lines = batchText.split(/(<br\/>)?\n/gi)
            .map(l => (l || '').trim())
            .filter(l => l.length && '<br/>' !== l)
            .reduce((m, l, i, a) => {
                if (i === 0 || i === a.length - 1) {
                    m.lines.push(l);
                    return m;
                }
                m.count += ((l.match(/{{/g) || []).length - (l.match(/}}/g) || []).length);
                m.temp.push(l);
                if (m.count === 0) {
                    m.lines.push(m.temp.join(' '));
                    m.temp = [];
                }
                return m;
            }, { count: 0, lines: [], temp: [] })
            .lines || [];
        let escapeall = '';
        let escaperx = /^\((.+?)\)/g;
        let escapeallrx = /^!{{(?:\((.+?)\))?/;
        if (escapeallrx.test(lines[0])) {
            escapeallrx.lastIndex = 0;
            escapeall = escapeallrx.exec(lines[0])[1] || '';
        }
        escapeallrx.lastIndex = 0;
        lines[0] = lines[0].replace(escapeallrx, ''); // in case there is a command on the first line
        lines[lines.length - 1] = lines[lines.length - 1].replace(/}}(?!}})/, ''); // in case there is a command on the last line
        lines.filter(l => l.length).forEach(l => {
            // handle escape characters
            let escapelocal = '';
            escaperx.lastIndex = 0;
            if (escaperx.test(l)) {
                escaperx.lastIndex = 0;
                let eres = escaperx.exec(l);
                escapelocal = eres[1];
                l = l.slice(eres[0].length);
            }
            if (escapeall.length) l = l.replace(new RegExp(escapeRegExp(escapeall), 'g'), '');
            if (escapelocal.length) l = l.replace(new RegExp(escapeRegExp(escapelocal), 'g'), '');

            if (!/^!/.test(l)) { // this isn't a script message
                l = `!${l}{&simple}`;
            }
            storeOutbound(l);
            //            dispatchOutbound(l);

        });
        if (batchMsgLibrary[msg.messageID] && batchMsgLibrary[msg.messageID].commands && batchMsgLibrary[msg.messageID].commands.length) {
            sendChat('BatchOp', batchMsgLibrary[msg.messageID].commands.shift());
        }

        msg.content = remainingText;

        return;
    };

    // ==================================================
    //		DEPENDENCIES
    // ==================================================

    const checkDependencies = (deps) => {
        /* pass array of objects like
            { name: 'ModName', version: '#.#.#' || '', mod: ModName || undefined, checks: [ [ExposedItem, type], [ExposedItem, type] ] }
        */
        const dependencyEngine = (deps) => {
            const versionCheck = (mv, rv) => {
                let modv = [...mv.split('.'), ...Array(4).fill(0)].slice(0, 4);
                let reqv = [...rv.split('.'), ...Array(4).fill(0)].slice(0, 4);
                return reqv.reduce((m, v, i) => {
                    if (m.pass || m.fail) return m;
                    if (i < 3) {
                        if (parseInt(modv[i]) > parseInt(reqv[i])) m.pass = true;
                        else if (parseInt(modv[i]) < parseInt(reqv[i])) m.fail = true;
                    } else {
                        // all betas are considered below the release they are attached to
                        if (reqv[i] === 0 && modv[i] === 0) m.pass = true;
                        else if (modv[i] === 0) m.pass = true;
                        else if (reqv[i] === 0) m.fail = true;
                        else if (parseInt(modv[i].slice(1)) >= parseInt(reqv[i].slice(1))) m.pass = true;
                    }
                    return m;
                }, { pass: false, fail: false }).pass;
            };

            let result = { passed: true, failures: {}, optfailures: {} };
            deps.forEach(d => {
                let failObj = d.optional ? result.optfailures : result.failures;
                if (!d.mod) {
                    if (!d.optional) result.passed = false;
                    failObj[d.name] = 'Not found';
                    return;
                }
                if (d.version && d.version.length) {
                    if (!(API_Meta[d.name].version && API_Meta[d.name].version.length && versionCheck(API_Meta[d.name].version, d.version))) {
                        if (!d.optional) result.passed = false;
                        failObj[d.name] = `Incorrect version. Required v${d.version}. ${API_Meta[d.name].version && API_Meta[d.name].version.length ? `Found v${API_Meta[d.name].version}` : 'Unable to tell version of current.'}`;
                        return;
                    }
                }
                d.checks.reduce((m, c) => {
                    if (!m.passed) return m;
                    let [pname, ptype] = c;
                    if (!d.mod.hasOwnProperty(pname) || typeof d.mod[pname] !== ptype) {
                        if (!d.optional) m.passed = false;
                        failObj[d.name] = `Incorrect version.`;
                    }
                    return m;
                }, result);
            });
            return result;
        };
        let depCheck = dependencyEngine(deps);
        let failures = '', contents = '', msg = '';
        if (Object.keys(depCheck.optfailures).length) { // optional components were missing
            failures = Object.keys(depCheck.optfailures).map(k => `&bull; <code>${k}</code> : ${depCheck.optfailures[k]}`).join('<br>');
            contents = `<span style="font-weight: bold">${apiproject}</span> utilizies one or more other scripts for optional features, and works best with those scripts installed. You can typically find these optional scripts in the 1-click Mod Library:<br>${failures}`;
            msg = `<div style="width: 100%;border: none;border-radius: 0px;min-height: 60px;display: block;text-align: left;white-space: pre-wrap;overflow: hidden"><div style="font-size: 14px;font-family: &quot;Segoe UI&quot;, Roboto, Ubuntu, Cantarell, &quot;Helvetica Neue&quot;, sans-serif"><div style="background-color: #000000;border-radius: 6px 6px 0px 0px;position: relative;border-width: 2px 2px 0px 2px;border-style:  solid;border-color: black;"><div style="border-radius: 18px;width: 35px;height: 35px;position: absolute;left: 3px;top: 2px;"><img style="background-color: transparent ; float: left ; border: none ; max-height: 40px" src="${typeof apilogo !== 'undefined' ? apilogo : 'https://i.imgur.com/kxkuQFy.png'}"></div><div style="background-color: #c94d4d;font-weight: bold;font-size: 18px;line-height: 36px;border-radius: 6px 6px 0px 0px;padding: 4px 4px 0px 43px;color: #ffffff;min-height: 38px;">MISSING MOD DETECTED</div></div><div style="background-color: white;padding: 4px 8px;border: 2px solid #000000;border-bottom-style: none;color: #404040;">${contents}</div><div style="background-color: white;text-align: right;padding: 4px 8px;border: 2px solid #000000;border-top-style: none;border-radius: 0px 0px 6px 6px"></div></div></div>`;
            sendChat(apiproject, `/w gm ${msg}`);
        }
        if (!depCheck.passed) {
            failures = Object.keys(depCheck.failures).map(k => `&bull; <code>${k}</code> : ${depCheck.failures[k]}`).join('<br>');
            contents = `<span style="font-weight: bold">${apiproject}</span> requires other scripts to work. Please use the 1-click Mod Library to correct the listed problems:<br>${failures}`;
            msg = `<div style="width: 100%;border: none;border-radius: 0px;min-height: 60px;display: block;text-align: left;white-space: pre-wrap;overflow: hidden"><div style="font-size: 14px;font-family: &quot;Segoe UI&quot;, Roboto, Ubuntu, Cantarell, &quot;Helvetica Neue&quot;, sans-serif"><div style="background-color: #000000;border-radius: 6px 6px 0px 0px;position: relative;border-width: 2px 2px 0px 2px;border-style:  solid;border-color: black;"><div style="border-radius: 18px;width: 35px;height: 35px;position: absolute;left: 3px;top: 2px;"><img style="background-color: transparent ; float: left ; border: none ; max-height: 40px" src="${typeof apilogo !== 'undefined' ? apilogo : 'https://i.imgur.com/kxkuQFy.png'}"></div><div style="background-color: #c94d4d;font-weight: bold;font-size: 18px;line-height: 36px;border-radius: 6px 6px 0px 0px;padding: 4px 4px 0px 43px;color: #ffffff;min-height: 38px;">MISSING MOD DETECTED</div></div><div style="background-color: white;padding: 4px 8px;border: 2px solid #000000;border-bottom-style: none;color: #404040;">${contents}</div><div style="background-color: white;text-align: right;padding: 4px 8px;border: 2px solid #000000;border-top-style: none;border-radius: 0px 0px 6px 6px"></div></div></div>`;
            sendChat(apiproject, `/w gm ${msg}`);
            return false;
        }
        return true;
    };


    on('chat:message', handleInput);

    on('ready', () => {
        versionInfo();
        logsig();
        let reqs = [
            {
                name: 'libInline',
                version: `1.0.4`,
                mod: typeof libInline !== 'undefined' ? libInline : undefined,
                checks: [
                    ['getRollData', 'function'],
                    ['getDice', 'function'],
                    ['getValue', 'function'],
                    ['getTables', 'function'],
                    ['getParsed', 'function'],
                    ['getRollTip', 'function']
                ]
            }
        ];
        if (!checkDependencies(reqs)) return;
        on('chat:message', handleBatchInput);

    });

    return {
        RegisterMetaOp: registerMetaOp
    };

})();
{ try { throw new Error(''); } catch (e) { API_Meta.ZeroFrame.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.ZeroFrame.offset); } }
/* */
/*
================================================================
END SCRIPT: ZeroFrame
================================================================
*/

/*
================================================================
BEGIN SCRIPT: Messenger
SOURCE FILE: Messenger.md
================================================================
*/
/* eslint no-prototype-builtins: "off" */
/*
=========================================================
Name			:	Messenger
GitHub			:	
Roll20 Contact	:	timmaugh
Version			:	1.0.2
Last Update		:	20 MAY 2025
=========================================================
*/
var API_Meta = API_Meta || {};
API_Meta.Messenger = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{ try { throw new Error(''); } catch (e) { API_Meta.Messenger.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (13)); } }

const Messenger = (() => { // eslint-disable-line no-unused-vars
    const apiproject = 'Messenger';
    const apilogo = `https://i.imgur.com/DEkWTak.png`;
    const version = '1.0.2';
    const schemaVersion = 0.1;
    API_Meta[apiproject].version = version;
    const vd = new Date(1747744062840);
    const versionInfo = () => {
        log(`\u0166\u0166 ${apiproject} v${API_Meta[apiproject].version}, ${vd.getFullYear()}/${vd.getMonth() + 1}/${vd.getDate()} \u0166\u0166 -- offset ${API_Meta[apiproject].offset}`);
    };
    const logsig = () => {
        // initialize shared namespace for all signed projects, if needed
        state.torii = state.torii || {};
        // initialize siglogged check, if needed
        state.torii.siglogged = state.torii.siglogged || false;
        state.torii.sigtime = state.torii.sigtime || Date.now() - 3001;
        if (!state.torii.siglogged || Date.now() - state.torii.sigtime > 3000) {
            const logsig = '\n' +
                '  _____________________________________________   ' + '\n' +
                '   )_________________________________________(    ' + '\n' +
                '     )_____________________________________(      ' + '\n' +
                '           ___| |_______________| |___            ' + '\n' +
                '          |___   _______________   ___|           ' + '\n' +
                '              | |               | |               ' + '\n' +
                '              | |               | |               ' + '\n' +
                '              | |               | |               ' + '\n' +
                '              | |               | |               ' + '\n' +
                '              | |               | |               ' + '\n' +
                '______________|_|_______________|_|_______________' + '\n' +
                '                                                  ' + '\n';
            log(`${logsig}`);
            state.torii.siglogged = true;
            state.torii.sigtime = Date.now();
        }
        return;
    };
    // ==================================================
    //		STATE MANAGEMENT
    // ==================================================
    const checkInstall = () => {
        if (!state.hasOwnProperty(apiproject) || state[apiproject].version !== schemaVersion) { // eslint-disable-line no-prototype-builtins
            log(`  > Updating ${apiproject} Schema to v${schemaVersion} <`);
            switch (state[apiproject] && state[apiproject].version) {

                case 0.1:
                /* falls through */

                case 'UpdateSchemaVersion':
                    state[apiproject].version = schemaVersion;
                    break;

                default:
                    state[apiproject] = {
                        settings: {
                        },
                        defaults: {
                        },
                        version: schemaVersion
                    }
                    break;
            }
        }
    };
    let stateReady = false;
    const assureState = () => {
        if (!stateReady) {
            checkInstall();
            stateReady = true;
        }
    };
    const manageState = { // eslint-disable-line no-unused-vars
        reset: () => state[apiproject].settings = _.clone(state[apiproject].defaults),
        clone: () => { return _.clone(state[apiproject].settings); },
        set: (p, v) => state[apiproject].settings[p] = v,
        get: (p) => { return state[apiproject].settings[p]; }
    };

    // ============================================
    //      PRESENTATION
    // ============================================
    const getTextColor = (h) => {
        h = `#${h.replace(/#/g, '')}`;
        let hc = hexToRGBA(h);
        return (((hc[0] * 299) + (hc[1] * 587) + (hc[2] * 114)) / 1000 >= 128) ? "#000000" : "#ffffff";
    };
    const hexToRGBA = (hex, alpha, reqAlpha = 'auto') => {

        const isValidHex = (hex) => /^#([A-Fa-f0-9]{3,4}){1,2}$/.test(hex);

        const getChunksFromString = (st, chunkSize) => st.match(new RegExp(`.{${chunkSize}}`, "g"));

        const convertHexUnitTo256 = (hexStr) => parseInt(hexStr.repeat(2 / hexStr.length), 16);

        const getAlphafloat = (a, alpha) => {
            if (typeof a !== "undefined") { return a / 255 }
            if ((typeof alpha != "number") || alpha < 0 || alpha > 1) { // eslint-disable-line eqeqeq
                return 1
            }
            return alpha
        };

        if (!isValidHex(hex)) { throw new Error("Invalid HEX") }
        const chunkSize = Math.floor((hex.length - 1) / 3)
        const hexArr = getChunksFromString(hex.slice(1), chunkSize)
        const [r, g, b, a] = hexArr.map(convertHexUnitTo256)
        switch (reqAlpha) {
            case true:
                return `rgba(${r}, ${g}, ${b}, ${getAlphafloat(a, alpha)})`;
            case false:
                return `rgb(${r}, ${g}, ${b})`;
            default:
                return `rgb${a || alpha ? 'a' : ''}(${r}, ${g}, ${b}${a || alpha ? `, ${getAlphafloat(a, alpha)}` : ''})`;
        }
    };

    //const hexToRGB = (h) => {
    //    let r = 0, g = 0, b = 0;

    //    // 3 digits
    //    if (h.length === 4) {
    //        r = "0x" + h[1] + h[1];
    //        g = "0x" + h[2] + h[2];
    //        b = "0x" + h[3] + h[3];
    //        // 6 digits
    //    } else if (h.length === 7) {
    //        r = "0x" + h[1] + h[2];
    //        g = "0x" + h[3] + h[4];
    //        b = "0x" + h[5] + h[6];
    //    }
    //    return [+r, +g, +b];
    //};
    const validCSSColors = {
        AliceBlue: `#F0F8FF`,
        AntiqueWhite: `#FAEBD7`,
        Aqua: `#00FFFF`,
        Aquamarine: `#7FFFD4`,
        Azure: `#F0FFFF`,
        Beige: `#F5F5DC`,
        Bisque: `#FFE4C4`,
        Black: `#000000`,
        BlanchedAlmond: `#FFEBCD`,
        Blue: `#0000FF`,
        BlueViolet: `#8A2BE2`,
        Brown: `#A52A2A`,
        BurlyWood: `#DEB887`,
        CadetBlue: `#5F9EA0`,
        Chartreuse: `#7FFF00`,
        Chocolate: `#D2691E`,
        Coral: `#FF7F50`,
        CornflowerBlue: `#6495ED`,
        Cornsilk: `#FFF8DC`,
        Crimson: `#DC143C`,
        Cyan: `#00FFFF`,
        DarkBlue: `#00008B`,
        DarkCyan: `#008B8B`,
        DarkGoldenrod: `#B8860B`,
        DarkGray: `#A9A9A9`,
        DarkGreen: `#006400`,
        DarkGrey: `#A9A9A9`,
        DarkKhaki: `#BDB76B`,
        DarkMagenta: `#8B008B`,
        DarkOliveGreen: `#556B2F`,
        DarkOrange: `#FF8C00`,
        DarkOrchid: `#9932CC`,
        DarkRed: `#8B0000`,
        DarkSalmon: `#E9967A`,
        DarkSeaGreen: `#8FBC8F`,
        DarkSlateBlue: `#483D8B`,
        DarkSlateGray: `#2F4F4F`,
        DarkSlateGrey: `#2F4F4F`,
        DarkTurquoise: `#00CED1`,
        DarkViolet: `#9400D3`,
        DeepPink: `#FF1493`,
        DeepSkyBlue: `#00BFFF`,
        DimGray: `#696969`,
        DimGrey: `#696969`,
        DodgerBlue: `#1E90FF`,
        FireBrick: `#B22222`,
        FloralWhite: `#FFFAF0`,
        ForestGreen: `#228B22`,
        Fuchsia: `#FF00FF`,
        Gainsboro: `#DCDCDC`,
        GhostWhite: `#F8F8FF`,
        Gold: `#FFD700`,
        Goldenrod: `#DAA520`,
        Gray: `#808080`,
        Green: `#008000`,
        GreenYellow: `#ADFF2F`,
        Grey: `#808080`,
        Honeydew: `#F0FFF0`,
        HotPink: `#FF69B4`,
        IndianRed: `#CD5C5C`,
        Indigo: `#4B0082`,
        Ivory: `#FFFFF0`,
        Khaki: `#F0E68C`,
        Lavender: `#E6E6FA`,
        LavenderBlush: `#FFF0F5`,
        LawnGreen: `#7CFC00`,
        LemonChiffon: `#FFFACD`,
        LightBlue: `#ADD8E6`,
        LightCoral: `#F08080`,
        LightCyan: `#E0FFFF`,
        LightGoldenrodYellow: `#FAFAD2`,
        LightGray: `#D3D3D3`,
        LightGreen: `#90EE90`,
        LightGrey: `#D3D3D3`,
        LightPink: `#FFB6C1`,
        LightSalmon: `#FFA07A`,
        LightSeaGreen: `#20B2AA`,
        LightSkyBlue: `#87CEFA`,
        LightSlateGray: `#778899`,
        LightSlateGrey: `#778899`,
        LightSteelBlue: `#B0C4DE`,
        LightYellow: `#FFFFE0`,
        Lime: `#00FF00`,
        LimeGreen: `#32CD32`,
        Linen: `#FAF0E6`,
        Magenta: `#FF00FF`,
        Maroon: `#800000`,
        MediumAquamarine: `#66CDAA`,
        MediumBlue: `#0000CD`,
        MediumOrchid: `#BA55D3`,
        MediumPurple: `#9370DB`,
        MediumSeaGreen: `#3CB371`,
        MediumSlateBlue: `#7B68EE`,
        MediumSpringGreen: `#00FA9A`,
        MediumTurquoise: `#48D1CC`,
        MediumVioletRed: `#C71585`,
        MidnightBlue: `#191970`,
        MintCream: `#F5FFFA`,
        MistyRose: `#FFE4E1`,
        Moccasin: `#FFE4B5`,
        NavajoWhite: `#FFDEAD`,
        Navy: `#000080`,
        OldLace: `#FDF5E6`,
        Olive: `#808000`,
        OliveDrab: `#6B8E23`,
        Orange: `#FFA500`,
        OrangeRed: `#FF4500`,
        Orchid: `#DA70D6`,
        PaleGoldenrod: `#EEE8AA`,
        PaleGreen: `#98FB98`,
        PaleTurquoise: `#AFEEEE`,
        PaleVioletRed: `#DB7093`,
        PapayaWhip: `#FFEFD5`,
        PeachPuff: `#FFDAB9`,
        Peru: `#CD853F`,
        Pink: `#FFC0CB`,
        Plum: `#DDA0DD`,
        PowderBlue: `#B0E0E6`,
        Purple: `#800080`,
        RebeccaPurple: `#663399`,
        Red: `#FF0000`,
        RosyBrown: `#BC8F8F`,
        RoyalBlue: `#4169E1`,
        SaddleBrown: `#8B4513`,
        Salmon: `#FA8072`,
        SandyBrown: `#F4A460`,
        SeaGreen: `#2E8B57`,
        Seashell: `#FFF5EE`,
        Sienna: `#A0522D`,
        Silver: `#C0C0C0`,
        SkyBlue: `#87CEEB`,
        SlateBlue: `#6A5ACD`,
        SlateGray: `#708090`,
        SlateGrey: `#708090`,
        Snow: `#FFFAFA`,
        SpringGreen: `#00FF7F`,
        SteelBlue: `#4682B4`,
        Tan: `#D2B48C`,
        Teal: `#008080`,
        Thistle: `#D8BFD8`,
        Tomato: `#FF6347`,
        Transparent: 'transparent',
        Turquoise: `#40E0D0`,
        Unset: 'unset',
        Violet: `#EE82EE`,
        Wheat: `#F5DEB3`,
        White: `#FFFFFF`,
        WhiteSmoke: `#F5F5F5`,
        Yellow: `#FFFF00`,
        YellowGreen: `#9ACD32`
    };
    const validateHexColor = (s, d = defaultThemeColor1) => {
        let colorRegX = /^#?([A-Fa-f0-9]{3,4}){1,2}$/;
        let cname = Object.keys(validCSSColors).filter(c => c.toLowerCase() === s.toLowerCase())[0];
        if (cname) return validCSSColors[cname];
        return `#${colorRegX.test(s) ? s.replace('#', '') : d.replace('#', '')}`;
    };

    // CSS ========================================
    const defaultThemeColor1 = '#66806a';
    const css = {
        divContainer: {
            'background-color': '#00000000',
            'overflow': `hidden`,
            width: '100%',
            border: 'none'
        },
        div: {
            'background-color': '#00000000',
            'overflow': `hidden`
        },
        rounded: {
            'border-radius': `10px`,
            'border': `2px solid #000000`,
        },
        tb: {
            width: '100%',
            margin: '0 auto',
            'border-collapse': 'collapse',
            'font-size': '12px',
        },
        p: {
            'font-family': 'inherit'
        },
        a: {},
        img: {},
        h1: {},
        h2: {},
        h3: {},
        h4: {},
        h5: {},
        ol: {},
        ul: {},
        li: {},
        th: {
            'border-bottom': `1px solid #000000`,
            'font-weight': `bold`,
            'text-align': `center`,
            'line-height': `22px`
        },
        tr: {},
        td: {
            padding: '4px',
            'min-width': '10px'
        },
        code: {},
        pre: {
            'color': 'dimgray',
            'background': 'transparent',
            'border': 'none',
            'white-space': 'pre-wrap',
            'font-family': 'Inconsolata, Consolas, monospace'
        },
        span: {},
        messageHeader: {
            'border-bottom': `1px solid #000000`,
            'background-color': '#dedede',
            'display': 'block'
        },
        messageHeaderContent: {
            margin: '0px auto',
            width: '98%',
            'line-height': `24px`,
            'padding': '2px 8px',
            'min-height': '25px'
        },
        messageBody: {
            'display': 'block',
            'background-color': '#ededed',
            'padding-top': '6px',
            'padding-bottom': '8px'
        },
        messageBodyContent: {
            margin: '0px auto',
            width: '95%',
            'font-size': '13px'
        },
        messageButtons: {
            'text-align': `right`,
            'margin': `4px 0px 8px`,
            'padding': '8px'
        },
        messageFooterContent: {
//            margin: '0px 8px',
//            width: '98%'
        },
        button: {
            'background-color': defaultThemeColor1,
            'border-radius': '6px',
            'min-width': '25px',
            'padding': '6px 8px'
        },
        divShadow: {
            'margin': '0px 16px 16px 0px',
            'box-shadow': '5px 8px 8px #888888'
        },
        inlineEmphasis: {
            'font-weight': 'bold'
        }
    };
    const combineCSS = (origCSS = {}, ...assignCSS) => {
        return Object.assign({}, origCSS, assignCSS.reduce((m, v) => {
            return Object.assign(m, v || {});
        }, {}));
    };
    const confirmReadability = (origCSS = {}) => {
        let outputCSS = Object.assign({}, origCSS);
        if (outputCSS['background-color']) outputCSS['background-color'] = validateHexColor(outputCSS['background-color'] || "#dedede");
        if (!outputCSS['color'] && outputCSS['background-color']) outputCSS['color'] = getTextColor(outputCSS['background-color'] || "#dedede");
        return outputCSS;
    };
    const assembleCSS = (css) => {
        return `"${Object.keys(css).map((key) => { return `${key}:${css[key]};` }).join('')}"`;
    };
    const processCSS = (...css) => {
        return assembleCSS(combineCSS(...css));
    };

    // HTML =======================================
    const html = {
        div: (content, ...CSS) => `<div style=${processCSS(css.div, ...CSS)}>${content}</div>`,
        h1: (content, ...CSS) => `<h1 style=${processCSS(css.h1, ...CSS)}>${content}</h1>`,
        h2: (content, ...CSS) => `<h2 style=${processCSS(css.h2, ...CSS)}>${content}</h2>`,
        h3: (content, ...CSS) => `<h3 style=${processCSS(css.h3, ...CSS)}>${content}</h3>`,
        h4: (content, ...CSS) => `<h4 style=${processCSS(css.h4, ...CSS)}>${content}</h4>`,
        h5: (content, ...CSS) => `<h5 style=${processCSS(css.h5, ...CSS)}>${content}</h5>`,
        p: (content, ...CSS) => `<p style=${processCSS(css.p, ...CSS)}>${content}</p>`,
        table: (content, ...CSS) => `<table style=${processCSS(css.tb, ...CSS)}>${content}</table>`,
        th: (content, ...CSS) => `<th style=${processCSS(css.th, ...CSS)}>${content}</th>`,
        tr: (content, ...CSS) => `<tr style=${processCSS(css.tr, ...CSS)}>${content}</tr>`,
        td: (content, ...CSS) => `<td style=${processCSS(css.td, ...CSS)}>${content}</td>`,
        td2: (content, ...CSS) => `<td colspan="2" style=${processCSS(css.td, ...CSS)}>${content}</td>`,
        tdcs: (content, colspan, ...CSS) => `<td colspan="${colspan}" style=${processCSS(css.td, ...CSS)}>${content}</td>`,
        tdrs: (content, rowspan, ...CSS) => `<td rowspan="${rowspan}" style=${processCSS(css.td, ...CSS)}>${content}</td>`,
        tdcrs: (content, colspan, rowspan, ...CSS) => `<td rowspan="${rowspan} colspan="${colspan}" style=${processCSS(css.td, ...CSS)}>${content}</td>`,
        code: (content, ...CSS) => `<code style=${processCSS(css.code, ...CSS)}>${content}</code>`,
        pre: (content, ...CSS) => `<pre style=${processCSS(css.pre, ...CSS)}>${content}</pre>`,
        span: (content, ...CSS) => `<span style=${processCSS(css.span, ...CSS)}>${content}</span>`,
        a: (content, link, ...CSS) => `<a href="${link}" style=${processCSS(css.a, ...CSS)}>${content}</a>`,
        img: (content, altText, ...CSS) => `<img src="${content}" alt="${altText}" style=${processCSS(css.img, ...CSS)}>`,
        tip: (content, tipText, ...CSS) => `<span class="showtip tipsy-n-right" title="${HE(HE(tipText))}"style=${processCSS(css.span, ...CSS)}>${content}</span>`,
        tag: (tag, content, ...CSS) => `<${tag} style=${processCSS(css.div, ...CSS)}>${content}</${tag}>`,
        ol: (content, ...CSS) => `<ol style=${processCSS(css.ol, ...CSS)}>${content}</ol>`,
        ul: (content, ...CSS) => `<ul style=${processCSS(css.ul, ...CSS)}>${content}</ul>`,
        li: (content, ...CSS) => `<li style=${processCSS(css.li, ...CSS)}>${content}</li>`,
    };

    // HTML Escaping function
    const HE = (() => {
        const esRE = (s) => s.replace(/(\\|\/|\[|\]|\(|\)|\{|\}|\?|\+|\*|\||\.|\^|\$)/g, '\\$1');
        const e = (s) => `&${s};`;
        const entities = {
            '<': e('lt'),
            '>': e('gt'),
            "'": e('#39'),
            '@': e('#64'),
            '{': e('#123'),
            '|': e('#124'),
            '}': e('#125'),
            '[': e('#91'),
            ']': e('#93'),
            '"': e('quot'),
            '/': e('#47')
        };
        const re = new RegExp(`(${Object.keys(entities).map(esRE).join('|')})`, 'g');
        return (s) => s.replace(re, (c) => (entities[c] || c));
    })();

    // MESSAGING ==================================
    const button = ({ elem: elem = '', label: label = '', char: char = '', type: type = '%', css: css = Messenger.Css.button } = {}) => {
        const htmlTable = {
            '@': '&#64;', 'attr': '&#64;', 'attribute': '&#64;',
            '#': '&#35;', 'mac': '&#35;', 'macro': '&#35;',
            '%': '&#37;', 'abil': '&#37;', 'ability': '&#37;',
            '!': '&#33;', 'api': '&#33;', 'mod': '&#33;', 'script': '&#33;', 'bang': '&#33;',
            'handout': 'handout', 'ho': 'handout'
        };
        type = htmlTable[type];
        if (!type) return '';
        let btnCSS = confirmReadability(Array.isArray(css) ? combineCSS(...css) : css);
        let api = '';
        switch (type) {
            case '&#35;': // macro
                api = `${type}${elem}`;
                break;
            case '&#37;': // ability
            case '&#64;': // attribute
                api = `${type}{${char}|${elem}}`;
                break;
            case '&#33;': // api
                api = `${type}${/^!/.test(elem) ? elem.slice(1) : elem}`;
                break;
            case 'handout': // button to open a handout
                api = `${elem}`;
                break;
        }

        if (!api) return;
        if (type !== 'handout') api = `!&#13;${api}`;
        return html.a(label, HE(api), btnCSS);
    };
    const hobutton = ({ elem: elem = '', label: label = '', char: char = '', type: type = '%', css: css = Messenger.Css.button } = {}) => {
        const htmlTable = {
            '@': '@', 'attr': '@', 'attribute': '@',
            '#': '#', 'mac': '#', 'macro': '#',
            '%': '%', 'abil': '!', 'ability': '%',
            '!': '!', 'api': '!', 'mod': '!', 'script': '!', 'bang': '!'
        };
        type = htmlTable[type];
        if (!type) return '';
        let btnCSS = confirmReadability(Array.isArray(css) ? combineCSS(...css) : css);
        let api = '';
        switch (type) {
            case '#': // macro
                api = `${type}${elem}`;
                break;
            case '%': // ability
            case '@': // attribute
                api = `${type}{${char}|${elem}}`;
                break;
            case '!': // api
                api = `${type}${/^!/.test(elem) ? elem.slice(1) : elem}`;
                break;
        }

        if (!api) return;
        api = `${api}`;
        return html.a(label, `\`${api}`, btnCSS);
    };
    const msgbox = ({
        msg: msg = 'message',
        title: title = '',
        footer: footer = '',
        btn: btn = '',
        sendas: sendas = 'API',
        whisperto: whisperto = '',
        containercss: containercss = {},
        boundingcss: boundingcss = {},
        headercss: headercss = {},
        bodycss: bodycss = {},
        contentcss: contentcss = {},
        footercss: footercss = {},
        noarchive: noarchive = false
    } = {}) => {
        let containerCSS = confirmReadability(combineCSS(css.divContainer, Array.isArray(containercss) ? combineCSS(...containercss) : containercss ));
        let boundingCSS = confirmReadability(combineCSS(css.div, css.rounded, Array.isArray(boundingcss) ? combineCSS(...boundingcss) : boundingcss ));
        let hdrCSS = confirmReadability(combineCSS(css.messageHeader, Array.isArray(headercss) ? combineCSS(...headercss) : headercss ));
        let bodyCSS = confirmReadability(combineCSS(css.messageBody, Array.isArray(bodycss) ? combineCSS(...bodycss) : bodycss ));
        let footerCSS = confirmReadability(combineCSS(css.messageFooterContent, Array.isArray(footercss) ? combineCSS(...footercss) : footercss));
        let contentCSS = confirmReadability(combineCSS(css.messageBodyContent, Array.isArray(contentcss) ? combineCSS(...contentcss) : contentcss));

        let hdr = title !== '' ? html.div(html.div(title, css.messageHeaderContent), hdrCSS) : '';
        let body = html.div(html.div(msg, contentCSS), bodyCSS);
        let buttons = btn !== '' ? html.div(btn, css.messageButtons) : '';
        if (footer) footer = html.div(footer);
        if (footer || buttons) {
            footer = html.div(html.div(footer + buttons), footerCSS);
        }
        let output = html.div(html.div(html.div(`${hdr}${body}${footer}`, {}), boundingCSS), containerCSS);
        if (whisperto) output = `/w "${whisperto}" ${output}`;
        sendChat(sendas, output, null, { noarchive: !!noarchive });
    };

    const checkDependencies = (deps) => {
        /* pass array of objects like
            { name: 'ModName', version: '#.#.#' || '', mod: ModName || undefined, checks: [ [ExposedItem, type], [ExposedItem, type] ] }
        */
        const dependencyEngine = (deps) => {
            const versionCheck = (mv, rv) => {
                let modv = [...mv.split('.'), ...Array(4).fill(0)].slice(0, 4);
                let reqv = [...rv.split('.'), ...Array(4).fill(0)].slice(0, 4);
                return reqv.reduce((m, v, i) => {
                    if (m.pass || m.fail) return m;
                    if (i < 3) {
                        if (parseInt(modv[i]) > parseInt(reqv[i])) m.pass = true;
                        else if (parseInt(modv[i]) < parseInt(reqv[i])) m.fail = true;
                    } else {
                        // all betas are considered below the release they are attached to
                        if (reqv[i] === 0 && modv[i] === 0) m.pass = true;
                        else if (modv[i] === 0) m.pass = true;
                        else if (reqv[i] === 0) m.fail = true;
                        else if (parseInt(modv[i].slice(1)) >= parseInt(reqv[i].slice(1))) m.pass = true;
                    }
                    return m;
                }, { pass: false, fail: false }).pass;
            };

            let result = { passed: true, failures: {}, optfailures: {} };
            deps.forEach(d => {
                let failObj = d.optional ? result.optfailures : result.failures;
                if (!d.mod) {
                    if (!d.optional) result.passed = false;
                    failObj[d.name] = 'Not found';
                    return;
                }
                if (d.version && d.version.length) {
                    if (!(API_Meta[d.name].version && API_Meta[d.name].version.length && versionCheck(API_Meta[d.name].version, d.version))) {
                        if (!d.optional) result.passed = false;
                        failObj[d.name] = `Incorrect version. Required v${d.version}. ${API_Meta[d.name].version && API_Meta[d.name].version.length ? `Found v${API_Meta[d.name].version}` : 'Unable to tell version of current.'}`;
                        return;
                    }
                }
                d.checks.reduce((m, c) => {
                    if (!m.passed) return m;
                    let [pname, ptype] = c;
                    if (!d.mod.hasOwnProperty(pname) || typeof d.mod[pname] !== ptype) {
                        if (!d.optional) m.passed = false;
                        failObj[d.name] = `Incorrect version.`;
                    }
                    return m;
                }, result);
            });
            return result;
        };
        let depCheck = dependencyEngine(deps);
        let failures = '', contents = '', msg = '';
        if (Object.keys(depCheck.optfailures).length) { // optional components were missing
            failures = Object.keys(depCheck.optfailures).map(k => `&bull; <code>${k}</code> : ${depCheck.optfailures[k]}`).join('<br>');
            contents = `<span style="font-weight: bold">${apiproject}</span> utilizies one or more other scripts for optional features, and works best with those scripts installed. You can typically find these optional scripts in the 1-click Mod Library:<br>${failures}`;
            msg = `<div style="width: 100%;border: none;border-radius: 0px;min-height: 60px;display: block;text-align: left;white-space: pre-wrap;overflow: hidden"><div style="font-size: 14px;font-family: &quot;Segoe UI&quot;, Roboto, Ubuntu, Cantarell, &quot;Helvetica Neue&quot;, sans-serif"><div style="background-color: #000000;border-radius: 6px 6px 0px 0px;position: relative;border-width: 2px 2px 0px 2px;border-style:  solid;border-color: black;"><div style="border-radius: 18px;width: 35px;height: 35px;position: absolute;left: 3px;top: 2px;"><img style="background-color: transparent ; float: left ; border: none ; max-height: 40px" src="${typeof apilogo !== 'undefined' ? apilogo : 'https://i.imgur.com/kxkuQFy.png'}"></div><div style="background-color: #c94d4d;font-weight: bold;font-size: 18px;line-height: 36px;border-radius: 6px 6px 0px 0px;padding: 4px 4px 0px 43px;color: #ffffff;min-height: 38px;">MISSING MOD DETECTED</div></div><div style="background-color: white;padding: 4px 8px;border: 2px solid #000000;border-bottom-style: none;color: #404040;">${contents}</div><div style="background-color: white;text-align: right;padding: 4px 8px;border: 2px solid #000000;border-top-style: none;border-radius: 0px 0px 6px 6px"></div></div></div>`;
            sendChat(apiproject, `/w gm ${msg}`);
        }
        if (!depCheck.passed) {
            failures = Object.keys(depCheck.failures).map(k => `&bull; <code>${k}</code> : ${depCheck.failures[k]}`).join('<br>');
            contents = `<span style="font-weight: bold">${apiproject}</span> requires other scripts to work. Please use the 1-click Mod Library to correct the listed problems:<br>${failures}`;
            msg = `<div style="width: 100%;border: none;border-radius: 0px;min-height: 60px;display: block;text-align: left;white-space: pre-wrap;overflow: hidden"><div style="font-size: 14px;font-family: &quot;Segoe UI&quot;, Roboto, Ubuntu, Cantarell, &quot;Helvetica Neue&quot;, sans-serif"><div style="background-color: #000000;border-radius: 6px 6px 0px 0px;position: relative;border-width: 2px 2px 0px 2px;border-style:  solid;border-color: black;"><div style="border-radius: 18px;width: 35px;height: 35px;position: absolute;left: 3px;top: 2px;"><img style="background-color: transparent ; float: left ; border: none ; max-height: 40px" src="${typeof apilogo !== 'undefined' ? apilogo : 'https://i.imgur.com/kxkuQFy.png'}"></div><div style="background-color: #c94d4d;font-weight: bold;font-size: 18px;line-height: 36px;border-radius: 6px 6px 0px 0px;padding: 4px 4px 0px 43px;color: #ffffff;min-height: 38px;">MISSING MOD DETECTED</div></div><div style="background-color: white;padding: 4px 8px;border: 2px solid #000000;border-bottom-style: none;color: #404040;">${contents}</div><div style="background-color: white;text-align: right;padding: 4px 8px;border: 2px solid #000000;border-top-style: none;border-radius: 0px 0px 6px 6px"></div></div></div>`;
            sendChat(apiproject, `/w gm ${msg}`);
            return false;
        }
        return true;
    };

    on('ready', () => {
        versionInfo();
        assureState();
        logsig();
        let reqs = [
            // { name: 'Messenger', mod: typeof Messenger !== 'undefined' ? Messenger : undefined, checks: [['Button', 'function'], ['MsgBox', 'function'], ['HE', 'function'], ['Html', 'object']] }
        ];
        if (reqs.length && !checkDependencies(reqs)) return;
    });
    return {
        Button: button,
        HOButton: hobutton,
        MsgBox: msgbox,
        ProcessCSS: processCSS,
        Html: () => _.clone(html),
        Css: () => _.clone(css),
        HE: HE,
        version: version,
        ValidateHexColor: validateHexColor
    };
})();

{ try { throw new Error(''); } catch (e) { API_Meta.Messenger.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.Messenger.offset); } }
/*
================================================================
END SCRIPT: Messenger
================================================================
*/

/*
================================================================
BEGIN SCRIPT: MetaScriptToolbox
SOURCE FILE: MetaScriptToolbox.md
================================================================
*/
/*
=========================================================
Name            :   MetaScriptToolbox
GitHub          :   
Roll20 Contact  :   timmaugh
Version         :   0.0.2
Last Update     :   6 SEP 2024
=========================================================
*/
var API_Meta = API_Meta || {};
API_Meta.MetaScriptToolbox = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{ try { throw new Error(''); } catch (e) { API_Meta.MetaScriptToolbox.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (12)); } }

const MetaScriptToolbox = (() => { // eslint-disable-line no-unused-vars
    const apiproject = 'MetaScriptToolbox';
    const version = '0.0.2';
    const schemaVersion = 0.1;
    API_Meta[apiproject].version = version;
    const vd = new Date(1725630209434);
    const versionInfo = () => {
        log(`\u0166\u0166 ${apiproject} v${API_Meta[apiproject].version}, ${vd.getFullYear()}/${vd.getMonth() + 1}/${vd.getDate()} \u0166\u0166 -- offset ${API_Meta[apiproject].offset}`);
    };
    const logsig = () => {
        // initialize shared namespace for all signed projects, if needed
        state.torii = state.torii || {};
        // initialize siglogged check, if needed
        state.torii.siglogged = state.torii.siglogged || false;
        state.torii.sigtime = state.torii.sigtime || Date.now() - 3001;
        if (!state.torii.siglogged || Date.now() - state.torii.sigtime > 3000) {
            const logsig = '\n' +
                '  _____________________________________________   ' + '\n' +
                '   )_________________________________________(    ' + '\n' +
                '     )_____________________________________(      ' + '\n' +
                '           ___| |_______________| |___            ' + '\n' +
                '          |___   _______________   ___|           ' + '\n' +
                '              | |               | |               ' + '\n' +
                '              | |               | |               ' + '\n' +
                '              | |               | |               ' + '\n' +
                '              | |               | |               ' + '\n' +
                '              | |               | |               ' + '\n' +
                '______________|_|_______________|_|_______________' + '\n' +
                '                                                  ' + '\n';
            log(`${logsig}`);
            state.torii.siglogged = true;
            state.torii.sigtime = Date.now();
        }
        return;
    };
    const checkInstall = () => {
        if (!state.hasOwnProperty(apiproject) || state[apiproject].version !== schemaVersion) {
            log(`  > Updating ${apiproject} Schema to v${schemaVersion} <`);
            switch (state[apiproject] && state[apiproject].version) {

                case 0.1:
                /* falls through */

                case 'UpdateSchemaVersion':
                    state[apiproject].version = schemaVersion;
                    break;

                default:
                    state[apiproject] = {
                        settings: {},
                        defaults: {},
                        version: schemaVersion
                    }
                    break;
            }
        }
    };
    let stateReady = false;
    const assureState = () => {
        if (!stateReady) {
            checkInstall();
            stateReady = true;
        }
    };

    const checkDependencies = (deps) => {
        /* pass array of objects like
            { name: 'ModName', version: '#.#.#' || '', mod: ModName || undefined, checks: [ [ExposedItem, type], [ExposedItem, type] ] }
        */
        const dependencyEngine = (deps) => {
            const versionCheck = (mv, rv) => {
                let modv = [...mv.split('.'), ...Array(4).fill(0)].slice(0, 4);
                let reqv = [...rv.split('.'), ...Array(4).fill(0)].slice(0, 4);
                return reqv.reduce((m, v, i) => {
                    if (m.pass || m.fail) return m;
                    if (i < 3) {
                        if (parseInt(modv[i]) > parseInt(reqv[i])) m.pass = true;
                        else if (parseInt(modv[i]) < parseInt(reqv[i])) m.fail = true;
                    } else {
                        // all betas are considered below the release they are attached to
                        if (reqv[i] === 0 && modv[i] === 0) m.pass = true;
                        else if (modv[i] === 0) m.pass = true;
                        else if (reqv[i] === 0) m.fail = true;
                        else if (parseInt(modv[i].slice(1)) >= parseInt(reqv[i].slice(1))) m.pass = true;
                    }
                    return m;
                }, { pass: false, fail: false }).pass;
            };

            let result = { passed: true, failures: {}, optfailures: {} };
            deps.forEach(d => {
                let failObj = d.optional ? result.optfailures : result.failures;
                if (!d.mod) {
                    if (!d.optional) result.passed = false;
                    failObj[d.name] = 'Not found';
                    return;
                }
                if (d.version && d.version.length) {
                    if (!(API_Meta[d.name].version && API_Meta[d.name].version.length && versionCheck(API_Meta[d.name].version, d.version))) {
                        if (!d.optional) result.passed = false;
                        failObj[d.name] = `Incorrect version. Required v${d.version}. ${API_Meta[d.name].version && API_Meta[d.name].version.length ? `Found v${API_Meta[d.name].version}` : 'Unable to tell version of current.'}`;
                        return;
                    }
                }
                d.checks.reduce((m, c) => {
                    if (!m.passed) return m;
                    let [pname, ptype] = c;
                    if (!d.mod.hasOwnProperty(pname) || typeof d.mod[pname] !== ptype) {
                        if (!d.optional) m.passed = false;
                        failObj[d.name] = `Incorrect version.`;
                    }
                    return m;
                }, result);
            });
            return result;
        };
        let depCheck = dependencyEngine(deps);
        let failures = '', contents = '', msg = '';
        if (Object.keys(depCheck.optfailures).length) { // optional components were missing
            failures = Object.keys(depCheck.optfailures).map(k => `&bull; <code>${k}</code> : ${depCheck.optfailures[k]}`).join('<br>');
            contents = `<span style="font-weight: bold">${apiproject}</span> utilizies one or more other scripts for optional features, and works best with those scripts installed. You can typically find these optional scripts in the 1-click Mod Library:<br>${failures}`;
            msg = `<div style="width: 100%;border: none;border-radius: 0px;min-height: 60px;display: block;text-align: left;white-space: pre-wrap;overflow: hidden"><div style="font-size: 14px;font-family: &quot;Segoe UI&quot;, Roboto, Ubuntu, Cantarell, &quot;Helvetica Neue&quot;, sans-serif"><div style="background-color: #000000;border-radius: 6px 6px 0px 0px;position: relative;border-width: 2px 2px 0px 2px;border-style:  solid;border-color: black;"><div style="border-radius: 18px;width: 35px;height: 35px;position: absolute;left: 3px;top: 2px;"><img style="background-color: transparent ; float: left ; border: none ; max-height: 40px" src="${typeof apilogo !== 'undefined' ? apilogo : 'https://i.imgur.com/kxkuQFy.png'}"></div><div style="background-color: #c94d4d;font-weight: bold;font-size: 18px;line-height: 36px;border-radius: 6px 6px 0px 0px;padding: 4px 4px 0px 43px;color: #ffffff;min-height: 38px;">MISSING MOD DETECTED</div></div><div style="background-color: white;padding: 4px 8px;border: 2px solid #000000;border-bottom-style: none;color: #404040;">${contents}</div><div style="background-color: white;text-align: right;padding: 4px 8px;border: 2px solid #000000;border-top-style: none;border-radius: 0px 0px 6px 6px"></div></div></div>`;
            sendChat(apiproject, `/w gm ${msg}`);
        }
        if (!depCheck.passed) {
            failures = Object.keys(depCheck.failures).map(k => `&bull; <code>${k}</code> : ${depCheck.failures[k]}`).join('<br>');
            contents = `<span style="font-weight: bold">${apiproject}</span> requires other scripts to work. Please use the 1-click Mod Library to correct the listed problems:<br>${failures}`;
            msg = `<div style="width: 100%;border: none;border-radius: 0px;min-height: 60px;display: block;text-align: left;white-space: pre-wrap;overflow: hidden"><div style="font-size: 14px;font-family: &quot;Segoe UI&quot;, Roboto, Ubuntu, Cantarell, &quot;Helvetica Neue&quot;, sans-serif"><div style="background-color: #000000;border-radius: 6px 6px 0px 0px;position: relative;border-width: 2px 2px 0px 2px;border-style:  solid;border-color: black;"><div style="border-radius: 18px;width: 35px;height: 35px;position: absolute;left: 3px;top: 2px;"><img style="background-color: transparent ; float: left ; border: none ; max-height: 40px" src="${typeof apilogo !== 'undefined' ? apilogo : 'https://i.imgur.com/kxkuQFy.png'}"></div><div style="background-color: #c94d4d;font-weight: bold;font-size: 18px;line-height: 36px;border-radius: 6px 6px 0px 0px;padding: 4px 4px 0px 43px;color: #ffffff;min-height: 38px;">MISSING MOD DETECTED</div></div><div style="background-color: white;padding: 4px 8px;border: 2px solid #000000;border-bottom-style: none;color: #404040;">${contents}</div><div style="background-color: white;text-align: right;padding: 4px 8px;border: 2px solid #000000;border-top-style: none;border-radius: 0px 0px 6px 6px"></div></div></div>`;
            sendChat(apiproject, `/w gm ${msg}`);
            return false;
        }
        return true;
    };

    on('ready', () => {
        versionInfo();
        assureState();
        logsig();
        let reqs = [
            {
                name: 'ZeroFrame',
                version: `1.2.2`,
                mod: typeof ZeroFrame !== 'undefined' ? ZeroFrame : undefined,
                checks: [['RegisterMetaOp', 'function']],
            },
            {
                name: 'APILogic',
                version: `2.0.9`,
                mod: typeof APILogic !== 'undefined' ? APILogic : undefined,
                checks: [],
            },
            {
                name: 'Fetch',
                version: `2.1.1`,
                mod: typeof Fetch !== 'undefined' ? Fetch : undefined,
                checks: [],
            },
            {
                name: 'SelectManager',
                version: `1.1.8`,
                mod: typeof SelectManager !== 'undefined' ? SelectManager : undefined,
                checks: [['GetPlayerID', 'function'], ['GetSelected', 'function'], ['GetWho', 'function']],
            },
            {
                name: 'Muler',
                version: `2.0.2`,
                mod: typeof Muler !== 'undefined' ? Muler : undefined,
                checks: [],
            },
            {
                name: 'Plugger',
                version: `1.0.9`,
                mod: typeof Plugger !== 'undefined' ? Plugger : undefined,
                checks: [],
            },
            {
                name: 'MathOps',
                version: `1.0.8`,
                mod: typeof MathOps !== 'undefined' ? MathOps : undefined,
                checks: [['MathProcessor', 'function']],
            },
            {
                name: 'libTokenMarkers',
                version: `0.1.2`,
                mod: typeof libTokenMarkers !== 'undefined' ? libTokenMarkers : undefined,
                checks: [['getStatus', 'function'], ['getStatuses', 'function'], ['getOrderedList', 'function']]
            },
            {
                name: 'libTable',
                version: `1.0.0`,
                mod: typeof libTable !== 'undefined' ? libTable : undefined,
                checks: [
                    ['getTable', 'function'],
                    ['getTables', 'function'],
                    ['getItems', 'function'],
                    ['getItemsByIndex', 'function'],
                    ['getItemsByName', 'function'],
                    ['getItemsByWeight', 'function'],
                    ['getItemsByWeightedIndex', 'function']
                ]
            },
            {
                name: 'checkLightLevel',
                //                version: `1.0.0.b3`,
                mod: typeof checkLightLevel !== 'undefined' ? checkLightLevel : undefined,
                checks: [['isLitBy', 'function']],
                optional: true
            },
            {
                name: 'Messenger',
                version: `1.0.1`,
                mod: typeof Messenger !== 'undefined' ? Messenger : undefined,
                checks: [['Button', 'function'], ['MsgBox', 'function'], ['HE', 'function'], ['Html', 'function'], ['Css', 'function']]
            }
        ];
        if (!checkDependencies(reqs)) return;
    });
    return {};
})();

{ try { throw new Error(''); } catch (e) { API_Meta.MetaScriptToolbox.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.MetaScriptToolbox.offset); } }
/*
================================================================
END SCRIPT: MetaScriptToolbox
================================================================
*/

/*
================================================================
BEGIN SCRIPT: Muler
SOURCE FILE: Muler.md
================================================================
*/
/*
=========================================================
Name            :   Muler
GitHub          :   https://github.com/TimRohr22/Cauldron/tree/master/Muler
Roll20 Contact  :   timmaugh
Version         :   2.0.3
Last Update     :   22 NOV 2025
=========================================================
*/
var API_Meta = API_Meta || {};
API_Meta.Muler = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{ try { throw new Error(''); } catch (e) { API_Meta.Muler.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (12)); } }

const Muler = (() => { //eslint-disable-line no-unused-vars
    const apiproject = 'Muler';
    const version = '2.0.3';
    const schemaVersion = 0.2;
    const apilogo = 'https://i.imgur.com/AcQSK23.png'; // black
    const apilogoalt = 'https://i.imgur.com/j8x0frn.png'; // white

    API_Meta[apiproject].version = version;
    const vd = new Date(1763841713904);
    const versionInfo = () => {
        log(`\u0166\u0166 ${apiproject} v${API_Meta[apiproject].version}, ${vd.getFullYear()}/${vd.getMonth() + 1}/${vd.getDate()} \u0166\u0166 -- offset ${API_Meta[apiproject].offset}`);
        if (!state.hasOwnProperty(apiproject) || state[apiproject].version !== schemaVersion) {
            log(`  > Updating ${apiproject} Schema to v${schemaVersion} <`);
            switch (state[apiproject] && state[apiproject].version) {

                case 0.1:
                /* falls through */

                case 0.2:
                    state[apiproject].settings = {
                        playersNeedControl: true
                    }
                    state[apiproject].defaults = {
                        playersNeedControl: true
                    }
                case 'UpdateSchemaVersion':
                    state[apiproject].version = schemaVersion;
                    break;

                default:
                    state[apiproject] = {
                        version: schemaVersion,
                        settings: { playersNeedControl: true },
                        defaults: { playersNeedControl: true }
                    };
                    break;
            }
        }
    };
    const manageState = { // eslint-disable-line no-unused-vars
        reset: () => state[apiproject].settings = _.clone(state[apiproject].defaults),
        set: (p, v) => state[apiproject].settings[p] = v,
        get: (p) => { return state[apiproject].settings[p]; }
    };
    const logsig = () => {
        // initialize shared namespace for all signed projects, if needed
        state.torii = state.torii || {};
        // initialize siglogged check, if needed
        state.torii.siglogged = state.torii.siglogged || false;
        state.torii.sigtime = state.torii.sigtime || Date.now() - 3001;
        if (!state.torii.siglogged || Date.now() - state.torii.sigtime > 3000) {
            const logsig = '\n' +
                '  _____________________________________________   ' + '\n' +
                '   )_________________________________________(    ' + '\n' +
                '     )_____________________________________(      ' + '\n' +
                '           ___| |_______________| |___            ' + '\n' +
                '          |___   _______________   ___|           ' + '\n' +
                '              | |               | |               ' + '\n' +
                '              | |               | |               ' + '\n' +
                '              | |               | |               ' + '\n' +
                '              | |               | |               ' + '\n' +
                '              | |               | |               ' + '\n' +
                '______________|_|_______________|_|_______________' + '\n' +
                '                                                  ' + '\n';
            log(`${logsig}`);
            state.torii.siglogged = true;
            state.torii.sigtime = Date.now();
        }
        return;
    };

    const escapeRegExp = (string) => { return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); };

    const getMyCharacters = (playerid) => {
        let characters = findObjs({ type: 'character' });
        return playerIsGM(playerid) || !manageState.get('playersNeedControl') ? characters : characters.filter(c => {
            return c.get('controlledby').split(',').reduce((m, p) => {
                return m || p === 'all' || p === playerid;
            }, false)
        });
    };

    const tableFromAmbig = (query) => findObjs({ type: 'rollabletable' }).filter(t => t.get('name') === query)[0];
    const abilityFromAmbig = (query, pid, sourcechar) => {
        let mychars = sourcechar ? [sourcechar] : getMyCharacters(pid);
        let charids = mychars.map(c => c.id);
        return findObjs({ type: 'ability', name: query }).filter(a => charids.includes(a.get('characterid')))[0];
    };
    const charFromAmbig = (query, pid, mychars = getMyCharacters(pid)) => { // find a character where info is an identifying piece of information (id, name, or token id)
        let character;
        let qrx = new RegExp(escapeRegExp(query), 'i');
        character = mychars.filter(c => c.id === query)[0] ||
            mychars.filter(c => c.id === (getObj('graphic', query) || { get: () => { return '' } }).get('represents'))[0] ||
            mychars.filter(c => c.get('name') === query)[0] ||
            mychars.filter(c => {
                qrx.lastIndex = 0;
                return qrx.test(c.get('name'));
            })[0];
        return character;
    };
    const checkTicks = (s,check = ["'","`",'"']) => {

        if (typeof s !== 'string') return s;
        return ((s.charAt(0) === s.charAt(s.length - 1)) && check.includes(s.charAt(0))) ? s.slice(1, s.length - 1) : s;

    };

    const varrx = /^((?:(?:-?\d+)-(?:-?\d+)|(?:!=|>=|<=|>|<)(?:-?\d+))|[^\s]+?)=(.+)$/,
        getrx = /get\.(?=[a-zA-Z0-9]|`[a-zA-Z0-9 ]+`|'[a-zA-Z0-9 ]+'|"[a-zA-Z0-9 ]+")(([`'"])?[^.]+?\2)(?:$|\.(?=[a-zA-Z0-9]|`[a-zA-Z0-9 ]+`|'[a-zA-Z0-9 ]+'|"[a-zA-Z0-9 ]+")(([`'"])?[^.]+?\4)){0,1}(?:$|\.(?=[a-zA-Z0-9]|`[a-zA-Z0-9 ]+`|'[a-zA-Z0-9 ]+'|"[a-zA-Z0-9 ]+")(([`'"])?[^]+?\6)){0,1}(?:\?(name|avatar|url|image|html)){0,1}(\/get|(?=\s|$))/gmi,
        setrx = /set\.([^\s.=]+(?:\.[^\s=.]+)*\s*=\s*.+?)\s*\/set/gmi,
        mulerx = /(\()?{&\s*mule\s*(.*?)\s*}((?<=\({&\s*mule\s*(.*?)\s*})\)|\1)/gi,
        // muleabilrx = /\s*\((.*?)\)\s*/g;
        muleabilrx = /((['`"])(.+?)\2|[^\s.]+?)(?:\.((['`"])(.+?)\5|[^\s]+?)){0,1}(?:\s|$)/gmi;

    const condensereturn = (funcret, status, notes) => {
        funcret.runloop = (status.includes('changed') || status.includes('unresolved'));
        if (status.length) {
            funcret.status = status.reduce((m, v) => {
                switch (m) {
                    case 'unchanged':
                        m = v;
                        break;
                    case 'changed':
                        m = v === 'unresolved' ? v : m;
                        break;
                    case 'unresolved':
                        break;
                }
                return m;
            });
        }
        funcret.notes = notes.join('<br>');
        return funcret;
    };
    const testGetConstructs = m => {
        let rxarray = [mulerx, getrx, setrx];
        return rxarray.reduce(rx => {
            m = m || rx.test(m.content);
            rx.lastIndex = 0;
            return m;
        }, false);
    };
    const testSetConstructs = m => {
        let result = m.variables && Object.keys(m.variables).length && setrx.test(m.content);
        setrx.lastIndex = 0;
        return result;
    };
    const internalTestLib = {
        'int': (v) => +v === +v && parseInt(parseFloat(v, 10), 10) == v, // eslint-disable-line eqeqeq
        'num': (v) => +v === +v,
        'tru': (v) => v == true // eslint-disable-line eqeqeq
    };
    const getEmptyVarObject = () => {
        return {
            all: {},
            alltables: {},
            mules: {}
        };
    };
    let html = {};
    let css = {}; // eslint-disable-line no-unused-vars
    let HE = () => { }; // eslint-disable-line no-unused-vars
    const theme = {
        primaryColor: '#744402',
        primaryTextColor: '#232323',
        primaryTextBackground: '#ededed'
    }
    const localCSS = {
        msgheader: {
            'background-color': theme.primaryColor,
            'color': 'white',
            'font-size': '1.2em',
            'padding-left': '4px'
        },
        msgbody: {
            'color': theme.primaryTextColor,
            'background-color': theme.primaryTextBackground
        },
        msgfooter: {
            'color': theme.primaryTextColor,
            'background-color': theme.primaryTextBackground
        },
        msgheadercontent: {
            'display': 'table-cell',
            'vertical-align': 'middle',
            'padding': '4px 8px 4px 6px'
        },
        msgheaderlogodiv: {
            'display': 'table-cell',
            'max-height': '30px',
            'margin-right': '8px',
            'margin-top': '4px',
            'vertical-align': 'middle'
        },
        logoimg: {
            'background-color': 'transparent',
            'float': 'left',
            'border': 'none',
            'max-height': '30px'
        },
        boundingcss: {
            'background-color': theme.primaryTextBackground
        },
        inlineEmphasis: {
            'font-weight': 'bold'
        }
    }
    const msgbox = ({
        msg: msg = '',
        title: title = '',
        headercss: headercss = localCSS.msgheader,
        bodycss: bodycss = localCSS.msgbody,
        footercss: footercss = localCSS.msgfooter,
        sendas: sendas = 'Muler',
        whisperto: whisperto = '',
        footer: footer = '',
        btn: btn = '',
    } = {}) => {
        if (title) title = html.div(html.div(html.img(apilogoalt, 'Muler Logo', localCSS.logoimg), localCSS.msgheaderlogodiv) + html.div(title, localCSS.msgheadercontent), {});
        Messenger.MsgBox({ msg: msg, title: title, bodycss: bodycss, sendas: sendas, whisperto: whisperto, footer: footer, btn: btn, headercss: headercss, footercss: footercss, boundingcss: localCSS.boundingcss, noarchive: true });
    };
    const getWhisperTo = (who) => who.toLowerCase() === 'api' ? 'gm' : who.replace(/\s\(gm\)$/i, '');

    const handleConfig = (msg) => {
        if (msg.type !== 'api' || !/^!mulerconfig/i.test(msg.content)) return;
        let recipient = getWhisperTo(msg.who);
        if (!playerIsGM(msg.playerid)) {
            msgbox({ title: 'GM Rights Required', msg: 'You must be a GM to perform that operation', whisperto: recipient });
            return;
        }
        let cfgrx = /^(\+|-)(playersneedcontrol)$/i;
        let res;
        let cfgTrack = {};
        let message;
        if (/^!mulerconfig\s+[^\s]/i.test(msg.content)) {
            msg.content.split(/\s+/).slice(1).forEach(a => {
                res = cfgrx.exec(a);
                if (!res) return;
                if (res[2].toLowerCase() === 'playersneedcontrol') {
                    manageState.set('playersNeedControl', (res[1] === '+'));
                    cfgTrack[res[2]] = res[1];
                }
            });
            let changes = Object.keys(cfgTrack).map(k => `${html.span(k, localCSS.inlineEmphasis)}: ${cfgTrack[k] === '+' ? 'enabled' : 'disabled'}`).join('<br>');
            msgbox({ title: `Muler Config Changed`, msg: `You have made the following changes to the Muler configuration:<br>${changes}`, whisperto: recipient });
        } else {
            cfgTrack.playersneedcontrol = `${html.span('playersneedcontrol', localCSS.inlineEmphasis)}: ${manageState.get('playersNeedControl') ? 'enabled' : 'disabled'}`;
            message = `Muler is currently configured as follows:<br>${cfgTrack.playersneedcontrol}`;
            msgbox({ title: 'Muler Configuration', msg: message, whisperto: recipient });
        }

    };
    const mulegetter = (msg, msgstate = {}) => {
        let funcret = { runloop: false, status: 'unchanged', notes: '' };
        msg.variables = msg.variables || getEmptyVarObject();
        msg.mules = msg.mules || [];
        if (msg.type !== 'api' || !testGetConstructs(msg)) return funcret;
        if (!Object.keys(msgstate).length && scriptisplugin) return funcret;
        let status = [];
        let notes = [];
        let variables = msg.variables;
        //let characters = getMyCharacters(msg.playerid);
        
        // LOAD MULES ------------------------------------------------------------------
        let mulearray = [];
        // DETECT MULES
        [...msg.content.matchAll(mulerx)].forEach(match => {
            match[2].replace(muleabilrx, mule => {
                mulearray.push({ mule: mule.trim(), index: match.index });
                return '';
            });
        });
        [...msg.content.matchAll(getrx)].forEach(match => {
            if (match[5]) mulearray.push({ mule: `${match[1]}.${match[3]}`, index: match.index });
        });
        [...msg.content.matchAll(setrx)].forEach(match => {
            let res = match[1].split(/\s*=\s*/).shift().split('.');
            if (res.length > 2) mulearray.push({ mule: `${res[0]}.${res[1]}`, index: match.index });
        });

        mulearray = mulearray.sort((a, b) => a.index < b.index ? -1 : 1);
        mulearray = Object.keys(mulearray.reduce((m, v) => {
            m[v.mule] = v.index;
            return m;
        }, {}));
        msg.content = msg.content.replace(mulerx, '');

        // PROCESS MULES INTO ABILITIES AND GET VARIABLES --------------------------
        let mules = []; // new mules in this pass
        let tables = []; // new tables in this pass
        mulearray.forEach(m => {
            let source;
            let sourcetext = m.split('.').map(t => checkTicks(t));
            if (sourcetext.length > 1) { // use first portion as a character/table identifier
                if (sourcetext[0].toLowerCase() === 'table') {
                    source = tableFromAmbig(sourcetext[1]);
                    //if (source) tables.push(source);
                }
                else {
                    source = abilityFromAmbig(sourcetext[1], msg.playerid, charFromAmbig(sourcetext[0], msg.playerid));
                    //if (source) mules.push(source);
                }
            }
            if (!source) source = abilityFromAmbig(sourcetext[0], msg.playerid) || tableFromAmbig(sourcetext[0]);
            if (source && source.get('type') === 'rollabletable') tables.push(source);
            else if (source && source.get('type') === 'ability') mules.push(source);
        });

        mules = mules.filter(a => a);
        mules.forEach(a => {
            msg.mules.push(a);
            variables.mules[a.id] = variables.mules[a.id] || {};
            a.get('action')
                .split('\n')
                .filter(v => varrx.test(v))
                .forEach(v => {
                    let k = varrx.exec(v);
                    variables.mules[a.id][k[1]] = k[2];
                    variables.all[k[1]] = k[2];
                });
        });

        tables = tables.filter(t => t);
        tables.forEach(t => {
            msg.mules.push(t);
            variables.mules[t.id] = { ...libTable.getItemsByWeight(t), ...libTable.getItemsByName(t) };
            variables.alltables = { ...variables.alltables, ...variables.mules[t.id] };
        });

        const typeProcessor = {
            '!=': (r, t) => r != t, // eslint-disable-line eqeqeq
            '>': (r, t) => r > t,
            '>=': (r, t) => r >= t,
            '<': (r, t) => r < t,
            '<=': (r, t) => r <= t,
            '-': (r, l, h) => r >= l && r <= h,
        };
        const fillMuleParts = (...args) => { // indexing does not include the full return 'm'
            let thevar, thechar, themule, ovar, theask;

            if (args[4]) { // three elements filled (character.mule.variable)
                thechar = checkTicks(args[0]).toLowerCase() === 'table' ? 'table' : charFromAmbig(checkTicks(args[0]), msg.playerid);

                if (thechar && typeof thechar === 'string' && thechar === 'table') {
                    themule = msg.mules.filter(a => a.get('name') === checkTicks(args[2]))[0];
                } else if (thechar) {
                    themule = msg.mules.filter(a => a.get('name') === checkTicks(args[2]) && a.get('characterid') === thechar.id)[0];
                }
                thevar = checkTicks(args[4]);
                if (themule) ovar = msg.variables.mules[themule.id];
            } else if (args[2]) { // two elements filled (mule.variable)
                themule = msg.mules.filter(a => a.get('name') === checkTicks(args[0]))[0];
                thevar = checkTicks(args[2]);
                if (themule) {
                    ovar = msg.variables.mules[themule.id];
                    thechar = 'table';
                }
            } else { // one element filled (variable)
                thevar = checkTicks(args[0]);
                ovar = args[6] ? msg.variables.alltables : msg.variables.all;
            }
            if (args[6] || thechar === 'table') {
                let a6 = (args[6] || 'name').toLowerCase();
                switch (a6) {
                    case 'url':
                    case 'avatar':
                        theask = 'avatar';
                        break;
                    case 'image':
                    case 'html':
                        theask = 'image';
                        break;
                    default:
                        theask = 'name';
                }
            }
            return { thevar: thevar, themule: themule, thechar: thechar, theask: theask, ovar: ovar };
        };
        msg.content = msg.content.replace(getrx, (m, ...args) => {
            let retval;
            let varPackage = fillMuleParts(...args);

            if (varPackage.ovar) {
                if (varPackage.themule) {
                    if (varPackage.themule.get('type') === 'ability') retval = varPackage.ovar[varPackage.thevar];
                    else retval = varPackage.ovar.hasOwnProperty(varPackage.thevar) ? varPackage.ovar[varPackage.thevar][varPackage.theask] : undefined;
                } else { // pulling from variables.all or variables.alltables
                    if (varPackage.theask) retval = varPackage.ovar[varPackage.thevar] ? varPackage.ovar[varPackage.thevar][varPackage.theask] : undefined;
                }
            } 
            if (typeof retval === 'undefined' && varPackage.ovar && internalTestLib.num(varPackage.thevar)) { // no explicit variable, but we have a library and the variable is a number, so we check for a range key
                let varrangerx = /((?<low>-?\d+)-(?<high>-?\d+)|(?<range>!=|>=|<=|>|<)(?<singleval>-?\d+))$/;
                let res;
                let keys = Object.keys(varPackage.ovar)
                    .filter(k => varrangerx.test(k))
                    .filter(p => {
                        res = varrangerx.exec(p);
                        return res.groups.low ?
                            typeProcessor['-'](Number(varPackage.thevar), Number(res.groups.low), Number(res.groups.high)) :
                            typeProcessor[res.groups.range](Number(varPackage.thevar), Number(res.groups.singleval));
                    });
                if (keys.length && varPackage.ovar.hasOwnProperty(keys[0])) {
                    if (varPackage.themule) {
                        if (varPackage.themule.get('type') === 'ability') retval = varPackage.ovar[keys[0]];
                        else retval = varPackage.ovar[keys[0]][varPackage.theask];
                    } else { // pulling from variables.all or variables.alltables
                        retval = varPackage.theask ? varPackage.ovar[keys[0]][varPackage.theask] : varPackage.ovar[keys[0]];
                    }
                }
            }
            if (retval) {
                status.push('changed');
            } else {
                status.push('unresolved');
                notes.push(`Unable to resolve variable: ${m}`);
            }
            return retval || ``;
        });
        return condensereturn(funcret, status, notes);
    };

    const mulesetter = (msg, msgstate = {}) => {
        let funcret = { runloop: false, status: 'unchanged', notes: '' };
        msg.variables = msg.variables || getEmptyVarObject();
        let variables = msg.variables;
        msg.mules = msg.mules || [];
        if (msg.type !== 'api' || !testSetConstructs(msg)) return funcret;
        if (!Object.keys(msgstate).length && scriptisplugin) return funcret;
        let status = [];
        let notes = [];

        const fillMuleParts = (v) => { 
            let thevar, themule, thechar, ovar;
            let textparts = { themule: '', thechar: '' };
            let dotcount = v.split('.').length - 1;
            if (dotcount === 0) { //variable only
                thevar = v;
                if (msg.mules.length === 1) {
                    themule = msg.mules[0];
                    if (themule.get('type') === 'rollabletable') {
                        ovar = msg.variables.mules[themule.id];
                    } else {
                        thechar = charFromAmbig(themule.get('characterid'), msg.playerid);
                        if (thechar) ovar = msg.variables.mules[themule.id];
                    }
                } else {
                    ovar = msg.variables.all;
                }
            } else if (dotcount === 1) { // mule.variable
                [themule, thevar] = v.split('.');
                textparts.themule = themule;
                themule = msg.mules.filter(a => a.get('name') === themule)[0];
                if (themule) {
                    if (themule.get('type') === 'rollabletable') {
                        ovar = msg.variables.mules[themule.id];
                    } else {
                        thechar = charFromAmbig(themule.get('characterid'), msg.playerid);
                        if (thechar) ovar = msg.variables.mules[themule.id];
                    }
                }
            } else if (dotcount >= 2) { // char.mule.variable (perhaps more dots)
                [thechar, themule, ...thevar] = v.split('.');
                thevar = thevar.join('.');
                textparts.themule = themule;
                textparts.thechar = thechar;
                if (thechar.toLowerCase() === 'table') {
                    themule = msg.mules.filter(a => a.get('name') === themule)[0];
                } else {
                    thechar = charFromAmbig(thechar, msg.playerid);
                    themule = thechar ? msg.mules.filter(a => a.get('name') === themule && a.get('characterid') === thechar.id)[0] : undefined;
                }
                if (themule) ovar = msg.variables.mules[themule.id];
            }
            return { thevar: thevar, themule: themule, thechar: thechar, ovar: ovar, textparts: textparts };
        };

        msg.content = msg.content.replace(setrx, (m, g1) => {
            let setres = /^(.+?)(?:\s*=\s*)(.+)/.exec(g1);
            let [sv, sval] = [setres[1], setres[2]]; // [g1.slice(0, setres.index), g1.slice(setres.index + setres[0].length)];
            let varPackage = fillMuleParts(sv);
            let svar = varPackage.thevar;
            let localaction = '';

            // write new value back to mule ability
            let svarrx = new RegExp(`^${escapeRegExp(svar)}(?:\\s*=.*|$)`, 'm');
            if (!varPackage.ovar && varPackage.textparts.themule.length && varPackage.thechar) { // no mule found, but if a char.mule.var was specified, so we create it
                varPackage.themule = createObj('ability', { characterid: varPackage.thechar.id, name: varPackage.textparts.themule });
                msg.mules.push(varPackage.themule);
                variables.mules[varPackage.themule.id] = {};
                varPackage.ovar = variables.mules[varPackage.themule.id];
            }
            if (varPackage.ovar && varPackage.themule) {
                variables.all[svar] = sval;
                variables.mules[varPackage.themule.id][svar] = sval;
            }
            if (varPackage.themule && varPackage.themule.get('type') === 'ability') {
                localaction = varPackage.themule.get('action');
                if (svarrx.test(localaction)) {
                    localaction = localaction.replace(svarrx, `${svar}=${sval}`);
                } else { // no text in the action, or it's missing this variable
                    localaction = `${localaction.length ? localaction + '\n' : ''}${svar}=${sval}`;
                }
                varPackage.themule.set({ action: localaction });
            } else {
                notes.push(`Unable to save variable (no mule or table-mule specified): ${m}`);
            }
            status.push('changed');
            return '';
        });
        return condensereturn(funcret, status, notes);
    };

    const checkDependencies = (deps) => {
        /* pass array of objects like
            { name: 'ModName', version: '#.#.#' || '', mod: ModName || undefined, checks: [ [ExposedItem, type], [ExposedItem, type] ] }
        */
        const dependencyEngine = (deps) => {
            const versionCheck = (mv, rv) => {
                let modv = [...mv.split('.'), ...Array(4).fill(0)].slice(0, 4);
                let reqv = [...rv.split('.'), ...Array(4).fill(0)].slice(0, 4);
                return reqv.reduce((m, v, i) => {
                    if (m.pass || m.fail) return m;
                    if (i < 3) {
                        if (parseInt(modv[i]) > parseInt(reqv[i])) m.pass = true;
                        else if (parseInt(modv[i]) < parseInt(reqv[i])) m.fail = true;
                    } else {
                        // all betas are considered below the release they are attached to
                        if (reqv[i] === 0 && modv[i] === 0) m.pass = true;
                        else if (modv[i] === 0) m.pass = true;
                        else if (reqv[i] === 0) m.fail = true;
                        else if (parseInt(modv[i].slice(1)) >= parseInt(reqv[i].slice(1))) m.pass = true;
                    }
                    return m;
                }, { pass: false, fail: false }).pass;
            };

            let result = { passed: true, failures: {}, optfailures: {} };
            deps.forEach(d => {
                let failObj = d.optional ? result.optfailures : result.failures;
                if (!d.mod) {
                    if (!d.optional) result.passed = false;
                    failObj[d.name] = 'Not found';
                    return;
                }
                if (d.version && d.version.length) {
                    if (!(API_Meta[d.name].version && API_Meta[d.name].version.length && versionCheck(API_Meta[d.name].version, d.version))) {
                        if (!d.optional) result.passed = false;
                        failObj[d.name] = `Incorrect version. Required v${d.version}. ${API_Meta[d.name].version && API_Meta[d.name].version.length ? `Found v${API_Meta[d.name].version}` : 'Unable to tell version of current.'}`;
                        return;
                    }
                }
                d.checks.reduce((m, c) => {
                    if (!m.passed) return m;
                    let [pname, ptype] = c;
                    if (!d.mod.hasOwnProperty(pname) || typeof d.mod[pname] !== ptype) {
                        if (!d.optional) m.passed = false;
                        failObj[d.name] = `Incorrect version.`;
                    }
                    return m;
                }, result);
            });
            return result;
        };
        let depCheck = dependencyEngine(deps);
        let failures = '', contents = '', msg = '';
        if (Object.keys(depCheck.optfailures).length) { // optional components were missing
            failures = Object.keys(depCheck.optfailures).map(k => `&bull; <code>${k}</code> : ${depCheck.optfailures[k]}`).join('<br>');
            contents = `<span style="font-weight: bold">${apiproject}</span> utilizies one or more other scripts for optional features, and works best with those scripts installed. You can typically find these optional scripts in the 1-click Mod Library:<br>${failures}`;
            msg = `<div style="width: 100%;border: none;border-radius: 0px;min-height: 60px;display: block;text-align: left;white-space: pre-wrap;overflow: hidden"><div style="font-size: 14px;font-family: &quot;Segoe UI&quot;, Roboto, Ubuntu, Cantarell, &quot;Helvetica Neue&quot;, sans-serif"><div style="background-color: #000000;border-radius: 6px 6px 0px 0px;position: relative;border-width: 2px 2px 0px 2px;border-style:  solid;border-color: black;"><div style="border-radius: 18px;width: 35px;height: 35px;position: absolute;left: 3px;top: 2px;"><img style="background-color: transparent ; float: left ; border: none ; max-height: 40px" src="${apilogo}"></div><div style="background-color: #c94d4d;font-weight: bold;font-size: 18px;line-height: 36px;border-radius: 6px 6px 0px 0px;padding: 4px 4px 0px 43px;color: #ffffff;min-height: 38px;">MISSING MOD DETECTED</div></div><div style="background-color: white;padding: 4px 8px;border: 2px solid #000000;border-bottom-style: none;color: #404040;">${contents}</div><div style="background-color: white;text-align: right;padding: 4px 8px;border: 2px solid #000000;border-top-style: none;border-radius: 0px 0px 6px 6px"></div></div></div>`;
            sendChat(apiproject, `/w gm ${msg}`);
        }
        if (!depCheck.passed) {
            failures = Object.keys(depCheck.failures).map(k => `&bull; <code>${k}</code> : ${depCheck.failures[k]}`).join('<br>');
            contents = `<span style="font-weight: bold">${apiproject}</span> requires other scripts to work. Please use the 1-click Mod Library to correct the listed problems:<br>${failures}`;
            msg = `<div style="width: 100%;border: none;border-radius: 0px;min-height: 60px;display: block;text-align: left;white-space: pre-wrap;overflow: hidden"><div style="font-size: 14px;font-family: &quot;Segoe UI&quot;, Roboto, Ubuntu, Cantarell, &quot;Helvetica Neue&quot;, sans-serif"><div style="background-color: #000000;border-radius: 6px 6px 0px 0px;position: relative;border-width: 2px 2px 0px 2px;border-style:  solid;border-color: black;"><div style="border-radius: 18px;width: 35px;height: 35px;position: absolute;left: 3px;top: 2px;"><img style="background-color: transparent ; float: left ; border: none ; max-height: 40px" src="${apilogo}"></div><div style="background-color: #c94d4d;font-weight: bold;font-size: 18px;line-height: 36px;border-radius: 6px 6px 0px 0px;padding: 4px 4px 0px 43px;color: #ffffff;min-height: 38px;">MISSING MOD DETECTED</div></div><div style="background-color: white;padding: 4px 8px;border: 2px solid #000000;border-bottom-style: none;color: #404040;">${contents}</div><div style="background-color: white;text-align: right;padding: 4px 8px;border: 2px solid #000000;border-top-style: none;border-radius: 0px 0px 6px 6px"></div></div></div>`;
            sendChat(apiproject, `/w gm ${msg}`);
            return false;
        }
        return true;
    };

    let scriptisplugin = false;
    const mulerget = (m, s) => mulegetter(m, s);
    const mulerset = (m, s) => mulesetter(m, s);
    on('chat:message', mulegetter);
    on('chat:message', mulesetter);
    on('ready', () => {
        versionInfo();
        logsig();
        let reqs = [
            {
                name: 'libTable',
                version: `1.0.0`,
                mod: typeof libTable !== 'undefined' ? libTable : undefined,
                checks: [
                    ['getTable', 'function'],
                    ['getTables', 'function'],
                    ['getItems', 'function'],
                    ['getItemsByIndex', 'function'],
                    ['getItemsByName', 'function'],
                    ['getItemsByWeight', 'function'],
                    ['getItemsByWeightedIndex', 'function']
                ]
            },
            {
                name: 'Messenger',
                version: `1.0.0`,
                mod: typeof Messenger !== 'undefined' ? Messenger : undefined,
                checks: [['Button', 'function'], ['MsgBox', 'function'], ['HE', 'function'], ['Html', 'function'], ['Css', 'function']]
            }
        ];
        if (!checkDependencies(reqs)) return;

        html = Messenger.Html();
        css = Messenger.Css();
        HE = Messenger.HE;
        on('chat:message', handleConfig);

        scriptisplugin = (typeof ZeroFrame !== `undefined`);
        if (typeof ZeroFrame !== 'undefined') {
            ZeroFrame.RegisterMetaOp(mulerget, { priority: 25, handles: ['get', 'muleget', 'muleload', 'load'] });
            ZeroFrame.RegisterMetaOp(mulerset, { priority: 65, handles: ['set', 'muleset'] });
        }
    });
    return {
    };
})();
{ try { throw new Error(''); } catch (e) { API_Meta.Muler.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.Muler.offset); } }
/*
================================================================
END SCRIPT: Muler
================================================================
*/

/*
================================================================
BEGIN SCRIPT: PathMath
SOURCE FILE: PathMath.md
================================================================
*/
/* globals VecMath MatrixMath */
var API_Meta = API_Meta||{}; //eslint-disable-line no-var
API_Meta.PathMath={offset:Number.MAX_SAFE_INTEGER,lineCount:-1};
{try{throw new Error('');}catch(e){API_Meta.PathMath.offset=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-4);}}
API_Meta.PathMath.version = '1.7';


/**
 * PathMath script
 *
 * This is a library that provides mathematical operations involving Paths.
 * It intended to be used by other scripts and has no stand-alone
 * functionality of its own. All the library's operations are exposed by the
 * PathMath object created by this script.
 */
const PathMath = (() => {

    /** The size of a single square on a page, in pixels. */
    const UNIT_SIZE_PX = 70;

    let isJumpgate = ()=>{
      if(['jumpgate'].includes(Campaign().get('_release'))) {
        isJumpgate = () => true;
      } else {
        isJumpgate = () => false;
      }
      return isJumpgate();
    };

    /**
     * A vector used to define a homogeneous point or a direction.
     * @typedef {number[]} Vector
     */

    /**
     * A line segment defined by two homogeneous 2D points.
     * @typedef {Vector[]} Segment
     */

    /**
     * Information about a path's 2D transform.
     * @typedef {Object} PathTransformInfo
     * @property {number} angle
     *           The path's rotation angle in radians.
     * @property {number} cx
     *           The x coordinate of the center of the path's bounding box.
     * @property {number} cy
     *           The y coordinate of the center of the path's bounding box.
     * @property {number} height
     *           The unscaled height of the path's bounding box.
     * @property {number} scaleX
     *           The path's X-scale.
     * @property {number} scaleY
     *           The path's Y-scale.
     * @property {number} width
     *           The unscaled width of the path's bounding box.
     */

    /**
     * Rendering information for shapes.
     * @typedef {Object} RenderInfo
     * @property {string} [controlledby]
     * @property {string} [fill]
     * @property {string} [stroke]
     * @property {string} [strokeWidth]
     */

    /**
     * Some shape defined by a path.
     * @abstract
     */
    class PathShape {
      constructor(vertices) {
        this.vertices = vertices || [];
      }

      /**
       * Gets the distance from this shape to some point.
       * @abstract
       * @param {vec3} pt
       * @return {number}
       */
      distanceToPoint(/* pt */) {
        throw new Error('Must be defined by subclass.');
      }

      /**
       * Gets the bounding box of this shape.
       * @return {BoundingBox}
       */
      getBoundingBox() {
        if(!this._bbox) {
          let left, right, top, bottom;
          _.each(this.vertices, (v, i) => {
            if(i === 0) {
              left = v[0];
              right = v[0];
              top = v[1];
              bottom = v[1];
            }
            else {
              left = Math.min(left, v[0]);
              right = Math.max(right, v[0]);
              top = Math.min(top, v[1]);
              bottom = Math.max(bottom, v[1]);
            }
          });
          let width = right - left;
          let height = bottom - top;
          this._bbox = new BoundingBox(left, top, width, height);
        }
        return this._bbox;
      }

      /**
       * Checks if this shape intersects another shape.
       * @abstract
       * @param {PathShape} other
       * @return {boolean}
       */
      intersects(/* other */) {
        throw new Error('Must be defined by subclass.');
      }

      /**
       * Renders this path.
       * @param {string} pageId
       * @param {string} layer
       * @param {RenderInfo} renderInfo
       * @return {Roll20.Path}
       */
      render(pageId, layer, renderInfo) {
        let segments = this.toSegments();
        let pathData = segmentsToPath(segments);
        _.extend(pathData, renderInfo, {
          _pageid: pageId,
          layer
        });
        return createObj(isJumpgate() ? 'pathv2' : 'path', pathData);
      }

      /**
       * Returns the segments that make up this shape.
       * @abstract
       * @return {Segment[]}
       */
      toSegments() {
        throw new Error('Must be defined by subclass.');
      }

      /**
       * Produces a copy of this shape, transformed by an affine
       * transformation matrix.
       * @param {MatrixMath.Matrix} matrix
       * @return {PathShape}
       */
      transform(matrix) {
        let vertices = _.map(this.vertices, v => {
          return MatrixMath.multiply(matrix, v);
        });
        let Clazz = this.constructor;
        return new Clazz(vertices);
      }
    }

    /**
     * An open shape defined by a path or list of vertices.
     */
    class Path extends PathShape {

      /**
       * @param {(Roll20Path|vec3[])} path
       */
      constructor(path) {
        super();
        if(_.isArray(path))
          this.vertices = path;
        else {
          this._segments = toSegments(path);
          _.each(this._segments, (seg, i) => {
            if(i === 0)
              this.vertices.push(seg[0]);
            this.vertices.push(seg[1]);
          });
        }

        this.numVerts = this.vertices.length;
      }

      /**
       * Gets the distance from this path to some point.
       * @param {vec3} pt
       * @return {number}
       */
      distanceToPoint(pt) {
        let dist = _.chain(this.toSegments())
        .map(seg => {
          let [ p, q ] = seg;
          return VecMath.ptSegDist(pt, p, q);
        })
        .min()
        .value();
        return dist;
      }

      /**
       * Checks if this path intersects with another path.
       * @param {Polygon} other
       * @return {boolean}
       */
      intersects(other) {
        let thisBox = this.getBoundingBox();
        let otherBox = other.getBoundingBox();

        // If the bounding boxes don't intersect, then the paths won't
        // intersect.
        if(!thisBox.intersects(otherBox))
          return false;

        // Naive approach: Since our shortcuts didn't return, check each
        // path's segments for intersections with each of the other
        // path's segments. This takes O(n^2) time.
        return !!_.find(this.toSegments(), seg1 => {
          return !!_.find(other.toSegments(), seg2 => {
            return !!segmentIntersection(seg1, seg2);
          });
        });
      }

      /**
       * Produces a list of segments defining this path.
       * @return {Segment[]}
       */
      toSegments() {
        if(!this._segments) {
          if (this.numVerts <= 1)
            return [];

          this._segments = _.map(_.range(this.numVerts - 1), i => {
            let v = this.vertices[i];
            let vNext = this.vertices[i + 1];
            return [v, vNext];
          });
        }
        return this._segments;
      }
    }

    /**
     * A closed shape defined by a path or a list of vertices.
     */
    class Polygon extends PathShape {

      /**
       * @param {(Roll20Path|vec3[])} path
       */
      constructor(path) {
        super();
        if(_.isArray(path))
          this.vertices = path;
        else {
          this._segments = toSegments(path);
          this.vertices = _.map(this._segments, seg => {
            return seg[0];
          });
        }

        this.numVerts = this.vertices.length;
        if(this.numVerts < 3)
          throw new Error('A polygon must have at least 3 vertices.');
      }

      /**
       * Determines whether a point lies inside the polygon using the
       * winding algorithm.
       * See: http://geomalgorithms.com/a03-_inclusion.html
       * @param {vec3} p
       * @return {boolean}
       */
      containsPt(p) {
        // A helper function that tests if a point is "left" of a line segment.
        let _isLeft = (p0, p1, p2) => {
          return (p1[0] - p0[0])*(p2[1] - p0[1]) - (p2[0]-p0[0])*(p1[1]-p0[1]);
        };

        let total = 0;
        _.each(this.vertices, (v1, i) => {
          let v2 = this.vertices[(i+1) % this.numVerts];

          // Check for valid up intersect.
          if(v1[1] <= p[1] && v2[1] > p[1]) {
            if(_isLeft(v1, v2, p) > 0)
              total++;
          }

          // Check for valid down intersect.
          else if(v1[1] > p[1] && v2[1] <= p[1]) {
            if(_isLeft(v1, v2, p) < 0)
              total--;
          }
        });
        return !!total; // We are inside if our total windings are non-zero.
      }

      /**
       * Gets the distance from this polygon to some point.
       * @param {vec3} pt
       * @return {number}
       */
      distanceToPoint(pt) {
        if(this.containsPt(pt))
          return 0;
        else
          return _.chain(this.toSegments())
          .map(seg => {
            let [ p, q ] = seg;
            return VecMath.ptSegDist(pt, p, q);
          })
          .min()
          .value();
      }

      /**
       * Gets the area of this polygon.
       * @return {number}
       */
      getArea() {
        let triangles = this.tessellate();
        return _.reduce(triangles, (area, tri) => {
          return area + tri.getArea();
        }, 0);
      }

      /**
       * Determines whether each vertex along the polygon is convex (1)
       * or concave (-1). A vertex lying on a straight line is assined 0.
       * @return {int[]}
       */
      getConvexness() {
        return Polygon.getConvexness(this.vertices);
      }

      /**
       * Gets the convexness information about each vertex.
       * @param {vec3[]}
       * @return {int[]}
       */
      static getConvexness(vertices) {
        let totalAngle = 0;
        let numVerts = vertices.length;
        let vertexCurves = _.map(vertices, (v, i) => {
          let vPrev = vertices[(i-1 + numVerts) % numVerts];
          let vNext = vertices[(i+1 + numVerts) % numVerts];

          let u = VecMath.sub(v, vPrev);
          let w = VecMath.sub(vNext, v);
          let uHat = VecMath.normalize(u);
          let wHat = VecMath.normalize(w);

          let cross = VecMath.cross(uHat, wHat);
          let sign = cross[2];
          if(sign)
            sign = sign/Math.abs(sign);

          let dot = VecMath.dot(uHat, wHat);
          let angle = Math.acos(dot)*sign;
          totalAngle += angle;

          return sign;
        });

        if(totalAngle < 0)
          return _.map(vertexCurves, curve => {
            return -curve;
          });
        else
          return vertexCurves;
      }

      /**
       * Checks if this polygon intersects with another polygon.
       * @param {(Polygon|Path)} other
       * @return {boolean}
       */
      intersects(other) {
        let thisBox = this.getBoundingBox();
        let otherBox = other.getBoundingBox();

        // If the bounding boxes don't intersect, then the polygons won't
        // intersect.
        if(!thisBox.intersects(otherBox))
          return false;

        // If either polygon contains the first point of the other, then
        // they intersect.
        if(this.containsPt(other.vertices[0]) ||
          (other instanceof Polygon && other.containsPt(this.vertices[0])))
          return true;

        // Naive approach: Since our shortcuts didn't return, check each
        // polygon's segments for intersections with each of the other
        // polygon's segments. This takes O(n^2) time.
        return !!_.find(this.toSegments(), seg1 => {
          return !!_.find(other.toSegments(), seg2 => {
            return !!segmentIntersection(seg1, seg2);
          });
        });
      }

      /**
       * Checks if this polygon intersects a Path.
       * @param {Path} path
       * @return {boolean}
       */
      intersectsPath(path) {
        let segments1 = this.toSegments();
        let segments2 = PathMath.toSegments(path);

        // The path intersects if any point is inside this polygon.
        if(this.containsPt(segments2[0][0]))
          return true;

        // Check if any of the segments intersect.
        return !!_.find(segments1, seg1 => {
          return _.find(segments2, seg2 => {
            return PathMath.segmentIntersection(seg1, seg2);
          });
        });
      }

      /**
       * Tessellates a closed path representing a simple polygon
       * into a bunch of triangles.
       * @return {Triangle[]}
       */
      tessellate() {
        let triangles = [];
        let vertices = _.clone(this.vertices);

        // Tessellate using ear-clipping algorithm.
        while(vertices.length > 0) {
          if(vertices.length === 3) {
            triangles.push(new Triangle(vertices[0], vertices[1], vertices[2]));
            vertices = [];
          }
          else {
            // Determine whether each vertex is convex, concave, or linear.
            let convexness = Polygon.getConvexness(vertices);
            let numVerts = vertices.length;

            // Find the next ear to clip from the polygon.
            let earIndex = _.find(_.range(numVerts), i => {
              let v = vertices[i];
              let vPrev = vertices[(numVerts + i -1) % numVerts];
              let vNext = vertices[(numVerts + i + 1) % numVerts];

              let vConvexness = convexness[i];
              if(vConvexness === 0) // The vertex lies on a straight line. Clip it.
                return true;
              else if(vConvexness < 0) // The vertex is concave.
                return false;
              else { // The vertex is convex and might be an ear.
                let triangle = new Triangle(vPrev, v, vNext);

                // The vertex is not an ear if there is at least one other
                // vertex inside its triangle.
                return !_.find(vertices, (v2) => {
                  if(v2 === v || v2 === vPrev || v2 === vNext)
                    return false;
                  else {
                    return triangle.containsPt(v2);
                  }
                });
              }
            });

            let v = vertices[earIndex];
            let vPrev = vertices[(numVerts + earIndex -1) % numVerts];
            let vNext = vertices[(numVerts + earIndex + 1) % numVerts];
            triangles.push(new Triangle(vPrev, v, vNext));
            vertices.splice(earIndex, 1);
          }
        }
        return triangles;
      }

      /**
       * Produces a list of segments defining this polygon.
       * @return {Segment[]}
       */
      toSegments() {
        if(!this._segments) {
          this._segments = _.map(this.vertices, (v, i) => {
            let vNext = this.vertices[(i + 1) % this.numVerts];
            return [v, vNext];
          });
        }
        return this._segments;
      }
    }

    /**
     * A 3-sided polygon that is great for tessellation!
     */
    class Triangle extends Polygon {
      /**
       * @param {vec3} p1
       * @param {vec3} p2
       * @param {vec3} p3
       */
      constructor(p1, p2, p3) {
        if(_.isArray(p1))
          [p1, p2, p3] = p1;
        super([p1, p2, p3]);

        this.p1 = p1;
        this.p2 = p2;
        this.p3 = p3;
      }

      /**
       * @inheritdoc
       */
      getArea() {
        let base = VecMath.sub(this.p2, this.p1);
        let width = VecMath.length(base);
        let height = VecMath.ptLineDist(this.p3, this.p1, this.p2);

        return width*height/2;
      }
    }

    /**
     * A circle defined by its center point and radius.
     */
    class Circle extends PathShape {

      /**
       * @param {vec3} pt
       * @param {number} r
       */
      constructor(pt, r) {
        super();
        this.center = pt;
        this.radius = r;
        this.diameter = 2*r;
      }

      /**
       * Checks if a point is contained within this circle.
       * @param {vec3} pt
       * @return {boolean}
       */
      containsPt(pt) {
        let dist = VecMath.dist(this.center, pt);
        return dist <= this.radius;
      }

      /**
       * Gets the distance from this circle to some point.
       * @param {vec3} pt
       * @return {number}
       */
      distanceToPoint(pt) {
        if(this.containsPt(pt))
          return 0;
        else {
          return VecMath.dist(this.center, pt) - this.radius;
        }
      }

      /**
       * Gets this circle's area.
       * @return {number}
       */
      getArea() {
        return Math.PI*this.radius*this.radius;
      }

      /**
       * Gets the circle's bounding box.
       * @return {BoundingBox}
       */
      getBoundingBox() {
        let left = this.center[0] - this.radius;
        let top = this.center[1] - this.radius;
        let dia = this.radius*2;
        return new BoundingBox(left, top, dia, dia);
      }

      /**
       * Gets this circle's circumference.
       * @return {number}
       */
      getCircumference() {
        return Math.PI*this.diameter;
      }

      /**
       * Checks if this circle intersects another circle.
       * @param {Circle} other
       * @return {boolean}
       */
      intersects(other) {
        let dist = VecMath.dist(this.center, other.center);
        return dist <= this.radius + other.radius;
      }

      /**
       * Checks if this circle intersects a polygon.
       * @param {Polygon} poly
       * @return {boolean}
       */
      intersectsPolygon(poly) {

        // Quit early if the bounding boxes don't overlap.
        let thisBox = this.getBoundingBox();
        let polyBox = poly.getBoundingBox();
        if(!thisBox.intersects(polyBox))
          return false;

        if(poly.containsPt(this.center))
          return true;
        return !!_.find(poly.toSegments(), seg => {
          return this.segmentIntersection(seg);
        });
      }

      /**
       * Renders this circle.
       * @param {string} pageId
       * @param {string} layer
       * @param {RenderInfo} renderInfo
       */
      render(pageId, layer, renderInfo) {
        let data;
        if(isJumpgate()){
          data = {
            shape: 'eli',
            x: this.center[0],
            y: this.center[1],
            points: `[[0,0],[${this.diameter*(renderInfo.scaleX??1)},${this.diameter*(renderInfo.scaleY??1)}]]`
          };
        } else {
          data = createCircleData(this.radius);
          data.left = this.center[0];
          data.top = this.center[1];
        }
        _.extend(data, renderInfo, {
          _pageid: pageId,
          layer,
          left: this.center[0],
          top: this.center[1]
        });
        return createObj(isJumpgate() ? 'pathv2' : 'path', data);
      }

      /**
       * Gets the intersection coefficient between this circle and a Segment,
       * if such an intersection exists. Otherwise, undefined is returned.
       * @param {Segment} segment
       * @return {Intersection}
       */
      segmentIntersection(segment) {
        if(this.containsPt(segment[0])) {
          let pt = segment[0];
          let s = 0;
          let t = VecMath.dist(this.center, segment[0])/this.radius;
          return [pt, s, t];
        }
        else {
          let u = VecMath.sub(segment[1], segment[0]);
          let uHat = VecMath.normalize(u);
          let uLen = VecMath.length(u);
          let v = VecMath.sub(this.center, segment[0]);

          let height = VecMath.ptLineDist(this.center, segment[0], segment[1]);
          let base = Math.sqrt(this.radius*this.radius - height*height);

          if(isNaN(base))
            return undefined;

          let scalar = VecMath.scalarProjection(u, v)-base;
          let s = scalar/uLen;

          if(s >= 0 && s <= 1) {
            let t = 1;
            let pt = VecMath.add(segment[0], VecMath.scale(uHat, scalar));
            return [pt, s, t];
          }
          else
            return undefined;
        }
      }
    }

    /**
     * The bounding box for a path/polygon.
     */
    class BoundingBox {
      /**
       * @param {Number} left
       * @param {Number} top
       * @param {Number} width
       * @param {Number} height
       */
      constructor(left, top, width, height) {
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
        this.right = left + width;
        this.bottom = top + height;
      }

      /**
       * Adds two bounding boxes.
       * @param  {BoundingBox} a
       * @param  {BoundingBox} b
       * @return {BoundingBox}
       */
      static add(a, b) {
        let left = Math.min(a.left, b.left);
        let top = Math.min(a.top, b.top);
        let right = Math.max(a.left + a.width, b.left + b.width);
        let bottom = Math.max(a.top + a.height, b.top + b.height);

        return new BoundingBox(left, top, right - left, bottom - top);
      }

      /**
       * Gets the area of this bounding box.
       * @return {number}
       */
      getArea() {
        return this.width * this.height;
      }

      /**
       * Checks if this bounding box intersects another bounding box.
       * @param {BoundingBox} other
       * @return {boolean}
       */
      intersects(other) {
        return !( this.left > other.right ||
                  this.right < other.left ||
                  this.top > other.bottom ||
                  this.bottom < other.top);
      }

      /**
       * Renders the bounding box.
       * @param {string} pageId
       * @param {string} layer
       * @param {RenderInfo} renderInfo
       */
      render(pageId, layer, renderInfo) {
        let verts = [
          [this.left, this.top, 1],
          [this.right, this.top, 1],
          [this.right, this.bottom, 1],
          [this.left, this.bottom, 1]
        ];
        let poly = new Polygon(verts);
        poly.render(pageId, layer, renderInfo);
      }
    }

    /**
     * Returns the partial path data for creating a circular path.
     * @param  {number} radius
     * @param {int} [sides]
     *        If specified, then a polygonal path with the specified number of
     *        sides approximating the circle will be created instead of a true
     *        circle.
     * @return {PathData}
     */
    function createCircleData(radius, sides) {
      let _path = [];
      if(sides) {
        let cx = radius;
        let cy = radius;
        let angleInc = Math.PI*2/sides;
        _path.push(['M', cx + radius, cy]);
        _.each(_.range(1, sides+1), function(i) {
          let angle = angleInc*i;
          let x = cx + radius*Math.cos(angle);
          let y = cy + radius*Math.sin(angle);
          _path.push(['L', x, y]);
        });
      }
      else {
        let r = radius;
        _path = [
          ['M', 0,      r],
          ['C', 0,      r*0.5,  r*0.5,  0,      r,      0],
          ['C', r*1.5,  0,      r*2,    r*0.5,  r*2.0,  r],
          ['C', r*2.0,  r*1.5,  r*1.5,  r*2.0,  r,      r*2.0],
          ['C', r*0.5,  r*2,    0,      r*1.5,  0,      r]
        ];
      }
      return {
        height: radius*2,
        _path: JSON.stringify(_path),
        width: radius*2
      };
    }

    /**
     * Computes the distance from a point to some path.
     * @param {vec3} pt
     * @param {(Roll20Path|PathShape)} path
     */
    function distanceToPoint(pt, path) {
      if(!(path instanceof PathShape))
        path = new Path(path);
      return path.distanceToPoint(pt);
    }

    /**
     * Gets a point along some Bezier curve of arbitrary degree.
     * @param {vec3[]} points
     *        The points of the Bezier curve. The points between the first and
     *        last point are the control points.
     * @param {number} scalar
     *        The parametric value for the point we want along the curve.
     *        This value is expected to be in the range [0, 1].
     * @return {vec3}
     */
    function getBezierPoint(points, scalar) {
      if(points.length < 2)
        throw new Error('Bezier curve cannot have less than 2 points.');
      else if(points.length === 2) {
        let u = VecMath.sub(points[1], points[0]);
        u = VecMath.scale(u, scalar);
        return VecMath.add(points[0], u);
      }
      else {
        let newPts = _.chain(points)
        .map((cur, i) => {
          if(i === 0)
            return undefined;

          let prev = points[i-1];
          return getBezierPoint([prev, cur], scalar);
        })
        .compact()
        .value();

        return getBezierPoint(newPts, scalar);
      }
    }


    /**
     * Calculates the bounding box for a list of paths.
     * @param {Roll20Path | Roll20Path[]} paths
     * @return {BoundingBox}
     */
    function getBoundingBox(paths) {
      if(!_.isArray(paths))
        paths = [paths];

      let result;
      _.each(paths, function(p) {
        let pBox = _getSingleBoundingBox(p);
        if(result)
          result = BoundingBox.add(result, pBox);
        else
          result = pBox;
      });
      return result;
    }

    /**
     * Returns the center of the bounding box countaining a path or list
     * of paths. The center is returned as a 2D homongeneous point
     * (It has a third component which is always 1 which is helpful for
     * affine transformations).
     * @param {(Roll20Path|Roll20Path[])} paths
     * @return {Vector}
     */
    function getCenter(paths) {
        if(!_.isArray(paths))
            paths = [paths];

        let bbox = getBoundingBox(paths);
        let cx = bbox.left + bbox.width/2;
        let cy = bbox.top + bbox.height/2;

        return [cx, cy, 1];
    }

    /**
     * @private
     * Calculates the bounding box for a single path.
     * @param  {Roll20Path} path
     * @return {BoundingBox}
     */
    function _getSingleBoundingBox(path) {
        let pathData = normalizePath(path);

        let width = pathData.width;
        let height = pathData.height;
        let left = pathData.left - width/2;
        let top = pathData.top - height/2;

        return new BoundingBox(left, top, width, height);
    }

    function _pathV2Bounds(path) {
      let p = JSON.parse(path.get('points'))??[];
      let {Mx,mx,My,my} = p.reduce((m,[x,y])=>({
        Mx:Math.max(m.Mx,x),
        mx:Math.min(m.mx,x),
        My:Math.max(m.My,y),
        my:Math.min(m.my,y)
      }),{Mx:-Infinity,mx:Infinity,My:-Infinity,my:Infinity});

      return [Mx-mx,My-my];
    }

    /**
     * Gets the 2D transform information about a path.
     * @param  {Roll20Path} path
     * @return {PathTransformInfo}
     */
    function getTransformInfo(path) {
      let angle = path.get('rotation')/180*Math.PI;


      if('path' === path.get('type')){
          let scaleX = path.get('scaleX');
          let scaleY = path.get('scaleY');

          // The untransformed width and height.
          let width = path.get('width');
          let height = path.get('height');
          // The transformed center of the path.
          let cx = path.get('left');
          let cy = path.get('top');

          return {
              angle: angle,
              cx: cx,
              cy: cy,
              height: height,
              scaleX: scaleX,
              scaleY: scaleY,
              width: width
          };
      } else {
        // pathv2
        let [width,height] = _pathV2Bounds(path);

        return {
          angle: angle,
          cx: path.get('x'),
          cy: path.get('y'),
          scaleX: 1,
          scaleY: 1,
          height: height, 
          width: width
        };
      }
    }

    /**
     * Checks if a path is closed, and is therefore a polygon.
     * @param {(Roll20Path|Segment[])}
     * @return {boolean}
     */
    function isClosed(path) { // eslint-disable-line no-unused-vars
      // Convert to segments.
      if(!_.isArray(path))
        path = toSegments(path);
      return (_.isEqual(path[0][0], path[path.length-1][1]));
    }


    /**
     * Produces a merged path string from a list of path objects.
     * @param {Roll20Path[]} paths
     * @return {String}
     */
    function mergePathStr(paths) {
        let merged = [];
        let bbox = getBoundingBox(paths);

        _.each(paths, function(p) {
            let pbox = getBoundingBox(p);

            // Convert the path to a normalized polygonal path.
            p = normalizePath(p);
            let parsed = JSON.parse(p._path);
            _.each(parsed, function(pathTuple) {
                let dx = pbox.left - bbox.left;
                let dy = pbox.top - bbox.top;

                // Move and Line tuples
                let x = pathTuple[1] + dx;
                let y = pathTuple[2] + dy;
                merged.push([pathTuple[0], x, y]);
            });
        });

        return JSON.stringify(merged);
    }

    /**
     * Reproduces the data for a polygonal path such that the scales are 1 and
     * its rotate is 0.
     * This can also normalize freehand paths, but they will be converted to
     * polygonal paths. The quatric Bezier curves used in freehand paths are
     * so short though, that it doesn't make much difference though.
     * @param {Roll20Path}
     * @return {PathData}
     */
    function normalizePath(path) {
        let segments = toSegments(path);
        return segmentsToPath(segments);
    }

    /**
     * Produces a UDL window from a Path.
     * This UDL window path will be created on the walls layer
     * and will have a type of transparent.
     * 
     * @param {Roll20Path} path
     * @return {Roll20Path} The Path object for the new UDL window.
     */
    function pathToUDLWindow(path) {
      let pathData = normalizePath(path);

      let curPage = path.get('_pageid');
      _.extend(pathData, {
        stroke: '#ff0000',
        barrierType: "transparent",
        _pageid: curPage,
        layer: 'walls'
      });

      return createObj(isJumpgate() ? 'pathv2' : 'path', pathData);
    }

    /**
     * Computes the intersection between the projected lines of
     * two homogenous 2D line segments.
     *
     * Explanation of the fancy mathemagics:
     * Let A be the first point in seg1 and B be the second point in seg1.
     * Let C be the first point in seg2 and D be the second point in seg2.
     * Let U be the vector from A to B.
     * Let V be the vector from C to D.
     * Let UHat be the unit vector of U.
     * Let VHat be the unit vector of V.
     *
     * Observe that if the dot product of UHat and VHat is 1 or -1, then
     * seg1 and seg2 are parallel, so they will either never intersect or they
     * will overlap. We will ignore the case where seg1 and seg2 are parallel.
     *
     * We can represent any point P along the line projected by seg1 as
     * P = A + SU, where S is some scalar value such that S = 0 yeilds A,
     * S = 1 yields B, and P is on seg1 if and only if 0 <= S <= 1.
     *
     * We can also represent any point Q along the line projected by seg2 as
     * Q = C + TV, where T is some scalar value such that T = 0 yeilds C,
     * T = 1 yields D, and Q is on seg2 if and only if 0 <= T <= 1.
     *
     * Assume that seg1 and seg2 are not parallel and that their
     * projected lines intersect at some point P.
     * Therefore, we have A + SU = C + TV.
     *
     * We can rearrange this such that we have C - A = SU - TV.
     * Let vector W = C - A, thus W = SU - TV.
     * Also, let coeffs = [S, T, 1].
     *
     * We can now represent this system of equations as the matrix
     * multiplication problem W = M * coeffs, where in column-major
     * form, M = [U, -V, [0,0,1]].
     *
     * By matrix-multiplying both sides by M^-1, we get
     * M^-1 * W = M^-1 * M * coeffs = coeffs, from which we can extract the
     * values for S and T.
     *
     * We can now get the point of intersection on the projected lines of seg1
     * and seg2 by substituting S in P = A + SU or T in Q = C + TV.
     *
     * @param {Segment} seg1
     * @param {Segment} seg2
     * @return {Intersection}
     *      The point of intersection in homogenous 2D coordiantes and its
     *      scalar coefficients along seg1 and seg2,
     *      or undefined if the segments are parallel.
     */
    function raycast(seg1, seg2) {
      let u = VecMath.sub(seg1[1], seg1[0]);
      let v = VecMath.sub(seg2[1], seg2[0]);
      let w = VecMath.sub(seg2[0], seg1[0]);

      // Can't use 0-length vectors.
      if(VecMath.length(u) === 0 || VecMath.length(v) === 0)
          return undefined;

      // If the two segments are parallel, then either they never intersect
      // or they overlap. Either way, return undefined in this case.
      let uHat = VecMath.normalize(u);
      let vHat = VecMath.normalize(v);
      let uvDot = VecMath.dot(uHat,vHat);
      if(Math.abs(uvDot) > 0.9999)
          return undefined;

      // Build the inverse matrix for getting the intersection point's
      // parametric coefficients along the projected segments.
      let m = [[u[0], u[1], 0], [-v[0], -v[1], 0], [0, 0, 1]];
      let mInv = MatrixMath.inverse(m);

      // Get the parametric coefficients for getting the point of intersection
      // on the projected semgents.
      let coeffs = MatrixMath.multiply(mInv, w);
      let s = coeffs[0];
      let t = coeffs[1];

      let uPrime = VecMath.scale(u, s);
      return [VecMath.add(seg1[0], uPrime), s, t];
    }

    /**
     * Computes the intersection between two homogenous 2D line segments,
     * if it exists. To figure out the intersection, a raycast is performed
     * between the two segments.
     * Seg1 and seg2 also intersect at that point if and only if 0 <= S, T <= 1.
     * @param {Segment} seg1
     * @param {Segment} seg2
     * @return {Intersection}
     *      The point of intersection in homogenous 2D coordiantes and its
     *      parametric coefficients along seg1 and seg2,
     *      or undefined if the segments don't intersect.
     */
    function segmentIntersection(seg1, seg2) {
      let intersection = raycast(seg1, seg2);
      if(!intersection)
        return undefined;

      // Return the intersection only if it lies on both the segments.
      let s = intersection[1];
      let t = intersection[2];
      if(s >= 0 && s <= 1 && t >= 0 && t <= 1)
        return intersection;
      else
        return undefined;
    }


    /**
     * Produces the data for creating a path from a list of segments forming a
     * continuous path.
     * @param {Segment[]}
     * @return {PathData}
     */
    function segmentsToPath(segments) {
        let left = segments[0][0][0];
        let right = segments[0][0][0];
        let top = segments[0][0][1];
        let bottom = segments[0][0][1];

        // Get the bounds of the segment.
        let pts = [];
        let isFirst = true;
        _.each(segments, function(segment) {
            let p1 = [segment[0][0],segment[0][1]];
            if(isFirst) {
                isFirst = false;
                pts.push(p1);
            }

            let p2 = [segment[1][0],segment[1][1]];

            left = Math.min(left, p1[0], p2[0]);
            right = Math.max(right, p1[0], p2[0]);
            top = Math.min(top, p1[1], p2[1]);
            bottom = Math.max(bottom, p1[1], p2[1]);

            pts.push(p2);
        });

        // Get the path's left and top coordinates.
        let width = right-left;
        let height = bottom-top;
        let cx = left + width/2;
        let cy = top + height/2;

      if(isJumpgate()){
        return {
          shape: 'pol',
          x: cx,
          y: cy,
          points: JSON.stringify(pts)
        };
      } else {
        // Convert the points to a _path.
        let _path = [];
        let firstPt = true;
        _.each(pts, function(pt) {
            let type = 'L';
            if(firstPt) {
                type = 'M';
                firstPt = false;
            }
            _path.push([type, pt[0]-left, pt[1]-top]);
        });

        return {
            _path: JSON.stringify(_path),
            left: cx,
            top: cy,
            width: width,
            height: height
        };
      }
    }

    function _circlePointsFromCorners(p1,p2) {
      const SPACING=20;

      // reorder points to get top left to bottom right.
      if(p1[0]>p2[0]){
        let x = p1[0];
        p1[0]=p2[0];
        p2[0]=x;
      }
      if(p1[1]>p2[1]){
        let y = p1[1];
        p1[1]=p2[1];
        p2[1]=y;
      }

      const cx = (p1[0]+p2[0])/2;
      const cy = (p1[1]+p2[1])/2;
      const rx = (p2[0]-p1[0])/2;
      const ry = (p2[1]-p1[1])/2;

      const cir = Math.PI * ( 3* (rx+ry) - Math.sqrt((3*rx+ry)*(3*ry+rx)))/4;
      // number of half subdivisions = circumference / (Spacing *2) or 1
      // 
//      const pn = (Math.max(Math.ceil(cir/SPACING),1)*4)-1; // guarentee odd

      let pn = Math.max(Math.ceil(cir/SPACING),1);
      pn = (1===pn%2 ? pn : pn+1); // guarentee odd

      const th = Math.PI/4/pn;

      let octs = [[],[],[],[],[],[],[],[]];

      for( let i = 1; i <= pn; ++i){
        const a = i * th;
        const ct = Math.cos(a);
        const st = Math.sin(a);

        const x1 = parseFloat((rx*ct).toFixed(1));
        const y1 = parseFloat((ry*st).toFixed(1));
        const x2 = parseFloat((rx*st).toFixed(1));
        const y2 = parseFloat((ry*ct).toFixed(1));


        // postive quad
        octs[0].push([cx+x1,cy+y1]);
        if(x1!==x2) {
          octs[1].unshift([cx+x2,cy+y2]);
        }

        octs[2].push([cx-x2,cy+y2]);
        if(x1!==x2) {
          octs[3].unshift([cx-x1,cy+y1]);
        }

        octs[4].push([cx-x1,cy-y1]);
        if(x1!==x2) {
          octs[5].unshift([cx-x2,cy-y2]);
        }

        octs[6].push([cx+x2,cy-y2]);
        if(x1!==x2) {
          octs[7].unshift([cx+x1,cy-y1]);
        }
      }
      let points = [
        [cx+rx,cy],
        ...octs[0],
        ...octs[1],
        [cx,cy+ry],
        ...octs[2],
        ...octs[3],
        [cx-rx,cy],
        ...octs[4],
        ...octs[5],
        [cx,cy-ry],
        ...octs[6],
        ...octs[7]
      ];

      return points;
    }

    function _normalizePathV2Points(points) {
      let {mX,mY} = points.reduce((m,pt)=>({
        mX: Math.min(pt[0],m.mX),
        mY: Math.min(pt[1],m.mY)
      }),{mX:Infinity,mY:Infinity});
      return points.map(pt=>[ pt[0]-mX, pt[1]-mY]);
    }

    /**
     * Converts a path into a list of line segments.
     * This supports freehand paths, but not elliptical paths.
     * @param {(Roll20Path|Roll20Path[])} path
     * @return {Segment[]}
     */
    function toSegments(path) {
        if(_.isArray(path))
            return _toSegmentsMany(path);

        let _path;
        try {
          let page = getObj('page', path.get('_pageid'));
          let pageWidth = page.get('width') * UNIT_SIZE_PX;
          let pageHeight = page.get('height') * UNIT_SIZE_PX;

          if("path" === path.get('type')){
            let rawPath = path.get('_path')
              .replace(/mapWidth/g, pageWidth)
              .replace(/mapHeight/g, pageHeight);
            _path = JSON.parse(rawPath);
          } else {
            // pathv2
            _path = JSON.parse(path.get('points'));
          }
        }
        catch (err) {
          log(`Error parsing Roll20 path JSON: ${path.get('_path')}`);
          sendChat('Path Math', '/w gm An error was encountered while trying to parse the JSON for a path. See the API Console Log for details.');
          return [];
        }

        let transformInfo = getTransformInfo(path);

        let segments = [];

        if("path" === path.get('type')){

          let prevPt;
          let prevType;

          _.each(_path, tuple => {
              let type = tuple[0];

              // Convert the previous point and tuple into segments.
              let newSegs = [];

              // Cubic Bezier
              if(type === 'C') {
                newSegs = _toSegmentsC(prevPt, tuple, transformInfo);
                if(newSegs.length > 0)
                  prevPt = newSegs[newSegs.length - 1][1];
              }

              // Line or two successive Moves. A curious quirk of the latter
              // case is that UDL treats them as segments for windows.
              // Thanks to Scott C and Aaron for letting me know about this,
              // whether it's an intended feature or not.
              if(type === 'L' || (type === 'M' && prevType === 'M')) {
                newSegs = _toSegmentsL(prevPt, tuple, transformInfo);
                if(newSegs.length > 0)
                  prevPt = newSegs[0][1];
              }

              // Move, not preceded by another move (not a UDL window)
              if(type === 'M' && prevType !== 'M') {
                prevPt = tupleToPoint(tuple, transformInfo);
              }

              // Freehand (tiny Quadratic Bezier)
              if(type === 'Q') {
                newSegs = _toSegmentsQ(prevPt, tuple, transformInfo);
                if(newSegs.length > 0)
                  prevPt = newSegs[0][1];
              }

              _.each(newSegs, s => {
                segments.push(s);
              });
              prevType = type;
          });
        } else {
          _path = _normalizePathV2Points(_path);
          // pathv2
          switch(path.get('shape')){
            case 'rec': {
                let p1 = tupleToPoint(['L',_path[0][0],_path[0][1]],transformInfo);
                let p2 = tupleToPoint(['L',_path[1][0],_path[1][1]],transformInfo);
                let x1 = Math.min(p1[0],p2[0]);
                let x2 = Math.max(p1[0],p2[0]);
                let y1 = Math.min(p1[1],p2[1]);
                let y2 = Math.max(p1[1],p2[1]);
                // for rec, there are only two points and you construct the other two.
                segments = [
                  [[x1,y1,1],[x1,y2,1]],
                  [[x1,y2,1],[x2,y2,1]],
                  [[x2,y2,1],[x2,y1,1]],
                  [[x2,y1,1],[x1,y1,1]]
                ];
              }
              break;
            case 'eli': {
                // approximate the segments of a circle
                let p1 = tupleToPoint(['L',_path[0][0],_path[0][1]],transformInfo);
                let p2 = tupleToPoint(['L',_path[1][0],_path[1][1]],transformInfo);
                let x1 = Math.min(p1[0],p2[0]);
                let x2 = Math.max(p1[0],p2[0]);
                let y1 = Math.min(p1[1],p2[1]);
                let y2 = Math.max(p1[1],p2[1]);

                let points = _circlePointsFromCorners([x1,y1],[x2,y2]);

                segments = points.reduce((m,p,i,a)=>
                  i
                  ? [...m,[ [...a[i-1],1],[...p,1]]]
                  : [...m,[ [...a[a.length-1],1],[...p,1]]]
                ,[]);
              }
              break;
            case 'pol': 
              segments = _path.reduce((m,p,i,a)=>
                i
                ? [...m,[ tupleToPoint(['L',...a[i-1]],transformInfo),tupleToPoint(['L',...p],transformInfo)]]
                : m
              ,[]);

              break;
            case 'free': 
              // fake it as a poly line for now...
              segments = _path.reduce((m,p,i,a)=>
                i
                ? [...m,[ tupleToPoint(['L',...a[i-1]],transformInfo),tupleToPoint(['L',...p],transformInfo)]]
                : m
              ,[]);

              break;
          }

        }

        return _.compact(segments);
    }

    /**
     * Converts a 'C' type path point to a list of segments approximating the
     * curve.
     * @private
     * @param {vec3} prevPt
     * @param {PathTuple} tuple
     * @param {PathTransformInfo} transformInfo
     * @return {Segment[]}
     */
    function _toSegmentsC(prevPt, tuple, transformInfo) {
      let cPt1 = tupleToPoint(['L', tuple[1], tuple[2]], transformInfo);
      let cPt2 = tupleToPoint(['L', tuple[3], tuple[4]], transformInfo);
      let pt = tupleToPoint(['L', tuple[5], tuple[6]], transformInfo);
      let points = [prevPt, cPt1, cPt2, pt];

      // Choose the number of segments based on the rough approximate arc length.
      // Each segment should be <= 10 pixels.
      let approxArcLength = VecMath.dist(prevPt, cPt1) + VecMath.dist(cPt1, cPt2) + VecMath.dist(cPt2, pt);
      let numSegs = Math.max(Math.ceil(approxArcLength/10), 1);

      let bezierPts = [prevPt];
      _.each(_.range(1, numSegs), i => {
        let scalar = i/numSegs;
        let bPt = getBezierPoint(points, scalar);
        bezierPts.push(bPt);
      });
      bezierPts.push(pt);

      return _.chain(bezierPts)
      .map((cur, i) => {
        if(i === 0)
          return undefined;

        let prev = bezierPts[i-1];
        return [prev, cur];
      })
      .compact()
      .value();
    }

    /**
     * Converts an 'L' type path point to a segment.
     * @private
     * @param {vec3} prevPt
     * @param {PathTuple} tuple
     * @param {PathTransformInfo} transformInfo
     * @return {Segment[]}
     */
    function _toSegmentsL(prevPt, tuple, transformInfo) {
      // Transform the point to 2D homogeneous map coordinates.
      let pt = tupleToPoint(tuple, transformInfo);
      let segments = [];
      if(!(prevPt[0] == pt[0] && prevPt[1] == pt[1]))
        segments.push([prevPt, pt]);
      return segments;
    }

    /**
     * Converts a 'Q' type path point to a segment approximating
     * the freehand curve.
     * @private
     * @param {vec3} prevPt
     * @param {PathTuple} tuple
     * @param {PathTransformInfo} transformInfo
     * @return {Segment[]}
     */
    function _toSegmentsQ(prevPt, tuple, transformInfo) {
      // Freehand Bezier paths are very small, so let's just
      // ignore the control point for it entirely.
      tuple[1] = tuple[3];
      tuple[2] = tuple[4];

      // Transform the point to 2D homogeneous map coordinates.
      let pt = tupleToPoint(tuple, transformInfo);

      let segments = [];
      if(!(prevPt[0] == pt[0] && prevPt[1] == pt[1]))
        segments.push([prevPt, pt]);
      return segments;
    }

    /**
     * Converts several paths into a single list of segments.
     * @private
     * @param  {Roll20Path[]} paths
     * @return {Segment[]}
     */
    function _toSegmentsMany(paths) {
      return _.chain(paths)
        .reduce(function(allSegments, path) {
            return allSegments.concat(toSegments(path));
        }, [])
        .value();
    }

    /**
     * Transforms a tuple for a point in a path into a point in
     * homogeneous 2D map coordinates.
     * @param  {PathTuple} tuple
     * @param  {PathTransformInfo} transformInfo
     * @return {Vector}
     */
    function tupleToPoint(tuple, transformInfo) {
      let width = transformInfo.width;
      let height = transformInfo.height;
      let scaleX = transformInfo.scaleX;
      let scaleY = transformInfo.scaleY;
      let angle = transformInfo.angle;
      let cx = transformInfo.cx;
      let cy = transformInfo.cy;

      // The point in path coordinates, relative to the path center.
      let x = tuple[1] - width/2;
      let y = tuple[2] - height/2;
      let pt = [x,y,1];

      // The transform of the point from path coordinates to map
      // coordinates.
      let scale = MatrixMath.scale([scaleX, scaleY]);
      let rotate = MatrixMath.rotate(angle);
      let transform = MatrixMath.translate([cx, cy]);
      transform = MatrixMath.multiply(transform, rotate);
      transform = MatrixMath.multiply(transform, scale);

      return MatrixMath.multiply(transform, pt);
    }

    on('chat:message', function(msg) {
      if(msg.type === 'api' && msg.content.indexOf('!pathInfo') === 0) {
        log('!pathInfo');

        try {
          let path = findObjs({
            _type: 'path',
            _id: msg.selected[0]._id
          })[0];
          log(path);
          log(path.get('_path'));

          let segments = toSegments(path);
          log('Segments: ');
          log(segments);

          let pathData = segmentsToPath(segments);
          log('New path data: ');
          log(pathData);

          let curPage = path.get('_pageid');
          _.extend(pathData, {
            stroke: '#ff0000',
            _pageid: curPage,
            layer: path.get('layer')
          });

          let newPath = createObj('path', pathData);
          log(newPath);
        }
        catch(err) {
          log('!pathInfo ERROR: ');
          log(err.message);
        }
      }
      if (msg.type === 'api' && msg.content.startsWith('!pathToUDLWindow')) {
        try {
          let path = findObjs({
            _type: 'path',
            _id: msg.selected[0]._id
          })[0];
          pathToUDLWindow(path);
        }
        catch(err) {
          log('!pathInfo ERROR: ');
          log(err.message);
        }
      }
    });

    return {
        BoundingBox,
        Circle,
        Path,
        Polygon,
        Triangle,

        createCircleData,
        distanceToPoint,
        getBezierPoint,
        getBoundingBox,
        getCenter,
        getTransformInfo,
        mergePathStr,
        normalizePath,
        pathToUDLWindow,
        raycast,
        segmentIntersection,
        segmentsToPath,
        toSegments,
        tupleToPoint
    };
})();

{try{throw new Error('');}catch(e){API_Meta.PathMath.lineCount=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-API_Meta.PathMath.offset);}}
/*
================================================================
END SCRIPT: PathMath
================================================================
*/

/*
================================================================
BEGIN SCRIPT: Plugger
SOURCE FILE: Plugger.md
================================================================
*/
/*
=========================================================
Name            :   Plugger
GitHub          :   https://github.com/TimRohr22/Cauldron/tree/master/Plugger
Roll20 Contact  :   timmaugh
Version         :   1.0.10
Last Update     :   8 OCT 2024
=========================================================
*/
var API_Meta = API_Meta || {};
API_Meta.Plugger = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{
    try { throw new Error(''); } catch (e) { API_Meta.Plugger.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (13)); }
}

const Plugger = (() => {
    const apiproject = 'Plugger';
    const version = '1.0.10';
    const schemaVersion = 0.1;
    API_Meta[apiproject].version = version;
    const vd = new Date(1728392407761);
    const versionInfo = () => {
        log(`\u0166\u0166 ${apiproject} v${API_Meta[apiproject].version}, ${vd.getFullYear()}/${vd.getMonth() + 1}/${vd.getDate()} \u0166\u0166 -- offset ${API_Meta[apiproject].offset}`);
        if (!state.hasOwnProperty(apiproject) || state[apiproject].version !== schemaVersion) {
            log(`  > Updating ${apiproject} Schema to v${schemaVersion} <`);
            switch (state[apiproject] && state[apiproject].version) {

                case 0.1:
                /* break; // intentional dropthrough */ /* falls through */

                case 'UpdateSchemaVersion':
                    state[apiproject].version = schemaVersion;
                    break;

                default:
                    state[apiproject] = {
                        version: schemaVersion,
                    };
                    break;
            }
        }
    };
    const logsig = () => {
        // initialize shared namespace for all signed projects, if needed
        state.torii = state.torii || {};
        // initialize siglogged check, if needed
        state.torii.siglogged = state.torii.siglogged || false;
        state.torii.sigtime = state.torii.sigtime || Date.now() - 3001;
        if (!state.torii.siglogged || Date.now() - state.torii.sigtime > 3000) {
            const logsig = '\n' +
                '  _____________________________________________   ' + '\n' +
                '   )_________________________________________(    ' + '\n' +
                '     )_____________________________________(      ' + '\n' +
                '           ___| |_______________| |___            ' + '\n' +
                '          |___   _______________   ___|           ' + '\n' +
                '              | |               | |               ' + '\n' +
                '              | |               | |               ' + '\n' +
                '              | |               | |               ' + '\n' +
                '              | |               | |               ' + '\n' +
                '              | |               | |               ' + '\n' +
                '______________|_|_______________|_|_______________' + '\n' +
                '                                                  ' + '\n';
            log(`${logsig}`);
            state.torii.siglogged = true;
            state.torii.sigtime = Date.now();
        }
        return;
    };

    const nestlog = (stmt, ilvl = 0, logcolor = '', boolog = false) => {
        if (isNaN(ilvl)) {
            ilvl = 0;
            log(`Next statement fed a NaN value for the indentation.`);
        }
        if ((state[apiproject] && state[apiproject].logging === true) || boolog) {
            let l = `${Array(ilvl + 1).join("==")}${stmt}`;
            if (logcolor) {
                // l = /:/.test(l) ? `<span style="color:${logcolor};">${l.replace(/:/, ':</span>')}` : `<span style="color:${logcolor};">${l}</span>`;
            }
            log(l);
        }
    };

    const escapeRegExp = (string) => { return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); };
    const assertstart = rx => new RegExp(`^${rx.source}`, rx.flags);
    const getfirst = (cmd, ...args) => {
        // pass in objects of form: {type: 'text', rx: /regex/}
        // return object of form  : {regex exec object with property 'type': 'text'}

        let ret = {};
        let r;
        args.find(a => {
            r = a.rx.exec(cmd);
            if (r && (!ret.length || r.index < ret.index)) {
                ret = Object.assign(r, { type: a.type });
            }
            a.lastIndex = 0;
        }, ret);
        return ret;
    };

    // REGEX STATEMENTS =====================================
    const evalrx = /(\()?{&\s*eval(?:\((?<escape>[^)]+)\)){0,1}\s*}((?<=\({&\s*eval(?:\(([^)]+)\)){0,1}\s*})\)|\1)\s*/i,
        evalendrx = /(\()?{&\s*\/\s*eval\s*}((?<=\({&\s*\/\s*eval\s*})\)|\1)/i;

    // TAG RX SETS REGISTRY =================================
    const tagrxset = {
        'eval': { opentag: evalrx, endtag: evalendrx }
    };

    // TOKEN MARKERS ========================================
    const eostm = { rx: /$/, type: 'eos' },
        evaltm = { rx: evalrx, type: 'eval' },
        evalendtm = { rx: evalendrx, type: 'evalend' };

    // END TOKEN REGISTRY ===================================
    const endtokenregistry = {
        main: [eostm],
        eval: [evalendtm],
    };

    const tokenizeOps = (msg, msgstate, status, notes) => {
        class TextToken {
            constructor() {
                this.type = 'text';
                this.escape = '';
                this.value = '';
            }
        }
        class PlugEvalToken {
            constructor() {
                this.type = 'eval';
                this.contents = [];
            }
        }

        const getTextToken = (c) => {
            let logcolor = 'lawngreen';
            nestlog(`TEXT INPUT: ${c.cmd}`, c.indent, logcolor, msgstate.logging);
            let markers = [];
            c.looptype = c.looptype || '';
            switch (c.looptype) {
                case 'eval':
                default:
                    markers = [evaltm, evalendtm, eostm];
                    break;
            }
            let res = getfirst(c.cmd, ...markers);
            let index = res.index;
            let token = new TextToken();
            token.value = c.cmd.slice(0, index);
            nestlog(`TEXT KEEPS: ${token.value}`, c.indent, logcolor, msgstate.logging);
            return { token: token, index: index };
        };
        const getPlugEvalToken = (c) => {
            // receives object in the form of:
            // {cmd: command line slice, indent: #, overallindex: #, looptype: text}
            let logcolor = 'yellow';
            let index = 0;
            let evalopenres = tagrxset[c.looptype].opentag.exec(c.cmd);
            if (evalopenres) {
                nestlog(`${c.looptype.toUpperCase()} TOKEN INPUT: ${c.cmd}`, c.indent, logcolor, msgstate.logging);
                let token = new PlugEvalToken();
                token.escape = evalopenres.groups && evalopenres.groups.escape && evalopenres.groups.escape.length ? evalopenres.groups.escape : '';
                let index = evalopenres[0].length;

                // content and nested evals
                nestlog(`BUILDING CONTENT: ${c.cmd.slice(index)}`, c.indent + 1, 'lightseagreen', msgstate.logging);
                let contentres = evalval({ cmd: c.cmd.slice(index), indent: c.indent + 1, type: c.looptype, overallindex: c.overallindex + index, looptype: c.looptype });
                if (contentres.error) return contentres;
                token.contents = contentres.tokens;
                index += contentres.index;
                nestlog(`ENDING CONTENT: ${c.cmd.slice(index)}`, c.indent + 1, 'lightseagreen', msgstate.logging);

                // closing bracket of eval tag
                let evalendres = tagrxset[c.looptype].endtag.exec(c.cmd.slice(index));
                if (!evalendres) {
                    status.push('unresolved');
                    notes.push(`Unexpected token at ${c.overallindex + index}. Expected end of ${c.looptype.toUpperCase()} structure ('{& eval}'), but saw: ${c.cmd.slice(index, index + 10)}`);
                    return { error: `Unexpected token at ${c.overallindex + index}. Expected end of ${c.looptype.toUpperCase()} structure ('{& eval}'), but saw: ${c.cmd.slice(index, index + 10)}` };
                }
                index += evalendres[0].length;
                nestlog(`${c.looptype.toUpperCase()} TOKEN OUTPUT: ${JSON.stringify(token)}`, c.indent, logcolor, msgstate.logging);
                return { token: token, index: index };
            } else {
                status.push('unresolved');
                notes.push(`Unexpected token at ${c.overallindex + index}. Expected an ${c.looptype.toUpperCase()} structure, but saw: ${c.cmd.slice(index, index + 10)}`);
                return { error: `Unexpected token at ${c.overallindex + index}. Expected an ${c.looptype.toUpperCase()} structure, but saw: ${c.cmd.slice(index, index + 10)}` };
            }
        };
        const evalval = c => {
            // expects an object in the form of:
            // { cmd: text, indent: #, overallindex: #, type: text, overallindex: #, looptype: text }
            let tokens = [];				// main output array
            let logcolor = 'aqua';
            let loopstop = false;
            let tokenres = {};
            let index = 0;
            let loopindex = 0;
            nestlog(`${c.looptype.toUpperCase()} BEGINS`, c.indent, logcolor, msgstate.logging);
            while (!loopstop) {
                loopindex = index;
                if (assertstart(tagrxset[c.looptype].opentag).test(c.cmd.slice(index))) {
                    status.push('changed');
                    tokenres = getPlugEvalToken({ cmd: c.cmd.slice(index), indent: c.indent + 1, overallindex: c.overallindex + index, looptype: c.looptype });
                } else {
                    tokenres = getTextToken({ cmd: c.cmd.slice(index), indent: c.indent + 1, overallindex: c.overallindex + index, looptype: c.looptype });
                }
                if (tokenres) {
                    if (tokenres.error) { return tokenres; }
                    tokens.push(tokenres.token);
                    index += tokenres.index;
                }
                if (loopindex === index) {				// nothing detected, loop never ends
                    return { error: `Unexpected token at ${c.overallindex + index}.` };
                }
                loopstop = (getfirst(c.cmd.slice(index), ...endtokenregistry[c.type]).index === 0);
            }
            nestlog(`${c.looptype.toUpperCase()} ENDS`, c.indent, logcolor, msgstate.logging);
            return { tokens: tokens, index: index };
        };

        return evalval({ cmd: msg.content, indent: 0, type: 'main', overallindex: 0, looptype: 'eval' });
    };

    const reconstructOps = (o, msg, msgstate, status, notes) => {
        const runPlugin = c => {
            const evalstmtrx = /^\s*(?<script>[^(\s]*)\s*\((?<args>.*?)\)(?<!\({&\d+}\))$/gi;
            let ret;
            let content = '';
            if (evalstmtrx.test(c)) {
                return c.replace(evalstmtrx, ((m, script, args) => {
                    content = `${script} ${args}`;
                    if (!availFuncs[script.toLowerCase()]) {
                        sendChat('', `!${content}`);
                        return '';
                    }
                    let newmsg = _.clone(msg);
                    newmsg.content = `!${content}`;
                    newmsg.eval = true; // provide tag for message differentiation by client script
                    ret = availFuncs[script.toLowerCase()](newmsg);
                    return ['string', 'number', 'boolean', 'bigint'].includes(typeof ret) ? ret : '';
                }));
            } else {
                sendChat('', `!${c.replace(/^!/, '')}`);
                return '';
            }
        };
        const processPlugEvals = c => {
            // expects object in the form of:
            // { tokens: [], indent: # }
            let logcolor = 'aqua';
            nestlog(`PROCESS EVALS BEGINS`, c.indent, logcolor, msgstate.logging);
            let tokens = c.tokens.reduce((m, v, i) => {
                nestlog(`==TOKEN ${i}: ${JSON.stringify(v)}`, c.indent, 'violet', msgstate.logging);
                if (v.type === 'text') {
                    nestlog(`====DETECTED TEXT: ${v.value}`, c.indent, 'lawngreen', msgstate.logging);
                    m.push(v.value);
                } else if (v.type === 'eval') {
                    nestlog(`====DETECTED EVAL`, c.indent, 'yellow', msgstate.logging);
                    m.push(runPlugin(processPlugEvals({ tokens: v.contents, indent: c.indent + 1 }).join('').replace(new RegExp(escapeRegExp(v.escape), 'g'), '')));
                }
                nestlog(`==END OF TOKEN`, c.indent, 'violet', msgstate.logging);
                return m;
            }, []);
            nestlog(`PROCESS CONTENT ENDS`, c.indent, logcolor, msgstate.logging);
            return tokens;
        };

        return processPlugEvals({ tokens: o.tokens, indent: 0 }).join('');
    };

    // ==================================================
    //		SCRIPT PLUGINS
    // ==================================================
    const availFuncs = {};
    const registerRule = (...r) => { // pass in a list of functions to get them registered to the availFuncs library
        r.forEach(f => {
            if (f.name) {
                if (availFuncs[f.name.toLowerCase()]) {
                    log(`EVAL Function Registration: Name collision detected for ${f.name}. Last one loaded will win.`);
                }
                availFuncs[f.name.toLowerCase()] = f;
            }
        });
    };

    const condensereturn = (funcret, status, notes) => {
        funcret.runloop = (status.includes('changed') || status.includes('unresolved'));
        if (status.length) {
            funcret.status = status.reduce((m, v) => {
                switch (m) {
                    case 'unchanged':
                        m = v;
                        break;
                    case 'changed':
                        m = v === 'unresolved' ? v : m;
                        break;
                    case 'unresolved':
                        break;
                }
                return m;
            });
        }
        funcret.notes = notes.join('<br>');
        return funcret;
    };

    const testConstructs = c => {
        let result = evalrx.test(c);
        evalrx.lastIndex = 0;
        return result;
    };
    // ==================================================
    //		HANDLE INPUT
    // ==================================================
    const handleInput = (msg, msgstate = {}) => {
        let funcret = { runloop: false, status: 'unchanged', notes: '' };
        if (msg.type !== 'api' || !testConstructs(msg.content)) return funcret;
        if (!Object.keys(msgstate).length && scriptisplugin) return funcret;
        let status = [];
        let notes = [];

        const linebreak = '({&br-ev})';
        msg.content = msg.content.replace(/<br\/>\n/g, linebreak);

        let tokobj = tokenizeOps(msg, msgstate, status, notes);
        if (tokobj.error) return condensereturn(funcret, status, notes);
        let reconstructed = reconstructOps(tokobj, msg, msgstate, status, notes);
        msg.content = reconstructed;

        msg.content = msg.content.replace(new RegExp(escapeRegExp(linebreak), 'g'), '<br/>\n');

        return condensereturn(funcret, status, notes);
    };

    let scriptisplugin = false;
    const plugger = (m, s) => handleInput(m, s);
    on('chat:message', handleInput);
    on('ready', () => {
        versionInfo();
        logsig();
        scriptisplugin = (typeof ZeroFrame !== `undefined`);
        if (typeof ZeroFrame !== 'undefined') {
            ZeroFrame.RegisterMetaOp(plugger, { priority: 50, handles: ['eval', 'plug'] });
        }
    });
    return {
        RegisterRule: registerRule
    };
})();
const PluggerPlugins01 = (() => {
    // ==================================================
    //		VERSION
    // ==================================================
    const apiproject = 'PluggerPlugins01';
    const version = '0.0.4';
    const vd = new Date(1715952845199);
    const versionInfo = () => {
        log(`\u0166\u0166 ${apiproject} v${version}, ${vd.getFullYear()}/${vd.getMonth() + 1}/${vd.getDate()} \u0166\u0166 -- offset continues from Plugger`);
        return;
    };

    const tickSplit = (cmd, ticks = ["'", "`", '"'], split = ['|', '#'], mark = '--') => {
        const escapeRegExp = (string) => { return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); };
        let index = 0;
        let tokens = [];
        let markrx,
            openrx,
            splitrx,
            markbase;

        class ArgToken {
            constructor(type = '') {
                this.type = type;
                this.results = [];
            }
        }

        const validate = () => {
            if (
                split && Array.isArray(split) && split.length &&
                ticks && Array.isArray(ticks) && ticks.length &&
                mark && typeof mark === 'string' && mark.length &&
                cmd && typeof cmd === 'string' && cmd.length
            ) {
                markbase = `\\s+${escapeRegExp(mark).replace(/\s/g, '\\s')}`;
                markrx = new RegExp(`${markbase}(.+?)(?:${split.map(s => escapeRegExp(s)).join('|')}|(?=${markbase})|$)`, 'g');
                openrx = new RegExp(`^${markbase}`);
                splitrx = new RegExp(`^($|${split.map(s => escapeRegExp(s)).join('|')})`);
                return true;
            }
        };

        const getTick = () => {
            let tick = '';
            ticks.some(t => {
                let res;
                let rx = new RegExp(`^${escapeRegExp(t)}`);
                if ((res = rx.exec(cmd.slice(index))) !== null) {
                    tick = t;
                    index += res[0].length;
                    return true;
                }
            });
            return tick;
        };

        const transition = (tick) => {
            let res;
            if (tick) {
                let tickrx = new RegExp(`^${escapeRegExp(tick)}`);
                if ((res = tickrx.exec(cmd.slice(index))) !== null) {
                    index += res[0].length;
                }
            }
            if (index < cmd.length) {
                if ((res = splitrx.exec(cmd.slice(index))) !== null) {
                    index += res[0].length;
                }
            }
        };

        const getPart = (token) => {
            let tick = getTick();
            let rx;
            if (tick) {
                rx = new RegExp(`^.*?(?=$|${escapeRegExp(tick)})`);
            } else {
                rx = new RegExp(`^.+?(?=$|${split.map(s => escapeRegExp(s)).join('|')}|${markbase})`);
            }
            let res = rx.exec(cmd.slice(index));
            token.results.push(res[0]);
            index += res[0].length;
            if (index < cmd.length) {
                transition(tick);
            }
        };

        const getArg = () => {
            let res;
            markrx.lastIndex = 0;
            if ((res = markrx.exec(cmd.slice(index))) === null) {
                index = cmd.length;
                return;
            }
            let token = new ArgToken(res[1]);
            index += markrx.lastIndex;
            while (index < cmd.length && !openrx.test(cmd.slice(index))) {
                getPart(token);
            }
            tokens.push(token);
        };

        if (validate()) {
            while (index < cmd.length) {
                getArg();
            }
            return tokens;
        }
    };

    const listen = (m) => {
        // expected syntax: !listen ~~object|<identifier> ~~delay|1000 ~~test|(propA|+ && propB|-) command
        if (!/^!listen\s/.test(m.content)) return;
        let params = m.content.split(/~~\s+/).slice(1).map(p => p.split(`|`,1));
        params.forEach(p => {
            switch (p.toLowerCase()) {
                case 'object':

                    break;
                case 'delay':
            }
        })
    };
    const getDiceByVal = (m) => {
        // expected syntax: !getDiceByVal $[[0]] <=2|6-7|>10 included count/total/list|delim
        let [rollmarker, valparams, dicetype = 'included', op = 'count'] = m.content.split(/\s--+/.test(m.content) ? /\s--+/ : /\s+/g).slice(1);
        if (!rollmarker || !valparams) { log(`getDiceByVal: wrong number of arguments, expected 4`); return; }
        if (!['all', 'included', 'success', 'crit', 'fail', 'fumble', 'allcrit', 'dropped'].includes(dicetype)) { log(`getDiceByVal: Invalid dice type. Permitted values: all, included, success, crit, fail, fumble, allcrit, dropped`); return; }
        const typeProcessor = {
            '!=': (r, t) => r != t,
            '>': (r, t) => r > t,
            '>=': (r, t) => r >= t,
            '<': (r, t) => r < t,
            '<=': (r, t) => r <= t,
            '-': (r, l, h) => r >= l && r <= h,
            '=': (r, t) => r == t
        };
        let delim;
        [op, ...delim] = op.split(/\|/);
        delim = delim.join('|');
        delim = /^('|"|`){0,1}(.*)?\1$/.exec(delim)[2] || '';

        let roll = (/\$\[\[(\d+)]]/.exec(rollmarker) || /{\&(\d+)}/.exec(rollmarker) || ['', ''])[1];
        if (roll === '') return '0';
        let searchdicerx = /^((?<low>-?\d+)-(?<high>-?\d+)|(?<range>!=|>=|<=|>|<*)(?<singleval>-?\d+))$/;
        let res;
        let tests = valparams.split('|').map(p => {
            res = searchdicerx.exec(p);
            if (!res) return;
            return res.groups.low ?
                {
                    test: '-',
                    params: [res.groups.low, res.groups.high]
                } :
                {
                    test: res.groups.range || '=',
                    params: [res.groups.singleval]
                };
        });
        if (!tests) return '';
        let dice = (m.parsedinline[roll] || { getDice: () => [] }).getDice(dicetype)
            .filter(d => {
                return tests.reduce((m, t) => {
                    return m || typeProcessor[t.test](d, ...t.params)
                }, false);
            });
        switch (op) {
            case 'list':
                return dice.join(delim || '');
            case 'total':
                return dice.length ? dice.reduce((a, b) => (isNaN(a) ? 0 : a) + (isNaN(b) ? 0 : b)) : '0';
            case 'count':
            default:
                return dice.length;
        }
    };

    const getDiceByPos = (m) => {
        // expected syntax: !getDiceByPos $[[0]] <=2|6-7|>10 included total/count/list|delim
        let [rollmarker, valparams, dicetype = 'included', op = 'count'] = m.content.split(/\s--+/.test(m.content) ? /\s--+/ : /\s+/g).slice(1);
        if (!rollmarker || !valparams) { log(`getDiceByPos: wrong number of arguments, expected 4`); return; }
        if (!['all', 'included', 'success', 'crit', 'fail', 'fumble', 'allcrit', 'dropped'].includes(dicetype)) { log(`getDiceByPos: Invalid dice type. Permitted values: all, included, success, crit, fail, fumble, allcrit, dropped`); return; }
        const typeProcessor = {
            '!=': (r, t) => r != t,
            '>': (r, t) => r > t,
            '>=': (r, t) => r >= t,
            '<': (r, t) => r < t,
            '<=': (r, t) => r <= t,
            '-': (r, l, h) => r >= l && r <= h,
            '=': (r, t) => r == t
        };
        let delim;
        [op, ...delim] = op.split(/\|/);
        delim = delim.join('|');
        delim = /^('|"|`){0,1}(.*)?\1$/.exec(delim)[2] || '';

        let roll = (/\$\[\[(\d+)]]/.exec(rollmarker) || /{\&(\d+)}/.exec(rollmarker) || ['', ''])[1];
        if (roll === '') return '0';
        let searchdicerx = /^((?<low>-?\d+)-(?<high>-?\d+)|(?<range>!=|>=|<=|>|<*)(?<singleval>-?\d+))$/;
        let res;
        let tests = valparams.split('|').map(p => {
            res = searchdicerx.exec(p);
            if (!res) return;
            return res.groups.low ?
                {
                    test: '-',
                    params: [res.groups.low, res.groups.high]
                } :
                {
                    test: res.groups.range || '=',
                    params: [res.groups.singleval]
                };
        });
        if (!tests) return '';
        let dice = (m.parsedinline[roll] || { getDice: () => [] }).getDice(dicetype)
            .filter((d, i) => {
                return tests.reduce((m, t) => {
                    return m || typeProcessor[t.test](i + 1, ...t.params)
                }, false);
            });
        switch (op) {
            case 'list':
                return dice.join(delim || '');
            case 'count':
                return dice.length;
            case 'total':
            default:
                return dice.length ? dice.reduce((a, b) => (isNaN(a) ? 0 : a) + (isNaN(b) ? 0 : b)) : '0';
        }
    };

    const filter = (m) => {
        // expected syntax: !filter --a|b|c --<=c|d|>10 --count/total/list|delim
        let [list, valparams, op = 'count'] = m.content.split(/\s+--/.test(m.content) ? /\s+--/ : /\s+/g).slice(1);
        if (!list || !valparams) { log(`filterFor: wrong number of arguments, expected 3`); return; }

        const isNum = (...v) => v.reduce((m, a) => { return m && +a === +a; }, true);
        const typeProcessor = {
            '!=': (r, t) => r != t,
            '>': (r, t) => isNum(r, t) ? Number(r) > Number(t) : r > t,
            '>=': (r, t) => isNum(r, t) ? Number(r) >= Number(t) : r >= t,
            '<': (r, t) => isNum(r, t) ? Number(r) < Number(t) : r < t,
            '<=': (r, t) => isNum(r, t) ? Number(r) <= Number(t) : r <= t,
            '-': (r, l, h) => isNum(r, l, h) ? Number(r) >= Number(l) && Number(r) <= Number(h) : r >= l && r <= h,
            '=': (r, t) => r == t
        };

        let delim;
        [op, ...delim] = op.split(/\|/);
        delim = delim.join('|');
        delim = /^('|"|`){0,1}(.*)?\1$/.exec(delim)[2] || '';

        let searchrx = /^((?<low>-?\d+)-(?<high>-?\d+)|(?<range>!=|>=|<=|>|<*)(?<singleval>-?\d+))$/;
        let res;
        let tests = valparams.split('|').map(p => {
            res = searchrx.exec(p);
            if (!res) return;
            return res.groups.low ?
                {
                    test: '-',
                    params: [res.groups.low, res.groups.high]
                } :
                {
                    test: res.groups.range || '=',
                    params: [res.groups.singleval]
                };
        });
        if (!tests) return '';

        list = list.split(/\|/g)
            .filter(l => {
                return tests.reduce((m, t) => {
                    return m || typeProcessor[t.test](l, ...t.params);
                }, false);
            });
        switch (op) {
            case 'list':
                return list.join(delim || '');
            case 'total':
                return list.length ? list.reduce((a, b) => (isNaN(a) ? 0 : a) + (isNaN(b) ? 0 : b)) : '0';
            case 'count':
            default:
                return list.length;
        }
    };

    const replace = (m) => {
        // expected syntax: !replace --source|source text --find|search text 1|replace text 1|i --find|'search text|2'|replace text 2'
        const escapeRegExp = (string) => { return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); };

        let args = tickSplit(m.content);
        let source;
        let findargs = args.reduce((m, v) => {
            if (/^source$/i.test(v.type)) {
                source = v.results[0] || '';
            } else if (/^find$/i.test(v.type)) {
                //m.push(v);
                if (v.results.length === 2 || (v.results.length > 2 && !/i/i.test(v.results[2]))) {
                    m.push([new RegExp(escapeRegExp(v.results[0]), 'g'), v.results[1]]);
                } else if (v.results.length === 3 && /i/i.test(v.results[2])) {
                    m.push([new RegExp(escapeRegExp(v.results[0]), 'gi'), v.results[1]]);
                }
            }
            return m;
        }, []);


        return findargs.reduce((m, v) => {
            m = m.replace(...v);
            return m;
        }, source);
    };

    on('ready', () => {
        versionInfo();
        try {
            Plugger.RegisterRule(getDiceByVal, getDiceByPos, filter, replace);
        } catch (error) {
            log(`ERROR Registering to PlugEval: ${error.message}`);
        }
    })

    return;
})();
{ try { throw new Error(''); } catch (e) { API_Meta.Plugger.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.Plugger.offset); } }
/*
================================================================
END SCRIPT: Plugger
================================================================
*/

/*
================================================================
BEGIN SCRIPT: SelectManager
SOURCE FILE: SelectManager.md
================================================================
*/
/*
=========================================================
Name            :   SelectManager
GitHub          :   https://github.com/TimRohr22/Cauldron/tree/master/SelectManager
Roll20 Contact  :   timmaugh && TheAaron
Version         :   1.1.9
Last Update     :   14 JULY 2025
=========================================================
*/
var API_Meta = API_Meta || {};
API_Meta.SelectManager = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{ try { throw new Error(''); } catch (e) { API_Meta.SelectManager.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (12)); } }

const SelectManager = (() => { //eslint-disable-line no-unused-vars
    // ==================================================
    //		VERSION
    // ==================================================
    const apiproject = 'SelectManager';
    const version = '1.1.9';
    const schemaVersion = 0.4;
    const apilogo = 'https://i.imgur.com/ewyOzMU.png';
    const apilogoalt = 'https://i.imgur.com/3U8c9rE.png'
    API_Meta[apiproject].version = version;
    const vd = new Date(1752538456318);
    const versionInfo = () => {
        log(`\u0166\u0166 ${apiproject} v${API_Meta[apiproject].version}, ${vd.getFullYear()}/${vd.getMonth() + 1}/${vd.getDate()} \u0166\u0166 -- offset ${API_Meta[apiproject].offset}`);
        if (!state.hasOwnProperty(apiproject) || state[apiproject].version !== schemaVersion) {
            log(`  > Updating ${apiproject} Schema to v${schemaVersion} <`);
            switch (state[apiproject] && state[apiproject].version) {

                case 0.1:
                    state[apiproject].settings = {
                        playerscanids: false
                    };
                    if (state[apiproject].hasOwnProperty('autoinsert')) state[apiproject].settings.autoinsert = [...state[apiproject].autoinsert];
                    else state[apiproject].settings.autoinsert = ['selected'];
                    state[apiproject].defaults = {
                        autoinsert: ['selected'],
                        playerscanids: false
                    };
                    delete state[apiproject].autoinsert;
                /* falls through */
                case 0.2:
                    state[apiproject].settings.knownsenders = ['CRL'];
                    state[apiproject].defaults.knownsenders = ['CRL'];
                /* falls through */
                case 0.3:
                    state[apiproject].settings.show04message = true;
                    state[apiproject].defaults.show04message = true;
                /* falls through */
                case 'UpdateSchemaVersion':
                    state[apiproject].version = schemaVersion;
                    break;

                default:
                    state[apiproject] = {
                        version: schemaVersion,
                        settings: {
                            autoinsert: ['selected'],
                            playerscanids: false,
                            knownsenders: ['CRL'],
                            show03message: true
                        },
                        defaults: {
                            autoinsert: ['selected'],
                            playerscanids: false,
                            knownsenders: ['CRL'],
                            show03message: true
                        }
                    };
                    break;
            }
        }
    };
    const manageState = { // eslint-disable-line no-unused-vars
        reset: () => state[apiproject].settings = _.clone(state[apiproject].defaults),
        set: (p, v) => state[apiproject].settings[p] = v,
        get: (p) => { return state[apiproject].settings[p]; }
    };

    const logsig = () => {
        // initialize shared namespace for all signed projects, if needed
        state.torii = state.torii || {};
        // initialize siglogged check, if needed
        state.torii.siglogged = state.torii.siglogged || false;
        state.torii.sigtime = state.torii.sigtime || Date.now() - 3001;
        if (!state.torii.siglogged || Date.now() - state.torii.sigtime > 3000) {
            const logsig = '\n' +
                '  _____________________________________________   ' + '\n' +
                '   )_________________________________________(    ' + '\n' +
                '     )_____________________________________(      ' + '\n' +
                '           ___| |_______________| |___            ' + '\n' +
                '          |___   _______________   ___|           ' + '\n' +
                '              | |               | |               ' + '\n' +
                '              | |               | |               ' + '\n' +
                '              | |               | |               ' + '\n' +
                '              | |               | |               ' + '\n' +
                '              | |               | |               ' + '\n' +
                '______________|_|_______________|_|_______________' + '\n' +
                '                                                  ' + '\n';
            log(`${logsig}`);
            state.torii.siglogged = true;
            state.torii.sigtime = Date.now();
        }
        return;
    };
    const generateUUID = (() => {
        let a = 0;
        let b = [];

        return () => {
            let c = (new Date()).getTime() + 0;
            let f = 7;
            let e = new Array(8);
            let d = c === a;
            a = c;
            for (; 0 <= f; f--) {
                e[f] = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(c % 64);
                c = Math.floor(c / 64);
            }
            c = e.join("");
            if (d) {
                for (f = 11; 0 <= f && 63 === b[f]; f--) {
                    b[f] = 0;
                }
                b[f]++;
            } else {
                for (f = 0; 12 > f; f++) {
                    b[f] = Math.floor(64 * Math.random());
                }
            }
            for (f = 0; 12 > f; f++) {
                c += "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(b[f]);
            }
            return c;
        };
    })();
    const escapeRegExp = (string) => { return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); };
    const RX = (() => {
        const esRE = (s) => s.replace(/(\\|\/|\[|\]|\(|\)|\{|\}|\?|\+|\*|\||\.|\^|\$)/g, '\\$1');
        const entities = {
            '*': { detect: /\*/, rx: /\*/, rep: '.*?' },
            '?': { detect: /\?/, rx: /\?/, rep: '.' },
            //    '?': { detect: /.\?/, rx: /(.)\?/, rep: '$1?'}
        };
        const rxkeys = (k) => entities[k].detect.source;
        const getSource = (s) => {
            let rxsource = '';
            let rxflags = '';
            let ret;
            const rxpattern = /^\/(?<source>.*?)\/(?<flags>(?:g|i|m|s|u|y){0,6})$/i;
            if (rxpattern.test(s)) {
                ret = rxpattern.exec(s);
                rxsource = ret.groups.source;
                rxflags = ret.groups.flags || '';
            } else {
                rxsource = ['^',
                    ...s.split(new RegExp(`(${Object.keys(entities).map(rxkeys).join('|')})`))
                        .map(p => {
                            return Object.keys(entities).reduce((m, k) => {
                                let rx = new RegExp(`^${entities[k].rx.source}$`);
                                if (typeof m === 'undefined' && rx.test(p)) {
                                    m = p.replace(rx, entities[k].rep);
                                }
                                return m;
                            }, undefined) || esRE(p);
                        }),
                    '$'
                ].join('');
                rxflags = 'gi';
            }
            return new RegExp(rxsource, rxflags);
        };
        return getSource;
    })();
    const playersCanUseIDs = () => manageState.get('playerscanids');
    const getTheSpeaker = msg => {
        let speaking;
        if (['API', ''].includes(msg.who)) {
            speaking = { id: undefined, type: 'API', localName: 'API', speakerType: 'API', chatSpeaker: 'API', get: () => { return 'API'; } };
        } else {
            let characters = findObjs({ type: 'character' });
            characters.forEach(c => { if (c.get('name') === msg.who) speaking = c; });

            if (speaking) {
                speaking.speakerType = "character";
                speaking.localName = speaking.get("name");
            } else {
                speaking = getObj('player', msg.playerid);
                speaking.speakerType = "player";
                speaking.localName = speaking.get("displayname");
            }
            speaking.chatSpeaker = speaking.speakerType + '|' + speaking.id;
        }

        return speaking;
    };
    const playerCanControl = (obj, playerid = 'any') => {
        const playerInControlledByList = (list, playerid) => list.includes('all') || list.includes(playerid) || ('any' === playerid && list.length);
        let players = obj.get('controlledby')
            .split(/,/)
            .filter(s => s.length);

        if (playerInControlledByList(players, playerid)) {
            return true;
        }

        if ('' !== obj.get('represents')) {
            players = (getObj('character', obj.get('represents')) || { get: function () { return ''; } })
                .get('controlledby').split(/,/)
                .filter(s => s.length);
            return playerInControlledByList(players, playerid);
        }
        return false;
    };
    const getPageForPlayer = (playerid) => {
        let player = getObj('player', playerid);
        if (playerIsGM(playerid)) {
            return player.get('lastpage') || Campaign().get('playerpageid');
        }

        let psp = Campaign().get('playerspecificpages');
        if (psp[playerid]) {
            return psp[playerid];
        }

        return Campaign().get('playerpageid');
    };
    const getTokens = (query, pid, owner = true) => {
        if (pid === 'API') pid = preservedMsgObj[maintrigger].playerid;
        let pageid = getPageForPlayer(pid);
        let qrx = RX(query);
        let alltokens = [...findObjs({ type: 'graphic', pageid: pageid }), ...findObjs({ type: 'text', pageid: pageid }), ...findObjs({ type: 'path', pageid: pageid })]
            .filter(t => t.get('layer') === 'objects' || playerIsGM(pid));
        if (owner) {
            alltokens = alltokens.filter(t => playerIsGM(pid) || playersCanUseIDs() || playerCanControl(t, pid));
        }
        let tokens = [(alltokens.filter(t => t.id === query)[0] ||
            alltokens.filter(t => t.get('name') === query)[0])]
            .filter(t => t);
        if (!tokens.length) {
            tokens = alltokens.filter(t => {
                qrx.lastIndex = 0;
                return qrx.test(typeof t.get('name') === 'undefined' ? '' : t.get('name'));
            });
        }
        return tokens;
    };

    let html = {};
    let css = {}; // eslint-disable-line no-unused-vars
    let HE = () => { }; // eslint-disable-line no-unused-vars
    const theme = {
        primaryColor: '#E66B00',
        primaryTextColor: '#232323',
        primaryTextBackground: '#ededed'
    }
    const localCSS = {
        msgheader: {
            'background-color': theme.primaryColor,
            'color': 'white',
            'font-size': '1.2em',
            'padding-left': '4px'
        },
        msgbody: {
            'color': theme.primaryTextColor,
            'background-color': theme.primaryTextBackground
        },
        msgfooter: {
            'color': theme.primaryTextColor,
            'background-color': theme.primaryTextBackground
        },
        msgheadercontent: {
            'display': 'table-cell',
            'vertical-align': 'middle',
            'padding': '4px 8px 4px 6px'
        },
        msgheaderlogodiv: {
            'display': 'table-cell',
            'max-height': '30px',
            'margin-right': '8px',
            'margin-top': '4px',
            'vertical-align': 'middle'
        },
        logoimg: {
            'background-color': 'transparent',
            'float': 'left',
            'border': 'none',
            'max-height': '30px'
        },
        boundingcss: {
            'background-color': theme.primaryTextBackground
        },
        inlineEmphasis: {
            'font-weight': 'bold'
        },
        button: {
            'background-color': theme.primaryColor,
            'border-radius': '6px',
            'min-width': '25px',
            'padding': '6px 8px'
        }
    }
    const msgbox = ({
        msg: msg = '',
        title: title = '',
        headercss: headercss = localCSS.msgheader,
        bodycss: bodycss = localCSS.msgbody,
        footercss: footercss = localCSS.msgfooter,
        sendas: sendas = 'SelectManager',
        whisperto: whisperto = '',
        footer: footer = '',
        btn: btn = '',
    } = {}) => {
        if (title) title = html.div(html.div(html.img(apilogoalt, 'SelectManager Logo', localCSS.logoimg), localCSS.msgheaderlogodiv) + html.div(title, localCSS.msgheadercontent), {});
        Messenger.MsgBox({ msg: msg, title: title, bodycss: bodycss, sendas: sendas, whisperto: whisperto, footer: footer, btn: btn, headercss: headercss, footercss: footercss, boundingcss: localCSS.boundingcss, noarchive: true });
    };

    const getWhisperTo = (who) => who.toLowerCase() === 'api' ? 'gm' : who.replace(/\s\(gm\)$/i, '');
    const handleConfig = msg => {
        if (msg.type !== 'api' || !/^!smconfig/.test(msg.content)) return;
        let recipient = getWhisperTo(msg.who);
        if (!playerIsGM(msg.playerid)) {
            msgbox({ title: 'GM Rights Required', msg: 'You must be a GM to perform that operation', whisperto: recipient });
            return;
        }
        let cfgrx = /^(\+|-)(selected|who|playerid|playerscanids|acknowledge(\d+))$/i;
        let changeObj = {
            '+': 'enabled',
            '-': 'disabled',
            'a': 'acknowledged'
        };
        let res;
        let cfgTrack = {};
        let message;
        if (/^!smconfig\s+[^\s]/.test(msg.content)) {
            msg.content.split(/\s+/).slice(1).forEach(a => {
                res = cfgrx.exec(a);
                if (!res) return;
                if (res[2].toLowerCase() === 'playerscanids') {
                    manageState.set('playerscanids', (res[1] === '+'));
                    cfgTrack[res[2]] = res[1];
                } else if (['selected', 'who', 'playerid'].includes(res[2].toLowerCase())) {
                    if (res[1] === '+') {
                        manageState.set('autoinsert', [...new Set([...manageState.get('autoinsert'), res[2].toLowerCase()])]);
                        cfgTrack[res[2]] = res[1];
                    } else {
                        manageState.set('autoinsert', manageState.get('autoinsert').filter(e => e !== res[2].toLowerCase()));
                        cfgTrack[res[2]] = res[1];
                    }
                } else if (/^acknowledge\d+$/i.test(res[2])) {
                    manageState.set(`show${res[3]}message`, false);
                    cfgTrack[`Schema ${res[3]} Message`] = 'a';
                }
            });
            let changes = Object.keys(cfgTrack).map(k => `${html.span(k, localCSS.inlineEmphasis)}: ${changeObj[cfgTrack[k]]}`).join('<br>');
            msgbox({ title: `SelectManager Config Changed`, msg: `You have made the following changes to the SelectManager configuration:<br>${changes}`, whisperto: recipient });
        } else {
            cfgTrack.playerscanids = `${html.span('playerscanids', localCSS.inlineEmphasis)}: ${manageState.get('playerscanids') ? 'enabled' : 'disabled'}`;
            cfgTrack.autoinsert = ['selected', 'who', 'playerid'].map(k => `${html.span(k, localCSS.inlineEmphasis)}: ${manageState.get('autoinsert').includes(k) ? 'enabled' : 'disabled'}`).join('<br>');
            message = `SelectManager is currently configured as follows:<br>${cfgTrack.playerscanids}<br>${cfgTrack.autoinsert}`;
            msgbox({ title: 'SelectManager Configuration', msg: message, whisperto: recipient });
        }
    };

    const issueVersionUpdateMessages = () => {
        let allCommands = [...findObjs({ type: 'macro' }), ...findObjs({ type: 'ability' })];

        const show04Message = () => {
            let affected = allCommands.filter(o => {
                let cmd = o.get('action');
                let locSelrx = /{&\s*(?:select|inject)\s+([^}]+?)\s*}/gi;
                let found = false;
                let res;
                let items;
                while (!found && (res = locSelrx.exec(cmd)) && res) {
                    found = !!(res[1].split(/\s*,\s*/)
                        .filter(item => oldmarkerrx.test(item)).length);
                        // .filter(item => /^(\+|-)/.test(item) && !/^(\+|-)(@.*|#.*|\*.*|((bar|max)(1|2|3){1})|((aura|color)(1|2){0,1})|layer|tip|gmnotes|type|pc|npc|pt|side)(\s|<|>|=|~|!|$)/.test(item)).length);
                }
                return found;
            });

            if (affected.length) {
                let listAffected = affected.map(a => `<li>${a.get('name')} (${a.get('type') === 'ability' ? `ability for ${getObj('character', a.get('characterid')).get('name')}` : 'macro'})</li>`).join('');
                let message = html.p(`A small portion of SelectManager syntax is changing. A previous update made it possible to use status markers (either their presence or value) as a ` +
                    `condition for virtually selecting that token. For instance, testing a token for the presence of a status marker named "noble" would look like:<br><br><b>+noble</b>`) +
                    html.p(`This syntax allowed for "collisions" -- a situation where a marker might bear the name of one of the other keywords SelectManager looks for as ways to test the tokens: aura, bar1, npc, etc. ` +
                    `For instance, if you were playing in a game that had a status marker named "npc", then would the syntax <b>+npc</b> refer to the presence of the marker, or to the internal test ` +
                    `SelectManager uses to determine if a token is an npc?`) +
                    html.p(`With the v1.1.8 update, SelectManager can now use a similar syntax to test a token for the presence of character tags, increasing the possibility of these collisions (i.e., a tag ` +
                        `and a marker both named "noble"). Because of this, the syntax to test for a status marker is getting an update to allow for greater specificity. Going forward, ` +
                        `to test for a status marker on a token, you should simply preface the marker name with an asterisk (&ast;) immediately following the "+" (for "should have") or "-" ` +
                        `(for "should not have"):<br><br><b>+&ast;noble</b><br><b>+&ast;noble > 2</b>`) +
                    html.p(`The previous syntax is still available for now, but is no longer supported and will be removed at some point in the future. You should take a moment to update commands ` +
                        `in your game that utilize the previous construction (without an asterisk). A quick scan of character abilities and macros in this game shows that the following list ` +
                        `might be commands where you have utilized the previous syntax:` +
                        `<ul>${listAffected}</ul>`);
                //const button = ({ elem: elem = '', label: label = '', char: char = '', type: type = '%', css: css = Messenger.Css.button } = {}) => {

                let button = Messenger.Button({ elem: `!smconfig +acknowledge04`, type: '!', label: `Don't Show Again`, css: localCSS.button, noarchive: true });
                msgbox({ title: 'SelectManager Syntax Update', msg: message, whisperto: 'gm', btn: button });

                // TODO: make sure chat message has opt-out for not getting the message again
            } else {
                manageState.set('show04message', false);
            }
        };

        const messageSettings = {
            show04message: show04Message
        };

        Object.keys(messageSettings).forEach(k => {
            if (manageState.get(k)) { messageSettings[k](); }
        });
    };

    const maintrigger = `${apiproject}-main`;
    let preservedMsgObj = {
        [maintrigger]: { selected: undefined, who: '', playerid: '' }
    };

    const condensereturn = (funcret, status, notes) => {
        funcret.runloop = (status.includes('changed') || status.includes('unresolved'));
        if (status.length) {
            funcret.status = status.reduce((m, v) => {
                switch (m) {
                    case 'unchanged':
                        m = v;
                        break;
                    case 'changed':
                        m = v === 'unresolved' ? v : m;
                        break;
                    case 'unresolved':
                        break;
                }
                return m;
            });
        }
        funcret.notes = notes.join('<br>');
        return funcret;
    };
    const uniqueArrayByProp = (array, prop = 'id') => {
        const set = new Set;
        return array
            .filter(o => typeof o !== 'undefined' && !set.has(o[prop]) && set.add(o[prop]));
    };
    let oldmarkerrx;
    const decomposeStatuses = (list = '') => {
        return list.split(/\s*,\s*/g).filter(s => s.length)
            .reduce((m, s) => {
                let origst = libTokenMarkers.getStatus(s.slice(0, /(@\d+$|:)/.test(s) ? /(@\d+$|:)/.exec(s).index : s.length));
                let st = _.clone(origst);
                if (!st) return m;
                st.num = /^.+@0*(\d+)/.test(s) ? /^.+@0*(\d+)/.exec(s)[1] : '';
                st.html = origst.getHTML();
                st.url = st.url || '';
                m.push(st);
                return m;
            }, []);
    };
    class StatusBlock {
        constructor({ token: token = {}, msgId: msgId = generateUUID() } = {}) {
            this.token = token;
            this.msgId = msgId;
            this.statuses = (decomposeStatuses(token.get('statusmarkers')) || []).reduce((m, s) => {
                m[s.name] = m[s.name] || []
                m[s.name].push(Object.assign({}, s, { is: 'yes' }));
                return m;
            }, {});
        }
    }

    const tokenStatuses = {};
    const getStatus = (token, query, msgId) => {
        let rxret, status, index, modindex, statusblock;
        if (!token) return;
        // token = simpleObj(token);
        // if (token && !token.hasOwnProperty('id')) token.id = token._id;
        if (!tokenStatuses.hasOwnProperty(token.id) || tokenStatuses[token.id].msgId !== msgId) {
            tokenStatuses[token.id] = new StatusBlock({ token: token, msgId: msgId });
        }
        rxret = /(?<marker>.+?)(?:\?(?<index>\d+|all\+?))?$/.exec(query);
        [status, index] = [rxret.groups.marker, rxret.groups.index];
        if (!index) {
            modindex = 1;
        } else if (['all', 'all+'].includes(index.toLowerCase())) {
            modindex = index.toLowerCase();
        } else {
            modindex = Number(index);
        }
        statusblock = tokenStatuses[token.id].statuses[status];
        if (!statusblock || !statusblock.length) {
            return { is: 'no', count: '0' };
        };
        switch (index) {
            case 'all':
                return statusblock.reduce((m, sm) => {
                    m.num = `${m.num || ''}${sm.num}`;
                    m.tag = m.tag || sm.tag;
                    m.url = m.url || sm.url;
                    m.html = m.html || sm.html;
                    m.is = 'yes';
                    m.count = m.count || statusblock.length;
                    return m;
                }, {});
            case 'all+':
                return statusblock.reduce((m, sm) => {
                    m.num = `${Number(m.num || 0) + Number(sm.num)}`;
                    m.tag = m.tag || sm.tag;
                    m.url = m.url || sm.url;
                    m.html = m.html || sm.html;
                    m.is = 'yes';
                    m.count = m.count || statusblock.length;
                    return m;
                }, {});
            default:
                if (statusblock.length >= modindex) {
                    return Object.assign({}, statusblock[modindex - 1], { count: index ? '1' : statusblock.length });
                } else {
                    return { is: 'no', 'count': '0' };
                }
        }
    };

    const checkTicks = (s, check = ["'", "`", '"']) => {
        if (typeof s !== 'string') return s;
        return ((s.charAt(0) === s.charAt(s.length - 1)) && check.includes(s.charAt(0))) ? s.slice(1, s.length - 1) : s;
    };
    const isPlayerToken = (obj = { get: () => { return undefined; } }, pc = false) => {
        let players;
        if (!pc) {
            players = obj.get('controlledby')
            .split(/,/)
            .filter(s => s.length);

            if (players.includes('all') || players.filter((p) => !playerIsGM(p)).length) {
                return true;
            }
        }

        if ('' !== obj.get('represents')) {
            players = (getObj('character', obj.get('represents')) || { get: function () { return ''; } })
                .get('controlledby')
                .split(/,/)
                .filter(s => s.length);
            return !!(players.includes('all') || players.filter((p) => !playerIsGM(p)).length);
        }
        return false;
    };
    const isNPC = (obj = { get: () => { return ''; } }) => {
        let control = (
            obj.get('represents') && obj.get('represents').length
                ? getObj('character', obj.get('represents') || { get: function () { return ''; } })
                : obj
        )
            .get('controlledby').split(/,/);
        if (!control.length) return true;
        return !control.filter(s => s.length && !playerIsGM(s)).length;
    };
    const internalTestLib = {
        'int': (v) => +v === +v && parseInt(parseFloat(v, 10), 10) == v,
        'num': (v) => +v === +v,
        'tru': (v) => v == true
    };
    const typeProcessor = {
        '=': (t) => t[0] == t[1],
        '!=': (t) => t[0] != t[1],
        '~': (t) => t[0].includes(t[1]),
        '!~': (t) => !t[0].includes(t[1]),
        '>': (t) => (internalTestLib.num(t[0]) ? Number(t[0]) : t[0]) > (internalTestLib.num(t[1]) ? Number(t[1]) : t[1]),
        '>=': (t) => (internalTestLib.num(t[0]) ? Number(t[0]) : t[0]) >= (internalTestLib.num(t[1]) ? Number(t[1]) : t[1]),
        '<': (t) => (internalTestLib.num(t[0]) ? Number(t[0]) : t[0]) < (internalTestLib.num(t[1]) ? Number(t[1]) : t[1]),
        '<=': (t) => (internalTestLib.num(t[0]) ? Number(t[0]) : t[0]) <= (internalTestLib.num(t[1]) ? Number(t[1]) : t[1]),
        'in': (t) => {
            let array = (/^\[?([^\]]+)\]?$/.exec(t[1])[1] || '').split(/\s*,\s*/);
            return array.includes(t[0]);
        }
    }

    const evaluateCriteria = (c, t, msgId) => {
        let comp = [];
        let tksetting;
        let test = c.test;
        let attrret = 'current'; // current or max
        let attrval;
        let attrres;
        switch (c.type) {
            case 'bar':
                if (typeProcessor.hasOwnProperty(test)) {
                    comp = [t.get(`bar${['1', '2', '3'].includes(c.ident) ? c.ident : '1'}_value`), c.value];
                }
                break;
            case 'max':
                if (typeProcessor.hasOwnProperty(test)) {
                    comp = [t.get(`bar${['1', '2', '3'].includes(c.ident) ? c.ident : '1'}_max`), c.value];
                }
                break;
            case 'aura':
                if (test && test.length && c.value && !isNaN(c.value) && typeProcessor.hasOwnProperty(test)) { // testing radius of aura
                    tksetting = t.get(`aura${['1', '2'].includes(c.ident) ? c.ident : '1'}_radius`);
                    if (tksetting && tksetting.length) {
                        comp = [tksetting, c.value];
                    }
                } else { // testing presence of aura
                    tksetting = t.get(`aura${['1', '2'].includes(c.ident) ? c.ident : '1'}_radius`);
                    comp = [tksetting && tksetting.length > 0, true];
                    test = '=';
                }
                break;
            case 'color':
                if (typeProcessor.hasOwnProperty(test)) {
                    tksetting = t.get(`aura${['1', '2'].includes(c.ident) ? c.ident : '1'}_radius`);
                    if (tksetting && tksetting.length) {
                        comp = [t.get(`aura${['1', '2'].includes(c.ident) ? c.ident : '1'}_color`), c.value];
                    }
                }
                break;
            case 'gmnotes':
                if (typeProcessor.hasOwnProperty(test)) {
                    comp = [t.get(`gmnotes`), c.value];
                }
                break;
            case 'tip':
                if (typeProcessor.hasOwnProperty(test)) {
                    comp = [t.get(`tooltip`), c.value];
                }
                break;
            case 'layer':
                if (typeProcessor.hasOwnProperty(test)) {
                    comp = [t.get(`layer`), c.value];
                }
                break;
            case 'marker':
                tksetting = getStatus(t, c.ident, msgId);
                if (typeProcessor.hasOwnProperty(test)) {
                    comp = [tksetting.num, c.value];
                } else { // testing presence of marker
                    test = '=';
                    comp = [tksetting.is === 'yes', true];
                }
                break;
            case 'tag':
                if (t.get('represents') && t.get('represents').length) {
                    let char = getObj('character', t.get('represents'));
                    if (char) { // testing presence of attribute
                        tksetting = JSON.parse(char.get('tags'));
                        test = '=';
                        comp = [tksetting.includes(c.ident), true];
                    }
                }
                break;
            case 'attribute':
                if (t.get('represents') && t.get('represents').length) {
                    attrres = /^(?<attr>[^.|#?]+?)(?:(?:\.|\?|#|\|)(?<attrval>current|cur|c|max|m))?\s*$/i.exec(c.ident);
                    if (attrres.groups && attrres.groups.attrval && attrres.groups.attrval.length && ['max', 'm'].includes(attrres.groups.attrval)) {
                        attrret = 'max';
                    }
                    if (typeProcessor.hasOwnProperty(test)) {
                        attrval = (findObjs({ type: 'attribute', characterid: t.get('represents') }).filter(a => a.get('name') === attrres.groups.attr)[0] || { get: () => { return '' } }).get(attrret) || '';
                        comp = [attrval, c.value];
                    } else { // testing presence of attribute
                        test = '=';
                        comp = [findObjs({ type: 'attribute', characterid: t.get('represents') }).filter(a => a.get('name') === attrres.groups.attr).length > 0, true];
                    }
                }
                break;
            case 'type':
                if (typeProcessor.hasOwnProperty(test)) {
                    if (c.value === 'graphic') {
                        tksetting = t.get('type');
                    } else {
                        tksetting = t.get('type') === 'graphic' ? t.get('subtype') : t.get('type');
                    }
                    comp = [tksetting, c.value];
                }
                break;
            case 'pc':
                if (t.get('type') === 'graphic' && t.get('subtype') === 'token' && t.get('layer') === 'objects') {
                    test = '=';
                    comp = [isPlayerToken(t, true), true];
                }
                break;
            case 'npc':
                if (t.get('type') === 'graphic' && t.get('subtype') === 'token') {
                    test = '=';
                    comp = [isNPC(t), true];
                }
                break;
            case 'pt':
                if (t.get('type') === 'graphic' && t.get('subtype') === 'token' && t.get('layer') === 'objects') {
                    test = '=';
                    comp = [isPlayerToken(t, true), false];
                }
                break;
            case 'side':
                if (typeProcessor.hasOwnProperty(test) && t.get('type') === 'graphic') {
                    tksetting = t.get('currentSide');
                    comp = [tksetting, c.value];
                }
                break;
            default:
                return false;
        }
        if (!comp.length) return false;
        let result = typeProcessor[test](comp);
        return c.musthave ? result : !result;
    };

    class Criteria {
        constructor({
            type: type = '',
            musthave: musthave = '',
            ident: ident = '',
            test: test = '',
            value: value = ''
        } = {}) {
            this.type = type;
            this.musthave = musthave;
            this.ident = ident;
            this.test = test;
            this.value = value;
        }
    }
    const injectrx = /(\()?{&\s*inject\s+([^}]+?)\s*}((?<=\({&\s*inject\s+([^}]+?)\s*})\)|\1)/gi;
    const selectrx = /(\()?{&\s*select\s+([^}]+?)\s*}((?<=\({&\s*select\s+([^}]+?)\s*})\)|\1)/gi;
    const criteriarx = /^(?<musthave>\+|-)(?<attr>@|\*|#)?(?<typeitem>[^\s><=!~]+)(?:\s*$|\s*(?<test>>=|<=|~|!~|=|!=|<|>|in(?=\s+\[[^\]]+\]))\s*(?<value>.+)$)/;
    const typeitemrx = /^(?<type>bar|max|aura|color|layer|tip|gmnotes|type|pc|npc|pt|side)(?<ident>1|2|3)?(?<!bar|max|aura3|color3|layer1|layer2|layer3|tip1|tip2|tip3|gmnotes1|gmnotes2|gmnotes3|type1|type2|type3|pc1|pc2|pc3|npc1|npc2|npc3|pt1|pt2|pt3|side1|side2|side3)$/i;
    const inject = (msg, status, msgId/*, notes*/) => {
        const layerCriteria = (criteria) => {
            return criteria.filter(c => c.type === 'layer').length ? true : false;
        };
        const caseLibrary = [
            { rx: /^(\+|-)[^\s]+\s+in\s+\[$/i, terminator: ']' }
        ];
        const getGroups = (cmd, index = 0, groups = []) => {
            const getNextGroup = (cmd, terminator = ',') => {
                let s = '';
                let bstop = false;
                while (index <= cmd.length - 1 && !bstop) {
                    if (cmd.charAt(index) === terminator) {
                        if (terminator !== ',') {
                            s = `${s}${terminator}`;
                            index++;
                        }
                        bstop = true;
                    } else {
                        if (s.length || cmd.charAt(index) !== ' ') {
                            s = `${s}${cmd.charAt(index)}`;
                        }
                        index++;
                        for (const c of caseLibrary) {
                            c.rx.lastIndex = 0;
                            if (c.rx.test(s)) {
                                s = `${s}${getNextGroup(cmd, c.terminator)}`;
                            }
                        }
                    }
                }
                return s;
            };
            while (index <= cmd.length - 1) {
                groups.push(getNextGroup(cmd));
                index++;
            }
            return groups;
        };
        const unpackGroups = (array) => {
            return array
                .map(l => getTokens(l, msg.playerid))
                .reduce((m, group) => {
                    m = [...m, ...group];
                    return m;
                }, [])
                .filter(t => typeof t !== 'undefined');
        };
        const replaceOps = (rx, rxtype) => {
            rx.lastIndex = 0;
            msg.content = msg.content.replace(rx, (m, padding, group) => {
                if (rxtype === 'inject') {
                    msg.selected = msg.selected || [];
                } else if (rxtype === 'select') {
                    msg.selected = [];
                }
                let identifiers = getGroups(group)
                    .reduce((m, v) => {
                        if (criteriarx.test(v) && !findObjs({ id: v }).length) {
                            let critres = criteriarx.exec(v);
                            let newcriteria = new Criteria({ musthave: (critres.groups.musthave === '+'), test: (critres.groups.test || ''), value: checkTicks((critres.groups.value || '')) });
                            if (critres.groups.attr && critres.groups.attr === '@') {
                                newcriteria.type = 'attribute';
                                newcriteria.ident = (critres.groups.typeitem || '');
                            } else if (critres.groups.attr && critres.groups.attr === '*') {
                                newcriteria.type = 'marker';
                                newcriteria.ident = (critres.groups.typeitem || '');
                            } else if (critres.groups.attr && critres.groups.attr === '#') {
                                newcriteria.type = 'tag';
                                newcriteria.ident = (critres.groups.typeitem || '');
                            } else if (typeitemrx.test(critres.groups.typeitem)) {
                                let ti_res = typeitemrx.exec(critres.groups.typeitem);
                                newcriteria.type = ti_res.groups.type;
                                newcriteria.ident = ti_res.groups.ident;
                            } else if (oldmarkerrx.test(v)) {
                                newcriteria.type = 'marker';
                                newcriteria.ident = critres.groups.typeitem;
                            } else {
                                m.selections.push(v);
                            }
                            m.criteria.push(newcriteria);
                        } else {
                            m.selections.push(v);
                        }
                        return m;
                    }, { criteria: [], selections: [] });
                if (playerIsGM(msg.playerid) && !layerCriteria(identifiers.criteria)) {
                    identifiers.criteria.push(new Criteria({ type: 'layer', musthave: true, test: '=', value: 'objects' }));
                }
                identifiers.selections = uniqueArrayByProp(unpackGroups(identifiers.selections), 'id')
                    .filter(t => {
                        return identifiers.criteria.every(c => evaluateCriteria(c, t, msgId));
                    });

                msg.selected = identifiers.selections
                    .map(t => { return { '_id': t.id, '_type': t.get('type') }; })
                    .reduce((m, t) => {
                        if (!m.map(mt => mt._id).includes(t._id)) {
                            m.push(t);
                        }
                        return m;
                    }, msg.selected);

                status.push('changed');
                return '';
            });
        };
        let retResult = false;
        // handle selections
        if (selectrx.test(msg.content)) {
            retResult = true;
            replaceOps(selectrx, 'select');
        }
        // handle injections
        if (injectrx.test(msg.content)) {
            retResult = true;
            replaceOps(injectrx, 'inject');
        }
        if (msg.selected && !msg.selected.length) delete msg.selected;
        return retResult;
    };

    const dispatchForSelected = (trigger, i) => {
        if (preservedMsgObj[trigger].selected.length > i) {
            sendChat(preservedMsgObj[trigger].chatSpeaker, `!${trigger}${i} ${preservedMsgObj[trigger].dsmsg.replace(/{&\s*i\s*((\+|-)\s*([\d]+)){0,1}}/gi, ((m, g1, op, val) => { return !g1 ? i : op === '-' ? parseInt(i) - parseInt(val) : parseInt(i) + parseInt(val); }))}`);
        }
        if (preservedMsgObj[trigger].selected.length <= i + 1) {
            setTimeout(() => { delete preservedMsgObj[trigger] }, 10000);
        }
    };
    const fsrx = /(^!forselected(--|\+\+|\+-|-\+|\+|-|)(?:\((.)\)){0,1}(-silent)?\s+!?).+/i;
    const forselected = (msg, apitrigger) => {
        apitrigger = `${apiproject}${generateUUID()}`;
        if (!(preservedMsgObj[maintrigger].selected && preservedMsgObj[maintrigger].selected.length)) {
            let fsres = fsrx.exec(msg.content);
            if (fsres && !fsres[4]) { // account for silent output
                msgbox({ msg: `No selected tokens to use for that command. Please select some tokens then try again.`, title: `NO TOKENS`, whisperto: getWhisperTo(preservedMsgObj[maintrigger].who) });
            }
            return;
        }
        preservedMsgObj[apitrigger] = {
            selected: [...(preservedMsgObj[maintrigger].selected || [])],
            who: preservedMsgObj[maintrigger].who,
            playerid: preservedMsgObj[maintrigger].playerid,
            dsmsg: ''
        };
        preservedMsgObj[apitrigger].chatSpeaker = getTheSpeaker(preservedMsgObj[apitrigger]).chatSpeaker;
        let fsres = fsrx.exec(msg.content);
        switch (fsres[2] || '++') {
            case '+-':
                preservedMsgObj[apitrigger].replaceid = true;
                preservedMsgObj[apitrigger].replacename = false;
                break;
            case '-':
            case '-+':
                preservedMsgObj[apitrigger].replaceid = false;
                preservedMsgObj[apitrigger].replacename = true;
                preservedMsgObj[apitrigger].nametoreplace = findObjs({ id: preservedMsgObj[apitrigger].selected[0]._id })[0].get('name');
                break;
            case '--':
                preservedMsgObj[apitrigger].replaceid = false;
                preservedMsgObj[apitrigger].replacename = false;
                break;
            case '+':
            case '++':
            default:
                preservedMsgObj[apitrigger].replaceid = true;
                preservedMsgObj[apitrigger].replacename = true;
                preservedMsgObj[apitrigger].nametoreplace = findObjs({ id: preservedMsgObj[apitrigger].selected[0]._id })[0].get('name');
                break;
        }
        msg.content = msg.content.replace(/<br\/>\n/g, ' ');
        preservedMsgObj[apitrigger].dsmsg = msg.content.slice(fsres[1].length);
        if (fsres[3]) {
            preservedMsgObj[apitrigger].dsmsg = preservedMsgObj[apitrigger].dsmsg.replace(new RegExp(escapeRegExp(fsres[3]), 'g'), '');
        }
        dispatchForSelected(apitrigger, 0);
        //preservedMsgObj[apitrigger].selected.forEach((t, i) => {
        //    sendChat(chatSpeaker, `!${apitrigger}${i} ${dsmsg.replace(/{&\s*i\s*((\+|-)\s*([\d]+)){0,1}}/gi, ((m, g1, op, val) => { return !g1 ? i : op === '-' ? parseInt(i) - parseInt(val) : parseInt(i) + parseInt(val); }))}`);
        //});
        //setTimeout(() => { delete preservedMsgObj[apitrigger] }, 10000);
    };
    const trackprops = (msg) => {
        [
            preservedMsgObj[maintrigger].who,
            preservedMsgObj[maintrigger].selected,
            preservedMsgObj[maintrigger].playerid,
            preservedMsgObj[maintrigger].inlinerolls
        ] = [msg.who, msg.selected, msg.playerid, msg.inlinerolls];
    };
    const handleInput = (msg, msgstate = {}) => {
        let funcret = { runloop: false, status: 'unchanged', notes: '' };
        const trigrx = new RegExp(`^!(${Object.keys(preservedMsgObj).join('|')})`);
        let apitrigger; // the apitrigger used by the message
        if (!Object.keys(msgstate).length && scriptisplugin) return funcret;
        let status = [];
        let notes = [];
        let msgId = generateUUID();
        msg.content = msg.content.replace(/<br\/>\n/g, '({&br-sm})');
        let injection = inject(msg, status, msgId, notes);
        if ('API' !== msg.playerid) { // user generated message
            trackprops(msg);
        } else { // API generated message
            if (injection) preservedMsgObj[maintrigger].selected = msg.selected;
            // peel off ZeroFrame trigger, if it's there
            if (msg.apitrigger) msg.content = msg.content.replace(msg.apitrigger, '');
            if (trigrx.test(msg.content)) { // message has apitrigger (iterative call of forselected) so cycle-in next selected
                apitrigger = trigrx.exec(msg.content)[1];
                msg.content = msg.content.replace(apitrigger, '');
                status.push('changed');
                let nextindex = /^!(\d+)\s*/.exec(msg.content)[1];
                msg.content = `!${msg.content.slice(nextindex.length + 2)}`;
                nextindex = Number(nextindex);
                msg.selected = [];
                msg.selected.push(preservedMsgObj[apitrigger].selected[nextindex]);
                msg.who = preservedMsgObj[apitrigger].who;
                msg.playerid = preservedMsgObj[apitrigger].playerid;
                // handle replacements of @{selected|token_id} and @{selected|token_name}
                if (preservedMsgObj[apitrigger].replaceid) {
                    msg.content = msg.content.replace(apitrigger, '').replace(preservedMsgObj[apitrigger].selected[0]._id, msg.selected[0]._id);
                }
                if (preservedMsgObj[apitrigger].replacename && preservedMsgObj[apitrigger].nametoreplace && msg.selected[0]._type === 'graphic') {
                    msg.content = msg.content.replace(apitrigger, '').replace(preservedMsgObj[apitrigger].nametoreplace, findObjs({ id: msg.selected[0]._id })[0].get('name'));
                }
                // handle replacements of at{selected|prop}
                if (typeof Fetch !== 'undefined' && typeof ZeroFrame !== 'undefined') {
                    const fetchselrx = /at\((?<token>selected)[|.](?<item>[^\s[|.)]+?)(?:[|.](?<valtype>[^\s.[|]+?)){0,1}(?:\[(?<default>[^\]]*?)]){0,1}\s*\)/gi;
                    const fetchrptgselrx = /at\((?<character>selected)[|.](?<section>[^\s.|]+?)[|.]\[\s*(?<pattern>.+?)\s*]\s*[|.](?<valuesuffix>[^[\s).]+?)(?:[|.](?<valtype>[^\s.[)]+?)){0,1}(?:\[(?<default>[^\]]*?)]){0,1}\s*\)/gi;
                    msg.content = msg.content.replace(fetchselrx, m => {
                        status.push('changed')
                        return `@${m.slice(2)}`;
                    });
                    msg.content = msg.content.replace(fetchrptgselrx, m => {
                        status.push('changed')
                        return `*${m.slice(2)}`;
                    });
                } else {
                    let selrx = /at{selected(?:\||\.)([^|}]+)(\|max)?}/ig;
                    let retval;
                    msg.content = msg.content.replace(selrx, (g0, g1, g2) => {
                        if (['token_id', 'token_name', 'bar1', 'bar2', 'bar3'].includes(g1.toLowerCase())) {
                            let tok = findObjs({ id: msg.selected[0]._id })[0];
                            if (g1.toLowerCase() === 'token_id') retval = tok.id;
                            else if (g1.toLowerCase() === 'token_name') retval = tok.get('name');
                            else retval = tok.get(`${g1}_${g2 ? 'max' : 'value'}`) || '';
                        } else {
                            let character = findObjs({ type: 'character', id: (getObj("graphic", msg.selected[0]._id) || { get: () => { return "" } }).get("represents") })[0];
                            if (!character) {
                                notes.push('No character found represented by token ${msg.selected[0]._id}');
                                status.push('unresolved');
                                retval = '';
                            } else if ('character_id' === g1.toLowerCase()) {
                                retval = character.id;
                            } else if ('character_name' === g1.toLowerCase()) {
                                retval = character.get('name');
                            }
                            status.push('changed');
                            retval(findObjs({ type: 'attribute', characterid: character.id })[0] || { get: () => { return '' } }).get(g2 ? 'max' : 'current') || '';
                        }
                    });
                }
                dispatchForSelected(apitrigger, nextindex + 1);
            } else { // api generated call to another script, copy in the appropriate data
                if (manageState.get('autoinsert').includes('selected')) {
                    if (preservedMsgObj[maintrigger].selected && preservedMsgObj[maintrigger].selected.length) {
                        msg.selected = preservedMsgObj[maintrigger].selected;
                    }
                    if (!msg.selected || (msg.selected && !msg.selected.length)) {
                        delete msg.selected;
                    }
                }
                if (manageState.get('autoinsert').includes('who') && !manageState.get('knownsenders').includes(msg.who)) {
                    msg.who = preservedMsgObj[maintrigger].who;
                }
                if (manageState.get('autoinsert').includes('playerid')) {
                    msg.playerid = preservedMsgObj[maintrigger].playerid;
                }
            }
            // replace ZeroFrame trigger, if it's there
            if (msg.apitrigger) msg.content = `!${msg.apitrigger}${msg.content.slice(1)}`;
        }
        msg.content = msg.content.replace(/\({&br-sm}\)/g, '<br/>\n');
        return condensereturn(funcret, status, notes);
    };
    const handleForSelected = (msg) => {
        if (msg.type !== 'api' || !fsrx.test(msg.content)) return;
        forselected(msg);
    };
    const getProp = (prop) => {
        return preservedMsgObj[maintrigger][prop] || undefined;
    };
    const getSelected = () => getProp('selected');
    const getWho = () => getProp('who');
    const getPlayerID = () => getProp('playerid');

    const checkDependencies = (deps) => {
        /* pass array of objects like
            { name: 'ModName', version: '#.#.#' || '', mod: ModName || undefined, checks: [ [ExposedItem, type], [ExposedItem, type] ] }
        */
        const dependencyEngine = (deps) => {
            const versionCheck = (mv, rv) => {
                let modv = [...mv.split('.'), ...Array(4).fill(0)].slice(0, 4);
                let reqv = [...rv.split('.'), ...Array(4).fill(0)].slice(0, 4);
                return reqv.reduce((m, v, i) => {
                    if (m.pass || m.fail) return m;
                    if (i < 3) {
                        if (parseInt(modv[i]) > parseInt(reqv[i])) m.pass = true;
                        else if (parseInt(modv[i]) < parseInt(reqv[i])) m.fail = true;
                    } else {
                        // all betas are considered below the release they are attached to
                        if (reqv[i] === 0 && modv[i] === 0) m.pass = true;
                        else if (modv[i] === 0) m.pass = true;
                        else if (reqv[i] === 0) m.fail = true;
                        else if (parseInt(modv[i].slice(1)) >= parseInt(reqv[i].slice(1))) m.pass = true;
                    }
                    return m;
                }, { pass: false, fail: false }).pass;
            };

            let result = { passed: true, failures: {}, optfailures: {} };
            deps.forEach(d => {
                let failObj = d.optional ? result.optfailures : result.failures;
                if (!d.mod) {
                    if (!d.optional) result.passed = false;
                    failObj[d.name] = 'Not found';
                    return;
                }
                if (d.version && d.version.length) {
                    if (!(API_Meta[d.name].version && API_Meta[d.name].version.length && versionCheck(API_Meta[d.name].version, d.version))) {
                        if (!d.optional) result.passed = false;
                        failObj[d.name] = `Incorrect version. Required v${d.version}. ${API_Meta[d.name].version && API_Meta[d.name].version.length ? `Found v${API_Meta[d.name].version}` : 'Unable to tell version of current.'}`;
                        return;
                    }
                }
                d.checks.reduce((m, c) => {
                    if (!m.passed) return m;
                    let [pname, ptype] = c;
                    if (!d.mod.hasOwnProperty(pname) || typeof d.mod[pname] !== ptype) {
                        if (!d.optional) m.passed = false;
                        failObj[d.name] = `Incorrect version.`;
                    }
                    return m;
                }, result);
            });
            return result;
        };
        let depCheck = dependencyEngine(deps);
        let failures = '', contents = '', msg = '';
        if (Object.keys(depCheck.optfailures).length) { // optional components were missing
            failures = Object.keys(depCheck.optfailures).map(k => `&bull; <code>${k}</code> : ${depCheck.optfailures[k]}`).join('<br>');
            contents = `<span style="font-weight: bold">${apiproject}</span> utilizies one or more other scripts for optional features, and works best with those scripts installed. You can typically find these optional scripts in the 1-click Mod Library:<br>${failures}`;
            msg = `<div style="width: 100%;border: none;border-radius: 0px;min-height: 60px;display: block;text-align: left;white-space: pre-wrap;overflow: hidden"><div style="font-size: 14px;font-family: &quot;Segoe UI&quot;, Roboto, Ubuntu, Cantarell, &quot;Helvetica Neue&quot;, sans-serif"><div style="background-color: #000000;border-radius: 6px 6px 0px 0px;position: relative;border-width: 2px 2px 0px 2px;border-style:  solid;border-color: black;"><div style="border-radius: 18px;width: 35px;height: 35px;position: absolute;left: 3px;top: 2px;"><img style="background-color: transparent ; float: left ; border: none ; max-height: 40px" src="${typeof apilogo !== 'undefined' ? apilogo : 'https://i.imgur.com/kxkuQFy.png'}"></div><div style="background-color: #c94d4d;font-weight: bold;font-size: 18px;line-height: 36px;border-radius: 6px 6px 0px 0px;padding: 4px 4px 0px 43px;color: #ffffff;min-height: 38px;">MISSING MOD DETECTED</div></div><div style="background-color: white;padding: 4px 8px;border: 2px solid #000000;border-bottom-style: none;color: #404040;">${contents}</div><div style="background-color: white;text-align: right;padding: 4px 8px;border: 2px solid #000000;border-top-style: none;border-radius: 0px 0px 6px 6px"></div></div></div>`;
            sendChat(apiproject, `/w gm ${msg}`);
        }
        if (!depCheck.passed) {
            failures = Object.keys(depCheck.failures).map(k => `&bull; <code>${k}</code> : ${depCheck.failures[k]}`).join('<br>');
            contents = `<span style="font-weight: bold">${apiproject}</span> requires other scripts to work. Please use the 1-click Mod Library to correct the listed problems:<br>${failures}`;
            msg = `<div style="width: 100%;border: none;border-radius: 0px;min-height: 60px;display: block;text-align: left;white-space: pre-wrap;overflow: hidden"><div style="font-size: 14px;font-family: &quot;Segoe UI&quot;, Roboto, Ubuntu, Cantarell, &quot;Helvetica Neue&quot;, sans-serif"><div style="background-color: #000000;border-radius: 6px 6px 0px 0px;position: relative;border-width: 2px 2px 0px 2px;border-style:  solid;border-color: black;"><div style="border-radius: 18px;width: 35px;height: 35px;position: absolute;left: 3px;top: 2px;"><img style="background-color: transparent ; float: left ; border: none ; max-height: 40px" src="${typeof apilogo !== 'undefined' ? apilogo : 'https://i.imgur.com/kxkuQFy.png'}"></div><div style="background-color: #c94d4d;font-weight: bold;font-size: 18px;line-height: 36px;border-radius: 6px 6px 0px 0px;padding: 4px 4px 0px 43px;color: #ffffff;min-height: 38px;">MISSING MOD DETECTED</div></div><div style="background-color: white;padding: 4px 8px;border: 2px solid #000000;border-bottom-style: none;color: #404040;">${contents}</div><div style="background-color: white;text-align: right;padding: 4px 8px;border: 2px solid #000000;border-top-style: none;border-radius: 0px 0px 6px 6px"></div></div></div>`;
            sendChat(apiproject, `/w gm ${msg}`);
            return false;
        }
        return true;
    };


    let scriptisplugin = false;
    const selectmanager = (m, s) => handleInput(m, s);
    on('chat:message', handleInput);
    setTimeout(() => { on('chat:message', handleForSelected) }, 0);
    on('ready', () => {
        versionInfo();
        logsig();
        let reqs = [
            {
                name: 'libTokenMarkers',
                version: `0.1.2`,
                mod: typeof libTokenMarkers !== 'undefined' ? libTokenMarkers : undefined,
                checks: [['getStatus', 'function'], ['getStatuses', 'function'], ['getOrderedList', 'function']]
            },
            {
                name: 'Messenger',
                version: `1.0.0`,
                mod: typeof Messenger !== 'undefined' ? Messenger : undefined,
                checks: [['Button', 'function'], ['MsgBox', 'function'], ['HE', 'function'], ['Html', 'function'], ['Css', 'function']]
            }
        ];
        if (!checkDependencies(reqs)) return;
        html = Messenger.Html();
        css = Messenger.Css();
        HE = Messenger.HE;

        oldmarkerrx = new RegExp(`^(\\+|-)(${libTokenMarkers.getOrderedList().map(o => o.name).join('|')})`);

        issueVersionUpdateMessages();

        scriptisplugin = (typeof ZeroFrame !== `undefined`);
        if (typeof ZeroFrame !== 'undefined') {
            ZeroFrame.RegisterMetaOp(selectmanager, { priority: 20, handles: ['sm'] });
        }
        on('chat:message', handleConfig);
    });

    return { // public interface
        GetSelected: getSelected,
        GetWho: getWho,
        GetPlayerID: getPlayerID
    };

})();
{ try { throw new Error(''); } catch (e) { API_Meta.SelectManager.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.SelectManager.offset); } }
/* */
/*
================================================================
END SCRIPT: SelectManager
================================================================
*/

/*
================================================================
BEGIN SCRIPT: SimpleSound
SOURCE FILE: SimpleSound.md
================================================================
*/
/**
 * simplesound.js
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * 
 * The goal of this script is to play/stop sound effects from the Roll20 Jukebox
 * via commandline.
 * 
 *      Syntax:
 * 
 *      !splay [sound name] - play the named sound effect
 *      !sstop [sound name] - stop the named sound effect
 *      !swhisper - toggle the GM whisper status
 *      !sstop - stop all tracks currently playing
 * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * 
 * Revison History:
 * 
 * 0.2.0 - Added the !swhisper command to endable/disable whispers via command
 * 0.2.1 - Modified !sstop to stop all tracks with no variable
 * 0.2.2 - fixed modification of msg object (affecting other scripts)
 * 
 */
var simpleSound = simpleSound || (function(){
    'use strict';

    var playSound = function(trackname, action) {
        var track = findObjs({type: 'jukeboxtrack', title: trackname})[0];
        if(track) {
            track.set('playing',false);
            track.set('softstop',false);
			if(action == 'play'){
				track.set('playing',true);
			}
        }
        else {
            sendChat('Simple Sound Script', '/w gm No Track Found...');
            log("No track found "+trackname);
        }
    },

    stopAllSounds = function() {
        var tracks = findObjs({type: 'jukeboxtrack', playing: true});
        if(tracks) {
            _.each(tracks, function(sound) {
                sound.set('playing', false);
            });
        }
    },

	handleInput = function(msg_orig) {
    
    var whispers = state.simpleSound.whisper;

    if ( "api" !== msg_orig.type ) {
      return;
    }
    let msg = _.clone(msg_orig);

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

        if(msg.content.indexOf("!splay") !== -1 ) {
            var args = ["!splay", msg.content.replace('!splay','').trim()]
        }
        else if(msg.content.indexOf("!sstop") !== -1) {
            var args = ["!sstop", msg.content.replace('!sstop','').trim()]        
        }
        else if(msg.content.indexOf("!swhisper") !== -1) {
            var args = ["!swhisper".trim()]        
        }
        else {
            return;
        }
		
		if (! state.simpleSound.whisper){state.simpleSound.whisper = false;}

		switch(args[0]) {
			case '!splay': {
                var track_name = args[1] || 0;
                if(track_name) {
    				if(whispers){ sendChat('Simple Sound Script', '/w gm <b>[PLAYING]</b> ' + track_name); }
    				playSound(track_name,'play');
                }
                else {
                    sendChat('Simple Sound Script', '/w gm Syntax: !splay [track name]');
                }
				break;
			}
			case '!sstop': {
			    var track_name = args[1] || 0;
                if(track_name) {
    				if(whispers){ sendChat('Simple Sound Script', '/w gm <b>[STOPPING]</b> ' + track_name); }
    				playSound(track_name,'stop');
                }
                else {
                    if(whispers){ sendChat('Simple Sound Script', '/w gm <b>[STOPPING ALL TRACKS]</b>'); }
                    stopAllSounds();
                }
				break;
			}
			case '!swhisper': {
                if(state.simpleSound.whisper == true) {
    				state.simpleSound.whisper = false;
                }
                else {
                    state.simpleSound.whisper = true;
                }
                var whispers = state.simpleSound.whisper;
                    sendChat('Simple Sound Script', '/w gm Whispers are set to ( <b>' + whispers + '</b> )');
				break;
			}
	  }
	},
	
	checkInstall = function()
	{
	    var script_version = "0.2.1";
        if( ! state.simpleSound ) {
                state.simpleSound = {
                    version: script_version,
                    whisper: false,
                };
            }   
            
		if (! state.simpleSound.whisper){state.simpleSound.whisper = false;}
		
        if (state.simpleSound.version != script_version)
            state.simpleSound.version = script_version;
            
            log("-=> Simple Sound Script v"+state.simpleSound.version+" Initialized <=-")
	},

    	
	registerEventHandlers = function() {
		on('chat:message', handleInput);
	};

	return {
		CheckInstall: checkInstall,
		RegisterEventHandlers: registerEventHandlers
	};

}());

on("ready", function() {
    'use strict';
    
	simpleSound.CheckInstall();
	simpleSound.RegisterEventHandlers();        
});
/*
================================================================
END SCRIPT: SimpleSound
================================================================
*/
