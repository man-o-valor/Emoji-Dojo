const { SlashCommandBuilder,EmbedBuilder,ButtonBuilder,ButtonStyle,ActionRowBuilder } = require('discord.js');
const {getvault,emojis,raritysymbols,raritynames,trysetupuser,database,getsquad} = require('../../data.js')

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
			if (viewemoji) {
				const emojifound = emojis.find(x => x.name.replace(/\s+/g, '_').toLowerCase() == viewemoji.replace(/\s+/g, '') || x.emoji == viewemoji.replace(/\s+/g, ''))
				const viewemojiid = vaultarray.find(x => emojis[x].id == (emojifound ?? {id:undefined}).id)
				if (viewemojiid || emojifound.rarity==-1) {
					const vaultembed = new EmbedBuilder()
						.setColor(0xC1694F)
						.setTitle(`${emojifound.emoji} ${emojifound.name}`)
						.setDescription(`Health: **${emojifound.hp}**\nAttack: **${emojifound.dmg}**\nRarity: **${raritysymbols[emojifound.rarity] ?? "⬜"} ${raritynames[emojifound.rarity] ?? "N/A"}**\nAbility:\n> ${emojifound.description}`)
						.setTimestamp()
						.setFooter({ text: `You have ${vaultarray.reduce((acc, curr) => (curr === viewemojiid ? acc + 1 : acc), 0)}`})
					const addto1 = new ButtonBuilder()
						.setCustomId('addto1')
						.setLabel('Equip in slot 1')
						.setEmoji('1️⃣')
						.setStyle(ButtonStyle.Secondary);
					const addto2 = new ButtonBuilder()
						.setCustomId('addto2')
						.setLabel('Equip in slot 2')
						.setEmoji('2️⃣')
						.setStyle(ButtonStyle.Secondary);
					const addto3 = new ButtonBuilder()
						.setCustomId('addto3')
						.setLabel('Equip in slot 3')
						.setEmoji('3️⃣')
						.setStyle(ButtonStyle.Secondary);
					const addto4 = new ButtonBuilder()
						.setCustomId('addto4')
						.setLabel('Equip in slot 4')
						.setEmoji('4️⃣')
						.setStyle(ButtonStyle.Secondary);
					const addto5 = new ButtonBuilder()
						.setCustomId('addto5')
						.setLabel('Equip in slot 5')
						.setEmoji('5️⃣')
						.setStyle(ButtonStyle.Secondary);
					const addto6 = new ButtonBuilder()
						.setCustomId('addto6')
						.setLabel('Equip in slot 6')
						.setEmoji('6️⃣')
						.setStyle(ButtonStyle.Secondary);
					const addto7 = new ButtonBuilder()
						.setCustomId('addto7')
						.setLabel('Equip in slot 7')
						.setEmoji('7️⃣')
						.setStyle(ButtonStyle.Secondary);
					const addto8 = new ButtonBuilder()
						.setCustomId('addto8')
						.setLabel('Equip in slot 8')
						.setEmoji('8️⃣')
						.setStyle(ButtonStyle.Secondary);
					const row1 = new ActionRowBuilder()
						.addComponents(addto1,addto2,addto3,addto4);
					const row2 = new ActionRowBuilder()
						.addComponents(addto5,addto6,addto7,addto8);
					let comps = []
					let squadarray = await getsquad(interaction.user.id)
					let numberfound = squadarray.reduce((a, v) => (v === emojifound.id ? a + 1 : a), 0)
					let numberowned = vaultarray.reduce((a, v) => (v === emojifound.id ? a + 1 : a), 0)
					if (numberfound<=numberowned) {
						comps.push(row1)
						comps.push(row2)
					}
					const response = await interaction.reply({embeds:[vaultembed],components:comps,fetchReply: true});
					if (numberfound<=numberowned) {
						const collectorFilter = i => i.user.id == interaction.user.id
						let collector = response.createMessageComponentCollector({ filter: collectorFilter, time: 60000 });
						try {
							collector.on('collect', async (interaction2) => {
							let numberfound = squadarray.reduce((a, v) => (v === emojifound.id ? a + 1 : a), 0)
							if (numberfound<=numberowned) {
								squadarray[interaction2.customId[5]] = emojifound.id
								await database.set(interaction.user.id+"squad",squadarray.join(",") + ",")
								let squadtext = ""
								for (let i = 7; i > -1; i--) {
									squadtext += `[${emojis[squadarray[i]].emoji}](https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id} \"${emojis[squadarray[i]].name} | ${emojis[squadarray[i]].hp} health, ${emojis[squadarray[i]].dmg} attack power. ${emojis[squadarray[i]].description}\") `
								}
								await interaction2.reply({ephemeral:true,content:`Your squad has been saved!\n${squadtext}`})
							} else {
								await interaction2.reply({ephemeral:true,content:`⚠️ You don't have enough ${emojifound.emoji} to add one!`})
							}
						})} catch (e) {
							console.error(e)
						}
					}
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

