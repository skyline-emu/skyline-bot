import { Client, ClientEvents } from "discord.js";
import { DiscordEvent } from "./events/event";
import { Command } from "./commands/command";
import { Filter } from "./filters/filter";
import * as events from "./events";
import * as commands from "./commands";
import * as filters from "./filters";
import config from "./config.json";

/** A map from a command's string to the Command object, used to resolve commands */
export let commandMap = new Map<string, Command>();
/** An array of all of the imported commands, used to iterate over all commands */
export let commandArray = new Array<Command>();
/** An array of all of the filters, it is sorted in order of priority */
export let filterArray = new Array<Filter>();

/** The Discord.JS Client that is used for all communication with the Discord API */
const client = new Client({ partials: ['MESSAGE', 'REACTION'] });

// We start by setting up all events
for (const EventT of Object.values(events)) {
    const event: DiscordEvent = new EventT();

    client.on(event.type as keyof ClientEvents, (...args: any) => {
        event.run(client, ...args);
    });
}

// We setup all filters after events
for (const FilterT of Object.values(filters)) {
    const filter: Filter = new FilterT();

    filterArray.push(filter);
}
filterArray.sort(function (a, b) {
    return b.priority - a.priority;
});

// Finally, we set up all the commands
for (const CommandT of Object.values(commands)) {
    const command: Command = new CommandT();

    commandArray.push(command);
    commandMap.set(command.name, command);
    if (command.shortName)
        commandMap.set(command.shortName, command);
}

client.login(config.token);
