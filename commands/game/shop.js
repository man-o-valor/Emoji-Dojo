const { SlashCommandBuilder,EmbedBuilder,ButtonBuilder,ButtonStyle,ActionRowBuilder,StringSelectMenuBuilder,StringSelectMenuOptionBuilder,ModalBuilder,TextInputBuilder,TextInputStyle } = require('discord.js');
const {emojis,database,coinschange,trysetupuser} = require('../../data.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('shop')
		.setDescription('Visit the Emoji Shop, where you can buy emojis with your Coins'),
	async execute(interaction) {
		if (await trysetupuser(interaction.user)) {
			await interaction.reply({ephemeral:true,content:`Greetings, <@${interaction.user.id}>! 😀 Run \`/squad\` first to set up your Squad.`});
		} else {
			const coincount = parseInt(await database.get(interaction.user.id + "coins")  ?? "100")

			let shoprestock = await database.get("shoprestock") ?? "0"

			if (parseInt(shoprestock) < Date.now() / 1000) {
				let now = new Date();
				let startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
				let noonToday = startOfDay.getTime() / 1000 + 43200;
				let timestamp = (startOfDay / 1000) + 43200
				if (Date.now() / 1000 < noonToday) {
					// If it's before 12:00 PM, set timestamp to 12:00 PM today
					timestamp = noonToday;
				} else {
					// If it's after 12:00 PM, set timestamp to 12:00 PM tomorrow
					timestamp = noonToday + 24 * 60 * 60; // Add 24 hours to noonToday
				}
				await database.set("shoprestock",timestamp)
				shoprestock = timestamp

				let emojilist = [emojis.filter(e => e.rarity == 0),emojis.filter(e => e.rarity == 1),emojis.filter(e => e.rarity == 2)]
				const newstring = emojilist[0][Math.floor(Math.random() * emojilist[0].length)].id + "," + emojilist[1][Math.floor(Math.random() * emojilist[1].length)].id + "," + emojilist[2][Math.floor(Math.random() * emojilist[2].length)].id + ","
				await database.set("shopoffers",newstring)
			}


			let shopoffers = await database.get("shopoffers") ?? "7,7,7,"
			let dailyemojis = shopoffers.split(',');
			dailyemojis.pop()
			dailyemojis[0] = parseInt(dailyemojis[0])
			dailyemojis[1] = parseInt(dailyemojis[1])
			dailyemojis[2] = parseInt(dailyemojis[2])

			const quotes = [
				"Need some emojis? This is the place!",
				"You have the coins, I have the emojis!",
				"A new caravan of emojis just joined my crew! Looking to trade?",
				"Herding these guys is hard work, but it sure is profitable!",
				"Say hi to Lennon for me!"
			]

			const quote = quotes[Math.floor(Math.random()*quotes.length)]

			let marketcontents

			marketcontents = 
`\n${emojis[dailyemojis[0]].emoji} **${emojis[dailyemojis[0]].names[0]}** (100 🪙)
${emojis[dailyemojis[1]].emoji} **${emojis[dailyemojis[1]].names[0]}** (200 🪙)
${emojis[dailyemojis[2]].emoji} **${emojis[dailyemojis[2]].names[0]}** (600 🪙)

:asterisk: **Random Common Emoji** (75 🪙)
✳️ **Random Rare Emoji** (150 🪙)
⚛️ **Random Special Emoji** (450 🪙)

🎁:asterisk: **Common Emoji Pack** (300 🪙)
🎁✳️ **Rare Emoji Pack** (1000 🪙)\n‎`

			let shopdata

			shopdata = [
			{label:emojis[dailyemojis[0]].names[0],emoji:emojis[dailyemojis[0]].emoji,type:'premoji',id:dailyemojis[0],cost:100,description:emojis[dailyemojis[0]].description},
			{label:emojis[dailyemojis[1]].names[0],emoji:emojis[dailyemojis[1]].emoji,type:'premoji',id:dailyemojis[1],cost:200,description:emojis[dailyemojis[1]].description},
			{label:emojis[dailyemojis[2]].names[0],emoji:emojis[dailyemojis[2]].emoji,type:'premoji',id:dailyemojis[2],cost:600,description:emojis[dailyemojis[2]].description},
			{label:`Random Common Emoji`,emoji:`:asterisk:`,type:'emoji',id:0,cost:75,description:"One random common emoji, ready to add to your Squad and use!"},
			{label:`Random Rare Emoji`,emoji:`✳️`,type:'emoji',id:1,cost:150,description:"One random rare emoji, ready to add to your Squad and use!"},
			{label:`Random Special Emoji`,emoji:`⚛️`,type:'emoji',id:2,cost:450,description:"One random special emoji, ready to add to your Squad and use!"},
			{label:`Common Emoji Pack`,emoji:`🎁:asterisk:`,type:'pack',id:0,cost:300,description:"‼️ **20% DISCOUNT!** Contains:\n>>> :asterisk: :asterisk: :asterisk: Common Emoji x3\n✳️ Rare Emoji x1"},
			{label:`Rare Emoji Pack`,emoji:`🎁✳️`,type:'pack',id:1,cost:1000,description:"‼️ **22% DISCOUNT!** Contains:\n>>> :asterisk: :asterisk: :asterisk: :asterisk: :asterisk: Common Emoji x5\n✳️ ✳️ ✳️ Rare Emoji x3\n⚛️ Special Emoji x1"},
			//{label:`Special Emoji Pack`,emoji:`🎁⚛️`,type:'pack',id:2,cost:2500,description:"Contains:\n>>> :asterisk: :asterisk: :asterisk: :asterisk: :asterisk: :asterisk: :asterisk: :asterisk: :asterisk: :asterisk: Common Emoji x10\n✳️ ✳️ ✳️ ✳️ ✳️ Rare Emoji x5\n⚛️ ⚛️ ⚛️ Special Emoji x3"},
			]

			const packcontents = [[0,0,0,1], [0,0,0,0,0,1,1,1,2]/*, [0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,2,2,2]*/]

			let options = shopdata.map((item, index) => {
				return {
					label: "(" + shopdata[index].cost + " 🪙) " + shopdata[index].emoji.replace(/:asterisk:/g, " *️⃣ ") + " " + shopdata[index].label,
					value: String(index),
					description: "[" + String(index+1) + "]"
				};
			});


			let shop = new ActionRowBuilder()
				.addComponents(
					new StringSelectMenuBuilder()
						.setCustomId('myDropdown')
						.setPlaceholder('Select an item')
						.setOptions(options.map(({ label, description, value }) => new StringSelectMenuOptionBuilder().setLabel(label).setDescription(description).setValue(value)))
				);

			const shopembed = new EmbedBuilder()
				.setColor(0x4E5058)
				.setTitle(`The Shop`)
				.setDescription(`<:denver:1303484366520844289> *${quote}*\n-# Emojis reroll <t:${shoprestock}:R>\n>>> ${marketcontents}\n`)
				.setTimestamp()
				.setFooter({ text: `You have ${coincount} 🪙`});

			const message = await interaction.reply({embeds:[shopembed], components:[shop], fetchReply:true});

			const collectorFilter = (i) => {
				return interaction.user.id == i.user.id && i.isStringSelectMenu();
			};

			let dropdownCollector = message.createMessageComponentCollector({ filter: collectorFilter, time: 60000 });

			const oldinteraction = interaction

			let choice

			try {dropdownCollector.on('collect', async (interaction) => {
					const $ = parseInt(await database.get(interaction.user.id + "coins")  ?? "100")
					choice = parseInt(interaction.values[0])

					const shopembed = new EmbedBuilder()
						.setColor(0x4E5058)
						.setTitle(`${shopdata[choice].emoji} ${shopdata[choice].label}`)
						.setDescription(`**Costs ${shopdata[choice].cost}** 🪙 (you have ${$} 🪙)\n${shopdata[choice].description}`)
						.setTimestamp()
					
					const buy = new ButtonBuilder()
						.setCustomId('buy')
						.setLabel('Buy One')
						.setStyle(ButtonStyle.Primary)
						.setEmoji('🛒');
					const buymore = new ButtonBuilder()
						.setCustomId('buymore')
						.setLabel('Buy More')
						.setStyle(ButtonStyle.Secondary)
						.setEmoji('🛒');
					if ($<shopdata[choice].cost) {
						buy.setDisabled(true)
						buy.setLabel("Not enough to buy")
						buy.setEmoji("💸")
						buy.setStyle(ButtonStyle.Secondary)
						buymore.setDisabled(true)
						buymore.setLabel("Not enough to buy more")
						buymore.setEmoji("💸")
					} else if ($<shopdata[choice].cost*2) {
						buymore.setDisabled(true)
						buymore.setLabel("Not enough to buy more")
						buymore.setEmoji("💸")
					}
					
					const bothrow = new ActionRowBuilder()
						.addComponents(buy,buymore)
					const buyrow = new ActionRowBuilder()
						.addComponents(buy)

					interaction.update({embeds:[shopembed], components:[bothrow] });
					
					const ButtonFilter = (i) => {
						return interaction.user.id == i.user.id && i.isButton();
					};

					let buttonCollector = message.createMessageComponentCollector({ filter: ButtonFilter, time: 60000 });

					try {buttonCollector.on('collect', async (newinteraction) => {

						const $ = parseInt(await database.get(interaction.user.id + "coins")  ?? "100")
						if ($<shopdata[choice].cost) {
							newinteraction.reply({content:makemessage("Oops, you don't have enough 🪙 to buy this anymore!",myfood),ephemeral:true})
						} else {
							let emojisbought = [[],[],[]]
							if (newinteraction.customId=="buymore") {
								const modal = new ModalBuilder()
									.setCustomId('buyModal')
									.setTitle(`Buy more!`);
								const buymoreinput = new TextInputBuilder()
									.setCustomId('buymoreinput')
									.setLabel("How many do you want to buy?")
									.setPlaceholder(`1 - ${Math.floor($/shopdata[choice].cost)}`)
									.setStyle(TextInputStyle.Short);
								const actionRow = new ActionRowBuilder().addComponents(buymoreinput);
								modal.addComponents(actionRow)
								await newinteraction.showModal(modal);
								newinteraction.awaitModalSubmit({ time: 60000 })
									.then(async newerinteraction => {
										let modalquantity = Math.min(parseInt(newerinteraction.fields.getTextInputValue("buymoreinput").toLowerCase()),Math.floor($/shopdata[choice].cost))
										if (isNaN(modalquantity) || modalquantity<1) {
											modalquantity = 1
										}
										if (shopdata[choice].type=="emoji") {
											await coinschange(interaction.user.id,-1*modalquantity*shopdata[choice].cost)
											buy.setDisabled(true)
											buy.setLabel(`You bought ${modalquantity}`)
											buy.setStyle(1)
											const emojilist = emojis.filter(e => e.rarity == shopdata[choice].id);
											let allemojistoadd = ""
											for (let i = 0; i < modalquantity; i++) {
												const emojitoadd = emojilist[Math.floor(Math.random() * emojilist.length)];
												allemojistoadd += emojitoadd.id + ","
												emojisbought[shopdata[choice].id].push(emojitoadd)
											}
											console.log(emojilist,allemojistoadd,emojisbought)
											let tempvault = await database.get(interaction.user.id+"vault")
											await database.set(interaction.user.id+"vault",tempvault + allemojistoadd)
										} else if (shopdata[choice].type=="pack") {
											await coinschange(interaction.user.id,-1*modalquantity*shopdata[choice].cost)
											buy.setDisabled(true)
											buy.setLabel(`You bought ${modalquantity}`)
											buy.setStyle(1)
											let emojistoadd = ""
											for (let i = 0; i < modalquantity; i++) {
												for (const a of packcontents[shopdata[choice].id]) {
													const emojilist = emojis.filter(e => e.rarity == a);
													let thisemoji = emojilist[Math.floor(Math.random() * emojilist.length)]
													emojistoadd += thisemoji.id + ","
													emojisbought[a].push(thisemoji)
												}
											}
											let tempvault = await database.get(interaction.user.id+"vault")
											await database.set(interaction.user.id+"vault",tempvault + emojistoadd)
										} else if (shopdata[choice].type=="premoji") {
											await coinschange(interaction.user.id,-1*modalquantity*shopdata[choice].cost)
											buy.setDisabled(true)
											buy.setLabel(`You bought ${modalquantity}`)
											buy.setStyle(1)
											let allemojistoadd = shopdata[choice].id + ","
											let tempvault = await database.get(interaction.user.id+"vault")
											await database.set(interaction.user.id+"vault",tempvault + allemojistoadd)
										}
										let emojiString = "";
										if (emojisbought[0][0] != undefined) {
											for (const e of emojisbought[0]) {
											emojiString += e.emoji + " ";
											}
											emojiString += "\n"
										}
										if (emojisbought[0][1] != undefined) {
											for (const e of emojisbought[1]) {
											emojiString += e.emoji + " ";
											}
											emojiString += "\n"
										}
										if (emojisbought[0][2] != undefined) {
											for (const e of emojisbought[2]) {
											emojiString += e.emoji + " ";
											}
										}
										newerinteraction.reply({content:`<@${interaction.user.id}> bought:\n>>> ${emojiString}`})
										interaction.editReply({components:[buyrow] });
									})
							} else if (shopdata[choice].type=="emoji") {
								await coinschange(interaction.user.id,-1*shopdata[choice].cost)
								buy.setDisabled(true)
								buy.setLabel(`You bought this`)
								buy.setStyle(1)
								const emojilist = emojis.filter(e => e.rarity == shopdata[choice].id);
								const emojitoadd = emojilist[Math.floor(Math.random() * emojilist.length)];
								emojisbought[shopdata[choice].id].push(emojitoadd)
								console.log(emojilist,emojitoadd)
								let tempvault = await database.get(interaction.user.id+"vault")
								await database.set(interaction.user.id+"vault",tempvault + emojitoadd.id + ",")
							} else if (shopdata[choice].type=="pack") {
								await coinschange(interaction.user.id,-1*shopdata[choice].cost)
								buy.setDisabled(true)
								buy.setLabel(`You bought this`)
								buy.setStyle(1)
								let emojistoadd = ""
								for (const a of packcontents[shopdata[choice].id]) {
									const emojilist = emojis.filter(e => e.rarity == a);
									let thisemoji = emojilist[Math.floor(Math.random() * emojilist.length)]
									emojistoadd += thisemoji.id + ","
									emojisbought[a].push(thisemoji)
								}
								let tempvault = await database.get(interaction.user.id+"vault")
								await database.set(interaction.user.id+"vault",tempvault + emojistoadd)
							}
							if (newinteraction.customId!="buymore") {
								let emojiString = "";
								for (const e of emojisbought[0]) {
									emojiString += e.emoji + " ";
								}
								emojiString += "\n"
								for (const e of emojisbought[1]) {
									emojiString += e.emoji + " ";
								}
								emojiString += "\n"
								for (const e of emojisbought[2]) {
									emojiString += e.emoji + " ";
								}
								newinteraction.reply({content:`🛒 <@${interaction.user.id}> bought:\n>>> ${emojiString}`})
								interaction.editReply({components:[buyrow] });
							}
						}
					})} catch(e) {
						console.log(e)
						interaction.update({ content: makemessage(`</market:1225095581211557937>\` ➡️ ${shopdata[choice].label.toLowerCase()}\` <:market:1208215514917117952>`,myfood), embeds: [shopembed], components: [] });
					}
			})} catch(e) {
				console.error(e)
			}
		}
	},
};

