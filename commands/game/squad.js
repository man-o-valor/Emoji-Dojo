const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { emojis } = require("../../data.js");
const {
  getsquad,
  trysetupuser,
  getlogs,
  writelogs,
} = require("../../functions.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("squad")
    .setDescription("View and edit your Squad of Emojis to battle others with"),
  async execute(interaction) {
    all: {
      await trysetupuser(interaction.user);
      let squadarray = await getsquad(interaction.user.id);
      let squadtext = "";
      for (let i = 7; i > -1; i--) {
        squadtext += `[${
          emojis[squadarray[i]].emoji
        }](https://discord.com/channels/${interaction.guild.id}/${
          interaction.channel.id
        } \"${emojis[squadarray[i]].names[0]} | ${
          emojis[squadarray[i]].hp
        } health, ${emojis[squadarray[i]].dmg} attack power. ${
          emojis[squadarray[i]].description
        }\") `;
      }
      const edit = new ButtonBuilder()
        .setCustomId("edit")
        .setLabel("Edit")
        .setEmoji("✏️")
        .setStyle(ButtonStyle.Secondary);
      const squadembed = new EmbedBuilder()
        .setColor(0x226699)
        .setTitle(`${interaction.user.globalName}'s Squad 👥`)
        .setDescription(` \`🔙\` ${squadtext}`)
        .setFooter({
          text: `This is your Squad. Hover over your Emojis to read their descriptions. Add emojis to your squad with /dojo`,
        });
      const response = await interaction.reply({
        embeds: [squadembed],
        components: [
          /*row1*/
        ],
      });
      let logs = await getlogs();
      logs.logs.games.squadsviewed += 1;
      logs.logs.players[`user${interaction.user.id}`] =
        logs.logs.players[`user${interaction.user.id}`] ?? {};
      logs.logs.players[`user${interaction.user.id}`].squadsviewed =
        logs.logs.players[`user${interaction.user.id}`].squadsviewed ?? 0;
      logs.logs.players[`user${interaction.user.id}`].squadsviewed += 1;
      await writelogs(logs);
    }
  },
};
