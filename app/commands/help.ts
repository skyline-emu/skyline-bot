import { RichEmbed }                    from "discord.js";
import { AccessLevel, Command, config } from "./command"
import { Message }                      from "discord.js";
import { commandMap }                   from "../main";

export class Help extends Command
{
    constructor()
    {
        super("help", "h", AccessLevel.User, "Send help to the user", true);
    }

    async run(msg: Message): Promise<void>
    {
        let embed = new RichEmbed({ "title": "**Bot Commands**" });
        embed.setColor("GREEN");

        for (const command of commandMap) {
            embed.addField(`\`${command[1].name}\``, command[1].desc, true);
        }

        if (!msg.author.dmChannel)
            msg.author.createDM().then((channel) => { channel.send(embed) });

        else
            msg.author.send(embed);

        if (config.deleteTime > 0)
            msg.delete(config.deleteTime);
    }
}