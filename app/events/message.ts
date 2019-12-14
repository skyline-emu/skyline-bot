import { Client, Message } from "discord.js";
import { EventMethod } from "./event";
import filterArray from "../filterArray.json";

export class MessageEvent extends EventMethod
{
	constructor()
	{
		super("message")
	}

	async run(client: Client, msg: Message): Promise<void>
	{
		let wordArray: string[] = msg.content.split(" ");

		wordArray.forEach((word) => {
			if (filterArray.includes(word)) msg.delete();
		})
	}
}