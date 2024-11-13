const fs = require('node:fs');
const path = require('node:path');
const { Client, Events, Collection,GatewayIntentBits,ActivityType } = require('discord.js');
const { token,testtoken,privatetoken } = require('./config.json');


const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

const logchannel =  client.channels.cache.get('1217859665648680991');
const errorchannel = client.channels.cache.get('1217859723320361041');

module.exports = {logchannel,errorchannel}

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property (it needs both).`);
		}
	}
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.login(token)
    .then(() => {
        client.user.setPresence({
            activities: [{
                name: 'users Battle! 😀',
                type: ActivityType.Watching,
                url: 'http://tinyurl.com/foodtruckdiscordbot'
            }],
            status: 'online'
        });
    })
    .catch((error) => {
        console.error('Error logging in:', error);
    });

