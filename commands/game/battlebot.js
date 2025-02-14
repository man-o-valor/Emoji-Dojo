const { SlashCommandBuilder,ButtonBuilder,ButtonStyle,ActionRowBuilder } = require('discord.js');
const {emojis} = require('../../data.js')
const {getsquad,allemojisofrarity,playturn,database,coinschange,trysetupuser} = require('../../functions.js')
const lodash = require('lodash');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('battlebot')
		.setDescription('Battle DojoBot, with no chance of losing coins (You can reject Dojobot every 60 minutes)')
		.addStringOption(option =>
			option.setName('speed')
				.setDescription('The time in seconds between each turn (defaults to 4)')),
	async execute(interaction) {
		if (await trysetupuser(interaction.user)) {
			await interaction.reply({flags: 'Ephemeral',content:`Greetings, <@${interaction.user.id}>! 😀 Run \`/squad\` first to set up your Squad.`});
		} else {
			let battlespeed = parseInt(interaction.options.getString("speed") ?? "4")
			if (battlespeed<1) {
				battlespeed = 1
			}
			const bp = await database.get(interaction.user.id + "battlepending") ?? "0"
			const bbcd = "0"//await database.get(interaction.user.id + "botbattlecooldown") ?? "0"
			if (bp < Date.now()/1000 && bbcd < Date.now()/1000) {
				const cook = new ButtonBuilder()
					.setCustomId('battle')
					.setLabel('Battle!')
					.setEmoji('🆚')
					.setStyle(ButtonStyle.Success);
				const nah = new ButtonBuilder()
					.setCustomId('nah')
					.setLabel('Nah (Wait 1 hour)')
					.setEmoji('🕐')
					.setStyle(ButtonStyle.Danger);
				const row1 = new ActionRowBuilder()
					.addComponents(cook, nah);
				await database.set(interaction.user.id + "battlepending",60+Math.floor(Date.now()/1000))
				let player1squadarray = await getsquad(interaction.user.id)

				let player2squadarray = []
				for (let i = 0; i < 8; i++) {
					const possibleemojis = allemojisofrarity(emojis[player1squadarray[i]].rarity)
					player2squadarray.splice(Math.floor(Math.random() * (player2squadarray.length + 1)), 0, possibleemojis[Math.floor(Math.random()*possibleemojis.length)])
				}


				let player1squadtext = ""
				for (let i = 7; i > -1; i--) {
					player1squadtext += `${emojis[player1squadarray[i]].emoji} `
				}
				let player2squadtext = ""
				for (let i = 0; i < 8; i++) {
					player2squadtext += `${emojis[player2squadarray[i]].emoji} `
				}

				let gamedata = {squads:[[],[]],emojitext:"",richtext:[],turn:0,player:[interaction.user.globalName,"DojoBot"],playerturn:1,newlines:0,logfile:`${interaction.user.id} (${interaction.user.username}) vs Dojobot\n\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\nTurn 1`}
				for (let i = 0; i < 8; i++) {
					gamedata.squads[0].push(lodash.cloneDeep(emojis[player1squadarray[i]]))
				}
				for (let i = 0; i < 8; i++) {
					gamedata.squads[1].push(lodash.cloneDeep(emojis[player2squadarray[i]]))
				}

				gamedata.playerturn = Math.floor(Math.random()*2) + 1


				const response = await interaction.reply({components:[row1], content:`\`@DojoBot\`, <@${interaction.user.id}> wants to battle with you!\n\n\`${interaction.user.globalName.replace(/`/g, '')}'s\` ${player1squadtext}  \`🆚\`  ${player2squadtext} \`DojoBot's\` \`\`\` \`\`\``});
			
				const collectorFilter = i => i.user.id === interaction.user.id;

				try {
					const interaction2 = await response.awaitMessageComponent({ filter: collectorFilter, time: 60000 });
					if (interaction2.customId === 'battle') {
						await database.set(interaction.user.id + "battlepending",300+Math.floor(Date.now()/1000))
						await interaction2.reply(`<@${interaction.user.id}> vs \`@DojoBot\`\nLet the battle begin!\n`)
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
										if (!gamedata.newlines>4) {
											toadd = toadd.replace(/\n/g, "\n-# ")
										}
									richtextsnippet += toadd
									numberhidden --
								}
								if (gamedata.richtext.length>3) {
									let toadd = gamedata.richtext[gamedata.richtext.length - 4]
										if (!gamedata.newlines>3) {
											toadd = toadd.replace(/\n/g, "\n-# ")
										}
									richtextsnippet += toadd
									numberhidden --
								}
								if (gamedata.richtext.length>2) {
									let toadd = gamedata.richtext[gamedata.richtext.length - 3]
										if (!gamedata.newlines>2) {
											toadd = toadd.replace(/\n/g, "\n-# ")
										}
									richtextsnippet += toadd
									numberhidden --
								}
								if (gamedata.richtext.length>1) {
									let toadd = gamedata.richtext[gamedata.richtext.length - 2]
										if (!gamedata.newlines>1) {
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
								console.log(gamedata)
								await interaction2.editReply(`<@${interaction.user.id}> vs \`@DojoBot\`\nLet the battle begin! 🔃 Turn ${gamedata.turn}\n` + gamedata.emojitext + "\n\n" + richnumberhidden + richtextsnippet)
								await delay(battlespeed*1000)
							}
						} catch(e) {
							console.error(e)
							await interaction2.editReply(`<@${interaction.user.id}> vs \`@DojoBot\`\nLet the battle begin! 🔃 Turn ${gamedata.turn}\n` + gamedata.emojitext + "\n\n" + "🤒 An error has ocurred and the Battle cannot continue.\`\`\`" + e + "\`\`\`")
						}
						await database.set(interaction.user.id + "battlepending","0")
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
						} else {
							if (gamedata.squads[1].length == 0) {
								int3 = await interaction2.followUp({components:[row2], content:`<@${interaction.user.id}> is the winner! +${gamedata.squads[0].length*20} 🪙`})
								await coinschange(interaction.user.id,gamedata.squads[0].length*20)
							}
							if (gamedata.squads[0].length == 0) {
								int3 = await interaction2.followUp({components:[row2], content:`\`@DojoBot\` is the winner!`})
							}
						}
						const interaction3 = await int3.awaitMessageComponent({ time: 60000 });
						try {
							interaction3.reply({flags: 'Ephemeral', files: [{ attachment: txt, name: `${interaction.user.username} vs Dojobot.txt` }]})
						} catch(e) {
							exportbutton.setDisabled(true)
							interaction3.editReply({components:[row2]})
						}
					} else {
						await database.set(interaction.user.id + "botbattlecooldown",3600+Math.floor(Date.now()/1000))
						await interaction.editReply({components:[], content:`\`@DojoBot\`, <@${interaction.user.id}> wants to battle with you!\n\n\`${interaction.user.globalName.replace(/`/g, '')}\` ${player1squadtext}  \`🆚\`  ${player2squadtext} \`DojoBot's\`\nYou turned down DojoBot's Squad. You can battle DojoBot again in an hour.`});
					}
				} catch(e) {
					console.error(e)
					await database.set(interaction.user.id + "battlepending","0")
					await database.set(interaction.user.id + "botbattlecooldown",3600+Math.floor(Date.now()/1000))
					await interaction.editReply({components:[], content:`\`@DojoBot\`, <@${interaction.user.id}> wants to battle with you!\n\n\`${interaction.user.globalName.replace(/`/g, '')}\` ${player1squadtext}  \`🆚\`  ${player2squadtext} \`DojoBot's\``});
				}
			} else {
			await interaction.reply({content:`You cannot battle DojoBot right now! Come back <t:${Math.max(bp,bbcd)}:R>.`,flags: 'Ephemeral'})
			}
		}
	},
};

