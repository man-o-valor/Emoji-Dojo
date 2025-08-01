const {
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const { emojis } = require("../../data.js");
const {
  playturn,
  getlogs,
  writelogs,
  dailyrewardremind,
  getsquad,
  database,
} = require("../../functions.js");
const lodash = require("lodash");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("battlecustom")
    .setDescription("Set up a custom battle between any two Squads")
    .addStringOption((option) =>
      option
        .setName("squad1")
        .setDescription("@me, @[saved squad #], or a sequence of 8 emojis")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("squad2")
        .setDescription("@me, @[saved squad #], or a sequence of 8 emojis")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("speed")
        .setDescription("The time in seconds between each turn (defaults to 4)")
    ),
  async execute(interaction) {
    let battlespeed = parseFloat(interaction.options.getString("speed") ?? "4");
    let squad1input = interaction.options.getString("squad1");
    let squad2input = interaction.options.getString("squad2");
    if (battlespeed < 0) {
      battlespeed = 0;
    }

    let logs = await getlogs();
    logs.logs.games.customopened += 1;
    logs.logs.games.opened += 1;
    logs.logs.players[`user${interaction.user.id}`] =
      logs.logs.players[`user${interaction.user.id}`] ?? {};
    logs.logs.players[`user${interaction.user.id}`].customopened =
      logs.logs.players[`user${interaction.user.id}`].customopened ?? 0;
    logs.logs.players[`user${interaction.user.id}`].customopened += 1;
    logs.logs.players[`user${interaction.user.id}`].opened =
      logs.logs.players[`user${interaction.user.id}`].opened ?? 0;
    logs.logs.players[`user${interaction.user.id}`].opened += 1;
    await writelogs(logs);
    const cook = new ButtonBuilder()
      .setCustomId("battle")
      .setLabel("Battle!")
      .setEmoji("🆚")
      .setStyle(ButtonStyle.Success);
    const row1 = new ActionRowBuilder().addComponents(cook);

    let player1squadarray;
    if (squad1input.includes("@me")) {
      player1squadarray = await getsquad(interaction.user.id);
    } else if (squad1input.match(/@(\d+)/)) {
      let squadget =
        (await database.get(
          interaction.user.id + "savedsquad" + squad1input.match(/@(\d+)/)[1]
        )) ?? "";
      if (squadget != "") {
        player1squadarray = squadget.split(",").slice(0, 8);
      } else {
        player1squadarray = [undefined];
      }
    } else {
      const segmenter1 = new Intl.Segmenter("en", {
        granularity: "grapheme",
      });
      let input1 = squad1input.replace(/\s+/g, "");
      player1squadarray = [...segmenter1.segment(input1)];
      player1squadarray = player1squadarray
        .filter((item) => item != "")
        .map((obj) => obj.segment);
      for (let i = 0; i < 8; i++) {
        let objectalternative = emojis.find(
          (x) => x.emoji == player1squadarray[i]
        );
        player1squadarray[i] = (objectalternative ?? { id: undefined }).id;
      }
      player1squadarray.reverse();
    }

    let player2squadarray;
    if (squad2input.includes("@me")) {
      player2squadarray = await getsquad(interaction.user.id);
    } else if (squad2input.match(/@(\d+)/)) {
      let squadget =
        (await database.get(
          interaction.user.id + "savedsquad" + squad2input.match(/@(\d+)/)[1]
        )) ?? "";
      if (squadget != "") {
        player2squadarray = squadget.split(",").slice(0, 8);
      } else {
        player2squadarray = [undefined];
      }
    } else {
      const segmenter2 = new Intl.Segmenter("en", {
        granularity: "grapheme",
      });
      let input2 = squad2input.replace(/\s+/g, "");
      player2squadarray = [...segmenter2.segment(input2)];
      player2squadarray = player2squadarray
        .filter((item) => item != "")
        .map((obj) => obj.segment);
      for (let i = 0; i < 8; i++) {
        let objectalternative = emojis.find(
          (x) => x.emoji == player2squadarray[i]
        );
        player2squadarray[i] = (objectalternative ?? { id: undefined }).id;
      }
      player2squadarray.reverse();
    }

    if (
      player1squadarray.includes(undefined) ||
      player2squadarray.includes(undefined)
    ) {
      await interaction.reply({
        flags: "Ephemeral",
        content: `One of the Squads you entered doesn't seem valid. Make sure they're both sequences of 8 emojis that exist in Emoji Dojo.`,
      });
    } else {
      await interaction.deferReply();
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
        player: ["Squad 1", "Squad 2"],
        playerturn: 1,
        newlines: 0,
        logfile: `Custom Squad vs Custom Squad\n\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\nTurn 1`,
      };
      for (let i = 0; i < 8; i++) {
        gamedata.squads[0].push(lodash.cloneDeep(emojis[player1squadarray[i]]));
      }
      for (let i = 0; i < 8; i++) {
        gamedata.squads[1].push(lodash.cloneDeep(emojis[player2squadarray[i]]));
      }

      gamedata.playerturn = Math.floor(Math.random() * 2) + 1;

      const response = await interaction.editReply({
        components: [row1],
        content: `\`Squad 1\` ${player1squadtext}  \`🆚\`  ${player2squadtext} \`Squad 2\` \`\`\` \`\`\``,
      });
      await dailyrewardremind(interaction);

      const collectorFilter = (i) => i.user.id === interaction.user.id;

      try {
        const interaction2 = await response.awaitMessageComponent({
          filter: collectorFilter,
          time: 60000,
        });
        if (interaction2.customId === "battle") {
          let logs = await getlogs();
          logs.logs.games.customstarted += 1;
          logs.logs.games.started += 1;
          logs.logs.players[`user${interaction.user.id}`].customstarted =
            logs.logs.players[`user${interaction.user.id}`].customstarted ?? 0;
          logs.logs.players[`user${interaction.user.id}`].customstarted += 1;
          logs.logs.players[`user${interaction.user.id}`].started =
            logs.logs.players[`user${interaction.user.id}`].started ?? 0;
          logs.logs.players[`user${interaction.user.id}`].started += 1;
          await writelogs(logs);
          await interaction2.reply(
            `\`Custom Battle\`\nLet the battle begin!\n`
          );
          function delay(time) {
            return new Promise((resolve) => setTimeout(resolve, time));
          }
          let prevturn = lodash.cloneDeep(gamedata.squads);
          try {
            while (
              gamedata.turn < 200 &&
              gamedata.squads[0][0] != undefined &&
              gamedata.squads[1][0] != undefined
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
                `\`Custom Battle\`\nLet the battle begin! 🔃 Turn ${gamedata.turn}\n` +
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
                `\`Custom Battle\`\nLet the battle begin! 🔃 Turn ${gamedata.turn}\n` +
                gamedata.emojitext +
                "\n\n" +
                "🤒 An error has occurred and the Battle cannot continue.```" +
                e +
                "```",
              files: [
                {
                  attachment: txt,
                  name: `Custom Battle [error].txt`,
                },
              ],
            });
          }
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
            (gamedata.squads[0].length == 0 && gamedata.squads[1].length == 0)
          ) {
            int3 = await interaction2.followUp({
              components: [row2],
              content: `🏳️ The match ended in a draw... ||<@${interaction.user.id}>||`,
            });
            let logs = await getlogs();
            logs.logs.games.customdraws += 1;
            await writelogs(logs);
          } else {
            if (gamedata.squads[1].length == 0) {
              int3 = await interaction2.followUp({
                components: [row2],
                content: `\`Squad 1\` is the winner! ||<@${interaction.user.id}>||`,
              });
            }
            if (gamedata.squads[0].length == 0) {
              int3 = await interaction2.followUp({
                components: [row2],
                content: `\`Squad 2\` is the winner! ||<@${interaction.user.id}>||`,
              });
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
                    name: `Custom Battle.txt`,
                  },
                ],
              });
              let logs = await getlogs();
              logs.logs.games.customlogsrequested += 1;
              logs.logs.players[
                `user${interaction3.user.id}`
              ].customlogsrequested =
                logs.logs.players[`user${interaction3.user.id}`]
                  .customlogsrequested ?? 0;
              logs.logs.players[
                `user${interaction3.user.id}`
              ].customlogsrequested += 1;
              await writelogs(logs);
            } catch (e) {
              exportbutton.setDisabled(true);
              interaction3.editReply({ components: [row2] });
            }
          });
        }
      } catch (e) {
        console.error(e);
        await interaction.editReply({
          components: [],
        });
      }
    }
  },
};
