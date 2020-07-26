import { Message, MessageEmbed, DiscordAPIError } from "discord.js";
import { Filter } from "./filter";
import { Command, CommandError, userHasAccess } from "../commands/command";
import { commandMap } from "../main.js";
import config from "../config.json";

/** This filter is used to detect any command-related messages and run the corresponding command */
export class CommandFilter extends Filter {
    constructor() {
        super(0);
    }

    async run(message: Message): Promise<boolean> {
        if (!message.content.startsWith(config.prefix) || message.author.bot)
            return false;

        let args: Array<string> = message.content.split(" ").filter((value) => value.length);

        let command: Command | undefined = commandMap.get(args[0].substr(config.prefix.length));

        args.shift();

        if (command == undefined) return false;

        if (!((config.userWhitelist as string[]).includes(message.author.id)) || !(await userHasAccess(message.author, message.guild!!, command.access)))
            return false;

        command!.run(message, Object.create(args)).catch(async error => {
            let embed = new MessageEmbed({ title: `**${error.constructor.name}**` });
            embed.setColor("RED");

            embed.setTimestamp(Date.now());

            if (error instanceof CommandError || error instanceof DiscordAPIError || error instanceof RangeError)
                embed.setDescription(`**${error.message}**`);

            if (error instanceof DiscordAPIError) {
                embed.addField("HTTP Error Code", `\`${error.code}\``, true);
                embed.addField("HTTP Request Method", `\`${error.method}\``, true);
            }

            embed.addField("Command", `\`${command!.name}\``, true);

            let index = 0;
            args.forEach(argument => embed.addField(`Command Arguments #${index++}`, argument));

            if (error instanceof Error)
                console.error(error);
            else
                console.error(`Caught Error: ${error}`);

            await message.channel.send(embed);

            if (config.deleteTime > 0)
                message.delete({ timeout: config.deleteTime });
        });

        return true;
    }
}
