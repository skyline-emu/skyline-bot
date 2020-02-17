import { Client      } from "discord.js";
import { EventMethod } from "./events/event";
import { Command     } from "./commands/command";
import { Filter      } from "./filters/filter";
import * as events     from "./events";
import * as commands   from "./commands";
import * as filters    from "./filters";
import config          from "./config.json";

const client          = new Client();
export let commandMap = new Map<string, Command>();
export let filterVec  = new Array<Filter>();

for (let eventT of Object.values(events)) {
    let event: EventMethod = new eventT();

    if (event.enabled) {
        client.on(event.name, (...args: any) => {
            event.run(client, ...args);
        });
    }
}

for (let commandT of Object.values(commands)) {
    let command: Command = new commandT();

    commandMap.set(command.name, command);
}

for (let filterT of Object.values(filters)) {
    let filter: Filter = new filterT();

    if (filter.enabled) {
        filterVec.push(filter);
    }
}
filterVec.sort(function (a, b) { return a.priority - b.priority });

client.login(config.token);