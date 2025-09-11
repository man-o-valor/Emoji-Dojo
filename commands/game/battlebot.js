const {
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  MessageFlags,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
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
  newcoincurve,
  coinscheck,
} = require("../../functions.js");
const lodash = require("lodash");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("battlebot")
    .setDescription(
      "Battle DojoBot, with no chance of losing coins (You can reject Dojobot every 10 minutes)"
    )
    .addNumberOption((option) =>
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
      let battlespeed =
        parseFloat(interaction.options.getNumber("speed") ?? "4") ?? 4;
      if (isNaN(battlespeed)) battlespeed = 0;
      const bp =
        (await database.get(interaction.user.id + "battlepending")) ?? "0";
      const bbcd =
        (await database.get(interaction.user.id + "botbattlecooldown")) ?? "0";
      if (bp < Date.now() / 1000 && bbcd < Date.now() / 1000 && bp !== true) {
        await interaction.deferReply();
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

        let rerolltime =
          (await database.get(interaction.user.id + "botreroll")) ?? "0";

        let cook = new ButtonBuilder()
          .setCustomId("battle")
          .setLabel("Battle!")
          .setEmoji("🆚")
          .setStyle(ButtonStyle.Success);
        let nah = new ButtonBuilder()
          .setCustomId("nah")
          .setLabel("Reroll")
          .setEmoji("🍀")
          .setStyle(ButtonStyle.Secondary);
        if (rerolltime > Date.now() / 1000) {
          nah.setDisabled(true);
          nah.setLabel(
            "Reroll (wait " +
              Math.ceil((rerolltime - Date.now() / 1000) / 60) +
              " min)"
          );
        }
        const row1 = new ActionRowBuilder().addComponents(cook, nah);

        cursed = 0; /*parseInt(
          (await database.get(interaction.user.id + "curse")) ?? "0"
        );*/

        let player1squadarray = await getsquad(interaction.user.id);
        let player2squadarray;

        let dojobotsquad =
          (await database.get(interaction.user.id + "dojobotsquad")) ?? "";
        if (dojobotsquad == "") {
          player2squadarray = await makesquad(
            player1squadarray,
            Math.max(Math.min(logs.logs.games.botwins, 50), 1) * (1 + cursed),
            cursed == 1
          );
          await database.set(
            interaction.user.id + "dojobotsquad",
            player2squadarray
          );
        } else {
          player2squadarray = dojobotsquad;
        }

        if (player2squadarray == "error") {
          await interaction.editReply({
            content: "🤒 Something went wrong with picking DojoBot's Squad.",
            flags: MessageFlags.Ephemeral,
          });
        } else {
          await database.set(
            interaction.user.id + "battlepending",
            20 + Math.floor(Date.now() / 1000)
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

          let challengecontainer = new ContainerBuilder()
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(
                `### \`@DojoBot\`, <@${
                  interaction.user.id
                }> wants to battle with you!${
                  cursed == 1 ? " 👺" : ""
                } • Speed: ${battlespeed}`
              )
            )
            .addSeparatorComponents(
              new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Large)
                .setDivider(true)
            )
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(
                `\`${interaction.user.globalName.replace(
                  /`/g,
                  ""
                )}\` ${player1squadtext}  \`🆚\`  ${player2squadtext} \`DojoBot\``
              )
            )
            .addSeparatorComponents(
              new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Large)
                .setDivider(true)
            )
            .addActionRowComponents(row1);

          const response = await interaction.editReply({
            components: [challengecontainer],
            flags: MessageFlags.IsComponentsV2,
            fetchReply: true,
          });
          await dailyrewardremind(interaction);

          const collectorFilter = (i) =>
            i.user.id == interaction.user.id &&
            (i.customId == "battle" || i.customId == "nah");
          let collector = response.createMessageComponentCollector({
            filter: collectorFilter,
            time: 120000,
          });
          try {
            collector.on("collect", async (interaction2) => {
              let bp2 = await database.get(
                interaction.user.id + "battlepending"
              );
              if (bp2 !== true) {
                if (interaction2.customId === "battle") {
                  await database.set(
                    interaction.user.id + "battlepending",
                    true,
                    300000
                  );
                  await database.set(interaction.user.id + "dojobotsquad", "");
                  cook.setDisabled(true);
                  nah.setDisabled(true);
                  interaction.editReply({
                    components: [challengecontainer],
                    flags: MessageFlags.IsComponentsV2,
                  });
                  let logs = await getlogs();
                  logs.logs.games.botstarted += 1;
                  logs.logs.games.started += 1;
                  logs.logs.players[`user${interaction.user.id}`].botstarted =
                    logs.logs.players[`user${interaction.user.id}`]
                      .botstarted ?? 0;
                  logs.logs.players[
                    `user${interaction.user.id}`
                  ].botstarted += 1;
                  logs.logs.players[`user${interaction.user.id}`].started =
                    logs.logs.players[`user${interaction.user.id}`].started ??
                    0;
                  logs.logs.players[`user${interaction.user.id}`].started += 1;
                  await writelogs(logs);
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
                        let toadd =
                          gamedata.richtext[gamedata.richtext.length - 5];
                        if (gamedata.newlines < 5) {
                          toadd = toadd.replace(/\n/g, "\n-# ");
                        }
                        richtextsnippet += toadd;
                        numberhidden--;
                      }
                      if (gamedata.richtext.length > 3) {
                        let toadd =
                          gamedata.richtext[gamedata.richtext.length - 4];
                        if (gamedata.newlines < 4) {
                          toadd = toadd.replace(/\n/g, "\n-# ");
                        }
                        richtextsnippet += toadd;
                        numberhidden--;
                      }
                      if (gamedata.richtext.length > 2) {
                        let toadd =
                          gamedata.richtext[gamedata.richtext.length - 3];
                        if (gamedata.newlines < 3) {
                          toadd = toadd.replace(/\n/g, "\n-# ");
                        }
                        richtextsnippet += toadd;
                        numberhidden--;
                      }
                      if (gamedata.richtext.length > 1) {
                        let toadd =
                          gamedata.richtext[gamedata.richtext.length - 2];
                        if (gamedata.newlines < 2) {
                          toadd = toadd.replace(/\n/g, "\n-# ");
                        }
                        richtextsnippet += toadd;
                        numberhidden--;
                      }
                      richtextsnippet +=
                        gamedata.richtext[gamedata.richtext.length - 1];
                      numberhidden--;
                      richtextsnippet += " ⇡";
                      let richnumberhidden = "";
                      if (numberhidden == 1) {
                        richnumberhidden = "-# 1 line hidden";
                      } else if (numberhidden > 0) {
                        richnumberhidden =
                          "-# " + numberhidden + " lines hidden";
                      }
                      const battlecomponents = [
                        new ContainerBuilder()
                          .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(
                              `<@${interaction.user.id}> vs \`@DojoBot\` • Turn ${gamedata.turn}`
                            )
                          )
                          .addSeparatorComponents(
                            new SeparatorBuilder()
                              .setSpacing(SeparatorSpacingSize.Small)
                              .setDivider(true)
                          )
                          .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(
                              gamedata.emojitext
                            )
                          ),
                        new ContainerBuilder().addTextDisplayComponents(
                          new TextDisplayBuilder().setContent(
                            richnumberhidden + richtextsnippet
                          )
                        ),
                      ];
                      if (gamedata.turn > 1) {
                        await interaction2.editReply({
                          components: battlecomponents,
                          flags: MessageFlags.IsComponentsV2,
                        });
                      } else {
                        await interaction2.reply({
                          components: battlecomponents,
                          flags: MessageFlags.IsComponentsV2,
                        });
                      }
                      await delay(battlespeed * 1000);
                    }
                  } catch (e) {
                    console.error(e);
                    const txt = Buffer.from(gamedata.logfile);
                    const battlecomponents = [
                      new ContainerBuilder()
                        .addTextDisplayComponents(
                          new TextDisplayBuilder().setContent(
                            `<@${interaction.user.id}> vs \`@DojoBot\` • Turn ${gamedata.turn}`
                          )
                        )
                        .addSeparatorComponents(
                          new SeparatorBuilder()
                            .setSpacing(SeparatorSpacingSize.Small)
                            .setDivider(true)
                        )
                        .addTextDisplayComponents(
                          new TextDisplayBuilder().setContent(
                            gamedata.emojitext
                          )
                        ),
                      new ContainerBuilder().addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(
                          "🤒 An error has occurred and the Battle cannot continue.```" +
                            e +
                            "```"
                        )
                      ),
                    ];
                    await interaction2.editReply({
                      components: battlecomponents,
                      flags: MessageFlags.IsComponentsV2,
                    });
                    await interaction2.followUp({
                      files: [
                        {
                          attachment: txt,
                          name: `${interaction.user.username} vs Dojobot [error].txt`,
                        },
                      ],
                    });
                  }
                  await database.set(
                    interaction.user.id + "battlepending",
                    "0"
                  );
                  battleover = true;
                  const txt = Buffer.from(gamedata.logfile);
                  let int3;
                  const exportbutton = new ButtonBuilder()
                    .setCustomId("export")
                    .setLabel("Download Battle Log")
                    .setEmoji("📤")
                    .setStyle(ButtonStyle.Primary);
                  const row2 = new ActionRowBuilder().addComponents(
                    exportbutton
                  );
                  let battleendcontainer;
                  if (
                    gamedata.turn >= 200 ||
                    (gamedata.squads[0].length == 0 &&
                      gamedata.squads[1].length == 0)
                  ) {
                    battleendcontainer = new ContainerBuilder()
                      .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(
                          `🏳️ The match ended in a draw... ||<@${interaction.user.id}>||`
                        )
                      )
                      .addSeparatorComponents(
                        new SeparatorBuilder()
                          .setSpacing(SeparatorSpacingSize.Small)
                          .setDivider(true)
                      )
                      .addActionRowComponents(row2);
                    let logs = await getlogs();
                    logs.logs.games.botdraws += 1;
                    logs.logs.players[`user${interaction.user.id}`].botdraws =
                      logs.logs.players[`user${interaction.user.id}`]
                        .botdraws ?? 0;
                    logs.logs.players[
                      `user${interaction.user.id}`
                    ].botdraws += 1;
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
                      let mult = parseInt(
                        await database.get(interaction.user.id + "coinmod")
                      );
                      await coinscheck(interaction.user.id);
                      let diff1 = newcoincurve(gamedata.squads[0].length, mult);
                      coinsdata = await coinschange(
                        interaction.user.id,
                        diff1,
                        true
                      );
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
                          : `\n-# 💡 You won't be earning any more coins until <t:${restocktime}:t>.`;
                      battleendcontainer = new ContainerBuilder()
                        .addTextDisplayComponents(
                          new TextDisplayBuilder().setContent(
                            `<@${interaction.user.id}> is the winner! +${diff1} 🪙${bonusmsg}${nocoinsmsg}`
                          )
                        )
                        .addSeparatorComponents(
                          new SeparatorBuilder()
                            .setSpacing(SeparatorSpacingSize.Small)
                            .setDivider(true)
                        )
                        .addActionRowComponents(row2);
                      let logs = await getlogs();
                      logs.logs.games.botlosses += 1;
                      logs.logs.players[`user${interaction.user.id}`].botwins =
                        logs.logs.players[`user${interaction.user.id}`]
                          .botwins ?? 0;
                      logs.logs.players[
                        `user${interaction.user.id}`
                      ].botwins += 1;
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
                      await coinschange(interaction.user.id, 0);
                      battleendcontainer = new ContainerBuilder()
                        .addTextDisplayComponents(
                          new TextDisplayBuilder().setContent(
                            `\`@DojoBot\` is the winner! ||<@${interaction.user.id}>||`
                          )
                        )
                        .addSeparatorComponents(
                          new SeparatorBuilder()
                            .setSpacing(SeparatorSpacingSize.Small)
                            .setDivider(true)
                        )
                        .addActionRowComponents(row2);
                      let logs = await getlogs();
                      logs.logs.games.botwins += 1;
                      logs.logs.players[
                        `user${interaction.user.id}`
                      ].botlosses =
                        logs.logs.players[`user${interaction.user.id}`]
                          .botlosses ?? 0;
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
                  int3 = await interaction2.followUp({
                    components: [battleendcontainer],
                    flags: MessageFlags.IsComponentsV2,
                  });
                  let collector = int3.createMessageComponentCollector({
                    time: 600000,
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
                  // reroll
                  nah.setDisabled(true);
                  nah.setLabel("Reroll (wait 20 min)");
                  player2squadarray = await makesquad(
                    player1squadarray,
                    Math.max(Math.min(logs.logs.games.botwins, 50), 1) *
                      (1 + cursed),
                    cursed == 1
                  );
                  await database.set(
                    interaction.user.id + "dojobotsquad",
                    player2squadarray
                  );
                  await database.set(
                    interaction.user.id + "botreroll",
                    20 * 60 + Math.floor(Date.now() / 1000)
                  );
                  player1squadtext = "";
                  for (let i = 7; i > -1; i--) {
                    player1squadtext += `${
                      emojis[player1squadarray[i]].emoji
                    } `;
                  }
                  player2squadtext = "";
                  for (let i = 0; i < 8; i++) {
                    player2squadtext += `${
                      emojis[player2squadarray[i]].emoji
                    } `;
                  }

                  gamedata = {
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

                  challengecontainer = new ContainerBuilder()
                    .addTextDisplayComponents(
                      new TextDisplayBuilder().setContent(
                        `### \`@DojoBot\`, <@${
                          interaction.user.id
                        }> wants to battle with you!${
                          cursed == 1 ? " 👺" : ""
                        } • Speed: ${battlespeed}`
                      )
                    )
                    .addSeparatorComponents(
                      new SeparatorBuilder()
                        .setSpacing(SeparatorSpacingSize.Large)
                        .setDivider(true)
                    )
                    .addTextDisplayComponents(
                      new TextDisplayBuilder().setContent(
                        `\`${interaction.user.globalName.replace(
                          /`/g,
                          ""
                        )}\` ${player1squadtext}  \`🆚\`  ${player2squadtext} \`DojoBot\``
                      )
                    )
                    .addSeparatorComponents(
                      new SeparatorBuilder()
                        .setSpacing(SeparatorSpacingSize.Large)
                        .setDivider(true)
                    )
                    .addActionRowComponents(row1);
                  await interaction2.update({
                    components: [challengecontainer],
                    flags: MessageFlags.IsComponentsV2,
                  });
                }
              } else {
                await interaction2.reply({
                  content: `You have a Dojobot battle going on already!`,
                  flags: "Ephemeral",
                });
              }
            });
          } catch (e) {
            console.error(e);
            cook.setDisabled(true);
            nah.setDisabled(true);
            await interaction.editReply({
              components: [challengecontainer],
              flags: MessageFlags.IsComponentsV2,
            });
          }
        }
      } else {
        if (bp == true) {
          await interaction.reply({
            content: `You have a Dojobot battle going on already!`,
            flags: "Ephemeral",
          });
        } else {
          await interaction.reply({
            content: `You cannot battle DojoBot right now! Come back <t:${Math.max(
              bp,
              bbcd
            )}:R>.`,
            flags: "Ephemeral",
          });
        }
      }
    }
  },
};
