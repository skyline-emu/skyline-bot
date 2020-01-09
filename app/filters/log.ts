import { Filter } from "./filter"
import { Message } from "discord.js";

export class Log extends Filter
{
	constructor()
	{
		super("log", 5, true);
	}

	async run(message: Message): Promise<boolean>
	{
		console.log(`${message.author.username}#${message.author.discriminator}: ${message.content}`);
		return true;
	}
}