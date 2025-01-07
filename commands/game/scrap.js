const { SlashCommandBuilder,EmbedBuilder } = require('discord.js');
const {classes,emojis,trysetupuser,fetchresearch} = require('../../data.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('devotions')
		.setDescription('See your devotion progress towards Master emojis'),
	async execute(interaction) {
		await trysetupuser(interaction.user)
		let userlab = await fetchresearch(interaction.user.id)
		let embeddescription = ""
		for (let i = 0; i < userlab.length; i++) {
			if (userlab[i] > 0) {
				let rewardemoji = "❔"
				if (userlab[i]>=40) {
					rewardemoji = emojis[classes[i].legendary].emoji
				}
				let progressbar = "⬜".repeat(Math.floor(userlab[i] % 40 / 4))
				let progresssquares = ["▪️","▫️","◽","◻️"]
				progressbar += progresssquares[userlab[i] % 40 % 4]
				progressbar += "▪️".repeat(9-Math.floor(userlab[i] % 40 / 4))

				embeddescription += `${classes[i].emoji} **${classes[i].name}:** ${userlab[i]%40}/40 | Reward: ${rewardemoji}\n${progressbar}\n\n`
				console.log(userlab[i] % 40);
			}
		}
		if (embeddescription == "") {
			embeddescription = "You haven't devoted any emojis yet."
		}
		const labembed = new EmbedBuilder()
			.setColor(0x9266CC)
			.setTitle(`Devotions 🛐`)
			.setDescription(embeddescription)
			.setTimestamp()
			.setFooter({ text: `${interaction.user.globalName}'s Devotions`});
		await interaction.reply({embeds:[labembed]});
	},
};

