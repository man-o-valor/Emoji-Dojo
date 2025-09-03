const {
  SlashCommandBuilder,
  EmbedBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
} = require("discord.js");
const {
  database,
  trysetupuser,
  getlogs,
  writelogs,
  dailyrewardremind,
} = require("../../functions.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("coins")
    .setDescription("View your stash of Emoji Coins"),
  async execute(interaction) {
    await trysetupuser(interaction.user);
    // await database.set(interaction.user.id + "coins","10000")
    // this was for testing
    const coincount = parseInt(
      (await database.get(interaction.user.id + "coins")) ?? "100"
    );
    let mod = (await database.get(interaction.user.id + "coinmod")) ?? "16";
    let restocktime =
      (await database.get(interaction.user.id + "coinrestock")) ?? "0";

    if (parseInt(restocktime) < Date.now() / 1000) {
      let now = new Date();
      let startOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
      let midnight = startOfDay.getTime() / 1000;
      let noon = midnight + 43200;
      let nextReset;

      let currentTime = Date.now() / 1000;
      if (currentTime < noon) {
        nextReset = noon;
      } else if (currentTime < midnight + 86400) {
        nextReset = midnight + 86400;
      } else {
        nextReset = midnight + 129600;
      }

      await database.set(interaction.user.id + "coinmod", "16");
      await database.set(interaction.user.id + "coinrestock", nextReset);
      restocktime = nextReset;
    }

    let battlemsg = `❎ You need ${
      40 - coincount
    } more 🪙 to battle other users. Use \`/battlebot\` to earn some!`;
    if (coincount >= 40) {
      battlemsg = `✅ You have enough coins to battle other users`;
    }

    const coindoubler =
      (await database.get(interaction.user.id + "coindoubler")) ?? 0;
    let coindoublermsg = "";
    if (coindoubler > 0) {
      coindoublermsg = `\n\n💫 You have x${coindoubler} **Coin Doublers**! When you win a Battle, you'll get more coins for each Coin Doubler you have.`;
    }

    const coincontainer = new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`## Coins: ${coincount} 🪙`)
      )
      .addSeparatorComponents(
        new SeparatorBuilder()
          .setSpacing(SeparatorSpacingSize.Small)
          .setDivider(true)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(battlemsg + coindoublermsg)
      );
    await interaction.reply({
      components: [coincontainer],
      flags: MessageFlags.IsComponentsV2,
    });
    await dailyrewardremind(interaction);
    let logs = await getlogs();
    logs.logs.games.coinsviewed += 1;
    logs.logs.players[`user${interaction.user.id}`] =
      logs.logs.players[`user${interaction.user.id}`] ?? {};
    logs.logs.players[`user${interaction.user.id}`].coinsviewed =
      logs.logs.players[`user${interaction.user.id}`].coinsviewed ?? 0;
    logs.logs.players[`user${interaction.user.id}`].coinsviewed += 1;
    await writelogs(logs);
  },
};
