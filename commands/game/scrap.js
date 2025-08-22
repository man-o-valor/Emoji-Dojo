const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
} = require("discord.js");
const { classes, emojis, devotionhelp } = require("../../data.js");
const {
  fetchresearch,
  trysetupuser,
  getlogs,
  writelogs,
  dailyrewardremind,
} = require("../../functions.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("devotions")
    .setDescription("See your devotion progress towards Master emojis"),
  async execute(interaction) {
    await trysetupuser(interaction.user);
    let userlab = await fetchresearch(interaction.user.id);
    let container = new ContainerBuilder();
    let labcovered = 0;
    for (let i = 0; i < userlab.length; i++) {
      if (userlab[i] > 0) {
        let rewardemoji = "❔";
        if (userlab[i] >= 40) {
          rewardemoji = emojis[classes[i].legendary].emoji;
        }
        let progresssquares = [
          [
            "<:startbar1:1326207319004024832>",
            "<:startbar2:1326207327858200646>",
            "<:startbar3:1326207335324188752>",
            "<:startbar4:1326207342823604325>",
            "<:startbar5:1326207351631384698>",
          ],
          [
            "<:bar1:1326207360166789200>",
            "<:bar2:1326207385462636586>",
            "<:bar3:1326207371621699676>",
            "<:bar4:1326207378340708474>",
            "<:bar5:1326207393343737858>",
          ],
          [
            "<:endbar1:1326207400860061736>",
            "<:endbar2:1326207409470967869>",
            "<:endbar3:1326207416857002034>",
            "<:endbar4:1326207424788562041>",
            "<:endbar5:1326207432644362291>",
          ],
        ];
        let progressbar = progresssquares[0][Math.min(userlab[i] % 40, 4)];
        progressbar += progresssquares[1][4].repeat(
          Math.max(Math.floor((userlab[i] % 40) / 4) - 1, 0)
        );
        progressbar +=
          userlab[i] % 40 > 35 || userlab[i] % 40 < 5
            ? ""
            : progresssquares[1][(userlab[i] % 40) % 4];
        progressbar += progresssquares[1][0].repeat(
          Math.max(8 - Math.floor((userlab[i] % 40) / 4), 0)
        );
        progressbar +=
          progresssquares[2][4 - Math.min(40 - (userlab[i] % 40), 4)];

        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `${classes[i].emoji} **${classes[i].name}:** ${
              userlab[i] % 40
            }/40 | Reward: ${rewardemoji}\n${progressbar}`
          )
        );
        labcovered += 1;
        container.addSeparatorComponents(
          new SeparatorBuilder()
            .setSpacing(SeparatorSpacingSize.Small)
            .setDivider(true)
        );
      }
    }

    if (labcovered == 0) {
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `☮️ You haven't devoted any emojis yet.`
        )
      );
    }

    let help = new ButtonBuilder()
      .setCustomId("help")
      .setLabel("Help")
      .setEmoji("❔")
      .setStyle(ButtonStyle.Primary);

    container.addActionRowComponents(
      new ActionRowBuilder().addComponents(help)
    );

    const response = await interaction.reply({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
    await dailyrewardremind(interaction);
    let logs = await getlogs();
    logs.logs.games.devotionsviewed += 1;
    logs.logs.players[`user${interaction.user.id}`] =
      logs.logs.players[`user${interaction.user.id}`] ?? {};
    logs.logs.players[`user${interaction.user.id}`].devotionsviewed =
      logs.logs.players[`user${interaction.user.id}`].devotionsviewed ?? 0;
    logs.logs.players[`user${interaction.user.id}`].devotionsviewed += 1;
    await writelogs(logs);

    const collectorFilter = (i) => i.user.id === interaction.user.id;

    try {
      const interaction2 = await response.awaitMessageComponent({
        filter: collectorFilter,
        time: 60000,
      });
      interaction2.reply({ flags: "Ephemeral", content: devotionhelp });
      help.setDisabled(true);
      interaction.editReply({ components: [row1] });
    } catch (e) {
      console.error(e);
      help.setDisabled(true);
      interaction.editReply({ components: [row1] });
    }
  },
};
