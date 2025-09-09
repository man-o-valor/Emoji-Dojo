const fs = require("node:fs");
const path = require("node:path");
const {
  Client,
  Collection,
  GatewayIntentBits,
  ActivityType,
} = require("discord.js");
const formatToJson = require("format-to-json");
const { token } = require("./config.json");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

const logsPath = path.join(__dirname, "logs.json");
if (!fs.existsSync(logsPath)) {
  fs.writeFileSync(
    logsPath,
    formatToJson(
      JSON.stringify(
        {
          logs: {
            emojis: [],
            games: {
              opened: 0,
              started: 0,
              botopened: 0,
              botstarted: 0,
              botwins: 0,
              botlosses: 0,
              botdraws: 0,
              useropened: 0,
              userstarted: 0,
              userdraws: 0,
              friendlyopened: 0,
              friendlystarted: 0,
              friendlydraws: 0,
              botlogsrequested: 0,
              userlogsrequested: 0,
              friendlylogsrequested: 0,
              coinsviewed: 0,
              emojisviewed: 0,
              squadsedited: 0,
              devotionsmade: 0,
              emojisdevoted: 0,
              vaultsviewed: 0,
              devotionsviewed: 0,
              shopsviewed: 0,
              randomemojisbought: 0,
              packsbought: 0,
              prepickedemojisbought: 0,
              squadsviewed: 0,
            },
            players: {},
          },
        },
        null,
        4
      ),
      {
        withDetails: true,
      }
    ).result
  );
}

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property (it needs both).`
      );
    }
  }
}

const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client
  .login(token)
  .then(() => {
    client.user.setPresence({
      activities: [
        {
          name: "users Battle! 🗣️🔥",
          type: ActivityType.Watching,
          url: "http://tinyurl.com/foodtruckdiscordbot",
        },
      ],
      status: "online",
    });
  })
  .catch((error) => {
    console.error("Error logging in:", error);
  });
