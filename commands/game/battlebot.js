const {
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  MessageFlags,
} = require("discord.js");
const { emojis } = require("../../data.js");
const {
  getsquad,
  playturn,
  database,
  coinschange,
  trysetupuser,
  getlogs,
  writelogs,
  dailyrewardremind,
  makesquad,
  issquadinvalid,
} = require("../../functions.js");
const lodash = require("lodash");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("battlebot")
    .setDescription(
      "Battle DojoBot, with no chance of losing coins (You can reject Dojobot every 10 minutes)"
    )
    .addStringOption((option) =>
      option
        .setName("speed")
        .setDescription("The time in seconds between each turn (defaults to 4)")
    ),
  async execute(interaction) {
    if (await trysetupuser(interaction.user)) {
      await interaction.reply({
        flags: "Ephemeral",
        content: `Greetings, <@${interaction.user.id}>! Check your DMs before you continue.`,
      });
    } else if (await issquadinvalid(interaction.user.id)) {
      await interaction.reply({
        flags: "Ephemeral",
        content: `Your squad seems to have some Emojis that aren't in your Dojo.`,
      });
    } else {
      await interaction.deferReply();
      let battlespeed = parseInt(interaction.options.getString("speed") ?? "4");
      if (battlespeed < 1) {
        battlespeed = 1;
      }
      const bp =
        (await database.get(interaction.user.id + "battlepending")) ?? "0";
      const bbcd =
        (await database.get(interaction.user.id + "botbattlecooldown")) ?? "0";
      let battleover = true;
      if (bp < Date.now() / 1000 && bbcd < Date.now() / 1000) {
        let logs = await getlogs();
        logs.logs.games.botopened += 1;
        logs.logs.games.opened += 1;
        logs.logs.players[`user${interaction.user.id}`] =
          logs.logs.players[`user${interaction.user.id}`] ?? {};
        logs.logs.players[`user${interaction.user.id}`].botopened =
          logs.logs.players[`user${interaction.user.id}`].botopened ?? 0;
        logs.logs.players[`user${interaction.user.id}`].botopened += 1;
        logs.logs.players[`user${interaction.user.id}`].opened =
          logs.logs.players[`user${interaction.user.id}`].opened ?? 0;
        logs.logs.players[`user${interaction.user.id}`].opened += 1;
        await writelogs(logs);
        const cook = new ButtonBuilder()
          .setCustomId("battle")
          .setLabel("Battle!")
          .setEmoji("🆚")
          .setStyle(ButtonStyle.Success);
        const nah = new ButtonBuilder()
          .setCustomId("nah")
          .setLabel("Nah (Wait 10 minutes)")
          .setEmoji("🕐")
          .setStyle(ButtonStyle.Danger);
        const row1 = new ActionRowBuilder().addComponents(cook, nah);

        cursed = parseInt(
          (await database.get(interaction.user.id + "curse")) ?? "0"
        );

        let player1squadarray = await getsquad(interaction.user.id);

        let player2squadarray = await makesquad(
          player1squadarray,
          50 + 50 * cursed,
          cursed == 1
        );

        if (player2squadarray == "error") {
          await interaction.editReply({
            content: "🤒 Something went wrong with picking DojoBot's Squad.",
            flags: MessageFlags.Ephemeral,
          });
        } else {
          await database.set(
            interaction.user.id + "battlepending",
            60 + Math.floor(Date.now() / 1000)
          );
          let player1squadtext = "";
          for (let i = 7; i > -1; i--) {
            player1squadtext += `${emojis[player1squadarray[i]].emoji} `;
          }
          let player2squadtext = "";
          for (let i = 0; i < 8; i++) {
            player2squadtext += `${emojis[player2squadarray[i]].emoji} `;
          }

          let gamedata = {
            squads: [[], []],
            emojitext: "",
            richtext: [],
            turn: 0,
            player: [interaction.user.globalName, "DojoBot"],
            playerturn: 1,
            newlines: 0,
            logfile: `${interaction.user.id} (${interaction.user.username}) vs Dojobot\n\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\nTurn 1`,
          };
          for (let i = 0; i < 8; i++) {
            gamedata.squads[0].push(
              lodash.cloneDeep(emojis[player1squadarray[i]])
            );
          }
          for (let i = 0; i < 8; i++) {
            gamedata.squads[1].push(
              lodash.cloneDeep(emojis[player2squadarray[i]])
            );
          }

          gamedata.playerturn = Math.floor(Math.random() * 2) + 1;

          const response = await interaction.editReply({
            components: [row1],
            content: `\`@DojoBot\`, <@${
              interaction.user.id
            }> wants to battle with you!${
              cursed == 1 ? " 👺" : ""
            }\n\n\`${interaction.user.globalName.replace(
              /`/g,
              ""
            )}'s\` ${player1squadtext}  \`🆚\`  ${player2squadtext} \`DojoBot's\` \`\`\` \`\`\``,
          });
          await dailyrewardremind(interaction);

          const collectorFilter = (i) => i.user.id === interaction.user.id;

          try {
            const interaction2 = await response.awaitMessageComponent({
              filter: collectorFilter,
              time: 60000,
            });
            if (interaction2.customId === "battle") {
              await database.set(
                interaction.user.id + "battlepending",
                300 + Math.floor(Date.now() / 1000)
              );
              let logs = await getlogs();
              logs.logs.games.botstarted += 1;
              logs.logs.games.started += 1;
              logs.logs.players[`user${interaction.user.id}`].botstarted =
                logs.logs.players[`user${interaction.user.id}`].botstarted ?? 0;
              logs.logs.players[`user${interaction.user.id}`].botstarted += 1;
              logs.logs.players[`user${interaction.user.id}`].started =
                logs.logs.players[`user${interaction.user.id}`].started ?? 0;
              logs.logs.players[`user${interaction.user.id}`].started += 1;
              await writelogs(logs);
              await interaction2.reply(
                `<@${interaction.user.id}> vs \`@DojoBot\`\nLet the battle begin!\n`
              );
              function delay(time) {
                return new Promise((resolve) => setTimeout(resolve, time));
              }
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
                  let richtextsnippet = "";
                  let numberhidden = gamedata.richtext.length;
                  if (gamedata.richtext.length > 4) {
                    let toadd = gamedata.richtext[gamedata.richtext.length - 5];
                    if (gamedata.newlines < 5) {
                      toadd = toadd.replace(/\n/g, "\n-# ");
                    }
                    richtextsnippet += toadd;
                    numberhidden--;
                  }
                  if (gamedata.richtext.length > 3) {
                    let toadd = gamedata.richtext[gamedata.richtext.length - 4];
                    if (gamedata.newlines < 4) {
                      toadd = toadd.replace(/\n/g, "\n-# ");
                    }
                    richtextsnippet += toadd;
                    numberhidden--;
                  }
                  if (gamedata.richtext.length > 2) {
                    let toadd = gamedata.richtext[gamedata.richtext.length - 3];
                    if (gamedata.newlines < 3) {
                      toadd = toadd.replace(/\n/g, "\n-# ");
                    }
                    richtextsnippet += toadd;
                    numberhidden--;
                  }
                  if (gamedata.richtext.length > 1) {
                    let toadd = gamedata.richtext[gamedata.richtext.length - 2];
                    if (gamedata.newlines < 2) {
                      toadd = toadd.replace(/\n/g, "\n-# ");
                    }
                    richtextsnippet += toadd;
                    numberhidden--;
                  }
                  richtextsnippet +=
                    gamedata.richtext[gamedata.richtext.length - 1];
                  numberhidden--;
                  richtextsnippet += " 🔼";
                  let richnumberhidden = "";
                  if (numberhidden == 1) {
                    richnumberhidden = "-# 1 line hidden";
                  } else if (numberhidden > 0) {
                    richnumberhidden = "-# " + numberhidden + " lines hidden";
                  }
                  await interaction2.editReply(
                    `<@${interaction.user.id}> vs \`@DojoBot\`\nLet the battle begin! 🔃 Turn ${gamedata.turn}\n` +
                      gamedata.emojitext +
                      "\n\n" +
                      richnumberhidden +
                      richtextsnippet
                  );
                  await delay(battlespeed * 1000);
                }
              } catch (e) {
                console.error(e);
                const txt = Buffer.from(gamedata.logfile);
                await interaction2.editReply({
                  content:
                    `<@${interaction.user.id}> vs \`@DojoBot\`\nLet the battle begin! 🔃 Turn ${gamedata.turn}\n` +
                    gamedata.emojitext +
                    "\n\n" +
                    "🤒 An error has occurred and the Battle cannot continue.```" +
                    e +
                    "```",
                  files: [
                    {
                      attachment: txt,
                      name: `${interaction.user.username} vs Dojobot [error].txt`,
                    },
                  ],
                });
              }
              await database.set(interaction.user.id + "battlepending", "0");
              battleover = true;
              const txt = Buffer.from(gamedata.logfile);
              let int3;
              const exportbutton = new ButtonBuilder()
                .setCustomId("export")
                .setLabel("Download Battle Log")
                .setEmoji("📤")
                .setStyle(ButtonStyle.Primary);
              const row2 = new ActionRowBuilder().addComponents(exportbutton);
              if (
                gamedata.turn >= 200 ||
                (gamedata.squads[0].length == 0 &&
                  gamedata.squads[1].length == 0)
              ) {
                int3 = await interaction2.followUp({
                  components: [row2],
                  content: `🏳️ The match ended in a draw...`,
                });
                let logs = await getlogs();
                logs.logs.games.botdraws += 1;
                logs.logs.players[`user${interaction.user.id}`].botdraws =
                  logs.logs.players[`user${interaction.user.id}`].botdraws ?? 0;
                logs.logs.players[`user${interaction.user.id}`].botdraws += 1;
                for (let i = 7; i > -1; i--) {
                  logs.logs.emojis[player2squadarray[i]].botdraws =
                    logs.logs.emojis[player2squadarray[i]].botdraws ?? 0;
                  logs.logs.emojis[player2squadarray[i]].botdraws += 1;
                }
                for (let i = 7; i > -1; i--) {
                  logs.logs.emojis[player1squadarray[i]].botdraws =
                    logs.logs.emojis[player1squadarray[i]].botdraws ?? 0;
                  logs.logs.emojis[player1squadarray[i]].botdraws += 1;
                }
                await writelogs(logs);
              } else {
                if (gamedata.squads[1].length == 0) {
                  let diff1 = gamedata.squads[0].length * 20;
                  coinsdata = await coinschange(interaction.user.id, diff1);
                  diff1 = coinsdata[0];
                  doublerbonus = coinsdata[1];
                  let bonusmsg =
                    doublerbonus > 0 ? ` (💫 ${doublerbonus})` : "";
                  let restocktime = await database.get(
                    interaction.user.id + "coinrestock"
                  );
                  let nocoinsmsg =
                    diff1 > 0
                      ? ""
                      : `\n-# 💡 Your Coin Modifier is exhausted! You won't be earning any more coins until <t:${restocktime}:t>.`;
                  int3 = await interaction2.followUp({
                    components: [row2],
                    content: `<@${interaction.user.id}> is the winner! +${diff1} 🪙${bonusmsg}${nocoinsmsg}`,
                  });
                  let logs = await getlogs();
                  logs.logs.games.botlosses += 1;
                  logs.logs.players[`user${interaction.user.id}`].botwins =
                    logs.logs.players[`user${interaction.user.id}`].botwins ??
                    0;
                  logs.logs.players[`user${interaction.user.id}`].botwins += 1;
                  for (let i = 7; i > -1; i--) {
                    logs.logs.emojis[player1squadarray[i]].botwins =
                      logs.logs.emojis[player1squadarray[i]].botwins ?? 0;
                    logs.logs.emojis[player1squadarray[i]].botwins += 1;
                  }
                  for (let i = 7; i > -1; i--) {
                    logs.logs.emojis[player2squadarray[i]].botlosses =
                      logs.logs.emojis[player2squadarray[i]].botlosses ?? 0;
                    logs.logs.emojis[player2squadarray[i]].botlosses += 1;
                  }
                  await writelogs(logs);
                }
                if (gamedata.squads[0].length == 0) {
                  int3 = await interaction2.followUp({
                    components: [row2],
                    content: `\`@DojoBot\` is the winner! ||<@${interaction.user.id}>||`,
                  });
                  let logs = await getlogs();
                  logs.logs.games.botwins += 1;
                  logs.logs.players[`user${interaction.user.id}`].botlosses =
                    logs.logs.players[`user${interaction.user.id}`].botlosses ??
                    0;
                  logs.logs.players[
                    `user${interaction.user.id}`
                  ].botlosses += 1;
                  for (let i = 7; i > -1; i--) {
                    logs.logs.emojis[player2squadarray[i]].botwins =
                      logs.logs.emojis[player2squadarray[i]].botwins ?? 0;
                    logs.logs.emojis[player2squadarray[i]].botwins += 1;
                  }
                  for (let i = 7; i > -1; i--) {
                    logs.logs.emojis[player1squadarray[i]].botlosses =
                      logs.logs.emojis[player1squadarray[i]].botlosses ?? 0;
                    logs.logs.emojis[player1squadarray[i]].botlosses += 1;
                  }
                  await writelogs(logs);
                }
              }
              let collector = int3.createMessageComponentCollector({
                time: 1200000,
              });
              collector.on("collect", async (interaction3) => {
                try {
                  interaction3.reply({
                    flags: "Ephemeral",
                    files: [
                      {
                        attachment: txt,
                        name: `${interaction.user.username} vs Dojobot.txt`,
                      },
                    ],
                  });
                  let logs = await getlogs();
                  logs.logs.games.botlogsrequested += 1;
                  logs.logs.players[
                    `user${interaction3.user.id}`
                  ].botlogsrequested =
                    logs.logs.players[`user${interaction3.user.id}`]
                      .botlogsrequested ?? 0;
                  logs.logs.players[
                    `user${interaction3.user.id}`
                  ].botlogsrequested += 1;
                  await writelogs(logs);
                } catch (e) {
                  exportbutton.setDisabled(true);
                  interaction3.editReply({ components: [row2] });
                }
              });
            } else {
              if (!battleover) {
                await database.set(
                  interaction.user.id + "botbattlecooldown",
                  600 + Math.floor(Date.now() / 1000)
                );
              }
              await interaction.editReply({
                components: [],
                content: `\`@DojoBot\`, <@${
                  interaction.user.id
                }> wants to battle with you!\n\n\`${interaction.user.globalName.replace(
                  /`/g,
                  ""
                )}\` ${player1squadtext}  \`🆚\`  ${player2squadtext} \`DojoBot's\`\nYou turned down DojoBot's Squad. You can battle DojoBot again in 10 minutes.`,
              });
            }
          } catch (e) {
            console.error(e);
            if (!battleover) {
              await database.set(interaction.user.id + "battlepending", "0");
              await database.set(
                interaction.user.id + "botbattlecooldown",
                600 + Math.floor(Date.now() / 1000)
              );
            }
            await interaction.editReply({
              components: [],
              content: `\`@DojoBot\`, <@${
                interaction.user.id
              }> wants to battle with you!\n\n\`${interaction.user.globalName.replace(
                /`/g,
                ""
              )}\` ${player1squadtext}  \`🆚\`  ${player2squadtext} \`DojoBot's\``,
            });
          }
        }
      } else {
        await interaction.editReply({
          content: `You cannot battle DojoBot right now! Come back <t:${Math.max(
            bp,
            bbcd
          )}:R>.`,
          flags: "Ephemeral",
        });
      }
    }
  },
};
