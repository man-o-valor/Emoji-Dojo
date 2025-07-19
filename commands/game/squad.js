const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const { emojis } = require("../../data.js");
const {
  getsquad,
  trysetupuser,
  getlogs,
  writelogs,
  dailyrewardremind,
  getvault,
  database,
} = require("../../functions.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("squad")
    .setDescription("View and edit your Squad of Emojis to battle others with"),
  async execute(interaction) {
    all: {
      await trysetupuser(interaction.user);
      let squadarray = await getsquad(interaction.user.id);
      let squadtext = "";
      let url =
        interaction?.channel?.url ||
        (interaction?.channelId && interaction.guildId
          ? `https://discord.com/channels/${interaction.guildId}/${interaction.channelId}`
          : "https://discord.com/channels/@me");
      for (let i = 7; i > -1; i--) {
        squadtext += `[${emojis[squadarray[i]].emoji}](${url} \"${
          emojis[squadarray[i]].names[0]
        } | ${emojis[squadarray[i]].hp} health, ${
          emojis[squadarray[i]].dmg
        } attack power. ${emojis[squadarray[i]].description}\") `;
      }
      const save = new ButtonBuilder()
        .setCustomId("save")
        .setLabel("Save")
        .setEmoji("🔖")
        .setStyle(ButtonStyle.Success);
      const edit = new ButtonBuilder()
        .setCustomId("import")
        .setLabel("Import")
        .setEmoji("📥")
        .setStyle(ButtonStyle.Success);
      const row1 = new ActionRowBuilder().addComponents(edit);
      const row0 = new ActionRowBuilder().addComponents(save);
      const squadembed = new EmbedBuilder()
        .setColor(0x226699)
        .setTitle(`${interaction.user.globalName}'s Squad 👥`)
        .setDescription(`## ${squadtext}`)
        .setFooter({
          text: `This is your Squad. Hover over your Emojis to read their descriptions. Add emojis to your squad with /dojo or import a squad by copying it and pasting it with the button below`,
        });
      const response = await interaction.reply({
        embeds: [squadembed],
        components: [row1],
      });
      await dailyrewardremind(interaction);
      let logs = await getlogs();
      logs.logs.games.squadsviewed += 1;
      logs.logs.players[`user${interaction.user.id}`] =
        logs.logs.players[`user${interaction.user.id}`] ?? {};
      logs.logs.players[`user${interaction.user.id}`].squadsviewed =
        logs.logs.players[`user${interaction.user.id}`].squadsviewed ?? 0;
      logs.logs.players[`user${interaction.user.id}`].squadsviewed += 1;
      await writelogs(logs);

      const collectorFilter = (i) => i.user.id === interaction.user.id;

      try {
        const interaction2 = await response.awaitMessageComponent({
          filter: collectorFilter,
          time: 600000,
        });
        if (interaction2.customId === "import") {
          interaction.editReply({ components: [] });
          let vaultarray = await getvault(interaction.user.id);
          let vaulttext = "";
          let emojisgoneover = [];
          for (let i = 0; i < vaultarray.length; i++) {
            if (!emojisgoneover.includes(vaultarray[i])) {
              emojisgoneover.push(vaultarray[i]);
              let numberihave = vaultarray.reduce(
                (acc, curr) => (curr === vaultarray[i] ? acc + 1 : acc),
                0
              );
              vaulttext += `${emojis[vaultarray[i]].emoji} `;
              if (numberihave > 1) {
                vaulttext += `x${numberihave}, `;
              }
            }
          }

          const modal = new ModalBuilder()
            .setCustomId("squadmodal")
            .setTitle(`Import a Squad`);

          const input = new TextInputBuilder()
            .setCustomId("input")
            .setLabel("Paste your Squad here")
            .setPlaceholder("⑧ ⑦ ⑥ ⑤ ④ ③ ② ①")
            .setStyle(TextInputStyle.Short);
          const firstActionRow = new ActionRowBuilder().addComponents(input);

          modal.addComponents(firstActionRow);

          await interaction2.showModal(modal);

          interaction2
            .awaitModalSubmit({ time: 60000 })
            .then(async (interaction4) => {
              vaultarray = await getvault(interaction.user.id);
              const segmenter = new Intl.Segmenter("en", {
                granularity: "grapheme",
              });
              let input = interaction4.fields
                .getTextInputValue("input")
                .replace(/\s+/g, "");
              let inputarr = [...segmenter.segment(input)];

              inputarr = inputarr.filter((item) => item != "");

              if (inputarr.length < 8) {
                await interaction4.reply({
                  content:
                    "Your Squad isn't formatted right! It's too short-- it needs 8 emojis in it. (Any extra will be ignored.)",
                  flags: "Ephemeral",
                });
              } else {
                let emojiinput = "";
                let datainput = [];
                let emojimissing;
                for (let i = 0; i < 8; i++) {
                  let objectalternative = emojis.find(
                    (x) => x.emoji == inputarr[i].segment
                  );
                  if (objectalternative != undefined) {
                    if (
                      vaultarray.find((x) => x == objectalternative.id) !=
                      undefined
                    ) {
                      vaultarray.splice(
                        vaultarray.findIndex((x) => x == objectalternative.id),
                        1
                      );
                      datainput = objectalternative.id + "," + datainput;
                      emojiinput += `[${objectalternative.emoji}](${url} \"${objectalternative.names[0]} | ${objectalternative.hp} health, ${objectalternative.dmg} attack power. ${objectalternative.description}\") `;
                    } else {
                      emojimissing = inputarr[i].segment;

                      break;
                    }
                  } else {
                    emojimissing = inputarr[i].segment;
                    break;
                  }
                }

                if (emojimissing) {
                  await interaction4.reply({
                    content: `You don't have enough of an emoji listed, or it doesn't exist: ${emojimissing}`,
                    flags: "Ephemeral",
                  });
                } else {
                  // Checks out!
                  await database.set(interaction.user.id + "squad", datainput);
                  interaction4.reply({
                    content: `Your squad has been saved!\n${emojiinput}`,
                    flags: "Ephemeral",
                  });
                }
              }
            });
        }
      } catch (e) {
        console.error(e);
      }
    }
  },
};
