import { RichEmbed } from "discord.js";
import { AccessLevel, Command } from "./command";
import { Message } from "discord.js";
import { commandArray } from "../main";
import config from "../config.json";

/** This command is used to provide a users with the summary of all commands that the bot has to offer */
export class Help extends Command {
    constructor() {
        super("help", "h", AccessLevel.User, "Send help to the user", true);
    }

    async run(msg: Message): Promise<void> {
        let embed = new RichEmbed({ title: "**Skyline Bot Commands**" });
        embed.setColor("GREEN");

        for (const command of commandArray)
            embed.addField(`${command.name}`, command.desc, true);

        if (config.dmResponses)
            if (!msg.author.dmChannel)
                msg.author.createDM().then(channel => {
                    channel.send(embed);
                });
            else
                msg.author.send(embed);
        else
            msg.channel.send(embed);

        if (config.deleteTime > 0)
            msg.delete(config.deleteTime);
    }
}
