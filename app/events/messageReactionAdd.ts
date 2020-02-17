import { EventMethod } from "./event";
import { Client, MessageReaction, User, GuildMember } from "discord.js";
import configJson from "../config.json";
const config: any = configJson;

export class MessageReactionAdd extends EventMethod
{
	constructor()
	{
		super("messageReactionAdd", true);
	}

	async run(client: Client, reaction: MessageReaction, user: User): Promise<void>
	{
		config.roleAssignment.forEach(async (item: any) =>
		{
			if (reaction.message.id == item.messageId && reaction.emoji.id == item.emojiId)
			{
				let member: GuildMember = await reaction.message.guild.fetchMember(user);

				member.addRole(item.roleId);
			}
		})
	}
}