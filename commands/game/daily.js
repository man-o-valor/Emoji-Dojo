const { SlashCommandBuilder,MessageFlags } = require('discord.js');
const {database,trysetupuser,getlogs,writelogs,coinschange} = require('../../functions.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('daily')
		.setDescription('Collect your Daily reward!'),
	async execute(interaction) {
		await trysetupuser(interaction.user)
		
		const dailytime = parseInt(await database.get(interaction.user.id + "dailytime") ?? "0")
		const comeBackLater = [
			`Your daily reward is still cooking! Come back <t:${dailytime}:R>`,
			`Your daily reward isn't ready to claim yet! Come back <t:${dailytime}:R>`,
			`Your daily reward needs a little more time. Come back <t:${dailytime}:R>`
		]

		const dailyCollect = [
			`You grabbed your daily reward and got`,
			`You opened your daily reward and found`,
			`You inspected your daily reward and discovered`,
			`You uncovered your daily reward and were met with`
		]


		let logs = await getlogs();
		
		if (Math.floor(Date.now()/1000) - dailytime > 86400) {
			let rewardName
			if (Math.random()>0.8) {
				let emojilist = emojis.filter(e => e.rarity == 0)
				const emojitoadd = emojilist[Math.floor(Math.random() * emojilist.length)];
				const rawvault = await database.get(user.id + "vault")
				await database.set(user.id+"vault",rawvault + emojitoadd.id + ",")
				rewardName =  + `${emojitoadd.emoji} ${emojitoadd} Emoji`
			} else {
				let amt = 10 + Math.floor(Math.random() * 15)
				await coinschange(interaction.user.id,amt)
				rewardName =  + `🪙 ${amt} Coins`
			}
			await interaction.reply({content: "<:open_box:1386870856034287717> " + dailyCollect[Math.floor(Math.random()*dailyCollect.length)] + " **" + rewardName + "!**", flags: MessageFlags.Ephemeral})

			logs.logs.games.dailysclaimed = (logs.logs.games.dailysclaimed ?? 0) + dailysclaimed
			logs.logs.players[`user${interaction.user.id}`] = logs.logs.players[`user${interaction.user.id}`] ?? {}
			logs.logs.players[`user${interaction.user.id}`].dailysclaimed = logs.logs.players[`user${interaction.user.id}`].dailysclaimed ?? 0
			logs.logs.players[`user${interaction.user.id}`].dailysclaimed += 1
		} else {
			await interaction.reply({content: "📦 " + comeBackLater[Math.floor(Math.random()*comeBackLater.length)], flags: MessageFlags.Ephemeral})
			
			logs.logs.games.dailysfailed = (logs.logs.games.dailysfailed ?? 0) + dailysfailed
			logs.logs.players[`user${interaction.user.id}`] = logs.logs.players[`user${interaction.user.id}`] ?? {}
			logs.logs.players[`user${interaction.user.id}`].dailysfailed = logs.logs.players[`user${interaction.user.id}`].dailysfailed ?? 0
			logs.logs.players[`user${interaction.user.id}`].dailysfailed += 1
		}

		await writelogs(logs)

		/*
		const coinsleft = parseInt(await database.get(interaction.user.id + "coinsleft") ?? 200)
		let battlemsg = `❎ You need ${40-coincount} more 🪙 to battle other users. Use \`/battlebot\` to earn some!`
		if (coincount>=40) {
			battlemsg = `✅ You have enough 🪙 to battle other users. Challenge your friends with \`/battleuser\`!`
		}
		const coinembed = new EmbedBuilder()
			.setColor(0xFFAC33)
			.setTitle(`Coins: ${coincount} 🪙`)
			.setDescription(`${battlemsg}\n\nUntil <t:${coincd+86400}:t> you can earn up to ${coinsleft} 🪙. Afterwards, your possible 🪙 will refill to 200.`)
			.setTimestamp()
			.setFooter({ text: `${interaction.user.globalName}'s Coins`});
		await interaction.reply({embeds:[coinembed]});
		*/
	},
};

