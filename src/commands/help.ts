import { MessageEmbed } from "discord.js";
import { AccessLevel, Command, userHasAccess } from "./command";
import { Message } from "discord.js";
import { commandArray } from "../main";
import config from "../config.json";

/** This command is used to provide a users with the summary of all commands that the bot has to offer */
export class Help extends Command {
    constructor() {
        super("help", "h", "Send help to the user\n`h`", AccessLevel.User);
    }

    async run(message: Message): Promise<void> {
        let embed = new MessageEmbed({ title: "**Skyline Bot Commands**" });
        embed.setColor("GREEN");

        for (const command of commandArray)
            if (await userHasAccess(message.author, message.guild!!, command.access))
                embed.addField(command.name, command.description, false);

        if (config.dmResponses)
            if (!message.author.dmChannel)
                message.author.createDM().then(channel => {
                    channel.send(embed);
                });
            else
                message.author.send(embed);
        else
            message.channel.send(embed);

        if (config.deleteTime > 0)
            message.delete({ timeout: config.deleteTime });
    }
}
