import { EventMethod } from "./event";
import { Emoji, MessageReaction } from "discord.js";

const eventMap = new Map(Object.entries(
{
	"MESSAGE_REACTION_ADD":    "messageReactionAdd",
	"MESSAGE_REACTION_REMOVE": "messageReactionRemove",
}))

export class RawEvent extends EventMethod
{
	constructor()
	{
		super("raw");
	}

	async run(client: any, rawEvent: any): Promise<void>
	{
		let event = eventMap.get(rawEvent.t)
		if (event == undefined) return

		let { d: data } = rawEvent;
		let user        = client.users.get(data.user_id);
		let channel     = client.channels.get(data.channel_id) || await user.createDM();

		if (channel.messages.has(data.message_id)) return;

		let message  = await channel.fetchMessage(data.message_id);
		let emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
		let reaction = message.reactions.get(emojiKey);

		if (!reaction)
		{
			let emoji = new Emoji(client.guilds.get(data.guild_id), data.emoji);
			reaction  = new MessageReaction(message, emoji, 1, data.user_id === client.user.id);
		}

		client.emit(event, reaction, user);
	}
}