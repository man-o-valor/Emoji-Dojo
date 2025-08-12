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
  adminpanel,
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
          let sort = new ButtonBuilder()
            .setCustomId("sort")
            .setLabel("sort")
            .setEmoji("📶")
            .setStyle(ButtonStyle.Secondary);
          let vaultembed = new EmbedBuilder().setTitle(
            `${interaction.user.globalName}'s Dojo`
          );
          await sortDojo(interaction, sort, vaultarray, vaultembed);
          const row1 = new ActionRowBuilder().addComponents(sort);
          const response = await interaction.reply({
            embeds: [vaultembed],
            components: [row1],
            withResponse: true,
          });
          await dailyrewardremind(interaction);
          let logs = await getlogs();
          logs.logs.games.vaultsviewed += 1;
          logs.logs.players[`user${interaction.user.id}`] =
            logs.logs.players[`user${interaction.user.id}`] ?? {};
          logs.logs.players[`user${interaction.user.id}`].vaultsviewed =
            logs.logs.players[`user${interaction.user.id}`].vaultsviewed ?? 0;
          logs.logs.players[`user${interaction.user.id}`].vaultsviewed += 1;
          await writelogs(logs);
          const collectorFilter = (i) => i.user.id == interaction.user.id;
          let collector =
            response.resource.message.createMessageComponentCollector({
              filter: collectorFilter,
              time: 120000,
            });
          try {
            collector.on("collect", async (interaction2) => {
              await database.set(
                interaction.user.id + "sortstyle",
                (1 +
                  ((await database.get(interaction.user.id + "sortstyle")) ??
                    0)) %
                  4
              );
              await sortDojo(interaction2, sort, vaultarray, vaultembed);
              await interaction2.update({
                embeds: [vaultembed],
                components: [row1],
                withResponse: true,
              });
            });
          } catch (e) {
            console.error(e);
            sort.setDisabled(true);
          }
        }
      }
    }
  },
};

async function sortDojo(interaction, sort, vaultarray, vaultembed) {
  let sortstyle = (await database.get(interaction.user.id + "sortstyle")) ?? 0;
  switch (sortstyle) {
    case 1:
      sort.setLabel("Sort by Health");
      sort.setEmoji("❤️");
      // Sort by class
      let classtext = Array(classes.length).fill("");
      let classnumbers = Array(classes.length).fill(0);
      let classemojisgoneover = [];
      for (let i = 0; i < vaultarray.length; i++) {
        let classid = emojis[vaultarray[i]].class;
        if (
          classid !== undefined &&
          classid !== null &&
          !classemojisgoneover.includes(vaultarray[i])
        ) {
          classemojisgoneover.push(vaultarray[i]);
          let numberIHave = vaultarray.reduce(
            (acc, curr) => (curr === vaultarray[i] ? acc + 1 : acc),
            0
          );
          if (classtext[classid] != "") {
            classtext[classid] += ", ";
          }
          classtext[classid] += `${emojis[vaultarray[i]].emoji}`;
          classnumbers[classid] += numberIHave;
          if (numberIHave > 1) {
            classtext[classid] += ` x${numberIHave}`;
          }
        }
      }
      let classdesc = "";
      for (let i = 0; i < classes.length; i++) {
        if (classnumbers[i] > 0) {
          classdesc += `## ${classes[i].emoji} ${classes[i].name}\n${classtext[i]}\n`;
        }
      }
      vaultembed.setDescription(
        `Run \`/dojo [emoji]\` to view a specific emoji.\n` + classdesc
      );
      vaultembed.setFooter({
        text: classnumbers
          .map((num, idx) => (num > 0 ? `${num} ${classes[idx].name}` : null))
          .filter(Boolean)
          .join(", "),
      });
      vaultembed.setColor(0x9266cc);
      break;
    case 2:
      sort.setLabel("Sort by Attack Power");
      sort.setEmoji("<:attackpower:1327657903447998477>");
      // Sort by hp
      let hpValues = vaultarray.map((eid) => emojis[eid]?.hp ?? 0);
      let uniqueHPs = [...new Set(hpValues)].sort((a, b) => a - b);
      let hpGroups = "";
      for (let h of uniqueHPs) {
        if (h === null || h === undefined) continue;
        let groupEmojis = vaultarray.filter(
          (eid) => (emojis[eid]?.hp ?? 0) === h
        );
        if (groupEmojis.length > 0) {
          hpGroups += `## ❤️ ${h} Health\n`;
          let goneOver = [];
          for (let eid of groupEmojis) {
            if (!goneOver.includes(eid)) {
              let numberIHave = groupEmojis.filter((x) => x === eid).length;
              hpGroups += `${emojis[eid].emoji}`;
              if (numberIHave > 1) hpGroups += ` x${numberIHave}`;
              hpGroups += ", ";
              goneOver.push(eid);
            }
          }
          if (hpGroups.endsWith(", ")) hpGroups = hpGroups.slice(0, -2);
          hpGroups += "\n";
        }
      }
      vaultembed.setDescription(
        `Run \`/dojo [emoji]\` to view a specific emoji.\n${hpGroups}`
      );
      vaultembed.setFooter({
        text: `Sorted by Health (Lowest to Highest)`,
      });
      vaultembed.setColor(0xcc2b3d);
      break;
    case 3:
      sort.setLabel("Sort by Rarity");
      sort.setEmoji("*️⃣");
      // Sort by dmg
      let dmgValues = vaultarray.map((eid) => emojis[eid]?.dmg ?? 0);
      let uniqueDMGs = [...new Set(dmgValues)].sort((a, b) => a - b);
      let dmgGroups = "";
      for (let d of uniqueDMGs) {
        if (d === null || d === undefined) continue;
        let groupEmojis = vaultarray.filter(
          (eid) => (emojis[eid]?.dmg ?? 0) === d
        );
        if (groupEmojis.length > 0) {
          dmgGroups += `## <:attackpower:1327657903447998477> ${d} Attack Power\n`;
          let goneOver = [];
          for (let eid of groupEmojis) {
            if (!goneOver.includes(eid)) {
              let numberIHave = groupEmojis.filter((x) => x === eid).length;
              dmgGroups += `${emojis[eid].emoji}`;
              if (numberIHave > 1) dmgGroups += ` x${numberIHave}`;
              dmgGroups += ", ";
              goneOver.push(eid);
            }
          }
          if (dmgGroups.endsWith(", ")) dmgGroups = dmgGroups.slice(0, -2);
          dmgGroups += "\n";
        }
      }
      vaultembed.setDescription(
        `Run \`/dojo [emoji]\` to view a specific emoji.\n${dmgGroups}`
      );
      vaultembed.setFooter({
        text: `Sorted by Attack Power (Lowest to Highest)`,
      });
      vaultembed.setColor(0xffac33);
      break;
    default:
      sort.setLabel("Sort by Class");
      sort.setEmoji("🛐");
      // Sort by rarity
      let raritytext = ["", "", "", ""];
      let raritynumbers = [0, 0, 0, 0];
      let rarityemojisgoneover = [];
      for (let i = 0; i < vaultarray.length; i++) {
        let rarity = emojis[vaultarray[i]].rarity;
        if (rarity >= 0 && !rarityemojisgoneover.includes(vaultarray[i])) {
          rarityemojisgoneover.push(vaultarray[i]);
          let numberihave = vaultarray.reduce(
            (acc, curr) => (curr === vaultarray[i] ? acc + 1 : acc),
            0
          );
          if (raritytext[rarity] != "") {
            raritytext[rarity] += `, `;
          }
          raritytext[rarity] += `${emojis[vaultarray[i]].emoji}`;
          raritynumbers[rarity] += numberihave;
          if (numberihave > 1) {
            raritytext[rarity] += ` x${numberihave}`;
          }
        }
      }
      let desc = "";
      if (raritynumbers[0] > 0) {
        desc += `## Common Emojis *️⃣\n${raritytext[0]}\n`;
      }
      if (raritynumbers[1] > 0) {
        desc += `## Rare Emojis ✳️\n${raritytext[1]}\n`;
      }
      if (raritynumbers[2] > 0) {
        desc += `## Special Emojis ⚛️\n${raritytext[2]}\n`;
      }
      let mastermsg = "";
      if (raritynumbers[3] > 0) {
        desc += `## Master Emojis <:master:1325987682941145259>\n${raritytext[3]}`;
        mastermsg = `, ${raritynumbers[3]} Master${
          raritynumbers[3] == 1 ? "" : "s"
        }`;
      }
      vaultembed.setDescription(
        `Run \`/dojo [emoji]\` to view a specific emoji.\n` + desc
      );
      vaultembed.setFooter({
        text: `${raritynumbers[0]} Common${raritynumbers[0] == 1 ? "" : "s"}, ${
          raritynumbers[1]
        } Rare${raritynumbers[1] == 1 ? "" : "s"}, ${raritynumbers[2]} Special${
          raritynumbers[2] == 1 ? "" : "s"
        }${mastermsg}`,
      });
      vaultembed.setColor(0x3b88c3);
  }
}
