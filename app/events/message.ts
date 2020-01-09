import { EventMethod           } from "./event";
import { CommandError          } from "../commands/command.js";
import { Message, RichEmbed    } from "discord.js";
import { commandMap, filterVec } from "../main.js";
import { Filter                } from "../filters/filter";
import config                    from "../config.json";

export class MesssageEvent extends EventMethod
{
	constructor()
	{
        super("message", true);
	}

	async run(client: any, msg: Message): Promise<void>
	{
        let args        = msg.content.split(" ");
        let cmd: string = args[0].substr(config.prefix.length);
        const command   = commandMap.get(cmd);

        for (let index = 0; index < filterVec.length; index++)
        {
            let filter: Filter  = filterVec[index];
            let result: boolean = await filter.run(msg, command);

            if (result == false) return;
        }

        await command!.run(msg, args).catch((e) =>
        {
            let embed = new RichEmbed({ "title": "**An Error was Encountered**" });

            if (e instanceof CommandError)
                embed.setDescription(e.message);
            if (e instanceof Error)
                console.warn(e);
            else
                console.warn(`Caught Error: ${e}`);

            msg.channel.send(embed).then(() =>
            {
                msg.delete(config.deleteTime);
            });
        });

        msg.delete(config.deleteTime);
	}
}