const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  ActionRowBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Get help about how Emoji Dojo works"),
  async execute(interaction) {
    const helpembed = new EmbedBuilder()
      .setColor(0xfa743e)
      .setTitle(`🙋 Emoji Dojo Help`)
      .setDescription(`See the buttons below for help.`);
    const guide = new ButtonBuilder()
      .setLabel("Emoji Dojo Guide")
      .setEmoji("🔖")
      .setURL(
        "https://gist.github.com/man-o-valor/77685fd4e2ecc804af6653b897c2b912"
      )
      .setStyle(ButtonStyle.Link);
    const terms = new ButtonBuilder()
      .setLabel("Terms of Service")
      .setEmoji("🔍")
      .setURL(
        "https://gist.github.com/man-o-valor/ff548d62fe212b080918bb67e951b450"
      )
      .setStyle(ButtonStyle.Link);
    const privacy = new ButtonBuilder()
      .setLabel("Privacy Policy")
      .setEmoji("🔒")
      .setURL(
        "https://gist.github.com/man-o-valor/69fbcaf911e3c2f0c700502576e68854"
      )
      .setStyle(ButtonStyle.Link);
    const row1 = new ActionRowBuilder().addComponents(guide);
    const row2 = new ActionRowBuilder().addComponents(terms);
    const row3 = new ActionRowBuilder().addComponents(privacy);
    await interaction.reply({
      embeds: [helpembed],
      components: [row1,row2,row3],
      flags: MessageFlags.Ephemeral,
    });
  },
};
