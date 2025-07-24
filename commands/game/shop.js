const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const { emojis, classes } = require("../../data.js");
const {
  database,
  coinschange,
  trysetupuser,
  getlogs,
  writelogs,
  dailyrewardremind,
} = require("../../functions.js");

const dailyPack_prices = {
  base: 0,
  variance: 6, // (times variance_increment) how much in each direction the price can randomly vary
  variance_increment: 5,
  common: 80,
  rare: 180,
  special: 475,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("shop")
    .setDescription(
      "Visit the Emoji Shop, where you can buy emojis with your Coins"
    ),
  async execute(interaction) {
    if (await trysetupuser(interaction.user)) {
      await interaction.reply({
        flags: "Ephemeral",
        content: `Greetings, <@${interaction.user.id}>! Check your DMs before you continue.`,
      });
    } else {
      const coincount = parseInt(
        (await database.get(interaction.user.id + "coins")) ?? "100"
      );

      let shoprestock = (await database.get("shoprestock")) ?? "0";

      if (parseInt(shoprestock) < Date.now() / 1000) {
        let now = new Date();
        let startOfDay = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );
        let noonToday = startOfDay.getTime() / 1000 + 43200;
        let timestamp = startOfDay / 1000 + 43200;
        if (Date.now() / 1000 < noonToday) {
          // If it's before 12:00 PM, set timestamp to 12:00 PM today
          timestamp = noonToday;
        } else {
          // If it's after 12:00 PM, set timestamp to 12:00 PM tomorrow
          timestamp = noonToday + 24 * 60 * 60; // Add 24 hours to noonToday
        }
        await database.set("shoprestock", timestamp);
        shoprestock = timestamp;

        let emojilist = [
          emojis.filter((e) => e.rarity == 0),
          emojis.filter((e) => e.rarity == 1),
          emojis.filter((e) => e.rarity == 2),
        ];
        const newstring =
          emojilist[0][Math.floor(Math.random() * emojilist[0].length)].id +
          "," +
          emojilist[1][Math.floor(Math.random() * emojilist[1].length)].id +
          "," +
          emojilist[2][Math.floor(Math.random() * emojilist[2].length)].id +
          ",";
        await database.set("shopoffers", newstring);

        let dailyPack_class = Math.floor(Math.random() * classes.length);
        let dailyPack_isRare = Math.random() <= 0.35; // 35% for rare
        let dailyPack_isBig = Math.random() <= 0.35; // 35% for big
        let dailyPack_hasSpecial = Math.random() <= 0.25; // 25% to have special
        let dailyPack_price =
          dailyPack_prices.base +
          (dailyPack_hasSpecial ? dailyPack_prices.special : 0);
        dailyPack_price +=
          Math.round((Math.random() * 2 - 1) * dailyPack_prices.variance) *
          dailyPack_prices.variance_increment; // price variance
        if (dailyPack_isRare) {
          dailyPack_price += dailyPack_prices.rare * (dailyPack_isBig ? 3 : 2);
        } else {
          dailyPack_price +=
            dailyPack_prices.common * (dailyPack_isBig ? 4 : 3);
        }
        const packstring =
          dailyPack_class +
          "," +
          dailyPack_isRare +
          "," +
          dailyPack_isBig +
          "," +
          dailyPack_hasSpecial +
          "," +
          dailyPack_price +
          ",";

        await database.set("dailypack", packstring);
      }

      let shopoffers = (await database.get("shopoffers")) ?? "7,7,7,";
      let dailyemojis = shopoffers.split(",");
      dailyemojis.pop();
      dailyemojis[0] = parseInt(dailyemojis[0]);
      dailyemojis[1] = parseInt(dailyemojis[1]);
      dailyemojis[2] = parseInt(dailyemojis[2]);

      let dailypack =
        (await database.get("dailypack")) ?? "0,false,false,false,9999,";
      let dailyPack_info = dailypack.split(",");
      dailyPack_info.pop();
      let dailyPack_class = parseInt(dailyPack_info[0]);
      let dailyPack_isRare = dailyPack_info[1] == "true";
      let dailyPack_isBig = dailyPack_info[2] == "true";
      let dailyPack_hasSpecial = dailyPack_info[3] == "true";
      let dailyPack_price = parseInt(dailyPack_info[4]);

      let dailyPack_name = `${dailyPack_isRare ? "Rare" : "Mixed"} ${
        dailyPack_isBig ? "Deluxe " : ""
      }${classes[dailyPack_class].name} Pack`;
      let dailyPack_description = `Contains:\n>>> ${classes[dailyPack_class].emoji}: `;
      if (dailyPack_isRare) {
        if (dailyPack_isBig) {
          dailyPack_description += `✳️ ✳️ ✳️ Rare ${classes[dailyPack_class].name} x3`;
        } else {
          dailyPack_description += `✳️ ✳️ Rare ${classes[dailyPack_class].name} x2`;
        }
      } else {
        if (dailyPack_isBig) {
          dailyPack_description += `:asterisk: :asterisk: Common ${classes[dailyPack_class].name} x2\n<:randomclass:1396899395970269184>: :asterisk: :asterisk: Random Common x2`;
        } else {
          dailyPack_description += `:asterisk: :asterisk: Common ${classes[dailyPack_class].name} x2\n<:randomclass:1396899395970269184>: :asterisk: Random Common x1`;
        }
      }
      if (dailyPack_hasSpecial) {
        dailyPack_description += `\n ${classes[dailyPack_class].emoji}: ⚛️ Special ${classes[dailyPack_class].name} x1`;
      }

      const quotes = [
        "Need some emojis? This is the place!",
        "You have the coins, I have the emojis!",
        "A new caravan of emojis just joined my crew! Looking to trade?",
        "Herding these guys is hard work, but it sure is profitable!",
        "Say hi to Lennon for me!",
        `I've got extra ${classes[dailyPack_class].name} emojis in the Daily Pack!`,
      ];

      const quote = quotes[Math.floor(Math.random() * quotes.length)];

      let marketcontents;

      marketcontents = `\n${emojis[dailyemojis[0]].emoji} **${
        emojis[dailyemojis[0]].names[0]
      }** (100 🪙)
${emojis[dailyemojis[1]].emoji} **${emojis[dailyemojis[1]].names[0]}** (200 🪙)
${emojis[dailyemojis[2]].emoji} **${emojis[dailyemojis[2]].names[0]}** (600 🪙)

🎁${
        classes[dailyPack_class].emoji
      } **${dailyPack_name}** (${dailyPack_price} 🪙)

:asterisk: **Random Common Emoji** (75 🪙)
✳️ **Random Rare Emoji** (150 🪙)
⚛️ **Random Special Emoji** (450 🪙)

🎁:asterisk: **Common Emoji Pack** (300 🪙)
🎁✳️ **Rare Emoji Pack** (1000 🪙)\n‎`;

      let shopdata;

      shopdata = [
        {
          label: emojis[dailyemojis[0]].names[0],
          emoji: emojis[dailyemojis[0]].emoji,
          type: "premoji",
          id: dailyemojis[0],
          cost: 100,
          description: emojis[dailyemojis[0]].description,
        },
        {
          label: emojis[dailyemojis[1]].names[0],
          emoji: emojis[dailyemojis[1]].emoji,
          type: "premoji",
          id: dailyemojis[1],
          cost: 200,
          description: emojis[dailyemojis[1]].description,
        },
        {
          label: emojis[dailyemojis[2]].names[0],
          emoji: emojis[dailyemojis[2]].emoji,
          type: "premoji",
          id: dailyemojis[2],
          cost: 600,
          description: emojis[dailyemojis[2]].description,
        },
        {
          label: dailyPack_name,
          emoji: `🎁📆`,
          type: "dailypack",
          id: 0,
          cost: dailyPack_price,
          description: dailyPack_description,
        },
        {
          label: `Random Common Emoji`,
          emoji: `:asterisk:`,
          type: "emoji",
          id: 0,
          cost: 75,
          description:
            "One random common emoji, ready to add to your Squad and use!",
        },
        {
          label: `Random Rare Emoji`,
          emoji: `✳️`,
          type: "emoji",
          id: 1,
          cost: 150,
          description:
            "One random rare emoji, ready to add to your Squad and use!",
        },
        {
          label: `Random Special Emoji`,
          emoji: `⚛️`,
          type: "emoji",
          id: 2,
          cost: 450,
          description:
            "One random special emoji, ready to add to your Squad and use!",
        },
        {
          label: `Common Emoji Pack`,
          emoji: `🎁:asterisk:`,
          type: "pack",
          id: 0,
          cost: 300,
          description:
            "‼️ **20% DISCOUNT!** Contains:\n>>> :asterisk: :asterisk: :asterisk: Common Emoji x3\n✳️ Rare Emoji x1",
        },
        {
          label: `Rare Emoji Pack`,
          emoji: `🎁✳️`,
          type: "pack",
          id: 1,
          cost: 1000,
          description:
            "‼️ **22% DISCOUNT!** Contains:\n>>> :asterisk: :asterisk: :asterisk: :asterisk: :asterisk: Common Emoji x5\n✳️ ✳️ ✳️ Rare Emoji x3\n⚛️ Special Emoji x1",
        },
        //{label:`Special Emoji Pack`,emoji:`🎁⚛️`,type:'pack',id:2,cost:2500,description:"Contains:\n>>> :asterisk: :asterisk: :asterisk: :asterisk: :asterisk: :asterisk: :asterisk: :asterisk: :asterisk: :asterisk: Common Emoji x10\n✳️ ✳️ ✳️ ✳️ ✳️ Rare Emoji x5\n⚛️ ⚛️ ⚛️ Special Emoji x3"},
      ];

      const packcontents = [
        [0, 0, 0, 1],
        [0, 0, 0, 0, 0, 1, 1, 1, 2] /*, [0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,2,2,2]*/,
      ];

      let options = shopdata.map((item, index) => {
        return {
          label:
            "(" +
            shopdata[index].cost +
            " 🪙) " +
            shopdata[index].emoji.replace(/:asterisk:/g, " *️⃣ ") +
            " " +
            shopdata[index].label,
          value: String(index),
          description: "[" + String(index + 1) + "]",
        };
      });

      let shop = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("myDropdown")
          .setPlaceholder("Select an item")
          .setOptions(
            options.map(({ label, description, value }) =>
              new StringSelectMenuOptionBuilder()
                .setLabel(label)
                .setDescription(description)
                .setValue(value)
            )
          )
      );

      const shopembed = new EmbedBuilder()
        .setColor(0x4e5058)
        .setTitle(`The Shop`)
        .setDescription(
          `💁 *${quote}*\n-# Emojis reroll <t:${shoprestock}:R>\n${marketcontents}\n`
        )
        .setTimestamp()
        .setFooter({ text: `You have ${coincount} 🪙` });

      const message = await interaction.reply({
        embeds: [shopembed],
        components: [shop],
      });
      await dailyrewardremind(interaction);
      let logs = await getlogs();
      logs.logs.games.shopsviewed += 1;
      logs.logs.players[`user${interaction.user.id}`] =
        logs.logs.players[`user${interaction.user.id}`] ?? {};
      logs.logs.players[`user${interaction.user.id}`].shopsviewed =
        logs.logs.players[`user${interaction.user.id}`].shopsviewed ?? 0;
      logs.logs.players[`user${interaction.user.id}`].shopsviewed += 1;
      await writelogs(logs);

      const collectorFilter = (i) => {
        return interaction.user.id == i.user.id && i.isStringSelectMenu();
      };

      let dropdownCollector = message.createMessageComponentCollector({
        filter: collectorFilter,
        time: 60000,
      });

      const oldinteraction = interaction;

      let choice;

      try {
        dropdownCollector.on("collect", async (interaction) => {
          const $ = parseInt(
            (await database.get(interaction.user.id + "coins")) ?? "100"
          );
          choice = parseInt(interaction.values[0]);

          const shopembed = new EmbedBuilder()
            .setColor(0x4e5058)
            .setTitle(`${shopdata[choice].emoji} ${shopdata[choice].label}`)
            .setDescription(
              `**Costs ${shopdata[choice].cost}** 🪙 (you have ${$} 🪙)\n${shopdata[choice].description}`
            )
            .setTimestamp();

          const buy = new ButtonBuilder()
            .setCustomId("buy")
            .setLabel("Buy One")
            .setStyle(ButtonStyle.Primary)
            .setEmoji("🛒");
          const buymore = new ButtonBuilder()
            .setCustomId("buymore")
            .setLabel("Buy More")
            .setStyle(ButtonStyle.Secondary)
            .setEmoji("🛒");
          if ($ < shopdata[choice].cost) {
            buy.setDisabled(true);
            buy.setLabel("Not enough to buy");
            buy.setEmoji("💸");
            buy.setStyle(ButtonStyle.Secondary);
            buymore.setDisabled(true);
            buymore.setLabel("Not enough to buy more");
            buymore.setEmoji("💸");
          } else if ($ < shopdata[choice].cost * 2) {
            buymore.setDisabled(true);
            buymore.setLabel("Not enough to buy more");
            buymore.setEmoji("💸");
          }

          const bothrow = new ActionRowBuilder().addComponents(buy, buymore);
          const buyrow = new ActionRowBuilder().addComponents(buy);

          interaction.update({ embeds: [shopembed], components: [bothrow] });

          const ButtonFilter = (i) => {
            return interaction.user.id == i.user.id && i.isButton();
          };

          let buttonCollector = message.createMessageComponentCollector({
            filter: ButtonFilter,
            time: 60000,
          });

          try {
            buttonCollector.on("collect", async (newinteraction) => {
              const $ = parseInt(
                (await database.get(interaction.user.id + "coins")) ?? "100"
              );
              if ($ < shopdata[choice].cost) {
                newinteraction.reply({
                  content:
                    "Oops, you don't have enough 🪙 to buy this anymore!",
                  flags: "Ephemeral",
                });
              } else {
                let emojisbought = [[], [], []];
                if (newinteraction.customId == "buymore") {
                  const modal = new ModalBuilder()
                    .setCustomId("buyModal")
                    .setTitle(`Buy more!`);
                  const buymoreinput = new TextInputBuilder()
                    .setCustomId("buymoreinput")
                    .setLabel("How many do you want to buy?")
                    .setPlaceholder(
                      `1 - ${Math.floor($ / shopdata[choice].cost)}`
                    )
                    .setStyle(TextInputStyle.Short);
                  const actionRow = new ActionRowBuilder().addComponents(
                    buymoreinput
                  );
                  modal.addComponents(actionRow);
                  await newinteraction.showModal(modal);
                  newinteraction
                    .awaitModalSubmit({ time: 60000 })
                    .then(async (newerinteraction) => {
                      let modalquantity = Math.min(
                        parseInt(
                          newerinteraction.fields
                            .getTextInputValue("buymoreinput")
                            .toLowerCase()
                        ),
                        Math.floor($ / shopdata[choice].cost)
                      );
                      if (isNaN(modalquantity) || modalquantity < 1) {
                        modalquantity = 1;
                      }
                      if (shopdata[choice].type == "emoji") {
                        await coinschange(
                          interaction.user.id,
                          -1 * modalquantity * shopdata[choice].cost
                        );
                        buy.setDisabled(true);
                        buy.setLabel(`You bought ${modalquantity}`);
                        buy.setStyle(1);
                        const emojilist = emojis.filter(
                          (e) => e.rarity == shopdata[choice].id
                        );
                        let allemojistoadd = "";
                        for (let i = 0; i < modalquantity; i++) {
                          const emojitoadd =
                            emojilist[
                              Math.floor(Math.random() * emojilist.length)
                            ];
                          allemojistoadd += emojitoadd.id + ",";
                          emojisbought[shopdata[choice].id].push(emojitoadd);
                        }
                        let tempvault = await database.get(
                          interaction.user.id + "vault"
                        );
                        await database.set(
                          interaction.user.id + "vault",
                          tempvault + allemojistoadd
                        );
                        let logs = await getlogs();
                        logs.logs.games.randomemojisbought += 1;
                        logs.logs.players[`user${interaction.user.id}`] =
                          logs.logs.players[`user${interaction.user.id}`] ?? {};
                        logs.logs.players[
                          `user${interaction.user.id}`
                        ].randomemojisbought =
                          logs.logs.players[`user${interaction.user.id}`]
                            .randomemojisbought ?? 0;
                        logs.logs.players[
                          `user${interaction.user.id}`
                        ].randomemojisbought += modalquantity;
                        await writelogs(logs);
                      } else if (shopdata[choice].type == "pack") {
                        await coinschange(
                          interaction.user.id,
                          -1 * modalquantity * shopdata[choice].cost
                        );
                        buy.setDisabled(true);
                        buy.setLabel(`You bought ${modalquantity}`);
                        buy.setStyle(1);
                        let emojistoadd = "";
                        for (let i = 0; i < modalquantity; i++) {
                          for (const a of packcontents[shopdata[choice].id]) {
                            const emojilist = emojis.filter(
                              (e) => e.rarity == a
                            );
                            let thisemoji =
                              emojilist[
                                Math.floor(Math.random() * emojilist.length)
                              ];
                            emojistoadd += thisemoji.id + ",";
                            emojisbought[a].push(thisemoji);
                          }
                        }
                        let tempvault = await database.get(
                          interaction.user.id + "vault"
                        );
                        await database.set(
                          interaction.user.id + "vault",
                          tempvault + emojistoadd
                        );
                        let logs = await getlogs();
                        logs.logs.games.packsbought += 1;
                        logs.logs.players[`user${interaction.user.id}`] =
                          logs.logs.players[`user${interaction.user.id}`] ?? {};
                        logs.logs.players[
                          `user${interaction.user.id}`
                        ].packsbought =
                          logs.logs.players[`user${interaction.user.id}`]
                            .packsbought ?? 0;
                        logs.logs.players[
                          `user${interaction.user.id}`
                        ].packsbought += modalquantity;
                        await writelogs(logs);
                      } else if (shopdata[choice].type == "premoji") {
                        await coinschange(
                          interaction.user.id,
                          -1 * modalquantity * shopdata[choice].cost
                        );
                        buy.setDisabled(true);
                        buy.setLabel(`You bought ${modalquantity}`);
                        buy.setStyle(1);
                        let allemojistoadd = "";
                        for (let i = 0; i < modalquantity; i++) {
                          allemojistoadd += shopdata[choice].id + ",";
                          emojisbought[shopdata[choice].id].push(
                            shopdata[choice]
                          );
                        }
                        let tempvault = await database.get(
                          interaction.user.id + "vault"
                        );
                        await database.set(
                          interaction.user.id + "vault",
                          tempvault + allemojistoadd
                        );
                        let logs = await getlogs();
                        logs.logs.games.prepickedemojisbought += 1;
                        logs.logs.players[`user${interaction.user.id}`] =
                          logs.logs.players[`user${interaction.user.id}`] ?? {};
                        logs.logs.players[
                          `user${interaction.user.id}`
                        ].prepickedemojisbought =
                          logs.logs.players[`user${interaction.user.id}`]
                            .prepickedemojisbought ?? 0;
                        logs.logs.players[
                          `user${interaction.user.id}`
                        ].prepickedemojisbought += modalquantity;
                        await writelogs(logs);
                      } else if (shopdata[choice].type == "dailypack") {
                        await coinschange(
                          interaction.user.id,
                          -1 * modalquantity * dailyPack_price
                        );
                        buy.setDisabled(true);
                        buy.setLabel(`You bought this`);
                        buy.setStyle(1);
                        let emojistoadd = "";

                        for (let i = 0; i < modalquantity; i++) {
                          if (dailyPack_isRare) {
                            if (dailyPack_isBig) {
                              for (let i = 0; i < 3; i++) {
                                const emojilist = emojis.filter(
                                  (e) =>
                                    e.rarity == 1 && e.class == dailyPack_class
                                );
                                let thisemoji =
                                  emojilist[
                                    Math.floor(Math.random() * emojilist.length)
                                  ];
                                emojistoadd += thisemoji.id + ",";
                                emojisbought[1].push(thisemoji);
                              }
                            } else {
                              for (let i = 0; i < 2; i++) {
                                const emojilist = emojis.filter(
                                  (e) =>
                                    e.rarity == 1 && e.class == dailyPack_class
                                );
                                let thisemoji =
                                  emojilist[
                                    Math.floor(Math.random() * emojilist.length)
                                  ];
                                emojistoadd += thisemoji.id + ",";
                                emojisbought[1].push(thisemoji);
                              }
                            }
                          } else {
                            if (dailyPack_isBig) {
                              for (let i = 0; i < 2; i++) {
                                const emojilist = emojis.filter(
                                  (e) =>
                                    e.rarity == 0 && e.class == dailyPack_class
                                );
                                let thisemoji =
                                  emojilist[
                                    Math.floor(Math.random() * emojilist.length)
                                  ];
                                emojistoadd += thisemoji.id + ",";
                                emojisbought[0].push(thisemoji);
                              }
                              for (let i = 0; i < 2; i++) {
                                const emojilist = emojis.filter(
                                  (e) => e.rarity == 0
                                );
                                let thisemoji =
                                  emojilist[
                                    Math.floor(Math.random() * emojilist.length)
                                  ];
                                emojistoadd += thisemoji.id + ",";
                                emojisbought[0].push(thisemoji);
                              }
                            } else {
                              for (let i = 0; i < 2; i++) {
                                const emojilist = emojis.filter(
                                  (e) =>
                                    e.rarity == 0 && e.class == dailyPack_class
                                );
                                let thisemoji =
                                  emojilist[
                                    Math.floor(Math.random() * emojilist.length)
                                  ];
                                emojistoadd += thisemoji.id + ",";
                                emojisbought[0].push(thisemoji);
                              }
                              // for (let i = 0; i < 1; i++) {
                              const emojilist = emojis.filter(
                                (e) => e.rarity == 0
                              );
                              let thisemoji =
                                emojilist[
                                  Math.floor(Math.random() * emojilist.length)
                                ];
                              emojistoadd += thisemoji.id + ",";
                              emojisbought[0].push(thisemoji);
                              // }
                            }
                          }
                          if (dailyPack_hasSpecial) {
                            const emojilist = emojis.filter(
                              (e) => e.rarity == 2 && e.class == dailyPack_class
                            );
                            let thisemoji =
                              emojilist[
                                Math.floor(Math.random() * emojilist.length)
                              ];
                            emojistoadd += thisemoji.id + ",";
                            emojisbought[2].push(thisemoji);
                          }
                        }

                        let tempvault = await database.get(
                          interaction.user.id + "vault"
                        );
                        await database.set(
                          interaction.user.id + "vault",
                          tempvault + emojistoadd
                        );

                        let logs = await getlogs();
                        logs.logs.games.packsbought += 1;
                        logs.logs.players[`user${interaction.user.id}`] =
                          logs.logs.players[`user${interaction.user.id}`] ?? {};
                        logs.logs.players[
                          `user${interaction.user.id}`
                        ].packsbought =
                          logs.logs.players[`user${interaction.user.id}`]
                            .packsbought ?? 0;
                        logs.logs.players[
                          `user${interaction.user.id}`
                        ].packsbought += modalquantity;
                        await writelogs(logs);
                      }

                      let emojiString = "";
                      if (emojisbought[0][0]) {
                        for (const e of emojisbought[0]) {
                          emojiString += e.emoji + " ";
                        }
                        emojiString += "\n";
                      }
                      if (emojisbought[1][0]) {
                        for (const e of emojisbought[1]) {
                          emojiString += e.emoji + " ";
                        }
                        emojiString += "\n";
                      }
                      if (emojisbought[2][0]) {
                        for (const e of emojisbought[2]) {
                          emojiString += e.emoji + " ";
                        }
                      }
                      newerinteraction.reply({
                        content: `<@${interaction.user.id}> bought:\n>>> ${emojiString}`,
                      });
                      interaction.editReply({ components: [buyrow] });
                    });
                } else if (shopdata[choice].type == "emoji") {
                  // BUY ONE ################################
                  await coinschange(
                    interaction.user.id,
                    -1 * shopdata[choice].cost
                  );
                  buy.setDisabled(true);
                  buy.setLabel(`You bought this`);
                  buy.setStyle(1);
                  const emojilist = emojis.filter(
                    (e) => e.rarity == shopdata[choice].id
                  );
                  const emojitoadd =
                    emojilist[Math.floor(Math.random() * emojilist.length)];
                  emojisbought[shopdata[choice].id].push(emojitoadd);

                  let tempvault = await database.get(
                    interaction.user.id + "vault"
                  );
                  await database.set(
                    interaction.user.id + "vault",
                    tempvault + emojitoadd.id + ","
                  );
                  let logs = await getlogs();
                  logs.logs.games.randomemojisbought += 1;
                  logs.logs.players[`user${interaction.user.id}`] =
                    logs.logs.players[`user${interaction.user.id}`] ?? {};
                  logs.logs.players[
                    `user${interaction.user.id}`
                  ].randomemojisbought =
                    logs.logs.players[`user${interaction.user.id}`]
                      .randomemojisbought ?? 0;
                  logs.logs.players[
                    `user${interaction.user.id}`
                  ].randomemojisbought += 1;
                  await writelogs(logs);
                } else if (shopdata[choice].type == "pack") {
                  await coinschange(
                    interaction.user.id,
                    -1 * shopdata[choice].cost
                  );
                  buy.setDisabled(true);
                  buy.setLabel(`You bought this`);
                  buy.setStyle(1);
                  let emojistoadd = "";
                  for (const a of packcontents[shopdata[choice].id]) {
                    const emojilist = emojis.filter((e) => e.rarity == a);
                    let thisemoji =
                      emojilist[Math.floor(Math.random() * emojilist.length)];
                    emojistoadd += thisemoji.id + ",";
                    emojisbought[a].push(thisemoji);
                  }
                  let tempvault = await database.get(
                    interaction.user.id + "vault"
                  );
                  await database.set(
                    interaction.user.id + "vault",
                    tempvault + emojistoadd
                  );
                  let logs = await getlogs();
                  logs.logs.games.packsbought += 1;
                  logs.logs.players[`user${interaction.user.id}`] =
                    logs.logs.players[`user${interaction.user.id}`] ?? {};
                  logs.logs.players[`user${interaction.user.id}`].packsbought =
                    logs.logs.players[`user${interaction.user.id}`]
                      .packsbought ?? 0;
                  logs.logs.players[
                    `user${interaction.user.id}`
                  ].packsbought += 1;
                  await writelogs(logs);
                } else if (shopdata[choice].type == "premoji") {
                  await coinschange(
                    interaction.user.id,
                    -1 * shopdata[choice].cost
                  );
                  buy.setDisabled(true);
                  buy.setLabel(`You bought this`);
                  buy.setStyle(1);
                  let allemojistoadd = shopdata[choice].id + ",";
                  let tempvault = await database.get(
                    interaction.user.id + "vault"
                  );
                  emojisbought[choice].push(shopdata[choice]);
                  await database.set(
                    interaction.user.id + "vault",
                    tempvault + allemojistoadd
                  );
                  let logs = await getlogs();
                  logs.logs.games.prepickedemojisbought += 1;
                  logs.logs.players[`user${interaction.user.id}`] =
                    logs.logs.players[`user${interaction.user.id}`] ?? {};
                  logs.logs.players[
                    `user${interaction.user.id}`
                  ].prepickedemojisbought =
                    logs.logs.players[`user${interaction.user.id}`]
                      .prepickedemojisbought ?? 0;
                  logs.logs.players[
                    `user${interaction.user.id}`
                  ].prepickedemojisbought += 1;
                  await writelogs(logs);
                } else if (shopdata[choice].type == "dailypack") {
                  await coinschange(interaction.user.id, -1 * dailyPack_price);
                  buy.setDisabled(true);
                  buy.setLabel(`You bought this`);
                  buy.setStyle(1);
                  let emojistoadd = "";

                  if (dailyPack_isRare) {
                    if (dailyPack_isBig) {
                      for (let i = 0; i < 3; i++) {
                        const emojilist = emojis.filter(
                          (e) => e.rarity == 1 && e.class == dailyPack_class
                        );
                        let thisemoji =
                          emojilist[
                            Math.floor(Math.random() * emojilist.length)
                          ];
                        emojistoadd += thisemoji.id + ",";
                        emojisbought[1].push(thisemoji);
                      }
                    } else {
                      for (let i = 0; i < 2; i++) {
                        const emojilist = emojis.filter(
                          (e) => e.rarity == 1 && e.class == dailyPack_class
                        );
                        let thisemoji =
                          emojilist[
                            Math.floor(Math.random() * emojilist.length)
                          ];
                        emojistoadd += thisemoji.id + ",";
                        emojisbought[1].push(thisemoji);
                      }
                    }
                  } else {
                    if (dailyPack_isBig) {
                      for (let i = 0; i < 2; i++) {
                        const emojilist = emojis.filter(
                          (e) => e.rarity == 0 && e.class == dailyPack_class
                        );
                        let thisemoji =
                          emojilist[
                            Math.floor(Math.random() * emojilist.length)
                          ];
                        emojistoadd += thisemoji.id + ",";
                        emojisbought[0].push(thisemoji);
                      }
                      for (let i = 0; i < 2; i++) {
                        const emojilist = emojis.filter((e) => e.rarity == 0);
                        let thisemoji =
                          emojilist[
                            Math.floor(Math.random() * emojilist.length)
                          ];
                        emojistoadd += thisemoji.id + ",";
                        emojisbought[0].push(thisemoji);
                      }
                    } else {
                      for (let i = 0; i < 2; i++) {
                        const emojilist = emojis.filter(
                          (e) => e.rarity == 0 && e.class == dailyPack_class
                        );
                        let thisemoji =
                          emojilist[
                            Math.floor(Math.random() * emojilist.length)
                          ];
                        emojistoadd += thisemoji.id + ",";
                        emojisbought[0].push(thisemoji);
                      }
                      // for (let i = 0; i < 1; i++) {
                      const emojilist = emojis.filter((e) => e.rarity == 0);
                      let thisemoji =
                        emojilist[Math.floor(Math.random() * emojilist.length)];
                      emojistoadd += thisemoji.id + ",";
                      emojisbought[0].push(thisemoji);
                      // }
                    }
                  }
                  if (dailyPack_hasSpecial) {
                    const emojilist = emojis.filter(
                      (e) => e.rarity == 2 && e.class == dailyPack_class
                    );
                    let thisemoji =
                      emojilist[Math.floor(Math.random() * emojilist.length)];
                    emojistoadd += thisemoji.id + ",";
                    emojisbought[2].push(thisemoji);
                  }

                  let tempvault = await database.get(
                    interaction.user.id + "vault"
                  );
                  await database.set(
                    interaction.user.id + "vault",
                    tempvault + emojistoadd
                  );

                  let logs = await getlogs();
                  logs.logs.games.packsbought += 1;
                  logs.logs.players[`user${interaction.user.id}`] =
                    logs.logs.players[`user${interaction.user.id}`] ?? {};
                  logs.logs.players[`user${interaction.user.id}`].packsbought =
                    logs.logs.players[`user${interaction.user.id}`]
                      .packsbought ?? 0;
                  logs.logs.players[
                    `user${interaction.user.id}`
                  ].packsbought += 1;
                  await writelogs(logs);
                }

                if (newinteraction.customId != "buymore") {
                  let emojiString = "";
                  if (emojisbought[0][0]) {
                    for (const e of emojisbought[0]) {
                      emojiString += e.emoji + " ";
                    }
                    emojiString += "\n";
                  }
                  if (emojisbought[1][0]) {
                    for (const e of emojisbought[1]) {
                      emojiString += e.emoji + " ";
                    }
                    emojiString += "\n";
                  }
                  if (emojisbought[2][0]) {
                    for (const e of emojisbought[2]) {
                      emojiString += e.emoji + " ";
                    }
                  }
                  newinteraction.reply({
                    content: `🛒 <@${interaction.user.id}> bought:\n>>> ${emojiString}`,
                  });
                  interaction.editReply({ components: [buyrow] });
                }
              }
            });
          } catch (e) {
            console.error(e);
          }
        });
      } catch (e) {
        console.error(e);
      }
    }
  },
};
