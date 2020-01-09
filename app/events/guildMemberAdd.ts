import { EventMethod }         from "./event";
import { Client, GuildMember } from "discord.js";

let roleArray: string[] = [];

export class GuildMemberAdd extends EventMethod
{
	constructor()
	{
		super("guildMemberAdd", true);
	}

	async run(client: Client, guildMember: GuildMember): Promise<void>
	{
		roleArray.forEach(role =>
		{
			if (guildMember.guild.roles.has(role)) 
			{
				guildMember.addRole(role);
			}
		})
	}
}