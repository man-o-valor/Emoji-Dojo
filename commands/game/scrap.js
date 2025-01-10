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
				let progresssquares = [
					["<:startbar1:1326207319004024832>","<:startbar2:1326207327858200646>","<:startbar3:1326207335324188752>","<:startbar4:1326207342823604325>","<:startbar5:1326207351631384698>"],
					["<:bar1:1326207360166789200>","<:bar2:1326207385462636586>","<:bar3:1326207371621699676>","<:bar4:1326207378340708474>","<:bar5:1326207393343737858>"],
					["<:endbar1:1326207400860061736>","<:endbar2:1326207409470967869>","<:endbar3:1326207416857002034>","<:endbar4:1326207424788562041>","<:endbar5:1326207432644362291>"]
				]
				let progressbar = progresssquares[0][Math.min(userlab[i]%40,4)]
				progressbar += progresssquares[1][4].repeat(Math.floor(userlab[i] % 40 / 4)-1)
				progressbar += ((userlab[i] % 40 > 35) ? "" : progresssquares[1][userlab[i] % 40 % 4])
				progressbar += progresssquares[1][0].repeat(8-Math.floor(userlab[i] % 40 / 4))
				progressbar += progresssquares[2][4-Math.min(40-(userlab[i]%40),4)]

				embeddescription += `${classes[i].emoji} **${classes[i].name}:** ${userlab[i]%40}/40 | Reward: ${rewardemoji}\n${progressbar}\n<:divider1:1327378203156676810><:divider2:1327378216540962869><:divider2:1327378216540962869><:divider2:1327378216540962869><:divider2:1327378216540962869><:divider2:1327378216540962869><:divider2:1327378216540962869><:divider2:1327378216540962869><:divider2:1327378216540962869><:divider3:1327378225512316938>\n`
			}
		}
		if (embeddescription == "") {
			embeddescription = "You haven't devoted any emojis yet."
		}
		const labembed = new EmbedBuilder()
			.setColor(0x9266CC)
			.setTitle(`Devotions 🛐`)
			.setDescription("<:divider1:1327378203156676810><:divider2:1327378216540962869><:divider2:1327378216540962869><:divider2:1327378216540962869><:divider2:1327378216540962869><:divider2:1327378216540962869><:divider2:1327378216540962869><:divider2:1327378216540962869><:divider2:1327378216540962869><:divider3:1327378225512316938>\n" + embeddescription)
			.setTimestamp()
			.setFooter({ text: `${interaction.user.globalName}'s Devotions`});
		await interaction.reply({embeds:[labembed]});
	},
};

