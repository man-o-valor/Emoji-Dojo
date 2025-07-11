const { Events } = require("discord.js");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(
        `No command matching ${interaction.commandName} was found.`
      );
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          flags: "Ephemeral",
          content: `There was an error with this command!\`\`\`${error.toString()}\`\`\``,
        });
      } else {
        await interaction.reply({
          flags: "Ephemeral",
          content: `There was an error with this command!\`\`\`${error.toString()}\`\`\``,
        });
      }
    }
  },
};
