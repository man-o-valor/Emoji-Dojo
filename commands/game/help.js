const {
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  ActionRowBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder().setName("help").setDescription("Get help about how Emoji Dojo works"),
  async execute(interaction) {
    let helpcomponent = new ContainerBuilder()
      .addTextDisplayComponents(new TextDisplayBuilder().setContent("### 🙋 Emoji Dojo Help"))
      .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
      .addActionRowComponents(
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel("Emoji Dojo Guide")
            .setEmoji("🔖")
            .setURL("https://gist.github.com/man-o-valor/77685fd4e2ecc804af6653b897c2b912")
            .setStyle(ButtonStyle.Link),
          new ButtonBuilder()
            .setLabel("Join the server!")
            .setEmoji("👋")
            .setURL("https://discord.gg/eMwnjAY4ad")
            .setStyle(ButtonStyle.Link)
        )
      )
      .addActionRowComponents(
        new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId("credits").setLabel("Credits").setEmoji("👀").setStyle(ButtonStyle.Secondary)
        )
      )
      .addActionRowComponents(
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel("Terms of Service")
            .setEmoji("🔍")
            .setURL("https://gist.github.com/man-o-valor/ff548d62fe212b080918bb67e951b450")
            .setStyle(ButtonStyle.Link),
          new ButtonBuilder()
            .setLabel("Privacy Policy")
            .setEmoji("🔒")
            .setURL("https://gist.github.com/man-o-valor/69fbcaf911e3c2f0c700502576e68854")
            .setStyle(ButtonStyle.Link)
        )
      );
    const response = await interaction.reply({
      components: [helpcomponent],
      flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
    });

    try {
      const confirmation = await response.awaitMessageComponent({
        time: 60_000,
      });
      let creditscomponent = new ContainerBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("### <a:emojidojo:1389431944852537345> Emoji Dojo Credits")
        )
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            "Emoji Dojo is developed and updated by [Man-o-Valor](https://github.com/man-o-valor)!\nAlso, all custom emoji designs and iconography were made by him.\n\nThank you to [JDecked's Twemoji](https://github.com/jdecked/twemoji), the Emoji designs for Discord's Emojis.\n\nSome functions of Emoji Dojo were inspired by [Siglings](<https://www.cocrea.world/@Outrunfungus43/Siglings>) by Outrunfungus43. Give it a try if you like Emoji Dojo but you're looking for a roguelike round-based experience :)\n\nAnd finally, thank you for playing :^)"
          )
        );
      await confirmation.reply({
        components: [creditscomponent],
        flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
      });
    } catch (e) {
      console.error(e);
    }
  },
};
