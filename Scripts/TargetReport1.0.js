/*
 * TargetReport 1.0
 * Player-facing qualitative target assessment for Roll20 D&D 2024.
 *
 * Requires ActionEconomyV2 2.8.1 or later for AE-owned condition and effect data.
 * Uses token Bar 1 for HP and Bar 4 for AC before falling back to Beacon values.
 */

on("ready", function () {
  const SCRIPT = "TargetReport";
  const VERSION = "1.0";

  const QUALITY_BANDS = [
    { max: 0.5, label: "Grunt" },
    { max: 2, label: "Regular" },
    { max: 4, label: "Veteran" },
    { max: 8, label: "Elite" },
    { max: 12, label: "Boss" },
    { max: 16, label: "Legendary" },
    { max: Infinity, label: "Mythic Threat" }
  ];

  const ARMOR_BANDS = [
    { max: 9, label: "Easy Target" },
    { max: 12, label: "Lightly Defended" },
    { max: 15, label: "Guarded" },
    { max: 18, label: "Well Armored" },
    { max: 21, label: "Heavily Armored" },
    { max: Infinity, label: "Formidable Defense" }
  ];

  log("=== " + SCRIPT + " " + VERSION + " Ready ===");

  function escapeTemplateText(value) {
    return String(value === undefined || value === null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\{/g, "&#123;")
      .replace(/\}/g, "&#125;")
      .replace(/\|/g, "&#124;");
  }

  function getWhisperName(msg) {
    const player = getObj("player", msg.playerid);
    const displayName = player
      ? player.get("_displayname")
      : String(msg.who || "Player").replace(/\s+\(GM\)$/, "");

    return String(displayName || "Player").replace(/["\\]/g, "");
  }

  function whisper(msg, content) {
    sendChat(SCRIPT, '/w "' + getWhisperName(msg) + '" ' + content);
  }

  function parseNumber(value) {
    if (value === undefined || value === null || value === "") return null;

    const parsed = Number(String(value).replace(/,/g, "").trim());
    return isFinite(parsed) ? parsed : null;
  }

  function parseChallengeRating(value) {
    if (value === undefined || value === null || value === "") return null;

    const text = String(value).trim();
    const fraction = text.match(/^(\d+)\s*\/\s*(\d+)/);

    if (fraction) {
      const numerator = Number(fraction[1]);
      const denominator = Number(fraction[2]);

      return denominator ? numerator / denominator : null;
    }

    const numberMatch = text.match(/^\d+(?:\.\d+)?/);
    return numberMatch ? Number(numberMatch[0]) : null;
  }

  function getPlayerPageId(playerId) {
    const campaign = Campaign();
    let playerPages = campaign.get("playerspecificpages") || {};

    if (typeof playerPages === "string") {
      try {
        playerPages = JSON.parse(playerPages) || {};
      } catch (error) {
        playerPages = {};
      }
    }

    return playerPages[playerId] || campaign.get("playerpageid");
  }

  function canInspectTarget(msg, token) {
    if (playerIsGM(msg.playerid)) return true;
    if (token.get("layer") !== "objects") return false;

    return token.get("_pageid") === getPlayerPageId(msg.playerid);
  }

  async function readSheetItem(characterId, attribute) {
    if (!characterId || typeof getSheetItem !== "function") return null;

    try {
      return await getSheetItem(characterId, attribute);
    } catch (error) {
      return null;
    }
  }

  function getQualityRating(challengeRating) {
    if (challengeRating === null || challengeRating < 0) return "Unknown";

    const band = QUALITY_BANDS.find(entry => challengeRating <= entry.max);
    return band ? band.label : "Unknown";
  }

  function getArmorRating(armorClass) {
    if (armorClass === null || armorClass < 0) return "Unknown";

    const band = ARMOR_BANDS.find(entry => armorClass <= entry.max);
    return band ? band.label : "Unknown";
  }

  function getHealthRating(currentHp, maximumHp) {
    if (currentHp === null || maximumHp === null || maximumHp <= 0) {
      return "Unknown";
    }

    const ratio = Math.max(0, Math.min(1, currentHp / maximumHp));

    if (ratio === 0) return "Defeated";
    if (ratio <= 0.25) return "Weak";
    if (ratio <= 0.5) return "Bloodied";
    if (ratio <= 0.75) return "Wounded";
    if (ratio < 1) return "Scratched";
    return "Unharmed";
  }

  function getStatusReport(token) {
    if (
      typeof ActionEconomyV2API === "undefined" ||
      typeof ActionEconomyV2API.getTargetStatus !== "function"
    ) {
      return {
        conditions: null,
        effects: null
      };
    }

    try {
      return ActionEconomyV2API.getTargetStatus(token);
    } catch (error) {
      return {
        conditions: null,
        effects: null
      };
    }
  }

  function formatStatusList(entries) {
    if (entries === null) return "Unavailable";
    if (!Array.isArray(entries) || !entries.length) return "None";

    return entries
      .map(entry => escapeTemplateText(entry && entry.display ? entry.display : entry.key))
      .join(", ");
  }

  async function getArmorClass(token) {
    const barValue = parseNumber(token.get("bar4_value"));

    if (barValue !== null && barValue >= 0) return barValue;

    const characterId = token.get("represents");
    if (!characterId) return null;

    const values = await Promise.all([
      readSheetItem(characterId, "ac"),
      readSheetItem(characterId, "npc_ac")
    ]);
    const ac = parseNumber(values[0]);
    const npcAc = parseNumber(values[1]);

    if (ac !== null && ac >= 0) return ac;
    if (npcAc !== null && npcAc >= 0) return npcAc;
    return null;
  }

  async function getHitPoints(token) {
    let currentHp = parseNumber(token.get("bar1_value"));
    let maximumHp = parseNumber(token.get("bar1_max"));

    if (currentHp !== null && maximumHp !== null && maximumHp > 0) {
      return {
        current: currentHp,
        maximum: maximumHp
      };
    }

    const characterId = token.get("represents");
    if (!characterId) {
      return {
        current: null,
        maximum: null
      };
    }

    const values = await Promise.all([
      readSheetItem(characterId, "hp"),
      readSheetItem(characterId, "hp_max")
    ]);

    currentHp = parseNumber(values[0]);
    maximumHp = parseNumber(values[1]);

    return {
      current: currentHp,
      maximum: maximumHp
    };
  }

  async function buildTargetReport(msg, token) {
    const characterId = token.get("represents");
    const results = await Promise.all([
      getArmorClass(token),
      getHitPoints(token),
      readSheetItem(characterId, "npc_challenge")
    ]);
    const armorClass = results[0];
    const hitPoints = results[1];
    const challengeRating = parseChallengeRating(results[2]);
    const status = getStatusReport(token);
    const canSeeName = playerIsGM(msg.playerid) || token.get("showplayers_name");
    const targetName = canSeeName && token.get("name")
      ? token.get("name")
      : "Target";

    return (
      "&{template:default} " +
      "{{name=Target Report — " + escapeTemplateText(targetName) + "}} " +
      "{{Enemy Quality=" + escapeTemplateText(getQualityRating(challengeRating)) + "}} " +
      "{{Armor=" + escapeTemplateText(getArmorRating(armorClass)) + "}} " +
      "{{Health=" + escapeTemplateText(getHealthRating(hitPoints.current, hitPoints.maximum)) + "}} " +
      "{{Conditions=" + formatStatusList(status.conditions) + "}} " +
      "{{Effects=" + formatStatusList(status.effects) + "}}"
    );
  }

  on("chat:message", async function (msg) {
    if (msg.type !== "api") return;

    const args = String(msg.content || "").trim().split(/\s+/);
    const command = String(args[0] || "").toLowerCase();

    if (command !== "!targetreport" && command !== "!tr") return;

    const targetId = args[1];
    const token = targetId ? getObj("graphic", targetId) : null;

    if (!token || token.get("subtype") !== "token") {
      whisper(msg, "Select a valid target token.");
      return;
    }

    if (!canInspectTarget(msg, token)) {
      whisper(msg, "That target is not available to inspect.");
      return;
    }

    whisper(msg, await buildTargetReport(msg, token));
  });
});
