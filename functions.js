const Keyv = require("keyv");
const lodash = require("lodash");
const { emojis, healthemojis, dmgemojis, quantityemojis } = require("./data.js");
const fs = require("fs");
const formatToJson = require("format-to-json");
const { MessageFlags, AttachmentBuilder } = require("discord.js");

const database = new Keyv("sqlite://databases//database.sqlite", {
  namespace: "userdata"
});

async function getLogs() {
  let logs = await JSON.parse(fs.readFileSync("logs.json", "utf8"));
  for (let i = logs.logs.emojis.length; i < emojis.length; i++) {
    logs.logs.emojis.push({});
  }
  return logs;
}

async function writeLogs(json) {
  const formattedjson = formatToJson(JSON.stringify(json), {
    withDetails: true
  });
  fs.writeFileSync("logs.json", formattedjson.result, "utf8");
}

async function boopUser(id) {
  let logs = await getLogs();
  logs.logs.players[`user${id}`] = logs.logs.players[`user${id}`] ?? {};
  logs.logs.players[`user${id}`].lastboop = Math.floor(Date.now() / 1000);
  logs.logs.games.lastboop = Math.floor(Date.now() / 1000);
  await writeLogs(logs);
}

async function setupUser(user) {
  const rawvault = await database.get(user.id + "vault");
  const rawsquad = await database.get(user.id + "squad");
  await boopUser(user.id);
  if (rawvault == undefined || rawsquad == undefined) {
    let logs = await getLogs();
    logs.logs.players[`user${user.id}`].joindate = Math.floor(Date.now() / 1000);
    await writeLogs(logs);
    let emojilist = emojis.filter((e) => e.rarity == 0);
    let allemojistoadd = "";
    let allemojitext = "";
    for (let i = 0; i < 7; i++) {
      const emojitoadd = emojilist[Math.floor(Math.random() * emojilist.length)];
      allemojistoadd += emojitoadd.id + ",";
      allemojitext += " " + emojitoadd.emoji;
    }
    emojilist = emojis.filter((e) => e.rarity == 1);
    for (let i = 0; i < 7; i++) {
      const emojitoadd = emojilist[Math.floor(Math.random() * emojilist.length)];
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

*(Use </dojo:1412837210205458512> to see your collection of Emojis, and see details about each one.)*

\`\`\`When you're ready, organize them into a Squad optimized to battle others and create the best synergy.\`\`\`

*(Use </squad:1412837210348060755> to view your Squad. You can edit your squad from the </dojo:1412837210205458512>.)*

\`\`\`Finally, you can Battle! Engage your friends in a Battle, or lower the stakes with a Friendly Battle. If there's no one who wants to fight you, you can always battle Dojobot in a Bot Battle!\`\`\`

*(Use </battleuser:1412837210205458507> and </battlebot:1412837210205458504> to engage in Battles to earn Coins. You can also use </battlefriendly:1412837210205458506> to battle friends without worrying about losing Coins.)*

\`\`\`Once you have enough Coins, you can visit my Emoji Shop! I sell these little guys to aspiring battlers like you. Stop by when you're looking for an emoji!\`\`\`

*(You can use </coins:1412837210205458510> to see how many Coins you have, and </shop:1412837210348060754> to visit my shop.)*`;
    await user.send({ content: welcomemessage });
    return true;
  } else {
    return false;
  }
}

async function dailyRewardRemind(interaction) {
  const dailytime = parseInt((await database.get(interaction.user.id + "dailytime")) ?? "0");
  if (Math.floor(Date.now() / 1000) - dailytime > 86400) {
    interaction.followUp({
      content: "📦 Your **daily reward** is ready to claim! Claim it now with </daily:1412837210205458511>!",
      flags: MessageFlags.Ephemeral
    });
  }
}

async function getSquad(id) {
  let rawsquad = await database.get(id + "squad");
  if (rawsquad == undefined) {
    await database.set(id + "squad", await database.get(id + "vault"));
  }
  rawsquad = await database.get(id + "squad");
  let squad = rawsquad.split(",");
  return squad.slice(0, 8);
}

async function checkSquadValidity(id) {
  let inputarr = await getSquad(id);
  inputarr = inputarr.map((str) => parseInt(str));
  let vaultarray = await getDojo(id);
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

async function generateBotSquad(player1squadarray, tries, evil) {
  let player2squadarray;
  let wins = [];
  let squads = [];
  if (evil) {
    player2squadarray = player1squadarray;
  } else {
    player2squadarray = [];
    for (let i = 0; i < 8; i++) {
      const possibleemojis = emojis.filter((emoji) => emoji.rarity == emojis[player1squadarray[i]].rarity);
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
      const possibleemojis = emojis.filter((emoji) => emoji.rarity == emojis[player1squadarray[i]].rarity);
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
      player: ["DojoBot1", "DojoBot2"],
      playerturn: Math.floor(Math.random() * 2) + 1,
      newlines: 0,
      logfile: `Dojobot1 vs Dojobot2\n\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\nTurn 1`
    };
    for (let i = 0; i < 8; i++) {
      gamedata.squads[0].push(new BattleEmoji(player2squadarray[i].id, 1, "Dojobot1"));
    }
    for (let i = 0; i < 8; i++) {
      gamedata.squads[1].push(new BattleEmoji(player3squadarray[i].id, 2, "Dojobot2"));
    }
    let oldgamedata;
    if (evil) {
      oldgamedata = lodash.cloneDeep(gamedata);
    }

    for (let i = 0; i < 1 + 24 * Number(evil); i++) {
      let prevturn = lodash.cloneDeep(gamedata.squads);
      try {
        while (gamedata.turn < 200 && gamedata.squads[0][0] != null && gamedata.squads[1][0] != null) {
          if (gamedata.turn % 5 == 0) {
            prevturn = lodash.cloneDeep(gamedata.squads);
          }
          gamedata = playTurn(gamedata);
          if (gamedata.turn % 5 == 0 && lodash.isEqual(gamedata.squads, prevturn)) {
            gamedata.turn = 999;
            break;
          }
        }
      } catch (e) {
        console.error(e);
      }
      if (!evil) {
        if (gamedata.turn >= 200 || (gamedata.squads[0].length == 0 && gamedata.squads[1].length == 0)) {
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
      (maxIdx, currentVal, currentIdx, arr) => (currentVal > arr[maxIdx] ? currentIdx : maxIdx),
      0
    );
    return squads[bestSquadindex];
  } else {
    return player2squadarray.map((item) => item.id);
  }
}

async function getDojo(id) {
  //await database.set(id+"vault","0,1,2,3,4,5,6,8,9,10,11,12,13,14,15,16,17,18,19,20,22,23,0,1,2,3,4,5,6,8,")
  const rawvault = await database.get(id + "vault");
  let vault = rawvault.split(",").map((str) => parseInt(str));
  vault.pop();
  return vault;
}

async function getDevotions(id) {
  const userresearch = (await database.get(id + "research")) ?? "0/0/0/0/0/0/0/0/0";
  let lab = userresearch.split("/");
  while (lab.length < 9) {
    lab.push(0);
  }
  return lab.map(Number);
}

async function devoteEmojis(id, emojiid, amount) {
  let vaultarray = await getDojo(id);
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
  let lab = await getDevotions(id);
  lab[emojis[emojiid].class] += amount * (2 * emojis[emojiid].rarity + 1);
  await database.set(id + "research", lab.join("/"));
  return (emojis[emojiid].emoji + " ").repeat(amount);
}

async function restockCoins(id) {
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

    await database.set(id + "coinmod", "20");
    await database.set(id + "coinrestock", nextReset);
  }
}

async function changeCoins(id, amt, affectcooldown) {
  affectcooldown = affectcooldown ?? true;
  const originalamt = amt;
  let coinmod = 0;
  let doublerbonus = 0;
  if (affectcooldown) {
    coinmod = parseInt((await database.get(id + "coinmod")) ?? "20");
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

function curveCoins(coins, mult) {
  return Math.ceil(10 * mult * (0.688921 + 0.149597 * Math.log(coins)));
}

class BattleEmoji {
  static nextBattleId = 1;

  constructor(id, squad, playername) {
    id = parseInt(id);
    this.battleId = BattleEmoji.nextBattleId++;
    this.id = id;
    this.originalid = id;
    this.hp = emojis[id]?.hp;
    this.dmg = emojis[id]?.dmg;
    this.originalhp = emojis[id]?.hp;
    this.originaldmg = emojis[id]?.dmg;
    this.emoji = emojis[id]?.emoji;
    this.class = emojis[id]?.class;
    this.name = emojis[id]?.names[0];
    this.names = lodash.clone(emojis[id]?.names);
    this.rarity = emojis[id]?.rarity;
    this.squad = squad;
    this.playername = playername;
  }

  index(gamedata) {
    if (this.oldindex !== undefined) return this.oldindex;
    return gamedata.squads[this.squad - 1].findIndex((x) => x.battleId == this.battleId);
  }

  emojibehind(gamedata) {
    return gamedata.squads[this.squad - 1][this.index(gamedata) + 1];
  }

  emojiinfront(gamedata) {
    return gamedata.squads[this.squad - 1][this.index(gamedata) - 1];
  }

  squadarr(gamedata) {
    return gamedata.squads[this.squad - 1];
  }

  alterdmg(gamedata, val) {
    this.dmg += val;
    return gamedata;
  }

  alterhp(gamedata, target, val, verb, silence, revalue) {
    if (gamedata.newlines > 50 || gamedata.turn >= 200 || gamedata.draw) {
      if (!gamedata.draw) {
        gamedata = battleLine(gamedata, `\n♾️ Looks like you ran into an infinite loop!`);
        gamedata.draw = true;
      }
      return gamedata;
    }
    if (target == undefined) return gamedata;
    if (!gamedata) return gamedata;
    if (gamedata.richtext.length > 10000) {
      console.error(JSON.stringify(gamedata));
      return gamedata;
    }

    let offender = this;

    ({ gamedata, target, offender } = beforeAlter(gamedata, target, offender));

    if (revalue ?? true) {
      ({ gamedata, target, offender, val, silence } = multiAttack(gamedata, target, offender, val, silence));
      ({ gamedata, target, offender, val } = revalueAttack(gamedata, target, offender, val));
    }

    ({ gamedata, target, offender, val, verb, silence } = retargetAttack(
      gamedata,
      target,
      offender,
      val,
      verb,
      silence
    ));

    if (offender !== this) {
      return offender.alterhp(gamedata, target, val, verb, silence);
    }

    ({ gamedata, target, offender, val } = defendAttack(gamedata, target, offender, val));

    if (!target) return gamedata;
    if (target.hp === undefined || target.hp < 0) target.hp = 0;

    ({ gamedata, target, offender, val, silence } = beforeAttack(gamedata, target, offender, val, silence));

    target.hp += val;

    let kill;
    if (target.hp <= 0) {
      kill = true;
      ({ gamedata, target, offender, kill, silence } = beforeDefeat(gamedata, target, offender, kill, silence));
      if (!silence && target && offender) {
        gamedata = battleLine(
          gamedata,
          `\n𝚾 ${offender.playername}'s ${offender.emoji} defeated ${target.playername}'s ${target.emoji}! (${
            val * -1
          } damage)`
        );
      }
      ({ gamedata, target, offender } = onDefeat(gamedata, target, offender));
      if (kill) {
        gamedata.graveyard = gamedata.graveyard ?? [];
        const idx = target.index(gamedata);
        target.oldindex = idx;
        if (idx !== -1) {
          const [removed] = target.squadarr(gamedata).splice(idx, 1);
          gamedata.graveyard.push(removed);
          ({ gamedata, target, offender } = afterDefeat(gamedata, target, offender));
        }
      }
      ({ gamedata, target, offender } = afterAttackOrDefeat(gamedata, target, offender));
    } else {
      if (val > 0) {
        if (!silence && offender && target) {
          gamedata = battleLine(
            gamedata,
            `\n♡ ${offender.playername}'s ${offender.emoji} ${verb ?? "healed"} ${
              target.battleId == offender.battleId ? "itself" : `${target.playername}'s ${target.emoji}`
            }. (${val} health)`
          );
        }
        ({ gamedata, target, val } = onHeal(gamedata, target, val));
      } else if (val < 0) {
        if (!silence && offender && target) {
          gamedata = battleLine(
            gamedata,
            `\n↣ ${offender.playername}'s ${offender.emoji} ${verb ?? "attacked"} ${
              target.battleId == offender.battleId ? "itself" : `${target.playername}'s ${target.emoji}`
            }. (${val * -1} damage)`
          );
        }
        ({ gamedata, target, offender, val } = onAttack(gamedata, target, offender, val));
        ({ gamedata, target, offender } = afterAttackOrDefeat(gamedata, target, offender));
        ({ gamedata, target, offender } = afterAttack(gamedata, target, offender));
      }
    }
    if (val == 0 && !silence && offender) {
      const didnothing = ["did nothing.", "just stood there.", "didn't do anything."];

      gamedata = battleLine(
        gamedata,
        `\n↣ ${offender.playername}'s ${offender.emoji} ${didnothing[Math.floor(Math.random() * didnothing.length)]}`
      );
    }
    ({ gamedata, target, offender } = afterAlter(gamedata, target, offender));

    return gamedata;
  }

  summon(gamedata, id, squad, pos, hp, dmg) {
    const newemoji = new BattleEmoji(id, squad, gamedata.player[squad - 1]);
    if (newemoji == undefined) return gamedata;
    gamedata.squads[squad - 1].splice(pos, 0, newemoji);
    gamedata.squads[squad - 1][pos].summoned = true;
    if (hp !== undefined) {
      gamedata.squads[squad - 1][pos].hp = hp;
      gamedata.squads[squad - 1][pos].originalhp = hp;
    }
    if (dmg !== undefined) {
      gamedata.squads[squad - 1][pos].dmg = dmg;
      gamedata.squads[squad - 1][pos].originaldmg = dmg;
    }
    return gamedata;
  }

  transform(gamedata, id, target, hp, dmg) {
    const slot = target ?? this;

    slot.oldid = slot.id;

    slot.id = id;
    slot.emoji = emojis[id]?.emoji;
    slot.class = emojis[id]?.class;
    slot.names = lodash.clone(emojis[id]?.names) ?? [];
    slot.name = slot.names[0] ?? slot.name;
    slot.rarity = emojis[id]?.rarity;
    slot.transformed = true;

    slot.originalhp = hp ?? emojis[id]?.hp;
    slot.originaldmg = dmg ?? emojis[id]?.dmg;

    slot.hp = hp ?? slot.originalhp;
    slot.dmg = dmg ?? slot.originaldmg;

    return gamedata;
  }

  move(gamedata, newIndex) {
    if (this.id == 105) {
      // rock
      gamedata = battleLine(gamedata, `\n${this.emoji} ${this.name.toLowerCase()} dont move`);
      return gamedata;
    }

    for (let i = 0; i < gamedata.squads[this.squad - 1].length; i++) {
      const focusedemoji = gamedata.squads[this.squad - 1][i];
      if (focusedemoji.id == 147) {
        // kite
        gamedata = focusedemoji.alterhp(gamedata, this, 1, "", true);
        gamedata = focusedemoji.alterhp(gamedata, focusedemoji, -1, "", true);
        gamedata = battleLine(
          gamedata,
          `\n♡ ${this.playername}'s ${focusedemoji.emoji} healed ${this.emoji} by 1 and damaged itself!`
        );
      }
      if (focusedemoji.id == 148) {
        const clampedTarget = Math.max(0, Math.min(Math.trunc(newIndex), gamedata.squads[this.squad - 1].length - 1));
        if ((this.index(gamedata) < i && clampedTarget >= i) || (clampedTarget <= i && this.index(gamedata) > i)) {
          gamedata = focusedemoji.alterhp(gamedata, this, 1);
        }
      }
    }
    if (this.id == 155) {
      // bike
      gamedata = this.alterhp(gamedata, gamedata.squads[flip12(this.squad) - 1][0], 0 - this.dmg);
    }
    const s = gamedata.squads[this.squad - 1];
    const currentIndex = this.index(gamedata);
    const targetIndex = Math.max(0, Math.min(Math.trunc(newIndex), s.length - 1));

    const [item] = s.splice(currentIndex, 1);
    s.splice(targetIndex, 0, item);
    return gamedata;
  }
}

function battleLine(gamedata, text) {
  gamedata.richtext.push(text);
  gamedata.logfile += text;
  gamedata.newlines += 1;
  return gamedata;
}

function flip01(number) {
  return number == 0 ? 1 : 0;
}

function flip12(number) {
  return number == 1 ? 2 : 1;
}

function multiAttack(gamedata, target, offender, val, silence) {
  if (val < 0) {
    if (offender.emojibehind(gamedata)?.id == 8) {
      // handshake
      gamedata = offender
        .emojibehind(gamedata)
        .alterhp(gamedata, target, 0 - offender.emojibehind(gamedata).dmg, undefined, false, false);
    }
    if (offender?.id == 34 && target.emojibehind(gamedata)) {
      // zap
      gamedata = offender.alterhp(gamedata, target.emojibehind(gamedata), val, "zapped", undefined, false, false);
    }
    if (offender?.id == 96 && target.emojibehind(gamedata) && musicActive(gamedata, offender)) {
      // accordion
      gamedata = offender.alterhp(gamedata, target.emojibehind(gamedata), val, undefined, false, false);
    }
    if (offender?.id == 102) {
      // socks
      gamedata = offender.alterhp(gamedata, target, val, undefined, false, false);
    }
    if (offender?.id == 112 && musicActive(gamedata, offender)) {
      // maracas
      gamedata = offender.alterhp(gamedata, target, val, undefined, false, false);
    }
    if (offender?.id == 93) {
      // bee
      silence = true;
      const swarmcount = offender.squadarr(gamedata).filter((element) => element.id == 93).length;
      gamedata = battleLine(
        gamedata,
        `\n✩ ${offender.playername}'s ${swarmcount < 2 ? "(lonely) " : ""}swarm of ${swarmcount} ${
          offender.emoji
        } attacked!`
      );
      const targetpos = target.index(gamedata);
      const targetsquad = target.squad;
      for (let j = 0; j < offender.squadarr(gamedata).length; j++) {
        if (offender.squadarr(gamedata)[j]?.id == 93 && offender.squadarr(gamedata)[j].battleId != offender.battleId) {
          gamedata = offender
            .squadarr(gamedata)
            [j].alterhp(
              gamedata,
              gamedata.squads[targetsquad - 1][targetpos],
              0 - offender.squadarr(gamedata)[j].dmg,
              undefined,
              false,
              false
            );
        }
      }
    }
  }

  return {
    gamedata: gamedata,
    target: target,
    offender: offender,
    val: val,
    silence: silence
  };
}

function revalueAttack(gamedata, target, offender, val) {
  if (val <= 0) {
    if (offender.emojibehind(gamedata)) {
      if (offender.emojibehind(gamedata)?.id == 12) {
        // martial arts uniform
        val -= 1;
      }
      if (offender.emojibehind(gamedata)?.id == 75) {
        // anger
        val -= 2;
      }
    }
    if (musicActive(gamedata, offender)) {
      switch (offender?.id) {
        case 13:
          // guitar
          val -= 1;
          break;
        case 44:
          // violin
          val -= 3;
          break;
        case 63:
          // loud sound
          val -=
            offender.squadarr(gamedata).filter((element) => element.id == 14).length * 2 +
            (offender.emojibehind(gamedata)?.id == 77 ? 1 : 0);
          break;
      }
    } else {
      switch (offender?.id) {
        case 74:
          // battery
          val += offender.hp;
          break;
        case 60:
          // mirror
          val += target?.dmg;
          break;
        case 114:
          // dotted line face
          val -= 1;
          break;
        case 109:
          if (offender?.hp < target?.hp) {
            // boxing glove
            val -= 1;
          }
          break;
        case 0:
          // clap
          val -= gamedata.squads[gamedata.playerturn].filter((element) => element.id == 0).length;
          verb = "clapped at";
          break;
        case 22:
          // rage
          val -= Math.ceil(target.squadarr(gamedata).length / 2);
          break;
      }
    }
  }

  return {
    gamedata: gamedata,
    target: target,
    offender: offender,
    val: val
  };
}

function retargetAttack(gamedata, target, offender, val, verb, silence) {
  const dartlikes = new Set([89, 117, 118, 119, 120]);
  // dart/moai/hot face/military helmet/baggage claim
  if (
    target.squadarr(gamedata).findIndex((x) => dartlikes.has(x.id)) != -1 &&
    target.squad != offender.squad &&
    val <= 0
  ) {
    let shunt = true;
    if (target == target.squadarr(gamedata).find((x) => dartlikes.has(x.id))) {
      shunt = false;
    }
    target = target.squadarr(gamedata).find((x) => dartlikes.has(x.id));
    if (shunt) {
      return {
        gamedata: gamedata,
        target: target,
        offender: offender,
        val: val,
        verb: verb,
        silence: silence
      };
    }
  } else if (target.dmg > 0 && val <= 0) {
    if (offender?.id == 100) {
      // magnifying glass
      target = target.squadarr(gamedata).reduce((maxItem, current) => {
        return (current?.hp ?? -Infinity) < (maxItem?.hp ?? -Infinity) ? current : maxItem;
      });
      return {
        gamedata: gamedata,
        target: target,
        offender: offender,
        val: val,
        verb: verb,
        silence: silence
      };
    } else if (offender?.id == 101) {
      // top
      target = target.squadarr(gamedata).reduce((maxItem, current) => {
        return (current?.hp ?? -Infinity) > (maxItem?.hp ?? -Infinity) ? current : maxItem;
      });
      return {
        gamedata: gamedata,
        target: target,
        offender: offender,
        val: val,
        verb: verb,
        silence: silence
      };
    } else if (offender?.id == 133) {
      // military medal
      target = target.squadarr(gamedata).reduce((maxItem, current) => {
        return (current?.dmg ?? -Infinity) > (maxItem?.dmg ?? -Infinity) ? current : maxItem;
      });
      return {
        gamedata: gamedata,
        target: target,
        offender: offender,
        val: val,
        verb: verb,
        silence: silence
      };
    } else if (offender?.id == 84 && target.emojibehind(gamedata)) {
      // bow and arrow
      target = target.emojibehind(gamedata);
      return {
        gamedata: gamedata,
        target: target,
        offender: offender,
        val: val,
        verb: verb,
        silence: silence
      };
    } else if (offender?.id == 88) {
      // back
      target = target.squadarr(gamedata)[target.squadarr(gamedata).length - 1];
      return {
        gamedata: gamedata,
        target: target,
        offender: offender,
        val: val,
        verb: verb,
        silence: silence
      };
    }
  }
  if (target.hp <= 0) {
    target = target.emojibehind(gamedata);
    return {
      gamedata: gamedata,
      target: target,
      offender: offender,
      val: val,
      verb: verb,
      silence: silence
    };
  }

  if (target.emojibehind(gamedata)?.id == 135 && 0 - val >= target.hp) {
    // safety vest
    gamedata = battleLine(
      gamedata,
      `\n⇪ Instead of ${target.emoji} being defeated, ${target.playername}'s ${
        target.emojibehind(gamedata).emoji
      } took the attack!`
    );
    target = target.emojibehind(gamedata);
  }

  return {
    gamedata: gamedata,
    target: target,
    offender: offender,
    val: val,
    verb: verb,
    silence: silence
  };
}

function defendAttack(gamedata, target, offender, val) {
  if (offender?.id == 94 && val < -1) {
    // needle
    for (let i = Math.min(target.squadarr(gamedata).length, 0 - val) - 1; i > 0; i--) {
      gamedata = offender.alterhp(gamedata, target.squadarr(gamedata)[i], -1, undefined, false, false);
    }
    val = -1;
  }
  if (offender?.id == 152 && val < -1) {
    // trident
    const index = target.index(gamedata);
    for (let i = 0 - val - 1; i > 0; i--) {
      gamedata = offender.alterhp(gamedata, target.squadarr(gamedata)[index], -1, undefined, false, false);
    }
    target = target.squadarr(gamedata)[index] ?? target;
    val = -1;
  }
  if (offender?.id == 134 && val < -1 && musicActive(gamedata, offender)) {
    // flute
    for (let i = Math.min(target.squadarr(gamedata).length, 0 - val) - 1; i > 0; i--) {
      gamedata = offender.alterhp(gamedata, target.squadarr(gamedata)[i], -1, undefined, false, false);
    }
    val = -1;
  }
  if (target?.id == 125 && val <= 0 && target.squad == offender.squad && target?.hp > 0 - val) {
    // sponge
    val *= -1;
  }
  if ((target?.id == 2 || target?.id == 117) && val < 0) {
    // relieved face, moyai/moai
    val = Math.min(val + 1, -1);
  }
  if (target?.id == 79 && val < 0 && musicActive(gamedata, target)) {
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
      val = Math.min(val + target.squadarr(gamedata).filter((x) => x.class == 2).length, -1);
    } else if (val > 0) {
      val = 0;
    }
  }
  if ((target?.id == 40 || target?.id == 89) && val < 0) {
    // joker, dart
    val = val - 1;
  }
  if (target?.id == 35 || target?.id == 54 || target?.id == 103 || target?.id == 120) {
    // bricks, bubbles, military helmet, bouquet
    if (val > 0) {
      val = 0;
    }
  }
  if (gamedata.squads[flip12(target?.squad) - 1][0]?.id == 97 && target.index(gamedata) == 0) {
    // adhesive bandage
    if (val > 0) {
      val = 0;
    }
  }

  return {
    gamedata: gamedata,
    target: target,
    offender: offender,
    val: val
  };
}

function beforeAttack(gamedata, target, offender, val, silence) {
  if (offender?.id == 42 && offender.squadarr(gamedata).length > 1) {
    // dancer
    gamedata = battleLine(
      gamedata,
      `\n⇋ ${offender.playername}'s ${offender?.emoji} retreated behind ${offender.emojibehind(gamedata)?.emoji}!`
    );
    gamedata = offender.move(gamedata, offender.index(gamedata) + 1);
  }
  if ((offender?.id == 64 || offender?.id == 38 || offender?.id == 119) && target.squad != offender.squad) {
    // mushroom, sparkles, hot face
    gamedata = battleLine(
      gamedata,
      `\n↢ ${offender.playername}'s ${offender?.emoji} damaged itself by attacking! (1 damage)`
    );
    gamedata = offender.alterhp(gamedata, offender, -1, "", true);
  }
  if (offender?.id == 37 && gamedata.turn % 4 <= 2) {
    // ghost
    const oldemoji = target.emoji;
    gamedata = offender.transform(gamedata, 7, target, target.hp, target.dmg);
    gamedata = battleLine(
      gamedata,
      `\n⇪ ${offender.playername}'s ${offender.emoji} transformed ${target.playername}'s ${oldemoji} into ${emojis[7].emoji}!`
    );
  }
  if (target?.id == 146 && val > 0) {
    // bandaged heart
    target.hp -= val;
    gamedata = target.alterdmg(gamedata, val);
    gamedata = battleLine(gamedata, `\n⇮ ${target.playername}'s ${target.emoji} strengthened itself by ${val}!`);
    silence = true;
  }
  return {
    gamedata: gamedata,
    target: target,
    offender: offender,
    val: val,
    silence: silence
  };
}

function beforeDefeat(gamedata, target, offender, kill, silence) {
  if (target?.id == 86) {
    // bone/dino
    gamedata = battleLine(
      gamedata,
      `\n⇪ Instead of being defeated, ${target.playername}'s ${target.emoji} evolved into ${emojis[87].emoji}!`
    );
    gamedata = target.transform(gamedata, 87);
    silence = true;
    kill = false;
  }
  if (target?.id == 43) {
    // pinata
    silence = true;
  }
  if (offender?.id == 82 && target) {
    // dove
    gamedata = offender.summon(gamedata, target.id, offender.squad, 0, 1);
    gamedata = battleLine(
      gamedata,
      `\n⇋ ${offender.playername}'s ${offender.emoji} made peace with ${target.playername}'s ${target.emoji}!`
    );
    target.squadarr(gamedata).splice(target.index(gamedata), 1);
    silence = true;
    kill = false;
  }
  if (offender?.id == 115) {
    // no entry sign
    gamedata = battleLine(
      gamedata,
      `\n✩ ${offender.playername}'s ${offender.emoji} deleted ${target.playername}'s ${target.emoji}!`
    );
    target.squadarr(gamedata).splice(target.index(gamedata), 1);
    silence = true;
    kill = false;
  }

  return {
    gamedata: gamedata,
    target: target,
    offender: offender,
    kill: kill,
    silence: silence
  };
}

function onDefeat(gamedata, target, offender) {
  if (offender?.id != 115) {
    // no entry sign
    if (offender?.id == 20) {
      // chess pawn
      gamedata = offender.transform(gamedata, 21);
      gamedata = battleLine(
        gamedata,
        `\n⇪ ${offender.playername}'s ${offender.emoji} was promoted to a ${emojis[21].emoji}!`
      );
    }
    if (offender?.id == 80) {
      // fax
      gamedata = offender.summon(gamedata, 81, offender.squad, 0);
      gamedata = battleLine(
        gamedata,
        `\n✚ ${offender.playername}'s ${offender.emoji} printed out a ${emojis[81].emoji}!`
      );
    }
    if (offender?.id == 137) {
      // printer
      gamedata = offender.summon(gamedata, 81, offender.squad, offender.squadarr(gamedata).length);
      gamedata = battleLine(
        gamedata,
        `\n✚ ${offender.playername}'s ${offender.emoji} printed out a ${emojis[81].emoji}!`
      );
    }
    if (offender?.id == 83 && offender.battleId != target.battleId) {
      // innocent
      gamedata = battleLine(
        gamedata,
        `\n↢ ${offender.playername}'s ${offender.emoji} was hurt by its violence! (3 damage)`
      );
      gamedata = offender.alterhp(gamedata, offender, -3, "", true);
    }
    if (offender?.id == 52) {
      // night with stars
      for (let i = 0; i < target.squadarr(gamedata).length; i++) {
        if (target.squadarr(gamedata)[i]?.id == target?.id && target.squadarr(gamedata)[i].hp > 0) {
          gamedata = offender.alterhp(gamedata, target, -1);
        }
      }
    }
    if (offender?.id == 53) {
      // wolf
      gamedata = offender.alterhp(gamedata, offender, 1, "", true);
      gamedata = offender.alterdmg(gamedata, 1);
      gamedata = battleLine(
        gamedata,
        `\n⇮ ${offender.playername}'s ${offender.emoji} strengthened and healed itself by 1!`
      );
    }
    if (offender?.id == 165) {
      // rewind
      gamedata = battleLine(gamedata, `\n✩ ${offender.playername}'s ${offender.emoji} rewound itself!`);
      offender.hp = offender.originalhp;
      offender.dmg = offender.originaldmg;
      offender.id = offender.originalid;
      offender.emoji = emojis[offender.originalid].emoji;
    }
    if (target?.id == 45) {
      // radio
      gamedata = target.summon(gamedata, 14, target.squad, target.squadarr(gamedata).length);
      gamedata = battleLine(
        gamedata,
        `\n✚ ${target.playername}'s ${target.emoji} played ${emojis[14].emoji} at the back of the Squad!`
      );
    }
    if (target?.id == 69) {
      // amphora
      const commons = emojis.filter((item) => item.rarity === 0);
      const rand = Math.floor(Math.random() * commons.length);
      gamedata = target.summon(gamedata, rand, target.squad, target.index(gamedata));
      gamedata = battleLine(
        gamedata,
        `\n⇪ ${target.playername}'s ${target.emoji} broke and summoned ${commons[rand].emoji}!`
      );
    }
    if (target?.id == 65 && offender) {
      // busts in silhouette
      gamedata = target.transform(gamedata, offender.id, target, offender.hp, offender.dmg);
      gamedata = battleLine(
        gamedata,
        `\n⇪ ${target.playername}'s ${target.emoji} transformed into an exact replica of ${offender.playername}'s ${offender.emoji}!`
      );
    }
    if (target.emojibehind(gamedata)?.id == 66) {
      // new
      gamedata = target
        .emojibehind(gamedata)
        .transform(gamedata, target.id, target.emojibehind(gamedata), target.originalhp, target.originaldmg);
      gamedata = battleLine(
        gamedata,
        `\n⇪ ${target.playername}'s ${target.emojibehind(gamedata).emoji} transformed into a new ${target.emoji}!`
      );
    }
    if (target?.id == 57) {
      // mask
      gamedata = target.summon(gamedata, 58, flip12(target.squad), 0);
      gamedata = battleLine(
        gamedata,
        `\n✚ ${target.playername}'s ${target.emoji} infected ${
          gamedata.player[flip12(target.squad) - 1]
        }'s Squad with a ${emojis[58].emoji}!`
      );
      gamedata = battleLine(
        gamedata,
        `\n↝ ${target.playername}'s ${target.emoji} Shuffled ${gamedata.player[flip12(target.squad) - 1]}'s Squad!`
      );
      gamedata = shuffleSquad(gamedata, flip12(target.squad));
    }
    if (target?.id == 39) {
      // unicorn
      gamedata = target.summon(gamedata, 38, flip12(target.squad), 0);
      gamedata = battleLine(
        gamedata,
        `\n✚ ${target.playername}'s ${target.emoji} summoned ${emojis[38].emoji} at the front of ${
          gamedata.player[flip12(target.squad) - 1]
        }'s Squad!`
      );
    }
    if (target?.id == 121) {
      // tree
      gamedata = target.summon(gamedata, 122, offender.squad, 0);
      gamedata = target.summon(gamedata, 122, offender.squad, 0);
      gamedata = battleLine(
        gamedata,
        `\n✚ ${target.playername}'s ${target.emoji} summoned ${emojis[122].emoji}${emojis[122].emoji} in ${offender.playername}'s Squad!`
      );
    }
    if (target?.id == 122) {
      // apple
      gamedata = target.alterhp(gamedata, offender, 1);
    }
    if (target?.id == 124) {
      // zzz
      gamedata = target.alterhp(gamedata, target.emojibehind(gamedata), 1);
    }
    if (target?.id == 141) {
      // poop
      gamedata = offender.alterdmg(gamedata, -1);
      gamedata = battleLine(
        gamedata,
        `\n✩ ${target.playername}'s ${target.emoji} weakened ${offender.playername}'s ${offender.emoji}! (-1 attack)`
      );
    }
    if (target?.id != 61) {
      // wand
      for (let i = target.squadarr(gamedata).length - 1; i > -1; i--) {
        if (target.squadarr(gamedata)[i]?.id == 61) {
          gamedata = target
            .squadarr(gamedata)
            [i].summon(gamedata, target.id, target.squad, target.squadarr(gamedata).length, 2);
          gamedata = battleLine(
            gamedata,
            `\n✚ ${target.playername}'s ${target.squadarr(gamedata)[i].emoji} revived ${
              target.emoji
            } at the back of the Squad, and defeated itself!`
          );
          gamedata = target.squadarr(gamedata)[i].alterhp(gamedata, target.squadarr(gamedata)[i], -9999, "", true);
        }
      }
    }
    if (target?.id == 59 && offender.squadarr(gamedata)[0]) {
      // flying saucer
      gamedata = shuffleSquad(gamedata, offender.squad);
      gamedata = battleLine(
        gamedata,
        `\n↝ ${target.playername}'s ${target.emoji} Shuffled ${offender.playername}'s Squad, and zapped ${
          offender.squadarr(gamedata)[0]?.emoji
        } for 3 damage!`
      );
      gamedata = target.alterhp(gamedata, offender.squadarr(gamedata)[0], -3, null, true);
    }
    if (target?.id == 55 && offender.squadarr(gamedata)[0]) {
      // banana
      gamedata = offender.move(gamedata, offender.squadarr(gamedata).length - 1);
      gamedata = target.alterhp(
        gamedata,
        offender.squadarr(gamedata)[offender.squadarr(gamedata).length - 1],
        -2,
        "",
        true
      );
      gamedata = battleLine(
        gamedata,
        `\n⇋ ${offender.playername}'s ${offender.emoji} slipped on ${target.playername}'s ${target.emoji}!`
      );
    }
    if (target?.id == 56 && offender.squadarr(gamedata)[offender.squadarr(gamedata).length - 1]) {
      // magnet
      gamedata = gamedata.squads[target.squad - 1][gamedata.squads[target.squad - 1].length - 1].move(gamedata, 0);
      gamedata = target.alterhp(gamedata, offender.squadarr(gamedata)[0], -2, "", true);
      gamedata = battleLine(
        gamedata,
        `\n⇋ ${offender.playername}'s ${offender.squadarr(gamedata)[0].emoji} was pulled to the front of the Squad by ${
          target.playername
        }'s ${target.emoji}!`
      );
    }
    if (target?.id == 46) {
      // fire
      if (target.emojibehind(gamedata)) {
        gamedata = target.alterhp(gamedata, target.emojibehind(gamedata), -2, "burned");
      }
    }
    if (offender?.id == 113 && target.emojibehind(gamedata)) {
      // scissors
      const oldemoji = target.emojibehind(gamedata).emoji;
      gamedata = offender.transform(
        gamedata,
        114,
        target.emojibehind(gamedata),
        target.emojibehind(gamedata).hp,
        target.emojibehind(gamedata).dmg
      );
      gamedata = battleLine(
        gamedata,
        `\n⇪ ${offender.playername}'s ${offender.emoji} transformed ${target.playername}'s ${oldemoji} into ${emojis[114].emoji}!`
      );
    }
  }
  return {
    gamedata: gamedata,
    target: target,
    offender: offender
  };
}

function onAttack(gamedata, target, offender, val) {
  if (offender?.id == 6 && offender?.hp > 2) {
    // speaking head
    if (target.dmg > 0) {
      target.alterdmg(gamedata, -1);
      gamedata = battleLine(
        gamedata,
        `\n✩ ${offender.playername}'s ${offender.emoji} weakened ${target.playername}'s ${target.emoji}! (-1 attack)`
      );
    }
  }
  if (target.emojibehind(gamedata)?.id == 1 && val < -1) {
    // kissing heart face
    gamedata = target.emojibehind(gamedata).alterhp(gamedata, target, 1, "kissed");
  }
  if (target.emojibehind(gamedata)?.id == 78 && musicActive(gamedata, target.emojibehind(gamedata)) && val < -1) {
    // saxophone
    gamedata = target.emojibehind(gamedata).alterhp(gamedata, target, 1, "jazzed");
  }
  if (target?.id == 3 && target.squadarr(gamedata).length > 1) {
    // cold sweat face
    gamedata = target.move(gamedata, target.index(gamedata) + 1);
    gamedata = battleLine(
      gamedata,
      `\n⇋ ${target.playername}'s ${target.emoji} retreated behind ${target.emojiinfront(gamedata)}!`
    );
  }
  if (target?.id == 110 && target.squadarr(gamedata).length > 1) {
    // curling stone
    console.log
    gamedata = battleLine(
      gamedata,
      `\n⇋ ${target.playername}'s ${target.emoji} retreated behind ${target.emojibehind(gamedata).emoji}, and ${
        target.emojibehind(gamedata).emoji
      } attacked!`
    );
    gamedata = target.move(gamedata, target.index(gamedata) + 1);
    gamedata = target
      .emojiinfront(gamedata)
      .alterhp(gamedata, offender.squadarr(gamedata)[0], 0 - target.emojiinfront(gamedata).dmg, "", true);
  }
  if (target?.id == 5 && target.squadarr(gamedata).length > 1) {
    // turtle
    gamedata = battleLine(gamedata, `\n⇋ ${target.playername}'s ${target.emoji} retreated to the back of the Squad!`);
    gamedata = target.move(gamedata, target.squadarr(gamedata).length - 1);
    gamedata = target.alterhp(gamedata, target, 2);
  }
  if (target?.id == 111) {
    // wrapped gift
    const nonmasters = emojis.filter((item) => item.rarity != 3 && !(item.class === null && item.rarity === -1));
    const rand = Math.floor(Math.random() * nonmasters.length);
    gamedata = target.summon(gamedata, nonmasters[rand].id, target.squad, target.index(gamedata));
    gamedata = battleLine(gamedata, `\n✚ ${target.playername}'s ${target.emoji} summoned ${nonmasters[rand].emoji}!`);
  }
  if (target?.id == 67) {
    // lock with ink pen
    const oldemoji = offender.emoji;
    gamedata = target.transform(gamedata, 68, offender, offender.hp, offender.dmg);
    gamedata = battleLine(
      gamedata,
      `\n⇪ ${target.playername}'s ${target.emoji} transformed ${offender.playername}'s ${oldemoji} into ${emojis[68].emoji}`
    );
  }
  if (target?.id == 114) {
    // dotted line face
    gamedata = target.alterhp(gamedata, target, -9999, "", true);
    gamedata = battleLine(gamedata, `\n𝚾 ${target.playername}'s ${target.emoji} defeated itself!`);
  }
  if (target?.id == 131 && target.squadarr(gamedata).length > 1) {
    // revolving hearts
    gamedata = target.move(gamedata, target.index(gamedata) + 1);
    gamedata = target.alterhp(gamedata, target.emojiinfront(gamedata), 1, "", true);
    gamedata = battleLine(
      gamedata,
      `\n⇋ ${target.playername}'s ${target.emoji} retreated behind ${target.emojiinfront(gamedata).emoji}, and healed ${
        target.emojiinfront(gamedata).emoji
      }! (1 health)`
    );
  }
  if (target?.id == 132 && val < 0) {
    // lion
    target.alterdmg(gamedata, 0 - val);
  }
  for (let i = 0; i < target.squadarr(gamedata).length; i++) {
    const focusedemoji = target.squadarr(gamedata)[i];
    switch (focusedemoji?.id) {
      case 160:
        if (gamedata.squads[target.squad - 1][0].battleId != focusedemoji.battleId) {
          // feather/owl
          gamedata = focusedemoji.move(gamedata, 0);
          gamedata = battleLine(
            gamedata,
            `\n⇋ ${focusedemoji.playername}'s ${focusedemoji.emoji} flew to the front of the Squad!`
          );
        }
        break;
      case 161:
        if (gamedata.squads[target.squad - 1][0].battleId != focusedemoji.battleId) {
          // eagle
          gamedata = battleLine(
            gamedata,
            `\n⇋ ${focusedemoji.playername}'s ${focusedemoji.emoji} flew to the front of the Squad!`
          );
          gamedata = focusedemoji.move(gamedata, 0);
        }
        break;
    }
  }

  return {
    gamedata: gamedata,
    target: target,
    offender: offender,
    val: val
  };
}

function onHeal(gamedata, target, val) {
  switch (target?.id) {
    case 108:
      // heart on fire
      gamedata = target.alterhp(gamedata, gamedata.squads[flip12(target.squad) - 1][0], 0 - val);
      break;
    case 50:
      // track next
      gamedata = battleLine(
        gamedata,
        `\n↝ ${target.playername}'s ${target.emoji} Shuffled ${target.playername}'s Squad!`
      );
      gamedata = shuffleSquad(gamedata, target.squad);
      break;
  }
  if (target.index(gamedata) == 0) {
    for (let i = 1; i < target.squadarr(gamedata).length; i++) {
      const focusedemoji = target.squadarr(gamedata)[i];
      if (focusedemoji?.id == 106) {
        // satellite
        gamedata = focusedemoji.alterhp(gamedata, focusedemoji, val);
      }
    }
  }
  return {
    gamedata: gamedata,
    target: target,
    val: val
  };
}

function afterDefeat(gamedata, target, offender) {
  if (offender.squadarr(gamedata)[offender.squadarr(gamedata).length - 1]?.id == 48) {
    // tada
    gamedata = offender
      .squadarr(gamedata)
      [offender.squadarr(gamedata).length - 1].alterhp(gamedata, offender, 1, "congratulated");
  }
  for (let f = 0; f < target.squadarr(gamedata).length; f++) {
    const focusedemoji = target.squadarr(gamedata)[f];
    switch (focusedemoji?.id) {
      case 11:
        if (focusedemoji?.hp > 0) {
          // headstone
          gamedata = focusedemoji.alterhp(gamedata, focusedemoji, 1);
        }
        break;
      case 103:
        // bouquet
        gamedata = focusedemoji.alterdmg(gamedata, 1);
        break;
      case 51:
        // xray
        for (let j = f + 1; j < target.squadarr(gamedata).length; j++) {
          gamedata = focusedemoji.alterhp(gamedata, target.squadarr(gamedata)[j], 1, null, true);
        }
        gamedata = battleLine(
          gamedata,
          `\n♡ ${target.playername}'s ${focusedemoji.emoji} healed all Emojis behind itself by 1!`
        );
        break;
      case 62:
        // skyline
        takeeffect = false;
        for (let j = 0; j < target.squadarr(gamedata).length; j++) {
          if (target.squadarr(gamedata)[j]?.id == target?.id && target.squadarr(gamedata)[j].hp > 0) {
            gamedata = focusedemoji.alterhp(gamedata, target.squadarr(gamedata)[j], 1, null, true);
          }
          takeeffect = true;
        }
        if (takeeffect) {
          gamedata = battleLine(
            gamedata,
            `\n♡ ${target.playername}'s ${focusedemoji.emoji} healed all friendly ${target?.emoji} by 1!`
          );
        }
        break;
    }
  }
  for (let i = 0; i < offender.squadarr(gamedata).length; i++) {
    const focusedemoji = offender.squadarr(gamedata)[i];
    switch (focusedemoji?.id) {
      case 25:
        // skull and crossbones
        gamedata = focusedemoji.alterhp(gamedata, focusedemoji.emojibehind(gamedata), 1);
        break;
      case 18:
        // skull
        gamedata = focusedemoji.alterhp(gamedata, focusedemoji, 1);
        break;
      case 162:
        // broken heart
        gamedata = focusedemoji.alterhp(gamedata, target.squadarr(gamedata)[0], 1);
        break;
      case 163:
        if (focusedemoji.emojibehind(gamedata)) {
          // ladder
          gamedata = battleLine(
            gamedata,
            `\n⇋ ${focusedemoji.playername}'s ${focusedemoji.emojibehind(gamedata).emoji} climbed ${
              focusedemoji.emoji
            } to the front of their Squad!`
          );
          gamedata = focusedemoji.emojibehind(gamedata).move(gamedata, 0);
          i++;
        }
        break;
    }
  }
  switch (target?.id) {
    case 43:
      // pinata
      gamedata = battleLine(
        gamedata,
        `\n✩ ${offender.playername}'s ${offender.emoji} shattered ${target.playername}'s ${target.emoji}!`
      );
      if (target.squadarr(gamedata).length > 1) {
        gamedata = target.alterhp(gamedata, target.emojibehind(gamedata), 2, "gave candy to");
      }
      gamedata = target.alterhp(gamedata, offender.squadarr(gamedata)[0], -2, "threw candy at");
      silence = true;
      break;
    case 118:
      // baggage claim
      gamedata = battleLine(
        gamedata,
        `\n↝ ${target.playername}'s ${target.emoji} Shuffled ${offender.playername}'s Squad!`
      );
      gamedata = shuffleSquad(gamedata, offender.squad);
      break;
  }
  if (offender?.id == 123) {
    // sleeping face
    gamedata = offender.summon(gamedata, 124, offender.squad, offender.index(gamedata));
    gamedata = battleLine(gamedata, `\n✚ ${offender.playername}'s ${offender.emoji} summoned ${emojis[124].emoji}!`);
  }

  return {
    gamedata: gamedata,
    target: target,
    offender: offender
  };
}

function afterAttackOrDefeat(gamedata, target, offender) {
  if (target?.id == 10 && target.battleId != offender.battleId) {
    // shuffle button/twisted rightwards arrows
    gamedata = battleLine(
      gamedata,
      `\n↝ ${target.playername}'s ${target.emoji} Shuffled ${offender.playername}'s Squad, and defeated itself!`
    );
    gamedata = shuffleSquad(gamedata, offender.squad);
    if (target.hp > 0) {
      gamedata = target.alterhp(gamedata, target, -9999, "", true);
    }
  }
  if (target?.id == 9 && target.battleId != offender.battleId) {
    // mortar board
    gamedata = target.summon(gamedata, 0, target.squad, target.index(gamedata));
    gamedata = target.summon(gamedata, 0, target.squad, target.index(gamedata));
    gamedata = target.summon(gamedata, 0, target.squad, target.index(gamedata));
    if (target.hp > 0) {
      gamedata = target.alterhp(gamedata, target, -9999, "", true);
    }
    gamedata = battleLine(
      gamedata,
      `\n✚ ${target.playername}'s ${target.emoji} summoned ${emojis[0].emoji}${emojis[0].emoji}${emojis[0].emoji}, and defeated itself!`
    );
  }
  if (target?.id == 36 && target.battleId != offender.battleId) {
    // bomb
    gamedata = target.alterhp(gamedata, gamedata.squads[flip12(target.squad) - 1][0], -9999, "", true);
    if (target.hp > 0) {
      gamedata = target.alterhp(gamedata, target, -9999, "", true);
    }
    gamedata = battleLine(gamedata, `\n✩ ${target.playername}'s ${target.emoji} exploded!`);
  }
  if (target?.id == 116 && target.battleId != offender.battleId) {
    // boom
    gamedata = battleLine(gamedata, `\n✩ ${target.playername}'s ${target.emoji} exploded!`);
    gamedata = target.alterhp(gamedata, gamedata.squads[flip12(target.squad) - 1][1], -9999, "", true);
    gamedata = target.alterhp(gamedata, gamedata.squads[flip12(target.squad) - 1][0], -9999, "", true);
    gamedata = target.alterhp(gamedata, target.emojibehind(gamedata), -9999, "", true);
    if (target.hp > 0) {
      gamedata = target.alterhp(gamedata, target, -9999, "", true);
    }
  }
  if (target?.id == 165) {
    // rewind
    if (offender.summoned) {
      gamedata = battleLine(gamedata, `\n✩ ${target.playername}'s ${target.emoji} unsummoned ${offender.emoji}!`);
      gamedata = target.alterhp(gamedata, offender, -9999, "", true);
    } else {
      gamedata = battleLine(gamedata, `\n✩ ${target.playername}'s ${target.emoji} rewound ${offender.emoji}!`);
      offender.hp = offender.originalhp;
      offender.dmg = offender.originaldmg;
      offender.id = offender.originalid;
      offender.emoji = emojis[offender.originalid].emoji;
    }
  }
  if (target?.id == 41) {
    // tornado
    gamedata = battleLine(
      gamedata,
      `\n↝ ${target.playername}'s ${target.emoji} Shuffled ${offender.playername}'s Squad!`
    );
    gamedata = shuffleSquad(gamedata, offender.squad);
  }
  if (target?.id == 107) {
    // track previous
    gamedata = battleLine(
      gamedata,
      `\n↝ ${target.playername}'s ${target.emoji} Shuffled ${target.playername}'s Squad!`
    );
    gamedata = shuffleSquad(gamedata, target.squad);
  }
  if (target?.id == 154 && target.emojibehind(gamedata)) {
    // cookie
    gamedata = target.alterhp(gamedata, target.emojibehind(gamedata), 1);
  }
  if (offender?.id == 157 && offender.emojibehind(gamedata)) {
    // cupcake
    gamedata = offender.alterhp(gamedata, offender.emojibehind(gamedata), 1);
  }
  return {
    gamedata: gamedata,
    target: target,
    offender: offender
  };
}

function afterAttack(gamedata, target, offender) {
  if (offender?.id == 15 && target.squadarr(gamedata)[1]) {
    // fishing pole
    gamedata.squads[target.squad - 1][gamedata.squads[target.squad - 1].length - 1].move(gamedata, 0);
    gamedata = battleLine(
      gamedata,
      `\n⇋ ${offender.playername}'s ${offender.emoji} pulled ${target.playername}'s ${
        gamedata.squads[target.squad - 1][0].emoji
      } to the front of their Squad!`
    );
  }
  if (offender?.id == 16 && target.squadarr(gamedata)[0]) {
    // golf
    gamedata = target.move(gamedata, target.squadarr(gamedata).length - 1);
    gamedata = battleLine(
      gamedata,
      `\n⇋ ${offender.playername}'s ${offender.emoji} whacked ${target.playername}'s ${target.emoji} to the back of their Squad!`
    );
  }
  if (target?.id == 149 && offender.squadarr(gamedata)[1]) {
    // sweet potato
    gamedata.squads[offender.squad - 1][gamedata.squads[offender.squad - 1].length - 1].move(gamedata, 0);
    gamedata = battleLine(
      gamedata,
      `\n⇋ ${target.playername}'s ${target.emoji} attracted ${offender.playername}'s ${
        gamedata.squads[offender.squad - 1][0].emoji
      } to the front of their Squad!`
    );
  }
  if (target?.id == 16 && offender.squadarr(gamedata)[0]) {
    // garlic
    gamedata = offender.move(gamedata, offender.squadarr(gamedata).length - 1);
    gamedata = battleLine(
      gamedata,
      `\n⇋ ${target.playername}'s ${target.emoji} repeled ${offender.playername}'s ${offender.emoji} to the back of their Squad!`
    );
  }
  if (offender?.id == 138 && target.emojibehind(gamedata)) {
    // wind blowing face
    gamedata = target.move(gamedata, target.index(gamedata) + 1);
    gamedata = battleLine(
      gamedata,
      `\n⇋ ${offender.playername}'s ${offender.emoji} blew ${target.playername}'s ${target.emoji} backward!`
    );
  }
  if (offender?.id == 156) {
    // game die
    gamedata = shuffleSquad(gamedata, target.squad);
    gamedata = battleLine(
      gamedata,
      `\n↝ ${offender.playername}'s ${offender.emoji} Shuffled ${target.playername}'s Squad!`
    );
  }
  if (offender?.id == 49 && target != offender.emojibehind(gamedata)) {
    // flying disc
    if (offender.squadarr(gamedata).length > 1) {
      gamedata = offender.alterhp(gamedata, offender.emojibehind(gamedata), -1, "whacked");
    }
  }
  if (offender?.id == 130) {
    // performing arts
    const promiseddmg = target.dmg * -1 + 1;
    target.alterdmg(gamedata, promiseddmg - target.dmg);
    gamedata = battleLine(
      gamedata,
      `\n⇪ ${offender.playername}'s ${offender.emoji} negated the attack power of ${target.playername}'s ${target.emoji}!`
    );
  }
  return {
    gamedata: gamedata,
    target: target,
    offender: offender
  };
}

function beforeAlter(gamedata, target, offender) {
  for (let i = 0; i < gamedata.squads.length; i++) {
    for (let j = 0; j < gamedata.squads[i].length; j++) {
      if (gamedata.squads[i][j]?.originalid == 136) {
        // parrot
        gamedata.squads[i][j].id = gamedata.squads[flip01(i)][0]?.id;
      }
    }
  }
  return {
    gamedata: gamedata,
    target: target,
    offender: offender
  };
}

function afterAlter(gamedata, target, offender) {
  for (let i = 0; i < gamedata.squads.length; i++) {
    if (gamedata.squads[i].length == 1) {
      switch (gamedata.squads[i][0]?.id) {
        case 23:
          // lizard / dragon
          gamedata = battleLine(
            gamedata,
            `\n⇪ ${gamedata.player[i]}'s ${gamedata.squads[i][0].emoji} evolved into ${emojis[24].emoji}!`
          );
          gamedata = gamedata.squads[i][0].transform(gamedata, 24);
          break;
        case 91:
          // rotating light
          gamedata = battleLine(
            gamedata,
            `\n✚ ${gamedata.player[i]}'s ${gamedata.squads[i][0].emoji} called in ${emojis[92].emoji}!`
          );
          gamedata = gamedata.squads[i][0].summon(gamedata, 92, i + 1, 1);
          break;
      }
    }
  }
  return {
    gamedata: gamedata,
    target: target,
    offender: offender
  };
}

function musicActive(gamedata, emoji) {
  return (
    (gamedata.squads[emoji.squad - 1].some((x) => x.id == 14) ||
      gamedata.squads[emoji.squad - 1][emoji.index(gamedata) + 1]?.id == 77) &&
    !gamedata.squads[emoji.squad * -1 + 2].some((x) => x?.id == 98)
  );
}

function shuffleSquad(gamedata, squad) {
  const squadToShuffle = gamedata.squads[squad - 1];

  // construction
  let partitions = [];
  let currentPartition = [];
  for (let i = 0; i < squadToShuffle.length; i++) {
    if (squadToShuffle[i]?.id === 73) {
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

  if (!squadToShuffle.find((i) => i.id == 32)) {
    // ice cube
    for (let i = squadToShuffle.length - 1; i > -1; i--) {
      if (squadToShuffle[i]?.id == 33) {
        // dash
        gamedata = squadToShuffle[i].alterhp(gamedata, squadToShuffle[0], 2);
      }
      if (squadToShuffle[i]?.id == 58 && i != squadToShuffle.length - 1) {
        // microbe
        if (squadToShuffle[i + 1]?.id != 58) {
          const oldemoji = squadToShuffle[i + 1]?.emoji;
          gamedata = squadToShuffle[i].transform(
            gamedata,
            58,
            squadToShuffle[i + 1],
            squadToShuffle[i + 1]?.hp,
            squadToShuffle[i + 1]?.dmg
          );
          gamedata = battleLine(
            gamedata,
            `\n✩ ${gamedata.player[squad - 1]}'s ${squadToShuffle[i].emoji} infected ${oldemoji}!`
          );
        }
      }
    }

    if (squadToShuffle.find((i) => i.id == 104) != -1) {
      if (squadToShuffle.some((x) => x.id == 105)) {
        // rock
        gamedata = battleLine(
          gamedata,
          `\n${squadToShuffle.find((i) => i.id == 105).emoji} ${squadToShuffle
            .find((i) => i.id == 105)
            .name.toLowerCase()} dont shuffle`
        );
      }

      // pushpin, anchor, construction, rock, people hugging, linked paperclips, clamp
      const lockedIndices = squadToShuffle
        .map((item, index) =>
          [71, 72, 73, 105, 143, 144, 145].includes(item.id) ||
          squadToShuffle[index + 1]?.id === 71 ||
          squadToShuffle[index - 1]?.id === 72 ||
          squadToShuffle[index + 1]?.id === 143 ||
          squadToShuffle[index + 2]?.id === 143 ||
          squadToShuffle[index + 1]?.id === 144 ||
          squadToShuffle[index - 1]?.id === 144 ||
          squadToShuffle[index - 1]?.id === 145 ||
          squadToShuffle[index - 2]?.id === 145
            ? index
            : -1
        )
        .filter((index) => index !== -1);

      // shuffle part
      for (const partition of partitions) {
        if (partition.length === 1 && squadToShuffle[partition[0]]?.id === 73) continue;

        const unlocked = partition.filter((index) => !lockedIndices.includes(index));

        for (let i = unlocked.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          const idx1 = unlocked[i];
          const idx2 = unlocked[j];
          [squadToShuffle[idx1], squadToShuffle[idx2]] = [squadToShuffle[idx2], squadToShuffle[idx1]];
        }
      }
    } else {
      // snowman
      gamedata = squadToShuffle
        .find((i) => i.id == 104)
        .alterhp(
          gamedata,
          squadToShuffle.find((i) => i.id == 104),
          -9999,
          "",
          true
        );
      gamedata = battleLine(
        gamedata,
        `\n⇎ ${gamedata.player[squad - 1]}'s ${
          squadToShuffle.find((i) => i.id == 104).emoji
        } melted, but the Squad stayed in place!`
      );
    }

    for (let i = squadToShuffle.length - 1; i > -1; i--) {
      if (squadToShuffle[i]?.id == 28 && i < squadToShuffle.length - 1) {
        // pickup truck
        const temp = squadToShuffle[i];
        squadToShuffle.splice(i, 1);
        squadToShuffle.splice(squadToShuffle.length, 0, temp);
      }
      if (squadToShuffle[i]?.id == 151 && i < squadToShuffle.length - 1) {
        // fire engine
        const temp = squadToShuffle[i];
        squadToShuffle.splice(i, 1);
        squadToShuffle.splice(0, 0, temp);
      }
    }

    for (const partition of partitions) {
      for (let i = partition.length - 1; i > -1; i--) {
        const idx = partition[i];
        const emoji = squadToShuffle[idx];

        if (emoji?.id == 30) {
          // bus
          gamedata = emoji.alterhp(gamedata, emoji, 2);
          for (let j = partition.length - 1; j > -1; j--) {
            const stopIdx = partition[j];
            if (squadToShuffle[stopIdx]?.id == 29) {
              const temp = squadToShuffle[idx];
              squadToShuffle.splice(idx, 1);
              squadToShuffle.splice(stopIdx + 1, 0, temp);
              gamedata = battleLine(
                gamedata,
                `\n⇋ ${gamedata.player[squad - 1]}'s ${emoji.emoji} visited ${squadToShuffle[stopIdx].emoji}!`
              );
              break;
            }
          }
        }

        if (emoji?.id == 29 && partition.includes(idx + 1)) {
          // bus stop
          gamedata = emoji.alterhp(gamedata, squadToShuffle[idx + 1], 2);
        }
      }
    }

    if (squadToShuffle.some((i) => i.id == 127)) {
      // fallen leaf
      gamedata = battleLine(
        gamedata,
        `\n✩ ${gamedata.player[squad - 1]}'s ${
          squadToShuffle.filter((element) => element.id == 127).length < 2 ? "(lonely) " : ""
        }pile of ${squadToShuffle.filter((element) => element.id == 127).length} ${
          squadToShuffle.find((i) => i.id == 127).emoji
        } attacked!`
      );
      for (let j = 0; j < squadToShuffle.length; j++) {
        if (squadToShuffle[j]?.id == 127) {
          gamedata = squadToShuffle[j].alterhp(
            gamedata,
            gamedata.squads[flip12(squad) - 1][0],
            0 - squadToShuffle[j].dmg,
            undefined,
            false,
            false
          );
        }
      }
    }

    for (let i = squadToShuffle.length - 1; i > -1; i--) {
      if (squadToShuffle[i]?.id == 31) {
        // popcorn
        gamedata = squadToShuffle[i].alterhp(gamedata, squadToShuffle[0], 2);
      }
      if (squadToShuffle[i]?.id == 19) {
        // woozy face
        gamedata = squadToShuffle[i].alterhp(gamedata, squadToShuffle[i], 1);
      }
      if (squadToShuffle[i]?.id == 99) {
        // shaking face
        gamedata = battleLine(
          gamedata,
          `\n⇮ ${squadToShuffle[i].playername}'s ${squadToShuffle[i].emoji} strengthened itself by 1!`
        );
        squadToShuffle[i].alterdmg(1);
      }
      if (squadToShuffle[i]?.id == 47) {
        // volcano
        gamedata = squadToShuffle[i].summon(gamedata, 46, flip12(squad), 0, 1, 1);
        gamedata = battleLine(
          gamedata,
          `\n✚ ${squadToShuffle[i].playername}'s ${squadToShuffle[i].emoji} lit ${emojis[46].emoji} in ${
            gamedata.player[flip12(squad) - 1]
          }'s Squad!`
        );
      }
      if (squadToShuffle[i]?.id == 159) {
        // feather
        gamedata = battleLine(
          gamedata,
          `\n⇮ ${squadToShuffle[i].playername}'s ${squadToShuffle[i].emoji} transformed into ${emojis[160].emoji}!`
        );
        gamedata = squadToShuffle[i].transform(gamedata, 160);
      }
    }

    if (squadToShuffle.some((i) => i.id == 27)) {
      // cyclone
      const cyclonefound = squadToShuffle.find((i) => i.id == 27);
      gamedata = cyclonefound.alterhp(gamedata, cyclonefound, -9999, "", true);
      gamedata = battleLine(
        gamedata,
        `\n↝ ${cyclonefound.playername}'s ${cyclonefound.emoji} Shuffled ${
          gamedata.player[flip12(squad) - 1]
        }'s Squad, and defeated itself!`
      );
      gamedata = shuffleSquad(gamedata, flip12(squad));
    }
  }

  return gamedata;
}

function battleStartAbilities(gamedata) {
  for (let startsi = 0; startsi < gamedata.squads.length; startsi++) {
    for (let startei = 0; startei < gamedata.squads[startsi].length; startei++) {
      const focusedemoji = gamedata.squads[startsi][startei];
      switch (focusedemoji?.id) {
        case 164:
          // hourglass
          gamedata.drawtime += 200;
          gamedata = battleLine(
            gamedata,
            `\n${focusedemoji.playername}'s ${focusedemoji.emoji} delayed the inevitable...`
          );
          break;
        case 142:
          // bust in silhouette
          gamedata = focusedemoji.transform(gamedata, gamedata.squads[flip01(startsi)][startei].id);
          break;
        case 26:
          // cherries
          gamedata = focusedemoji.summon(gamedata, 26, startsi + 1, startei);
          startei++;
          break;
        case 158:
          // blueberries
          gamedata = focusedemoji.summon(gamedata, 158, startsi + 1, 0);
          gamedata = focusedemoji.summon(gamedata, 158, startsi + 1, 0);
          startei = startei + 2;
          break;
        case 70:
          // wireless
          const amtToHeal = gamedata.squads[startsi].filter((element) => element.id == 70).length;
          focusedemoji.hp += amtToHeal;
          focusedemoji.originalhp += amtToHeal;
          break;
        case 95:
          // family
          const amtToBuff = gamedata.squads[startsi].filter((element) => element.class == 8).length;
          focusedemoji.hp += amtToBuff;
          focusedemoji.originalhp += amtToBuff;
          focusedemoji.dmg += amtToBuff;
          focusedemoji.originaldmg += amtToBuff;
          break;
        case 76:
          if (gamedata.squads[startsi][startei - 1] != undefined) {
            // fog
            gamedata.squads[startsi][startei - 1].hp += 3;
          } else {
            gamedata.squads[flip01(startsi)][0].hp += 3;
          }
          gamedata.squads[startsi].splice(startei, 1);
            startei -= 1;
          break;
        case 85:
          if (gamedata.squads[startsi][startei - 1] != undefined) {
            // syringe
            gamedata.squads[startsi][startei - 1].dmg += 1;
          } else {
            gamedata.squads[flip01(startsi)][0].dmg += 1;
          }
          gamedata.squads[startsi].splice(startei, 1);
            startei -= 1;
          break;
        case 126:
          if (gamedata.squads[startsi][startei - 1] != undefined) {
            // beer
            let temp = lodash.cloneDeep(gamedata.squads[startsi][startei - 1].dmg);
            gamedata.squads[startsi][startei - 1].dmg = lodash.cloneDeep(gamedata.squads[startsi][startei - 1].hp);
            gamedata.squads[startsi][startei - 1].hp = temp;
          } else {
            console.log(gamedata);
            let temp = lodash.cloneDeep(gamedata.squads[flip01(startsi)][0].dmg);
            gamedata.squads[flip01(startsi)][0].dmg = lodash.cloneDeep(gamedata.squads[flip01(startsi)][0].hp);
            gamedata.squads[flip01(startsi)][0].hp = temp;
          }
          gamedata.squads[startsi].splice(startei, 1);
          startei -= 1;
          break;
        case 128:
          // clapper
          gamedata = focusedemoji.alterhp(gamedata, gamedata.squads[flip01(startsi)][0], 0 - focusedemoji?.dmg);
          break;
      }
    }
  }
  // sunrise
  const sunrises0 = gamedata.squads[0].reduce((x, emoji) => {
    return x + (emoji?.id == 129 ? 1 : 0);
  }, 0);
  const sunrises1 = gamedata.squads[1].reduce((x, emoji) => {
    return x + (emoji?.id == 129 ? 1 : 0);
  }, 0);
  if (sunrises0 > sunrises1) {
    gamedata.playerturn = 0;
  } else if (sunrises0 < sunrises1) {
    gamedata.playerturn = 1;
  }
}

function afterTurn(gamedata) {
  for (let i = 0; i < gamedata.squads.length; i++) {
    for (let j = 0; j < gamedata.squads[i].length; j++) {
      if (gamedata.squads[i][j]?.id == 139) {
        // candle
        gamedata.squads[i][j].alterhp(gamedata, gamedata.squads[i][j], -1);
      }
      if (gamedata.squads[i][j]?.id == 153 && gamedata.playerturn == i) {
        // ringed planet
        infront = gamedata.squads[i][j].emojiinfront(gamedata);
        behind = gamedata.squads[i][j].emojibehind(gamedata);
        let orbitstring = "";
        if (infront) {
          orbitstring += `${infront.emoji} `;
          if (behind) {
            orbitstring += `and `;
          }
        }
        if (behind) {
          orbitstring += `${behind.emoji} `;
        }
        gamedata = battleLine(
          gamedata,
          `\n⇋ ${orbitstring}orbited around ${gamedata.squads[i][j].playername}'s ${gamedata.squads[i][j].emoji}!`
        );
        if (infront) {
          infront.move(gamedata, j + 1);
        }
        if (behind) {
          behind.move(gamedata, j - 1);
        }
      }
    }
  }
  return gamedata;
}

function playTurn(gamedata) {
  setup: {
    if (gamedata.turn == 0) {
      battleStartAbilities(gamedata);
    }
    gamedata.turn++;
    gamedata.playerturn = (gamedata.playerturn + 1) % 2;
    gamedata.newlines = 0;
  }
  if (gamedata.turn > 1) {
    const activeemoji = gamedata.squads[gamedata.playerturn][0];
    if (activeemoji.hp > 0) {
      gamedata = activeemoji.alterhp(gamedata, gamedata.squads[flip01(gamedata.playerturn)][0], 0 - activeemoji.dmg);
    }
    gamedata = afterTurn(gamedata);
  } else {
    gamedata = battleLine(gamedata, "\nLet the battle begin!");
  }

  gamedata.logfile += "\n\n";

  scene: {
    // destroying and recreating the battle scene
    gamedata.emojitext = "​";

    if (gamedata.squads[0].length > 12) {
      gamedata.emojitext += "...";
    }

    for (let i = Math.min(gamedata.squads[0].length, 12) - 1; i >= 0; i--) {
      gamedata.emojitext += renderhemoji(gamedata.squads[0][i].hp) + " ";
    }
    for (let i = gamedata.squads[0].length - 1; i >= 0; i--) {
      if (gamedata.squads[0][i].hp !== undefined) {
        gamedata.logfile += gamedata.squads[0][i].hp + "▪️";
      } else {
        gamedata.logfile += "?▪️";
      }
    }
    gamedata.emojitext += " ";
    gamedata.logfile.slice(0, -2);
    gamedata.logfile += "    ";
    for (let i = 0; i < Math.min(gamedata.squads[1].length, 12); i++) {
      gamedata.emojitext += " " + renderhemoji(gamedata.squads[1][i].hp);
    }
    for (let i = 0; i < gamedata.squads[1].length; i++) {
      if (gamedata.squads[1][i].hp !== undefined) {
        gamedata.logfile += gamedata.squads[1][i].hp + "▪️";
      } else {
        gamedata.logfile += "?▪️";
      }
    }

    if (gamedata.squads[1].length > 12) {
      gamedata.emojitext += "...";
    }

    gamedata.emojitext += "\n";
    gamedata.logfile.slice(0, -2);
    gamedata.logfile += "  ♡️\n";

    if (gamedata.squads[0].length > 12) {
      gamedata.emojitext += "...";
    }

    for (let i = Math.min(gamedata.squads[0].length, 12) - 1; i >= 0; i--) {
      gamedata.emojitext += renderdemoji(gamedata.squads[0][i].dmg) + " ";
    }
    for (let i = gamedata.squads[0].length - 1; i >= 0; i--) {
      if (gamedata.squads[0][i].dmg !== undefined) {
        gamedata.logfile += gamedata.squads[0][i].dmg + "▪️";
      } else {
        gamedata.logfile += "?▪️";
      }
    }
    gamedata.emojitext += " ";
    gamedata.logfile.slice(0, -2);
    gamedata.logfile += "    ";
    for (let i = 0; i < Math.min(gamedata.squads[1].length, 12); i++) {
      gamedata.emojitext += " " + renderdemoji(gamedata.squads[1][i].dmg);
    }
    for (let i = 0; i < gamedata.squads[1].length; i++) {
      if (gamedata.squads[1][i].dmg !== undefined) {
        gamedata.logfile += gamedata.squads[1][i].dmg + "▪️";
      } else {
        gamedata.logfile += "?▪️";
      }
    }

    if (gamedata.squads[1].length > 12) {
      gamedata.emojitext += "...";
    }

    gamedata.emojitext += "\n";
    gamedata.logfile.slice(0, -2);
    gamedata.logfile += "  ⇮️\n";

    if (gamedata.squads[0].length > 12) {
      gamedata.emojitext += "...";
    }

    for (let i = Math.min(gamedata.squads[0].length, 12) - 1; i >= 0; i--) {
      if (gamedata.squads[0][i].emoji !== undefined) {
        gamedata.emojitext += gamedata.squads[0][i].emoji + " ";
      } else {
        gamedata.emojitext += "❔ ";
      }
    }
    for (let i = gamedata.squads[0].length - 1; i >= 0; i--) {
      if (gamedata.squads[0][i].emoji !== undefined) {
        gamedata.logfile += gamedata.squads[0][i].emoji + " ";
      } else {
        gamedata.logfile += "❔ ";
      }
    }
    gamedata.emojitext += "|";
    gamedata.logfile += " |  ";
    for (let i = 0; i < Math.min(gamedata.squads[1].length, 12); i++) {
      if (gamedata.squads[1][i].emoji !== undefined) {
        gamedata.emojitext += " " + gamedata.squads[1][i].emoji;
      } else {
        gamedata.emojitext += "❔ ";
      }
    }
    for (let i = 0; i < gamedata.squads[1].length; i++) {
      if (gamedata.squads[1][i].emoji !== undefined) {
        gamedata.logfile += gamedata.squads[1][i].emoji + " ";
      } else {
        gamedata.logfile += "❔ ";
      }
    }

    if (gamedata.squads[1].length > 12) {
      gamedata.emojitext += "...";
    }
  }

  const turnnum = gamedata.turn + 1;
  gamedata.logfile += "\n\n--------------------------------------------------------------\nTurn " + turnnum + "\n";

  return gamedata;
}

function renderhemoji(value) {
  if (value === undefined) return "<:healthundefined:1431393231416987761>";
  const index = Math.max(0, Math.min(Math.floor(Number(value)) + 1, healthemojis.length - 1));
  return healthemojis[index];
}

function renderdemoji(value) {
  if (value === undefined) return "<:attackundefined:1431393208264429730>";
  const index = Math.max(-4, Math.min(Math.floor(Number(value)) + 1, dmgemojis.length - 4)) + 3;
  return dmgemojis[index];
}

function renderqemoji(value) {
  if (value === undefined || value < 1) return "❔";
  const index = Math.min(Math.floor(Number(value)), quantityemojis.length) - 1;
  return quantityemojis[index];
}

async function adminPanel(interaction, viewemoji) {
  devdata = viewemoji.split(" ");
  devdata.shift();
  if (devdata[0] == "read") {
    const data = await database.get(devdata[1]);
    attachment = new AttachmentBuilder(Buffer.from(data), { name: "data.txt" });
    await interaction.reply({
      flags: "Ephemeral",
      content: `Found this at "${devdata[1]}".`,
      files: [attachment]
    });
  } else if (devdata[0] == "write") {
    await database.set(devdata[1], devdata[2]);
    await interaction.reply({
      flags: "Ephemeral",
      content: `Wrote "${devdata[2]}" to "${devdata[1]}".`
    });
  } else if (devdata[0] == "clear") {
    await database.delete(devdata[1]);
    await interaction.reply({
      flags: "Ephemeral",
      content: `Cleared all data from "${devdata[1]}".`
    });
  } else if (devdata[0] == "give") {
    let allemojistoadd = "";
    for (let i = 0; i < parseInt(devdata[3] ?? "1"); i++) {
      allemojistoadd +=
        emojis.find(
          (x) =>
            x.names.find(
              (y) => y.replace(/\s+/g, "_").toLowerCase() == devdata[2].trim().replace(/\s+/g, "_").toLowerCase()
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
              (y) => y.replace(/\s+/g, "_").toLowerCase() == devdata[2].trim().replace(/\s+/g, "_").toLowerCase()
            ) || x.emoji == devdata[2].replace(/\s+/g, "")
        ).emoji
      }.`
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
          name: `logs (${dateString}, ${timeString}).json`
        }
      ]
    });
  } else if (devdata[0] == "users") {
    let logs = await JSON.parse(fs.readFileSync("logs.json", "utf8"));
    const now = Math.floor(Date.now() / 1000);
    const activeuserslastday = Object.values(logs.logs.players).filter(
      (player) => player.lastboop > now - 86400
    ).length;
    const activeuserslastdaypercent =
      Math.floor((100 / (Object.values(logs.logs.players).length / activeuserslastday)) * 100) / 100;
    const activeuserslastweek = Object.values(logs.logs.players).filter(
      (player) => player.lastboop > now - 86400 * 7
    ).length;
    const activeuserslastweekpercent =
      Math.floor((100 / (Object.values(logs.logs.players).length / activeuserslastweek)) * 100) / 100;
    const newuserslastday = Object.values(logs.logs.players).filter((player) => player.joindate > now - 86400).length;
    const newuserslastdaypercent =
      Math.floor((100 / (Object.values(logs.logs.players).length / newuserslastday)) * 100) / 100;
    const newuserslastweek = Object.values(logs.logs.players).filter(
      (player) => player.joindate > now - 86400 * 7
    ).length;
    const newuserslastweekpercent =
      Math.floor((100 / (Object.values(logs.logs.players).length / newuserslastweek)) * 100) / 100;
    await interaction.reply({
      flags: "Ephemeral",
      content: `👥 Number of users with data: **${
        Object.values(logs.logs.players).length
      }**\n❤️‍🔥 Number of active users in the past day: **${activeuserslastday}** (${activeuserslastdaypercent}%)\n❤️‍🔥 Number of active users in the past week: **${activeuserslastweek}** (${activeuserslastweekpercent}%)\n🐣 Number of new users in the past day: **${newuserslastday}** (${newuserslastdaypercent}%)\n🐣 Number of new users in the past week: **${newuserslastweek}** (${newuserslastweekpercent}%)\n👀 Last interaction: <t:${
        logs.logs.games.lastboop
      }:R>`
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
        emojisviewed = 0
      } = emoji;
      const botratio = botwins / botlosses;
      const userratio = userwins / userlosses;
      const friendlyratio = friendlywins / friendlylosses;
      const ratio = (userwins + botwins + friendlywins) / (userlosses + botlosses + friendlylosses);

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
      content: `🏆 Strongest emoji in all battles: ${emojis[bestindex].emoji} (${bestwins}/${bestlosses})\n❌ Weakest emoji in all battles: ${emojis[worstindex].emoji} (${worstwins}/${worstlosses})\n\n🤖🏆 Strongest emoji in bot battles: ${emojis[bestbotindex].emoji} (${bestbotwins}/${bestbotlosses})\n🤖❌ Weakest emoji in bot battles: ${emojis[worstbotindex].emoji} (${worstbotwins}/${worstbotlosses})\n\n👤🏆 Strongest emoji in user battles: ${emojis[bestuserindex].emoji} (${bestuserwins}/${bestuserlosses})\n👤❌ Weakest emoji in user battles: ${emojis[worstuserindex].emoji} (${worstuserwins}/${worstuserlosses})\n\n💕🏆 Strongest emoji in friendly battles: ${emojis[bestfriendlyindex].emoji} (${bestfriendlywins}/${bestfriendlylosses})\n💕❌ Weakest emoji in friendly battles: ${emojis[worstfriendlyindex].emoji} (${worstfriendlywins}/${worstfriendlylosses})\n\n👀 Most viewed emoji: ${emojis[mostviewedindex].emoji} (${mostviewedtimes})`
    });
  } else if (devdata[0] == "names") {
    let logs = await JSON.parse(fs.readFileSync("logs.json", "utf8"));
    let names = "Last 40 players to join Emoji Dojo:";
    for (let i = Object.values(logs.logs.players).length - 1; i > Object.values(logs.logs.players).length - 41; i--) {
      names += "\n<@" + Object.keys(logs.logs.players)[i].slice(4) + ">";
    }
    await interaction.reply({
      flags: "Ephemeral",
      content: names
    });
  } else if (devdata[0] == "infoon") {
    let logs = await JSON.parse(fs.readFileSync("logs.json", "utf8"));
    let user = logs.logs.players["user" + devdata[1]];
    if (user == undefined) {
      await interaction.reply({
        flags: "Ephemeral",
        content: `I don't recognize ${devdata[1]} (<@${devdata[1]}>).`
      });
    } else {
      let info = `## Info on ${devdata[1]} (<@${devdata[1]}>):`;
      info += `\n- 🐣 Joined Emoji Dojo on <t:${user.joindate}:F>`;
      info += `\n- 👉 Last used Emoji Dojo <t:${user.lastboop}:R>`;
      info += `\n- ⚔️ Battles played: ${user.started || 0}`;
      info += `\n  - 🤖: ${user.botstarted || 0} (${user.botwins || 0}W/${user.botlosses || 0}L) 📄 ${
        user.botlogsrequested || 0
      }`;
      info += `\n  - 👤: ${user.userstarted || 0} (${user.userwins || 0}W/${user.userlosses || 0}L) 📄 ${
        user.userlogsrequested || 0
      }`;
      info += `\n  - 💕: ${user.friendlystarted || 0} (${user.friendlywins || 0}W/${user.friendlylosses || 0}L) 📄 ${
        user.friendlylogsrequested || 0
      }`;
      info += `\n  - 🎨: ${user.customstarted || 0} 📄 ${user.customlogsrequested || 0}`;
      info += `\n- 👀 Times dojo viewed: ${user.vaultsviewed || 0}`;
      info += `\n  - 😀 Times emoji viewed: ${user.emojisviewed || 0}`;
      info += `\n- 👥 Times squad viewed: ${user.squadsviewed || 0}`;
      info += `\n  - ✏️ Times squad edited: ${user.squadedited || 0}`;
      info += `\n- 🪙 Times coins viewed: ${user.coinsviewed || 0}`;
      info += `\n- 💹 Times shop viewed: ${user.shopsviewed || 0}`;
      info += `\n  - 🤑 Times emoji bought: ${user.prepickedemojisbought || 0}`;
      info += `\n  - 🎲 Times random emoji bought: ${user.randomemojisbought || 0}`;
      info += `\n  - 🎁 Times pack bought: ${user.packsbought || 0}`;
      info += `\n- 🛐 Emojis Devoted: ${user.emojisdevoted || 0}`;
      await interaction.reply({
        flags: "Ephemeral",
        content: info
      });
    }
  }
}

module.exports = {
  writeLogs,
  getLogs,
  devoteEmojis,
  database,
  getDojo,
  getSquad,
  changeCoins,
  playTurn,
  setupUser,
  getDevotions,
  dailyRewardRemind,
  generateBotSquad,
  checkSquadValidity,
  adminPanel,
  curveCoins,
  restockCoins,
  renderqemoji,
  BattleEmoji
};
