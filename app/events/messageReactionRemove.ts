import { EventMethod } from "./event";
import { Client, MessageReaction, User, GuildMember } from "discord.js";
import array from "../array.json";

export class MessageReactionRemove extends EventMethod
{
	constructor()
	{
		super("messageReactionRemove")
	}

	async run(client: Client, reaction: MessageReaction, user: User): Promise<void>
	{
		array.forEach(async (item) =>
		{
			if (reaction.message.id == item.messageId && reaction.emoji.id == item.emojiId)
			{
				let member: GuildMember = await reaction.message.guild.fetchMember(user);

				member.removeRole(item.roleId);
			}
		})
	}
}