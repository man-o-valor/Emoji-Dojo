const {
  SlashCommandBuilder,
  ButtonStyle,
  ButtonBuilder,
  ActionRowBuilder,
  EmbedBuilder,
} = require("discord.js");
const { emojis, raritynames } = require("../../data.js");
const {
  trysetupuser,
  database,
  getvault,
  dailyrewardremind,
  writelogs,
  getlogs,
} = require("../../functions.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("trade")
    .setDescription("Trade Emojis with another user")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to trade with")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("theyget")
        .setDescription("What the other user gets from you in the trade")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("iwant")
        .setDescription("What you want from the other user in the trade")
        .setRequired(true)
    ),
  async execute(interaction) {
    const tradeuser = interaction.options.getUser("user");
    const theyget = interaction.options.getString("theyget");
    const iwant = interaction.options.getString("iwant");
    await trysetupuser(interaction.user);
    const othervault = await database.get(tradeuser.id + "vault");
    if (!othervault) {
      await interaction.reply({
        flags: "Ephemeral",
        content: `<@${tradeuser.id}> hasn't played Emoji Dojo before!`,
      });
    } else {
      if (
        tradeuser.globalName != undefined &&
        tradeuser.id != interaction.user.id
      ) {
        let myvault = await getvault(interaction.user.id);
        let theirvault = await getvault(tradeuser.id);
        const myemojifound = emojis.find(
          (x) =>
            x.names.find(
              (y) =>
                y.replace(/\s+/g, "_").toLowerCase() ==
                theyget.trim().replace(/\s+/g, "_").toLowerCase()
            ) || x.emoji == theyget.replace(/\s+/g, "")
        );
        let myviewemojiid = myvault.find(
          (x) => emojis[x]?.id == (myemojifound)?.id
        );
        const theiremojifound = emojis.find(
          (x) =>
            x.names.find(
              (y) =>
                y.replace(/\s+/g, "_").toLowerCase() ==
                iwant.trim().replace(/\s+/g, "_").toLowerCase()
            ) || x.emoji == iwant.replace(/\s+/g, "")
        );
        let theirviewemojiid = theirvault.find(
          (x) => emojis[x]?.id == (theiremojifound)?.id
        );
        console.log(myemojifound);
        console.log(myviewemojiid);
        console.log(theiremojifound);
        console.log(theirviewemojiid);
        if (myviewemojiid) {
          if (theirviewemojiid) {
            if (
              (myemojifound ?? { rarity: NaN }).rarity < 3 &&
              (theiremojifound ?? { rarity: NaN }).rarity < 3
            ) {
              if (
                (myemojifound ?? { rarity: NaN }).rarity ==
                (theiremojifound ?? { rarity: NaN }).rarity
              ) {
                //yay we can actually trade
                let logs = await getlogs();
                logs.logs.games.tradesopened =
                  logs.logs.games.tradesopened ?? 0;
                logs.logs.games.tradesopened += 1;
                logs.logs.players[`user${interaction.user.id}`] =
                  logs.logs.players[`user${interaction.user.id}`] ?? {};
                logs.logs.players[`user${interaction.user.id}`].tradesopened =
                  logs.logs.players[`user${interaction.user.id}`]
                    .tradesopened ?? 0;
                logs.logs.players[`user${interaction.user.id}`].useropened += 1;
                logs.logs.players[`user${tradeuser.id}`] =
                  logs.logs.players[`user${tradeuser.id}`] ?? {};
                logs.logs.players[`user${tradeuser.id}`].tradesrequested =
                  logs.logs.players[`user${tradeuser.id}`].tradesrequested ?? 0;
                logs.logs.players[`user${tradeuser.id}`].tradesrequested += 1;
                await writelogs(logs);

                const yay = new ButtonBuilder()
                  .setCustomId("yay")
                  .setLabel("Yay")
                  .setEmoji("✔️")
                  .setStyle(ButtonStyle.Success);
                const nay = new ButtonBuilder()
                  .setCustomId("nay")
                  .setLabel("Nay")
                  .setEmoji("✖️")
                  .setStyle(ButtonStyle.Danger);
                const row1 = new ActionRowBuilder().addComponents(yay, nay);
                let accepts = [0, 0];
                const acceptemojis = ["👎", "✋", "👍"];
                let tradeembed = new EmbedBuilder()
                  .setColor(0x3b88c3)
                  .setTitle(
                    `**${tradeuser.globalName.replace(
                      /`/g,
                      ""
                    )}**, **${interaction.user.globalName.replace(
                      /`/g,
                      ""
                    )}** wants to trade with you!`
                  )
                  .setDescription(
                    `\`${interaction.user.globalName.replace(/`/g, "")}\`: ${
                      acceptemojis[accepts[0] + 1]
                    } \`${tradeuser.globalName.replace(/`/g, "")}\`: ${
                      acceptemojis[accepts[1] + 1]
                    }`
                  )
                  .addFields(
                    {
                      name: `${interaction.user.globalName.replace(
                        /`/g,
                        ""
                      )} wants:`,
                      value: `${theiremojifound.emoji} ${theiremojifound.names[0]}`,
                      inline: true,
                    },
                    {
                      name: `${tradeuser.globalName.replace(/`/g, "")} gets:`,
                      value: `${myemojifound.emoji} ${myemojifound.names[0]}`,
                      inline: true,
                    }
                  );
                const message = await interaction.reply({
                  components: [row1],
                  embeds: [tradeembed],
                  content: `<@${tradeuser.id}> <@${interaction.user.id}>`,
                });
                await dailyrewardremind(interaction);
                const collectorFilter = (i) =>
                  i.user.id == interaction.user.id || i.user.id == tradeuser.id;
                let collector = message.createMessageComponentCollector({
                  filter: collectorFilter,
                  time: 120000,
                });
                try {
                  collector.on("collect", async (interaction2) => {
                    if (interaction2.customId === "yay") {
                      if (interaction2.user.id == interaction.user.id) {
                        accepts[0] = 1;
                      }
                      if (interaction2.user.id == tradeuser.id) {
                        accepts[1] = 1;
                      }
                    }
                    if (interaction2.customId === "nay") {
                      if (interaction2.user.id == interaction.user.id) {
                        accepts[0] = -1;
                      }
                      if (interaction2.user.id == tradeuser.id) {
                        accepts[1] = -1;
                      }
                    }
                    tradeembed.setDescription(
                      `\`${interaction.user.globalName.replace(/`/g, "")}\`: ${
                        acceptemojis[accepts[0] + 1]
                      } \`${tradeuser.globalName.replace(/`/g, "")}\`: ${
                        acceptemojis[accepts[1] + 1]
                      }`
                    );

                    if (
                      interaction2.customId === "yay" &&
                      accepts[0] == 1 &&
                      accepts[1] == 1
                    ) {
                      myvault = await getvault(interaction.user.id);
                      theirvault = await getvault(tradeuser.id);
                      myviewemojiid = myvault.find(
                        (x) =>
                          emojis[x]?.id == (myemojifound)?.id
                      );
                      theirviewemojiid = theirvault.find(
                        (x) =>
                          emojis[x]?.id ==
                          (theiremojifound)?.id
                      );
                      interaction.editReply({
                        embeds: [tradeembed],
                        components: [],
                      });
                      if (myviewemojiid && theirviewemojiid) {
                        myvault.splice(myvault.indexOf(myemojifound.id), 1);
                        theirvault.splice(
                          theirvault.indexOf(theiremojifound.id),
                          1
                        );
                        await database.set(
                          interaction.user.id + "vault",
                          myvault.join(",") + ","
                        );
                        await database.set(
                          tradeuser.id + "vault",
                          theirvault.join(",") + ","
                        );
                        let rawvault1 = await database.get(
                          interaction.user.id + "vault"
                        );
                        let rawvault2 = await database.get(
                          tradeuser.id + "vault"
                        );
                        await database.set(
                          interaction.user.id + "vault",
                          rawvault1 + theiremojifound.id + ","
                        );
                        await database.set(
                          tradeuser.id + "vault",
                          rawvault2 + myemojifound.id + ","
                        );

                        interaction2.reply({
                          content: `**Success!** ${theiremojifound.emoji} ⇄ ${myemojifound.emoji}`,
                        });
                        let logs = await getlogs();
                        logs.logs.games.tradescompleted =
                          logs.logs.games.tradescompleted ?? 0;
                        logs.logs.games.tradescompleted += 1;
                        logs.logs.players[`user${interaction.user.id}`] =
                          logs.logs.players[`user${interaction.user.id}`] ?? {};
                        logs.logs.players[
                          `user${interaction.user.id}`
                        ].tradescompleted =
                          logs.logs.players[`user${interaction.user.id}`]
                            .tradescompleted ?? 0;
                        logs.logs.players[
                          `user${interaction.user.id}`
                        ].useropened += 1;
                        logs.logs.players[`user${tradeuser.id}`] =
                          logs.logs.players[`user${tradeuser.id}`] ?? {};
                        logs.logs.players[
                          `user${tradeuser.id}`
                        ].tradescompleted =
                          logs.logs.players[`user${tradeuser.id}`]
                            .tradescompleted ?? 0;
                        logs.logs.players[
                          `user${tradeuser.id}`
                        ].tradescompleted += 1;
                        await writelogs(logs);
                      } else {
                        interaction2.reply({
                          content: "This trade can't be completed anymore!",
                        });
                      }
                    } else {
                      interaction2.update({ embeds: [tradeembed] });
                    }
                  });
                } catch (e) {
                  console.error(e);
                  interaction.editReply({
                    components: [],
                  });
                }
              } else {
                await interaction.reply({
                  content: `Those two emojis are different rarities (**${
                    raritynames[(myemojifound ?? { rarity: -1 }).rarity] ??
                    "N/A"
                  }** and **${
                    raritynames[(theiremojifound ?? { rarity: -1 }).rarity] ??
                    "N/A"
                  }**) and can't be traded.`,
                  flags: "Ephemeral",
                });
              }
            } else {
              await interaction.reply({
                content: `**Legendary** Emojis can't be traded.`,
                flags: "Ephemeral",
              });
            }
          } else {
            await interaction.reply({
              content: `<@${tradeuser.id}> doesn't have an emoji called "${iwant}."`,
              flags: "Ephemeral",
            });
          }
        } else {
          await interaction.reply({
            content: `You don't have an emoji called "${theyget}."`,
            flags: "Ephemeral",
          });
        }
      } else {
        if (interaction.user.id == tradeuser.id) {
          await interaction.reply({
            content: `You can't trade with yourself!`,
            flags: "Ephemeral",
          });
        } else {
          await interaction.reply({
            content: `You can't trade with apps!`,
            flags: "Ephemeral",
          });
        }
      }
    }
  },
};
