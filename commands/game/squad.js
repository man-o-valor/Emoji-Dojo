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
  EmbedBuilder,
} = require("discord.js");
const { emojis } = require("../../data.js");
const {
  getSquad,
  setupUser,
  getLogs,
  writeLogs,
  dailyRewardRemind,
  getDojo,
  database,
  changeCoins,
} = require("../../functions.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("squad")
    .setDescription("View and edit your Squad of Emojis to battle others with"),
  async execute(interaction) {
    all: {
      await setupUser(interaction.user);
      let squadarray = await getSquad(interaction.user.id);
      let squadtext = "";
      let explanations = "";
      let explainedemojis = [];
      for (let i = 7; i > -1; i--) {
        squadtext += `${emojis[squadarray[i]].emoji} `;
      }
      for (let i = 0; i < 8; i++) {
        if (explainedemojis.includes(squadarray[i])) continue;
        explainedemojis.push(squadarray[i]);
        explanations += `${emojis[squadarray[i]].emoji} - (${emojis[squadarray[i]].hp}/${emojis[squadarray[i]].dmg}) ${
          emojis[squadarray[i]].description
        }\n`;
      }

      let cursed = parseInt((await database.get(interaction.user.id + "curse")) ?? "0");

      const save = new ButtonBuilder()
        .setCustomId("save")
        .setLabel("Save")
        .setEmoji("🔖")
        .setStyle(ButtonStyle.Primary);
      const edit = new ButtonBuilder()
        .setCustomId("import")
        .setLabel("Import")
        .setEmoji("📥")
        .setStyle(ButtonStyle.Success);
      /*const curse = new ButtonBuilder()
        .setCustomId("curse")
        .setLabel("Curse")
        .setEmoji("👺")
        .setStyle(ButtonStyle.Secondary);
      if (cursed == 1) {
        curse.setLabel("Uncurse");
        curse.setEmoji("👼");
        curse.setStyle(ButtonStyle.Primary);
      }*/
      const row1 = new ActionRowBuilder().addComponents(edit, save /*, curse*/);
      let container = new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent("## " + squadtext))
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(explanations))
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true))
        .addActionRowComponents(row1);
      let logs = await getLogs();
      logs.logs.games.squadsviewed += 1;
      logs.logs.players[`user${interaction.user.id}`] = logs.logs.players[`user${interaction.user.id}`] ?? {};
      logs.logs.players[`user${interaction.user.id}`].squadsviewed =
        logs.logs.players[`user${interaction.user.id}`].squadsviewed ?? 0;
      logs.logs.players[`user${interaction.user.id}`].squadsviewed += 1;
      await writeLogs(logs);
      const response = await interaction.reply({
        components: [container],
        withResponse: true,
        flags: MessageFlags.IsComponentsV2,
      });
      await dailyRewardRemind(interaction);

      const collectorFilter = (i) => i.user.id == interaction.user.id;
      let collector = response.resource.message.createMessageComponentCollector({
        filter: collectorFilter,
        time: 120000,
      });
      try {
        collector.on("collect", async (interaction2) => {
          if (interaction2.customId === "import") {
            let vaultarray = await getDojo(interaction.user.id);
            let vaulttext = "";
            let emojisgoneover = [];
            for (let i = 0; i < vaultarray.length; i++) {
              if (!emojisgoneover.includes(vaultarray[i])) {
                emojisgoneover.push(vaultarray[i]);
                let numberihave = vaultarray.reduce((acc, curr) => (curr === vaultarray[i] ? acc + 1 : acc), 0);
                vaulttext += `${emojis[vaultarray[i]].emoji} `;
                if (numberihave > 1) {
                  vaulttext += `x${numberihave}, `;
                }
              }
            }

            const modal = new ModalBuilder().setCustomId("squadmodal").setTitle(`Import a Squad`);

            const input = new TextInputBuilder()
              .setCustomId("input")
              .setLabel("Paste your Squad here")
              .setPlaceholder("⑧ ⑦ ⑥ ⑤ ④ ③ ② ①")
              .setStyle(TextInputStyle.Short);
            const firstActionRow = new ActionRowBuilder().addComponents(input);

            modal.addComponents(firstActionRow);

            await interaction2.showModal(modal);

            interaction2.awaitModalSubmit({ time: 60000 }).then(async (interaction4) => {
              vaultarray = await getDojo(interaction.user.id);
              const segmenter = new Intl.Segmenter("en", {
                granularity: "grapheme",
              });
              let input = interaction4.fields.getTextInputValue("input").replace(/\s+/g, "");
              let inputarr = [...segmenter.segment(input)];

              inputarr = inputarr.filter((item) => item != "");

              if (inputarr.length < 8) {
                await interaction4.reply({
                  content:
                    "Your Squad isn't formatted right! It's too short-- it needs 8 emojis in it. (Any extra will be ignored.)",
                  flags: "Ephemeral",
                });
              } else {
                let emojiinput = "";
                let datainput = [];
                let emojimissing;
                for (let i = 0; i < 8; i++) {
                  let objectalternative = emojis.find((x) => x.emoji == inputarr[i].segment);
                  if (objectalternative != undefined) {
                    if (vaultarray.find((x) => x == objectalternative.id) != undefined) {
                      vaultarray.splice(
                        vaultarray.findIndex((x) => x == objectalternative.id),
                        1
                      );
                      datainput = objectalternative.id + "," + datainput;
                      emojiinput += `${objectalternative.emoji} `;
                    } else {
                      emojimissing = inputarr[i].segment;

                      break;
                    }
                  } else {
                    emojimissing = inputarr[i].segment;
                    break;
                  }
                }

                if (emojimissing) {
                  await interaction4.reply({
                    content: `You don't have enough of an emoji listed, or it doesn't exist: ${emojimissing}`,
                    flags: "Ephemeral",
                  });
                } else {
                  // Checks out!
                  await database.set(interaction.user.id + "squad", datainput);
                  interaction4.reply({
                    content: `Your squad has been saved!\n${emojiinput}`,
                    flags: "Ephemeral",
                  });
                }
              }
            });
          } else if (interaction2.customId === "save") {
            let squadtexts = ["", "", "", "", ""];
            let savedsquads = [
              (await database.get(interaction.user.id + "squad")) ?? "",
              (await database.get(interaction.user.id + "savedsquad1")) ?? "",
              (await database.get(interaction.user.id + "savedsquad2")) ?? "",
              (await database.get(interaction.user.id + "savedsquad3")) ?? "",
              (await database.get(interaction.user.id + "savedsquad4")) ?? "",
            ];
            savedsquads = savedsquads.map((x) => x.split(",").slice(0, 8));

            for (let j = 0; j < savedsquads.length; j++) {
              if (savedsquads[j] == "") {
                squadtexts[j] = "⬛ ⬛ ⬛ ⬛ ⬛ ⬛ ⬛ ⬛";
              } else {
                for (let i = 7; i > -1; i--) {
                  squadtexts[j] += `${emojis[savedsquads[j][i]].emoji} `;
                }
              }
            }

            let slotsbought = parseInt((await database.get(interaction.user.id + "squadsavesbought")) ?? "0");

            const editembed = new EmbedBuilder()
              .setTitle(`Saved Squads 🔖`)
              .setDescription(`Current Squad:\n## ${squadtexts[0]}`)
              .addFields(
                {
                  name: "Saved Squad 1",
                  value: squadtexts[1],
                  inline: true,
                },
                {
                  name: "Saved Squad 2",
                  value: squadtexts[2],
                  inline: true,
                }
              );

            const load1 = new ButtonBuilder()
              .setCustomId("load1")
              .setLabel("Equip Squad 1")
              .setEmoji("📄")
              .setStyle(ButtonStyle.Success)
              .setDisabled(savedsquads[1] == "");
            const load2 = new ButtonBuilder()
              .setCustomId("load2")
              .setLabel("Equip Squad 2")
              .setEmoji("📄")
              .setStyle(ButtonStyle.Success)
              .setDisabled(savedsquads[2] == "");
            const load3 = new ButtonBuilder()
              .setCustomId("load3")
              .setLabel("Equip Squad 3")
              .setEmoji("📄")
              .setStyle(ButtonStyle.Success)
              .setDisabled(savedsquads[3] == "");
            const load4 = new ButtonBuilder()
              .setCustomId("load4")
              .setLabel("Equip Squad 4")
              .setEmoji("📄")
              .setStyle(ButtonStyle.Success)
              .setDisabled(savedsquads[4] == "");

            const save1 = new ButtonBuilder()
              .setCustomId("save1")
              .setLabel("Save as Squad 1")
              .setEmoji("📒")
              .setStyle(ButtonStyle.Secondary);
            const save2 = new ButtonBuilder()
              .setCustomId("save2")
              .setLabel("Save as Squad 2")
              .setEmoji("📒")
              .setStyle(ButtonStyle.Secondary);
            const save3 = new ButtonBuilder()
              .setCustomId("save3")
              .setLabel("Save as Squad 3")
              .setEmoji("📒")
              .setStyle(ButtonStyle.Secondary);
            const save4 = new ButtonBuilder()
              .setCustomId("save4")
              .setLabel("Save as Squad 4")
              .setEmoji("📒")
              .setStyle(ButtonStyle.Secondary);
            const buy = new ButtonBuilder()
              .setCustomId("buy")
              .setLabel("Buy another slot for 500")
              .setEmoji("➕")
              .setStyle(ButtonStyle.Primary);

            const row1 = new ActionRowBuilder().addComponents(load1, save1);
            const row2 = new ActionRowBuilder().addComponents(load2, save2);
            const buyrow = new ActionRowBuilder().addComponents(buy);

            container = new ContainerBuilder()
              .addTextDisplayComponents(new TextDisplayBuilder().setContent("### Saved Squads 🔖\n## " + squadtexts[0]))
              .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true))
              .addTextDisplayComponents(new TextDisplayBuilder().setContent(squadtexts[1]))
              .addActionRowComponents(row1)
              .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true))
              .addTextDisplayComponents(new TextDisplayBuilder().setContent(squadtexts[2]))
              .addActionRowComponents(row2);

            if (slotsbought > 0) {
              const row3 = new ActionRowBuilder().addComponents(load3, save3);
              container
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true))
                .addTextDisplayComponents(new TextDisplayBuilder().setContent(squadtexts[3]))
                .addActionRowComponents(row3);
              if (slotsbought > 1) {
                const row4 = new ActionRowBuilder().addComponents(load4, save4);
                container
                  .addSeparatorComponents(
                    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true)
                  )
                  .addTextDisplayComponents(new TextDisplayBuilder().setContent(squadtexts[4]))
                  .addActionRowComponents(row4);
              }
            }

            if (slotsbought < 2) {
              container
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true))
                .addActionRowComponents(buyrow);
            }
            const response2 = await interaction2.reply({
              components: [container],
              withResponse: true,
              flags: MessageFlags.IsComponentsV2,
            });
            const collectorFilter = (i) => i.user.id == interaction.user.id;
            let collector = response2.resource.message.createMessageComponentCollector({
              filter: collectorFilter,
              time: 120000,
            });

            collector.on("collect", async (interaction3) => {
              try {
                if (interaction3.customId.includes("save")) {
                  await database.set(
                    interaction.user.id + "savedsquad" + interaction3.customId[4],
                    await database.get(interaction.user.id + "squad")
                  );
                  let squadarray = await getSquad(interaction.user.id);
                  let squadtext = "";
                  for (let i = 7; i > -1; i--) {
                    squadtext += `${emojis[squadarray[i]].emoji} `;
                  }
                  interaction3.reply({
                    content: `Success! Saved Squad ${interaction3.customId[4]} has been saved as:\n## ${squadtext}`,
                    flags: MessageFlags.Ephemeral,
                  });
                } else if (interaction3.customId.includes("load")) {
                  vaultarray = await getDojo(interaction.user.id);
                  let saveloading = await database.get(interaction.user.id + "savedsquad" + interaction3.customId[4]);
                  saveloading = saveloading.split(",").slice(0, 8);
                  let emojiinput = "";
                  let datainput = [];
                  let emojimissing = undefined;
                  for (let i = 0; i < 8; i++) {
                    if (vaultarray.find((x) => x == saveloading[i]) != undefined) {
                      vaultarray.splice(
                        vaultarray.findIndex((x) => x == saveloading[i]),
                        1
                      );
                      datainput = datainput + saveloading[i] + ",";
                      emojiinput = `${emojis[saveloading[i]].emoji} ` + emojiinput;
                    } else {
                      emojimissing = saveloading[i];
                      break;
                    }
                  }
                  if (emojimissing) {
                    await interaction3.reply({
                      content: `You don't have enough of this emoji: ${emojis[emojimissing].emoji}`,
                      flags: "Ephemeral",
                    });
                  } else {
                    await database.set(interaction.user.id + "squad", datainput);
                    interaction3.reply({
                      content: `Your squad has been saved!\n${emojiinput}`,
                      flags: "Ephemeral",
                    });
                  }
                } else if (interaction3.customId == "buy") {
                  const balance = parseInt((await database.get(interaction.user.id + "coins")) ?? "100");
                  let slotsbought = parseInt((await database.get(interaction.user.id + "squadsavesbought")) ?? "0");
                  if (balance < 500) {
                    interaction3.reply({
                      content: "You can't afford this!",
                      flags: "Ephemeral",
                    });
                  } else if (slotsbought > 1) {
                    interaction3.reply({
                      content: "You've bought every slot!",
                      flags: "Ephemeral",
                    });
                  } else {
                    await changeCoins(interaction.user.id, -500);
                    await database.set(interaction.user.id + "squadsavesbought", slotsbought + 1);
                    interaction3.reply({
                      content: `Successfully purchased Slot ${slotsbought + 3}!`,
                      flags: "Ephemeral",
                    });
                  }
                }
              } catch (e) {
                console.error(e);
                load1.setDisabled(true);
                load2.setDisabled(true);
                load3.setDisabled(true);
                load4.setDisabled(true);
                save1.setDisabled(true);
                save2.setDisabled(true);
                save3.setDisabled(true);
                save4.setDisabled(true);
                buy.setDisabled(true);
                interaction2.editReply({ components: [container] });
              }
            });
          } else if (interaction2.customId === "curse") {
            cursed = parseInt((await database.get(interaction.user.id + "curse")) ?? "0");
            await database.set(interaction.user.id + "curse", 0 - cursed + 1);
            if (cursed == 0) {
              interaction2.reply({
                content: `👺 Your squad has been **Cursed!** DojoBot will now always prevail.`,
                flags: "Ephemeral",
              });
            } else {
              interaction2.reply({
                content: `👼 Your squad has been **Uncursed!** DojoBot will now play fair.`,
                flags: "Ephemeral",
              });
            }
          }
        });
      } catch (e) {
        console.error(e);
      }
    }
  },
};
