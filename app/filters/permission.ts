import { Filter }                          from "./filter"
import { Message, GuildMember, Snowflake } from "discord.js";
import { AccessLevel, Command }            from "../commands/command.js";
import configJson                          from "../config.json";
const config: any = configJson;

let accessMap = new Map<AccessLevel, Snowflake>
([
	[AccessLevel.Admin,     config.adminRole],
	[AccessLevel.Moderator, config.modRole]
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