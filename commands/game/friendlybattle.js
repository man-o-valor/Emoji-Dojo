const { SlashCommandBuilder,ButtonBuilder,ButtonStyle,ActionRowBuilder } = require('discord.js');
const {emojis,database} = require('../../data.js')
const {getsquad,playturn,database,trysetupuser,getlogs,writelogs} = require('../../functions.js')
const lodash = require('lodash');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('friendlybattle')
		.setDescription('Battle another user, with no coins at stake.')
		.addUserOption(option =>
			option
				.setName('user')
				.setDescription('The user to battle')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('speed')
				.setDescription('The time in seconds between each turn (defaults to 4)')),
	async execute(interaction) {
		const battleuser = interaction.options.getUser('user')
		let battlespeed = parseInt(interaction.options.getString("speed") ?? "4")
		if (battlespeed<1) {
			battlespeed = 1
		}
		if (await trysetupuser(interaction.user)) {
			await interaction.reply({flags: 'Ephemeral',content:`Greetings, <@${interaction.user.id}>! 😀 Run \`/squad\` first to set up your Squad.`});
		} else if (await trysetupuser(battleuser.id)) {
			await interaction.reply({flags: 'Ephemeral',content:`<@${battleuser.id}> doesn't have a Squad yet! Show them how to use \`/squad\` and then you can battle.`});
		} else {
			if (battleuser.globalName != undefined && battleuser.id != interaction.user.id) {
				let logs = await getlogs();
					logs.logs.games.friendlyopened += 1
					logs.logs.games.opened += 1
					logs.logs.players[`user${interaction.user.id}`] = logs.logs.players[`user${interaction.user.id}`] ?? {}
					logs.logs.players[`user${interaction.user.id}`].friendlyopened = logs.logs.players[`user${interaction.user.id}`].friendlyopened ?? 0
					logs.logs.players[`user${interaction.user.id}`].friendlyopened += 1
					logs.logs.players[`user${interaction.user.id}`].opened = logs.logs.players[`user${interaction.user.id}`].opened ?? 0
					logs.logs.players[`user${interaction.user.id}`].opened += 1
					logs.logs.players[`user${battleuser.id}`] = logs.logs.players[`user${battleuser.id}`] ?? {}
					logs.logs.players[`user${battleuser.id}`].friendlyrequested = logs.logs.players[`user${battleuser.id}`].friendlyrequested ?? 0
					logs.logs.players[`user${battleuser.id}`].friendlyrequested += 1
				await writelogs(logs)
					const cook = new ButtonBuilder()
						.setCustomId('battle')
						.setLabel('Battle!')
						.setEmoji('🆚')
						.setStyle(ButtonStyle.Success);
					const nah = new ButtonBuilder()
						.setCustomId('nah')
						.setLabel('Nah')
						.setEmoji('✖️')
						.setStyle(ButtonStyle.Danger);
					const row1 = new ActionRowBuilder()
						.addComponents(cook, nah);
					await database.set(interaction.user.id + "battlepending",60+Math.floor(Date.now()/1000))
					await database.set(battleuser.id + "battlepending",60+Math.floor(Date.now()/1000))
					let player1squadarray = await getsquad(interaction.user.id)

					let player2squadarray = await getsquad(battleuser.id)


					let player1squadtext = ""
					for (let i = 7; i > -1; i--) {
						player1squadtext += `${emojis[player1squadarray[i]].emoji} `
					}
					let player2squadtext = ""
					for (let i = 0; i < 8; i++) {
						player2squadtext += `${emojis[player2squadarray[i]].emoji} `
					}

					let gamedata = {squads:[[],[]],emojitext:"",richtext:[],turn:0,player:[interaction.user.globalName,battleuser.globalName],playerturn:1,newlines:0,logfile:`${interaction.user.id} (${interaction.user.username}) vs ${battleuser.id} (${battleuser.username})\nFriendly Battle\n\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\nTurn 1`}
					for (let i = 0; i < 8; i++) {
						gamedata.squads[0].push(lodash.cloneDeep(emojis[player1squadarray[i]]))
					}
					for (let i = 0; i < 8; i++) {
						gamedata.squads[1].push(lodash.cloneDeep(emojis[player2squadarray[i]]))
					}

					gamedata.playerturn = Math.floor(Math.random()*2) + 1

					let accepts = [0,0]

					const acceptemojis = ["👎","✋","👍"]

					const message = await interaction.reply({components:[row1], content:`<@${battleuser.id}>, <@${interaction.user.id}> wants to battle with you!\n\n\`${interaction.user.globalName.replace(/`/g, '')}'s\` ${player1squadtext}  \`🆚\`  ${player2squadtext} \`${battleuser.globalName.replace(/`/g, '')}'s\` \`\`\` \`\`\`\`${interaction.user.globalName.replace(/`/g, '')}\`: ${acceptemojis[accepts[0]+1]} \`${battleuser.globalName.replace(/`/g, '')}\`: ${acceptemojis[accepts[1]+1]}`});
				
					const collectorFilter = i => i.user.id == interaction.user.id || i.user.id == battleuser.id;
					let collector = message.createMessageComponentCollector({ filter: collectorFilter, time: 60000 });

					try {
						collector.on('collect', async (interaction2) => {
							if (interaction2.customId === 'battle') {
								if (interaction2.user.id == interaction.user.id) {
									accepts[0] = 1
								}
								if (interaction2.user.id == battleuser.id) {
									accepts[1] = 1
								}
							}
							if (interaction2.customId === 'nah') {
								if (interaction2.user.id == interaction.user.id) {
									accepts[0] = -1
								}
								if (interaction2.user.id == battleuser.id) {
									accepts[1] = -1
								}
							}
							if (interaction2.customId === 'battle' && accepts[0] == 1 && accepts[1] == 1) {
								interaction.editReply({content:`<@${battleuser.id}>, <@${interaction.user.id}> wants to battle with you!\n\n\`${interaction.user.globalName.replace(/`/g, '')}'s\` ${player1squadtext}  \`🆚\`  ${player2squadtext} \`${battleuser.globalName.replace(/`/g, '')}'s\` \`\`\` \`\`\`\`${interaction.user.globalName.replace(/`/g, '')}\`: ${acceptemojis[accepts[0]+1]} \`${battleuser.globalName.replace(/`/g, '')}\`: ${acceptemojis[accepts[1]+1]}`})
								await database.set(interaction.user.id + "battlepending",300+Math.floor(Date.now()/1000))
								await database.set(battleuser.id + "battlepending",300+Math.floor(Date.now()/1000))
								let logs = await getlogs();
								logs.logs.games.friendlystarted += 1
								logs.logs.games.started += 1
								logs.logs.players[`user${interaction.user.id}`].friendlystarted = logs.logs.players[`user${interaction.user.id}`].friendlystarted ?? 0
								logs.logs.players[`user${interaction.user.id}`].friendlystarted += 1
								logs.logs.players[`user${interaction.user.id}`].started = logs.logs.players[`user${interaction.user.id}`].started ?? 0
								logs.logs.players[`user${interaction.user.id}`].started += 1
								logs.logs.players[`user${battleuser.id}`].friendlystarted = logs.logs.players[`user${battleuser.id}`].friendlystarted ?? 0
								logs.logs.players[`user${battleuser.id}`].friendlystarted += 1
								logs.logs.players[`user${battleuser.id}`].started = logs.logs.players[`user${battleuser.id}`].started ?? 0
								logs.logs.players[`user${battleuser.id}`].started += 1
								await writelogs(logs)
								await interaction2.reply(`<@${interaction.user.id}> vs <@${battleuser.id}>\nLet the battle begin!\n`)
								function delay(time) {
									return new Promise(resolve => setTimeout(resolve, time));
								}
								let prevturn = lodash.cloneDeep(gamedata.squads)
								try {
									while (gamedata.turn<200 && gamedata.squads[0][0]!=null && gamedata.squads[1][0]!=null) {
										if (gamedata.turn%5 == 0) {
											prevturn = lodash.cloneDeep(gamedata.squads)
										}
										gamedata = playturn(gamedata)
										if (gamedata.turn%5 == 0 && lodash.isEqual(gamedata.squads,prevturn)) {
											gamedata.turn = 999
											break
										}
										let richtextsnippet = ""
										let numberhidden = gamedata.richtext.length
										if (gamedata.richtext.length>4) {
											let toadd = gamedata.richtext[gamedata.richtext.length - 5]
												if (gamedata.newlines<5) {
													toadd = toadd.replace(/\n/g, "\n-# ")
												}
											richtextsnippet += toadd
											numberhidden --
										}
										if (gamedata.richtext.length>3) {
											let toadd = gamedata.richtext[gamedata.richtext.length - 4]
												if (gamedata.newlines<4) {
													toadd = toadd.replace(/\n/g, "\n-# ")
												}
											richtextsnippet += toadd
											numberhidden --
										}
										if (gamedata.richtext.length>2) {
											let toadd = gamedata.richtext[gamedata.richtext.length - 3]
												if (gamedata.newlines<3) {
													toadd = toadd.replace(/\n/g, "\n-# ")
												}
											richtextsnippet += toadd
											numberhidden --
										}
										if (gamedata.richtext.length>1) {
											let toadd = gamedata.richtext[gamedata.richtext.length - 2]
												if (gamedata.newlines<2) {
													toadd = toadd.replace(/\n/g, "\n-# ")
												}
											richtextsnippet += toadd
											numberhidden --
										}
										richtextsnippet += gamedata.richtext[gamedata.richtext.length - 1]
										numberhidden --
										richtextsnippet += " 🔼"
										let richnumberhidden = ""
										if (numberhidden == 1) {
											richnumberhidden = "-# 1 line hidden"
										} else if (numberhidden > 0) {
											richnumberhidden = "-# " + numberhidden + " lines hidden"
										}
										await interaction2.editReply(`<@${interaction.user.id}> vs <@${battleuser.id}>\nLet the battle begin! 🔃 Turn ${gamedata.turn}\n` + gamedata.emojitext + "\n\n" + richnumberhidden + richtextsnippet)
										await delay(battlespeed*1000)
									}
								} catch(e) {
									console.error(e)
									await interaction2.editReply(`<@${interaction.user.id}> vs <@${battleuser.id}>\nLet the battle begin! 🔃 Turn ${gamedata.turn}\n` + gamedata.emojitext + "\n\n" + "🤒 An error has ocurred and the Battle cannot continue.\`\`\`" + e + "\`\`\`")
								}
								await database.set(interaction.user.id + "battlepending","0")
								await database.set(battleuser.id + "battlepending","0")
								const txt = Buffer.from(gamedata.logfile)
								let int3
								const exportbutton = new ButtonBuilder()
									.setCustomId('export')
									.setLabel('Download Battle Log')
									.setEmoji('📤')
									.setStyle(ButtonStyle.Primary);
								const row2 = new ActionRowBuilder()
									.addComponents(exportbutton);
								if (gamedata.turn>=200 || (gamedata.squads[0].length == 0 && gamedata.squads[1].length == 0)) {
									int3 = await interaction2.followUp({components:[row2], content:`🏳️ The match ended in a draw...`})
									let logs = await getlogs();
									logs.logs.games.friendlydraws += 1
									logs.logs.players[`user${interaction.user.id}`].friendlydraws = logs.logs.players[`user${interaction.user.id}`].friendlydraws ?? 0
									logs.logs.players[`user${interaction.user.id}`].friendlydraws += 1
									logs.logs.players[`user${battleuser.id}`].friendlydraws = logs.logs.players[`user${battleuser.id}`].friendlydraws ?? 0
									logs.logs.players[`user${battleuser.id}`].friendlydraws += 1
									for (let i = 7; i > -1; i--) {
										logs.logs.emojis[player2squadarray[i]].friendlydraws = logs.logs.emojis[player2squadarray[i]].friendlydraws ?? 0
										logs.logs.emojis[player2squadarray[i]].friendlydraws += 1
									}
									for (let i = 7; i > -1; i--) {
										logs.logs.emojis[player1squadarray[i]].friendlydraws = logs.logs.emojis[player1squadarray[i]].friendlydraws ?? 0
										logs.logs.emojis[player1squadarray[i]].friendlydraws += 1
									}
									await writelogs(logs)
								} else {
									if (gamedata.squads[1].length == 0) {
										int3 = await interaction2.followUp({components:[row2], content:`<@${interaction.user.id}> is the winner!`})// +${gamedata.squads[0].length*10} 🪙`)
										let logs = await getlogs();
										logs.logs.players[`user${interaction.user.id}`].friendlywins = logs.logs.players[`user${interaction.user.id}`].friendlywins ?? 0
										logs.logs.players[`user${interaction.user.id}`].friendlywins += 1
										logs.logs.players[`user${battleuser.id}`].friendlylosses = logs.logs.players[`user${battleuser.id}`].friendlylosses ?? 0
										logs.logs.players[`user${battleuser.id}`].friendlylosses += 1
										for (let i = 7; i > -1; i--) {
											logs.logs.emojis[player1squadarray[i]].friendlywins = logs.logs.emojis[player1squadarray[i]].friendlywins ?? 0
											logs.logs.emojis[player1squadarray[i]].friendlywins += 1
										}
										for (let i = 7; i > -1; i--) {
											logs.logs.emojis[player2squadarray[i]].friendlylosses = logs.logs.emojis[player2squadarray[i]].friendlylosses ?? 0
											logs.logs.emojis[player2squadarray[i]].friendlylosses += 1
										}
										await writelogs(logs)
									}
									if (gamedata.squads[0].length == 0) {
										int3 = await interaction2.followUp({components:[row2], content:`<@${battleuser.id}> is the winner!`})
										let logs = await getlogs();
										logs.logs.players[`user${interaction.user.id}`].friendlylosses = logs.logs.players[`user${interaction.user.id}`].friendlylosses ?? 0
										logs.logs.players[`user${interaction.user.id}`].friendlylosses += 1
										logs.logs.players[`user${battleuser.id}`].friendlywins = logs.logs.players[`user${battleuser.id}`].friendlywins ?? 0
										logs.logs.players[`user${battleuser.id}`].friendlywins += 1
										for (let i = 7; i > -1; i--) {
											logs.logs.emojis[player1squadarray[i]].friendlylosses = logs.logs.emojis[player1squadarray[i]].friendlylosses ?? 0
											logs.logs.emojis[player1squadarray[i]].friendlylosses += 1
										}
										for (let i = 7; i > -1; i--) {
											logs.logs.emojis[player2squadarray[i]].friendlywins = logs.logs.emojis[player2squadarray[i]].friendlywins ?? 0
											logs.logs.emojis[player2squadarray[i]].friendlywins += 1
										}
										await writelogs(logs)
									}
								}
								const interaction3 = await int3.awaitMessageComponent({ time: 60000 });
								try {
									interaction3.reply({flags: 'Ephemeral', files: [{ attachment: txt, name: `${interaction.user.username} vs Dojobot (friendly).txt` }]})
									let logs = await getlogs();
									logs.logs.games.friendlylogsrequested += 1
									logs.logs.players[`user${interaction3.user.id}`].friendlylogsrequested = logs.logs.players[`user${interaction3.user.id}`].friendlylogsrequested ?? 0
									logs.logs.players[`user${interaction3.user.id}`].friendlylogsrequested += 1
									await writelogs(logs)
								} catch(e) {
									exportbutton.setDisabled(true)
									interaction3.editReply({components:[row2]})
								}
							} else {
								interaction2.update({content:`<@${battleuser.id}>, <@${interaction.user.id}> wants to battle with you!\n\n\`${interaction.user.globalName.replace(/`/g, '')}'s\` ${player1squadtext}  \`🆚\`  ${player2squadtext} \`${battleuser.globalName.replace(/`/g, '')}'s\` \`\`\` \`\`\`\`${interaction.user.globalName.replace(/`/g, '')}\`: ${acceptemojis[accepts[0]+1]} \`${battleuser.globalName.replace(/`/g, '')}\`: ${acceptemojis[accepts[1]+1]}`})
							}
						})
					} catch(e) {
						console.error(e)
						await database.set(interaction.user.id + "battlepending","0")
						await interaction.editReply({components:[], content:`<@${battleuser.id}>, <@${interaction.user.id}> wants to battle with you!\n\n\`${interaction.user.globalName.replace(/`/g, '')}'s\` ${player1squadtext}  \`🆚\`  ${player2squadtext} \`${battleuser.globalName.replace(/`/g, '')}\` \`\`\` \`\`\`\`${interaction.user.globalName.replace(/`/g, '')}\`: ${acceptemojis[accepts[0]-1]} \`${battleuser.globalName.replace(/`/g, '')}\`: ${acceptemojis[accepts[1]-1]}`});
					}
			} else {
				if (interaction.user.id == battleuser.id) {
					await interaction.reply({content:`You cannot battle yourself!`,flags: 'Ephemeral'})
				} else {
					await interaction.reply({content:`You cannot battle apps!`,flags: 'Ephemeral'})
				}
			}
		}
	},
};

