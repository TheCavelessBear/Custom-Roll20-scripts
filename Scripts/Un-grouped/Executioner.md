on('ready', function() {
    state.Executioner = state.Executioner || {};
});

on('chat:message', function(msg) {
    if (msg.type !== 'api') return;
    if (!msg.content.startsWith('!executioner')) return;

    const args = msg.content.split(/\s+/);
    const subcommand = args[1];

    if (subcommand === 'form') {
        const form = args[2];
        const tokenId = args[3];

        const token = getObj('graphic', tokenId);
        if (!token) {
            sendChat('Executioner', '/w gm No valid token found.');
            return;
        }

        const validForms = ['Warhammer', 'Battleaxe', 'Spear'];

        if (!validForms.includes(form)) {
            sendChat('Executioner', '/w gm Invalid Executioner form.');
            return;
        }

        state.Executioner[tokenId] = state.Executioner[tokenId] || {};
        state.Executioner[tokenId].form = form;

        sendChat(
            'Executioner',
            `&{template:default} {{name=Executioner Transformed}} {{Form=${form}}} {{Effect=${token.get('name')} changes Executioner into its ${form} form.}}`
        );

        return;
    }

    if (subcommand === 'attack') {
    const tokenId = args[2];

    const token = getObj('graphic', tokenId);
    if (!token) {
        sendChat('Executioner', '/w gm No valid token found.');
        return;
    }

    const form = state.Executioner[tokenId] && state.Executioner[tokenId].form ? state.Executioner[tokenId].form : 'Warhammer';

    const abilityMap = {
        Warhammer: {
            Melee: 'Hammer-Melee-Attack',
            Thrown: 'Hammer-Throw-Attack'
        },
        Battleaxe: {
            Melee: 'Battleaxe-Melee-Attack',
            Thrown: 'Battleaxe-Throw-Attack'
        },
        Spear: {
            Melee: 'Spear-Melee-Attack',
            Thrown: 'Spear-Throw-Attack'
        }
    };

    const characterId = token.get('represents');
    const character = getObj('character', characterId);

    if (!character) {
        sendChat('Executioner', '/w gm Selected token does not represent a character.');
        return;
    }

    const player = getObj('player', msg.playerid);
const whisperTarget = player ? player.get('_displayname') : 'gm';

const card = `&{template:default} {{name=Executioner — ${form}}} {{Attack=[Melee](~${characterId}|${abilityMap[form].Melee}) [Thrown](~${characterId}|${abilityMap[form].Thrown})}}`;

sendChat('Executioner', `/w "${whisperTarget}" ${card}`);
sendChat('Executioner', `/w gm ${card}`);
}
});