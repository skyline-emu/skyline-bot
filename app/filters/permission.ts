import { Filter }                          from "./filter"
import { Message, GuildMember, Snowflake } from "discord.js";
import { AccessLevel, Command }            from "../commands/command.js";
import config                              from "../config.json";

let accessMap = new Map<AccessLevel, Snowflake>
([
    [AccessLevel.Admin,     "545842302409768968"],
    [AccessLevel.Moderator, "546093540166336532"]
])

export class Permission extends Filter
{
	constructor()
	{
		super("permission", 15, true);
	}

	async run(message: Message, command: Command): Promise<boolean>
	{
		if (config.userWhitelist.includes(message.author.id)) return true;

		let member: GuildMember = await message.guild.fetchMember(message.author);

		if (command.access != AccessLevel.User && !member.roles.has(accessMap.get(command.access)!))
			return false;
		else
			return true;
	}
}