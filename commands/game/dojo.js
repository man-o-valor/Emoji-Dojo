const { SlashCommandBuilder,EmbedBuilder } = require('discord.js');
const {getvault,emojis,raritysymbols,raritynames,trysetupuser} = require('../../data.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dojo')
		.setDescription('View your Dojo of Emojis')
		.addStringOption(option =>
			option.setName('emoji')
				.setDescription('The Emoji to view details of (optional)')),
	async execute(interaction) {
		if (await trysetupuser(interaction.user.id)) {
			await interaction.reply({ephemeral:true,content:`Greetings, <@${interaction.user.id}>! 😀 Run \`/squad\` first to set up your Squad.`});
		} else {
			const vaultarray = await getvault(interaction.user.id)
			console.log(vaultarray)
			const viewemoji = interaction.options.getString("emoji")
			//await coinschange(interaction.user.id,-1)
			if (viewemoji) {
				const viewemojiid = vaultarray.find(x => emojis[x].name.replace(/\s+/g, '_').toLowerCase() == viewemoji.replace(/\s+/g, '') || emojis[x].emoji == viewemoji.replace(/\s+/g, ''))
				const existingemojiid = emojis.find(x => emojis[x].name.replace(/\s+/g, '_').toLowerCase() == viewemoji.replace(/\s+/g, '') || emojis[x].emoji == viewemoji.replace(/\s+/g, ''))
				if (viewemojiid || existingemojiid.rarity==-1) {
					const vaultembed = new EmbedBuilder()
						.setColor(0xC1694F)
						.setTitle(`${emojis[viewemojiid].emoji} ${emojis[viewemojiid].name}`)
						.setDescription(`Health: **${emojis[viewemojiid].hp}**\nAttack: **${emojis[viewemojiid].dmg}**\nRarity: **${raritysymbols[emojis[viewemojiid].rarity]} ${raritynames[emojis[viewemojiid].rarity]}**\nAbility:\n> ${emojis[viewemojiid].description}`)
						.setTimestamp()
						.setFooter({ text: `You have ${vaultarray.reduce((acc, curr) => (curr === viewemojiid ? acc + 1 : acc), 0)}`})
					await interaction.reply({embeds:[vaultembed]});
				} else {
					await interaction.reply({content:`You don't have the "${viewemoji}" emoji, or it doesn't exist.`,ephemeral:true});
				}
			} else {
				let vaulttext = ["","","",""]
				let vaultnumbers = [0,0,0,0]
				let emojisgoneover = []
				for (let i = 0; i < vaultarray.length; i++) {
					let rarity = emojis[vaultarray[i]].rarity;
					if (rarity >= 0 && !emojisgoneover.includes(vaultarray[i])) {
						emojisgoneover.push(vaultarray[i])
						let numberihave = vaultarray.reduce((acc, curr) => (curr === vaultarray[i] ? acc + 1 : acc), 0)
						if (vaulttext[rarity] != "") {
							vaulttext[rarity] += `, `
						}
						vaulttext[rarity] += `${emojis[vaultarray[i]].emoji}`
						vaultnumbers[rarity] += numberihave
						if (numberihave>1) {
							vaulttext[rarity] += ` x${numberihave}`
						}
					}
				}
				let desc = ""
				if (vaultnumbers[0]>0) {
					desc += `## Common Emojis *️⃣\n${vaulttext[0]}\n`
				}
				if (vaultnumbers[1]>0) {
					desc += `## Rare Emojis ✳️\n${vaulttext[1]}\n`
				}
				if (vaultnumbers[2]>0) {
					desc += `## Special Emojis ⚛️\n${vaulttext[2]}\n`
				}
				if (vaultnumbers[3]>0) {
					desc += `## Legendary Emojis 💟\n${vaulttext[3]}`
				}
				const vaultembed = new EmbedBuilder()
					.setColor(0xC1694F)
					.setTitle(`${interaction.user.globalName}'s Dojo`)
					.setDescription(`Run \`/dojo [emoji]\` to view details on a specific emoji.\n` + desc)
					.setTimestamp()
					.setFooter({ text: `${vaultnumbers[0]} Common, ${vaultnumbers[1]} Rare, ${vaultnumbers[2]} Special`}); // , ${vaultnumbers[3]} Legendary
				await interaction.reply({embeds:[vaultembed]});
			}
		}
	},
};

