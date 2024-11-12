const { SlashCommandBuilder,ButtonBuilder,ButtonStyle,ActionRowBuilder } = require('discord.js');
const {getsquad,emojis,playturn,database,coinschange,trysetupuser} = require('../../data.js')
const lodash = require('lodash');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('battleuser')
		.setDescription('Battle another user, with the chance of losing coins. (You must have 40 coins to battle a user)')
		.addUserOption(option =>
			option
				.setName('user')
				.setDescription('The user to battle')
				.setRequired(true)),
	async execute(interaction) {
		const battleuser = interaction.options.getUser('user')
		if (await trysetupuser(interaction.user.id)) {
			await interaction.reply({ephemeral:true,content:`Greetings, <@${interaction.user.id}>! 😀 Run \`/squad\` first to set up your Squad.`});
		} else if (await trysetupuser(battleuser.id)) {
			await interaction.reply({ephemeral:true,content:`<@${battleuser.id}> doesn't have a Squad yet! Show them how to use \`/squad\` and then you can battle.`});
		} else {
			if (battleuser.globalName != undefined && battleuser.id != interaction.user.id) {
				const bp = await database.get(interaction.user.id + "battlepending") ?? "0"
				const bp2 = await database.get(battleuser.id + "battlepending") ?? "0"
				const coins = parseInt(await database.get(interaction.user.id + "coins") ?? "100")
				const coins2 = parseInt(await database.get(battleuser.id + "coins") ?? "100")
				if (coins<=40 || coins2<=40) {
					await interaction.reply({content:`Both users must have at least 40 🪙 to Battle! Use \`/friendlybattle\` to battle your friends with no money involved, or \`/battlebot\` to fight Dojobot and earn some 🪙!`,ephemeral:true})
				} else {
					if (bp < Date.now()/1000 && bp2 < Date.now()/1000) {
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

						let gamedata = {squads:[[],[]],emojitext:"",richtext:[],turn:0,player:[interaction.user.globalName,battleuser.globalName],playerturn:1}
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
									await interaction2.reply(`<@${interaction.user.id}> vs <@${battleuser.id}>\nLet the battle begin!\n`)
									function delay(time) {
										return new Promise(resolve => setTimeout(resolve, time));
									}
									let prevturn = lodash.cloneDeep(gamedata.squads)
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
											richtextsnippet += gamedata.richtext[gamedata.richtext.length - 5].replace(/\n/g, "\n-# ")
											numberhidden --
										}
										if (gamedata.richtext.length>3) {
											richtextsnippet += gamedata.richtext[gamedata.richtext.length - 4].replace(/\n/g, "\n-# ")
											numberhidden --
										}
										if (gamedata.richtext.length>2) {
											richtextsnippet += gamedata.richtext[gamedata.richtext.length - 3].replace(/\n/g, "\n-# ")
											numberhidden --
										}
										if (gamedata.richtext.length>1) {
											richtextsnippet += gamedata.richtext[gamedata.richtext.length - 2].replace(/\n/g, "\n-# ")
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
										await delay(4000)
									}
									await database.set(interaction.user.id + "battlepending","0")
									await database.set(battleuser.id + "battlepending","0")
									if (gamedata.turn>=200 || (gamedata.squads[0].length == 0 && gamedata.squads[1].length == 0)) {
										await interaction2.channel.send(`🏳️ The match ended in a draw...`)
									} else {
										if (gamedata.squads[1].length == 0) {
											diff1 = await coinschange(interaction.user.id,gamedata.squads[0].length*20)
											diff2 = diff1*-0.25
											await coinschange(battleuser.id,diff2)
											await interaction2.channel.send(`<@${interaction.user.id}> is the winner!\n${interaction.user.globalName}: +${diff1} 🪙\n${battleuser.globalName}: ${diff2} 🪙`)
											
										}
										if (gamedata.squads[0].length == 0) {
											diff1 = await coinschange(battleuser.id,gamedata.squads[1].length*20)
											diff2 = diff1*-0.25
											await coinschange(interaction.user.id,diff2)
											await interaction2.channel.send(`<@${battleuser.id}> is the winner!\n${battleuser.globalName}: +${diff1} 🪙\n${interaction.user.globalName}: ${diff2} 🪙`)
										}
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
					await interaction.reply({content:`You cannot battle right now! You'll be able to <t:${bp}:R>, or when your current Battle is over.`,ephemeral:true})
					}
				}
			} else {
				if (interaction.user.id == battleuser.id) {
					await interaction.reply({content:`You cannot battle yourself!`,ephemeral:true})
				} else {
					await interaction.reply({content:`You cannot battle apps!`,ephemeral:true})
				}
			}
		}
	},
};

