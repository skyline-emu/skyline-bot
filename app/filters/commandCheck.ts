import { Filter  } from "./filter"
import { Command } from "../commands/command";
import { Message } from "discord.js";
import config      from "../config.json";

export class CommandCheck extends Filter
{
	constructor()
	{
		super("commandCheck", Number.MAX_VALUE);
	}

	async run(message: Message, command: Command): Promise<boolean>
	{
		if (!message.content.startsWith(config.prefix) || (message.author.bot))
			return false;
		else if (command == undefined)
			return false;
		else
			return true;
	}
}