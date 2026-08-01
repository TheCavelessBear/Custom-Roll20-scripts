on("ready", function () {
  const AE = "ActionEconomyV2";
  const EFFECTS = {
    dash: {
      display: "Dash",
      marker: null,
      duration: "endOfTurn",
      mechanical: "Gain additional movement equal to your speed.",
      type: "effect"
    },

    disengage: {
      display: "Disengage",
      marker: null,
      duration: "endOfTurn",
      mechanical: "Movement does not provoke opportunity attacks.",
      type: "effect"
    },

    dodge: {
      display: "Dodge",
      marker: "Icon_-_Dodge_1-1_marker_icon_token::266168",
      duration: "startOfNextTurn",
      mechanical: "Attack rolls against you have disadvantage. Dexterity saves have advantage.",
      type: "effect"
    },

    haste: {
      display: "Haste",
      marker: "Icon_-_Boots_of_Flying_1-1_attunement_icon_token::266023",
      duration: "combat",
      mechanical: "Speed doubled. +2 AC. Advantage on Dexterity saving throws. Gain Haste Action.",
      type: "effect",
      saveAdvantage: "dex",
      attributeModifier: {
        attrName: "ac",
        amount: 2
      }
    },

    slow: {
      display: "Slow",
      marker: "Icon_-_Chains_2-1_marker_icon_token::266354",
      duration: "combat",
      mechanical: "Movement and actions restricted.",
      type: "effect"
    },

    fly: {
      display: "Fly",
      marker: "Icon_-_Fly_3-1_flier_icon_token::279621",
      duration: "manual",
      mechanical: "Creature gains a flying speed.",
      type: "effect"
    },

    mounted: {
      display: "Mounted",
      marker: "Icon_-_Mount_1-1_vehicle_icon_token::279826",
      duration: "manual",
      mechanical: "Creature is mounted.",
      type: "effect"
    },

    concentrate: {
      display: "Concentration",
      marker: "Icon_-_Concentration_1-1_spell_icon_token::265983",
      duration: "manual",
      mechanical: "Concentrating on a spell.",
      type: "effect"
    },

    shield: {
      display: "Shield",
      marker: "Icon_-_Magic_Shield_2-1_marker_icon_token::279721",
      duration: "startOfNextTurn",
      mechanical: "+5 AC.",
      type: "effect"
    },

    bladeward: {
      display: "Blade Ward",
      marker: "Icon_-_Shield_Bash_1-1_marker_icon_token::279881",
      duration: "combat",
      mechanical: "Attack rolls against this creature subtract 1d4.",
      type: "effect",
      concentration: true
    },

    sanctuary: {
      display: "Sanctuary",
      marker: "Icon_-_Protection_2-1_marker_icon_token::279623",
      duration: "combat",
      mechanical: "Protected by Sanctuary. Ends if the protected creature makes an attack.",
      type: "effect",
      triggers: {
        attack: "removeSelf",
        spell: "removeSelf"
      }
    },

    divine: {
      display: "Divine Favor",
      marker: "Icon_-_Paladin_1-1_paladin_icon_token::279928",
      duration: "combat",
      mechanical: "Weapon attacks deal extra radiant damage.",
      type: "effect"
    },

    reckless: {
      display: "Reckless",
      marker: "Icon_-_Double_Axes_1-1_marker_icon_token::266180",
      duration: "startOfNextTurn",
      mechanical: "Advantage on attacks. Attacks against you have advantage.",
      type: "effect"
    },

    bloodfrenzy: {
      display: "Blood Frenzy",
      marker: null,
      duration: "combat",
      mechanical: "Advantage on attack rolls and saving throws. Speed increases by 10 feet.",
      type: "effect",
      attackAdvantage: true,
      saveAdvantage: "all",
      attributeModifier: {
        attrName: "speed",
        amount: 10
      }
    },

steadyaim: {
      display: "Steady Aim",
      marker: null,
      duration: "endOfTurn",
      mechanical: "Advantage on your next attack roll this turn. Movement is locked at 0 until the end of the current turn.",
      type: "effect",
      triggers: {
        attack: "removeSelf"
      }
    },

    bear: {
      display: "Bear Rage",
      marker: "Icon_-_Bear_1-1_animal_icon_token::266352",
      duration: "combat",
      mechanical: "While Rage is active, you gain the endurance of the Bear and gain resistance to all damage except Force, Necrotic, Psychic, and Radiant damage.",
      type: "effect",
      sheetValue: "rageDamage",
      exclusiveGroup: "wildHeart"
    },

    wolf: {
      display: "Wolf Rage",
      marker: "Icon_-_Wolf_1-1_marker_icon_token::280084",
      duration: "combat",
      mechanical: "While Rage is active, allies benefit from your Wolf presence like a pack and have advantage on attack rolls against enemies within 5 feet of you.",
      type: "effect",
      sheetValue: "rageDamage",
      exclusiveGroup: "wildHeart"
    },

    eagle: {
      display: "Eagle Rage",
      marker: "Icon_-_Raven_1-1_marker_icon_token::279668",
      duration: "combat",
      mechanical: "While Rage is active, you gain the agility of the eagle and are currently under the effect of, and can use subsequent bonus actions to, dash and disengage at the same time.",
      type: "effect",
      sheetValue: "rageDamage",
      exclusiveGroup: "wildHeart"
    },

    sacred: {
      display: "Sacred Blade",
      marker: "Icon_-_Radiant_Damage_1-1_marker_icon_token::279644",
      duration: "combat",
      mechanical: "Add Charisma modifier to attack rolls with the empowered weapon, minimum +1.",
      type: "effect",
      sheetValue: "sacredAttack"
    },

    nature: {
      display: "Force of Nature",
      marker: "Icon_-_Tree_1-1_trees_icon_token::280219",
      duration: "combat",
      mechanical: "Once per turn add Strength modifier to damage of a weapon attack.",
      type: "effect"
    },

    faithshield: {
      display: "Shield of Faith",
      marker: "Icon_-_Shield_Banner_1-1_marker_icon_token::279878",
      duration: "combat",
      mechanical: "+2 AC to the spell target. Ends at combat end or when concentration ends.",
      type: "effect",
      concentration: true,
      attributeModifier: {
        attrName: "ac",
        amount: 2
      }
    },

    vengeblade: {
      display: "Vengeful Blade",
      marker: "Icon_=_Skull_2-1_marker_icon_token::279923",
      duration: "startOfNextTurn",
      mechanical: "If the target makes an attack or casts a spell before the start of your next turn, it takes 2d8 necrotic damage and the effect ends.",
      type: "effect",
      triggers: {
        attack: {
          announce: "Vengeful Blade Triggered",
          damage: "2d8",
          damageType: "Necrotic",
          applyDamageToBar: 1,
          removeSelf: true
        },
        spell: {
          announce: "Vengeful Blade Triggered",
          damage: "2d8",
          damageType: "Necrotic",
          applyDamageToBar: 1,
          removeSelf: true
        }
      }
    },

    lockmove: {
      display: "Movement Locked",
      marker: "Icon_-_Lock_1-1_dungeon_icon_token::279673",
      duration: "manual",
      mechanical: "Movement is locked at 0.",
      type: "effect"
    },

    extrabonus: {
      display: "Extra Bonus Action",
      marker: null,
      duration: "startOfNextTurn",
      mechanical: "Gain one additional Bonus Action.",
      type: "effect"
    },

    aid: {
      display: "Aid",
      marker: null,
      duration: "combat",
      mechanical: "Maximum hit points and current hit points increase by 5. When Aid ends, current HP is only reduced if it exceeds the new maximum.",
      type: "effect"
    },

fireshieldwarm: {
      display: "Fire Shield — Warm",
      marker: null,
      duration: "combat",
      mechanical: "Bright light 10 ft, dim light 10 ft. Resistance to Cold damage. Melee attackers within 5 ft take 2d8 Fire damage.",
      type: "effect",
      damageResistances: ["cold"]
    },

    fireshieldchill: {
      display: "Fire Shield — Chill",
      marker: null,
      duration: "combat",
      mechanical: "Bright light 10 ft, dim light 10 ft. Resistance to Fire damage. Melee attackers within 5 ft take 2d8 Cold damage.",
      type: "effect",
      damageResistances: ["fire"]
    },

largeform: {
      display: "Large Form",
      marker: null,
      duration: "manual",
      mechanical: "Size becomes Large. Advantage on Strength checks. Speed increases by 10 feet.",
      type: "effect",
      attributeModifier: {
        attrName: "speed",
        amount: 10
      },
      tokenSize: {
        width: 140,
        height: 140
      }
    }

  };
    const EXCLUSIVE_EFFECT_GROUPS = {
    wildHeart: ["bear", "wolf", "eagle"]
  };
  const DISARMED_ITEM_CHARACTER_NAME = "Disarmed Item";
  const DISARMED_ITEM_CATALOG = {
    longsword: { display: "Longsword", side: 1 },
    greatsword: { display: "Greatsword", side: 2 },
    dagger: { display: "Dagger", side: 3 },
    bow: { display: "Bow", side: 4 },
    crossbow: { display: "Crossbow", side: 5 },
    glaive: { display: "Glaive", side: 6 },
    warhammer: { display: "Warhammer", side: 7 },
    maul: { display: "Maul", side: 8 },
    spear: { display: "Spear", side: 9 },
    battleaxe: { display: "Battleaxe", side: 10 },
    greataxe: { display: "Greataxe", side: 11 },
    club: { display: "Club", side: 12 },
    staff: { display: "Staff", side: 13 },
    shield: { display: "Shield", side: 14 }
  };

  const CONDITIONS = {
    blinded: {
      display: "Blinded",
      marker: "Icon_-_Blinded_1-1_status_icon_token::266417",
      duration: "manual",
      mechanical: "Cannot see. Attack rolls against you have advantage.",
      type: "condition"
    },

    charmed: {
      display: "Charmed",
      marker: "Icon_-_Charm_1-1_marker_icon_token::266357",
      duration: "combat",
      mechanical: "Cannot attack the charmer.",
      type: "condition"
    },

    deafened: {
      display: "Deafened",
      marker: null,
      duration: "manual",
      mechanical: "Cannot hear.",
      type: "condition"
    },

    disarmed: {
      display: "Disarmed",
      marker: null,
      duration: "manual",
      mechanical: "One or more held items have been dropped. The item can be recovered from the creature's turn card.",
      type: "condition"
    },

    exhaustion: {
      display: "Exhaustion",
      marker: null,
      duration: "manual",
      mechanical: "2024 exhaustion rules scale by level.",
      type: "condition"
    },

    frightened: {
      display: "Frightened",
      marker: "Icon_-_Ghost_2-1_marker_icon_token::279701",
      duration: "combat",
      mechanical: "Disadvantage while source is visible.",
      type: "condition"
    },

    grappled: {
      display: "Grappled",
      marker: "Icon_-_Monk_1-1_marker_icon_token::279810",
      duration: "manual",
      mechanical: "Speed becomes 0.",
      type: "condition"
    },

    hidden: {
      display: "Hidden",
      marker: "Icon_-_Mysterious_Figure_1-1_surprise_icon_token::279859",
      duration: "manual",
      mechanical: "Attack rolls have advantage. Ends when the hidden creature makes an attack.",
      type: "condition",
      triggers: {
        attack: "removeSelf"
      }
    },

    incapacitated: {
      display: "Incapacitated",
      marker: "Icon_-_Sleep_1-1_marker_icon_token::279950",
      duration: "manual",
      mechanical: "Cannot take actions or reactions.",
      type: "condition"
    },

    invisible: {
      display: "Invisible",
      marker: "Icon_-_Invisibility_2-1_marker_icon_token::280003",
      duration: "manual",
      mechanical: "Cannot be seen.",
      type: "condition"
    },

    paralyzed: {
      display: "Paralyzed",
      marker: "Icon_-_Sleep_1-1_marker_icon_token::279950",
      duration: "manual",
      mechanical: "Incapacitated and unable to move.",
      type: "condition"
    },

    petrified: {
      display: "Petrified",
      marker: null,
      duration: "manual",
      mechanical: "Transformed into stone.",
      type: "condition"
    },

    poisoned: {
      display: "Poisoned",
      marker: "Icon_-_Poison_1-1_poisonous_icon_token::279996",
      duration: "manual",
      mechanical: "Disadvantage on attack rolls and ability checks.",
      type: "condition"
    },

    stinkingpoisoned: {
      display: "Stinking Cloud Poisoned",
      marker: "Icon_-_Poison_1-1_poisonous_icon_token::279996",
      duration: "endOfTurn",
      mechanical: "Poisoned by Stinking Cloud. Cannot take an action or a Bonus Action.",
      type: "condition"
    },

    prone: {
      display: "Prone",
      marker: "Icon_-_Prone_3-1_marker_icon_token::279617",
      duration: "movement",
      mechanical: "Standing costs half movement.",
      type: "condition"
    },

    restrained: {
      display: "Restrained",
      marker: "Icon_-_Restrained_1-1_prison_icon_token::279705",
      duration: "manual",
      mechanical: "Speed 0. Attack rolls against you have advantage.",
      type: "condition"
    },

    stunned: {
      display: "Stunned",
      marker: "Icon_-_Surprised_1-1_combat_icon_token::280117",
      duration: "manual",
      mechanical: "Incapacitated and unable to move.",
      type: "condition"
    },

    unconscious: {
      display: "Unconscious",
      marker: "Icon_-_Unconscious_1-1_marker_icon_token::280345",
      duration: "manual",
      mechanical: "Incapacitated and unaware.",
      type: "condition"
    }
  };

  if (!state.ActionEconomyV2) {
    state.ActionEconomyV2 = {
      pcCharacterIds: [],
      allyCharacterIds: [],
      economy: {},
      speeds: {},
      attackCounts: {},
      attacksRemaining: {},
      movement: {},
      ignoreNextMove: {},
      movementLocked: {},
      effects: {},
      conditions: {},
      disarmedItems: {},
      droppedItemTokens: {},
      disarmSequence: 0,
      sheetCache: {},
      mounts: {},
      attributeModifiers: {},
      abilityScoreModifiers: {},
      aidHp: {},
      conditionLevels: {},
      features: {},
      auras: {},
      economyLocks: {},
      saveAdvantages: {},
      ongoingDamage: {},
      summons: {},
      pendingSummons: {},
      aoeControls: {},
      aoeHazards: {},
      aoeHazardTurnHits: {},
      tokenSizes: {},
      visualLinks: {},
      pendingVisualLinks: {},
      directionalHazards: {},
      pendingDirectionalHazards: {},
      directionalHazardTurnHits: {},
      difficultTerrain: {},
      terrainImmunities: {},
      hazardImmunities: {},
      originalSpeeds: {},
      damageSources: {},
      lastActiveTokenId: null
    };
  }

  const S = state.ActionEconomyV2;

  if (!Array.isArray(S.pcCharacterIds)) {
    S.pcCharacterIds = [];
  }

  if (!Array.isArray(S.allyCharacterIds)) {
    S.allyCharacterIds = [];
  }

  S.pcCharacterIds = Array.from(new Set(S.pcCharacterIds));
  S.allyCharacterIds = Array.from(new Set(S.allyCharacterIds))
    .filter(characterId => !S.pcCharacterIds.includes(characterId));

  log("=== ActionEconomyV2 Ready ===");

  function ensure(objName) {
    if (!S[objName]) S[objName] = {};
  }

  [
    "economy",
    "speeds",
    "attackCounts",
    "attacksRemaining",
    "movement",
    "ignoreNextMove",
    "movementLocked",
    "effects",
    "conditions",
    "disarmedItems",
    "droppedItemTokens",
    "sheetCache",
    "mounts",
    "attributeModifiers",
    "abilityScoreModifiers",
    "aidHp",
    "conditionLevels",
    "features",
    "auras",
    "economyLocks",
    "saveAdvantages",
    "ongoingDamage",
    "summons",
    "pendingSummons",
    "aoeControls",
    "aoeHazards",
    "aoeHazardTurnHits",
    "tokenSizes",
    "visualLinks",
    "pendingVisualLinks",
    "directionalHazards",
    "pendingDirectionalHazards",
    "directionalHazardTurnHits",
    "difficultTerrain",
    "terrainImmunities",
    "hazardImmunities",
    "originalSpeeds",
    "damageSources"
  ].forEach(ensure);

  if (isNaN(parseInt(S.disarmSequence, 10))) {
    S.disarmSequence = 0;
  }

  Object.keys(S.sheetCache).forEach(characterId => {
    const cache = S.sheetCache[characterId];

    if (!cache) return;

    delete cache.isPC;
    delete cache.ae_attacks;
    delete cache.ae_features;
    delete cache.ae_auras;
  });

  function tokenName(token) {
    return token.get("name") || "Token";
  }

  function cleanAreaImmunityName(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/_/g, "")
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9]/g, "");
  }

  function displayAreaImmunityName(value) {
    return String(value || "")
      .replace(/_/g, " ")
      .trim();
  }

  function getAreaImmunityStore(areaType, token) {
    const rootStore = areaType === "hazard" ? S.hazardImmunities : S.terrainImmunities;

    if (!rootStore[token.id]) {
      rootStore[token.id] = {};
    }

    return rootStore[token.id];
  }

  function addAreaImmunity(areaType, token, areaName) {
    const cleanName = cleanAreaImmunityName(areaName);

    if (!cleanName) return;

    const store = getAreaImmunityStore(areaType, token);

    store[cleanName] = displayAreaImmunityName(areaName);
  }

  function removeAreaImmunity(areaType, token, areaName) {
    const cleanName = cleanAreaImmunityName(areaName);

    if (!cleanName) return;

    const store = getAreaImmunityStore(areaType, token);

    delete store[cleanName];
  }

  function clearAreaImmunities(areaType, token) {
    const rootStore = areaType === "hazard" ? S.hazardImmunities : S.terrainImmunities;

    delete rootStore[token.id];
  }

  function tokenHasAreaImmunity(areaType, token, areaName) {
  if (!token || !areaName) return false;

  const rootStore = areaType === "hazard" ? S.hazardImmunities : S.terrainImmunities;
  const store = rootStore[token.id] || {};
  const cleanName = cleanAreaImmunityName(areaName);

  if (areaType === "terrain" && store.all) return true;

  return !!store[cleanName];
}

  function areaImmunityListText(areaType, token) {
    const rootStore = areaType === "hazard" ? S.hazardImmunities : S.terrainImmunities;
    const store = rootStore[token.id] || {};
    const names = Object.keys(store).map(key => store[key]);

    return names.join(", ") || "None";
  }

  function applyAreaImmunityCommand(msg, areaType, args) {
    const command = args[1];
    const selected = getSelectedTokens(msg);
    const areaName = args.slice(2).join(" ");

    if (!selected.length) {
      sendChat(AE, "/w gm Select one or more tokens first.");
      return;
    }

    if (command === "immune") {
      selected.forEach(token => addAreaImmunity(areaType, token, areaName));
      sendChat(AE, "/w gm " + selected.length + " token(s) made immune to " + areaType + ": " + displayAreaImmunityName(areaName) + ".");
      return;
    }

    if (command === "unimmune") {
      selected.forEach(token => removeAreaImmunity(areaType, token, areaName));
      sendChat(AE, "/w gm " + selected.length + " token(s) no longer immune to " + areaType + ": " + displayAreaImmunityName(areaName) + ".");
      return;
    }

    if (command === "clearimmune") {
      selected.forEach(token => clearAreaImmunities(areaType, token));
      sendChat(AE, "/w gm " + selected.length + " token(s) cleared of " + areaType + " immunities.");
      return;
    }

    if (command === "immunelist") {
      selected.forEach(token => {
        sendChat(
          AE,
          "/w gm &{template:default} " +
          "{{name=" + (areaType === "hazard" ? "Hazard Immunities" : "Terrain Immunities") + "}} " +
          "{{Token=" + tokenName(token) + "}} " +
          "{{Immune To=" + areaImmunityListText(areaType, token) + "}}"
        );
      });

      return;
    }
  }

  function getCharacterKey(token) {
    return token.get("represents") || token.id;
  }

    function getCachedSheetValue(characterId, attrName) {
    if (!characterId) return null;
    if (!S.sheetCache[characterId]) return null;

    if (S.sheetCache[characterId][attrName] === undefined) {
      return null;
    }

    return S.sheetCache[characterId][attrName];
  }

  function setCachedSheetValue(characterId, attrName, value) {
    if (!characterId) return;

    if (!S.sheetCache[characterId]) {
      S.sheetCache[characterId] = {};
    }

    S.sheetCache[characterId][attrName] = value;
  }

  function refreshSheetValue(characterId, attrName) {
    if (!characterId) return;

    getSheetItem(characterId, attrName)
      .then(value => {
        setCachedSheetValue(characterId, attrName, value);
      })
      .catch(() => {
        setCachedSheetValue(characterId, attrName, null);
      });
  }

    function refreshSheetCache(token) {
    if (S.aoeControls && S.aoeControls[token.id]) return;

    const characterId = token.get("represents");
    if (!characterId) return;

    refreshSheetValue(characterId, "speed");
    refreshSheetValue(characterId, "ac");
    refreshSheetValue(characterId, "constitution_save_bonus");
    refreshSheetValue(characterId, "npc_resistances");
    refreshSheetValue(characterId, "npc_immunities");
    refreshSheetValue(characterId, "npc_vulnerabilities");
    refreshSheetValue(characterId, "npc_condition_immunities");
    refreshSheetValue(characterId, "npc_type");
    refreshSheetValue(characterId, "charisma_mod");
    refreshSheetValue(characterId, "charisma");

    initializePermanentFeatures(token);
  }

  function getAttrValue(characterId, attrName) {
    const cached = getCachedSheetValue(characterId, attrName);

    if (cached !== null) {
      return cached;
    }

    refreshSheetValue(characterId, attrName);
    return null;
  }

  function setUserSheetValue(characterId, key, value) {
    if (!characterId) return;

    if (typeof setSheetItem === "function") {
      setSheetItem(characterId, "user." + key, value);
    }
  }

  function setSheetValue(characterId, key, value) {
    if (!characterId) return;

    if (typeof setSheetItem === "function") {
      setSheetItem(characterId, key, value);
    }
  }

  function getModifierStore(token) {
    if (!S.attributeModifiers[token.id]) {
      S.attributeModifiers[token.id] = {};
    }

    return S.attributeModifiers[token.id];
  }

  async function applyAttributeModifier(token, effectName, attrName, amount) {
    const characterId = token.get("represents");
    if (!characterId) return;

    const store = getModifierStore(token);

    if (store[effectName]) return;

    let raw = getAttrValue(characterId, attrName);
    let current = parseInt(raw, 10);

    if (isNaN(current) && typeof getSheetItem === "function") {
      try {
        raw = await getSheetItem(characterId, attrName);
        current = parseInt(raw, 10);
        setCachedSheetValue(characterId, attrName, raw);
      } catch (error) {
        return;
      }
    }

    if (isNaN(current)) return;
    if (!hasEffect(token, effectName)) return;
    if (store[effectName]) return;

    store[effectName] = {
      attrName: attrName,
      amount: amount
    };

    setSheetValue(characterId, attrName, current + amount);
    setCachedSheetValue(characterId, attrName, current + amount);
  }

  function removeAttributeModifier(token, effectName) {
    const characterId = token.get("represents");
    if (!characterId) return;

    const store = getModifierStore(token);
    const mod = store[effectName];

    if (!mod) return;

    const raw = getAttrValue(characterId, mod.attrName);
    const current = parseInt(raw, 10);

    if (!isNaN(current)) {
      setSheetValue(characterId, mod.attrName, current - mod.amount);
      setCachedSheetValue(characterId, mod.attrName, current - mod.amount);
    }

    delete store[effectName];
  }

  const ABILITY_SCORE_ATTRIBUTES = {
    strength: "strength",
    dexterity: "dexterity",
    constitution: "constitution",
    intelligence: "intelligence",
    wisdom: "wisdom",
    charisma: "charisma"
  };

  function normalizeAbilityScoreName(value) {
    const key = String(value || "").toLowerCase();

    if (ABILITY_SCORE_ATTRIBUTES[key]) {
      return key;
    }

    return null;
  }

  function getAbilityScoreModifierStore(token) {
    if (!S.abilityScoreModifiers[token.id]) {
      S.abilityScoreModifiers[token.id] = {};
    }

    return S.abilityScoreModifiers[token.id];
  }

  function rollAbilityScoreAmount(value) {
    const text = String(value || "").trim();
    const flat = parseInt(text, 10);

    if (!isNaN(flat) && String(flat) === text) {
      return flat;
    }

    const match = text.match(/^(\d+)d(\d+)$/i);

    if (!match) return null;

    const count = parseInt(match[1], 10);
    const sides = parseInt(match[2], 10);
    let total = 0;

    if (isNaN(count) || isNaN(sides) || count <= 0 || sides <= 0) {
      return null;
    }

    for (let i = 0; i < count; i++) {
      total += randomInteger(sides);
    }

    return total;
  }

  function abilityScoreDisplayName(abilityName) {
    return abilityName.charAt(0).toUpperCase() + abilityName.slice(1);
  }

  function applyAbilityScoreChange(token, abilityName, amountInput, mode, label) {
    const abilityKey = normalizeAbilityScoreName(abilityName);

    if (!abilityKey) {
      sendChat(AE, "/w gm Invalid ability score. Use strength, dexterity, constitution, intelligence, wisdom, or charisma.");
      return;
    }

    const amount = rollAbilityScoreAmount(amountInput);

    if (amount === null || amount <= 0) {
      sendChat(AE, "/w gm Ability score amount must be a positive number or dice expression like 1d4.");
      return;
    }

    const characterId = token.get("represents");

    if (!characterId) {
      sendChat(AE, "/w gm " + tokenName(token) + " has no represented character.");
      return;
    }

    const attrName = ABILITY_SCORE_ATTRIBUTES[abilityKey];
    const raw = getAttrValue(characterId, attrName);
    const current = parseInt(raw, 10);

    if (isNaN(current)) {
      sendChat(AE, "/w gm Could not read " + abilityScoreDisplayName(abilityKey) + " for " + tokenName(token) + ".");
      return;
    }

    const delta = mode === "reduce" ? -amount : amount;
    const newValue = Math.max(0, current + delta);
    const store = getAbilityScoreModifierStore(token);

    store[abilityKey] = (store[abilityKey] || 0) + (newValue - current);

    setSheetValue(characterId, attrName, newValue);
    setCachedSheetValue(characterId, attrName, newValue);

    sendChat(
      AE,
      "&{template:default} " +
      "{{name=Ability Score Changed}} " +
      "{{Target=" + tokenName(token) + "}} " +
      "{{Ability=" + abilityScoreDisplayName(abilityKey) + "}} " +
      "{{Change=" + (newValue - current) + "}} " +
      "{{Score=" + current + " → " + newValue + "}} " +
      "{{Source=" + displayAreaImmunityName(label || "Manual") + "}}" +
      (newValue <= 0 ? " {{Result=Score reduced to 0.}}" : "")
    );
  }

  function restoreAbilityScoreChange(token, abilityName) {
    const abilityKey = normalizeAbilityScoreName(abilityName);

    if (!abilityKey) {
      sendChat(AE, "/w gm Invalid ability score. Use strength, dexterity, constitution, intelligence, wisdom, or charisma.");
      return;
    }

    const characterId = token.get("represents");

    if (!characterId) {
      sendChat(AE, "/w gm " + tokenName(token) + " has no represented character.");
      return;
    }

    const store = getAbilityScoreModifierStore(token);
    const delta = store[abilityKey] || 0;

    if (!delta) {
      sendChat(AE, "/w gm No stored " + abilityScoreDisplayName(abilityKey) + " change for " + tokenName(token) + ".");
      return;
    }

    const attrName = ABILITY_SCORE_ATTRIBUTES[abilityKey];
    const raw = getAttrValue(characterId, attrName);
    const current = parseInt(raw, 10);

    if (isNaN(current)) {
      sendChat(AE, "/w gm Could not read " + abilityScoreDisplayName(abilityKey) + " for " + tokenName(token) + ".");
      return;
    }

    const restored = current - delta;

    setSheetValue(characterId, attrName, restored);
    setCachedSheetValue(characterId, attrName, restored);

    delete store[abilityKey];

    sendChat(
      AE,
      "&{template:default} " +
      "{{name=Ability Score Restored}} " +
      "{{Target=" + tokenName(token) + "}} " +
      "{{Ability=" + abilityScoreDisplayName(abilityKey) + "}} " +
      "{{Score=" + current + " → " + restored + "}}"
    );
  }

  function restoreAllAbilityScoreChanges(token) {
    const store = getAbilityScoreModifierStore(token);
    const abilityKeys = Object.keys(store);

    if (!abilityKeys.length) {
      sendChat(AE, "/w gm No stored ability score changes for " + tokenName(token) + ".");
      return;
    }

    abilityKeys.forEach(abilityKey => restoreAbilityScoreChange(token, abilityKey));
  }

  function abilityScoreChangeStatus(token) {
    const store = getAbilityScoreModifierStore(token);
    const rows = Object.keys(store).map(abilityKey =>
      abilityScoreDisplayName(abilityKey) + ": " + store[abilityKey]
    );

    sendChat(
      AE,
      "/w gm &{template:default} " +
      "{{name=Ability Score Changes}} " +
      "{{Target=" + tokenName(token) + "}} " +
      "{{Stored=" + (rows.join("<br>") || "None") + "}}"
    );
  }

  function handleAbilityScoreCommand(args) {
    const action = args[1];
    const token = getObj("graphic", args[2]);

    if (!token || token.get("subtype") !== "token") {
      sendChat(AE, "/w gm Format: !ae-ability reduce TOKEN_ID strength 1d4 Label | !ae-ability restore TOKEN_ID strength | !ae-ability restoreall TOKEN_ID | !ae-ability status TOKEN_ID");
      return;
    }

    if (action === "reduce" || action === "increase") {
      applyAbilityScoreChange(token, args[3], args[4], action, args.slice(5).join(" "));
      return;
    }

    if (action === "restore") {
      restoreAbilityScoreChange(token, args[3]);
      return;
    }

    if (action === "restoreall") {
      restoreAllAbilityScoreChanges(token);
      return;
    }

    if (action === "status") {
      abilityScoreChangeStatus(token);
      return;
    }

    sendChat(AE, "/w gm Format: !ae-ability reduce TOKEN_ID strength 1d4 Label | !ae-ability restore TOKEN_ID strength | !ae-ability restoreall TOKEN_ID | !ae-ability status TOKEN_ID");
  }

  function getAidStore(token) {
    if (!S.aidHp[token.id]) {
      S.aidHp[token.id] = {};
    }

    return S.aidHp[token.id];
  }

  function applyAidHp(token, amount) {
    const characterId = token.get("represents");
    if (!characterId) return;

    const store = getAidStore(token);

    if (store.aid) return;

    const currentHp = parseInt(token.get("bar1_value"), 10);
    const maxHp = parseInt(token.get("bar1_max"), 10);

    if (isNaN(currentHp) || isNaN(maxHp)) return;

    store.aid = {
      amount: amount,
      originalMaxHp: maxHp
    };

    const newCurrentHp = currentHp + amount;
    const newMaxHp = maxHp + amount;

    setSheetItem(characterId, "hp", newCurrentHp);
    setSheetItem(characterId, "hp", newMaxHp, "max");

    token.set("bar1_value", newCurrentHp);
    token.set("bar1_max", newMaxHp);
  }

  function removeAidHp(token) {
    const characterId = token.get("represents");
    if (!characterId) return;

    const store = getAidStore(token);
    const aid = store.aid;

    if (!aid) return;

    const currentHp = parseInt(token.get("bar1_value"), 10);
    const newMaxHp = aid.originalMaxHp;
    const newCurrentHp =
      !isNaN(currentHp) && currentHp > newMaxHp ?
      newMaxHp :
      currentHp;

    setSheetItem(characterId, "hp", newMaxHp, "max");

    if (!isNaN(newCurrentHp)) {
      setSheetItem(characterId, "hp", newCurrentHp);
      token.set("bar1_value", newCurrentHp);
    }

    token.set("bar1_max", newMaxHp);

    delete store.aid;
  }

    function getCharacterLevel(characterId) {
    const raw = getAttrValue(characterId, "base_level");
    const value = parseInt(raw, 10);

    if (!isNaN(value) && value > 0) {
      return value;
    }

    return 1;
  }

  function getRageBonus(characterId) {
    const level = characterId ? getCharacterLevel(characterId) : 1;

    if (level >= 16) return 4;
    if (level >= 9) return 3;
    return 2;
  }

  function getConcentrationSaveBonus(characterId) {
    const raw = getAttrValue(characterId, "constitution_save_bonus");
    const value = parseInt(raw, 10);

    if (!isNaN(value)) {
      return value;
    }

    return 0;
  }

  const TURN_CARD_PROFILES = {
    warlock: {
      names: ["valerius"],
      fields: ["actions", "cantrips", "leveledspells", "bonus"]
    },

    paladin: {
      names: ["darksoles"],
      fields: ["actions", "attacks", "spells", "bonus", "bonusspells"]
    },

    barbarian: {
      names: ["huge-o"],
      fields: ["actions", "attacks", "bonus"]
    },

    rogue: {
      names: ["deepak"],
      fields: ["actions", "attacks", "bonus"]
    }
  };

  const FEATURES = {
    eldritchmind: {
      display: "Eldritch Mind",
      modifiers: [
        {
          type: "saveAdvantage",
          save: "concentration"
        }
      ]
    },

    darkonesblessing: {
      display: "Dark One’s Blessing",
      modifiers: [
        {
          type: "deathTrigger"
        }
      ]
    },

    dangersense: {
      display: "Danger Sense",
      modifiers: [
        {
          type: "saveAdvantage",
          save: "dex"
        }
      ]
    },

    evasion: {
      display: "Evasion",
      modifiers: [
        {
          type: "saveDamage",
          save: "dex",
          successMode: "half",
          failureMultiplier: 0.5,
          successMultiplier: 0
        }
      ]
    },

    psychicdefenses: {
      display: "Psychic Defenses",
      modifiers: [
        {
          type: "saveAdvantage",
          conditions: ["charmed", "frightened"]
        }
      ]
    },

    rage: {
      display: "Rage",
      modifiers: [
        {
          type: "saveAdvantage",
          save: "str"
        }
      ]
    }
  };

  const CHARACTER_SETUP_FEATURE_KEYS = [
    "eldritchmind",
    "darkonesblessing",
    "dangersense",
    "evasion",
    "psychicdefenses"
  ];

  const AURAS = {
    protection: {
      display: "Aura of Protection"
    }
  };

  const CHARACTER_SETUP_AURA_KEYS = [
    "protection"
  ];

  function normalizeSaveKey(saveKey) {
    if (!saveKey) return null;

    const key = String(saveKey).toLowerCase();

    if (["str", "dex", "con", "int", "wis", "cha", "all", "concentration"].includes(key)) {
      return key;
    }

    return null;
  }

  function getFeatureStore(characterId) {
    if (!characterId) return null;

    if (!S.features[characterId]) {
      S.features[characterId] = {};
    }

    return S.features[characterId];
  }

  function addFeature(token, featureKey) {
    const characterId = token.get("represents");
    const cleanKey = String(featureKey || "").toLowerCase();

    if (!characterId) return false;
    if (!FEATURES[cleanKey]) return false;

    getFeatureStore(characterId)[cleanKey] = true;
    return true;
  }

  function removeFeature(token, featureKey) {
    const characterId = token.get("represents");
    const cleanKey = String(featureKey || "").toLowerCase();

    if (!characterId || !cleanKey) return false;

    const store = S.features[characterId];

    if (!store) return true;

    delete store[cleanKey];

    if (!Object.keys(store).length) {
      delete S.features[characterId];
    }

    return true;
  }

  function hasFeature(token, featureKey) {
    const characterId = token.get("represents");
    const cleanKey = String(featureKey || "").toLowerCase();

    if (!characterId || !cleanKey) return false;

    const store = S.features[characterId] || {};

    return !!store[cleanKey];
  }

  function getSaveDamageResult(token, saveKey, failed, successMode, damageTotal) {
    const cleanSaveKey = normalizeSaveKey(saveKey);
    const cleanSuccessMode = String(successMode || "").toLowerCase();
    const total = Math.max(0, parseInt(damageTotal, 10) || 0);
    let amount = failed
      ? total
      : cleanSuccessMode === "half"
        ? Math.floor(total / 2)
        : 0;
    let note = "None";

    if (!token || !cleanSaveKey) {
      return {
        amount: amount,
        note: note
      };
    }

    const characterId = token.get("represents");
    const store = characterId ? S.features[characterId] || {} : {};

    Object.keys(store).some(featureKey => {
      const feature = FEATURES[featureKey];

      if (!feature || !Array.isArray(feature.modifiers)) return false;

      const modifier = feature.modifiers.find(mod =>
        mod.type === "saveDamage" &&
        mod.save === cleanSaveKey &&
        mod.successMode === cleanSuccessMode
      );

      if (!modifier) return false;

      const multiplier = failed
        ? modifier.failureMultiplier
        : modifier.successMultiplier;

      amount = Math.floor(total * multiplier);
      note = feature.display;
      return true;
    });

    return {
      amount: amount,
      note: note
    };
  }

  function featureProvidesSaveAdvantage(token, saveKey, conditionKey) {
    const characterId = token.get("represents");
    const cleanConditionKey = conditionKey ? String(conditionKey).toLowerCase() : null;

    if (!characterId) return false;

    const store = S.features[characterId] || {};

    return Object.keys(store).some(featureKey => {
      const feature = FEATURES[featureKey];

      if (!feature) return false;

      return feature.modifiers.some(mod =>
        mod.type === "saveAdvantage" &&
        (
          mod.save === saveKey ||
          (
            mod.save === "concentration" &&
            saveKey === "con" &&
            conditionKey === "concentration"
          ) ||
          (
            cleanConditionKey &&
            Array.isArray(mod.conditions) &&
            mod.conditions.includes(cleanConditionKey)
          )
        )
      );
    });
  }

  function getSaveAdvantageStore(characterId) {
    if (!characterId) return null;

    if (!S.saveAdvantages[characterId]) {
      S.saveAdvantages[characterId] = {};
    }

    return S.saveAdvantages[characterId];
  }

  function normalizeSaveAdvantageKey(key) {
    if (!key) return null;

    const cleanKey = String(key).toLowerCase();

    if (normalizeSaveKey(cleanKey)) {
      return cleanKey;
    }

    if (CONDITIONS[cleanKey]) {
      return cleanKey;
    }

    return null;
  }

  function setPersistentSaveAdvantage(token, key, enabled) {
    const characterId = token.get("represents");
    const cleanKey = normalizeSaveAdvantageKey(key);

    if (!characterId || !cleanKey) return false;

    const store = getSaveAdvantageStore(characterId);

    if (enabled) {
      store[cleanKey] = true;
    } else {
      delete store[cleanKey];
    }

    return true;
  }

  function hasPersistentSaveAdvantage(token, saveKey, conditionKey) {
    const characterId = token.get("represents");

    if (!characterId) return false;

    const store = getSaveAdvantageStore(characterId);
    const cleanSaveKey = normalizeSaveKey(saveKey);
    const cleanConditionKey = conditionKey ? String(conditionKey).toLowerCase() : null;

    if (store.all) return true;
    if (cleanSaveKey && store[cleanSaveKey]) return true;
    if (cleanConditionKey && store[cleanConditionKey]) return true;

    return false;
  }

  function effectProvidesSaveAdvantage(token, saveKey) {
    const cleanSaveKey = normalizeSaveKey(saveKey);

    if (!token || !cleanSaveKey) return false;

    const store = getEffectStore(token);

    return Object.keys(store).some(effectName => {
      const effect = EFFECTS[effectName];

      if (!effect || !effect.saveAdvantage) return false;
      if (effect.saveAdvantage === "all") return true;

      if (Array.isArray(effect.saveAdvantage)) {
        return effect.saveAdvantage.includes(cleanSaveKey);
      }

      return effect.saveAdvantage === cleanSaveKey;
    });
  }

  function getSaveRollMode(token, saveKey, conditionKey) {
    const cleanSaveKey = normalizeSaveKey(saveKey);

    if (!cleanSaveKey) {
      return "normal";
    }

    const advantage =
      featureProvidesSaveAdvantage(token, cleanSaveKey, conditionKey) ||
      hasPersistentSaveAdvantage(token, cleanSaveKey, conditionKey) ||
      effectProvidesSaveAdvantage(token, cleanSaveKey);

    if (advantage) {
      return "advantage";
    }

    return "normal";
  }

  function normalizeConditionImmunityName(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z]/g, "");
  }

  function hasConditionImmunity(token, conditionName) {
    const characterId = token.get("represents");

    if (!characterId || !conditionName) return false;

    const rawValue = getCachedSheetValue(characterId, "npc_condition_immunities");

    if (rawValue === null) {
      refreshSheetValue(characterId, "npc_condition_immunities");
      return false;
    }

    const cleanCondition = normalizeConditionImmunityName(conditionName);
    const cleanText = normalizeConditionImmunityName(rawValue);

    return cleanText.indexOf(cleanCondition) !== -1;
  }

  function rollD20WithMode(mode) {
    const first = randomInteger(20);

    if (mode === "advantage") {
      const second = randomInteger(20);

      return {
        total: Math.max(first, second),
        label: first + " / " + second + "kh1"
      };
    }

    if (mode === "disadvantage") {
      const second = randomInteger(20);

      return {
        total: Math.min(first, second),
        label: first + " / " + second + "kl1"
      };
    }

    return {
      total: first,
      label: String(first)
    };
  }

  if (typeof ActionEconomyV2API === "undefined") {
    ActionEconomyV2API = {};
  }

  const DAMAGE_TYPES = {
    acid: "Acid",
    bludgeoning: "Bludgeoning",
    cold: "Cold",
    fire: "Fire",
    force: "Force",
    lightning: "Lightning",
    necrotic: "Necrotic",
    piercing: "Piercing",
    poison: "Poison",
    psychic: "Psychic",
    radiant: "Radiant",
    slashing: "Slashing",
    thunder: "Thunder"
  };

  function normalizeDamageType(damageType) {
    if (!damageType) return null;

    const key = String(damageType).toLowerCase().replace(/\s+/g, "");

    return DAMAGE_TYPES[key] ? key : null;
  }

  function parseDamageTraitList(rawValue) {
    if (!rawValue) return [];

    const text = String(rawValue).toLowerCase();
    const traits = [];

    Object.keys(DAMAGE_TYPES).forEach(type => {
      if (text.indexOf(type) !== -1) {
        traits.push(type);
      }
    });

    return uniqueDamageTypes(traits);
  }

  function isPhysicalDamageType(type) {
    return type === "bludgeoning" || type === "piercing" || type === "slashing";
  }

  function isNonmagicalPhysicalResistance(rawValue, type) {
    if (!rawValue || !isPhysicalDamageType(type)) return false;

    const text = String(rawValue).toLowerCase();

    return text.indexOf(type) !== -1;
  }

  const BASE_RAGE_RESISTANCES = [
    "bludgeoning",
    "piercing",
    "slashing"
  ];

  const BEAR_RAGE_RESISTANCES = [
    "acid",
    "bludgeoning",
    "cold",
    "fire",
    "lightning",
    "piercing",
    "poison",
    "slashing",
    "thunder"
  ];

  function getRageResistanceList(token) {
    if (hasEffect(token, "bear")) {
      return BEAR_RAGE_RESISTANCES;
    }

    if (hasEffect(token, "wolf") || hasEffect(token, "eagle")) {
      return BASE_RAGE_RESISTANCES;
    }

    return [];
  }

  function getEffectResistanceList(token) {
    const resistances = [];

    Object.keys(getEffectStore(token)).forEach(effectName => {
      const effect = EFFECTS[effectName];

      if (!effect || !effect.damageResistances) return;

      effect.damageResistances.forEach(type => {
        resistances.push(type);
      });
    });

    return uniqueDamageTypes(resistances);
  }

  function uniqueDamageTypes(types) {
    return types.filter((type, index) => types.indexOf(type) === index);
  }

  async function getRawDamageTraitValue(token, attrName) {
    const characterId = token.get("represents");

    if (!characterId) return "";

    const cached = getCachedSheetValue(characterId, attrName);

    if (cached !== null) {
      return cached || "";
    }

    if (typeof getSheetItem !== "function") {
      return "";
    }

    try {
      const rawValue = await getSheetItem(characterId, attrName);
      setCachedSheetValue(characterId, attrName, rawValue);
      return rawValue || "";
    } catch (e) {
      return "";
    }
  }

  async function getDamageTraitList(token, attrName) {
    return parseDamageTraitList(await getRawDamageTraitValue(token, attrName));
  }

  async function modifyDamageForTraits(token, damageType, amount, tags) {
    const cleanType = normalizeDamageType(damageType);
    const baseAmount = parseInt(amount, 10);

    if (!cleanType || isNaN(baseAmount)) {
      return {
        amount: amount,
        note: "No valid damage type."
      };
    }

    const damageTags = tags || {};
    const rawResistances = await getRawDamageTraitValue(token, "npc_resistances");
    const rawImmunities = await getRawDamageTraitValue(token, "npc_immunities");
    const rawVulnerabilities = await getRawDamageTraitValue(token, "npc_vulnerabilities");

    const immunities = parseDamageTraitList(rawImmunities);
    const resistances = uniqueDamageTypes(
      parseDamageTraitList(rawResistances)
        .concat(getRageResistanceList(token))
        .concat(getEffectResistanceList(token))
    );
    const vulnerabilities = parseDamageTraitList(rawVulnerabilities);

    if (immunities.includes(cleanType)) {
      return {
        amount: 0,
        note: DAMAGE_TYPES[cleanType] + " Immunity"
      };
    }

    let multiplier = 1;
    const notes = [];

    if (resistances.includes(cleanType)) {
      if (
        damageTags.adept &&
        String(damageTags.adept).toLowerCase() === cleanType
      ) {
        notes.push(DAMAGE_TYPES[cleanType] + " Resistance bypassed by Elemental Adept");
      } else if (
        damageTags.magical &&
        isNonmagicalPhysicalResistance(rawResistances, cleanType)
      ) {
        notes.push(DAMAGE_TYPES[cleanType] + " Resistance bypassed by magical damage");
      } else {
        multiplier *= 0.5;
        notes.push(DAMAGE_TYPES[cleanType] + " Resistance");
      }
    }

    if (vulnerabilities.includes(cleanType)) {
      multiplier *= 2;
      notes.push(DAMAGE_TYPES[cleanType] + " Vulnerability");
    }

    return {
      amount: Math.floor(baseAmount * multiplier),
      note: notes.length ? notes.join(", ") : "None"
    };
  }

  function parseCreatureTypeList(rawValue) {
    if (!rawValue) return [];

    return String(rawValue)
      .toLowerCase()
      .split(/[,;/\s]+/)
      .map(type => type.trim())
      .filter(Boolean);
  }

  function getCreatureTypes(token) {
    const characterId = token.get("represents");

    if (!characterId) return [];

    const rawValue = getCachedSheetValue(characterId, "npc_type");

    if (rawValue === null) {
      refreshSheetValue(characterId, "npc_type");
      return [];
    }

    return parseCreatureTypeList(rawValue);
  }

  function hasCreatureType(token, creatureType) {
    if (!token || !creatureType) return false;

    return getCreatureTypes(token).includes(String(creatureType).toLowerCase());
  }

  function findTokensByCreatureType(sourceToken, creatureType, radiusFeet) {
    if (!sourceToken || !creatureType) return [];

    const radius = parseFloat(radiusFeet);

    if (isNaN(radius) || radius < 0) return [];

    const pageId = sourceToken.get("_pageid");
    const tokens = findObjs({
      type: "graphic",
      subtype: "token",
      pageid: pageId
    });

    return tokens.filter(token => {
      if (token.id === sourceToken.id) return false;
      if (!hasCreatureType(token, creatureType)) return false;

      const distance = tokenDistanceFeet(sourceToken, token);

      return distance !== null && distance <= radius;
    });
  }

  function creatureTypesText(token) {
    const types = getCreatureTypes(token);

    if (!types.length) return "None";

    return types.join(", ");
  }

  function damageTraitsText(token) {
    const characterId = token.get("represents");

    if (!characterId) return "None";

    const resistances = uniqueDamageTypes(
      parseDamageTraitList(getCachedSheetValue(characterId, "npc_resistances")).concat(getRageResistanceList(token))
    ).map(type => DAMAGE_TYPES[type]);
    const immunities = parseDamageTraitList(getCachedSheetValue(characterId, "npc_immunities"))
      .map(type => DAMAGE_TYPES[type]);
    const vulnerabilities = parseDamageTraitList(getCachedSheetValue(characterId, "npc_vulnerabilities"))
      .map(type => DAMAGE_TYPES[type]);

    const lines = [];

    if (resistances.length) lines.push("Resist: " + resistances.join(", "));
    if (immunities.length) lines.push("Immune: " + immunities.join(", "));
    if (vulnerabilities.length) lines.push("Vulnerable: " + vulnerabilities.join(", "));

    return lines.length ? lines.join("<br>") : "None";
  }

  ActionEconomyV2API.getSaveRollMode = function(token, saveKey, conditionKey) {
    return getSaveRollMode(token, saveKey, conditionKey);
  };

  ActionEconomyV2API.getSaveDamageResult = function(token, saveKey, failed, successMode, damageTotal) {
    return getSaveDamageResult(token, saveKey, failed, successMode, damageTotal);
  };

  ActionEconomyV2API.getCreatureTypes = function(token) {
    return getCreatureTypes(token);
  };

  ActionEconomyV2API.hasCreatureType = function(token, creatureType) {
    return hasCreatureType(token, creatureType);
  };

  ActionEconomyV2API.findTokensByCreatureType = function(sourceToken, creatureType, radiusFeet) {
    return findTokensByCreatureType(sourceToken, creatureType, radiusFeet);
  };

  ActionEconomyV2API.forceMove = function(sourceTokenId, targetTokenId, direction, feet) {
    return forceMoveToken(sourceTokenId, targetTokenId, direction, feet);
  };

  function normalizeAuraKey(auraKey) {
    return String(auraKey || "")
      .toLowerCase()
      .replace(/_/g, "")
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9]/g, "");
  }

  function getAuraStore(characterId) {
    if (!characterId) return null;

    if (!S.auras[characterId]) {
      S.auras[characterId] = {};
    }

    return S.auras[characterId];
  }

  function addAura(token, auraKey) {
    const characterId = token.get("represents");
    const cleanKey = normalizeAuraKey(auraKey);

    if (!characterId || !cleanKey) return false;

    getAuraStore(characterId)[cleanKey] = true;
    return true;
  }

  function removeAura(token, auraKey) {
    const characterId = token.get("represents");
    const cleanKey = normalizeAuraKey(auraKey);

    if (!characterId || !cleanKey) return false;

    const store = S.auras[characterId];

    if (!store) return true;

    delete store[cleanKey];

    if (!Object.keys(store).length) {
      delete S.auras[characterId];
    }

    return true;
  }

  function tokenDistanceFeet(tokenA, tokenB) {
    if (!tokenA || !tokenB) return null;
    if (tokenA.get("_pageid") !== tokenB.get("_pageid")) return null;

    const dx = tokenA.get("left") - tokenB.get("left");
    const dy = tokenA.get("top") - tokenB.get("top");
    const pixels = Math.sqrt(dx * dx + dy * dy);
    const units = pixels / 70;

    return units * getPageScale(tokenA);
  }

  function hasAura(token, auraKey) {
    const characterId = token.get("represents");
    const cleanKey = normalizeAuraKey(auraKey);

    if (!characterId || !cleanKey) return false;

    const store = S.auras[characterId] || {};

    return !!store[cleanKey];
  }

  function getCharacterSetupToken(msg, tokenId) {
    if (tokenId) {
      const token = getObj("graphic", tokenId);

      if (token && token.get("subtype") === "token") {
        return token;
      }

      return null;
    }

    const selected = getSelectedTokens(msg);
    return selected.length ? selected[0] : null;
  }

  function requireCharacterSetupToken(msg, tokenId) {
    const token = getCharacterSetupToken(msg, tokenId);

    if (!token) {
      sendChat(AE, "/w gm AE Character Setup: Select a token that represents a character.");
      return null;
    }

    if (!token.get("represents")) {
      sendChat(AE, "/w gm AE Character Setup: " + tokenName(token) + " does not represent a character.");
      return null;
    }

    return token;
  }

  function getCharacterSetupFeatureList(characterId) {
    const store = S.features[characterId] || {};

    return CHARACTER_SETUP_FEATURE_KEYS
      .filter(featureKey => !!store[featureKey])
      .map(featureKey => FEATURES[featureKey].display);
  }

  function getCharacterSetupAuraList(characterId) {
    const store = S.auras[characterId] || {};

    return Object.keys(store)
      .filter(auraKey => !!store[auraKey])
      .map(auraKey => AURAS[auraKey] ? AURAS[auraKey].display : auraKey);
  }

  function isAllyCharacterId(characterId) {
    return !!characterId && S.allyCharacterIds.includes(characterId);
  }

  function getCharacterClassification(characterId) {
    if (S.pcCharacterIds.includes(characterId)) return "PC";
    if (isAllyCharacterId(characterId)) return "Ally";
    return "Unregistered";
  }

  function characterSetupMenuTemplate(token) {
    const characterId = token.get("represents");
    const classification = getCharacterClassification(characterId);
    const attackCount = S.attackCounts[characterId] || 1;
    const features = getCharacterSetupFeatureList(characterId);
    const auras = getCharacterSetupAuraList(characterId);

    return (
      "&{template:default} " +
      "{{name=AE Character Setup}} " +
      "{{Character=" + tokenName(token) + "}} " +
      "{{Character Type=Current: " + classification +
        "<br>[PC](!ae setup type " + token.id + " pc) " +
        "[Ally](!ae setup type " + token.id + " ally) " +
        "[Unregistered](!ae setup type " + token.id + " none)}} " +
      "{{Attacks per Attack Action=Current: " + attackCount +
        "<br>[1](!ae setup attacks " + token.id + " 1) " +
        "[2](!ae setup attacks " + token.id + " 2) " +
        "[3](!ae setup attacks " + token.id + " 3) " +
        "[4](!ae setup attacks " + token.id + " 4) " +
        "[Custom](!ae setup attacks " + token.id + " ?{Number of Attacks|1})}} " +
      "{{Permanent Features=" + (features.length ? features.join(", ") : "None") +
        "<br>[Manage Features](!ae setup features " + token.id + ")}} " +
      "{{Permanent Auras=" + (auras.length ? auras.join(", ") : "None") +
        "<br>[Manage Auras](!ae setup auras " + token.id + ")}} " +
      "{{Options=[Refresh](!ae setup " + token.id + ") " +
        "[Clear Character Setup](!ae setup clear " + token.id + " ?{Clear all permanent AE setup for " + tokenName(token) + "?|No,no|Yes,yes})}} " +
      "{{Registry=[Review All Registrations](!ae registry)}} " +
      "{{Back=[Admin Hub](!ae admin)}}"
    );
  }

  function characterSetupFeaturesMenuTemplate(token) {
    const characterId = token.get("represents");
    const store = S.features[characterId] || {};
    let template =
      "&{template:default} " +
      "{{name=AE Permanent Features}} " +
      "{{Character=" + tokenName(token) + "}} ";

    CHARACTER_SETUP_FEATURE_KEYS.forEach(featureKey => {
      const feature = FEATURES[featureKey];
      const active = !!store[featureKey];
      const action = active ? "remove" : "add";
      const label = active ? "Remove" : "Add";

      template +=
        "{{" + feature.display + "=Current: " + (active ? "Registered" : "Not Registered") +
        "<br>[" + label + "](!ae setup feature " + token.id + " " + featureKey + " " + action + ")}} ";
    });

    template += "{{Back=[Character Setup](!ae setup " + token.id + ")}}";
    return template;
  }

  function characterSetupAurasMenuTemplate(token) {
    const characterId = token.get("represents");
    const store = S.auras[characterId] || {};
    let template =
      "&{template:default} " +
      "{{name=AE Permanent Auras}} " +
      "{{Character=" + tokenName(token) + "}} ";

    CHARACTER_SETUP_AURA_KEYS.forEach(auraKey => {
      const aura = AURAS[auraKey];
      const active = !!store[auraKey];
      const action = active ? "remove" : "add";
      const label = active ? "Remove" : "Add";

      template +=
        "{{" + aura.display + "=Current: " + (active ? "Registered" : "Not Registered") +
        "<br>[" + label + "](!ae setup aura " + token.id + " " + auraKey + " " + action + ")}} ";
    });

    template += "{{Back=[Character Setup](!ae setup " + token.id + ")}}";
    return template;
  }

  function setCharacterClassification(token, classification) {
    const characterId = token.get("represents");

    if (!characterId) return false;

    S.pcCharacterIds = S.pcCharacterIds.filter(id => id !== characterId);
    S.allyCharacterIds = S.allyCharacterIds.filter(id => id !== characterId);

    if (classification === "pc") {
      S.pcCharacterIds.push(characterId);
      return true;
    }

    if (classification === "ally") {
      S.allyCharacterIds.push(characterId);
      return true;
    }

    return classification === "none";
  }

  function setCharacterSetupPcRegistration(token, shouldRegister) {
    return setCharacterClassification(token, shouldRegister ? "pc" : "none");
  }

  function clearCharacterSetup(token) {
    const characterId = token.get("represents");

    if (!characterId) return;

    S.pcCharacterIds = S.pcCharacterIds.filter(id => id !== characterId);
    S.allyCharacterIds = S.allyCharacterIds.filter(id => id !== characterId);
    delete S.attackCounts[characterId];

    const featureStore = S.features[characterId];

    if (featureStore) {
      CHARACTER_SETUP_FEATURE_KEYS.forEach(featureKey => {
        delete featureStore[featureKey];
      });

      if (!Object.keys(featureStore).length) {
        delete S.features[characterId];
      }
    }

    delete S.auras[characterId];
  }

  function showCharacterSetupMenu(token) {
    sendChat(AE, "/w gm " + characterSetupMenuTemplate(token));
  }

  function handleCharacterSetupCommand(msg, args) {
    if (!playerIsGM(msg.playerid)) return;

    const subcommand = String(args[2] || "menu").toLowerCase();
    const directToken = args[2] ? getObj("graphic", args[2]) : null;

    if (subcommand === "menu" || directToken) {
      const token = requireCharacterSetupToken(msg, directToken ? args[2] : args[3]);
      if (!token) return;

      showCharacterSetupMenu(token);
      return;
    }

    if (subcommand === "features") {
      const token = requireCharacterSetupToken(msg, args[3]);
      if (!token) return;

      sendChat(AE, "/w gm " + characterSetupFeaturesMenuTemplate(token));
      return;
    }

    if (subcommand === "auras") {
      const token = requireCharacterSetupToken(msg, args[3]);
      if (!token) return;

      sendChat(AE, "/w gm " + characterSetupAurasMenuTemplate(token));
      return;
    }

    if (subcommand === "type") {
      const token = requireCharacterSetupToken(msg, args[3]);
      const classification = String(args[4] || "").toLowerCase();

      if (!token) return;

      if (!["pc", "ally", "none"].includes(classification)) {
        sendChat(AE, "/w gm AE Character Setup: Character type must be pc, ally, or none.");
        return;
      }

      setCharacterClassification(token, classification);
      showCharacterSetupMenu(token);
      return;
    }

    if (subcommand === "pc") {
      const token = requireCharacterSetupToken(msg, args[3]);
      const action = String(args[4] || "").toLowerCase();

      if (!token) return;

      if (action !== "add" && action !== "remove") {
        sendChat(AE, "/w gm AE Character Setup: Invalid PC registration action.");
        return;
      }

      setCharacterSetupPcRegistration(token, action === "add");
      showCharacterSetupMenu(token);
      return;
    }

    if (subcommand === "attacks") {
      const token = requireCharacterSetupToken(msg, args[3]);
      const count = parseInt(args[4], 10);

      if (!token) return;

      if (isNaN(count) || count < 1) {
        sendChat(AE, "/w gm AE Character Setup: Attack count must be at least 1.");
        return;
      }

      setAttackCount(token, count);
      showCharacterSetupMenu(token);
      return;
    }

    if (subcommand === "feature") {
      const token = requireCharacterSetupToken(msg, args[3]);
      const featureKey = String(args[4] || "").toLowerCase();
      const action = String(args[5] || "").toLowerCase();

      if (!token) return;

      if (!CHARACTER_SETUP_FEATURE_KEYS.includes(featureKey)) {
        sendChat(AE, "/w gm AE Character Setup: Invalid permanent feature key.");
        return;
      }

      if (action !== "add" && action !== "remove") {
        sendChat(AE, "/w gm AE Character Setup: Invalid feature action.");
        return;
      }

      if (action === "add") {
        addFeature(token, featureKey);
      } else {
        removeFeature(token, featureKey);
      }

      sendChat(AE, "/w gm " + characterSetupFeaturesMenuTemplate(token));
      return;
    }

    if (subcommand === "aura") {
      const token = requireCharacterSetupToken(msg, args[3]);
      const auraKey = normalizeAuraKey(args[4]);
      const action = String(args[5] || "").toLowerCase();

      if (!token) return;

      if (!CHARACTER_SETUP_AURA_KEYS.includes(auraKey)) {
        sendChat(AE, "/w gm AE Character Setup: Invalid permanent aura key.");
        return;
      }

      if (action !== "add" && action !== "remove") {
        sendChat(AE, "/w gm AE Character Setup: Invalid aura action.");
        return;
      }

      if (action === "add") {
        addAura(token, auraKey);
      } else {
        removeAura(token, auraKey);
      }

      sendChat(AE, "/w gm " + characterSetupAurasMenuTemplate(token));
      return;
    }

    if (subcommand === "clear") {
      const token = requireCharacterSetupToken(msg, args[3]);
      const confirmation = String(args[4] || "no").toLowerCase();

      if (!token) return;

      if (confirmation === "yes") {
        clearCharacterSetup(token);
      }

      showCharacterSetupMenu(token);
      return;
    }

    sendChat(AE, "/w gm AE Character Setup: Use !ae setup with a selected represented token.");
  }

  function removeCharacterFromArray(array, characterId) {
    return array.filter(id => id !== characterId);
  }

  function cleanupCharacterRegistryEntry(characterId) {
    if (!characterId) return;

    S.pcCharacterIds = removeCharacterFromArray(S.pcCharacterIds, characterId);
    S.allyCharacterIds = removeCharacterFromArray(S.allyCharacterIds, characterId);

    delete S.attackCounts[characterId];
    delete S.features[characterId];
    delete S.auras[characterId];
    delete S.sheetCache[characterId];
  }

  function isExistingCharacterId(characterId) {
    return !!characterId && !!getObj("character", characterId);
  }

  function cleanCharacterRegistries() {
    let removed = 0;

    const cleanArray = function(characterIds) {
      const seen = {};

      return characterIds.filter(characterId => {
        if (!isExistingCharacterId(characterId) || seen[characterId]) {
          removed++;
          return false;
        }

        seen[characterId] = true;
        return true;
      });
    };

    S.pcCharacterIds = cleanArray(S.pcCharacterIds);
    S.allyCharacterIds = cleanArray(S.allyCharacterIds)
      .filter(characterId => {
        if (S.pcCharacterIds.includes(characterId)) {
          removed++;
          return false;
        }

        return true;
      });

    ["attackCounts", "features", "auras", "sheetCache"].forEach(storeName => {
      Object.keys(S[storeName]).forEach(characterId => {
        if (isExistingCharacterId(characterId)) return;

        delete S[storeName][characterId];
        removed++;
      });
    });

    Object.keys(S.attackCounts).forEach(characterId => {
      if (parseInt(S.attackCounts[characterId], 10) > 1) return;

      delete S.attackCounts[characterId];
    });

    Object.keys(S.features).forEach(characterId => {
      if (Object.keys(S.features[characterId] || {}).length) return;

      delete S.features[characterId];
    });

    Object.keys(S.auras).forEach(characterId => {
      if (Object.keys(S.auras[characterId] || {}).length) return;

      delete S.auras[characterId];
    });

    return removed;
  }

  function registryCharacterName(characterId) {
    const character = getObj("character", characterId);

    return character ? character.get("name") : "Missing Character (" + characterId + ")";
  }

  function registryRemoveButton(category, characterId, label) {
    return "[" + label + "](!ae registry remove " + category + " " + characterId + ")";
  }

  function registryArrayLines(characterIds, category) {
    if (!characterIds.length) return "None";

    return characterIds
      .map(characterId =>
        registryCharacterName(characterId) + " " +
        registryRemoveButton(category, characterId, "Remove")
      )
      .join("<br>");
  }

  function registryAttackLines() {
    const characterIds = Object.keys(S.attackCounts)
      .filter(characterId => parseInt(S.attackCounts[characterId], 10) > 1);

    if (!characterIds.length) return "None";

    return characterIds
      .map(characterId =>
        registryCharacterName(characterId) + " — " + S.attackCounts[characterId] + " attacks " +
        registryRemoveButton("attacks", characterId, "Reset")
      )
      .join("<br>");
  }

  function registryFeatureLines() {
    const lines = [];

    Object.keys(S.features).forEach(characterId => {
      const store = S.features[characterId] || {};
      const featureKeys = CHARACTER_SETUP_FEATURE_KEYS.filter(featureKey => !!store[featureKey]);

      if (!featureKeys.length) return;

      const names = featureKeys.map(featureKey => FEATURES[featureKey].display);

      lines.push(
        registryCharacterName(characterId) + " — " + names.join(", ") + " " +
        registryRemoveButton("features", characterId, "Clear")
      );
    });

    return lines.length ? lines.join("<br>") : "None";
  }

  function registryAuraLines() {
    const lines = [];

    Object.keys(S.auras).forEach(characterId => {
      const store = S.auras[characterId] || {};
      const auraKeys = Object.keys(store).filter(auraKey => !!store[auraKey]);

      if (!auraKeys.length) return;

      const names = auraKeys.map(auraKey => AURAS[auraKey] ? AURAS[auraKey].display : auraKey);

      lines.push(
        registryCharacterName(characterId) + " — " + names.join(", ") + " " +
        registryRemoveButton("auras", characterId, "Clear")
      );
    });

    return lines.length ? lines.join("<br>") : "None";
  }

  function characterRegistryMenuTemplate() {
    return (
      "&{template:default} " +
      "{{name=AE Character Registry}} " +
      "{{PCs=" + registryArrayLines(S.pcCharacterIds, "pc") + "}} " +
      "{{Allies=" + registryArrayLines(S.allyCharacterIds, "ally") + "}} " +
      "{{Attack Counts=" + registryAttackLines() + "}} " +
      "{{Permanent Features=" + registryFeatureLines() + "}} " +
      "{{Permanent Auras=" + registryAuraLines() + "}} " +
      "{{Maintenance=[Clean Stale Entries](!ae registry clean) [Refresh](!ae registry)}} " +
      "{{Back=[Admin Hub](!ae admin)}}"
    );
  }

  function handleCharacterRegistryCommand(msg, args) {
    if (!playerIsGM(msg.playerid)) return;

    const action = String(args[2] || "menu").toLowerCase();

    if (action === "clean") {
      const removed = cleanCharacterRegistries();

      sendChat(AE, "/w gm AE Character Registry: Removed " + removed + " stale or duplicate entr" + (removed === 1 ? "y." : "ies."));
      sendChat(AE, "/w gm " + characterRegistryMenuTemplate());
      return;
    }

    if (action === "remove") {
      const category = String(args[3] || "").toLowerCase();
      const characterId = args[4];

      if (!characterId) {
        sendChat(AE, "/w gm AE Character Registry: Character ID is required.");
        return;
      }

      if (category === "pc") {
        S.pcCharacterIds = removeCharacterFromArray(S.pcCharacterIds, characterId);
      } else if (category === "ally") {
        S.allyCharacterIds = removeCharacterFromArray(S.allyCharacterIds, characterId);
      } else if (category === "attacks") {
        delete S.attackCounts[characterId];
      } else if (category === "features") {
        const store = S.features[characterId];

        if (store) {
          CHARACTER_SETUP_FEATURE_KEYS.forEach(featureKey => delete store[featureKey]);

          if (!Object.keys(store).length) {
            delete S.features[characterId];
          }
        }
      } else if (category === "auras") {
        delete S.auras[characterId];
      } else {
        sendChat(AE, "/w gm AE Character Registry: Invalid registry category.");
        return;
      }

      sendChat(AE, "/w gm " + characterRegistryMenuTemplate());
      return;
    }

    sendChat(AE, "/w gm " + characterRegistryMenuTemplate());
  }

  function getAuraProtectionBonus(sourceToken) {
    const characterId = sourceToken.get("represents");
    if (!characterId) return 0;

    const rawMod = getAttrValue(characterId, "charisma_mod");
    const mod = parseInt(rawMod, 10);

    if (!isNaN(mod)) {
      return Math.max(1, mod);
    }

    return Math.max(1, getCharismaMod(characterId));
  }

  function isWolfRageAlly(attacker, sourceToken) {
    if (!attacker || !sourceToken) return false;
    if (attacker.id === sourceToken.id) return false;

    return true;
  }

  function getWolfRageSource(attacker, target) {
    if (!attacker || !target) return null;

    const pageId = attacker.get("_pageid");
    const tokens = findObjs({
      type: "graphic",
      subtype: "token",
      pageid: pageId
    });

    for (const sourceToken of tokens) {
      if (!hasEffect(sourceToken, "wolf")) continue;
      if (!isWolfRageAlly(attacker, sourceToken)) continue;

      const distance = tokenDistanceFeet(sourceToken, target);

      if (distance === null) continue;

      const targetRadiusFeet =
        Math.max(target.get("width"), target.get("height")) / 2 / 70 * getPageScale(target);

      const overlapThresholdFeet = targetRadiusFeet * 0.3;

      if (distance <= 5 + overlapThresholdFeet) {
        return sourceToken;
      }
    }

    return null;
  }

  async function applyTempHp(token, amount, label) {
    const characterId = token.get("represents");
    const currentTempHp = parseInt(token.get("bar2_value"), 10) || 0;
    const tempHp = Math.max(currentTempHp, amount);

    if (characterId && typeof setSheetItem === "function") {
      await setSheetItem(characterId, "hp_temp", tempHp);
    }

    token.set("bar2_value", tempHp);
    token.set("bar2_max", tempHp);

    sendChat(
      AE,
      "/w gm " +
      "&{template:default} " +
      "{{name=" + label + "}} " +
      "{{Target=" + tokenName(token) + "}} " +
      "{{Temp HP=" + currentTempHp + " → " + tempHp + "}}"
    );
  }

  function getDarkOnesBlessingAmount(token) {
    const characterId = token.get("represents");

    if (!characterId) return 0;

    return getCharacterLevel(characterId) + getCharismaMod(characterId);
  }

  function recordDamageSource(sourceTokenId, targetTokenId) {
    if (!sourceTokenId || !targetTokenId) return;

    S.damageSources[targetTokenId] = {
      sourceTokenId: sourceTokenId,
      timestamp: Date.now()
    };
  }

  async function tokenHasDarkOnesBlessing(token) {
    const characterId = token.get("represents");

    if (!characterId) return false;

    initializePermanentFeatures(token);

    return hasFeature(token, "darkonesblessing");
  }

  async function applyDarkOnesBlessing(token, reason) {
    if (!(await tokenHasDarkOnesBlessing(token))) return;

    const amount = getDarkOnesBlessingAmount(token);

    if (!amount || amount <= 0) return;

    applyTempHp(token, amount, "Dark One’s Blessing — " + reason);
  }

  function processDarkOnesBlessingDeathTrigger(deadToken) {
    if (!deadToken) return;
    if (isFriendlyToken(deadToken)) return;

    const awarded = {};
    const sourceData = S.damageSources[deadToken.id];
    const sourceToken = sourceData ? getObj("graphic", sourceData.sourceTokenId) : null;

    if (
      sourceToken &&
      sourceToken.get("subtype") === "token" &&
      sourceToken.get("_pageid") === deadToken.get("_pageid")
    ) {
      applyDarkOnesBlessing(sourceToken, "Kill");
      awarded[sourceToken.id] = true;
    }

    const pageId = deadToken.get("_pageid");
    const tokens = findObjs({
      type: "graphic",
      subtype: "token",
      pageid: pageId
    });

    tokens.forEach(token => {
      if (token.id === deadToken.id) return;
      if (awarded[token.id]) return;

      const distance = tokenDistanceFeet(token, deadToken);

      if (distance === null || distance > 10) return;

      applyDarkOnesBlessing(token, "Nearby Death");
      awarded[token.id] = true;
    });

    delete S.damageSources[deadToken.id];
  }

  function getSaveBonusModifier(token, saveKey) {
    if (!token) return 0;

    const pageId = token.get("_pageid");
    const tokens = findObjs({
      type: "graphic",
      subtype: "token",
      pageid: pageId
    });

    let bestBonus = 0;

    tokens.forEach(sourceToken => {
      if (!hasAura(sourceToken, "protection")) return;

      const distance = tokenDistanceFeet(token, sourceToken);

      if (distance === null || distance > 10) return;

      bestBonus = Math.max(bestBonus, getAuraProtectionBonus(sourceToken));
    });

    return bestBonus;
  }

  ActionEconomyV2API.hasEffect = function(token, effectName) {
    return hasEffect(token, effectName);
  };

  ActionEconomyV2API.hasConditionImmunity = function(token, conditionName) {
    return hasConditionImmunity(token, conditionName);
  };

  function getAttackRollModifiers(attacker, target) {
    const result = {
      advantage: false,
      disadvantage: false,
      penaltyDice: [],
      notes: []
    };

    if (hasCondition(attacker, "poisoned")) {
      result.disadvantage = true;
      result.notes.push("Poisoned: disadvantage on attack rolls");
    }

    if (hasCondition(attacker, "restrained")) {
      result.disadvantage = true;
      result.notes.push("Restrained attacker: disadvantage");
    }

    if (hasCondition(attacker, "blinded")) {
      result.disadvantage = true;
      result.notes.push("Blinded attacker: disadvantage");
    }

    if (hasEffect(attacker, "reckless")) {
      result.advantage = true;
      result.notes.push("Reckless: advantage on attack rolls");
    }

    Object.keys(getEffectStore(attacker)).forEach(effectName => {
      const effect = EFFECTS[effectName];

      if (!effect || !effect.attackAdvantage) return;

      result.advantage = true;
      result.notes.push((effect.display || effectName) + ": advantage on attack rolls");
    });

    if (hasEffect(attacker, "steadyaim")) {
      result.advantage = true;
      result.notes.push("Steady Aim: advantage on next attack roll");
    }

    const wolfSource = getWolfRageSource(attacker, target);

    if (wolfSource) {
      result.advantage = true;
      result.notes.push("Wolf Rage: target is within 5 feet of " + tokenName(wolfSource));
    }

    if (hasCondition(attacker, "hidden")) {
      result.advantage = true;
      result.notes.push("Hidden: advantage on attack rolls");
    }

    if (hasEffect(target, "dodge")) {
      result.disadvantage = true;
      result.notes.push("Dodge: attacks against target have disadvantage");
    }

    if (hasEffect(target, "reckless")) {
      result.advantage = true;
      result.notes.push("Target Reckless: attacks against target have advantage");
    }

    if (hasCondition(target, "restrained")) {
      result.advantage = true;
      result.notes.push("Restrained target: advantage");
    }

    if (hasCondition(target, "blinded")) {
      result.advantage = true;
      result.notes.push("Blinded target: advantage");
    }

    if (hasEffect(target, "bladeward")) {
      result.penaltyDice.push({
        dice: "1d4",
        label: "Blade Ward"
      });
      result.notes.push("Blade Ward: subtract 1d4 from attack roll");
    }

    return result;
  }

  ActionEconomyV2API.hasEffect = function(token, effectName) {
    return hasEffect(token, effectName);
  };

  ActionEconomyV2API.hasConditionImmunity = function(token, conditionName) {
    return hasConditionImmunity(token, conditionName);
  };

  ActionEconomyV2API.modifyDamageForTraits = function(token, damageType, amount, tags) {
    return modifyDamageForTraits(token, damageType, amount, tags);
  };

  ActionEconomyV2API.getAttackRollModifiers = function(attacker, target) {
    return getAttackRollModifiers(attacker, target);
  };

  ActionEconomyV2API.isFriendlyToken = function(token) {
    return isFriendlyToken(token);
  };

  ActionEconomyV2API.recordAttack = function(token) {
    useAttack(token);
  };

  ActionEconomyV2API.getSaveBonusModifier = function(token, saveKey) {
    return getSaveBonusModifier(token, saveKey);
  };

  ActionEconomyV2API.recordDamageSource = function(sourceTokenId, targetTokenId) {
    recordDamageSource(sourceTokenId, targetTokenId);
  };

  ActionEconomyV2API.processDamageResult = function(sourceTokenId, targetTokenId, hpBefore, hpAfter) {
    const target = getObj("graphic", targetTokenId);

    if (!target) return;

    recordDamageSource(sourceTokenId, targetTokenId);

    if (hpBefore > 0 && hpAfter <= 0) {
      processDarkOnesBlessingDeathTrigger(target);
    }
  };

ActionEconomyV2API.addPendingSummon = function(playerId, casterTokenId, summonName, concentration, count, timeoutSeconds, controlOptions, initiativeOptions) {
    addPendingSummon(playerId || "AoEBoom", casterTokenId, summonName, concentration, count || 1, timeoutSeconds || 300, controlOptions || null, initiativeOptions || { mode: "none" });
  };

  ActionEconomyV2API.addPendingDirectionalHazard = function(playerId, casterTokenId, hazardName, options) {
    addPendingDirectionalHazard(playerId || "AoEBoom", casterTokenId, hazardName, options || {});
  };

  function initializePermanentFeatures(token) {
    if (!token || !token.get("represents")) return;
  }


  function getCharismaMod(characterId) {
    const rawMod = getAttrValue(characterId, "charisma_mod");
    const mod = parseInt(rawMod, 10);

    if (!isNaN(mod)) {
      return mod;
    }

    const rawScore = getAttrValue(characterId, "charisma");
    const score = parseInt(rawScore, 10);

    if (!isNaN(score)) {
      return Math.floor((score - 10) / 2);
    }

    return 0;
  }

    function applyRegistrySheetValue(token, effectName) {
    const effect = EFFECTS[effectName];
    if (!effect || !effect.sheetValue) return;

    const characterId = token.get("represents");

    if (effect.sheetValue === "rageDamage") {
      setUserSheetValue(characterId, "ragedmg", getRageBonus(characterId));
      addFeature(token, "rage");
    }

    if (effect.sheetValue === "sacredAttack") {
      const bonus = Math.max(1, getCharismaMod(characterId));
      setUserSheetValue(characterId, "sacredatk", bonus);
    }
  }

  function removeRegistrySheetValue(token, effectName) {
    const effect = EFFECTS[effectName];
    if (!effect || !effect.sheetValue) return;

    const characterId = token.get("represents");

    if (effect.sheetValue === "rageDamage") {
      setUserSheetValue(characterId, "ragedmg", 0);
      removeFeature(token, "rage");
    }

    if (effect.sheetValue === "sacredAttack") {
      setUserSheetValue(characterId, "sacredatk", 0);
    }
  }

  const REPEAT_SAVE_BONUS_ATTRIBUTES = {
    str: "strength_save_bonus",
    dex: "dexterity_save_bonus",
    con: "constitution_save_bonus",
    int: "intelligence_save_bonus",
    wis: "wisdom_save_bonus",
    cha: "charisma_save_bonus"
  };

  async function getRepeatSaveBonus(token, saveKey) {
    const characterId = token.get("represents");
    if (!characterId) return null;

    const attrName = REPEAT_SAVE_BONUS_ATTRIBUTES[saveKey];
    if (!attrName) return null;

    if (typeof getSheetItem !== "function") {
      sendChat(AE, "/w gm getSheetItem is not available.");
      return null;
    }

    try {
      const rawValue = await getSheetItem(characterId, attrName);
      const value = Number(rawValue);

      if (isNaN(value)) {
        return null;
      }

      return value;
    } catch (e) {
      return null;
    }
  }

  async function rollRepeatSave(token, conditionName, repeatSave) {
    const saveBonus = await getRepeatSaveBonus(token, repeatSave.saveKey);

    if (saveBonus === null) {
      sendChat(AE, "/w gm Could not roll repeat save for " + tokenName(token) + ".");
      return;
    }

    const rollMode = getSaveRollMode(token, repeatSave.saveKey, conditionName);
    const first = randomInteger(20);
    const second = rollMode === "normal" ? null : randomInteger(20);

    let d20 = first;
    let rollFormula = first + " + " + saveBonus;

    if (rollMode === "advantage") {
      d20 = Math.max(first, second);
      rollFormula = "{" + first + "," + second + "}kh1 + " + saveBonus;
    }

    if (rollMode === "disadvantage") {
      d20 = Math.min(first, second);
      rollFormula = "{" + first + "," + second + "}kl1 + " + saveBonus;
    }

    const auraBonus = getSaveBonusModifier(token, repeatSave.saveKey);
    const total = d20 + saveBonus + auraBonus;
    const success = total >= repeatSave.dc;

    if (success && repeatSave.success === "remove") {
      removeCondition(token, conditionName);
    }

    sendChat(
      AE,
      "&{template:default} " +
      "{{name=Repeat Save}} " +
      "{{Target=" + tokenName(token) + "}} " +
      "{{Condition=" + registryDisplayName(CONDITIONS, conditionName) + "}} " +
      "{{Save=[[" + rollFormula + (auraBonus ? " + " + auraBonus : "") + "]]}} " +      "{{DC=" + repeatSave.dc + "}} " +
      "{{Result=" + (success ? "Success" : "Failure") + "}} " +
      "{{Effect=" + (success ? "Condition removed." : "Condition remains.") + "}}"
    );
  }

  function processRepeatSaves(token, timing) {
    const store = getConditionStore(token);

    Object.keys(store).forEach(conditionName => {
      const stored = store[conditionName];

      if (
        stored &&
        stored.repeatSave &&
        stored.repeatSave.timing === timing
      ) {
        rollRepeatSave(token, conditionName, stored.repeatSave);
      }
    });
  }

  function getOngoingDamageStore(token) {
    if (!S.ongoingDamage[token.id]) {
      S.ongoingDamage[token.id] = {};
    }

    return S.ongoingDamage[token.id];
  }

  async function resolveOngoingDamageDc(dcInput, sourceTokenId) {
    if (dcInput === "spell") {
      if (!sourceTokenId) return null;

      const sourceToken = getObj("graphic", sourceTokenId);
      if (!sourceToken) return null;

      const characterId = sourceToken.get("represents");
      if (!characterId) return null;

      if (typeof getSheetItem !== "function") return null;

      try {
        const rawValue = await getSheetItem(characterId, "spell_save_dc");
        const value = Number(rawValue);

        if (isNaN(value)) return null;

        return value;
      } catch (e) {
        return null;
      }
    }

    const dc = Number(dcInput);

    if (isNaN(dc)) return null;

    return dc;
  }

  async function addOngoingDamage(token, args) {
    const name = args[3];
    const timing = getOptionValue(args, "--timing");
    const saveKey = getOptionValue(args, "--save");
    const dcInput = getOptionValue(args, "--dc");
    const damageFormula = getOptionValue(args, "--damage");
    const damageType = getOptionValue(args, "--type");
    const successMode = getOptionValue(args, "--success");
    const sourceTokenId = getOptionValue(args, "--source");
    const duration = getOptionValue(args, "--duration");

    if (!name || !timing || !saveKey || !dcInput || !damageFormula || !damageType || !successMode) {
      sendChat(AE, "/w gm Format: !ae-ongoing add TOKEN_ID NAME --timing startOfTurn/endOfTurn --save wis --dc spell/15 --damage 3d8 --type radiant --success half/none --source SOURCE_ID --duration concentration");
      return;
    }

    if (timing !== "startOfTurn" && timing !== "endOfTurn") {
      sendChat(AE, "/w gm Ongoing damage timing must be startOfTurn or endOfTurn.");
      return;
    }

    if (!normalizeSaveKey(saveKey) || saveKey === "all" || saveKey === "concentration") {
      sendChat(AE, "/w gm Invalid save key.");
      return;
    }

    if (successMode !== "half" && successMode !== "none") {
      sendChat(AE, "/w gm Success mode must be half or none.");
      return;
    }

    const dc = await resolveOngoingDamageDc(dcInput, sourceTokenId);

    if (dc === null) {
      sendChat(AE, "/w gm Invalid ongoing damage DC.");
      return;
    }

    getOngoingDamageStore(token)[name] = {
      name: name,
      timing: timing,
      saveKey: saveKey,
      dc: dc,
      damageFormula: damageFormula,
      damageType: damageType,
      successMode: successMode,
      sourceTokenId: sourceTokenId || null,
      duration: duration || "manual"
    };

    if (duration === "concentration" && sourceTokenId) {
      sendChat(AE, "!ae-effect concentrate " + sourceTokenId);
    }

    sendChat(
      AE,
      "/w gm " +
      "&{template:default} " +
      "{{name=Ongoing Damage Added}} " +
      "{{Target=" + tokenName(token) + "}} " +
      "{{Effect=" + name + "}} " +
      "{{Timing=" + timing + "}} " +
      "{{Save=" + saveKey + " DC " + dc + "}} " +
      "{{Damage=" + damageFormula + " " + damageType + "}}"
    );
  }

  function removeOngoingDamage(token, name) {
    const store = getOngoingDamageStore(token);

    if (name === "all") {
      S.ongoingDamage[token.id] = {};
      return;
    }

    delete store[name];
  }

  function clearConcentrationOngoingDamage(sourceToken) {
    Object.keys(S.ongoingDamage).forEach(tokenId => {
      const target = getObj("graphic", tokenId);
      if (!target) return;

      const store = getOngoingDamageStore(target);

      Object.keys(store).forEach(name => {
        const ongoing = store[name];

        if (
          ongoing &&
          ongoing.duration === "concentration" &&
          ongoing.sourceTokenId === sourceToken.id
        ) {
          delete store[name];
        }
      });
    });
  }

  function processOngoingDamage(token, timing) {
    const store = getOngoingDamageStore(token);

    Object.keys(store).forEach(name => {
      const ongoing = store[name];

      if (!ongoing || ongoing.timing !== timing) return;

      sendChat(
        AE,
        "!se damageone " +
          token.id + " " +
          ongoing.saveKey + " " +
          ongoing.dc + " " +
          ongoing.damageFormula + " " +
          ongoing.damageType + " " +
          ongoing.successMode
      );
    });
  }

  function ongoingDamageText(token) {
    const store = getOngoingDamageStore(token);
    const names = Object.keys(store);

    if (!names.length) return "None";

    return names.map(name => {
      const ongoing = store[name];

      return name +
        ": " +
        ongoing.timing +
        ", " +
        ongoing.saveKey +
        " DC " +
        ongoing.dc +
        ", " +
        ongoing.damageFormula +
        " " +
        ongoing.damageType +
        ", success " +
        ongoing.successMode;
    }).join("<br>");
  }

  function rollConcentrationSave(token, damageTaken) {
    if (!hasEffect(token, "concentrate")) return;
    if (!damageTaken || damageTaken <= 0) return;

    const characterId = token.get("represents");
    const saveBonus = getConcentrationSaveBonus(characterId);
    const dc = Math.max(10, Math.floor(damageTaken / 2));
    const rollMode = getSaveRollMode(token, "con", "concentration");
    const first = randomInteger(20);
    const second = rollMode === "normal" ? null : randomInteger(20);

    let d20 = first;
    let rollFormula = first + " + " + saveBonus;

    if (rollMode === "advantage") {
      d20 = Math.max(first, second);
      rollFormula = "{" + first + "," + second + "}kh1 + " + saveBonus;
    }

    if (rollMode === "disadvantage") {
      d20 = Math.min(first, second);
      rollFormula = "{" + first + "," + second + "}kl1 + " + saveBonus;
    }

    const auraBonus = getSaveBonusModifier(token, "con");
    const total = d20 + saveBonus + auraBonus;
    const success = total >= dc;

    if (!success) {
      removeEffect(token, "concentrate");
    }

    sendChat(
      AE,
      "&{template:default} " +
      "{{name=Concentration Save}} " +
      "{{Target=" + tokenName(token) + "}} " +
      "{{Damage Taken=" + damageTaken + "}} " +
      "{{DC=" + dc + "}} " +
      "{{Saving Throw=[[" + rollFormula + (auraBonus ? " + " + auraBonus : "") + "]]}} " +
      "{{Result=" + (success ? "Success" : "Failure") + "}}"
    );
  }

  function playRageEndEffects(token) {
    sendChat(AE, "!token-mod --ids " + token.id + " --set currentside|3");
    sendChat(AE, "!splay Rage End");

    spawnFx(
      token.get("left"),
      token.get("top"),
      "shield-smoke",
      token.get("_pageid")
    );
  }

    function isPCToken(token) {
    if (!token) return false;

    const characterId = token.get("represents");
    if (!characterId) return false;

    return S.pcCharacterIds.includes(characterId);
  }

  function isAllyToken(token) {
    if (!token) return false;

    const characterId = token.get("represents");
    if (!characterId) return false;

    return S.allyCharacterIds.includes(characterId);
  }

  function isFriendlyToken(token) {
    return isPCToken(token) || isAllyToken(token);
  }

  function getSelectedTokens(msg) {
    if (!msg.selected || !msg.selected.length) return [];

    return msg.selected
      .map(s => getObj("graphic", s._id))
      .filter(t => t && t.get("subtype") === "token");
  }

  function resolveTargets(msg, args, tokenArgIndex) {
    const tokenId = args[tokenArgIndex];

    if (tokenId) {
      const target = getObj("graphic", tokenId);
      if (target && target.get("subtype") === "token") return [target];
      return [];
    }

    return getSelectedTokens(msg);
  }

  function getTurnOrder() {
    const raw = Campaign().get("turnorder");
    if (!raw) return [];

    try {
      return JSON.parse(raw);
    } catch (e) {
      return [];
    }
  }

  function getActiveToken() {
    const order = getTurnOrder();
    if (!order.length || !order[0].id || order[0].id === "-1") return null;
    return getObj("graphic", order[0].id);
  }

    function getSpeed(token) {
    const characterId = token.get("represents");

    if (characterId) {
      const attrValue = getAttrValue(characterId, "speed");
      const sheetSpeed = parseInt(attrValue, 10);

      if (!isNaN(sheetSpeed) && sheetSpeed > 0) {
        return sheetSpeed;
      }
    }

    const key = getCharacterKey(token);
    return S.speeds[key] || 30;
  }

  function setSpeed(token, speed) {
    const key = getCharacterKey(token);
    S.speeds[key] = speed;
  }

  async function getCurrentSheetSpeed(token) {
    const characterId = token.get("represents");

    if (!characterId) return null;

    const cached = getCachedSheetValue(characterId, "speed");
    const cachedSpeed = parseInt(cached, 10);

    if (!isNaN(cachedSpeed) && cachedSpeed > 0) {
      return cachedSpeed;
    }

    if (typeof getSheetItem !== "function") {
      return null;
    }

    try {
      const rawSpeed = await getSheetItem(characterId, "speed");
      const speed = parseInt(rawSpeed, 10);

      if (isNaN(speed) || speed <= 0) {
        return null;
      }

      setCachedSheetValue(characterId, "speed", speed);
      return speed;
    } catch (e) {
      return null;
    }
  }

  function getOriginalSpeedKey(token) {
    return token.get("represents") || token.id;
  }

  function saveOriginalSheetSpeed(token, speed) {
    const key = getOriginalSpeedKey(token);

    if (S.originalSpeeds[key] === undefined) {
      S.originalSpeeds[key] = speed;
    }
  }

  function updateMovementAfterSpeedChange(token) {
    if (shouldShowMovementBar(token)) {
      resetMovement(token);
    }
  }

  function setBeaconSpeed(token, speed) {
    const characterId = token.get("represents");

    if (!characterId) return;

    setSheetValue(characterId, "speed", speed);
    setCachedSheetValue(characterId, "speed", speed);
    updateMovementAfterSpeedChange(token);
  }

  async function modifySheetSpeed(token, mode, value) {
    const currentSpeed = await getCurrentSheetSpeed(token);

    if (currentSpeed === null) {
      sendChat(AE, "/w gm Could not read Beacon speed for " + tokenName(token) + ".");
      return;
    }

    saveOriginalSheetSpeed(token, currentSpeed);

    let newSpeed = currentSpeed;

    if (mode === "half") {
      newSpeed = Math.max(0, Math.floor(currentSpeed / 2));
    }

    if (mode === "add") {
      newSpeed = Math.max(0, currentSpeed + value);
    }

    if (mode === "set") {
      newSpeed = Math.max(0, value);
    }

    setBeaconSpeed(token, newSpeed);

    sendChat(
      AE,
      "/w gm " +
      "&{template:default} " +
      "{{name=Speed Modified}} " +
      "{{Target=" + tokenName(token) + "}} " +
      "{{Speed=" + currentSpeed + " → " + newSpeed + "}}"
    );
  }

  function restoreSheetSpeed(token) {
    const characterId = token.get("represents");

    if (!characterId) {
      sendChat(AE, "/w gm " + tokenName(token) + " has no represented character.");
      return;
    }

    const key = getOriginalSpeedKey(token);
    const originalSpeed = S.originalSpeeds[key];

    if (originalSpeed === undefined) {
      sendChat(AE, "/w gm No stored original speed for " + tokenName(token) + ".");
      return;
    }

    setBeaconSpeed(token, originalSpeed);
    delete S.originalSpeeds[key];

    sendChat(
      AE,
      "/w gm " +
      "&{template:default} " +
      "{{name=Speed Restored}} " +
      "{{Target=" + tokenName(token) + "}} " +
      "{{Speed=" + originalSpeed + "}}"
    );
  }

    function getAttackCount(token) {
    const characterId = token.get("represents");

    if (!characterId) return 1;

    return S.attackCounts[characterId] || 1;
  }

  function setAttackCount(token, count) {
    const characterId = token.get("represents");

    if (!characterId) return false;

    if (count <= 1) {
      delete S.attackCounts[characterId];
      return true;
    }

    S.attackCounts[characterId] = count;
    return true;
  }

  function getEconomy(token) {
    if (!S.economy[token.id]) {
      S.economy[token.id] = {
        action: true,
        bonus: true,
        extraBonus: 0,
        hasteAction: false
      };
    }

    return S.economy[token.id];
  }

    function resetEconomy(token) {
    S.economy[token.id] = {
      action: true,
      bonus: true,
      extraBonus: 0,
      hasteAction: hasEffect(token, "haste")
    };

    S.attacksRemaining[token.id] = getAttackCount(token);

    enforceConditions(token);
  }

  function getAttacksRemaining(token) {
    if (S.attacksRemaining[token.id] === undefined) {
      S.attacksRemaining[token.id] = getAttackCount(token);
    }

    return S.attacksRemaining[token.id];
  }

  function setAttacksRemaining(token, count) {
    S.attacksRemaining[token.id] = count;
  }

  function setMovementBar(token, current, max) {
    token.set("bar3_value", current);
    token.set("bar3_max", max);
  }

  function clearMovementBar(token) {
    token.set("bar3_value", "");
    token.set("bar3_max", "");
  }

  function resetMovement(token) {
    const speed = getEffectiveSpeed(token);
    const max = hasEffect(token, "haste") ? speed * 2 : speed;
    setMovementBar(token, max, max);

    enforceConditions(token);
  }

  function shouldShowMovementBar(token) {
    return S.lastActiveTokenId === token.id || isActiveRiderMount(token);
  }

  function lockMovement(token) {
    S.movementLocked[token.id] = true;

    if (shouldShowMovementBar(token)) {
      setMovementBar(token, 0, getEffectiveSpeed(token));
    }
  }

  function unlockMovement(token) {
    delete S.movementLocked[token.id];
  }

  function isMovementLocked(token) {
    return !!S.movementLocked[token.id];
  }

  function getPageScale(token) {
    const page = getObj("page", token.get("_pageid"));
    if (!page) return 5;
    return parseFloat(page.get("scale_number")) || 5;
  }

  function distanceMovedFeet(token, prev) {
    const dx = token.get("left") - prev.left;
    const dy = token.get("top") - prev.top;
    const pixelsMoved = Math.sqrt(dx * dx + dy * dy);
    const unitsMoved = pixelsMoved / 70;
    return Math.round(unitsMoved * getPageScale(token));
  }

  function saveMovementState(token) {
    S.movement[token.id] = {
      current: parseFloat(token.get("bar3_value")) || 0,
      max: parseFloat(token.get("bar3_max")) || getSpeed(token)
    };
  }

  function undoMovement(token) {
    const saved = S.movement[token.id];
    if (!saved) return;
    setMovementBar(token, saved.current, saved.max);
  }

  function spendMovement(token, amount) {
    saveMovementState(token);
    const current = parseFloat(token.get("bar3_value")) || 0;
    const max = parseFloat(token.get("bar3_max")) || getSpeed(token);
    setMovementBar(token, current - amount, max);
  }

  function addMovement(token, amount) {
    saveMovementState(token);
    const current = parseFloat(token.get("bar3_value")) || 0;
    const max = parseFloat(token.get("bar3_max")) || getSpeed(token);
    setMovementBar(token, current + amount, max);
  }

  function pushTokenAway(sourceToken, targetTokenId, feet) {
    const target = getObj("graphic", targetTokenId);
    const distanceFeet = parseInt(feet, 10);

    if (!sourceToken || !target || target.get("subtype") !== "token") {
      sendChat(AE, "/w gm Format: !ae push TARGET_ID FEET");
      return;
    }

    if (isNaN(distanceFeet) || distanceFeet <= 0) {
      sendChat(AE, "/w gm Push distance must be a positive number.");
      return;
    }

    if (sourceToken.get("_pageid") !== target.get("_pageid")) {
      sendChat(AE, "/w gm Push target must be on the same page.");
      return;
    }

    const dx = target.get("left") - sourceToken.get("left");
    const dy = target.get("top") - sourceToken.get("top");
    const length = Math.sqrt(dx * dx + dy * dy);

    if (!length) {
      sendChat(AE, "/w gm Push target is centered on the source token; move it slightly first.");
      return;
    }

    const pageScale = getPageScale(sourceToken);
    const pixelsPerFoot = 70 / pageScale;
    const distancePixels = distanceFeet * pixelsPerFoot;

    const newLeft = target.get("left") + (dx / length) * distancePixels;
    const newTop = target.get("top") + (dy / length) * distancePixels;

    ignoreNextMove(target);

    target.set({
      left: newLeft,
      top: newTop
    });

    sendChat(
      AE,
      "/w gm " +
      "&{template:default} " +
      "{{name=Forced Movement}} " +
      "{{Source=" + tokenName(sourceToken) + "}} " +
      "{{Target=" + tokenName(target) + "}} " +
      "{{Movement=Pushed " + distanceFeet + " ft}}"
    );
  }

  function pullTokenToward(sourceToken, targetTokenId, feet) {
    const target = getObj("graphic", targetTokenId);
    const distanceFeet = parseInt(feet, 10);

    if (!sourceToken || !target || target.get("subtype") !== "token") {
      sendChat(AE, "/w gm Format: !ae pull TARGET_ID FEET");
      return;
    }

    if (isNaN(distanceFeet) || distanceFeet <= 0) {
      sendChat(AE, "/w gm Pull distance must be a positive number.");
      return;
    }

    if (sourceToken.get("_pageid") !== target.get("_pageid")) {
      sendChat(AE, "/w gm Pull target must be on the same page.");
      return;
    }

    const dx = sourceToken.get("left") - target.get("left");
    const dy = sourceToken.get("top") - target.get("top");
    const length = Math.sqrt(dx * dx + dy * dy);

    if (!length) {
      sendChat(AE, "/w gm Pull target is centered on the source token; move it slightly first.");
      return;
    }

    const pageScale = getPageScale(sourceToken);
    const pixelsPerFoot = 70 / pageScale;
    const distancePixels = distanceFeet * pixelsPerFoot;

    const newLeft = target.get("left") + (dx / length) * distancePixels;
    const newTop = target.get("top") + (dy / length) * distancePixels;

    ignoreNextMove(target);

    target.set({
      left: newLeft,
      top: newTop
    });

    sendChat(
      AE,
      "/w gm " +
      "&{template:default} " +
      "{{name=Forced Movement}} " +
      "{{Source=" + tokenName(sourceToken) + "}} " +
      "{{Target=" + tokenName(target) + "}} " +
      "{{Movement=Pulled " + distanceFeet + " ft}}"
    );
  }


  function normalizeForcedMovementDirection(direction) {
    const raw = String(direction === undefined || direction === null ? "" : direction)
      .trim()
      .toLowerCase();

    if (raw === "toward" || raw === "towards" || raw === "pull") return "toward";
    if (raw === "away" || raw === "push") return "away";

    const numeric = raw === "" ? NaN : Number(raw);

    if (Number.isFinite(numeric)) {
      return ((numeric % 360) + 360) % 360;
    }

    const clean = raw.replace(/[\s_-]/g, "");
    const aliases = {
      n: 0,
      north: 0,
      up: 0,
      ne: 45,
      northeast: 45,
      upright: 45,
      e: 90,
      east: 90,
      right: 90,
      se: 135,
      southeast: 135,
      downright: 135,
      s: 180,
      south: 180,
      down: 180,
      sw: 225,
      southwest: 225,
      downleft: 225,
      w: 270,
      west: 270,
      left: 270,
      nw: 315,
      northwest: 315,
      upleft: 315
    };

    return Object.prototype.hasOwnProperty.call(aliases, clean)
      ? aliases[clean]
      : null;
  }

  function forceMoveToken(sourceTokenId, targetTokenId, direction, feet) {
    const sourceToken = getObj("graphic", sourceTokenId);
    const target = getObj("graphic", targetTokenId);
    const distanceFeet = parseFloat(feet);
    const normalizedDirection = normalizeForcedMovementDirection(direction);

    if (
      !sourceToken ||
      !target ||
      sourceToken.get("subtype") !== "token" ||
      target.get("subtype") !== "token"
    ) {
      return {
        success: false,
        message: "Invalid source or target token."
      };
    }

    if (sourceToken.get("_pageid") !== target.get("_pageid")) {
      return {
        success: false,
        message: "Source and target must be on the same page."
      };
    }

    if (!Number.isFinite(distanceFeet) || distanceFeet <= 0) {
      return {
        success: false,
        message: "Forced-movement distance must be a positive number."
      };
    }

    if (normalizedDirection === null) {
      return {
        success: false,
        message: "Invalid forced-movement direction."
      };
    }

    let unitX;
    let unitY;
    let movementLabel;

    if (normalizedDirection === "toward" || normalizedDirection === "away") {
      const towardX = sourceToken.get("left") - target.get("left");
      const towardY = sourceToken.get("top") - target.get("top");
      const length = Math.sqrt(towardX * towardX + towardY * towardY);

      if (!length) {
        return {
          success: false,
          message: "Source and target tokens cannot share the same center point."
        };
      }

      const multiplier = normalizedDirection === "toward" ? 1 : -1;

      unitX = towardX / length * multiplier;
      unitY = towardY / length * multiplier;
      movementLabel = normalizedDirection === "toward"
        ? "Toward the source"
        : "Away from the source";
    }
    else {
      const radians = normalizedDirection * Math.PI / 180;

      unitX = Math.sin(radians);
      unitY = -Math.cos(radians);
      movementLabel = normalizedDirection + "°";
    }

    const distancePixels = distanceFeet * (70 / getPageScale(sourceToken));

    ignoreNextMove(target);

    target.set({
      left: target.get("left") + unitX * distancePixels,
      top: target.get("top") + unitY * distancePixels
    });

    return {
      success: true,
      sourceName: tokenName(sourceToken),
      targetName: tokenName(target),
      direction: normalizedDirection,
      movementLabel: movementLabel,
      distance: distanceFeet
    };
  }

  function ignoreNextMove(token) {
    S.ignoreNextMove[token.id] = true;
  }

  function shouldIgnoreMove(token) {
    if (!S.ignoreNextMove[token.id]) return false;
    delete S.ignoreNextMove[token.id];
    return true;
  }

  function spendMovementFromDrag(token, prev, feetMoved) {
    if (!feetMoved || feetMoved <= 0) return;
    if (shouldIgnoreMove(token)) return;

    const isActiveToken = S.lastActiveTokenId === token.id;
    const isMountedMovement = isActiveRiderMount(token);
    const mountRecord = getMountRecord(token);

    if (isCombinedMountRecord(mountRecord) && hasEffect(token, "mounted")) {
      const mount = getMountedCreature(token);
      if (!mount) return;

      const mountPrev = {
        left: mount.get("left"),
        top: mount.get("top")
      };

      syncCombinedMountPosition(token, mount);

      if (!isActiveToken) return;

      if (isMovementLocked(mount)) {
        setMovementBar(mount, 0, getSpeed(mount));
        return;
      }

      spendMovement(
        mount,
        getDifficultTerrainMoveCost(mount, mountPrev, feetMoved)
      );
      return;
    }

    if (!isActiveToken && !isMountedMovement) return;

    if (isActiveToken && isMounted(token)) {
      return;
    }

    if (isMovementLocked(token)) {
      setMovementBar(token, 0, getSpeed(token));
      return;
    }

    spendMovement(token, getDifficultTerrainMoveCost(token, prev, feetMoved));
  }

  function getDifficultTerrainMoveCost(token, prev, feetMoved) {
    if (hasEffect(token, "fly")) return feetMoved;

    const terrainIds = Object.keys(S.difficultTerrain || {});

    if (!terrainIds.length) return feetMoved;

    const start = {
      x: prev.left,
      y: prev.top
    };

    const end = {
      x: token.get("left"),
      y: token.get("top")
    };

    const steps = Math.max(1, Math.ceil(feetMoved));
    const feetPerStep = feetMoved / steps;
    let difficultFeet = 0;

    for (let i = 1; i <= steps; i++) {
      const ratio = (i - 0.5) / steps;
      const point = {
        x: start.x + (end.x - start.x) * ratio,
        y: start.y + (end.y - start.y) * ratio
      };

      if (pointInsideAnyDifficultTerrain(token, point)) {
        difficultFeet += feetPerStep;
      }
    }

    return Math.ceil(feetMoved + difficultFeet);
  }

  function pointInsideAnyDifficultTerrain(movingToken, point) {
    return Object.keys(S.difficultTerrain || {}).some(terrainTokenId => {
      const terrain = S.difficultTerrain[terrainTokenId];
      const terrainToken = getObj("graphic", terrainTokenId);

      if (!terrain || !terrainToken) {
        delete S.difficultTerrain[terrainTokenId];
        return false;
      }

      if (terrainToken.id === movingToken.id) return false;
      if (terrainToken.get("_pageid") !== movingToken.get("_pageid")) return false;
      if (tokenHasAreaImmunity("terrain", movingToken, terrain.name)) return false;

      if (terrain.shape === "radius") {
        return pointInsideTerrainRadius(point, terrainToken, terrain.radiusFeet);
      }

      if (terrain.shape === "token") {
        return pointInsideTerrainToken(point, terrainToken);
      }

      return false;
    });
  }

  function pointInsideTerrainRadius(point, terrainToken, radiusFeet) {
    const dx = point.x - terrainToken.get("left");
    const dy = point.y - terrainToken.get("top");
    const pixels = Math.sqrt(dx * dx + dy * dy);
    const feet = pixels / 70 * getPageScale(terrainToken);

    return feet <= radiusFeet;
  }

  function pointInsideTerrainToken(point, terrainToken) {
    const rotation = -(Number(terrainToken.get("rotation")) || 0) * Math.PI / 180;
    const dx = point.x - terrainToken.get("left");
    const dy = point.y - terrainToken.get("top");

    const localX = dx * Math.cos(rotation) - dy * Math.sin(rotation);
    const localY = dx * Math.sin(rotation) + dy * Math.cos(rotation);

    return Math.abs(localX) <= terrainToken.get("width") / 2 &&
      Math.abs(localY) <= terrainToken.get("height") / 2;
  }

  function terrainDisplayName(token, name) {
    if (!name || name === "@name") return tokenName(token);
    return String(name).replace(/_/g, " ");
  }

  function addDifficultTerrainRadius(tokenId, radiusFeet, name) {
    const token = getObj("graphic", tokenId);

    if (!token || token.get("subtype") !== "token") {
      sendChat(AE, "/w gm Invalid difficult terrain token.");
      return;
    }

    if (isNaN(radiusFeet) || radiusFeet <= 0) {
      sendChat(AE, "/w gm Radius must be a positive number.");
      return;
    }

    S.difficultTerrain[token.id] = {
      shape: "radius",
      radiusFeet: radiusFeet,
      name: terrainDisplayName(token, name)
    };

    sendChat(AE, "/w gm Difficult terrain radius added: " + S.difficultTerrain[token.id].name + " " + radiusFeet + " ft.");
  }

  function addDifficultTerrainToken(tokenId, name) {
    const token = getObj("graphic", tokenId);

    if (!token || token.get("subtype") !== "token") {
      sendChat(AE, "/w gm Invalid difficult terrain token.");
      return;
    }

    S.difficultTerrain[token.id] = {
      shape: "token",
      name: terrainDisplayName(token, name)
    };

    sendChat(AE, "/w gm Difficult terrain token area added: " + S.difficultTerrain[token.id].name + ".");
  }

  function addSelectedDifficultTerrainTokens(msg, name) {
    const selected = getSelectedTokens(msg);

    if (!selected.length) {
      sendChat(AE, "/w gm Select one or more terrain tokens first.");
      return;
    }

    selected.forEach(token => addDifficultTerrainToken(token.id, name));
  }

  function addSelectedDifficultTerrainRadii(msg, radiusFeet, name) {
    const selected = getSelectedTokens(msg);

    if (!selected.length) {
      sendChat(AE, "/w gm Select one or more terrain tokens first.");
      return;
    }

    selected.forEach(token => addDifficultTerrainRadius(token.id, radiusFeet, name));
  }

  function removeDifficultTerrain(tokenId) {
    delete S.difficultTerrain[tokenId];
    sendChat(AE, "/w gm Difficult terrain removed.");
  }

  function clearDifficultTerrain() {
    S.difficultTerrain = {};
    sendChat(AE, "/w gm All difficult terrain cleared.");
  }

  function showDifficultTerrainList() {
    const terrainIds = Object.keys(S.difficultTerrain || {});
    const rows = terrainIds.map(id => {
      const terrain = S.difficultTerrain[id];
      const token = getObj("graphic", id);
      const detail = terrain.shape === "radius" ? " — " + terrain.radiusFeet + " ft" : "";

      return (terrain.name || "Difficult Terrain") + " — " + terrain.shape + detail + (token ? "" : " — missing token");
    });

    sendChat(
      AE,
      "/w gm &{template:default} " +
      "{{name=Difficult Terrain}} " +
      "{{Areas=" + (rows.join("<br>") || "None") + "}}"
    );
  }

  function getEffectStore(token) {
    if (!S.effects[token.id]) S.effects[token.id] = {};
    return S.effects[token.id];
  }

  function getConditionStore(token) {
    if (!S.conditions[token.id]) S.conditions[token.id] = {};
    return S.conditions[token.id];
  }

  function hasEffect(token, effectName) {
    return !!getEffectStore(token)[effectName];
  }

  function hasCondition(token, conditionName) {
    return !!getConditionStore(token)[conditionName];
  }

  function getStoredEntryDuration(storeEntry, registryEntry) {
    if (storeEntry && storeEntry.durationOverride) {
      return storeEntry.durationOverride;
    }

    return registryEntry ? registryEntry.duration : null;
  }

  function getOptionValue(args, optionName) {
    const index = args.indexOf(optionName);
    if (index === -1) return null;

    return args[index + 1] || null;
  }

  function getApplyOptions(args) {
    return {
      durationOverride: getOptionValue(args, "--duration"),
      sourceTokenId: getOptionValue(args, "--source"),
      repeatSaveTiming: getOptionValue(args, "--repeatSave"),
      repeatSaveKey: getOptionValue(args, "--repeatSaveKey"),
      repeatSaveDc: getOptionValue(args, "--repeatSaveDc"),
      repeatSaveSuccess: getOptionValue(args, "--repeatSaveSuccess")
    };
  }

  function applySourceConcentration(durationOverride, sourceTokenId) {
    if (durationOverride !== "concentration" || !sourceTokenId) return;

    const sourceToken = getObj("graphic", sourceTokenId);

    if (!sourceToken) return;
    if (hasEffect(sourceToken, "concentrate")) return;

    applyEffect(sourceToken, "concentrate");
  }

  function optionIsTrue(args, optionName, defaultValue) {
    const value = getOptionValue(args, optionName);

    if (value === null) return defaultValue;

    return value === "true" || value === "1" || value === "yes";
  }

    function cleanAoeHazardTriggers(value) {
    return String(value || "startOfTurn")
      .toLowerCase()
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);
  }

  function hazardDisplayName(token, name) {
    if (!name || name === "@name") return tokenName(token);
    return String(name).replace(/_/g, " ");
  }

  function resolveHazardSourceTokenId(value, hazardToken) {
    if (!value || value === "none") return null;
    if (value === "self" || value === "@self") return hazardToken.id;
    return value;
  }

  function addAoeHazard(args) {
    const hazardToken = getObj("graphic", args[2]);
    const name = hazardToken ? hazardDisplayName(hazardToken, args[3]) : args[3];
    const shapeInput = String(args[4] || "").toLowerCase();
    const shape = shapeInput === "token" ? "token" : "radius";
    const radius = shape === "radius" ? parseInt(args[4], 10) : null;
    const saveKey = args[5];
    const dc = args[6];
    const condition = args[7];
    const duration = args[8];
    const sourceTokenId = hazardToken ? resolveHazardSourceTokenId(args[9], hazardToken) : args[9];
    const damageFormula = args[10] && args[10].toLowerCase() !== "none" ? args[10] : null;
    const damageType = args[11] && args[11].toLowerCase() !== "none" ? args[11] : null;
    const successMode = args[12] && args[12].toLowerCase() !== "none" ? args[12] : "none";
    const triggers = cleanAoeHazardTriggers(args[13]);

    if (!hazardToken || !name || (shape === "radius" && isNaN(radius)) || !normalizeSaveKey(saveKey) || !dc || !condition) {
      sendChat(
        AE,
        "/w gm " +
        "&{template:default} " +
        "{{name=Hazard Debug}} " +
        "{{Token ID=" + args[2] + "}} " +
        "{{Name=" + args[3] + "}} " +
        "{{Shape/Radius=" + args[4] + "}} " +
        "{{Save=" + saveKey + "}} " +
        "{{DC=" + dc + "}} " +
        "{{Condition=" + condition + "}} " +
        "{{Source=" + sourceTokenId + "}}"
      );
      return;
    }

    S.aoeHazards[hazardToken.id] = {
      name: name,
      shape: shape,
      radius: radius,
      saveKey: saveKey,
      dc: dc,
      condition: condition,
      duration: duration || "endOfTurn",
      sourceTokenId: sourceTokenId || null,
      damageFormula: damageFormula,
      damageType: damageType,
      successMode: successMode,
      triggers: triggers
    };

    S.aoeHazardTurnHits[hazardToken.id] = {};

    sendChat(
      AE,
      "/w gm " +
      "&{template:default} " +
      "{{name=AoE Hazard Added}} " +
      "{{Hazard=" + name + "}} " +
      "{{Shape=" + (shape === "token" ? "Token Footprint" : "Radius") + "}} " +
      (shape === "radius" ? "{{Radius=" + radius + " ft}} " : "") +
      "{{Save=" + saveKey + " DC " + dc + "}} " +
      "{{Triggers=" + triggers.join(", ") + "}}"
    );
  }

  function addSelectedAoeHazards(msg, args) {
    const selected = getSelectedTokens(msg);

    if (!selected.length) {
      sendChat(AE, "/w gm Select one or more hazard tokens first.");
      return;
    }

    selected.forEach(token => {
      addAoeHazard([
        "!ae-hazard",
        "add",
        token.id,
        args[2],
        args[3],
        args[4],
        args[5],
        args[6],
        args[7],
        args[8],
        args[9],
        args[10],
        args[11],
        args[12]
      ]);
    });
  }

  function showAoeHazardList() {
    const hazardIds = Object.keys(S.aoeHazards || {});
    const rows = hazardIds.map(id => {
      const hazard = S.aoeHazards[id];
      const token = getObj("graphic", id);
      const shape = hazard.shape || "radius";
      const detail = shape === "radius" ? " — " + hazard.radius + " ft" : "";

      return (hazard.name || "AoE Hazard") +
        " — " +
        shape +
        detail +
        " — " +
        hazard.saveKey +
        " DC " +
        hazard.dc +
        " — " +
        hazard.condition +
        (token ? "" : " — missing token");
    });

    sendChat(
      AE,
      "/w gm &{template:default} " +
      "{{name=AoE Hazards}} " +
      "{{Hazards=" + (rows.join("<br>") || "None") + "}}"
    );
  }

  function removeAoeHazard(hazardTokenId) {
    delete S.aoeHazards[hazardTokenId];
    delete S.aoeHazardTurnHits[hazardTokenId];
  }

  function clearAoeHazards() {
    S.aoeHazards = {};
    S.aoeHazardTurnHits = {};
    sendChat(AE, "/w gm All AoE hazards cleared.");
  }

  function tokenInsideAoeHazard(token, hazardToken, hazard) {
    if (!token || !hazardToken || !hazard) return false;
    if (token.id === hazardToken.id) return false;
    if (token.get("_pageid") !== hazardToken.get("_pageid")) return false;
    if (tokenHasAreaImmunity("hazard", token, hazard.name)) return false;

    if (hazard.shape === "token") {
      return pointInsideTerrainToken(
        {
          x: token.get("left"),
          y: token.get("top")
        },
        hazardToken
      );
    }

    const distance = tokenDistanceFeet(hazardToken, token);

    if (distance === null) return false;

    const tokenRadiusFeet =
      Math.max(token.get("width"), token.get("height")) / 2 / 70 * getPageScale(token);

    const overlapThresholdFeet = tokenRadiusFeet * 0.33;

    return distance <= hazard.radius + overlapThresholdFeet;
  }

  function clearConcentrationAoeHazards(sourceToken) {
    Object.keys(S.aoeHazards).forEach(hazardTokenId => {
      const hazard = S.aoeHazards[hazardTokenId];

      if (!hazard || hazard.sourceTokenId !== sourceToken.id) return;

      const hazardToken = getObj("graphic", hazardTokenId);

      delete S.aoeHazards[hazardTokenId];
      delete S.aoeHazardTurnHits[hazardTokenId];

      if (hazardToken) {
        hazardToken.remove();
      }
    });
  }

  function resetAoeHazardTurnHits() {
    S.aoeHazardTurnHits = {};
  }

  function aoeHazardAlreadyHitThisTurn(hazardTokenId, tokenId) {
    if (!S.aoeHazardTurnHits[hazardTokenId]) {
      S.aoeHazardTurnHits[hazardTokenId] = {};
    }

    return !!S.aoeHazardTurnHits[hazardTokenId][tokenId];
  }

  function markAoeHazardHitThisTurn(hazardTokenId, tokenId) {
    if (!S.aoeHazardTurnHits[hazardTokenId]) {
      S.aoeHazardTurnHits[hazardTokenId] = {};
    }

    S.aoeHazardTurnHits[hazardTokenId][tokenId] = true;
  }

  function aoeHazardTriggerMatches(hazard, timing) {
    const triggers = hazard.triggers || ["startofturn"];

    if (timing === "startOfTurn") return triggers.includes("startofturn");
    if (timing === "endOfTurn") return triggers.includes("endofturn");
    if (timing === "enter") return triggers.includes("enter");
    if (timing === "moveInto") return triggers.includes("moveinto");

    return false;
  }

  function triggerAoeHazard(token, hazardTokenId, hazard) {
    if (aoeHazardAlreadyHitThisTurn(hazardTokenId, token.id)) return;

    markAoeHazardHitThisTurn(hazardTokenId, token.id);

    if (hazard.damageFormula && hazard.damageType) {
      sendChat(
        AE,
        "!se damageone " +
          token.id + " " +
          hazard.saveKey + " " +
          hazard.dc + " " +
          hazard.damageFormula + " " +
          hazard.damageType + " " +
          hazard.successMode
      );
      return;
    }

    sendChat(
      AE,
      "!se save " +
        hazard.condition + " " +
        hazard.saveKey + " " +
        token.id + " " +
        hazard.dc +
        " --duration " + hazard.duration +
        (hazard.sourceTokenId ? " --source " + hazard.sourceTokenId : "")
    );
  }

  function processAoeHazards(token, timing) {
    Object.keys(S.aoeHazards).forEach(hazardTokenId => {
      const hazardToken = getObj("graphic", hazardTokenId);
      const hazard = S.aoeHazards[hazardTokenId];

      if (!hazardToken || !hazard) {
        delete S.aoeHazards[hazardTokenId];
        delete S.aoeHazardTurnHits[hazardTokenId];
        return;
      }

      if (!aoeHazardTriggerMatches(hazard, timing)) return;
      if (!tokenInsideAoeHazard(token, hazardToken, hazard)) return;

      triggerAoeHazard(token, hazardTokenId, hazard);
    });
  }

  function processAoeHazardMoved(hazardToken) {
    const hazard = S.aoeHazards[hazardToken.id];

    if (!hazard || !hazard.triggers || !hazard.triggers.includes("moveinto")) return;

    findObjs({
      type: "graphic",
      subtype: "token",
      pageid: hazardToken.get("_pageid")
    }).forEach(token => {
      if (token.id === hazardToken.id) return;
      if (!tokenInsideAoeHazard(token, hazardToken, hazard)) return;

      triggerAoeHazard(token, hazardToken.id, hazard);
    });
  }

  function cleanDirectionalSide(side) {
    const value = String(side || "top").toLowerCase();

    if (["top", "bottom", "left", "right"].includes(value)) {
      return value;
    }

    return "top";
  }

  function parseDirectionalTriggers(value) {
    return String(value || "enter,endTurn")
      .toLowerCase()
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);
  }

  function addPendingDirectionalHazard(playerId, casterTokenId, hazardName, options) {
    const casterToken = getObj("graphic", casterTokenId);

    if (!casterToken) {
      sendChat(AE, "/w gm Invalid directional hazard caster token.");
      return;
    }

    const pageId = casterToken.get("_pageid");
    const existingTokenIds = {};

    findObjs({
      type: "graphic",
      subtype: "token",
      pageid: pageId
    }).forEach(token => {
      existingTokenIds[token.id] = true;
    });

    S.pendingDirectionalHazards[playerId || "AoEBoom"] = {
      casterTokenId: casterTokenId,
      hazardName: cleanSummonName(hazardName),
      shape: String(options.shape || "rect").toLowerCase(),
      side: cleanDirectionalSide(options.side),
      rangeFeet: parseInt(options.rangeFeet, 10) || 10,
      saveKey: options.saveKey || "dex",
      dc: options.dc || "spell",
      damageFormula: options.damageFormula || "5d8",
      damageType: options.damageType || "Fire",
      successMode: options.successMode || "none",
      sourceTokenId: options.sourceTokenId || casterTokenId,
      adeptType: options.adeptType || null,
      triggers: parseDirectionalTriggers(options.triggers),
      duration: options.duration || "manual",
      pageId: pageId,
      existingTokenIds: existingTokenIds,
      created: Date.now()
    };

    if (options.duration === "concentration") {
      applyEffect(casterToken, "concentrate");
    }

    schedulePendingDirectionalHazardClaim(playerId || "AoEBoom");
  }

  function schedulePendingDirectionalHazardClaim(playerId) {
    let attempts = 0;

    function tryClaim() {
      attempts += 1;

      const pending = S.pendingDirectionalHazards[playerId];

      if (!pending) return;

      if (attempts > 60) {
        delete S.pendingDirectionalHazards[playerId];
        sendChat(AE, "/w gm Pending directional hazard expired.");
        return;
      }

      const pageTokens = findObjs({
        type: "graphic",
        subtype: "token",
        pageid: pending.pageId
      });

      for (const token of pageTokens) {
        if (pending.existingTokenIds && pending.existingTokenIds[token.id]) continue;

        if (claimPendingDirectionalHazard(token)) return;
      }

      setTimeout(tryClaim, 250);
    }

    setTimeout(tryClaim, 250);
  }

  function claimPendingDirectionalHazard(hazardToken) {
    const tokenNameValue = cleanSummonName(hazardToken.get("name"));
    const characterId = hazardToken.get("represents");
    const character = characterId ? getObj("character", characterId) : null;
    const characterNameValue = character ? cleanSummonName(character.get("name")) : "";
    const now = Date.now();
    let claimed = false;

    Object.keys(S.pendingDirectionalHazards).forEach(playerId => {
      const pending = S.pendingDirectionalHazards[playerId];

      if (!pending || claimed) return;

      if (now - pending.created > 30000) {
        delete S.pendingDirectionalHazards[playerId];
        return;
      }

      if (pending.pageId && pending.pageId !== hazardToken.get("_pageid")) return;

      const nameMatches =
        !pending.hazardName ||
        pending.hazardName === tokenNameValue ||
        pending.hazardName === characterNameValue ||
        tokenNameValue.indexOf(pending.hazardName) === 0 ||
        characterNameValue.indexOf(pending.hazardName) === 0;

      if (!nameMatches) return;

      S.directionalHazards[hazardToken.id] = {
        casterTokenId: pending.casterTokenId,
        shape: pending.shape,
        side: pending.side,
        rangeFeet: pending.rangeFeet,
        saveKey: pending.saveKey,
        dc: pending.dc,
        damageFormula: pending.damageFormula,
        damageType: pending.damageType,
        successMode: pending.successMode,
        sourceTokenId: pending.sourceTokenId,
        adeptType: pending.adeptType,
        triggers: pending.triggers,
        duration: pending.duration
      };

      delete S.pendingDirectionalHazards[playerId];
      claimed = true;

      sendChat(
        AE,
        "/w gm " +
        "&{template:default} " +
        "{{name=Directional Hazard Linked}} " +
        "{{Hazard=" + tokenName(hazardToken) + "}} " +
        "{{Side=" + pending.side + "}} " +
        "{{Range=" + pending.rangeFeet + " ft}} " +
        "{{Damage=" + pending.damageFormula + " " + pending.damageType + "}}"
      );
    });

    return claimed;
  }

  function clearConcentrationDirectionalHazards(sourceToken) {
    Object.keys(S.directionalHazards).forEach(hazardTokenId => {
      const hazard = S.directionalHazards[hazardTokenId];

      if (!hazard || hazard.duration !== "concentration" || hazard.casterTokenId !== sourceToken.id) return;

      delete S.directionalHazards[hazardTokenId];
      delete S.directionalHazardTurnHits[hazardTokenId];
    });
  }

  function clearDirectionalHazardByToken(token) {
    delete S.directionalHazards[token.id];
    delete S.directionalHazardTurnHits[token.id];
  }

  function localPointForDirectionalHazard(point, hazardToken) {
    const rotation = -(Number(hazardToken.get("rotation")) || 0) * Math.PI / 180;
    const dx = point.x - hazardToken.get("left");
    const dy = point.y - hazardToken.get("top");

    return {
      x: dx * Math.cos(rotation) - dy * Math.sin(rotation),
      y: dx * Math.sin(rotation) + dy * Math.cos(rotation)
    };
  }

  function tokenInsideDirectionalHazardZone(token, hazardToken, hazard) {
    if (!token || !hazardToken || !hazard) return false;
    if (token.id === hazardToken.id) return false;
    if (!token.get("represents")) return false;
    if (token.get("_pageid") !== hazardToken.get("_pageid")) return false;

    const scale = getPageScale(hazardToken);
    const rangePixels = (hazard.rangeFeet || 10) * 70 / scale;
    const halfWidth = hazardToken.get("width") / 2;
    const halfHeight = hazardToken.get("height") / 2;
    const point = localPointForDirectionalHazard({
      x: token.get("left"),
      y: token.get("top")
    }, hazardToken);

    const insideHazard =
      Math.abs(point.x) <= halfWidth &&
      Math.abs(point.y) <= halfHeight;

    if (insideHazard) return true;

    if (hazard.side === "top") {
      return Math.abs(point.x) <= halfWidth &&
        point.y < -halfHeight &&
        point.y >= -halfHeight - rangePixels;
    }

    if (hazard.side === "bottom") {
      return Math.abs(point.x) <= halfWidth &&
        point.y > halfHeight &&
        point.y <= halfHeight + rangePixels;
    }

    if (hazard.side === "left") {
      return Math.abs(point.y) <= halfHeight &&
        point.x < -halfWidth &&
        point.x >= -halfWidth - rangePixels;
    }

    if (hazard.side === "right") {
      return Math.abs(point.y) <= halfHeight &&
        point.x > halfWidth &&
        point.x <= halfWidth + rangePixels;
    }

    return false;
  }

  function getDirectionalHazardTurnKey() {
    return S.lastActiveTokenId || "no-turn";
  }

  function directionalHazardAlreadyHitThisTurn(hazardTokenId, tokenId) {
    const turnKey = getDirectionalHazardTurnKey();

    if (!S.directionalHazardTurnHits[hazardTokenId]) {
      S.directionalHazardTurnHits[hazardTokenId] = {};
    }

    if (!S.directionalHazardTurnHits[hazardTokenId][turnKey]) {
      S.directionalHazardTurnHits[hazardTokenId][turnKey] = {};
    }

    return !!S.directionalHazardTurnHits[hazardTokenId][turnKey][tokenId];
  }

  function markDirectionalHazardHitThisTurn(hazardTokenId, tokenId) {
    const turnKey = getDirectionalHazardTurnKey();

    if (!S.directionalHazardTurnHits[hazardTokenId]) {
      S.directionalHazardTurnHits[hazardTokenId] = {};
    }

    if (!S.directionalHazardTurnHits[hazardTokenId][turnKey]) {
      S.directionalHazardTurnHits[hazardTokenId][turnKey] = {};
    }

    S.directionalHazardTurnHits[hazardTokenId][turnKey][tokenId] = true;
  }

  function triggerDirectionalHazardDamage(token, hazardTokenId, hazard, reason) {
    if (directionalHazardAlreadyHitThisTurn(hazardTokenId, token.id)) return;

    markDirectionalHazardHitThisTurn(hazardTokenId, token.id);

    sendChat(
      AE,
      "!se damagebatch " +
      (hazard.saveKey || "dex") + " " +
      (hazard.dc || "spell") + " " +
      hazard.damageFormula + " " +
      hazard.damageType + " " +
      (hazard.successMode || "none") + " " +
      token.id +
      ((hazard.sourceTokenId || hazard.casterTokenId) ? " --source " + (hazard.sourceTokenId || hazard.casterTokenId) : "") +
      (hazard.adeptType ? " --adept " + hazard.adeptType : "")
    );

    sendChat(
      AE,
      "/w gm " +
      "&{template:default} " +
      "{{name=Directional Hazard}} " +
      "{{Target=" + tokenName(token) + "}} " +
      "{{Trigger=" + reason + "}} " +
      "{{Damage=" + hazard.damageFormula + " " + hazard.damageType + "}}"
    );
  }

  function processDirectionalHazards(token, timing) {
    Object.keys(S.directionalHazards).forEach(hazardTokenId => {
      const hazardToken = getObj("graphic", hazardTokenId);
      const hazard = S.directionalHazards[hazardTokenId];

      if (!hazardToken || !hazard) {
        delete S.directionalHazards[hazardTokenId];
        delete S.directionalHazardTurnHits[hazardTokenId];
        return;
      }

      if (timing === "movement" && !hazard.triggers.includes("enter")) return;
      if (timing === "endOfTurn" && !hazard.triggers.includes("endturn")) return;

      if (!tokenInsideDirectionalHazardZone(token, hazardToken, hazard)) return;

      triggerDirectionalHazardDamage(
        token,
        hazardTokenId,
        hazard,
        timing === "movement" ? "Entered hazard." : "Ended turn in hazard."
      );
    });
  }

  function isVisualEffectToken(token) {
    if (!token) return false;

    if (S.visualLinks && S.visualLinks[token.id]) return true;

    const name = String(token.get("name") || "").toLowerCase();
    const represents = token.get("represents");

    if (!represents) return false;

    return (
      name.indexOf("wall of fire") !== -1 ||
      name.indexOf("visual") !== -1 ||
      name.indexOf("spell effect") !== -1 ||
      name.indexOf("template") !== -1
    );
  }

  function cleanupVisualEffectTokens(includeNamedRelics) {
    let removed = 0;

    Object.keys(S.visualLinks || {}).forEach(tokenId => {
      const token = getObj("graphic", tokenId);

      if (token) {
        token.remove();
        removed++;
      }

      delete S.visualLinks[tokenId];
    });

    if (includeNamedRelics) {
      findObjs({
        type: "graphic",
        subtype: "token"
      }).forEach(token => {
        const name = String(token.get("name") || "").toLowerCase();

        if (
          name.indexOf("wall of fire") !== -1 ||
          name.indexOf("spell effect") !== -1 ||
          name.indexOf("visual") !== -1
        ) {
          token.remove();
          removed++;
        }
      });
    }

    sendChat(AE, "/w gm Removed " + removed + " visual effect token(s).");
  }

  function getTokensInsideAoe(controlToken, aoeData) {
    const pageId = controlToken.get("_pageid");
    const scale = getPageScale(controlToken);

    return findObjs({
      type: "graphic",
      subtype: "token",
      pageid: pageId,
      layer: "objects"
    }).filter(token => {
      if (token.id === controlToken.id) return false;
      if (!aoeData.affectsCaster && token.id === aoeData.casterTokenId) return false;
      if (!token.get("represents")) return false;
      if (isVisualEffectToken(token)) return false;

      const dx = token.get("left") - controlToken.get("left");
      const dy = token.get("top") - controlToken.get("top");
      const feet = Math.sqrt(dx * dx + dy * dy) / 70 * scale;
      const tokenRadiusFeet = Math.max(token.get("width"), token.get("height")) / 2 / 70 * scale;
      const overlapThresholdFeet = tokenRadiusFeet * 0.33;

      return feet <= aoeData.radius + overlapThresholdFeet;
    });
  }

  function getAoeOptionValue(args, content, optionName) {
    const escapedOptionName = optionName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pipeMatch = String(content || "").match(
      new RegExp(
        "(?:^|\\s)" +
        escapedOptionName +
        "\\|([\\s\\S]*?)(?=\\s+--[A-Za-z][A-Za-z0-9-]*(?:\\||\\s)|$)",
        "i"
      )
    );

    if (pipeMatch) {
      return pipeMatch[1].trim() || null;
    }

    return getOptionValue(args, optionName);
  }

  function parseAoeTokenSize(sizeInput) {
    if (!sizeInput) return null;

    const parts = String(sizeInput)
      .toLowerCase()
      .split(/[x,]/)
      .map(value => parseFloat(value.trim()));

    if (
      !parts.length ||
      parts.length > 2 ||
      parts.some(value => !Number.isFinite(value) || value <= 0)
    ) {
      return null;
    }

    const widthUnits = parts[0];
    const heightUnits = parts.length === 2 ? parts[1] : parts[0];

    return {
      width: Math.round(widthUnits * 70),
      height: Math.round(heightUnits * 70),
      display: widthUnits + " x " + heightUnits
    };
  }

  function captureAoePlacementAura(token) {
    return {
      radius: token.get("aura1_radius"),
      color: token.get("aura1_color"),
      square: token.get("aura1_square"),
      showPlayers: token.get("showplayers_aura1")
    };
  }

  function applyAoePlacementAura(token, range, color) {
    token.set({
      aura1_radius: range,
      aura1_color: color || "#ffff00",
      aura1_square: false,
      showplayers_aura1: true
    });
  }

  function restoreAoePlacementAura(aoeData) {
    if (!aoeData || !aoeData.placementAura) return;

    const casterToken = getObj("graphic", aoeData.casterTokenId);

    if (casterToken) {
      casterToken.set({
        aura1_radius: aoeData.placementAura.radius,
        aura1_color: aoeData.placementAura.color,
        aura1_square: aoeData.placementAura.square,
        showplayers_aura1: aoeData.placementAura.showPlayers
      });
    }

    aoeData.placementAura = null;
  }

  function findAoeTokenCharacter(characterName) {
    const normalizedName = String(characterName || "").trim().toLowerCase();

    if (!normalizedName) return [];

    return findObjs({
      type: "character"
    }).filter(character => {
      return String(character.get("name") || "").trim().toLowerCase() === normalizedName;
    });
  }

  async function castAoe(args, playerId, content) {
    const name = args[2];
    const casterTokenId = args[3];
    const radius = parseInt(args[4], 10);
    const saveKey = args[5];
    const dcInput = args[6];
    const conditionNameInput = getAoeOptionValue(args, content, "--condition");
    const conditionName = conditionNameInput ?
      String(conditionNameInput).trim().toLowerCase() :
      null;
    const effectType = conditionName ? "condition" : "damage";
    const duration =
      getAoeOptionValue(args, content, "--duration") ||
      (conditionName && CONDITIONS[conditionName] ? CONDITIONS[conditionName].duration : null);
    const damageFormula = effectType === "damage" ? args[7] : null;
    const damageType = effectType === "damage" ? args[8] : null;
    const successMode = effectType === "damage" ? args[9] : null;
    const tokenCharacterName =
      getAoeOptionValue(args, content, "--token") ||
      "AoEControlToken";
    const sizeInput = getAoeOptionValue(args, content, "--size");
    const tokenSize = parseAoeTokenSize(sizeInput);
    const placementRangeInput = getAoeOptionValue(args, content, "--range");
    const placementRange = placementRangeInput ?
      parseFloat(placementRangeInput) :
      null;
    const placementColor =
      getAoeOptionValue(args, content, "--rangeColor") ||
      "#ffff00";

    const casterToken = getObj("graphic", casterTokenId);

    if (!name || !casterToken || isNaN(radius) || radius < 0 || !normalizeSaveKey(saveKey) || !dcInput) {
      sendChat(AE, "/w gm Format: !ae-aoe cast NAME CASTER_ID RADIUS SAVE DC DAMAGE TYPE half/none [--token|CHARACTER NAME] [--size|WIDTH,HEIGHT] [--range|FEET] | !ae-aoe cast NAME CASTER_ID RADIUS SAVE DC --condition|CONDITION [--duration|DURATION] [--token|CHARACTER NAME] [--size|WIDTH,HEIGHT] [--range|FEET]");
      return;
    }

    if (effectType === "condition" && !CONDITIONS[conditionName]) {
      sendChat(AE, '/w gm Invalid AE condition: "' + conditionName + '".');
      return;
    }

    if (effectType === "damage" && (!damageFormula || !damageType || !successMode)) {
      sendChat(AE, "/w gm Damage AoE format: !ae-aoe cast NAME CASTER_ID RADIUS SAVE DC DAMAGE TYPE half/none");
      return;
    }

    if (effectType === "damage" && successMode !== "half" && successMode !== "none") {
      sendChat(AE, "/w gm AoE success mode must be half or none.");
      return;
    }

    if (sizeInput && !tokenSize) {
      sendChat(AE, "/w gm Invalid AoE token size. Use --size|2 or --size|2,3 with values greater than 0.");
      return;
    }

    if (placementRangeInput && (!Number.isFinite(placementRange) || placementRange <= 0)) {
      sendChat(AE, "/w gm Invalid placement range. Use --range|30 with a value greater than 0.");
      return;
    }

    const dc = await resolveOngoingDamageDc(dcInput, casterTokenId);

    if (dc === null) {
      sendChat(AE, "/w gm Invalid AoE DC.");
      return;
    }

    const matchingCharacters = findAoeTokenCharacter(tokenCharacterName);

    if (!matchingCharacters.length) {
      sendChat(AE, '/w gm No character named "' + tokenCharacterName + '" found.');
      return;
    }

    if (matchingCharacters.length > 1) {
      sendChat(AE, '/w gm Multiple characters are named "' + tokenCharacterName + '". Rename one or use a unique character name.');
      return;
    }

    const character = matchingCharacters[0];

    character.get("defaulttoken", function(defaultToken) {
      if (!defaultToken) {
        sendChat(AE, '/w gm "' + tokenCharacterName + '" has no default token.');
        return;
      }

      const tokenData = JSON.parse(defaultToken);

      delete tokenData._id;
      delete tokenData.id;

      tokenData._pageid = casterToken.get("_pageid");
      tokenData.left = casterToken.get("left");
      tokenData.top = casterToken.get("top");
      tokenData.layer = "objects";
      tokenData.name = name;
      tokenData.represents = character.id;
      tokenData.controlledby = playerId;
      tokenData.aura1_radius = radius;
      tokenData.aura1_color = getOptionValue(args, "--color") || "#ff3300";
      tokenData.showplayers_aura1 = true;

      if (tokenSize) {
        tokenData.width = tokenSize.width;
        tokenData.height = tokenSize.height;
      }

      const controlToken = createObj("graphic", tokenData);
      const placementAura = placementRange ?
        captureAoePlacementAura(casterToken) :
        null;

      S.aoeControls[controlToken.id] = {
        name: name,
        casterTokenId: casterTokenId,
        radius: radius,
        saveKey: saveKey,
        dc: dc,
        effectType: effectType,
        conditionName: conditionName,
        duration: duration,
        damageFormula: damageFormula,
        damageType: damageType,
        successMode: successMode,
        adeptType: getOptionValue(args, "--adept"),
        instant: optionIsTrue(args, "--instant", true),
        affectsCaster: optionIsTrue(args, "--affectsCaster", false),
        placementAura: placementAura
      };

      if (placementRange) {
        applyAoePlacementAura(casterToken, placementRange, placementColor);
      }

      if (optionIsTrue(args, "--concentration", false)) {
        applyEffect(casterToken, "concentrate");
      }

      sendChat(
        AE,
        "/w gm " +
        "&{template:default} " +
        "{{name=AoE Targeting Created}} " +
        "{{Spell=" + name + "}} " +
        "{{Radius=" + radius + " ft}} " +
        "{{Save=" + saveKey + " DC " + dc + "}} " +
        (effectType === "condition" ?
          "{{Condition=" + CONDITIONS[conditionName].display + "}} " +
          "{{Duration=" + duration + "}} " :
          "{{Damage=" + damageFormula + " " + damageType + "}} ") +
        "{{Token=" + tokenCharacterName + "}} " +
        "{{Size=" + (tokenSize ? tokenSize.display : "Default") + "}} " +
        "{{Placement Range=" + (placementRange ? placementRange + " ft" : "None") + "}} " +
        "{{Next=Move the targeting token, then use Trigger AoE.}}"
      );
    });
  }

  function triggerAoe(args) {
    const controlTokenId = args[2];
    const controlToken = getObj("graphic", controlTokenId);
    const aoeData = S.aoeControls[controlTokenId];

    if (!controlToken || !aoeData) {
      sendChat(AE, "/w gm Invalid AoE targeting token.");
      return;
    }

    const targets = getTokensInsideAoe(controlToken, aoeData);

    if (!targets.length) {
      sendChat(AE, "&{template:default} {{name=" + aoeData.name + "}} {{Targets=None}}");
    } else {
      if (aoeData.effectType === "condition") {
        sendChat(
          AE,
          "!se save " +
            aoeData.conditionName + " " +
            aoeData.saveKey + " " +
            targets.map(t => t.id).join(" ") + " " +
            aoeData.dc +
            (aoeData.duration ? " --duration " + aoeData.duration : "") +
            (aoeData.casterTokenId ? " --source " + aoeData.casterTokenId : "")
        );
      } else {
        sendChat(
          AE,
          "!se damagebatch " +
            aoeData.saveKey + " " +
            aoeData.dc + " " +
            aoeData.damageFormula + " " +
            aoeData.damageType + " " +
            aoeData.successMode + " " +
            targets.map(t => t.id).join(" ") +
            (aoeData.casterTokenId ? " --source " + aoeData.casterTokenId : "") +
            (aoeData.adeptType ? " --adept " + aoeData.adeptType : "")
        );
      }

      sendChat(
        AE,
        "/w gm " +
        "&{template:default} " +
        "{{name=AoE Triggered}} " +
        "{{Spell=" + aoeData.name + "}} " +
        "{{Targets=" + targets.length + "}} " +
        "{{Instant=" + (aoeData.instant ? "Yes" : "No") + "}}"
      );
    }

    restoreAoePlacementAura(aoeData);

    if (aoeData.instant) {
      delete S.aoeControls[controlToken.id];
      controlToken.remove();
    }
  }

  function clearAoe(args) {
    const controlTokenId = args[2];
    const controlToken = getObj("graphic", controlTokenId);
    const aoeData = S.aoeControls[controlTokenId];

    restoreAoePlacementAura(aoeData);
    delete S.aoeControls[controlTokenId];

    if (controlToken) {
      controlToken.remove();
    }
  }

  function getConditionLevel(token, conditionName) {
    if (!S.conditionLevels[token.id]) {
      S.conditionLevels[token.id] = {};
    }

    return S.conditionLevels[token.id][conditionName] || null;
  }

  function setConditionLevel(token, conditionName, level) {
    if (!S.conditionLevels[token.id]) {
      S.conditionLevels[token.id] = {};
    }

    S.conditionLevels[token.id][conditionName] = level;
  }

  function clearConditionLevel(token, conditionName) {
    if (!S.conditionLevels[token.id]) return;

    delete S.conditionLevels[token.id][conditionName];
  }

  function getExhaustionLevel(token) {
    return getConditionLevel(token, "exhaustion") || 0;
  }

  function setExhaustionLevel(token, level) {
    const newLevel = Math.max(0, Math.min(6, level));
    const characterId = token.get("represents");

    if (newLevel === 0) {
      removeCondition(token, "exhaustion");
      setUserSheetValue(characterId, "exhaustionpenalty", 0);
      return;
    }

    if (!hasCondition(token, "exhaustion")) {
      applyCondition(token, "exhaustion", newLevel, {});
    } else {
      setConditionLevel(token, "exhaustion", newLevel);
    }

    setUserSheetValue(characterId, "exhaustionpenalty", newLevel * 2);
  }

  function increaseExhaustion(token) {
    setExhaustionLevel(token, getExhaustionLevel(token) + 1);
  }

  function decreaseExhaustion(token) {
    setExhaustionLevel(token, getExhaustionLevel(token) - 1);
  }

  function getStatusMarkers(token) {
    const markers = token.get("statusmarkers");
    if (!markers) return [];
    return markers.split(",").filter(Boolean);
  }

  function setStatusMarker(token, marker, enabled) {
    if (!marker) return;

    let markers = getStatusMarkers(token);
    const hasMarker = markers.includes(marker);

    if (enabled && !hasMarker) {
      markers.push(marker);
    }

    if (!enabled && hasMarker) {
      markers = markers.filter(m => m !== marker);
    }

    token.set("statusmarkers", markers.join(","));
  }

  function setTokenOpacity(token, opacity) {
    token.set("baseOpacity", opacity);
  }

  function applyTokenSizeModifier(token, effectName, tokenSize) {
    if (!tokenSize) return;

    if (!S.tokenSizes[token.id]) {
      S.tokenSizes[token.id] = {};
    }

    if (S.tokenSizes[token.id][effectName]) return;

    S.tokenSizes[token.id][effectName] = {
      width: token.get("width"),
      height: token.get("height")
    };

    token.set({
      width: tokenSize.width,
      height: tokenSize.height
    });
  }

  function removeTokenSizeModifier(token, effectName) {
    if (!S.tokenSizes[token.id]) return;

    const savedSize = S.tokenSizes[token.id][effectName];

    if (!savedSize) return;

    token.set({
      width: savedSize.width,
      height: savedSize.height
    });

    delete S.tokenSizes[token.id][effectName];
  }

  function cleanVisualName(name) {
    return String(name || "").replace(/_/g, " ").trim().toLowerCase();
  }

  function addPendingVisualLink(playerId, casterTokenId, visualName, effectName) {
    const casterToken = getObj("graphic", casterTokenId);

    if (!casterToken) {
      sendChat(AE, "/w gm Invalid visual link caster token.");
      return;
    }

    const pageId = casterToken.get("_pageid");
    const existingTokenIds = {};

    findObjs({
      type: "graphic",
      subtype: "token",
      pageid: pageId
    }).forEach(token => {
      existingTokenIds[token.id] = true;
    });

    S.pendingVisualLinks[playerId] = {
      casterTokenId: casterTokenId,
      visualName: cleanVisualName(visualName),
      effectName: effectName,
      pageId: pageId,
      existingTokenIds: existingTokenIds,
      created: Date.now()
    };

    schedulePendingVisualLinkClaim(playerId);
  }

  function schedulePendingVisualLinkClaim(playerId) {
    let attempts = 0;

    function tryClaim() {
      attempts += 1;

      const pending = S.pendingVisualLinks[playerId];

      if (!pending) return;

      if (attempts > 60) {
        delete S.pendingVisualLinks[playerId];
        sendChat(AE, "/w gm Pending visual link expired.");
        return;
      }

      const pageTokens = findObjs({
        type: "graphic",
        subtype: "token",
        pageid: pending.pageId
      });

      for (const token of pageTokens) {
        if (pending.existingTokenIds && pending.existingTokenIds[token.id]) continue;

        claimPendingVisualLink(token);

        if (!S.pendingVisualLinks[playerId]) return;
      }

      setTimeout(tryClaim, 250);
    }

    setTimeout(tryClaim, 250);
  }

  function claimPendingVisualLink(visualToken) {
    const tokenNameValue = cleanVisualName(visualToken.get("name"));
    const characterId = visualToken.get("represents");
    const character = characterId ? getObj("character", characterId) : null;
    const characterNameValue = character ? cleanVisualName(character.get("name")) : "";
    const now = Date.now();

    Object.keys(S.pendingVisualLinks).forEach(playerId => {
      const pending = S.pendingVisualLinks[playerId];

      if (!pending) return;
      if (now - pending.created > 30000) {
        delete S.pendingVisualLinks[playerId];
        return;
      }

      if (pending.pageId && pending.pageId !== visualToken.get("_pageid")) return;

      const nameMatches =
        pending.visualName === tokenNameValue ||
        pending.visualName === characterNameValue ||
        tokenNameValue.indexOf(pending.visualName) === 0 ||
        characterNameValue.indexOf(pending.visualName) === 0;

      if (!nameMatches) return;

      const casterToken = getObj("graphic", pending.casterTokenId);

      if (!casterToken) {
        delete S.pendingVisualLinks[playerId];
        return;
      }

      S.visualLinks[visualToken.id] = {
        casterTokenId: casterToken.id,
        effectName: pending.effectName
      };

      visualToken.set({
        left: casterToken.get("left"),
        top: casterToken.get("top")
      });

      delete S.pendingVisualLinks[playerId];
    });
  }

  function getLinkedVisualToken(casterToken, effectName) {
    const visualTokenId = Object.keys(S.visualLinks).find(tokenId => {
      const link = S.visualLinks[tokenId];

      return link &&
        link.casterTokenId === casterToken.id &&
        link.effectName === effectName;
    });

    return visualTokenId ? getObj("graphic", visualTokenId) : null;
  }

  function removeLinkedVisualToken(casterToken, effectName) {
    const visualToken = getLinkedVisualToken(casterToken, effectName);

    if (!visualToken) return;

    delete S.visualLinks[visualToken.id];
    visualToken.remove();
  }

  function handleVisualTokenDeleted(visualToken) {
    const link = S.visualLinks[visualToken.id];

    if (!link) return;

    delete S.visualLinks[visualToken.id];

    const casterToken = getObj("graphic", link.casterTokenId);

    if (casterToken && hasEffect(casterToken, link.effectName)) {
      removeEffect(casterToken, link.effectName);
    }
  }

  function moveLinkedVisualTokens(casterToken) {
    Object.keys(S.visualLinks).forEach(visualTokenId => {
      const link = S.visualLinks[visualTokenId];

      if (!link || link.casterTokenId !== casterToken.id) return;

      const visualToken = getObj("graphic", visualTokenId);

      if (!visualToken) {
        delete S.visualLinks[visualTokenId];
        return;
      }

      ignoreNextMove(visualToken);

      visualToken.set({
        left: casterToken.get("left"),
        top: casterToken.get("top")
      });

    });
  }

  function getExclusiveEffectKeys(groupName) {
    return EXCLUSIVE_EFFECT_GROUPS[groupName] || [];
  }

    function clearExclusiveEffectGroup(token, groupName) {
    const effectKeys = getExclusiveEffectKeys(groupName);

    effectKeys.forEach(effectKey => {
      const effect = EFFECTS[effectKey];

      delete getEffectStore(token)[effectKey];

      if (effect && effect.marker) {
        setStatusMarker(token, effect.marker, false);
      }
    });
  }

  function clearAllEffects(token) {
    const effectNames = Object.keys(getEffectStore(token));

    effectNames.forEach(effectName => {
      removeEffect(token, effectName);
    });
  }

  function cleanSummonName(name) {
    return String(name || "").replace(/_/g, " ").trim().toLowerCase();
  }

  function normalizePendingSummonCount(value) {
    const count = parseInt(value, 10);

    if (isNaN(count) || count <= 0) {
      return 1;
    }

    return count;
  }

  function normalizePendingSummonTimeout(value) {
    const seconds = parseInt(value, 10);

    if (isNaN(seconds) || seconds <= 0) {
      return 300000;
    }

    return seconds * 1000;
  }

  function normalizeSummonInitiativeMode(value) {
    const mode = String(value || "none").toLowerCase();

    if (
      mode === "none" ||
      mode === "roll" ||
      mode === "group" ||
      mode === "caster" ||
      mode === "value"
    ) {
      return mode;
    }

    return null;
  }

  function buildSummonInitiativeOptions(args) {
    const mode = normalizeSummonInitiativeMode(getOptionValue(args, "--initiative"));

    if (!mode) {
      return {
        error: "Summon initiative must be none, roll, group, caster, or value."
      };
    }

    if (mode === "none") {
      return {
        mode: "none"
      };
    }

    if (mode === "value") {
      const value = parseFloat(getOptionValue(args, "--initiativeValue"));

      if (isNaN(value)) {
        return {
          error: "Summon initiative value mode requires --initiativeValue NUMBER."
        };
      }

      return {
        mode: "value",
        value: value
      };
    }

    return {
      mode: mode,
      value: null,
      groupRoll: null,
      groupRollPending: false,
      queuedTokenIds: []
    };
  }

  async function getSummonInitiativeBonus(summonToken) {
    if (!summonToken) return 0;

    const characterId = summonToken.get("represents");

    if (!characterId) return 0;

    if (typeof getSheetItem !== "function") {
      sendChat(AE, "/w gm getSheetItem is not available for summon initiative.");
      return 0;
    }

    try {
      const rawBonus = await getSheetItem(characterId, "initiative_bonus");
      const bonus = parseFloat(rawBonus);

      if (isNaN(bonus)) return 0;

      return bonus;
    } catch (e) {
      sendChat(AE, "/w gm Could not read summon initiative_bonus.");
      return 0;
    }
  }

  async function rollSummonInitiative(summonToken) {
    const roll = randomInteger(20);
    const bonus = await getSummonInitiativeBonus(summonToken);

    return roll + bonus;
  }

  function getTokenInitiativeValue(token) {
    if (!token) return null;

    const order = getTurnOrder();
    const entry = order.find(turnEntry => turnEntry && turnEntry.id === token.id);

    if (!entry) return null;

    const value = parseFloat(entry.pr);

    if (isNaN(value)) return null;

    return value;
  }

  function addTokenToTurnOrder(token, initiativeValue) {
    if (!token) return;

    const value = parseFloat(initiativeValue);

    if (isNaN(value)) return;

    const order = getTurnOrder();

    if (order.some(entry => entry && entry.id === token.id)) return;

    const pageId = token.get("pageid") || token.get("_pageid");

    const newEntry = {
      id: token.id,
      pr: value,
      _pageid: pageId,
      custom: ""
    };

    if (!order.length) {
      Campaign().set("turnorder", JSON.stringify([newEntry]));

      if (!Campaign().get("initiativepage") && pageId) {
        Campaign().set("initiativepage", pageId);
      }

      return;
    }

    const currentEntry = order[0];
    const currentValue = parseFloat(currentEntry.pr);

    if (isNaN(currentValue)) {
      const rebuiltOrder = [currentEntry].concat(
        order
          .slice(1)
          .concat([newEntry])
          .sort((a, b) => {
            const aValue = parseFloat(a.pr);
            const bValue = parseFloat(b.pr);

            if (isNaN(aValue) && isNaN(bValue)) return 0;
            if (isNaN(aValue)) return 1;
            if (isNaN(bValue)) return -1;

            return bValue - aValue;
          })
      );

      Campaign().set("turnorder", JSON.stringify(rebuiltOrder));

      if (!Campaign().get("initiativepage") && pageId) {
        Campaign().set("initiativepage", pageId);
      }

      return;
    }

    const notYetActed = [];
    const alreadyActed = [];
    const nonNumeric = [];

    order.slice(1).concat([newEntry]).forEach(entry => {
      const entryValue = parseFloat(entry.pr);

      if (isNaN(entryValue)) {
        nonNumeric.push(entry);
        return;
      }

      if (entryValue <= currentValue) {
        notYetActed.push(entry);
      } else {
        alreadyActed.push(entry);
      }
    });

    notYetActed.sort((a, b) => parseFloat(b.pr) - parseFloat(a.pr));
    alreadyActed.sort((a, b) => parseFloat(b.pr) - parseFloat(a.pr));

    Campaign().set(
      "turnorder",
      JSON.stringify([currentEntry].concat(notYetActed, alreadyActed, nonNumeric))
    );

    if (!Campaign().get("initiativepage") && pageId) {
      Campaign().set("initiativepage", pageId);
    }
  }

  function applySummonInitiative(summonToken, casterToken, initiativeOptions) {
    if (!summonToken || !initiativeOptions || initiativeOptions.mode === "none") return;

    if (initiativeOptions.mode === "value") {
      addTokenToTurnOrder(summonToken, initiativeOptions.value);
      return;
    }

    if (initiativeOptions.mode === "caster") {
      const casterInitiative = getTokenInitiativeValue(casterToken);

      if (casterInitiative === null) {
        sendChat(AE, "/w gm Could not add summon to caster initiative because the caster is not in the turn order.");
        return;
      }

      addTokenToTurnOrder(summonToken, casterInitiative);
      return;
    }

    if (initiativeOptions.mode === "roll") {
      rollSummonInitiative(summonToken).then(value => {
        addTokenToTurnOrder(summonToken, value);

        sendChat(
          AE,
          "/w gm " +
          "&{template:default} " +
          "{{name=Summon Initiative}} " +
          "{{Summon=" + tokenName(summonToken) + "}} " +
          "{{Initiative=" + value + "}}"
        );
      });

      return;
    }

    if (initiativeOptions.mode === "group") {
      if (initiativeOptions.groupRoll !== null && initiativeOptions.groupRoll !== undefined) {
        addTokenToTurnOrder(summonToken, initiativeOptions.groupRoll);
        return;
      }

      if (!Array.isArray(initiativeOptions.queuedTokenIds)) {
        initiativeOptions.queuedTokenIds = [];
      }

      if (!initiativeOptions.queuedTokenIds.includes(summonToken.id)) {
        initiativeOptions.queuedTokenIds.push(summonToken.id);
      }

      if (initiativeOptions.groupRollPending) return;

      initiativeOptions.groupRollPending = true;

      rollSummonInitiative(summonToken).then(value => {
        const queuedTokenIds = initiativeOptions.queuedTokenIds || [];

        initiativeOptions.groupRoll = value;
        initiativeOptions.groupRollPending = false;
        initiativeOptions.queuedTokenIds = [];

        queuedTokenIds.forEach(tokenId => {
          const queuedToken = getObj("graphic", tokenId);

          if (queuedToken) {
            addTokenToTurnOrder(queuedToken, value);
          }
        });

        sendChat(
          AE,
          "/w gm " +
          "&{template:default} " +
          "{{name=Summon Group Initiative}} " +
          "{{Initiative=" + value + "}} " +
          "{{Summons=" + queuedTokenIds.length + "}}"
        );
      });

      return;
    }
  }

  function getPendingSummonQueue(playerId) {
    const key = playerId || "unknown";

    if (!S.pendingSummons[key]) {
      S.pendingSummons[key] = [];
    }

    if (!Array.isArray(S.pendingSummons[key])) {
      S.pendingSummons[key] = [S.pendingSummons[key]];
    }

    return S.pendingSummons[key];
  }

  function cleanPendingSummonQueue(playerId) {
    const key = playerId || "unknown";
    const queue = getPendingSummonQueue(key);

    S.pendingSummons[key] = queue.filter(pending =>
      pending &&
      pending.remaining > 0 &&
      Date.now() - pending.created <= (pending.timeoutMs || 30000)
    );

    if (!S.pendingSummons[key].length) {
      delete S.pendingSummons[key];
    }
  }

  function addPendingSummon(playerId, casterTokenId, summonName, concentration, count, timeoutSeconds, controlOptions, initiativeOptions) {
    const casterToken = getObj("graphic", casterTokenId);

    if (!casterToken) {
      sendChat(AE, "/w gm Invalid summon caster token.");
      return;
    }

    const pageId = casterToken.get("_pageid");
    const existingTokenIds = {};
    const summonCount = normalizePendingSummonCount(count);

    findObjs({
      type: "graphic",
      subtype: "token",
      pageid: pageId
    }).forEach(token => {
      existingTokenIds[token.id] = true;
    });

    getPendingSummonQueue(playerId).push({
      casterTokenId: casterTokenId,
      summonName: cleanSummonName(summonName),
      concentration: !!concentration,
      created: Date.now(),
      timeoutMs: normalizePendingSummonTimeout(timeoutSeconds),
      pageId: pageId,
      existingTokenIds: existingTokenIds,
      count: summonCount,
      remaining: summonCount,
      linkedCount: 0,
      controlOptions: controlOptions || null,
      initiativeOptions: initiativeOptions || { mode: "none" }
    });

    if (concentration) {
      applyEffect(casterToken, "concentrate");
    }

    sendChat(
      AE,
      "/w gm Pending summon link saved for " +
      tokenName(casterToken) +
      " (" +
      summonCount +
      " " +
      displayAreaImmunityName(summonName) +
      ")."
    );

    schedulePendingSummonClaim(playerId);
  }

  function schedulePendingSummonClaim(playerId) {
    let attempts = 0;

    function tryClaim() {
      attempts += 1;

      const queue = getPendingSummonQueue(playerId);

      if (!queue.length) return;

      const hasActivePending = queue.some(pending =>
        pending &&
        pending.remaining > 0 &&
        Date.now() - pending.created <= (pending.timeoutMs || 30000)
      );

      if (!hasActivePending) {
        delete S.pendingSummons[playerId];
        sendChat(AE, "/w gm Pending summon link expired.");
        return;
      }

      const pageIds = {};

      queue.forEach(pending => {
        if (pending && pending.pageId) {
          pageIds[pending.pageId] = true;
        }
      });

      Object.keys(pageIds).forEach(pageId => {
        findObjs({
          type: "graphic",
          subtype: "token",
          pageid: pageId
        }).forEach(token => {
          claimPendingSummon(token);
        });
      });

      cleanPendingSummonQueue(playerId);

      if (S.pendingSummons[playerId] && S.pendingSummons[playerId].length) {
        setTimeout(tryClaim, 500);
      }
    }

    setTimeout(tryClaim, 500);
  }

  function summarizeSummonName(name) {
    return displayAreaImmunityName(name || "Summon");
  }

  function announcePendingSummonBatch(pending, casterToken) {
    if (!pending || !casterToken) return;

    sendChat(
      AE,
      "/w gm " +
      "&{template:default} " +
      "{{name=Summons Linked}} " +
      "{{Caster=" + tokenName(casterToken) + "}} " +
      "{{Summons=" + pending.linkedCount + " " + summarizeSummonName(pending.summonName) + "}} " +
      "{{Concentration=" + (pending.concentration ? "Yes" : "No") + "}}"
    );
  }

  function linkSummon(casterToken, summonToken, concentration, silent, controlOptions) {
    if (!casterToken || !summonToken) return;

    S.summons[summonToken.id] = {
      casterTokenId: casterToken.id,
      summonTokenId: summonToken.id,
      concentration: !!concentration,
      control: createSummonControlState(controlOptions)
    };

    if (concentration) {
      applyEffect(casterToken, "concentrate");
    }

    if (silent) return;

    sendChat(
      AE,
      "/w gm " +
      "&{template:default} " +
      "{{name=Summon Linked}} " +
      "{{Caster=" + tokenName(casterToken) + "}} " +
      "{{Summon=" + tokenName(summonToken) + "}} " +
      "{{Concentration=" + (concentration ? "Yes" : "No") + "}}" +
      (controlOptions ? " {{Control=Controlled summon save enabled.}}" : "")
    );
  }

  function createSummonControlState(controlOptions) {
    if (!controlOptions) return null;

    return {
      state: "controlled",
      saveKey: controlOptions.saveKey,
      dcInput: controlOptions.dcInput,
      timing: controlOptions.timing || "endOfTurn",
      saveMode: controlOptions.saveMode || "normal",
      successResult: controlOptions.successResult || "uncontrolled",
      failureResult: controlOptions.failureResult || "controlled",
      lingerOnConcentrationEnd: controlOptions.lingerOnConcentrationEnd || null,
      lingerRemaining: null,
      label: controlOptions.label || "Control Save"
    };
  }

  function normalizeSummonControlTiming(value) {
    const timing = String(value || "endOfTurn");

    if (timing === "startOfTurn" || timing === "endOfTurn") {
      return timing;
    }

    return null;
  }

  function normalizeSummonControlSaveMode(value) {
    const mode = String(value || "normal").toLowerCase();

    if (mode === "advantage" || mode === "disadvantage" || mode === "normal") {
      return mode;
    }

    return null;
  }

  function normalizeSummonControlResult(value) {
    const result = String(value || "").toLowerCase();

    if (result === "controlled" || result === "uncontrolled" || result === "remove" || result === "none") {
      return result;
    }

    return null;
  }

  function buildSummonControlOptions(args) {
    const rawSaveKey = getOptionValue(args, "--controlSave");

    if (!rawSaveKey) return null;

    const saveKey = normalizeSaveKey(rawSaveKey);

    if (!saveKey || saveKey === "all" || saveKey === "concentration") {
      return {
        error: "Invalid summon control save. Use str, dex, con, int, wis, or cha."
      };
    }

    const dcInput = getOptionValue(args, "--dc") || getOptionValue(args, "--controlDc");

    if (!dcInput) {
      return {
        error: "Summon control requires --dc spell or --dc NUMBER."
      };
    }

    const timing = normalizeSummonControlTiming(getOptionValue(args, "--saveTiming") || getOptionValue(args, "--timing"));

    if (!timing) {
      return {
        error: "Summon control timing must be startOfTurn or endOfTurn."
      };
    }

    const saveMode = normalizeSummonControlSaveMode(getOptionValue(args, "--saveMode"));

    if (!saveMode) {
      return {
        error: "Summon control save mode must be normal, advantage, or disadvantage."
      };
    }

    const successResult = normalizeSummonControlResult(getOptionValue(args, "--success") || "uncontrolled");
    const failureResult = normalizeSummonControlResult(getOptionValue(args, "--failure") || "controlled");

    if (!successResult || !failureResult) {
      return {
        error: "Summon control success/failure must be controlled, uncontrolled, remove, or none."
      };
    }

    return {
      saveKey: saveKey,
      dcInput: dcInput,
      timing: timing,
      saveMode: saveMode,
      successResult: successResult,
      failureResult: failureResult,
      lingerOnConcentrationEnd: getOptionValue(args, "--lingerOnConcentrationEnd"),
      label: displayAreaImmunityName(getOptionValue(args, "--label") || "Control Save")
    };
  }

  function rollRoundFormula(value) {
    const text = String(value || "").trim().toLowerCase();

    if (!text) return null;

    const flat = parseInt(text, 10);

    if (!isNaN(flat) && String(flat) === text) {
      return Math.max(0, flat);
    }

    const match = text.match(/^(\d+)d(\d+)$/);

    if (!match) return null;

    const count = parseInt(match[1], 10);
    const sides = parseInt(match[2], 10);
    let total = 0;

    if (isNaN(count) || isNaN(sides) || count <= 0 || sides <= 0) {
      return null;
    }

    for (let i = 0; i < count; i++) {
      total += randomInteger(sides);
    }

    return total;
  }

  function applySummonControlOutcome(summonToken, linked, outcome, result) {
    if (!summonToken || !linked || !linked.control || !outcome || outcome === "none") return;

    const control = linked.control;

    if (outcome === "remove") {
      summonToken.remove();
      return;
    }

    if (outcome === "controlled" || outcome === "uncontrolled") {
      const oldState = control.state;
      control.state = outcome;

      if (oldState !== outcome) {
        sendChat(
          AE,
          "/w gm " +
          "&{template:default} " +
          "{{name=Summon Control Changed}} " +
          "{{Summon=" + tokenName(summonToken) + "}} " +
          "{{State=" + oldState + " → " + outcome + "}} " +
          "{{Reason=" + (result && result.success ? "Save succeeded." : "Save failed.") + "}}"
        );
      }
    }
  }

  function processSummonControlLinger(summonToken, linked) {
    if (!summonToken || !linked || !linked.control) return false;

    const control = linked.control;

    if (control.state !== "uncontrolled") return false;
    if (control.lingerRemaining === null || control.lingerRemaining === undefined) return false;

    control.lingerRemaining -= 1;

    if (control.lingerRemaining > 0) {
      sendChat(
        AE,
        "/w gm " +
        "&{template:default} " +
        "{{name=Summon Lingering}} " +
        "{{Summon=" + tokenName(summonToken) + "}} " +
        "{{Rounds Remaining=" + control.lingerRemaining + "}}"
      );
      return true;
    }

    delete S.summons[summonToken.id];
    summonToken.remove();

    sendChat(
      AE,
      "/w gm " +
      "&{template:default} " +
      "{{name=Summon Linger Ended}} " +
      "{{Summon=" + tokenName(summonToken) + "}}"
    );

    return true;
  }

  function processSummonControlSave(summonToken, timing) {
    const linked = S.summons[summonToken.id];

    if (!linked || !linked.control) return;

    const control = linked.control;

    if (timing === "endOfTurn" && processSummonControlLinger(summonToken, linked)) {
      return;
    }

    if (control.state !== "controlled") return;
    if (control.timing !== timing) return;

    if (
      typeof SaveEffectsAPI === "undefined" ||
      !SaveEffectsAPI ||
      typeof SaveEffectsAPI.rollSave !== "function"
    ) {
      sendChat(AE, "/w gm SaveEffectsAPI.rollSave is not available for summon control save.");
      return;
    }

    SaveEffectsAPI.rollSave({
      targetTokenId: summonToken.id,
      sourceTokenId: linked.casterTokenId,
      saveKey: control.saveKey,
      dc: control.dcInput,
      mode: control.saveMode,
      title: control.label,
      successText: "Control breaks.",
      failureText: "Control continues."
    }).then(result => {
      if (!result) return;

      applySummonControlOutcome(
        summonToken,
        linked,
        result.success ? control.successResult : control.failureResult,
        result
      );
    });
  }

  function summonMatchesPending(summonToken, pending) {
    if (!summonToken || !pending) return false;
    if (pending.remaining <= 0) return false;
    if (pending.pageId && pending.pageId !== summonToken.get("_pageid")) return false;
    if (pending.existingTokenIds && pending.existingTokenIds[summonToken.id]) return false;

    const tokenNameValue = cleanSummonName(summonToken.get("name"));
    const characterId = summonToken.get("represents");
    const character = characterId ? getObj("character", characterId) : null;
    const characterNameValue = character ? cleanSummonName(character.get("name")) : "";

    return (
      !pending.summonName ||
      pending.summonName === tokenNameValue ||
      pending.summonName === characterNameValue ||
      tokenNameValue.indexOf(pending.summonName) === 0 ||
      characterNameValue.indexOf(pending.summonName) === 0
    );
  }

function claimPendingSummon(summonToken) {
    const now = Date.now();
    let claimed = false;

    Object.keys(S.pendingSummons).forEach(playerId => {
      const queue = getPendingSummonQueue(playerId);

      queue.forEach(pending => {
        if (claimed) return;
        if (!pending) return;

        if (now - pending.created > (pending.timeoutMs || 30000)) {
          pending.remaining = 0;
          return;
        }

        if (!summonMatchesPending(summonToken, pending)) return;

        const casterToken = getObj("graphic", pending.casterTokenId);

        if (casterToken) {
          const isBatch = pending.count && pending.count > 1;

          linkSummon(casterToken, summonToken, pending.concentration, isBatch, pending.controlOptions);
          applySummonInitiative(summonToken, casterToken, pending.initiativeOptions);

          if (isBatch) {
            pending.linkedCount = (pending.linkedCount || 0) + 1;
          }
        }

        if (!pending.existingTokenIds) {
          pending.existingTokenIds = {};
        }

        pending.existingTokenIds[summonToken.id] = true;
        pending.remaining -= 1;

        if (
          casterToken &&
          pending.count &&
          pending.count > 1 &&
          pending.remaining <= 0
        ) {
          announcePendingSummonBatch(pending, casterToken);
        }

        claimed = true;
      });

      cleanPendingSummonQueue(playerId);
    });

    return claimed;
  }

function clearConcentrationSummons(casterToken) {
    Object.keys(S.summons).forEach(summonTokenId => {
      const linked = S.summons[summonTokenId];

      if (
        linked &&
        linked.concentration &&
        linked.casterTokenId === casterToken.id
      ) {
        const summonToken = getObj("graphic", summonTokenId);

        if (
          linked.control &&
          linked.control.state === "uncontrolled" &&
          linked.control.lingerOnConcentrationEnd
        ) {
          const lingerRounds = rollRoundFormula(linked.control.lingerOnConcentrationEnd);

          linked.concentration = false;
          linked.control.lingerRemaining = lingerRounds === null ? 0 : lingerRounds;

          sendChat(
            AE,
            "/w gm " +
            "&{template:default} " +
            "{{name=Uncontrolled Summon Lingers}} " +
            "{{Summon=" + (summonToken ? tokenName(summonToken) : summonTokenId) + "}} " +
            "{{Rounds=" + linked.control.lingerRemaining + "}}"
          );

          if (linked.control.lingerRemaining > 0) {
            return;
          }
        }

        delete S.summons[summonTokenId];

        if (summonToken) {
          summonToken.remove();
        }
      }
    });
  }

  function handleSummonDeleted(summonToken) {
    const linked = S.summons[summonToken.id];

    if (!linked) return;

    delete S.summons[summonToken.id];

    if (!linked.concentration) return;

    const hasRemainingConcentrationSummon = Object.keys(S.summons).some(summonTokenId => {
      const other = S.summons[summonTokenId];

      return other &&
        other.concentration &&
        other.casterTokenId === linked.casterTokenId;
    });

    if (hasRemainingConcentrationSummon) return;

    const casterToken = getObj("graphic", linked.casterTokenId);

    if (casterToken && hasEffect(casterToken, "concentrate")) {
      removeEffect(casterToken, "concentrate");
    }
  }

  function clearConcentrationEffects(token) {
    const effectNames = Object.keys(getEffectStore(token));

    effectNames.forEach(effectName => {
      const effect = EFFECTS[effectName];

      if (effect && effect.concentration) {
        removeEffect(token, effectName);
      }
    });

    clearConcentrationEffectsBySource(token);
    clearConcentrationConditions(token);
    clearConcentrationOngoingDamage(token);
    clearConcentrationAoeHazards(token);
    clearConcentrationDirectionalHazards(token);
    clearConcentrationSummons(token);
  }

  function clearConcentrationEffectsBySource(sourceToken) {
    Object.keys(S.effects).forEach(tokenId => {
      const target = getObj("graphic", tokenId);
      if (!target) return;

      const store = getEffectStore(target);

      Object.keys(store).forEach(effectName => {
        const stored = store[effectName];

        if (
          stored &&
          stored.sourceTokenId === sourceToken.id
        ) {
          removeEffect(target, effectName);
        }
      });
    });
  }

  function clearConcentrationConditions(sourceToken) {
    Object.keys(S.conditions).forEach(tokenId => {
      const target = getObj("graphic", tokenId);
      if (!target) return;

      const store = getConditionStore(target);

      Object.keys(store).forEach(conditionName => {
        const stored = store[conditionName];

        if (
          stored &&
          stored.durationOverride === "concentration" &&
          stored.sourceTokenId === sourceToken.id
        ) {
          removeCondition(target, conditionName);
        }
      });
    });
  }

  function clearAllConditions(token) {
    const conditionNames = Object.keys(getConditionStore(token));

    conditionNames.forEach(conditionName => {
      removeCondition(token, conditionName);
    });
  }

  function applyEffect(token, effectName, options) {
    const effect = EFFECTS[effectName];
    options = options || {};

    if (!effect) {
      getEffectStore(token)[effectName] = true;
      return;
    }

    if (effect.requiresEffect && !hasEffect(token, effect.requiresEffect)) {
      return;
    }

    if (effect.exclusiveGroup) {
      clearExclusiveEffectGroup(token, effect.exclusiveGroup);
    }

    const durationOverride = options.durationOverride || null;
    const sourceTokenId = options.sourceTokenId || null;

    getEffectStore(token)[effectName] = {
      applied: Date.now(),
      durationOverride: durationOverride,
      sourceTokenId: sourceTokenId
    };

    setStatusMarker(token, effect.marker, true);
    applyRegistrySheetValue(token, effectName);

    if (effectName === "extrabonus") {
      getEconomy(token).extraBonus += 1;
    }

    if (effectName === "aid") {
      applyAidHp(token, 5);
    }

    if (effect.attributeModifier) {
      applyAttributeModifier(
        token,
        effectName,
        effect.attributeModifier.attrName,
        effect.attributeModifier.amount
      );
    }

    if (effect.tokenSize) {
      applyTokenSizeModifier(token, effectName, effect.tokenSize);
    }

    if (effectName !== "concentrate") {
      applySourceConcentration(durationOverride, sourceTokenId);
    }
  }

  function removeEffect(token, effectName) {
    const effect = EFFECTS[effectName];

    if (effectName === "mounted") {
      releaseMountRelationship(token);
    }

    delete getEffectStore(token)[effectName];

     if (effect) {
      setStatusMarker(token, effect.marker, false);
      removeRegistrySheetValue(token, effectName);
      removeAttributeModifier(token, effectName);
      removeTokenSizeModifier(token, effectName);
      removeLinkedVisualToken(token, effectName);

      if (effect.sheetValue === "rageDamage") {
        playRageEndEffects(token);
      }
    }

    if (effect && effect.exclusiveGroup) {
      clearExclusiveEffectGroup(token, effect.exclusiveGroup);
    }

    if (effectName === "concentrate") {
      clearConcentrationEffects(token);
    }

    if (effectName === "extrabonus") {
      getEconomy(token).extraBonus =
        Math.max(0, getEconomy(token).extraBonus - 1);
    }

    if (effectName === "aid") {
      removeAidHp(token);
    }

    if (effectName === "haste") {
      getEconomy(token).hasteAction = false;
      resetMovement(token);
    }

    if (effectName === "dash") {
      const speed = getEffectiveSpeed(token);
      const current = parseFloat(token.get("bar3_value")) || 0;
      const max = parseFloat(token.get("bar3_max")) || speed;

      setMovementBar(token, current - speed, max - speed);
    }
  }

  function initializeActiveHasteModifiers() {
    Object.keys(S.effects).forEach(tokenId => {
      const token = getObj("graphic", tokenId);

      if (!token || !hasEffect(token, "haste")) return;

      applyAttributeModifier(token, "haste", "ac", 2);
    });
  }

  initializeActiveHasteModifiers();

  function applyCondition(token, conditionName, level, options) {
    const condition = CONDITIONS[conditionName];

    if (!condition) {
      getConditionStore(token)[conditionName] = true;
      return;
    }

    if (hasConditionImmunity(token, conditionName)) {
      sendChat(
        AE,
        "/w gm " + tokenName(token) + " is immune to " + registryDisplayName(CONDITIONS, conditionName) + "."
      );
      return;
    }

    const durationOverride = options && options.durationOverride ? options.durationOverride : null;
    const sourceTokenId = options && options.sourceTokenId ? options.sourceTokenId : null;
    const repeatSaveTiming = options && options.repeatSaveTiming ? options.repeatSaveTiming : null;
    const repeatSaveKey = options && options.repeatSaveKey ? options.repeatSaveKey : null;
    const repeatSaveDc = options && options.repeatSaveDc ? parseInt(options.repeatSaveDc, 10) : null;
    const repeatSaveSuccess = options && options.repeatSaveSuccess ? options.repeatSaveSuccess : null;

    getConditionStore(token)[conditionName] = {
      applied: Date.now(),
      durationOverride: durationOverride,
      sourceTokenId: sourceTokenId,
      repeatSave:
        repeatSaveTiming &&
        repeatSaveKey &&
        !isNaN(repeatSaveDc) ?
        {
          timing: repeatSaveTiming,
          saveKey: repeatSaveKey,
          dc: repeatSaveDc,
          success: repeatSaveSuccess || "remove"
        } :
        null,
      skipCurrentSourceTurnEnd:
        durationOverride === "casterNextTurn" &&
        sourceTokenId &&
        S.lastActiveTokenId === sourceTokenId
    };

    if (conditionName === "exhaustion") {
      const cleanLevel = Math.max(1, Math.min(6, parseInt(level, 10) || 1));
      setConditionLevel(token, "exhaustion", cleanLevel);
    }

    setStatusMarker(token, condition.marker, true);

    if (conditionName === "invisible") {
      setTokenOpacity(token, 0.5);
    }

    applySourceConcentration(durationOverride, sourceTokenId);
  }

  function removeCondition(token, conditionName) {
    const condition = CONDITIONS[conditionName];

    if (conditionName === "disarmed") {
      clearDisarmedItems(token);
    }

    delete getConditionStore(token)[conditionName];

        if (condition) {
      setStatusMarker(token, condition.marker, false);
    }

    if (conditionName === "invisible") {
      setTokenOpacity(token, 1);
    }

    clearConditionLevel(token, conditionName);

    if (conditionName === "exhaustion") {
      setUserSheetValue(token.get("represents"), "exhaustionpenalty", 0);
      clearConditionLevel(token, "exhaustion");
    }

    if (!hasMovementLockCondition(token)) {
      unlockMovement(token);
    }

    if (!hasEconomyLockCondition(token) && S.economyLocks[token.id]) {
      const saved = S.economyLocks[token.id];
      const econ = getEconomy(token);

      econ.action = saved.action;
      econ.bonus = saved.bonus;
      econ.extraBonus = saved.extraBonus;
      econ.hasteAction = saved.hasteAction;

      setAttacksRemaining(token, saved.attacksRemaining);

      delete S.economyLocks[token.id];
    }
  }

  function registryDisplayName(registry, key) {
    return registry[key] && registry[key].display ? registry[key].display : key;
  }

  function exhaustionMechanicalText(level) {
    const penalty = level * 2;
    const speedReduction = level * 5;

    if (level >= 6) {
      return "Death.";
    }

    return "-" + penalty + " to D20 Tests. Speed reduced by " + speedReduction + " feet.";
  }

  function getExhaustionPenalty(token) {
    return getExhaustionLevel(token) * 2;
  }

  function getExhaustionSpeedReduction(token) {
    return getExhaustionLevel(token) * 5;
  }

  function getEffectiveSpeed(token) {
    const baseSpeed = getSpeed(token);
    const reduction = getExhaustionSpeedReduction(token);

    return Math.max(0, baseSpeed - reduction);
  }

  function registryMechanicalListForToken(token, store, registry) {
    const keys = Object.keys(store);
    if (!keys.length) return "None";

    return keys
      .map(key => {
        const entry = registry[key];
        let display = entry && entry.display ? entry.display : key;
        const mechanical = entry && entry.mechanical ? entry.mechanical : "";

        if (key === "exhaustion") {
          const level = getConditionLevel(token, "exhaustion");
          if (level) {
            display = "Exhaustion " + level;
            return display + " — " + exhaustionMechanicalText(level);
          }
        }

        if (!mechanical) {
          return display;
        }

        return display + " — " + mechanical;
      })
      .join("<br>");
  }

    function removeRegisteredMarkers(token, registry) {
    Object.keys(registry).forEach(key => {
      const entry = registry[key];
      if (entry && entry.marker) {
        setStatusMarker(token, entry.marker, false);
      }
    });
  }

  function hasAnyCondition(token, conditionNames) {
    return conditionNames.some(conditionName => hasCondition(token, conditionName));
  }

  function hasMovementLockCondition(token) {
    return hasAnyCondition(token, [
      "grappled",
      "restrained",
      "stunned",
      "paralyzed",
      "incapacitated",
      "unconscious"
    ]);
  }

  function hasEconomyLockCondition(token) {
    return hasAnyCondition(token, [
      "stunned",
      "paralyzed",
      "incapacitated",
      "unconscious",
      "stinkingpoisoned"
    ]);
  }

  function enforceConditions(token) {
    if (hasMovementLockCondition(token)) {
      lockMovement(token);
    }

    if (hasEconomyLockCondition(token)) {
      const econ = getEconomy(token);

      if (!S.economyLocks[token.id]) {
        S.economyLocks[token.id] = {
          action: econ.action,
          bonus: econ.bonus,
          extraBonus: econ.extraBonus,
          hasteAction: econ.hasteAction,
          attacksRemaining: getAttacksRemaining(token)
        };
      }

      econ.action = false;
      econ.bonus = false;
      econ.hasteAction = false;
      setAttacksRemaining(token, 0);
    }
  }

  function triggerConditionEvent(token, eventName) {
    const store = getConditionStore(token);

    Object.keys(store).forEach(conditionName => {
      const condition = CONDITIONS[conditionName];

      if (!condition || !condition.triggers || !condition.triggers[eventName]) return;

      const triggerData = condition.triggers[eventName];

      if (triggerData === "removeSelf") {
        removeCondition(token, conditionName);
      }
    });
  }

  function triggerEffectEvent(token, eventName) {
    const store = getEffectStore(token);

    Object.keys(store).forEach(effectName => {
      const effect = EFFECTS[effectName];
      if (!effect || !effect.triggers) return;

      const triggerName = effect.triggers[eventName];
      if (!triggerName) return;

      runEffectTrigger(token, effectName, triggerName);
    });
  }

  function rollDiceExpression(expression) {
    const match = String(expression).match(/^(\d+)d(\d+)$/i);
    if (!match) return 0;

    const count = parseInt(match[1], 10);
    const sides = parseInt(match[2], 10);
    let total = 0;

    for (let i = 0; i < count; i++) {
      total += randomInteger(sides);
    }

    return total;
  }

  function applyDamageToBar(token, barNumber, amount) {
    const field = "bar" + barNumber + "_value";
    const current = parseInt(token.get(field), 10);

    if (isNaN(current)) return;

    token.set(field, Math.max(0, current - amount));
  }

      function runEffectTrigger(token, effectName, triggerData) {
    if (triggerData === "removeSelf") {
      removeEffect(token, effectName);
      return;
    }

    if (typeof triggerData !== "object") {
      return;
    }

    let damageTotal = null;

    if (triggerData.damage) {
      damageTotal = rollDiceExpression(triggerData.damage);
    }

    if (triggerData.applyDamageToBar && damageTotal !== null) {
      applyDamageToBar(token, triggerData.applyDamageToBar, damageTotal);
    }

    if (triggerData.announce) {
      sendChat(
        AE,
        "/w gm " +
        "&{template:default} " +
        "{{name=" + triggerData.announce + "}} " +
        "{{Target=" + tokenName(token) + "}} " +
        (triggerData.damage ? "{{Damage=" + damageTotal + " " + (triggerData.damageType || "") + "}}" : "") +
        (triggerData.applyDamageToBar ? "{{Applied=Damage applied to Bar " + triggerData.applyDamageToBar + "}}" : "") +
        "{{Effect=" + registryDisplayName(EFFECTS, effectName) + " ends.}}"
      );
    }

    if (triggerData.removeSelf) {
      removeEffect(token, effectName);
    }
  }    

    function clearTokenState(token) {
    const mount = getMountedCreature(token);

    if (mount) {
      clearMovementBar(mount);
    }

    releaseMountRelationship(token);
    clearAllEffects(token);
    clearAllConditions(token);

    delete S.mounts[token.id];

    S.economy[token.id] = {
      action: true,
      bonus: true,
      extraBonus: 0,
      hasteAction: false
    };

    S.attacksRemaining[token.id] = getAttackCount(token);

    unlockMovement(token);
    delete S.ignoreNextMove[token.id];

    clearMovementBar(token);
  }

    function clearEffectsByDuration(token, duration) {
    const store = getEffectStore(token);

    Object.keys(store).forEach(effectName => {
      const effect = EFFECTS[effectName];
      const stored = store[effectName];
      const entryDuration = getStoredEntryDuration(stored, effect);

      if (effect && entryDuration === duration) {
        removeEffect(token, effectName);
      }
    });
  }

  function clearConditionsByDuration(token, duration) {
    const store = getConditionStore(token);

    Object.keys(store).forEach(conditionName => {
      const condition = CONDITIONS[conditionName];

      const stored = store[conditionName];
      const entryDuration = getStoredEntryDuration(stored, condition);

      if (condition && entryDuration === duration) {
        removeCondition(token, conditionName);
      }
    });
  }

  function clearEndOfTurnEffects(token) {
    clearEffectsByDuration(token, "endOfTurn");
  }

  function clearConditionsEndingOnTokenTurnEnd(token) {
    clearConditionsByDuration(token, "endOfTurn");
    clearConditionsByDuration(token, "targetNextTurn");

    Object.keys(S.conditions).forEach(tokenId => {
      const target = getObj("graphic", tokenId);
      if (!target) return;

      const store = getConditionStore(target);

      Object.keys(store).forEach(conditionName => {
        const stored = store[conditionName];

                if (
          stored &&
          stored.durationOverride === "casterNextTurn" &&
          stored.sourceTokenId === token.id
        ) {
          if (stored.skipCurrentSourceTurnEnd) {
            stored.skipCurrentSourceTurnEnd = false;
            return;
          }

          removeCondition(target, conditionName);
        }
      });
    });
  }

  function clearStartOfTurnEffects(token) {
    clearEffectsByDuration(token, "startOfNextTurn");
  }

  function clearCombatDurationEffectsAndConditions(token) {
    clearEffectsByDuration(token, "combat");
    clearConditionsByDuration(token, "combat");
  }

      function clearCombatEffectsIfEnded() {
    const raw = Campaign().get("turnorder");
    if (raw && raw !== "[]") return;

    const tokenIds = {};

    if (S.lastActiveTokenId) {
      tokenIds[S.lastActiveTokenId] = true;
    }

    Object.keys(S.effects).forEach(tokenId => {
      tokenIds[tokenId] = true;
    });

    Object.keys(S.conditions).forEach(tokenId => {
      tokenIds[tokenId] = true;
    });

    Object.keys(S.movementLocked).forEach(tokenId => {
      tokenIds[tokenId] = true;
    });

    Object.keys(tokenIds).forEach(tokenId => {
      const token = getObj("graphic", tokenId);
      if (!token) return;

      clearMovementBar(token);
      clearCombatDurationEffectsAndConditions(token);
    });

    S.movementLocked = {};
    S.ignoreNextMove = {};
    S.lastActiveTokenId = null;
  }

  function spendAction(token) {
    const econ = getEconomy(token);

    if (econ.action) {
      econ.action = false;
      setAttacksRemaining(token, 0);
      return;
    }

    if (econ.hasteAction) {
      econ.hasteAction = false;
    }
  }

  function spendBonus(token) {
    const econ = getEconomy(token);

    if (econ.bonus) {
      econ.bonus = false;
      return;
    }

    if (econ.extraBonus > 0) {
      econ.extraBonus -= 1;
    }
  }

  function useAttack(token) {
    triggerEffectEvent(token, "attack");
    triggerConditionEvent(token, "attack");

    const econ = getEconomy(token);
    let remaining = getAttacksRemaining(token);

    if (econ.action) {
      econ.action = false;
      remaining -= 1;
      setAttacksRemaining(token, remaining);
      return;
    }

    if (remaining > 0) {
      remaining -= 1;
      setAttacksRemaining(token, remaining);
      return;
    }

    if (econ.hasteAction) {
      econ.hasteAction = false;
    }
  }

  function dash(token) {
    applyEffect(token, "dash");

    if (isMovementLocked(token)) return;

    const speed = getEffectiveSpeed(token);
    const current = parseFloat(token.get("bar3_value")) || 0;
    const max = parseFloat(token.get("bar3_max")) || speed;

    setMovementBar(token, current + speed, max + speed);
  }

  function standUp(token) {
    if (!hasCondition(token, "prone")) return;

    const cost = Math.floor(getSpeed(token) / 2);
    const current = parseFloat(token.get("bar3_value")) || 0;

    if (current < cost) {
      return;
    }

    spendMovement(token, cost);
    removeCondition(token, "prone");
  }

  function getHalfSpeedCost(token) {
    return Math.floor(getSpeed(token) / 2);
  }

  function hasEnoughMovement(token, cost) {
    const current = parseFloat(token.get("bar3_value")) || 0;
    return current >= cost;
  }

  function isCombatActive() {
    return getTurnOrder().length > 0;
  }

  function spendMountMovementCost(rider) {
    if (!isCombatActive()) {
      return true;
    }

    const activeToken = getActiveToken();

    if (!activeToken || activeToken.id !== rider.id) {
      sendChat(AE, "/w gm Mounting and dismounting during combat must be done on the rider's turn.");
      return false;
    }

    const cost = getHalfSpeedCost(rider);

    if (!hasEnoughMovement(rider, cost)) {
      sendChat(AE, "/w gm " + tokenName(rider) + " does not have enough movement remaining.");
      return false;
    }

    spendMovement(rider, cost);
    return true;
  }

  function getRollableTokenSideCount(token) {
    const sides = String(token && token.get("sides") || "");

    if (!sides) return 0;

    return sides
      .split("|")
      .filter(side => side !== "")
      .length;
  }

  function getCurrentTokenSideNumber(token) {
    const currentSide = parseInt(token.get("currentSide"), 10);

    if (isNaN(currentSide)) return 1;

    return currentSide + 1;
  }

  function isValidTokenSide(token, sideNumber) {
    const sideCount = getRollableTokenSideCount(token);
    const cleanSide = parseInt(sideNumber, 10);

    return sideCount > 0 &&
      !isNaN(cleanSide) &&
      cleanSide >= 1 &&
      cleanSide <= sideCount;
  }

  function getCleanTokenImgsrc(imgsrc) {
    const rawSource = String(imgsrc || "");
    let cleanSource = rawSource;

    try {
      cleanSource = decodeURIComponent(rawSource);
    } catch (error) {
      cleanSource = rawSource;
    }

    const match = cleanSource.match(/(.*\/images\/.*)(thumb|med|original|max)([^?]*)(\?[^?]+)?$/);

    if (!match) return null;

    return match[1] + "thumb" + match[3] + (match[4] || "");
  }

  function getTokenSideImgsrc(token, sideNumber) {
    if (!token || !isValidTokenSide(token, sideNumber)) return null;

    const sides = String(token.get("sides") || "").split("|");
    const encodedSide = sides[parseInt(sideNumber, 10) - 1];

    if (!encodedSide) return null;

    return getCleanTokenImgsrc(encodedSide);
  }

  function setTokenSide(token, sideNumber) {
    if (!token || !isValidTokenSide(token, sideNumber)) return false;

    const cleanSide = parseInt(sideNumber, 10);
    const imgsrc = getTokenSideImgsrc(token, cleanSide);

    if (!imgsrc) return false;

    token.set({
      currentSide: cleanSide - 1,
      imgsrc: imgsrc
    });

    return true;
  }

  function normalizeDisarmedItemKey(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  }

  function getDisarmedItemDefinition(itemKey) {
    return DISARMED_ITEM_CATALOG[normalizeDisarmedItemKey(itemKey)] || null;
  }

  function getDisarmedItemRecords(token) {
    if (!token) return {};
    return S.disarmedItems[token.id] || {};
  }

  function createDisarmRecordId() {
    S.disarmSequence = (parseInt(S.disarmSequence, 10) || 0) + 1;
    return "drop" + S.disarmSequence;
  }

  function getDisarmedItemCharacter() {
    return findObjs({
      type: "character",
      name: DISARMED_ITEM_CHARACTER_NAME
    })[0] || null;
  }

  function getDisarmedItemSideImgsrc(tokenData, sideNumber) {
    const sides = String(tokenData && tokenData.sides || "").split("|");
    const cleanSide = parseInt(sideNumber, 10);
    const encodedSide = sides[cleanSide - 1];

    if (!encodedSide) return null;

    return getCleanTokenImgsrc(encodedSide);
  }

  function getDroppedItemOffset(target) {
    const width = parseFloat(target.get("width")) || 70;
    const height = parseFloat(target.get("height")) || 70;
    const distance = Math.max(25, Math.min(50, Math.max(width, height) * 0.35));
    const radians = randomInteger(360) * Math.PI / 180;

    return {
      x: Math.round(Math.cos(radians) * distance),
      y: Math.round(Math.sin(radians) * distance)
    };
  }

  function spawnDisarmedItemToken(target, itemKey, callback) {
    const item = getDisarmedItemDefinition(itemKey);
    const character = getDisarmedItemCharacter();

    if (!item) {
      sendChat(AE, "/w gm Invalid disarmed item: " + itemKey + ".");
      return;
    }

    if (!character) {
      sendChat(AE, "/w gm No character named " + DISARMED_ITEM_CHARACTER_NAME + " found.");
      return;
    }

    character.get("defaulttoken", function(defaultToken) {
      if (!defaultToken) {
        sendChat(AE, "/w gm " + DISARMED_ITEM_CHARACTER_NAME + " has no default token.");
        return;
      }

      let tokenData;

      try {
        tokenData = JSON.parse(defaultToken);
      } catch (error) {
        sendChat(AE, "/w gm Could not read the " + DISARMED_ITEM_CHARACTER_NAME + " default token.");
        return;
      }

      const imgsrc = getDisarmedItemSideImgsrc(tokenData, item.side);

      if (!imgsrc) {
        sendChat(
          AE,
          "/w gm " + DISARMED_ITEM_CHARACTER_NAME +
          " does not have a valid side " + item.side + " for " + item.display + "."
        );
        return;
      }

      const offset = getDroppedItemOffset(target);

      delete tokenData._id;
      delete tokenData.id;

      tokenData._pageid = target.get("_pageid");
      tokenData.left = target.get("left") + offset.x;
      tokenData.top = target.get("top") + offset.y;
      tokenData.layer = "map";
      tokenData.name = "Dropped " + item.display;
      tokenData.represents = "";
      tokenData.controlledby = "";
      tokenData.currentSide = item.side - 1;
      tokenData.imgsrc = imgsrc;
      tokenData.rotation = randomInteger(360);
      tokenData.bar1_link = "";
      tokenData.bar2_link = "";
      tokenData.bar3_link = "";
      tokenData.bar1_value = "";
      tokenData.bar1_max = "";
      tokenData.bar2_value = "";
      tokenData.bar2_max = "";
      tokenData.bar3_value = "";
      tokenData.bar3_max = "";
      tokenData.showname = false;
      tokenData.showplayers_name = false;
      tokenData.showplayers_bar1 = false;
      tokenData.showplayers_bar2 = false;
      tokenData.showplayers_bar3 = false;
      tokenData.has_bright_light_vision = false;
      tokenData.has_night_vision = false;
      tokenData.emits_bright_light = false;
      tokenData.emits_low_light = false;

      const droppedToken = createObj("graphic", tokenData);

      if (!droppedToken) {
        sendChat(AE, "/w gm Could not create the dropped " + item.display + " token.");
        return;
      }

      if (typeof toFront === "function") {
        toBack(droppedToken);
      }

      if (typeof callback === "function") {
        callback(droppedToken, item);
      }
    });
  }

  function applyDisarmedItem(target, itemKey) {
    const item = getDisarmedItemDefinition(itemKey);

    if (!target || !item) {
      sendChat(AE, "/w gm Invalid target or disarmed item.");
      return;
    }

    spawnDisarmedItemToken(target, itemKey, function(droppedToken) {
      const recordId = createDisarmRecordId();

      if (!S.disarmedItems[target.id]) {
        S.disarmedItems[target.id] = {};
      }

      S.disarmedItems[target.id][recordId] = {
        itemKey: normalizeDisarmedItemKey(itemKey),
        display: item.display,
        side: item.side,
        droppedTokenId: droppedToken.id,
        applied: Date.now()
      };

      S.droppedItemTokens[droppedToken.id] = {
        ownerTokenId: target.id,
        recordId: recordId
      };

      if (!hasCondition(target, "disarmed")) {
        applyCondition(target, "disarmed", null, {});
      }

      sendPanel(
        target,
        "&{template:default} " +
        "{{name=" + tokenName(target) + " - Disarmed}} " +
        "{{Dropped=" + item.display + "}} " +
        "{{Effect=The item appears on the ground and can be recovered from the creature's turn card.}}"
      );
    });
  }

  function removeDroppedItemToken(record) {
    if (!record || !record.droppedTokenId) return;

    const droppedTokenId = record.droppedTokenId;
    const droppedToken = getObj("graphic", droppedTokenId);

    delete S.droppedItemTokens[droppedTokenId];

    if (droppedToken) {
      droppedToken.remove();
    }
  }

  function clearDisarmedItems(token) {
    if (!token) return;

    const records = getDisarmedItemRecords(token);

    Object.keys(records).forEach(recordId => {
      removeDroppedItemToken(records[recordId]);
    });

    delete S.disarmedItems[token.id];
  }

  function pickupDisarmedItem(target, recordId) {
    if (!target || !recordId) {
      sendChat(AE, "/w gm Invalid disarmed-item pickup.");
      return;
    }

    const records = getDisarmedItemRecords(target);
    const record = records[recordId];

    if (!record) {
      sendChat(AE, "/w gm That dropped item is no longer registered.");
      return;
    }

    removeDroppedItemToken(record);
    delete records[recordId];

    const display = record.display || "Item";

    if (!Object.keys(records).length) {
      delete S.disarmedItems[target.id];
      removeCondition(target, "disarmed");
    }

    sendPanel(
      target,
      "&{template:default} " +
      "{{name=" + tokenName(target) + " - Item Recovered}} " +
      "{{Picked Up=" + display + "}}"
    );
  }

  function disarmedItemsTurnCardText(token) {
    const records = getDisarmedItemRecords(token);
    const recordIds = Object.keys(records);

    if (!recordIds.length) return null;

    return recordIds.map(recordId => {
      const record = records[recordId];
      const display = record.display || "Item";

      return display + " [Pick Up " + display + "](!ae-disarm pickup " + token.id + " " + recordId + ")";
    }).join("<br>");
  }

  function handleDisarmAttempt(args) {
    const target = getObj("graphic", args[2]);
    const source = getObj("graphic", args[3]);
    const itemKey = normalizeDisarmedItemKey(args[4]);
    const saveKey = normalizeSaveKey(args[5]);
    const dcInput = args[6];
    const item = getDisarmedItemDefinition(itemKey);

    if (!target || target.get("subtype") !== "token") {
      sendChat(AE, "/w gm Invalid Disarm target token.");
      return;
    }

    if (!source || source.get("subtype") !== "token") {
      sendChat(AE, "/w gm Invalid Disarm source token.");
      return;
    }

    if (!item) {
      sendChat(AE, "/w gm Invalid Disarm item.");
      return;
    }

    if (!saveKey || !dcInput) {
      sendChat(AE, "/w gm Format: !ae-disarm attempt TARGET_ID SOURCE_ID ITEM_KEY SAVE DC");
      return;
    }

    sendChat(
      AE,
      "!se check " + target.id + " " + saveKey + " " + dcInput +
      " --source " + source.id +
      " --title Disarm_" + item.display.replace(/\s+/g, "_") +
      " --success The target retains its " + item.display + "." +
      " --failure The target drops its " + item.display + "." +
      " --onFail !ae-disarm apply @@target " + itemKey
    );
  }

  function handleDisarmedGraphicDeleted(token) {
    if (!token) return;

    if (S.disarmedItems[token.id]) {
      clearDisarmedItems(token);
      delete S.conditions[token.id];
      return;
    }

    const link = S.droppedItemTokens[token.id];

    if (!link) return;

    delete S.droppedItemTokens[token.id];

    const owner = getObj("graphic", link.ownerTokenId);
    const records = S.disarmedItems[link.ownerTokenId];

    if (!records || !records[link.recordId]) return;

    delete records[link.recordId];

    if (!Object.keys(records).length) {
      delete S.disarmedItems[link.ownerTokenId];

      if (owner) {
        removeCondition(owner, "disarmed");
      }
    }
  }

  function getMountRecord(rider) {
    if (!rider) return null;

    const stored = S.mounts[rider.id];

    if (!stored) return null;

    if (typeof stored === "string") {
      return {
        mountId: stored,
        combined: false
      };
    }

    if (typeof stored === "object" && stored.mountId) {
      return stored;
    }

    return null;
  }

  function isCombinedMountRecord(record) {
    return !!(
      record &&
      record.combined &&
      record.riderOriginal &&
      record.mountOriginal
    );
  }

  function restoreCombinedRiderPresentation(rider, record) {
    if (!rider || !isCombinedMountRecord(record)) return false;

    const original = record.riderOriginal;
    const updates = {};
    const width = parseFloat(original.width);
    const height = parseFloat(original.height);
    const rotation = parseFloat(original.rotation);

    if (!isNaN(width) && width > 0) updates.width = width;
    if (!isNaN(height) && height > 0) updates.height = height;
    if (!isNaN(rotation)) updates.rotation = rotation;
    if (original.layer) updates.layer = original.layer;

    const sideRestored = setTokenSide(rider, original.side);

    if (!sideRestored && original.imgsrc) {
      updates.currentSide = Math.max(0, parseInt(original.side, 10) - 1);
      updates.imgsrc = original.imgsrc;
    }

    if (Object.keys(updates).length) {
      rider.set(updates);
    }

    return true;
  }

  function restoreCombinedMountPresentation(rider, mount, record) {
    if (!rider || !mount || !isCombinedMountRecord(record)) return false;

    ignoreNextMove(mount);

    mount.set({
      left: rider.get("left"),
      top: rider.get("top"),
      rotation: rider.get("rotation"),
      layer: record.mountOriginal.layer || "objects"
    });

    restoreCombinedRiderPresentation(rider, record);
    return true;
  }

  function releaseMountRelationship(rider) {
    const record = getMountRecord(rider);

    if (!record) return null;

    const mount = getObj("graphic", record.mountId);

    if (isCombinedMountRecord(record)) {
      if (mount) {
        restoreCombinedMountPresentation(rider, mount, record);
      } else {
        restoreCombinedRiderPresentation(rider, record);
      }
    }

    delete S.mounts[rider.id];
    return mount;
  }

  function syncCombinedMountPosition(rider, mount) {
    if (!rider || !mount) return;

    ignoreNextMove(mount);

    mount.set({
      left: rider.get("left"),
      top: rider.get("top"),
      rotation: rider.get("rotation")
    });
  }

  function mountCreature(rider, mount, mountedSide) {
    if (!rider || !mount) return;

    if (rider.id === mount.id) {
      sendChat(AE, "/w gm A token cannot mount itself.");
      return;
    }

    if (rider.get("_pageid") !== mount.get("_pageid")) {
      sendChat(AE, "/w gm Rider and mount must be on the same page.");
      return;
    }

    if (isMounted(rider)) {
      sendChat(AE, "/w gm " + tokenName(rider) + " is already mounted.");
      return;
    }

    const hasMountedSide = mountedSide !== null && mountedSide !== undefined;
    const cleanMountedSide = hasMountedSide ? parseInt(mountedSide, 10) : null;
    const mountedImgsrc = hasMountedSide
      ? getTokenSideImgsrc(rider, cleanMountedSide)
      : null;

    if (hasMountedSide && (!isValidTokenSide(rider, cleanMountedSide) || !mountedImgsrc)) {
      sendChat(
        AE,
        "/w gm " + tokenName(rider) +
        " does not have a valid mounted side " + mountedSide + "."
      );
      return;
    }

    if (!spendMountMovementCost(rider)) {
      return;
    }

    if (!hasMountedSide) {
      S.mounts[rider.id] = mount.id;
      applyEffect(rider, "mounted");

      if (isCombatActive()) {
        resetMovement(mount);
      }

      return;
    }

    S.mounts[rider.id] = {
      mountId: mount.id,
      combined: true,
      mountedSide: cleanMountedSide,
      riderOriginal: {
        side: getCurrentTokenSideNumber(rider),
        imgsrc: rider.get("imgsrc"),
        width: rider.get("width"),
        height: rider.get("height"),
        rotation: rider.get("rotation"),
        layer: rider.get("layer") || "objects"
      },
      mountOriginal: {
        layer: mount.get("layer") || "objects"
      }
    };

    applyEffect(rider, "mounted");

    if (isCombatActive()) {
      resetMovement(mount);
    }

    ignoreNextMove(rider);

    rider.set({
      currentSide: cleanMountedSide - 1,
      imgsrc: mountedImgsrc,
      left: mount.get("left"),
      top: mount.get("top"),
      width: mount.get("width"),
      height: mount.get("height"),
      rotation: mount.get("rotation")
    });

    mount.set("layer", "gmlayer");
  }

  function getMountedCreature(rider) {
    const record = getMountRecord(rider);
    if (!record) return null;

    const mount = getObj("graphic", record.mountId);

    if (!mount) {
      if (isCombinedMountRecord(record)) {
        restoreCombinedRiderPresentation(rider, record);
      }

      delete S.mounts[rider.id];
      removeEffect(rider, "mounted");
      return null;
    }

    return mount;
  }

  function isActiveRiderMount(token) {
    if (!S.lastActiveTokenId) return false;

    const activeRider = getObj("graphic", S.lastActiveTokenId);
    if (!activeRider) return false;

    const mount = getMountedCreature(activeRider);
    if (!mount) return false;

    return mount.id === token.id;
  }

  function isMounted(token) {
    return hasEffect(token, "mounted") && !!getMountedCreature(token);
  }

  function canDismount(rider) {
    if (!isCombatActive()) return true;

    const activeToken = getActiveToken();

    return !!activeToken &&
      activeToken.id === rider.id &&
      hasEnoughMovement(rider, getHalfSpeedCost(rider));
  }

  function dismountCreature(rider) {
    if (!isMounted(rider)) return;

    if (!spendMountMovementCost(rider)) {
      return;
    }

    removeEffect(rider, "mounted");
  }

  function handleMountTokenDeleted(token) {
    if (!token) return;

    const riderRecord = getMountRecord(token);

    if (riderRecord) {
      const mount = getObj("graphic", riderRecord.mountId);

      if (mount && isCombinedMountRecord(riderRecord)) {
        ignoreNextMove(mount);

        mount.set({
          left: token.get("left"),
          top: token.get("top"),
          rotation: token.get("rotation"),
          layer: riderRecord.mountOriginal.layer || "objects"
        });
      }

      delete S.mounts[token.id];
    }

    Object.keys(S.mounts).forEach(riderId => {
      const rider = getObj("graphic", riderId);
      const record = rider ? getMountRecord(rider) : null;

      if (!record || record.mountId !== token.id) return;

      if (rider && isCombinedMountRecord(record)) {
        restoreCombinedRiderPresentation(rider, record);
      }

      delete S.mounts[riderId];

      if (rider) {
        removeEffect(rider, "mounted");
      }
    });
  }

    function getTurnCardProfile(token) {
    const tokenNameValue = tokenName(token).toLowerCase();
    const characterId = token.get("represents");
    const character = characterId ? getObj("character", characterId) : null;
    const characterNameValue = character ? character.get("name").toLowerCase() : "";

    const profileKey = Object.keys(TURN_CARD_PROFILES).find(key => {
      const profile = TURN_CARD_PROFILES[key];

      return profile.names.some(name =>
        tokenNameValue.indexOf(name) !== -1 ||
        characterNameValue.indexOf(name) !== -1
      );
    });

    return profileKey ? TURN_CARD_PROFILES[profileKey] : null;
  }

  function actionText(token) {
    const econ = getEconomy(token);

    return econ.action ? "[Actions](~selected|Actions)" : "Unavailable";
  }

  function attackText(token) {
    const remaining = getAttacksRemaining(token);

    if (remaining > 0) return remaining + " available [Attacks](~selected|Attacks)";
    return "Unavailable";
  }

  function spellText(token) {
    const econ = getEconomy(token);

    return econ.action ? "[Spells](~selected|Spells)" : "Unavailable";
  }

  function cantripText(token) {
    const econ = getEconomy(token);

    return econ.action ? "[Cantrips](~selected|Cantrips)" : "Unavailable";
  }

  function leveledSpellText(token) {
    const econ = getEconomy(token);

    return econ.action ? "[Leveled Spells](~selected|Leveled-Spells)" : "Unavailable";
  }

  function bonusText(token) {
    const econ = getEconomy(token);

    if (econ.bonus && econ.extraBonus > 0) return "[Bonus Actions](~selected|Bonus-Actions) + Extra Bonus Action";
    if (econ.bonus) return "[Bonus Actions](~selected|Bonus-Actions)";
    if (econ.extraBonus > 0) return "[Bonus Actions](~selected|Bonus-Actions)";
    return "Unavailable";
  }

  function bonusSpellText(token) {
    const econ = getEconomy(token);

    if (econ.bonus && econ.extraBonus > 0) return "[Bonus Action Spells](~selected|Bonus-Action-Spells) + Extra Bonus Action";
    if (econ.bonus) return "[Bonus Action Spells](~selected|Bonus-Action-Spells)";
    if (econ.extraBonus > 0) return "[Bonus Action Spells](~selected|Bonus-Action-Spells)";
    return "Unavailable";
  }

  function hasteText(token) {
    const econ = getEconomy(token);
    if (!hasEffect(token, "haste") && !econ.hasteAction) return null;
    return econ.hasteAction ? "Available" : "Used";
  }

  function movementText(token) {
    if (isMovementLocked(token)) {
      return "0 feet available";
    }

    const movementRemaining = parseFloat(token.get("bar3_value"));
    const speed = getSpeed(token);
    const movement = isNaN(movementRemaining) ? speed : movementRemaining;

    if (hasCondition(token, "prone")) {
      const standCost = getHalfSpeedCost(token);

      if (movement >= standCost) {
        return movement + " feet available [Stand Up](!ae stand)";
      }

      return movement + " feet available. You do not have enough movement to stand.";
    }

    if (isMounted(token)) {
      const dismountCost = getHalfSpeedCost(token);

      if (movement >= dismountCost) {
        return movement + " feet available [Dismount](!ae dismount)";
      }

      return movement + " feet available. You do not have enough movement to dismount.";
    }

    return movement + " feet available";
  }

  function mountMovementText(mount) {
    const movementRemaining = parseFloat(mount.get("bar3_value"));
    const speed = getSpeed(mount);
    const movement = isNaN(movementRemaining) ? speed : movementRemaining;

    return movement + " feet available";
  }

    function economyTemplate(token, title) {
    let t =
      "&{template:default} " +
      "{{name=" + title + "}} ";

    if (isPCToken(token)) {
      const profile = getTurnCardProfile(token);
      const fields = profile ? profile.fields : ["actions", "attacks", "spells", "bonus"];

      if (fields.includes("actions")) t += "{{Actions=" + actionText(token) + "}} ";
      if (fields.includes("cantrips")) t += "{{Cantrips=" + cantripText(token) + "}} ";
      if (fields.includes("leveledspells")) t += "{{Leveled Spells=" + leveledSpellText(token) + "}} ";
      if (fields.includes("attacks")) t += "{{Attacks=" + attackText(token) + "}} ";
      if (fields.includes("spells")) t += "{{Spells=" + spellText(token) + "}} ";
      if (fields.includes("bonus")) t += "{{Bonus Actions=" + bonusText(token) + "}} ";
      if (fields.includes("bonusspells")) t += "{{Bonus Action Spells=" + bonusSpellText(token) + "}} ";

      const h = hasteText(token);
      if (h !== null) t += "{{Haste Action=" + h + "}} ";
    } else {
      const attacks = getAttacksRemaining(token);
      const attackText = attacks > 0 ? "Available" : "Unavailable";

      t += "{{Attacks=" + attackText + "}} ";
    }

        t += "{{Movement=" + movementText(token) + "}}";

    const mount = getMountedCreature(token);
    if (mount) {
      t += "{{Mount Movement=" + mountMovementText(mount) + "}}";
    }

    return t;
  }

  function conditionEffectTemplate(token) {
    const conditionText = registryMechanicalListForToken(token, getConditionStore(token), CONDITIONS);
    const effectText = registryMechanicalListForToken(token, getEffectStore(token), EFFECTS);
    const disarmedText = disarmedItemsTurnCardText(token);

    return (
      "&{template:default} " +
      "{{name=" + tokenName(token) + " - Conditions & Effects}} " +
      "{{Conditions=" + conditionText + "}} " +
      "{{Effects=" + effectText + "}} " +
      (disarmedText ? "{{Dropped Equipment=" + disarmedText + "}} " : "") +
      "{{Damage Traits=" + damageTraitsText(token) + "}} " +
      "{{Ongoing Damage=" + ongoingDamageText(token) + "}}"
    );
  }

  function buttonlessMovementText(token) {
    const speed = getEffectiveSpeed(token);

    if (isMovementLocked(token)) {
      return "0 feet available. Speed: " + speed + " feet.";
    }

    const movementRemaining = parseFloat(token.get("bar3_value"));
    const movement = isNaN(movementRemaining) ? speed : movementRemaining;

    return movement + " feet available. Speed: " + speed + " feet.";
  }

  function standAwarenessText(token) {
    if (!hasCondition(token, "prone")) return null;

    const movementRemaining = parseFloat(token.get("bar3_value"));
    const speed = getEffectiveSpeed(token);
    const movement = isNaN(movementRemaining) ? speed : movementRemaining;
    const standCost = getHalfSpeedCost(token);

    if (movement >= standCost) {
      return "Available. Costs " + standCost + " feet; " + (movement - standCost) + " feet would remain.";
    }

    return "Unavailable. Standing costs " + standCost + " feet, but only " + movement + " feet remains.";
  }

  function npcTurnTemplate(token, title) {
    const conditions = registryMechanicalListForToken(token, getConditionStore(token), CONDITIONS);
    const effects = registryMechanicalListForToken(token, getEffectStore(token), EFFECTS);
    const standText = standAwarenessText(token);
    const disarmedText = disarmedItemsTurnCardText(token);
    const mount = getMountedCreature(token);
    let template =
      "&{template:default} " +
      "{{name=" + title + "}} " +
      "{{Attacks=" + getAttacksRemaining(token) + " available}} " +
      "{{Movement=" + buttonlessMovementText(token) + "}} ";

    if (standText) {
      template += "{{Stand Up=" + standText + "}} ";
    }

    if (mount) {
      template += "{{Mount Movement=" + mountMovementText(mount) + "}} ";
    }

    if (disarmedText) {
      template += "{{Dropped Equipment=" + disarmedText + "}} ";
    }

    template +=
      "{{Conditions=" + conditions + "}} " +
      "{{Effects=" + effects + "}} " +
      "{{Damage Traits=" + damageTraitsText(token) + "}} " +
      "{{Ongoing Damage=" + ongoingDamageText(token) + "}}";

    return template;
  }

  function getControllerNames(token) {
    const characterId = token.get("represents");
    const character = characterId ? getObj("character", characterId) : null;
    const controlledBy = character ? character.get("controlledby") : "";

    if (!controlledBy || controlledBy === "all") return [];

    return controlledBy
      .split(",")
      .map(id => getObj("player", id))
      .filter(player => player)
      .map(player => player.get("_displayname"));
  }

  function sendPanel(token, message) {
    const controllerNames = getControllerNames(token);

    if (controllerNames.length) {
      controllerNames.forEach(name => {
        sendChat(AE, '/w "' + name + '" ' + message);
      });
    }

    sendChat(AE, "/w gm " + message);
  }

  function updateTokenState(token) {
    refreshSheetCache(token);
    enforceConditions(token);
  }

  function announceUpdate(token, title) {
    updateTokenState(token);

    if (isPCToken(token)) {
      sendPanel(token, economyTemplate(token, title));
      sendPanel(token, conditionEffectTemplate(token));
      return;
    }

    sendPanel(token, npcTurnTemplate(token, title));
  }

  function registryButton(rootCommand, key, label) {
    return "[" + label + "](" + rootCommand + " " + key + ") [Remove](" + rootCommand + " remove " + key + ")";
  }

  function registryButtonList(rootCommand, keys, registry) {
    return keys
      .filter(key => registry[key])
      .map(key => registryButton(rootCommand, key, registry[key].display || key))
      .join("<br>");
  }

  function effectMenuTemplate() {
    return (
      "&{template:default} " +
      "{{name=Effects Menu}} " +
      "{{Defense=" + registryButtonList("!ae-effect", ["dodge", "shield", "faithshield", "sanctuary", "bladeward"], EFFECTS) + "}} " +
      "{{Movement=" + registryButtonList("!ae-effect", ["dash", "disengage", "haste", "fly", "lockmove", "steadyaim"], EFFECTS) + "}} " +
      "{{Combat Buffs=" + registryButtonList("!ae-effect", ["reckless", "bloodfrenzy", "sacred", "divine", "nature", "vengeblade"], EFFECTS) + "}} " +
      "{{Rage=" + registryButtonList("!ae-effect", ["bear", "wolf", "eagle"], EFFECTS) + "}} " +
      "{{Utility=" + registryButtonList("!ae-effect", ["concentrate", "mounted", "extrabonus", "aid", "largeform"], EFFECTS) + "}} " +
      "{{Fire Shield=" + registryButtonList("!ae-effect", ["fireshieldwarm", "fireshieldchill"], EFFECTS) + "}} " +
      "{{Back=[Admin Hub](!ae admin)}}"
    );
  }

  function conditionMenuTemplate() {
    return (
      "&{template:default} " +
      "{{name=Conditions Menu}} " +
      "{{Common=" + registryButtonList("!ae-con", ["prone", "grappled", "restrained", "poisoned", "invisible", "hidden"], CONDITIONS) + "}} " +
      "{{Hard Control=" + registryButtonList("!ae-con", ["blinded", "stunned", "paralyzed", "incapacitated", "unconscious"], CONDITIONS) + "}} " +
      "{{Mental=" + registryButtonList("!ae-con", ["charmed", "frightened"], CONDITIONS) + "}} " +
      "{{Other=" + registryButtonList("!ae-con", ["deafened", "petrified", "stinkingpoisoned"], CONDITIONS) + "}} " +
      "{{Exhaustion=[+1](!ae-con exhaustion+) [-1](!ae-con exhaustion-) [Set 0](!ae-con exhaustion 0) [Set 1](!ae-con exhaustion 1) [Set 2](!ae-con exhaustion 2) [Set 3](!ae-con exhaustion 3) [Set 4](!ae-con exhaustion 4) [Set 5](!ae-con exhaustion 5) [Set 6](!ae-con exhaustion 6)}} " +
      "{{Back=[Admin Hub](!ae admin)}}"
    );
  }

  function registryMenuTemplate(title, rootCommand, registry) {
    if (rootCommand === "!ae-effect") {
      return effectMenuTemplate();
    }

    if (rootCommand === "!ae-con") {
      return conditionMenuTemplate();
    }

    let t =
      "&{template:default} " +
      "{{name=" + title + "}} ";

    Object.keys(registry).forEach(key => {
      const entry = registry[key];
      const display = entry.display || key;

      t +=
        "{{" + display + "=" +
        "[Add](" + rootCommand + " " + key + ") " +
        "[Remove](" + rootCommand + " remove " + key + ")" +
        "}} ";
    });

    return t;
  }

  function adminMenuTemplate() {
    return aeMainMenuTemplate();
  }

  function aeMainMenuTemplate() {
    return (
      "&{template:default} " +
      "{{name=Action Economy Admin}} " +
      "{{Core=[Core](!ae menu core) [Movement](!ae menu movement) [Economy](!ae menu economy)}} " +
      "{{Character=[Character Setup](!ae setup &#64;{selected|token_id}) [Registry](!ae registry)}} " +
      "{{State=[Effects](!ae-effect menu) [Conditions](!ae-con menu)}} " +
      "{{Map Tools=[Terrain](!ae menu terrain) [Hazards](!ae menu hazards)}} " +
      "{{Other=[Ongoing](!ae menu ongoing) [Summons](!ae menu summons) [Visuals](!ae menu visuals) [Debug](!ae menu debug)}}"
    );
  }

  function aeCoreMenuTemplate() {
    return (
      "&{template:default} " +
      "{{name=AE Core}} " +
      "{{Combat=[Start Combat](!ae startcombat) [Start Current Turn](!ae start)}} " +
      "{{Token=[Token Options](!ae tokenoptions) [Card](!ae card) [Update State](!ae update) [Grab Sheet Values](!ae grab)}} " +
      "{{Reset=[Reset Turn](!ae reset) [Clear Token](!ae clear)}} " +
      "{{Back=[Admin Hub](!ae admin)}}"
    );
  }

  function aeMovementMenuTemplate() {
    return (
      "&{template:default} " +
      "{{name=AE Movement}} " +
      "{{Core=[Stand Up](!ae stand) [Move Undo](!ae moveundo) [Teleport](!ae teleport)}} " +
      "{{Mounts=[Mount](!ae mount &#64;{target|Mount|token_id}) [Dismount](!ae dismount)}} " +
      "{{Adjust=[Add Move](!ae addmove ?{Feet to add|5}) [Spend Move](!ae spendmove ?{Feet to spend|5})}} " +
      "{{Forced Movement=[Push](!ae push &#64;{target|Push Target|token_id} ?{Push Distance|10})}} " +
      "{{Lock=[Lock Movement](!ae-effect lockmove) [Unlock Movement](!ae-effect remove lockmove)}} " +
      "{{Back=[Admin Hub](!ae admin)}}"
    );
  }

  function aeEconomyMenuTemplate() {
    return (
      "&{template:default} " +
      "{{name=AE Economy}} " +
      "{{Spend=[Action](!ae action) [Bonus](!ae bonus) [Attack](!ae attack) [Spell](!ae spell)}} " +
      "{{Extras=[Extra Bonus](!ae-effect extrabonus) [Remove Extra Bonus](!ae-effect remove extrabonus)}} " +
      "{{Back=[Admin Hub](!ae admin)}}"
    );
  }

  function aeTerrainMenuTemplate() {
    return (
      "&{template:default} " +
      "{{name=AE Terrain}} " +
      "{{Token Footprint=[Selected](!ae-terrain addtoken &#64;{selected|token_id} ?{Terrain Name|@name}) [Batch Selected](!ae-terrain addselected ?{Terrain Name|@name})}} " +
      "{{Radius Area=[Selected](!ae-terrain addradius &#64;{selected|token_id} ?{Radius in feet|20} ?{Terrain Name|@name}) [Batch Selected](!ae-terrain addselectedradius ?{Radius in feet|20} ?{Terrain Name|@name})}} " +
      "{{Remove=[Remove Selected](!ae-terrain remove &#64;{selected|token_id}) [Clear All Terrain](!ae-terrain clear)}} " +
      "{{Info=[List Terrain](!ae-terrain list)}} " +
      "{{Back=[Admin Hub](!ae admin)}}"
    );
  }

  function aeHazardMenuTemplate() {
    const saveQuery =
      "?{Save|Strength,str|Dexterity,dex|Constitution,con|Intelligence,int|Wisdom,wis|Charisma,cha}";

    const damageSaveQuery =
      "?{Save|Constitution,con|Dexterity,dex|Strength,str|Wisdom,wis|Charisma,cha|Intelligence,int}";

    const triggerQuery =
      "?{First Trigger|Start of Turn,startOfTurn|Enter,enter|End of Turn,endOfTurn|Move Into,moveInto}" +
      "?{Second Trigger|None,|Start of Turn,&#44;startOfTurn|Enter,&#44;enter|End of Turn,&#44;endOfTurn|Move Into,&#44;moveInto}";

    return (
      "&{template:default} " +
      "{{name=AE Hazards}} " +
      "{{Token Footprint Condition=[Selected](!ae-hazard add &#64;{selected|token_id} &#64;name token " + saveQuery + " ?{DC|14} ?{Condition|Restrained,restrained|Poisoned,poisoned|Prone,prone|Grappled,grappled|Stinking Cloud Poisoned,stinkingpoisoned|None,none} ?{Duration|Manual,manual|End of Turn,endOfTurn|Combat,combat|Concentration,concentration} &#64;{selected|token_id} none none none " + triggerQuery + ") [Batch Selected](!ae-hazard addselected &#64;name token " + saveQuery + " ?{DC|14} ?{Condition|Restrained,restrained|Poisoned,poisoned|Prone,prone|Grappled,grappled|Stinking Cloud Poisoned,stinkingpoisoned|None,none} ?{Duration|Manual,manual|End of Turn,endOfTurn|Combat,combat|Concentration,concentration} self none none none " + triggerQuery + ")}} " +
      "{{Radius Condition=[Selected](!ae-hazard add &#64;{selected|token_id} ?{Hazard Name|Hazard} ?{Radius in feet|20} " + saveQuery + " ?{DC|14} ?{Condition|Restrained,restrained|Poisoned,poisoned|Prone,prone|Grappled,grappled|Stinking Cloud Poisoned,stinkingpoisoned|None,none} ?{Duration|Manual,manual|End of Turn,endOfTurn|Combat,combat|Concentration,concentration} &#64;{selected|token_id} none none none " + triggerQuery + ") [Batch Selected](!ae-hazard addselected &#64;name ?{Radius in feet|20} " + saveQuery + " ?{DC|14} ?{Condition|Restrained,restrained|Poisoned,poisoned|Prone,prone|Grappled,grappled|Stinking Cloud Poisoned,stinkingpoisoned|None,none} ?{Duration|Manual,manual|End of Turn,endOfTurn|Combat,combat|Concentration,concentration} self none none none " + triggerQuery + ")}} " +
      "{{Token Footprint Damage=[Selected](!ae-hazard add &#64;{selected|token_id} &#64;name token " + damageSaveQuery + " ?{DC|15} none endOfTurn &#64;{selected|token_id} ?{Damage|5d8} ?{Damage Type|Poison,poison|Fire,fire|Necrotic,necrotic|Cold,cold|Acid,acid|Radiant,radiant|Force,force} ?{Success|Half,half|None,none} " + triggerQuery + ") [Batch Selected](!ae-hazard addselected &#64;name token " + damageSaveQuery + " ?{DC|15} none endOfTurn self ?{Damage|5d8} ?{Damage Type|Poison,poison|Fire,fire|Necrotic,necrotic|Cold,cold|Acid,acid|Radiant,radiant|Force,force} ?{Success|Half,half|None,none} " + triggerQuery + ")}} " +
      "{{Radius Damage=[Selected](!ae-hazard add &#64;{selected|token_id} ?{Hazard Name|Damage_Hazard} ?{Radius in feet|20} " + damageSaveQuery + " ?{DC|15} none endOfTurn &#64;{selected|token_id} ?{Damage|5d8} ?{Damage Type|Poison,poison|Fire,fire|Necrotic,necrotic|Cold,cold|Acid,acid|Radiant,radiant|Force,force} ?{Success|Half,half|None,none} " + triggerQuery + ") [Batch Selected](!ae-hazard addselected &#64;name ?{Radius in feet|20} " + damageSaveQuery + " ?{DC|15} none endOfTurn self ?{Damage|5d8} ?{Damage Type|Poison,poison|Fire,fire|Necrotic,necrotic|Cold,cold|Acid,acid|Radiant,radiant|Force,force} ?{Success|Half,half|None,none} " + triggerQuery + ")}} " +
      "{{Remove=[Remove Selected](!ae-hazard remove &#64;{selected|token_id}) [Clear All](!ae-hazard clear)}} " +
      "{{Info=[List Hazards](!ae-hazard list)}} " +
      "{{Back=[Admin Hub](!ae admin)}}"
    );
  }

  function aeOngoingMenuTemplate() {
    const saveQuery =
      "?{Save|Strength,str|Dexterity,dex|Constitution,con|Intelligence,int|Wisdom,wis|Charisma,cha}";

    const timingQuery =
      "?{Timing|Start of Turn,startOfTurn|End of Turn,endOfTurn}";

    const damageTypeQuery =
      "?{Damage Type|Acid,acid|Bludgeoning,bludgeoning|Cold,cold|Fire,fire|Force,force|Lightning,lightning|Necrotic,necrotic|Piercing,piercing|Poison,poison|Psychic,psychic|Radiant,radiant|Slashing,slashing|Thunder,thunder}";

    const successQuery =
      "?{Success|Half Damage,half|No Damage,none}";

    const durationQuery =
      "?{Duration|Manual,manual|Combat,combat|Concentration,concentration}";

    return (
      "&{template:default} " +
      "{{name=AE Ongoing Damage}} " +
      "{{Selected Targets=[Add Ongoing Damage](!ae-ongoing add selected ?{Name|Ongoing_Damage} --timing " + timingQuery + " --save " + saveQuery + " --dc ?{DC|15} --damage ?{Damage|1d6} --type " + damageTypeQuery + " --success " + successQuery + " --source &#64;{selected|token_id} --duration " + durationQuery + ")}} " +
      "{{Single Target=[Add Ongoing Damage](!ae-ongoing add &#64;{target|Ongoing Damage Target|token_id} ?{Name|Ongoing_Damage} --timing " + timingQuery + " --save " + saveQuery + " --dc ?{DC|15} --damage ?{Damage|1d6} --type " + damageTypeQuery + " --success " + successQuery + " --source &#64;{selected|token_id} --duration " + durationQuery + ")}} " +
      "{{Spell DC=[Selected Spell DC](!ae-ongoing add selected ?{Name|Ongoing_Damage} --timing " + timingQuery + " --save " + saveQuery + " --dc spell --damage ?{Damage|1d6} --type " + damageTypeQuery + " --success " + successQuery + " --source &#64;{selected|token_id} --duration " + durationQuery + ")}} " +
      "{{Remove=[Remove Named from Selected](!ae-ongoing remove selected ?{Name to remove|Ongoing_Damage}) [Remove All from Selected](!ae-ongoing remove selected all)}} " +
      "{{Back=[Admin Hub](!ae admin)}}"
    );
  }

  function aeSummonsMenuTemplate() {
    return (
      "&{template:default} " +
      "{{name=AE Summons}} " +
      "{{Pending=[Pending Concentration Summon](!ae-summon pending &#64;{selected|token_id} ?{Summon Name|Summon_Name} --concentration) [Pending No Concentration](!ae-summon pending &#64;{selected|token_id} ?{Summon Name|Summon_Name})}} " +
      "{{Manual=[Link Concentration](!ae-summon link &#64;{selected|token_id} &#64;{target|Summon|token_id} --concentration) [Link No Concentration](!ae-summon link &#64;{selected|token_id} &#64;{target|Summon|token_id})}} " +
      "{{Claim=[Claim Target Summon](!ae-summon claim &#64;{target|Summon|token_id})}} " +
      "{{Back=[Admin Hub](!ae admin)}}"
    );
  }

  function aeVisualsMenuTemplate() {
    return (
      "&{template:default} " +
      "{{name=AE Visuals}} " +
      "{{Pending=[Pending Visual Link](!ae-visual pending &#64;{selected|token_id} ?{Visual Token Name|Visual_Name} ?{Effect Key|effectkey})}} " +
      "{{Cleanup=[Cleanup Links](!ae-visual cleanup) [Cleanup All Visual Tokens](!ae-visual cleanupall)}} " +
      "{{Debug=[Visual Debug](!ae-visual debug)}} " +
      "{{Back=[Admin Hub](!ae admin)}}"
    );
  }

  function aeDebugMenuTemplate() {
    return (
      "&{template:default} " +
      "{{name=AE Debug & Lists}} " +
      "{{Token State=[Token Options](!ae tokenoptions) [Update State](!ae update) [Grab Sheet Values](!ae grab)}} " +
      "{{Map Lists=[Difficult Terrain](!ae-terrain list) [AoE Hazards](!ae-hazard list)}} " +
      "{{Token Info=[Features](!ae features) [Auras](!ae auras) [Creature Type](!ae type) [Character Registry](!ae registry)}} " +
      "{{Cleanup=[Clear Terrain](!ae-terrain clear) [Clear Hazards](!ae-hazard clear)}} " +
      "{{Visuals=[Visual Debug](!ae-visual debug) [Cleanup Visuals](!ae-visual cleanup) [Cleanup All Visuals](!ae-visual cleanupall)}} " +
      "{{Back=[Admin Hub](!ae admin)}}"
    );
  }

  function aeMenuTemplate(menuName) {
    const cleanName = String(menuName || "main").toLowerCase();

    if (cleanName === "main" || cleanName === "admin") return aeMainMenuTemplate();
    if (cleanName === "core") return aeCoreMenuTemplate();
    if (cleanName === "movement") return aeMovementMenuTemplate();
    if (cleanName === "economy") return aeEconomyMenuTemplate();
    if (cleanName === "terrain") return aeTerrainMenuTemplate();
    if (cleanName === "hazards" || cleanName === "hazard") return aeHazardMenuTemplate();
    if (cleanName === "ongoing") return aeOngoingMenuTemplate();
    if (cleanName === "summons" || cleanName === "summon") return aeSummonsMenuTemplate();
    if (cleanName === "visuals" || cleanName === "visual") return aeVisualsMenuTemplate();
    if (cleanName === "debug") return aeDebugMenuTemplate();

    return aeMainMenuTemplate();
  }

  function startTurn(token) {
    refreshSheetCache(token);
    unlockMovement(token);
    resetEconomy(token);
    resetMovement(token);

    const mount = getMountedCreature(token);
    if (mount) {
      refreshSheetCache(mount);
      resetMovement(mount);
    }

    announceUpdate(token, tokenName(token) + " - It Is Your Turn!");
  }

  function isTurnMarkerToken(token) {
    const name = (token.get("name") || "").trim();

    return /^Round\s+\d+$/i.test(name);
  }

  function getFirstRealTurnToken() {
    const order = getTurnOrder();

    for (let i = 0; i < order.length; i++) {
      const entry = order[i];
      if (!entry || !entry.id || entry.id === "-1") continue;

      const token = getObj("graphic", entry.id);
      if (!token || token.get("subtype") !== "token") continue;
      if (isTurnMarkerToken(token)) continue;

      return token;
    }

    return null;
  }

  function startCombatFromCurrentTurn() {
    let attempts = 0;

    function tryStartCombat() {
      attempts += 1;

      const activeToken = getFirstRealTurnToken();

      if (!activeToken) {
        if (attempts < 8) {
          setTimeout(tryStartCombat, 500);
          return;
        }

        sendChat(AE, "/w gm No usable token found in the turn order.");
        return;
      }

      S.lastActiveTokenId = activeToken.id;

      startTurn(activeToken);
    }

    setTimeout(tryStartCombat, 500);
  }

  function handleTurnChange() {
    const lastId = S.lastActiveTokenId;

    if (lastId) {
      const lastToken = getObj("graphic", lastId);
        if (lastToken) {
          const lastMount = getMountedCreature(lastToken);

          clearMovementBar(lastToken);

          if (lastMount) {
            clearMovementBar(lastMount);
          }

          processOngoingDamage(lastToken, "endOfTurn");
          processAoeHazards(lastToken, "endOfTurn");
          processDirectionalHazards(lastToken, "endOfTurn");
          processRepeatSaves(lastToken, "endOfTurn");
          processSummonControlSave(lastToken, "endOfTurn");

          clearEndOfTurnEffects(lastToken);
          clearConditionsEndingOnTokenTurnEnd(lastToken);
        }
    }

    const activeToken = getActiveToken();

    if (!activeToken) {
      S.lastActiveTokenId = null;
      return;
    }

    const turnOrderJustStarted = !lastId;

    S.lastActiveTokenId = activeToken.id;
    resetAoeHazardTurnHits();

    clearStartOfTurnEffects(activeToken);
    processAoeHazards(activeToken, "startOfTurn");
    processOngoingDamage(activeToken, "startOfTurn");
    processRepeatSaves(activeToken, "startOfTurn");
    processSummonControlSave(activeToken, "startOfTurn");

    if (turnOrderJustStarted) {
      startTurn(activeToken);
      return;
    }

    startTurn(activeToken);
  }

  on("change:campaign:turnorder", function () {
    clearCombatEffectsIfEnded();
    handleTurnChange();
  });

  on("change:graphic", function (token, prev) {
    if (!token || token.get("subtype") !== "token") return;
    if (token.get("left") === prev.left && token.get("top") === prev.top) return;
    if (S.aoeControls && S.aoeControls[token.id]) return;

    spendMovementFromDrag(token, prev, distanceMovedFeet(token, prev));

    if (S.aoeHazards[token.id]) {
      processAoeHazardMoved(token);
    } else {
      processAoeHazards(token, "enter");
    }

    processDirectionalHazards(token, "movement");
    moveLinkedVisualTokens(token);
  });

  on("change:graphic:bar1_value", function (token, prev) {
    if (!token || token.get("subtype") !== "token") return;

    const oldHp = parseInt(prev.bar1_value, 10);
    const newHp = parseInt(token.get("bar1_value"), 10);

    if (isNaN(oldHp) || isNaN(newHp)) return;
    if (newHp >= oldHp) return;

    rollConcentrationSave(token, oldHp - newHp);

    if (oldHp > 0 && newHp <= 0) {
      processDarkOnesBlessingDeathTrigger(token);
    }
  });

  on("change:graphic:bar2_value", function (token, prev) {
    if (!token || token.get("subtype") !== "token") return;

    const oldTempHp = parseInt(prev.bar2_value, 10);
    const newTempHp = parseInt(token.get("bar2_value"), 10);

    if (isNaN(oldTempHp) || isNaN(newTempHp)) return;
    if (newTempHp >= oldTempHp) return;

    rollConcentrationSave(token, oldTempHp - newTempHp);
  });

  on("add:graphic", function (token) {
    if (!token || token.get("subtype") !== "token") return;

    claimPendingSummon(token);
    claimPendingVisualLink(token);
    claimPendingDirectionalHazard(token);
  });

  on("destroy:graphic", function (token) {
    if (!token || token.get("subtype") !== "token") return;

    handleMountTokenDeleted(token);
    handleDisarmedGraphicDeleted(token);
    handleSummonDeleted(token);
    handleVisualTokenDeleted(token);
    removeAoeHazard(token.id);
    clearDirectionalHazardByToken(token);
  });

  on("destroy:character", function (character) {
    if (!character) return;

    cleanupCharacterRegistryEntry(character.id);
  });

  on("chat:message", function (msg) {
    if (msg.type !== "api") return;

    const args = msg.content.split(/\s+/);
    const root = args[0];

    if (root === "!ae") {
      const command = args[1];
      const selected = getSelectedTokens(msg);
      const tokenTargetCommands = [
        "action",
        "bonus",
        "attack",
        "spell",
        "stand",
        "dismount",
        "teleport",
        "moveundo",
        "update",
        "grab",
        "type",
        "tokenoptions",
        "card",
        "reset",
        "off",
        "clear"
      ];
      const targetTokens = tokenTargetCommands.includes(command)
        ? resolveTargets(msg, args, 2)
        : selected;
      const amount = parseInt(args[2], 10);

      if (command === "pcs") {
        S.pcCharacterIds = Array.from(new Set(
          selected
            .map(t => t.get("represents"))
            .filter(Boolean)
        ));

        S.allyCharacterIds = S.allyCharacterIds
          .filter(characterId => !S.pcCharacterIds.includes(characterId));

        sendChat(AE, "/w gm Saved " + S.pcCharacterIds.length + " PC character(s).");
        return;
      }

      if (command === "registry") {
        handleCharacterRegistryCommand(msg, args);
        return;
      }

      if (command === "setup") {
        handleCharacterSetupCommand(msg, args);
        return;
      }

      if (command === "admin") {
        sendChat(AE, "/w gm " + adminMenuTemplate());
        return;
      }

      if (command === "menu") {
        sendChat(AE, "/w gm " + aeMenuTemplate(args[2]));
        return;
      }

      if (command === "speed") {
        if (!selected.length || isNaN(amount)) return;
        selected.forEach(t => setSpeed(t, amount));
        sendChat(AE, "/w gm Saved speed " + amount + " ft.");
        return;
      }

      if (command === "speedmod") {
        if (!selected.length) {
          sendChat(AE, "/w gm Select one or more tokens first.");
          return;
        }

        const mode = args[2];

        if (mode === "half") {
          selected.forEach(t => modifySheetSpeed(t, "half", 0));
          return;
        }

        if (mode === "set") {
          const value = parseInt(args[3], 10);

          if (isNaN(value)) {
            sendChat(AE, "/w gm Format: !ae speedmod set NUMBER");
            return;
          }

          selected.forEach(t => modifySheetSpeed(t, "set", value));
          return;
        }

        const value = parseInt(mode, 10);

        if (isNaN(value)) {
          sendChat(AE, "/w gm Format: !ae speedmod half | !ae speedmod +10 | !ae speedmod -10 | !ae speedmod set 15");
          return;
        }

        selected.forEach(t => modifySheetSpeed(t, "add", value));
        return;
      }

      if (command === "speedrestore") {
        if (!selected.length) {
          sendChat(AE, "/w gm Select one or more tokens first.");
          return;
        }

        selected.forEach(t => restoreSheetSpeed(t));
        return;
      }

      if (command === "attacks") {
        if (!selected.length || isNaN(amount) || amount < 1) return;

        const saved = selected.filter(t => setAttackCount(t, amount));

        sendChat(
          AE,
          "/w gm Saved attack count " + amount + " for " + saved.length + " represented character(s)."
        );
        return;
      }

      if (command === "feature") {
        if (!selected.length) return;

        const action = args[2];
        const featureKey = String(args[3] || "").toLowerCase();

        if (action !== "add" && action !== "remove") {
          sendChat(AE, "/w gm Format: !ae feature add/remove FEATUREKEY");
          return;
        }

        if (!FEATURES[featureKey]) {
          sendChat(AE, "/w gm Invalid feature key: " + (featureKey || "None") + ".");
          return;
        }

        const changed = selected.filter(token => {
          return action === "add"
            ? addFeature(token, featureKey)
            : removeFeature(token, featureKey);
        });

        sendChat(
          AE,
          "/w gm " +
          (action === "add" ? "Added " : "Removed ") +
          featureKey +
          (action === "add" ? " to " : " from ") +
          changed.length +
          " represented character(s)."
        );

        return;
      }

      if (command === "features") {
        if (!selected.length) return;

        selected.forEach(token => {
          initializePermanentFeatures(token);

          const characterId = token.get("represents");
          const store = S.features[characterId] || {};
          const featureList = Object.keys(store).join(", ") || "None";

          sendChat(
            AE,
            "/w gm " +
            "&{template:default} " +
            "{{name=Features}} " +
            "{{Target=" + tokenName(token) + "}} " +
            "{{Active=" + featureList + "}}"
          );
        });

        return;
      }

      if (command === "aura") {
        if (!selected.length) return;

        const action = args[2];
        const auraKey = normalizeAuraKey(args[3]);

        if ((action !== "add" && action !== "remove") || !auraKey) {
          sendChat(AE, "/w gm Format: !ae aura add/remove AURAKEY");
          return;
        }

        const changed = selected.filter(token => {
          return action === "add"
            ? addAura(token, auraKey)
            : removeAura(token, auraKey);
        });

        sendChat(
          AE,
          "/w gm " +
          (action === "add" ? "Added " : "Removed ") +
          auraKey +
          (action === "add" ? " to " : " from ") +
          changed.length +
          " represented character(s)."
        );

        return;
      }

      if (command === "auras") {
        if (!selected.length) return;

        selected.forEach(token => {
          const characterId = token.get("represents");
          const store = S.auras[characterId] || {};
          const auraList = Object.keys(store).join(", ") || "None";

          sendChat(
            AE,
            "/w gm " +
            "&{template:default} " +
            "{{name=Auras}} " +
            "{{Target=" + tokenName(token) + "}} " +
            "{{Active=" + auraList + "}}"
          );
        });

        return;
      }

      if (command === "saveadv") {
        if (!selected.length) return;

        const key = args[2];
        const action = args[3];
        const enabled = action === "on";

        if (action !== "on" && action !== "off") {
          sendChat(AE, "/w gm Format: !ae saveadv KEY on/off");
          return;
        }

        selected.forEach(token => {
          const success = setPersistentSaveAdvantage(token, key, enabled);
          const characterId = token.get("represents");
          const store = getSaveAdvantageStore(characterId) || {};
          const activeList = Object.keys(store).join(", ") || "None";

          sendChat(
            AE,
            "&{template:default} " +
            "{{name=Persistent Save Advantage}} " +
            "{{Target=" + tokenName(token) + "}} " +
            "{{Key=" + key + "}} " +
            "{{Result=" + (success ? (enabled ? "Enabled" : "Disabled") : "Invalid key") + "}} " +
            "{{Active=" + activeList + "}}"
          );
        });

        return;
      }

      if (!targetTokens.length && command !== "start") {
        sendChat(AE, '/w "' + msg.who + '" Select a token first or provide a token ID.');
        return;
      }

      if (command === "start") {
        handleTurnChange();
        return;
      }

      if (command === "startcombat") {
        startCombatFromCurrentTurn();
        return;
      }

      if (command === "pushfrom") {
        const sourceToken = getObj("graphic", args[2]);

        if (!sourceToken || sourceToken.get("subtype") !== "token") {
          sendChat(AE, "/w gm Format: !ae pushfrom SOURCE_ID TARGET_ID FEET");
          return;
        }

        pushTokenAway(sourceToken, args[3], args[4]);
        return;
      }

      if (command === "pullfrom") {
        const sourceToken = getObj("graphic", args[2]);

        if (!sourceToken || sourceToken.get("subtype") !== "token") {
          sendChat(AE, "/w gm Format: !ae pullfrom SOURCE_ID TARGET_ID FEET");
          return;
        }

        pullTokenToward(sourceToken, args[3], args[4]);
        return;
      }

      if (command === "forcemove") {
        const result = forceMoveToken(args[2], args[3], args[4], args[5]);

        if (!result.success) {
          sendChat(AE, "/w gm Forced movement failed: " + result.message);
          return;
        }

        sendChat(
          AE,
          "/w gm &{template:default} " +
          "{{name=Forced Movement}} " +
          "{{Source=" + result.sourceName + "}} " +
          "{{Target=" + result.targetName + "}} " +
          "{{Direction=" + result.movementLabel + "}} " +
          "{{Distance=" + result.distance + " ft}}"
        );
        return;
      }

      targetTokens.forEach(token => {
        if (command === "action") spendAction(token);
        if (command === "bonus") spendBonus(token);
        if (command === "attack") useAttack(token);
        if (command === "spell") {
          triggerEffectEvent(token, "spell");
          spendAction(token);
        }        
        if (command === "stand") standUp(token);
        if (command === "mount") {
          const mount = getObj("graphic", args[2]);
          const mountedSide = getOptionValue(args, "--side");

          if (mount && mount.get("subtype") === "token") {
            mountCreature(token, mount, mountedSide);
          }
        }
        if (command === "dismount") dismountCreature(token);
        if (command === "teleport") ignoreNextMove(token);
        if (command === "push") pushTokenAway(token, args[2], args[3]);
        if (command === "pull") pullTokenToward(token, args[2], args[3]);
        if (command === "moveundo") undoMovement(token);
        if (command === "addmove" && !isNaN(amount)) addMovement(token, amount);
        if (command === "spendmove" && !isNaN(amount)) spendMovement(token, amount);
        if (command === "update") {
          updateTokenState(token);
        }

        if (command === "grab") {
          refreshSheetCache(token);
          sendChat(AE, "/w gm Grabbed current Beacon values for " + tokenName(token) + ".");
        }

        if (command === "type") {
          refreshSheetCache(token);
          sendChat(
            AE,
            "/w gm &{template:default} " +
            "{{name=Creature Type}} " +
            "{{Target=" + tokenName(token) + "}} " +
            "{{Type=" + creatureTypesText(token) + "}}"
          );
        }

        if (command === "tokenoptions" || command === "card") {
          announceUpdate(token, tokenName(token) + " - Action Economy");
        }

        if (command === "reset") {
          refreshSheetCache(token);
          startTurn(token);
        }
        if (command === "off") clearMovementBar(token);
        if (command === "clear") clearTokenState(token);
      });

      return;
    }

    if (root === "!ae-terrain") {
      const command = args[1];

      if (
        command === "immune" ||
        command === "unimmune" ||
        command === "clearimmune" ||
        command === "immunelist"
      ) {
        applyAreaImmunityCommand(msg, "terrain", args);
        return;
      }

      if (command === "addradius") {
        addDifficultTerrainRadius(args[2], parseFloat(args[3]), args.slice(4).join(" ").replace(/_/g, " "));
        return;
      }

      if (command === "addtoken") {
        addDifficultTerrainToken(args[2], args.slice(3).join(" ").replace(/_/g, " "));
        return;
      }

      if (command === "addselected") {
        addSelectedDifficultTerrainTokens(msg, args.slice(2).join(" ").replace(/_/g, " "));
        return;
      }

      if (command === "addselectedradius") {
        addSelectedDifficultTerrainRadii(msg, parseFloat(args[2]), args.slice(3).join(" ").replace(/_/g, " "));
        return;
      }

      if (command === "remove") {
        removeDifficultTerrain(args[2]);
        return;
      }

      if (command === "clear") {
        clearDifficultTerrain();
        return;
      }

      if (command === "list") {
        showDifficultTerrainList();
        return;
      }

      sendChat(AE, "/w gm Commands: !ae-terrain addradius TOKEN_ID RADIUS_FT NAME | !ae-terrain addtoken TOKEN_ID NAME | !ae-terrain addselected NAME | !ae-terrain addselectedradius RADIUS_FT NAME | !ae-terrain remove TOKEN_ID | !ae-terrain list | !ae-terrain clear");
      return;
    }

    if (root === "!ae-disarm") {
      const action = args[1];

      if (action === "attempt") {
        handleDisarmAttempt(args);
        return;
      }

      if (action === "apply") {
        const target = getObj("graphic", args[2]);

        if (!target || target.get("subtype") !== "token") {
          sendChat(AE, "/w gm Invalid Disarm target token.");
          return;
        }

        applyDisarmedItem(target, args[3]);
        return;
      }

      if (action === "pickup") {
        const target = getObj("graphic", args[2]);

        if (!target || target.get("subtype") !== "token") {
          sendChat(AE, "/w gm Invalid Disarm pickup token.");
          return;
        }

        pickupDisarmedItem(target, args[3]);
        return;
      }

      if (action === "clear") {
        const target = getObj("graphic", args[2]);

        if (!target || target.get("subtype") !== "token") {
          sendChat(AE, "/w gm Invalid Disarm clear token.");
          return;
        }

        removeCondition(target, "disarmed");
        sendChat(AE, "/w gm Cleared dropped equipment for " + tokenName(target) + ".");
        return;
      }

      sendChat(AE, "/w gm Commands: !ae-disarm attempt TARGET_ID SOURCE_ID ITEM_KEY SAVE DC | !ae-disarm apply TARGET_ID ITEM_KEY | !ae-disarm pickup TARGET_ID RECORD_ID | !ae-disarm clear TARGET_ID");
      return;
    }

    if (root === "!ae-summon") {
      const action = args[1];

      if (action === "pending") {
        const casterTokenId = args[2];
        const summonName = args[3];
        const concentration = args.includes("--concentration");
        const count = normalizePendingSummonCount(getOptionValue(args, "--count") || 1);
        const timeout = getOptionValue(args, "--timeout") || 300;
        const controlOptions = buildSummonControlOptions(args);
        const initiativeOptions = buildSummonInitiativeOptions(args);

        if (!casterTokenId || !summonName) {
          sendChat(AE, "/w gm Format: !ae-summon pending CASTER_TOKEN_ID SUMMON_NAME --count NUMBER --timeout SECONDS --concentration");
          return;
        }

        if (controlOptions && controlOptions.error) {
          sendChat(AE, "/w gm " + controlOptions.error);
          return;
        }

        if (initiativeOptions && initiativeOptions.error) {
          sendChat(AE, "/w gm " + initiativeOptions.error);
          return;
        }

        addPendingSummon(msg.playerid, casterTokenId, summonName, concentration, count, timeout, controlOptions, initiativeOptions);
        return;
      }

      if (action === "link") {
        const casterToken = getObj("graphic", args[2]);
        const summonToken = getObj("graphic", args[3]);
        const concentration = args.includes("--concentration");
        const controlOptions = buildSummonControlOptions(args);
        const initiativeOptions = buildSummonInitiativeOptions(args);

        if (!casterToken || !summonToken) {
          sendChat(AE, "/w gm Format: !ae-summon link CASTER_TOKEN_ID SUMMON_TOKEN_ID --concentration");
          return;
        }

        if (controlOptions && controlOptions.error) {
          sendChat(AE, "/w gm " + controlOptions.error);
          return;
        }

        if (initiativeOptions && initiativeOptions.error) {
          sendChat(AE, "/w gm " + initiativeOptions.error);
          return;
        }

        linkSummon(casterToken, summonToken, concentration, false, controlOptions);
        applySummonInitiative(summonToken, casterToken, initiativeOptions);
        return;
      }

      if (action === "claim") {
        const summonToken = getObj("graphic", args[2]);

        if (!summonToken) {
          sendChat(AE, "/w gm Format: !ae-summon claim SUMMON_TOKEN_ID");
          return;
        }

        claimPendingSummon(summonToken);
        return;
      }

      sendChat(AE, "/w gm Format: !ae-summon pending CASTER_TOKEN_ID SUMMON_NAME --count NUMBER --timeout SECONDS --concentration");
      return;
    }

    if (root === "!ae-visual") {
      const action = args[1];

      if (action === "debug") {
        sendChat(
          AE,
          "/w gm &{template:default} " +
          "{{name=AE Visual Debug}} " +
          "{{Pending=" + JSON.stringify(S.pendingVisualLinks) + "}} " +
          "{{Links=" + JSON.stringify(S.visualLinks) + "}}"
        );
        return;
      }

      if (action === "cleanup") {
        cleanupVisualEffectTokens(false);
        return;
      }

      if (action === "cleanupall") {
        cleanupVisualEffectTokens(true);
        return;
      }

      if (action === "pending") {
        const casterTokenId = args[2];
        const visualName = args[3];
        const effectName = args[4];

        if (!casterTokenId || !visualName || !effectName) {
          sendChat(AE, "/w gm Format: !ae-visual pending CASTER_TOKEN_ID VISUAL_NAME EFFECT_NAME");
          return;
        }

        addPendingVisualLink(msg.playerid, casterTokenId, visualName, effectName);
        return;
      }

      sendChat(AE, "/w gm Format: !ae-visual pending CASTER_TOKEN_ID VISUAL_NAME EFFECT_NAME");
      return;
    }

    if (root === "!ae-hazard") {
      const action = args[1];

      if (
        action === "immune" ||
        action === "unimmune" ||
        action === "clearimmune" ||
        action === "immunelist"
      ) {
        applyAreaImmunityCommand(msg, "hazard", args);
        return;
      }

      if (action === "add") {
        addAoeHazard(args);
        return;
      }

      if (action === "addselected") {
        addSelectedAoeHazards(msg, args);
        return;
      }

      if (action === "remove") {
        removeAoeHazard(args[2]);
        return;
      }

      if (action === "clear") {
        clearAoeHazards();
        return;
      }

      if (action === "list") {
        showAoeHazardList();
        return;
      }

      sendChat(AE, "/w gm Format: !ae-hazard add HAZARD_TOKEN_ID NAME RADIUS_OR_token SAVE DC CONDITION DURATION SOURCE [DAMAGE TYPE SUCCESS TRIGGERS] | !ae-hazard addselected NAME RADIUS_OR_token SAVE DC CONDITION DURATION SOURCE [DAMAGE TYPE SUCCESS TRIGGERS] | !ae-hazard remove TOKEN_ID | !ae-hazard clear | !ae-hazard list");
      return;
    }

    if (root === "!ae-aoe") {
      const action = args[1];

      if (action === "cast") {
        castAoe(args, msg.playerid, msg.content);
        return;
      }

      if (action === "trigger") {
        triggerAoe(args);
        return;
      }

      if (action === "clear") {
        clearAoe(args);
        return;
      }

      sendChat(AE, "/w gm Format: !ae-aoe cast/trigger/clear. Cast supports damage or --condition|CONDITION [--duration|DURATION].");
      return;
    }

    if (root === "!ae-ongoing") {
      const action = args[1];
      const targets = args[2] === "selected" ?
        getSelectedTokens(msg) :
        resolveTargets(msg, args, 2);

      if (!targets.length) {
        sendChat(AE, "/w gm Invalid ongoing damage target.");
        return;
      }

      if (action === "add") {
        targets.forEach(token => addOngoingDamage(token, args));
        return;
      }

      if (action === "remove") {
        targets.forEach(token => removeOngoingDamage(token, args[3] || "all"));
        sendChat(AE, "/w gm Removed ongoing damage.");
        return;
      }

      sendChat(AE, "/w gm Format: !ae-ongoing add/remove TOKEN_ID NAME");
      return;
    }

    if (root === "!ae-ability") {
      handleAbilityScoreCommand(args);
      return;
    }

    if (root === "!ae-effect") {
      const effect = args[1];
      const applyOptions = getApplyOptions(args);

      if (effect === "menu") {
        sendChat(AE, "/w gm " + registryMenuTemplate("Effects Menu", "!ae-effect", EFFECTS));
        return;
      }

      const targetArgIndex = effect === "remove" ? 3 : 2;
      const targets = resolveTargets(msg, args, targetArgIndex);

      if (!targets.length) {
        sendChat(AE, '/w "' + msg.who + '" Select a token or provide a target.');
        return;
      }

      targets.forEach(token => {
        if (effect === "remove") {
          removeEffect(token, args[2]);
        }
        else if (effect === "dash") dash(token);
        else if (effect === "disengage") applyEffect(token, "disengage");
        else if (effect === "reckless") applyEffect(token, "reckless");
        else if (effect === "haste") {
          applyEffect(token, "haste");
          resetMovement(token);
          getEconomy(token).hasteAction = true;
        }
        else if (effect === "lockmove") {
          applyEffect(token, "lockmove");
          lockMovement(token);
        }
        else applyEffect(token, effect, applyOptions);
      });

      return;
    }

    if (root === "!ae-con") {
      const condition = args[1];
      const applyOptions = getApplyOptions(args);
      const firstOptionIndex = args.findIndex(arg => arg && arg.indexOf("--") === 0);

      if (condition === "menu") {
        sendChat(AE, "/w gm " + registryMenuTemplate("Conditions Menu", "!ae-con", CONDITIONS));
        return;
      }

      const isExhaustionWithLevel =
        condition === "exhaustion" &&
        args[2] &&
        !isNaN(parseInt(args[2], 10));

      const targetArgIndex =
        condition === "remove" ? 3 :
        isExhaustionWithLevel ? 3 :
        firstOptionIndex === 2 ? null :
        2;

      const targets = targetArgIndex === null
        ? getSelectedTokens(msg)
        : resolveTargets(msg, args, targetArgIndex);

      if (!targets.length) {
        sendChat(AE, '/w "' + msg.who + '" Select a token or provide a target.');
        return;
      }

      targets.forEach(token => {
        if (condition === "remove") {
          removeCondition(token, args[2]);
          return;
        }

        if (condition === "exhaustion+") {
          increaseExhaustion(token);
          return;
        }

        if (condition === "exhaustion-") {
          decreaseExhaustion(token);
          return;
        }

        if (condition === "exhaustion" && (!args[2] || isNaN(parseInt(args[2], 10)))) {
          increaseExhaustion(token);
          return;
        }

        if (condition === "exhaustion") {
          setExhaustionLevel(token, parseInt(args[2], 10));
          enforceConditions(token);
          return;
        }

        applyCondition(token, condition, args[2], applyOptions);
        enforceConditions(token);

      });

      return;
    }
  });
});
