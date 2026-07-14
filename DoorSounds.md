on('ready', () => {
    const getRandomTrack = (tracks) => tracks[Math.floor(Math.random() * tracks.length)];
    let playSound = function (trackname, action) {
        let track = findObjs({ type: 'jukeboxtrack', title: trackname })[0];
        if (track) {
            track.set('playing', false);
            track.set('softstop', false);
            if (action === 'play') {
                track.set('playing', true);
            }
        } else {
            sendChat('Doorsound', `/w gm No Track Found: ${trackname}`);
            log("No track found: " + trackname);
        }
    };
    on("change:door:isOpen", function (obj, prev) {
        if (!prev.isSecret) {
            if (prev.isOpen) {
                const closeSounds = ["Door Close 1", "Door Close 2", "Door Close 3"];
                const randomClose = getRandomTrack(closeSounds);
                playSound(randomClose, 'play');
            } else {
                const openSounds = ["Door Open 1", "Door Open 2", "Door Open 3", "Door Open 4"];
                const randomOpen = getRandomTrack(openSounds);
                playSound(randomOpen, 'play');
            }
        }
    });
});