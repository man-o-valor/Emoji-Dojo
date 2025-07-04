const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
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
    let coincd = parseInt(
      (await database.get(interaction.user.id + "coincooldown")) ??
        Math.floor(Date.now() / 1000)
    );
    if (coincd - Math.floor(Date.now() / 1000) > 86400) {
      coincd = Math.floor(Date.now() / 1000);
    }
    const coinsleft = parseInt(
      (await database.get(interaction.user.id + "coinsleft")) ?? 200
    );
    let battlemsg = `❎ You need ${
      40 - coincount
    } more 🪙 to battle other users. Use \`/battlebot\` to earn some!`;
    if (coincount >= 40) {
      battlemsg = `✅ You have enough 🪙 to battle other users. Challenge your friends with \`/battleuser\`!`;
    }

    const coindoubler =
      (await database.get(interaction.user.id + "coindoubler")) ?? 0;
    let coindoublermsg = "";
    if (coindoubler > 0) {
      coindoublermsg = `\n\n💫 You have x${coindoubler} Coin Doublers! When you win a Battle, you'll get more coins for each Coin Doubler you have.`;
    }

    const coinembed = new EmbedBuilder()
      .setColor(0xffac33)
      .setTitle(`Coins: ${coincount} 🪙`)
      .setDescription(
        `${battlemsg}\n\nUntil <t:${
          coincd + 86400
        }:t> you can earn up to ${coinsleft} 🪙. Afterwards, your possible 🪙 will refill to 200.${coindoublermsg}`
      )
      .setTimestamp()
      .setFooter({ text: `${interaction.user.globalName}'s Coins` });
    await interaction.reply({ embeds: [coinembed] });
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
