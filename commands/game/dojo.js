const {
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  MessageFlags,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  StringSelectMenuOptionBuilder,
  StringSelectMenuBuilder
} = require("discord.js");
const { emojis, raritysymbols, raritynames, classes, devotionhelp } = require("../../data.js");
const {
  database,
  getDojo,
  setupUser,
  getSquad,
  devoteEmojis,
  getDevotions,
  getLogs,
  writeLogs,
  dailyRewardRemind,
  adminPanel,
  renderqemoji
} = require("../../functions.js");
const { closestMatch } = require("closest-match");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("dojo")
    .setDescription("View your Dojo of Emojis")
    .addStringOption((option) => option.setName("emoji").setDescription("The Emoji to view details of (optional)")),
  async execute(interaction) {
    const viewemoji = interaction.options.getString("emoji");
    if ((viewemoji ?? "").startsWith("%dev")) {
      if (interaction.user.id == "1013096732147597412" || interaction.user.id == "1146557659349270639") {
        await adminPanel(interaction, viewemoji);
      } else {
        await interaction.reply({
          flags: "Ephemeral",
          content: `🤓 you're not the admin silly`
        });
      }
    } else {
      if (await setupUser(interaction.user)) {
        await interaction.reply({
          flags: "Ephemeral",
          content: `Greetings, <@${interaction.user.id}>! Check your DMs before you continue.`
        });
      } else {
        let vaultarray = await getDojo(interaction.user.id);
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
            redirecttext = `\n-# redirected from "${viewemoji}"`;
          }

          const emojifound = emojis.find(
            (x) =>
              x.names.find(
                (y) => y.replace(/\s+/g, "_").toLowerCase() == closeviewemoji.trim().replace(/\s+/g, "_").toLowerCase()
              ) || x.emoji == closeviewemoji.replace(/\s+/g, "")
          );
          const viewemojiid = vaultarray.find((x) => emojis[x]?.id == emojifound?.id);

          let squadarray = await getSquad(interaction.user.id);
          let addto = new StringSelectMenuBuilder()
            .setCustomId("addto")
            .setPlaceholder("You have " + vaultarray.reduce((acc, curr) => (curr === viewemojiid ? acc + 1 : acc), 0))
            .setOptions(
              new StringSelectMenuOptionBuilder()
                .setLabel("1️⃣ Equip")
                .setDescription("replaces " + emojis[squadarray[0]].emoji)
                .setValue("addto1"),
              new StringSelectMenuOptionBuilder()
                .setLabel("2️⃣ Equip")
                .setDescription("replaces " + emojis[squadarray[1]].emoji)
                .setValue("addto2"),
              new StringSelectMenuOptionBuilder()
                .setLabel("3️⃣ Equip")
                .setDescription("replaces " + emojis[squadarray[2]].emoji)
                .setValue("addto3"),
              new StringSelectMenuOptionBuilder()
                .setLabel("4️⃣ Equip")
                .setDescription("replaces " + emojis[squadarray[3]].emoji)
                .setValue("addto4"),
              new StringSelectMenuOptionBuilder()
                .setLabel("5️⃣ Equip")
                .setDescription("replaces " + emojis[squadarray[4]].emoji)
                .setValue("addto5"),
              new StringSelectMenuOptionBuilder()
                .setLabel("6️⃣ Equip")
                .setDescription("replaces " + emojis[squadarray[5]].emoji)
                .setValue("addto6"),
              new StringSelectMenuOptionBuilder()
                .setLabel("7️⃣ Equip")
                .setDescription("replaces " + emojis[squadarray[6]].emoji)
                .setValue("addto7"),
              new StringSelectMenuOptionBuilder()
                .setLabel("8️⃣ Equip")
                .setDescription("replaces " + emojis[squadarray[7]].emoji)
                .setValue("addto8")
            );
          const devote = new ButtonBuilder()
            .setCustomId("devote")
            .setLabel(`Devote (${2 * emojifound.rarity + 1} point${2 * emojifound.rarity + 1 != 1 ? "s" : ""} each)`)
            .setStyle(ButtonStyle.Primary)
            .setEmoji("🛐");
          const devotehelp = new ButtonBuilder()
            .setCustomId("devotehelp")
            .setLabel(`Devotion Help`)
            .setStyle(ButtonStyle.Danger);
          const devoterow = new ActionRowBuilder().addComponents(devote, devotehelp);
          let comps = [];
          let numberfound = squadarray.reduce((a, v) => (v == emojifound.id ? a + 1 : a), 0);
          let numberowned = vaultarray.reduce((a, v) => (v == emojifound.id ? a + 1 : a), 0);
          if (numberfound >= numberowned) {
            addto = new StringSelectMenuBuilder()
              .setCustomId("addto")
              .setPlaceholder("You have " + vaultarray.reduce((acc, curr) => (curr === viewemojiid ? acc + 1 : acc), 0))
              .setOptions(
                new StringSelectMenuOptionBuilder()
                  .setLabel("1️⃣ Move")
                  .setDescription("swaps with " + emojis[squadarray[0]].emoji)
                  .setValue("addto1"),
                new StringSelectMenuOptionBuilder()
                  .setLabel("2️⃣ Move")
                  .setDescription("swaps with " + emojis[squadarray[1]].emoji)
                  .setValue("addto2"),
                new StringSelectMenuOptionBuilder()
                  .setLabel("3️⃣ Move")
                  .setDescription("swaps with " + emojis[squadarray[2]].emoji)
                  .setValue("addto3"),
                new StringSelectMenuOptionBuilder()
                  .setLabel("4️⃣ Move")
                  .setDescription("swaps with " + emojis[squadarray[3]].emoji)
                  .setValue("addto4"),
                new StringSelectMenuOptionBuilder()
                  .setLabel("5️⃣ Move")
                  .setDescription("swaps with " + emojis[squadarray[4]].emoji)
                  .setValue("addto5"),
                new StringSelectMenuOptionBuilder()
                  .setLabel("6️⃣ Move")
                  .setDescription("swaps with " + emojis[squadarray[5]].emoji)
                  .setValue("addto6"),
                new StringSelectMenuOptionBuilder()
                  .setLabel("7️⃣ Move")
                  .setDescription("swaps with " + emojis[squadarray[6]].emoji)
                  .setValue("addto7"),
                new StringSelectMenuOptionBuilder()
                  .setLabel("8️⃣ Move")
                  .setDescription("swaps with " + emojis[squadarray[7]].emoji)
                  .setValue("addto8")
              );
          }

          let vaultcontainer = new ContainerBuilder()
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`## ${emojifound.emoji} ${emojifound.names[0]}${redirecttext}`)
            )
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(
                `❤️ Health: **${emojifound.hp ?? "N/A"}**\n<:attackpower:1327657903447998477> Attack Power: **${
                  emojifound.dmg ?? "N/A"
                }**\n${raritysymbols[emojifound.rarity] ?? "⬜"} Rarity: **${
                  raritynames[emojifound.rarity] ?? "N/A"
                }**\n${emojifound.class != undefined ? classes[emojifound.class].emoji ?? "🟣" : "🟣"} Class: **${
                  emojifound.class != undefined ? classes[emojifound.class].name ?? "Unknown" : "None"
                }**\nAbility:\n> ${emojifound.description}`
              )
            )
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
            .addActionRowComponents(new ActionRowBuilder().addComponents(addto));

          if (vaultarray.reduce((acc, curr) => (curr === viewemojiid ? acc + 1 : acc), 0) > 0) {
            if (emojifound.rarity >= 0 && emojifound.rarity <= 2) {
              vaultcontainer.addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
              );
              vaultcontainer.addActionRowComponents(devoterow);
            }
          } else {
            addto.setDisabled(true);
            addto.setPlaceholder("You don't have any of this Emoji");
          }

          const response = await interaction.reply({
            components: [vaultcontainer],
            flags: MessageFlags.IsComponentsV2
          });
          await dailyRewardRemind(interaction);
          let logs = await getLogs();
          logs.logs.games.emojisviewed += 1;
          logs.logs.players[`user${interaction.user.id}`] = logs.logs.players[`user${interaction.user.id}`] ?? {};
          logs.logs.players[`user${interaction.user.id}`].emojisviewed =
            logs.logs.players[`user${interaction.user.id}`].emojisviewed ?? 0;
          logs.logs.players[`user${interaction.user.id}`].emojisviewed += 1;
          logs.logs.emojis[emojifound.id].emojisviewed = logs.logs.emojis[emojifound.id].emojisviewed ?? 0;
          logs.logs.emojis[emojifound.id].emojisviewed += 1;
          await writeLogs(logs);

          const collectorFilter = (i) => i.user.id == interaction.user.id;
          let collector = response.createMessageComponentCollector({
            filter: collectorFilter,
            time: 120000
          });
          try {
            collector.on("collect", async (interaction2) => {
              numberfound = squadarray.reduce((a, v) => (v == emojifound.id ? a + 1 : a), 0);
              vaultarray = await getDojo(interaction.user.id);
              let numberowned = vaultarray.reduce((a, v) => (v == emojifound.id ? a + 1 : a), 0);
              if (interaction2.values && interaction2.values[0].includes("addto")) {
                if (numberfound < numberowned) {
                  squadarray = await getSquad(interaction.user.id);
                  squadarray[interaction2.values[0][5] - 1] = emojifound.id;
                  await database.set(interaction.user.id + "squad", squadarray.join(",") + ",");
                  let squadtext = "";
                  let url =
                    interaction?.channel?.url ||
                    (interaction?.channelId && interaction.guildId
                      ? `https://discord.com/channels/${interaction.guildId}/${interaction.channelId}`
                      : "https://discord.com/channels/@me");
                  for (let i = 7; i > -1; i--) {
                    squadtext += `[${emojis[squadarray[i]].emoji}](${url} \"${emojis[squadarray[i]].names[0]} | ${
                      emojis[squadarray[i]].hp
                    } health, ${emojis[squadarray[i]].dmg} attack power. ${emojis[squadarray[i]].description}\") `;
                  }
                  await interaction2.reply({
                    flags: "Ephemeral",
                    content: `Your squad has been saved!\n${squadtext}`
                  });
                  let logs = await getLogs();
                  logs.logs.games.squadsedited += 1;
                  logs.logs.players[`user${interaction.user.id}`] =
                    logs.logs.players[`user${interaction.user.id}`] ?? {};
                  logs.logs.players[`user${interaction.user.id}`].squadedited =
                    logs.logs.players[`user${interaction.user.id}`].squadedited ?? 0;
                  logs.logs.players[`user${interaction.user.id}`].squadedited += 1;
                  await writeLogs(logs);
                } else {
                  squadarray = await getSquad(interaction.user.id);
                  let swapemoji = squadarray[interaction2.values[0][5] - 1];
                  let swapindex = squadarray.findIndex((x) => x == emojifound.id);
                  squadarray[interaction2.values[0][5] - 1] = emojifound.id;
                  squadarray[swapindex] = swapemoji;
                  await database.set(interaction.user.id + "squad", squadarray.join(",") + ",");
                  let squadtext = "";
                  let url =
                    interaction?.channel?.url ||
                    (interaction?.channelId && interaction.guildId
                      ? `https://discord.com/channels/${interaction.guildId}/${interaction.channelId}`
                      : "https://discord.com/channels/@me");
                  for (let i = 7; i > -1; i--) {
                    squadtext += `[${emojis[squadarray[i]].emoji}](${url} \"${emojis[squadarray[i]].names[0]} | ${
                      emojis[squadarray[i]].hp
                    } health, ${emojis[squadarray[i]].dmg} attack power. ${emojis[squadarray[i]].description}\") `;
                  }
                  await interaction2.reply({
                    flags: "Ephemeral",
                    content: `Your squad has been saved!\n${squadtext}`
                  });
                  let logs = await getLogs();
                  logs.logs.games.squadsedited += 1;
                  logs.logs.players[`user${interaction.user.id}`] =
                    logs.logs.players[`user${interaction.user.id}`] ?? {};
                  logs.logs.players[`user${interaction.user.id}`].squadedited =
                    logs.logs.players[`user${interaction.user.id}`].squadedited ?? 0;
                  logs.logs.players[`user${interaction.user.id}`].squadedited += 1;
                  await writeLogs(logs);
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
                  const actionRow = new ActionRowBuilder().addComponents(buymoreinput);
                  modal.addComponents(actionRow);
                  await interaction2.showModal(modal);
                  interaction2.awaitModalSubmit({ time: 60000 }).then(async (interaction3) => {
                    if (numberfound < numberowned) {
                      const devoteamt = parseInt(interaction3.fields.getTextInputValue("devoteamt").toLowerCase());
                      if (devoteamt > numberowned - numberfound || devoteamt < 1) {
                        await interaction3.reply({
                          flags: "Ephemeral",
                          content: `⚠️ Your input was invalid!`
                        });
                      } else {
                        let emojidisplay = await devoteEmojis(interaction.user.id, emojifound.id, devoteamt);
                        let lab = await getDevotions(interaction.user.id);
                        await interaction3.reply({
                          flags: "Ephemeral",
                          content: `🛐 You devoted ${emojidisplay}to the master of ${
                            classes[emojifound.class].emoji
                          } **${classes[emojifound.class].name}!** (+${
                            devoteamt * (2 * emojifound.rarity + 1)
                          } devotion point${devoteamt * (2 * emojifound.rarity + 1) != 1 ? "s" : ""})`
                        });
                        if (
                          Math.floor(lab[emojifound.class] / 40) !=
                          Math.floor((lab[emojifound.class] - devoteamt * (2 * emojifound.rarity + 1)) / 40)
                        ) {
                          let tempvault = await database.get(interaction.user.id + "vault");
                          await database.set(
                            interaction.user.id + "vault",
                            tempvault + emojis[classes[emojifound.class].legendary]?.id + ","
                          );
                          await interaction3.followUp({
                            ephemeral: false,
                            content: `\`\`\` \`\`\`\n\nYour frequent 🛐 **Devotion** has attracted the attention of ${
                              emojis[classes[emojifound.class].legendary].emoji
                            } **${emojis[classes[emojifound.class].legendary].names[0]}**, master of the art of ${
                              classes[emojifound.class].emoji
                            } **${classes[emojifound.class].name}!**\n\n\`\`\` \`\`\``
                          });
                        }
                        let logs = await getLogs();
                        logs.logs.games.devotionsmade += 1;
                        logs.logs.games.emojisdevoted += devoteamt;
                        logs.logs.players[`user${interaction.user.id}`] =
                          logs.logs.players[`user${interaction.user.id}`] ?? {};
                        logs.logs.players[`user${interaction.user.id}`].devotionsmade =
                          logs.logs.players[`user${interaction.user.id}`].devotionsmade ?? 0;
                        logs.logs.players[`user${interaction.user.id}`].devotionsmade += 1;
                        logs.logs.players[`user${interaction.user.id}`].emojisdevoted =
                          logs.logs.players[`user${interaction.user.id}`].emojisdevoted ?? 0;
                        logs.logs.players[`user${interaction.user.id}`].emojisdevoted += devoteamt;
                        await writeLogs(logs);
                      }
                    } else {
                      await interaction3.reply({
                        flags: "Ephemeral",
                        content: `⚠️ You don't have enough ${emojifound.emoji} to devote any!`
                      });
                    }
                  });
                } else {
                  await interaction2.reply({
                    flags: "Ephemeral",
                    content: `⚠️ You don't have enough ${emojifound.emoji} to devote any!`
                  });
                }
              } else if (interaction2.customId == "devotehelp") {
                interaction2.reply({
                  flags: "Ephemeral",
                  content: devotionhelp
                });
              }
            });
          } catch (e) {
            console.error(e);
            addto.setDisabled(true);
            interaction.editReply();
          }
        } else {
          await interaction.deferReply();
          let sortDropdown = new StringSelectMenuBuilder()
            .setCustomId("sortstyle")
            .setPlaceholder("Sort...")
            .setOptions(
              new StringSelectMenuOptionBuilder().setLabel("*️⃣ Sort by Rarity").setValue("0"),
              new StringSelectMenuOptionBuilder().setLabel("🛐 Sort by Class").setValue("1"),
              new StringSelectMenuOptionBuilder().setLabel("❤️ Sort by Health").setValue("2"),
              new StringSelectMenuOptionBuilder().setLabel("⚔️ Sort by Attack Power").setValue("3")
            );

          const sorttypes = [
            "*️⃣ Sorting by Rarity",
            "🛐 Sorting by Class",
            "❤️ Sorting by Health",
            "⚔️ Sorting by Attack Power"
          ];
          const currentSortStyle = (await database.get(interaction.user.id + "sortstyle")) ?? 0;
          sortDropdown.setPlaceholder(sorttypes[currentSortStyle]);

          const pagesByStyle = {};
          // Only precompute the pages for the currently selected style to save time.
          pagesByStyle[currentSortStyle] = await sortDojo(
            interaction,
            vaultarray,
            sortDropdown,
            currentSortStyle
          );
          if (!pagesByStyle[currentSortStyle] || pagesByStyle[currentSortStyle].length === 0)
            pagesByStyle[currentSortStyle] = [""];

          // Copy the precomputed pages so `pages` is independent from the cache entry.
          let pages = (pagesByStyle[currentSortStyle] ?? [""]).slice();
          if (!Array.isArray(pages) || pages.length === 0) pages = [""];

          let pageIndex = 0;

          const prevBtn = new ButtonBuilder()
            .setCustomId("dojo_prev")
            .setLabel("◀ Prev")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(false);
          const nextBtn = new ButtonBuilder()
            .setCustomId("dojo_next")
            .setLabel("Next ▶")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(false);

          let vaultcontainer = new ContainerBuilder()
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent("Run `/dojo [emoji]` to see details about one emoji.")
            )
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(pages[pageIndex] + `\n\nPage ${pageIndex + 1}/${pages.length}`)
            )
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true))
            .addActionRowComponents(new ActionRowBuilder().addComponents(sortDropdown));
          if (pages.length > 1)
            vaultcontainer.addActionRowComponents(new ActionRowBuilder().addComponents(prevBtn, nextBtn));

          const responseMessage = await interaction.editReply({
            components: [vaultcontainer],
            fetchReply: true,
            flags: MessageFlags.IsComponentsV2
          });
          await dailyRewardRemind(interaction);
          let logs = await getLogs();
          logs.logs.games.vaultsviewed += 1;
          logs.logs.players[`user${interaction.user.id}`] = logs.logs.players[`user${interaction.user.id}`] ?? {};
          logs.logs.players[`user${interaction.user.id}`].vaultsviewed =
            logs.logs.players[`user${interaction.user.id}`].vaultsviewed ?? 0;
          logs.logs.players[`user${interaction.user.id}`].vaultsviewed += 1;
          await writeLogs(logs);
          const collectorFilter = (i) => i.user.id == interaction.user.id;
          let collector = responseMessage.createMessageComponentCollector({
            filter: collectorFilter,
            time: 120000
          });
          try {
            collector.on("collect", async (interaction2) => {
              if (interaction2.customId === "sortstyle") {
                await database.set(interaction.user.id + "sortstyle", parseInt(interaction2.values[0]));
                const newStyle = parseInt(interaction2.values[0]);
                if (!Array.isArray(pagesByStyle[newStyle]) || pagesByStyle[newStyle].length === 0) {
                  pagesByStyle[newStyle] = await sortDojo(interaction, vaultarray, sortDropdown, newStyle);
                  if (!pagesByStyle[newStyle] || pagesByStyle[newStyle].length === 0) pagesByStyle[newStyle] = [""];
                }
                pages = pagesByStyle[newStyle].slice();
                sortDropdown.setPlaceholder(sorttypes[newStyle]);
                pageIndex = 0;
                vaultcontainer = new ContainerBuilder()
                  .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent("Run `/dojo [emoji]` to see details about one emoji.")
                  )
                  .addSeparatorComponents(
                    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
                  )
                  .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(pages[pageIndex] + `\n\nPage ${pageIndex + 1}/${pages.length}`)
                  )
                  .addSeparatorComponents(
                    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true)
                  )
                  .addActionRowComponents(new ActionRowBuilder().addComponents(sortDropdown));
                if (pages.length > 1)
                  vaultcontainer.addActionRowComponents(new ActionRowBuilder().addComponents(prevBtn, nextBtn));
                await interaction2.update({
                  components: [vaultcontainer],
                  withResponse: true,
                  flags: MessageFlags.IsComponentsV2
                });
              } else if (interaction2.customId === "dojo_next") {
                pageIndex = (pageIndex + 1) % pages.length;
                vaultcontainer = new ContainerBuilder()
                  .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent("Run `/dojo [emoji]` to see details about one emoji.")
                  )
                  .addSeparatorComponents(
                    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
                  )
                  .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(pages[pageIndex] + `\n\nPage ${pageIndex + 1}/${pages.length}`)
                  )
                  .addSeparatorComponents(
                    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true)
                  )
                  .addActionRowComponents(new ActionRowBuilder().addComponents(sortDropdown));
                if (pages.length > 1)
                  vaultcontainer.addActionRowComponents(new ActionRowBuilder().addComponents(prevBtn, nextBtn));
                await interaction2.update({
                  components: [vaultcontainer],
                  withResponse: true,
                  flags: MessageFlags.IsComponentsV2
                });
              } else if (interaction2.customId === "dojo_prev") {
                if (pages.length > 0) pageIndex = (pageIndex - 1 + pages.length) % pages.length;
                vaultcontainer = new ContainerBuilder()
                  .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent("Run `/dojo [emoji]` to see details about one emoji.")
                  )
                  .addSeparatorComponents(
                    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
                  )
                  .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(pages[pageIndex] + `\n\nPage ${pageIndex + 1}/${pages.length}`)
                  )
                  .addSeparatorComponents(
                    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true)
                  )
                  .addActionRowComponents(new ActionRowBuilder().addComponents(sortDropdown));
                if (pages.length > 1)
                  vaultcontainer.addActionRowComponents(new ActionRowBuilder().addComponents(prevBtn, nextBtn));
                await interaction2.update({
                  components: [vaultcontainer],
                  withResponse: true,
                  flags: MessageFlags.IsComponentsV2
                });
              }
            });
          } catch (e) {
            console.error(e);
            sortDropdown.setDisabled(true);
          }
        }
      }
    }
  }
};

async function sortDojo(interaction, vaultarray, sortDropdown, overrideSortStyle) {
  function formatEmojiRows(items) {
    if (!items || items.length === 0) return "";
    let out = "";
    for (let i = 0; i < items.length; i++) {
      if (i > 0 && i % 6 === 0) out += "\n";
      out += items[i];
    }
    return out;
  }

  let sortstyle = overrideSortStyle ?? (await database.get(interaction.user.id + "sortstyle")) ?? 0;
  const sorttypes = [
    "*️⃣ Sorting by Rarity",
    "🛐 Sorting by Class",
    "❤️ Sorting by Health",
    "⚔️ Sorting by Attack Power"
  ];

  const tokens = [];

  switch (sortstyle) {
    case 1: {
      // Sort by class
      const classBuckets = Array(classes.length)
        .fill(null)
        .map(() => []);
      const classCounts = Array(classes.length).fill(0);
      const seen = new Set();
      for (const eid of vaultarray) {
        if (seen.has(eid)) continue;
        seen.add(eid);
        const classid = emojis[eid].class;
        if (classid === undefined || classid === null) continue;
        const count = vaultarray.filter((x) => x === eid).length;
        let entry = `${emojis[eid].emoji}`;
        if (count > 0) entry += renderqemoji(count);
        classBuckets[classid].push(entry);
        classCounts[classid] += count;
      }
      for (let i = 0; i < classes.length; i++) {
        if (classCounts[i] > 0) {
          tokens.push(`### ${classes[i].emoji} ${classes[i].name} x${classCounts[i]}`);
          const content = formatEmojiRows(classBuckets[i]);
          const lines = content.split("\n").filter((t) => t && t.length > 0);
          for (const line of lines) tokens.push(line);
        }
      }
      break;
    }
    case 2: {
      // Sort by hp (ascending)
      const hpValues = vaultarray.map((eid) => emojis[eid]?.hp ?? 0);
      const uniqueHPs = [...new Set(hpValues)].sort((a, b) => a - b);
      for (const h of uniqueHPs) {
        if (h === null || h === undefined) continue;
        const group = vaultarray.filter((eid) => (emojis[eid]?.hp ?? 0) === h);
        if (!group || group.length === 0) continue;
        const gone = new Set();
        const items = [];
        for (const eid of group) {
          if (gone.has(eid)) continue;
          gone.add(eid);
          const count = group.filter((x) => x === eid).length;
          let entry = `${emojis[eid].emoji}`;
          if (count > 0) entry += renderqemoji(count);
          items.push(entry);
        }
        tokens.push(`### ❤️ ${h} Health`);
        const content = formatEmojiRows(items);
        const lines = content.split("\n").filter((t) => t && t.length > 0);
        for (const line of lines) tokens.push(line);
      }
      break;
    }
    case 3: {
      // Sort by dmg (ascending)
      const dmgValues = vaultarray.map((eid) => emojis[eid]?.dmg ?? 0);
      const uniqueDMGs = [...new Set(dmgValues)].sort((a, b) => a - b);
      for (const d of uniqueDMGs) {
        if (d === null || d === undefined) continue;
        const group = vaultarray.filter((eid) => (emojis[eid]?.dmg ?? 0) === d);
        if (!group || group.length === 0) continue;
        const gone = new Set();
        const items = [];
        for (const eid of group) {
          if (gone.has(eid)) continue;
          gone.add(eid);
          const count = group.filter((x) => x === eid).length;
          let entry = `${emojis[eid].emoji}`;
          if (count > 0) entry += renderqemoji(count);
          items.push(entry);
        }
        tokens.push(`### <:attackpower:1327657903447998477> ${d} Attack Power`);
        const content = formatEmojiRows(items);
        const lines = content.split("\n").filter((t) => t && t.length > 0);
        for (const line of lines) tokens.push(line);
      }
      break;
    }
    default: {
      // Sort by rarity (common -> master)
      const rarityBuckets = [[], [], [], []];
      const rarityCounts = [0, 0, 0, 0];
      const seen = new Set();
      for (const eid of vaultarray) {
        if (seen.has(eid)) continue;
        seen.add(eid);
        const r = emojis[eid].rarity;
        if (r < 0) continue;
        const count = vaultarray.filter((x) => x === eid).length;
        let entry = `${emojis[eid].emoji}`;
        if (count > 0) entry += renderqemoji(count);
        rarityBuckets[r].push(entry);
        rarityCounts[r] += count;
      }
      if (rarityCounts[0] > 0) {
        tokens.push(`### *️⃣ Common Emojis x${rarityCounts[0]}`);
        const content0 = formatEmojiRows(rarityBuckets[0]);
        const lines0 = content0.split("\n").filter((t) => t && t.length > 0);
        for (const line of lines0) tokens.push(line);
      }
      if (rarityCounts[1] > 0) {
        tokens.push(`### ✳️ Rare Emojis x${rarityCounts[1]}`);
        const content1 = formatEmojiRows(rarityBuckets[1]);
        const lines1 = content1.split("\n").filter((t) => t && t.length > 0);
        for (const line of lines1) tokens.push(line);
      }
      if (rarityCounts[2] > 0) {
        tokens.push(`### ⚛️ Special Emojis x${rarityCounts[2]}`);
        const content2 = formatEmojiRows(rarityBuckets[2]);
        const lines2 = content2.split("\n").filter((t) => t && t.length > 0);
        for (const line of lines2) tokens.push(line);
      }
      if (rarityCounts[3] > 0) {
        tokens.push(`### <:master:1325987682941145259> Master Emojis x${rarityCounts[3]}`);
        const content3 = formatEmojiRows(rarityBuckets[3]);
        const lines3 = content3.split("\n").filter((t) => t && t.length > 0);
        for (const line of lines3) tokens.push(line);
      }
      break;
    }
  }

  const pageSize = 12;
  const pages = [];
  for (let start = 0; start < tokens.length; start += pageSize) {
    let pageTokens = tokens.slice(start, start + pageSize);
    if (pageTokens.length > 0 && !pageTokens[0].startsWith("###")) {
      for (let j = start - 1; j >= 0; j--) {
        if (tokens[j].startsWith("###")) {
          pageTokens.unshift(tokens[j]);
          break;
        }
      }
    }
    pages.push(pageTokens.filter((t) => t && t.length > 0).join("\n"));
  }

  if (pages.length === 0) pages.push("");
  return pages;
}
