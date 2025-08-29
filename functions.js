const Keyv = require("keyv");
const lodash = require("lodash");
const { emojis, healthemojis, dmgemojis } = require("./data.js");
const fs = require("fs");
const formatToJson = require("format-to-json");
const { MessageFlags } = require("discord.js");

const database = new Keyv("sqlite://databases//database.sqlite", {
  namespace: "userdata",
});

function cloneWithEdit(obj, edits) {
  return { ...lodash.cloneDeep(obj), ...edits };
}

function musicaltrigger(gamedata, squad, pos) {
  return (
    (gamedata.squads[squad - 1].some((x) => x.id == 14) ||
      gamedata.squads[squad - 1][pos + 1]?.id == 77) &&
    !gamedata.squads[squad * -1 + 2].some((x) => x?.id == 98)
  );
}

async function getlogs() {
  let logs = await JSON.parse(fs.readFileSync("logs.json", "utf8"));
  for (i = logs.logs.emojis.length; i < emojis.length; i++) {
    logs.logs.emojis.push({});
  }
  return logs;
}

async function writelogs(json) {
  const formattedjson = formatToJson(JSON.stringify(json), {
    withDetails: true,
  });
  fs.writeFileSync("logs.json", formattedjson.result, "utf8");
}

async function issquadinvalid(id) {
  let inputarr = await getsquad(id);
  inputarr = inputarr.map((str) => parseInt(str));
  let vaultarray = await getvault(id);
  let datainput = [];
  let emojimissing = false;
  for (let i = 0; i < 8; i++) {
    if (vaultarray.find((x) => x == inputarr[i]) != undefined) {
      vaultarray.splice(
        vaultarray.findIndex((x) => x == inputarr[i]),
        1
      );
      datainput = inputarr[i] + "," + datainput;
    } else {
      emojimissing = inputarr[i];
      break;
    }
  }
  return emojimissing;
}

async function makesquad(player1squadarray, tries, evil) {
  let player2squadarray;
  let wins = [];
  let squads = [];
  if (evil) {
    player2squadarray = player1squadarray;
  } else {
    player2squadarray = [];
    for (let i = 0; i < 8; i++) {
      const possibleemojis = allemojisofrarity(
        emojis[player1squadarray[i]].rarity
      );
      player2squadarray.splice(
        Math.floor(Math.random() * (player2squadarray.length + 1)),
        0,
        possibleemojis[Math.floor(Math.random() * possibleemojis.length)]
      );
    }
  }
  for (let j = 0; j < tries; j++) {
    wins.push(0);
    let player3squadarray = [];
    for (let i = 0; i < 8; i++) {
      const possibleemojis = allemojisofrarity(
        emojis[player1squadarray[i]].rarity
      );
      player3squadarray.splice(
        Math.floor(Math.random() * (player3squadarray.length + 1)),
        0,
        possibleemojis[Math.floor(Math.random() * possibleemojis.length)]
      );
    }
    squads.push(lodash.cloneDeep(player3squadarray));
    let gamedata = {
      squads: [[], []],
      emojitext: "",
      richtext: [],
      turn: 0,
      player: ["DojoBot", "DojoBot"],
      playerturn: Math.floor(Math.random() * 2) + 1,
      newlines: 0,
      logfile: `Dojobot vs Dojobot\n\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\nTurn 1`,
    };
    for (let i = 0; i < 8; i++) {
      gamedata.squads[0].push(lodash.cloneDeep(emojis[player2squadarray[i]]));
    }
    for (let i = 0; i < 8; i++) {
      gamedata.squads[1].push(lodash.cloneDeep(emojis[player3squadarray[i]]));
    }
    let oldgamedata;
    if (evil) {
      oldgamedata = lodash.cloneDeep(gamedata);
    }

    for (let i = 0; i < 1 + 24 * Number(evil); i++) {
      let prevturn = lodash.cloneDeep(gamedata.squads);
      try {
        while (
          gamedata.turn < 200 &&
          gamedata.squads[0][0] != null &&
          gamedata.squads[1][0] != null
        ) {
          if (gamedata.turn % 5 == 0) {
            prevturn = lodash.cloneDeep(gamedata.squads);
          }
          gamedata = playturn(gamedata);
          if (
            gamedata.turn % 5 == 0 &&
            lodash.isEqual(gamedata.squads, prevturn)
          ) {
            gamedata.turn = 999;
            break;
          }
        }
      } catch (e) {
        console.error(e);
      }
      if (!evil) {
        if (
          gamedata.turn >= 200 ||
          (gamedata.squads[0].length == 0 && gamedata.squads[1].length == 0)
        ) {
          if (Math.random() > 0.5) {
            player2squadarray = lodash.cloneDeep(player3squadarray);
          }
        } else if (gamedata.squads[0].length == 0) {
          player2squadarray = lodash.cloneDeep(player3squadarray);
        }
      } else {
        if (gamedata.squads[0].length == 0) {
          wins[j] += 1;
        }
        gamedata = lodash.cloneDeep(oldgamedata);
      }
    }
  }
  if (evil) {
    const bestSquadindex = wins.reduce(
      (maxIdx, currentVal, currentIdx, arr) =>
        currentVal > arr[maxIdx] ? currentIdx : maxIdx,
      0
    );
    return squads[bestSquadindex];
  } else {
    return player2squadarray;
  }
}

async function userboop(id) {
  let logs = await getlogs();
  logs.logs.players[`user${id}`] = logs.logs.players[`user${id}`] ?? {};
  logs.logs.players[`user${id}`].lastboop = Math.floor(Date.now() / 1000);
  logs.logs.games.lastboop = Math.floor(Date.now() / 1000);
  await writelogs(logs);
}

async function dailyrewardremind(interaction) {
  const dailytime = parseInt(
    (await database.get(interaction.user.id + "dailytime")) ?? "0"
  );
  if (Math.floor(Date.now() / 1000) - dailytime > 86400) {
    interaction.followUp({
      content:
        "📦 Your **daily reward** is ready to claim! Claim it now with </daily:1386876634270929048>!",
      flags: MessageFlags.Ephemeral,
    });
  }
}

async function getvault(id) {
  //await database.set(id+"vault","0,1,2,3,4,5,6,8,9,10,11,12,13,14,15,16,17,18,19,20,22,23,0,1,2,3,4,5,6,8,")
  const rawvault = await database.get(id + "vault");
  let vault = rawvault.split(",").map((str) => parseInt(str));
  vault.pop();
  return vault;
}

async function devoteemojis(id, emojiid, amount) {
  let vaultarray = await getvault(id);
  let matches = [];
  for (let i = vaultarray.length - 1; i >= 0; i--) {
    if (vaultarray[i] == emojiid) {
      matches.push(i);
      if (matches.length == amount) break;
    }
  }
  for (let i of matches) {
    vaultarray.splice(i, 1);
  }
  await database.set(id + "vault", vaultarray.join(",") + ",");
  let lab = await fetchresearch(id);
  lab[emojis[emojiid].class] += amount * (2 * emojis[emojiid].rarity + 1);
  await database.set(id + "research", lab.join("/"));
  return (emojis[emojiid].emoji + " ").repeat(amount);
}

async function fetchresearch(id) {
  const userresearch =
    (await database.get(id + "research")) ?? "0/0/0/0/0/0/0/0/0";
  let lab = userresearch.split("/");
  while (lab.length < 9) {
    lab.push(0);
  }
  return lab.map(Number);
}

async function syncresearch(id, lab) {
  await database.set(id + "research", lab.join("/"));
}

async function trysetupuser(user) {
  const rawvault = await database.get(user.id + "vault");
  const rawsquad = await database.get(user.id + "squad");
  await userboop(user.id);
  if (rawvault == undefined || rawsquad == undefined) {
    let logs = await getlogs();
    logs.logs.players[`user${user.id}`].joindate = Math.floor(
      Date.now() / 1000
    );
    await writelogs(logs);
    let emojilist = emojis.filter((e) => e.rarity == 0);
    let allemojistoadd = "";
    let allemojitext = "";
    for (let i = 0; i < 7; i++) {
      const emojitoadd =
        emojilist[Math.floor(Math.random() * emojilist.length)];
      allemojistoadd += emojitoadd.id + ",";
      allemojitext += " " + emojitoadd.emoji;
    }
    emojilist = emojis.filter((e) => e.rarity == 1);
    for (let i = 0; i < 7; i++) {
      const emojitoadd =
        emojilist[Math.floor(Math.random() * emojilist.length)];
      allemojistoadd += emojitoadd.id + ",";
      allemojitext += " " + emojitoadd.emoji;
    }
    await database.set(user.id + "vault", allemojistoadd);
    await database.set(user.id + "squad", allemojistoadd);
    const welcomemessage = `# ⛩️😀 Welcome to the Emoji Dojo, <@${user.id}>! 🏯🎋
**It is here that you will over time hone your skills and master the art of Emoji Battles.**

## 💁💬 \`Tipping Hand\`
\`\`\`Hello! My name is Tipping Hand, and I'm in charge of wrangling these here emojis for you to battle with. Here, I'll give you this selection to start off with.\`\`\`

*(You received${allemojitext}!)*

\`\`\`That should be good enough to start with! Go ahead, you can get to know 'em.\`\`\`

*(Use </dojo:1277719095701143680> to see your collection of Emojis, and see details about each one.)*

\`\`\`When you're ready, organize them into a Squad optimized to battle others and create the best synergy.\`\`\`

*(Use </squad:1277719095701143681> to view your Squad. You can edit your squad from the </dojo:1277719095701143680>.)*

\`\`\`Finally, you can Battle! Engage your friends in a Battle, or lower the stakes with a Friendly Battle. If there's no one who wants to fight you, you can always battle Dojobot in a Bot Battle!\`\`\`

*(Use </battleuser:1279264987717570610> and </battlebot:1277719095701143677> to engage in Battles to earn Coins. You can also use </friendlybattle:1289287177875886161> to battle friends without worrying about losing Coins.)*

\`\`\`Once you have enough Coins, you can visit my Emoji Shop! I sell these little guys to aspiring battlers like you. Stop by when you're looking for an emoji!\`\`\`

*(You can use </coins:1277719095701143678> to see how many Coins you have, and </shop:1290417978734678098> to visit Tipping Hand's shop.)*`;
    await user.send({ content: welcomemessage });
    return true;
  } else {
    return false;
  }
}

async function coinschange(id, amt, affectcooldown) {
  let restocktime = (await database.get(id + "coinrestock")) ?? "0";

  if (parseInt(restocktime) < Date.now() / 1000) {
    let now = new Date();
    let startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let midnight = startOfDay.getTime() / 1000;
    let noon = midnight + 43200;
    let nextReset;

    let currentTime = Date.now() / 1000;
    if (currentTime < noon) {
      nextReset = noon;
    } else if (currentTime < midnight + 86400) {
      nextReset = midnight + 86400;
    } else {
      nextReset = midnight + 129600;
    }

    await database.set(id + "coinmod", "16");
    await database.set(id + "coinrestock", nextReset);
    restocktime = nextReset;
  }
  affectcooldown = affectcooldown ?? true;
  const originalamt = amt;
  let coinmod = 0;
  let doublerbonus = 0;
  if (affectcooldown) {
    coinmod = parseInt((await database.get(id + "coinmod")) ?? "16");
    if (amt > 0) {
      amt = Math.floor((amt / 20) * coinmod);
      const coindoubler = (await database.get(id + "coindoubler")) ?? 0;
      doublerbonus = Math.min(coindoubler, amt);
      await database.set(id + "coindoubler", coindoubler - doublerbonus);
      amt += doublerbonus;
    }
    if (coinmod > 0) {
      coinmod -= 2;
    }
    await database.set(id + "coinmod", coinmod);
  }
  let rawcoins = parseInt((await database.get(id + "coins")) ?? "100");
  rawcoins += amt;
  await database.set(id + "coins", rawcoins);
  return [amt, doublerbonus];
}

async function getsquad(id) {
  let rawsquad = await database.get(id + "squad");
  if (rawsquad == undefined) {
    await database.set(id + "squad", await database.get(id + "vault"));
  }
  rawsquad = await database.get(id + "squad");
  let squad = rawsquad.split(",");
  return squad.slice(0, 8);
}

function allemojisofrarity(rarity) {
  let returninfo = [];
  for (i = 0; i < emojis.length; i++) {
    if (emojis[i].rarity == rarity) {
      returninfo.push(emojis[i]?.id);
    }
  }
  return returninfo;
}

function richtextadd(gamedata, text) {
  gamedata.richtext.push(text);
  gamedata.logfile += text;
  gamedata.newlines += 1;
  return gamedata;
}

function alterhp(gamedata, squad, pos, squad2, pos2, val, verb, silence) {
  if (gamedata.richtext.length > 10000) {
    console.log(JSON.stringify(gamedata));
    return;
  }
  let target;
  modifyAttack: {
    if (
      gamedata.squads[squad - 1].findIndex((x) => x.id == 89) > -1 &&
      squad != squad2
    ) {
      // dart
      pos = gamedata.squads[squad - 1].findIndex((x) => x.id == 89);
    }
    if (
      gamedata.squads[squad - 1].findIndex((x) => x.id == 117) > -1 &&
      squad != squad2
    ) {
      // moyai/moai
      pos = gamedata.squads[squad - 1].findIndex((x) => x.id == 117);
    }
    if (
      gamedata.squads[squad - 1].findIndex((x) => x.id == 118) > -1 &&
      squad != squad2
    ) {
      // customs
      pos = gamedata.squads[squad - 1].findIndex((x) => x.id == 118);
    }
    if (
      gamedata.squads[squad - 1].findIndex((x) => x.id == 119) > -1 &&
      squad != squad2
    ) {
      // hot face
      pos = gamedata.squads[squad - 1].findIndex((x) => x.id == 119);
    }
    if (
      gamedata.squads[squad - 1].findIndex((x) => x.id == 120) > -1 &&
      squad != squad2
    ) {
      // military helmet
      pos = gamedata.squads[squad - 1].findIndex((x) => x.id == 120);
    }

    target = lodash.cloneDeep(gamedata.squads[squad - 1][pos]);

    if (gamedata.squads[squad2 - 1][pos2 + 1]?.id == 12 && val <= 0) {
      // martial arts uniform
      val -= 1;
    }
    if (gamedata.squads[squad2 - 1][pos2 + 1]?.id == 75 && val <= 0) {
      // anger
      val -= 2;
    }
    if (gamedata.squads[squad2 - 1][pos2]?.id == 114 && val <= 0) {
      // dotted line face
      val -= 1;
    }
    if (
      gamedata.squads[squad2 - 1][pos2]?.id == 109 &&
      val <= 0 &&
      gamedata.squads[squad2 - 1][pos2]?.hp < target?.hp
    ) {
      // boxing glove
      val -= 1;
    }
    if (gamedata.squads[squad2 - 1][pos2]?.id == 94 && val < 0) {
      val = -1;
    }
    if (
      gamedata.squads[squad2 - 1][pos2]?.id == 13 &&
      val <= 0 &&
      musicaltrigger(gamedata, squad2, pos2)
    ) {
      // guitar
      val -= 1;
    }
    if (
      gamedata.squads[squad2 - 1][pos2]?.id == 44 &&
      val <= 0 &&
      musicaltrigger(gamedata, squad2, pos2)
    ) {
      // violin
      val -= 3;
    }
    if (gamedata.squads[squad2 - 1][pos2]?.id == 22 && val <= 0) {
      // rage
      val -= Math.ceil(gamedata.squads[squad - 1].length / 2);
    }
    // protection buffs start here
    if ((target?.id == 2 || target?.id == 117) && val < 0) {
      // relieved face, moyai/moai
      val = Math.min(val + 1, -1);
    }
    if (target?.id == 79 && val < 0 && musicaltrigger(gamedata, squad, pos)) {
      // drum
      val = Math.min(val + 1, -1);
    }

    if (target?.id == 35 && val < 0) {
      // bricks
      val = Math.min(val + 2, -1);
    }
    if (target?.id == 54 && val < 0) {
      // bubbles
      val = -1;
    }
    if (target?.id == 17) {
      // shield
      if (val < 0) {
        val = Math.min(
          val + gamedata.squads[squad - 1].filter((x) => x.class == 2).length,
          -1
        );
      } else if (val > 0) {
        val = 0;
        verb = "tried to heal";
      }
    }
    if ((target?.id == 40 || target?.id == 89) && val < 0) {
      // joker, dart
      val = val - 1;
    }
    if (target?.id == 25 || target?.id == 54 || target?.id == 120) {
      // bricks, bubbles, military helmet
      if (val > 0) {
        val = 0;
        verb = "tried to heal";
      }
    }
    if (gamedata.squads[squad * -1 + 2][0]?.id == 97 && pos == 0) {
      // adhesive bandage
      if (val > 0) {
        val = 0;
        verb = "tried to heal";
      }
    }
  }

  if (gamedata.squads[squad - 1][pos]) {
    if (
      (gamedata.squads[squad - 1][pos].hp == undefined ||
        gamedata.squads[squad - 1][pos].hp < 0) &&
      gamedata.squads[squad - 1][pos]
    ) {
      gamedata.squads[squad - 1][pos].hp = 0;
    }
    gamedata.squads[squad - 1][pos].hp += val;
    target = gamedata.squads[squad - 1][pos];

    beforeAttack: {
      if (
        gamedata.squads[squad2 - 1][pos2]?.id == 42 &&
        gamedata.squads[squad2 - 1].length > 1
      ) {
        // dancer
        const temp = gamedata.squads[squad2 - 1][pos2];
        gamedata.squads[squad2 - 1].splice(pos2, 1);
        gamedata.squads[squad2 - 1].splice(pos2 + 1, 0, temp);
        gamedata = richtextadd(
          gamedata,
          `\n⇋ ${gamedata.player[squad2 - 1]}'s ${
            emojis[42].emoji
          } danced behind ${gamedata.squads[squad2 - 1][pos2].emoji}!`
        );
      }
      if (
        (gamedata.squads[squad2 - 1][pos2]?.id == 64 ||
          gamedata.squads[squad2 - 1][pos2]?.id == 38 ||
          gamedata.squads[squad2 - 1][pos2]?.id == 119) &&
        squad != squad2
      ) {
        // mushroom, sparkles, hot face
        gamedata = alterhp(gamedata, squad2, pos2, squad2, pos2, -1, "", true);
        gamedata = richtextadd(
          gamedata,
          `\n↢ ${gamedata.player[squad2 - 1]}'s ${
            gamedata.squads[squad2 - 1][pos2]?.emoji
          } damaged itself by attacking! (1 damage)`
        );
      }
    }
    if (gamedata.squads[squad - 1][pos].hp <= 0) {
      beforeDefeated: {
        if (target?.id == 86) {
          // bone/dino
          gamedata.squads[squad - 1].splice(
            pos,
            1,
            lodash.cloneDeep(emojis[87])
          );
          gamedata = richtextadd(
            gamedata,
            `\n⇪ Instead of being defeated, ${gamedata.player[squad - 1]}'s ${
              emojis[86].emoji
            } evolved into ${emojis[87].emoji}!`
          );
        }
      }
    }

    let kill;
    if (target?.hp <= 0) {
      kill = true;
      beforeDefeating: {
        if (gamedata.squads[squad2 - 1][pos2]?.id == 82) {
          // dove
          gamedata.squads[squad2 - 1].splice(
            0,
            0,
            lodash.cloneDeep(gamedata.squads[squad - 1][pos])
          );
          gamedata.squads[squad2 - 1][0].hp = 1;
          gamedata.squads[squad - 1].splice(pos, 1);
          gamedata = richtextadd(
            gamedata,
            `\n⇋ ${gamedata.player[squad2 - 1]}'s ${
              emojis[82].emoji
            } made peace with ${gamedata.player[squad - 1]}'s ${
              gamedata.squads[squad - 1][pos].emoji
            }!`
          );
          silence = true;
          kill = false;
        }
        if (gamedata.squads[squad2 - 1][pos2]?.id == 115) {
          // no entry sign
          gamedata = richtextadd(
            gamedata,
            `\n✩ ${gamedata.player[squad2 - 1]}'s ${
              emojis[115].emoji
            } deleted ${gamedata.player[squad - 1]}'s ${
              gamedata.squads[squad - 1][pos].emoji
            }!`
          );
          gamedata.squads[squad - 1].splice(pos, 1);
          silence = true;
          kill = false;
        }
      }
      if (
        !silence &&
        gamedata.squads[squad2 - 1][pos2] &&
        gamedata.squads[squad - 1][pos]
      ) {
        gamedata = richtextadd(
          gamedata,
          `\n𝚾 ${gamedata.player[squad2 - 1]}'s ${
            gamedata.squads[squad2 - 1][pos2].emoji
          } defeated ${gamedata.player[squad - 1]}'s ${
            gamedata.squads[squad - 1][pos].emoji
          }! (${val * -1} damage)`
        );
      }
      defeating: {
        if (gamedata.squads[squad2 - 1][pos2]?.id == 20) {
          // chess pawn
          gamedata.squads[squad2 - 1].splice(pos2, 1);
          gamedata.squads[squad2 - 1].splice(
            pos2,
            0,
            lodash.cloneDeep(emojis[21])
          );
          gamedata = richtextadd(
            gamedata,
            `\n⇪ ${gamedata.player[squad2 - 1]}'s ${
              emojis[20].emoji
            } was promoted to a ${emojis[21].emoji}!`
          );
        }
        if (gamedata.squads[squad2 - 1][pos2]?.id == 80) {
          // fax
          gamedata.squads[squad2 - 1].splice(
            pos2,
            0,
            lodash.cloneDeep(emojis[81])
          );
          gamedata = richtextadd(
            gamedata,
            `\n✚ ${gamedata.player[squad2 - 1]}'s ${
              emojis[80].emoji
            } printed out a ${emojis[81].emoji}!`
          );
        }
        if (
          gamedata.squads[squad2 - 1][pos2]?.id == 83 &&
          !(squad2 == squad && pos2 == pos)
        ) {
          // innocent
          gamedata = alterhp(
            gamedata,
            squad2,
            pos2,
            squad2,
            pos2,
            -3,
            "",
            true
          );
          gamedata = richtextadd(
            gamedata,
            `\n↢ ${gamedata.player[squad2 - 1]}'s ${
              emojis[83].emoji
            } was hurt by its violence! (3 damage)`
          );
        }
        if (gamedata.squads[squad2 - 1][pos2]?.id == 52) {
          // night with stars
          for (i = 0; i < gamedata.squads[squad - 1].length; i++) {
            if (
              gamedata.squads[squad - 1][i]?.id == target?.id &&
              gamedata.squads[squad - 1][i].hp > 0
            ) {
              gamedata = alterhp(gamedata, squad, i, squad2, pos, -1);
            }
          }
        }
        if (gamedata.squads[squad2 - 1][pos2]?.id == 53) {
          // wolf
          gamedata = alterhp(gamedata, squad2, pos2, squad2, pos2, 1, "", true);
          gamedata.squads[squad2 - 1][pos2].dmg += 1;
          gamedata = richtextadd(
            gamedata,
            `\n⇮ ${gamedata.player[squad2 - 1]}'s ${
              gamedata.squads[squad2 - 1][pos2].emoji
            } strengthened and healed itself by 1!`
          );
        }
        if (target?.id == 45) {
          // radio
          gamedata.squads[squad - 1].splice(
            gamedata.squads[squad - 1].length,
            0,
            lodash.cloneDeep(emojis[14])
          );
          gamedata = richtextadd(
            gamedata,
            `\n✚ ${gamedata.player[squad - 1]}'s ${emojis[45].emoji} played a ${
              emojis[14].emoji
            } at the back of the Squad!`
          );
        }
        if (target?.id == 69) {
          // amphora
          const commons = emojis.filter((item) => item.rarity === 0);
          const rand = Math.floor(Math.random() * commons.length);
          gamedata.squads[squad - 1].splice(
            pos + 1,
            0,
            lodash.cloneDeep(commons[rand])
          );
          gamedata = richtextadd(
            gamedata,
            `\n⇪ ${gamedata.player[squad - 1]}'s ${
              emojis[69].emoji
            } broke and revealed ${commons[rand].emoji}!`
          );
        }
        if (target?.id == 65 && gamedata.squads[squad2 - 1][pos2]) {
          // busts in silhouette
          gamedata.squads[squad - 1].splice(
            1 + pos,
            0,
            lodash.cloneDeep(gamedata.squads[squad2 - 1][pos2])
          );
          gamedata = richtextadd(
            gamedata,
            `\n⇪ ${gamedata.player[squad - 1]}'s ${
              emojis[65].emoji
            } transformed into an exact replica of ${
              gamedata.player[squad2 - 1]
            }'s ${gamedata.squads[squad2 - 1][pos2].emoji}!`
          );
        }
        if (gamedata.squads[squad - 1][pos + 1]?.id == 66) {
          // new
          gamedata.squads[squad - 1].splice(
            pos + 1,
            1,
            lodash.cloneDeep(emojis[target?.id])
          );
          gamedata = richtextadd(
            gamedata,
            `\n✚ ${gamedata.player[squad - 1]}'s ${emojis[66].emoji} revived ${
              gamedata.squads[squad - 1][pos].emoji
            }, and defeated itself!`
          );
        }
        if (target?.id == 57) {
          // mask
          gamedata.squads[0 - squad + 2].splice(
            0,
            0,
            lodash.cloneDeep(emojis[58])
          );
          gamedata = richtextadd(
            gamedata,
            `\n✚ ${gamedata.player[squad - 1]}'s ${emojis[57].emoji} infected ${
              gamedata.player[0 - squad + 2]
            }'s Squad with a ${emojis[58].emoji}!`
          );
          gamedata = richtextadd(
            gamedata,
            `\n↝ ${gamedata.player[squad - 1]}'s ${emojis[57].emoji} Shuffled ${
              gamedata.player[squad2 - 1]
            }'s Squad!`
          );
          gamedata = shufflesquad(gamedata, squad2);
        }
        if (target?.id == 39) {
          // unicorn
          gamedata.squads[0 - squad + 2].splice(
            0,
            0,
            lodash.cloneDeep(emojis[38])
          );
          gamedata = richtextadd(
            gamedata,
            `\n✚ ${gamedata.player[squad - 1]}'s ${
              emojis[39].emoji
            } summoned a ${emojis[38].emoji} at the front of ${
              gamedata.player[0 - squad + 2]
            }'s Squad!`
          );
        }
        if (target?.id == 121) {
          // tree
          for (i = 0; i < 2; i++) {
            gamedata.squads[squad2 - 1].splice(0, 0, lodash.cloneDeep(emojis[122]));
          }
          gamedata = richtextadd(
            gamedata,
            `\n✚ ${gamedata.player[squad - 1]}'s ${emojis[121].emoji} dropped ${
              emojis[122].emoji
            }${emojis[122].emoji} in ${gamedata.player[squad2 - 1]}'s Squad!`
          );
        }
        if (target?.id == 118) {
          // customs
          gamedata = shufflesquad(gamedata, squad2);
          gamedata = richtextadd(
            gamedata,
            `\n↝ ${gamedata.player[squad - 1]}'s ${
              emojis[118].emoji
            } Shuffled ${gamedata.player[squad2 - 1]}'s Squad!`
          );
        }
        if (target?.id == 43 && gamedata.squads[squad2 - 1][pos2]?.id != 43) {
          // pinata
          gamedata = richtextadd(
            gamedata,
            `\n✩ ${gamedata.player[squad - 1]}'s ${emojis[43].emoji} shattered!`
          );
          gamedata = alterhp(
            gamedata,
            0 - squad + 3,
            0,
            squad,
            pos,
            -2,
            "threw candy at",
            false
          );
          if (gamedata.squads[squad - 1].length > 1) {
            gamedata = alterhp(
              gamedata,
              squad,
              1,
              squad,
              pos,
              2,
              "gave candy to",
              false
            );
          }
        }
        if (target?.id == 122) {
          // apple
          gamedata = alterhp(gamedata, 0 - squad + 3, 0, squad, pos, 1);
        }
        if (target?.id == 124) {
          // zzz
          gamedata = alterhp(gamedata, squad, pos + 1, squad, pos, 1);
        }
        if (target?.id != 61) {
          // wand
          for (i = gamedata.squads[squad - 1].length - 1; i > -1; i--) {
            if (gamedata.squads[squad - 1][i]?.id == 61) {
              gamedata.squads[squad - 1].splice(
                gamedata.squads[squad - 1].length,
                0,
                lodash.cloneDeep(emojis[target?.id])
              );
              gamedata = alterhp(
                gamedata,
                squad,
                i,
                squad,
                i,
                -1000,
                "used up",
                true
              );
              gamedata = richtextadd(
                gamedata,
                `\n✚ ${gamedata.player[squad - 1]}'s 🪄 revived the ${
                  gamedata.squads[squad - 1][pos].emoji
                } at the back of the Squad!`
              );
            }
          }
        }
        if (target?.id == 59 && gamedata.squads[squad2 - 1][0]) {
          // flying saucer
          gamedata.squads[squad - 1].splice(pos, 1);
          gamedata = shufflesquad(gamedata, squad2);
          gamedata = richtextadd(
            gamedata,
            `\n↝ ${gamedata.player[squad - 1]}'s ${emojis[59].emoji} Shuffled ${
              gamedata.player[squad2 - 1]
            }'s Squad, and zapped ${
              gamedata.squads[squad2 - 1][0]?.emoji
            } for 3 damage!`
          );
          gamedata = alterhp(
            gamedata,
            squad2,
            0,
            squad,
            -1,
            -3,
            "zapped",
            true
          );
          kill = false;
        }
        if (target?.id == 55 && gamedata.squads[squad2 - 1][0]) {
          // banana
          const temp = gamedata.squads[squad2 - 1][0];
          gamedata.squads[squad2 - 1].splice(0, 1);
          gamedata.squads[squad2 - 1].splice(
            gamedata.squads[squad2 - 1].length,
            0,
            temp
          );
          gamedata.squads[squad - 1].splice(pos, 1);
          gamedata = alterhp(
            gamedata,
            squad2,
            gamedata.squads[squad2 - 1].length - 1,
            squad,
            -1,
            -2,
            "",
            true
          );
          gamedata = richtextadd(
            gamedata,
            `\n⇋ ${gamedata.player[squad2 - 1]}'s ${temp.emoji} slipped on ${
              gamedata.player[squad - 1]
            }'s ${emojis[55].emoji}!`
          );
          kill = false;
        }
        if (target?.id == 56) {
          // magnet
          const temp =
            gamedata.squads[squad2 - 1][gamedata.squads[squad2 - 1].length - 1];
          gamedata.squads[squad2 - 1].splice(
            gamedata.squads[squad2 - 1].length - 1,
            1
          );
          gamedata.squads[squad2 - 1].splice(0, 0, temp);
          gamedata.squads[squad - 1].splice(pos, 1);
          gamedata = alterhp(gamedata, squad2, 0, squad, -1, -2, "", true);
          gamedata = richtextadd(
            gamedata,
            `\n⇋ ${gamedata.player[squad2 - 1]}'s ${
              temp.emoji
            } was pulled to the front of the Squad by ${
              gamedata.player[squad - 1]
            }'s ${emojis[56].emoji}!`
          );
          kill = false;
        }
        if (target?.id == 46) {
          // fire
          if (gamedata.squads[squad - 1].length > 1) {
            gamedata = alterhp(
              gamedata,
              squad,
              1,
              squad,
              pos,
              -2,
              "burned",
              false
            );
          }
        }
        if (
          gamedata.squads[squad2 - 1][pos2]?.id == 113 &&
          gamedata.squads[squad - 1][pos + 1]
        ) {
          // scissors
          const tempemj = gamedata.squads[squad - 1][pos + 1]?.emoji;
          const temphp = gamedata.squads[squad - 1][pos + 1]?.hp;
          const tempdmg = gamedata.squads[squad - 1][pos + 1]?.dmg;
          gamedata.squads[squad - 1].splice(
            pos + 1,
            1,
            lodash.cloneDeep(emojis[114])
          );
          gamedata.squads[squad - 1][pos + 1].hp = temphp;
          gamedata.squads[squad - 1][pos + 1].dmg = tempdmg;
          gamedata = richtextadd(
            gamedata,
            `\n⇪ ${gamedata.player[squad2 - 1]}'s ${
              emojis[113].emoji
            } transformed ${gamedata.player[squad - 1]}'s ${tempemj} into ${
              emojis[114].emoji
            }!`
          );
        }
      }
      if (kill) {
        gamedata.squads[squad - 1].splice(pos, 1);
        defeat: {
          if (
            (
              gamedata.squads[squad2 - 1][
                gamedata.squads[squad2 - 1].length - 1
              ] ?? {
                id: undefined,
              }
            ).id == 48
          ) {
            // tada
            gamedata = alterhp(
              gamedata,
              squad2,
              0,
              squad2,
              gamedata.squads[squad2 - 1].length - 1,
              1,
              "congratulated"
            );
          }
          for (i = 0; i < gamedata.squads[squad - 1].length; i++) {
            if (
              gamedata.squads[squad - 1][i]?.id == 11 &&
              gamedata.squads[squad - 1][i]?.hp > 0
            ) {
              // headstone
              gamedata = alterhp(gamedata, squad, i, squad, i, 1);
            }
            if (gamedata.squads[squad - 1][i]?.id == 103) {
              // bouquet
              gamedata.squads[squad - 1][i].dmg += 1;
            }
            if (gamedata.squads[squad - 1][i]?.id == 51) {
              // xray
              for (j = i + 1; j < gamedata.squads[squad - 1].length; j++) {
                gamedata = alterhp(
                  gamedata,
                  squad,
                  j,
                  squad,
                  i,
                  1,
                  "healed",
                  true
                );
              }
              gamedata = richtextadd(
                gamedata,
                `\n♡ ${gamedata.player[squad - 1]}'s ${
                  emojis[51].emoji
                } healed all Emojis behind itself by 1!`
              );
            }
            if (gamedata.squads[squad - 1][i]?.id == 62) {
              // skyline
              takeeffect = false;
              for (j = 0; j < gamedata.squads[squad - 1].length; j++) {
                if (
                  gamedata.squads[squad - 1][j]?.id == target?.id &&
                  gamedata.squads[squad - 1][j].hp > 0
                ) {
                  gamedata = alterhp(gamedata, squad, j, squad, i, 1, "", true);
                }
                takeeffect = true;
              }
              if (takeeffect) {
                gamedata = richtextadd(
                  gamedata,
                  `\n♡ ${gamedata.player[squad - 1]}'s ${
                    emojis[62].emoji
                  } healed all friendly ${target?.emoji} by 1!`
                );
              }
            }
          }
          for (i = 0; i < gamedata.squads[squad2 - 1].length; i++) {
            if (gamedata.squads[squad2 - 1][i]?.id == 25) {
              // skull and crossbones
              gamedata = alterhp(gamedata, squad2, i + 1, squad2, i, 1);
            }
            if (gamedata.squads[squad2 - 1][i]?.id == 18) {
              // skull
              gamedata = alterhp(gamedata, squad2, i, squad2, i, 1);
            }
          }
        }
      }
    } else {
      if (val > 0) {
        if (!silence && gamedata.squads[squad2 - 1][pos2]) {
          if (squad == squad2 && pos == pos2) {
            gamedata = richtextadd(
              gamedata,
              `\n♡ ${gamedata.player[squad2 - 1]}'s ${
                gamedata.squads[squad2 - 1][pos2].emoji
              } ${verb ?? "healed"} itself. (${val} health)`
            );
          } else {
            gamedata = richtextadd(
              gamedata,
              `\n♡ ${gamedata.player[squad2 - 1]}'s ${
                gamedata.squads[squad2 - 1][pos2].emoji
              } ${verb ?? "healed"} ${gamedata.player[squad - 1]}'s ${
                gamedata.squads[squad - 1][pos].emoji
              }. (${val} health)`
            );
          }
        }
        healed: {
          if (target?.id == 108) {
            // heart on fire
            gamedata = alterhp(
              gamedata,
              squad * -1 + 3,
              0,
              squad,
              pos,
              0 - val
            );
          }
          if (target?.id == 50 && gamedata.squads[squad2 - 1][pos2]?.id != 33) {
            // track next
            gamedata = shufflesquad(gamedata, squad);
            gamedata = richtextadd(
              gamedata,
              `\n↝ ${gamedata.player[squad - 1]}'s ${
                emojis[50].emoji
              } Shuffled ${gamedata.player[squad - 1]}'s Squad!`
            );
          }
          if (pos == 0) {
            for (i = 1; i < gamedata.squads[squad - 1].length; i++) {
              if (gamedata.squads[squad - 1][i]?.id == 106) {
                // satellite
                gamedata = alterhp(gamedata, squad, i, squad, i, val);
              }
            }
          }
        }
      } else if (val < 0) {
        if (!silence) {
          if (gamedata.squads[squad2 - 1][pos2]) {
            gamedata = richtextadd(
              gamedata,
              `\n↣ ${gamedata.player[squad2 - 1]}'s ${
                gamedata.squads[squad2 - 1][pos2].emoji
              } ${verb ?? "attacked"} ${gamedata.player[squad - 1]}'s ${
                gamedata.squads[squad - 1][pos].emoji
              }. (${val * -1} damage)`
            );
          }
        }
        attack: {
          if (
            gamedata.squads[squad2 - 1][pos2]?.id == 6 &&
            gamedata.squads[squad2 - 1][pos2].hp > 2
          ) {
            // speaking head
            if (gamedata.squads[squad - 1][pos].dmg > 0) {
              gamedata.squads[squad - 1][pos].dmg -= 1;
              gamedata = richtextadd(
                gamedata,
                `\n✩ ${gamedata.player[squad2 - 1]}'s ${
                  gamedata.squads[squad2 - 1][pos2].emoji
                } weakened ${gamedata.player[squad - 1]}'s ${
                  gamedata.squads[squad - 1][pos].emoji
                }! (-1 attack)`
              );
            }
          }
          if (gamedata.squads[squad - 1][pos + 1]?.id == 1 && val < -1) {
            // kissing heart face
            gamedata = alterhp(
              gamedata,
              squad,
              pos,
              squad,
              pos + 1,
              1,
              "kissed"
            );
          }
          if (
            gamedata.squads[squad - 1][pos + 1]?.id == 78 &&
            musicaltrigger(gamedata, squad, pos + 1) &&
            val < -1
          ) {
            // saxophone
            gamedata = alterhp(
              gamedata,
              squad,
              pos,
              squad,
              pos + 1,
              1,
              "jazzed"
            );
          }
          if (target?.id == 3 && gamedata.squads[squad - 1].length > 1) {
            // cold sweat face
            const temp = gamedata.squads[squad - 1][pos];
            gamedata.squads[squad - 1].splice(pos, 1);
            gamedata.squads[squad - 1].splice(pos + 1, 0, temp);
            gamedata = richtextadd(
              gamedata,
              `\n⇋ ${gamedata.player[squad - 1]}'s ${
                emojis[3].emoji
              } retreated behind ${gamedata.squads[squad - 1][pos].emoji}!`
            );
          }
          if (target?.id == 110 && gamedata.squads[squad - 1].length > 1) {
            // curling stone
            const temp = gamedata.squads[squad - 1][pos];
            gamedata.squads[squad - 1].splice(pos, 1);
            gamedata.squads[squad - 1].splice(pos + 1, 0, temp);
            gamedata = alterhp(
              gamedata,
              squad2,
              0,
              squad,
              0,
              0 - gamedata.squads[squad - 1][pos].dmg,
              "",
              true
            );
            gamedata = richtextadd(
              gamedata,
              `\n⇋ ${gamedata.player[squad - 1]}'s ${
                emojis[110].emoji
              } retreated behind ${
                gamedata.squads[squad - 1][pos].emoji
              }, and ${gamedata.squads[squad - 1][pos].emoji} attacked!`
            );
          }
          if (target?.id == 5 && gamedata.squads[squad - 1].length > 1) {
            // turtle
            const temp = gamedata.squads[squad - 1][pos];
            gamedata.squads[squad - 1].splice(pos, 1);
            gamedata.squads[squad - 1].splice(
              gamedata.squads[squad - 1].length,
              0,
              temp
            );
            gamedata = richtextadd(
              gamedata,
              `\n⇋ ${gamedata.player[squad - 1]}'s ${
                emojis[5].emoji
              } retreated to the back of the Squad!`
            );
            gamedata = alterhp(
              gamedata,
              squad,
              gamedata.squads[squad - 1].length - 1,
              squad,
              gamedata.squads[squad - 1].length - 1,
              1
            );
          }
          if (target?.id == 111) {
            // wrapped gift
            const nonmasters = emojis.filter(
              (item) =>
                item.rarity != 3 && !(item.class === null && item.rarity === -1)
            );
            const rand = Math.floor(Math.random() * nonmasters.length);
            gamedata.squads[squad - 1].splice(
              pos,
              0,
              lodash.cloneDeep(nonmasters[rand])
            );
            gamedata = richtextadd(
              gamedata,
              `\n✚ ${gamedata.player[squad - 1]}'s ${
                emojis[111].emoji
              } summoned ${nonmasters[rand].emoji}!`
            );
          }
          if (target?.id == 123) {
            // sleeping face
            gamedata.squads[squad - 1].splice(
              pos,
              0,
              lodash.cloneDeep(emojis[124])
            );
            gamedata = richtextadd(
              gamedata,
              `\n✚ ${gamedata.player[squad - 1]}'s ${
                emojis[123].emoji
              } summoned ${emojis[124].emoji}!`
            );
          }
          if (target?.id == 67) {
            // lock with ink pen
            const tempemj = gamedata.squads[squad2 - 1][0]?.emoji;
            const temphp = gamedata.squads[squad2 - 1][0]?.hp;
            const tempdmg = gamedata.squads[squad2 - 1][0]?.dmg + 1;
            gamedata.squads[squad2 - 1].splice(
              0,
              1,
              lodash.cloneDeep(emojis[68])
            );
            gamedata.squads[squad2 - 1][0].hp = temphp;
            gamedata.squads[squad2 - 1][0].dmg = tempdmg;
            gamedata = richtextadd(
              gamedata,
              `\n⇪ ${gamedata.player[squad - 1]}'s ${
                emojis[67].emoji
              } transformed ${gamedata.player[squad2 - 1]}'s ${tempemj} into ${
                emojis[68].emoji
              }, and increased its attack power by 1!`
            );
          }
          if (target?.id == 114) {
            // dotted line face
            gamedata.squads[squad - 1].splice(pos, 1);
            gamedata = richtextadd(
              gamedata,
              `\n𝚾 ${gamedata.player[squad - 1]}'s ${
                emojis[114].emoji
              } defeated itself!`
            );
          }
        }
      }
    }
    if (!silence && val == 0 && gamedata.squads[squad2 - 1][pos2]) {
      gamedata = richtextadd(
        gamedata,
        `\n↣ ${gamedata.player[squad2 - 1]}'s ${
          gamedata.squads[squad2 - 1][pos2].emoji
        } ${verb ?? "tried to attack"} ${gamedata.player[squad - 1]}'s ${
          gamedata.squads[squad - 1][pos].emoji
        }... but it did nothing.`
      );
    }
    if (val <= 0) {
      attackedOrDefeated: {
        if (target?.id == 10) {
          // shuffle button/twisted rightwards arrows
          if (kill == undefined) {
            gamedata.squads[squad - 1].splice(pos, 1);
          }
          gamedata = shufflesquad(gamedata, squad2);
          gamedata = richtextadd(
            gamedata,
            `\n↝ ${gamedata.player[squad - 1]}'s ${emojis[10].emoji} Shuffled ${
              gamedata.player[squad2 - 1]
            }'s Squad, and defeated itself!`
          );
        }
        if (target?.id == 9) {
          // mortar board
          if (kill == undefined) {
            gamedata.squads[squad - 1].splice(pos, 1);
          }
          for (i = 0; i < 3; i++) {
            gamedata.squads[squad - 1].splice(
              pos,
              0,
              cloneWithEdit(emojis[0], { hp: 1 })
            );
          }
          gamedata = richtextadd(
            gamedata,
            `\n✚ ${gamedata.player[squad - 1]}'s ${
              emojis[9].emoji
            } sparked a standing ovation and summoned ${emojis[0].emoji}${
              emojis[0].emoji
            }${emojis[0].emoji}, and defeated itself!`
          );
        }
        if (target?.id == 36) {
          // bomb
          gamedata = alterhp(
            gamedata,
            0 - squad + 3,
            0,
            squad,
            -1,
            -1000,
            "exploded",
            true
          );
          if (kill == undefined) {
            gamedata.squads[squad - 1].splice(pos, 1);
          }
          gamedata = richtextadd(
            gamedata,
            `\n✩ ${gamedata.player[squad - 1]}'s ${emojis[36].emoji} exploded!`
          );
        }
        if (target?.id == 116) {
          // boom
          gamedata = richtextadd(
            gamedata,
            `\n✩ ${gamedata.player[squad - 1]}'s ${emojis[116].emoji} exploded!`
          );
          gamedata = alterhp(
            gamedata,
            0 - squad + 3,
            1,
            squad,
            -1,
            -1000,
            "exploded",
            true
          );
          gamedata = alterhp(
            gamedata,
            0 - squad + 3,
            0,
            squad,
            -1,
            -1000,
            "exploded",
            true
          );
          if (kill == undefined) {
            gamedata.squads[squad - 1].splice(pos, 1);
          }
          gamedata = alterhp(
            gamedata,
            squad,
            pos,
            squad,
            -1,
            -1000,
            "exploded",
            true
          );
        }
        if (target?.id == 41) {
          // tornado
          gamedata = richtextadd(
            gamedata,
            `\n↝ ${gamedata.player[squad - 1]}'s ${emojis[41].emoji} Shuffled ${
              gamedata.player[squad2 - 1]
            }'s Squad!`
          );
          gamedata = shufflesquad(gamedata, squad2);
        }
        if (target?.id == 107) {
          // track previous
          gamedata = richtextadd(
            gamedata,
            `\n↝ ${gamedata.player[squad - 1]}'s ${
              emojis[107].emoji
            } Shuffled ${gamedata.player[squad - 1]}'s Squad!`
          );
          gamedata = shufflesquad(gamedata, squad);
        }
      }
    }
    if (val < 0) {
      afterAttack: {
        if (gamedata.squads[squad2 - 1][pos2]?.id == 15) {
          // fishing pole
          const temp =
            gamedata.squads[squad - 1][gamedata.squads[squad - 1].length - 1];
          gamedata.squads[squad - 1].splice(
            gamedata.squads[squad - 1].length - 1,
            1
          );
          gamedata.squads[squad - 1].splice(0, 0, temp);
          gamedata = richtextadd(
            gamedata,
            `\n⇋ ${gamedata.player[squad2 - 1]}'s ${emojis[15].emoji} pulled ${
              gamedata.player[squad - 1]
            }'s ${
              gamedata.squads[squad - 1][0].emoji
            } to the front of their Squad!`
          );
        }
        if (
          gamedata.squads[squad2 - 1][pos2]?.id == 16 &&
          gamedata.squads[squad - 1][0]
        ) {
          // golf
          const temp = gamedata.squads[squad - 1][0];
          gamedata.squads[squad - 1].splice(0, 1);
          gamedata.squads[squad - 1].splice(
            gamedata.squads[squad - 1].length,
            0,
            temp
          );
          gamedata = richtextadd(
            gamedata,
            `\n⇋ ${gamedata.player[squad - 1]}'s ${emojis[16].emoji} whacked ${
              gamedata.player[squad - 1]
            }'s ${
              gamedata.squads[squad - 1][gamedata.squads[squad - 1].length - 1]
                .emoji
            } to the back of their Squad!`
          );
        }
        if (
          gamedata.squads[squad2 - 1][pos2]?.id == 49 &&
          !(squad2 == squad && pos2 + 1 == pos)
        ) {
          // flying disc
          if (gamedata.squads[squad2 - 1].length > 1) {
            gamedata = alterhp(
              gamedata,
              squad2,
              pos2 + 1,
              squad2,
              pos2,
              -1,
              "whacked"
            );
          }
        }
        if (gamedata.squads[0].length == 1) {
          if (gamedata.squads[0][0]?.id == 23) {
            // lizard / dragon
            gamedata.squads[0].splice(0, 1, lodash.cloneDeep(emojis[24]));
            gamedata = richtextadd(
              gamedata,
              `\n⇪ ${gamedata.player[0]}'s ${emojis[23].emoji} evolved into ${emojis[24].emoji}!`
            );
          } else if (gamedata.squads[0][0]?.id == 91) {
            // rotating light
            gamedata.squads[0].splice(1, 0, lodash.cloneDeep(emojis[92]));
            gamedata = richtextadd(
              gamedata,
              `\n✚ ${gamedata.player[0]}'s ${emojis[91].emoji} called in ${emojis[92].emoji}`
            );
          }
        }
        if (gamedata.squads[1].length == 1) {
          if (gamedata.squads[1][0]?.id == 23) {
            // lizard / dragon
            gamedata.squads[1].splice(0, 1, lodash.cloneDeep(emojis[24]));
            gamedata = richtextadd(
              gamedata,
              `\n⇪ ${gamedata.player[1]}'s ${emojis[23].emoji} evolved into ${emojis[24].emoji}!`
            );
          } else if (gamedata.squads[1][0]?.id == 91) {
            gamedata.squads[1].splice(1, 0, lodash.cloneDeep(emojis[92]));
            gamedata = richtextadd(
              gamedata,
              `\n✚ ${gamedata.player[1]}'s ${emojis[91].emoji} called in ${emojis[92].emoji}`
            );
          }
        }
      }
    }
  }

  return gamedata;
}

function playturn(gamedata) {
  setup: {
    if (gamedata.turn == 0) {
      for (i = 0; i < gamedata.squads[0].length; i++) {
        if (gamedata.squads[0][i]?.id == 26) {
          // cherries
          gamedata.squads[0].splice(i, 0, lodash.cloneDeep(emojis[26]));
          i++;
        } else if (gamedata.squads[0][i]?.id == 70) {
          // wireless
          gamedata.squads[0][i].hp += gamedata.squads[0].filter(
            (element) => element.id == 70
          ).length;
        } else if (gamedata.squads[0][i]?.id == 95) {
          // family
          gamedata.squads[0][i].hp += gamedata.squads[0].filter(
            (element) => element.class == 8
          ).length;
          gamedata.squads[0][i].dmg += gamedata.squads[0].filter(
            (element) => element.class == 8
          ).length;
        }
        if (
          gamedata.squads[0][i]?.id == 76 &&
          gamedata.squads[0][i - 1] != undefined
        ) {
          // fog
          gamedata.squads[0][i - 1].hp += 3;
          gamedata.squads[0].splice(i, 1);
          i -= 1;
        }
        if (
          gamedata.squads[0][i]?.id == 85 &&
          gamedata.squads[0][i - 1] != undefined
        ) {
          // syringe
          gamedata.squads[0][i - 1].dmg += 1;
          gamedata.squads[0].splice(i, 1);
          i -= 1;
        }
      }
      for (i = 0; i < gamedata.squads[1].length; i++) {
        if (gamedata.squads[1][i]?.id == 26) {
          // cherries
          gamedata.squads[1].splice(i, 0, lodash.cloneDeep(emojis[26]));
          i++;
        } else if (gamedata.squads[1][i]?.id == 70) {
          // wireless
          gamedata.squads[1][i].hp += gamedata.squads[1].filter(
            (element) => element.id == 70
          ).length;
        } else if (gamedata.squads[1][i]?.id == 95) {
          // family
          gamedata.squads[1][i].hp += gamedata.squads[1].filter(
            (element) => element.class == 8
          ).length;
          gamedata.squads[1][i].dmg += gamedata.squads[1].filter(
            (element) => element.class == 8
          ).length;
        }
        if (
          gamedata.squads[1][i]?.id == 76 &&
          gamedata.squads[1][i - 1] != undefined
        ) {
          // fog
          gamedata.squads[1][i - 1].hp += 3;
          gamedata.squads[1].splice(i, 1);
          i -= 1;
        }
        if (
          gamedata.squads[1][i]?.id == 85 &&
          gamedata.squads[1][i - 1] != undefined
        ) {
          // syringe
          gamedata.squads[1][i - 1].dmg += 1;
          gamedata.squads[1].splice(i, 1);
          i -= 1;
        }
      }
    }
    gamedata.turn++;
    gamedata.playerturn = ((gamedata.playerturn + 1) % 2) * -1 + 2;
    gamedata.newlines = 0;
  }

  attack: {
    let basicattackflag = true;
    const activeemoji = gamedata.squads[gamedata.playerturn - 1][0];
    if (activeemoji.id == 0) {
      // clap
      basicattackflag = false;
      gamedata = alterhp(
        gamedata,
        gamedata.playerturn * -1 + 3,
        0,
        gamedata.playerturn,
        0,
        0 -
          (activeemoji.dmg +
            gamedata.squads[gamedata.playerturn - 1].filter(
              (element) => element.id == 0
            ).length),
        "clapped at"
      );
    }
    if (activeemoji.id == 101) {
      // top
      basicattackflag = false;
      gamedata = alterhp(
        gamedata,
        gamedata.playerturn * -1 + 3,
        gamedata.squads[gamedata.playerturn * -1 + 2].reduce(
          (maxi, current, currenti, array) => {
            return (current?.hp ?? -Infinity) > (array[maxi]?.hp ?? -Infinity)
              ? currenti
              : maxi;
          },
          0
        ),
        gamedata.playerturn,
        0,
        0 - activeemoji.dmg
      );
    }
    if (activeemoji.id == 100) {
      // mag
      basicattackflag = false;
      gamedata = alterhp(
        gamedata,
        gamedata.playerturn * -1 + 3,
        gamedata.squads[gamedata.playerturn * -1 + 2].reduce(
          (mini, current, currenti, array) => {
            return (current?.hp ?? -Infinity) < (array[mini]?.hp ?? -Infinity)
              ? currenti
              : mini;
          },
          0
        ),
        gamedata.playerturn,
        0,
        0 - activeemoji.dmg
      );
    }
    if (activeemoji.id == 93) {
      // bee
      basicattackflag = false;
      gamedata = richtextadd(
        gamedata,
        `\n✩ ${gamedata.player[gamedata.playerturn - 1]}'s ${
          gamedata.squads[gamedata.playerturn - 1].filter(
            (element) => element.id == 93
          ).length < 2
            ? "(lonely) "
            : ""
        }swarm of ${
          gamedata.squads[gamedata.playerturn - 1].filter(
            (element) => element.id == 93
          ).length
        } ${emojis[93].emoji} attacked!`
      );
      for (i = 0; i < gamedata.squads[gamedata.playerturn - 1].length; i++) {
        if (gamedata.squads[gamedata.playerturn - 1][i]?.id == 93) {
          gamedata = alterhp(
            gamedata,
            gamedata.playerturn * -1 + 3,
            0,
            gamedata.playerturn,
            0,
            0 - gamedata.squads[gamedata.playerturn - 1][i].dmg,
            "stung",
            true
          );
        }
      }
    }
    if (activeemoji.id == 94 && activeemoji.dmg > 1) {
      // needle
      basicattackflag = false;
      let damage = activeemoji.dmg;
      if (gamedata.squads[gamedata.playerturn - 1][1]?.id == 75) {
        damage += 2;
      } else if (gamedata.squads[gamedata.playerturn - 1][1]?.id == 12) {
        damage += 1;
      }
      gamedata = richtextadd(
        gamedata,
        `\n✩ ${gamedata.player[gamedata.playerturn - 1]}'s ${
          emojis[94].emoji
        } attacked the front ${damage} enemy Emojis!`
      );
      for (
        let i =
          Math.min(
            gamedata.squads[gamedata.playerturn * -1 + 2].length,
            damage
          ) - 1;
        i > -1;
        i--
      ) {
        gamedata = alterhp(
          gamedata,
          gamedata.playerturn * -1 + 3,
          i,
          gamedata.playerturn,
          0,
          -1,
          "poked",
          true
        );
      }
    }
    if (activeemoji.id == 74) {
      // battery
      basicattackflag = false;
      gamedata = alterhp(
        gamedata,
        gamedata.playerturn * -1 + 3,
        0,
        gamedata.playerturn,
        0,
        0 - (activeemoji.dmg + activeemoji.hp),
        "zapped"
      );
    }
    if (
      activeemoji.id == 63 &&
      !gamedata.squads[gamedata.playerturn * -1 + 2].some((x) => x.id == 98)
    ) {
      // loud sound
      basicattackflag = false;
      gamedata = alterhp(
        gamedata,
        gamedata.playerturn * -1 + 3,
        0,
        gamedata.playerturn,
        0,
        0 -
          (activeemoji.dmg +
            gamedata.squads[gamedata.playerturn - 1].filter(
              (element) => element.id == 14
            ).length *
              2 +
            (gamedata.squads[gamedata.playerturn - 1][1]?.id == 77 ? 1 : 0)),
        "blasted"
      );
    }
    if (activeemoji.id == 60) {
      // mirror
      basicattackflag = false;
      gamedata = alterhp(
        gamedata,
        gamedata.playerturn * -1 + 3,
        0,
        gamedata.playerturn,
        0,
        0 -
          (activeemoji.dmg +
            gamedata.squads[gamedata.playerturn * -1 + 2][0].dmg),
        "reflected at"
      );
    }
    if (
      activeemoji?.id == 84 &&
      (gamedata.squads[gamedata.playerturn * -1 + 2] ?? []).length > 1
    ) {
      // bow and arrow
      gamedata = alterhp(
        gamedata,
        gamedata.playerturn * -1 + 3,
        1,
        gamedata.playerturn,
        0,
        0 - activeemoji.dmg,
        "shot"
      );
      basicattackflag = false;
    }
    if (activeemoji?.id == 88) {
      // back
      gamedata = alterhp(
        gamedata,
        gamedata.playerturn * -1 + 3,
        (gamedata.squads[gamedata.playerturn * -1 + 2] ?? []).length - 1,
        gamedata.playerturn,
        0,
        0 - activeemoji.dmg
      );
      basicattackflag = false;
    }
    if (
      activeemoji?.id == 34 &&
      gamedata.squads[gamedata.playerturn * -1 + 2][1]
    ) {
      // zap
      gamedata = alterhp(
        gamedata,
        gamedata.playerturn * -1 + 3,
        1,
        gamedata.playerturn,
        0,
        0 - activeemoji.dmg,
        "zapped"
      );
    }
    if (
      activeemoji?.id == 96 &&
      gamedata.squads[gamedata.playerturn * -1 + 2][1] &&
      musicaltrigger(gamedata, gamedata.playerturn, 0)
    ) {
      // accordion
      gamedata = alterhp(
        gamedata,
        gamedata.playerturn * -1 + 3,
        1,
        gamedata.playerturn,
        0,
        0 - activeemoji.dmg
      );
    }
    if (activeemoji.id == 102) {
      // socks
      gamedata = alterhp(
        gamedata,
        gamedata.playerturn * -1 + 3,
        0,
        gamedata.playerturn,
        0,
        0 - activeemoji.dmg
      );
    }
    if (
      activeemoji.id == 112 &&
      musicaltrigger(gamedata, gamedata.playerturn, 0)
    ) {
      // maracas
      gamedata = alterhp(
        gamedata,
        gamedata.playerturn * -1 + 3,
        0,
        gamedata.playerturn,
        0,
        0 - activeemoji.dmg
      );
    }
    if (basicattackflag) {
      gamedata = alterhp(
        gamedata,
        gamedata.playerturn * -1 + 3,
        0,
        gamedata.playerturn,
        0,
        0 - activeemoji.dmg
      );
    }
    if (gamedata.squads[gamedata.playerturn - 1][1]?.id == 8) {
      // handshake
      gamedata = alterhp(
        gamedata,
        gamedata.playerturn * -1 + 3,
        0,
        gamedata.playerturn,
        1,
        0 - gamedata.squads[gamedata.playerturn - 1][1].dmg
      );
    }

    if (
      activeemoji?.id == 37 &&
      gamedata.turn % 4 <= 2 &&
      gamedata.squads[gamedata.playerturn * -1 + 2][0]
    ) {
      // ghost
      const tempemj = gamedata.squads[gamedata.playerturn * -1 + 2][0].emoji;
      const temphp = gamedata.squads[gamedata.playerturn * -1 + 2][0].hp;
      const tempdmg = gamedata.squads[gamedata.playerturn * -1 + 2][0].dmg;
      gamedata.squads[gamedata.playerturn * -1 + 2].splice(
        0,
        1,
        lodash.cloneDeep(emojis[7])
      );
      gamedata.squads[gamedata.playerturn * -1 + 2][0].hp = temphp;
      gamedata.squads[gamedata.playerturn * -1 + 2][0].dmg = tempdmg;
      gamedata = richtextadd(
        gamedata,
        `\n⇪ ${gamedata.player[gamedata.playerturn - 1]}'s ${
          emojis[37].emoji
        } transformed ${
          gamedata.player[gamedata.playerturn * -1 + 2]
        }'s ${tempemj} into ${emojis[7].emoji}!`
      );
    }
  }

  gamedata.logfile += "\n\n";

  scene: {
    // destroying and recreating the battle scene
    gamedata.emojitext = "";
    for (let i = gamedata.squads[0].length - 1; i >= 0; i--) {
      gamedata.emojitext += renderhemoji(gamedata.squads[0][i].hp) + " ";
      gamedata.logfile += gamedata.squads[0][i].hp + "▪️";
    }
    gamedata.emojitext += " ";
    gamedata.logfile.slice(0, -2);
    gamedata.logfile += "    ";
    for (let i = 0; i < gamedata.squads[1].length; i++) {
      gamedata.emojitext += " " + renderhemoji(gamedata.squads[1][i].hp);
      gamedata.logfile += gamedata.squads[1][i].hp + "▪️";
    }

    gamedata.emojitext += "\n";
    gamedata.logfile.slice(0, -2);
    gamedata.logfile += "  ♡️\n";

    for (let i = gamedata.squads[0].length - 1; i >= 0; i--) {
      gamedata.emojitext += renderdemoji(gamedata.squads[0][i].dmg) + " ";
      gamedata.logfile += gamedata.squads[0][i].dmg + "▪️";
    }
    gamedata.emojitext += " ";
    gamedata.logfile.slice(0, -2);
    gamedata.logfile += "    ";
    for (let i = 0; i < gamedata.squads[1].length; i++) {
      gamedata.emojitext += " " + renderdemoji(gamedata.squads[1][i].dmg);
      gamedata.logfile += gamedata.squads[1][i].dmg + "▪️";
    }

    gamedata.emojitext += "\n";
    gamedata.logfile.slice(0, -2);
    gamedata.logfile += "  ⇮️\n";

    for (let i = gamedata.squads[0].length - 1; i >= 0; i--) {
      gamedata.emojitext += gamedata.squads[0][i].emoji + " ";
      gamedata.logfile += gamedata.squads[0][i].emoji + " ";
    }
    gamedata.emojitext += "|";
    gamedata.logfile += " |  ";
    for (let i = 0; i < gamedata.squads[1].length; i++) {
      gamedata.emojitext += " " + gamedata.squads[1][i].emoji;
      gamedata.logfile += gamedata.squads[1][i].emoji + " ";
    }
  }

  const turnnum = gamedata.turn + 1;
  gamedata.logfile +=
    "\n\n--------------------------------------------------------------\nTurn " +
    turnnum +
    "\n";

  return gamedata;
}

function shufflesquad(gamedata, squad) {
  const squadIndex = squad - 1;
  const squadArray = gamedata.squads[squadIndex];

  // construction
  let partitions = [];
  let currentPartition = [];
  for (let i = 0; i < squadArray.length; i++) {
    if (squadArray[i]?.id === 73) {
      if (currentPartition.length > 0) {
        partitions.push(currentPartition);
        currentPartition = [];
      }
      partitions.push([i]);
    } else {
      currentPartition.push(i);
    }
  }
  if (currentPartition.length > 0) {
    partitions.push(currentPartition);
  }

  if (!gamedata.squads[squad - 1].find((i) => i.id == 32)) {
    // ice cube
    for (let i = gamedata.squads[squad - 1].length - 1; i > -1; i--) {
      if (
        gamedata.squads[squad - 1][i]?.id == 33 &&
        gamedata.squads[squad - 1][0]?.id != 50
      ) {
        // dash
        gamedata = alterhp(gamedata, squad, 0, squad, i, 2);
      }
      if (
        gamedata.squads[squad - 1][i]?.id == 58 &&
        i != gamedata.squads[squad - 1].length - 1
      ) {
        // microbe
        if (gamedata.squads[squad - 1][i + 1]?.id != 58) {
          const tempemj = gamedata.squads[squad - 1][i + 1]?.id;
          const temphp = gamedata.squads[squad - 1][i + 1].hp;
          const tempdmg = gamedata.squads[squad - 1][i + 1].dmg;
          gamedata.squads[squad - 1].splice(
            i + 1,
            1,
            lodash.cloneDeep(emojis[58])
          );
          gamedata.squads[squad - 1][i + 1].hp = temphp;
          gamedata.squads[squad - 1][i + 1].dmg = tempdmg;
          gamedata = richtextadd(
            gamedata,
            `\n✩ ${gamedata.player[squad - 1]}'s ${
              emojis[58].emoji
            } infected a ${emojis[tempemj].emoji}!`
          );
        }
      }
    }

    if (!gamedata.squads[squad - 1].find((i) => i.id == 104)) {
      if (gamedata.squads[squad - 1].some((x) => x.id == 105)) {
        gamedata = richtextadd(gamedata, `\n🪨 rock dont move`);
      }

      // pushpin, anchor, construction, rock
      const lockedIndices = squadArray
        .map((item, index) =>
          [71, 72, 73, 105].includes(item.id) ||
          squadArray[index + 1]?.id === 71 ||
          squadArray[index - 1]?.id === 72
            ? index
            : -1
        )
        .filter((index) => index !== -1);

      // shuffle part
      for (const partition of partitions) {
        if (partition.length === 1 && squadArray[partition[0]]?.id === 73)
          continue;

        const unlocked = partition.filter(
          (index) => !lockedIndices.includes(index)
        );

        for (let i = unlocked.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          const idx1 = unlocked[i];
          const idx2 = unlocked[j];
          [squadArray[idx1], squadArray[idx2]] = [
            squadArray[idx2],
            squadArray[idx1],
          ];
        }
      }
    } else {
      // snowman
      gamedata.squads[squad - 1].splice(
        gamedata.squads[squad - 1].findIndex((i) => i.id == 104),
        1
      );
      gamedata = richtextadd(
        gamedata,
        `\n⇎ ${gamedata.player[squad - 1]}'s ${
          emojis[104].emoji
        } melted, but the Squad stayed in place!`
      );
    }

    for (let i = gamedata.squads[squad - 1].length - 1; i > -1; i--) {
      if (
        gamedata.squads[squad - 1][i]?.id == 28 &&
        i < gamedata.squads[squad - 1].length - 1
      ) {
        // pickup truck
        const temp = gamedata.squads[squad - 1][i];
        gamedata.squads[squad - 1].splice(i, 1);
        gamedata.squads[squad - 1].splice(
          gamedata.squads[squad - 1].length,
          0,
          temp
        );
      }
    }

    for (const partition of partitions) {
      for (let i = partition.length - 1; i > -1; i--) {
        const idx = partition[i];
        const emoji = squadArray[idx];

        if (emoji?.id == 30) {
          // bus
          gamedata = alterhp(gamedata, squad, idx, squad, idx, 2);
          for (let j = partition.length - 1; j > -1; j--) {
            const stopIdx = partition[j];
            if (squadArray[stopIdx]?.id == 29) {
              const temp = squadArray[idx];
              squadArray.splice(idx, 1);
              squadArray.splice(stopIdx + 1, 0, temp);
              gamedata = richtextadd(
                gamedata,
                `\n⇋ ${gamedata.player[squad - 1]}'s ${
                  emojis[30].emoji
                } visited the ${emojis[29].emoji}!`
              );
              break;
            }
          }
        }

        if (emoji?.id == 29 && partition.includes(idx + 1)) {
          // bus stop
          gamedata = alterhp(gamedata, squad, idx + 1, squad, idx, 2);
        }
      }
    }

    for (let i = gamedata.squads[squad - 1].length - 1; i > -1; i--) {
      if (gamedata.squads[squad - 1][i]?.id == 31) {
        // popcorn
        gamedata = alterhp(gamedata, squad, 0, squad, i, 2);
      }
      if (gamedata.squads[squad - 1][i]?.id == 19) {
        // woozy face
        gamedata = alterhp(gamedata, squad, i, squad, i, 1);
      }
      if (gamedata.squads[squad - 1][i]?.id == 99) {
        // shaking face
        gamedata.squads[squad - 1][i].dmg += 1;
        gamedata = richtextadd(
          gamedata,
          `\n⇮ ${gamedata.player[squad - 1]}'s ${
            emojis[99].emoji
          } strengthened itself by 1!`
        );
      }
      if (gamedata.squads[squad - 1][i]?.id == 47) {
        // volcano
        gamedata.squads[0 - squad + 2].splice(
          0,
          0,
          cloneWithEdit(emojis[46], { hp: 1, dmg: 1 })
        );
        gamedata = richtextadd(
          gamedata,
          `\n✚ ${gamedata.player[squad - 1]}'s ${emojis[47].emoji} lit a ${
            emojis[46].emoji
          } in ${gamedata.player[0 - squad + 2]}'s Squad!`
        );
      }
    }
  }

  return gamedata;
}

customemojis: {
  function renderhemoji(value) {
    const index = Math.max(
      0,
      Math.min(Math.floor(Number(value)) + 1, healthemojis.length - 1)
    );
    return healthemojis[index];
  }

  function renderdemoji(value) {
    const index =
      Math.max(
        -4,
        Math.min(Math.floor(Number(value)) + 1, dmgemojis.length - 1)
      ) + 3;
    return dmgemojis[index];
  }
}

async function adminpanel(interaction, viewemoji) {
  devdata = viewemoji.split(" ");
  devdata.shift();
  if (devdata[0] == "read") {
    const data = await database.get(devdata[1]);
    await interaction.reply({
      flags: "Ephemeral",
      content: `Found "${data}" at "${devdata[1]}".`,
    });
  } else if (devdata[0] == "write") {
    await database.set(devdata[1], devdata[2]);
    await interaction.reply({
      flags: "Ephemeral",
      content: `Wrote "${devdata[2]}" to "${devdata[1]}".`,
    });
  } else if (devdata[0] == "clear") {
    await database.delete(devdata[1]);
    await interaction.reply({
      flags: "Ephemeral",
      content: `Cleared all data from "${devdata[1]}".`,
    });
  } else if (devdata[0] == "give") {
    let allemojistoadd = "";
    for (let i = 0; i < parseInt(devdata[3] ?? "1"); i++) {
      allemojistoadd +=
        emojis.find(
          (x) =>
            x.names.find(
              (y) =>
                y.replace(/\s+/g, "_").toLowerCase() ==
                devdata[2].trim().replace(/\s+/g, "_").toLowerCase()
            ) || x.emoji == devdata[2].replace(/\s+/g, "")
        ).id + ",";
    }
    const data = await database.get(devdata[1] + "vault");
    await database.set(devdata[1] + "vault", data + allemojistoadd);
    await interaction.reply({
      ephemeral: false,
      content: `Gave <@${devdata[1]}> ${parseInt(devdata[3] ?? "1")}x ${
        emojis.find(
          (x) =>
            x.names.find(
              (y) =>
                y.replace(/\s+/g, "_").toLowerCase() ==
                devdata[2].trim().replace(/\s+/g, "_").toLowerCase()
            ) || x.emoji == devdata[2].replace(/\s+/g, "")
        ).emoji
      }.`,
    });
  } else if (devdata[0] == "logs") {
    const json = Buffer.from(fs.readFileSync("logs.json", "utf8"));
    const now = new Date();
    const dateString = now.toDateString();
    const timeString = now.toLocaleTimeString();
    await interaction.reply({
      flags: "Ephemeral",
      files: [
        {
          attachment: json,
          name: `logs (${dateString}, ${timeString}).json`,
        },
      ],
    });
  } else if (devdata[0] == "users") {
    let logs = await JSON.parse(fs.readFileSync("logs.json", "utf8"));
    const now = Math.floor(Date.now() / 1000);
    const activeuserslastday = Object.values(logs.logs.players).filter(
      (player) => player.lastboop > now - 86400
    ).length;
    const activeuserslastdaypercent =
      Math.floor(
        (100 / (Object.values(logs.logs.players).length / activeuserslastday)) *
          100
      ) / 100;
    const activeuserslastweek = Object.values(logs.logs.players).filter(
      (player) => player.lastboop > now - 86400 * 7
    ).length;
    const activeuserslastweekpercent =
      Math.floor(
        (100 /
          (Object.values(logs.logs.players).length / activeuserslastweek)) *
          100
      ) / 100;
    const newuserslastday = Object.values(logs.logs.players).filter(
      (player) => player.joindate > now - 86400
    ).length;
    const newuserslastdaypercent =
      Math.floor(
        (100 / (Object.values(logs.logs.players).length / newuserslastday)) *
          100
      ) / 100;
    const newuserslastweek = Object.values(logs.logs.players).filter(
      (player) => player.joindate > now - 86400 * 7
    ).length;
    const newuserslastweekpercent =
      Math.floor(
        (100 / (Object.values(logs.logs.players).length / newuserslastweek)) *
          100
      ) / 100;
    await interaction.reply({
      flags: "Ephemeral",
      content: `👥 Number of users with data: **${
        Object.values(logs.logs.players).length
      }**\n❤️‍🔥 Number of active users in the past day: **${activeuserslastday}** (${activeuserslastdaypercent}%)\n❤️‍🔥 Number of active users in the past week: **${activeuserslastweek}** (${activeuserslastweekpercent}%)\n🐣 Number of new users in the past day: **${newuserslastday}** (${newuserslastdaypercent}%)\n🐣 Number of new users in the past week: **${newuserslastweek}** (${newuserslastweekpercent}%)\n👀 Last interaction: <t:${
        logs.logs.games.lastboop
      }:R>`,
    });
  } else if (devdata[0] == "emojis") {
    let logs = await JSON.parse(fs.readFileSync("logs.json", "utf8"));
    const emojisArray = logs.logs.emojis;
    let bestbotindex = -1;
    let worstbotindex = -1;
    let bestbotratio = -99999;
    let worstbotratio = 99999;
    let bestbotlosses = 0;
    let bestbotwins = 0;
    let worstbotlosses = 0;
    let worstbotwins = 0;
    let bestuserindex = -1;
    let worstuserindex = -1;
    let bestuserratio = -99999;
    let worstuserratio = 99999;
    let bestuserlosses = 0;
    let bestuserwins = 0;
    let worstuserlosses = 0;
    let worstuserwins = 0;
    let bestfriendlyindex = -1;
    let worstfriendlyindex = -1;
    let bestfriendlyratio = -99999;
    let worstfriendlyratio = 99999;
    let bestfriendlylosses = 0;
    let bestfriendlywins = 0;
    let worstfriendlylosses = 0;
    let worstfriendlywins = 0;
    let bestindex = -1;
    let worstindex = -1;
    let bestratio = -99999;
    let worstratio = 99999;
    let bestlosses = 0;
    let bestwins = 0;
    let worstlosses = 0;
    let worstwins = 0;
    let mostviewedindex = -1;
    let mostviewedtimes = 0;

    for (let i = 0; i < emojisArray.length; i++) {
      const emoji = emojisArray[i];
      const {
        botlosses = 0,
        botwins = 0,
        userlosses = 0,
        userwins = 0,
        friendlylosses = 0,
        friendlywins = 0,
        emojisviewed = 0,
      } = emoji;
      const botratio = botwins / botlosses;
      const userratio = userwins / userlosses;
      const friendlyratio = friendlywins / friendlylosses;
      const ratio =
        (userwins + botwins + friendlywins) /
        (userlosses + botlosses + friendlylosses);

      if (botratio > bestbotratio) {
        bestbotratio = botratio;
        bestbotindex = i;
        bestbotlosses = botlosses;
        bestbotwins = botwins;
      } else if (botratio < worstbotratio) {
        worstbotratio = botratio;
        worstbotindex = i;
        worstbotlosses = botlosses;
        worstbotwins = botwins;
      }
      if (userratio > bestuserratio) {
        bestuserratio = userratio;
        bestuserindex = i;
        bestuserlosses = userlosses;
        bestuserwins = userwins;
      } else if (userratio < worstuserratio) {
        worstuserratio = userratio;
        worstuserindex = i;
        worstuserlosses = userlosses;
        worstuserwins = userwins;
      }
      if (friendlyratio > bestfriendlyratio) {
        bestfriendlyratio = friendlyratio;
        bestfriendlyindex = i;
        bestfriendlylosses = friendlylosses;
        bestfriendlywins = friendlywins;
      } else if (friendlyratio < worstfriendlyratio) {
        worstfriendlyratio = friendlyratio;
        worstfriendlyindex = i;
        worstfriendlylosses = friendlylosses;
        worstfriendlywins = friendlywins;
      }
      if (ratio > bestratio) {
        bestratio = ratio;
        bestindex = i;
        bestlosses = userlosses + botlosses + friendlylosses;
        bestwins = userwins + botwins + friendlywins;
      } else if (friendlyratio < worstratio) {
        worstratio = ratio;
        worstindex = i;
        worstlosses = userlosses + botlosses + friendlylosses;
        worstwins = userwins + botwins + friendlywins;
      }
      if (emojisviewed > mostviewedtimes) {
        mostviewedtimes = emojisviewed;
        mostviewedindex = i;
      }
    }
    await interaction.reply({
      flags: "Ephemeral",
      content: `🏆 Strongest emoji in all battles: ${emojis[bestindex].emoji} (${bestwins}/${bestlosses})\n❌ Weakest emoji in all battles: ${emojis[worstindex].emoji} (${worstwins}/${worstlosses})\n\n🤖🏆 Strongest emoji in bot battles: ${emojis[bestbotindex].emoji} (${bestbotwins}/${bestbotlosses})\n🤖❌ Weakest emoji in bot battles: ${emojis[worstbotindex].emoji} (${worstbotwins}/${worstbotlosses})\n\n👤🏆 Strongest emoji in user battles: ${emojis[bestuserindex].emoji} (${bestuserwins}/${bestuserlosses})\n👤❌ Weakest emoji in user battles: ${emojis[worstuserindex].emoji} (${worstuserwins}/${worstuserlosses})\n\n💕🏆 Strongest emoji in friendly battles: ${emojis[bestfriendlyindex].emoji} (${bestfriendlywins}/${bestfriendlylosses})\n💕❌ Weakest emoji in friendly battles: ${emojis[worstfriendlyindex].emoji} (${worstfriendlywins}/${worstfriendlylosses})\n\n👀 Most viewed emoji: ${emojis[mostviewedindex].emoji} (${mostviewedtimes})`,
    });
  } else if (devdata[0] == "names") {
    let logs = await JSON.parse(fs.readFileSync("logs.json", "utf8"));
    let names = "Last 40 players to join Emoji Dojo:";
    for (
      let i = Object.values(logs.logs.players).length - 1;
      i > Object.values(logs.logs.players).length - 41;
      i--
    ) {
      names += "\n<@" + Object.keys(logs.logs.players)[i].slice(4) + ">";
    }
    await interaction.reply({
      flags: "Ephemeral",
      content: names,
    });
  }
}

module.exports = {
  writelogs,
  getlogs,
  devoteemojis,
  database,
  getvault,
  getsquad,
  coinschange,
  allemojisofrarity,
  playturn,
  trysetupuser,
  fetchresearch,
  syncresearch,
  dailyrewardremind,
  userboop,
  makesquad,
  issquadinvalid,
  adminpanel,
};
