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
    "<:attack6:1278757369819562036>",
    "<:attack7:1278757359606435922>",
    "<:attack8:1278757344066666517>",
    "<:attack9:1278757315373306009>",
    "<:attack10:1278757304027844731>",
]

const raritysymbols = [
"*️⃣", "✳️", "⚛️", "<:master:1325987682941145259>"
]

const raritycolors = [
    0x3B88C3, 0x77B255, 0x9266CC, 0xEC9603
]

const raritynames = [
    "Common", "Rare", "Special", "Master"
]

const classes = [
    {
        id:0,
        name:"Healing",
        emoji:"<:healing:1326216242683711560>",
        legendary:51
    },
    {
        id:1,
        name:"Damaging",
        emoji:"<:damaging:1326215155339493488>",
        legendary:53
    },
    {
        id:2,
        name:"Defense",
        emoji:"<:defense:1326215162939576320>",
        legendary:7
    },
    {
        id:3,
        name:"Summoning",
        emoji:"<:summoning:1326215191234351188>",
        legendary:7
    },
    {
        id:4,
        name:"Movement",
        emoji:"<:movement:1326215169973682230>",
        legendary:7
    },
    {
        id:5,
        name:"Transformation",
        emoji:"<:transformation:1326215197131669639>",
        legendary:7
    },
    {
        id:6,
        name:"Shuffling",
        emoji:"<:shuffling:1326215184733179957>",
        legendary:7
    },
    {
        id:7,
        name:"Musical",
        emoji:"<:musical:1326215176294236212>",
        legendary:7
    },
]

const devotionhelp = "At any time through `/dojo` you have the ability to 🛐 **Devote** any amount of Emojis to the art of their class, permanently losing them in exchange for **\"devotion points\"** correlated to their rarity. You can view your devotion progress at any time by running `/devotions`.\n\nWhen you collect a total of **40** devotion points for a single class, you will be awarded the <:master:1325987682941145259> **Master** of that class to be used in your own Squad. The bar will roll back to 0, and you are able to get more of the same <:master:1325987682941145259> **Master**s. These <:master:1325987682941145259> **Master** Emojis are quite powerful, synergizing with their class like no other Emoji can."

/*

Class ideas:
Healing: X-ray
Damaging: Wolf
Summoning: Wand
Defense: Mirror
Transforming: Mask
Shuffling: Volcano
Musical?
Movement
Solar?

*/

const emojis = [
    {
        emoji:"👏",
        id:0,
        hp:4,
        dmg:0,
        rarity:0,
        names:[
            "Clap",
            "Clapping",
            "Clapping Hands"
        ],
        class:1,
        description:"Deals 1 more damage for each other undefeated friendly 👏"
    },
    {
        emoji:"😘",
        id:1,
        hp:4,
        dmg:2,
        rarity:0,
        names:[
            "Kissing Heart",
            "Kiss",
            "Kissing"
        ],
        class:0,
        description:"When attacked, heals the friendly Emoji in front of it by 1"
    },
    {
        emoji:"😌",
        id:2,
        hp:4,
        dmg:2,
        rarity:0,
        names:[
            "Relieved",
            "Calm",
            "Relaxed"
        ],
        class:2,
        description:"Takes 1 less damage from every attack, to a minimum of 1"
    },
    {
        emoji:"😰",
        id:3,
        hp:6,
        dmg:1,
        rarity:0,
        names:[
            "Cold Sweat",
            "Worry",
            "Worried"
        ],
        class:4,
        description:"When attacked, switches places with the friendly Emoji behind it"
    },
    {
        emoji:"😀",
        id:4,
        hp:6,
        dmg:3,
        rarity:0,
        names:[
            "Grinning"
        ],
        class:1,
        description:"Nothing special"
    },
    {
        emoji:"🐢",
        id:5,
        hp:5,
        dmg:1,
        rarity:1,
        names:[
            "Turtle"
        ],
        class:4,
        description:"When attacked, moves to the back of your Squad and Heals itself by 1"
    },
    {
        emoji:"🗣️",
        id:6,
        hp:4,
        dmg:2,
        rarity:2,
        names:[
            "Speaking Head",
            "Speaking"
        ],
        class:5,
        description:"When attacking at more than 2 health, lowers the enemy Emoji's attack power by 1 to a minumum of 0"
    },
    {
        emoji:"😶",
        id:7,
        hp:1,
        dmg:1,
        rarity:-1,
        names:[
            "No Mouth",
            "Blank"
        ],
        description:"Nothing special"
    },
    {
        emoji:"🤝",
        id:8,
        hp:4,
        dmg:1,
        rarity:1,
        names:[
            "Handshake"
        ],
        class:1,
        description:"Will also attack if there is one friendly Emoji in front of it"
    },
    {
        emoji:"🎓",
        id:9,
        hp:1,
        dmg:0,
        rarity:1,
        names:[
            "Mortar Board",
            "Graduation Hat"
        ],
        class:3,
        description:"When attacked or defeated, summons three 👏 with 1 health and one attack value and defeats itself"
    },
    {
        emoji:"🔀",
        id:10,
        hp:1,
        dmg:0,
        rarity:0,
        names:[
            "Twisted Rightwards Arrows",
            "Shuffle",
            "Shuffle Button"
        ],
        class:6,
        description:"When attacked or defeated, Shuffles the enemy Squad and defeats itself"
    },
    {
        emoji:"🪦",
        id:11,
        hp:1,
        dmg:2,
        rarity:0,
        names:[
            "Headstone",
            "Grave",
            "Gravestone"
        ],
        class:0,
        description:"When a friendly Emoji is defeated, heals itself by 1"
    },
    {
        emoji:"🥋",
        id:12,
        hp:2,
        dmg:2,
        rarity:0,
        names:[
            "Martial Arts Uniform",
            "Gi"
        ],
        class:1,
        description:"The friendly Emoji in front of this attacks for 1 more damage"
    },
    {
        emoji:"🎸",
        id:13,
        hp:4,
        dmg:1,
        rarity:0,
        names:[
            "Guitar"
        ],
        class:7,
        description:"If you have at least one undefeated 🎶 on your squad, deal 1 more damage"
    },
    {
        emoji:"🎶",
        id:14,
        hp:1,
        dmg:1,
        rarity:0,
        names:[
            "Notes",
            "Music",
            "Musical Notes",
            "Music Notes",
            "Music Note"
        ],
        class:7,
        description:"Nothing special"
    },
    {
        emoji:"🎣",
        id:15,
        hp:3,
        dmg:1,
        rarity:0,
        names:[
            "Fishing Pole And Fish",
            "Fishing Pole",
            "Fishing Rod"
        ],
        class:4,
        description:"When attacked, moves the furthermost enemy emoji to the front of the enemy Squad"
    },
    {
        emoji:"⛳",
        id:16,
        hp:3,
        dmg:1,
        rarity:0,
        names:[
            "Golf"
        ],
        class:4,
        description:"When attacked, moves the frontmost enemy emoji to the back of the enemy Squad"
    },
    {
        emoji:"🛡️",
        id:17,
        hp:4,
        dmg:2,
        rarity:1,
        names:[
            "Shield"
        ],
        class:2,
        description:"Takes 1 less damage for every friendly undefeated 😌, to a minimum of 1. Cannot be healed"
    },
    {
        emoji:"💀",
        id:18,
        hp:1,
        dmg:2,
        rarity:1,
        names:[
            "Skull"
        ],
        class:0,
        description:"When an enemy Emoji is killed, heals itself by 1"
    },
    {
        emoji:"🥴",
        id:19,
        hp:4,
        dmg:2,
        rarity:1,
        names:[
            "Woozy Face"
        ],
        class:6,
        description:"When your Squad is Shuffled, heals itself by 1"
    },
    {
        emoji:"♟️",
        id:20,
        hp:1,
        dmg:2,
        rarity:0,
        names:[
            "Chess Pawn",
            "Pawn"
        ],
        class:5,
        description:"When this defeats an Emoji, become a 👑"
    },
    {
        emoji:"👑",
        id:21,
        hp:8,
        dmg:3,
        rarity:-1,
        names:[
            "Crown"
        ],
        description:"Nothing special"
    },
    {
        emoji:"😡",
        id:22,
        hp:3,
        dmg:0,
        rarity:0,
        names:[
            "Rage",
            "Angry"
        ],
        class:1,
        description:"Attacks for the number of undefeated enemy Emojis to a maximum of 3"
    },
    {
        emoji:"🦎",
        id:23,
        hp:3,
        dmg:1,
        rarity:0,
        names:[
            "Lizard",
            "Gecko"
        ],
        class:5,
        description:"If this is the only undefeated friendly Emoji, become a 🐲"
    },
    {
        emoji:"🐲",
        id:24,
        hp:6,
        dmg:5,
        rarity:-1,
        names:[
            "Dragon Face",
            "Dragon"
        ],
        description:"Nothing special"
    },
    {
        emoji:"☠️",
        id:25,
        hp:3,
        dmg:1,
        rarity:2,
        names:[
            "Skull Crossbones",
            "Skull and Crossbones",
            "Jolly Roger"
        ],
        class:0,
        description:"When an enemy Emoji is killed, heals the friendly Emoji behind it by 1"
    },
    {
        emoji:"🍒",
        id:26,
        hp:2,
        dmg:1,
        rarity:1,
        names:[
            "Cherries",
            "Cherry"
        ],
        class:3,
        description:"At the beginning of the Battle, doubles itself"
    },
    {
        emoji:"🌀",
        id:27,
        hp:4,
        dmg:1,
        rarity:1,
        names:[
            "Cyclone",
            "Hurricane",
            "Spiral"
        ],
        class:6,
        description:"When your Squad is Shuffled, Shuffles the opponent Squad and defeats itself (Only one takes effect if multiple are undefeated)"
    },
    {
        emoji:"🛻",
        id:28,
        hp:4,
        dmg:3,
        rarity:1,
        names:[
            "Pickup Truck",
            "Truck"
        ],
        class:4,
        description:"When your Squad is Shuffled, moves to the back"
    },
    {
        emoji:"🚏",
        id:29,
        hp:1,
        dmg:2,
        rarity:1,
        names:[
            "Busstop",
            "Bus Stop"
        ],
        class:0,
        description:"When your Squad is Shuffled, heals the Emoji behind itself by 2"
    },
    {
        emoji:"🚌",
        id:30,
        hp:4,
        dmg:2,
        rarity:2,
        names:[
            "Bus"
        ],
        class:4,
        description:"When your Squad is Shuffled and there is at least one undefeated friendly 🚏, moves behind it"
    },
    {
        emoji:"🍿",
        id:31,
        hp:4,
        dmg:2,
        rarity:1,
        names:[
            "Popcorn"
        ],
        class:0,
        description:"When your Squad is Shuffled, heals the frontmost friendly Emoji by 2"
    },
    {
        emoji:"🌳",
        id:32,
        hp:3,
        dmg:2,
        rarity:2,
        names:[
            "Deciduous Tree",
            "Tree",
            "Oak Tree"
        ],
        class:6,
        description:"While undefeated, your squad cannot be Shuffled"
    },
    {
        emoji:"💨",
        id:33,
        hp:1,
        dmg:1,
        rarity:0,
        names:[
            "Dash",
            "Puff of Smoke",
            "Poof"
        ],
        class:0,
        description:"Before your Squad is Shuffled, heals the frontmost friendly Emoji by 2"
    },
    {
        emoji:"⚡",
        id:34,
        hp:2,
        dmg:2,
        rarity:2,
        names:[
            "Zap",
            "Lightning",
            "Lightning Bolt"
        ],
        class:1,
        description:"Attacks the 2 frontmost enemy emojis at once"
    },
    {
        emoji:"🧱",
        id:35,
        hp:2,
        dmg:1,
        rarity:1,
        names:[
            "Bricks",
            "Brick"
        ],
        class:2,
        description:"Takes 2 less damage from every attack, to a minimum of 1. Cannot be healed"
    },
    {
        emoji:"💣",
        id:36,
        hp:1,
        dmg:0,
        rarity:1,
        names:[
            "Bomb"
        ],
        class:1,
        description:"When attacked or defeated, defeats the frontmost enemy emoji and defeats itself"
    },
    {
        emoji:"👻",
        id:37,
        hp:4,
        dmg:1,
        rarity:2,
        names:[
            "Ghost"
        ],
        class:5,
        description:"Every other round when attacking, turns the frontmost enemy Emoji into a 😶 with identical stats"
    },
    {
        emoji:"✨",
        id:38,
        hp:3,
        dmg:-1,
        rarity:-1,
        names:[
            "Sparkles",
            "Sparkle"
        ],
        description:"Nothing special"
    },
    {
        emoji:"🦄",
        id:39,
        hp:3,
        dmg:2,
        rarity:2,
        names:[
            "Unicorn"
        ],
        class:3,
        description:"When defeated, summons ✨ at the front of the enemy Squad"
    },
    {
        emoji:"🃏",
        id:40,
        hp:8,
        dmg:2,
        rarity:0,
        names:[
            "Black Joker",
            "Joker",
            "Joker Card"
        ],
        class:2,
        description:"Increases any damage taken to itself by 1"
    },
    {
        emoji:"🌪️",
        id:41,
        hp:3,
        dmg:1,
        rarity:1,
        names:[
            "Cloud Tornado",
            "Tornado"
        ],
        class:6,
        description:"When attacked or defeated, Shuffles the enemy Squad"
    },
    {
        emoji:"💃",
        id:42,
        hp:3,
        dmg:1,
        rarity:1,
        names:[
            "Dancer",
            "Dancing Woman"
        ],
        class:4,
        description:"After attacking, switches places with the friendly Emoji behind it"
    },
    {
        emoji:"🪅",
        id:43,
        hp:4,
        dmg:1,
        rarity:1,
        names:[
            "Piñata",
            "Pinata"
        ],
        class:2,
        description:"When defeated, heals the new frontmost friendly Emoji by 2 and damages the frontmost enemy Emoji by 2"
    },
    {
        emoji:"🎻",
        id:44,
        hp:3,
        dmg:2,
        rarity:0,
        names:[
            "Violin",
            "Cello"
        ],
        class:7,
        description:"If there is at least one undefeated friendly 🎶, deal 3 more damage"
    },
    {
        emoji:"📻",
        id:45,
        hp:3,
        dmg:2,
        rarity:1,
        names:[
            "Radio"
        ],
        class:7,
        description:"When defeated, summons 🎶 at the back of your Squad"
    },
    {
        emoji:"🔥",
        id:46,
        hp:4,
        dmg:4,
        rarity:1,
        names:[
            "Fire"
        ],
        class:1,
        description:"When this Emoji is defeated, damages the new frontmost friendly Emoji by 2"
    },
    {
        emoji:"🌋",
        id:47,
        hp:4,
        dmg:2,
        rarity:3, // Master of Shuffling
        names:[
            "Volcano"
        ],
        class:6,
        description:"When your Squad is Shuffled, summon 🔥 at the front of the enemy team with 1 health and 1 attack power"
    },
    {
        emoji:"🎉",
        id:48,
        hp:2,
        dmg:1,
        rarity:2,
        names:[
            "Tada",
            "Party Popper",
            "Party Horn"
        ],
        class:0,
        description:"When an enemy Emoji is defeated, heals the frontmost friendly Emoji for 1"
    },
    {
        emoji:"🥏",
        id:49,
        hp:4,
        dmg:4,
        rarity:2,
        names:[
            "Flying Disc",
            "Disc",
            "Frisbee"
        ],
        class:1,
        description:"Deals one damage to the Emoji behind this when attacking"
    },
    {
        emoji:"⏭️",
        id:50,
        hp:3,
        dmg:2,
        rarity:1,
        names:[
            "Track Next",
            "Next Track",
            "Next Track Button"
        ],
        class:6,
        description:"When healed, Shuffles your Squad"
    },
    {
        emoji:"🩻",
        id:51,
        hp:1,
        dmg:2,
        rarity:3, // Master of Healing
        names:[
            "X Ray",
            "X-ray",
            "Xray"
        ],
        class:0,
        description:"When a friendly Emoji is defeated, heals all friendly Emojis behind itself by 1"
    },
    {
        emoji:"🌃",
        id:52,
        hp:3,
        dmg:2,
        rarity:2,
        names:[
            "Night with Stars",
            "Night",
            "Night in City"
        ],
        class:1,
        description:"When this defeats an Emoji, hurts all enemy copies of it by 1"
    },
    {
        emoji:"🐺",
        id:53,
        hp:4,
        dmg:3,
        rarity:3, // Master of Damaging
        names:[
            "Wolf"
        ],
        class:1,
        description:"When this defeats an Emoji, heals itself by 1 and increases its attack power by 1"
    },
    {
        emoji:"🫧",
        id:54,
        hp:2,
        dmg:2,
        rarity:1,
        names:[
            "Bubbles",
            "Bubble"
        ],
        class:2,
        description:"Reduces any damage taken to itself to 1. Cannot be healed"
    },
    {
        emoji:"🍌",
        id:55,
        hp:2,
        dmg:2,
        rarity:1,
        names:[
            "Banana",
            "Banana Peel"
        ],
        class:4,
        description:"When defeated, damages the frontmost enemy Emoji by 2 and moves it to the back of the enemy Squad"
    },
    {
        emoji:"🧲",
        id:56,
        hp:2,
        dmg:2,
        rarity:1,
        names:[
            "Magnet"
        ],
        class:4,
        description:"When defeated, damages the furthermost enemy Emoji by 2 and moves it to the front of the enemy Squad"
    },
    {
        emoji:"😷",
        id:57,
        hp:2,
        dmg:1,
        rarity:3, // Master of Transformation
        names:[
            "Mask",
            "Facemask",
            "Face Mask",
            "Face with Mask"
        ],
        class:5,
        description:"When defeated, summons 🦠 at the front of the enemy Squad, and then Shuffles it"
    },
    {
        emoji:"🦠",
        id:58,
        hp:2,
        dmg:1,
        rarity:-1,
        names:[
            "Microbe",
            "Virus",
            "Germ",
            "Bacteria"
        ],
        description:"Before being Shuffled, transforms the Emoji behind it into a 🦠 with identical stats"
    },
    {
        emoji:"🛸",
        id:59,
        hp:3,
        dmg:2,
        rarity:2,
        names:[
            "Flying Saucer",
            "Saucer",
            "Spaceship",
            "Ufo"
        ],
        class:6,
        description:"When defeated, Shuffle the enemy Squad and deal 3 damage to the frontmost enemy Emoji"
    },
    {
        emoji:"🪞",
        id:60,
        hp:4,
        dmg:0,
        rarity:3, // Master of Defense
        names:[
            "Mirror",
        ],
        class:2,
        description:"Attacks for as much damage as the frontmost enemy Emoji ×2, plus its own attack power"
    },
    {
        emoji:"🪄",
        id:61,
        hp:2,
        dmg:1,
        rarity:3, // Master of Summoning
        names:[
            "Magic Wand",
            "Wand"
        ],
        class:3,
        description:"When the first friendly Emoji is defeated this round, revives it at 2 health at the back of the Squad, and defeats itself"
    },
    {
        emoji:"🏙️",
        id:62,
        hp:1,
        dmg:1,
        rarity:2,
        names:[
            "Cityscape",
            "City",
            "Skyline"
        ],
        class:0,
        description:"When a friendly Emoji dies, heals all friendly copies of it by 1"
    },
    {
        emoji:"🔊",
        id:63,
        hp:4,
        dmg:0,
        rarity:3,
        names:[
            "Loud Sound",
            "Speaker",
            "Audio"
        ],
        class:7,
        description:"Attacks for as much damage as the number of friendly 🎶 ×2, plus its own attack power"
    },
]

module.exports = {healthemojis,dmgemojis,raritycolors,devotionhelp,classes,emojis,raritysymbols,raritynames}
