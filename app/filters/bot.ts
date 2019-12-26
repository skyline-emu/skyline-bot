import { Filter } from "./filter"
import { Message } from "discord.js";

export class Bot extends Filter
{
	constructor()
	{
		super("bot", Number.NEGATIVE_INFINITY);
	}

	async run(message: Message): Promise<boolean>
	{
		return message.author.bot
	}
}