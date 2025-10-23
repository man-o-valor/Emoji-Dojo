const healthemojis = [
  "➖",
  "0️⃣",
  "1️⃣",
  "2️⃣",
  "3️⃣",
  "4️⃣",
  "5️⃣",
  "6️⃣",
  "7️⃣",
  "8️⃣",
  "9️⃣",
  "🔟",
  "➕"
  /*"<:health_0:1278757291646259232>",
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
  "<:health15:1293308124144341033>",*/
];

const dmgemojis = [
  "➖",
  "➖",
  "➖",
  "➖",
  "0️⃣",
  "1️⃣",
  "2️⃣",
  "3️⃣",
  "4️⃣",
  "5️⃣",
  "6️⃣",
  "7️⃣",
  "8️⃣",
  "9️⃣",
  "🔟",
  "➕"
  /*"<:attack__3:1308565301226377348>",
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
  "<:attack10:1278757304027844731>",*/
];

const quantityemojis = [
  "<:1_:1430669290322919635>",
  "<:2_:1430669288909312040>",
  "<:3_:1430669287470927892>",
  "<:4_:1430669285386354748>",
  "<:5_:1430669283800907817>",
  "<:6_:1430669282588495992>",
  "<:7_:1430669280965562408>",
  "<:8_:1430669280164184165>",
  "<:9_:1430669278914543746>",
  "<:10:1430669277832155307>",
  "<:11:1430669276834168974>",
  "<:12:1430669276125331577>",
  "<:13:1430669275181482026>",
  "<:14:1430669273872990319>",
  "<:15:1430669271226388573>",
  "<:16:1430669269103939645>",
  "<:17:1430669268005163119>",
  "<:18:1430669266679496744>",
  "<:19:1430669265702223883>",
  "<:20:1430669263412133949>",
  "<:21:1430669262543913033>",
  "<:22:1430669261541478470>",
  "<:23:1430669260585173038>",
  "<:24:1430669258844672072>",
  "<:25:1430669257192116225>",
  "<:26:1430669255967379506>",
  "<:27:1430669254956417154>",
  "<:28:1430669253543067808>",
  "<:29:1430669251647377460>",
  "<:30:1430669250804187197>",
  "<:31:1430669248912560250>"
];

const raritysymbols = ["*️⃣", "✳️", "⚛️", "<:master:1325987682941145259>"];

const raritynames = ["Common", "Rare", "Special", "Master"];

const classes = [
  {
    id: 0,
    name: "Healing",
    emoji: "<:healing:1326216242683711560>",
    legendary: 51
  },
  {
    id: 1,
    name: "Damaging",
    emoji: "<:damaging:1326215155339493488>",
    legendary: 53
  },
  {
    id: 2,
    name: "Defense",
    emoji: "<:defense:1326215162939576320>",
    legendary: 60
  },
  {
    id: 3,
    name: "Summoning",
    emoji: "<:summoning:1326215191234351188>",
    legendary: 111
  },
  {
    id: 4,
    name: "Movement",
    emoji: "<:movement:1326215169973682230>",
    legendary: 82
  },
  {
    id: 5,
    name: "Transformation",
    emoji: "<:transformation:1326215197131669639>",
    legendary: 57
  },
  {
    id: 6,
    name: "Shuffling",
    emoji: "<:shuffling:1397251831159062739>",
    legendary: 47
  },
  {
    id: 7,
    name: "Musical",
    emoji: "<:musical:1326215176294236212>",
    legendary: 63
  },
  {
    id: 8,
    name: "Teamup",
    emoji: "<:teamup:1396899478069317712>",
    legendary: 95
  }
];

const devotionhelp =
  'At any time through `/dojo` you have the ability to 🛐 **Devote** any amount of Emojis to the art of their class, permanently losing them in exchange for **"devotion points"** correlated to their rarity. You can view your devotion progress at any time by running `/devotions`.\n\nWhen you collect a total of **40** devotion points for a single class, you will be awarded the <:master:1325987682941145259> **Master** of that class to be used in your own Squad. The bar will roll back to 0, and you are able to get more of the same <:master:1325987682941145259> **Master**s. These <:master:1325987682941145259> **Master** Emojis are quite powerful, synergizing with their class like no other Emoji can.';

const emojis = [
  {
    emoji: "👏",
    id: 0,
    hp: 4,
    dmg: 0,
    rarity: 0,
    names: ["Clap", "Clapping", "Clapping Hands", "Boi", "Spades", "Applause", "Bravo", "Well Done", "High Five"],
    class: 8,
    description: "Deals 1 more damage for each undefeated friendly 👏"
  },
  {
    emoji: "😘",
    id: 1,
    hp: 3,
    dmg: 1,
    rarity: 1,
    names: [
      "Kissing Heart",
      "Kiss",
      "Kissing",
      "Mwah",
      "Girlfriend",
      "Gf",
      "Boyfriend",
      "Bf",
      "Partner",
      "Hearts",
      "Blowing Kiss",
      "Smooch",
      "Love",
      "Sweetheart"
    ],
    class: 0,
    description: "When the friendly Emoji in front of this is attacked for more than 1 damage, heals it by 1"
  },
  {
    emoji: "😌",
    id: 2,
    hp: 3,
    dmg: 2,
    rarity: 0,
    names: ["Relieved", "Calm", "Relaxed", "Clubs", "Zen", "Peaceful", "Serene", "Content"],
    class: 2,
    description: "Takes 1 less damage from every attack, to a minimum of 1"
  },
  {
    emoji: "😰",
    id: 3,
    hp: 6,
    dmg: 1,
    rarity: 0,
    names: [
      "Cold Sweat",
      "Worry",
      "Worried",
      "Cold",
      "Horrified",
      "Horror",
      "Mortified",
      "Scared",
      "Sweating",
      "Sweat",
      "Anxious",
      "Nervous",
      "Sweat Drop",
      "Stressed"
    ],
    class: 4,
    description: "When attacked, switches places with the friendly Emoji behind it"
  },
  {
    emoji: "😀",
    id: 4,
    hp: 5,
    dmg: 3,
    rarity: 0,
    names: [
      "Grinning",
      "Grinning Face",
      "Grin",
      "Smiling",
      "Smiling Face",
      "Smile",
      "Happy",
      "Happy Face",
      "Swords",
      "Cheerful",
      "Beaming",
      "Joyful",
      "Grinny"
    ],
    class: 1,
    description: "Nothing special"
  },
  {
    emoji: "🐢",
    id: 5,
    hp: 5,
    dmg: 1,
    rarity: 1,
    names: ["Turtle", "Tortoise", "Slowpoke", "Shell"],
    class: 4,
    description: "When attacked, moves to the back of your Squad and heals itself by 1"
  },
  {
    emoji: "🗣️",
    id: 6,
    hp: 4,
    dmg: 2,
    rarity: 2,
    names: ["Speaking Head", "Speaking", "Facts", "Spitting", "Shout", "Talk", "Speech", "Voice", "Yell"],
    class: 5,
    description: "When attacking at more than 2 health, lowers the enemy Emoji's attack power by 1 to a minimum of 0"
  },
  {
    emoji: "😶",
    id: 7,
    hp: 1,
    dmg: 1,
    rarity: -1,
    names: ["No Mouth", "Blank", "Petrified", "Speechless", "Blank Face", "Expressionless"],
    description: "Nothing special (spooked by 👻)"
  },
  {
    emoji: "🤝",
    id: 8,
    hp: 3,
    dmg: 1,
    rarity: 1,
    names: [
      "Handshake",
      "Hand Shake",
      "Shake",
      "Hands",
      "Hand",
      "Jacks",
      "Agreement",
      "Deal",
      "Collaboration",
      "Unity"
    ],
    class: 8,
    description: "Will also attack if there is one friendly Emoji in front of it"
  },
  {
    emoji: "🎓",
    id: 9,
    hp: 1,
    dmg: 0,
    rarity: 1,
    names: [
      "Mortar Board",
      "Graduation Hat",
      "Grad Hat",
      "Graduation Cap",
      "Grad Cap",
      "Scholar",
      "Student",
      "Education",
      "Cap",
      "Mortar"
    ],
    class: 3,
    description: "When attacked or defeated, summons three 👏 with 1 health and one attack value and defeats itself"
  },
  {
    emoji: "🔀",
    id: 10,
    hp: 1,
    dmg: 0,
    rarity: 0,
    names: [
      "Twisted Rightwards Arrows",
      "Shuffle",
      "Shuffle Button",
      "Trwa",
      "Mix",
      "Random",
      "Scramble",
      "Switch",
      "Twisted"
    ],
    class: 6,
    description: "When attacked or defeated, Shuffles the enemy Squad and defeats itself"
  },
  {
    emoji: "🪦",
    id: 11,
    hp: 1,
    dmg: 2,
    rarity: 1,
    names: ["Headstone", "Grave", "Gravestone", "Tombstone", "Tomb", "Sprouts", "Rest", "RIP", "Graveyard", "Memorial"],
    class: 0,
    description: "When a friendly Emoji is defeated, heals itself by 1"
  },
  {
    emoji: "🥋",
    id: 12,
    hp: 2,
    dmg: 2,
    rarity: 0,
    names: [
      "Martial Arts Uniform",
      "Gi",
      "Kung Fu",
      "Kungfu",
      "Kung-fu",
      "Karate",
      "Martial Artist",
      "Uniform",
      "Dojo",
      "Martial"
    ],
    class: 8,
    description: "The friendly Emoji in front of this attacks for 1 more damage"
  },
  {
    emoji: "🎸",
    id: 13,
    hp: 4,
    dmg: 2,
    rarity: 0,
    names: ["Guitar", "Electric Guitar", "Rock and Roll", "Strum", "Guitarist", "Rockstar", "Strings"],
    class: 7,
    description: "If there is at least one undefeated friendly 🎶, deal 1 more damage"
  },
  {
    emoji: "🎶",
    id: 14,
    hp: 1,
    dmg: 1,
    rarity: 0,
    names: [
      "Notes",
      "Music",
      "Musical Notes",
      "Music Notes",
      "Music Note",
      "Melody",
      "Beat",
      "Tune",
      "Song",
      "Harmony",
      "Chorus"
    ],
    class: 7,
    description: "Nothing special (makes many music-related Emojis more powerful)"
  },
  {
    emoji: "🎣",
    id: 15,
    hp: 3,
    dmg: 1,
    rarity: 0,
    names: [
      "Fishing Pole And Fish",
      "Fishing Pole",
      "Fishing Rod",
      "Rod",
      "Fish",
      "Fisher",
      "Fisherman",
      "Angler",
      "Catch",
      "Hook",
      "Fishing Line",
      "Angling"
    ],
    class: 4,
    description: "After attacking, moves the furthermost enemy Emoji to the front of the enemy Squad"
  },
  {
    emoji: "⛳",
    id: 16,
    hp: 3,
    dmg: 1,
    rarity: 0,
    names: ["Golf", "Hole in one", "Putt", "Drive", "Golf Course", "Green", "Flag", "Hole"],
    class: 4,
    description: "After attacking, moves the target to the back of the enemy Squad"
  },
  {
    emoji: "🛡️",
    id: 17,
    hp: 4,
    dmg: 2,
    rarity: 1,
    names: ["Shield", "Guard", "Ward", "Houses", "Protector", "Defender", "Barrier", "Fortress"],
    class: 2,
    description:
      "Takes 1 less damage for every friendly undefeated Defense class Emoji, to a minimum of 1. Cannot be healed"
  },
  {
    emoji: "💀",
    id: 18,
    hp: 1,
    dmg: 2,
    rarity: 1,
    names: ["Skull", "Dead", "Death", "Diamonds", "Skeleton", "Perished", "Skully"],
    class: 0,
    description: "When an enemy Emoji is defeated, heals itself by 1"
  },
  {
    emoji: "🥴",
    id: 19,
    hp: 4,
    dmg: 2,
    rarity: 1,
    names: ["Woozy Face", "Woozy", "Drunk", "Tipsy", "Octothorpe", "Dizzy", "Confused", "Wobbly", "Tipsy Face"],
    class: 6,
    description: "When your Squad is Shuffled, heals itself by 1"
  },
  {
    emoji: "♟️",
    id: 20,
    hp: 1,
    dmg: 2,
    rarity: 0,
    names: ["Chess Pawn", "Pawn", "Chess", "Piece", "Game", "Pawn Piece"],
    class: 5,
    description: "When this defeats an Emoji, it becomes a 👑"
  },
  {
    emoji: "👑",
    id: 21,
    hp: 8,
    dmg: 3,
    rarity: -1,
    names: ["Crown", "Royalty", "Royal", "Queen", "King", "Monarch", "Leader", "Regal", "Majesty"],
    description: "Nothing special (starts as ♟️)"
  },
  {
    emoji: "😡",
    id: 22,
    hp: 3,
    dmg: 0,
    rarity: 0,
    names: ["Rage", "Angry", "Mad", "Fury", "Furious", "Enraged", "Temper", "Irate", "Annoyed", "Red Face"],
    class: 1,
    description: "Attacks for half the number of undefeated enemy Emojis (rounded up), plus its attack power"
  },
  {
    emoji: "🦎",
    id: 23,
    hp: 3,
    dmg: 1,
    rarity: 0,
    names: ["Lizard", "Gecko", "Scaly", "Scalie"],
    class: 5,
    description: "If this is the only undefeated friendly Emoji, become a 🐲"
  },
  {
    emoji: "🐲",
    id: 24,
    hp: 6,
    dmg: 5,
    rarity: -1,
    names: ["Dragon Face", "Dragon", "Big Lizard", "Lizard Crown", "Mythical", "Beast"],
    description: "Nothing special (starts as 🦎)"
  },
  {
    emoji: "☠️",
    id: 25,
    hp: 3,
    dmg: 1,
    rarity: 2,
    names: [
      "Skull Crossbones",
      "Skull and Crossbones",
      "Jolly Roger",
      "Crossbones",
      "Pirate",
      "Danger",
      "Toxic",
      "Deadly"
    ],
    class: 0,
    description: "When an enemy Emoji is defeated, heals the friendly Emoji behind it by 1"
  },
  {
    emoji: "🍒",
    id: 26,
    hp: 2,
    dmg: 1,
    rarity: 1,
    names: ["Cherries", "Cherry", "Sweet", "Double", "Pair"],
    class: 3,
    description: "At the beginning of the Battle, summons 🍒 in front of itself"
  },
  {
    emoji: "🌀",
    id: 27,
    hp: 4,
    dmg: 1,
    rarity: 1,
    names: ["Cyclone", "Whirlwind", "Whirl", "Spiral", "Vortex"],
    class: 6,
    description:
      "When your Squad is Shuffled, Shuffles the enemy Squad and defeats itself (Only one takes effect if multiple are undefeated)"
  },
  {
    emoji: "🛻",
    id: 28,
    hp: 3,
    dmg: 3,
    rarity: 1,
    names: ["Pickup Truck", "Truck", "Pickup", "Vehicle", "Drive", "Transport", "Hauler"],
    class: 7,
    description: "When your Squad is Shuffled, always ends at the back"
  },
  {
    emoji: "🚏",
    id: 29,
    hp: 1,
    dmg: 2,
    rarity: 1,
    names: ["Busstop", "Bus Stop", "Stop", "Station", "Transit", "Bus Sign"],
    class: 0,
    description: "When your Squad is Shuffled, heals the Emoji behind itself by 2"
  },
  {
    emoji: "🚌",
    id: 30,
    hp: 4,
    dmg: 4,
    rarity: 2,
    names: ["Bus", "Trolley", "Tram", "Train", "Transport", "Vehicle", "Commute", "Public Transport"],
    class: 7,
    description:
      "When your Squad is Shuffled, heals itself by 2, and if there is at least one undefeated friendly 🚏, ends behind it"
  },
  {
    emoji: "🍿",
    id: 31,
    hp: 4,
    dmg: 2,
    rarity: 1,
    names: ["Popcorn", "Pop", "Corn", "Kings", "Snack", "Movie", "Cinema"],
    class: 0,
    description: "When your Squad is Shuffled, heals the frontmost friendly Emoji by 2"
  },
  {
    emoji: "🧊",
    id: 32,
    hp: 3,
    dmg: 2,
    rarity: 2,
    names: ["Ice Cube", "Ice", "Cold", "Frozen", "Freeze", "Chill", "Cube", "Icy"],
    class: 6,
    description: "While undefeated, your squad cannot be Shuffled"
  },
  {
    emoji: "💨",
    id: 33,
    hp: 1,
    dmg: 1,
    rarity: 0,
    names: ["Dash", "Puff of Smoke", "Poof", "Gust of Wind", "Gust", "Wind", "Blow", "Whoosh", "Air", "Breeze"],
    class: 0,
    description: "Before your Squad is Shuffled, heals the frontmost friendly Emoji by 2"
  },
  {
    emoji: "⚡",
    id: 34,
    hp: 2,
    dmg: 2,
    rarity: 2,
    names: [
      "Zap",
      "Lightning",
      "Lightning Bolt",
      "Thunder",
      "Thunder Bolt",
      "Acdc",
      "Shock",
      "Bolt",
      "Energy",
      "Charge"
    ],
    class: 1,
    description: "When attacking, also attacks the Emoji behind the target"
  },
  {
    emoji: "🧱",
    id: 35,
    hp: 4,
    dmg: 1,
    rarity: 1,
    names: ["Bricks", "Brick", "Wall", "Masonry"],
    class: 2,
    description: "Takes 2 less damage from every attack, to a minimum of 1. Cannot be healed"
  },
  {
    emoji: "💣",
    id: 36,
    hp: 1,
    dmg: 0,
    rarity: 1,
    names: ["Bomb", "Explosive"],
    class: 1,
    description: "When attacked or defeated, defeats the frontmost enemy Emoji and defeats itself"
  },
  {
    emoji: "👻",
    id: 37,
    hp: 4,
    dmg: 1,
    rarity: 2,
    names: ["Ghost", "Spectre", "Haunt", "Petrify", "Spirit", "Phantom", "Spook", "Wraith"],
    class: 5,
    description: "Every other round when attacking, transforms the frontmost enemy Emoji into 😶 with identical stats"
  },
  {
    emoji: "✨",
    id: 38,
    hp: 3,
    dmg: -1,
    rarity: -1,
    names: ["Sparkles", "Sparkle", "Stardust", "Twinkles", "Twinkle", "Glitter", "Shine", "Gleam", "Spark", "Magic"],
    description: "After attacking, damages itself by 1 (scattered by 🦄)"
  },
  {
    emoji: "🦄",
    id: 39,
    hp: 3,
    dmg: 2,
    rarity: 2,
    names: ["Unicorn", "Magic Horse", "Pegasus", "Pony", "Fantasy", "Mystic"],
    class: 3,
    description: "When defeated, summons ✨ at the front of the enemy Squad"
  },
  {
    emoji: "🃏",
    id: 40,
    hp: 7,
    dmg: 3,
    rarity: 0,
    names: ["Black Joker", "Joker", "Joker Card", "Jimbo", "Card", "Wild", "Jester", "Trickster"],
    class: 2,
    description: "Increases any damage taken to itself by 1"
  },
  {
    emoji: "🌪️",
    id: 41,
    hp: 3,
    dmg: 1,
    rarity: 1,
    names: ["Cloud Tornado", "Tornado"],
    class: 6,
    description: "When attacked or defeated, Shuffles the attacker's Squad"
  },
  {
    emoji: "💃",
    id: 42,
    hp: 3,
    dmg: 2,
    rarity: 1,
    names: [
      "Dancer",
      "Dancing Woman",
      "Dance",
      "Salsa",
      "Salsa Dancer",
      "Tango",
      "Tango Dancer",
      "Acorns",
      "Ballet",
      "Performance",
      "Groove"
    ],
    class: 4,
    description: "After attacking, switches places with the friendly Emoji behind it"
  },
  {
    emoji: "🪅",
    id: 43,
    hp: 4,
    dmg: 1,
    rarity: 1,
    names: ["Piñata", "Pinata", "Llama", "Candy", "Birthday", "Birthday Party", "Fiesta", "Candy Burst"],
    class: 2,
    description: "When defeated, heals the new frontmost friendly Emoji by 2 and damages the frontmost enemy Emoji by 2"
  },
  {
    emoji: "🎻",
    id: 44,
    hp: 2,
    dmg: 2,
    rarity: 0,
    names: ["Violin", "Cello", "Acoustic", "Acoustic Guitar", "Strings", "Fiddle", "Music", "Orchestra"],
    class: 7,
    description: "If there is at least one undefeated friendly 🎶, deal 3 more damage"
  },
  {
    emoji: "📻",
    id: 45,
    hp: 3,
    dmg: 2,
    rarity: 1,
    names: [
      "Radio",
      "Fm",
      "Am",
      "Station",
      "Radio Station",
      "Broadcast",
      "Radio Broadcast",
      "Music Box",
      "Tuner",
      "Airwaves"
    ],
    class: 7,
    description: "When defeated, summons 🎶 at the back of your Squad"
  },
  {
    emoji: "🔥",
    id: 46,
    hp: 3,
    dmg: 4,
    rarity: 1,
    names: ["Fire", "Flame", "Flames", "Heat", "Inferno", "Burn", "Blaze"],
    class: 1,
    description: "When this Emoji is defeated, Emoji behind it by 2"
  },
  {
    emoji: "🌋",
    id: 47,
    hp: 4,
    dmg: 2,
    rarity: 3, // Master of Shuffling
    names: [
      "Volcano",
      "Krakatoa",
      "Eruption",
      "Erupt",
      "Lava",
      "Wildfire",
      "Wild Fire",
      "Wildfires",
      "Wild Fires",
      "Mountain",
      "Ash",
      "Volcanic"
    ],
    class: 6,
    description:
      "When your Squad is Shuffled, summon 🔥 at the front of the enemy team with 1 health and 1 attack power"
  },
  {
    emoji: "🎉",
    id: 48,
    hp: 2,
    dmg: 1,
    rarity: 2,
    names: ["Tada", "Party Popper", "Party Horn", "Popper", "Confetti", "Horn", "Celebration", "Festive", "Yay"],
    class: 0,
    description:
      "When an enemy Emoji is defeated and this is at the back of the Squad, heals the Emoji that defeated it for 1"
  },
  {
    emoji: "🥏",
    id: 49,
    hp: 6,
    dmg: 3,
    rarity: 2,
    names: ["Flying Disc", "Disc", "Frisbee", "Disc Golf", "Frisbee Game"],
    class: 1,
    description: "Attacks the Emoji behind this for 1 when attacking"
  },
  {
    emoji: "⏭️",
    id: 50,
    hp: 3,
    dmg: 2,
    rarity: 1,
    names: [
      "Track Next",
      "Next Track",
      "Next Track Button",
      "Next",
      "Skip",
      "Skip Button",
      "Track Skip",
      "Skip Track",
      "Skip Track Button",
      "Forward",
      "Advance",
      "Skip Ahead",
      "Next Song"
    ],
    class: 6,
    description: "When healed, Shuffles your Squad"
  },
  {
    emoji: "🩻",
    id: 51,
    hp: 1,
    dmg: 2,
    rarity: 3, // Master of Healing
    names: ["X Ray", "X-ray", "Xray", "Scan", "Mri", "Radiology", "Medical", "Xray Image"],
    class: 0,
    description: "When a friendly Emoji is defeated, heals all friendly Emojis behind itself by 1"
  },
  {
    emoji: "🌃",
    id: 52,
    hp: 3,
    dmg: 2,
    rarity: 1,
    names: [
      "Night with Stars",
      "Night",
      "Nighttime",
      "Night in City",
      "Stars",
      "Star",
      "Starry",
      "Starry Night",
      "Dark City",
      "Night City",
      "City Night",
      "Evening",
      "Twilight",
      "Night Sky",
      "City Lights"
    ],
    class: 1,
    description: "When this defeats an Emoji, attacks all enemy copies of it for 1"
  },
  {
    emoji: "🐺",
    id: 53,
    hp: 4,
    dmg: 3,
    rarity: 3, // Master of Damaging
    names: ["Wolf", "Predator", "Canine", "Howl", "Pack", "Alpha"],
    class: 1,
    description: "When this defeats an Emoji, heals itself by 1 and increases its attack power by 1"
  },
  {
    emoji: "🫧",
    id: 54,
    hp: 2,
    dmg: 2,
    rarity: 1,
    names: ["Bubbles", "Bubble", "Foam", "Soap", "Bubble Pop", "Clean"],
    class: 2,
    description: "Reduces any damage taken to itself to 1. Cannot be healed"
  },
  {
    emoji: "🍌",
    id: 55,
    hp: 2,
    dmg: 2,
    rarity: 1,
    names: ["Banana", "Banana Peel", "Slippery", "Slip", "Peel"],
    class: 4,
    description: "When defeated, damages the attacker by 2 and moves it to the back of the enemy Squad"
  },
  {
    emoji: "🧲",
    id: 56,
    hp: 2,
    dmg: 2,
    rarity: 1,
    names: ["Magnet", "Attraction", "Sniper", "Snipe", "Pull", "Attract", "Magnetic"],
    class: 4,
    description: "When defeated, damages the furthermost enemy Emoji by 2 and moves it to the front of the enemy Squad"
  },
  {
    emoji: "😷",
    id: 57,
    hp: 2,
    dmg: 1,
    rarity: 3, // Master of Transformation
    names: [
      "Mask",
      "Facemask",
      "Face Mask",
      "Face with Mask",
      "Coronavirus",
      "Covid",
      "Pandemic",
      "Sick",
      "Ill",
      "Mask Up"
    ],
    class: 5,
    description: "When defeated, summons 🦠 at the front of the enemy Squad, and then Shuffles it"
  },
  {
    emoji: "🦠",
    id: 58,
    hp: 2,
    dmg: 1,
    rarity: -1,
    names: [
      "Microbe",
      "Virus",
      "Germ",
      "Bacteria",
      "Disease",
      "Sickness",
      "Illness",
      "Corruption",
      "Blight",
      "Infection",
      "Contagion",
      "Pathogen"
    ],
    description: "Before being Shuffled, transforms the Emoji behind it into 🦠 with identical stats (summoned by 😷)"
  },
  {
    emoji: "🛸",
    id: 59,
    hp: 3,
    dmg: 2,
    rarity: 2,
    names: ["Flying Saucer", "Saucer", "Spaceship", "Ufo", "Aliens", "Alien", "Extraterrestrial"],
    class: 6,
    description: "When defeated, Shuffle the enemy Squad and deal 3 damage to the frontmost enemy Emoji"
  },
  {
    emoji: "🪞",
    id: 60,
    hp: 5,
    dmg: 1,
    rarity: 3, // Master of Defense
    names: [
      "Mirror",
      "Window",
      "Glass",
      "Reflect",
      "Reflection",
      "Reflector",
      "Looking Glass",
      "Mirror Image",
      "Shiny"
    ],
    class: 2,
    description: "Adds the target's attack power to each attack this performs"
  },
  {
    emoji: "🪄",
    id: 61,
    hp: 2,
    dmg: 1,
    rarity: 1,
    names: ["Magic Wand", "Wand", "Magic", "Spell", "Staff", "Enchanter", "Sorcery", "Magic Stick", "Wizard", "Magic"],
    class: 3,
    description:
      "When the first friendly Emoji is defeated this round, revives it at 2 health at the back of the Squad, and defeats itself"
  },
  {
    emoji: "🏙️",
    id: 62,
    hp: 1,
    dmg: 1,
    rarity: 2,
    names: [
      "Cityscape",
      "City",
      "Skyline",
      "Town",
      "Skyscrapers",
      "Skyscraper",
      "Lilys",
      "Metropolis",
      "Urban",
      "City Life"
    ],
    class: 8,
    description: "When a friendly Emoji dies, heals all friendly copies of it by 1"
  },
  {
    emoji: "🔊",
    id: 63,
    hp: 4,
    dmg: 0,
    rarity: 3, // Master of Musical
    names: [
      "Loud Sound",
      "Speaker",
      "Speakers",
      "Audio",
      "Loud",
      "Blast",
      "Amplifier",
      "Amplified",
      "Volume",
      "Loudspeaker",
      "Sound",
      "Noise"
    ],
    class: 7,
    description: "Attacks for as much damage as the number of friendly 🎶 ×2, plus its own attack power"
  },
  {
    emoji: "🍄",
    id: 64,
    hp: 6,
    dmg: 2,
    rarity: 0,
    names: ["Mushroom", "Red Mushroom", "Fungus", "Shroom", "Toadstool", "Fungi", "Mush"],
    class: 1,
    description: "After attacking, damages itself by 1"
  },
  {
    emoji: "👥",
    id: 65,
    hp: 2,
    dmg: 2,
    rarity: 1,
    names: ["Busts in Silhouette", "Busts", "Silhouettes", "Shadows", "Shades", "Group", "Crowd", "People", "Team"],
    class: 5,
    description: "When defeated, transforms into an exact copy of the Emoji that defeated it"
  },
  {
    emoji: "🆕",
    id: 66,
    hp: 3,
    dmg: 1,
    rarity: 2,
    names: ["New", "New Button", "New Indicator", "Fresh", "Recent", "Brand New", "Update"],
    class: 5,
    description:
      "When the friendly Emoji in front of this is defeated, restores that Emoji to original condition and defeats itself"
  },
  {
    emoji: "🔏",
    id: 67,
    hp: 4,
    dmg: 1,
    rarity: 2,
    names: [
      "Lock with Ink Pen",
      "Lock with Pen",
      "Locked with Pen",
      "Lock Pen",
      "Lock with Nib",
      "Ink Lock",
      "Lock Ink",
      "Pen Lock",
      "Lock Pen",
      "Secure",
      "Lockdown",
      "Penlock",
      "Signed"
    ],
    class: 5,
    description: "When attacked, transforms the attacker Emoji into 🔒 with identical stats"
  },
  {
    emoji: "🔒",
    id: 68,
    hp: 1,
    dmg: 1,
    rarity: -1,
    names: ["Lock", "Locked", "Padlock"],
    class: null,
    description: "Nothing Special (secured by 🔏)"
  },
  {
    emoji: "🏺",
    id: 69,
    hp: 1,
    dmg: 1,
    rarity: 1,
    names: ["Amphora", "Vase", "Pot", "Clay Pot", "Urn", "Jar", "Container", "Artifact", "Relic"],
    class: 3,
    description: "When defeated, summons a random *️⃣ Common Emoji"
  },
  {
    emoji: "🛜",
    id: 70,
    hp: 3,
    dmg: 2,
    rarity: 0,
    names: ["Wireless", "Internet", "Network", "Signal", "Wifi", "Wi-fi", "Data", "Connection", "Online"],
    class: 8,
    description: "At the beginning of the Battle, increases its health by the number of friendly 🛜"
  },
  {
    emoji: "⚓",
    id: 71,
    hp: 3,
    dmg: 2,
    rarity: 1,
    names: ["Anchor", "Dock", "Harbor", "Anchor Down"],
    class: 8,
    description: "When your Squad is Shuffled, this and the friendly Emoji in front of it do not get moved"
  },
  {
    emoji: "📌",
    id: 72,
    hp: 3,
    dmg: 2,
    rarity: 1,
    names: ["Pushpin", "Pin", "Thumbtack", "Tack", "Pinpoint"],
    class: 8,
    description: "When your Squad is Shuffled, this and the friendly Emoji behind it do not get moved"
  },
  {
    emoji: "🚧",
    id: 73,
    hp: 4,
    dmg: 1,
    rarity: 2,
    names: [
      "Construction",
      "Barrier",
      "Under Construction",
      "Traffic Barrier",
      "Roadblock",
      "Obstacle",
      "Construction Zone",
      "Detour"
    ],
    class: 8,
    description:
      "When your Squad is Shuffled, this does not get moved. Additionally, Emojis will not move past this during the shuffle"
  },
  {
    emoji: "🔋",
    id: 74,
    hp: 4,
    dmg: 0,
    rarity: 2,
    names: ["Battery", "Full Battery", "Charge", "Power", "Energy", "Charge Up", "Battery Life"],
    class: 1,
    description: "Adds its health value to each attack this performs"
  },
  {
    emoji: "💢",
    id: 75,
    hp: 2,
    dmg: 0,
    rarity: 1,
    names: ["Anger", "Anger Symbol", "Angry", "Backpack", "🎒", "Frustration", "Anger Mark", "Red Mark", "Anime"],
    class: 8,
    description: "The friendly Emoji in front of this attacks for 2 more damage"
  },
  {
    emoji: "🌫️",
    id: 76,
    hp: 1,
    dmg: 0,
    rarity: 1,
    names: ["Fog", "Mist", "Foggy", "Misty", "Cloudy", "Haze", "Obscure", "Smog"],
    class: 0,
    description: "At the beginning of the Battle, heals the friendly Emoji in front of itself by 3 and defeats itself"
  },
  {
    emoji: "🎧",
    id: 77,
    hp: 4,
    dmg: 2,
    rarity: 0,
    names: ["Headphones", "Earbuds", "Listen", "Earphones", "Music Gear"],
    class: 7,
    description: "Friendly Emojis in front of this act as if this was 🎶"
  },
  {
    emoji: "🎷",
    id: 78,
    hp: 3,
    dmg: 2,
    rarity: 1,
    names: ["Saxophone", "Sax", "Jazz", "Sax Player", "Brass"],
    class: 7,
    description:
      "If there is at least one undefeated friendly 🎶, heals the friendly Emoji in front of itself by 1 when it is attacked for more than 1 damage"
  },
  {
    emoji: "🥁",
    id: 79,
    hp: 4,
    dmg: 3,
    rarity: 1,
    names: ["Drum", "Drum with Drumsticks", "Percussion", "Drummer", "Beat", "Rhythm"],
    class: 7,
    description:
      "If there is at least one undefeated friendly 🎶, takes 1 less damage from every attack to a minimum of 1"
  },
  {
    emoji: "📠",
    id: 80,
    hp: 3,
    dmg: 2,
    rarity: 2,
    names: ["Fax", "Fax Machine", "Send", "Transmit", "Faxer", "Document"],
    class: 3,
    description: "When this defeats an Emoji, it summons 📃 at the front of the friendly Squad"
  },
  {
    emoji: "📃",
    id: 81,
    hp: 1,
    dmg: 1,
    rarity: -1,
    names: ["Page with Curl", "Page", "Wall Of Text"],
    class: null,
    description: "Nothing Special (printed by 📠)"
  },
  {
    emoji: "🕊️",
    id: 82,
    hp: 6,
    dmg: 3,
    rarity: 3,
    names: ["Dove", "Bird", "Peace", "Messenger", "White Bird", "Tranquil"],
    class: 4,
    description: "When this defeats an Emoji, summons it at the front of the friendly Squad with 1 health"
  },
  {
    emoji: "😇",
    id: 83,
    hp: 6,
    dmg: 3,
    rarity: 1,
    names: ["Innocent", "Halo", "Holy", "Angel Face", "Smiling Face with Halo", "Saint", "Blessed", "Virtue", "Good"],
    class: 2,
    description: "When this defeats an Emoji, attacks itself for 3"
  },
  {
    emoji: "🏹",
    id: 84,
    hp: 4,
    dmg: 3,
    rarity: 1,
    names: ["Bow and Arrow", "Archery", "Bow", "Crossbow", "Arrow", "Shooter", "Marksman"],
    class: 1,
    description:
      "If the Emoji this attacks has more than 0 attack power, targets the Emoji behind the frontmost enemy Emoji, if possible"
  },
  {
    emoji: "💉",
    id: 85,
    hp: 1,
    dmg: 0,
    rarity: 1,
    names: ["Syringe", "Shot", "Steroids", "Injection", "Vaccine", "Medicine"],
    class: 1,
    description:
      "At the beginning of the Battle, increases the attack power of friendly Emoji in front of itself by 1 and defeats itself"
  },
  {
    emoji: "🦴",
    id: 86,
    hp: 2,
    dmg: 0,
    rarity: 1,
    names: ["Bone", "Fossil", "Skeletal", "Remains", "Fossilized"],
    class: 5,
    description: "When this would be defeated, instead transforms into 🦖"
  },
  {
    emoji: "🦖",
    id: 87,
    hp: 5,
    dmg: 2,
    rarity: -1,
    names: ["T Rex", "Dinosaur", "Dino", "T-Rex", "Trex", "Rex"],
    class: null,
    description: "Nothing Special (evolved from 🦴)"
  },
  {
    emoji: "🔙",
    id: 88,
    hp: 3,
    dmg: 3,
    rarity: 1,
    names: ["Back", "Back Arrow", "Back Sign", "Reverse", "Go Back", "Return", "Backtrack"],
    class: 1,
    description:
      "If the Emoji this attacks has more than 0 attack power, targets the Emoji at the back of the enemy Squad instead of the front"
  },
  {
    emoji: "🎯",
    id: 89,
    hp: 6,
    dmg: 1,
    rarity: 1,
    names: ["Dart", "Direct Hit", "Target", "Bullseye", "Aim", "Target Practice", "Dartboard"],
    class: 2,
    description:
      "All enemy attacks are redirected towards this, regardless of the aggressor's position. Increases any damage taken to itself by 1"
  },
  {
    emoji: "💰",
    id: 90,
    hp: 1,
    dmg: 1,
    rarity: -1,
    names: ["Moneybag", "Money Bag", "Marigold", "Sack", "Cash", "Gold", "Rich", "Loot", "Money"],
    class: null,
    description: "When this survives a Battle without being defeated, give you more money idk"
  },
  {
    emoji: "🚨",
    id: 91,
    hp: 2,
    dmg: 2,
    rarity: 0,
    names: [
      "Rotating Light",
      "Alarm",
      "Police Light",
      "Siren",
      "Alert",
      "Emergency",
      "Warning",
      "Red Light",
      "Rotating"
    ],
    class: 3,
    description: "If this is the only undefeated friendly Emoji, summon 🚓 at the back of the Squad"
  },
  {
    emoji: "🚓",
    id: 92,
    hp: 3,
    dmg: 4,
    rarity: -1,
    names: ["Police Car", "Police", "Cop", "Cops", "Opps"],
    class: null,
    description: "Nothing Special (called in by 🚨)"
  },
  {
    emoji: "🐝",
    id: 93,
    hp: 2,
    dmg: 1,
    rarity: 0,
    names: ["Bee", "Bumblebee"],
    class: 8,
    description: "When attacking on its turn, all friendly 🐝 also attack regardless of position"
  },
  {
    emoji: "🪡",
    id: 94,
    hp: 3,
    dmg: 3,
    rarity: 2,
    names: ["Sewing Needle", "Needle", "Thread", "Sew", "Stitch", "Needlework", "Sewing"],
    class: 1,
    description:
      "When attacking, attacks the first X Emojis in the enemy Squad for 1 damage, where X is its attack power"
  },
  {
    emoji: "👪",
    id: 95,
    hp: 2,
    dmg: 0,
    rarity: 3, // Master of Teamup
    names: ["Family", "Parents", "Children", "Family Group", "Kin"],
    class: 8,
    description:
      "At the beginning of the Battle, increases its health and attack power by the number of friendly Teamup class Emojis"
  },
  {
    emoji: "🪗",
    id: 96,
    hp: 3,
    dmg: 3,
    rarity: 2,
    names: ["Accordion", "Music Instrument", "Polka", "Accordionist"],
    class: 7,
    description: "If there is at least one undefeated friendly 🎶, attacks the 2 frontmost enemy Emojis at once"
  },
  {
    emoji: "🩹",
    id: 97,
    hp: 5,
    dmg: 2,
    rarity: 2,
    names: ["Adhesive Bandage", "Bandaid", "Bandage", "Band-aid", "Patch", "Heal", "Bandage Up", "Aid", "Adhesive"],
    class: 1,
    description: "Enemy Emojis directly in front of this cannot be healed"
  },
  {
    emoji: "🔇",
    id: 98,
    hp: 3,
    dmg: 2,
    rarity: 2,
    names: ["Mute", "Muted Speaker", "Muted", "Sound Off", "Silence", "Mute Button", "No Sound", "Quiet", "Alarm Off"],
    class: 7,
    description: "Enemy Emojis that benefit from 🎶 do not recieve their benefits"
  },
  {
    emoji: "🫨",
    id: 99,
    hp: 4,
    dmg: 2,
    rarity: 1,
    names: ["Shaking Face", "Shaking", "Vibrating Face", "Vibrating", "Shake", "Quake", "Vibrate", "Tremble"],
    class: 6,
    description: "When your Squad is Shuffled, increases its attack power by 1"
  },
  {
    emoji: "🔍",
    id: 100,
    hp: 4,
    dmg: 1,
    rarity: 0,
    names: [
      "Mag",
      "Magnifying Glass",
      "Magnifying Glass Left",
      "Mag Left",
      "Mag 1",
      "🔎",
      "Search",
      "Find",
      "Inspect",
      "Zoom"
    ],
    class: 1,
    description: "If the Emoji this attacks has more than 0 attack power, targets the enemy Emoji with the least health"
  },
  {
    emoji: "🔝",
    id: 101,
    hp: 3,
    dmg: 3,
    rarity: 0,
    names: ["Top", "Top Arrow", "Dartichoke", "Up", "Topmost", "Highest"],
    class: 1,
    description: "If the Emoji this attacks has more than 0 attack power, targets the enemy Emoji with the most health"
  },
  {
    emoji: "🧦",
    id: 102,
    hp: 3,
    dmg: 1,
    rarity: 0,
    names: ["Socks", "Sock", "Thigh Highs", "Programming Socks", "Leg Warmers", "Feet", "Warmers", "Stockings"],
    class: 1,
    description: "When attacking, attacks 2 consecutive times"
  },
  {
    emoji: "💐",
    id: 103,
    hp: 5,
    dmg: 1,
    rarity: 1,
    names: ["Bouquet", "Flowers", "Arrangement", "Blossom"],
    class: 1,
    description: "When a friendly Emoji is defeated, increases its own attack power by 1. Cannot be healed"
  },
  {
    emoji: "⛄",
    id: 104,
    hp: 2,
    dmg: 1,
    rarity: 0,
    names: ["Snowman", "Snowman without Snow", "Frosty", "Snow", "Winter", "Snow Figure"],
    class: 6,
    description: "When your Squad is shuffled, Emojis retain their positions and this defeats itself"
  },
  {
    emoji: "🪨",
    id: 105,
    hp: 6,
    dmg: 1,
    rarity: 0,
    names: ["Rock", "Stone", "Boulder", "Pebble", "Gravel", "Rocky"],
    class: 6,
    description: "rock dont move and rock dont shuffle"
  },
  {
    emoji: "📡",
    id: 106,
    hp: 2,
    dmg: 2,
    rarity: 1,
    names: ["Satellite", "Satellite Dish", "Dish", "Reciever Dish", "Antenna", "Signal Tower", "Broadcast", "Dish"],
    class: 8,
    description: "When the friendly frontmost Emoji is healed, this heals itself by the same amount"
  },
  {
    emoji: "⏮️",
    id: 107,
    hp: 5,
    dmg: 2,
    rarity: 0,
    names: [
      "Track Previous",
      "Previous Track",
      "Previous Track Button",
      "Previous",
      "Track Last",
      "Last Track",
      "Last Track Button",
      "Last",
      "Rewind",
      "Backtrack",
      "Last Song"
    ],
    class: 6,
    description: "When attacked or defeated, Shuffles your Squad"
  },
  {
    emoji: "❤️‍🔥",
    id: 108,
    hp: 3,
    dmg: 2,
    rarity: 1,
    names: [
      "Heart on Fire",
      "Flaming Heart",
      "Fire Heart",
      "Red Heart on Fire",
      "Flaming Heart",
      "Passion",
      "Burning Heart",
      "Love Fire",
      "Fiery Love"
    ],
    class: 1,
    description: "When healed, damages the frontmost enemy Emoji for as much healing it received"
  },
  {
    emoji: "🥊",
    id: 109,
    hp: 5,
    dmg: 2,
    rarity: 0,
    names: ["Boxing Glove", "Boxing", "Punching Glove", "Fight", "Boxer", "Punch", "Glove"],
    class: 1,
    description: "Deals 1 more damage if the frontmost enemy Emoji has more health than it"
  },
  {
    emoji: "🥌",
    id: 110,
    hp: 4,
    dmg: 2,
    rarity: 0,
    names: ["Curling Stone", "Curling", "Curl", "Ice Sport", "Sweeper"],
    class: 4,
    description:
      "When attacked, switches places with the friendly Emoji behind it and the new frontmost friendly Emoji attacks once"
  },
  {
    emoji: "🎁",
    id: 111,
    hp: 7,
    dmg: 1,
    rarity: 3, // Master of Summoning
    names: ["Gift", "Wrapped Gift", "Present", "Package", "Wrapped", "Surprise"],
    class: 3,
    description: "When attacked, summons a random non-Master Emoji in front of itself"
  },
  {
    emoji: "🪇",
    id: 112,
    hp: 4,
    dmg: 2,
    rarity: 1,
    names: ["Maracas", "Maraca", "Shakers", "Shaker"],
    class: 7,
    description: "If there is at least one undefeated friendly 🎶 when attacking, attacks 2 consecutive times"
  },
  {
    emoji: "✂️",
    id: 113,
    hp: 4,
    dmg: 2,
    rarity: 2,
    names: ["Scissors", "Shears", "Scissor", "Pair of Scissors"],
    class: 5,
    description: "When this defeats an Emoji, transforms the enemy Emoji behind it into 🫥 with identical stats"
  },
  {
    emoji: "🫥",
    id: 114,
    hp: 1,
    dmg: 1,
    rarity: -1,
    names: [
      "Dotted Line Face",
      "Cutout Face",
      "Cut out",
      "Dotted Line",
      "Disappearing Face",
      "Disappearing",
      "Invisible",
      "Invisible Face",
      "Dotted"
    ],
    class: null,
    description: "When attacked, defeats itself, and when attacking, deals 1 more damage (cut out by ✂️)"
  },
  {
    emoji: "🚫",
    id: 115,
    hp: 3,
    dmg: 3,
    rarity: 1,
    names: ["No Entry Sign", "Prohibited", "No", "No Entry", "Ban", "Banned", "Delete"],
    class: 5,
    description:
      "When this would defeat an Emoji, instead deletes it (Emojis that benefit from defeated Emojis do not benefit from this)"
  },
  {
    emoji: "💥",
    id: 116,
    hp: 1,
    dmg: 0,
    rarity: 2,
    names: ["Boom", "Collision", "Explosion", "Explode", "Blast", "Detonate", "Kaboom"],
    class: 1,
    description:
      "When attacked or defeated, defeats the two frontmost enemy Emojis and the Emoji behind itself, and defeats itself"
  },
  {
    emoji: "🗿",
    id: 117,
    hp: 3,
    dmg: 1,
    rarity: 2,
    names: ["Moyai", "Moai", "Vine Boom", "Vine", "Easter Island", "Stone Head", "Statue"],
    class: 2,
    description:
      "All enemy attacks are redirected towards this, regardless of the aggressor's position. Takes 1 less damage from every attack, to a minimum of 1"
  },
  {
    emoji: "🛄",
    id: 118,
    hp: 4,
    dmg: 1,
    rarity: 1,
    names: ["Baggage Claim", "Luggage", "Airport", "Security", "Customs", "Baggage", "Suitcase"],
    class: 6,
    description:
      "All enemy attacks are redirected towards this, regardless of the aggressor's position. When defeated, Shuffles the enemy Squad"
  },
  {
    emoji: "🥵",
    id: 119,
    hp: 6,
    dmg: 1,
    rarity: 1,
    names: ["Hot Face", "Hot", "Sweaty", "Sweaty Face", "Heat Stroke"],
    class: 2,
    description:
      "All enemy attacks are redirected towards this, regardless of the aggressor's position. After attacking, damages itself by 1"
  },
  {
    emoji: "🪖",
    id: 120,
    hp: 7,
    dmg: 1,
    rarity: 1,
    names: ["Military Helmet", "Helmet", "Army", "Soldier", "Military"],
    class: 2,
    description:
      "All enemy attacks are redirected towards this, regardless of the aggressor's position. Cannot be healed"
  },
  {
    emoji: "🌳",
    id: 121,
    hp: 4,
    dmg: 1,
    rarity: 2,
    names: ["Deciduous Tree", "Tree", "Apple Tree", "Fruit Tree", "Orchard", "Oak Tree", "Groot", "Deciduous"],
    class: 3,
    description: "When defeated, summons 2 🍎 at the front of the Squad that defeated it"
  },
  {
    emoji: "🍎",
    id: 122,
    hp: 1,
    dmg: 0,
    rarity: -1,
    names: ["Apple", "Red Apple"],
    class: null,
    description: "When defeated, heals the Emoji that defeated it for 1 (dropped by 🌳)"
  },
  {
    emoji: "😴",
    id: 123,
    hp: 5,
    dmg: 2,
    rarity: 2,
    names: ["Sleeping", "Sleep", "Tired", "Nap", "Sleeping Face", "Tired Face"],
    class: 3,
    description: "When this defeats an Emoji, summons 💤 in front of itself"
  },
  {
    emoji: "💤",
    id: 124,
    hp: 1,
    dmg: 0,
    rarity: -1,
    names: ["Zzz", "Sleep"],
    class: null,
    description: "When defeated, heals the Emoji behind itself by 1 (summoned by 😴)"
  },
  {
    emoji: "🧽",
    id: 125,
    hp: 4,
    dmg: 2,
    rarity: 2,
    names: ["Sponge", "Soaker", "Cleaning Sponge", "Absorbent", "Absorb", "Soak"],
    class: 0,
    description: "When recieving a non-fatal attack from a friendly Emoji, instead gets healed by that amount"
  },
  {
    emoji: "🍺",
    id: 126,
    hp: 1,
    dmg: 1,
    rarity: 2,
    names: ["Beer", "Beer Mug", "Stein", "Pint", "Alcohol", "Beverage", "Alcoholic"],
    class: 0,
    description:
      "At the beginning of the Battle, swaps the health and attack power of the friendly Emoji in front of itself and then defeats itself"
  },
  {
    emoji: "🍂",
    id: 127,
    hp: 2,
    dmg: 2,
    rarity: 0,
    names: [
      "Fallen Leaf",
      "Falling Leaf",
      "Leaf",
      "Autumn Leaf",
      "Autumn",
      "Fall",
      "Fall Leaves",
      "Leaves",
      "Falling Leaves",
      "Falling Leaf",
      "Fallen"
    ],
    class: 8,
    description: "When your Squad is shuffled, all friendly 🍂 attack regardless of position"
  },
  {
    emoji: "🎬",
    id: 128,
    hp: 3,
    dmg: 2,
    rarity: 0,
    names: ["Clapper", "Cinema", "Movie", "Action", "Film", "Director", "Clapboard", "Clapperboard", "Clap Board"],
    class: 1,
    description: "At the beginning of the Battle, attacks once regardless of position"
  },
  {
    emoji: "🌅",
    id: 129,
    hp: 1,
    dmg: 1,
    rarity: 2,
    names: ["Sunrise", "Sunrise Over Ocean", "Morning"],
    class: 8,
    description:
      "The Squad with more 🌅 will always have the first turn, or it will be random if both Squads have the same number"
  },
  {
    emoji: "🎭",
    id: 130,
    hp: 4,
    dmg: 1,
    rarity: 1,
    names: ["Performing Arts", "Theater", "Performing", "Masks", "Theater Masks", "Theater Mask", "Comedy", "Tragedy"],
    class: 5,
    description: "After attacking, multiplies the attack power of the target by -1 and adds 1"
  },
  {
    emoji: "💞",
    id: 131,
    hp: 4,
    dmg: 1,
    rarity: 0,
    names: ["Revolving Hearts", "Hearts", "Acorns"],
    class: 0,
    description:
      "When attacked, switches places with the friendly Emoji behind it and heals the new frontmost friendly Emoji by 1"
  },
  {
    emoji: "🦁",
    id: 132,
    hp: 5,
    dmg: 1,
    rarity: 0,
    names: ["Lion"],
    class: 1,
    description: "When attacked, gains attack power identical to the strength of the damage"
  },
  {
    emoji: "🎖️",
    id: 133,
    hp: 4,
    dmg: 3,
    rarity: 1,
    names: ["Military Medal", "Award", "Plaque", "Military Award", "Medal"],
    class: 1,
    description:
      "If the Emoji this attacks has more than 0 attack power, targets the enemy Emoji with the most attack power"
  },
  {
    emoji: "🪈",
    id: 134,
    hp: 5,
    dmg: 3,
    rarity: 2,
    names: ["Flute", "Recorder", "Whistle"],
    class: 7,
    description:
      "If there is at least one undefeated friendly 🎶 when attacking, attacks the first X Emojis in the enemy Squad for 1 damage, where X is its attack power"
  },
  {
    emoji: "🦺",
    id: 135,
    hp: 1,
    dmg: 1,
    rarity: 2,
    names: ["Safety Vest", "Vest", "Safety", "High Visibility Vest", "Hi-Vis Vest", "Construction Vest"],
    class: 2,
    description: "When the Emoji in front of this would be defeated, redirects the attack to itself"
  },
  {
    emoji: "🦜",
    id: 136,
    hp: 3,
    dmg: 1,
    rarity: 2,
    names: ["Parrot", "Bird", "Bird of Paradise", "Toucan", "Tropical Bird", "Macaw", "Cockatoo"],
    class: 5,
    description: "Mimics the frontmost enemy Emoji's ability"
  },
  {
    emoji: "🖨️",
    id: 137,
    hp: 2,
    dmg: 2,
    rarity: 2,
    names: ["Printer", "Copy Machine"],
    class: 3,
    description: "When this defeats an Emoji, summons 📃 at the back of the friendly Squad"
  },
  {
    emoji: "🌬️",
    id: 138,
    hp: 4,
    dmg: 2,
    rarity: 0,
    names: ["Wind Blowing Face", "Blowing Wind", "Windy", "Breeze", "Gust", "Air", "Wind", "Wind Face", "Blowing Face"],
    class: 4,
    description: "After attacking, switches the frontmost enemy Emoji with the enemy Emoji behind it"
  },
  {
    emoji: "🕯️",
    id: 139,
    hp: 6,
    dmg: 4,
    rarity: 1,
    names: ["Candle", "Wick", "Wax"],
    class: 1,
    description: "After every turn, damages itself by 1"
  },
  {
    emoji: "🐻",
    id: 140,
    hp: 7,
    dmg: 1,
    rarity: 0,
    names: ["Bear", "Grizzly", "Brown Bear", "Cub", "Grizzly Bear"],
    class: 2,
    description: "Nothing special"
  },
  {
    emoji: "💩",
    id: 141,
    hp: 2,
    dmg: 2,
    rarity: 0,
    names: ["Poop", "Poo"],
    class: 5,
    description: "When defeated, lowers the attack power of the Emoji that defeated it by 1"
  },
  {
    emoji: "👤",
    id: 142,
    hp: 1,
    dmg: 1,
    rarity: 1,
    names: ["Bust In Silhouette", "Bust", "Silhouette", "Shadow", "Shade", "Mystery", "Unknown", "Solo"],
    class: 5,
    description:
      "At the beginning of the Battle, transforms into an exact copy of the Emoji in the enemy Squad in the same position"
  },
  {
    emoji: "🫂",
    id: 143,
    hp: 2,
    dmg: 2,
    rarity: 2,
    names: ["People Hugging", "Hug", "Hug in Silhouette", "Hugs"],
    class: 8,
    description: "When your Squad is Shuffled, this and the two friendly Emojis in front of it do not get moved"
  },
  {
    emoji: "🖇️",
    id: 144,
    hp: 3,
    dmg: 2,
    rarity: 2,
    names: ["Paperclips", "Linked Paperclips", "Paperclip", "Linked Paperclip", "Clipped", "Connected"],
    class: 8,
    description: "When your Squad is Shuffled, this and the friendly Emojis in front of and behind it do not get moved"
  },
  {
    emoji: "🗜️",
    id: 145,
    hp: 3,
    dmg: 2,
    rarity: 2,
    names: ["Compression", "Clamp", "Compress", "Press", "Vice"],
    class: 8,
    description: "When your Squad is Shuffled, this and the two friendly Emojis behind it do not get moved"
  },
  {
    emoji: "❤️‍🩹",
    id: 146,
    hp: 4,
    dmg: 2,
    rarity: 1,
    names: ["Mending Heart", "Healing Heart", "Heart with Bandage", "Bandaged Heart", "Heart Bandage"],
    class: 1,
    description: "Instead of healing, increases its attack power by the amount it would have healed"
  },
  {
    emoji: "🪁",
    id: 147,
    hp: 5,
    dmg: 1,
    rarity: 1,
    names: ["Kite", "Flying Kite"],
    class: 0,
    description: "When a friendly Emoji moves, heals it by 1 and damages itself by 1"
  },
  {
    emoji: "⛲",
    id: 148,
    hp: 3,
    dmg: 1,
    rarity: 1,
    names: ["Fountain", "Water Fountain"],
    class: 0,
    description: "When a friendly Emoji moves past this, heals it by 1"
  },
  {
    emoji: "🍠",
    id: 149,
    hp: 4,
    dmg: 1,
    rarity: 0,
    names: ["Sweet Potato", "Yam", "Baked Sweet Potato", "Roasted Sweet Potato"],
    class: 4,
    description: "When attacked, moves the furthermost enemy Emoji to the front of the enemy squad"
  },
  {
    emoji: "🧄",
    id: 150,
    hp: 4,
    dmg: 1,
    rarity: 0,
    names: ["Garlic"],
    class: 4,
    description: "When attacked, moves the frontmost enemy Emoji to the back of the enemy squad"
  },
  {
    emoji: "🚒",
    id: 151,
    hp: 5,
    dmg: 3,
    rarity: 1,
    names: ["Fire Engine", "Fire Truck", "Firefighter", "Firemen", "Firetruck"],
    class: 7,
    description: "When your Squad is Shuffled, always ends at the front"
  },
  {
    emoji: "🔱",
    id: 152,
    hp: 5,
    dmg: 3,
    rarity: 2,
    names: ["Trident"],
    class: 1,
    description: "When attacking, attacks X consecutive times for 1 damage where X is its attack power"
  },
  {
    emoji: "🪐",
    id: 153,
    hp: 4,
    dmg: 3,
    rarity: 2,
    names: ["Ringed Planet", "Planet", "Planet with Rings", "Saturn"],
    class: 5,
    description:
      "Every other turn, the friendly Emoji in front of this swaps places with the friendly Emoji behind this"
  },
  {
    emoji: "🍪",
    id: 154,
    hp: 6,
    dmg: 1,
    rarity: 0,
    names: ["Cookie", "Chocolate-Chip Cookie"],
    class: 0,
    description: "When attacked or defeated, heals the Emoji behind itself by 1"
  },
  {
    emoji: "🚲",
    id: 155,
    hp: 2,
    dmg: 2,
    rarity: 1,
    names: ["Bicycle", "Bike"],
    class: 4,
    description: "When this moves, attacks the frontmost enemy Emoji regardless of position"
  },
  {
    emoji: "🎲",
    id: 156,
    hp: 2,
    dmg: 2,
    rarity: 1,
    names: ["Game Die", "Die", "Game Dice", "Dice"],
    class: 6,
    description: "After attacking, shuffles the target squad"
  },
  {
    emoji: "🧁",
    id: 157,
    hp: 5,
    dmg: 2,
    rarity: 0,
    names: ["Cupcake", "Muffin"],
    class: 0,
    description: "After attacking, heals the Emoji behind itself by 1"
  },
  {
    emoji: "🫐",
    id: 158,
    hp: 1,
    dmg: 1,
    rarity: 0,
    names: ["Blueberries", "Blueberry"],
    class: 3,
    description: "At the beginning of the Battle, summons 🫐🫐 at the front of the friendly Squad"
  },
  {
    emoji: "🪶",
    id: 159,
    hp: 1,
    dmg: 0,
    rarity: 0,
    names: ["Feather", "Quill"],
    class: 5,
    description: "When your Squad is shuffled, transforms into 🦉"
  },
  {
    emoji: "🦉",
    id: 160,
    hp: 5,
    dmg: 3,
    rarity: -1,
    names: ["Owl"],
    class: null,
    description: "When a friendly Emoji is attacked, moves to the front of the Squad (transformed from 🪶)"
  },
  {
    emoji: "🦅",
    id: 161,
    hp: 7,
    dmg: 3,
    rarity: 1,
    names: ["Eagle"],
    class: 4,
    description: "When a friendly Emoji is attacked, moves to the front of the Squad"
  },
  {
    emoji: "💔",
    id: 162,
    hp: 6,
    dmg: 4,
    rarity: 1,
    names: ["Broken Heart", "Heartbreak", "Shattered Heart", "Heart Break", "Broken", "Break"],
    class: 0,
    description: "When an enemy Emoji is defeated, heals the new frontmost enemy Emoji by 1"
  },
  {
    emoji: "🪜",
    id: 163,
    hp: 3,
    dmg: 2,
    rarity: 1,
    names: ["Ladder", "Stairs", "Step Ladder", "Steps"],
    class: 4,
    description: "When an enemy Emoji is defeated, moves the friendly Emoji in front of this to the front of the Squad"
  },
  {
    emoji: "⌛",
    id: 164,
    hp: 4,
    dmg: 2,
    rarity: -1,
    names: ["Hourglass", "Hourglass Not Done", "Time", "Timer"],
    class: null,
    description: "Increases the number of turns until the battle draws by 200"
  },
  {
    emoji: "⏪",
    id: 165,
    hp: 4,
    dmg: 1,
    rarity: 2,
    names: ["Rewind", "Rewind Button"],
    class: 2,
    description: "When this defeats an Emoji, sets itself back to its default stats. Sets the emoji that defeats it back to its default stats"
  }
];

module.exports = {
  healthemojis,
  dmgemojis,
  devotionhelp,
  classes,
  emojis,
  raritysymbols,
  raritynames,
  quantityemojis
};
