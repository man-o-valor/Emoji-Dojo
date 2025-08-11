const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const {
  raritycolors,
  emojis,
  raritysymbols,
  raritynames,
  classes,
  devotionhelp,
} = require("../../data.js");
const {
  database,
  getvault,
  trysetupuser,
  getsquad,
  devoteemojis,
  fetchresearch,
  getlogs,
  writelogs,
  dailyrewardremind,
  adminpanel
} = require("../../functions.js");
const fs = require("fs");
const { closestMatch } = require("closest-match");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("dojo")
    .setDescription("View your Dojo of Emojis")
    .addStringOption((option) =>
      option
        .setName("emoji")
        .setDescription("The Emoji to view details of (optional)")
    ),
  async execute(interaction) {
    const viewemoji = interaction.options.getString("emoji");
    if ((viewemoji ?? "").startsWith("%dev")) {
      if (
        interaction.user.id == "1013096732147597412" ||
        interaction.user.id == "1146557659349270639"
      ) {
        await adminpanel(interaction, viewemoji);
      } else {
        await interaction.reply({
          flags: "Ephemeral",
          content: `🤓 you're not the admin silly`,
        });
      }
    } else {
      if (await trysetupuser(interaction.user)) {
        await interaction.reply({
          flags: "Ephemeral",
          content: `Greetings, <@${interaction.user.id}>! Check your DMs before you continue.`,
        });
      } else {
        let vaultarray = await getvault(interaction.user.id);
        if (viewemoji) {
          let closeviewemoji = viewemoji;

          const allnames = [];
          for (let i = 0; i < emojis.length; i++) {
            allnames.push(...emojis[i].names.map((name) => name.toLowerCase()));
            allnames.push(emojis[i].emoji);
          }

          closeviewemoji = closestMatch(viewemoji, allnames);

          let redirecttext = "";
          if (viewemoji != closeviewemoji) {
            redirecttext = `-# redirected from "${viewemoji}"`;
          }

          const emojifound = emojis.find(
            (x) =>
              x.names.find(
                (y) =>
                  y.replace(/\s+/g, "_").toLowerCase() ==
                  closeviewemoji.trim().replace(/\s+/g, "_").toLowerCase()
              ) || x.emoji == closeviewemoji.replace(/\s+/g, "")
          );
          const viewemojiid = vaultarray.find(
            (x) => emojis[x]?.id == emojifound?.id
          );

          const vaultembed = new EmbedBuilder()
            .setColor(raritycolors[emojifound.rarity] ?? 0xffffff)
            .setTitle(`${emojifound.emoji} ${emojifound.names[0]}`)
            .setDescription(
              `❤️ Health: **${
                emojifound.hp ?? "N/A"
              }**\n<:attackpower:1327657903447998477> Attack Power: **${
                emojifound.dmg ?? "N/A"
              }**\n${raritysymbols[emojifound.rarity] ?? "⬜"} Rarity: **${
                raritynames[emojifound.rarity] ?? "N/A"
              }**\n${
                emojifound.class != undefined
                  ? classes[emojifound.class].emoji ?? "🟣"
                  : "🟣"
              } Class: **${
                emojifound.class != undefined
                  ? classes[emojifound.class].name ?? "Unknown"
                  : "None"
              }**\nAbility:\n> ${emojifound.description}`
            )
            .setTimestamp()
            .setFooter({
              text: `You have ${vaultarray.reduce(
                (acc, curr) => (curr === viewemojiid ? acc + 1 : acc),
                0
              )}`,
            });
          const addto1 = new ButtonBuilder()
            .setCustomId("addto1")
            .setLabel("Equip")
            .setEmoji("1️⃣")
            .setStyle(ButtonStyle.Secondary);
          const addto2 = new ButtonBuilder()
            .setCustomId("addto2")
            .setLabel("Equip")
            .setEmoji("2️⃣")
            .setStyle(ButtonStyle.Secondary);
          const addto3 = new ButtonBuilder()
            .setCustomId("addto3")
            .setLabel("Equip")
            .setEmoji("3️⃣")
            .setStyle(ButtonStyle.Secondary);
          const addto4 = new ButtonBuilder()
            .setCustomId("addto4")
            .setLabel("Equip")
            .setEmoji("4️⃣")
            .setStyle(ButtonStyle.Secondary);
          const addto5 = new ButtonBuilder()
            .setCustomId("addto5")
            .setLabel("Equip")
            .setEmoji("5️⃣")
            .setStyle(ButtonStyle.Secondary);
          const addto6 = new ButtonBuilder()
            .setCustomId("addto6")
            .setLabel("Equip")
            .setEmoji("6️⃣")
            .setStyle(ButtonStyle.Secondary);
          const addto7 = new ButtonBuilder()
            .setCustomId("addto7")
            .setLabel("Equip")
            .setEmoji("7️⃣")
            .setStyle(ButtonStyle.Secondary);
          const addto8 = new ButtonBuilder()
            .setCustomId("addto8")
            .setLabel("Equip")
            .setEmoji("8️⃣")
            .setStyle(ButtonStyle.Secondary);
          const devote = new ButtonBuilder()
            .setCustomId("devote")
            .setLabel(
              `Devote for ${2 * emojifound.rarity + 1} point${
                2 * emojifound.rarity + 1 != 1 ? "s" : ""
              } each`
            )
            .setStyle(ButtonStyle.Primary)
            .setEmoji("🛐");
          const devotehelp = new ButtonBuilder()
            .setCustomId("devotehelp")
            .setLabel(`Devotion Help`)
            .setStyle(ButtonStyle.Danger)
            .setEmoji("❔");
          const row1 = new ActionRowBuilder().addComponents(
            addto8,
            addto7,
            addto6,
            addto5
          );
          const row2 = new ActionRowBuilder().addComponents(
            addto4,
            addto3,
            addto2,
            addto1
          );
          const devoterow = new ActionRowBuilder().addComponents(
            devote,
            devotehelp
          );
          let comps = [];
          let squadarray = await getsquad(interaction.user.id);
          let numberfound = squadarray.reduce(
            (a, v) => (v == emojifound.id ? a + 1 : a),
            0
          );
          let numberowned = vaultarray.reduce(
            (a, v) => (v == emojifound.id ? a + 1 : a),
            0
          );
          if (numberfound >= numberowned) {
            addto1.setLabel("Move");
            addto2.setLabel("Move");
            addto3.setLabel("Move");
            addto4.setLabel("Move");
            addto5.setLabel("Move");
            addto6.setLabel("Move");
            addto7.setLabel("Move");
            addto8.setLabel("Move");
          }
          if (
            vaultarray.reduce(
              (acc, curr) => (curr === viewemojiid ? acc + 1 : acc),
              0
            ) > 0
          ) {
            comps.push(row1);
            comps.push(row2);
            if (emojifound.rarity >= 0 && emojifound.rarity <= 2) {
              comps.push(devoterow);
            }
          }
          const response = await interaction.reply({
            embeds: [vaultembed],
            components: comps,
            content: redirecttext,
          });
          await dailyrewardremind(interaction);
          let logs = await getlogs();
          logs.logs.games.emojisviewed += 1;
          logs.logs.players[`user${interaction.user.id}`] =
            logs.logs.players[`user${interaction.user.id}`] ?? {};
          logs.logs.players[`user${interaction.user.id}`].emojisviewed =
            logs.logs.players[`user${interaction.user.id}`].emojisviewed ?? 0;
          logs.logs.players[`user${interaction.user.id}`].emojisviewed += 1;
          logs.logs.emojis[emojifound.id].emojisviewed =
            logs.logs.emojis[emojifound.id].emojisviewed ?? 0;
          logs.logs.emojis[emojifound.id].emojisviewed += 1;
          await writelogs(logs);

          const collectorFilter = (i) => i.user.id == interaction.user.id;
          let collector = response.createMessageComponentCollector({
            filter: collectorFilter,
            time: 120000,
          });
          try {
            collector.on("collect", async (interaction2) => {
              numberfound = squadarray.reduce(
                (a, v) => (v == emojifound.id ? a + 1 : a),
                0
              );
              vaultarray = await getvault(interaction.user.id);
              let numberowned = vaultarray.reduce(
                (a, v) => (v == emojifound.id ? a + 1 : a),
                0
              );
              if (interaction2.customId.includes("addto")) {
                if (numberfound < numberowned) {
                  squadarray = await getsquad(interaction.user.id);
                  squadarray[interaction2.customId[5] - 1] = emojifound.id;
                  await database.set(
                    interaction.user.id + "squad",
                    squadarray.join(",") + ","
                  );
                  let squadtext = "";
                  let url =
                    interaction?.channel?.url ||
                    (interaction?.channelId && interaction.guildId
                      ? `https://discord.com/channels/${interaction.guildId}/${interaction.channelId}`
                      : "https://discord.com/channels/@me");
                  for (let i = 7; i > -1; i--) {
                    squadtext += `[${emojis[squadarray[i]].emoji}](${url} \"${
                      emojis[squadarray[i]].names[0]
                    } | ${emojis[squadarray[i]].hp} health, ${
                      emojis[squadarray[i]].dmg
                    } attack power. ${emojis[squadarray[i]].description}\") `;
                  }
                  await interaction2.reply({
                    flags: "Ephemeral",
                    content: `Your squad has been saved!\n${squadtext}`,
                  });
                  let logs = await getlogs();
                  logs.logs.games.squadsedited += 1;
                  logs.logs.players[`user${interaction.user.id}`] =
                    logs.logs.players[`user${interaction.user.id}`] ?? {};
                  logs.logs.players[`user${interaction.user.id}`].squadedited =
                    logs.logs.players[`user${interaction.user.id}`]
                      .squadedited ?? 0;
                  logs.logs.players[
                    `user${interaction.user.id}`
                  ].squadedited += 1;
                  await writelogs(logs);
                } else {
                  squadarray = await getsquad(interaction.user.id);
                  let swapemoji = squadarray[interaction2.customId[5] - 1];
                  let swapindex = squadarray.findIndex(
                    (x) => x == emojifound.id
                  );
                  squadarray[interaction2.customId[5] - 1] = emojifound.id;
                  squadarray[swapindex] = swapemoji;
                  await database.set(
                    interaction.user.id + "squad",
                    squadarray.join(",") + ","
                  );
                  let squadtext = "";
                  let url =
                    interaction?.channel?.url ||
                    (interaction?.channelId && interaction.guildId
                      ? `https://discord.com/channels/${interaction.guildId}/${interaction.channelId}`
                      : "https://discord.com/channels/@me");
                  for (let i = 7; i > -1; i--) {
                    squadtext += `[${emojis[squadarray[i]].emoji}](${url} \"${
                      emojis[squadarray[i]].names[0]
                    } | ${emojis[squadarray[i]].hp} health, ${
                      emojis[squadarray[i]].dmg
                    } attack power. ${emojis[squadarray[i]].description}\") `;
                  }
                  await interaction2.reply({
                    flags: "Ephemeral",
                    content: `Your squad has been saved!\n${squadtext}`,
                  });
                  let logs = await getlogs();
                  logs.logs.games.squadsedited += 1;
                  logs.logs.players[`user${interaction.user.id}`] =
                    logs.logs.players[`user${interaction.user.id}`] ?? {};
                  logs.logs.players[`user${interaction.user.id}`].squadedited =
                    logs.logs.players[`user${interaction.user.id}`]
                      .squadedited ?? 0;
                  logs.logs.players[
                    `user${interaction.user.id}`
                  ].squadedited += 1;
                  await writelogs(logs);
                }
              } else if (interaction2.customId == "devote") {
                if (numberfound < numberowned) {
                  const modal = new ModalBuilder()
                    .setCustomId("devoteModal")
                    .setTitle(`Devote some ${emojifound.emoji}!`);
                  const buymoreinput = new TextInputBuilder()
                    .setCustomId("devoteamt")
                    .setLabel("🛐 How many do you want to devote?")
                    .setPlaceholder(`1 - ${numberowned - numberfound}`)
                    .setStyle(TextInputStyle.Short);
                  const actionRow = new ActionRowBuilder().addComponents(
                    buymoreinput
                  );
                  modal.addComponents(actionRow);
                  await interaction2.showModal(modal);
                  interaction2
                    .awaitModalSubmit({ time: 60000 })
                    .then(async (interaction3) => {
                      if (numberfound < numberowned) {
                        const devoteamt = parseInt(
                          interaction3.fields
                            .getTextInputValue("devoteamt")
                            .toLowerCase()
                        );
                        if (
                          devoteamt > numberowned - numberfound ||
                          devoteamt < 1
                        ) {
                          await interaction3.reply({
                            flags: "Ephemeral",
                            content: `⚠️ Your input was invalid!`,
                          });
                        } else {
                          let emojidisplay = await devoteemojis(
                            interaction.user.id,
                            emojifound.id,
                            devoteamt
                          );
                          let lab = await fetchresearch(interaction.user.id);
                          await interaction3.reply({
                            flags: "Ephemeral",
                            content: `🛐 You devoted ${emojidisplay}to the master of ${
                              classes[emojifound.class].emoji
                            } **${classes[emojifound.class].name}!** (+${
                              devoteamt * (2 * emojifound.rarity + 1)
                            } devotion point${
                              devoteamt * (2 * emojifound.rarity + 1) != 1
                                ? "s"
                                : ""
                            })`,
                          });
                          if (
                            Math.floor(lab[emojifound.class] / 40) !=
                            Math.floor(
                              (lab[emojifound.class] -
                                devoteamt * (2 * emojifound.rarity + 1)) /
                                40
                            )
                          ) {
                            let tempvault = await database.get(
                              interaction.user.id + "vault"
                            );
                            await database.set(
                              interaction.user.id + "vault",
                              tempvault +
                                emojis[classes[emojifound.class].legendary]
                                  ?.id +
                                ","
                            );
                            await interaction3.followUp({
                              ephemeral: false,
                              content: `\`\`\` \`\`\`\n\nYour frequent 🛐 **Devotion** has attracted the attention of ${
                                emojis[classes[emojifound.class].legendary]
                                  .emoji
                              } **${
                                emojis[classes[emojifound.class].legendary]
                                  .names[0]
                              }**, master of the art of ${
                                classes[emojifound.class].emoji
                              } **${
                                classes[emojifound.class].name
                              }!**\n\n\`\`\` \`\`\``,
                            });
                          }
                          let logs = await getlogs();
                          logs.logs.games.devotionsmade += 1;
                          logs.logs.games.emojisdevoted += devoteamt;
                          logs.logs.players[`user${interaction.user.id}`] =
                            logs.logs.players[`user${interaction.user.id}`] ??
                            {};
                          logs.logs.players[
                            `user${interaction.user.id}`
                          ].devotionsmade =
                            logs.logs.players[`user${interaction.user.id}`]
                              .devotionsmade ?? 0;
                          logs.logs.players[
                            `user${interaction.user.id}`
                          ].devotionsmade += 1;
                          logs.logs.players[
                            `user${interaction.user.id}`
                          ].emojisdevoted =
                            logs.logs.players[`user${interaction.user.id}`]
                              .emojisdevoted ?? 0;
                          logs.logs.players[
                            `user${interaction.user.id}`
                          ].emojisdevoted += devoteamt;
                          await writelogs(logs);
                        }
                      } else {
                        await interaction3.reply({
                          flags: "Ephemeral",
                          content: `⚠️ You don't have enough ${emojifound.emoji} to devote any!`,
                        });
                      }
                    });
                } else {
                  await interaction2.reply({
                    flags: "Ephemeral",
                    content: `⚠️ You don't have enough ${emojifound.emoji} to devote any!`,
                  });
                }
              } else if (interaction2.customId == "devotehelp") {
                interaction2.reply({
                  flags: "Ephemeral",
                  content: devotionhelp,
                });
              }
            });
          } catch (e) {
            console.error(e);
            addto1.setDisabled(true);
            addto2.setDisabled(true);
            addto3.setDisabled(true);
            addto4.setDisabled(true);
            addto5.setDisabled(true);
            addto6.setDisabled(true);
            addto7.setDisabled(true);
            addto8.setDisabled(true);
            interaction.editReply();
          }
        } else {
          let vaulttext = ["", "", "", ""];
          let vaultnumbers = [0, 0, 0, 0];
          let emojisgoneover = [];
          for (let i = 0; i < vaultarray.length; i++) {
            let rarity = emojis[vaultarray[i]].rarity;
            if (rarity >= 0 && !emojisgoneover.includes(vaultarray[i])) {
              emojisgoneover.push(vaultarray[i]);
              let numberihave = vaultarray.reduce(
                (acc, curr) => (curr === vaultarray[i] ? acc + 1 : acc),
                0
              );
              if (vaulttext[rarity] != "") {
                vaulttext[rarity] += `, `;
              }
              vaulttext[rarity] += `${emojis[vaultarray[i]].emoji}`;
              vaultnumbers[rarity] += numberihave;
              if (numberihave > 1) {
                vaulttext[rarity] += ` x${numberihave}`;
              }
            }
          }
          let desc = "";
          if (vaultnumbers[0] > 0) {
            desc += `## Common Emojis *️⃣\n${vaulttext[0]}\n`;
          }
          if (vaultnumbers[1] > 0) {
            desc += `## Rare Emojis ✳️\n${vaulttext[1]}\n`;
          }
          if (vaultnumbers[2] > 0) {
            desc += `## Special Emojis ⚛️\n${vaulttext[2]}\n`;
          }
          let mastermsg = "";
          if (vaultnumbers[3] > 0) {
            desc += `## Master Emojis <:master:1325987682941145259>\n${vaulttext[3]}`;
            mastermsg = `, ${vaultnumbers[3]} Master${
              vaultnumbers[3] == 1 ? "" : "s"
            }`;
          }
          const vaultembed = new EmbedBuilder()
            .setColor(0xc1694f)
            .setTitle(`${interaction.user.globalName}'s Dojo`)
            .setDescription(
              `Run \`/dojo [emoji]\` to view details on a specific emoji.\n` +
                desc
            )
            .setTimestamp()
            .setFooter({
              text: `${vaultnumbers[0]} Common${
                vaultnumbers[0] == 1 ? "" : "s"
              }, ${vaultnumbers[1]} Rare${vaultnumbers[1] == 1 ? "" : "s"}, ${
                vaultnumbers[2]
              } Special${vaultnumbers[2] == 1 ? "" : "s"}${mastermsg}`,
            }); // , ${vaultnumbers[3]} Legendary
          await interaction.reply({ embeds: [vaultembed] });
          await dailyrewardremind(interaction);
          let logs = await getlogs();
          logs.logs.games.vaultsviewed += 1;
          logs.logs.players[`user${interaction.user.id}`] =
            logs.logs.players[`user${interaction.user.id}`] ?? {};
          logs.logs.players[`user${interaction.user.id}`].vaultsviewed =
            logs.logs.players[`user${interaction.user.id}`].vaultsviewed ?? 0;
          logs.logs.players[`user${interaction.user.id}`].vaultsviewed += 1;
          await writelogs(logs);
        }
      }
    }
  },
};