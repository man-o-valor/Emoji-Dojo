const Keyv = require('keyv');
const lodash = require('lodash');

const database = new Keyv('sqlite://databases//database.sqlite',{namespace:"userdata"});

async function getvault(id) {
    //await database.set(id+"vault","0,1,2,3,4,5,6,8,9,10,11,12,13,14,15,16,17,18,19,20,22,23,0,1,2,3,4,5,6,8,")
    const rawvault = await database.get(id + "vault")
	let vault = rawvault.split(',');
	vault.pop()
    return vault
}

async function trysetupuser(user) {
    const rawvault = await database.get(user.id + "vault")
    const rawsquad = await database.get(user.id + "squad")
    if (rawvault == undefined || rawsquad == undefined) {
        let emojilist = emojis.filter(e => e.rarity == 0);
		let allemojistoadd = ""
        let allemojitext = ""
        for (let i = 0; i < 7; i++) {
		    const emojitoadd = emojilist[Math.floor(Math.random() * emojilist.length)];
		    allemojistoadd += emojitoadd.id + ","
            allemojitext += " " + emojitoadd.emoji
		}
        emojilist = emojis.filter(e => e.rarity == 1);
        for (let i = 0; i < 7; i++) {
		    const emojitoadd = emojilist[Math.floor(Math.random() * emojilist.length)];
	    	allemojistoadd += emojitoadd.id + ","
            allemojitext += " " + emojitoadd.emoji
		}
		await database.set(user.id+"vault",allemojistoadd)
        const welcomemessage = `# ⛩️😀 Welcome to the Emoji Dojo, <@${user.id}>! 🏯🎋
**It is here that you will over time hone your skills and master the art of Emoji Battles.**

## <:denver:1303484366520844289>💬 \`Denver\`
\`\`\`Hello! My name is Denver, and I'm in charge of wrangling these here emojis for you to battle with. Here, I'll give you this selection to start off with.\`\`\`

*(You received${allemojitext}!)*

\`\`\`That should be good enough to start with! Go ahead, you can get to know 'em.\`\`\`

*(Use </dojo:1277719095701143680> to see your collection of Emojis, and see details about each one.)*

\`\`\`When you're ready, organize them into a Squad optimized to battle others and create the best synergy.\`\`\`

*(Use </squad:1277719095701143681> to view or edit your Squad. You can also edit your squad from the </dojo:1277719095701143680>.)*

\`\`\`Finally, you can Battle! Engage your friends in a Battle, or lower the stakes with a Friendly Battle. If there's no one who wants to fight you, you can always battle Dojobot in a Bot Battle!\`\`\`

*(Use </battleuser:1279264987717570610> and </battlebot:1277719095701143677> to engage in Battles to earn Coins. You can also use </friendlybattle:1289287177875886161> to battle friends without worrying about losing Coins.)*

\`\`\`Once you have enough Coins, you can visit my Emoji Shop! I sell these little guys to aspiring battlers like you. Stop by when you're looking for an emoji!\`\`\`

*(You can use </coins:1277719095701143678> to see how many Coins you have, and </shop:1290417978734678098> to visit Denver's shop.)*`
		await user.send({content:welcomemessage})
        return true
    } else {
        return false
    }
}

async function coinschange(id,amt,affectcooldown) {
    affectcooldown = affectcooldown ?? true
    const originalamt = amt
    let coinsleft = 0
    if (affectcooldown) {
        const coincd = await database.get(id + "coincooldown")  ?? "0"
        if ((Date.now()/1000)-coincd > 86400) {
            await database.set(id + "coincooldown",Math.floor(Date.now()/1000))
            await database.set(id + "coinsleft","200")
        }
        coinsleft = parseInt(await database.get(id + "coinsleft") ?? "200")
        if (amt>0) {
            if (coinsleft-amt<0) {
                amt = coinsleft
                coinsleft = 0
            } else {
                coinsleft -= amt
            }
        }
        await database.set(id + "coinsleft",coinsleft)
    }
    if (amt>0 && originalamt>0) {
        let rawcoins = parseInt(await database.get(id + "coins")  ?? "100")
        rawcoins += amt
        await database.set(id + "coins",rawcoins)
        if (affectcooldown) {
            await database.set(id + "coinsleft",coinsleft-amt)
        }
    } else if (amt<0 && originalamt<0){
        let rawcoins = parseInt(await database.get(id + "coins")  ?? "100")
        rawcoins += amt
        await database.set(id + "coins",rawcoins)
    }
    console.log(originalamt)
    console.log(amt)
    console.log(coinsleft)
    return amt
}

async function getsquad(id) {
    let rawsquad = await database.get(id + "squad")
    if (rawsquad == undefined) {
        await database.set(id+"squad",await database.get(id+"vault"))
    }
    rawsquad = await database.get(id + "squad")
	let squad = rawsquad.split(',');
	squad.pop()
    return squad
}

function allemojisofrarity(rarity) {
    let returninfo = []
    for (i = 0; i < emojis.length; i++) {
        if (emojis[i].rarity == rarity) {
            returninfo.push(emojis[i].id)
        }
    }
    return returninfo
}

function richtextadd(gamedata,text) {
    gamedata.richtext.push(text)
    gamedata.logfile += text
    return gamedata
}

function alterhp(gamedata,squad,pos,squad2,pos2,val,verb,silence) {

    if ((gamedata.squads[squad2-1][pos] ?? {id:undefined}).id == 22) {// rage
        val = -Math.min(val + gamedata.squads[squad-1].length,3)
    }
    // protection buffs start here 
    if ((gamedata.squads[squad-1][pos] ?? {id:undefined}).id == 2 && val < 0) {// relieved face
        val = Math.min(val + 1,-1)
    }
    if ((gamedata.squads[squad-1][pos] ?? {id:undefined}).id == 35 && val < 0) {// bricks
        val = Math.min(val + 2,-1)
    }
    if ((gamedata.squads[squad-1][pos] ?? {id:undefined}).id == 17) {// shield
        if (val < 0) {
            val = Math.min(val + gamedata.squads[squad-1].filter(x => x.id == 2).length,-1)
        } else {
            val = 0
            verb = "tried to " + (verb ?? "heal")
        }
    }
	if ((gamedata.squads[squad-1][pos] ?? {id:undefined}).id == 40 && val > 0) {// joker
        val = val + 1
    }
    if ((gamedata.squads[squad-1][pos] ?? {id:undefined}).id == 25) {// bricks
        if (val > 0) {
            val = 0
            verb = "tried to " + (verb ?? "heal")
        }
    }

    alter: {
        gamedata.squads[squad-1][pos].hp += val
		if (gamedata.squads[squad2-1][pos2].id == 42 && gamedata.squads[squad2-1].length > 1) { // dancer
            const temp = gamedata.squads[squad2-1][pos2]
            gamedata.squads[squad2-1].splice(pos2,1)
        	gamedata.squads[squad2-1].splice(pos2+1,0,temp)
            gamedata = richtextadd(gamedata,`\n💨 ${gamedata.player[squad2-1]}'s ${emojis[42].emoji} danced behind ${gamedata.squads[squad2-1][pos2].emoji}!`)
		}
        if (gamedata.squads[squad-1][pos].hp <= 0) {
            if (!silence) {
                gamedata = richtextadd(gamedata,`\n💥 ${gamedata.player[squad2-1]}'s ${gamedata.squads[squad2-1][pos2].emoji} defeated ${gamedata.player[squad-1]}'s ${gamedata.squads[squad-1][pos].emoji}! (${val*-1} damage)`)
            }
            if (gamedata.squads[squad2-1][pos2].id == 20) { // chess pawn
                gamedata.squads[squad2-1].splice(pos2,1)
                gamedata.squads[squad2-1].splice(pos2,0,lodash.cloneDeep(emojis[21]))
                gamedata = richtextadd(gamedata,`\n‼️ ${gamedata.player[squad2-1]}'s ${emojis[20].emoji} was promoted to a ${emojis[21].emoji}!`)
            }
            if (gamedata.squads[squad-1][pos].id == 9) { // mortar board
                for (i = 0; i < 3; i++) {
                    gamedata.squads[squad-1].splice(pos+1,0,lodash.cloneDeep(emojis[0]))
                    gamedata.squads[squad-1][pos+1].hp = 1
                }
                gamedata = richtextadd(gamedata,`\n‼️ ${gamedata.player[squad-1]}'s ${emojis[9].emoji} sparked a standing ovation and summoned ${emojis[0].emoji}${emojis[0].emoji}${emojis[0].emoji}!`)
            }
            if (gamedata.squads[squad-1][pos].id == 10) { // shuffle button
                gamedata = richtextadd(gamedata,`\n🔀 ${gamedata.player[squad-1]}'s ${emojis[10].emoji} Shuffled ${gamedata.player[squad2-1]}'s Squad!`)
                gamedata = shufflesquad(gamedata,squad2)
            }
	        if (gamedata.squads[squad-1][pos].id == 36) { // bomb
                gamedata = richtextadd(gamedata,`\n💥 ${gamedata.player[squad-1]}'s ${emojis[36].emoji} exploded, defeating ${gamedata.player[0-squad+2]}'s ${gamedata.squads[0-squad+2][0].emoji}!`)
		        gamedata = alterhp(gamedata,0-squad+3,0,squad,pos,-1000,"exploded",true)
            }
            for (i = 0; i < gamedata.squads[squad-1].length; i++) {
                if (gamedata.squads[squad-1][i].id == 11) { // tombstone
                    gamedata = alterhp(gamedata,squad,i,squad,i,1)
                }
            }
            for (i = 0; i < gamedata.squads[squad2-1].length-1; i++) {
                if (gamedata.squads[squad2-1][i].id == 25) { // skull and crossbones
                    gamedata = alterhp(gamedata,squad2,i+1,squad2,i,1)
                }
                if (gamedata.squads[squad2-1][i].id == 18) { // skull
                    gamedata = alterhp(gamedata,squad2,i,squad2,i,1)
                }
            }
            if (gamedata.squads[squad-1][pos].id == 41) { // tornado
                gamedata = richtextadd(gamedata,`\n🔀 ${gamedata.player[squad-1]}'s ${emojis[41].emoji} Shuffled ${gamedata.player[squad2-1]}'s Squad!`)
                gamedata = shufflesquad(gamedata,squad2)
            }
            gamedata.squads[squad-1].splice(pos,1)
        } else {
            if (val>0) { 
                if (!silence) {
                    if (squad == squad2 && pos == pos2) {
                        gamedata = richtextadd(gamedata,`\n💗 ${gamedata.player[squad2-1]}'s ${gamedata.squads[squad2-1][pos2].emoji} ${verb ?? "healed"} itself. (${val} health)`)
                    } else {
                        gamedata = richtextadd(gamedata,`\n💗 ${gamedata.player[squad2-1]}'s ${gamedata.squads[squad2-1][pos2].emoji} ${verb ?? "healed"} ${gamedata.player[squad-1]}'s ${gamedata.squads[squad-1][pos].emoji}. (${val} health)`)
                    }
                }
            } else if (val == 0) {
                if (!silence) {
                    gamedata = richtextadd(gamedata,`\n🤜 ${gamedata.player[squad2-1]}'s ${gamedata.squads[squad2-1][pos2].emoji} ${verb ?? "tried to attack"} ${gamedata.player[squad-1]}'s ${gamedata.squads[squad-1][pos].emoji}... but it did nothing.`)
                }
                if (gamedata.squads[squad-1][pos].id == 10) { // shuffle button (2)
                    gamedata.squads[squad-1].splice(pos,1)
                    gamedata = shufflesquad(gamedata,squad2)
                    gamedata = richtextadd(gamedata,`\n🔀 ${gamedata.player[squad-1]}'s ${emojis[10].emoji} Shuffled ${gamedata.player[squad2-1]}'s Squad, and defeated itself!`)
                }
                if (gamedata.squads[squad-1][pos].id == 9) { // mortar board (2)
                    gamedata.squads[squad-1].splice(pos,1)
                    for (i = 0; i < 3; i++) {
                        gamedata.squads[squad-1].splice(pos+1,0,lodash.cloneDeep(emojis[0]))
                        gamedata.squads[squad-1][pos+1].hp = 1
                    }
                    gamedata = richtextadd(gamedata,`\n‼️ ${gamedata.player[squad-1]}'s ${emojis[9].emoji} sparked a standing ovation and summoned ${emojis[0].emoji}${emojis[0].emoji}${emojis[0].emoji}, and defeated itself!`)
                }
		        if (gamedata.squads[squad-1][pos].id == 36) { // bomb (2)
                    gamedata = alterhp(gamedata,0-squad+3,0,squad,pos,-1000,"exploded")
		            gamedata.squads[squad-1].splice(pos,1)
                    gamedata = richtextadd(gamedata,`\n💥 ${gamedata.player[squad-1]}'s ${emojis[36].emoji} exploded!`)
                }
                if (gamedata.squads[squad-1][pos].id == 41) { // tornado (2)
                    gamedata = richtextadd(gamedata,`\n🔀 ${gamedata.player[squad-1]}'s ${emojis[41].emoji} Shuffled ${gamedata.player[squad2-1]}'s Squad!`)
                    gamedata = shufflesquad(gamedata,squad2)
                }
            } else {
                if (!silence) {
                    gamedata = richtextadd(gamedata,`\n🤜 ${gamedata.player[squad2-1]}'s ${gamedata.squads[squad2-1][pos2].emoji} ${verb ?? "attacked"} ${gamedata.player[squad-1]}'s ${gamedata.squads[squad-1][pos].emoji}. (${val*-1} damage)`)
                }
                if (gamedata.squads[squad-1][pos].id == 10) { // shuffle button (3)
                    gamedata.squads[squad-1].splice(pos,1)
                    gamedata = shufflesquad(gamedata,squad2)
                    gamedata = richtextadd(gamedata,`\n🔀 ${gamedata.player[squad-1]}'s ${emojis[10].emoji} Shuffled ${gamedata.player[squad2-1]}'s Squad, and defeated itself!`)
                }
                if (gamedata.squads[squad-1][pos].id == 9) { // mortar board (3)
                    gamedata.squads[squad-1].splice(pos,1)
                    for (i = 0; i < 3; i++) {
                        gamedata.squads[squad-1].splice(pos+1,0,lodash.cloneDeep(emojis[0]))
                        gamedata.squads[squad-1][pos+1].hp = 1
                    }
                    gamedata = richtextadd(gamedata,`\n‼️ ${gamedata.player[squad-1]}'s ${emojis[9].emoji} sparked a standing ovation and summoned ${emojis[0].emoji}${emojis[0].emoji}${emojis[0].emoji}, and defeated itself!`)
                }
		        if (gamedata.squads[squad-1][pos].id == 36) { // bomb (3)
                    gamedata = alterhp(gamedata,0-squad+3,0,squad,pos,-1000,"exploded")
		            gamedata.squads[squad-1].splice(pos,1)
                    gamedata = richtextadd(gamedata,`\n💥 ${gamedata.player[squad-1]}'s ${emojis[36].emoji} exploded!`)
                }
                if (gamedata.squads[squad-1][pos].id == 41) { // tornado (3)
                    gamedata = richtextadd(gamedata,`\n🔀 ${gamedata.player[squad-1]}'s ${emojis[41].emoji} Shuffled ${gamedata.player[squad2-1]}'s Squad!`)
                    gamedata = shufflesquad(gamedata,squad2)
                }
                if (gamedata.squads[squad2-1][pos2].id == 6 && gamedata.squads[squad2-1][pos2].hp>2) { // speaking head
                    if (gamedata.squads[squad-1][pos].dmg > 0) {
                        gamedata.squads[squad-1][pos].dmg -= 1
			            gamedata = richtextadd(gamedata,`\n🚧 ${gamedata.player[squad2-1]}'s ${gamedata.squads[squad2-1][pos2].emoji} weakened ${gamedata.player[squad-1]}'s ${gamedata.squads[squad-1][pos].emoji}! (-1 attack)`)
                    }
                }
                if ((gamedata.squads[squad-1][pos+1] ?? {id:NaN}).id == 1) { // kissing heart face
                    gamedata = alterhp(gamedata,squad,pos,squad,pos+1,1,"kissed")
                }
                if (gamedata.squads[squad-1][pos].id == 3 && gamedata.squads[squad-1].length > 1) { // cold sweat face
                    const temp = gamedata.squads[squad-1][pos]
                    gamedata.squads[squad-1].splice(pos,1)
                    gamedata.squads[squad-1].splice(pos+1,0,temp)
                    gamedata = richtextadd(gamedata,`\n💨 ${gamedata.player[squad-1]}'s ${emojis[3].emoji} retreated behind ${gamedata.squads[squad-1][pos].emoji}!`)
                }
                if (gamedata.squads[squad-1][pos].id == 5 && gamedata.squads[squad-1].length > 1) { // turtle
                    const temp = gamedata.squads[squad-1][pos]
                    gamedata.squads[squad-1].splice(pos,1)
                    gamedata.squads[squad-1].splice(gamedata.squads[squad-1].length,0,temp)
                    gamedata = richtextadd(gamedata,`\n💨 ${gamedata.player[squad-1]}'s ${emojis[5].emoji} retreated to the back of the Squad!`)
                    gamedata = alterhp(gamedata,squad,gamedata.squads[squad-1].length-1,squad,gamedata.squads[squad-1].length-1,1)
                }
                if (gamedata.squads[squad-1][pos].id == 15) { // fishing pole
                    const temp = gamedata.squads[squad2-1][gamedata.squads[squad2-1].length-1]
                    gamedata.squads[squad2-1].splice(gamedata.squads[squad2-1].length-1,1)
                    gamedata.squads[squad2-1].splice(0,0,temp)
                    gamedata = richtextadd(gamedata,`\n‼️ ${gamedata.player[squad-1]}'s ${emojis[15].emoji} pulled ${gamedata.player[squad2-1]}'s ${gamedata.squads[squad2-1][0].emoji} to the front of their Squad!`)
                }
                if (gamedata.squads[squad-1][pos].id == 16) { // golf
                    const temp = gamedata.squads[squad2-1][0]
                    gamedata.squads[squad2-1].splice(0,1)
                    gamedata.squads[squad2-1].splice(gamedata.squads[squad2-1].length,0,temp)
                    gamedata = richtextadd(gamedata,`\n‼️ ${gamedata.player[squad-1]}'s ${emojis[16].emoji} whacked ${gamedata.player[squad2-1]}'s ${gamedata.squads[squad2-1][gamedata.squads[squad2-1].length-1].emoji} to the back of their Squad!`)
                }
            }
            if (gamedata.squads[0].length == 1 && gamedata.squads[0][0].id == 23) { // lizard / dragon
                gamedata.squads[0].splice(0,1,lodash.cloneDeep(emojis[24]))
                gamedata = richtextadd(gamedata,`\n⏫ ${gamedata.player[0]}'s ${emojis[23].emoji} evolved into a ${emojis[24].emoji}!`)
            }
            if (gamedata.squads[1].length == 1 && gamedata.squads[1][0].id == 23) { // lizard / dragon
                gamedata.squads[1].splice(0,1,lodash.cloneDeep(emojis[24]))
                gamedata = richtextadd(gamedata,`\n⏫ ${gamedata.player[1]}'s ${emojis[23].emoji} evolved into a ${emojis[24].emoji}!`)
            }
        }
    }
    return gamedata
}

function playturn(gamedata) {
    setup: {
        if (gamedata.turn==0) {
            for (i = 0; i < gamedata.squads[0].length; i++) {
                if (gamedata.squads[0][i].id == 26) { // cherries
                    gamedata.squads[0].splice(i,0,lodash.cloneDeep(emojis[26]))
                    i++
                }
            }
            for (i = 0; i < gamedata.squads[1].length; i++) {
                if (gamedata.squads[1][i].id == 26) { // cherries
                    gamedata.squads[1].splice(i,0,lodash.cloneDeep(emojis[26]))
                    i++
                }
            }
        }
        gamedata.turn ++
        gamedata.playerturn = (gamedata.playerturn + 1) % 2 * -1 + 2
    }

    attack: {
        let basicattackflag = true
        const activeemoji = gamedata.squads[gamedata.playerturn-1][0]
        if (activeemoji.id == 0) { // clap
            basicattackflag = false
            gamedata = alterhp(gamedata,gamedata.playerturn*-1+3,0,gamedata.playerturn,0,0-(gamedata.squads[gamedata.playerturn-1][0].dmg + (gamedata.squads[gamedata.playerturn-1].filter(element => element.id == 0).length)),"clapped at")
        }
        if ((gamedata.squads[gamedata.playerturn-1][1] ?? {id:0}).id == 12) { // martial arts uniform
            basicattackflag = false
            gamedata = alterhp(gamedata,gamedata.playerturn*-1+3,0,gamedata.playerturn,0,0-gamedata.squads[gamedata.playerturn-1][0].dmg - 1)
        }
        if ((gamedata.squads[gamedata.playerturn-1][0] ?? {id:0}).id == 13 && gamedata.squads[gamedata.playerturn-1].some(x => x.id == 14)) { // guitar
            basicattackflag = false
            gamedata = alterhp(gamedata,gamedata.playerturn*-1+3,0,gamedata.playerturn,0,0-gamedata.squads[gamedata.playerturn-1][0].dmg - 1)
        }
        if (basicattackflag) {
            gamedata = alterhp(gamedata,gamedata.playerturn*-1+3,0,gamedata.playerturn,0,0-gamedata.squads[gamedata.playerturn-1][0].dmg)
        }
        if ((gamedata.squads[gamedata.playerturn-1][1] ?? {id:0}).id == 8) { // handshake
            gamedata = alterhp(gamedata,gamedata.playerturn*-1+3,0,gamedata.playerturn,1,0-gamedata.squads[gamedata.playerturn-1][1].dmg)
        }
        if ((gamedata.squads[gamedata.playerturn-1][0] ?? {id:0}).id == 34) { // zap
            gamedata = alterhp(gamedata,gamedata.playerturn*-1+3,1,gamedata.playerturn,0,0-gamedata.squads[gamedata.playerturn-1][0].dmg,"zapped")
        }
	if ((gamedata.squads[gamedata.playerturn-1][0] ?? {id:0}).id == 37 && gamedata.turn%4<=2) { // ghost
	        const tempemj = gamedata.squads[gamedata.playerturn*-1+2][0].emoji
	        const temphp = gamedata.squads[gamedata.playerturn*-1+2][0].hp
	        const tempdmg = gamedata.squads[gamedata.playerturn*-1+2][0].dmg
            gamedata.squads[gamedata.playerturn*-1+2].splice(0,1,lodash.cloneDeep(emojis[7]))
	        gamedata.squads[gamedata.playerturn*-1+2][0].hp = temphp
	        gamedata.squads[gamedata.playerturn*-1+2][0].dmg = tempdmg
            gamedata = richtextadd(gamedata,`\n👻 ${gamedata.player[gamedata.playerturn-1]}'s ${emojis[37].emoji} transformed ${gamedata.player[gamedata.playerturn*-1+2]}'s ${tempemj} into a ${emojis[7].emoji}!`)
        }
    }
    
    gamedata.logfile += "\n\n"

    scene: {
    // destroying and recreating the battle scene
        gamedata.emojitext = ""
        for (let i = gamedata.squads[0].length - 1; i >= 0; i--) {
            gamedata.emojitext += renderhemoji(gamedata.squads[0][i].hp) + " "
            gamedata.logfile +=  gamedata.squads[0][i].hp + "▪️"
        }
        gamedata.emojitext += " "
        gamedata.logfile.slice(0, -2)
        gamedata.logfile += "    "
        for (let i = 0; i < gamedata.squads[1].length; i++) {
            gamedata.emojitext += " " + renderhemoji(gamedata.squads[1][i].hp)
            gamedata.logfile += gamedata.squads[1][i].hp + "▪️"
        }
        
        gamedata.emojitext += "\n"
        gamedata.logfile.slice(0, -2)
        gamedata.logfile += "  ❤️\n"

        for (let i = gamedata.squads[0].length - 1; i >= 0; i--) {
            gamedata.emojitext += renderdemoji(gamedata.squads[0][i].dmg) + " "
            gamedata.logfile += gamedata.squads[0][i].dmg + "▪️"
        }
        gamedata.emojitext += " "
        gamedata.logfile.slice(0, -2)
        gamedata.logfile += "    "
        for (let i = 0; i < gamedata.squads[1].length; i++) {
            gamedata.emojitext += " " + renderdemoji(gamedata.squads[1][i].dmg)
            gamedata.logfile += gamedata.squads[1][i].dmg + "▪️"
        }
        
        gamedata.emojitext += "\n"
        gamedata.logfile.slice(0, -2)
        gamedata.logfile += "  ⚔️\n"

        for (let i = gamedata.squads[0].length - 1; i >= 0; i--) {
            gamedata.emojitext += gamedata.squads[0][i].emoji + " "
            gamedata.logfile += gamedata.squads[0][i].emoji + " "
        }
        gamedata.emojitext += "|"
        gamedata.logfile += "| "
        for (let i = 0; i < gamedata.squads[1].length; i++) {
            gamedata.emojitext += " " + gamedata.squads[1][i].emoji
            gamedata.logfile += gamedata.squads[1][i].emoji + " "
        }
    }

    const turnnum = gamedata.turn+1
    gamedata.logfile += "\n\n--------------------------------------------------------------\nTurn " + turnnum + "\n"


    return gamedata
}

function shufflesquad(gamedata,squad) {
    if (!gamedata.squads[squad-1].find(i => i.id == 32)) { // deciduous tree

        for (let i = gamedata.squads[squad-1].length - 1; i > 0; i--) {
            if (gamedata.squads[squad-1][i].id == 33) { // dash
                gamedata = alterhp(gamedata,squad,0,squad,i,2)
            }
        }

        for (let i = gamedata.squads[squad-1].length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [gamedata.squads[squad-1][i], gamedata.squads[squad-1][j]] = [gamedata.squads[squad-1][j], gamedata.squads[squad-1][i]];
        }
        for (let i = gamedata.squads[squad-1].length - 1; i > 0; i--) {
            if (gamedata.squads[squad-1][i].id == 28) { // pickup truck
                const temp = gamedata.squads[squad-1][i]
                gamedata.squads[squad-1].splice(i,1)
                gamedata.squads[squad-1].splice(gamedata.squads[squad-1].length,0,temp)
            }
            if (gamedata.squads[squad-1][i].id == 30) { // bus
                for (let j = gamedata.squads[squad-1].length - 1; j > 0; j--) {
                    if (gamedata.squads[squad-1][j].id == 29) { // bus stop
                        const temp = gamedata.squads[squad-1][i]
                        gamedata.squads[squad-1].splice(i,1)
                        gamedata.squads[squad-1].splice(gamedata.squads[squad-1].length,j+1,temp)
                        gamedata = richtextadd(gamedata,`\n💨 ${gamedata.player[squad-1]}'s ${emojis[30].emoji} visited the ${emojis[29].emoji}!`)
                        break
                    }
                }
            }
        }

        for (let i = gamedata.squads[squad-1].length - 1; i > 0; i--) {
            if (gamedata.squads[squad-1][i].id == 29) { // bus stop
                gamedata = alterhp(gamedata,squad,i+1,squad,i,2)
            }
        }

        for (let i = gamedata.squads[squad-1].length - 1; i > 0; i--) {
            if (gamedata.squads[squad-1][i].id == 19) { // dizzy face
                gamedata = alterhp(gamedata,squad,i,squad,i,1)
            }
        }

        for (let i = gamedata.squads[squad-1].length - 1; i > 0; i--) {
            if (gamedata.squads[squad-1][i].id == 27) { // cyclone
                gamedata.squads[squad-1].splice(i,1)
                gamedata = richtextadd(gamedata,`\n🔀 ${gamedata.player[squad-1]}'s ${emojis[27].emoji} Shuffled ${gamedata.player[0-squad+2]}'s Squad and defeated itself!`)
                gamedata = shufflesquad(gamedata,0-squad+3)
                break
            }
        }

        for (let i = gamedata.squads[squad-1].length - 1; i > 0; i--) {
            if (gamedata.squads[squad-1][i].id == 31) { // popcorn
                gamedata = alterhp(gamedata,squad,0,squad,i,2)
            }
        }

    } else {
        gamedata = richtextadd(gamedata,`\n🔁 ${gamedata.player[squad-1]}'s ${emojis[32].emoji} kept its squad from being shuffled!`)
    }

    return gamedata
}

customemojis: {

    function renderhemoji(value) {
        if (value<0) {
            return healthemojis[0]
        } else if (healthemojis.length > value) {
            return healthemojis[value + 1]
        } else {
            return healthemojis[healthemojis.length - 1]
        }
    }

    function renderdemoji(value) {
        if (value<-3) {
            return dmgemojis[0]
        } else if (dmgemojis.length > value) {
            return dmgemojis[value + 4]
        } else {
            return dmgemojis[dmgemojis.length - 1]
        }
    }

    const healthemojis = [
        "<:health_0:1278757291646259232>",
        "<:health0:1278757283790323854>",
        "<:health1:1278757275942780968>",
        "<:health2:1278757268774457376>",
        "<:health3:1278757260843028551>",
        "<:health4:1278757251535863862>",
        "<:health5:1278757242786545767>",
        "<:health6:1278757232959426592>",
        "<:health7:1278757222469472339>",
        "<:health8:1278757213057323164>",
        "<:health9:1278757200176873544>",
        "<:health10:1293308044167483545>",
        "<:health11:1293308058138841290>",
        "<:health12:1293308069404606464>",
        "<:health13:1293308089381949480>",
        "<:health14:1293308105555316837>",
        "<:health15:1293308124144341033>",
    ]

    const dmgemojis = [
        "<:attack__3:1308565301226377348>",
        "<:attack_3:1308565243768733696>",
        "<:attack_2:1308565231236157470>",
        "<:attack_1:1308565220930617425>",
        "<:attack0:1278757419488383090>",
        "<:attack1:1278757410290405522>",
        "<:attack2:1278757401511858287>",
        "<:attack3:1278757393563389995>",
        "<:attack4:1278757385405730846>",
        "<:attack5:1278757377222639616>",
        "<:attack6:1278523977303851122>",
        "<:attack7:1278757359606435922>",
        "<:attack8:1278757344066666517>",
        "<:attack9:1278757315373306009>",
        "<:attack10:1278757304027844731>",
    ]

}

const raritysymbols = [
"*️⃣", "✳️", "⚛️",
]

const raritynames = [
"Common", "Rare", "Special",
]

const emojis = [
{emoji:"👏",id:0,hp:4,dmg:0,rarity:0,name:"Clap",description:"Deals 1 more damage for each other undefeated friendly 👏"},
{emoji:"😘",id:1,hp:4,dmg:2,rarity:0,name:"Kissing Heart",description:"When attacked, heals the friendly Emoji in front of it by 1"},
{emoji:"😌",id:2,hp:4,dmg:2,rarity:0,name:"Relieved",description:"Takes 1 less damage from every attack, to a minimum of 1"},
{emoji:"😰",id:3,hp:6,dmg:1,rarity:0,name:"Cold Sweat",description:"When attacked, switches places with the friendly Emoji behind it"},
{emoji:"😀",id:4,hp:6,dmg:3,rarity:0,name:"Grinning",description:"Nothing special"},
{emoji:"🐢",id:5,hp:5,dmg:1,rarity:1,name:"Turtle",description:"When attacked, moves to the back of your Squad and Heals itself by 1"},
{emoji:"🗣️",id:6,hp:4,dmg:2,rarity:2,name:"Speaking Head",description:"When attacking at more than 2 health, lowers the enemy Emoji's attack power by 1 to a minumum of 0"},
{emoji:"😶",id:7,hp:1,dmg:1,rarity:-1,name:"No Mouth",description:"Nothing special"},
{emoji:"🤝",id:8,hp:4,dmg:1,rarity:1,name:"Handshake",description:"Will also attack if there is one friendly Emoji in front of it"},
{emoji:"🎓",id:9,hp:1,dmg:0,rarity:1,name:"Mortar Board",description:"When attacked or defeated, summons three 👏 with 1 health and one attack value and defeats itself"},
{emoji:"🔀",id:10,hp:1,dmg:0,rarity:0,name:"Twisted Rightwards Arrows",description:"When attacked or defeated, Shuffles the enemy Squad and defeats itself"},
{emoji:"🪦",id:11,hp:1,dmg:2,rarity:0,name:"Headstone",description:"When a friendly Emoji is defeated, heals itself by 1"},
{emoji:"🥋",id:12,hp:2,dmg:2,rarity:0,name:"Martial Arts Uniform",description:"The friendly Emoji in front of this attacks for 1 more damage"},
{emoji:"🎸",id:13,hp:4,dmg:1,rarity:0,name:"Guitar",description:"If you have at least one undefeated 🎵 on your squad, deal 1 more damage"},
{emoji:"🎵",id:14,hp:1,dmg:1,rarity:0,name:"Musical Note",description:"Nothing special"},
{emoji:"🎣",id:15,hp:3,dmg:1,rarity:0,name:"Fishing Pole And Fish",description:"When attacked, moves the furthermost enemy emoji to the front of the enemy Squad"},
{emoji:"⛳",id:16,hp:3,dmg:1,rarity:0,name:"Golf",description:"When attacked, moves the frontmost enemy emoji to the back of the enemy Squad"},
{emoji:"🛡️",id:17,hp:4,dmg:2,rarity:1,name:"Shield",description:"Takes 1 less damage for every friendly undefeated 😌, to a minimum of 1. Cannot be healed"},
{emoji:"💀",id:18,hp:1,dmg:2,rarity:1,name:"Skull",description:"When an enemy Emoji is killed, heals itself by 1"},
{emoji:"🥴",id:19,hp:4,dmg:2,rarity:1,name:"Woozy Face",description:"When your Squad is Shuffled, heals itself by 1"},
{emoji:"♟️",id:20,hp:1,dmg:2,rarity:0,name:"Chess Pawn",description:"When this defeats an Emoji, summon a 👑 and defeat itself"},
{emoji:"👑",id:21,hp:8,dmg:3,rarity:-1,name:"Crown",description:"Nothing special"},
{emoji:"😡",id:22,hp:3,dmg:0,rarity:0,name:"Rage",description:"Attacks for the number of undefeated enemy Emojis to a maximum of 3"},
{emoji:"🦎",id:23,hp:3,dmg:1,rarity:0,name:"Lizard",description:"If this is the only undefeated friendly Emoji, become a 🐲"},
{emoji:"🐲",id:24,hp:6,dmg:5,rarity:-1,name:"Dragon Face",description:"Nothing special"},
{emoji:"☠️",id:25,hp:3,dmg:1,rarity:2,name:"Skull Crossbones",description:"When an enemy Emoji is killed, heals the friendly Emoji behind it by 1"},
{emoji:"🍒",id:26,hp:2,dmg:1,rarity:1,name:"Cherries",description:"At the beginning of the Battle, doubles itself"},
{emoji:"🌀",id:27,hp:4,dmg:1,rarity:1,name:"Cyclone",description:"When your Squad is Shuffled, Shuffles the opponent Squad and defeats itself (Only one takes effect if multiple are undefeated)"},
{emoji:"🛻",id:28,hp:4,dmg:3,rarity:1,name:"Pickup Truck",description:"When your Squad is Shuffled, moves to the back"},
{emoji:"🚏",id:29,hp:1,dmg:2,rarity:1,name:"Busstop",description:"When your Squad is Shuffled, heals the Emoji behind itself by 2"},
{emoji:"🚌",id:30,hp:4,dmg:2,rarity:2,name:"Bus",description:"When your Squad is Shuffled and there is at least one undefeated friendly 🚏, move behind it"},
{emoji:"🍿",id:31,hp:4,dmg:2,rarity:1,name:"Popcorn",description:"When your Squad is Shuffled, heals the frontmost friendly Emoji by 2"},
{emoji:"🌳",id:32,hp:3,dmg:2,rarity:2,name:"Deciduous Tree",description:"While undefeated, your squad cannot be Shuffled"},
{emoji:"💨",id:33,hp:1,dmg:1,rarity:0,name:"Dash",description:"Before your Squad is Shuffled, heals the frontmost friendly Emoji by 2"},
{emoji:"⚡",id:34,hp:2,dmg:2,rarity:2,name:"Zap",description:"Attacks the 2 frontmost enemy emojis at once"},
{emoji:"🧱",id:35,hp:2,dmg:1,rarity:0,name:"Bricks",description:"Takes 2 less damage from every attack, to a minimum of 1. Cannot be healed"},
{emoji:"💣",id:36,hp:1,dmg:0,rarity:1,name:"Bomb",description:"When attacked or defeated, defeats the frontmost enemy emoji and defeats itself"},
{emoji:"👻",id:37,hp:4,dmg:1,rarity:2,name:"Ghost",description:"Every other round when attacking, turns the frontmost enemy Emoji into a 😶 with identical stats"},
{emoji:"✨",id:38,hp:3,dmg:-1,rarity:-1,name:"Sparkles",description:"Nothing special"},
{emoji:"🦄",id:39,hp:3,dmg:2,rarity:2,name:"Unicorn",description:"When defeated, summons ✨ at the front of the enemy Squad"},
{emoji:"🃏",id:40,hp:8,dmg:2,rarity:0,name:"Black Joker",description:"Increases any damage taken to itself by 1"},
{emoji:"🌪️",id:41,hp:3,dmg:1,rarity:1,name:"Tornado",description:"When attacked or defeated, Shuffles the enemy Squad"},
{emoji:"💃",id:42,hp:2,dmg:1,rarity:1,name:"Dancer",description:"After attacking, switches places with the friendly Emoji behind it"},
]

module.exports = {database,getvault,getsquad,coinschange,allemojisofrarity,emojis,playturn,raritysymbols,raritynames,trysetupuser}
