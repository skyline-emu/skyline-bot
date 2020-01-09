import { Filter  } from "./filter"
import { Message } from "discord.js";
import { Command } from "../commands/command.js";
import config      from "../config.json";

export class Enabled extends Filter
{
	constructor()
	{
		super("enabled", 15, true);
	}

	async run(message: Message, command: Command): Promise<boolean>
	{
		if (config.userWhitelist.includes(message.author.id)) return true;

		return command.enabled;
	}
}