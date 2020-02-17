import { EventMethod           } from "./event";
import { Command, CommandError } from "../commands/command.js";
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
        let args: Array<string> = msg.content.split(" ");
        let command: Command | undefined = commandMap.get(args[0].substr(config.prefix.length));

        for (let index = 0; index < filterVec.length; index++)
        {
            let filter: Filter  = filterVec[index];
            let result: boolean = await filter.run(msg, command);

            if (result == false) return;
        }

        command!.run(msg, args).catch(async (error) => {
            let embed = new RichEmbed({ "title": "**An Error was Encountered**" });
            embed.setColor("RED");

            if (error instanceof CommandError)
                embed.setDescription(error.message);

            if (error instanceof Error)
                console.error(error);

            else
                console.error(`Caught Error: ${error}`);

            await msg.channel.send(embed);

            if (config.deleteTime > 0)
                msg.delete(config.deleteTime);
        });
	}
}