//@ts-ignore
import config from "./config.json" assert { type: "json" };
import { Client, Collection, GatewayIntentBits } from "discord.js";
import fs from "node:fs";

declare module "discord.js" {
    interface Client {
    	commands: Collection<unknown, any>
    }
}

// Create a new client
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent
    ],
});

// Read command files
client.commands = new Collection();
const commandFiles = fs.readdirSync("./build/commands").filter(file => file.endsWith(".js"));

// Retrieving all the command files
for (const file of commandFiles) {
    const { command } = await import(`./commands/${file}`);

    client.commands.set(command.data.name, command);
}
// Read event files
const eventFiles = fs.readdirSync("./build/events").filter(file => file.endsWith(".js"));

// Retrieving all the event files
for (const file of eventFiles) {
    const { event } = await import(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// Login to Discord
client.login(config.token);
