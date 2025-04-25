const Keyv = require('keyv');
const lodash = require('lodash');
const {emojis,healthemojis,dmgemojis} = require('./data.js')
const fs = require('fs');
const formatToJson = require('format-to-json');

const database = new Keyv('sqlite://databases//database.sqlite',{namespace:"userdata"});

async function getlogs() {
    let logs = await JSON.parse(fs.readFileSync('logs.json', 'utf8'));
    for (i=logs.logs.emojis.length;i<emojis.length;i++) {
        logs.logs.emojis.push({})
    }
    return logs
}

async function writelogs(json) {
    console.log(json)
    const formattedjson = formatToJson(JSON.stringify(json), { withDetails: true })
    console.log(formattedjson)
    fs.writeFileSync('logs.json', formattedjson.result, 'utf8');
}

async function getvault(id) {
    //await database.set(id+"vault","0,1,2,3,4,5,6,8,9,10,11,12,13,14,15,16,17,18,19,20,22,23,0,1,2,3,4,5,6,8,")
    const rawvault = await database.get(id + "vault")
	let vault = rawvault.split(',');
	vault.pop()
    return vault
}

async function devoteemojis(id,emojiid,amount) {
    let vaultarray = await getvault(id)
    let indexToRemove;
    for (let j = 0; j < amount; j++) {
        for (let i = vaultarray.length-1; i > -1; i--) {
            if (vaultarray[i].id == emojiid) {
                indexToRemove = i;
            }
        }
        vaultarray.splice(indexToRemove, 1);
    }
    await database.set(id + "vault",vaultarray.join(",") + ",")
    let lab = await fetchresearch(id) 
    lab[emojis[emojiid].class] += amount*(2*(emojis[emojiid].rarity)+1)
    await database.set(id + "research",lab.join("/"))
    return (emojis[emojiid].emoji + " ").repeat(amount)
}

async function fetchresearch(id) {
    const userresearch = await database.get(id + "research") ?? "0/0/0/0/0/0/0/0"
    let lab = userresearch.split('/');
	lab.pop()
    while (lab.length < 8) {
        lab.push(0);
    }
    return lab.map(Number)
}

async function syncresearch(id,lab) {
    await database.set(id + "research",lab.join("/"))
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
        await database.set(user.id+"squad",allemojistoadd)
        const welcomemessage = `# ⛩️😀 Welcome to the Emoji Dojo, <@${user.id}>! 🏯🎋
**It is here that you will over time hone your skills and master the art of Emoji Battles.**

## <:denver:1303484366520844289>💬 \`Denver\`
\`\`\`Hello! My name is Denver, and I'm in charge of wrangling these here emojis for you to battle with. Here, I'll give you this selection to start off with.\`\`\`

*(You received${allemojitext}!)*

\`\`\`That should be good enough to start with! Go ahead, you can get to know 'em.\`\`\`

*(Use </dojo:1277719095701143680> to see your collection of Emojis, and see details about each one.)*

\`\`\`When you're ready, organize them into a Squad optimized to battle others and create the best synergy.\`\`\`

*(Use </squad:1277719095701143681> to view your Squad. You can edit your squad from the </dojo:1277719095701143680>.)*

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
        const coincd = await database.get(id + "coincooldown") ?? "0"
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
        let rawcoins = parseInt(await database.get(id + "coins") ?? "100")
        rawcoins += amt
        await database.set(id + "coins",rawcoins)
        if (affectcooldown) {
            await database.set(id + "coinsleft",coinsleft-amt)
        }
    } else if (amt<0 && originalamt<0){
        let rawcoins = parseInt(await database.get(id + "coins") ?? "100")
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
    gamedata.newlines += 1
    return gamedata
}

function alterhp(gamedata,squad,pos,squad2,pos2,val,verb,silence) {
    console.log(`position ${pos} of squad ${squad} attacked position ${pos2} of squad ${squad2}, and changed its hp by ${val}! also verb ${verb} silent ${silence}`)

    if ((gamedata.squads[squad2-1][pos] ?? {id:undefined}).id == 22 && val < 0) {// rage
        val = 0-Math.min(val + gamedata.squads[squad-1].length,3)
    }
    // protection buffs start here 
    if ((gamedata.squads[squad-1][pos] ?? {id:undefined}).id == 2 && val < 0) {// relieved face
        val = Math.min(val + 1,-1)
    }
    if ((gamedata.squads[squad-1][pos] ?? {id:undefined}).id == 35 && val < 0) {// bricks
        val = Math.min(val + 2,-1)
    }
    if ((gamedata.squads[squad-1][pos] ?? {id:undefined}).id == 54 && val < 0) {// bubbles
        val = -1
    }
    if ((gamedata.squads[squad-1][pos] ?? {id:undefined}).id == 17) {// shield
        if (val < 0) {
            val = Math.min(val + gamedata.squads[squad-1].filter(x => x.id == 2).length,-1)
        } else {
            val = 0
            verb = "tried to heal"
        }
    }
	if ((gamedata.squads[squad-1][pos] ?? {id:undefined}).id == 40 && val < 0) {// joker
        val = val - 1
    }
    if ((gamedata.squads[squad-1][pos] ?? {id:undefined}).id == 25 || (gamedata.squads[squad-1][pos] ?? {id:undefined}).id == 54) {// bricks, bubbles
        if (val > 0) {
            val = 0
            verb = "tried to heal"
        }
    }
    

    alter: {
        if (gamedata.squads[squad-1][pos].hp == undefined || gamedata.squads[squad-1][pos].hp < 0) {
            gamedata.squads[squad-1][pos].hp = 0
        }
        gamedata.squads[squad-1][pos].hp += val
		if ((gamedata.squads[squad2-1][pos2] ?? {id:undefined}).id == 42 && gamedata.squads[squad2-1].length > 1) { // dancer
            const temp = gamedata.squads[squad2-1][pos2]
            gamedata.squads[squad2-1].splice(pos2,1)
        	gamedata.squads[squad2-1].splice(pos2+1,0,temp)
            gamedata = richtextadd(gamedata,`\n💨 ${gamedata.player[squad2-1]}'s ${emojis[42].emoji} danced behind ${gamedata.squads[squad2-1][pos2].emoji}!`)
		}
        if ((gamedata.squads[squad2-1][pos2] ?? {id:undefined}).id == 64 && squad!=squad2) { // mushroom
            gamedata = alterhp(gamedata,squad2,pos2,squad2,pos2,-1,"",true)
            gamedata = richtextadd(gamedata,`\n🍄 ${gamedata.player[squad2-1]}'s ${emojis[64].emoji} damaged itself by attacking! (1 damage)`)
        }    
        if (gamedata.squads[squad-1][pos].hp <= 0) {
            if (!silence) {
                gamedata = richtextadd(gamedata,`\n💥 ${gamedata.player[squad2-1]}'s ${gamedata.squads[squad2-1][pos2].emoji} defeated ${gamedata.player[squad-1]}'s ${gamedata.squads[squad-1][pos].emoji}! (${val*-1} damage)`)
            }
            if ((gamedata.squads[squad2-1][pos2] ?? {id:undefined}).id == 20) { // chess pawn
                gamedata.squads[squad2-1].splice(pos2,1)
                gamedata.squads[squad2-1].splice(pos2,0,lodash.cloneDeep(emojis[21]))
                gamedata = richtextadd(gamedata,`\n‼️ ${gamedata.player[squad2-1]}'s ${emojis[20].emoji} was promoted to a ${emojis[21].emoji}!`)
            }
            if ((gamedata.squads[squad2-1][pos2] ?? {id:undefined}).id == 52) { // night with stars
                for (i = 0; i < gamedata.squads[squad-1].length; i++) {
                    if (gamedata.squads[squad-1][i].id == gamedata.squads[squad-1][pos].id && gamedata.squads[squad-1][i].hp>0) {
                        gamedata = alterhp(gamedata,squad,i,squad2,pos,-1)
                    }
                }
            }
            if (gamedata.squads[squad-1][pos].id != 62) { // skyline
                for (i = gamedata.squads[squad-1].length-1; i > -1; i--) {
                    if ((gamedata.squads[squad-1][i] ?? {id:undefined}).id == 62) {
                        for (j = 0; j < gamedata.squads[squad-1].length; j++) {
                            if (gamedata.squads[squad-1][j].id == gamedata.squads[squad-1][pos].id && gamedata.squads[squad-1][j].hp>0) {
                                gamedata = alterhp(gamedata,squad,j,squad,i,1,"",true)
                                gamedata = richtextadd(gamedata,`\n💗 ${gamedata.player[squad-1]}'s ${emojis[62].emoji} healed all friendly ${gamedata.squads[squad-1][pos].emoji} by 1!`)
                            }
                        }
                    }
                }
            }
            if ((gamedata.squads[squad2-1][pos2] ?? {id:undefined}).id == 53) { // wolf
                gamedata = alterhp(gamedata,squad2,pos2,squad2,pos2,1,"",true)
                gamedata.squads[squad2-1][pos2].dmg += 1
			    gamedata = richtextadd(gamedata,`\n🩸 ${gamedata.player[squad2-1]}'s ${gamedata.squads[squad2-1][pos2].emoji} strengthened itself! (+1 attack, +1 health)`)
            }
            if ((gamedata.squads[squad-1][pos] ?? {id:undefined}).id == 9) { // mortar board
                for (i = 0; i < 3; i++) {
                    gamedata.squads[squad-1].splice(pos+1,0,lodash.cloneDeep(emojis[0]))
                    gamedata.squads[squad-1][pos+1].hp = 1
                }
                gamedata = richtextadd(gamedata,`\n‼️ ${gamedata.player[squad-1]}'s ${emojis[9].emoji} sparked a standing ovation and summoned ${emojis[0].emoji}${emojis[0].emoji}${emojis[0].emoji}!`)
            }
			if ((gamedata.squads[squad-1][pos] ?? {id:undefined}).id == 45) { // radio
                gamedata.squads[squad-1].splice(gamedata.squads[squad-1].length,0,lodash.cloneDeep(emojis[14]))
                gamedata = richtextadd(gamedata,`\n🎶 ${gamedata.player[squad-1]}'s ${emojis[45].emoji} played a ${emojis[14].emoji} at the back of the Squad!`)
            }
            if ((gamedata.squads[squad-1][pos] ?? {id:undefined}).id == 65) { // busts in silhouette
                gamedata.squads[squad-1].splice(1,0,lodash.cloneDeep(gamedata.squads[squad2-1][0]))
                gamedata = richtextadd(gamedata,`\n👥 ${gamedata.player[squad-1]}'s ${emojis[65].emoji} transformed into an exact replica of ${gamedata.player[squad2-1]}'s ${gamedata.squads[squad2-1][0].emoji}!`)
            }
            if ((gamedata.squads[squad-1][pos] ?? {id:undefined}).id == 10) { // shuffle button
                gamedata = richtextadd(gamedata,`\n🔀 ${gamedata.player[squad-1]}'s ${emojis[10].emoji} Shuffled ${gamedata.player[squad2-1]}'s Squad!`)
                gamedata = shufflesquad(gamedata,squad2)
            }
	        if ((gamedata.squads[squad-1][pos] ?? {id:undefined}).id == 36) { // bomb
                gamedata = richtextadd(gamedata,`\n💥 ${gamedata.player[squad-1]}'s ${emojis[36].emoji} exploded, defeating ${gamedata.player[0-squad+2]}'s ${gamedata.squads[0-squad+2][0].emoji}!`)
		        gamedata = alterhp(gamedata,0-squad+3,0,squad,pos,-1000,"exploded",true)
            }
            if ((gamedata.squads[squad-1][pos+1] ?? {id:undefined}).id == 66) { // new
                gamedata.squads[squad-1].splice(pos,1)
                gamedata.squads[squad-1].splice(pos+1,0,lodash.cloneDeep(emojis[gamedata.squads[squad-1][pos].id]))
                gamedata = richtextadd(gamedata,`\n👥 ${gamedata.player[squad-1]}'s ${emojis[66].emoji} summoned a new ${gamedata.squads[squad-1][pos].emoji}, and defeated itself!`)
            }
            if ((gamedata.squads[squad-1][pos] ?? {id:undefined}).id == 57) { // mask
                gamedata.squads[0-squad+2].splice(0,0,lodash.cloneDeep(emojis[58]))
                gamedata = richtextadd(gamedata,`\n🦠 ${gamedata.player[squad-1]}'s ${emojis[57].emoji} infected ${gamedata.player[0-squad+2]}'s Squad with a ${emojis[58].emoji}!`)
                gamedata = richtextadd(gamedata,`\n🔀 ${gamedata.player[squad-1]}'s ${emojis[57].emoji} Shuffled ${gamedata.player[squad2-1]}'s Squad!`)
                gamedata = shufflesquad(gamedata,squad2)
            }
			if ((gamedata.squads[squad-1][pos] ?? {id:undefined}).id == 43) { // pinata
                gamedata = richtextadd(gamedata,`\n💥 ${gamedata.player[squad-1]}'s ${emojis[43].emoji} shattered!`)
		        gamedata = alterhp(gamedata,0-squad+3,0,squad,pos,-2,"threw candy at",false)
				if (gamedata.squads[squad-1].length > 1) {
					gamedata = alterhp(gamedata,squad,1,squad,pos,2,"gave candy to",false)
				}
            }
            if (gamedata.squads[squad-1][pos].id != 61) { // wand
                for (i = gamedata.squads[squad-1].length-1; i > -1; i--) {
                    if (gamedata.squads[squad-1][i].id == 61) {
                        gamedata.squads[squad-1].splice(gamedata.squads[squad-1].length,0,lodash.cloneDeep(emojis[gamedata.squads[squad-1][pos].id]))
                        gamedata = alterhp(gamedata,squad,i,squad,i,-1000,"used up",true)
                        gamedata = richtextadd(gamedata,`\n🌟 ${gamedata.player[squad-1]}'s 🪄 revived the ${gamedata.squads[squad-1][pos].emoji} at the back of the Squad!`)
                    }
                }
            }
            if ((gamedata.squads[squad-1][pos] ?? {id:undefined}).id == 59) { // flying saucer
                gamedata = shufflesquad(gamedata,squad2)
                gamedata = richtextadd(gamedata,`\n🔀 ${gamedata.player[squad-1]}'s ${emojis[59].emoji} Shuffled ${gamedata.player[squad2-1]}'s Squad!`)
                gamedata = alterhp(gamedata,squad2,0,squad,pos,-3,"zapped")
            }
            if ((gamedata.squads[squad-1][pos] ?? {id:undefined}).id == 55) { // banana
                const temp = gamedata.squads[squad2-1][0]
                gamedata.squads[squad2-1].splice(0,1)
                gamedata.squads[squad2-1].splice(gamedata.squads[squad2-1].length,0,temp)
                gamedata = alterhp(gamedata,squad2,gamedata.squads[squad2-1].length-1,squad,pos,-2,"",true)
                gamedata = richtextadd(gamedata,`\n‼️ ${gamedata.player[squad2-1]}'s ${temp.emoji} slipped on ${gamedata.player[squad-1]}'s ${emojis[55].emoji}!`)
            }
            if ((gamedata.squads[squad-1][pos] ?? {id:undefined}).id == 56) { // magnet
                const temp = gamedata.squads[squad2-1][gamedata.squads[squad2-1].length-1]
                gamedata.squads[squad2-1].splice(gamedata.squads[squad2-1].length-1,1)
                gamedata.squads[squad2-1].splice(0,0,temp)
                gamedata = alterhp(gamedata,squad2,0,squad,pos,-2,"",true)
                gamedata = richtextadd(gamedata,`\n‼️ ${gamedata.player[squad2-1]}'s ${temp.emoji} was pulled to the front of the Squad by ${gamedata.player[squad-1]}'s ${emojis[56].emoji}!`)
            }
            if ((gamedata.squads[squad-1][pos] ?? {id:undefined}).id == 46) { // fire
				if (gamedata.squads[squad-1].length > 1 && gamedata.squads[squad-1][1].id != 46) {
					gamedata = alterhp(gamedata,squad,1,squad,pos,-2,"burned",false)
				}
            }
            for (i = 0; i < gamedata.squads[squad-1].length; i++) {
                if ((gamedata.squads[squad-1][i] ?? {id:undefined}).id == 11) { // tombstone
                    gamedata = alterhp(gamedata,squad,i,squad,i,1)
                }
                if ((gamedata.squads[squad-1][i] ?? {id:undefined}).id == 51) { // xray
                    for (j = i+1; j < gamedata.squads[squad-1].length; j++) {
                        gamedata = alterhp(gamedata,squad,j,squad,i,1,"healed",true)
                    }
                    gamedata = richtextadd(gamedata,`\n💗 ${gamedata.player[squad-1]}'s ${emojis[51].emoji} healed all Emojis behind itself by 1!`)
                }
            }
            for (i = 0; i < gamedata.squads[squad2-1].length-1; i++) {
                if ((gamedata.squads[squad2-1][i] ?? {id:undefined}).id == 25) { // skull and crossbones
                    gamedata = alterhp(gamedata,squad2,i+1,squad2,i,1)
                }
                if ((gamedata.squads[squad2-1][i] ?? {id:undefined}).id == 18) { // skull
                    gamedata = alterhp(gamedata,squad2,i,squad2,i,1)
                }
                if ((gamedata.squads[squad2-1][i] ?? {id:undefined}).id == 48) { // tada
                    gamedata = alterhp(gamedata,squad2,1,squad2,pos,1,"congratulated")
                }
            }
            if ((gamedata.squads[squad-1][pos] ?? {id:undefined}).id == 41) { // tornado
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
                if ((gamedata.squads[squad-1][pos] ?? {id:undefined}).id == 50) { // track next
                    gamedata = shufflesquad(gamedata,squad)
                    gamedata = richtextadd(gamedata,`\n🔀 ${gamedata.player[squad-1]}'s ${emojis[50].emoji} Shuffled ${gamedata.player[squad-1]}'s Squad!`)
                }
            } else if (val == 0) {
                if (!silence) {
                    gamedata = richtextadd(gamedata,`\n🤜 ${gamedata.player[squad2-1]}'s ${gamedata.squads[squad2-1][pos2].emoji} ${verb ?? "tried to attack"} ${gamedata.player[squad-1]}'s ${gamedata.squads[squad-1][pos].emoji}... but it did nothing.`)
                }
                if ((gamedata.squads[squad-1][pos] ?? {id:undefined}).id == 10) { // shuffle button (2)
                    gamedata.squads[squad-1].splice(pos,1)
                    gamedata = shufflesquad(gamedata,squad2)
                    gamedata = richtextadd(gamedata,`\n🔀 ${gamedata.player[squad-1]}'s ${emojis[10].emoji} Shuffled ${gamedata.player[squad2-1]}'s Squad, and defeated itself!`)
                }
                if ((gamedata.squads[squad-1][pos].id ?? {id:undefined}) == 9) { // mortar board (2)
                    gamedata.squads[squad-1].splice(pos,1)
                    for (i = 0; i < 3; i++) {
                        gamedata.squads[squad-1].splice(pos+1,0,lodash.cloneDeep(emojis[0]))
                        gamedata.squads[squad-1][pos+1].hp = 1
                    }
                    gamedata = richtextadd(gamedata,`\n‼️ ${gamedata.player[squad-1]}'s ${emojis[9].emoji} sparked a standing ovation and summoned ${emojis[0].emoji}${emojis[0].emoji}${emojis[0].emoji}, and defeated itself!`)
                }
		        if ((gamedata.squads[squad-1][pos].id ?? {id:undefined}) == 36) { // bomb (2)
                    gamedata = alterhp(gamedata,0-squad+3,0,squad,pos,-1000,"exploded")
		            gamedata.squads[squad-1].splice(pos,1)
                    gamedata = richtextadd(gamedata,`\n💥 ${gamedata.player[squad-1]}'s ${emojis[36].emoji} exploded!`)
                }
                if ((gamedata.squads[squad-1][pos].id ?? {id:undefined}) == 41) { // tornado (2)
                    gamedata = richtextadd(gamedata,`\n🔀 ${gamedata.player[squad-1]}'s ${emojis[41].emoji} Shuffled ${gamedata.player[squad2-1]}'s Squad!`)
                    gamedata = shufflesquad(gamedata,squad2)
                }
            } else {
                if (!silence) {
                    gamedata = richtextadd(gamedata,`\n🤜 ${gamedata.player[squad2-1]}'s ${gamedata.squads[squad2-1][pos2].emoji} ${verb ?? "attacked"} ${gamedata.player[squad-1]}'s ${gamedata.squads[squad-1][pos].emoji}. (${val*-1} damage)`)
                }
                if ((gamedata.squads[squad-1][pos].id ?? {id:undefined}) == 10) { // shuffle button (3)
                    gamedata.squads[squad-1].splice(pos,1)
                    gamedata = shufflesquad(gamedata,squad2)
                    gamedata = richtextadd(gamedata,`\n🔀 ${gamedata.player[squad-1]}'s ${emojis[10].emoji} Shuffled ${gamedata.player[squad2-1]}'s Squad, and defeated itself!`)
                }
                if ((gamedata.squads[squad-1][pos].id ?? {id:undefined}) == 9) { // mortar board (3)
                    gamedata.squads[squad-1].splice(pos,1)
                    for (i = 0; i < 3; i++) {
                        gamedata.squads[squad-1].splice(pos+1,0,lodash.cloneDeep(emojis[0]))
                        gamedata.squads[squad-1][pos+1].hp = 1
                    }
                    gamedata = richtextadd(gamedata,`\n‼️ ${gamedata.player[squad-1]}'s ${emojis[9].emoji} sparked a standing ovation and summoned ${emojis[0].emoji}${emojis[0].emoji}${emojis[0].emoji}, and defeated itself!`)
                }
		        if ((gamedata.squads[squad-1][pos].id ?? {id:undefined}) == 36) { // bomb (3)
                    gamedata = alterhp(gamedata,0-squad+3,0,squad,pos,-1000,"exploded")
		            gamedata.squads[squad-1].splice(pos,1)
                    gamedata = richtextadd(gamedata,`\n💥 ${gamedata.player[squad-1]}'s ${emojis[36].emoji} exploded!`)
                }
                if ((gamedata.squads[squad-1][pos].id ?? {id:undefined}) == 41) { // tornado (3)
                    gamedata = richtextadd(gamedata,`\n🔀 ${gamedata.player[squad-1]}'s ${emojis[41].emoji} Shuffled ${gamedata.player[squad2-1]}'s Squad!`)
                    gamedata = shufflesquad(gamedata,squad2)
                }
                if ((gamedata.squads[squad2-1][pos2].id ?? {id:undefined}) == 6 && gamedata.squads[squad2-1][pos2].hp>2) { // speaking head
                    if (gamedata.squads[squad-1][pos].dmg > 0) {
                        gamedata.squads[squad-1][pos].dmg -= 1
			            gamedata = richtextadd(gamedata,`\n🚧 ${gamedata.player[squad2-1]}'s ${gamedata.squads[squad2-1][pos2].emoji} weakened ${gamedata.player[squad-1]}'s ${gamedata.squads[squad-1][pos].emoji}! (-1 attack)`)
                    }
                }
                if ((gamedata.squads[squad-1][pos+1] ?? {id:undefined}).id == 1) { // kissing heart face
                    gamedata = alterhp(gamedata,squad,pos,squad,pos+1,1,"kissed")
                }
                if ((gamedata.squads[squad-1][pos] ?? {id:undefined}).id == 3 && gamedata.squads[squad-1].length > 1) { // cold sweat face
                    const temp = gamedata.squads[squad-1][pos]
                    gamedata.squads[squad-1].splice(pos,1)
                    gamedata.squads[squad-1].splice(pos+1,0,temp)
                    gamedata = richtextadd(gamedata,`\n💨 ${gamedata.player[squad-1]}'s ${emojis[3].emoji} retreated behind ${gamedata.squads[squad-1][pos].emoji}!`)
                }
                if ((gamedata.squads[squad-1][pos] ?? {id:undefined}).id == 5 && gamedata.squads[squad-1].length > 1) { // turtle
                    const temp = gamedata.squads[squad-1][pos]
                    gamedata.squads[squad-1].splice(pos,1)
                    gamedata.squads[squad-1].splice(gamedata.squads[squad-1].length,0,temp)
                    gamedata = richtextadd(gamedata,`\n💨 ${gamedata.player[squad-1]}'s ${emojis[5].emoji} retreated to the back of the Squad!`)
                    gamedata = alterhp(gamedata,squad,gamedata.squads[squad-1].length-1,squad,gamedata.squads[squad-1].length-1,1)
                }
                if ((gamedata.squads[squad-1][pos] ?? {id:undefined}).id == 67) { // lock with ink pen
                    console.log(squad,squad2,gamedata.squads[squad2-1][0])
                    const tempemj = gamedata.squads[squad2-1][0].emoji
                    const temphp = gamedata.squads[squad2-1][0].hp
                    const tempdmg = gamedata.squads[squad2-1][0].dmg + 1
                    gamedata.squads[squad2-1].splice(0,1,lodash.cloneDeep(emojis[68]))
                    gamedata.squads[squad2-1][0].hp = temphp
                    gamedata.squads[squad2-1][0].dmg = tempdmg
                    gamedata = richtextadd(gamedata,`\n🔒 ${gamedata.player[squad-1]}'s ${emojis[67].emoji} transformed ${gamedata.player[squad2-1]}'s ${tempemj} into a ${emojis[68].emoji}, and increased its attack power by 1!`)   
                }
                if ((gamedata.squads[squad-1][pos] ?? {id:undefined}).id == 15) { // fishing pole
                    const temp = gamedata.squads[squad2-1][gamedata.squads[squad2-1].length-1]
                    gamedata.squads[squad2-1].splice(gamedata.squads[squad2-1].length-1,1)
                    gamedata.squads[squad2-1].splice(0,0,temp)
                    gamedata = richtextadd(gamedata,`\n‼️ ${gamedata.player[squad-1]}'s ${emojis[15].emoji} pulled ${gamedata.player[squad2-1]}'s ${gamedata.squads[squad2-1][0].emoji} to the front of their Squad!`)
                }
                if ((gamedata.squads[squad-1][pos] ?? {id:undefined}).id == 16) { // golf
                    const temp = gamedata.squads[squad2-1][0]
                    gamedata.squads[squad2-1].splice(0,1)
                    gamedata.squads[squad2-1].splice(gamedata.squads[squad2-1].length,0,temp)
                    gamedata = richtextadd(gamedata,`\n‼️ ${gamedata.player[squad-1]}'s ${emojis[16].emoji} whacked ${gamedata.player[squad2-1]}'s ${gamedata.squads[squad2-1][gamedata.squads[squad2-1].length-1].emoji} to the back of their Squad!`)
                }
                if ((gamedata.squads[squad2-1][pos2] ?? {id:undefined}).id == 49) { // flying disc
                    if (gamedata.squads[squad2-1].length > 2) {
                        gamedata = alterhp(gamedata,squad2,1,squad,pos,-1,"whacked")
                    }
                }
            }
            if (gamedata.squads[0].length == 1 && (gamedata.squads[0][0] ?? {id:undefined}).id == 23) { // lizard / dragon
                gamedata.squads[0].splice(0,1,lodash.cloneDeep(emojis[24]))
                gamedata = richtextadd(gamedata,`\n⏫ ${gamedata.player[0]}'s ${emojis[23].emoji} evolved into a ${emojis[24].emoji}!`)
            }
            if (gamedata.squads[1].length == 1 && (gamedata.squads[1][0] ?? {id:undefined}).id == 23) { // lizard / dragon
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
        gamedata.newlines = 0
    }

    attack: {
        let basicattackflag = true
        const activeemoji = gamedata.squads[gamedata.playerturn-1][0]
        if (activeemoji.id == 0) { // clap
            basicattackflag = false
            gamedata = alterhp(gamedata,gamedata.playerturn*-1+3,0,gamedata.playerturn,0,0-(gamedata.squads[gamedata.playerturn-1][0].dmg + (gamedata.squads[gamedata.playerturn-1].filter(element => element.id == 0).length)),"clapped at")
        }
        if (activeemoji.id == 63) { // loud sound
            basicattackflag = false
            gamedata = alterhp(gamedata,gamedata.playerturn*-1+3,0,gamedata.playerturn,0,0-(gamedata.squads[gamedata.playerturn-1][0].dmg + (gamedata.squads[gamedata.playerturn-1].filter(element => element.id == 14).length)*2),"blasted")
        }
        if ((gamedata.squads[gamedata.playerturn-1][1] ?? {id:undefined}).id == 12) { // martial arts uniform
            basicattackflag = false
            gamedata = alterhp(gamedata,gamedata.playerturn*-1+3,0,gamedata.playerturn,0,0-gamedata.squads[gamedata.playerturn-1][0].dmg - 1)
        }
        if ((gamedata.squads[gamedata.playerturn-1][0] ?? {id:undefined}).id == 13 && gamedata.squads[gamedata.playerturn-1].some(x => x.id == 14)) { // guitar
            basicattackflag = false
            gamedata = alterhp(gamedata,gamedata.playerturn*-1+3,0,gamedata.playerturn,0,0-gamedata.squads[gamedata.playerturn-1][0].dmg - 1)
        }
		if ((gamedata.squads[gamedata.playerturn-1][0] ?? {id:undefined}).id == 44 && gamedata.squads[gamedata.playerturn-1].some(x => x.id == 14)) { // violin
            basicattackflag = false
            gamedata = alterhp(gamedata,gamedata.playerturn*-1+3,0,gamedata.playerturn,0,0-gamedata.squads[gamedata.playerturn-1][0].dmg - 3)
        }
        if (activeemoji.id == 60) { // mirror
            basicattackflag = false
            gamedata = alterhp(gamedata,gamedata.playerturn*-1+3,0,gamedata.playerturn,0,0-(gamedata.squads[gamedata.playerturn-1][0].dmg + gamedata.squads[gamedata.playerturn*-1+3][0].dmg*2),"reflected at")
        }
        if (basicattackflag) {
            gamedata = alterhp(gamedata,gamedata.playerturn*-1+3,0,gamedata.playerturn,0,0-gamedata.squads[gamedata.playerturn-1][0].dmg)
        }
        if ((gamedata.squads[gamedata.playerturn-1][1] ?? {id:undefined}).id == 8) { // handshake
            gamedata = alterhp(gamedata,gamedata.playerturn*-1+3,0,gamedata.playerturn,1,0-gamedata.squads[gamedata.playerturn-1][1].dmg)
        }
        if ((gamedata.squads[gamedata.playerturn-1][0] ?? {id:undefined}).id == 34 && gamedata.squads[gamedata.playerturn*-1+3].length>1) { // zap
            gamedata = alterhp(gamedata,gamedata.playerturn*-1+3,1,gamedata.playerturn,0,0-gamedata.squads[gamedata.playerturn-1][0].dmg,"zapped")
        }
	if ((gamedata.squads[gamedata.playerturn-1][0] ?? {id:undefined}).id == 37 && gamedata.turn%4<=2) { // ghost
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
        gamedata.logfile += " |  "
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

        for (let i = gamedata.squads[squad-1].length - 1; i > -1; i--) {
            if (gamedata.squads[squad-1][i].id == 33) { // dash
                gamedata = alterhp(gamedata,squad,0,squad,i,2)
            }
            if (gamedata.squads[squad-1][i].id == 58 && i!=gamedata.squads[squad-1].length-1) { // microbe
                if (gamedata.squads[squad-1][i+1].id != 58) {
                    const tempemj = gamedata.squads[squad-1][i+1].id
                    const temphp = gamedata.squads[squad-1][i+1].hp
                    const tempdmg = gamedata.squads[squad-1][i+1].dmg
                    gamedata.squads[squad-1].splice(i+1,1,lodash.cloneDeep(emojis[58]))
                    gamedata.squads[squad-1][i+1].hp = temphp
                    gamedata.squads[squad-1][i+1].dmg = tempdmg
                    gamedata = richtextadd(gamedata,`\n🦠 ${gamedata.player[squad-1]}'s ${emojis[58].emoji} infected a ${emojis[tempemj].emoji}!`)
                }
            }
        }

        for (let i = gamedata.squads[squad-1].length - 1; i > 0; i--) { // the shuffle part
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
            if (gamedata.squads[squad-1][i].id == 47) { // volcano
                gamedata.squads[0-squad+2].splice(0,0,lodash.cloneDeep(emojis[46]))
                gamedata.squads[0-squad+2][0].dmg = 1
                gamedata.squads[0-squad+2][0].hp = 1
                gamedata = richtextadd(gamedata,`\n🔥 ${gamedata.player[squad-1]}'s ${emojis[47].emoji} lit a ${emojis[46].emoji} in ${gamedata.player[0-squad+2]}'s Squad!`)
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

}

module.exports = {writelogs,getlogs,devoteemojis,database,getvault,getsquad,coinschange,allemojisofrarity,playturn,trysetupuser,fetchresearch,syncresearch}
