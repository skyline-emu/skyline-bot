import { RichEmbed }            from "discord.js";
import { AccessLevel, Command } from "./command"
import { Message }              from "discord.js";
import { commandVec }           from "../main.js";
import config                   from "../config.json";

export class Help extends Command
{
    constructor()
    {
        super("help", AccessLevel.User, "send help to the user", "h");
    }

    async run(msg: Message): Promise<void>
    {
        let embed = new RichEmbed({ "title": "**Bot Commands**" });

        for (const command of commandVec)
            embed.addField(`\`${command.name}\` or \`${command.shortname}\``, command.desc, true);
        if (!msg.author.dmChannel)
            msg.author.createDM().then((channel) => { channel.send(embed) });
        else
            msg.author.dmChannel.send(embed);

        msg.delete(config.deleteTime);
    }
}