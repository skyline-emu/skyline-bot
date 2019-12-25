import { Filter } from "./filter"
import { Message, GuildMember, Snowflake } from "discord.js";
import { AccessLevel, Command } from "../commands/command.js";

let accessMap = new Map<AccessLevel, Snowflake>
([
    [AccessLevel.Admin,     "545842302409768968"],
    [AccessLevel.Moderator, "546093540166336532"]
])

let userWhitelist: Snowflake[] =
[
	"230356924284010508", //Xpl0itR
	"180662388301889536" //Mark
];

export class Permission extends Filter
{
	constructor()
	{
		super("permission", Number.POSITIVE_INFINITY);
	}

	async run(message: Message, command: Command): Promise<boolean>
	{
		if (userWhitelist.includes(message.author.id)) return true;

		let member: GuildMember = await message.guild.fetchMember(message.author);

		if (command.access != AccessLevel.User && !member.roles.has(accessMap.get(command.access)!))
			return false;
		else
			return true;
	}
}