const { SlashCommandBuilder,EmbedBuilder,ButtonBuilder,ButtonStyle,ActionRowBuilder,ModalBuilder,TextInputBuilder,TextInputStyle } = require('discord.js');
const {emojis} = require('../../data.js')
const {getsquad,getvault,database,trysetupuser} = require('../../functions.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('squad')
		.setDescription('View and edit your Squad of Emojis to battle others with'),
	async execute(interaction) {
		all: {
			await trysetupuser(interaction.user)
			let squadarray = await getsquad(interaction.user.id)
			let squadtext = ""
			for (let i = 7; i > -1; i--) {
				squadtext += `[${emojis[squadarray[i]].emoji}](https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id} \"${emojis[squadarray[i]].names[0]} | ${emojis[squadarray[i]].hp} health, ${emojis[squadarray[i]].dmg} attack power. ${emojis[squadarray[i]].description}\") `
			}
			const edit = new ButtonBuilder()
				.setCustomId('edit')
				.setLabel('Edit')
				.setEmoji('✏️')
				.setStyle(ButtonStyle.Secondary);
			const row1 = new ActionRowBuilder()
					.addComponents(edit);
			const squadembed = new EmbedBuilder()
				.setColor(0x226699)
				.setTitle(`${interaction.user.globalName}'s Squad 👥`)
				.setDescription(` \`🔙\` ${squadtext}`)
				.setTimestamp()
				.setFooter({ text: `This is your Squad. Hover over your Emojis to read their descriptions`});
			const response = await interaction.reply({embeds:[squadembed],components:[row1]});

			const collectorFilter = i => i.user.id === interaction.user.id;

			try {
				const interaction2 = await response.awaitMessageComponent({ filter: collectorFilter, time: 60000 });
					if (interaction2.customId === 'edit') {
						interaction.editReply({components:[]})
						let vaultarray = await getvault(interaction.user.id)
						let vaulttext = ""
						let emojisgoneover = []
						for (let i = 0; i < vaultarray.length; i++) {
							if (!emojisgoneover.includes(vaultarray[i])) {
								emojisgoneover.push(vaultarray[i])
								let numberihave = vaultarray.reduce((acc, curr) => (curr === vaultarray[i] ? acc + 1 : acc), 0)
								vaulttext += `${emojis[vaultarray[i]].emoji} `
								if (numberihave>1) {
									vaulttext += `x${numberihave}, `
								}
							}
						}
						const ready = new ButtonBuilder()
							.setCustomId('ready')
							.setLabel('Ready!')
							.setStyle(ButtonStyle.Secondary);
						const row2 = new ActionRowBuilder()
							.addComponents(ready);
						const readyresponse = await interaction2.reply({content:`Here is a list of all the Emojis you have in your Dojo. Type out a message of 8 Emojis for your Squad and copy it.\nThis message will become your new Squad, from back to front (order matters!). Once you've copied it, click the button below.\n(Note: To read their abilities and stats, run \`/dojo\` with the name of the emoji.)\n\n${vaulttext}`,flags: 'Ephemeral',components:[row2]})
						const collectorFilter = i => i.user.id == interaction.user.id
						let collector
						try {
							collector = readyresponse.createMessageComponentCollector({ filter: collectorFilter, time: 120000 });
							console.log("I PASSED IT??? WHAT")
						} catch(e) {
							console.error(e)
						}
							try {
								collector.on('collect', async (interaction3) => {
									console.log("Got here")
									const modal = new ModalBuilder()
										.setCustomId('squadmodal')
										.setTitle(`Edit your Squad`);

									// Create the text input components
									const input = new TextInputBuilder()
										.setCustomId('input')
										.setLabel("Paste your dojo here")
										.setPlaceholder("\":hotdog::frenchfries::up_arrow::down_arrow:\" etc")
										.setStyle(TextInputStyle.Short);

									// An action row only holds one text input,
									// so you need one action row per text input.
									const firstActionRow = new ActionRowBuilder().addComponents(input);

									// Add inputs to the modal
									modal.addComponents(firstActionRow);

									// Show the modal to the user
									console.log("Got here 2")
									const modalresponse = await interaction3.showModal(modal);
									console.log("Got here 3")

									interaction3.awaitModalSubmit({ time: 60000 })
										.then(async interaction4 => {
											let input = interaction4.fields.getTextInputValue("input").replace(/\s+/g,'')
											let inputarr = []
											let errorflag = false
											let errorreason = ""
											if (input.includes(":")) {
												input.replace(/::/g,':')
												inputarr = input.split(":")
											} else {
												/*
												inputemojiarr = Array.from(input)
												for (let i = 0; i < inputemojiarr.length; i++) {
													console.log(inputemojiarr[i])
													inputarr.push(emojis.find(x => x.emoji == inputemojiarr[i]).names[0].replace(/\s+/g, '_').toLowerCase())
												}
												*/
												errorflag = true
												errorreason = "Emojis must be in text format, like \"`:smiley:`\"."
											}
											inputarr = inputarr.filter(item => item != '');

											if (inputarr.length < 8 && !errorflag) {
												errorflag = true
												errorreason = "Your Squad isn't formatted right! It's too short-- it needs 8 emojis in it. (Any extra will be ignored.)"
											}

											let emojiinput = ""
											let datainput = []
											
											if (!errorflag) {
												for (let i = 0; i < 8; i++) {
													let objectalternative = emojis.find(x => x.names[0].replace(/\s+/g, '_').toLowerCase() == inputarr[i])
													if (objectalternative != undefined) {
														if (vaultarray.find(x => x == objectalternative.id) != undefined) {
															vaultarray.splice(vaultarray.findIndex(x => x == objectalternative.id), 1);
															datainput = objectalternative.id + "," + datainput
															emojiinput += `[${objectalternative.emoji}](https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id} \"${objectalternative.names[0]} | ${objectalternative.hp} health, ${objectalternative.dmg} attack power. ${objectalternative.description}\") `
														} else {
															errorflag = inputarr[i]
															errorreason = "You don't have enough of an emoji listed, or it doesn't exist: "
															break
														}
													} else {
														errorflag = inputarr[i]
														errorreason = "You don't have enough of an emoji listed, or it doesn't exist: "
														break
													}
												}
											}

											if (errorflag) {
												if (errorreason == "You don't have enough of an emoji listed, or it doesn't exist: ") {
													await interaction4.reply({content:`You don't have enough of an emoji listed, or it doesn't exist: :${errorflag}:`,flags: 'Ephemeral'})
												} else {
													await interaction4.reply({content:errorreason,flags: 'Ephemeral'})
												}
											} else {
											// Checks out!
											const confirm = new ButtonBuilder()
												.setCustomId('confirm')
												.setLabel('Confirm')
												.setStyle(ButtonStyle.Success);
											const cancel = new ButtonBuilder()
												.setCustomId('cancel')
												.setLabel('Cancel')
												.setStyle(ButtonStyle.Danger);
											const row3 = new ActionRowBuilder()
												.addComponents(confirm,cancel);
											const lastresponse = await interaction4.reply({content:`Your Squad will be set to (hover over emojis to read info):\n${emojiinput}`,flags: 'Ephemeral',components:[row3]})
											try {
												const lastinteraction = await lastresponse.awaitMessageComponent({ filter: collectorFilter, time: 60000 });
												if (lastinteraction.customId === 'confirm') {
													await database.set(interaction.user.id+"squad",datainput)
													lastinteraction.reply({content:"Success!",flags: 'Ephemeral'})
												} else {
													lastinteraction.reply({content:"Edit cancelled.",flags: 'Ephemeral'})
												}
											} catch(e) {
												console.error(e)
											}
											}
										})
								})
							} catch(e) {
								console.error(e)
							}
					}
			} catch(e) {
				console.error(e)
			}
		}
	},
};

