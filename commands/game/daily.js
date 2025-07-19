const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { emojis } = require("../../data.js");
const {
  database,
  trysetupuser,
  getlogs,
  writelogs,
  coinschange,
} = require("../../functions.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("daily")
    .setDescription("Collect your Daily reward!"),
  async execute(interaction) {
    await trysetupuser(interaction.user);

    const dailytime = parseInt(
      (await database.get(interaction.user.id + "dailytime")) ?? "0"
    );
    let dailystreak = parseInt(
      (await database.get(interaction.user.id + "dailystreak")) ?? "1"
    );
    const comeBackLater = [
      `Your daily reward is still cooking! Come back <t:${
        dailytime + 86400
      }:R>.`,
      `Your daily reward isn't ready to claim yet! Come back <t:${
        dailytime + 86400
      }:R>.`,
      `Your daily reward needs a little more time. Come back <t:${
        dailytime + 86400
      }:R>.`,
    ];

    const dailyCollect = [
      `You grabbed your daily reward and got`,
      `You opened your daily reward and found`,
      `You inspected your daily reward and discovered`,
      `You uncovered your daily reward and were met with`,
    ];

    let logs = await getlogs();

    if (Math.floor(Date.now() / 1000) - dailytime > 86400) {
      await database.set(
        interaction.user.id + "dailytime",
        Math.floor(Date.now() / 1000)
      );

      let rewardName;
      if (Math.random() > 0.8) {
        let emojilist = emojis.filter((e) => e.rarity == 0);
        const emojitoadd =
          emojilist[Math.floor(Math.random() * emojilist.length)];
        const rawvault = await database.get(interaction.user.id + "vault");
        await database.set(
          interaction.user.id + "vault",
          rawvault + emojitoadd.id + ","
        );
        rewardName = `${emojitoadd.emoji} ${emojitoadd.names[0]} Emoji`;
      } else {
        if (Math.random() > 0.6) {
          let amt =
            40 + 10 * Math.min(dailystreak, 5) + Math.floor(Math.random() * 20);
          const coindoubler =
            (await database.get(interaction.user.id + "coindoubler")) ?? 0;
          await database.set(
            interaction.user.id + "coindoubler",
            coindoubler + amt
          );
          rewardName = `💫 x${amt} Coin Doubler`;
        } else {
          let amt =
            20 + 10 * Math.min(dailystreak, 5) + Math.floor(Math.random() * 30);
          await coinschange(interaction.user.id, amt);
          rewardName = `🪙 ${amt} Coins`;
        }
      }
      if (Math.floor(Date.now() / 1000) - dailytime > 86400*2) {
        dailystreak = 0
      }
      await database.set(interaction.user.id + "dailystreak", dailystreak + 1);
      await interaction.reply({
        content:
          "<:open_box:1386870856034287717> " +
          dailyCollect[Math.floor(Math.random() * dailyCollect.length)] +
          " **" +
          rewardName +
          `!**${dailystreak > 0 ? ` *(❤️‍🔥 ${dailystreak + 1} day streak)*` : (Math.floor(Date.now() / 1000) - dailytime > 86400*2 ? ` *(streak lost)*` : "")}`,
      });

      logs.logs.games.dailysclaimed = (logs.logs.games.dailysclaimed ?? 0) + 1;
      logs.logs.players[`user${interaction.user.id}`] =
        logs.logs.players[`user${interaction.user.id}`] ?? {};
      logs.logs.players[`user${interaction.user.id}`].dailysclaimed =
        logs.logs.players[`user${interaction.user.id}`].dailysclaimed ?? 0;
      logs.logs.players[`user${interaction.user.id}`].dailysclaimed += 1;
    } else {
      await interaction.reply({
        content:
          "📦 " +
          comeBackLater[Math.floor(Math.random() * comeBackLater.length)],
        flags: MessageFlags.Ephemeral,
      });

      logs.logs.games.dailysfailed = (logs.logs.games.dailysfailed ?? 0) + 1;
      logs.logs.players[`user${interaction.user.id}`] =
        logs.logs.players[`user${interaction.user.id}`] ?? {};
      logs.logs.players[`user${interaction.user.id}`].dailysfailed =
        logs.logs.players[`user${interaction.user.id}`].dailysfailed ?? 0;
      logs.logs.players[`user${interaction.user.id}`].dailysfailed += 1;
    }

    await writelogs(logs);
  },
};
