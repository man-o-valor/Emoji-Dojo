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
    const mod = await database.get(id + "coinmod");
    const restocktime = await database.get(id + "coinrestock");
    let battlemsg = `❎ You need ${
      40 - coincount
    } more 🪙 to battle other users. Use \`/battlebot\` to earn some!`;
    if (coincount >= 40) {
      battlemsg = `✅ You have enough **Coins** to battle other users. Challenge your friends with \`/battleuser\`!`;
    }

    const modmsg = `\n\nYour **Coin Modifier** is currently **x${mod}**. When you win a Battle, you will get this much times how many Emojis you have undefeated. It will reset back to 20 at <t:${restocktime}:t>.`

    const coindoubler =
      (await database.get(interaction.user.id + "coindoubler")) ?? 0;
    let coindoublermsg = "";
    if (coindoubler > 0) {
      coindoublermsg = `\n\n💫 You have x${coindoubler} **Coin Doublers**! When you win a Battle, you'll get more coins for each Coin Doubler you have.`;
    }

    const coinembed = new EmbedBuilder()
      .setColor(0xffac33)
      .setTitle(`Coins: ${coincount} 🪙`)
      .setDescription(battlemsg + modmsg + coindoublermsg)
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
