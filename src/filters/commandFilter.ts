import { Message, RichEmbed, User, Guild, DiscordAPIError } from "discord.js";
import { Filter } from "./filter";
import { Command, CommandError, AccessLevel, getAccessLevelRole } from "../commands/command";
import { commandMap } from "../main.js";
import config from "../config.json";

/** This filter is used to detect any command-related messages and run the corresponding command */
export class CommandFilter extends Filter {
    constructor() {
        super(0);
    }

    /** 
	 * @argument user The user to check the permissions of
	 * @argument guild The guild to check permissions in
	 * @argument level The access level to check if the user has
	 * @returns If the supplied user has the specified access level in the specified guild 
	 */
    async userHasAccess(user: User, guild: Guild, level: AccessLevel): Promise<Boolean> {
        if (level == AccessLevel.User) return true;

        let roles = await (await guild.fetchMember(user)).roles;
        for (let index = level; index <= AccessLevel.Admin; index++) {
            let levelRole = getAccessLevelRole(index);
            if (roles.has(levelRole)) return true;
        }

        return false;
    }

    async run(message: Message): Promise<boolean> {
        if (!message.content.startsWith(config.prefix) || message.author.bot)
            return false;

        let args: Array<string> = message.content.split(" ");

        let command: Command | undefined = commandMap.get(args[0].substr(config.prefix.length));

        args.shift();

        if (command == undefined) return false;

        if ((config.userWhitelist as string[]).includes(message.author.id) || !(await this.userHasAccess(message.author, message.guild, command.access)))
            return false;

        command!.run(message, Object.create(args)).catch(async error => {
            let embed = new RichEmbed({ title: `**${error.name}**` });
            embed.setColor("RED");

            embed.setTimestamp(Date.now());

            if (error instanceof CommandError || error instanceof DiscordAPIError)
                embed.setDescription(`**${error.message}**`);

            if (error instanceof DiscordAPIError) {
                embed.addField("HTTP Error Code", `\`${error.code}\``, true);
                embed.addField("HTTP Request Method", `\`${error.method}\``, true);
            }

            embed.addField("Command", `\`${command!.name}\``, true);

            let index = 0;
            args.forEach(argument => {
                embed.addField(`Command Arguments #${index++}`, argument);
            });

            if (error instanceof Error)
                console.error(error);
            else
                console.error(`Caught Error: ${error}`);

            await message.channel.send(embed);

            if (config.deleteTime > 0)
                message.delete(config.deleteTime);
        });

        return true;
    }
}
