import { MessageEmbed } from "discord.js";
import { AccessLevel, Command, CommandError, userHasAccess } from "./command";
import { Message } from "discord.js";
import { commandArray } from "../main";
import config from "../config.json";

/** This command is used to provide a users with the summary of all commands that the bot has to offer */
export class Help extends Command {
    constructor() {
        super("help", "h", "Recieve this help embed in DMs\n`h`", AccessLevel.User);
    }
    async run(message: Message): Promise<void> {
        if (message.channel.type == "DM")
            throw new CommandError("Retrieving help from DMs is not supported");

        let embed = new MessageEmbed({ title: "**Skyline Bot Commands**" });
        embed.setColor("GREEN");

        for (const command of commandArray)
            if (await userHasAccess(message.author, message.guild!!, command.access))
                embed.addField(command.name, command.description, false);

        if (config.dmResponses)
            if (!message.author.dmChannel)
                message.author.createDM().then(channel => {
                    channel.send({ embeds: [embed] });
                });
            else
                message.author.send({ embeds: [embed] });
        else
            message.channel.send({ embeds: [embed] });
    }
}
