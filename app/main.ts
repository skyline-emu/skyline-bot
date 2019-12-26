import { Client      } from "discord.js";
import config          from "./config.json";
import * as events     from "./events";
import * as commands   from "./commands";
import * as filters    from "./filters";
import { EventMethod } from "./events/event.js";
import { Command     } from "./commands/command.js";
import { Filter      } from "./filters/filter.js";

const client   = new Client();
let commandMap = new Map<string, Command>();
let commandVec = new Array<Command>();
let filterVec  = new Array<Filter>();

export { commandMap };
export { commandVec };
export { filterVec  };

Object.values(events).forEach((eventT) =>
{
    let event: EventMethod = new eventT();

    client.on(event.name, (...args: any) =>
    {
        event.run(client, ...args);
    });
});

Object.values(commands).forEach((commandT) =>
{
    let command: Command = new commandT();

    commandMap.set(command.name,      command);
    if(command.shortname)
        commandMap.set(command.shortname, command);
    commandVec.push(command);
});

Object.values(filters).forEach((filterT) =>
{
    filterVec.push(new filterT());
});
filterVec.sort(function (a, b) { return a.priority - b.priority });

client.login(config.token);